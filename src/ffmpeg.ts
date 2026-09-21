/**
 * ffmpeg 能力层（Host 端）—— 短剧拼接与口播合成都依赖它。
 *
 * 设计要点（全部经真实调用验证过）：
 *  - ffmpeg 可能不在 PATH（用户机器常见），所以定位是多级回退 + 可缓存。
 *  - 每次探测都返回结构化结果，绝不 throw 到调用方之外：缺 ffmpeg 时前端要能
 *    看到"缺什么、怎么装"，而不是一个空白错误。
 *  - 中文字幕需要 CJK 字体；只装了 DejaVu 的机器会把汉字烧成豆腐块，
 *    所以字体是"探测 + 明确报错"，不静默退化。
 */

import { spawn } from 'node:child_process'
import { existsSync, mkdirSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, dirname } from 'node:path'

// ─── 路径 ──────────────────────────────────────────────────────────────────

/** Cross-platform data root (Linux: /tmp, Windows: %TEMP%). */
export function dataRoot(): string {
  const dir = join(tmpdir(), 'dsh-agnes-studio')
  try { mkdirSync(dir, { recursive: true }) } catch {}
  return dir
}

/** Directory for one drama task's media. */
export function dramaDir(id: string): string {
  const dir = join(dataRoot(), 'dramas', id)
  try { mkdirSync(dir, { recursive: true }) } catch {}
  return dir
}

/** Directory for one talking-avatar job's media. */
export function anchorDir(id: string): string {
  const dir = join(dataRoot(), 'anchors', id)
  try { mkdirSync(dir, { recursive: true }) } catch {}
  return dir
}

// ─── ffmpeg 定位 ────────────────────────────────────────────────────────────

const FFMPEG_CANDIDATES = [
  '/usr/bin/ffmpeg',
  '/usr/local/bin/ffmpeg',
  '/opt/homebrew/bin/ffmpeg',           // macOS (Apple Silicon)
  'C:\\ffmpeg\\bin\\ffmpeg.exe',
]
const FFPROBE_CANDIDATES = [
  '/usr/bin/ffprobe',
  '/usr/local/bin/ffprobe',
  '/opt/homebrew/bin/ffprobe',
  'C:\\ffmpeg\\bin\\ffprobe.exe',
]

let cachedFfmpeg: { path: string; version: string } | null = null
let cachedProbeMissing = false

/** Run a command, resolving with exit code + captured output. Never rejects. */
function exec(
  cmd: string,
  args: string[],
  timeoutMs = 600_000,
): Promise<{ code: number; stdout: string; stderr: string; error?: string }> {
  return new Promise(resolve => {
    let child: ReturnType<typeof spawn>
    try {
      child = spawn(cmd, args, { windowsHide: true })
    } catch (e) {
      resolve({ code: -1, stdout: '', stderr: '', error: e instanceof Error ? e.message : String(e) })
      return
    }
    let stdout = ''
    let stderr = ''
    let done = false
    const finish = (r: { code: number; stdout: string; stderr: string; error?: string }) => {
      if (done) return
      done = true
      clearTimeout(timer)
      resolve(r)
    }
    const timer = setTimeout(() => {
      try { child.kill('SIGKILL') } catch {}
      finish({ code: -1, stdout, stderr, error: `命令超时（${Math.round(timeoutMs / 1000)}s）` })
    }, timeoutMs)
    child.stdout?.on('data', d => { stdout += String(d) })
    child.stderr?.on('data', d => { stderr += String(d) })
    child.on('error', e => finish({ code: -1, stdout, stderr, error: e.message }))
    child.on('close', code => finish({ code: code ?? -1, stdout, stderr }))
  })
}

/**
 * Locate a usable ffmpeg.
 * Order: AGNES_FFMPEG env → PATH (`ffmpeg -version`) → common install paths.
 */
export async function resolveFfmpeg(): Promise<{ path: string; version: string } | null> {
  if (cachedFfmpeg) return cachedFfmpeg

  const fromEnv = process.env.AGNES_FFMPEG
  const candidates: string[] = []
  if (fromEnv) candidates.push(fromEnv)
  candidates.push('ffmpeg')                       // relies on PATH
  for (const c of FFMPEG_CANDIDATES) if (!candidates.includes(c)) candidates.push(c)

  for (const cmd of candidates) {
    if (cmd.includes('/') || cmd.includes('\\')) {
      if (!existsSync(cmd)) continue
    }
    const r = await exec(cmd, ['-version'], 15_000)
    if (r.code === 0 && /ffmpeg version/i.test(r.stdout + r.stderr)) {
      const version = (r.stdout + r.stderr).split('\n')[0].trim()
      cachedFfmpeg = { path: cmd, version }
      return cachedFfmpeg
    }
  }
  return null
}

/** Locate ffprobe (for duration/dimension probing). Returns '' when absent. */
let cachedFfprobe: string | null = null
export async function resolveFfprobe(): Promise<string> {
  if (cachedFfprobe !== null) return cachedFfprobe
  if (cachedProbeMissing) return ''
  const fromEnv = process.env.AGNES_FFPROBE
  const candidates: string[] = []
  if (fromEnv) candidates.push(fromEnv)
  candidates.push('ffprobe')
  for (const c of FFPROBE_CANDIDATES) if (!candidates.includes(c)) candidates.push(c)
  for (const cmd of candidates) {
    if (cmd.includes('/') || cmd.includes('\\')) {
      if (!existsSync(cmd)) continue
    }
    const r = await exec(cmd, ['-version'], 10_000)
    if (r.code === 0 && /ffprobe version/i.test(r.stdout + r.stderr)) {
      cachedFfprobe = cmd
      return cmd
    }
  }
  cachedProbeMissing = true
  return ''
}

/** Capability report for the UI / smoke tests. */
export async function ffmpegStatus(): Promise<{
  available: boolean
  path: string
  version: string
  ffprobe: boolean
  font: string
  hint: string
}> {
  const ff = await resolveFfmpeg()
  const probe = await resolveFfprobe()
  const font = findCjkFont()
  return {
    available: ff !== null,
    path: ff?.path ?? '',
    version: ff?.version ?? '',
    ffprobe: probe !== '',
    font,
    hint: ff
      ? font
        ? ''
        : '未找到中文字体；烧字幕会显示成方块。请安装中文字体（如 fonts-wqy-zenhei / 思源黑体）。'
      : '未找到 ffmpeg。Linux: apt-get install -y ffmpeg；macOS: brew install ffmpeg；Windows: 安装 ffmpeg 并加入 PATH，或设置 AGNES_FFMPEG 指向 ffmpeg.exe。',
  }
}

// ─── 中文字体 ───────────────────────────────────────────────────────────────

const CJK_FONT_CANDIDATES = [
  // Linux
  '/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc',
  '/usr/share/fonts/truetype/wqy/wqy-microhei.ttc',
  '/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc',
  '/usr/share/fonts/opentype/noto/NotoSerifCJK-Regular.ttc',
  '/usr/share/fonts/truetype/noto/NotoSansCJK-Regular.ttc',
  '/usr/share/fonts/truetype/arphic/uming.ttc',
  // macOS
  '/System/Library/Fonts/PingFang.ttc',
  '/System/Library/Fonts/Hiragino Sans GB.ttc',
  '/Library/Fonts/Arial Unicode.ttf',
  // Windows
  'C:\\Windows\\Fonts\\msyh.ttc',
  'C:\\Windows\\Fonts\\msyh.ttf',
  'C:\\Windows\\Fonts\\simhei.ttf',
  'C:\\Windows\\Fonts\\simsun.ttc',
]

let cachedFont: string | null = null

/**
 * Find a font file that can render Chinese.
 * Returns '' when none is present — callers must surface that instead of
 * burning tofu boxes into the output video.
 */
export function findCjkFont(): string {
  if (cachedFont !== null) return cachedFont
  const fromEnv = process.env.AGNES_SUBTITLE_FONT
  if (fromEnv && existsSync(fromEnv)) { cachedFont = fromEnv; return cachedFont }
  for (const f of CJK_FONT_CANDIDATES) {
    if (existsSync(f)) { cachedFont = f; return cachedFont }
  }
  cachedFont = ''
  return cachedFont
}

/** libass `force_style` FontName that matches the discovered font file. */
function fontFamilyFor(file: string): string {
  const lower = file.toLowerCase()
  if (lower.includes('wqy-zenhei')) return 'WenQuanYi Zen Hei'
  if (lower.includes('wqy-microhei')) return 'WenQuanYi Micro Hei'
  if (lower.includes('pingfang')) return 'PingFang SC'
  if (lower.includes('hiragino')) return 'Hiragino Sans GB'
  if (lower.includes('msyh')) return 'Microsoft YaHei'
  if (lower.includes('simhei')) return 'SimHei'
  if (lower.includes('simsun')) return 'SimSun'
  if (lower.includes('noto')) return 'Noto Sans CJK SC'
  return 'sans-serif'
}

// ─── 基础操作 ───────────────────────────────────────────────────────────────

export interface FfmpegResult { ok: boolean; error?: string; output: string; stderr: string }

/** Probe a media file (duration seconds, dimensions, codec identity). */
export async function probeMedia(file: string): Promise<{
  ok: boolean
  duration: number
  width: number
  height: number
  hasAudio: boolean
  videoCodec: string
  audioCodec: string
  pixFmt: string
  fps: number
  error?: string
}> {
  const probe = await resolveFfprobe()
  const empty = {
    ok: false, duration: 0, width: 0, height: 0, hasAudio: false,
    videoCodec: '', audioCodec: '', pixFmt: '', fps: 0,
  }
  if (!probe) return { ...empty, error: 'ffprobe 不可用' }
  const r = await exec(probe, [
    '-v', 'error', '-show_entries',
    'format=duration:stream=codec_type,codec_name,width,height,pix_fmt,r_frame_rate',
    '-of', 'json', file,
  ], 60_000)
  if (r.code !== 0) return { ...empty, error: r.stderr.slice(0, 300) }
  try {
    const d = JSON.parse(r.stdout) as {
      format?: { duration?: string }
      streams?: Array<{ codec_type?: string; codec_name?: string; width?: number; height?: number; pix_fmt?: string; r_frame_rate?: string }>
    }
    const streams = d.streams ?? []
    const v = streams.find(s => s.codec_type === 'video')
    const a = streams.find(s => s.codec_type === 'audio')
    let fps = 0
    const rate = v?.r_frame_rate ?? ''
    if (rate.includes('/')) {
      const [n, den] = rate.split('/').map(Number)
      if (den) fps = n / den
    }
    return {
      ok: true,
      duration: Number(d.format?.duration ?? 0),
      width: v?.width ?? 0,
      height: v?.height ?? 0,
      hasAudio: a !== undefined,
      videoCodec: v?.codec_name ?? '',
      audioCodec: a?.codec_name ?? '',
      pixFmt: v?.pix_fmt ?? '',
      fps: Number.isFinite(fps) ? Math.round(fps * 100) / 100 : 0,
    }
  } catch (e) {
    return { ...empty, error: String(e) }
  }
}

/** Run an ffmpeg command with the located binary. */
export async function ffmpeg(args: string[], timeoutMs = 1_800_000): Promise<FfmpegResult> {
  const ff = await resolveFfmpeg()
  if (!ff) return { ok: false, error: '未找到 ffmpeg', output: '', stderr: '' }
  const r = await exec(ff.path, ['-hide_banner', '-y', ...args], timeoutMs)
  if (r.code !== 0) {
    return { ok: false, error: (r.error || r.stderr.split('\n').filter(Boolean).slice(-3).join(' | ')).slice(0, 500), output: r.stdout, stderr: r.stderr }
  }
  return { ok: true, output: r.stdout, stderr: r.stderr }
}

// ─── 字幕 ───────────────────────────────────────────────────────────────────

export interface SubtitleCue { start: number; end: number; text: string }

/** Format seconds as SRT timestamp (HH:MM:SS,mmm). */
function srtTime(sec: number): string {
  const s = Math.max(0, sec)
  const hh = Math.floor(s / 3600)
  const mm = Math.floor((s % 3600) / 60)
  const ss = Math.floor(s % 60)
  const ms = Math.round((s - Math.floor(s)) * 1000)
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')},${String(ms).padStart(3, '0')}`
}

/** Build SRT text from cues. */
export function buildSrt(cues: SubtitleCue[]): string {
  return cues
    .filter(c => String(c.text ?? '').trim() !== '')
    .map((c, i) => `${i + 1}\n${srtTime(c.start)} --> ${srtTime(c.end)}\n${String(c.text).trim()}\n`)
    .join('\n')
}

/** ASS timestamp: H:MM:SS.cc */
function assTime(sec: number): string {
  const s = Math.max(0, sec)
  const hh = Math.floor(s / 3600)
  const mm = Math.floor((s % 3600) / 60)
  const ss = Math.floor(s % 60)
  const cs = Math.round((s - Math.floor(s)) * 100)
  return `${hh}:${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}.${String(Math.min(99, cs)).padStart(2, '0')}`
}

/** Neutralise characters ASS would interpret as markup. */
/**
 * Approximate advance width of one character, in em units.
 * CJK/full-width glyphs are ~1em; Latin/digits ~0.55em; space ~0.3em.
 */
function charWidth(ch: string): number {
  const c = ch.codePointAt(0) ?? 0
  const wide =
    (c >= 0x1100 && c <= 0x115f) ||
    c === 0x2329 || c === 0x232a ||
    (c >= 0x2e80 && c <= 0xa4cf && c !== 0x303f) ||   // CJK radicals … Yi
    (c >= 0xac00 && c <= 0xd7a3) ||                    // Hangul
    (c >= 0xf900 && c <= 0xfaff) ||                    // CJK compatibility
    (c >= 0xfe30 && c <= 0xfe6f) ||                    // CJK punctuation
    (c >= 0xff00 && c <= 0xff60) ||                    // full-width forms
    (c >= 0xffe0 && c <= 0xffe6)
  if (wide) return 1
  if (c === 0x20 || c === 0x3000) return 0.3
  return 0.55
}

/**
 * Break a cue into lines that fit `maxUnits` em-widths.
 *
 * libass did NOT wrap space-less Chinese even with WrapStyle 0 — a 41-char cue
 * rendered straight across the frame and got clipped at both edges — so the
 * line breaks are inserted here instead of being delegated to the renderer.
 * Returns text with real newlines; escapeAssText turns them into \N.
 */
export function wrapForAss(text: string, maxUnits: number): string {
  const lines: string[] = []
  for (const para of String(text ?? '').split(/\r?\n/)) {
    if (para === '') { lines.push(''); continue }
    let line = ''
    let w = 0
    for (const ch of Array.from(para)) {
      const cw = charWidth(ch)
      if (w + cw > maxUnits && line !== '') { lines.push(line); line = ''; w = 0 }
      line += ch
      w += cw
    }
    if (line !== '') lines.push(line)
  }
  return lines.join('\n')
}

function escapeAssText(t: string): string {
  return String(t)
    .replace(/\\/g, '\\\\')
    .replace(/\{/g, '(')
    .replace(/\}/g, ')')
    .replace(/\r?\n/g, '\\N')
    .trim()
}

/**
 * Build an ASS subtitle script with an explicit resolution.
 *
 * Why ASS and not SRT: when libass is handed a bare SRT it assumes a 288-line
 * script resolution, so FontSize/MarginV are multiplied by (videoHeight / 288)
 * — at 720p a "24px" subtitle actually rendered ~60px tall and sat far too high.
 * Declaring PlayResX/PlayResY makes those values true pixels.
 */
export function buildAss(
  cues: SubtitleCue[],
  opts: { width: number; height: number; fontName: string; fontSize?: number; marginV?: number },
): string {
  const { width, height, fontName } = opts
  const fontSize = opts.fontSize ?? Math.max(18, Math.round(height * 0.058))   // ≈42px @720p
  const marginV = opts.marginV ?? Math.max(18, Math.round(height * 0.055))     // ≈40px @720p
  const outline = Math.max(1, Math.round(height * 0.004))
  const header = [
    '[Script Info]',
    'ScriptType: v4.00+',
    `PlayResX: ${width}`,
    `PlayResY: ${height}`,
    // 0 = smart wrapping. Style 2 ("no wrapping, honour \N only") made long
    // Chinese cues run past both margins and get clipped off-screen, because
    // nothing in the pipeline inserts explicit line breaks.
    'WrapStyle: 0',
    'ScaledBorderAndShadow: yes',
    'YCbCr Matrix: None',
    '',
    '[V4+ Styles]',
    'Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding',
    `Style: Default,${fontName},${fontSize},&H00FFFFFF,&H000000FF,&H00000000,&H64000000,0,0,0,0,100,100,0,0,1,${outline},0,2,40,40,${marginV},1`,
    '',
    '[Events]',
    'Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text',
  ].join('\n')
  // margins are 40/40 in the Style row below
  const usable = Math.max(200, width - 80)
  const maxUnits = Math.max(8, Math.floor(usable / fontSize))
  const events = cues
    .filter(c => String(c.text ?? '').trim() !== '')
    .map(c => `Dialogue: 0,${assTime(c.start)},${assTime(c.end)},Default,,0,0,0,,${escapeAssText(wrapForAss(c.text, maxUnits))}`)
    .join('\n')
  return `${header}\n${events}\n`
}

/**
 * Escape a path for use inside an ffmpeg filter argument.
 * Colons and backslashes are filter syntax, so Windows paths need care.
 */
function escapeFilterPath(p: string): string {
  return p.replace(/\\/g, '/').replace(/:/g, '\\:').replace(/'/g, "\\'")
}

/** Escape text for drawtext. */
function escapeDrawtext(t: string): string {
  return t.replace(/\\/g, '\\\\').replace(/:/g, '\\:').replace(/'/g, "\\'").replace(/%/g, '\\%')
}

/**
 * Burn subtitles into a video.
 *
 * `cues` are written to a real .ass file next to the output (libass reads it
 * from disk), sized against the input's actual resolution.
 */
export async function burnSubtitles(
  input: string,
  cues: SubtitleCue[],
  output: string,
  opts: { fontSize?: number; marginV?: number } = {},
): Promise<FfmpegResult> {
  const font = findCjkFont()
  if (!font) {
    return { ok: false, error: '缺少中文字体，无法烧录字幕（请安装中文字体或设置 AGNES_SUBTITLE_FONT）', output: '', stderr: '' }
  }
  const probe = await probeMedia(input)
  const width = probe.width || 1280
  const height = probe.height || 720
  const assPath = output.replace(/\.[^.]+$/, '') + '.ass'
  try {
    writeFileSync(assPath, buildAss(cues, {
      width, height, fontName: fontFamilyFor(font),
      fontSize: opts.fontSize, marginV: opts.marginV,
    }), 'utf8')
  } catch (e) {
    return { ok: false, error: `无法写入字幕文件：${String(e)}`, output: '', stderr: '' }
  }
  return ffmpeg([
    '-i', input,
    '-vf', `subtitles=${escapeFilterPath(assPath)}`,
    '-c:a', 'copy',
    output,
  ])
}

// ─── 拼接 ───────────────────────────────────────────────────────────────────

/**
 * Concatenate videos in order.
 *
 * `-c copy` is lossless and fast, but requires identical codec parameters;
 * mixing resolutions/framerates produces a broken file. So we probe first and
 * re-encode only when the inputs actually differ.
 */
export async function concatVideos(
  files: string[],
  output: string,
  opts: { reencode?: boolean; onProgress?: (msg: string) => void } = {},
): Promise<FfmpegResult & { mode?: 'copy' | 'reencode' }> {
  if (files.length === 0) return { ok: false, error: '没有可拼接的视频', output: '', stderr: '' }
  if (files.length === 1) {
    const r = await ffmpeg(['-i', files[0], '-c', 'copy', output])
    return { ...r, mode: 'copy' }
  }

  let probes = await Promise.all(files.map(f => probeMedia(f)))
  if (probes.some(p => !p.ok)) return { ok: false, error: '无法探测输入视频（ffprobe 失败）', output: '', stderr: '' }

  let mode: 'copy' | 'reencode' = opts.reencode ? 'reencode' : 'copy'
  const first = probes[0]
  // Frame rate matters as much as resolution: a 24fps and a 25fps clip with
  // identical dimensions still corrupt the concat demuxer's timestamps.
  const uniform = probes.every(
    p => p.width === first.width
      && p.height === first.height
      && p.videoCodec === first.videoCodec
      && p.pixFmt === first.pixFmt
      && Math.abs(p.fps - first.fps) < 0.01
      && p.hasAudio === first.hasAudio
      && (!first.hasAudio || p.audioCodec === first.audioCodec),
  )
  if (!opts.reencode && !uniform) {
    mode = 'reencode'
    opts.onProgress?.('检测到镜头参数不一致，正在逐个归一化后拼接（较慢）')
  }

  const listPath = join(dirname(output), `concat-${Date.now()}.txt`)
  const tempFiles: string[] = []
  try {
    let inputs = files

    if (mode === 'reencode') {
      // The concat *demuxer* assumes identical stream parameters. Feeding it
      // clips that differ corrupts timestamps (observed: 7.5s of video inside a
      // 9.96s container). Normalise EVERY clip to one spec, then concat with
      // `-c copy` so the demuxer only ever sees uniform input.
      const target = {
        width: first.width || 1280,
        height: first.height || 720,
        fps: first.fps > 0 && first.fps <= 60 ? first.fps : 25,
      }
      inputs = []
      for (const [i, file] of files.entries()) {
        const norm = join(dirname(output), `norm-${Date.now()}-${i}.mp4`)
        const res = await normalizeClip(file, norm, target)
        if (!res.ok) {
          return { ok: false, error: `镜头 ${i + 1} 归一化失败：${res.error}`, output: '', stderr: '' }
        }
        tempFiles.push(norm)
        inputs.push(norm)
      }
      probes = await Promise.all(inputs.map(f => probeMedia(f)))
    }

    writeFileSync(listPath, inputs.map(f => `file '${f.replace(/'/g, "'\\''")}'`).join('\n') + '\n', 'utf8')
    const r = await ffmpeg(['-f', 'concat', '-safe', '0', '-i', listPath, '-c', 'copy', output])
    return { ...r, mode }
  } finally {
    try { rmSync(listPath, { force: true }) } catch {}
    for (const f of tempFiles) { try { rmSync(f, { force: true }) } catch {} }
  }
}

/**
 * Re-encode one clip to a fixed spec (size, fps, h264/yuv420p, aac stereo).
 * Missing audio is filled with silence so every clip has the same streams —
 * required for a lossless concat afterwards.
 */
async function normalizeClip(
  input: string,
  output: string,
  spec: { width: number; height: number; fps: number },
): Promise<FfmpegResult> {
  const probe = await probeMedia(input)
  const videoFilter =
    `scale=${spec.width}:${spec.height}:force_original_aspect_ratio=decrease,` +
    `pad=${spec.width}:${spec.height}:(ow-iw)/2:(oh-ih)/2,setsar=1,fps=${spec.fps}`
  const base = ['-i', input]
  if (!probe.hasAudio) {
    base.push('-f', 'lavfi', '-i', 'anullsrc=channel_layout=stereo:sample_rate=44100')
  }
  return ffmpeg([
    ...base,
    '-vf', videoFilter,
    '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-preset', 'medium', '-crf', '20',
    '-c:a', 'aac', '-b:a', '128k', '-ar', '44100', '-ac', '2',
    '-shortest',
    output,
  ])
}

// ─── 口播合成 ───────────────────────────────────────────────────────────────

/**
 * Mux a narration track over visuals, then burn subtitles.
 * Used by the talking-avatar pipeline (B).
 */
export async function muxNarration(opts: {
  visualInput: string
  audioInput: string
  output: string
  cues?: SubtitleCue[]
  fontSize?: number
}): Promise<FfmpegResult> {
  const filters: string[] = []
  if (opts.cues && opts.cues.length > 0) {
    const font = findCjkFont()
    if (!font) {
      return { ok: false, error: '缺少中文字体，无法烧录字幕', output: '', stderr: '' }
    }
    const probe = await probeMedia(opts.visualInput)
    const assPath = opts.output.replace(/\.[^.]+$/, '') + '.ass'
    try {
      writeFileSync(assPath, buildAss(opts.cues, {
        width: probe.width || 1280,
        height: probe.height || 720,
        fontName: fontFamilyFor(font),
        fontSize: opts.fontSize,
      }), 'utf8')
    } catch (e) {
      return { ok: false, error: `无法写入字幕文件：${String(e)}`, output: '', stderr: '' }
    }
    filters.push(`subtitles=${escapeFilterPath(assPath)}`)
  }
  const args = [
    '-i', opts.visualInput,
    '-i', opts.audioInput,
    ...(filters.length ? ['-vf', filters.join(',')] : []),
    '-map', '0:v:0', '-map', '1:a:0',
    '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-preset', 'medium', '-crf', '20',
    '-c:a', 'aac', '-b:a', '128k',
    '-shortest',
    opts.output,
  ]
  return ffmpeg(args)
}

/** Build a still-image slideshow video of `duration` seconds from one image. */
export async function imageToVideo(
  image: string, output: string, duration: number,
  size: { width: number; height: number } = { width: 1280, height: 720 },
): Promise<FfmpegResult> {
  // scale + pad keeps aspect ratio (no distortion), then loop for the duration.
  return ffmpeg([
    '-loop', '1', '-t', String(Math.max(0.5, duration)), '-i', image,
    '-vf', `scale=${size.width}:${size.height}:force_original_aspect_ratio=decrease,pad=${size.width}:${size.height}:(ow-iw)/2:(oh-ih)/2,setsar=1,fps=25`,
    '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-preset', 'medium', '-crf', '20',
    output,
  ])
}

/** Concatenate audio files with optional silence gaps between them. */
export async function concatAudio(
  segments: Array<{ file: string; silenceAfterMs?: number }>,
  output: string,
): Promise<FfmpegResult> {
  if (segments.length === 0) return { ok: false, error: '没有音频段', output: '', stderr: '' }
  if (segments.length === 1 && !segments[0].silenceAfterMs) {
    return ffmpeg(['-i', segments[0].file, '-c', 'copy', output])
  }
  const dir = dirname(output)
  const silenceFiles: string[] = []
  try {
    const inputs: string[] = []
    for (const [i, seg] of segments.entries()) {
      inputs.push(seg.file)
      const gap = seg.silenceAfterMs ?? 0
      if (gap > 0 && i < segments.length - 1) {
        const sf = join(dir, `sil-${Date.now()}-${i}.wav`)
        const r = await ffmpeg(['-f', 'lavfi', '-i', 'anullsrc=r=24000:cl=mono', '-t', String(gap / 1000), '-c:a', 'pcm_s16le', sf])
        if (r.ok) { silenceFiles.push(sf); inputs.push(sf) }
      }
    }
    const args: string[] = []
    for (const f of inputs) args.push('-i', f)
    const listPath = join(dir, `acat-${Date.now()}.txt`)
    writeFileSync(listPath, inputs.map(f => `file '${f.replace(/'/g, "'\\''")}'`).join('\n') + '\n', 'utf8')
    try {
      const r = await ffmpeg([
        '-f', 'concat', '-safe', '0', '-i', listPath,
        '-c:a', 'pcm_s16le', '-ar', '24000', '-ac', '1', output,
      ])
      return r
    } finally {
      try { rmSync(listPath, { force: true }) } catch {}
    }
  } finally {
    for (const f of silenceFiles) { try { rmSync(f, { force: true }) } catch {} }
  }
}
