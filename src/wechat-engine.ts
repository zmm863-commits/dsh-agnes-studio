/**
 * 微信公众号 + 本地文件引擎 — Host 端核心逻辑
 * 提供公众号文章生成、排版、发布和本地文件管理功能。
 */

import { randomUUID } from 'node:crypto'
import { mkdirSync, readFileSync, writeFileSync, readdirSync, existsSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { dataRoot } from './ffmpeg.js'

// ─── Host 能力注入 ──────────────────────────────────────────────────────────

export interface WechatHost {
  resolveKey(vendor: string): Promise<string>
  call(vendor: string, endpoint: string, opts?: {
    method?: 'GET' | 'POST'; body?: unknown; timeoutMs?: number
  }): Promise<any>
}

// ─── 类型定义 ──────────────────────────────────────────────────────────────

export interface WechatArticle {
  id: string
  title: string
  content: string
  author: string
  status: 'draft' | 'published'
  created_at: number
  updated_at: number
}

export interface LocalFile {
  name: string
  size: number
  mtime: string
  type: 'file' | 'dir'
}

/**
 * 存一篇本地草稿（内存 + 落盘）。
 *
 * @param title - 标题。
 * @param content - 正文。
 * @param author - 作者。
 * @returns 文章对象。
 */
function storeArticle(title: string, content: string, author?: string): WechatArticle {
  const article: WechatArticle = {
    id: randomUUID().slice(0, 8),
    title,
    content,
    author: author !== undefined && author !== '' ? author : 'AI 助手',
    status: 'draft',
    created_at: Date.now(),
    updated_at: Date.now(),
  }
  wechatArticles.set(article.id, article)
  saveArticle(article)
  return article
}

/** 落盘一篇草稿。 */
function saveArticle(article: WechatArticle): void {
  try {
    const dir = join(WECHAT_DIR, 'articles')
    mkdirSync(dir, { recursive: true })
    writeFileSync(join(dir, `${article.id}.json`), JSON.stringify(article, null, 2), 'utf8')
  } catch { /* 落盘失败不影响内存里的结果 */ }
}

/** 取公众号 access_token。 */
async function fetchWechatToken(appid: string, secret: string): Promise<string> {
  const url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${encodeURIComponent(appid)}&secret=${encodeURIComponent(secret)}`
  const resp = await fetch(url)
  const data = await resp.json() as { access_token?: string; errcode?: number; errmsg?: string }
  if (data.access_token === undefined) {
    throw new Error(`取 access_token 失败（${data.errcode ?? '?'}）：${data.errmsg ?? '未知错误'}`)
  }
  return data.access_token
}

/** 推送一篇草稿到公众号草稿箱，返回 media_id。 */
async function pushWechatDraft(token: string, article: WechatArticle): Promise<string> {
  const resp = await fetch(`https://api.weixin.qq.com/cgi-bin/draft/add?access_token=${encodeURIComponent(token)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      articles: [{
        title: article.title,
        author: article.author,
        content: article.content,
        thumb_media_id: '',
        need_open_comment: 0,
        only_fans_can_comment: 0,
      }],
    }),
  })
  const data = await resp.json() as { media_id?: string; errcode?: number; errmsg?: string }
  if (data.media_id === undefined) {
    throw new Error(`草稿推送失败（${data.errcode ?? '?'}）：${data.errmsg ?? '未知错误'}`)
  }
  return data.media_id
}

// ─── 存储 ──────────────────────────────────────────────────────────────────

const wechatArticles = new Map<string, WechatArticle>()
const WECHAT_DIR = join(dataRoot(), 'wechat')
const WECHAT_CONFIG_FILE = join(dataRoot(), 'wechat-config.json')

/**
 * 公众号凭据。AppID 可明文回显；AppSecret 只回「是否已配置」，不回传明文。
 */
const wechatConfig: { appid: string; secret: string } = { appid: '', secret: '' }

function loadWechatConfig(): void {
  try {
    if (!existsSync(WECHAT_CONFIG_FILE)) return
    const raw = JSON.parse(readFileSync(WECHAT_CONFIG_FILE, 'utf8')) as { appid?: string; secret?: string }
    wechatConfig.appid = String(raw.appid ?? '')
    wechatConfig.secret = String(raw.secret ?? '')
  } catch {}
}

function saveWechatConfig(): void {
  try {
    mkdirSync(dataRoot(), { recursive: true })
    writeFileSync(WECHAT_CONFIG_FILE, JSON.stringify({ appid: wechatConfig.appid, secret: wechatConfig.secret }), 'utf8')
  } catch {}
}
const LOCALFILES_DIR = join(dataRoot(), 'localfiles')

// ─── 路由处理 ──────────────────────────────────────────────────────────────

export interface WechatRouteResult {
  status: number
  data: unknown
}

/**
 * 处理微信公众号相关路由。
 */
export async function handleWechatRoute(
  method: string,
  path: string,
  body: Record<string, unknown>,
  host: WechatHost,
): Promise<WechatRouteResult | null> {
  const sub = path.slice('/agnes-studio/api/wechat'.length).replace(/^\//, '')

  // GET /config - 读取公众号配置（secret 只回是否已配置）
  if (method === 'GET' && sub === 'config') {
    return {
      status: 200,
      data: { success: true, appid: wechatConfig.appid, has_secret: wechatConfig.secret.length > 0 },
    }
  }

  // POST /config - 保存公众号配置（AppID / AppSecret）
  if (method === 'POST' && sub === 'config') {
    const { appid, secret } = body as { appid?: string; secret?: string }
    if (typeof appid === 'string') wechatConfig.appid = appid.trim()
    if (typeof secret === 'string' && secret.trim().length > 0) wechatConfig.secret = secret.trim()
    saveWechatConfig()
    return {
      status: 200,
      data: { success: true, appid: wechatConfig.appid, has_secret: wechatConfig.secret.length > 0 },
    }
  }

  // POST /article - 生成文章（真实调用文本模型）
  if (method === 'POST' && sub === 'article') {
    const {
      title, topic, content, author, model, style, length,
    } = body as {
      title?: string; topic?: string; content?: string; author?: string
      model?: string; style?: string; length?: number
    }
    const subject = String(topic ?? title ?? '').trim()
    if (subject === '' && (content === undefined || content === '')) {
      return { status: 400, data: { error: '缺少 topic / title（或直接给出 content 存草稿）' } }
    }

    // 已经给了正文：当作存稿，不再花一次模型调用
    if (content !== undefined && String(content).trim() !== '' && (topic === undefined || topic === '')) {
      const article = storeArticle(String(title ?? '未命名'), String(content), author)
      return { status: 200, data: { success: true, article, generated: false } }
    }

    const targetModel = model !== undefined && model !== '' ? model : 'agnes-2.5-flash'
    const words = Number.isFinite(length) && Number(length) > 0 ? Number(length) : 1500
    const tone = style !== undefined && style !== '' ? style : '第一人称、短句、段尾留钩子'
    let text = ''
    try {
      const data = await host.call('agnes', '/chat/completions', {
        body: {
          model: targetModel,
          messages: [
            {
              role: 'system',
              content:
                `你是公众号作者。根据主题写一篇约 ${words} 字的中文文章。` +
                `风格：${tone}。` +
                '要求：有具体细节和场景，不要排比堆砌，不要"首先其次最后"，不要总结式收尾；' +
                '直接从故事或场景切入。只输出正文，不要标题、不要解释。',
            },
            { role: 'user', content: subject },
          ],
          max_tokens: Math.min(6000, Math.round(words * 2)),
          temperature: 0.85,
        },
        timeoutMs: 240_000,
      }) as { choices?: Array<{ message?: { content?: string } }> }
      text = (data.choices?.[0]?.message?.content ?? '').trim()
    } catch (error) {
      return { status: 502, data: { error: `生成失败：${error instanceof Error ? error.message : String(error)}` } }
    }
    if (text === '') return { status: 502, data: { error: '模型返回空内容' } }

    const article = storeArticle(String(title ?? subject), text, author)
    return { status: 200, data: { success: true, article, generated: true } }
  }

  // POST /publish - 推送到公众号草稿箱（真调微信接口）
  if (method === 'POST' && sub === 'publish') {
    const { id } = body as { id: string }
    const article = wechatArticles.get(id)
    if (!article) {
      return { status: 404, data: { error: '文章不存在' } }
    }
    if (wechatConfig.appid === '' || wechatConfig.secret === '') {
      return {
        status: 501,
        data: {
          error: '未配置公众号 AppID / AppSecret，无法推送。可在「公众号 → 设置」里填写后再试。',
          hint: '当前文章已保存在本地草稿列表里。',
        },
      }
    }
    try {
      const token = await fetchWechatToken(wechatConfig.appid, wechatConfig.secret)
      const draftId = await pushWechatDraft(token, article)
      article.status = 'published'
      article.updated_at = Date.now()
      saveArticle(article)
      return { status: 200, data: { success: true, article, draftId } }
    } catch (error) {
      return { status: 502, data: { error: `推送失败：${error instanceof Error ? error.message : String(error)}` } }
    }
  }

  // GET /list - 文章列表
  if (method === 'GET' && sub === 'list') {
    const articles = Array.from(wechatArticles.values())
      .sort((a, b) => b.created_at - a.created_at)
    return { status: 200, data: { success: true, articles } }
  }

  return null
}

/**
 * 处理本地文件相关路由。
 */
export async function handleLocalfilesRoute(
  method: string,
  path: string,
  body: Record<string, unknown>,
  host: WechatHost,
): Promise<WechatRouteResult | null> {
  const sub = path.slice('/agnes-studio/api/localfiles'.length).replace(/^\//, '')

  // GET /list - 文件列表
  if (method === 'GET' && sub === 'list') {
    const files: LocalFile[] = []
    try {
      if (existsSync(LOCALFILES_DIR)) {
        const entries = readdirSync(LOCALFILES_DIR)
        for (const entry of entries) {
          const full = join(LOCALFILES_DIR, entry)
          if (!existsSync(full)) continue
          try {
            const st = statSync(full)
            files.push({
              name: entry,
              size: st.size,
              mtime: st.mtime.toISOString(),
              type: st.isDirectory() ? 'dir' : 'file',
            })
          } catch {}
        }
      }
    } catch {}
    return { status: 200, data: { success: true, files } }
  }

  // POST /upload - 上传文件
  if (method === 'POST' && sub === 'upload') {
    const { filename, content } = body as { filename: string; content: string }
    if (!filename) {
      return { status: 400, data: { error: '缺少 filename' } }
    }
    mkdirSync(LOCALFILES_DIR, { recursive: true })
    try {
      writeFileSync(join(LOCALFILES_DIR, filename), content, 'utf8')
    } catch {}
    return { status: 200, data: { success: true, filename } }
  }

  // GET /file/:name - 下载文件
  if (method === 'GET' && sub.startsWith('file/')) {
    const name = sub.slice('file/'.length)
    try {
      const content = readFileSync(join(LOCALFILES_DIR, name), 'utf8')
      return { status: 200, data: { success: true, name, content } }
    } catch {
      return { status: 404, data: { error: '文件不存在' } }
    }
  }

  // DELETE /file/:name - 删除文件
  if (method === 'DELETE' && sub.startsWith('file/')) {
    const name = sub.slice('file/'.length)
    try {
      const fs = await import('node:fs')
      fs.unlinkSync(join(LOCALFILES_DIR, name))
      return { status: 200, data: { success: true } }
    } catch {
      return { status: 404, data: { error: '文件不存在' } }
    }
  }

  return null
}

// ─── 重启恢复 ──────────────────────────────────────────────────────────────

export function rehydrateWechat(): void {
  loadWechatConfig()
}

export function rehydrateLocalfiles(): void {
  // 文件系统存储，无需恢复
}
