/**
 * 数字人口播引擎（Host 端）—— 文稿 → 分段 → TTS 配音 → 画面 → 字幕 → 合成。
 *
 * 真实验证过的依赖：
 *  - MiMo TTS（mimo-v2.5-tts，POST /chat/completions，返回 base64 wav）——已实测
 *  - ffmpeg（拼接 / 字幕烧录 / 音画合成）——已实测
 *  - 中文 CJK 字体 —— 缺失时明确报错，绝不静默出豆腐块
 *
 * 画面三种模式：
 *  static  静态形象图：任意图片循环展示（最稳、最快，推荐）
 *  clip    视频素材：上传视频循环/裁剪到旁白长度
 *  ai      AI 生成画面：用 Agnes 文生视频生成一段背景片，再循环铺满旁白
 */

import { randomUUID } from 'node:crypto'
import { writeFileSync, existsSync, statSync, readFileSync, readdirSync } from 'node:fs'
import { join, basename, resolve } from 'node:path'
import {
  anchorDir, probeMedia, concatAudio, concatVideos, muxNarration, imageToVideo,
  buildSrt, findCjkFont, ffmpeg, ffmpegStatus, dataRoot,
} from './ffmpeg.js'

// ─── 类型 ───────────────────────────────────────────────────────────────────

export type AnchorStatus = 'pending' | 'tts' | 'visual' | 'muxing' | 'completed' | 'failed' | 'stopped'
export type VisualMode = 'static' | 'clip' | 'ai'

export interface AnchorSegment {
  index: number
  text: string
  audioFile?: string
  start: number
  end: number
  duration: number
  status: 'pending' | 'done' | 'failed'
  error?: string
}

export interface AnchorTask {
  anchor_id: string
  text: string
  mode: VisualMode
  status: AnchorStatus
  message: string
  voice: string
  min_seg_sec: number
  burn_subtitles: boolean
  image_path?: string
  clip_path?: string
  ai_prompt?: string
  /** AI 模式：true = 每段台词各生成一段画面；false = 生成一段背景循环铺满 */
  ai_per_segment?: boolean
  segments: AnchorSegment[]
  total_duration: number
  final_file?: string
  error?: string
  created_at: number
  updated_at: number
}

/** Host capabilities injected by index.ts. */
export interface AnchorHost {
  /** Resolve the TTS credential (MiMo). */
  resolveTtsKey(): Promise<string>
  /** Call a vendor API (used for AI visuals). */
  call(vendor: string, endpoint: string, opts?: {
    method?: 'GET' | 'POST'; body?: unknown; timeoutMs?: number
  }): Promise<any>
}

// ─── 存储 ───────────────────────────────────────────────────────────────────

const anchorTasks = new Map<string, AnchorTask>()
const runningAnchors = new Set<string>()

function taskPath(id: string): string {
  const dir = anchorDir(id)
  return join(dir, 'task.json')
}

function save(task: AnchorTask): void {
  task.updated_at = Date.now()
  anchorTasks.set(task.anchor_id, task)
  try { writeFileSync(taskPath(task.anchor_id), JSON.stringify(task, null, 2), 'utf8') } catch {}
}

function load(id: string): AnchorTask | null {
  try {
    const p = taskPath(id)
    return existsSync(p) ? JSON.parse(readFileSync(p, 'utf8')) as AnchorTask : null
  } catch { return null }
}

function setStatus(task: AnchorTask, status: AnchorStatus, message: string): void {
  task.status = status
  task.message = message
  save(task)
}

// ─── 文稿分段 ───────────────────────────────────────────────────────────────

/** Rough Chinese speech rate used to estimate how long a segment will take. */
const CHARS_PER_SEC = 4.2

/**
 * Split narration into subtitle-sized segments.
 * Splits on sentence punctuation, then merges fragments that are too short and
 * splits any segment that is too long — so subtitles stay readable and each
 * TTS call stays small.
 */
export function segmentText(text: string, minSegSec: number): string[] {
  const clean = String(text ?? '').replace(/\r\n/g, '\n').trim()
  if (!clean) return []

  const rough = clean
    .split(/(?<=[。！？!?；;])|\n+/)
    .map(s => s.trim())
    .filter(Boolean)

  const minChars = Math.max(6, Math.round(minSegSec * CHARS_PER_SEC))
  const maxChars = 60

  const merged: string[] = []
  for (const piece of rough) {
    const last = merged[merged.length - 1]
    if (last !== undefined && last.length < minChars && (last + piece).length <= maxChars) {
      merged[merged.length - 1] = last + piece
    } else {
      merged.push(piece)
    }
  }

  // Split anything still too long, preferring comma boundaries.
  const out: string[] = []
  for (const seg of merged) {
    if (seg.length <= maxChars) { out.push(seg); continue }
    const parts = seg.split(/(?<=[，,、])/).map(s => s.trim()).filter(Boolean)
    let buf = ''
    for (const p of parts) {
      if ((buf + p).length > maxChars && buf) { out.push(buf); buf = p }
      else buf += p
    }
    if (buf) out.push(buf)
  }
  return out.filter(s => s.trim() !== '')
}

// ─── MiMo TTS ───────────────────────────────────────────────────────────────

const MIMO_DEFAULT_URL = 'https://api.xiaomimimo.com/v1'
const MIMO_TOKEN_PLAN_URL = 'https://token-plan-cn.xiaomimimo.com/v1'

/** MiMo routes Token-Plan keys (`tp-`) to a different cluster base URL. */
export function mimoBaseUrl(apiKey: string): string {
  return String(apiKey || '').trim().startsWith('tp-') ? MIMO_TOKEN_PLAN_URL : MIMO_DEFAULT_URL
}

/** Style instruction that makes the delivery sound like a person, not a robot. */
function ttsStyle(minSegSec: number): string {
  return '自然、清晰、适合中文口播解说。语气有感染力、有起伏，像在给观众讲故事，不要平淡机械。语速中等，节奏稳定。'
}

/**
 * Synthesize one segment with MiMo TTS.
 * Contract verified against the live API: POST /chat/completions with an
 * `audio` block; the WAV comes back base64 in choices[0].message.audio.data.
 */
async function synthesize(
  text: string, voice: string, outFile: string, apiKey: string, minSegSec: number,
): Promise<{ ok: boolean; error?: string }> {
  const url = `${mimoBaseUrl(apiKey)}/chat/completions`
  const ac = new AbortController()
  const timer = setTimeout(() => ac.abort(), 180_000)
  try {
    const r = await fetch(url, {
      method: 'POST',
      signal: ac.signal,
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'mimo-v2.5-tts',
        messages: [
          { role: 'user', content: ttsStyle(minSegSec) },
          { role: 'assistant', content: text },
        ],
        audio: { format: 'wav', voice: voice || 'mimo_default' },
      }),
    })
    if (!r.ok) {
      const body = await r.text().catch(() => '')
      if (r.status === 401) return { ok: false, error: 'TTS 认证失败（401）：请检查 MIMO_API_KEY' }
      return { ok: false, error: `TTS 失败 HTTP ${r.status}: ${body.slice(0, 200)}` }
    }
    const json = await r.json() as any
    const b64 = json?.choices?.[0]?.message?.audio?.data
    if (typeof b64 !== 'string' || b64.length === 0) {
      return { ok: false, error: 'TTS 响应缺少 audio.data' }
    }
    writeFileSync(outFile, Buffer.from(b64, 'base64'))
    return { ok: true }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) }
  } finally { clearTimeout(timer) }
}

// ─── 素材获取 ───────────────────────────────────────────────────────────────

/**
 * Materialise a client-supplied image/video into a local file.
 * Accepts data URLs (uploaded files) or http(s) URLs (generated assets).
 */
async function materialize(
  input: { kind: 'data' | 'url'; value: string },
  destWithoutExt: string,
): Promise<{ ok: boolean; file?: string; error?: string }> {
  try {
    if (input.kind === 'data') {
      const m = /^data:([^;,]+)?(;base64)?,(.*)$/s.exec(input.value)
      if (!m) return { ok: false, error: '无法解析上传的素材（data URL 格式错误）' }
      const mime = m[1] || 'application/octet-stream'
      const isB64 = Boolean(m[2])
      const ext = mime.includes('png') ? '.png'
        : mime.includes('jpeg') || mime.includes('jpg') ? '.jpg'
        : mime.includes('webp') ? '.webp'
        : mime.includes('quicktime') || mime.includes('mov') ? '.mov'
        : mime.includes('webm') ? '.webm'
        : mime.includes('video/mp4') ? '.mp4'
        : '.bin'
      const file = destWithoutExt + ext
      const buf = isB64
        ? Buffer.from(m[3], 'base64')
        : Buffer.from(decodeURIComponent(m[3]), 'binary')
      if (buf.length === 0) return { ok: false, error: '上传素材为空' }
      writeFileSync(file, buf)
      return { ok: true, file }
    }
    const r = await fetch(input.value)
    if (!r.ok) return { ok: false, error: `下载素材失败 HTTP ${r.status}` }
    const buf = Buffer.from(await r.arrayBuffer())
    const lower = input.value.toLowerCase()
    const ext = lower.includes('.png') ? '.png'
      : lower.includes('.jpg') || lower.includes('.jpeg') ? '.jpg'
      : lower.includes('.webp') ? '.webp'
      : lower.includes('.mov') ? '.mov'
      : lower.includes('.webm') ? '.webm'
      : lower.includes('.mp4') ? '.mp4'
      : '.bin'
    const file = destWithoutExt + ext
    writeFileSync(file, buf)
    return { ok: true, file }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) }
  }
}

// ─── AI 画面 ────────────────────────────────────────────────────────────────

/** Generate one background video with Agnes (verified submit → poll → url). */
async function generateAiVisual(
  prompt: string, host: AnchorHost, seconds = 5,
): Promise<{ ok: boolean; url?: string; error?: string }> {
  try {
    const submitted = await host.call('agnes', '/v1/videos', {
      method: 'POST',
      body: { model: 'agnes-video-2.5-flash', prompt, mode: 'text', seconds: String(seconds), size: '720P' },
      timeoutMs: 120_000,
    })
    const id = String(submitted?.video_id || submitted?.id || '')
    if (!id) return { ok: false, error: 'AI 画面：视频接口未返回任务 ID' }
    const deadline = Date.now() + 20 * 60_000
    while (Date.now() < deadline) {
      await new Promise(r => setTimeout(r, 8000))
      const st = await host.call('agnes', `/v1/videos/${encodeURIComponent(id)}`, { method: 'GET', timeoutMs: 60_000 })
      const status = String(st?.status ?? '')
      if (status === 'completed') {
        const url = String(st?.metadata?.url || st?.url || '')
        return url ? { ok: true, url } : { ok: false, error: 'AI 画面：完成但无地址' }
      }
      if (status === 'failed') return { ok: false, error: `AI 画面生成失败：${st?.error?.message || ''}` }
    }
    return { ok: false, error: 'AI 画面生成超时' }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) }
  }
}

// ─── 主流程 ─────────────────────────────────────────────────────────────────

/**
 * Run the talking-avatar pipeline.
 * Every stage reports progress so the panel can show where it is.
 */
async function runAnchor(task: AnchorTask, host: AnchorHost): Promise<void> {
  const dir = anchorDir(task.anchor_id)
  try {
    // ── 1) TTS ──────────────────────────────────────────────────────────
    setStatus(task, 'tts', '正在合成配音...')
    const apiKey = await host.resolveTtsKey()

    let cursor = 0
    for (const seg of task.segments) {
      if (task.status === 'stopped') return
      const out = join(dir, `seg-${seg.index}.wav`)
      const r = await synthesize(seg.text, task.voice, out, apiKey, task.min_seg_sec)
      if (!r.ok) {
        seg.status = 'failed'
        seg.error = r.error
        save(task)
        setStatus(task, 'failed', `第 ${seg.index + 1} 段配音失败：${r.error}`)
        return
      }
      const probe = await probeMedia(out)
      seg.audioFile = out
      seg.duration = probe.ok ? probe.duration : Math.max(1, seg.text.length / CHARS_PER_SEC)
      seg.start = cursor
      seg.end = cursor + seg.duration
      seg.status = 'done'
      cursor = seg.end + 0.25            // small breath between segments
      save(task)
      task.message = `配音 ${task.segments.filter(s => s.status === 'done').length}/${task.segments.length}`
    }
    task.total_duration = cursor
    save(task)

    // ── 2) audio track ─────────────────────────────────────────────────
    setStatus(task, 'visual', '正在拼接音轨...')
    const audioOut = join(dir, 'narration.wav')
    const audioRes = await concatAudio(
      task.segments.map(s => ({ file: s.audioFile!, silenceAfterMs: 250 })),
      audioOut,
    )
    if (!audioRes.ok) { setStatus(task, 'failed', `音轨拼接失败：${audioRes.error}`); return }

    // ── 3) visual track ────────────────────────────────────────────────
    setStatus(task, 'visual', '正在生成画面...')
    const visualOut = join(dir, 'visual.mp4')
    const duration = Math.max(1, task.total_duration)

    let visualInput = ''
    if (task.mode === 'static') {
      if (!task.image_path || !existsSync(task.image_path)) {
        setStatus(task, 'failed', '静态形象图模式下缺少图片素材'); return
      }
      const r = await imageToVideo(task.image_path, visualOut, duration)
      if (!r.ok) { setStatus(task, 'failed', `画面生成失败：${r.error}`); return }
      visualInput = visualOut
    } else if (task.mode === 'clip') {
      if (!task.clip_path || !existsSync(task.clip_path)) {
        setStatus(task, 'failed', '视频素材模式下缺少视频素材'); return
      }
      // Loop the clip to cover the narration, then trim to length.
      const r = await ffmpeg([
        '-stream_loop', '-1', '-i', task.clip_path,
        '-t', String(duration),
        '-vf', 'scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2,setsar=1,fps=25',
        '-an', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-preset', 'medium', '-crf', '20',
        visualOut,
      ])
      if (!r.ok) { setStatus(task, 'failed', `画面生成失败：${r.error}`); return }
      visualInput = visualOut
    } else if (task.ai_per_segment) {
      // 逐段画面：每段台词单独生成一段 AI 视频，再按该段旁白时长铺满，
      // 最后拼接成与旁白逐段对齐的完整画面轨。
      const done = task.segments.filter(s => s.status === 'done')
      const pieceFiles: string[] = []
      let ok = true
      for (const [i, seg] of done.entries()) {
        // 画面时长 = 到下一段开始为止（含段间停顿），最后一段到总时长
        const nextStart = done[i + 1]?.start ?? duration
        const segDur = Math.max(1.5, nextStart - seg.start)
        setStatus(task, 'visual', `正在生成第 ${i + 1}/${done.length} 段画面（每段约 2-4 分钟）...`)

        // 用该段台词 + 可选风格提示词生成画面，使画面贴合当前这句
        const style = task.ai_prompt ? `${task.ai_prompt}。` : ''
        const prompt = `${style}${seg.text}`.slice(0, 500)
        const ai = await generateAiVisual(prompt, host, 5)
        if (!ai.ok || !ai.url) {
          ok = false
          setStatus(task, 'failed', `第 ${i + 1} 段 AI 画面失败：${ai.error}`)
          break
        }
        const raw = join(dir, `ai-seg-${seg.index}.mp4`)
        const dl = await fetch(ai.url)
        if (!dl.ok) {
          ok = false
          setStatus(task, 'failed', `第 ${i + 1} 段画面下载失败 HTTP ${dl.status}`)
          break
        }
        writeFileSync(raw, Buffer.from(await dl.arrayBuffer()))

        // 把这段画面循环/裁剪到该段旁白时长，并统一规格（拼接才安全）
        const piece = join(dir, `vis-seg-${seg.index}.mp4`)
        const r = await ffmpeg([
          '-stream_loop', '-1', '-i', raw,
          '-t', String(segDur),
          '-vf', 'scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2,setsar=1,fps=25',
          '-an', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-preset', 'medium', '-crf', '20',
          piece,
        ])
        if (!r.ok) {
          ok = false
          setStatus(task, 'failed', `第 ${i + 1} 段画面处理失败：${r.error}`)
          break
        }
        pieceFiles.push(piece)
      }
      if (!ok) return
      if (pieceFiles.length === 0) { setStatus(task, 'failed', '没有可用的画面片段'); return }

      const concatRes = await concatVideos(pieceFiles, visualOut)
      if (!concatRes.ok) { setStatus(task, 'failed', `画面拼接失败：${concatRes.error}`); return }
      visualInput = visualOut
    } else {
      // ai（整片背景）：生成一段背景片，循环铺满整条旁白
      const prompt = task.ai_prompt || 'cinematic background, soft lighting, no people'
      setStatus(task, 'visual', '正在用 AI 生成画面（约 2-4 分钟）...')
      const ai = await generateAiVisual(prompt, host, 5)
      if (!ai.ok || !ai.url) { setStatus(task, 'failed', `AI 画面失败：${ai.error}`); return }
      const raw = join(dir, 'ai-raw.mp4')
      const dl = await fetch(ai.url)
      if (!dl.ok) { setStatus(task, 'failed', `AI 画面下载失败 HTTP ${dl.status}`); return }
      writeFileSync(raw, Buffer.from(await dl.arrayBuffer()))
      const r = await ffmpeg([
        '-stream_loop', '-1', '-i', raw,
        '-t', String(duration),
        '-vf', 'scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2,setsar=1,fps=25',
        '-an', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-preset', 'medium', '-crf', '20',
        visualOut,
      ])
      if (!r.ok) { setStatus(task, 'failed', `画面生成失败：${r.error}`); return }
      visualInput = visualOut
    }

    // ── 4) subtitles + mux ─────────────────────────────────────────────
    setStatus(task, 'muxing', '正在合成最终视频...')
    let cues: Array<{ start: number; end: number; text: string }> | undefined
    if (task.burn_subtitles) {
      if (!findCjkFont()) {
        setStatus(task, 'failed', '缺少中文字体，无法烧录字幕（请安装中文字体或设置 AGNES_SUBTITLE_FONT）')
        return
      }
      cues = task.segments.filter(s => s.status === 'done').map(s => ({
        start: s.start, end: s.end, text: s.text,
      }))
      // Keep a downloadable SRT alongside the burned-in track.
      writeFileSync(join(dir, 'narration.srt'), buildSrt(cues), 'utf8')
    }

    const finalOut = join(dir, 'final.mp4')
    const mux = await muxNarration({
      visualInput, audioInput: audioOut, output: finalOut, cues,
    })
    if (!mux.ok) { setStatus(task, 'failed', `合成失败：${mux.error}`); return }

    const probe = await probeMedia(finalOut)
    task.final_file = finalOut
    task.total_duration = probe.ok ? probe.duration : duration
    setStatus(task, 'completed', `口播视频已生成（${task.segments.length} 段，${task.total_duration.toFixed(1)}s）`)
  } catch (e) {
    setStatus(task, 'failed', e instanceof Error ? e.message : String(e))
  } finally {
    runningAnchors.delete(task.anchor_id)
  }
}

// ─── 路由 ───────────────────────────────────────────────────────────────────

export async function handleAnchorRoute(
  method: string, urlPath: string, body: any, host: AnchorHost,
): Promise<{ status: number; data: any } | null> {
  const dp = urlPath.replace(/^\/agnes-studio\/api\/?/, '').replace(/^anchor\/?/, '')

  // POST /anchor/start
  if (method === 'POST' && dp === 'start') {
    const text = String(body?.text ?? '').trim()
    if (!text) return { status: 400, data: { error: '文稿内容为空' } }
    const mode = (body?.mode === 'clip' || body?.mode === 'ai') ? body.mode as VisualMode : 'static'
    const minSegSec = Math.min(20, Math.max(3, Number(body?.min_seg_sec ?? 4)))
    const texts = segmentText(text, minSegSec)
    if (texts.length === 0) return { status: 400, data: { error: '文稿分段为空' } }

    const id = randomUUID().slice(0, 12)
    const dir = anchorDir(id)

    const task: AnchorTask = {
      anchor_id: id,
      text,
      mode,
      status: 'pending',
      message: '准备中...',
      voice: typeof body?.voice === 'string' && body.voice ? body.voice : 'mimo_default',
      min_seg_sec: minSegSec,
      burn_subtitles: body?.subtitles !== false,
      segments: texts.map((t, i) => ({
        index: i, text: t, status: 'pending' as const, start: 0, end: 0, duration: 0,
      })),
      total_duration: 0,
      created_at: Date.now(),
      updated_at: Date.now(),
    }

    // Materialise the visual source up front so a missing asset fails fast.
    if (mode === 'static') {
      if (!body?.image?.value) return { status: 400, data: { error: '静态形象图模式需要提供图片' } }
      const m = await materialize(body.image, join(dir, 'avatar'))
      if (!m.ok) return { status: 400, data: { error: m.error } }
      task.image_path = m.file
    } else if (mode === 'clip') {
      if (!body?.clip?.value) return { status: 400, data: { error: '视频素材模式需要提供视频' } }
      const m = await materialize(body.clip, join(dir, 'source'))
      if (!m.ok) return { status: 400, data: { error: m.error } }
      task.clip_path = m.file
    } else {
      task.ai_prompt = String(body?.ai_prompt ?? '').trim() || undefined
      task.ai_per_segment = body?.ai_per_segment === true
    }

    save(task)
    runningAnchors.add(id)
    void runAnchor(task, host)
    return { status: 200, data: { anchor_id: id, segments: texts.length, status: 'pending' } }
  }

  // GET /anchor/list
  if (method === 'GET' && dp === 'list') {
    return { status: 200, data: { tasks: Array.from(anchorTasks.values()).slice(0, 20) } }
  }

  const parts = dp.split('/')
  const id = parts[0]
  if (!id) return null
  const task = anchorTasks.get(id) || load(id)
  if (!task) return { status: 404, data: { error: '任务不存在' } }

  if (method === 'GET' && parts.length === 1) return { status: 200, data: task }

  if (method === 'POST' && parts[1] === 'stop') {
    task.status = 'stopped'
    task.message = '已停止'
    save(task)
    runningAnchors.delete(id)
    return { status: 200, data: { ok: true } }
  }

  if (method === 'POST' && parts[1] === 'resume') {
    if (!runningAnchors.has(id) && task.status !== 'completed') {
      runningAnchors.add(id)
      void runAnchor(task, host)
    }
    return { status: 200, data: { ok: true } }
  }

  if (method === 'GET' && parts[1] === 'status') {
    const done = task.segments.filter(s => s.status === 'done').length
    return {
      status: 200,
      data: {
        anchor_id: task.anchor_id,
        status: task.status,
        message: task.message,
        segments: task.segments.length,
        done,
        total_duration: task.total_duration,
        error: task.error ?? null,
        final: task.status === 'completed'
          ? `/agnes-studio/api/media/anchor/${task.anchor_id}/final.mp4`
          : null,
      },
    }
  }

  return null
}

/** Restrict anchor media requests to the anchor's own directory. */
export function resolveAnchorMedia(anchorId: string, filename: string): string | null {
  if (!anchorId || !filename) return null
  const dir = resolve(anchorDir(anchorId))
  const candidate = resolve(dir, basename(filename))
  if (!candidate.startsWith(dir + '/') && !candidate.startsWith(dir + '\\')) return null
  return existsSync(candidate) && statSync(candidate).isFile() ? candidate : null
}

/** Available MiMo voices (kept small; `mimo_default` always works). */
export const ANCHOR_VOICES = [
  { id: 'mimo_default', name: '默认音色' },
  { id: 'mimo_female_1', name: '女声 · 温柔' },
  { id: 'mimo_male_1', name: '男声 · 沉稳' },
]

/** Startup cleanup: mark jobs interrupted by a restart so the UI is not stuck. */
export function rehydrateAnchors(): void {
  try {
    const root = join(dataRoot(), 'anchors')
    if (!existsSync(root)) return
    let count = 0
    for (const d of readdirSync(root)) {
      const t = load(d)
      if (!t) continue
      anchorTasks.set(d, t)
      if (['pending', 'tts', 'visual', 'muxing'].includes(t.status)) {
        t.status = 'failed'
        t.message = '进程重启导致中断，可点击「重新生成」'
        save(t)
        count++
      }
    }
    if (count) console.log(`[口播] 已恢复 ${count} 个中断任务`)
  } catch { /* ignore */ }
}
