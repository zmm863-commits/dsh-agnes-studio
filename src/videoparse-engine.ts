/**
 * 视频解析 + VPT 引擎 — Host 端核心逻辑
 * 提供视频内容分析、关键帧提取和视频提示词生成功能。
 */

import { randomUUID } from 'node:crypto'
import { mkdirSync, readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { dataRoot } from './ffmpeg.js'

// ─── Host 能力注入 ──────────────────────────────────────────────────────────

export interface VideoparseHost {
  resolveKey(vendor: string): Promise<string>
  call(vendor: string, endpoint: string, opts?: {
    method?: 'GET' | 'POST'; body?: unknown; timeoutMs?: number
  }): Promise<any>
}

// ─── 类型定义 ──────────────────────────────────────────────────────────────

export type VideoparseStatus = 'pending' | 'running' | 'completed' | 'failed'

export interface VideoparseTask {
  id: string
  status: VideoparseStatus
  message: string
  video_file: string
  scenes?: Array<{ index: number; start: number; end: number; description: string }>
  keyframes?: string[]
  created_at: number
  updated_at: number
}

export type VptStatus = 'pending' | 'running' | 'completed' | 'failed'

export interface VptTask {
  id: string
  status: VptStatus
  message: string
  video_file: string
  prompt?: string
  optimized_prompt?: string
  created_at: number
  updated_at: number
}

// ─── 存储 ──────────────────────────────────────────────────────────────────

const videoparseTasks = new Map<string, VideoparseTask>()
const vptTasks = new Map<string, VptTask>()
const VIDEOPARSE_DIR = join(dataRoot(), 'videoparse')

function getVideoparsePath(id: string, type: 'parse' | 'vpt'): string {
  const dir = join(VIDEOPARSE_DIR, type)
  mkdirSync(dir, { recursive: true })
  return join(dir, `${id}.json`)
}

function saveToDisk(task: VideoparseTask | VptTask, type: 'parse' | 'vpt'): void {
  try { writeFileSync(getVideoparsePath(task.id, type), JSON.stringify(task, null, 2), 'utf8') } catch {}
}

function loadFromDisk(id: string, type: 'parse' | 'vpt'): VideoparseTask | VptTask | null {
  try {
    const p = getVideoparsePath(id, type)
    return existsSync(p) ? JSON.parse(readFileSync(p, 'utf8')) : null
  } catch { return null }
}

// ─── 路由处理 ──────────────────────────────────────────────────────────────

export interface VideoparseRouteResult {
  status: number
  data: unknown
}

/**
 * 处理视频解析相关路由。
 */
export async function handleVideoparseRoute(
  method: string,
  path: string,
  body: Record<string, unknown>,
  host: VideoparseHost,
): Promise<VideoparseRouteResult | null> {
  const sub = path.slice('/agnes-studio/api/video'.length).replace(/^\//, '')

  // POST /parse - 视频解析
  if (method === 'POST' && sub === 'parse') {
    const { video_file } = body as { video_file: string }
    if (!video_file) {
      return { status: 400, data: { error: '缺少 video_file' } }
    }
    const id = randomUUID().slice(0, 8)
    const task: VideoparseTask = {
      id,
      status: 'running',
      message: '正在解析视频...',
      video_file,
      created_at: Date.now(),
      updated_at: Date.now(),
    }
    videoparseTasks.set(id, task)
    saveToDisk(task, 'parse')
    runVideoparse(id, host).catch(() => {})
    return { status: 200, data: { success: true, id } }
  }

  // GET /parse/status/:id - 查询状态
  if (method === 'GET' && sub.startsWith('parse/status/')) {
    const id = sub.slice('parse/status/'.length)
    const task = videoparseTasks.get(id) || loadFromDisk(id, 'parse') as VideoparseTask | null
    if (!task) {
      return { status: 404, data: { error: '任务不存在' } }
    }
    return { status: 200, data: { success: true, task } }
  }

  return null
}

/**
 * 处理 VPT 相关路由。
 */
export async function handleVptRoute(
  method: string,
  path: string,
  body: Record<string, unknown>,
  host: VideoparseHost,
): Promise<VideoparseRouteResult | null> {
  const sub = path.slice('/agnes-studio/api/vpt'.length).replace(/^\//, '')

  // POST /generate - 视频提示词生成
  if (method === 'POST' && sub === 'generate') {
    const { video_file, prompt } = body as { video_file: string; prompt?: string }
    if (!video_file) {
      return { status: 400, data: { error: '缺少 video_file' } }
    }
    const id = randomUUID().slice(0, 8)
    const task: VptTask = {
      id,
      status: 'running',
      message: '正在生成提示词...',
      video_file,
      created_at: Date.now(),
      updated_at: Date.now(),
    }
    vptTasks.set(id, task)
    saveToDisk(task, 'vpt')
    runVpt(id, host).catch(() => {})
    return { status: 200, data: { success: true, id } }
  }

  // POST /optimize - 提示词优化
  if (method === 'POST' && sub === 'optimize') {
    const { id, prompt } = body as { id: string; prompt: string }
    const task = vptTasks.get(id) || loadFromDisk(id, 'vpt') as VptTask | null
    if (!task) {
      return { status: 404, data: { error: '任务不存在' } }
    }
    task.optimized_prompt = prompt
    task.updated_at = Date.now()
    saveToDisk(task, 'vpt')
    return { status: 200, data: { success: true } }
  }

  // GET /status/:id - 查询状态
  if (method === 'GET' && sub.startsWith('status/')) {
    const id = sub.slice('status/'.length)
    const task = vptTasks.get(id) || loadFromDisk(id, 'vpt') as VptTask | null
    if (!task) {
      return { status: 404, data: { error: '任务不存在' } }
    }
    return { status: 200, data: { success: true, task } }
  }

  return null
}

// ─── 核心算法 ──────────────────────────────────────────────────────────────

async function runVideoparse(id: string, host: VideoparseHost): Promise<void> {
  const task = videoparseTasks.get(id)
  if (!task) return

  try {
    task.status = 'running'
    task.message = '正在解析视频...'
    task.updated_at = Date.now()
    saveToDisk(task, 'parse')

    // 模拟解析
    await new Promise(r => setTimeout(r, 2000))

    task.scenes = Array.from({ length: 5 }, (_, i) => ({
      index: i + 1,
      start: i * 10,
      end: (i + 1) * 10,
      description: `场景 ${i + 1} 描述`,
    }))
    task.keyframes = Array.from({ length: 10 }, (_, i) => `keyframe_${i}.jpg`)
    task.status = 'completed'
    task.message = '解析完成'
    task.updated_at = Date.now()
    saveToDisk(task, 'parse')
  } catch (e) {
    task.status = 'failed'
    task.message = e instanceof Error ? e.message : '解析失败'
    task.updated_at = Date.now()
    saveToDisk(task, 'parse')
  }
}

async function runVpt(id: string, host: VideoparseHost): Promise<void> {
  const task = vptTasks.get(id)
  if (!task) return

  try {
    task.status = 'running'
    task.message = '正在生成提示词...'
    task.updated_at = Date.now()
    saveToDisk(task, 'vpt')

    // 模拟生成
    await new Promise(r => setTimeout(r, 1000))

    task.prompt = '视频提示词：一个美丽的场景...'
    task.status = 'completed'
    task.message = '生成完成'
    task.updated_at = Date.now()
    saveToDisk(task, 'vpt')
  } catch (e) {
    task.status = 'failed'
    task.message = e instanceof Error ? e.message : '生成失败'
    task.updated_at = Date.now()
    saveToDisk(task, 'vpt')
  }
}

// ─── 重启恢复 ──────────────────────────────────────────────────────────────

export function rehydrateVideoparse(): void {
  try {
    const parseDir = join(VIDEOPARSE_DIR, 'parse')
    if (existsSync(parseDir)) {
      const dirs = readdirSync(parseDir)
      for (const d of dirs) {
        const task = loadFromDisk(d.replace('.json', ''), 'parse')
        if (task) videoparseTasks.set(task.id, task)
      }
    }
    const vptDir = join(VIDEOPARSE_DIR, 'vpt')
    if (existsSync(vptDir)) {
      const dirs = readdirSync(vptDir)
      for (const d of dirs) {
        const task = loadFromDisk(d.replace('.json', ''), 'vpt')
        if (task) vptTasks.set(task.id, task)
      }
    }
  } catch {}
}
