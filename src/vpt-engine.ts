/**
 * 转提示词（VPT）：视频 / 图片 → 关键帧 → 视觉模型逆向 → 结构化提示词
 *
 * 设计来源：墨影 AI 工场的 `routes/vpt.py`（同源 Agnes AI Studio）。
 * 移植时保留了两件事：
 *   1. 六套目标格式的差异化提示词（决定输出语法，是这套功能的核心资产）
 *   2. 均匀抽帧 + 逐帧送视觉模型的分析方式
 *
 * 与墨影的差异：
 *   - 视频不再上传到服务端磁盘长期保存，抽完帧即删临时文件
 *   - 上传走 base64 JSON（插件没有 multipart 解析器），前端限制体积
 */
import { mkdtemp, rm, writeFile, readFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { ffmpeg, resolveFfprobe } from './ffmpeg.js'

/** 目标模型：决定提示词的语法偏好。 */
export type VptTarget = 'general' | 'seedance' | 'veo' | 'kling' | 'wan' | 'midjourney' | 'flux'

/** 每个目标在提示词里注入的"面向谁写"的描述。 */
export const TARGET_HINTS: Record<VptTarget, string> = {
  general: '通用视频/图像生成模型',
  seedance: '字节 Seedance（语义化中文长镜头描述，动作与运镜词优先）',
  veo: 'Google Veo（英文为主，电影语法 veo 风格，镜头/光线/氛围结构化）',
  kling: '可灵 Kling（主体+动作+场景+运镜+风格，简洁分层）',
  wan: '阿里 Wan（主体描述在前，动作与镜头运动其次）',
  midjourney: 'Midjourney（图像提示词，风格关键词+参数化描述）',
  flux: 'FLUX（自然语言完整描述，细节丰富）',
}

/** 目标名的中文标签，供前端下拉使用。 */
export const TARGET_LABELS: Record<VptTarget, string> = {
  general: '通用',
  seedance: 'Seedance',
  veo: 'Veo',
  kling: '可灵 Kling',
  wan: '阿里 Wan',
  midjourney: 'Midjourney',
  flux: 'FLUX',
}

/** 允许的抽帧数（与墨影一致）。 */
export const ALLOWED_FRAME_COUNTS = [4, 6, 8] as const

/** 目标必须是已知键，否则回落 general。 */
export function normalizeTarget(raw: unknown): VptTarget {
  return typeof raw === 'string' && raw in TARGET_HINTS ? (raw as VptTarget) : 'general'
}

/** 语言规则句：中文输出中文，英文输出英文。 */
function langRule(lang: 'zh' | 'en'): string {
  return lang === 'en' ? '输出提示词必须使用英文。' : '输出提示词必须使用简体中文。'
}

/**
 * 构造视频逆向的对话消息。
 *
 * @param frameCount - 送入的帧数（决定"逐帧观察"的表述）。
 * @param durationSec - 视频总时长，用于让模型感知节奏。
 * @param target - 目标模型，决定语法偏好。
 * @param lang - 输出语言。
 * @param images - 按时间顺序排列的 data URL。
 */
export function buildVideoMessages(
  frameCount: number,
  durationSec: number,
  target: VptTarget,
  lang: 'zh' | 'en',
  images: string[],
): Array<{ role: 'system' | 'user'; content: unknown }> {
  const system =
    `你是顶级的视频逆向提示词工程师。用户上传一段视频，已按时间顺序抽取 ${frameCount} 个关键帧给你` +
    `（共 ${frameCount} 帧按时间顺序排列，视频总时长约 ${durationSec.toFixed(0)} 秒）。\n\n` +
    `请逆向分析整段视频，输出一条可直接用于 ${TARGET_HINTS[target]} 的完整视频生成提示词。\n\n` +
    `分析要求：\n` +
    `1. 逐帧观察：主体与动作、场景环境、镜头运动（推拉摇移跟/固定/手持）、景深与焦段；\n` +
    `2. 归纳跨帧信息：光线氛围、色彩调性、节奏、艺术风格与电影语法；\n` +
    `3. 输出为一段连贯的提示词正文（不要分点、不要标题、不要解释），` +
    `把【主体+动作+场景+运镜+光线+色彩+风格】全部浓缩进去；\n` +
    `4. ${langRule(lang)}\n` +
    `5. 只输出提示词本身。`

  const user = [
    { type: 'text', text: '请分析这些关键帧。' },
    ...images.map(url => ({ type: 'image_url', image_url: { url } })),
  ]
  return [
    { role: 'system', content: system },
    { role: 'user', content: user },
  ]
}

/** 构造图片逆向的对话消息。 */
export function buildImageMessages(
  target: VptTarget,
  lang: 'zh' | 'en',
  image: string,
): Array<{ role: 'system' | 'user'; content: unknown }> {
  const system =
    `你是顶级的图像逆向提示词工程师。用户上传一张图片。\n` +
    `请逆向分析图片，输出一条可直接用于 ${TARGET_HINTS[target]} 的完整图像生成提示词。\n\n` +
    `分析要求：\n` +
    `1. 主体细节（外观、姿态、服装、表情）、场景环境与构图、透视与景深；\n` +
    `2. 光线方向与质感、色彩调性、媒介与笔触/渲染风格；\n` +
    `3. 输出为一段连贯的提示词正文（不要分点、不要标题、不要解释）；\n` +
    `4. ${langRule(lang)}`

  const user = [
    { type: 'text', text: '请分析这张图片。' },
    { type: 'image_url', image_url: { url: image } },
  ]
  return [
    { role: 'system', content: system },
    { role: 'user', content: user },
  ]
}

/** ffprobe 取时长；失败则从 ffmpeg 输出里正则兜底。 */
export async function probeDuration(videoPath: string): Promise<number> {
  const ffprobe = await resolveFfprobe()
  if (ffprobe) {
    try {
      const r = await fetchDurationViaFfprobe(ffprobe, videoPath)
      if (r > 0) return r
    } catch { /* fall through */ }
  }
  // ffmpeg -i 会把 Duration 打到 stderr，失败退出码也算可读
  const res = await ffmpeg(['-i', videoPath], 30_000)
  const m = /Duration:\s*(\d+):(\d+):(\d+\.?\d*)/.exec(res.stderr)
  if (!m) return 0
  return Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3])
}

/** 调 ffprobe 拿秒数（单独包一层便于测试替身）。 */
async function fetchDurationViaFfprobe(ffprobe: string, videoPath: string): Promise<number> {
  const { execFile } = await import('node:child_process')
  return await new Promise<number>((resolve, reject) => {
    execFile(
      ffprobe,
      ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=noprint_wrappers=1:nokey=1', videoPath],
      { timeout: 30_000 },
      (err: Error | null, stdout: string) => {
        if (err) { reject(err); return }
        const v = Number(String(stdout).trim())
        resolve(Number.isFinite(v) && v > 0 ? v : 0)
      },
    )
  })
}

/** 均匀抽帧，返回 data URL 列表。 */
export async function extractFrames(
  videoPath: string,
  count: number,
  durationSec: number,
): Promise<string[]> {
  const dir = await mkdtemp(join(tmpdir(), 'vpt-'))
  try {
    const step = durationSec / (count + 1)
    const frames: string[] = []
    for (let i = 1; i <= count; i++) {
      const t = (step * i).toFixed(2)
      const out = join(dir, `frame_${String(i).padStart(2, '0')}.jpg`)
      const r = await ffmpeg([
        '-y', '-ss', t, '-i', videoPath,
        '-frames:v', '1', '-vf', 'scale=768:-2', '-q:v', '4', out,
      ], 60_000)
      if (!r.ok) continue
      try {
        const buf = await readFile(out)
        frames.push(`data:image/jpeg;base64,${buf.toString('base64')}`)
      } catch { /* skip frame */ }
    }
    return frames
  } finally {
    await rm(dir, { recursive: true, force: true })
  }
}

/** 把 base64 data URL 落到临时文件，交给 ffmpeg 处理。 */
export async function materializeDataUrl(dataUrl: string): Promise<{ path: string; cleanup: () => Promise<void> }> {
  const m = /^data:([^;]+);base64,(.*)$/s.exec(dataUrl)
  if (!m) throw new Error('不是合法的 base64 data URL')
  const mime = m[1]
  const ext = mime.includes('mp4') ? 'mp4'
    : mime.includes('webm') ? 'webm'
    : mime.includes('quicktime') ? 'mov'
    : mime.includes('png') ? 'png'
    : mime.includes('webp') ? 'webp'
    : 'jpg'
  const dir = await mkdtemp(join(tmpdir(), 'vpt-src-'))
  const path = join(dir, `input.${ext}`)
  await writeFile(path, Buffer.from(m[2], 'base64'))
  return {
    path,
    cleanup: async () => { await rm(dir, { recursive: true, force: true }) },
  }
}

/** 视觉模型调用：OpenAI 兼容的 chat/completions + image_url。 */
export async function callVisionModel(
  baseUrl: string,
  apiKey: string,
  model: string,
  messages: Array<{ role: 'system' | 'user'; content: unknown }>,
  timeoutMs = 180_000,
): Promise<string> {
  const ac = new AbortController()
  const timer = setTimeout(() => ac.abort(), timeoutMs)
  try {
    const r = await fetch(`${baseUrl.replace(/\/+$/, '')}/chat/completions`, {
      method: 'POST',
      signal: ac.signal,
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, messages, max_tokens: 1200, temperature: 0.5 }),
    })
    if (!r.ok) throw new Error(`视觉模型 ${r.status}: ${(await r.text()).slice(0, 300)}`)
    const res = await r.json() as { choices?: Array<{ message?: { content?: string } }> }
    const text = res.choices?.[0]?.message?.content ?? ''
    if (!text.trim()) throw new Error('视觉模型返回空内容')
    return text.trim()
  } finally {
    clearTimeout(timer)
  }
}
