/**
 * Multi-vendor AI Studio client-side wrapper.
 *
 * All API calls go through the Host proxy endpoint (POST /agnes-studio/api/proxy)
 * to keep API keys server-side. The browser never sees any key.
 *
 * Supported vendors: Agnes, MiniMax, DeepSeek, Qwen, Doubao (Seedream/Seaweed).
 */

// ─── Model Options ──────────────────────────────────────────────────────────

/** Text model options grouped by vendor. */
export const TEXT_MODEL_OPTIONS: Record<string, string> = {
  'agnes-3.0-flash': 'Agnes 3.0 Flash (推荐)',
  'agnes-2.5-flash': 'Agnes 2.5 Flash',
  'MiniMax-M3': 'MiniMax M3',
  'deepseek-v4-flash': 'DeepSeek V4 Flash',
  'deepseek-chat': 'DeepSeek Chat',
  'deepseek-reasoner': 'DeepSeek Reasoner',
  'qwen-turbo': 'Qwen Turbo',
  'qwen-plus': 'Qwen Plus',
}

/** Image model options grouped by vendor. */
export const IMAGE_MODEL_OPTIONS: Record<string, string> = {
  'agnes-image-2.5-flash': 'Agnes Image 2.5 Flash (推荐)',
  'agnes-image-2.1-flash': 'Agnes Image 2.1 Flash',
  'agnes-image-2.0-flash': 'Agnes Image 2.0 Flash',
  'doubao-seedream-3-0': '豆包 Seedream 3.0',
  'minimax-image-01': 'MiniMax Image 01',
  'qwen-image-plus': 'Qwen Image Plus',
}

/** Video model options grouped by vendor. */
export const VIDEO_MODEL_OPTIONS: Record<string, string> = {
  'agnes-video-2.5-flash': 'Agnes Video 2.5 Flash (推荐)',
  'agnes-video-2.5': 'Agnes Video 2.5',
  'MiniMax-H3': 'MiniMax H3',
  'agnes-video-v2.0': 'Agnes Video 2.0',
  'minimax-video-01': 'MiniMax Video 01',
  'doubao-seaweed-t2v': '豆包 Seaweed T2V',
}

// ─── Size Whitelist ─────────────────────────────────────────────────────────

const IMAGE_MODEL_SIZE_SUPPORTED: Record<string, string[]> = {
  'agnes-image': ['1024x1024', '1024x768', '768x1024', '1280x720', '720x1280'],
  'doubao-seedream': ['1024x1024', '864x1152', '1152x864', '1280x720', '720x1280'],
  'minimax-image': ['1024x1024', '1024x768', '768x1024', '1280x720', '720x1280'],
  'qwen-image': ['1024x1024', '1024x768', '768x1024', '1280x720', '720x1280'],
}
const DEFAULT_IMAGE_SIZES = ['1024x1024', '1024x768', '768x1024', '1280x720', '720x1280']

/** Return the supported sizes for a given image model. */
export function getImageSizeOptions(model: string): string[] {
  if (!model) return DEFAULT_IMAGE_SIZES
  const m = model.toLowerCase()
  for (const [prefix, sizes] of Object.entries(IMAGE_MODEL_SIZE_SUPPORTED)) {
    if (m.startsWith(prefix)) return [...sizes, ...DEFAULT_IMAGE_SIZES.filter(s => !sizes.includes(s))]
  }
  return DEFAULT_IMAGE_SIZES
}

// ─── Request Types ──────────────────────────────────────────────────────────

/** Image generation request — supports multiple vendors. */
export interface ImageGenRequest {
  prompt: string
  model?: string       // model name, defaults to agnes-image-2.5-flash
  size?: string        // pixel size e.g. 1024x1024 (not 1K/2K)
  ratio?: string       // aspect ratio e.g. 1:1, 16:9
  images?: string[]    // reference images for img2img
  negative_prompt?: string
  seed?: number
}

/** Video generation request — supports multiple vendors and modes. */
export interface VideoGenRequest {
  prompt: string
  model?: string       // model name, defaults to agnes-video-2.5-flash
  mode?: 'text' | 'keyframe' | 'reference'
  seconds?: string     // duration, e.g. "5"
  size?: string        // resolution: 720P, 1080P, etc.
  aspectRatio?: string // aspect ratio
  firstFrame?: string  // first frame image URL/base64
  lastFrame?: string   // last frame image URL/base64
  images?: string[]    // reference images
  negative_prompt?: string
  seed?: number
  width?: number       // pixel width (generic fallback)
  height?: number      // pixel height (generic fallback)
  num_frames?: number  // frame count (generic fallback)
  frame_rate?: number  // fps (generic fallback)
}

// ─── Storyboard Types ───────────────────────────────────────────────────────

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

// ─── Custom Model Types ─────────────────────────────────────────────────────

/** A user-defined custom model entry. */
export interface CustomModel {
  id: string
  name: string
  type: 'text' | 'image' | 'video'
  base_url: string
  api_key?: string
}

/** Read custom models from localStorage. */
export function getCustomModels(): CustomModel[] {
  try {
    const raw = localStorage.getItem('agnes-studio-custom-models')
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

/** Persist custom models to localStorage. */
export function saveCustomModels(models: CustomModel[]): void {
  localStorage.setItem('agnes-studio-custom-models', JSON.stringify(models))
}

/** Add a custom model. Returns false if the id already exists. */
export function addCustomModel(model: CustomModel): boolean {
  const models = getCustomModels()
  if (models.some(m => m.id === model.id)) return false
  models.push(model)
  saveCustomModels(models)
  return true
}

/** Remove a custom model by id. */
export function removeCustomModel(modelId: string): void {
  const models = getCustomModels().filter(m => m.id !== modelId)
  saveCustomModels(models)
}

// ─── API Functions ──────────────────────────────────────────────────────────

/** Generate image through Host proxy — supports multiple vendors. */
export async function generateImage(req: ImageGenRequest): Promise<{ url: string }> {
  const model = req.model || 'agnes-image-2.5-flash'

  const params: Record<string, unknown> = {
    model,
    prompt: req.prompt,
    size: req.size || '1024x1024',
    extra_body: {
      response_format: 'url',
    },
  }

  if (req.ratio) {
    ;(params.extra_body as Record<string, unknown>).ratio = req.ratio
  }
  if (req.images && req.images.length > 0) {
    ;(params.extra_body as Record<string, unknown>).image = req.images
  }
  if (req.negative_prompt) {
    params.negative_prompt = req.negative_prompt
  }
  if (req.seed !== undefined) {
    params.seed = req.seed
  }

  const resp = await callHostProxy('/v1/images/generations', params)
  const data = resp.data as Array<{ url?: string; b64_json?: string }>
  if (data && data[0] && data[0].url) {
    return { url: data[0].url }
  }
  throw new Error('图片生成失败：未返回 URL')
}

/** Generate video through Host proxy — supports multiple vendors and modes. */
export async function generateVideo(req: VideoGenRequest): Promise<{ videoId: string; taskId: string }> {
  const model = req.model || 'agnes-video-2.5-flash'

  // ── Agnes Video 2.5 uses dedicated params ──
  if (model.startsWith('agnes-video-2.5')) {
    const params: Record<string, unknown> = {
      model,
      prompt: req.prompt,
      mode: req.mode || 'text',
      seconds: req.seconds || '5',
      size: req.size || '720P',
    }
    if (req.aspectRatio) params.aspect_ratio = req.aspectRatio
    if (req.mode === 'keyframe') {
      if (req.firstFrame) params.first_frame = req.firstFrame
      if (req.lastFrame) params.last_frame = req.lastFrame
    }
    if (req.mode === 'reference') {
      if (req.images && req.images.length > 0) params.images = req.images
    }
    if (req.seed !== undefined) params.seed = req.seed

    const resp = await callHostProxy('/v1/videos', params)
    return {
      videoId: String(resp.video_id || resp.id || ''),
      taskId: String(resp.task_id || resp.id || ''),
    }
  }

  // ── MiniMax H3 uses V2 interface ──
  if (model.toLowerCase().includes('minimax') && model.includes('H3')) {
    const params: Record<string, unknown> = {
      model,
      prompt: req.prompt,
      duration: parseInt(req.seconds || '5'),
      resolution: req.size || '768P',
      ratio: req.aspectRatio || '16:9',
    }
    if (req.firstFrame) params.first_frame = req.firstFrame
    if (req.lastFrame) params.last_frame = req.lastFrame

    const resp = await callHostProxy('/v2/video_generation', params)
    return {
      videoId: '',
      taskId: String(resp.task_id || ''),
    }
  }

  // ── Generic video models (standard param format) ──
  const params: Record<string, unknown> = {
    model,
    prompt: req.prompt,
    width: req.width || 1152,
    height: req.height || 768,
    num_frames: req.num_frames || 121,
    frame_rate: req.frame_rate || 24,
  }
  if (req.images && req.images.length > 0) {
    params.image = req.images.length === 1 ? req.images[0] : req.images
  }
  if (req.negative_prompt) params.negative_prompt = req.negative_prompt
  if (req.seed !== undefined) params.seed = req.seed

  const resp = await callHostProxy('/v1/videos', params)
  return {
    videoId: String(resp.video_id || resp.id || ''),
    taskId: String(resp.task_id || resp.id || ''),
  }
}

/** Poll video task status. */
export async function pollVideoStatus(videoId: string): Promise<{ status: string; url?: string; progress?: number; error?: string }> {
  const resp = await callHostProxy(
    `/agnesapi?video_id=${encodeURIComponent(videoId)}&model_name=agnes-video-2.5-flash`,
    undefined,
    'GET',
  )
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

// ─── Key & Model Status ─────────────────────────────────────────────────────

/** API key state as seen from the panel. */
export type KeyStatus = 'ready' | 'missing' | 'unknown'

/**
 * Fetch API key status for all configured vendors.
 *
 * Preferred route is `/agnes-studio/api/status`, which resolves keys without
 * calling upstream. Falls back to a proxy probe for older host builds.
 */
export async function fetchKeyStatus(): Promise<{
  configured: boolean
  source: 'credentials' | 'env' | null
  vendors?: Record<string, { configured: boolean; source: string | null }>
  platformUrl?: string
}> {
  try {
    const resp = await fetch('/agnes-studio/api/status', { method: 'GET' })
    if (resp.ok) {
      const data = await resp.json() as { configured?: unknown }
      if (typeof data.configured === 'boolean') {
        return data as any
      }
    }
  } catch { /* fall through to probe */ }

  // Legacy probe for old host builds
  try {
    await callHostProxy('/__dsh_agnes_key_probe__', {})
    return { configured: true, source: null }
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    if (message.includes('未配置') || message.includes('agnes-api-key'))
      return { configured: false, source: null }
    if (/invalid api key|api key is invalid|unauthorized|no api key/i.test(message))
      return { configured: false, source: null }
    if (message.includes('Agnes API'))
      return { configured: true, source: null }
    return { configured: false, source: null }
  }
}

/**
 * Fetch available models from the host (with fallback to built-in defaults).
 */
export async function fetchModels(): Promise<{
  text: Record<string, string>
  image: Record<string, string>
  video: Record<string, string>
  customModels?: Array<{ id: string; name: string; type: string; base_url: string }>
}> {
  try {
    const resp = await fetch('/agnes-studio/api/models', { method: 'GET' })
    if (resp.ok) {
      return await resp.json() as any
    }
  } catch { /* fall through */ }
  return {
    text: TEXT_MODEL_OPTIONS,
    image: IMAGE_MODEL_OPTIONS,
    video: VIDEO_MODEL_OPTIONS,
  }
}

// ─── Host Proxy ─────────────────────────────────────────────────────────────

/** Call the Host proxy endpoint. */
async function callHostProxy(endpoint: string, params?: unknown, method: 'POST' | 'GET' = 'POST'): Promise<Record<string, unknown>> {
  const resp = await fetch('/agnes-studio/api/proxy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ endpoint, params, method }),
  })

  if (!resp.ok) {
    const text = await resp.text().catch(() => '')
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

// ─── Project Persistence ────────────────────────────────────────────────────

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
