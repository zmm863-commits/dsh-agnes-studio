/**
 * MTV 真实生成流水线（替换原来"每阶段 sleep 2 秒 + 编个 id"的空壳）。
 *
 * 流程：素材检查 → 分镜（文本模型）→ 逐段出片（视频接口）→ 拼片并挂上原曲（ffmpeg）。
 *
 * 关于谱曲：本插件没有音乐生成模型，所以**只有歌词时直接失败并说明**，
 * 不伪造一个 music_id。用户需要自己上传音频（这正是面板上"上传音乐"的入口）。
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { ffmpeg, dataRoot } from './ffmpeg.js'

/** 分镜一段。 */
interface MvShot {
  index: number
  start: number
  end: number
  desc: string
  prompt: string
}

/** 从模型回复里抠 JSON（容忍代码块与前后废话）。 */
function parseJson<T>(raw: string): T {
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

/** 读媒体时长（ffmpeg stderr 里的 Duration）。 */
export async function mvProbeDuration(path: string): Promise<number> {
  const res = await ffmpeg(['-i', path], 30_000)
  const m = /Duration:\s*(\d+):(\d+):(\d+\.?\d*)/.exec(res.stderr)
  return m === null ? 0 : Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3])
}

/** 把原曲挂到成片上（视频原有音轨替换为上传的音乐）。 */
export async function muxMusic(videoPath: string, audioPath: string, outPath: string): Promise<{ ok: boolean; detail: string }> {
  const res = await ffmpeg([
    '-y', '-i', videoPath, '-i', audioPath,
    '-map', '0:v:0', '-map', '1:a:0',
    '-c:v', 'copy', '-c:a', 'aac', '-shortest',
    '-movflags', '+faststart', outPath,
  ], 600_000)
  return res.ok
    ? { ok: true, detail: outPath }
    : { ok: false, detail: res.stderr.slice(-300) }
}

/** 拼接多段视频（同规格）。 */
export async function mvConcat(inputs: string[], outPath: string): Promise<{ ok: boolean; detail: string }> {
  if (inputs.length === 0) return { ok: false, detail: '没有输入片段' }
  const dir = join(dataRoot(), 'mv')
  mkdirSync(dir, { recursive: true })
  const listPath = join(dir, `concat-${Date.now()}.txt`)
  writeFileSync(listPath, inputs.map(p => `file '${p.replace(/'/g, "'\\''")}'`).join('\n'), 'utf8')
  const res = await ffmpeg([
    '-y', '-f', 'concat', '-safe', '0', '-i', listPath,
    '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20', '-c:a', 'aac',
    '-movflags', '+faststart', outPath,
  ], 900_000)
  return res.ok
    ? { ok: true, detail: outPath }
    : { ok: false, detail: res.stderr.slice(-300) }
}

export interface MvRunContext {
  task: {
    task_id: string
    audio_file?: string
    lyrics?: string
    text_model: string
    video_model: string
    [key: string]: unknown
  }
  call: (vendor: string, endpoint: string, opts?: { body?: unknown; method?: string; timeoutMs?: number }) => Promise<any>
  dir: string
}

/**
 * 跑完整条 MTV 流水线。
 *
 * @param ctx - 任务、模型调用器与工作目录。
 * @param onProgress - 进度回调（写回任务消息）。
 * @returns 分镜与成片路径。
 */
export async function runMvPipeline(
  ctx: MvRunContext,
  onProgress: (status: string, message: string) => void,
): Promise<{ shots: MvShot[]; videoFile: string; finalFile: string }> {
  const { task, call, dir } = ctx

  if (task.audio_file === undefined || task.audio_file === '') {
    throw new Error('没有音频文件：本版本不内置谱曲能力，请先上传音乐（或提供音频路径）再生成 MV')
  }
  const durationSec = await mvProbeDuration(task.audio_file)
  if (durationSec <= 0) throw new Error(`读不出音频时长：${task.audio_file}`)

  // ── 分镜 ──
  onProgress('storyboard', '正在生成分镜…')
  const shotCount = Math.max(3, Math.min(12, Math.round(durationSec / 6)))
  const lyrics = task.lyrics !== undefined && task.lyrics !== '' ? task.lyrics : '（无歌词，按纯音乐处理）'
  const raw = await call('agnes', '/chat/completions', {
    body: {
      model: task.text_model,
      messages: [
        {
          role: 'system',
          content:
            '你是 MV 导演。把歌词拆成等长的镜头段落，每段给一句可直接用于视频生成的画面描述。\n' +
            '只输出 JSON：{"shots":[{"index":1,"desc":"画面内容","prompt":"完整提示词（主体+场景+运镜+光线+风格）"}]}。不要解释。',
        },
        {
          role: 'user',
          content: `总时长 ${durationSec.toFixed(1)} 秒，请拆成 ${shotCount} 段。歌词：\n${lyrics}`,
        },
      ],
      max_tokens: 2000,
      temperature: 0.7,
    },
    timeoutMs: 180_000,
  }) as { choices?: Array<{ message?: { content?: string } }> }
  const text = raw.choices?.[0]?.message?.content ?? ''
  if (text.trim() === '') throw new Error('分镜模型返回空内容')
  const parsed = parseJson<{ shots?: Array<{ index?: number; desc?: string; prompt?: string }> }>(text)
  const shots: MvShot[] = (parsed.shots ?? []).map((shot, i) => {
    const per = durationSec / Math.max(1, parsed.shots?.length ?? 1)
    return {
      index: Number(shot.index) || i + 1,
      start: Number((i * per).toFixed(1)),
      end: Number(((i + 1) * per).toFixed(1)),
      desc: String(shot.desc ?? '').trim(),
      prompt: String(shot.prompt ?? shot.desc ?? '').trim(),
    }
  }).filter(shot => shot.prompt !== '')
  if (shots.length === 0) throw new Error('分镜模型没有给出可用的镜头')

  // ── 逐段出片 ──
  const clips: string[] = []
  for (const shot of shots) {
    onProgress('video', `正在生成第 ${shot.index}/${shots.length} 段…`)
    let submitted: { video_id?: string; id?: string; task_id?: string } | undefined
    for (let attempt = 0; attempt < 6; attempt++) {
      try {
        submitted = await call('agnes', '/v1/videos', {
          body: { model: task.video_model, prompt: shot.prompt, mode: 'text', seconds: '5', size: '720P' },
          timeoutMs: 120_000,
        }) as { video_id?: string; id?: string; task_id?: string }
        break
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        if (!/503|429|queue_full|队列已满/i.test(message)) throw error
        if (attempt === 5) throw new Error(`第 ${shot.index} 段排队超时`)
        onProgress('video', `第 ${shot.index} 段排队中，等 60s 重试…`)
        await new Promise(r => setTimeout(r, 62_000))
      }
    }
    const videoId = String(submitted?.video_id ?? submitted?.task_id ?? submitted?.id ?? '')
    if (videoId === '') throw new Error(`第 ${shot.index} 段提交后没有任务 id`)

    const deadline = Date.now() + 20 * 60 * 1000
    let url = ''
    while (Date.now() < deadline) {
      await new Promise(r => setTimeout(r, 8000))
      const st = await call('agnes', `/v1/videos/${encodeURIComponent(videoId)}`, { method: 'GET', timeoutMs: 60_000 }) as {
        status?: string; metadata?: { url?: string }; url?: string; error?: { message?: string } | string
      }
      const state = String(st.status ?? '')
      if (state === 'failed' || state === 'error') {
        const detail = typeof st.error === 'string' ? st.error : st.error?.message
        throw new Error(`第 ${shot.index} 段生成失败${detail === undefined ? '' : '：' + detail}`)
      }
      if (state === 'completed') {
        url = String(st.metadata?.url ?? st.url ?? '')
        if (url === '') throw new Error(`第 ${shot.index} 段完成但没有视频地址`)
        break
      }
    }
    if (url === '') throw new Error(`第 ${shot.index} 段等待超时`)

    const clipPath = join(dir, `shot-${String(shot.index).padStart(2, '0')}.mp4`)
    const resp = await fetch(url)
    if (!resp.ok) throw new Error(`第 ${shot.index} 段下载失败 HTTP ${resp.status}`)
    writeFileSync(clipPath, Buffer.from(await resp.arrayBuffer()))
    clips.push(clipPath)
  }

  // ── 拼片 + 挂原曲 ──
  onProgress('video', '正在拼接…')
  const merged = join(dir, 'merged.mp4')
  const cat = await mvConcat(clips, merged)
  if (!cat.ok) throw new Error(`拼接失败：${cat.detail}`)

  onProgress('video', '正在混入原曲…')
  const final = join(dir, 'mv.mp4')
  const muxed = await muxMusic(merged, task.audio_file, final)
  if (!muxed.ok) throw new Error(`混音失败：${muxed.detail}`)

  return { shots, videoFile: merged, finalFile: final }
}
