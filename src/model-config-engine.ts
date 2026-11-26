/**
 * 模型配置引擎（Host 端）—— 厂商密钥 / 自定义模型的**唯一可信来源**。
 *
 * 为什么需要它（对照墨影 AI 工场的 config.py）：
 *   墨影把模型配置集中在一个 config.json 里，派生四个能力：
 *     1. 每个厂商各自的 Key（`get_vendor_api_key`），优先级：自定义模型 → 厂商专用 → 全局
 *     2. 每个模型能算出自己的 Base URL（`get_vendor_base_url`），含 `/v1`，
 *        且用户手写的覆盖优先；
 *     3. 自定义模型（`get_custom_models`）本身带 base_url + key，可以接任何 OpenAI 兼容服务；
 *     4. 站点探测（`agnes_sites.base_url_for_key`）：同一家的国内站/国际站 Key 打不同的域名。
 *
 *   本插件原先只有「凭据 → 环境变量」两级，且厂商表写死在 vendors.ts，
 *   用户想接一个新的 OpenAI 兼容服务（例如中转站、本地 vLLM）无路可走。
 *
 * 本模块提供同样的四件事，但**密钥只落在宿主侧的文件里，永不回传浏览器**
 * （接口只返回打码后的形态）。
 *
 * 存储位置：`<系统临时目录>/dsh-agnes-studio/model-config.json`（与 ffmpeg 产物同根）。
 * 环境变量 `DSH_AGNES_STUDIO_CONFIG` 可覆盖路径（测试/多实例用）。
 */
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { dataRoot } from './ffmpeg.js'
import { VENDOR_BASE_URLS } from './vendors.js'

/** 模型类别。 */
export type ModelKind = 'text' | 'image' | 'video'

/** 一个用户自定义模型（自带端点与密钥）。 */
export interface CustomModelConfig {
  /** 模型 id，同时也是下拉框里的取值。 */
  id: string
  /** 显示名。 */
  name: string
  /** 类别。 */
  kind: ModelKind
  /** OpenAI 兼容端点基址（含 /v1）。 */
  baseUrl: string
  /** 该端点使用的密钥；Ollama 之类可以留空。 */
  apiKey?: string
  /** 归属厂商键（决定代理时的默认 header 行为），留空按 custom 处理。 */
  vendor?: string
}

/** 单厂商配置。 */
export interface VendorConfig {
  /** 覆盖默认 Base URL（例如国内站/国际站、或走中转）。 */
  baseUrl?: string
  /** 该厂商专用密钥。 */
  apiKey?: string
  /** 用户备注/站点标签，例如「国内站」「国际站」。 */
  note?: string
}

/** 持久化文件结构。 */
/** 按用途的默认模型（界面上「默认模型」那 5 个下拉）。 */
export interface CapabilityDefaults {
  text?: string
  vision?: string
  image?: string
  video?: string
  tts?: string
}

/** 只保留已知用途，且值必须是字符串。 */
function normalizeDefaults(raw: unknown): CapabilityDefaults {
  if (typeof raw !== 'object' || raw === null) return {}
  const input = raw as Record<string, unknown>
  const out: CapabilityDefaults = {}
  for (const key of ['text', 'vision', 'image', 'video', 'tts'] as const) {
    const value = input[key]
    if (typeof value === 'string' && value.trim() !== '') out[key] = value.trim()
  }
  return out
}

export interface ModelConfigFile {
  version: 1
  vendors: Record<string, VendorConfig>
  customModels: CustomModelConfig[]
  /** 每个用途用哪个模型；空表示走环境变量 / 内置兜底。 */
  defaults?: CapabilityDefaults
}

/** 浏览器可见的厂商视图（密钥打码）。 */
export interface VendorView {
  id: string
  label: string
  /** 生效中的 Base URL。 */
  baseUrl: string
  /** 是否为用户覆盖。 */
  baseUrlOverridden: boolean
  /** 是否已配置密钥。 */
  configured: boolean
  /** 密钥来源：file / credentials / env / built-in / none。 */
  source: string
  /** 打码后的密钥（sk-12****cd34），未配置为空串。 */
  maskedKey: string
  note: string
}

/** 厂商展示名。 */
const VENDOR_LABELS: Record<string, string> = {
  agnes: 'Agnes（泡泡猫官方）',
  deepseek: 'DeepSeek',
  qwen: '通义千问',
  doubao: '豆包 / 火山方舟',
  minimax: 'MiniMax',
  ollama: 'Ollama（本地）',
  custom: '自定义端点',
}

/** 已知厂商（顺序即界面顺序）。 */
export const KNOWN_VENDORS = ['agnes', 'deepseek', 'qwen', 'doubao', 'minimax', 'ollama'] as const

/** 配置文件的完整路径（每次现算，便于测试覆盖环境变量）。 */
export function configFilePath(): string {
  const override = process.env.DSH_AGNES_STUDIO_CONFIG
  if (override !== undefined && override !== '') return override
  return join(dataRoot(), 'model-config.json')
}

/** 读配置；文件不存在/读坏都回落成空配置，绝不让面板打不开。 */
export function loadModelConfig(): ModelConfigFile {
  const empty: ModelConfigFile = { version: 1, vendors: {}, customModels: [], defaults: {} }
  const path = configFilePath()
  if (!existsSync(path)) return empty
  try {
    const raw = JSON.parse(readFileSync(path, 'utf8')) as Partial<ModelConfigFile>
    return {
      version: 1,
      vendors: typeof raw.vendors === 'object' && raw.vendors !== null ? raw.vendors : {},
      customModels: Array.isArray(raw.customModels) ? raw.customModels : [],
      defaults: normalizeDefaults(raw.defaults),
    }
  } catch {
    return empty
  }
}

/** 写配置（自动建目录）。 */
export function saveModelConfig(config: ModelConfigFile): void {
  const path = configFilePath()
  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(path, JSON.stringify(config, null, 2), { encoding: 'utf8', mode: 0o600 })
}

/** 打码：保留前 4 后 4，中间固定 4 个星号；太短就整体打码。 */
export function maskKey(key: string | undefined): string {
  if (key === undefined || key === '') return ''
  if (key.length <= 10) return '****'
  return key.slice(0, 4) + '****' + key.slice(-4)
}

/** 该厂商当前生效的 Base URL（用户覆盖优先）。 */
export function vendorBaseUrl(config: ModelConfigFile, vendor: string): string {
  const override = config.vendors[vendor]?.baseUrl
  if (override !== undefined && override.trim() !== '') return override.trim().replace(/\/+$/, '')
  return VENDOR_BASE_URLS[vendor] ?? VENDOR_BASE_URLS.agnes
}

/** 按模型 id 找自定义模型配置。 */
export function findCustomModel(config: ModelConfigFile, modelId: string): CustomModelConfig | undefined {
  return config.customModels.find(m => m.id === modelId)
}

/**
 * 解析一次调用要用的密钥。
 *
 * 优先级（与墨影一致）：自定义模型自带 key → 配置文件里该厂商的 key →
 * DSH 凭据 `${vendor}-api-key` → 环境变量 `${VENDOR}_API_KEY` → 抛错。
 *
 * @param config - 已加载的配置。
 * @param vendor - 厂商键。
 * @param modelId - 模型 id（用于匹配自定义模型）。
 * @param resolveCredential - 读 DSH 凭据的回调；宿主没有该服务时传 undefined。
 */
export async function resolveKeyWithConfig(
  config: ModelConfigFile,
  vendor: string,
  modelId: string,
  resolveCredential?: (key: string) => Promise<string | undefined>,
): Promise<{ key: string; source: string }> {
  if (vendor === 'ollama') return { key: 'ollama', source: 'built-in' }

  const custom = findCustomModel(config, modelId)
  if (custom?.apiKey !== undefined && custom.apiKey !== '') {
    return { key: custom.apiKey, source: 'custom-model' }
  }

  const fromFile = config.vendors[vendor]?.apiKey
  if (fromFile !== undefined && fromFile !== '') return { key: fromFile, source: 'file' }

  if (resolveCredential !== undefined) {
    try {
      const resolved = await resolveCredential(`${vendor}-api-key`)
      if (typeof resolved === 'string' && resolved.length > 0) return { key: resolved, source: 'credentials' }
    } catch { /* 凭据服务可能没有这个键 */ }
  }

  const envKey = `${vendor.toUpperCase()}_API_KEY`
  const fromEnv = process.env[envKey]
  if (fromEnv !== undefined && fromEnv !== '') return { key: fromEnv, source: 'env' }

  throw new Error(
    `${vendor} API Key 未配置：可在「设置 → 模型配置」里直接填写并测试，` +
    `或在本机 .env 写入 ${envKey}=...，或在 DSH 凭据中新增 ${vendor}-api-key。`,
  )
}

/** 汇总厂商视图（给浏览器看，密钥全部打码）。 */
export async function describeVendors(
  config: ModelConfigFile,
  resolveCredential?: (key: string) => Promise<string | undefined>,
): Promise<VendorView[]> {
  const out: VendorView[] = []
  for (const vendor of KNOWN_VENDORS) {
    const saved = config.vendors[vendor]
    let source = 'none'
    let masked = ''
    if (vendor === 'ollama') {
      source = 'built-in'
      masked = ''
    } else if (saved?.apiKey !== undefined && saved.apiKey !== '') {
      source = 'file'
      masked = maskKey(saved.apiKey)
    } else if (resolveCredential !== undefined) {
      try {
        const resolved = await resolveCredential(`${vendor}-api-key`)
        if (typeof resolved === 'string' && resolved.length > 0) {
          source = 'credentials'
          masked = maskKey(resolved)
        }
      } catch { /* ignore */ }
    }
    if (source === 'none') {
      const envKey = `${vendor.toUpperCase()}_API_KEY`
      const envValue = process.env[envKey]
      if (envValue !== undefined && envValue !== '') {
        source = 'env'
        masked = maskKey(envValue)
      }
    }
    out.push({
      id: vendor,
      label: VENDOR_LABELS[vendor] ?? vendor,
      baseUrl: vendorBaseUrl(config, vendor),
      baseUrlOverridden: saved?.baseUrl !== undefined && saved.baseUrl.trim() !== '',
      configured: source !== 'none',
      source,
      maskedKey: masked,
      note: saved?.note ?? '',
    })
  }
  return out
}

/** 自定义模型的存储形状校验（也是接口入参校验）。 */
export function normalizeCustomModel(input: Partial<CustomModelConfig>): CustomModelConfig {
  const id = String(input.id ?? '').trim()
  if (id === '') throw new Error('模型 id 不能为空')
  if (!/^[\w.:\-/]{1,96}$/.test(id)) throw new Error('模型 id 只能包含字母、数字、点、冒号、横线和斜杠')
  const kind = (input.kind ?? 'text') as ModelKind
  if (kind !== 'text' && kind !== 'image' && kind !== 'video') throw new Error('kind 必须是 text / image / video')
  const baseUrl = String(input.baseUrl ?? '').trim()
  if (!/^https?:\/\//i.test(baseUrl)) throw new Error('Base URL 必须以 http:// 或 https:// 开头')
  return {
    id,
    name: String(input.name ?? id).trim() || id,
    kind,
    baseUrl: baseUrl.replace(/\/+$/, ''),
    apiKey: input.apiKey === undefined || input.apiKey === '' ? undefined : String(input.apiKey),
    vendor: input.vendor === undefined || input.vendor === '' ? 'custom' : String(input.vendor),
  }
}

/**
 * 探测一个端点是否可用：打 `/models`，失败再退回一次最小 chat 请求。
 *
 * 只做一次轻量请求，不消耗生成额度；结果只回 ok/失败原因，不回显密钥。
 */
export async function probeEndpoint(baseUrl: string, apiKey: string, model?: string, timeoutMs = 15_000): Promise<{ ok: boolean; detail: string }> {
  const base = baseUrl.replace(/\/+$/, '')
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (apiKey !== '' && apiKey !== 'ollama') headers.Authorization = `Bearer ${apiKey}`

  const attempt = async (url: string, init: RequestInit): Promise<Response | Error> => {
    const ac = new AbortController()
    const timer = setTimeout(() => ac.abort(), timeoutMs)
    try {
      return await fetch(url, { ...init, signal: ac.signal })
    } catch (error) {
      return error instanceof Error ? error : new Error(String(error))
    } finally {
      clearTimeout(timer)
    }
  }

  const listed = await attempt(`${base}/models`, { method: 'GET', headers })
  if (!(listed instanceof Error)) {
    if (listed.ok) {
      let count = 0
      try {
        const body = await listed.json() as { data?: unknown[] }
        count = Array.isArray(body.data) ? body.data.length : 0
      } catch { /* 有的服务 /models 返回非 JSON */ }
      return { ok: true, detail: count > 0 ? `连接正常，可见 ${count} 个模型` : '连接正常' }
    }
    if (listed.status === 401 || listed.status === 403) {
      return { ok: false, detail: `密钥被拒绝（HTTP ${listed.status}）` }
    }
    // 其余状态继续用 chat 兜底探测
  }

  const probeModel = model !== undefined && model !== '' ? model : 'gpt-3.5-turbo'
  const chat = await attempt(`${base}/chat/completions`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ model: probeModel, messages: [{ role: 'user', content: 'ping' }], max_tokens: 1 }),
  })
  if (chat instanceof Error) {
    return { ok: false, detail: `连接失败：${chat.message}` }
  }
  if (chat.ok) return { ok: true, detail: '连接正常（chat 探测通过）' }
  if (chat.status === 401 || chat.status === 403) return { ok: false, detail: `密钥被拒绝（HTTP ${chat.status}）` }
  if (chat.status === 404) return { ok: false, detail: '端点不存在（HTTP 404）：检查 Base URL 是否包含 /v1' }
  return { ok: false, detail: `上游返回 HTTP ${chat.status}` }
}
