/**
 * 创作台 — 客户端 API 模块。
 *
 * 对应宿主半的 `/agnes-studio/api/ohstory/*`（见 src/ohstory-fs.ts）。
 * 那套 API 刻意不依赖 DSH sessionId：工作区清单来自 DSH 自己的注册表，
 * 其余操作都显式传 root。
 */

const API_BASE = '/agnes-studio/api/ohstory'

/** 一个 DSH 工作区。 */
export interface DshWorkspace {
  id: string
  path: string
  title: string
  sessionCount: number
}

/** 一个创作项目。 */
export interface CreativeProject {
  dir: string
  kind: 'long' | 'short' | 'analysis'
  name: string
}

/** 一个文件/目录条目。 */
export interface FsEntry {
  name: string
  rel: string
  type: 'dir' | 'file'
  size?: number
  editable?: boolean
}

/** 读文件的结果。 */
export interface FilePayload {
  rel: string
  content: string
  mtimeMs: number
}

/**
 * 把宿主返回的错误转成可读消息。
 * @param resp - fetch 响应。
 * @returns 错误消息。
 */
async function failText(resp: Response): Promise<string> {
  try {
    const data = await resp.json() as { error?: string }
    if (typeof data.error === 'string' && data.error.length > 0) return data.error
  } catch { /* ignore */ }
  return `请求失败（HTTP ${resp.status}）`
}

/**
 * 列 DSH 工作区。
 * @returns 工作区列表；失败时返回空数组。
 */
export async function fetchWorkspaces(): Promise<DshWorkspace[]> {
  try {
    const resp = await fetch(`${API_BASE}/workspaces`)
    if (!resp.ok) return []
    const data = await resp.json() as { workspaces?: DshWorkspace[] }
    return Array.isArray(data.workspaces) ? data.workspaces : []
  } catch {
    return []
  }
}

/**
 * 列某个工作区里的创作项目。
 * @param root - 工作区绝对路径。
 * @returns 项目列表。
 */
export async function fetchProjects(root: string): Promise<CreativeProject[]> {
  const resp = await fetch(`${API_BASE}/projects?root=${encodeURIComponent(root)}`)
  if (!resp.ok) throw new Error(await failText(resp))
  const data = await resp.json() as { projects?: CreativeProject[] }
  return Array.isArray(data.projects) ? data.projects : []
}

/**
 * 列目录。
 * @param root - 工作区绝对路径。
 * @param rel - 相对 root 的目录（空串为根）。
 * @returns 条目列表。
 */
export async function fetchEntries(root: string, rel: string): Promise<FsEntry[]> {
  const resp = await fetch(`${API_BASE}/list?root=${encodeURIComponent(root)}&rel=${encodeURIComponent(rel)}`)
  if (!resp.ok) throw new Error(await failText(resp))
  const data = await resp.json() as { entries?: FsEntry[] }
  return Array.isArray(data.entries) ? data.entries : []
}

/**
 * 读一个文本文件。
 * @param root - 工作区绝对路径。
 * @param rel - 相对路径。
 * @returns 内容与修改时间。
 */
export async function readFile(root: string, rel: string): Promise<FilePayload> {
  const resp = await fetch(`${API_BASE}/file?root=${encodeURIComponent(root)}&rel=${encodeURIComponent(rel)}`)
  if (!resp.ok) throw new Error(await failText(resp))
  return await resp.json() as FilePayload
}

/**
 * 写一个文本文件。
 * @param root - 工作区绝对路径。
 * @param rel - 相对路径。
 * @param content - 内容。
 */
export async function writeFile(root: string, rel: string, content: string): Promise<void> {
  const resp = await fetch(`${API_BASE}/file`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ root, rel, content }),
  })
  if (!resp.ok) throw new Error(await failText(resp))
}

/**
 * 按模板创建一个创作项目（纯建目录与文件，不经 Agent）。
 * @param root - 工作区绝对路径。
 * @param kind - long=长篇 / short=短篇。
 * @param name - 项目名。
 * @returns 新建的目录名。
 */
export async function createProject(root: string, kind: 'long' | 'short', name: string): Promise<string> {
  const resp = await fetch(`${API_BASE}/project`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ root, kind, name }),
  })
  if (!resp.ok) throw new Error(await failText(resp))
  const data = await resp.json() as { dir?: string }
  return String(data.dir ?? name)
}
