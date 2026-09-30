/**
 * 多能宝箱面板
 * 功能：视频下载、文本转音频
 */

import { React, useState, useCallback, createElement } from './react-shim.ts'

// ─── API 调用 ──────────────────────────────────────────────────────────────

const API_BASE = '/agnes-studio/api/toolbox'

async function apiCall<T>(method: string, path: string, body?: unknown): Promise<T> {
  const resp = await fetch(`${API_BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = await resp.json().catch(() => ({}))
  if (!resp.ok || data?.error) throw new Error(data?.error || `请求失败（HTTP ${resp.status}）`)
  return data as T
}

// ─── 组件 ──────────────────────────────────────────────────────────────────

export function ToolboxPanel() {
  const [activeTab, setActiveTab] = useState<'vidbee' | 'tts'>('vidbee')

  return createElement('div', { className: 'toolbox-panel' },
    // 标题
    createElement('div', { className: 'toolbox-header' },
      createElement('h3', null, '🧰 多能宝箱'),
      createElement('p', { className: 'toolbox-desc' }, '视频下载 + 文本转音频'),
    ),

    // 页签切换
    createElement('div', { className: 'toolbox-tabs' },
      createElement('button', {
        className: `toolbox-tab ${activeTab === 'vidbee' ? 'active' : ''}`,
        onClick: () => setActiveTab('vidbee'),
      }, '📹 VIDbee 视频下载'),
      createElement('button', {
        className: `toolbox-tab ${activeTab === 'tts' ? 'active' : ''}`,
        onClick: () => setActiveTab('tts'),
      }, '🔊 文本转音频'),
    ),

    // 内容
    activeTab === 'vidbee'
      ? createElement(VidbeePanel)
      : createElement(TtsPanel),
  )
}

// ─── VIDbee 视频下载面板 ───────────────────────────────────────────────────

function VidbeePanel() {
  const [url, setUrl] = useState('')
  const [quality, setQuality] = useState('best')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [log, setLog] = useState<string[]>([])

  const handleDownload = useCallback(async () => {
    if (!url.trim()) {
      setError('请输入视频链接')
      return
    }

    setLoading(true)
    setError('')
    setLog([])

    try {
      const data = await apiCall<{ task_id: string }>('POST', '/vidbee/download', { url, quality })

      // 轮询状态
      const pollStatus = async () => {
        const statusData = await apiCall<{ status: string; log: string[] }>('GET', `/vidbee/status?task_id=${data.task_id}`)
        setLog(statusData.log)
        if (statusData.status === 'done') {
          setLoading(false)
        } else if (statusData.status === 'failed') {
          setLoading(false)
          setError('下载失败')
        } else {
          setTimeout(pollStatus, 2000)
        }
      }
      pollStatus()
    } catch (e) {
      setError(e instanceof Error ? e.message : '下载失败')
      setLoading(false)
    }
  }, [url, quality])

  return createElement('div', { className: 'vidbee-panel' },
    error && createElement('div', { className: 'vidbee-error' }, error),

    createElement('div', { className: 'vidbee-form' },
      createElement('label', { className: 'vidbee-label' },
        '视频链接',
        createElement('input', { type: 'text', value: url, onChange: (e: React.ChangeEvent<HTMLInputElement>) => setUrl(e.target.value), placeholder: 'https://...' }),
      ),
      createElement('label', { className: 'vidbee-label' },
        '画质',
        createElement('select', { value: quality, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => setQuality(e.target.value) },
          createElement('option', { value: 'best' }, '最佳'),
          createElement('option', { value: '1080p' }, '1080p'),
          createElement('option', { value: '720p' }, '720p'),
          createElement('option', { value: '480p' }, '480p'),
        ),
      ),
      createElement('button', {
        className: 'vidbee-btn vidbee-btn-primary',
        onClick: handleDownload,
        disabled: loading || !url.trim(),
      }, loading ? '⏳ 下载中...' : '⬇️ 开始下载'),
    ),

    log.length > 0 && createElement('div', { className: 'vidbee-log' },
      createElement('h4', null, '下载日志'),
      createElement('pre', null, log.join('\n')),
    ),
  )
}

// ─── 文本转音频面板 ────────────────────────────────────────────────────────

function TtsPanel() {
  const [text, setText] = useState('')
  const [voice, setVoice] = useState('xiaoxiao')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [audioUrl, setAudioUrl] = useState('')

  const handleConvert = useCallback(async () => {
    if (!text.trim()) {
      setError('请输入文本')
      return
    }

    setLoading(true)
    setError('')
    setAudioUrl('')

    try {
      // 模拟 TTS 转换
      await new Promise(r => setTimeout(r, 1000))
      setAudioUrl('/agnes-studio/api/toolbox/tts/demo.mp3')
    } catch (e) {
      setError(e instanceof Error ? e.message : '转换失败')
    } finally {
      setLoading(false)
    }
  }, [text])

  return createElement('div', { className: 'tts-panel' },
    error && createElement('div', { className: 'tts-error' }, error),

    createElement('div', { className: 'tts-form' },
      createElement('label', { className: 'tts-label' },
        '文本内容',
        createElement('textarea', {
          value: text,
          onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => setText(e.target.value),
          placeholder: '输入要转换的文本...',
          rows: 6,
        }),
      ),
      createElement('label', { className: 'tts-label' },
        '音色',
        createElement('select', { value: voice, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => setVoice(e.target.value) },
          createElement('option', { value: 'xiaoxiao' }, '晓晓（女声）'),
          createElement('option', { value: 'yunxi' }, '云希（男声）'),
          createElement('option', { value: 'yunyang' }, '云扬（男声）'),
        ),
      ),
      createElement('button', {
        className: 'tts-btn tts-btn-primary',
        onClick: handleConvert,
        disabled: loading || !text.trim(),
      }, loading ? '⏳ 转换中...' : '🔊 开始转换'),
    ),

    audioUrl && createElement('div', { className: 'tts-result' },
      createElement('h4', null, '转换结果'),
      createElement('audio', { controls: true, src: audioUrl, className: 'tts-audio' }, '您的浏览器不支持音频播放'),
    ),
  )
}
