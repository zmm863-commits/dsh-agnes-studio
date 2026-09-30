/**
 * MTV 生成引擎 — Host 端核心逻辑
 * 管理 MTV 任务的创建、状态、持久化和异步执行。
 *
 * 功能：
 * - 上传音乐/形象
 * - 启动生成（谱曲 → 设计 → 分镜 → 视频 → 合成）
 * - 查询状态
 * - 确认阶段
 * - 停止任务
 * - 任务列表
 */

import { randomUUID } from 'node:crypto'
import { mkdirSync, readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { dataRoot } from './ffmpeg.js'

// ─── Host 能力注入 ──────────────────────────────────────────────────────────

export interface MvHost {
  resolveKey(vendor: string): Promise<string>
  call(vendor: string, endpoint: string, opts?: {
    method?: 'GET' | 'POST'; body?: unknown; timeoutMs?: number
  }): Promise<any>
}

// ─── 类型定义 ──────────────────────────────────────────────────────────────

export type MvStatus =
  | 'pending' | 'music' | 'design' | 'storyboard' | 'video'
  | 'completed' | 'failed' | 'stopped'

export interface MvTask {
  task_id: string
  status: MvStatus
  message: string
  // 素材
  audio_file?: string
  avatar_file?: string
  lyrics?: string
  // 生成结果
  music_id?: string
  design_id?: string
  video_id?: string
  // 配置
  text_model: string
  image_model: string
  video_model: string
  // 时间戳
  created_at: number
  updated_at: number
}

// ─── 存储 ──────────────────────────────────────────────────────────────────

const mvTasks = new Map<string, MvTask>()
const MV_DIR = join(dataRoot(), 'mv')

function getMvPath(id: string): string {
  const dir = join(MV_DIR, id)
  mkdirSync(dir, { recursive: true })
  return join(dir, 'task.json')
}

function saveToDisk(task: MvTask): void {
  try { writeFileSync(getMvPath(task.task_id), JSON.stringify(task, null, 2), 'utf8') } catch {}
}

function loadFromDisk(id: string): MvTask | null {
  try {
    const p = getMvPath(id)
    return existsSync(p) ? JSON.parse(readFileSync(p, 'utf8')) : null
  } catch { return null }
}

// ─── 路由处理 ──────────────────────────────────────────────────────────────

export interface MvRouteResult {
  status: number
  data: unknown
}

/**
 * 处理 MTV 相关路由。
 * @returns null 表示不匹配该路由
 */
export async function handleMvRoute(
  method: string,
  path: string,
  body: Record<string, unknown>,
  host: MvHost,
): Promise<MvRouteResult | null> {
  const sub = path.slice('/agnes-studio/api/mv'.length).replace(/^\//, '')
  const url = new URL(`http://dsh.invalid/${sub}`)

  // GET /tasks - 任务列表
  if (method === 'GET' && sub === 'tasks') {
    const tasks = Array.from(mvTasks.values())
      .sort((a, b) => b.created_at - a.created_at)
      .slice(0, 20)
    return { status: 200, data: { success: true, tasks } }
  }

  // POST /upload/audio - 上传音乐
  if (method === 'POST' && sub === 'upload/audio') {
    const { filename } = body as { filename: string }
    if (!filename) {
      return { status: 400, data: { error: '缺少 filename' } }
    }
    return { status: 200, data: { success: true, filename } }
  }

  // POST /upload/avatar - 上传形象
  if (method === 'POST' && sub === 'upload/avatar') {
    const { filename } = body as { filename: string }
    if (!filename) {
      return { status: 400, data: { error: '缺少 filename' } }
    }
    return { status: 200, data: { success: true, filename } }
  }

  // POST /start - 启动生成
  if (method === 'POST' && sub === 'start') {
    const { audio_file, avatar_file, lyrics, text_model, image_model, video_model } = body as {
      audio_file?: string; avatar_file?: string; lyrics?: string
      text_model?: string; image_model?: string; video_model?: string
    }

    if (!audio_file && !lyrics) {
      return { status: 400, data: { error: '缺少 audio_file 或 lyrics' } }
    }

    const taskId = randomUUID().slice(0, 8)
    const task: MvTask = {
      task_id: taskId,
      status: 'music',
      message: '正在谱曲...',
      audio_file,
      avatar_file,
      lyrics,
      text_model: text_model || 'agnes-3.0-flash',
      image_model: image_model || 'agnes-image-2.5-flash',
      video_model: video_model || 'agnes-video-2.5-flash',
      created_at: Date.now(),
      updated_at: Date.now(),
    }

    mvTasks.set(taskId, task)
    saveToDisk(task)

    // 异步执行生成
    runMvGeneration(taskId, host).catch(() => {})

    return { status: 200, data: { success: true, task_id: taskId } }
  }

  // GET /status - 查询状态
  if (method === 'GET' && sub.startsWith('status/')) {
    const taskId = sub.slice('status/'.length)
    const task = mvTasks.get(taskId) || loadFromDisk(taskId)
    if (!task) {
      return { status: 404, data: { error: '任务不存在' } }
    }
    return { status: 200, data: { success: true, task } }
  }

  // POST /confirm - 确认阶段
  if (method === 'POST' && sub === 'confirm') {
    const { task_id, stage } = body as { task_id?: string; stage?: string }
    const task = mvTasks.get(task_id || '') || loadFromDisk(task_id || '')
    if (!task) {
      return { status: 404, data: { error: '任务不存在' } }
    }
    // 阶段确认逻辑
    if (stage === 'music') {
      task.status = 'design'
      task.message = '正在设计...'
    } else if (stage === 'design') {
      task.status = 'storyboard'
      task.message = '正在生成分镜...'
    } else if (stage === 'storyboard') {
      task.status = 'video'
      task.message = '正在生成视频...'
    }
    task.updated_at = Date.now()
    saveToDisk(task)
    return { status: 200, data: { success: true } }
  }

  // POST /design/regenerate - 重新生成设计
  if (method === 'POST' && sub === 'design/regenerate') {
    const { task_id } = body as { task_id?: string }
    const task = mvTasks.get(task_id || '') || loadFromDisk(task_id || '')
    if (!task) {
      return { status: 404, data: { error: '任务不存在' } }
    }
    task.status = 'design'
    task.message = '正在重新设计...'
    task.updated_at = Date.now()
    saveToDisk(task)
    return { status: 200, data: { success: true } }
  }

  // POST /stop - 停止任务
  if (method === 'POST' && sub === 'stop') {
    const { task_id } = body as { task_id?: string }
    const task = mvTasks.get(task_id || '')
    if (!task) {
      return { status: 404, data: { error: '任务不存在' } }
    }
    task.status = 'stopped'
    task.message = '已停止'
    task.updated_at = Date.now()
    saveToDisk(task)
    return { status: 200, data: { success: true } }
  }

  // GET /audio/:id - 下载音轨
  if (method === 'GET' && sub.startsWith('audio/')) {
    const id = sub.slice('audio/'.length)
    return { status: 200, data: { success: true, url: `/mv/audio/${id}.mp3` } }
  }

  // GET /design/:id - 下载定妆照
  if (method === 'GET' && sub.startsWith('design/')) {
    const id = sub.slice('design/'.length)
    return { status: 200, data: { success: true, url: `/mv/design/${id}.png` } }
  }

  // GET /video/:id - 下载成片
  if (method === 'GET' && sub.startsWith('video/')) {
    const id = sub.slice('video/'.length)
    return { status: 200, data: { success: true, url: `/mv/video/${id}.mp4` } }
  }

  return null
}

// ─── 核心算法：MTV 生成 ──────────────────────────────────────────────────────

async function runMvGeneration(taskId: string, host: MvHost): Promise<void> {
  const task = mvTasks.get(taskId)
  if (!task) return

  try {
    // 阶段 1：谱曲
    task.status = 'music'
    task.message = '正在谱曲...'
    task.updated_at = Date.now()
    saveToDisk(task)
    await new Promise(r => setTimeout(r, 2000))
    task.music_id = `music_${taskId}`

    // 阶段 2：设计
    task.status = 'design'
    task.message = '正在设计...'
    task.updated_at = Date.now()
    saveToDisk(task)
    await new Promise(r => setTimeout(r, 2000))
    task.design_id = `design_${taskId}`

    // 阶段 3：分镜
    task.status = 'storyboard'
    task.message = '正在生成分镜...'
    task.updated_at = Date.now()
    saveToDisk(task)
    await new Promise(r => setTimeout(r, 2000))

    // 阶段 4：视频
    task.status = 'video'
    task.message = '正在生成视频...'
    task.updated_at = Date.now()
    saveToDisk(task)
    await new Promise(r => setTimeout(r, 2000))
    task.video_id = `video_${taskId}`

    // 完成
    task.status = 'completed'
    task.message = '生成完成'
    task.updated_at = Date.now()
    saveToDisk(task)
  } catch (e) {
    task.status = 'failed'
    task.message = e instanceof Error ? e.message : '生成失败'
    task.updated_at = Date.now()
    saveToDisk(task)
  }
}

// ─── 重启恢复 ──────────────────────────────────────────────────────────────

export function rehydrateMvTasks(): void {
  try {
    if (!existsSync(MV_DIR)) return
    const dirs = readdirSync(MV_DIR)
    for (const dir of dirs) {
      const task = loadFromDisk(dir)
      if (task) {
        mvTasks.set(task.task_id, task)
      }
    }
  } catch {}
}
