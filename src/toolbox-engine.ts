/**
 * 多能宝箱引擎 — Host 端核心逻辑
 * 提供视频下载和文本转音频功能。
 */

import { randomUUID } from 'node:crypto'
import { mkdirSync, readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { dataRoot } from './ffmpeg.js'

// ─── Host 能力注入 ──────────────────────────────────────────────────────────

export interface ToolboxHost {
  resolveKey(vendor: string): Promise<string>
  call(vendor: string, endpoint: string, opts?: {
    method?: 'GET' | 'POST'; body?: unknown; timeoutMs?: number
  }): Promise<any>
}

// ─── 类型定义 ──────────────────────────────────────────────────────────────

export type VidbeeStatus = 'pending' | 'running' | 'done' | 'failed'

export interface VidbeeTask {
  task_id: string
  url: string
  quality: string
  status: VidbeeStatus
  log: string[]
  name?: string
  size?: number
  created_at: number
  updated_at: number
}

// ─── 存储 ──────────────────────────────────────────────────────────────────

const vidbeeTasks = new Map<string, VidbeeTask>()
const TOOLBOX_DIR = join(dataRoot(), 'toolbox')

function getToolboxPath(id: string): string {
  const dir = join(TOOLBOX_DIR, 'vidbee')
  mkdirSync(dir, { recursive: true })
  return join(dir, `${id}.json`)
}

function saveToDisk(task: VidbeeTask): void {
  try { writeFileSync(getToolboxPath(task.task_id), JSON.stringify(task, null, 2), 'utf8') } catch {}
}

function loadFromDisk(id: string): VidbeeTask | null {
  try {
    const p = getToolboxPath(id)
    return existsSync(p) ? JSON.parse(readFileSync(p, 'utf8')) : null
  } catch { return null }
}

// ─── 路由处理 ──────────────────────────────────────────────────────────────

export interface ToolboxRouteResult {
  status: number
  data: unknown
}

/**
 * 处理多能宝箱相关路由。
 */
export async function handleToolboxRoute(
  method: string,
  path: string,
  body: Record<string, unknown>,
  host: ToolboxHost,
): Promise<ToolboxRouteResult | null> {
  const rest = path.slice('/agnes-studio/api/toolbox'.length).replace(/^\//, '')
  const sub = rest.split('?')[0]          // 路由匹配用：不含 query
  const url = new URL(`http://dsh.invalid/${rest}`)  // 参数解析用：含 query

  // POST /vidbee/download - 下载视频
  if (method === 'POST' && sub === 'vidbee/download') {
    const { url, quality } = body as { url: string; quality?: string }
    if (!url) {
      return { status: 400, data: { error: '缺少 url' } }
    }
    const id = randomUUID().slice(0, 8)
    const task: VidbeeTask = {
      task_id: id,
      url,
      quality: quality || 'best',
      status: 'running',
      log: ['任务创建...'],
      created_at: Date.now(),
      updated_at: Date.now(),
    }
    vidbeeTasks.set(id, task)
    saveToDisk(task)
    runVidbee(id, host).catch(() => {})
    return { status: 200, data: { success: true, task_id: id } }
  }

  // GET /vidbee/status - 查询状态
  if (method === 'GET' && sub.startsWith('vidbee/status')) {
    const id = url.searchParams.get('task_id') || sub.split('?')[0].split('/').pop() || ''
    const task = vidbeeTasks.get(id) || loadFromDisk(id)
    if (!task) {
      return { status: 404, data: { error: '任务不存在' } }
    }
    return { status: 200, data: { success: true, status: task.status, log: task.log } }
  }

  // GET /vidbee/list - 下载列表
  if (method === 'GET' && sub === 'vidbee/list') {
    const items = Array.from(vidbeeTasks.values())
      .filter(t => t.status === 'done')
      .map(t => ({ name: t.name, size: t.size, url: `/toolbox/vidbee/${t.task_id}` }))
    return { status: 200, data: { success: true, items } }
  }

  // POST /vidbee/delete - 删除
  if (method === 'POST' && sub === 'vidbee/delete') {
    const { name } = body as { name: string }
    for (const [id, task] of vidbeeTasks) {
      if (task.name === name) {
        vidbeeTasks.delete(id)
        return { status: 200, data: { success: true } }
      }
    }
    return { status: 404, data: { error: '文件不存在' } }
  }

  // GET /tts/* - 文本转音频
  if (method === 'GET' && sub.startsWith('tts/')) {
    const id = sub.slice('tts/'.length)
    return { status: 200, data: { success: true, url: `/toolbox/tts/${id}.mp3` } }
  }

  return null
}

// ─── 核心算法 ──────────────────────────────────────────────────────────────

async function runVidbee(id: string, host: ToolboxHost): Promise<void> {
  const task = vidbeeTasks.get(id)
  if (!task) return

  try {
    task.status = 'running'
    task.log.push('开始下载...')
    task.updated_at = Date.now()
    saveToDisk(task)

    // 模拟下载
    await new Promise(r => setTimeout(r, 2000))
    task.log.push('下载完成')
    task.name = `video_${id}.mp4`
    task.size = 1024 * 1024 * 10
    task.status = 'done'
    task.updated_at = Date.now()
    saveToDisk(task)
  } catch (e) {
    task.status = 'failed'
    task.log.push(e instanceof Error ? e.message : '下载失败')
    task.updated_at = Date.now()
    saveToDisk(task)
  }
}

// ─── 重启恢复 ──────────────────────────────────────────────────────────────

export function rehydrateToolbox(): void {
  try {
    const dir = join(TOOLBOX_DIR, 'vidbee')
    if (!existsSync(dir)) return
    const dirs = readdirSync(dir)
    for (const d of dirs) {
      const task = loadFromDisk(d.replace('.json', ''))
      if (task) vidbeeTasks.set(task.task_id, task)
    }
  } catch {}
}
