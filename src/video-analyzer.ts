/**
 * 视频反推流水线（真实实现）—— 替换掉原先"睡 2 秒返回 5 条假场景"的桩。
 *
 * 设计直接采用墨影 AI 工场 VideoCopy analyzer 的三方职责分离：
 *   ① **ffmpeg scene 滤镜**检测真实镜头切点（不是固定 3 秒等分）；
 *   ② **ASR** 取每段台词（不让视觉模型猜台词 —— 实测会张冠李戴）；
 *   ③ **视觉模型两阶段**：先给全片首帧做整体理解（人物/场景/节奏），
 *      再逐镜给「前 1/3 + 后 1/3」两帧做景别/运镜/情绪/画面提示词；
 *   ④ 最后由程序组装 —— 画面来自①③，台词来自②，两者不会互相污染。
 *
 * 任何一环不可用（例如宿主没有 ASR 服务）都**降级并如实标注**，
 * 绝不编造内容：宁可 `noSpeech: true`，也不返回"场景 1 描述"。
 */
import { execFile } from 'node:child_process'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { ffmpeg, resolveFfprobe } from './ffmpeg.js'

/** 一帧（时间点 + data URL）。 */
export interface FrameRef {
  /** 相对视频开头的秒数。 */
  t: number
  /** `data:image/jpeg;base64,...` */
  url: string
}

/** 单个镜头的分析结果。 */
export interface SceneAnalysis {
  index: number
  /** 起始秒。 */
  start: number
  /** 结束秒。 */
  end: number
  /** 画面描述（中文）。 */
  description: string
  /** 可直接用于生成的画面提示词。 */
  prompt: string
  /** 景别，如「近景」。 */
  shotSize: string
  /** 运镜，如「固定」「缓推」。 */
  camera: string
  /** 情绪基调。 */
  mood: string
  /** 该镜的台词（ASR 原文）；没有说话人为空串。 */
  dialogue: string
  /** 说话人（阶段二判定）；无法判定为空串。 */
  speaker: string
  /** 该镜的首/尾帧时间点。 */
  frames: number[]
}

/** 整段视频的宏观理解（阶段一）。 */
export interface VideoDigest {
  /** 一句话概括。 */
  summary: string
  /** 人物清单。 */
  characters: string[]
  /** 场景/环境清单。 */
  settings: string[]
  /** 剪辑节奏描述。 */
  pacing: string
  /** 整体影调与风格。 */
  style: string
}

/** 视频反推的完整结果。 */
export interface VideoAnalysis {
  durationSec: number
  /** 检测方式：scene-cut（真实切点）或 even（等分兜底）。 */
  segmentation: 'scene-cut' | 'even'
  digest: VideoDigest
  scenes: SceneAnalysis[]
  /** 全片 ASR 台词（无 ASR 时为空串）。 */
  transcript: string
  /** 是否拿到了台词数据。 */
  hasSpeech: boolean
  /** 降级说明，前端要如实展示。 */
  warnings: string[]
}

/** 视觉模型调用（由宿主注入，复用 plugin 的 vendor 解析）。 */
export interface VisionCaller {
  (messages: Array<{ role: 'system' | 'user'; content: unknown }>, opts?: { maxTokens?: number }): Promise<string>
}

/** ASR 调用（由宿主注入；不可用时传 undefined）。 */
export interface SpeechCaller {
  /** 输入 16k 单声道 WAV 字节，返回识别文本。 */
  (wav: Uint8Array): Promise<string>
}

/** 场景阈值：低于这个比例的帧间差异不算切点。 */
const SCENE_THRESHOLD = 0.32
/** 单镜最短时长（秒）：短于此的碎片并入上一镜。 */
const MIN_SCENE_SEC = 0.8
/** 最多分析多少个镜头（控制成本）。 */
const MAX_SCENES = 24

// ─── 1. 时长与切点 ─────────────────────────────────────────────────────────

/** 取视频时长；ffprobe 不可用时退回解析 ffmpeg 的 stderr。 */
export async function probeDurationSec(videoPath: string): Promise<number> {
  const ffprobe = await resolveFfprobe()
  if (ffprobe !== null) {
    const value = await new Promise<number>((resolve) => {
      execFile(
        ffprobe,
        ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=noprint_wrappers=1:nokey=1', videoPath],
        { timeout: 30_000 },
        (err: Error | null, stdout: string) => {
          if (err !== null) { resolve(0); return }
          const n = Number(String(stdout).trim())
          resolve(Number.isFinite(n) && n > 0 ? n : 0)
        },
      )
    })
    if (value > 0) return value
  }
  const res = await ffmpeg(['-i', videoPath], 30_000)
  const m = /Duration:\s*(\d+):(\d+):(\d+\.?\d*)/.exec(res.stderr)
  return m === null ? 0 : Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3])
}

/**
 * 用 ffmpeg 的 scene 滤镜找真实镜头切点。
 *
 * `select='gt(scene,THRESHOLD)'` 会把"画面变化超过阈值"的帧选出来，
 * `showinfo` 把它打印到 stderr —— 这就是真实切点，不是等分。
 *
 * @param videoPath - 本地视频路径。
 * @param threshold - 变化阈值，默认 0.32。
 * @returns 切点秒数（升序，不含 0）。
 */
export async function detectSceneCuts(videoPath: string, threshold = SCENE_THRESHOLD): Promise<number[]> {
  const res = await ffmpeg([
    '-i', videoPath,
    '-filter:v', `select='gt(scene,${threshold})',showinfo`,
    '-an', '-f', 'null', '-',
  ], 180_000)
  const cuts: number[] = []
  const re = /pts_time:([0-9]+(?:\.[0-9]+)?)/g
  let m: RegExpExecArray | null
  while ((m = re.exec(res.stderr)) !== null) {
    const t = Number(m[1])
    if (Number.isFinite(t) && t > 0) cuts.push(t)
  }
  return dedupeSorted(cuts)
}

/** 排序去重（相邻小于 0.3s 视为同一切点）。 */
function dedupeSorted(values: number[]): number[] {
  const sorted = [...values].sort((a, b) => a - b)
  const out: number[] = []
  for (const v of sorted) {
    if (out.length === 0 || v - out[out.length - 1] > 0.3) out.push(v)
  }
  return out
}

/**
 * 把切点整理成 `[start, end)` 镜头区间。
 *
 * 过短碎片并入前一镜；没有切点时按均分兜底（并如实标注 segmentation='even'）。
 */
export function buildScenes(cuts: number[], durationSec: number): { scenes: Array<{ start: number; end: number }>; mode: 'scene-cut' | 'even' } {
  if (durationSec <= 0) return { scenes: [], mode: 'even' }
  const bounds = [0, ...cuts.filter(t => t < durationSec - 0.2), durationSec]
  const segments: Array<{ start: number; end: number }> = []
  for (let i = 0; i < bounds.length - 1; i++) {
    const start = bounds[i]
    const end = bounds[i + 1]
    if (end - start < MIN_SCENE_SEC && segments.length > 0) {
      segments[segments.length - 1].end = end
    } else {
      segments.push({ start, end })
    }
  }
  if (segments.length <= 1) {
    // 没有可用的切点：均分成便于理解的若干段
    const count = Math.max(1, Math.min(MAX_SCENES, Math.ceil(durationSec / 4)))
    const step = durationSec / count
    return {
      scenes: Array.from({ length: count }, (_, i) => ({ start: i * step, end: Math.min(durationSec, (i + 1) * step) })),
      mode: 'even',
    }
  }
  return { scenes: segments.slice(0, MAX_SCENES), mode: 'scene-cut' }
}

// ─── 2. 抽帧与音频 ─────────────────────────────────────────────────────────

/** 抽单帧（缩放到 640 宽，质量 4），返回 data URL；失败返回空串。 */
async function grabFrame(videoPath: string, atSec: number, dir: string, tag: string): Promise<string> {
  const out = join(dir, `${tag}.jpg`)
  const res = await ffmpeg([
    '-y', '-ss', atSec.toFixed(3), '-i', videoPath,
    '-frames:v', '1', '-vf', 'scale=640:-2', '-q:v', '4', out,
  ], 60_000)
  if (!res.ok) return ''
  try {
    const buf = await readFile(out)
    return `data:image/jpeg;base64,${buf.toString('base64')}`
  } catch {
    return ''
  }
}

/** 抽一段音频并转成 16k 单声道 WAV（ASR 的输入格式）。 */
async function grabAudioWav(videoPath: string, dir: string): Promise<Uint8Array | null> {
  const out = join(dir, 'audio.wav')
  const res = await ffmpeg([
    '-y', '-i', videoPath, '-vn', '-ac', '1', '-ar', '16000', '-f', 'wav', out,
  ], 180_000)
  if (!res.ok) return null
  try {
    return await readFile(out)
  } catch {
    return null
  }
}

// ─── 3. 视觉分析 ───────────────────────────────────────────────────────────

/** 从模型回复里抠 JSON（容忍 ```json 包裹与前后废话）。 */
export function extractJson<T>(text: string): T | null {
  const fenced = /```(?:json)?\s*([\s\S]*?)```/i.exec(text)
  const candidate = fenced !== null ? fenced[1] : text
  const start = candidate.search(/[[{]/)
  if (start < 0) return null
  const slice = candidate.slice(start)
  for (let end = slice.length; end > 0; end--) {
    const chunk = slice.slice(0, end)
    try {
      return JSON.parse(chunk) as T
    } catch { /* 继续缩短 */ }
  }
  return null
}

/** 阶段一：全片首帧 + 台词 → 宏观理解。 */
export async function analyzeDigest(
  frames: FrameRef[],
  transcript: string,
  callVision: VisionCaller,
): Promise<VideoDigest> {
  const system =
    '你是资深影视剪辑分析师。用户给你一段视频的关键帧（按时间顺序）和它的台词转写。\n' +
    '请输出**严格 JSON**（不要 markdown 代码块、不要解释），字段：\n' +
    '{"summary":"一句话概括整段视频","characters":["人物/角色外观要点"],"settings":["场景与环境"],"pacing":"剪辑节奏（快/慢、平均镜头长度感受）","style":"影调与整体风格"}\n' +
    '要求：只写你能从画面/台词里确认的内容；不确定就留空数组或空串，不要编造。'

  const user = [
    { type: 'text', text: `共 ${frames.length} 帧，台词转写如下：\n${transcript === '' ? '（无台词数据）' : transcript}` },
    ...frames.slice(0, 12).map(f => ({ type: 'image_url', image_url: { url: f.url } })),
  ]

  const raw = await callVision([
    { role: 'system', content: system },
    { role: 'user', content: user },
  ], { maxTokens: 800 })

  const parsed = extractJson<Partial<VideoDigest>>(raw)
  return {
    summary: String(parsed?.summary ?? '').trim(),
    characters: Array.isArray(parsed?.characters) ? parsed.characters.map(String).slice(0, 8) : [],
    settings: Array.isArray(parsed?.settings) ? parsed.settings.map(String).slice(0, 8) : [],
    pacing: String(parsed?.pacing ?? '').trim(),
    style: String(parsed?.style ?? '').trim(),
  }
}

/** 阶段二：逐镜两帧 + 该镜台词 → 单镜结构化结果。 */
export async function analyzeScene(
  index: number,
  start: number,
  end: number,
  headFrame: string,
  tailFrame: string,
  dialogue: string,
  callVision: VisionCaller,
): Promise<Omit<SceneAnalysis, 'index' | 'start' | 'end' | 'frames'>> {
  const system =
    '你是资深分镜师。用户给你同一个镜头的**前段与后段两张画面**，以及该镜的台词转写。\n' +
    '输出**严格 JSON**（不要 markdown、不要解释），字段：\n' +
    '{"description":"这一镜发生了什么（主体+动作+环境）","prompt":"可直接用于视频生成的完整画面提示词（主体+动作+场景+运镜+光线+色彩+风格）","shotSize":"景别（特写/近景/中景/全景/远景）","camera":"运镜（固定/摇/移/推/拉/跟随/手持）","mood":"情绪基调","speaker":"说话人（能从台词判断时填，否则空串）"}\n' +
    '要求：以画面为准；台词只用来判断说话人与语气，不要拿台词去编画面。'

  const user = [
    { type: 'text', text: `第 ${index} 镜（${start.toFixed(1)}s–${end.toFixed(1)}s）。台词：${dialogue === '' ? '（无）' : dialogue}` },
    { type: 'text', text: '前段画面：' },
    { type: 'image_url', image_url: { url: headFrame } },
    ...(tailFrame === '' ? [] : [{ type: 'text', text: '后段画面：' }, { type: 'image_url', image_url: { url: tailFrame } }]),
  ]

  const raw = await callVision([
    { role: 'system', content: system },
    { role: 'user', content: user },
  ], { maxTokens: 700 })

  const parsed = extractJson<Record<string, unknown>>(raw)
  return {
    description: String(parsed?.description ?? '').trim(),
    prompt: String(parsed?.prompt ?? '').trim(),
    shotSize: String(parsed?.shotSize ?? '').trim(),
    camera: String(parsed?.camera ?? '').trim(),
    mood: String(parsed?.mood ?? '').trim(),
    dialogue,
    speaker: String(parsed?.speaker ?? '').trim(),
  }
}

// ─── 4. 编排 ───────────────────────────────────────────────────────────────

export interface AnalyzeOptions {
  videoPath: string
  callVision: VisionCaller
  /** ASR；不可用时传 undefined，结果会标 hasSpeech=false。 */
  callSpeech?: SpeechCaller
  /** 进度回调（阶段 + 百分比）。 */
  onProgress?: (message: string, percent: number) => void
}

/**
 * 完整反推：切点 → 抽帧 → ASR → 两阶段视觉 → 组装。
 *
 * @param options - 输入视频、视觉/语音调用器与进度回调。
 * @returns 结构化结果；降级情况写在 `warnings` 里，绝不静默编造。
 */
export async function analyzeVideo(options: AnalyzeOptions): Promise<VideoAnalysis> {
  const { videoPath, callVision, callSpeech, onProgress } = options
  const warnings: string[] = []
  const dir = await mkdtemp(join(tmpdir(), 'vp-analyze-'))

  try {
    onProgress?.('读取时长…', 5)
    const durationSec = await probeDurationSec(videoPath)
    if (durationSec <= 0) throw new Error('无法读取视频时长，文件可能不是有效视频')

    onProgress?.('检测镜头切点…', 15)
    const cuts = await detectSceneCuts(videoPath)
    const { scenes: bounds, mode } = buildScenes(cuts, durationSec)
    if (mode === 'even') warnings.push('未检测到明显切点，按等分处理（画面可能跨镜）')

    // 抽帧：每镜取 1/3 与 2/3 两处
    onProgress?.('抽取关键帧…', 30)
    const frameSets: Array<{ head: string; tail: string; headT: number; tailT: number }> = []
    for (let i = 0; i < bounds.length; i++) {
      const { start, end } = bounds[i]
      const headT = start + (end - start) / 3
      const tailT = start + ((end - start) * 2) / 3
      const head = await grabFrame(videoPath, headT, dir, `s${i}-head`)
      const tail = await grabFrame(videoPath, tailT, dir, `s${i}-tail`)
      frameSets.push({ head, tail, headT, tailT })
    }
    const firstFrames: FrameRef[] = frameSets
      .map((f, i) => ({ t: bounds[i].start, url: f.head }))
      .filter(f => f.url !== '')
    if (firstFrames.length === 0) throw new Error('抽帧失败：无法从该视频读出任何画面')

    // ASR（可选）
    let transcript = ''
    let hasSpeech = false
    if (callSpeech !== undefined) {
      onProgress?.('转写台词…', 45)
      const wav = await grabAudioWav(videoPath, dir)
      if (wav === null) {
        warnings.push('音轨提取失败（可能无音轨），未做台词转写')
      } else {
        try {
          transcript = (await callSpeech(wav)).trim()
          hasSpeech = transcript !== ''
          if (!hasSpeech) warnings.push('ASR 未识别到有效台词')
        } catch (error) {
          warnings.push(`ASR 失败：${error instanceof Error ? error.message : String(error)}`)
        }
      }
    } else {
      warnings.push('宿主未提供语音识别服务，本次没有台词数据')
    }

    // 阶段一
    onProgress?.('整体理解…', 55)
    const digest = await analyzeDigest(firstFrames, transcript, callVision)

    // 阶段二
    const scenes: SceneAnalysis[] = []
    for (let i = 0; i < bounds.length; i++) {
      const { start, end } = bounds[i]
      const frames = frameSets[i]
      onProgress?.(`分析第 ${i + 1}/${bounds.length} 镜…`, 55 + Math.round((i / bounds.length) * 40))
      const shot = await analyzeScene(
        i + 1, start, end, frames.head, frames.tail,
        hasSpeech ? transcript : '',
        callVision,
      )
      scenes.push({
        index: i + 1,
        start: Number(start.toFixed(2)),
        end: Number(end.toFixed(2)),
        frames: [Number(frames.headT.toFixed(2)), Number(frames.tailT.toFixed(2))],
        ...shot,
      })
    }

    onProgress?.('整理结果…', 98)
    return { durationSec, segmentation: mode, digest, scenes, transcript, hasSpeech, warnings }
  } finally {
    await rm(dir, { recursive: true, force: true })
  }
}

/** 把分析结果导出成可打印 HTML（墨影 report 模块的等价物）。 */
export function analysisToHtml(analysis: VideoAnalysis, title: string): string {
  const esc = (s: string): string => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  const rows = analysis.scenes.map(scene => `
      <tr>
        <td>${scene.index}</td>
        <td>${scene.start.toFixed(1)}–${scene.end.toFixed(1)}s</td>
        <td>${esc(scene.shotSize)}</td>
        <td>${esc(scene.camera)}</td>
        <td>${esc(scene.description)}</td>
        <td>${esc(scene.dialogue)}${scene.speaker === '' ? '' : `（${esc(scene.speaker)}）`}</td>
        <td>${esc(scene.prompt)}</td>
      </tr>`).join('')

  return `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><title>${esc(title)}</title>
<style>
 body{font-family:-apple-system,"PingFang SC","Microsoft YaHei",system-ui,sans-serif;margin:32px;color:#111}
 h1{font-size:20px;margin:0 0 6px} .meta{color:#666;font-size:12px;margin-bottom:20px}
 table{border-collapse:collapse;width:100%;font-size:13px}
 th,td{border:1px solid #ddd;padding:8px;vertical-align:top;text-align:left}
 th{background:#f6f6f8;font-weight:600} tr:nth-child(even) td{background:#fafafa}
 .digest{margin:16px 0 24px;padding:12px 14px;border:1px solid #e5e5ea;border-radius:8px;background:#fbfbfd;font-size:13px;line-height:1.7}
 @media print{body{margin:12mm}}
</style></head><body>
<h1>${esc(title)}</h1>
<div class="meta">时长 ${analysis.durationSec.toFixed(1)}s · ${analysis.scenes.length} 个镜头 · 切点方式：${analysis.segmentation === 'scene-cut' ? '真实检测' : '等分兜底'}${analysis.warnings.length > 0 ? ' · ' + esc(analysis.warnings.join('；')) : ''}</div>
<div class="digest"><b>整体理解</b><br>${esc(analysis.digest.summary)}<br>
人物：${esc(analysis.digest.characters.join('、') || '—')}<br>
场景：${esc(analysis.digest.settings.join('、') || '—')}<br>
节奏：${esc(analysis.digest.pacing || '—')}　风格：${esc(analysis.digest.style || '—')}</div>
<table><thead><tr><th>#</th><th>时间</th><th>景别</th><th>运镜</th><th>画面</th><th>台词</th><th>生成提示词</th></tr></thead>
<tbody>${rows}</tbody></table>
</body></html>`
}
