/**
 * dsh-agnes-studio host half.
 *
 * Registers a JSON-RPC proxy endpoint so the client-side panel can call
 * Agnes AI APIs without exposing the API key to the browser. Also
 * announces the plugin to agents via a system-prompt section.
 *
 * Phase 2: Short-drama pipeline — async 5-step flow with file persistence.
 */

import type { Context } from '@deepseek-ai/cordis'
import type { IncomingMessage, ServerResponse } from 'node:http'
import type {} from '@deepseek-ai/dsh-host-webserver'
import type {} from '@deepseek-ai/dsh-system-prompt'
import type {} from '@deepseek-ai/dsh-credentials'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

/** Stable cordis plugin name. */
export const name = 'agnes-studio'

/** Required services. */
export const inject = ['webServer', 'systemPrompt', 'credentials']

/** Model-facing announcement. */
const AGNES_STUDIO_GUIDANCE =
  '本机已安装 dsh-agnes-studio 插件（泡泡猫的影视工具）：侧边栏「🎬 泡泡猫的影视工具」入口打开影视工具面板（内部即 Agnes 创意工作站）。能力：文生图（Image 2.5 Flash，免费）、图生图、多图合成、文生视频（Video 2.5 Flash，免费）、图生视频、剧本导入（.txt/.md/.json）、故事板编排、短剧流水线。限制：面板为全局浮层，不影响对话框；API Key 由宿主进程读取，浏览器不接触。首次使用需要在 https://platform.agnes-ai.cn 注册并创建 API Key，然后写入本机 .env 的 AGNES_API_KEY=sk-... 或在 DSH 凭据中新增 agnes-api-key（面板首屏会显示同样的注册指引按钮）。用户提到「泡泡猫的影视工具 / Agnes 创意站 / 创意工作站 / 生图 / 生视频 / agnes studio / 短剧流水线」时即指本插件，可引导其从侧边栏入口打开。'

const SECTION_ORDER = 310

/** Agnes API base URL. */
const AGNES_BASE = 'https://api.agnes-ai.cn'

/** Where a first-time user registers and creates an API key. */
const AGNES_PLATFORM_URL = 'https://platform.agnes-ai.cn'

/** Human-readable missing-key hint, reused by every failure path. */
const MISSING_KEY_HINT =
  `Agnes API Key 未配置：请先到 ${AGNES_PLATFORM_URL} 注册并创建 API Key，` +
  '然后在本机 .env 写入 AGNES_API_KEY=sk-... ，或在 DSH 凭据(credentials)中新增 agnes-api-key。'

/** Base directory for short-drama task persistence. */
const DRAMA_BASE_DIR = '/tmp/dsh-agnes-studio/dramas'

// ─── Drama Pipeline Types ──────────────────────────────────────────────

interface DramaTask {
  drama_id: string
  prompt: string
  status: DramaStatus
  step: string
  message: string
  // Text content
  story?: string
  script?: string
  storyboard?: { shots: any[] }
  shots?: any[]
  // Assets
  assets?: DramaAsset[]
  // Video results
  video_results?: VideoResult[]
  // Config
  text_model: string
  image_model: string
  video_model: string
  shot_duration: number
  // Timestamps
  created_at: number
  updated_at: number
}

type DramaStatus =
  | 'started'
  | 'step1'       // story generation
  | 'paused_story'
  | 'step2'       // script generation
  | 'paused_script'
  | 'step3'       // storyboard generation
  | 'paused_storyboard'
  | 'step4'       // asset extraction + image generation
  | 'paused_assets'
  | 'step5'       // video generation per shot
  | 'paused_video'
  | 'merging'
  | 'completed'
  | 'failed'
  | 'stopped'

interface DramaAsset {
  category: 'characters' | 'scenes' | 'props'
  name: string
  desc: string
  prompt_en?: string
  img_prompt?: string
  image_url?: string
  local_file?: string
  status: 'pending' | 'generating' | 'done' | 'error'
}

interface VideoResult {
  shot_index: number
  status: 'pending' | 'generating' | 'completed' | 'failed'
  video_url?: string
  error?: string
  prompt?: string
}

// ─── Vendor Text Model Helpers ──────────────────────────────────────────

/** Known vendor base URLs for OpenAI-compatible chat/completions. */
function getVendorBaseUrl(vendor: string): string {
  switch (vendor) {
    case 'openai': return 'https://api.openai.com/v1'
    case 'deepseek': return 'https://api.deepseek.com/v1'
    case 'siliconflow': return 'https://api.siliconflow.cn/v1'
    case 'zhipu': return 'https://open.bigmodel.cn/api/paas/v4'
    case 'moonshot': return 'https://api.moonshot.cn/v1'
    case 'qwen': return 'https://dashscope.aliyuncs.com/compatible-mode/v1'
    case 'ollama': return 'http://localhost:11434/v1'
    default: return 'https://api.openai.com/v1'
  }
}

/** Extract vendor string from a model name like "deepseek-chat" → "deepseek". */
function vendorFromModel(model: string): string {
  const lower = model.toLowerCase()
  if (lower.startsWith('deepseek')) return 'deepseek'
  if (lower.startsWith('gpt') || lower.startsWith('o1') || lower.startsWith('o3')) return 'openai'
  if (lower.startsWith('qwen')) return 'qwen'
  if (lower.startsWith('glm')) return 'zhipu'
  if (lower.startsWith('moonshot') || lower.startsWith('kimi')) return 'moonshot'
  if (lower.startsWith('internlm')) return 'siliconflow'
  return 'deepseek' // default for this plugin
}

/** Resolve API key for a text model vendor. Tries DSH credentials first, then env. */
async function resolveTextModelKey(ctx: Context, vendor: string): Promise<string> {
  // Try credentials service with vendor-specific key name
  const credNames = [`${vendor}-api-key`, 'text-model-api-key', 'llm-api-key']
  for (const name of credNames) {
    try {
      const resolved = await ctx.credentials.resolve(name)
      if (resolved && typeof resolved === 'string' && resolved.length > 0) return resolved
    } catch { /* continue */ }
  }
  // Try env vars
  const envNames = [`${vendor.toUpperCase().replace(/-/g, '_')}_API_KEY`, 'TEXT_MODEL_API_KEY', 'LLM_API_KEY']
  for (const name of envNames) {
    if (process.env[name]) return process.env[name]!
  }
  throw new Error(`文本模型 API Key 未配置（vendor: ${vendor}）。请在 DSH 凭据中新增 ${vendor}-api-key，或设置环境变量 ${vendor.toUpperCase()}_API_KEY。`)
}

/** Generic fetch with timeout (reusing agnesFetch pattern). */
async function vendorFetch(
  url: string,
  opts: { method?: string; headers?: Record<string, string>; body?: string; timeoutMs?: number } = {},
): Promise<unknown> {
  const { timeoutMs = 300_000, ...fetchOpts } = opts
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const resp = await fetch(url, { ...fetchOpts, signal: controller.signal })
    if (!resp.ok) {
      const text = await resp.text().catch(() => '')
      throw new Error(`Text API ${resp.status}: ${text.slice(0, 500)}`)
    }
    return await resp.json()
  } finally {
    clearTimeout(timer)
  }
}

/**
 * Call a text model's chat/completions endpoint.
 * Resolves API key automatically based on vendor.
 */
async function callTextModel(
  ctx: Context,
  systemPrompt: string,
  userPrompt: string,
  model: string,
  maxTokens: number = 4096,
): Promise<string> {
  const vendor = vendorFromModel(model)
  const apiKey = await resolveTextModelKey(ctx, vendor)
  const baseUrl = getVendorBaseUrl(vendor)

  const body: Record<string, unknown> = {
    model: vendor === 'ollama' ? 'qwen2.5:7b' : model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    max_tokens: maxTokens,
    temperature: 0.7,
  }

  const result = await vendorFetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
    timeoutMs: 300_000,
  }) as any

  return result.choices?.[0]?.message?.content || ''
}

// ─── JSON Parsing Helper ────────────────────────────────────────────────

/** Extract JSON from model output that may contain markdown fences or prose. */
function parseJsonFromText(text: string): any {
  // Remove any lingering <think>...</think> blocks
  let cleaned = text.replace(/<think>[\s\S]*?<\/think>/g, '').trim()

  // Try direct parse first
  try {
    return JSON.parse(cleaned)
  } catch { /* continue */ }

  // Try extracting from markdown code fence
  const fenceMatch = cleaned.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/)
  if (fenceMatch) {
    try {
      return JSON.parse(fenceMatch[1].trim())
    } catch { /* continue */ }
  }

  // Try finding first { ... } or [ ... ] block
  const jsonMatch = cleaned.match(/(\{[\s\S]*\}|\[[\s\S]*\])/)
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[1])
    } catch { /* continue */ }
  }

  throw new Error('无法从模型输出中解析 JSON')
}

// ─── Drama File Persistence ─────────────────────────────────────────────

async function ensureDir(dir: string): Promise<void> {
  await mkdir(dir, { recursive: true })
}

async function saveDramaTask(task: DramaTask): Promise<void> {
  const dir = join(DRAMA_BASE_DIR, task.drama_id)
  await ensureDir(dir)
  task.updated_at = Date.now()
  await writeFile(join(dir, 'task.json'), JSON.stringify(task, null, 2), 'utf8')
}

async function loadDramaTask(dramaId: string): Promise<DramaTask | null> {
  try {
    const raw = await readFile(join(DRAMA_BASE_DIR, dramaId, 'task.json'), 'utf8')
    return JSON.parse(raw) as DramaTask
  } catch {
    return null
  }
}

function generateDramaId(): string {
  return 'drama_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8)
}

// ─── Pipeline Step Functions ────────────────────────────────────────────

/**
 * Step 1: Generate a 300-500 word story from the user prompt.
 */
async function step1_generateStory(ctx: Context, task: DramaTask): Promise<void> {
  task.status = 'step1'
  task.step = 'story'
  task.message = '正在生成故事梗概...'
  await saveDramaTask(task)

  const systemPrompt = `你是一位专业的短剧编剧。根据用户提供的主题或创意，创作一个300-500字的短剧故事梗概。
要求：
1. 故事要有明确的起承转合
2. 包含2-3个主要角色
3. 有冲突和反转
4. 适合改编为短剧（每集1-3分钟）
5. 直接输出故事正文，不要加标题或编号`

  task.story = await callTextModel(ctx, systemPrompt, task.prompt, task.text_model)
  task.message = '故事梗概生成完成'
  await saveDramaTask(task)
}

/**
 * Step 2: Convert story into a professional script.
 */
async function step2_generateScript(ctx: Context, task: DramaTask): Promise<void> {
  task.status = 'step2'
  task.step = 'script'
  task.message = '正在生成剧本...'
  await saveDramaTask(task)

  const systemPrompt = `你是一位专业的短剧编剧。根据以下故事梗概，将其改编为专业的短剧剧本。
格式要求：
1. 每个场景用 "场景X：[地点] [时间]" 格式标注
2. 角色对白用 "角色名：对白内容" 格式
3. 括号内写动作/表情/语气指导
4. 总共8-15个场景
5. 每个场景控制在30-60秒演出时长
6. 直接输出剧本，不要加多余说明`

  const userPrompt = `故事梗概：\n${task.story}`
  task.script = await callTextModel(ctx, systemPrompt, userPrompt, task.text_model)
  task.message = '剧本生成完成'
  await saveDramaTask(task)
}

/**
 * Step 3: Convert script into JSON storyboard.
 */
async function step3_generateStoryboard(ctx: Context, task: DramaTask): Promise<void> {
  task.status = 'step3'
  task.step = 'storyboard'
  task.message = '正在生成分镜脚本...'
  await saveDramaTask(task)

  const systemPrompt = `你是一位专业的分镜师。根据以下短剧剧本，将其转换为JSON格式的分镜脚本。
输出格式（严格JSON）：
{
  "shots": [
    {
      "index": 1,
      "scene_name": "场景名称",
      "description": "镜头画面描述（中文）",
      "camera": "镜头运动（固定/推/拉/摇/跟/特写/全景等）",
      "duration": 3,
      "dialogue": "对白内容（如有）",
      "character": "出场角色",
      "emotion": "情绪/氛围",
      "visual_prompt_en": "English prompt for image/video generation, describing the visual style, characters, lighting, composition. Include 'cinematic, high quality, 4k' style tags.",
      "motion_prompt_en": "English prompt for video motion/action description"
    }
  ]
}
要求：
1. 每个镜头3-5秒
2. visual_prompt_en 要详细描述画面内容，适合AI图片生成
3. motion_prompt_en 要描述动作和运动，适合AI视频生成
4. 只输出JSON，不要任何其他文字`

  const userPrompt = `剧本：\n${task.script}`
  const rawResponse = await callTextModel(ctx, systemPrompt, userPrompt, task.text_model, 8192)

  try {
    const parsed = parseJsonFromText(rawResponse)
    task.storyboard = { shots: parsed.shots || parsed }
    task.shots = task.storyboard!.shots
  } catch (e) {
    // If parsing fails, wrap raw text as a single shot for manual editing
    task.storyboard = {
      shots: [{
        index: 1,
        description: rawResponse,
        visual_prompt_en: '',
        motion_prompt_en: '',
        duration: task.shot_duration,
      }],
    }
    task.shots = task.storyboard.shots
  }

  task.message = '分镜脚本生成完成'
  await saveDramaTask(task)
}

/**
 * Step 4: Extract assets (characters/scenes/props) and generate images.
 */
async function step4_generateAssets(ctx: Context, task: DramaTask): Promise<void> {
  task.status = 'step4'
  task.step = 'assets'
  task.message = '正在提取和生成素材...'
  await saveDramaTask(task)

  // 4a: Extract asset list from storyboard
  const systemPrompt = `你是一位视觉设计师。根据以下分镜脚本，提取所有需要的视觉素材（角色、场景、道具）。
输出格式（严格JSON）：
{
  "assets": [
    {
      "category": "characters|scenes|props",
      "name": "素材名称",
      "desc": "详细描述",
      "img_prompt": "English prompt for AI image generation. Detailed visual description for consistency. Include 'character design, concept art, white background' for characters or 'environment concept art, cinematic lighting' for scenes."
    }
  ]
}
要求：
1. 合并同一角色的不同镜头为一个素材
2. 每个素材只出现一次
3. img_prompt 为英文，适合AI图片生成
4. 只输出JSON，不要其他文字`

  const userPrompt = `分镜：\n${JSON.stringify(task.shots, null, 2)}`
  const rawResponse = await callTextModel(ctx, systemPrompt, userPrompt, task.text_model, 8192)

  try {
    const parsed = parseJsonFromText(rawResponse)
    task.assets = (parsed.assets || []).map((a: any) => ({
      category: a.category || 'props',
      name: a.name || '',
      desc: a.desc || '',
      img_prompt: a.img_prompt || '',
      status: 'pending' as const,
    }))
  } catch {
    task.assets = []
  }

  // 4b: Generate images for each asset via Agnes API
  const agnesApiKey = await resolveApiKey(ctx)

  for (let i = 0; i < task.assets!.length; i++) {
    const asset = task.assets![i]
    if (asset.status === 'done') continue
    asset.status = 'generating'
    task.message = `正在生成素材 ${i + 1}/${task.assets!.length}：${asset.name}`
    await saveDramaTask(task)

    try {
      const result = await agnesFetch(`${AGNES_BASE}/v1/images/generations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${agnesApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: task.image_model,
          prompt: asset.img_prompt,
          size: '2K',
          extra_body: { response_format: 'url' },
        }),
        timeoutMs: 120_000,
      }) as any

      const url = result?.data?.[0]?.url
      if (url) {
        asset.image_url = url
        asset.status = 'done'
      } else {
        asset.status = 'error'
      }
    } catch (e) {
      asset.status = 'error'
    }

    await saveDramaTask(task)
  }

  task.message = '素材生成完成'
  await saveDramaTask(task)
}

/**
 * Step 5: Generate video for each shot.
 */
async function step5_generateVideos(ctx: Context, task: DramaTask): Promise<void> {
  task.status = 'step5'
  task.step = 'video'
  task.message = '正在逐镜头生成视频...'
  await saveDramaTask(task)

  if (!task.video_results) {
    task.video_results = task.shots!.map((shot: any, i: number) => ({
      shot_index: i,
      status: 'pending' as const,
      prompt: shot.motion_prompt_en || shot.visual_prompt_en || '',
    }))
  }

  const agnesApiKey = await resolveApiKey(ctx)

  for (let i = 0; i < task.video_results!.length; i++) {
    const vr = task.video_results![i]
    if (vr.status === 'completed') continue
    vr.status = 'generating'
    task.message = `正在生成镜头 ${i + 1}/${task.video_results!.length} 的视频`
    await saveDramaTask(task)

    try {
      // Start video generation
      const startResult = await agnesFetch(`${AGNES_BASE}/v1/videos`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${agnesApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: task.video_model,
          prompt: vr.prompt,
          mode: 'text',
          seconds: String(task.shot_duration),
          size: '720P',
        }),
        timeoutMs: 120_000,
      }) as any

      const videoId = startResult?.video_id || startResult?.task_id || startResult?.id
      if (!videoId) {
        vr.status = 'failed'
        vr.error = '视频生成未返回 ID'
        await saveDramaTask(task)
        continue
      }

      // Poll until completed (max 10 minutes per shot)
      const deadline = Date.now() + 10 * 60 * 1000
      while (Date.now() < deadline) {
        await new Promise(r => setTimeout(r, 15_000)) // poll every 15s

        const pollResult = await agnesFetch(
          `${AGNES_BASE}/agnesapi?video_id=${encodeURIComponent(videoId)}&model_name=${task.video_model}`,
          {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${agnesApiKey}` },
            timeoutMs: 30_000,
          },
        ) as any

        const status = String(pollResult.status || '')
        if (status === 'completed') {
          const meta = pollResult.metadata as Record<string, unknown> | undefined
          vr.video_url = String(meta?.url || '')
          vr.status = 'completed'
          break
        }
        if (status === 'failed') {
          const err = pollResult.error as Record<string, unknown> | undefined
          vr.status = 'failed'
          vr.error = String(err?.message || '视频生成失败')
          break
        }
        // Still processing — update message
        task.message = `镜头 ${i + 1} 视频生成中... (${pollResult.progress || 0}%)`
        await saveDramaTask(task)
      }

      // Timeout check
      if (vr.status === 'generating') {
        vr.status = 'failed'
        vr.error = '视频生成超时'
      }
    } catch (e) {
      vr.status = 'failed'
      vr.error = e instanceof Error ? e.message : String(e)
    }

    await saveDramaTask(task)
  }

  task.message = '所有视频生成完成'
  await saveDramaTask(task)
}

// ─── Pipeline Runner (async, not blocking) ──────────────────────────────

/**
 * Execute the full drama pipeline asynchronously.
 * This runs detached from ctx.effect — fire-and-forget with file persistence.
 */
async function runDramaPipeline(ctx: Context, task: DramaTask): Promise<void> {
  try {
    // Step 1: Story
    if (['started', 'step1'].includes(task.status)) {
      await step1_generateStory(ctx, task)
      task.status = 'paused_story'
      task.message = '故事已生成，等待确认后继续...'
      await saveDramaTask(task)
    }

    // Step 2: Script (auto-continues if story was confirmed)
    if (task.status === 'step2') {
      await step2_generateScript(ctx, task)
      task.status = 'paused_script'
      task.message = '剧本已生成，等待确认后继续...'
      await saveDramaTask(task)
    }

    // Step 3: Storyboard
    if (task.status === 'step3') {
      await step3_generateStoryboard(ctx, task)
      task.status = 'paused_storyboard'
      task.message = '分镜已生成，等待确认后继续...'
      await saveDramaTask(task)
    }

    // Step 4: Assets
    if (task.status === 'step4') {
      await step4_generateAssets(ctx, task)
      task.status = 'paused_assets'
      task.message = '素材已生成，等待确认后继续...'
      await saveDramaTask(task)
    }

    // Step 5: Videos
    if (task.status === 'step5') {
      await step5_generateVideos(ctx, task)
      task.status = 'completed'
      task.message = '短剧流水线完成！'
      await saveDramaTask(task)
    }
  } catch (e) {
    task.status = 'failed'
    task.message = `流水线失败：${e instanceof Error ? e.message : String(e)}`
    await saveDramaTask(task)
  }
}

// ─── Agnes API Fetch (existing, kept for asset generation) ──────────────

/** Resolve the Agnes API key from credentials or env. */
async function resolveApiKey(ctx: Context): Promise<string> {
  try {
    const resolved = await ctx.credentials.resolve('agnes-api-key')
    if (resolved && typeof resolved === 'string' && resolved.length > 0) {
      return resolved
    }
  } catch { /* credentials service may not have the key */ }
  const envKey = process.env.AGNES_API_KEY
  if (envKey) return envKey
  throw new Error(MISSING_KEY_HINT)
}

/**
 * Report whether an API key is available, without ever exposing it.
 */
async function apiKeyStatus(ctx: Context): Promise<{ configured: boolean; source: 'credentials' | 'env' | null }> {
  try {
    const resolved = await ctx.credentials.resolve('agnes-api-key')
    if (resolved && typeof resolved === 'string' && resolved.length > 0) {
      return { configured: true, source: 'credentials' }
    }
  } catch { /* credentials service may not have the key */ }
  if (process.env.AGNES_API_KEY) return { configured: true, source: 'env' }
  return { configured: false, source: null }
}

/** Generic fetch with timeout. */
async function agnesFetch(
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
      throw new Error(`Agnes API ${resp.status}: ${text.slice(0, 500)}`)
    }
    return await resp.json()
  } finally {
    clearTimeout(timer)
  }
}

// ─── HTTP Helpers ───────────────────────────────────────────────────────

/** Read the full request body as a string. */
function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on('data', (chunk: Buffer) => chunks.push(chunk))
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
    req.on('error', reject)
  })
}

/** Send a JSON response. */
function sendJson(res: ServerResponse, status: number, data: unknown): void {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8' })
  res.end(JSON.stringify(data))
}

/** Send a plain text error. */
function sendError(res: ServerResponse, status: number, message: string): void {
  res.writeHead(status, { 'content-type': 'text/plain; charset=utf-8' })
  res.end(message)
}

// ─── Drama API Route Handlers ───────────────────────────────────────────

/**
 * POST /agnes-studio/api/drama/start — Start a new short-drama pipeline.
 */
async function handleDramaStart(ctx: Context, req: IncomingMessage, res: ServerResponse): Promise<void> {
  try {
    const body = await readBody(req)
    const parsed = JSON.parse(body) as {
      prompt?: string
      text_model?: string
      image_model?: string
      video_model?: string
      shot_duration?: number
    }

    if (!parsed.prompt) {
      sendError(res, 400, 'missing prompt')
      return
    }

    const dramaId = generateDramaId()
    const task: DramaTask = {
      drama_id: dramaId,
      prompt: parsed.prompt,
      status: 'started',
      step: 'init',
      message: '短剧流水线已启动',
      text_model: parsed.text_model || 'deepseek-chat',
      image_model: parsed.image_model || 'agnes-image-2.5-flash',
      video_model: parsed.video_model || 'agnes-video-2.5-flash',
      shot_duration: parsed.shot_duration || 5,
      created_at: Date.now(),
      updated_at: Date.now(),
    }

    await saveDramaTask(task)

    // Start pipeline in background (not awaited — fire and forget)
    runDramaPipeline(ctx, task).catch(() => { /* errors saved to task.json */ })

    sendJson(res, 200, { drama_id: dramaId, status: 'started' })
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    sendJson(res, 500, { error: msg })
  }
}

/**
 * GET /agnes-studio/api/drama/status/:id — Query drama task status.
 */
async function handleDramaStatus(_ctx: Context, _req: IncomingMessage, res: ServerResponse, dramaId: string): Promise<void> {
  const task = await loadDramaTask(dramaId)
  if (!task) {
    sendJson(res, 404, { error: 'drama not found' })
    return
  }

  sendJson(res, 200, {
    drama_id: task.drama_id,
    status: task.status,
    step: task.step,
    message: task.message,
    story: task.story,
    script: task.script,
    storyboard: task.storyboard,
    assets: task.assets,
    shots: task.shots,
    video_results: task.video_results,
    prompt: task.prompt,
    text_model: task.text_model,
    image_model: task.image_model,
    video_model: task.video_model,
    shot_duration: task.shot_duration,
    created_at: task.created_at,
    updated_at: task.updated_at,
  })
}

/**
 * POST /agnes-studio/api/drama/:id/stop — Stop a drama pipeline.
 */
async function handleDramaStop(_ctx: Context, _req: IncomingMessage, res: ServerResponse, dramaId: string): Promise<void> {
  const task = await loadDramaTask(dramaId)
  if (!task) {
    sendJson(res, 404, { error: 'drama not found' })
    return
  }

  task.status = 'stopped'
  task.message = '流水线已停止'
  await saveDramaTask(task)

  sendJson(res, 200, { drama_id: dramaId, status: 'stopped' })
}

/**
 * POST /agnes-studio/api/drama/:id/resume — Resume a paused pipeline.
 */
async function handleDramaResume(ctx: Context, _req: IncomingMessage, res: ServerResponse, dramaId: string): Promise<void> {
  const task = await loadDramaTask(dramaId)
  if (!task) {
    sendJson(res, 404, { error: 'drama not found' })
    return
  }

  // Map paused states to their next step
  const resumeMap: Partial<Record<DramaStatus, DramaStatus>> = {
    'paused_story': 'step2',
    'paused_script': 'step3',
    'paused_storyboard': 'step4',
    'paused_assets': 'step5',
    'paused_video': 'step5',
    'stopped': task.status, // keep current if stopped
  }

  const nextStatus = resumeMap[task.status]
  if (!nextStatus) {
    sendJson(res, 400, { error: `cannot resume from status: ${task.status}` })
    return
  }

  task.status = nextStatus
  task.message = '流水线已恢复...'
  await saveDramaTask(task)

  // Re-launch pipeline from current step
  runDramaPipeline(ctx, task).catch(() => { /* errors saved to task.json */ })

  sendJson(res, 200, { drama_id: dramaId, status: task.status })
}

/**
 * POST /agnes-studio/api/drama/:id/confirm — Confirm/edit content and advance.
 */
async function handleDramaConfirm(ctx: Context, req: IncomingMessage, res: ServerResponse, dramaId: string): Promise<void> {
  const task = await loadDramaTask(dramaId)
  if (!task) {
    sendJson(res, 404, { error: 'drama not found' })
    return
  }

  const body = await readBody(req)
  const parsed = JSON.parse(body) as {
    field?: string
    content?: string
    action?: string
    shot_index?: number
    asset_index?: number
  }

  if (parsed.field === 'story') {
    if (parsed.content) task.story = parsed.content
    task.status = 'step2'
    task.message = '故事已确认，正在生成剧本...'
    await saveDramaTask(task)
    runDramaPipeline(ctx, task).catch(() => { /* errors saved to task.json */ })
  } else if (parsed.field === 'script') {
    if (parsed.content) task.script = parsed.content
    task.status = 'step3'
    task.message = '剧本已确认，正在生成分镜...'
    await saveDramaTask(task)
    runDramaPipeline(ctx, task).catch(() => { /* errors saved to task.json */ })
  } else if (parsed.field === 'storyboard') {
    task.status = 'step4'
    task.message = '分镜已确认，正在生成素材...'
    await saveDramaTask(task)
    runDramaPipeline(ctx, task).catch(() => { /* errors saved to task.json */ })
  } else if (parsed.field === 'assets' && parsed.action === 'approve') {
    task.status = 'step5'
    task.message = '素材已确认，正在生成视频...'
    await saveDramaTask(task)
    runDramaPipeline(ctx, task).catch(() => { /* errors saved to task.json */ })
  } else if (parsed.field === 'video' && parsed.shot_index !== undefined) {
    // Regenerate a single shot's video
    if (task.video_results && task.video_results[parsed.shot_index]) {
      task.video_results[parsed.shot_index].status = 'pending'
      task.video_results[parsed.shot_index].error = undefined
      task.status = 'step5'
      task.message = `正在重新生成镜头 ${parsed.shot_index + 1} 的视频...`
      await saveDramaTask(task)
      runDramaPipeline(ctx, task).catch(() => { /* errors saved to task.json */ })
    }
  } else {
    sendJson(res, 400, { error: 'invalid confirm payload' })
    return
  }

  sendJson(res, 200, { drama_id: dramaId, status: task.status })
}

/**
 * POST /agnes-studio/api/drama/:id/regenerate — Re-run a specific step.
 */
async function handleDramaRegenerate(ctx: Context, req: IncomingMessage, res: ServerResponse, dramaId: string): Promise<void> {
  const task = await loadDramaTask(dramaId)
  if (!task) {
    sendJson(res, 404, { error: 'drama not found' })
    return
  }

  const body = await readBody(req)
  const parsed = JSON.parse(body) as {
    step?: string
    asset_index?: number
  }

  const stepMap: Record<string, DramaStatus> = {
    'story': 'step1',
    'script': 'step2',
    'storyboard': 'step3',
    'asset': 'step4',
    'video': 'step5',
  }

  const targetStatus = stepMap[parsed.step || '']
  if (!targetStatus) {
    sendJson(res, 400, { error: `invalid step: ${parsed.step}` })
    return
  }

  // If regenerating a specific asset, mark it as pending
  if (parsed.step === 'asset' && parsed.asset_index !== undefined && task.assets) {
    if (task.assets[parsed.asset_index]) {
      task.assets[parsed.asset_index].status = 'pending'
      task.assets[parsed.asset_index].image_url = undefined
    }
  }

  task.status = targetStatus
  task.message = `正在重新生成 ${parsed.step}...`
  await saveDramaTask(task)

  // Launch pipeline from that step
  runDramaPipeline(ctx, task).catch(() => { /* errors saved to task.json */ })

  sendJson(res, 200, { drama_id: dramaId, status: task.status })
}

// ─── Route Matching ─────────────────────────────────────────────────────

/** Match path against pattern like /agnes-studio/api/drama/:id/status */
function matchDramaRoute(path: string): { route: string; dramaId: string } | null {
  // /agnes-studio/api/drama/start
  if (path === '/agnes-studio/api/drama/start') {
    return { route: 'start', dramaId: '' }
  }

  // /agnes-studio/api/drama/:id/status
  const statusMatch = path.match(/^\/agnes-studio\/api\/drama\/([^/]+)\/status$/)
  if (statusMatch) {
    return { route: 'status', dramaId: statusMatch[1] }
  }

  // /agnes-studio/api/drama/:id/stop
  const stopMatch = path.match(/^\/agnes-studio\/api\/drama\/([^/]+)\/stop$/)
  if (stopMatch) {
    return { route: 'stop', dramaId: stopMatch[1] }
  }

  // /agnes-studio/api/drama/:id/resume
  const resumeMatch = path.match(/^\/agnes-studio\/api\/drama\/([^/]+)\/resume$/)
  if (resumeMatch) {
    return { route: 'resume', dramaId: resumeMatch[1] }
  }

  // /agnes-studio/api/drama/:id/confirm
  const confirmMatch = path.match(/^\/agnes-studio\/api\/drama\/([^/]+)\/confirm$/)
  if (confirmMatch) {
    return { route: 'confirm', dramaId: confirmMatch[1] }
  }

  // /agnes-studio/api/drama/:id/regenerate
  const regenMatch = path.match(/^\/agnes-studio\/api\/drama\/([^/]+)\/regenerate$/)
  if (regenMatch) {
    return { route: 'regenerate', dramaId: regenMatch[1] }
  }

  return null
}

// ─── Plugin Entry ───────────────────────────────────────────────────────

/**
 * Mount the API proxy route, drama pipeline routes, and agent announcement.
 */
export function apply(ctx: Context): void {
  // Ensure drama persistence directory exists on startup
  ensureDir(DRAMA_BASE_DIR).catch(() => { /* non-critical */ })

  // ── API proxy + drama pipeline endpoints ───────────────────────────
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

        // ── Key status (no upstream call, no key material) ──────────
        if (path === '/agnes-studio/api/status') {
          if (method !== 'GET' && method !== 'POST') {
            sendError(res, 405, 'method not allowed')
            return
          }
          const status = await apiKeyStatus(ctx)
          sendJson(res, 200, { ...status, platformUrl: AGNES_PLATFORM_URL })
          return
        }

        // ── Drama pipeline routes ───────────────────────────────────
        if (path.startsWith('/agnes-studio/api/drama/')) {
          const route = matchDramaRoute(path)
          if (!route) {
            sendError(res, 404, 'drama route not found')
            return
          }

          // Status allows GET; all others require POST
          if (route.route === 'status' && method !== 'GET') {
            sendError(res, 405, 'method not allowed')
            return
          }
          if (route.route !== 'status' && method !== 'POST') {
            sendError(res, 405, 'method not allowed')
            return
          }

          try {
            switch (route.route) {
              case 'start':
                await handleDramaStart(ctx, req, res)
                break
              case 'status':
                await handleDramaStatus(ctx, req, res, route.dramaId)
                break
              case 'stop':
                await handleDramaStop(ctx, req, res, route.dramaId)
                break
              case 'resume':
                await handleDramaResume(ctx, req, res, route.dramaId)
                break
              case 'confirm':
                await handleDramaConfirm(ctx, req, res, route.dramaId)
                break
              case 'regenerate':
                await handleDramaRegenerate(ctx, req, res, route.dramaId)
                break
            }
          } catch (error) {
            const msg = error instanceof Error ? error.message : String(error)
            sendJson(res, 502, { error: msg })
          }
          return
        }

        // ── Original proxy endpoint (POST only) ─────────────────────
        if (method !== 'POST') {
          sendError(res, 405, 'method not allowed')
          return
        }

        try {
          const body = await readBody(req)
          const parsed = JSON.parse(body) as {
            endpoint?: string
            params?: Record<string, unknown>
            method?: string
            timeoutMs?: number
          }

          const apiKey = await resolveApiKey(ctx)
          const { endpoint, params, timeoutMs } = parsed
          const upstreamMethod = parsed.method === 'GET' ? 'GET' : 'POST'

          if (!endpoint) {
            sendError(res, 400, 'missing endpoint')
            return
          }

          const url = `${AGNES_BASE}${endpoint}`
          const result = await agnesFetch(url, {
            method: upstreamMethod,
            headers: {
              Authorization: `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
            },
            body: upstreamMethod === 'GET' ? undefined : JSON.stringify(params || {}),
            timeoutMs: timeoutMs || 120_000,
          })

          sendJson(res, 200, result)
        } catch (error) {
          const msg = error instanceof Error ? error.message : String(error)
          sendJson(res, 502, { error: msg })
        }
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
