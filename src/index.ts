/**
 * dsh-agnes-studio host half — multi-vendor edition.
 *
 * Registers JSON-RPC proxy endpoints so the client-side panel can call
 * Agnes AI / DeepSeek / Qwen / Doubao / MiniMax / Ollama APIs without
 * exposing any API key to the browser. Also announces the plugin to
 * agents via a system-prompt section.
 */

import type { Context } from '@deepseek-ai/cordis'
import type { IncomingMessage, ServerResponse } from 'node:http'
import type {} from '@deepseek-ai/dsh-host-webserver'
import type {} from '@deepseek-ai/dsh-system-prompt'
import type {} from '@deepseek-ai/dsh-credentials'
import { handleDramaRoute, rehydrateDramas, resolveDramaMedia, type DramaHost } from './drama-engine.js'
import { handleAnchorRoute, rehydrateAnchors, resolveAnchorMedia, type AnchorHost } from './anchor-engine.js'
import { COVER_STYLES, analyzeNovelFile, buildCoverPrompt } from './cover-engine.js'
import { handlePromptExpertRoute, generatePromptExpert, EXPERT_TYPES } from './prompt-expert-engine.js'
import {
  listDshWorkspaces, detectCreativeProjects, listEntries, readText, writeText, createProject,
} from './ohstory-fs.js'
import { ffmpegStatus } from './ffmpeg.js'
import { statSync, createReadStream } from 'node:fs'
import { VENDOR_BASE_URLS, getVendorFromModel } from './vendors.js'

// ═══════════════════════════════════════════════════════════════════════
// Constants
// ═══════════════════════════════════════════════════════════════════════

/** Stable cordis plugin name. */
export const name = 'agnes-studio'

/** Required services. */
export const inject = ['webServer', 'systemPrompt', 'credentials']

/** Platform registration URL (Agnes) —— 提示词与客户端常量都以它为准。 */
const AGNES_PLATFORM_URL = 'https://platform.agnes-ai.cn'

/** Model-facing announcement. */
const AGNES_STUDIO_GUIDANCE =
  '本机已安装 dsh-agnes-studio 插件（泡泡猫的影视工具）：侧边栏「🎬 泡泡猫的影视工具」入口打开影视工具面板（内部即 Agnes 创意工作站）。' +
  '能力：文生图、图生图、多图合成、文生视频、图生视频、剧本导入（.txt/.md/.json）、故事板编排。' +
  '多厂商支持：面板现已支持 Agnes / DeepSeek / Qwen / 豆包(Doubao) / MiniMax / Ollama 六大厂商的文本、图像和视频模型，' +
  '代理端点自动按模型名路由到对应厂商 API。' +
  '限制：面板为全局浮层，不影响对话框；API Key 由宿主进程读取，浏览器不接触。' +
  `首次使用需要对应厂商的 API Key：Agnes 在 ${AGNES_PLATFORM_URL} 注册；` +
  '其他厂商各自的 Key 写入 .env（如 DEEPSEEK_API_KEY=sk-...）或 DSH 凭据（如 deepseek-api-key）。' +
  'Ollama 无需 Key，需本地运行 11434 端口。' +
  '本插件同时附带 Oh Story 的创作技能与工具（原 @oh-story/dsh 不再是独立插件行），共 37 个技能——' +
  '短剧 11 个（short-drama 及其 develop/write/assets/image-prompts/storyboard/video-prompts/produce/edit/review/novel-analyze）、' +
  '网文 13 个（story 及其 long/short 拆文与写作、封面、去 AI 味、导入、审查、扫榜）、' +
  '视频解说 6 个（video-understanding/script/cut/voiceover/assemble/recap）、' +
  '小说改游戏 7 个（novel-to-game 及其 analyze/concept/world-design/art-direction/build/qa），' +
  '以及 oh_story_role、oh_story_production、oh_story_bundled_reference 三个工具。' +
  '注意：Oh Story 的图形工作台页签已从面板撤下（功能不完善），上述技能仍可正常使用；' +
  '短剧项目的创作真相是项目目录里 剧集/EPxxx 的五份 Markdown，直接编辑文件即可。' +
  '用户提到「泡泡猫的影视工具 / Agnes 创意站 / 创意工作站 / 生图 / 生视频 / agnes studio / 短剧插件 / short 插件 / oh-story / 短剧 / 漫剧 / 视频解说 / 小说改游戏」时即指本插件，可引导其从侧边栏入口打开；' +
  '短剧项目的创作真相仍是项目目录里 剧集/EPxxx 的五份 creator-first Markdown（剧本/视觉设定/分镜/图片提示词/视频提示词），由上述技能维护。'

const SECTION_ORDER = 310

// ═══════════════════════════════════════════════════════════════════════
// Vendor routing
// ═══════════════════════════════════════════════════════════════════════

/** Get vendor base URL, with optional custom override. */
function getVendorBaseUrl(vendor: string, customUrl?: string): string {
  if (customUrl) return customUrl
  return VENDOR_BASE_URLS[vendor] || VENDOR_BASE_URLS.agnes
}

/**
 * Join a vendor base URL with a client endpoint without duplicating or losing
 * the API version segment.
 *
 * The base URLs above already carry a version (`.../v1`, `.../api/v3`), while
 * clients also send fully-qualified endpoints (`/v1/images/generations`,
 * `/v2/video_generation`). Naive concatenation produced `.../v1/v1/...`, which
 * Agnes answered with 404 — every image/video call from the panel failed.
 *
 * Rules:
 *   base .../v1 + /v1/images/...   → .../v1/images/...   (version deduped)
 *   base .../v1 + /images/...      → .../v1/images/...
 *   base .../v1 + /v2/video_gen    → .../v2/video_gen    (endpoint version wins)
 *   base .../v1 + /agnesapi?...    → .../v1/agnesapi?...
 */
export function buildUpstreamUrl(baseUrl: string, endpoint: string): string {
  const base = String(baseUrl || '').replace(/\/+$/, '')
  const ep = '/' + String(endpoint || '').replace(/^\/+/, '')
  const baseVersion = base.match(/\/(v\d+[a-z0-9]*)$/i)
  const endpointVersion = ep.match(/^\/(v\d+[a-z0-9]*)(\/|$)/i)
  if (baseVersion && endpointVersion) {
    // The endpoint states its own version: drop the base's version segment.
    return base.slice(0, base.length - baseVersion[0].length) + ep
  }
  return base + ep
}

// ═══════════════════════════════════════════════════════════════════════
// API Key resolution
// ═══════════════════════════════════════════════════════════════════════

/**
 * Resolve the API key for a specific vendor.
 * Priority: vendor-specific credential → vendor-specific env → Agnes fallback → error.
 */
async function resolveApiKeyForVendor(ctx: Context, vendor: string): Promise<string> {
  // Ollama doesn't need a key
  if (vendor === 'ollama') return 'ollama'

  // 1. Try vendor-specific credential
  const credentialKey = `${vendor}-api-key`
  try {
    const resolved = await ctx.credentials.resolve(credentialKey)
    if (resolved && typeof resolved === 'string' && resolved.length > 0) {
      return resolved
    }
  } catch { /* credentials service may not have the key */ }

  // 2. Try vendor-specific env variable
  const envKey = `${vendor.toUpperCase()}_API_KEY`
  if (process.env[envKey]) return process.env[envKey]!

  // NOTE: there is deliberately NO cross-vendor fallback to the Agnes key.
  // Each vendor has its own endpoint, so sending the Agnes key to DeepSeek/Qwen
  // just produces an opaque 401 far from the real cause. Fail here instead, with
  // the exact key name the user must configure.

  throw new Error(
    `${vendor} API Key 未配置：请在本机 .env 写入 ${envKey}=... 或在 DSH 凭据(credentials)中新增 ${credentialKey}。` +
    (vendor === 'agnes' ? ` Agnes Key 也可在 ${AGNES_PLATFORM_URL} 注册获取。` : ''),
  )
}

/**
 * Get key configuration status for all vendors (never exposes actual keys).
 */
async function getKeyStatus(ctx: Context): Promise<Record<string, { configured: boolean; source: string | null; envKey: string; credentialKey: string }>> {
  const vendors = ['agnes', 'deepseek', 'qwen', 'doubao', 'minimax', 'ollama']
  const status: Record<string, { configured: boolean; source: string | null; envKey: string; credentialKey: string }> = {}

  for (const vendor of vendors) {
    if (vendor === 'ollama') {
      status[vendor] = { configured: true, source: 'built-in', envKey: '', credentialKey: '' }
      continue
    }
    // Check vendor-specific credential
    try {
      const resolved = await ctx.credentials.resolve(`${vendor}-api-key`)
      if (resolved && typeof resolved === 'string' && resolved.length > 0) {
        status[vendor] = { configured: true, source: 'credentials', envKey: `${vendor.toUpperCase()}_API_KEY`, credentialKey: `${vendor}-api-key` }
        continue
      }
    } catch { /* ignore */ }
    // Check vendor-specific env
    if (process.env[`${vendor.toUpperCase()}_API_KEY`]) {
      status[vendor] = { configured: true, source: 'env', envKey: `${vendor.toUpperCase()}_API_KEY`, credentialKey: `${vendor}-api-key` }
      continue
    }
    // A vendor is configured ONLY by its own credential/env. Having an Agnes
    // key does not make DeepSeek usable — report it as unconfigured so the
    // panel tells the truth.
    status[vendor] = { configured: false, source: null, envKey: `${vendor.toUpperCase()}_API_KEY`, credentialKey: `${vendor}-api-key` }
  }
  return status
}

// ═══════════════════════════════════════════════════════════════════════
// Model options
// ═══════════════════════════════════════════════════════════════════════

const TEXT_MODEL_OPTIONS: Record<string, string> = {
  'agnes-3.0-flash': 'Agnes 3.0 Flash (推荐)',
  'agnes-2.5-flash': 'Agnes 2.5 Flash',
  'MiniMax-M3': 'MiniMax M3',
  'deepseek-v4-flash': 'DeepSeek V4 Flash',
  'deepseek-chat': 'DeepSeek Chat',
  'deepseek-reasoner': 'DeepSeek Reasoner',
  'qwen-turbo': 'Qwen Turbo',
  'qwen-plus': 'Qwen Plus',
}

const IMAGE_MODEL_OPTIONS: Record<string, string> = {
  'agnes-image-2.5-flash': 'Agnes Image 2.5 Flash (推荐)',
  'agnes-image-2.1-flash': 'Agnes Image 2.1 Flash',
  'agnes-image-2.0-flash': 'Agnes Image 2.0 Flash',
  'doubao-seedream-3-0': '豆包 Seedream 3.0',
  'minimax-image-01': 'MiniMax Image 01',
  'qwen-image-plus': 'Qwen Image Plus',
}

const VIDEO_MODEL_OPTIONS: Record<string, string> = {
  'agnes-video-2.5-flash': 'Agnes Video 2.5 Flash (推荐)',
  'agnes-video-2.5': 'Agnes Video 2.5',
  'MiniMax-H3': 'MiniMax H3',
  'agnes-video-v2.0': 'Agnes Video 2.0',
  'minimax-video-01': 'MiniMax Video 01',
  'doubao-seaweed-t2v': '豆包 Seaweed T2V',
}

/** Supported image sizes per model prefix. */
const IMAGE_MODEL_SIZE_SUPPORTED: Record<string, string[]> = {
  'agnes-image': ['1024x1024', '1024x768', '768x1024', '1280x720', '720x1280'],
  'doubao-seedream': ['1024x1024', '864x1152', '1152x864', '1280x720', '720x1280'],
  'minimax-image': ['1024x1024', '1024x768', '768x1024', '1280x720', '720x1280'],
  'qwen-image': ['1024x1024', '1024x768', '768x1024', '1280x720', '720x1280'],
}
const DEFAULT_IMAGE_SIZES = ['1024x1024', '1024x768', '768x1024', '1280x720', '720x1280']

function getImageSizeOptions(model: string): string[] {
  if (!model) return DEFAULT_IMAGE_SIZES
  const m = model.toLowerCase()
  for (const [prefix, sizes] of Object.entries(IMAGE_MODEL_SIZE_SUPPORTED)) {
    if (m.startsWith(prefix)) return [...sizes, ...DEFAULT_IMAGE_SIZES.filter(s => !sizes.includes(s))]
  }
  return DEFAULT_IMAGE_SIZES
}

// ═══════════════════════════════════════════════════════════════════════
// HTTP helpers
// ═══════════════════════════════════════════════════════════════════════

/** Read the full request body as a string. */
function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on('data', (chunk: Buffer) => chunks.push(chunk))
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
    req.on('error', reject)
  })
}

/**
 * Generic fetch with timeout and bounded retries.
 *
 * Agnes occasionally answers 5xx with "请求上游失败，请稍后重试" — a transient
 * upstream hiccup that succeeds on retry. Only clearly transient failures are
 * retried, and only when the caller says the call is safe to repeat:
 *   - network/abort errors (the request never produced a result)
 *   - 5xx / 429 for idempotent endpoints (e.g. image generation)
 * Video submission is deliberately NOT retried by default: a duplicate submit
 * would create a second task and burn quota.
 */
async function vendorFetch(
  url: string,
  opts: {
    method?: string
    headers?: Record<string, string>
    body?: string
    timeoutMs?: number
    retries?: number
  } = {},
): Promise<unknown> {
  const { timeoutMs = 120_000, retries = 0, ...fetchOpts } = opts
  const maxAttempts = Math.max(1, retries + 1)
  let lastError: Error = new Error('请求失败')

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)
    try {
      const resp = await fetch(url, { ...fetchOpts, signal: controller.signal })
      if (resp.ok) return await resp.json()

      const text = await resp.text().catch(() => '')
      const err = new Error(`API ${resp.status}: ${text.slice(0, 500)}`)
      const transient = resp.status >= 500 || resp.status === 429
      lastError = err
      if (!transient || attempt === maxAttempts - 1) throw err
    } catch (e) {
      const err = e instanceof Error ? e : new Error(String(e))
      lastError = err
      // Re-throw immediately when this is the final attempt.
      if (attempt === maxAttempts - 1) throw err
    } finally {
      clearTimeout(timer)
    }
    // Backoff: 1.2s, 2.4s, … keeps transient upstream hiccups recoverable.
    await new Promise(r => setTimeout(r, 1200 * Math.pow(2, attempt)))
  }
  throw lastError
}

// ═══════════════════════════════════════════════════════════════════════
// JSON helper
// ═══════════════════════════════════════════════════════════════════════

function jsonResponse(res: ServerResponse, status: number, data: unknown): void {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8' })
  res.end(JSON.stringify(data))
}

function textResponse(res: ServerResponse, status: number, text: string): void {
  res.writeHead(status, { 'content-type': 'text/plain; charset=utf-8' })
  res.end(text)
}

/**
 * Stream a local media file with HTTP Range support.
 * Ranges matter: without them the browser cannot seek in the generated video.
 */
function serveMediaFile(req: IncomingMessage, res: ServerResponse, file: string): void {
  let stat: ReturnType<typeof statSync>
  try {
    stat = statSync(file)
  } catch {
    textResponse(res, 404, 'media not found')
    return
  }
  if (!stat.isFile()) {
    textResponse(res, 404, 'media not found')
    return
  }
  const ext = file.slice(file.lastIndexOf('.')).toLowerCase()
  const type = ext === '.mp4' ? 'video/mp4'
    : ext === '.webm' ? 'video/webm'
    : ext === '.wav' ? 'audio/wav'
    : ext === '.mp3' ? 'audio/mpeg'
    : ext === '.png' ? 'image/png'
    : ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg'
    : 'application/octet-stream'

  const range = req.headers?.range
  if (typeof range === 'string') {
    const m = /bytes=(\d*)-(\d*)/.exec(range)
    if (m) {
      const start = m[1] === '' ? Math.max(0, stat.size - Number(m[2] || 0)) : Number(m[1])
      const end = m[2] === '' || m[1] === '' ? stat.size - 1 : Math.min(Number(m[2]), stat.size - 1)
      if (Number.isFinite(start) && start <= end && start < stat.size) {
        res.writeHead(206, {
          'content-type': type,
          'content-length': String(end - start + 1),
          'content-range': `bytes ${start}-${end}/${stat.size}`,
          'accept-ranges': 'bytes',
          'cache-control': 'no-cache',
        })
        createReadStream(file, { start, end }).pipe(res)
        return
      }
    }
  }

  res.writeHead(200, {
    'content-type': type,
    'content-length': String(stat.size),
    'accept-ranges': 'bytes',
    'cache-control': 'no-cache',
  })
  createReadStream(file).pipe(res)
}

// ═══════════════════════════════════════════════════════════════════════
// Plugin entry
// ═══════════════════════════════════════════════════════════════════════

/**
 * Mount the multi-vendor API proxy routes and agent announcement.
 */
export function apply(ctx: Context): void {
  // ── Restore drama tasks from disk ───────────────────────────────
  rehydrateDramas()
  rehydrateAnchors()

  // ── API endpoints ────────────────────────────────────────────────
  ctx.effect(
    () => {
      const handler = async (req: IncomingMessage, res: ServerResponse) => {
        const method = req.method ?? 'GET'
        const path = new URL(req.url ?? '/', 'http://dsh.invalid').pathname

        // CORS headers for browser fetch
        res.setHeader('Access-Control-Allow-Origin', '*')
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

        if (method === 'OPTIONS') {
          res.writeHead(204)
          res.end()
          return
        }

        // ── GET /agnes-studio/api/status — Key status for all vendors ───
        if (path === '/agnes-studio/api/status') {
          if (method !== 'GET' && method !== 'POST') {
            return textResponse(res, 405, 'method not allowed')
          }
          const vendors = await getKeyStatus(ctx)
          // Backward-compatible top-level fields (old clients check these)
          const agnesStatus = vendors.agnes ?? { configured: false, source: null }
          jsonResponse(res, 200, {
            configured: agnesStatus.configured,
            source: agnesStatus.source,
            vendors,
            platformUrl: AGNES_PLATFORM_URL,
          })
          return
        }

        // ── GET /agnes-studio/api/models — Available model options ──────
        if (path === '/agnes-studio/api/models') {
          if (method !== 'GET' && method !== 'POST') {
            return textResponse(res, 405, 'method not allowed')
          }
          jsonResponse(res, 200, {
            textModels: TEXT_MODEL_OPTIONS,
            imageModels: IMAGE_MODEL_OPTIONS,
            videoModels: VIDEO_MODEL_OPTIONS,
            imageSizes: DEFAULT_IMAGE_SIZES,
          })
          return
        }

        // ── POST /agnes-studio/api/config — Save config ─────────────────
        if (path === '/agnes-studio/api/config') {
          if (method !== 'POST') {
            return textResponse(res, 405, 'method not allowed')
          }
          try {
            const body = await readBody(req)
            const config = JSON.parse(body) as Record<string, unknown>
            // Config is stored client-side; this endpoint just validates it
            jsonResponse(res, 200, { ok: true, config })
          } catch (error) {
            const msg = error instanceof Error ? error.message : String(error)
            jsonResponse(res, 400, { error: msg })
          }
          return
        }

        // ── GET /agnes-studio/api/image-sizes — Sizes for a model ───────
        if (path === '/agnes-studio/api/image-sizes') {
          const url = new URL(req.url ?? '/', 'http://dsh.invalid')
          const model = url.searchParams.get('model') ?? ''
          jsonResponse(res, 200, { sizes: getImageSizeOptions(model) })
          return
        }

        // ── POST /agnes-studio/api/proxy — Multi-vendor proxy ───────────
        if (path === '/agnes-studio/api/proxy') {
          if (method !== 'POST') {
            return textResponse(res, 405, 'method not allowed')
          }

          try {
            const body = await readBody(req)
            const parsed = JSON.parse(body) as {
              endpoint?: string
              params?: Record<string, unknown>
              method?: string
              timeoutMs?: number
              vendor?: string
              model?: string
              baseUrl?: string
            }

            const { endpoint, params, timeoutMs, baseUrl: customUrl } = parsed

            if (!endpoint) {
              return textResponse(res, 400, 'missing endpoint')
            }

            // Resolve vendor: explicit > from model name > default agnes
            const vendor = parsed.vendor || getVendorFromModel(parsed.model || '')
            const apiKey = await resolveApiKeyForVendor(ctx, vendor)
            const baseUrl = getVendorBaseUrl(vendor, customUrl)

            // Join without duplicating the version segment (see buildUpstreamUrl)
            const url = buildUpstreamUrl(baseUrl, endpoint)

            const upstreamMethod = parsed.method === 'GET' ? 'GET' : 'POST'

            // Agnes intermittently answers 5xx ("请求上游失败，请稍后重试").
            // Image generation is safe to repeat, so it gets retries; a video
            // submit is not (a duplicate would create a second task/quota hit).
            const isImageGen = /\/images\/generations/.test(endpoint)
            const isVideoSubmit = /\/videos\/?$/.test(endpoint) && upstreamMethod === 'POST'
            const retries = isVideoSubmit ? 0 : (isImageGen ? 3 : (upstreamMethod === 'GET' ? 2 : 0))

            const result = await vendorFetch(url, {
              method: upstreamMethod,
              headers: {
                Authorization: `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
              },
              body: upstreamMethod === 'GET' ? undefined : JSON.stringify(params || {}),
              timeoutMs: timeoutMs || 120_000,
              retries,
            })

            jsonResponse(res, 200, result)
          } catch (error) {
            const msg = error instanceof Error ? error.message : String(error)
            jsonResponse(res, 502, { error: msg })
          }
          return
        }

        // ── Drama pipeline API ──────────────────────────────────────────
        if (path.startsWith('/agnes-studio/api/drama')) {
          try {
            const body = method === 'POST' ? JSON.parse(await readBody(req)) : {}
            const dramaHost: DramaHost = {
              resolveKey: async (vendor: string) => {
                if (vendor === 'ollama') return 'ollama'
                return resolveApiKeyForVendor(ctx, vendor)
              },
              call: async (vendor, endpoint, opts = {}) => {
                const apiKey = await resolveApiKeyForVendor(ctx, vendor)
                const url = buildUpstreamUrl(getVendorBaseUrl(vendor), endpoint)
                const upstreamMethod = opts.method === 'GET' ? 'GET' : 'POST'
                return vendorFetch(url, {
                  method: upstreamMethod,
                  headers: {
                    Authorization: `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                  },
                  body: upstreamMethod === 'GET' ? undefined : JSON.stringify(opts.body ?? {}),
                  timeoutMs: opts.timeoutMs || 120_000,
                })
              },
              resolveCredential: async (name, envName) => {
                try {
                  const v = await ctx.credentials.resolve(name)
                  if (v && typeof v === 'string' && v.length > 0) return v
                } catch { /* fall through */ }
                if (process.env[envName]) return process.env[envName]!
                throw new Error(`未配置 ${envName}（凭据 ${name}）。`)
              },
            }
            const result = await handleDramaRoute(method, path, body, dramaHost)
            if (result) {
              jsonResponse(res, result.status, result.data)
              return
            }
          } catch (e) {
            jsonResponse(res, 500, { error: e instanceof Error ? e.message : String(e) })
            return
          }
        }

        // ── Talking-avatar (数字人口播) API ─────────────────────────────
        if (path.startsWith('/agnes-studio/api/anchor')) {
          try {
            const body = method === 'POST' ? JSON.parse(await readBody(req)) : {}
            const anchorHost: AnchorHost = {
              resolveTtsKey: async () => {
                try {
                  const v = await ctx.credentials.resolve('mimo-api-key')
                  if (v && typeof v === 'string' && v.length > 0) return v
                } catch { /* fall through */ }
                if (process.env.MIMO_API_KEY) return process.env.MIMO_API_KEY
                throw new Error('未配置 TTS 配音 Key：请在本机 .env 写入 MIMO_API_KEY=... 或在 DSH 凭据中新增 mimo-api-key。')
              },
              call: async (vendor, endpoint, opts = {}) => {
                const apiKey = await resolveApiKeyForVendor(ctx, vendor)
                const url = buildUpstreamUrl(getVendorBaseUrl(vendor), endpoint)
                const upstreamMethod = opts.method === 'GET' ? 'GET' : 'POST'
                return vendorFetch(url, {
                  method: upstreamMethod,
                  headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
                  body: upstreamMethod === 'GET' ? undefined : JSON.stringify(opts.body ?? {}),
                  timeoutMs: opts.timeoutMs || 120_000,
                })
              },
            }
            const result = await handleAnchorRoute(method, path, body, anchorHost)
            if (result) {
              jsonResponse(res, result.status, result.data)
              return
            }
          } catch (e) {
            jsonResponse(res, 500, { error: e instanceof Error ? e.message : String(e) })
            return
          }
        }

        // ── Media files (generated videos / final cuts) ────────────────
        //   /agnes-studio/api/media/anchor/:anchorId/:filename
        //   /agnes-studio/api/media/:dramaId/:filename
        if (path.startsWith('/agnes-studio/api/media/')) {
          const rest = path.slice('/agnes-studio/api/media/'.length)
          const parts = rest.split('/').map(decodeURIComponent)

          let file: string | null = null
          if (parts[0] === 'anchor' && parts.length >= 3) {
            file = resolveAnchorMedia(parts[1], parts.slice(2).join('/'))
          } else if (parts.length >= 2) {
            file = resolveDramaMedia(parts[0], parts.slice(1).join('/'))
          }

          if (!file) {
            textResponse(res, 404, 'media not found')
            return
          }
          serveMediaFile(req, res, file)
          return
        }

        // ── Novel cover helpers (解析 / 提示词) ────────────────────────
        if (path.startsWith('/agnes-studio/api/cover')) {
          try {
            const body = method === 'POST' ? JSON.parse(await readBody(req)) : {}
            const sub = path.slice('/agnes-studio/api/cover'.length).replace(/^\//, '')

            if (method === 'GET' && sub === 'styles') {
              jsonResponse(res, 200, { styles: COVER_STYLES.map(s => ({ key: s.key, name: s.name })) })
              return
            }
            if (method === 'POST' && sub === 'parse') {
              const result = analyzeNovelFile(String(body?.filename ?? 'novel.txt'), String(body?.content ?? ''))
              if (!result.ok) { jsonResponse(res, 400, { error: result.error }); return }
              jsonResponse(res, 200, { meta: result.meta })
              return
            }
            if (method === 'POST' && sub === 'build') {
              const meta = {
                title: String(body?.title ?? '').trim(),
                author: String(body?.author ?? '').trim(),
                summary: String(body?.summary ?? '').trim(),
                charCount: 0,
                source: '',
              }
              if (!meta.title) { jsonResponse(res, 400, { error: '缺少书名' }); return }
              jsonResponse(res, 200, {
                prompt: buildCoverPrompt(meta, String(body?.style ?? ''), String(body?.extra ?? '')),
              })
              return
            }
            jsonResponse(res, 404, { error: 'not found' })
          } catch (e) {
            jsonResponse(res, 500, { error: e instanceof Error ? e.message : String(e) })
          }
          return
        }

        // ── ffmpeg capability probe (drives the UI's setup hints) ──────
        if (path === '/agnes-studio/api/ffmpeg') {
          try {
            jsonResponse(res, 200, await ffmpegStatus())
          } catch (e) {
            jsonResponse(res, 200, { available: false, hint: e instanceof Error ? e.message : String(e) })
          }
          return
        }

        // ── 创作台（Oh Story 图形化）文件层 API ─────────────────────────
        // 不走 /oh-story/*（那套要 DSH sessionId，我们的槽位能否拿到未验证），
        // 改为：工作区清单读 DSH 注册表 + 其余操作显式传 root。
        if (path.startsWith('/agnes-studio/api/ohstory')) {
          try {
            const sub = path.slice('/agnes-studio/api/ohstory'.length).replace(/^\//, '')
            const q = new URL(req.url ?? '/', 'http://dsh.invalid')
            const root = q.searchParams.get('root') ?? ''

            if (method === 'GET' && sub === 'workspaces') {
              jsonResponse(res, 200, { workspaces: listDshWorkspaces(process.env.DSH_HOME) })
              return
            }
            if (method === 'GET' && sub === 'projects') {
              if (root === '') { jsonResponse(res, 400, { error: '缺少 root' }); return }
              jsonResponse(res, 200, { projects: detectCreativeProjects(root) })
              return
            }
            if (method === 'GET' && sub === 'list') {
              if (root === '') { jsonResponse(res, 400, { error: '缺少 root' }); return }
              jsonResponse(res, 200, { entries: listEntries(root, q.searchParams.get('rel') ?? '') })
              return
            }
            if (method === 'GET' && sub === 'file') {
              if (root === '') { jsonResponse(res, 400, { error: '缺少 root' }); return }
              const rel = q.searchParams.get('rel') ?? ''
              jsonResponse(res, 200, { rel, ...readText(root, rel) })
              return
            }
            if (method === 'POST' && sub === 'file') {
              const body = JSON.parse(await readBody(req))
              const bytes = writeText(String(body?.root ?? ''), String(body?.rel ?? ''), String(body?.content ?? ''))
              jsonResponse(res, 200, { ok: true, bytes })
              return
            }
            if (method === 'POST' && sub === 'project') {
              const body = JSON.parse(await readBody(req))
              const kind = body?.kind === 'short' ? 'short' : 'long'
              const dir = createProject(String(body?.root ?? ''), kind, String(body?.name ?? ''))
              jsonResponse(res, 200, { ok: true, dir })
              return
            }
            jsonResponse(res, 404, { error: '未知的创作台接口: ' + sub })
          } catch (e) {
            jsonResponse(res, 400, { error: e instanceof Error ? e.message : '创作台接口失败' })
          }
          return
        }

        // ── Prompt Expert API ──────────────────────────────────────────
        if (path.startsWith('/agnes-studio/api/prompt-expert')) {
          try {
            const expertResult = await handlePromptExpertRoute(
              method, path,
              method === 'POST' ? JSON.parse(await readBody(req)) : {},
              // `resolveApiKey` never existed — the reference threw inside the
              // handler and every prompt-expert call died as a bogus 401.
              (v: string) => (v === 'ollama' ? Promise.resolve('ollama') : resolveApiKeyForVendor(ctx, v)),
              getVendorFromModel,
            )
            if (expertResult) jsonResponse(res, expertResult.status, expertResult.data)
            else textResponse(res, 405, 'method not allowed')
          } catch (e) {
            jsonResponse(res, 500, { error: e instanceof Error ? e.message : String(e) })
          }
          return
        }

        // ── 404 catch-all ───────────────────────────────────────────────
        textResponse(res, 404, 'not found')
      }

      return ctx.webServer.register({
        kind: 'prefix',
        path: '/agnes-studio/api',
        handler,
      })
    },
    'dsh-agnes-studio: api-proxy',
  )

  // ── System prompt announcement ──────────────────────────────────────
  ctx.effect(
    () => ctx.systemPrompt.section({
      name: 'plugin:dsh-agnes-studio',
      order: SECTION_ORDER,
      text: AGNES_STUDIO_GUIDANCE,
    }),
    'dsh-agnes-studio: prompt section',
  )
}
