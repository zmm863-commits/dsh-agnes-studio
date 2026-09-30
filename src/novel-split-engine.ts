/**
 * 分批拆分 + 去 AI 味引擎 — Host 端核心逻辑
 * 管理拆分任务和去 AI 味任务的创建、状态、持久化和异步执行。
 */

import { randomUUID } from 'node:crypto'
import { mkdirSync, readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { dataRoot } from './ffmpeg.js'

// ─── Host 能力注入 ──────────────────────────────────────────────────────────

export interface NovelSplitHost {
  resolveKey(vendor: string): Promise<string>
  call(vendor: string, endpoint: string, opts?: {
    method?: 'GET' | 'POST'; body?: unknown; timeoutMs?: number
  }): Promise<any>
}

// ─── 类型定义 ──────────────────────────────────────────────────────────────

export type SplitStatus = 'pending' | 'running' | 'completed' | 'failed' | 'stopped'

export interface SplitTask {
  id: string
  status: SplitStatus
  message: string
  source: string
  n_eps: number
  eps: number
  words: number
  title: string
  created_at: number
  updated_at: number
}

export type DeaiStatus = 'pending' | 'running' | 'completed' | 'failed' | 'stopped'

export interface DeaiTask {
  id: string
  status: DeaiStatus
  message: string
  text: string
  op: 'light' | 'medium' | 'heavy'
  model: string
  result?: string
  created_at: number
  updated_at: number
}

// ─── 存储 ──────────────────────────────────────────────────────────────────

const splitTasks = new Map<string, SplitTask>()
const deaiTasks = new Map<string, DeaiTask>()
const NOVEL_DIR = join(dataRoot(), 'novel')

function getNovelPath(id: string): string {
  const dir = join(NOVEL_DIR, id)
  mkdirSync(dir, { recursive: true })
  return join(dir, 'task.json')
}

function saveToDisk(task: SplitTask | DeaiTask, type: 'split' | 'deai'): void {
  try {
    const dir = join(NOVEL_DIR, type === 'split' ? 'split' : 'deai')
    mkdirSync(dir, { recursive: true })
    writeFileSync(join(dir, `${task.id}.json`), JSON.stringify(task, null, 2), 'utf8')
  } catch {}
}

function loadFromDisk(id: string, type: 'split' | 'deai'): SplitTask | DeaiTask | null {
  try {
    const dir = join(NOVEL_DIR, type === 'split' ? 'split' : 'deai')
    const p = join(dir, `${id}.json`)
    return existsSync(p) ? JSON.parse(readFileSync(p, 'utf8')) : null
  } catch { return null }
}

// ─── 路由处理 ──────────────────────────────────────────────────────────────

export interface NovelSplitRouteResult {
  status: number
  data: unknown
}

/**
 * 处理分批拆分相关路由。
 */
export async function handleNovelSplitRoute(
  method: string,
  path: string,
  body: Record<string, unknown>,
  host: NovelSplitHost,
): Promise<NovelSplitRouteResult | null> {
  const sub = path.slice('/agnes-studio/api/novel-split'.length).replace(/^\//, '')
  const url = new URL(`http://dsh.invalid/${sub}`)

  // POST /import - 导入已有小说
  if (method === 'POST' && sub === 'import') {
    const { id } = body as { id: string }
    if (!id) {
      return { status: 400, data: { error: '缺少 id' } }
    }
    // 模拟导入
    return { status: 200, data: { success: true, text: '模拟小说内容...', title: '模拟小说', words: 5000 } }
  }

  // POST /start - 启动拆分
  if (method === 'POST' && sub === 'start') {
    const { source, n_eps, model, title } = body as { source: string; n_eps: number; model: string; title?: string }
    if (!source) {
      return { status: 400, data: { error: '缺少 source' } }
    }
    const id = randomUUID().slice(0, 8)
    const task: SplitTask = {
      id,
      status: 'running',
      message: '正在拆分...',
      source,
      n_eps: n_eps || 10,
      eps: 0,
      words: 0,
      title: title || '',
      created_at: Date.now(),
      updated_at: Date.now(),
    }
    splitTasks.set(id, task)
    saveToDisk(task, 'split')
    runSplit(id, host).catch(() => {})
    return { status: 200, data: { success: true, id, note: '已开始拆分' } }
  }

  // GET /status/:id - 查询状态
  if (method === 'GET' && sub.startsWith('status/')) {
    const id = sub.slice('status/'.length)
    const task = splitTasks.get(id) || loadFromDisk(id, 'split') as SplitTask | null
    if (!task) {
      return { status: 404, data: { error: '任务不存在' } }
    }
    return { status: 200, data: { success: true, task } }
  }

  // POST /stop/:id - 停止
  if (method === 'POST' && sub.startsWith('stop/')) {
    const id = sub.slice('stop/'.length)
    const task = splitTasks.get(id)
    if (!task) {
      return { status: 404, data: { error: '任务不存在' } }
    }
    task.status = 'stopped'
    task.message = '已停止'
    task.updated_at = Date.now()
    saveToDisk(task, 'split')
    return { status: 200, data: { success: true } }
  }

  // POST /save - 保存结果
  if (method === 'POST' && sub === 'save') {
    const { text, name, title, n_eps } = body as { text: string; name: string; title: string; n_eps: number }
    if (!text || !name) {
      return { status: 400, data: { error: '缺少 text 或 name' } }
    }
    return { status: 200, data: { success: true, file: name, words: text.length } }
  }

  // POST /upload - 上传文件
  if (method === 'POST' && sub === 'upload') {
    const { filename, text, title } = body as { filename: string; text: string; title?: string }
    if (!filename) {
      return { status: 400, data: { error: '缺少 filename' } }
    }
    return { status: 200, data: { success: true, filename, title: title || filename, words: text?.length || 0 } }
  }

  // GET /files - 文件列表
  if (method === 'GET' && sub === 'files') {
    const files: Array<{ file: string; mtime: string; size: number }> = []
    try {
      const dir = join(NOVEL_DIR, 'split')
      if (existsSync(dir)) {
        const dirs = readdirSync(dir)
        for (const d of dirs) {
          const stat = existsSync(join(dir, d)) ? { size: 0 } : null
          if (stat) files.push({ file: d, mtime: new Date().toISOString(), size: 0 })
        }
      }
    } catch {}
    return { status: 200, data: { success: true, files } }
  }

  // GET /file/:name - 下载文件
  if (method === 'GET' && sub.startsWith('file/')) {
    const name = sub.slice('file/'.length)
    return { status: 200, data: { success: true, name, content: '模拟文件内容' } }
  }

  return null
}

/**
 * 处理去 AI 味相关路由。
 */
export async function handleDeaiRoute(
  method: string,
  path: string,
  body: Record<string, unknown>,
  host: NovelSplitHost,
): Promise<NovelSplitRouteResult | null> {
  const sub = path.slice('/agnes-studio/api/deai'.length).replace(/^\//, '')

  // POST /process - 去 AI 味处理
  if (method === 'POST' && sub === 'process') {
    const { text, op, model } = body as { text: string; op: 'light' | 'medium' | 'heavy'; model: string }
    if (!text) {
      return { status: 400, data: { error: '缺少 text' } }
    }
    const id = randomUUID().slice(0, 8)
    const task: DeaiTask = {
      id,
      status: 'running',
      message: '正在处理...',
      text,
      op: op || 'medium',
      model: model || 'agnes-3.0-flash',
      created_at: Date.now(),
      updated_at: Date.now(),
    }
    deaiTasks.set(id, task)
    saveToDisk(task, 'deai')
    runDeai(id, host).catch(() => {})
    return { status: 200, data: { success: true, tid: id } }
  }

  // GET /status/:id - 查询状态
  if (method === 'GET' && sub.startsWith('status/')) {
    const id = sub.slice('status/'.length)
    const task = deaiTasks.get(id) || loadFromDisk(id, 'deai') as DeaiTask | null
    if (!task) {
      return { status: 404, data: { error: '任务不存在' } }
    }
    return { status: 200, data: { success: true, status: task.status, message: task.message, done: 1, total: 1, text: task.result } }
  }

  return null
}

// ─── 核心算法 ──────────────────────────────────────────────────────────────

async function runSplit(id: string, host: NovelSplitHost): Promise<void> {
  const task = splitTasks.get(id)
  if (!task) return

  try {
    task.status = 'running'
    task.message = '正在拆分...'
    task.updated_at = Date.now()
    saveToDisk(task, 'split')

    // 模拟拆分
    for (let i = 0; i < task.n_eps; i++) {
      await new Promise(r => setTimeout(r, 500))
      task.eps = i + 1
      task.words = (i + 1) * 500
      task.message = `已拆 ${i + 1}/${task.n_eps} 集`
      task.updated_at = Date.now()
      saveToDisk(task, 'split')
    }

    task.status = 'completed'
    task.message = '拆分完成'
    task.updated_at = Date.now()
    saveToDisk(task, 'split')
  } catch (e) {
    task.status = 'failed'
    task.message = e instanceof Error ? e.message : '拆分失败'
    task.updated_at = Date.now()
    saveToDisk(task, 'split')
  }
}

async function runDeai(id: string, host: NovelSplitHost): Promise<void> {
  const task = deaiTasks.get(id)
  if (!task) return

  try {
    task.status = 'running'
    task.message = '正在处理...'
    task.updated_at = Date.now()
    saveToDisk(task, 'deai')

    // 模拟去 AI 味
    await new Promise(r => setTimeout(r, 2000))

    task.status = 'completed'
    task.message = '处理完成'
    task.result = task.text // 模拟结果
    task.updated_at = Date.now()
    saveToDisk(task, 'deai')
  } catch (e) {
    task.status = 'failed'
    task.message = e instanceof Error ? e.message : '处理失败'
    task.updated_at = Date.now()
    saveToDisk(task, 'deai')
  }
}

// ─── 重启恢复 ──────────────────────────────────────────────────────────────

export function rehydrateNovelSplit(): void {
  try {
    const splitDir = join(NOVEL_DIR, 'split')
    if (existsSync(splitDir)) {
      const dirs = readdirSync(splitDir)
      for (const dir of dirs) {
        const task = loadFromDisk(dir, 'split')
        if (task) splitTasks.set(task.id, task)
      }
    }
    const deaiDir = join(NOVEL_DIR, 'deai')
    if (existsSync(deaiDir)) {
      const dirs = readdirSync(deaiDir)
      for (const dir of dirs) {
        const task = loadFromDisk(dir, 'deai')
        if (task) deaiTasks.set(task.id, task)
      }
    }
  } catch {}
}
