/**
 * Agnes API client-side wrapper.
 *
 * All API calls go through the Host proxy endpoint (POST /agnes-studio/api/proxy)
 * to keep the API key server-side. The browser never sees the key.
 */

/** Image generation request. */
export interface ImageGenRequest {
  prompt: string
  size?: string      // 1K, 2K, 3K, 4K
  ratio?: string     // 1:1, 3:4, 4:3, 16:9, 9:16, 2:3, 3:2, 21:9
  images?: string[]  // reference images for img2img
}

/** Video generation request. */
export interface VideoGenRequest {
  prompt: string
  mode?: 'text' | 'keyframe' | 'reference'
  seconds?: string   // "4" to "12"
  size?: string      // 720P, 1080P, 1K, 2K
  aspectRatio?: string
  firstFrame?: string
  lastFrame?: string
  images?: string[]
  audios?: string[]
}

/** Scene in a storyboard. */
export interface StoryScene {
  name: string
  prompt: string
  motion?: string
  duration?: number
  imageUrl?: string
  videoUrl?: string
  status: 'pending' | 'generating-image' | 'generating-video' | 'done' | 'error'
  error?: string
}

/** Studio project. */
export interface StudioProject {
  id: string
  name: string
  scenes: StoryScene[]
  createdAt: number
  updatedAt: number
}

/** Generate image through Host proxy. */
export async function generateImage(req: ImageGenRequest): Promise<{ url: string }> {
  const params: Record<string, unknown> = {
    model: 'agnes-image-2.5-flash',
    prompt: req.prompt,
    size: req.size || '2K',
    extra_body: {
      response_format: 'url',
    },
  }

  if (req.ratio) {
    params.size = req.size || '2K'
    ;(params.extra_body as Record<string, unknown>).ratio = req.ratio
  }

  if (req.images && req.images.length > 0) {
    ;(params.extra_body as Record<string, unknown>).image = req.images
  }

  const resp = await callHostProxy('/v1/images/generations', params)
  const data = resp.data as Array<{ url?: string; b64_json?: string }>
  if (data && data[0] && data[0].url) {
    return { url: data[0].url }
  }
  throw new Error('图片生成失败：未返回 URL')
}

/** Generate video through Host proxy (returns video_id for polling). */
export async function generateVideo(req: VideoGenRequest): Promise<{ videoId: string; taskId: string }> {
  const params: Record<string, unknown> = {
    model: 'agnes-video-2.5-flash',
    prompt: req.prompt,
    mode: req.mode || 'text',
    seconds: req.seconds || '5',
    size: '720P',
  }

  if (req.aspectRatio) {
    params.aspect_ratio = req.aspectRatio
  }

  if (req.mode === 'keyframe') {
    if (req.firstFrame) params.first_frame = req.firstFrame
    if (req.lastFrame) params.last_frame = req.lastFrame
  }

  if (req.mode === 'reference') {
    if (req.images && req.images.length > 0) params.images = req.images
    if (req.audios && req.audios.length > 0) params.audios = req.audios
  }

  const resp = await callHostProxy('/v1/videos', params)
  return {
    videoId: String(resp.video_id || resp.id || ''),
    taskId: String(resp.task_id || resp.id || ''),
  }
}

/** Poll video task status. */
export async function pollVideoStatus(videoId: string): Promise<{ status: string; url?: string; progress?: number; error?: string }> {
  const resp = await callHostProxy(`/agnesapi?video_id=${encodeURIComponent(videoId)}&model_name=agnes-video-2.5-flash`, undefined, 'GET')
  const status = String(resp.status || '')
  const progress = Number(resp.progress || 0)

  if (status === 'completed') {
    const meta = resp.metadata as Record<string, unknown> | undefined
    return { status: 'completed', url: String(meta?.url || ''), progress: 100 }
  }
  if (status === 'failed') {
    const err = resp.error as Record<string, unknown> | undefined
    return { status: 'failed', error: String(err?.message || '视频生成失败'), progress }
  }
  return { status, progress }
}

/** Call the Host proxy endpoint. */
async function callHostProxy(endpoint: string, params?: unknown, method: 'POST' | 'GET' = 'POST'): Promise<Record<string, unknown>> {
  const resp = await fetch('/agnes-studio/api/proxy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ endpoint, params, method }),
  })

  if (!resp.ok) {
    const text = await resp.text().catch(() => '')
    // The host answers failures as {"error": "..."} — surface that message
    // verbatim so "API Key 未配置" stays recognizable in the panel.
    let message = text
    try {
      const parsed = JSON.parse(text) as { error?: unknown }
      if (parsed !== null && typeof parsed.error === 'string') message = parsed.error
    } catch { /* not JSON: keep the raw body */ }
    throw new Error(message.slice(0, 300))
  }

  const result = await resp.json() as Record<string, unknown>
  if (result.error) {
    throw new Error(String(result.error))
  }
  return result
}

/** API key state as seen from the panel. */
export type KeyStatus = 'ready' | 'missing' | 'unknown'

/**
 * Ask the host whether an Agnes API key is configured.
 *
 * Preferred route is the host's `/agnes-studio/api/status` endpoint, which
 * resolves the key without calling Agnes. Host builds older than that route
 * fall back to a proxy probe: the host resolves the key BEFORE it talks to
 * Agnes, so "未配置" means missing while any later failure (the probe path
 * 404s upstream) means the key is present.
 */
export async function fetchKeyStatus(): Promise<KeyStatus> {
  try {
    const resp = await fetch('/agnes-studio/api/status', { method: 'GET' })
    if (resp.ok) {
      const data = await resp.json() as { configured?: unknown }
      if (typeof data.configured === 'boolean') return data.configured ? 'ready' : 'missing'
    }
  } catch { /* fall through to the probe */ }

  try {
    await callHostProxy('/__dsh_agnes_key_probe__', {})
    return 'ready'
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    // The host resolves the key BEFORE it calls Agnes, so only the host's own
    // "未配置" hint means the key is absent; any "Agnes API <status>" answer
    // proves the key was resolved and sent. An unknown probe path may answer
    // 401/403 at the edge — that is NOT a missing key.
    if (message.includes('未配置') || message.includes('agnes-api-key')) return 'missing'
    if (/invalid api key|api key is invalid|unauthorized|no api key/i.test(message)) return 'missing'
    if (message.includes('Agnes API')) return 'ready'
    return 'unknown'
  }
}

/** Generate a unique project ID. */
export function generateProjectId(): string {
  return 'proj_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8)
}

/** Save project to localStorage. */
export function saveProject(project: StudioProject): void {
  try {
    const projects = listProjects()
    const idx = projects.findIndex(p => p.id === project.id)
    if (idx >= 0) {
      projects[idx] = project
    } else {
      projects.unshift(project)
    }
    // Keep only the last 50 projects
    if (projects.length > 50) projects.length = 50
    localStorage.setItem('agnes-studio-projects', JSON.stringify(projects))
  } catch {
    // localStorage may be full or unavailable
  }
}

/** Load all projects from localStorage. */
export function listProjects(): StudioProject[] {
  try {
    const raw = localStorage.getItem('agnes-studio-projects')
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

/** Delete a project from localStorage. */
export function deleteProject(id: string): void {
  try {
    const projects = listProjects().filter(p => p.id !== id)
    localStorage.setItem('agnes-studio-projects', JSON.stringify(projects))
  } catch {
    // ignore
  }
}
