// ─── 数字人口播 客户端 API ───────────────────────────────────────────────────
// 与 Host 端 /agnes-studio/api/anchor 通信
// ─────────────────────────────────────────────────────────────────────────────

const API_BASE = '/agnes-studio/api'

export type VisualMode = 'static' | 'clip' | 'ai'

export type AnchorStatus =
  | 'pending' | 'tts' | 'visual' | 'muxing' | 'completed' | 'failed' | 'stopped'

export interface AnchorSegment {
  index: number
  text: string
  start: number
  end: number
  duration: number
  status: 'pending' | 'done' | 'failed'
  error?: string
}

export interface AnchorTask {
  anchor_id: string
  text: string
  mode: VisualMode
  status: AnchorStatus
  message: string
  voice: string
  min_seg_sec: number
  burn_subtitles: boolean
  segments: AnchorSegment[]
  total_duration: number
  created_at: number
  updated_at: number
}

export interface AnchorStatusPayload {
  anchor_id: string
  status: AnchorStatus
  message: string
  segments: number
  done: number
  total_duration: number
  error: string | null
  final: string | null
}

export interface StartAnchorRequest {
  text: string
  mode: VisualMode
  subtitles?: boolean
  voice?: string
  min_seg_sec?: number
  /** static 模式必填：图片（data URL 或 http URL） */
  image?: { kind: 'data' | 'url'; value: string }
  /** clip 模式必填：视频 */
  clip?: { kind: 'data' | 'url'; value: string }
  /** ai 模式可选：画面风格提示词 */
  ai_prompt?: string
}

/** 提交口播任务 */
export async function startAnchor(req: StartAnchorRequest): Promise<{ anchor_id: string; segments: number }> {
  const resp = await fetch(`${API_BASE}/anchor/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  })
  const data = await resp.json().catch(() => ({}))
  if (!resp.ok || data?.error) throw new Error(data?.error || `提交失败（HTTP ${resp.status}）`)
  return data
}

/** 查询口播任务状态 */
export async function getAnchorStatus(anchorId: string): Promise<AnchorStatusPayload> {
  const resp = await fetch(`${API_BASE}/anchor/${anchorId}/status`)
  const data = await resp.json().catch(() => ({}))
  if (!resp.ok || data?.error) throw new Error(data?.error || '查询失败')
  return data
}

/** 完整任务详情（含每段文本） */
export async function getAnchorTask(anchorId: string): Promise<AnchorTask> {
  const resp = await fetch(`${API_BASE}/anchor/${anchorId}`)
  const data = await resp.json().catch(() => ({}))
  if (!resp.ok || data?.error) throw new Error(data?.error || '查询失败')
  return data
}

/** 停止任务 */
export async function stopAnchor(anchorId: string): Promise<void> {
  await fetch(`${API_BASE}/anchor/${anchorId}/stop`, { method: 'POST' })
}

/** 重新生成（恢复） */
export async function resumeAnchor(anchorId: string): Promise<void> {
  await fetch(`${API_BASE}/anchor/${anchorId}/resume`, { method: 'POST' })
}

/** 轮询状态，返回取消函数 */
export function pollAnchorStatus(
  anchorId: string,
  callback: (s: AnchorStatusPayload) => void,
  intervalMs = 3000,
): () => void {
  let stopped = false
  const tick = async () => {
    if (stopped) return
    try {
      const s = await getAnchorStatus(anchorId)
      callback(s)
      if (s.status === 'completed' || s.status === 'failed' || s.status === 'stopped') return
    } catch { /* 网络抖动继续轮询 */ }
    if (!stopped) setTimeout(tick, intervalMs)
  }
  tick()
  return () => { stopped = true }
}

/**
 * ffmpeg / 字体 能力状态。
 *
 * Returns null when the probe itself is unavailable (e.g. the host half is an
 * older build without the /ffmpeg route). Returning a default "unavailable"
 * object would make the panel cry "缺少 ffmpeg" on a machine where ffmpeg is
 * perfectly fine — a false alarm is worse than no banner.
 */
export async function fetchFfmpegStatus(): Promise<{
  available: boolean; path: string; version: string; ffprobe: boolean; font: string; hint: string
} | null> {
  try {
    const resp = await fetch(`${API_BASE}/ffmpeg`)
    if (!resp.ok) return null
    const data = await resp.json().catch(() => null)
    if (!data || typeof data.available !== 'boolean') return null
    return {
      available: data.available,
      path: String(data.path ?? ''),
      version: String(data.version ?? ''),
      ffprobe: Boolean(data.ffprobe),
      font: String(data.font ?? ''),
      hint: String(data.hint ?? ''),
    }
  } catch {
    return null
  }
}

/** 可选的 MiMo 音色 */
export const ANCHOR_VOICES = [
  { id: 'mimo_default', name: '默认音色' },
]

/** 把 File 读成 data URL（用于上传形象图/素材视频） */
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error('读取文件失败'))
    reader.readAsDataURL(file)
  })
}
