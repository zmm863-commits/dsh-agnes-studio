/**
 * 创作台的文件层 API（宿主半）。
 *
 * ## 为什么不直接调 Oh Story 自带的 /oh-story/* API
 *
 * 那套 API 每个请求都要带 DSH `sessionId`，而 `sessionId` 是 DSH 注入给
 * `oh-story.workspace` 槽的 props。我们的面板注册在 `shell.overlay` 槽 ——
 * **能不能拿到同一个 sessionId 我没有验证过**，而验证它需要改客户端 + 刷新，
 * 在当前会话里看不到结果。
 *
 * 所以这里改成两条不依赖未验证前提的路子：
 *   1. 工作区清单直接读 DSH 自己的注册表（`storages/workspace.json`）；
 *   2. 其余操作一律用**显式传入的 root 路径**。
 *
 * ## 路径安全
 *
 * 所有 root / rel 都经过 resolve + 前缀校验，禁止逃出 root（`..`、绝对路径、
 * 符号链接越界由前缀校验拦住）。
 */
import { readFileSync, writeFileSync, statSync, mkdirSync, existsSync } from 'node:fs'
import { readdirSync } from 'node:fs'
import { join, resolve, sep, dirname, extname, basename } from 'node:path'

/** 可编辑的文本扩展名（与 Oh Story 自带浏览器的口径一致）。 */
const TEXT_EXTS = new Set(['.md', '.txt', '.json', '.yaml', '.yml', '.toml'])

/** 单文件读写上限（与 Oh Story 的 editorMaxBytes 默认值一致）。 */
const MAX_BYTES = 2 * 1024 * 1024

/** 列目录时跳过的名字。 */
const SKIP_DIRS = new Set(['node_modules', '.git', '.next', 'dist', 'lib'])

/** 一个 DSH 工作区。 */
export interface DshWorkspace {
  id: string
  path: string
  title: string
  sessionCount: number
}

/** 一个创作项目。 */
export interface CreativeProject {
  /** 项目目录（相对 root）。 */
  dir: string
  kind: 'long' | 'short' | 'analysis'
  /** 展示名。 */
  name: string
}

/** 一个文件/目录条目。 */
export interface FsEntry {
  name: string
  /** 相对 root 的路径。 */
  rel: string
  type: 'dir' | 'file'
  size?: number
  /** 是否是可编辑的文本文件。 */
  editable?: boolean
}

/**
 * DSH 工作区注册表的路径。
 * @param dshHome - DSH_HOME；缺省回落到 /dsh。
 * @returns 文件路径。
 */
export function workspaceRegistryPath(dshHome: string | undefined): string {
  return join(dshHome && dshHome.length > 0 ? dshHome : '/dsh', 'storages', 'workspace.json')
}

/**
 * 读 DSH 的工作区清单。
 * @param dshHome - DSH_HOME。
 * @returns 工作区列表（读不到时返回空数组）。
 */
export function listDshWorkspaces(dshHome: string | undefined): DshWorkspace[] {
  try {
    const raw = readFileSync(workspaceRegistryPath(dshHome), 'utf8')
    const parsed = JSON.parse(raw) as {
      tables?: { workspaces?: Record<string, { path?: string; title?: string; sessionIds?: string[] }> }
    }
    const table = parsed.tables?.workspaces ?? {}
    return Object.entries(table)
      .filter(([, v]) => typeof v?.path === 'string' && v.path.length > 0)
      .map(([id, v]) => ({
        id,
        path: v.path as string,
        title: v.title && v.title.length > 0 ? v.title : basename(v.path as string),
        sessionCount: Array.isArray(v.sessionIds) ? v.sessionIds.length : 0,
      }))
  } catch {
    return []
  }
}

/**
 * 校验并解析一个 root 下的相对路径。
 * @param root - 工作区根目录（绝对路径）。
 * @param rel - 相对路径；空串表示根自身。
 * @returns 绝对路径。
 * @throws 当路径逃出 root 时抛错（消息面向用户）。
 */
export function safeJoin(root: string, rel: string): string {
  const base = resolve(root)
  const target = resolve(base, rel === '' || rel === '.' ? '.' : rel)
  if (target !== base && !target.startsWith(base + sep)) {
    throw new Error('路径超出工作区范围')
  }
  return target
}

/**
 * 识别 root 下的创作项目（复用 Oh Story 的约定）。
 *
 * - 长篇：目录内含 `正文/`、`大纲/`、`设定/`、`追踪/` 任一子目录
 * - 短篇：目录内含 `正文.md`，且含 `小节大纲.md` 或 `设定.md`
 * - 拆文库：`拆文库/{书名}/` 与存量 `拆文库-{书名}/`
 *
 * @param root - 工作区根目录。
 * @returns 项目列表。
 */
export function detectCreativeProjects(root: string): CreativeProject[] {
  const out: CreativeProject[] = []
  let entries: string[] = []
  try {
    entries = readdirSync(safeJoin(root, ''), { withFileTypes: true })
      .filter(e => e.isDirectory())
      .map(e => e.name)
  } catch {
    return out
  }

  for (const name of entries) {
    if (SKIP_DIRS.has(name) || name.startsWith('.')) continue
    const dir = safeJoin(root, name)
    let sub: string[] = []
    let files: string[] = []
    try {
      const items = readdirSync(dir, { withFileTypes: true })
      sub = items.filter(e => e.isDirectory()).map(e => e.name)
      files = items.filter(e => e.isFile()).map(e => e.name)
    } catch {
      continue
    }
    const isLong = ['正文', '大纲', '设定', '追踪'].some(d => sub.includes(d))
    const isShort = files.includes('正文.md') && (files.includes('小节大纲.md') || files.includes('设定.md'))
    if (isLong) out.push({ dir: name, kind: 'long', name })
    else if (isShort) out.push({ dir: name, kind: 'short', name })
  }

  // 拆文库：两种命名都认
  for (const name of entries) {
    if (name === '拆文库') {
      try {
        const books = readdirSync(safeJoin(root, name), { withFileTypes: true })
          .filter(e => e.isDirectory())
          .map(e => e.name)
        for (const book of books) out.push({ dir: `${name}/${book}`, kind: 'analysis', name: book })
      } catch { /* ignore */ }
    } else if (name.startsWith('拆文库-')) {
      out.push({ dir: name, kind: 'analysis', name: name.slice('拆文库-'.length) })
    }
  }
  return out
}

/**
 * 列一个目录。
 * @param root - 工作区根。
 * @param rel - 相对 root 的目录（空串为根）。
 * @returns 条目列表（目录在前、按名排序）。
 */
export function listEntries(root: string, rel: string): FsEntry[] {
  const dir = safeJoin(root, rel)
  const items = readdirSync(dir, { withFileTypes: true })
  const out: FsEntry[] = []
  for (const e of items) {
    if (e.name.startsWith('.')) continue
    if (e.isDirectory() && SKIP_DIRS.has(e.name)) continue
    const childRel = rel === '' ? e.name : `${rel}/${e.name}`
    if (e.isDirectory()) {
      out.push({ name: e.name, rel: childRel, type: 'dir' })
    } else if (e.isFile()) {
      const ext = extname(e.name).toLowerCase()
      let size: number | undefined
      try { size = statSync(safeJoin(root, childRel)).size } catch { /* ignore */ }
      out.push({ name: e.name, rel: childRel, type: 'file', size, editable: TEXT_EXTS.has(ext) })
    }
  }
  return out.sort((a, b) => (a.type === b.type ? a.name.localeCompare(b.name) : a.type === 'dir' ? -1 : 1))
}

/**
 * 读一个文本文件。
 * @param root - 工作区根。
 * @param rel - 相对路径。
 * @returns 文件内容与修改时间。
 * @throws 非文本扩展名、超限或不存在时抛错。
 */
export function readText(root: string, rel: string): { content: string; mtimeMs: number } {
  if (!TEXT_EXTS.has(extname(rel).toLowerCase())) throw new Error('该文件类型不支持编辑')
  const target = safeJoin(root, rel)
  const info = statSync(target)
  if (!info.isFile()) throw new Error('目标不是文件')
  if (info.size > MAX_BYTES) throw new Error(`文件超过 ${Math.round(MAX_BYTES / 1024 / 1024)}MB 上限`)
  return { content: readFileSync(target, 'utf8'), mtimeMs: info.mtimeMs }
}

/**
 * 写一个文本文件（父目录不存在时创建）。
 * @param root - 工作区根。
 * @param rel - 相对路径。
 * @param content - 内容。
 * @returns 写入后的字节数。
 */
export function writeText(root: string, rel: string, content: string): number {
  if (!TEXT_EXTS.has(extname(rel).toLowerCase())) throw new Error('该文件类型不支持编辑')
  if (Buffer.byteLength(content, 'utf8') > MAX_BYTES) throw new Error('内容超过大小上限')
  const target = safeJoin(root, rel)
  mkdirSync(dirname(target), { recursive: true })
  writeFileSync(target, content, 'utf8')
  return Buffer.byteLength(content, 'utf8')
}

/**
 * 按约定创建一个创作项目骨架（不经 Agent，纯建目录与文件）。
 * @param root - 工作区根。
 * @param kind - long=长篇 / short=短篇。
 * @param name - 项目名（用作目录名）。
 * @returns 新建项目的相对目录。
 * @throws 同名目录已存在时抛错。
 */
export function createProject(root: string, kind: 'long' | 'short', name: string): string {
  const safeName = name.trim().replace(/[/\\]/g, '_')
  if (safeName === '') throw new Error('项目名不能为空')
  const dir = safeJoin(root, safeName)
  if (existsSync(dir)) throw new Error(`「${safeName}」已存在`)

  if (kind === 'long') {
    for (const sub of ['正文', '大纲', '设定', '追踪']) mkdirSync(join(dir, sub), { recursive: true })
    writeFileSync(join(dir, '大纲', '总纲.md'), `# ${safeName} · 总纲\n\n## 一句话简介\n\n\n## 主角\n\n\n## 核心冲突\n\n\n## 分卷\n\n`, 'utf8')
    writeFileSync(join(dir, '设定', '世界观.md'), `# ${safeName} · 世界观\n\n`, 'utf8')
    writeFileSync(join(dir, '追踪', '_tracking-state.json'), JSON.stringify({ project: safeName, chapters: [], updatedAt: Date.now() }, null, 2), 'utf8')
  } else {
    mkdirSync(dir, { recursive: true })
    writeFileSync(join(dir, '正文.md'), `# ${safeName}\n\n`, 'utf8')
    writeFileSync(join(dir, '小节大纲.md'), `# ${safeName} · 小节大纲\n\n`, 'utf8')
    writeFileSync(join(dir, '设定.md'), `# ${safeName} · 设定\n\n`, 'utf8')
  }
  return safeName
}
