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

  // POST /article - 生成文章
  if (method === 'POST' && sub === 'article') {
    const { title, content, author } = body as { title: string; content: string; author?: string }
    if (!title || !content) {
      return { status: 400, data: { error: '缺少 title 或 content' } }
    }
    const id = randomUUID().slice(0, 8)
    const article: WechatArticle = {
      id,
      title,
      content,
      author: author || 'AI 助手',
      status: 'draft',
      created_at: Date.now(),
      updated_at: Date.now(),
    }
    wechatArticles.set(id, article)
    return { status: 200, data: { success: true, article } }
  }

  // POST /publish - 发布文章
  if (method === 'POST' && sub === 'publish') {
    const { id } = body as { id: string }
    const article = wechatArticles.get(id)
    if (!article) {
      return { status: 404, data: { error: '文章不存在' } }
    }
    article.status = 'published'
    article.updated_at = Date.now()
    return { status: 200, data: { success: true, article } }
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
