/**
 * 多能宝箱引擎 — Host 端核心逻辑
 * 提供视频下载和文本转音频功能。
 */

import { randomUUID } from 'node:crypto'
import { mkdirSync, readFileSync, writeFileSync, readdirSync, existsSync, statSync } from 'node:fs'
import { execFile } from 'node:child_process'
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
  /** 落盘路径（下载完成后可播放/复用）。 */
  path?: string
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

  // POST /tts - 文本转音频（真实 MiMo TTS，返回可直接播放的 data URL）
  if (method === 'POST' && sub === 'tts') {
    const { text, voice } = body as { text?: string; voice?: string }
    const content = String(text ?? '').trim()
    if (content === '') return { status: 400, data: { error: '缺少 text' } }
    if (content.length > 2000) return { status: 400, data: { error: '一次最多 2000 字，请分段' } }
    try {
      const audio = await synthesizeSpeech(host, content, String(voice ?? 'mimo_default'))
      return { status: 200, data: { success: true, audio: `data:audio/wav;base64,${audio}`, bytes: Math.round(audio.length * 0.75) } }
    } catch (error) {
      return { status: 500, data: { error: error instanceof Error ? error.message : String(error) } }
    }
  }

  return null
}

/** 在 PATH 与常见位置里找 yt-dlp。 */
async function whichYtDlp(): Promise<string | null> {
  const candidates = ['/usr/local/bin/yt-dlp', '/usr/bin/yt-dlp', '/opt/homebrew/bin/yt-dlp']
  for (const path of candidates) {
    if (existsSync(path)) return path
  }
  const probe = await execFileAsync('yt-dlp', ['--version'], 8000)
  return probe.code === 0 ? 'yt-dlp' : null
}

/** 执行命令，永不抛（返回码 + 输出）。 */
function execFileAsync(command: string, args: string[], timeout: number): Promise<{ code: number; stdout: string; stderr: string }> {
  return new Promise(resolve => {
    execFile(command, args, { timeout, maxBuffer: 8 * 1024 * 1024 }, (error, stdout, stderr) => {
      resolve({
        code: error === null ? 0 : (typeof error.code === 'number' ? error.code : 1),
        stdout: String(stdout ?? ''),
        stderr: String(stderr ?? ''),
      })
    })
  })
}

/**
 * 用 MiMo TTS 合成一段语音，返回 base64（WAV）。
 *
 * 契约与 anchor-engine 一致（已对线上验证过）：
 * POST /chat/completions 带 `audio` 块，WAV 以 base64 回在 choices[0].message.audio.data。
 */
async function synthesizeSpeech(host: ToolboxHost, text: string, voice: string): Promise<string> {
  const data = await host.call('mimo', '/chat/completions', {
    body: {
      model: 'mimo-v2.5-tts',
      messages: [
        { role: 'user', content: '自然、清晰、适合中文口播。语速中等，节奏稳定。' },
        { role: 'assistant', content: text },
      ],
      audio: { format: 'wav', voice: voice === '' ? 'mimo_default' : voice },
    },
    timeoutMs: 180_000,
  }) as { choices?: Array<{ message?: { audio?: { data?: string } } }>; error?: { message?: string } }
  const b64 = data.choices?.[0]?.message?.audio?.data
  if (typeof b64 !== 'string' || b64 === '') {
    const detail = data.error?.message ?? '响应里没有 audio.data'
    throw new Error(`TTS 返回异常：${detail}`)
  }
  return b64
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

    // 真实下载：直链直接抓，其余交给 yt-dlp（有就用，没有就明确报错）
    const url = task.url
    const dir = join(TOOLBOX_DIR, 'vidbee', id)
    mkdirSync(dir, { recursive: true })
    const quality = task.quality || 'best'

    if (!/^https?:\/\//i.test(url)) throw new Error('链接必须以 http:// 或 https:// 开头')

    const ytDlp = await whichYtDlp()
    if (ytDlp !== null) {
      task.log.push(`用 yt-dlp 下载（${quality}）…`)
      const out = join(dir, 'download.%(ext)s')
      const format = quality === '1080p' ? 'bestvideo[height<=1080]+bestaudio/best[height<=1080]'
        : quality === '720p' ? 'bestvideo[height<=720]+bestaudio/best[height<=720]'
        : quality === '480p' ? 'bestvideo[height<=480]+bestaudio/best[height<=480]'
        : 'bestvideo+bestaudio/best'
      const result = await execFileAsync(ytDlp, ['-f', format, '--merge-output-format', 'mp4', '-o', out, url], 30 * 60 * 1000)
      if (result.code !== 0) throw new Error(`yt-dlp 失败：${result.stderr.slice(-300)}`)
      const produced = readdirSync(dir).find(name => name.startsWith('download.'))
      if (produced === undefined) throw new Error('yt-dlp 没有产出文件')
      const full = join(dir, produced)
      task.name = produced
      task.size = statSync(full).size
      task.path = full
    } else {
      // 没有 yt-dlp：只支持直链媒体文件
      task.log.push('未检测到 yt-dlp，按直链处理…')
      const ac = new AbortController()
      const timer = setTimeout(() => ac.abort(), 10 * 60 * 1000)
      try {
        const resp = await fetch(url, { signal: ac.signal, redirect: 'follow' })
        if (!resp.ok) throw new Error(`下载失败 HTTP ${resp.status}`)
        const contentType = resp.headers.get('content-type') ?? ''
        if (!/video|audio|octet-stream/i.test(contentType)) {
          throw new Error(`这个链接不是媒体文件（${contentType || '未知类型'}），需要先安装 yt-dlp 才能解析`)
        }
        const buffer = Buffer.from(await resp.arrayBuffer())
        const name = `video_${id}.mp4`
        writeFileSync(join(dir, name), buffer)
        task.name = name
        task.size = buffer.byteLength
        task.path = join(dir, name)
      } finally {
        clearTimeout(timer)
      }
    }

    task.log.push(`下载完成：${task.name ?? ''}（${((task.size ?? 0) / 1048576).toFixed(1)} MB）`)
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
