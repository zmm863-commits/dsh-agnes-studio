/**
 * 短剧流水线引擎 — Host 端核心逻辑
 * 管理短剧任务的创建、状态、持久化和异步执行。
 */

import { randomUUID } from 'node:crypto'
import { mkdirSync, readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs'
import { join } from 'node:path'

// ─── 类型定义 ──────────────────────────────────────────────────────────────

export type DramaStatus =
  | 'started' | 'step1' | 'paused_story' | 'paused_script'
  | 'step2' | 'step3' | 'paused_assets' | 'step4'
  | 'paused_video' | 'merging' | 'completed' | 'failed' | 'stopped'

export interface DramaShot {
  shot_index: number; scene_desc: string; characters: string[]; action: string
  camera: string; camera_movement: { type: string; intent: string }
  dialogue?: string; prompt_en: string; transition: { type: string; description: string }
}

export interface DramaAsset {
  category: 'characters' | 'scenes' | 'props'; name: string; desc: string
  prompt_en?: string; img_prompt?: string; image_url?: string; local_file?: string
  status: 'pending' | 'generating' | 'done' | 'error'
}

export interface VideoResult {
  shot_index: number; status: 'pending' | 'generating' | 'completed' | 'failed'
  video_url?: string; error?: string; prompt?: string
}

export interface DramaTask {
  drama_id: string; prompt: string; status: DramaStatus; step: string; message: string
  story?: string; edited_story?: string; script?: string; edited_script?: string
  storyboard?: { shots: DramaShot[] }; shots?: DramaShot[]
  assets?: DramaAsset[]; video_results?: VideoResult[]
  text_model: string; image_model: string; video_model: string; shot_duration: number
  created_at: number; updated_at: number
}

// ─── 存储 ──────────────────────────────────────────────────────────────────

const dramaTasks = new Map<string, DramaTask>()
const runningDramas = new Set<string>()
const DRAMA_DIR = '/tmp/dsh-agnes-studio/dramas'

function getDramaPath(id: string): string {
  const dir = join(DRAMA_DIR, id); mkdirSync(dir, { recursive: true }); return join(dir, 'task.json')
}
function saveToDisk(task: DramaTask): void {
  try { writeFileSync(getDramaPath(task.drama_id), JSON.stringify(task, null, 2), 'utf8') } catch {}
}
function loadFromDisk(id: string): DramaTask | null {
  try { const p = getDramaPath(id); return existsSync(p) ? JSON.parse(readFileSync(p, 'utf8')) : null } catch { return null }
}
function updateTask(task: DramaTask, patch: Partial<DramaTask>): void {
  Object.assign(task, patch, { updated_at: Date.now() })
  dramaTasks.set(task.drama_id, task); saveToDisk(task)
}

// ─── Prompt 模板 ──────────────────────────────────────────────────────────

const STORY_PROMPT = '你是一位才华横溢的短剧作家。根据用户描述创作一个300～500字的故事梗概。要求：完整起承转合，场景有画面感，包含核心冲突和高潮。直接输出故事正文，不要标题。'
const SCRIPT_PROMPT = '你是专业短剧编剧。将故事1:1精准还原为专业短剧剧本。格式：每场以「编号 日/夜、内/外、场景名」开头，画面用「▲」，旁白用「vo：」。直接输出剧本。'
function storyboardPrompt(dur: number) {
  return `你是资深分镜师。将剧本转为分镜脚本，每镜约${dur}秒。动作拆分起势→发力→收势，标注运镜和转场。输出JSON：{"shots":[{"shot_index":1,"scene_desc":"画面描述","characters":[],"action":"起势→发力→收势","camera":"景别","camera_movement":{"type":"运镜","intent":"意图"},"dialogue":"","prompt_en":"English prompt","transition":{"type":"转场","description":"说明"}}]}`
}
const ASSETS_PROMPT = '从剧本和分镜提取角色/场景/道具的视觉特征。输出JSON：{"characters":[{"name":"","desc":"中文描述","prompt_en":"English for three-view"}],"scenes":[{"name":"","desc":"","prompt_en":""}],"props":[{"name":"","desc":"","prompt_en":""}]}'

// ─── 文本模型调用 ──────────────────────────────────────────────────────────

const VENDOR_URLS: Record<string, string> = {
  agnes: 'https://api.agnes-ai.cn/v1', deepseek: 'https://api.deepseek.com/v1',
  qwen: 'https://dashscope.aliuncs.com/compatible-mode/v1', doubao: 'https://ark.cn-beijing.volces.com/api/v3',
  minimax: 'https://api.minimaxi.com/v1', ollama: 'http://localhost:11434/v1',
}

function getVendor(model: string): string {
  if (!model) return 'agnes'; const m = model.toLowerCase()
  if (m.startsWith('ollama:')) return 'ollama'
  for (const p of Object.keys(VENDOR_URLS)) { if (p !== 'agnes' && m.startsWith(p)) return p }
  return 'agnes'
}

async function callTextModel(sysPrompt: string, userPrompt: string, apiKey: string, model: string, maxTokens = 4096): Promise<string> {
  const baseUrl = VENDOR_URLS[getVendor(model)] || VENDOR_URLS.agnes
  const ac = new AbortController(); const t = setTimeout(() => ac.abort(), 300_000)
  try {
    const r = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST', signal: ac.signal,
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, messages: [{ role: 'system', content: sysPrompt }, { role: 'user', content: userPrompt }], max_tokens: maxTokens, temperature: 0.7 }),
    })
    if (!r.ok) throw new Error(`API ${r.status}: ${(await r.text()).slice(0, 300)}`)
    const res = await r.json() as any; return res.choices?.[0]?.message?.content || ''
  } finally { clearTimeout(t) }
}

// ─── JSON 解析 ────────────────────────────────────────────────────────────

function parseJson(text: string): any {
  let c = text.replace(/<think>[\s\S]*?<\/think>/g, '').trim()
  if (c.startsWith('```')) { const lines = c.split('\n'); let end = lines.length; for (let i = lines.length - 1; i > 0; i--) { if (lines[i].trim().startsWith('```')) { end = i; break } } c = lines.slice(1, end).join('\n').trim() }
  try { return JSON.parse(c) } catch {} const i = c.indexOf('{'); if (i > 0) { try { return JSON.parse(c.slice(i)) } catch {} } return null
}

// ─── 等待机制 ──────────────────────────────────────────────────────────────

function waitConfirm(task: DramaTask, expected: string): Promise<void> {
  return new Promise(resolve => { const check = () => { if (task.status !== expected || task.status === 'stopped' || task.status === 'failed') { resolve(); return }; setTimeout(check, 1000) }; check() })
}
function waitAllVideos(task: DramaTask): Promise<void> {
  return new Promise(resolve => { const check = () => { if (task.status === 'stopped' || task.status === 'failed') { resolve(); return }; const vr = task.video_results || []; if (vr.length > 0 && vr.every(r => r.status === 'completed' || r.status === 'failed')) { resolve(); return }; setTimeout(check, 3000) }; check() })
}

// ─── 流水线 ────────────────────────────────────────────────────────────────

async function runPipeline(task: DramaTask, apiKey: string, startStep?: string): Promise<void> {
  const model = task.text_model
  try {
    let scriptText = task.script || ''

    // ── 如果是导入模式（startStep='script' 且已有剧本），跳过故事+剧本 ──
    if (startStep === 'script' && scriptText) {
      updateTask(task, { status: 'step2', step: 'step2', message: '已导入剧本，正在生成分镜...' })
    } else {
      // Step 1: 故事梗概
      updateTask(task, { status: 'step1', step: 'step1', message: '正在创作故事梗概...' })
      const story = await callTextModel(STORY_PROMPT, `请根据以下描述创作一个300～500字的短剧故事：\n${task.prompt}`, apiKey, model, 4096)
      updateTask(task, { story, status: 'paused_story', message: '故事梗概已生成，请确认' })
      await waitConfirm(task, 'paused_story')
      if (task.status === 'stopped' || task.status === 'failed') return

      // Step 1b: 剧本
      updateTask(task, { status: 'step2', message: '正在生成剧本...' })
      scriptText = await callTextModel(SCRIPT_PROMPT, `请将以下故事改编为专业短剧剧本：\n${task.edited_story || task.story || ''}`, apiKey, model, 16384)
      updateTask(task, { script: scriptText, status: 'paused_script', message: '剧本已生成，请确认' })
      await waitConfirm(task, 'paused_script')
      if (task.status === 'stopped' || task.status === 'failed') return
      scriptText = task.edited_script || task.script || scriptText
    }

    // Step 2: 分镜
    updateTask(task, { status: 'step2', step: 'step2', message: '正在生成分镜...' })
    const sbText = await callTextModel(storyboardPrompt(task.shot_duration), `请将以下剧本改写为分镜脚本：\n${task.edited_script || scriptText}`, apiKey, model, 16384)
    const sb = parseJson(sbText); const shots: DramaShot[] = sb?.shots || []
    updateTask(task, { storyboard: { shots }, shots, status: 'step3', message: `分镜完成，共 ${shots.length} 个镜头` })

    // Step 3: 素材提取
    updateTask(task, { status: 'step3', message: '正在提取素材...' })
    const aText = await callTextModel(ASSETS_PROMPT, `请从以下内容提取角色/场景/道具：\n剧本：${task.script || ''}\n分镜：${JSON.stringify({ shots })}`, apiKey, model, 16384)
    const aData = parseJson(aText); const allAssets: DramaAsset[] = []
    for (const cat of ['characters', 'scenes', 'props'] as const) { for (const item of (aData?.[cat] || [])) { allAssets.push({ category: cat, name: item.name || '', desc: item.desc || '', prompt_en: item.prompt_en || '', status: 'pending' }) } }
    updateTask(task, { assets: allAssets, status: 'paused_assets', message: `提取到 ${allAssets.length} 个素材，请确认` })
    await waitConfirm(task, 'paused_assets')
    if (task.status === 'stopped' || task.status === 'failed') return

    // Step 4: 视频生成准备
    const vr: VideoResult[] = shots.map(s => ({ shot_index: s.shot_index, status: 'pending' as const }))
    updateTask(task, { video_results: vr, status: 'paused_video', message: '素材已就绪，请逐个启动视频生成' })
    await waitAllVideos(task)
    updateTask(task, { status: 'completed', message: '短剧制作完成' })
  } catch (e) {
    if (task.status === 'stopped') return
    updateTask(task, { status: 'failed', message: `流水线失败: ${e instanceof Error ? e.message : String(e)}` })
  } finally { runningDramas.delete(task.drama_id) }
}

// ─── 路由处理 ──────────────────────────────────────────────────────────────

export function handleDramaRoute(method: string, urlPath: string, body: any, resolveApiKey: (v: string) => Promise<string>): { status: number; data: any } | null {
  const dp = urlPath.replace(/^\/agnes-studio\/api\/?/, '').replace(/^drama\/?/, '')

  if (method === 'POST' && dp === 'start') {
    const id = randomUUID().slice(0, 12)
    const task: DramaTask = { drama_id: id, prompt: body.prompt || '', status: 'started', step: '', message: '正在启动...', text_model: body.text_model || 'agnes-3.0-flash', image_model: body.image_model || 'agnes-image-2.5-flash', video_model: body.video_model || 'agnes-video-2.5-flash', shot_duration: body.shot_duration || 5, created_at: Date.now(), updated_at: Date.now() }
    dramaTasks.set(id, task); saveToDisk(task)
    resolveApiKey(getVendor(task.text_model)).then(k => { runningDramas.add(id); runPipeline(task, k) }).catch(e => updateTask(task, { status: 'failed', message: `API Key 获取失败: ${e}` }))
    return { status: 200, data: { drama_id: id, status: 'started' } }
  }

  // POST /drama/import — 导入已有剧本，跳过故事+剧本步骤，直接从分镜开始
  if (method === 'POST' && dp === 'import') {
    const id = randomUUID().slice(0, 12)
    const scriptContent = body.script || ''
    if (!scriptContent.trim()) return { status: 400, data: { error: '剧本内容为空' } }
    const task: DramaTask = {
      drama_id: id, prompt: body.prompt || scriptContent.slice(0, 100), status: 'started', step: '',
      message: '正在从导入的剧本生成分镜...',
      script: scriptContent, // 直接设置剧本，流水线会跳过故事+剧本步骤
      text_model: body.text_model || 'agnes-3.0-flash', image_model: body.image_model || 'agnes-image-2.5-flash',
      video_model: body.video_model || 'agnes-video-2.5-flash', shot_duration: body.shot_duration || 5,
      created_at: Date.now(), updated_at: Date.now(),
    }
    dramaTasks.set(id, task); saveToDisk(task)
    resolveApiKey(getVendor(task.text_model)).then(k => { runningDramas.add(id); runPipeline(task, k, 'script') }).catch(e => updateTask(task, { status: 'failed', message: `API Key 获取失败: ${e}` }))
    return { status: 200, data: { drama_id: id, status: 'started' } }
  }
  if (method === 'GET' && dp === 'list') return { status: 200, data: { tasks: Array.from(dramaTasks.values()).slice(0, 20) } }

  const parts = dp.split('/'); const id = parts[0]
  if (!id) return null
  let task = dramaTasks.get(id) || loadFromDisk(id)
  if (!task) return { status: 404, data: { error: '任务不存在' } }

  if (method === 'GET' && parts.length === 1) return { status: 200, data: task }
  if (method === 'POST' && parts[1] === 'stop') { updateTask(task, { status: 'stopped', message: '已停止' }); runningDramas.delete(id); return { status: 200, data: { ok: true } } }
  if (method === 'POST' && parts[1] === 'resume') { if (!runningDramas.has(id) && task.status !== 'failed' && task.status !== 'completed') { runningDramas.add(id); resolveApiKey(getVendor(task.text_model)).then(k => runPipeline(task, k)) } return { status: 200, data: { ok: true } } }
  if (method === 'POST' && parts[1] === 'confirm') {
    const { field, content, action, shot_index } = body
    if (field === 'story' && content) updateTask(task, { edited_story: content, story: content })
    else if (field === 'script' && content) updateTask(task, { edited_script: content, script: content })
    else if (field === 'assets' && action === 'approve') {
      // User approved assets → advance pipeline past paused_assets
      // The pipeline's waitConfirm detects status change from 'paused_assets'
      if (task.status === 'paused_assets') updateTask(task, { status: 'step4', message: '素材已确认，准备生成视频...' })
    }
    else if (field === 'video') {
      if (shot_index !== undefined) {
        // Start generating a single shot's video
        const vr = (task.video_results || []).find(r => r.shot_index === shot_index)
        if (vr) { vr.status = 'generating'; updateTask(task, { video_results: task.video_results }) }
      } else if (action === 'complete') {
        // All videos done → advance to completed
        if (task.status === 'paused_video') updateTask(task, { status: 'completed', message: '短剧制作完成' })
      }
    }
    return { status: 200, data: { ok: true } }
  }
  if (method === 'POST' && parts[1] === 'regenerate') { const { step } = body; if (step === 'story') updateTask(task, { story: undefined, edited_story: undefined, status: 'step1' }); else if (step === 'script') updateTask(task, { script: undefined, edited_script: undefined }); return { status: 200, data: { ok: true } } }
  return null
}

// ─── 启动恢复 ──────────────────────────────────────────────────────────────

export function rehydrateDramas(): void {
  try { if (!existsSync(DRAMA_DIR)) return; const dirs = readdirSync(DRAMA_DIR); let count = 0
    for (const d of dirs) { const t = loadFromDisk(d); if (!t) continue; dramaTasks.set(d, t); if (['started', 'step1', 'step2', 'step3', 'step4'].includes(t.status)) { updateTask(t, { status: 'failed', message: '进程重启导致中断' }); count++ } }
    if (count) console.log(`[短剧] 已恢复 ${count} 个历史任务`)
  } catch (e) { console.error('[短剧] 恢复失败:', e) }
}
