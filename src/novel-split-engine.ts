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

// ─── 真实切分辅助 ──────────────────────────────────────────────────────────

/** 一章（或一段）。 */
export interface NovelChapter {
  title: string
  text: string
}

/**
 * 按章节标题切分；没有章节标题就按段落聚合。
 *
 * 章节标题的识别规则保守：行首「第X章/节/回」或「Chapter N」，避免误切正文。
 */
export function splitIntoChapters(text: string): NovelChapter[] {
  const normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
  const lines = normalized.split('\n')
  const headingRe = /^\s*(第\s*[0-9一二三四五六七八九十百千]+\s*[章节回][^\n]{0,40}|Chapter\s+\d+[^\n]{0,40}|卷[0-9一二三四五六七八九十]+[^\n]{0,40})\s*$/

  const chapters: NovelChapter[] = []
  let currentTitle = ''
  let buffer: string[] = []

  const flush = (): void => {
    const body = buffer.join('\n').trim()
    if (body !== '') chapters.push({ title: currentTitle, text: body })
    buffer = []
  }

  for (const line of lines) {
    if (headingRe.test(line) && line.trim().length <= 60) {
      flush()
      currentTitle = line.trim()
      continue
    }
    buffer.push(line)
  }
  flush()

  // 没有识别到任何标题：按段落聚合（每 8 段一章），保证后续均摊仍可用
  if (chapters.length <= 1) {
    const paragraphs = normalized.split(/\n\s*\n/).map(p => p.trim()).filter(p => p !== '')
    const grouped: NovelChapter[] = []
    for (let i = 0; i < paragraphs.length; i += 8) {
      grouped.push({ title: `第 ${grouped.length + 1} 段`, text: paragraphs.slice(i, i + 8).join('\n\n') })
    }
    return grouped
  }
  return chapters
}

/**
 * 把章节按字数均摊成 N 集（顺序不变，不拆散章节）。
 *
 * 目标是"每集字数尽量接近"，不是简单按章节数平分 —— 网文章节长度差别很大。
 */
export function groupChaptersIntoEpisodes(chapters: NovelChapter[], nEps: number): NovelChapter[][] {
  const total = chapters.reduce((sum, chapter) => sum + chapter.text.replace(/\s/g, '').length, 0)
  const target = Math.max(1, Math.ceil(total / Math.max(1, nEps)))

  const groups: NovelChapter[][] = []
  let current: NovelChapter[] = []
  let currentLen = 0

  for (const chapter of chapters) {
    const len = chapter.text.replace(/\s/g, '').length
    if (current.length > 0 && currentLen + len > target && groups.length < nEps - 1) {
      groups.push(current)
      current = []
      currentLen = 0
    }
    current.push(chapter)
    currentLen += len
  }
  if (current.length > 0) groups.push(current)
  return groups
}

/** 按长度切块（去 AI 味这类整篇改写要分块送模型）。 */
export function chunkText(text: string, maxChars: number): string[] {
  if (text.trim() === '') return []
  const paragraphs = text.split(/\n\s*\n/)
  const chunks: string[] = []
  let buffer = ''
  for (const paragraph of paragraphs) {
    if (buffer !== '' && buffer.length + paragraph.length > maxChars) {
      chunks.push(buffer)
      buffer = paragraph
    } else {
      buffer = buffer === '' ? paragraph : `${buffer}\n\n${paragraph}`
    }
  }
  if (buffer !== '') chunks.push(buffer)
  return chunks
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
    const { path: filePath, title } = body as { path?: string; title?: string }
    if (filePath === undefined || filePath === '') {
      return { status: 400, data: { error: '缺少 path（本机小说文件路径）' } }
    }
    if (!existsSync(filePath)) {
      return { status: 404, data: { error: `读不到文件：${filePath}` } }
    }
    try {
      const text = readFileSync(filePath, 'utf8')
      const baseName = filePath.split(/[\\/]/).pop() ?? ''
      return {
        status: 200,
        data: {
          success: true,
          text,
          title: title !== undefined && title !== '' ? title : baseName.replace(/\.[^.]+$/, ''),
          words: text.replace(/\s/g, '').length,
          file: filePath,
        },
      }
    } catch (error) {
      return { status: 500, data: { error: `读取失败：${error instanceof Error ? error.message : String(error)}` } }
    }
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
    const { filename, text, title } = body as { filename: string; text?: string; title?: string }
    if (!filename) {
      return { status: 400, data: { error: '缺少 filename' } }
    }
    const dir = join(NOVEL_DIR, 'upload')
    mkdirSync(dir, { recursive: true })
    const safe = filename.replace(/[\\/]/g, '_')
    const target = join(dir, safe)
    try {
      writeFileSync(target, String(text ?? ''), 'utf8')
      return {
        status: 200,
        data: {
          success: true,
          filename: safe,
          path: target,
          title: title !== undefined && title !== '' ? title : safe,
          words: String(text ?? '').replace(/\s/g, '').length,
        },
      }
    } catch (error) {
      return { status: 500, data: { error: `写入失败：${error instanceof Error ? error.message : String(error)}` } }
    }
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

  // GET /file/:name - 读取拆分产物（真实文件）
  if (method === 'GET' && sub.startsWith('file/')) {
    const name = decodeURIComponent(sub.slice('file/'.length))
    // 防目录穿越：只允许纯文件名
    if (name.includes('..') || name.includes('/') || name.includes('\\')) {
      return { status: 400, data: { error: '非法的文件名' } }
    }
    const dir = join(NOVEL_DIR, 'split')
    let target = join(dir, name)
    if (!existsSync(target)) {
      // 也允许在 split/<任务id>/ 下
      const candidates = existsSync(dir) ? readdirSync(dir) : []
      for (const sub2 of candidates) {
        const nested = join(dir, sub2, name)
        if (existsSync(nested)) { target = nested; break }
      }
    }
    if (!existsSync(target)) return { status: 404, data: { error: '文件不存在' } }
    try {
      return { status: 200, data: { success: true, name, content: readFileSync(target, 'utf8') } }
    } catch (error) {
      return { status: 500, data: { error: `读取失败：${error instanceof Error ? error.message : String(error)}` } }
    }
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

    // 真实拆分：读原文 → 按章节/段落切 → 均摊成 N 集 → 写盘
    const rawPath = task.source
    let sourceText = ''
    if (existsSync(rawPath)) {
      sourceText = readFileSync(rawPath, 'utf8')
    } else {
      sourceText = rawPath
    }
    if (sourceText.trim() === '') throw new Error('原文是空的，无法拆分')

    const chapters = splitIntoChapters(sourceText)
    if (chapters.length === 0) throw new Error('没能从原文里切出章节')

    const nEps = Math.max(1, task.n_eps)
    const groups = groupChaptersIntoEpisodes(chapters, nEps)

    const outDir = join(NOVEL_DIR, 'split', task.id)
    mkdirSync(outDir, { recursive: true })
    const titlePrefix = task.title !== '' ? task.title : task.id
    let written = 0
    for (let i = 0; i < groups.length; i++) {
      const body = groups[i].map(chapter => chapter.text).join('\n\n')
      const name = `${titlePrefix}-EP${String(i + 1).padStart(2, '0')}.md`
      writeFileSync(join(outDir, name), `# ${titlePrefix} 第 ${i + 1} 集\n\n${body}\n`, 'utf8')
      written += body.replace(/\s/g, '').length
      task.eps = i + 1
      task.words = written
      task.message = `已拆 ${i + 1}/${groups.length} 集`
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

    // 真实去 AI 味：分块送文本模型改写（长文不能一次塞进去）
    const chunks = chunkText(task.text, 2400)
    if (chunks.length === 0) throw new Error('文本为空')
    const opHint = task.op === 'light' ? '轻度（保留原句式，只去掉刻意的排比与总结句）'
      : task.op === 'heavy' ? '重度（重写句子节奏，允许换词换句，但事实与情节一字不改）'
      : '中度（打散机械短句，替换套话，保持信息完整）'
    const model = task.model !== '' ? task.model : (process.env.DSH_AGNES_TEXT_MODEL || 'agnes-2.5-flash')

    const rewritten: string[] = []
    for (let i = 0; i < chunks.length; i++) {
      task.message = `正在改写 ${i + 1}/${chunks.length} 段…`
      task.updated_at = Date.now()
      saveToDisk(task, 'deai')

      const data = await host.call('agnes', '/chat/completions', {
        body: {
          model,
          messages: [
            {
              role: 'system',
              content:
                `你是中文小说编辑。把用户给的段落改写得不像 AI 写的：${opHint}。\n` +
                '规则：不要加解释、不要加标题、不要分点；不要改变人物、情节、事实；只输出改写后的正文。',
            },
            { role: 'user', content: chunks[i] },
          ],
          max_tokens: 3000,
          temperature: 0.8,
        },
        timeoutMs: 240_000,
      }) as { choices?: Array<{ message?: { content?: string } }> }
      const text = (data.choices?.[0]?.message?.content ?? '').trim()
      if (text === '') throw new Error(`第 ${i + 1} 段模型返回空内容`)
      rewritten.push(text)
    }

    task.result = rewritten.join('\n\n')
    task.status = 'completed'
    task.message = '处理完成'
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
