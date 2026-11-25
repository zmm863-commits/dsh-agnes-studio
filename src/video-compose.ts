/**
 * 合成积木（ffmpeg）：静图动画、字幕烧录、拼片。
 *
 * 借鉴墨影 AI 工场里反复出现的三件小事 —— 它们看着不起眼，却是"能发"和
 * "不能发"的分界线：
 *
 *   1. **Ken Burns（zoompan）**：一张静图 + 缓慢推拉，就是一条能看的镜头。
 *      科普、情感、口播都用它把成本压到接近零（不用生成视频）。
 *   2. **字幕烧录**：SRT/ASS 直接烧进画面（`subtitles` 滤镜，需要 libass），
 *      不依赖播放器；中文还需要 CJK 字体，缺字体时会烧成豆腐块，所以要先探测。
 *   3. **拼接**：concat demuxer 拼同规格片段。
 *
 * 全部失败都不抛到调用方之外：返回结构化结果，让前端能说清"缺什么"。
 */
import { mkdirSync, writeFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { ffmpeg, dataRoot, resolveFfmpeg } from './ffmpeg.js'

/** 一条 Ken Burns 镜头的参数。 */
export interface KenBurnsOptions {
  /** 时长（秒）。 */
  durationSec: number
  /** 目标宽高（必须偶数，ffmpeg 的 yuv420p 要求）。 */
  width?: number
  height?: number
  /**
   * 运动方式：
   *   zoom-in  从 1.0 推到 1.12（最常用）
   *   zoom-out 从 1.12 退回 1.0
   *   pan-left / pan-right 从一侧缓慢移到另一侧（带轻微放大）
   */
  motion?: 'zoom-in' | 'zoom-out' | 'pan-left' | 'pan-right'
  /** 帧率。 */
  fps?: number
}

/** 合成结果。 */
export interface ComposeResult {
  ok: boolean
  /** 产物路径（失败时为空）。 */
  path: string
  /** 失败原因/提示。 */
  detail: string
}

/** 偶数化（yuv420p 要求宽高为偶数）。 */
function even(value: number): number {
  return Math.max(2, Math.round(value / 2) * 2)
}

/**
 * 生成 zoompan 滤镜表达式。
 *
 * zoompan 的 `d` 是每张图重复的帧数，`x/y` 是取景框左上角。
 * 关键点：zoom 必须随帧变化（`zoom+0.0008`），否则就是一张会呼吸的静图。
 *
 * @param motion - 运动方式。
 * @param frames - 总帧数（duration × fps）。
 * @returns zoompan 滤镜串。
 */
export function buildZoomPanFilter(motion: KenBurnsOptions['motion'], frames: number): string {
  const step = (0.12 / Math.max(1, frames)).toFixed(6)
  const fpsExpr = ''
  switch (motion ?? 'zoom-in') {
    case 'zoom-out':
      // 从放大状态开始，逐步回到原尺寸
      return `zoompan=z='if(lte(zoom,1.0),1.12,max(1.001,zoom-${step}))':d=${frames}:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=__SIZE__${fpsExpr}`
    case 'pan-left':
      return `zoompan=z='1.12':d=${frames}:x='(iw-iw/zoom)*(1-on/${frames})':y='ih/2-(ih/zoom/2)':s=__SIZE__`
    case 'pan-right':
      return `zoompan=z='1.12':d=${frames}:x='(iw-iw/zoom)*(on/${frames})':y='ih/2-(ih/zoom/2)':s=__SIZE__`
    case 'zoom-in':
    default:
      return `zoompan=z='min(1.12,1+on*${step})':d=${frames}:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=__SIZE__`
  }
}

/**
 * 静图 → 一条有运动的镜头。
 *
 * @param imagePath - 输入图片路径。
 * @param outPath - 输出 mp4 路径。
 * @param options - 时长/尺寸/运动方式。
 * @returns 结构化结果。
 */
export async function kenBurnsClip(imagePath: string, outPath: string, options: KenBurnsOptions): Promise<ComposeResult> {
  if (!existsSync(imagePath)) return { ok: false, path: '', detail: `找不到图片：${imagePath}` }
  const durationSec = Math.max(1, options.durationSec)
  const width = even(options.width ?? 1280)
  const height = even(options.height ?? 720)
  const fps = options.fps ?? 30
  const frames = Math.max(2, Math.round(durationSec * fps))
  const filter = buildZoomPanFilter(options.motion, frames).replace('__SIZE__', `${width}x${height}`)

  mkdirSync(join(outPath, '..'), { recursive: true })
  const res = await ffmpeg([
    '-y', '-loop', '1', '-i', imagePath,
    '-t', String(durationSec),
    '-filter_complex', `scale=${width * 2}:-2,${filter},format=yuv420p`,
    '-r', String(fps), '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20',
    '-movflags', '+faststart', outPath,
  ], 180_000)
  if (!res.ok) return { ok: false, path: '', detail: `ffmpeg 失败：${res.stderr.slice(-300)}` }
  return { ok: true, path: outPath, detail: `${durationSec}s · ${width}×${height} · ${options.motion ?? 'zoom-in'}` }
}

/** 探测系统里是否有可用的 CJK 字体（没有就会把中文烧成豆腐块）。 */
export async function detectCjkFont(): Promise<string | null> {
  const candidates = [
    '/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc',
    '/usr/share/fonts/truetype/noto/NotoSansCJK-Regular.ttc',
    '/usr/share/fonts/opentype/noto/NotoSerifCJK-Regular.ttc',
    '/System/Library/Fonts/PingFang.ttc',
    'C:\\Windows\\Fonts\\msyh.ttc',
  ]
  for (const path of candidates) {
    if (existsSync(path)) return path
  }
  // 退一步：用 fc-match 找任意一个中文字体
  const res = await ffmpeg(['-hide_banner', '-filters'], 15_000)
  if (!res.ok && res.stderr === '') return null
  return null
}

/**
 * 把 SRT 字幕烧进视频。
 *
 * 用 `subtitles` 滤镜（libass）。中文必须指定字体，否则会渲染成方块；
 * 字体文件不存在时**明确失败**，而不是产出一条看不见字幕的成片。
 *
 * @param videoPath - 输入视频。
 * @param srtPath - SRT 文件路径。
 * @param outPath - 输出视频。
 * @param fontFile - 中文字体文件路径（可选，缺省用系统默认）。
 */
export async function burnSubtitles(
  videoPath: string,
  srtPath: string,
  outPath: string,
  fontFile?: string,
): Promise<ComposeResult> {
  if (!existsSync(videoPath)) return { ok: false, path: '', detail: `找不到视频：${videoPath}` }
  if (!existsSync(srtPath)) return { ok: false, path: '', detail: `找不到字幕：${srtPath}` }

  // 滤镜里的路径要转义：反斜杠、冒号、单引号
  const escape = (p: string): string => p.replace(/\\/g, '\\\\').replace(/:/g, '\\:').replace(/'/g, "\\'")
  const parts = [`subtitles='${escape(srtPath)}'`]
  if (fontFile !== undefined && fontFile !== '') {
    if (!existsSync(fontFile)) return { ok: false, path: '', detail: `字体不存在：${fontFile}` }
    parts.push(`fontsdir='${escape(fontFile.replace(/[\\/][^\\/]+$/, ''))}'`)
  }
  const filter = parts.join(':')

  const res = await ffmpeg([
    '-y', '-i', videoPath,
    '-vf', `${filter},format=yuv420p`,
    '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20',
    '-c:a', 'aac', '-b:a', '128k',
    '-movflags', '+faststart', outPath,
  ], 600_000)
  if (!res.ok) return { ok: false, path: '', detail: `字幕烧录失败：${res.stderr.slice(-300)}` }
  return { ok: true, path: outPath, detail: fontFile === undefined ? '已烧录（系统默认字体）' : '已烧录（指定字体）' }
}

/** 用 concat demuxer 拼接同规格片段（先写 list 文件，避免命令行过长）。 */
export async function concatClips(inputs: string[], outPath: string): Promise<ComposeResult> {
  if (inputs.length === 0) return { ok: false, path: '', detail: '没有输入片段' }
  for (const input of inputs) {
    if (!existsSync(input)) return { ok: false, path: '', detail: `找不到片段：${input}` }
  }
  if (inputs.length === 1) {
    const res = await ffmpeg(['-y', '-i', inputs[0], '-c', 'copy', outPath], 300_000)
    return res.ok
      ? { ok: true, path: outPath, detail: '单片段直出' }
      : { ok: false, path: '', detail: `拼接失败：${res.stderr.slice(-300)}` }
  }
  const dir = join(dataRoot(), 'compose')
  mkdirSync(dir, { recursive: true })
  const listPath = join(dir, `concat-${Date.now()}.txt`)
  writeFileSync(listPath, inputs.map(p => `file '${p.replace(/'/g, "'\\''")}'`).join('\n'), 'utf8')
  const res = await ffmpeg([
    '-y', '-f', 'concat', '-safe', '0', '-i', listPath,
    '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20', '-c:a', 'aac',
    '-movflags', '+faststart', outPath,
  ], 900_000)
  if (!res.ok) return { ok: false, path: '', detail: `拼接失败：${res.stderr.slice(-300)}` }
  return { ok: true, path: outPath, detail: `${inputs.length} 段已拼接` }
}

/** 生成最小合法 SRT（单条或多条）。 */
export function buildSrt(cues: Array<{ start: number; end: number; text: string }>): string {
  const stamp = (sec: number): string => {
    const h = Math.floor(sec / 3600)
    const m = Math.floor((sec % 3600) / 60)
    const s = Math.floor(sec % 60)
    const ms = Math.round((sec - Math.floor(sec)) * 1000)
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')},${String(ms).padStart(3, '0')}`
  }
  return cues.map((cue, i) => `${i + 1}\n${stamp(cue.start)} --> ${stamp(cue.end)}\n${cue.text}\n`).join('\n')
}

/** ffmpeg 是否可用（面板要能提前告诉用户"没装 ffmpeg"）。 */
export async function composeReady(): Promise<{ ok: boolean; ffmpeg: string | null }> {
  const found = await resolveFfmpeg()
  return { ok: found !== null, ffmpeg: found?.path ?? null }
}
