/**
 * 视频解析 + VPT 引擎 — Host 端核心逻辑
 * 提供视频内容分析、关键帧提取和视频提示词生成功能。
 */

import { randomUUID } from 'node:crypto'
import { mkdirSync, readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { dataRoot } from './ffmpeg.js'
import { analyzeVideo, analysisToHtml, type VideoAnalysis } from './video-analyzer.js'

// ─── Host 能力注入 ──────────────────────────────────────────────────────────

export interface VideoparseHost {
  resolveKey(vendor: string): Promise<string>
  call(vendor: string, endpoint: string, opts?: {
    method?: 'GET' | 'POST'; body?: unknown; timeoutMs?: number
  }): Promise<any>
  /** 视觉模型调用（两阶段分析用）。 */
  callVision: (messages: Array<{ role: 'system' | 'user'; content: unknown }>, opts?: { maxTokens?: number }) => Promise<string>
  /** 语音识别；宿主没有该服务时为 undefined（结果会如实标注无台词）。 */
  callSpeech?: (wav: Uint8Array) => Promise<string>
}

// ─── 类型定义 ──────────────────────────────────────────────────────────────

export type VideoparseStatus = 'pending' | 'running' | 'completed' | 'failed'

export interface VideoparseTask {
  id: string
  status: VideoparseStatus
  message: string
  video_file: string
  /** 兼容旧字段：镜头列表（由 analysis 派生）。 */
  scenes?: Array<{ index: number; start: number; end: number; description: string }>
  keyframes?: string[]
  /** 真实分析结果（切点/台词/两阶段视觉）。 */
  analysis?: VideoAnalysis
  /** 0-100 进度。 */
  percent?: number
  /** 降级说明。 */
  warnings?: string[]
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

  // POST /generate —— 已下线。
  // 这个端点过去返回写死的字符串（"视频提示词：一个美丽的场景…"），是假功能。
  // 现在真实的转提示词走 POST /agnes-studio/api/vpt/video（抽帧 + 视觉模型）。
  if (method === 'POST' && sub === 'generate') {
    return {
      status: 410,
      data: {
        error: '该接口已下线（它返回的是固定文本）。请改用 POST /agnes-studio/api/vpt/video。',
        migrateTo: '/agnes-studio/api/vpt/video',
      },
    }
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

  const touch = (message: string, percent: number): void => {
    task.message = message
    task.percent = percent
    task.updated_at = Date.now()
    saveToDisk(task, 'parse')
  }

  try {
    task.status = 'running'
    touch('准备分析…', 2)

    // video_file 可能是本机路径；解析交给真实流水线（切点 → 抽帧 → ASR → 两阶段视觉）
    const analysis = await analyzeVideo({
      videoPath: task.video_file,
      callVision: host.callVision,
      callSpeech: host.callSpeech,
      onProgress: (message, percent) => { touch(message, percent) },
    })

    task.analysis = analysis
    task.warnings = analysis.warnings
    task.scenes = analysis.scenes.map(scene => ({
      index: scene.index,
      start: scene.start,
      end: scene.end,
      description: scene.description,
    }))
    task.keyframes = []
    task.status = 'completed'
    task.percent = 100
    task.message = `解析完成：${analysis.scenes.length} 个镜头${analysis.hasSpeech ? '（含台词）' : '（无台词）'}`
    task.updated_at = Date.now()
    saveToDisk(task, 'parse')
  } catch (e) {
    task.status = 'failed'
    task.message = e instanceof Error ? e.message : '解析失败'
    task.updated_at = Date.now()
    saveToDisk(task, 'parse')
  }
}

/** 把某个解析任务导出成可打印 HTML。 */
export function renderAnalysisReport(id: string): string | null {
  const task = videoparseTasks.get(id) || loadFromDisk(id, 'parse') as VideoparseTask | null
  if (task === null || task.analysis === undefined) return null
  return analysisToHtml(task.analysis, `视频反推 · ${task.video_file.split(/[\\/]/).pop() ?? id}`)
}

/**
 * 旧的 VPT 任务接口已经废弃（它返回的是写死的"一个美丽的场景…"）。
 * 真正的转提示词走 /agnes-studio/api/vpt/image 与 /vpt/video。
 */
async function runVpt(_id: string, _host: VideoparseHost): Promise<void> {
  // 保留函数签名以免路由层引用不到；实际不再被调用（见 handleVptRoute 的 410）。
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
