/**
 * 动作迁移 / 换人 —— 把一段参考动作搬到角色图上。
 *
 * 契约走 Agnes 的统一视频接口（与 drama-engine 同一套）：
 *   POST /v1/videos      mode=reference，images=[角色图]，prompt 描述动作
 *   GET  /v1/videos/{id} 轮询到 completed，取 metadata.url
 *
 * 模型名可配置（默认 `wan2.2-animate-mix`）。**平台是否上架了这个模型不由插件决定**，
 * 所以这里不伪造成功：模型不存在、额度不足、队列满都会如实报错。
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { dataRoot } from './ffmpeg.js'
import { modelFor } from './model-defaults.js'

/** 提交动作迁移所需的上下文。 */
export interface AnimateContext {
  call: (vendor: string, endpoint: string, opts?: { body?: unknown; method?: string; timeoutMs?: number }) => Promise<any>
  onProgress?: (message: string) => void
}

/** 动作迁移的结果。 */
export interface AnimateResult {
  ok: boolean
  /** 远端视频地址。 */
  url: string
  /** 抓回本地的路径（失败时为空）。 */
  file: string
  detail: string
}

/**
 * 默认模型名（可用环境变量 DSH_ANIMATE_MODEL 覆盖）。
 *
 * 说明：本机这套 KEY 所属分组里目前查不到 `wan2.2-animate-mix`（平台返回
 * model_not_found）。所以默认退回通用视频模型的 reference 模式 —— 它同样接受
 * 参考图，只是动作迁移效果取决于平台实现。要换成真正的动作迁移模型，
 * 把 `DSH_ANIMATE_MODEL` 指向平台已上架的模型名即可。
 */
export function animateModel(): string {
  return modelFor('video')
}

/**
 * 执行一次动作迁移。
 *
 * @param ctx - 模型调用器与进度回调。
 * @param request - 角色图（URL 或 data URL）、参考视频（可选）、动作描述。
 * @returns 视频地址与本地文件。
 */
export async function runAnimate(
  ctx: AnimateContext,
  request: {
    /** 角色图：http(s) URL 或 data URL。 */
    image: string
    /** 参考动作视频（可选，URL）。 */
    referenceVideo?: string
    /** 动作/镜头描述。 */
    prompt?: string
    /** 时长（秒），默认 5。 */
    seconds?: number
    /** 覆盖模型名。 */
    model?: string
  },
): Promise<AnimateResult> {
  const image = String(request.image ?? '').trim()
  if (image === '') return { ok: false, url: '', file: '', detail: '缺少角色图（image）' }
  if (!/^(https?:\/\/|data:image\/)/.test(image)) {
    return { ok: false, url: '', file: '', detail: '角色图需要 http(s) 地址或 data URL' }
  }

  const model = request.model !== undefined && request.model !== '' ? request.model : animateModel()
  const seconds = String(request.seconds ?? 5)
  const prompt = request.prompt !== undefined && request.prompt !== '' ? request.prompt : '人物做出参考视频中的动作，保持外观一致'

  const body: Record<string, unknown> = {
    model,
    prompt,
    mode: 'reference',
    seconds,
    size: '720P',
    images: [image],
  }
  if (request.referenceVideo !== undefined && request.referenceVideo !== '') {
    body.video_url = request.referenceVideo
  }

  ctx.onProgress?.(`提交任务（${model}）…`)
  let submitted: { video_id?: string; id?: string; task_id?: string } | undefined
  for (let attempt = 0; attempt < 6; attempt++) {
    try {
      submitted = await ctx.call('agnes', '/v1/videos', { body, timeoutMs: 120_000 }) as { video_id?: string; id?: string; task_id?: string }
      break
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      // 模型不存在这类错误不该重试
      if (/404|model.*not.*found|不存在|invalid/i.test(message)) {
        return {
          ok: false,
          url: '',
          file: '',
          detail: `平台不接受模型「${model}」：${message}\n可用视频模型：agnes-video-2.5-flash / agnes-video-2.5 / MiniMax-H3 等；也可用环境变量 DSH_ANIMATE_MODEL 指定。`,
        }
      }
      if (!/503|429|queue_full|队列已满/i.test(message)) {
        return { ok: false, url: '', file: '', detail: `提交失败：${message}` }
      }
      if (attempt === 5) return { ok: false, url: '', file: '', detail: '队列一直满，排队重试 6 次仍失败' }
      ctx.onProgress?.(`队列已满，60 秒后重试（${attempt + 1}/6）…`)
      await new Promise(r => setTimeout(r, 62_000))
    }
  }

  const videoId = String(submitted?.video_id ?? submitted?.task_id ?? submitted?.id ?? '')
  if (videoId === '') return { ok: false, url: '', file: '', detail: '提交后没有拿到任务 id' }

  const deadline = Date.now() + 20 * 60 * 1000
  while (Date.now() < deadline) {
    await new Promise(r => setTimeout(r, 8000))
    let status: { status?: string; metadata?: { url?: string }; url?: string; error?: { message?: string } | string }
    try {
      status = await ctx.call('agnes', `/v1/videos/${encodeURIComponent(videoId)}`, { method: 'GET', timeoutMs: 60_000 }) as typeof status
    } catch (error) {
      continue
    }
    const state = String(status.status ?? '')
    if (state === 'failed' || state === 'error') {
      const detail = typeof status.error === 'string' ? status.error : status.error?.message
      return { ok: false, url: '', file: '', detail: `生成失败${detail === undefined ? '' : '：' + detail}` }
    }
    if (state === 'completed') {
      const url = String(status.metadata?.url ?? status.url ?? '')
      if (url === '') return { ok: false, url: '', file: '', detail: '任务完成但没有视频地址' }
      ctx.onProgress?.('下载成片…')
      const dir = join(dataRoot(), 'animate')
      mkdirSync(dir, { recursive: true })
      const target = join(dir, `animate-${Date.now()}.mp4`)
      try {
        const resp = await fetch(url)
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`)
        writeFileSync(target, Buffer.from(await resp.arrayBuffer()))
        return { ok: true, url, file: target, detail: '完成' }
      } catch (error) {
        return { ok: true, url, file: '', detail: `完成，但下载失败：${error instanceof Error ? error.message : String(error)}` }
      }
    }
  }
  return { ok: false, url: '', file: '', detail: '等待超时（20 分钟）' }
}
