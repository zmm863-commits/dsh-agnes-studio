/**
 * 模型清单（前端）—— 内置 + 自定义 + 厂商在线返回，合并成一份可选列表。
 *
 * 【为什么要有这个】以前下拉里只有 `TEXT_MODEL_OPTIONS` 这种**写死在代码里**的
 * 列表，再加上用户自己登记的自定义模型。于是会出现两种困惑：
 *   · 面板写着"跟随默认"，但括号里是空的（宿主没返回生效值）；
 *   · 厂商那边其实还有别的模型，列表里却看不到。
 *
 * 现在改成三层合并：
 *   1. **内置**：宿主 /api/models 给的默认清单（保底，没有网络也能选）；
 *   2. **自定义**：设置里登记的那些（带（自定义）后缀）；
 *   3. **在线**：对每个"已配置密钥"的厂商调一次 GET /models，读真实返回。
 *      走的是插件已有的 proxy，不需要宿主重启；结果缓存 10 分钟。
 *
 * 在线那层失败（没 Key、网络不通、端点不支持 /models）就静默跳过 ——
 * 列表永远至少等于内置 + 自定义。
 */

/** 一个可选项。 */
export interface ModelOption {
  /** 模型 id。 */
  id: string
  /** 展示名。 */
  label: string
  /** 来源：内置 / 自定义 / 在线。 */
  source: 'builtin' | 'custom' | 'live'
  /** 在线来源的厂商（其他为空）。 */
  vendor?: string
}

/** 分类后的清单。 */
export interface ModelCatalog {
  text: ModelOption[]
  image: ModelOption[]
  video: ModelOption[]
  /** 各层贡献的数量（用于在界面上说明"这些是从哪来的"）。 */
  counts: { builtin: number; custom: number; live: number }
  /** 在线拉取失败的厂商与原因。 */
  failures: Array<{ vendor: string; reason: string }>
  /** 拉取时间戳。 */
  fetchedAt: number
}

/** 缓存（10 分钟）。 */
const TTL_MS = 10 * 60 * 1000
let cache: ModelCatalog | null = null
let inflight: Promise<ModelCatalog> | null = null

/** 判断模型属于哪一类（厂商不返回类型，只能按名字猜）。 */
export function classifyModel(id: string): 'text' | 'image' | 'video' {
  const name = id.toLowerCase()
  if (/video|veo|kling|wan2|sora|animate|cogvideo|hunyuan-video|seedance|seaweed/.test(name)) return 'video'
  if (/image|imagen|flux|stable-diffusion|sdxl|dall|midjourney|mj-|kolors|seedream|gpt-image/.test(name)) return 'image'
  return 'text'
}

/** 从 /models 的返回里抠出模型 id 列表（兼容三种常见形状）。 */
export function extractModelIds(payload: unknown): string[] {
  const data = (payload as { data?: unknown; models?: unknown }) ?? {}
  const list = Array.isArray(data.data) ? data.data : Array.isArray(data.models) ? data.models : Array.isArray(payload) ? payload : []
  const ids: string[] = []
  for (const item of list) {
    if (typeof item === 'string') ids.push(item)
    else if (item !== null && typeof item === 'object') {
      const record = item as { id?: unknown; name?: unknown; model?: unknown }
      const id = record.id ?? record.model ?? record.name
      if (typeof id === 'string' && id !== '') ids.push(id)
    }
  }
  return [...new Set(ids)]
}

/** 合并去重（在线 > 自定义 > 内置，同 id 保留靠前的来源）。 */
function mergeOptions(...groups: ModelOption[][]): ModelOption[] {
  const seen = new Set<string>()
  const out: ModelOption[] = []
  for (const group of groups) {
    for (const option of group) {
      if (seen.has(option.id)) continue
      seen.add(option.id)
      out.push(option)
    }
  }
  return out.sort((a, b) => a.id.localeCompare(b.id))
}

/**
 * 拉取完整清单。
 *
 * @param force - 忽略缓存重新拉取。
 */
export async function loadModelCatalog(force = false): Promise<ModelCatalog> {
  if (!force && cache !== null && Date.now() - cache.fetchedAt < TTL_MS) return cache
  if (inflight !== null && !force) return inflight

  inflight = (async (): Promise<ModelCatalog> => {
    const failures: Array<{ vendor: string; reason: string }> = []

    // ── 1. 宿主给的内置清单 + 自定义 ──
    let builtinText: Record<string, string> = {}
    let builtinImage: Record<string, string> = {}
    let builtinVideo: Record<string, string> = {}
    let customOptions: ModelOption[] = []
    try {
      const resp = await fetch('/agnes-studio/api/models')
      const data = await resp.json() as {
        textModels?: Record<string, string>
        imageModels?: Record<string, string>
        videoModels?: Record<string, string>
      }
      builtinText = data.textModels ?? {}
      builtinImage = data.imageModels ?? {}
      builtinVideo = data.videoModels ?? {}
    } catch { /* 内置清单拿不到就只显示在线/自定义 */ }

    try {
      const resp = await fetch('/agnes-studio/api/model-config')
      const data = await resp.json() as {
        customModels?: Array<{ id: string; name: string; kind: string }>
      }
      customOptions = (data.customModels ?? []).map(model => ({
        id: model.id,
        label: `${model.name}（自定义）`,
        source: 'custom' as const,
      }))
    } catch { /* 没有自定义模型 */ }

    const builtinTextOptions: ModelOption[] = Object.entries(builtinText).map(([id, label]) => ({ id, label, source: 'builtin' as const }))
    const builtinImageOptions: ModelOption[] = Object.entries(builtinImage).map(([id, label]) => ({ id, label, source: 'builtin' as const }))
    const builtinVideoOptions: ModelOption[] = Object.entries(builtinVideo).map(([id, label]) => ({ id, label, source: 'builtin' as const }))

    // ── 2. 在线：对每个配了 Key 的厂商读一次 /models ──
    const live: Record<'text' | 'image' | 'video', ModelOption[]> = { text: [], image: [], video: [] }
    try {
      const resp = await fetch('/agnes-studio/api/model-config')
      const data = await resp.json() as {
        vendors?: Array<{ id: string; label: string; configured: boolean }>
      }
      const configured = (data.vendors ?? []).filter(vendor => vendor.configured && vendor.id !== 'ollama')
      await Promise.all(configured.map(async vendor => {
        try {
          const probe = await fetch('/agnes-studio/api/proxy', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ endpoint: '/models', method: 'GET', vendor: vendor.id, timeoutMs: 15000 }),
          })
          if (!probe.ok) {
            failures.push({ vendor: vendor.id, reason: `HTTP ${probe.status}` })
            return
          }
          const payload = await probe.json() as unknown
          const ids = extractModelIds(payload)
          if (ids.length === 0) {
            failures.push({ vendor: vendor.id, reason: '端点没有返回模型列表' })
            return
          }
          for (const id of ids) {
            live[classifyModel(id)].push({
              id,
              label: `${id}（${vendor.label}）`,
              source: 'live',
              vendor: vendor.id,
            })
          }
        } catch (error) {
          failures.push({ vendor: vendor.id, reason: error instanceof Error ? error.message : String(error) })
        }
      }))
    } catch { /* 没有厂商配置 */ }

    const catalog: ModelCatalog = {
      text: mergeOptions(live.text, customOptions.filter(model => !/image|video/.test(model.id)), builtinTextOptions),
      image: mergeOptions(live.image, [...customOptions], builtinImageOptions),
      video: mergeOptions(live.video, [...customOptions], builtinVideoOptions),
      counts: {
        builtin: builtinTextOptions.length + builtinImageOptions.length + builtinVideoOptions.length,
        custom: customOptions.length,
        live: live.text.length + live.image.length + live.video.length,
      },
      failures,
      fetchedAt: Date.now(),
    }
    cache = catalog
    return catalog
  })()

  try {
    return await inflight
  } finally {
    inflight = null
  }
}

/** 清掉缓存（下次强制刷新）。 */
export function clearModelCatalog(): void {
  cache = null
}
