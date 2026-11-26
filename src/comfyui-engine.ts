/**
 * ComfyUI 客户端（仙宫云 / 自建都适用）。
 *
 * 契约与墨影 comfyui.py 一致，都是 ComfyUI 的标准 HTTP 接口：
 *   探活  GET  /system_stats
 *   扫模型 GET  /object_info
 *   出图  POST /prompt      （提交 workflow 图）
 *   轮询  GET  /history/{id}
 *   取图  GET  /view?filename=…&subfolder=…&type=output
 *
 * 鉴权：仙宫云实例要求 `Authorization: Bearer <token>`，同时也接受 `X-Access-Token`，
 * 两个都带上最省事。
 *
 * 默认 workflow 是最小可用的 SD 文生图（CheckpointLoaderSimple → CLIPTextEncode×2
 * → KSampler → VAEDecode → SaveImage），占位符 `{{prompt}} / {{negative}} / {{ckpt}} /
 * {{seed}} / {{steps}}` 可替换。
 */
import { mkdirSync, writeFileSync, existsSync, readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { dataRoot } from './ffmpeg.js'

/** ComfyUI 配置。 */
export interface ComfyConfig {
  /** 实例根地址，如 https://xxx.container.x-gpu.com */
  baseUrl: string
  /** 访问令牌（可空）。 */
  token: string
  /** 默认 checkpoint 名。 */
  checkpoint: string
}

/** 配置落盘路径。 */
export function comfyConfigPath(): string {
  return join(dataRoot(), 'comfyui', 'config.json')
}

/** 读配置。 */
export function loadComfyConfig(): ComfyConfig {
  try {
    const raw = JSON.parse(readFileSync(comfyConfigPath(), 'utf8')) as Partial<ComfyConfig>
    return {
      baseUrl: String(raw.baseUrl ?? ''),
      token: String(raw.token ?? ''),
      checkpoint: String(raw.checkpoint ?? ''),
    }
  } catch {
    return { baseUrl: '', token: '', checkpoint: '' }
  }
}

/** 写配置。 */
export function saveComfyConfig(config: ComfyConfig): void {
  const path = comfyConfigPath()
  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(path, JSON.stringify(config, null, 2), { encoding: 'utf8', mode: 0o600 })
}

/** 统一请求（带鉴权头与超时）。 */
async function comfyFetch(config: ComfyConfig, path: string, init: RequestInit = {}, timeoutMs = 30_000): Promise<Response> {
  if (config.baseUrl === '') throw new Error('还没有配置 ComfyUI 地址')
  const url = `${config.baseUrl.replace(/\/+$/, '')}${path}`
  const headers: Record<string, string> = { ...(init.headers as Record<string, string> | undefined) }
  if (config.token !== '') {
    headers.Authorization = `Bearer ${config.token}`
    headers['X-Access-Token'] = config.token
  }
  const ac = new AbortController()
  const timer = setTimeout(() => ac.abort(), timeoutMs)
  try {
    return await fetch(url, { ...init, headers, signal: ac.signal })
  } finally {
    clearTimeout(timer)
  }
}

/** 探活 + 环境信息。 */
export async function comfyStatus(config: ComfyConfig): Promise<{ ok: boolean; detail: string; devices?: unknown }> {
  try {
    const resp = await comfyFetch(config, '/system_stats')
    if (!resp.ok) return { ok: false, detail: `HTTP ${resp.status}` }
    const data = await resp.json() as { devices?: unknown; system?: { comfyui_version?: string } }
    const version = data.system?.comfyui_version ?? 'unknown'
    return { ok: true, detail: `连接正常（ComfyUI ${version}）`, devices: data.devices }
  } catch (error) {
    return { ok: false, detail: `连接失败：${error instanceof Error ? error.message : String(error)}` }
  }
}

/** 列出可用的 checkpoint 名称。 */
export async function comfyCheckpoints(config: ComfyConfig): Promise<string[]> {
  const resp = await comfyFetch(config, '/object_info/CheckpointLoaderSimple', {}, 20_000)
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`)
  const data = await resp.json() as {
    CheckpointLoaderSimple?: { input?: { required?: { ckpt_name?: unknown[][] } } }
  }
  const list = data.CheckpointLoaderSimple?.input?.required?.ckpt_name?.[0]
  return Array.isArray(list) ? list.map(String) : []
}

/** 默认最小 workflow（可被配置覆盖）。 */
export function defaultWorkflow(prompt: string, negative: string, checkpoint: string, seed: number, steps = 20): Record<string, unknown> {
  return {
    '3': { class_type: 'KSampler', inputs: { seed, steps, cfg: 7, sampler_name: 'euler', scheduler: 'normal', denoise: 1, model: ['4', 0], positive: ['6', 0], negative: ['7', 0], latent_image: ['5', 0] } },
    '4': { class_type: 'CheckpointLoaderSimple', inputs: { ckpt_name: checkpoint } },
    '5': { class_type: 'EmptyLatentImage', inputs: { width: 1024, height: 1024, batch_size: 1 } },
    '6': { class_type: 'CLIPTextEncode', inputs: { text: prompt, clip: ['4', 1] } },
    '7': { class_type: 'CLIPTextEncode', inputs: { text: negative, clip: ['4', 1] } },
    '8': { class_type: 'VAEDecode', inputs: { samples: ['3', 0], vae: ['4', 2] } },
    '9': { class_type: 'SaveImage', inputs: { filename_prefix: 'agnes', images: ['8', 0] } },
  }
}

/** 生成结果。 */
export interface ComfyResult {
  ok: boolean
  /** 抓回本地的文件路径列表。 */
  files: string[]
  detail: string
}

/**
 * 跑一次文生图。
 *
 * @param config - ComfyUI 配置。
 * @param prompt - 正向提示词。
 * @param options - 负面词、种子、步数、超时。
 * @returns 抓回本地的图片路径。
 */
export async function comfyGenerate(
  config: ComfyConfig,
  prompt: string,
  options: { negative?: string; seed?: number; steps?: number; timeoutMs?: number } = {},
): Promise<ComfyResult> {
  const seed = options.seed ?? Math.floor(Math.random() * 1_000_000_000)
  const workflow = defaultWorkflow(
    prompt,
    options.negative ?? '低质量, 模糊, 水印',
    config.checkpoint,
    seed,
    options.steps ?? 20,
  )

  const submit = await comfyFetch(config, '/prompt', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: workflow }),
  }, 60_000)
  if (!submit.ok) {
    return { ok: false, files: [], detail: `提交失败 HTTP ${submit.status}：${(await submit.text()).slice(0, 200)}` }
  }
  const submitted = await submit.json() as { prompt_id?: string; error?: unknown }
  const promptId = submitted.prompt_id ?? ''
  if (promptId === '') return { ok: false, files: [], detail: `提交后没有 prompt_id：${JSON.stringify(submitted).slice(0, 200)}` }

  // 轮询 history 直到出现输出
  const deadline = Date.now() + (options.timeoutMs ?? 5 * 60 * 1000)
  const dir = join(dataRoot(), 'comfyui', 'out')
  mkdirSync(dir, { recursive: true })

  while (Date.now() < deadline) {
    await new Promise(r => setTimeout(r, 3000))
    const histResp = await comfyFetch(config, `/history/${encodeURIComponent(promptId)}`, {}, 30_000)
    if (!histResp.ok) continue
    const history = await histResp.json() as Record<string, { outputs?: Record<string, { images?: Array<{ filename: string; subfolder: string; type: string }> }> }>
    const entry = history[promptId]
    if (entry === undefined) continue
    const images = Object.values(entry.outputs ?? {}).flatMap(output => output.images ?? [])
    if (images.length === 0) continue

    const files: string[] = []
    for (const image of images) {
      const viewUrl = `/view?filename=${encodeURIComponent(image.filename)}&subfolder=${encodeURIComponent(image.subfolder)}&type=${encodeURIComponent(image.type)}`
      const viewResp = await comfyFetch(config, viewUrl, {}, 120_000)
      if (!viewResp.ok) continue
      const buffer = Buffer.from(await viewResp.arrayBuffer())
      const target = join(dir, `${promptId}-${image.filename}`)
      writeFileSync(target, buffer)
      files.push(target)
    }
    if (files.length > 0) return { ok: true, files, detail: `${files.length} 张已保存` }
  }
  return { ok: false, files: [], detail: '等待出图超时' }
}

/** 功能是否已配置（面板据此显示"未配置/可用"）。 */
export function comfyConfigured(config: ComfyConfig): boolean {
  return config.baseUrl !== '' && existsSync(comfyConfigPath())
}
