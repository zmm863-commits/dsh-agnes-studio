/**
 * 歌词时间轴对齐 —— 把一段歌词排成带时间戳的字幕。
 *
 * 没有强制对齐模型，所以用两层信息拼出来：
 *   1. **按字数分配**：每行分到的时间与它的字数成正比（比均分贴近真实语速）；
 *   2. **静音吸附**：用 ffmpeg 的 silencedetect 找出句间停顿，把行边界吸到最近的
 *      停顿中点（阈值内）；找不到停顿就保持比例结果。
 *
 * 这是"够用的对齐"，不是"逐字对齐"。它输出的 SRT 能直接烧进视频，
 * 而且**在结果里明确标注哪些行是吸附的、哪些是纯比例**，不假装精确。
 */
import { ffmpeg } from './ffmpeg.js'

/** 一行歌词的时间窗。 */
export interface LyricCue {
  index: number
  text: string
  start: number
  end: number
  /** 边界是否吸附到静音点。 */
  snapped: boolean
}

/** 对齐结果。 */
export interface LyricAlignment {
  durationSec: number
  cues: LyricCue[]
  /** 检测到的静音区间（秒）。 */
  silences: Array<{ start: number; end: number }>
  /** 没有歌词行时的说明。 */
  warning?: string
}

/** 读媒体时长。 */
export async function probeAudioDuration(path: string): Promise<number> {
  const res = await ffmpeg(['-i', path], 30_000)
  const m = /Duration:\s*(\d+):(\d+):(\d+\.?\d*)/.exec(res.stderr)
  return m === null ? 0 : Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3])
}

/**
 * 用 silencedetect 找停顿。
 *
 * @param audioPath - 音频/视频路径。
 * @param noiseDb - 静音阈值（默认 -35dB，人声素材常用）。
 * @param minSilenceSec - 认定为停顿的最短时长。
 * @returns 静音区间列表（按时间升序）。
 */
export async function detectSilences(
  audioPath: string,
  noiseDb = -35,
  minSilenceSec = 0.35,
): Promise<Array<{ start: number; end: number }>> {
  const res = await ffmpeg([
    '-i', audioPath,
    '-af', `silencedetect=noise=${noiseDb}dB:d=${minSilenceSec}`,
    '-f', 'null', '-',
  ], 600_000)
  const silences: Array<{ start: number; end: number }> = []
  const startRe = /silence_start:\s*(-?[0-9.]+)/g
  const endRe = /silence_end:\s*([0-9.]+)/g
  const starts: number[] = []
  const ends: number[] = []
  let m: RegExpExecArray | null
  while ((m = startRe.exec(res.stderr)) !== null) starts.push(Number(m[1]))
  while ((m = endRe.exec(res.stderr)) !== null) ends.push(Number(m[1]))
  for (let i = 0; i < starts.length; i++) {
    const start = Math.max(0, starts[i])
    const end = ends[i] ?? Number.NaN
    if (Number.isFinite(end) && end > start) silences.push({ start, end })
  }
  return silences
}

/** 把歌词切成行（去掉空行与纯标记行）。 */
export function splitLyricLines(lyrics: string): string[] {
  return lyrics
    .replace(/\r/g, '')
    .split('\n')
    .map(line => line.trim())
    .filter(line => line !== '' && !/^\[[^\]]*\]$/.test(line))
}

/**
 * 对齐歌词。
 *
 * @param lyrics - 原始歌词（按行）。
 * @param audioPath - 音频路径（用于读时长与静音）。
 * @param options - 吸附窗口（秒）与最小行时长。
 * @returns 带时间戳的歌词行。
 */
export async function alignLyrics(
  lyrics: string,
  audioPath: string,
  options: { snapWindowSec?: number; minLineSec?: number } = {},
): Promise<LyricAlignment> {
  const durationSec = await probeAudioDuration(audioPath)
  if (durationSec <= 0) {
    throw new Error(`读不出音频时长：${audioPath}`)
  }
  const lines = splitLyricLines(lyrics)
  if (lines.length === 0) {
    return { durationSec, cues: [], silences: [], warning: '歌词是空的' }
  }

  const snapWindow = options.snapWindowSec ?? 1.6
  const minLineSec = options.minLineSec ?? 0.6

  // 1. 按字数比例分配
  const weights = lines.map(line => Math.max(1, line.replace(/\s/g, '').length))
  const totalWeight = weights.reduce((sum, w) => sum + w, 0)
  const cues: LyricCue[] = []
  let cursor = 0
  for (let i = 0; i < lines.length; i++) {
    const span = (weights[i] / totalWeight) * durationSec
    const start = cursor
    const end = i === lines.length - 1 ? durationSec : Math.min(durationSec, cursor + Math.max(minLineSec, span))
    cues.push({ index: i + 1, text: lines[i], start, end, snapped: false })
    cursor = end
  }

  // 2. 静音吸附：把内部边界往最近的停顿中点挪
  const silences = await detectSilences(audioPath).catch(() => [] as Array<{ start: number; end: number }>)
  const midpoints = silences.map(s => (s.start + s.end) / 2)

  for (let i = 0; i < cues.length - 1; i++) {
    const boundary = cues[i].end
    let best: number | undefined
    let bestDistance = Number.POSITIVE_INFINITY
    for (const mid of midpoints) {
      const distance = Math.abs(mid - boundary)
      if (distance < bestDistance) {
        bestDistance = distance
        best = mid
      }
    }
    if (best !== undefined && bestDistance <= snapWindow) {
      // 保证行不短于下限，也不越过相邻边界
      const lowerBound = cues[i].start + minLineSec
      const upperBound = cues[i + 1].end - minLineSec
      const target = Math.min(upperBound, Math.max(lowerBound, best))
      if (target > cues[i].start + 0.05 && target < cues[i + 1].end - 0.05) {
        cues[i].end = Number(target.toFixed(2))
        cues[i + 1].start = Number(target.toFixed(2))
        cues[i].snapped = true
        cues[i + 1].snapped = true
      }
    }
  }

  // 3. 规整：保证单调且不越界
  for (let i = 0; i < cues.length; i++) {
    if (i > 0 && cues[i].start < cues[i - 1].end) cues[i].start = cues[i - 1].end
    if (cues[i].end <= cues[i].start) cues[i].end = Math.min(durationSec, cues[i].start + minLineSec)
  }

  return {
    durationSec,
    cues,
    silences,
    warning: silences.length === 0 ? '没有检测到明显停顿，时间轴按字数比例分配' : undefined,
  }
}

/** 对齐结果 → SRT 文本。 */
export function cuesToSrt(cues: LyricCue[]): string {
  const stamp = (sec: number): string => {
    const h = Math.floor(sec / 3600)
    const m = Math.floor((sec % 3600) / 60)
    const s = Math.floor(sec % 60)
    const ms = Math.round((sec - Math.floor(sec)) * 1000)
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')},${String(ms).padStart(3, '0')}`
  }
  return cues.map(cue => `${cue.index}\n${stamp(cue.start)} --> ${stamp(cue.end)}\n${cue.text}\n`).join('\n')
}

/** 对齐结果 → LRC 文本（给播放器用）。 */
export function cuesToLrc(cues: LyricCue[]): string {
  const stamp = (sec: number): string => {
    const m = Math.floor(sec / 60)
    const s = sec % 60
    return `[${String(m).padStart(2, '0')}:${s.toFixed(2).padStart(5, '0')}]`
  }
  return cues.map(cue => `${stamp(cue.start)}${cue.text}`).join('\n')
}
