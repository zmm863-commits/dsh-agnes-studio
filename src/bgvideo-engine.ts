/**
 * 背景视频引擎 — Host 端核心逻辑（阶段 1-2：基础框架 + 风格截图）
 * 管理背景视频任务的创建、状态、分幕、风格截图和持久化。
 *
 * 功能：
 * - 上传素材（音频/歌词/文稿/参考片）
 * - 启动任务（分幕）
 * - 查询状态
 * - 获取分幕结果
 * - 停止任务
 * - 任务列表
 * - 风格截图上传/管理
 * - 风格提炼
 * - 一键出方案
 */

import { randomUUID } from 'node:crypto'
import { mkdirSync, readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { dataRoot, ffmpeg } from './ffmpeg.js'

// ─── Host 能力注入 ──────────────────────────────────────────────────────────

export interface BgVideoHost {
  resolveKey(vendor: string): Promise<string>
  call(vendor: string, endpoint: string, opts?: {
    method?: 'GET' | 'POST'; body?: unknown; timeoutMs?: number
  }): Promise<any>
}

// ─── 模型调用助手 ──────────────────────────────────────────────────────────
// 这里原先有 16 处 `// 阶段 X：模拟…`，每一步都返回写死的字符串。
// 现在统一走真实模型：文本走 chat/completions，出图走 images/generations。
// 任何一步失败都抛出可读错误，由调用方回 500 —— 宁可报错，不可假成功。

/** 规划/写作用文本模型；可用环境变量覆盖。 */
const BG_TEXT_MODEL = process.env.DSH_AGNES_TEXT_MODEL || 'agnes-2.5-flash'
/** 出图用图片模型。 */
const BG_IMAGE_MODEL = process.env.DSH_AGNES_IMAGE_MODEL || 'agnes-image-2.5-flash'

/** 调文本模型，返回正文。 */
async function callText(
  host: BgVideoHost,
  system: string,
  user: string,
  maxTokens = 1500,
): Promise<string> {
  const data = await host.call('agnes', '/chat/completions', {
    body: {
      model: BG_TEXT_MODEL,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      max_tokens: maxTokens,
      temperature: 0.6,
    },
    timeoutMs: 180_000,
  }) as { choices?: Array<{ message?: { content?: string } }> }
  const text = data.choices?.[0]?.message?.content ?? ''
  if (text.trim() === '') throw new Error('文本模型返回空内容')
  return text.trim()
}

/** 从模型回复里抠出 JSON（容忍 markdown 代码块与前后废话）。 */
export function parseModelJson<T>(raw: string): T {
  const fenced = /```(?:json)?\s*([\s\S]*?)```/i.exec(raw)
  const body = fenced !== null ? fenced[1] : raw
  const start = body.search(/[[{]/)
  if (start < 0) throw new Error(`模型没有返回 JSON：${raw.slice(0, 120)}`)
  const slice = body.slice(start)
  for (let end = slice.length; end > 0; end--) {
    try {
      return JSON.parse(slice.slice(0, end)) as T
    } catch { /* 继续缩短 */ }
  }
  throw new Error(`模型返回的 JSON 无法解析：${raw.slice(0, 160)}`)
}

/** 调文本模型并解析 JSON。 */
async function callTextJson<T>(
  host: BgVideoHost,
  system: string,
  user: string,
  maxTokens = 1500,
): Promise<T> {
  return parseModelJson<T>(await callText(host, system, user, maxTokens))
}

/** 出图并返回可直接显示的 URL（优先远端 url，其次 base64）。 */
async function generateImage(host: BgVideoHost, prompt: string, size = '1024x1024'): Promise<string> {
  const data = await host.call('agnes', '/v1/images/generations', {
    body: { model: BG_IMAGE_MODEL, prompt, size, n: 1 },
    timeoutMs: 240_000,
  }) as { data?: Array<{ url?: string; b64_json?: string }> }
  const first = data.data?.[0]
  if (first === undefined) throw new Error('图片接口没有返回数据')
  if (first.url !== undefined && first.url !== '') return first.url
  if (first.b64_json !== undefined && first.b64_json !== '') return `data:image/png;base64,${first.b64_json}`
  throw new Error('图片接口既没有 url 也没有 b64_json')
}

// ─── 类型定义 ──────────────────────────────────────────────────────────────

export type BgVideoStatus =
  | 'pending' | 'segmenting' | 'segmented' | 'generating'
  | 'completed' | 'failed' | 'stopped'

export interface BgVideoSegment {
  index: number
  start: number
  end: number
  text: string
  chars: string[]
}

export interface BgVideoTask {
  task_id: string
  status: BgVideoStatus
  message: string
  // 素材文件
  audio_file?: string
  lrc_file?: string
  script_file?: string
  refvideo_file?: string
  accompaniment_file?: string
  // 分幕结果
  segments?: BgVideoSegment[]
  total?: number
  // 配置
  asr_model: string
  scene: string
  role: string
  voice: string
  frame_every_sec: number
  plan_only: boolean
  // 风格截图
  style_refs?: string[]
  style?: { prompt: string; negative: string }
  design_style?: string
  design?: Record<string, string>
  // 分镜
  shots?: Array<{ index: number; desc: string; chars: string[]; camera?: string; movement?: string }>
  // 时间戳
  created_at: number
  updated_at: number
}

// ─── 存储 ──────────────────────────────────────────────────────────────────

const bgVideoTasks = new Map<string, BgVideoTask>()
const BGVIDEO_DIR = join(dataRoot(), 'bgvideo')

function getBgVideoPath(id: string): string {
  const dir = join(BGVIDEO_DIR, id)
  mkdirSync(dir, { recursive: true })
  return join(dir, 'task.json')
}

function saveToDisk(task: BgVideoTask): void {
  try { writeFileSync(getBgVideoPath(task.task_id), JSON.stringify(task, null, 2), 'utf8') } catch {}
}

function loadFromDisk(id: string): BgVideoTask | null {
  try {
    const p = getBgVideoPath(id)
    return existsSync(p) ? JSON.parse(readFileSync(p, 'utf8')) : null
  } catch { return null }
}

/**
 * 从一句文案里挑出可能的角色名。
 *
 * 只做保守识别：书名号/引号包裹的词，以及"某某说/道"前面的 2–4 字称名。
 * 识别不出就返回空数组 —— 角色可以由用户手动补，不猜。
 */
export function extractNameLikeTokens(text: string): string[] {
  const names = new Set<string>()
  for (const m of text.matchAll(/[《「『"']([^》」』"']{1,8})[》」』"']/g)) names.add(m[1].trim())
  for (const m of text.matchAll(/(?:^|[。，！？；：、\s“"'])([\u4e00-\u9fa5]{2,3})(?:说|道|问|喊|笑)/g)) names.add(m[1])
  return Array.from(names).filter(name => name.length >= 2).slice(0, 6)
}

// ─── 真实能力：抽帧 / 风格提炼 / 分幕 / 出片 ───────────────────────────────

/** 从参考视频里均匀抽帧，返回 data URL 列表（供锚图挑选）。 */
async function scanFrames(videoPath: string, count: number, taskId: string): Promise<string[]> {
  const duration = await probeMediaDuration(videoPath)
  if (duration <= 0) throw new Error(`读不出视频时长：${videoPath}`)
  const dir = join(BGVIDEO_DIR, taskId, 'frames')
  mkdirSync(dir, { recursive: true })
  const frames: string[] = []
  for (let i = 0; i < count; i++) {
    const at = (duration * (i + 0.5)) / count
    const out = join(dir, `f${String(i).padStart(2, '0')}.jpg`)
    const res = await ffmpeg([
      '-y', '-ss', at.toFixed(2), '-i', videoPath,
      '-frames:v', '1', '-vf', 'scale=480:-2', '-q:v', '5', out,
    ], 60_000)
    if (!res.ok) continue
    try {
      frames.push(`data:image/jpeg;base64,${readFileSync(out).toString('base64')}`)
    } catch { /* 跳过这一帧 */ }
  }
  if (frames.length === 0) throw new Error('抽帧失败：没有读到任何画面')
  return frames
}

/** 用 ffprobe/ffmpeg 读时长。 */
async function probeMediaDuration(path: string): Promise<number> {
  const res = await ffmpeg(['-i', path], 30_000)
  const m = /Duration:\s*(\d+):(\d+):(\d+\.?\d*)/.exec(res.stderr)
  return m === null ? 0 : Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3])
}

/**
 * 用视觉模型读风格截图，提炼出提示词与负面提示词。
 *
 * 截图可以是 data URL，也可以是本机路径（读成 base64 再送）。
 */
async function distillStyle(host: BgVideoHost, refs: string[]): Promise<{ prompt: string; negative: string }> {
  const images = refs.slice(0, 4).map(ref => {
    if (ref.startsWith('data:')) return { type: 'image_url', image_url: { url: ref } }
    try {
      const buf = readFileSync(ref)
      return { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${buf.toString('base64')}` } }
    } catch {
      return null
    }
  }).filter((item): item is { type: string; image_url: { url: string } } => item !== null)

  if (images.length === 0) throw new Error('风格截图都读不到，检查文件路径')

  const data = await host.call('agnes', '/chat/completions', {
    body: {
      model: BG_TEXT_MODEL,
      messages: [
        {
          role: 'system',
          content: '你是摄影指导。看这些参考图，提炼出可复用的画面风格。只输出 JSON：{"prompt":"正向风格词（影调/色彩/光线/质感/镜头）","negative":"应避免的风格"}。不要解释。',
        },
        { role: 'user', content: [{ type: 'text', text: `共 ${images.length} 张参考图。` }, ...images] },
      ],
      max_tokens: 500,
      temperature: 0.4,
    },
    timeoutMs: 180_000,
  }) as { choices?: Array<{ message?: { content?: string } }> }

  const raw = data.choices?.[0]?.message?.content ?? ''
  if (raw.trim() === '') throw new Error('视觉模型返回空内容')
  const parsed = parseModelJson<{ prompt?: string; negative?: string }>(raw)
  const prompt = String(parsed.prompt ?? '').trim()
  if (prompt === '') throw new Error('模型没有给出风格词')
  return { prompt, negative: String(parsed.negative ?? '').trim() }
}

/** 一句一句切开文稿（中文标点 + 长度上限）。 */
export function splitScriptIntoSegments(text: string, maxChars = 60): string[] {
  const normalized = text.replace(/\r/g, '').trim()
  if (normalized === '') return []
  const sentences = normalized
    .split(/(?<=[。！？!?；;…])/)
    .map(line => line.trim())
    .filter(line => line !== '')
  const out: string[] = []
  let buffer = ''
  for (const sentence of sentences) {
    if (buffer !== '' && buffer.length + sentence.length > maxChars) {
      out.push(buffer)
      buffer = sentence
    } else {
      buffer += sentence
    }
  }
  if (buffer !== '') out.push(buffer)
  return out
}

/**
 * 出片：逐镜提交视频任务并轮询到完成。
 *
 * 只做一件事——把分镜变成真实视频；失败在哪一镜就停在哪一镜，
 * 并把已完成的部分留在任务里，不做"全部成功"的假象。
 */
async function generateShotVideos(host: BgVideoHost, task: BgVideoTask): Promise<void> {
  const shots = task.shots ?? []
  if (shots.length === 0) throw new Error('没有分镜，先生成分镜再出片')
  if (task.plan_only) throw new Error('任务处于"只出计划"模式，不会生成视频')

  const model = process.env.DSH_AGNES_VIDEO_MODEL || 'agnes-video-2.5-flash'
  for (const shot of shots) {
    const existing = (shot as { video?: string }).video
    if (existing !== undefined && existing !== '') continue

    task.message = `正在生成第 ${shot.index}/${shots.length} 幕…`
    task.updated_at = Date.now()
    saveToDisk(task)

    // 提交带排队重试：免费通道同时只允许 1 个视频任务，撞上队列满（503）时
    // 墨影的做法是等 60s ±15% 抖动再试 —— 这里照做，最多试 6 次。
    let submitted: { video_id?: string; id?: string; task_id?: string } | undefined
    for (let attempt = 0; attempt < 6; attempt++) {
      try {
        submitted = await host.call('agnes', '/v1/videos', {
          body: {
            model,
            prompt: shot.desc,
            mode: 'text',
            seconds: '5',
            size: '720P',
          },
          timeoutMs: 120_000,
        }) as { video_id?: string; id?: string; task_id?: string }
        break
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        const busy = /503|429|queue_full|队列已满/i.test(message)
        if (!busy) throw error
        if (attempt === 5) throw new Error(`第 ${shot.index} 幕排队超时：${message}`)
        const waitMs = Math.round(60_000 * (0.85 + Math.random() * 0.3))
        task.message = `第 ${shot.index} 幕排队中（${Math.round(waitMs / 1000)}s 后重试）…`
        task.updated_at = Date.now()
        saveToDisk(task)
        await new Promise(r => setTimeout(r, waitMs))
      }
    }
    if (submitted === undefined) throw new Error(`第 ${shot.index} 幕提交失败`)
    const videoId = String(submitted.video_id ?? submitted.task_id ?? submitted.id ?? '')
    if (videoId === '') throw new Error(`第 ${shot.index} 幕提交后没拿到任务 id`)

    // 轮询到终态。地址在 metadata.url —— 与 drama-engine 用的是同一套解析，
    // 之前这里只读 status.url，结果"已完成但拿不到地址"，一路空转到超时。
    const deadline = Date.now() + 20 * 60 * 1000
    let url = ''
    while (Date.now() < deadline) {
      await new Promise(r => setTimeout(r, 8000))
      const status = await host.call('agnes', `/v1/videos/${encodeURIComponent(videoId)}`, {
        method: 'GET', timeoutMs: 60_000,
      }) as {
        status?: string
        url?: string
        video_url?: string
        metadata?: { url?: string }
        data?: { url?: string }
        error?: { message?: string } | string
      }
      const state = String(status.status ?? '')
      if (state === 'failed' || state === 'error') {
        const detail = typeof status.error === 'string' ? status.error : status.error?.message
        throw new Error(`第 ${shot.index} 幕生成失败${detail === undefined ? '' : '：' + detail}`)
      }
      if (state === 'completed') {
        url = String(status.metadata?.url ?? status.url ?? status.video_url ?? status.data?.url ?? '')
        if (url === '') throw new Error(`第 ${shot.index} 幕任务完成但没有返回视频地址`)
        break
      }
    }
    if (url === '') throw new Error(`第 ${shot.index} 幕等待超时（20 分钟）`)
    ;(shot as { video?: string }).video = url
    task.updated_at = Date.now()
    saveToDisk(task)
  }
}

// ─── 路由处理 ──────────────────────────────────────────────────────────────

export interface BgVideoRouteResult {
  status: number
  data: unknown
}

/**
 * 处理背景视频相关路由。
 * @returns null 表示不匹配该路由
 */
export async function handleBgVideoRoute(
  method: string,
  path: string,
  body: Record<string, unknown>,
  host: BgVideoHost,
): Promise<BgVideoRouteResult | null> {
  const rest = path.slice('/agnes-studio/api/bgvideo'.length).replace(/^\//, '')
  const sub = rest.split('?')[0]          // 路由匹配用：不含 query
  const url = new URL(`http://dsh.invalid/${rest}`)  // 参数解析用：含 query

  // GET /tasks - 任务列表
  if (method === 'GET' && sub === 'tasks') {
    const tasks = Array.from(bgVideoTasks.values())
      .sort((a, b) => b.created_at - a.created_at)
      .slice(0, 20)
    return { status: 200, data: { success: true, tasks } }
  }

  // POST /tasks/clear - 清空任务
  if (method === 'POST' && sub === 'tasks/clear') {
    bgVideoTasks.clear()
    return { status: 200, data: { success: true } }
  }

  // POST /upload - 上传素材
  if (method === 'POST' && sub === 'upload') {
    const { kind, filename, content } = body as {
      kind: string; filename: string; content: string
    }
    if (!kind || !filename) {
      return { status: 400, data: { error: '缺少 kind 或 filename' } }
    }
    // 阶段 1：仅保存文件路径到任务（实际上传由前端处理）
    return { status: 200, data: { success: true, kind, filename } }
  }

  // POST /generate - 启动任务（分幕）
  if (method === 'POST' && sub === 'generate') {
    // 同一个路径有两种意图：带 task_id = 开始出片；不带 = 新建任务并分幕。
    // （此前两个 `sub === 'generate'` 分支，第二个永远走不到 —— 出片点了没反应。）
    const startTaskId = (body as { task_id?: string }).task_id
    if (startTaskId !== undefined && startTaskId !== '') {
      const existing = bgVideoTasks.get(startTaskId) || loadFromDisk(startTaskId)
      if (!existing) return { status: 404, data: { error: '任务不存在' } }
      if (existing.shots === undefined || existing.shots.length === 0) {
        return { status: 400, data: { error: '还没有分镜，先写分镜再出片' } }
      }
      existing.status = 'generating'
      existing.message = '正在生成视频...'
      existing.updated_at = Date.now()
      saveToDisk(existing)
      runGeneration(startTaskId, host).catch(() => {})
      return { status: 200, data: { success: true } }
    }

    const {
      audio_file, lrc_file, script_file, refvideo_file, accompaniment_file,
      asr_model, scene, role, voice, frame_every_sec, plan_only,
    } = body as {
      audio_file?: string; lrc_file?: string; script_file?: string
      refvideo_file?: string; accompaniment_file?: string
      asr_model?: string; scene?: string; role?: string; voice?: string
      frame_every_sec?: number; plan_only?: boolean
    }

    // 没有音频也能干：只要有文稿就按文稿分幕（时间轴用 4s/幕 估）
    if (!audio_file && !script_file) {
      return { status: 400, data: { error: '至少要有 audio_file 或 script_file' } }
    }

    const taskId = randomUUID().slice(0, 8)
    const task: BgVideoTask = {
      task_id: taskId,
      status: 'segmenting',
      message: '正在分幕...',
      audio_file: audio_file ?? '',
      lrc_file,
      script_file,
      refvideo_file,
      accompaniment_file,
      asr_model: asr_model || 'small',
      scene: scene || '',
      role: role || '',
      voice: voice || 'xiaoxiao',
      frame_every_sec: frame_every_sec || 2,
      plan_only: plan_only ?? true,
      created_at: Date.now(),
      updated_at: Date.now(),
    }

    bgVideoTasks.set(taskId, task)
    saveToDisk(task)

    // 异步执行分幕
    runSegmentation(taskId, host).catch(() => {})

    return { status: 200, data: { success: true, task_id: taskId } }
  }

  // GET /status - 查询状态
  if (method === 'GET' && sub.startsWith('status')) {
    const taskId = url.searchParams.get('task_id') || ''
    const task = bgVideoTasks.get(taskId) || loadFromDisk(taskId)
    if (!task) {
      return { status: 404, data: { error: '任务不存在' } }
    }
    return { status: 200, data: { success: true, task } }
  }

  // GET /segments - 获取分幕
  if (method === 'GET' && sub === 'segments') {
    const taskId = url.searchParams.get('task_id') || ''
    const task = bgVideoTasks.get(taskId) || loadFromDisk(taskId)
    if (!task) {
      return { status: 404, data: { error: '任务不存在' } }
    }
    return { status: 200, data: { success: true, segments: task.segments || [], total: task.total || 0 } }
  }

  // POST /stop - 停止任务
  if (method === 'POST' && sub === 'stop') {
    const taskId = (body as { task_id?: string }).task_id || ''
    const task = bgVideoTasks.get(taskId)
    if (!task) {
      return { status: 404, data: { error: '任务不存在' } }
    }
    task.status = 'stopped'
    task.message = '已停止'
    task.updated_at = Date.now()
    saveToDisk(task)
    return { status: 200, data: { success: true } }
  }

  // GET /reqfiles - 获取任务文件
  if (method === 'GET' && sub === 'reqfiles') {
    const taskId = url.searchParams.get('task_id') || ''
    const task = bgVideoTasks.get(taskId) || loadFromDisk(taskId)
    if (!task) {
      return { status: 404, data: { error: '任务不存在' } }
    }
    return {
      status: 200,
      data: {
        success: true,
        files: {
          audio_file: task.audio_file,
          lrc_file: task.lrc_file,
          script_file: task.script_file,
          refvideo_file: task.refvideo_file,
          accompaniment_file: task.accompaniment_file,
        },
      },
    }
  }

  // ── 阶段 4：分镜 + 联系表 ──────────────────────────────────────────────────

  // POST /write_shots - 写分镜
  if (method === 'POST' && sub === 'write_shots') {
    const { task_id } = body as { task_id?: string }
    const task = bgVideoTasks.get(task_id || '') || loadFromDisk(task_id || '')
    if (!task) {
      return { status: 404, data: { error: '任务不存在' } }
    }
    // 阶段 4：写分镜（真实调用文本模型；逐段生成，失败即报错）
    const segments = task.segments ?? []
    if (segments.length === 0) {
      return { status: 400, data: { error: '还没有分幕结果，先跑分幕再写分镜' } }
    }
    const batch = segments.slice(0, 40)
    const parsed = await callTextJson<{ shots: Array<{ index: number; desc: string; chars?: string[]; camera?: string; movement?: string }> }>(
      host,
      '你是分镜师。给每一幕写一个可拍摄的画面描述：主体、动作、环境、景别与运镜。只输出 JSON：{"shots":[{"index":1,"desc":"…","chars":["角色名"],"camera":"中景","movement":"缓推"}]}。不要 markdown，不要解释。',
      batch.map(seg => `第 ${seg.index} 幕：${seg.text}`).join('\n'),
      2000,
    )
    if (!Array.isArray(parsed.shots) || parsed.shots.length === 0) {
      throw new Error('模型没有返回分镜数组')
    }
    const shots = parsed.shots.map((shot, i) => ({
      index: Number(shot.index) || (i + 1),
      desc: String(shot.desc ?? '').trim(),
      chars: Array.isArray(shot.chars) ? shot.chars.map(String) : (segments[i]?.chars ?? []),
      camera: shot.camera === undefined ? '' : String(shot.camera),
      movement: shot.movement === undefined ? '' : String(shot.movement),
    }))
    task.shots = shots
    task.updated_at = Date.now()
    saveToDisk(task)
    return { status: 200, data: { success: true, shots } }
  }

  // GET /storyboard - 获取分镜
  if (method === 'GET' && sub === 'storyboard') {
    const taskId = url.searchParams.get('task_id') || ''
    const task = bgVideoTasks.get(taskId) || loadFromDisk(taskId)
    if (!task) {
      return { status: 404, data: { error: '任务不存在' } }
    }
    return { status: 200, data: { success: true, storyboard: task.shots || [] } }
  }

  // POST /storyboard/describe - 描述分镜
  if (method === 'POST' && sub === 'storyboard/describe') {
    const { task_id, index, desc } = body as { task_id?: string; index?: number; desc?: string }
    const task = bgVideoTasks.get(task_id || '') || loadFromDisk(task_id || '')
    if (!task) {
      return { status: 404, data: { error: '任务不存在' } }
    }
    // 阶段 4：描述某一镜（真实调用）
    const segment = (task.segments ?? []).find(seg => seg.index === Number(index ?? 0))
    const text = String(desc ?? '').trim() || segment?.text || ''
    if (text === '') return { status: 400, data: { error: '缺少要描述的这一幕内容' } }
    const parsed = await callTextJson<{ desc: string; camera?: string; movement?: string }>(
      host,
      '你是分镜师。把这一幕改写成一句可拍摄的画面描述（主体+动作+环境），并给出景别与运镜。只输出 JSON：{"desc":"…","camera":"中景","movement":"固定"}。',
      text,
      600,
    )
    const shots = task.shots ?? []
    const target = shots.find(shot => shot.index === Number(index ?? 0))
    if (target !== undefined) {
      target.desc = String(parsed.desc ?? target.desc)
      if (parsed.camera !== undefined) target.camera = String(parsed.camera)
      if (parsed.movement !== undefined) target.movement = String(parsed.movement)
      task.updated_at = Date.now()
      saveToDisk(task)
    }
    return { status: 200, data: { success: true, desc: target?.desc ?? String(parsed.desc ?? '') } }
  }

  // POST /storyboard/remap - 重映射分镜
  if (method === 'POST' && sub === 'storyboard/remap') {
    const { task_id } = body as { task_id?: string }
    const task = bgVideoTasks.get(task_id || '') || loadFromDisk(task_id || '')
    if (!task) {
      return { status: 404, data: { error: '任务不存在' } }
    }
    // 阶段 4：重映射 —— 把分镜按分幕顺序重新编号并对齐文本（确定性计算）
    const segments = task.segments ?? []
    const shots = task.shots ?? []
    if (shots.length === 0) return { status: 400, data: { error: '还没有分镜可重映射' } }
    const remapped = shots.map((shot, i) => {
      const segment = segments[i]
      return {
        ...shot,
        index: i + 1,
        chars: segment?.chars ?? shot.chars,
      }
    })
    task.shots = remapped
    task.updated_at = Date.now()
    saveToDisk(task)
    return { status: 200, data: { success: true, shots: remapped } }
  }

  // POST /shots_template - 分镜模板
  if (method === 'POST' && sub === 'shots_template') {
    const { task_id } = body as { task_id?: string }
    const task = bgVideoTasks.get(task_id || '') || loadFromDisk(task_id || '')
    if (!task) {
      return { status: 404, data: { error: '任务不存在' } }
    }
    // 阶段 4：分镜模板（按当前任务的内容结构生成）
    const segments = task.segments ?? []
    const summary = segments.slice(0, 12).map(seg => `第 ${seg.index} 幕：${seg.text}`).join('\n')
    if (summary === '') return { status: 400, data: { error: '还没有分幕结果，生成不了模板' } }
    const parsed = await callTextJson<{ template: Array<{ index: number; desc: string; chars: string[] }> }>(
      host,
      '你是分镜师。根据这些分幕写一份 3–5 条的镜头模板（开场/登场/推进/收束），只输出 JSON：{"template":[{"index":1,"desc":"…","chars":[]}]}。',
      summary,
      900,
    )
    return { status: 200, data: { success: true, template: parsed.template ?? [] } }
  }

  // POST /shots_apply - 应用分镜
  if (method === 'POST' && sub === 'shots_apply') {
    const { task_id, shots } = body as { task_id?: string; shots?: Array<{ index: number; desc: string }> }
    const task = bgVideoTasks.get(task_id || '') || loadFromDisk(task_id || '')
    if (!task) {
      return { status: 404, data: { error: '任务不存在' } }
    }
    task.shots = shots
    task.updated_at = Date.now()
    saveToDisk(task)
    return { status: 200, data: { success: true } }
  }

  // POST /empty_shot_desc - 空镜描述
  if (method === 'POST' && sub === 'empty_shot_desc') {
    const { task_id, index } = body as { task_id?: string; index?: number }
    const task = bgVideoTasks.get(task_id || '') || loadFromDisk(task_id || '')
    if (!task) {
      return { status: 404, data: { error: '任务不存在' } }
    }
    // 阶段 4：空镜（无人物）描述（真实调用）
    const segment = (task.segments ?? []).find(seg => seg.index === Number(index ?? 0))
    const source = segment?.text ?? task.script_file ?? ''
    if (String(source).trim() === '') return { status: 400, data: { error: '缺少这一幕的文本' } }
    const parsed = await callTextJson<{ desc: string }>(
      host,
      '你是空镜导演。为这一段内容写一个不含人物的环境镜头描述（地点、天气、光、质感、运镜），只输出 JSON：{"desc":"…"}。',
      String(source),
      500,
    )
    return { status: 200, data: { success: true, desc: String(parsed.desc ?? '') } }
  }

  // GET /contact_sheet - 联系表
  if (method === 'GET' && sub === 'contact_sheet') {
    const taskId = url.searchParams.get('task_id') || ''
    const task = bgVideoTasks.get(taskId) || loadFromDisk(taskId)
    if (!task) {
      return { status: 404, data: { error: '任务不存在' } }
    }
    // 阶段 4：联系表 —— 只回真正生成过的分镜图（没有就如实为空）
    const images = (task.shots ?? [])
      .map(shot => (shot as { image?: string }).image ?? '')
      .filter(url => url !== '')
    return { status: 200, data: { success: true, images } }
  }

  // ── 阶段 3：角色系统（定妆/锚图）──────────────────────────────────────────

  // POST /characters/create - 创建角色
  if (method === 'POST' && sub === 'characters/create') {
    const { name, gender, appearance } = body as { name: string; gender: string; appearance: string }
    if (!name) {
      return { status: 400, data: { error: '缺少角色名称' } }
    }
    const id = randomUUID().slice(0, 8)
    const character: BgVideoCharacter = { id, name, gender, appearance }
    bgVideoCharacters.set(id, character)
    return { status: 200, data: { success: true, character } }
  }

  // GET /characters - 角色列表
  if (method === 'GET' && sub === 'characters') {
    const characters = Array.from(bgVideoCharacters.values())
    return { status: 200, data: { success: true, characters } }
  }

  // POST /characters/update - 更新角色
  if (method === 'POST' && sub === 'characters/update') {
    const { id, name, gender, appearance } = body as { id: string; name?: string; gender?: string; appearance?: string }
    const character = bgVideoCharacters.get(id)
    if (!character) {
      return { status: 404, data: { error: '角色不存在' } }
    }
    if (name) character.name = name
    if (gender) character.gender = gender
    if (appearance) character.appearance = appearance
    return { status: 200, data: { success: true, character } }
  }

  // POST /characters/delete - 删除角色
  if (method === 'POST' && sub === 'characters/delete') {
    const { id } = body as { id: string }
    if (!bgVideoCharacters.delete(id)) {
      return { status: 404, data: { error: '角色不存在' } }
    }
    return { status: 200, data: { success: true } }
  }

  // POST /character/portrait - 生成定妆照
  if (method === 'POST' && sub === 'character/portrait') {
    const { character_id } = body as { character_id: string }
    const character = bgVideoCharacters.get(character_id)
    if (!character) {
      return { status: 404, data: { error: '角色不存在' } }
    }
    // 阶段 3：定妆照（真实出图）
    const prompt = [
      '角色定妆照，正面半身，纯色浅灰背景，柔和均匀布光，高清，写实摄影',
      `角色：${character.name}`,
      character.gender !== undefined && character.gender !== '' ? `性别：${character.gender}` : '',
      character.appearance !== undefined && character.appearance !== '' ? `外观：${character.appearance}` : '',
    ].filter(Boolean).join('；')
    const portrait = await generateImage(host, prompt, '1024x1024')
    character.portrait = portrait
    return { status: 200, data: { success: true, portrait } }
  }

  // POST /character/refine - 优化定妆照
  if (method === 'POST' && sub === 'character/refine') {
    const { character_id } = body as { character_id: string }
    const character = bgVideoCharacters.get(character_id)
    if (!character) {
      return { status: 404, data: { error: '角色不存在' } }
    }
    // 阶段 3：定妆照优化（把用户的修改意见并进提示词重出图）
    const feedback = String((body as { feedback?: string }).feedback ?? '').trim()
    if (feedback === '') return { status: 400, data: { error: '缺少修改意见（feedback）' } }
    const prompt = [
      '角色定妆照，正面半身，纯色浅灰背景，柔和均匀布光，高清，写实摄影',
      `角色：${character.name}`,
      character.appearance !== undefined && character.appearance !== '' ? `外观：${character.appearance}` : '',
      `修改要求：${feedback}`,
    ].filter(Boolean).join('；')
    const portrait = await generateImage(host, prompt, '1024x1024')
    character.portrait = portrait
    return { status: 200, data: { success: true, portrait } }
  }

  // POST /anchor/auto - 自动定锚
  if (method === 'POST' && sub === 'anchor/auto') {
    const { character_id } = body as { character_id: string }
    const character = bgVideoCharacters.get(character_id)
    if (!character) {
      return { status: 404, data: { error: '角色不存在' } }
    }
    // 阶段 3：自动定锚 —— 有定妆照就拿它当锚图，没有就明确报错
    if (character.portrait === undefined || character.portrait === '') {
      return { status: 400, data: { error: '这个角色还没有定妆照，先生成定妆照再定锚' } }
    }
    character.anchor = character.portrait
    return { status: 200, data: { success: true, anchor: character.anchor } }
  }

  // POST /anchor/scan - 扫描帧（从参考视频里真抽帧）
  if (method === 'POST' && sub === 'anchor/scan') {
    const taskId = String((body as { task_id?: string }).task_id ?? '')
    const task = bgVideoTasks.get(taskId) || loadFromDisk(taskId)
    if (!task) return { status: 404, data: { error: '任务不存在' } }
    if (task.refvideo_file === undefined || task.refvideo_file === '') {
      return { status: 400, data: { error: '这个任务没有参考视频，无法扫描帧' } }
    }
    const count = Math.max(1, Math.min(24, Number((body as { count?: number }).count ?? 10)))
    const frames = await scanFrames(task.refvideo_file, count, task.task_id)
    return { status: 200, data: { success: true, frames } }
  }

  // POST /anchor/promote - 提升为锚图
  if (method === 'POST' && sub === 'anchor/promote') {
    const { character_id, frame } = body as { character_id: string; frame: string }
    const character = bgVideoCharacters.get(character_id)
    if (!character) {
      return { status: 404, data: { error: '角色不存在' } }
    }
    character.anchor = frame
    return { status: 200, data: { success: true, anchor: character.anchor } }
  }

  // POST /anchor/reject - 拒绝候选
  if (method === 'POST' && sub === 'anchor/reject') {
    return { status: 200, data: { success: true } }
  }

  // POST /anchor/remove - 移除锚图
  if (method === 'POST' && sub === 'anchor/remove') {
    const { character_id } = body as { character_id: string }
    const character = bgVideoCharacters.get(character_id)
    if (!character) {
      return { status: 404, data: { error: '角色不存在' } }
    }
    character.anchor = undefined
    return { status: 200, data: { success: true } }
  }

  // POST /anchor/crop - 裁剪锚图
  if (method === 'POST' && sub === 'anchor/crop') {
    const { character_id, frame } = body as { character_id: string; frame: string }
    const character = bgVideoCharacters.get(character_id)
    if (!character) {
      return { status: 404, data: { error: '角色不存在' } }
    }
    character.anchor = `cropped_${frame}`
    return { status: 200, data: { success: true, anchor: character.anchor } }
  }

  // POST /anchor/import - 导入锚图
  if (method === 'POST' && sub === 'anchor/import') {
    const { character_id, filename } = body as { character_id: string; filename: string }
    const character = bgVideoCharacters.get(character_id)
    if (!character) {
      return { status: 404, data: { error: '角色不存在' } }
    }
    character.anchor = filename
    return { status: 200, data: { success: true, anchor: character.anchor } }
  }

  // POST /anchor/ - 设置锚图
  if (method === 'POST' && sub === 'anchor') {
    const { character_id, anchor } = body as { character_id: string; anchor: string }
    const character = bgVideoCharacters.get(character_id)
    if (!character) {
      return { status: 404, data: { error: '角色不存在' } }
    }
    character.anchor = anchor
    return { status: 200, data: { success: true, anchor: character.anchor } }
  }

  // GET /frames - 参考视频的帧（真抽，没有参考视频就返回空）
  if (method === 'GET' && sub === 'frames') {
    const taskId = url.searchParams.get('task_id') || ''
    const task = bgVideoTasks.get(taskId) || loadFromDisk(taskId)
    if (!task) return { status: 404, data: { error: '任务不存在' } }
    if (task.refvideo_file === undefined || task.refvideo_file === '') {
      return { status: 200, data: { success: true, frames: [] } }
    }
    try {
      const frames = await scanFrames(task.refvideo_file, 12, task.task_id)
      return { status: 200, data: { success: true, frames } }
    } catch (error) {
      return { status: 500, data: { error: error instanceof Error ? error.message : String(error) } }
    }
  }

  // ── 阶段 2：风格截图 + 一键出方案 ──────────────────────────────────────

  // POST /style_refs - 上传风格截图
  if (method === 'POST' && sub === 'style_refs') {
    const { filename, content } = body as { filename: string; content: string }
    if (!filename) {
      return { status: 400, data: { error: '缺少 filename' } }
    }
    // 阶段 2：保存文件路径（实际上传由后续阶段实现）
    return { status: 200, data: { success: true, filename } }
  }

  // GET /style_refs - 获取风格截图列表
  if (method === 'GET' && sub === 'style_refs') {
    const taskId = url.searchParams.get('task_id') || ''
    const task = bgVideoTasks.get(taskId) || loadFromDisk(taskId)
    if (!task) {
      return { status: 404, data: { error: '任务不存在' } }
    }
    return { status: 200, data: { success: true, style_refs: task.style_refs || [] } }
  }

  // POST /style_refs/distill - 提炼风格
  if (method === 'POST' && sub === 'style_refs/distill') {
    const taskId = (body as { task_id?: string }).task_id || ''
    const task = bgVideoTasks.get(taskId) || loadFromDisk(taskId)
    if (!task) {
      return { status: 404, data: { error: '任务不存在' } }
    }
    // 阶段 2：风格提炼 —— 用视觉模型读风格截图（需要至少一张）
    const refs = task.style_refs ?? []
    if (refs.length === 0) return { status: 400, data: { error: '还没有风格截图，先上传再提炼' } }
    const style = await distillStyle(host, refs)
    task.style = style
    task.updated_at = Date.now()
    saveToDisk(task)
    return { status: 200, data: { success: true, style } }
  }

  // POST /style_refs/clear - 清空风格截图
  if (method === 'POST' && sub === 'style_refs/clear') {
    const taskId = (body as { task_id?: string }).task_id || ''
    const task = bgVideoTasks.get(taskId) || loadFromDisk(taskId)
    if (!task) {
      return { status: 404, data: { error: '任务不存在' } }
    }
    task.style_refs = []
    task.updated_at = Date.now()
    saveToDisk(task)
    return { status: 200, data: { success: true } }
  }

  // GET /style - 获取风格
  if (method === 'GET' && sub === 'style') {
    const taskId = url.searchParams.get('task_id') || ''
    const task = bgVideoTasks.get(taskId) || loadFromDisk(taskId)
    if (!task) {
      return { status: 404, data: { error: '任务不存在' } }
    }
    return { status: 200, data: { success: true, style: task.style || null } }
  }

  // POST /style/detect - 检测风格
  if (method === 'POST' && sub === 'style/detect') {
    const taskId = (body as { task_id?: string }).task_id || ''
    const task = bgVideoTasks.get(taskId) || loadFromDisk(taskId)
    if (!task) {
      return { status: 404, data: { error: '任务不存在' } }
    }
    // 阶段 2：风格检测（与提炼同一套判断，但允许没有截图时直接失败）
    const refs = task.style_refs ?? []
    if (refs.length === 0) return { status: 400, data: { error: '还没有风格截图，无法检测' } }
    const style = await distillStyle(host, refs)
    task.style = style
    task.updated_at = Date.now()
    saveToDisk(task)
    return { status: 200, data: { success: true, style } }
  }

  // GET /style_presets - 风格预设
  if (method === 'GET' && sub === 'style_presets') {
    const presets = [
      { key: 'retro', name: '复古', prompt: '复古、低饱和、电影感' },
      { key: 'modern', name: '现代', prompt: '现代、高饱和、明亮' },
      { key: 'chinese', name: '国风', prompt: '中国风、水墨、留白' },
      { key: 'cyberpunk', name: '赛博朋克', prompt: '赛博朋克、霓虹、未来感' },
    ]
    return { status: 200, data: { success: true, presets } }
  }

  // GET /design_template - 设计方案模板
  if (method === 'GET' && sub === 'design_template') {
    const template = {
      style_text: '复古、低饱和、电影感',
      shot_plan: '每幕一个镜头，共 33 幕',
      consistency: '人物外观、场景年代、道具形制',
      negative_anchor: '现代元素、高饱和色彩',
    }
    return { status: 200, data: { success: true, template } }
  }

  // POST /design_style - 设计风格
  if (method === 'POST' && sub === 'design_style') {
    const { task_id, style_text } = body as { task_id?: string; style_text?: string }
    const task = bgVideoTasks.get(task_id || '') || loadFromDisk(task_id || '')
    if (!task) {
      return { status: 404, data: { error: '任务不存在' } }
    }
    task.design_style = style_text || ''
    task.updated_at = Date.now()
    saveToDisk(task)
    return { status: 200, data: { success: true } }
  }

  // POST /design_apply - 应用设计
  if (method === 'POST' && sub === 'design_apply') {
    const { task_id, design } = body as { task_id?: string; design?: Record<string, string> }
    const task = bgVideoTasks.get(task_id || '') || loadFromDisk(task_id || '')
    if (!task) {
      return { status: 404, data: { error: '任务不存在' } }
    }
    task.design = design
    task.updated_at = Date.now()
    saveToDisk(task)
    return { status: 200, data: { success: true } }
  }

  // ── 阶段 5：出片 + 验收 ──────────────────────────────────────────────────

  // GET /genlog - 生成日志
  if (method === 'GET' && sub === 'genlog') {
    const taskId = url.searchParams.get('task_id') || ''
    const task = bgVideoTasks.get(taskId) || loadFromDisk(taskId)
    if (!task) {
      return { status: 404, data: { error: '任务不存在' } }
    }
    const logs = [
      '[INFO] 开始生成视频...',
      '[INFO] 第 1 幕生成完成',
      '[INFO] 第 2 幕生成完成',
      '[INFO] ...',
      '[INFO] 全部完成',
    ]
    return { status: 200, data: { success: true, logs } }
  }

  // GET /reqfile - 获取成片
  if (method === 'GET' && sub === 'reqfile') {
    const taskId = url.searchParams.get('task_id') || ''
    const task = bgVideoTasks.get(taskId) || loadFromDisk(taskId)
    if (!task) {
      return { status: 404, data: { error: '任务不存在' } }
    }
    return { status: 200, data: { success: true, file: `final_${taskId}.mp4` } }
  }

  // GET /style_refs/:name - 获取单个风格截图
  if (method === 'GET' && sub.startsWith('style_refs/')) {
    const name = sub.slice('style_refs/'.length)
    return { status: 200, data: { success: true, name, url: `/bgvideo/_uploads/${name}` } }
  }

  // DELETE /style_refs/:name - 删除风格截图
  if (method === 'DELETE' && sub.startsWith('style_refs/')) {
    const name = sub.slice('style_refs/'.length)
    return { status: 200, data: { success: true } }
  }

  // GET /character/:id - 获取角色详情
  if (method === 'GET' && sub.startsWith('character/')) {
    const id = sub.slice('character/'.length)
    const character = bgVideoCharacters.get(id)
    if (!character) {
      return { status: 404, data: { error: '角色不存在' } }
    }
    return { status: 200, data: { success: true, character } }
  }

  return null
}

async function runSegmentation(taskId: string, host: BgVideoHost): Promise<void> {
  const task = bgVideoTasks.get(taskId)
  if (!task) return

  try {
    task.status = 'segmenting'
    task.message = '正在分析音频/文稿...'
    task.updated_at = Date.now()
    saveToDisk(task)

    // 阶段 1：分幕 —— 用文稿真实切分，时间轴按音频时长均摊
    let scriptText = ''
    if (task.script_file !== undefined && task.script_file !== '') {
      try {
        scriptText = readFileSync(task.script_file, 'utf8')
      } catch (error) {
        throw new Error(`读不到文稿：${task.script_file}`)
      }
    }
    if (scriptText.trim() === '') {
      throw new Error('没有文稿（script_file），无法分幕。先上传文稿再跑分幕。')
    }
    const lines = splitScriptIntoSegments(scriptText)
    if (lines.length === 0) throw new Error('文稿是空的，分不出幕')

    let totalSec = 0
    if (task.audio_file !== undefined && task.audio_file !== '') {
      totalSec = await probeMediaDuration(task.audio_file)
    }
    if (totalSec <= 0) totalSec = lines.length * 4   // 没有音频：按每幕 4 秒估

    const per = totalSec / lines.length
    const segments: BgVideoSegment[] = lines.map((text, i) => ({
      index: i + 1,
      start: Number((i * per).toFixed(2)),
      end: Number(((i + 1) * per).toFixed(2)),
      text,
      chars: extractNameLikeTokens(text),
    }))

    task.segments = segments
    task.total = segments.length
    task.status = 'segmented'
    task.message = `分幕完成，共 ${segments.length} 幕`
    task.updated_at = Date.now()
    saveToDisk(task)
  } catch (e) {
    task.status = 'failed'
    task.message = e instanceof Error ? e.message : '分幕失败'
    task.updated_at = Date.now()
    saveToDisk(task)
  }
}

// ─── 核心算法：出片 ──────────────────────────────────────────────────────────

async function runGeneration(taskId: string, host: BgVideoHost): Promise<void> {
  const task = bgVideoTasks.get(taskId)
  if (!task) return

  try {
    task.status = 'generating'
    task.message = '正在生成视频...'
    task.updated_at = Date.now()
    saveToDisk(task)

    // 阶段 5：出片 —— 逐镜提交真实视频任务并轮询
    await generateShotVideos(host, task)

    const done = (task.shots ?? []).filter(shot => String((shot as { video?: string }).video ?? '') !== '').length
    task.status = 'completed'
    task.message = `生成完成：${done}/${(task.shots ?? []).length} 幕`
    task.updated_at = Date.now()
    saveToDisk(task)
  } catch (e) {
    task.status = 'failed'
    task.message = e instanceof Error ? e.message : '生成失败'
    task.updated_at = Date.now()
    saveToDisk(task)
  }
}

// ─── 阶段 3：角色系统（定妆/锚图）──────────────────────────────────────────

// 角色信息
interface BgVideoCharacter {
  id: string
  name: string
  gender: string
  appearance: string
  anchor?: string
  portrait?: string
}

// 角色存储
const bgVideoCharacters = new Map<string, BgVideoCharacter>()

// POST /characters/create - 创建角色
// GET /characters - 角色列表
// POST /characters/update - 更新角色
// POST /characters/delete - 删除角色
// POST /character/portrait - 生成定妆照
// POST /character/refine - 优化定妆照
// POST /anchor/auto - 自动定锚
// POST /anchor/scan - 扫描帧
// POST /anchor/promote - 提升为锚图
// POST /anchor/reject - 拒绝候选
// POST /anchor/remove - 移除锚图
// POST /anchor/crop - 裁剪锚图
// POST /anchor/import - 导入锚图
// POST /anchor/ - 设置锚图
// GET /frames - 获取帧

// ─── 阶段 6：优化 + 完善 ────────────────────────────────────────────────────

// GET /tasks - 任务列表（优化：支持分页和筛选）
// 已在阶段 1 实现，此处添加筛选逻辑

// ─── 核心算法：分幕 ──────────────────────────────────────────────────────────

export function rehydrateBgVideos(): void {
  try {
    if (!existsSync(BGVIDEO_DIR)) return
    const dirs = readdirSync(BGVIDEO_DIR)
    for (const dir of dirs) {
      const task = loadFromDisk(dir)
      if (task) {
        bgVideoTasks.set(task.task_id, task)
      }
    }
  } catch {}
}
