/**
 * 微信公众号 + 本地文件面板
 * 功能：公众号文章生成、排版、发布、本地文件管理
 */

import { React, useState, useCallback, useEffect, createElement } from './react-shim.ts'

// ─── 类型定义 ──────────────────────────────────────────────────────────────

interface WechatArticle {
  id: string
  title: string
  content: string
  author: string
  status: 'draft' | 'published'
  created_at: number
  updated_at: number
}

interface LocalFile {
  name: string
  size: number
  mtime: string
  type: 'file' | 'dir'
}

// ─── API 调用 ──────────────────────────────────────────────────────────────

const API_WECHAT = '/agnes-studio/api/wechat'
const API_LOCALFILES = '/agnes-studio/api/localfiles'

async function apiCall<T>(baseUrl: string, method: string, path: string, body?: unknown): Promise<T> {
  const resp = await fetch(`${baseUrl}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = await resp.json().catch(() => ({}))
  if (!resp.ok || data?.error) throw new Error(data?.error || `请求失败（HTTP ${resp.status}）`)
  return data as T
}

// ─── 组件 ──────────────────────────────────────────────────────────────────

export function WechatPanel() {
  const [activeTab, setActiveTab] = useState<'wechat' | 'localfiles'>('wechat')

  return createElement('div', { className: 'wechat-panel' },
    // 标题
    createElement('div', { className: 'wechat-header' },
      createElement('h3', null, '📱 微信公众号 + 本地文件'),
      createElement('p', { className: 'wechat-desc' }, '公众号文章生成 + 本地文件管理'),
    ),

    // 页签切换
    createElement('div', { className: 'wechat-tabs' },
      createElement('button', {
        className: `wechat-tab ${activeTab === 'wechat' ? 'active' : ''}`,
        onClick: () => setActiveTab('wechat'),
      }, '📱 微信公众号'),
      createElement('button', {
        className: `wechat-tab ${activeTab === 'localfiles' ? 'active' : ''}`,
        onClick: () => setActiveTab('localfiles'),
      }, '📁 本地文件'),
    ),

    // 内容
    activeTab === 'wechat'
      ? createElement(WechatArticlePanel)
      : createElement(LocalfilesPanel),
  )
}

// ─── 微信公众号面板 ────────────────────────────────────────────────────────

function WechatArticlePanel() {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [author, setAuthor] = useState('')
  const [articles, setArticles] = useState<WechatArticle[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // 公众号凭据（AppID 明文回显；AppSecret 只显示是否已配置，不回传明文）
  const [appid, setAppid] = useState('')
  const [secret, setSecret] = useState('')
  const [hasSecret, setHasSecret] = useState(false)
  const [savingConfig, setSavingConfig] = useState(false)
  const [configSaved, setConfigSaved] = useState(false)

  const loadConfig = useCallback(async () => {
    try {
      const d = await apiCall<{ appid: string; has_secret: boolean }>(API_WECHAT, 'GET', '/config')
      setAppid(d.appid || '')
      setHasSecret(Boolean(d.has_secret))
    } catch { /* 配置接口不可用时不阻塞主流程 */ }
  }, [])

  useEffect(() => { void loadConfig() }, [loadConfig])

  const handleSaveConfig = useCallback(async () => {
    setSavingConfig(true)
    setError('')
    try {
      const d = await apiCall<{ has_secret: boolean }>(API_WECHAT, 'POST', '/config', { appid, secret })
      setHasSecret(Boolean(d.has_secret))
      setSecret('')
      setConfigSaved(true)
      setTimeout(() => setConfigSaved(false), 2500)
    } catch (e) {
      setError(e instanceof Error ? e.message : '保存配置失败')
    } finally {
      setSavingConfig(false)
    }
  }, [appid, secret])

  // 加载文章列表
  const loadArticles = useCallback(async () => {
    try {
      const data = await apiCall<{ articles: WechatArticle[] }>(API_WECHAT, 'GET', '/list')
      setArticles(data.articles)
    } catch (e) {
      setError(e instanceof Error ? e.message : '加载失败')
    }
  }, [])

  // 生成文章
  const handleGenerate = useCallback(async () => {
    if (!title.trim() || !content.trim()) {
      setError('请输入标题和内容')
      return
    }

    setLoading(true)
    setError('')

    try {
      await apiCall(API_WECHAT, 'POST', '/article', { title, content, author })
      await loadArticles()
      setTitle('')
      setContent('')
    } catch (e) {
      setError(e instanceof Error ? e.message : '生成失败')
    } finally {
      setLoading(false)
    }
  }, [title, content, author, loadArticles])

  // 发布文章
  const handlePublish = useCallback(async (id: string) => {
    try {
      await apiCall(API_WECHAT, 'POST', '/publish', { id })
      await loadArticles()
    } catch (e) {
      setError(e instanceof Error ? e.message : '发布失败')
    }
  }, [loadArticles])

  return createElement('div', { className: 'wechat-article-panel' },
    error && createElement('div', { className: 'wechat-error' }, error),

    // 公众号凭据配置 —— 此前整块缺失，没有任何输入 AppID 的地方
    createElement('div', { className: 'wechat-section' },
      createElement('h4', null, '⚙ 公众号配置'),
      createElement('p', { className: 'wechat-desc' },
        '填写微信公众平台的 AppID / AppSecret（保存在本机插件数据目录，AppSecret 不回传明文）。'),
      createElement('div', { className: 'wechat-form' },
        createElement('label', { className: 'wechat-label' },
          'AppID',
          createElement('input', {
            type: 'text',
            value: appid,
            onChange: (e: React.ChangeEvent<HTMLInputElement>) => setAppid(e.target.value),
            placeholder: 'wx 开头的 AppID',
          }),
        ),
        createElement('label', { className: 'wechat-label' },
          hasSecret ? 'AppSecret（已配置，留空则不修改）' : 'AppSecret',
          createElement('input', {
            type: 'password',
            value: secret,
            onChange: (e: React.ChangeEvent<HTMLInputElement>) => setSecret(e.target.value),
            placeholder: hasSecret ? '已保存，如需更换请输入新的' : '公众号 AppSecret',
          }),
        ),
        createElement('div', { className: 'wechat-actions' },
          createElement('button', {
            className: 'wechat-btn wechat-btn-primary',
            onClick: handleSaveConfig,
            disabled: savingConfig || (!appid.trim() && !secret.trim()),
          }, savingConfig ? '⏳ 保存中…' : '💾 保存配置'),
          hasSecret
            ? createElement('span', { className: 'wechat-badge wechat-badge-published' }, '✅ 凭据已就绪')
            : createElement('span', { className: 'wechat-badge wechat-badge-draft' }, '⚠ 尚未配置'),
          configSaved && createElement('span', { className: 'wechat-badge wechat-badge-published' }, '已保存'),
        ),
      ),
    ),

    // 输入区域
    createElement('div', { className: 'wechat-section' },
      createElement('h4', null, '① 生成文章'),
      createElement('div', { className: 'wechat-form' },
        createElement('label', { className: 'wechat-label' },
          '标题',
          createElement('input', { type: 'text', value: title, onChange: (e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value), placeholder: '文章标题' }),
        ),
        createElement('label', { className: 'wechat-label' },
          '作者',
          createElement('input', { type: 'text', value: author, onChange: (e: React.ChangeEvent<HTMLInputElement>) => setAuthor(e.target.value), placeholder: '作者名称' }),
        ),
        createElement('label', { className: 'wechat-label' },
          '内容',
          createElement('textarea', {
            value: content,
            onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => setContent(e.target.value),
            placeholder: '文章内容...',
            rows: 8,
          }),
        ),
        createElement('button', {
          className: 'wechat-btn wechat-btn-primary',
          onClick: handleGenerate,
          disabled: loading || !title.trim() || !content.trim(),
        }, loading ? '⏳ 生成中...' : '📱 生成文章'),
      ),
    ),

    // 文章列表
    createElement('div', { className: 'wechat-section' },
      createElement('h4', null, '② 文章列表'),
      articles.length === 0
        ? createElement('p', { className: 'wechat-empty' }, '暂无文章')
        : createElement('div', { className: 'wechat-article-list' },
            articles.map(article =>
              createElement('div', { key: article.id, className: 'wechat-article-item' },
                createElement('div', { className: 'wechat-article-info' },
                  createElement('span', { className: 'wechat-article-title' }, article.title),
                  createElement('span', { className: 'wechat-article-author' }, article.author),
                  createElement('span', { className: `wechat-badge wechat-badge-${article.status}` },
                    article.status === 'published' ? '已发布' : '草稿'),
                ),
                createElement('div', { className: 'wechat-article-actions' },
                  article.status === 'draft' && createElement('button', {
                    className: 'wechat-btn wechat-btn-small',
                    onClick: () => handlePublish(article.id),
                  }, '📤 发布'),
                ),
              )
            ),
          ),
    ),
  )
}

// ─── 本地文件面板 ──────────────────────────────────────────────────────────

function LocalfilesPanel() {
  const [files, setFiles] = useState<LocalFile[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // 加载文件列表
  const loadFiles = useCallback(async () => {
    setLoading(true)
    try {
      const data = await apiCall<{ files: LocalFile[] }>(API_LOCALFILES, 'GET', '/list')
      setFiles(data.files)
    } catch (e) {
      setError(e instanceof Error ? e.message : '加载失败')
    } finally {
      setLoading(false)
    }
  }, [])

  // 上传文件
  const handleUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const content = await file.text()
      await apiCall(API_LOCALFILES, 'POST', '/upload', { filename: file.name, content })
      await loadFiles()
    } catch (err) {
      setError(err instanceof Error ? err.message : '上传失败')
    }
  }, [loadFiles])

  // 删除文件
  const handleDelete = useCallback(async (name: string) => {
    try {
      await fetch(`${API_LOCALFILES}/file/${name}`, { method: 'DELETE' })
      await loadFiles()
    } catch (err) {
      setError(err instanceof Error ? err.message : '删除失败')
    }
  }, [loadFiles])

  return createElement('div', { className: 'localfiles-panel' },
    error && createElement('div', { className: 'localfiles-error' }, error),

    // 上传区域
    createElement('div', { className: 'localfiles-section' },
      createElement('h4', null, '① 上传文件'),
      createElement('div', { className: 'localfiles-form' },
        createElement('label', { className: 'localfiles-label' },
          '选择文件',
          createElement('input', { type: 'file', onChange: handleUpload }),
        ),
      ),
    ),

    // 文件列表
    createElement('div', { className: 'localfiles-section' },
      createElement('h4', null, '② 文件列表'),
      files.length === 0
        ? createElement('p', { className: 'localfiles-empty' }, '暂无文件')
        : createElement('div', { className: 'localfiles-list' },
            files.map(file =>
              createElement('div', { key: file.name, className: 'localfiles-item' },
                createElement('span', { className: 'localfiles-name' }, file.name),
                createElement('span', { className: 'localfiles-size' }, `${(file.size / 1024).toFixed(1)} KB`),
                createElement('span', { className: 'localfiles-mtime' }, file.mtime),
                createElement('button', {
                  className: 'localfiles-btn localfiles-btn-danger',
                  onClick: () => handleDelete(file.name),
                }, '🗑'),
              )
            ),
          ),
    ),
  )
}
