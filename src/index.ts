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
import { handleDramaRoute, rehydrateDramas } from './drama-engine.js'
import { handlePromptExpertRoute, generatePromptExpert, EXPERT_TYPES } from './prompt-expert-engine.js'

// ═══════════════════════════════════════════════════════════════════════
// Constants
// ═══════════════════════════════════════════════════════════════════════

/** Stable cordis plugin name. */
export const name = 'agnes-studio'

/** Required services. */
export const inject = ['webServer', 'systemPrompt', 'credentials']

/** Model-facing announcement. */
const AGNES_STUDIO_GUIDANCE =
  '本机已安装 dsh-agnes-studio 插件（泡泡猫的影视工具）：侧边栏「🎬 泡泡猫的影视工具」入口打开影视工具面板（内部即 Agnes 创意工作站）。' +
  '能力：文生图、图生图、多图合成、文生视频、图生视频、剧本导入（.txt/.md/.json）、故事板编排。' +
  '多厂商支持：面板现已支持 Agnes / DeepSeek / Qwen / 豆包(Doubao) / MiniMax / Ollama 六大厂商的文本、图像和视频模型，' +
  '代理端点自动按模型名路由到对应厂商 API。' +
  '限制：面板为全局浮层，不影响对话框；API Key 由宿主进程读取，浏览器不接触。' +
  '首次使用需要对应厂商的 API Key：Agnes 在 https://platform.agnes-ai.cn 注册；' +
  '其他厂商各自的 Key 写入 .env（如 DEEPSEEK_API_KEY=sk-...）或 DSH 凭据（如 deepseek-api-key）。' +
  'Ollama 无需 Key，需本地运行 11434 端口。' +
  '用户提到「泡泡猫的影视工具 / Agnes 创意站 / 创意工作站 / 生图 / 生视频 / agnes studio」时即指本插件，可引导其从侧边栏入口打开。'

const SECTION_ORDER = 310

// ═══════════════════════════════════════════════════════════════════════
// Vendor routing
// ═══════════════════════════════════════════════════════════════════════

/** Vendor Base URL mapping. */
const VENDOR_BASE_URLS: Record<string, string> = {
  agnes: 'https://api.agnes-ai.cn/v1',
  deepseek: 'https://api.deepseek.com/v1',
  qwen: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
  doubao: 'https://ark.cn-beijing.volces.com/api/v3',
  minimax: 'https://api.minimaxi.com/v1',
  ollama: 'http://localhost:11434/v1',
}

/** Platform registration URL (Agnes). */
const AGNES_PLATFORM_URL = 'https://platform.agnes-ai.cn'

/**
 * Infer vendor from model name.
 * e.g. "deepseek-v4-flash" → "deepseek", "ollama:llama3" → "ollama"
 */
function getVendorFromModel(model: string): string {
  if (!model) return 'agnes'
  const m = model.toLowerCase()
  if (m.startsWith('ollama:')) return 'ollama'
  for (const prefix of Object.keys(VENDOR_BASE_URLS)) {
    if (prefix !== 'agnes' && m.startsWith(prefix)) return prefix
  }
  return 'agnes'
}

/** Get vendor base URL, with optional custom override. */
function getVendorBaseUrl(vendor: string, customUrl?: string): string {
  if (customUrl) return customUrl
  return VENDOR_BASE_URLS[vendor] || VENDOR_BASE_URLS.agnes
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

  // 3. Agnes universal key fallback (other vendors may share)
  if (vendor !== 'agnes') {
    try {
      const resolved = await ctx.credentials.resolve('agnes-api-key')
      if (resolved && typeof resolved === 'string' && resolved.length > 0) {
        return resolved
      }
    } catch { /* ignore */ }
    if (process.env.AGNES_API_KEY) return process.env.AGNES_API_KEY
  }

  throw new Error(
    `${vendor} API Key 未配置：请在本机 .env 写入 ${envKey}=... 或在 DSH 凭据(credentials)中新增 ${credentialKey}。` +
    (vendor === 'agnes' ? ` Agnes Key 也可在 ${AGNES_PLATFORM_URL} 注册获取。` : ''),
  )
}

/**
 * Get key configuration status for all vendors (never exposes actual keys).
 */
async function getKeyStatus(ctx: Context): Promise<Record<string, { configured: boolean; source: string | null }>> {
  const vendors = ['agnes', 'deepseek', 'qwen', 'doubao', 'minimax', 'ollama']
  const status: Record<string, { configured: boolean; source: string | null }> = {}

  for (const vendor of vendors) {
    if (vendor === 'ollama') {
      status[vendor] = { configured: true, source: 'built-in' }
      continue
    }
    // Check vendor-specific credential
    try {
      const resolved = await ctx.credentials.resolve(`${vendor}-api-key`)
      if (resolved && typeof resolved === 'string' && resolved.length > 0) {
        status[vendor] = { configured: true, source: 'credentials' }
        continue
      }
    } catch { /* ignore */ }
    // Check vendor-specific env
    if (process.env[`${vendor.toUpperCase()}_API_KEY`]) {
      status[vendor] = { configured: true, source: 'env' }
      continue
    }
    // Check Agnes universal fallback
    try {
      const resolved = await ctx.credentials.resolve('agnes-api-key')
      if (resolved && typeof resolved === 'string' && resolved.length > 0) {
        status[vendor] = { configured: true, source: 'agnes-fallback' }
        continue
      }
    } catch { /* ignore */ }
    if (process.env.AGNES_API_KEY) {
      status[vendor] = { configured: true, source: 'agnes-env-fallback' }
      continue
    }
    status[vendor] = { configured: false, source: null }
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

/** Generic fetch with timeout. */
async function vendorFetch(
  url: string,
  opts: { method?: string; headers?: Record<string, string>; body?: string; timeoutMs?: number } = {},
): Promise<unknown> {
  const { timeoutMs = 120_000, ...fetchOpts } = opts
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const resp = await fetch(url, { ...fetchOpts, signal: controller.signal })
    if (!resp.ok) {
      const text = await resp.text().catch(() => '')
      throw new Error(`API ${resp.status}: ${text.slice(0, 500)}`)
    }
    return await resp.json()
  } finally {
    clearTimeout(timer)
  }
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

// ═══════════════════════════════════════════════════════════════════════
// Plugin entry
// ═══════════════════════════════════════════════════════════════════════

/**
 * Mount the multi-vendor API proxy routes and agent announcement.
 */
export function apply(ctx: Context): void {
  // ── Restore drama tasks from disk ───────────────────────────────
  rehydrateDramas()

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

            // Normalize endpoint: ensure leading slash
            const ep = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
            const url = `${baseUrl}${ep}`

            const upstreamMethod = parsed.method === 'GET' ? 'GET' : 'POST'

            const result = await vendorFetch(url, {
              method: upstreamMethod,
              headers: {
                Authorization: `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
              },
              body: upstreamMethod === 'GET' ? undefined : JSON.stringify(params || {}),
              timeoutMs: timeoutMs || 120_000,
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
            const dramaResolveKey = async (vendor: string): Promise<string> => {
              if (vendor === 'ollama') return 'ollama'
              return resolveApiKeyForVendor(ctx, vendor)
            }
            const result = handleDramaRoute(method, path, body, dramaResolveKey)
            if (result) {
              jsonResponse(res, result.status, result.data)
              return
            }
          } catch (e) {
            jsonResponse(res, 500, { error: e instanceof Error ? e.message : String(e) })
            return
          }
        }

        // ── Prompt Expert API ──────────────────────────────────────────
        if (path.startsWith('/agnes-studio/api/prompt-expert')) {
          try {
            const expertResult = await handlePromptExpertRoute(
              method, path,
              method === 'POST' ? JSON.parse(await readBody(req)) : {},
              (v: string) => resolveApiKey(ctx),
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
