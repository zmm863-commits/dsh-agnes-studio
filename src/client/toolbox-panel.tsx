/**
 * 多能宝箱面板
 * 功能：视频下载、文本转音频
 */

import { React, useState, useEffect, useCallback, createElement } from './react-shim.ts'

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
  const [activeTab, setActiveTab] = useState<'vidbee' | 'tts' | 'broll' | 'lyric' | 'animate'>('vidbee')

  return createElement('div', { className: 'toolbox-panel' },
    // 标题
    createElement('div', { className: 'toolbox-header' },
      createElement('h3', null, '多能宝箱'),
      createElement('p', { className: 'toolbox-desc' }, '视频下载 · 文本转音频 · 素材库 · 歌词对齐 · 动作迁移'),
    ),

    // 页签切换
    createElement('div', { className: 'toolbox-tabs' },
      createElement('button', {
        className: `toolbox-tab ${activeTab === 'vidbee' ? 'active' : ''}`,
        onClick: () => setActiveTab('vidbee'),
      }, 'VIDbee 视频下载'),
      createElement('button', {
        className: `toolbox-tab ${activeTab === 'tts' ? 'active' : ''}`,
        onClick: () => setActiveTab('tts'),
      }, '文本转音频'),
      createElement('button', {
        className: `toolbox-tab ${activeTab === 'broll' ? 'active' : ''}`,
        onClick: () => setActiveTab('broll'),
      }, '素材库'),
      createElement('button', {
        className: `toolbox-tab ${activeTab === 'lyric' ? 'active' : ''}`,
        onClick: () => setActiveTab('lyric'),
      }, '歌词对齐'),
      createElement('button', {
        className: `toolbox-tab ${activeTab === 'animate' ? 'active' : ''}`,
        onClick: () => setActiveTab('animate'),
      }, '动作迁移'),
    ),

    // 内容
    activeTab === 'vidbee'
      ? createElement(VidbeePanel)
      : activeTab === 'tts'
        ? createElement(TtsPanel)
        : activeTab === 'broll'
          ? createElement(BrollPanel)
          : activeTab === 'lyric'
            ? createElement(LyricPanel)
            : createElement(AnimatePanel),
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
      }, loading ? '下载中...' : '开始下载'),
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
      // 真实 TTS：后端调 MiMo，返回 base64 WAV 的 data URL
      const resp = await fetch('/agnes-studio/api/toolbox/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text.trim(), voice }),
      })
      const data = await resp.json() as { audio?: string; error?: string }
      if (!resp.ok || data.error !== undefined) throw new Error(data.error ?? `HTTP ${resp.status}`)
      if (data.audio === undefined || data.audio === '') throw new Error('后端没有返回音频')
      setAudioUrl(data.audio)
    } catch (e) {
      setError(e instanceof Error ? e.message : '转换失败')
    } finally {
      setLoading(false)
    }
  }, [text, voice])

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
      }, loading ? '转换中...' : '开始转换'),
    ),

    audioUrl && createElement('div', { className: 'tts-result' },
      createElement('h4', null, '转换结果'),
      createElement('audio', { controls: true, src: audioUrl, className: 'tts-audio' }, '您的浏览器不支持音频播放'),
    ),
  )
}

// ─── 素材库面板 ────────────────────────────────────────────────────────────

interface BrollAssetView {
  file: string
  name: string
  kind: 'video' | 'image'
  durationSec: number
  width: number
  height: number
  tags: string[]
}

function BrollPanel() {
  const [roots, setRoots] = useState('')
  const [query, setQuery] = useState('')
  const [assets, setAssets] = useState<BrollAssetView[]>([])
  const [matches, setMatches] = useState<Array<{ asset: BrollAssetView; score: number }> | null>(null)
  const [busy, setBusy] = useState(false)
  const [note, setNote] = useState('')
  const [error, setError] = useState('')

  const handleScan = useCallback(async () => {
    const list = roots.split('\n').map(line => line.trim()).filter(line => line !== '')
    if (list.length === 0) { setError('先填要扫描的目录（每行一个）'); return }
    setBusy(true); setError(''); setNote('')
    try {
      const resp = await fetch('/agnes-studio/api/broll/scan', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roots: list }),
      })
      const data = await resp.json() as { ok?: boolean; total?: number; added?: number; skipped?: number; error?: string; errors?: string[] }
      if (!resp.ok || data.error !== undefined) throw new Error(data.error ?? `HTTP ${resp.status}`)
      setNote(`索引 ${data.total ?? 0} 条（新增 ${data.added ?? 0}，跳过 ${data.skipped ?? 0}）`)
      await loadList()
    } catch (e) {
      setError(e instanceof Error ? e.message : '扫描失败')
    } finally { setBusy(false) }
  }, [roots])

  const loadList = useCallback(async () => {
    const resp = await fetch('/agnes-studio/api/broll/list')
    const data = await resp.json() as { assets?: BrollAssetView[] }
    setAssets(data.assets ?? [])
  }, [])

  const handleMatch = useCallback(async () => {
    if (query.trim() === '') { setMatches(null); return }
    const resp = await fetch('/agnes-studio/api/broll/match', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: query.trim(), limit: 20 }),
    })
    const data = await resp.json() as { matches?: Array<{ asset: BrollAssetView; score: number }> }
    setMatches(data.matches ?? [])
  }, [query])

  useEffect(() => { void loadList() }, [loadList])

  const shown = matches ?? assets.map(asset => ({ asset, score: 0 }))

  return createElement('div', { className: 'broll-panel' },
    error && createElement('div', { className: 'tts-error' }, error),
    note !== '' && createElement('div', { className: 'toolbox-desc' }, note),

    createElement('label', { className: 'tts-label' }, '素材目录（每行一个，例如 /root/素材/空镜）',
      createElement('textarea', {
        value: roots,
        onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => setRoots(e.target.value),
        placeholder: '/Users/me/Movies/broll',
        rows: 2,
      }),
    ),
    createElement('div', { className: 'tts-actions' },
      createElement('button', { className: 'agnes-btn agnes-btn-primary', disabled: busy, onClick: () => { void handleScan() } },
        busy ? '扫描中…' : '扫描并入库'),
    ),

    createElement('label', { className: 'tts-label' }, '按文案找素材（关键词）',
      createElement('input', {
        type: 'text', value: query,
        onChange: (e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value),
        placeholder: '例如：雨夜 巷子',
      }),
    ),
    createElement('div', { className: 'tts-actions' },
      createElement('button', { className: 'agnes-btn agnes-btn-secondary', onClick: () => { void handleMatch() } }, '匹配'),
      createElement('button', { className: 'agnes-btn agnes-btn-secondary', onClick: () => { setMatches(null); setQuery('') } }, '清除'),
    ),

    createElement('div', { className: 'broll-list' },
      shown.length === 0
        ? createElement('div', { className: 'toolbox-desc' }, assets.length === 0 ? '库是空的，先扫描一个目录。' : '没有命中的素材。')
        : shown.map(item => createElement('div', { key: item.asset.file, className: 'broll-item' },
            createElement('span', { className: 'broll-name' }, item.asset.name),
            createElement('span', { className: 'broll-meta' },
              item.asset.kind === 'video' ? `${item.asset.durationSec.toFixed(1)}s` : '图片',
              ` · ${item.asset.width}×${item.asset.height}`,
              item.score > 0 ? ` · 命中 ${item.score}` : '',
            ),
          )),
    ),
  )
}

// ─── 歌词对齐面板 ──────────────────────────────────────────────────────────

function LyricPanel() {
  const [lyrics, setLyrics] = useState('')
  const [audio, setAudio] = useState('')
  const [cues, setCues] = useState<Array<{ index: number; text: string; start: number; end: number; snapped: boolean }>>([])
  const [srt, setSrt] = useState('')
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const handleAlign = useCallback(async () => {
    if (lyrics.trim() === '' || audio.trim() === '') { setError('歌词和音频路径都要填'); return }
    setBusy(true); setError(''); setNote('')
    try {
      const resp = await fetch('/agnes-studio/api/lyric/align', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lyrics, audio: audio.trim() }),
      })
      const data = await resp.json() as { durationSec?: number; cues?: typeof cues; srt?: string; warning?: string; silences?: unknown[]; error?: string }
      if (!resp.ok || data.error !== undefined) throw new Error(data.error ?? `HTTP ${resp.status}`)
      setCues(data.cues ?? [])
      setSrt(data.srt ?? '')
      setNote(`${(data.durationSec ?? 0).toFixed(1)}s · ${(data.silences ?? []).length} 处停顿 · ${data.warning ?? '边界已吸附'}`)
    } catch (e) {
      setError(e instanceof Error ? e.message : '对齐失败')
    } finally { setBusy(false) }
  }, [lyrics, audio])

  return createElement('div', { className: 'lyric-panel' },
    error && createElement('div', { className: 'tts-error' }, error),
    note !== '' && createElement('div', { className: 'toolbox-desc' }, note),
    createElement('label', { className: 'tts-label' }, '歌词（每行一句）',
      createElement('textarea', { value: lyrics, rows: 6, onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => setLyrics(e.target.value) })),
    createElement('label', { className: 'tts-label' }, '音频路径',
      createElement('input', { type: 'text', value: audio, onChange: (e: React.ChangeEvent<HTMLInputElement>) => setAudio(e.target.value), placeholder: '/path/to/song.mp3' })),
    createElement('div', { className: 'tts-actions' },
      createElement('button', { className: 'agnes-btn agnes-btn-primary', disabled: busy, onClick: () => { void handleAlign() } }, busy ? '对齐中…' : '对齐'),
      srt !== '' && createElement('button', {
        className: 'agnes-btn agnes-btn-secondary',
        onClick: () => { void navigator.clipboard?.writeText(srt) },
      }, '复制 SRT')),
    cues.length > 0 && createElement('div', { className: 'lyric-cues' },
      ...cues.map(cue => createElement('div', { key: cue.index, className: 'lyric-cue' },
        createElement('span', { className: 'lyric-time' }, `${cue.start.toFixed(2)} → ${cue.end.toFixed(2)}`),
        createElement('span', { className: 'lyric-text' }, cue.text),
        createElement('span', { className: 'lyric-flag' }, cue.snapped ? '吸附' : '比例'),
      ))),
  )
}

// ─── 动作迁移面板 ──────────────────────────────────────────────────────────

function AnimatePanel() {
  const [image, setImage] = useState('')
  const [reference, setReference] = useState('')
  const [prompt, setPrompt] = useState('')
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState('')
  const [error, setError] = useState('')

  const handleRun = useCallback(async () => {
    if (image.trim() === '') { setError('需要角色图（http(s) 地址或 data URL）'); return }
    setBusy(true); setError(''); setResult('')
    try {
      const resp = await fetch('/agnes-studio/api/animate/transfer', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: image.trim(),
          referenceVideo: reference.trim() === '' ? undefined : reference.trim(),
          prompt: prompt.trim() === '' ? undefined : prompt.trim(),
        }),
      })
      const data = await resp.json() as { ok?: boolean; url?: string; file?: string; detail?: string }
      if (data.ok !== true) throw new Error(data.detail ?? '生成失败')
      setResult(data.file !== undefined && data.file !== '' ? `已保存：${data.file}` : `已完成：${data.url ?? ''}`)
    } catch (e) {
      setError(e instanceof Error ? e.message : '生成失败')
    } finally { setBusy(false) }
  }, [image, reference, prompt])

  return createElement('div', { className: 'animate-panel' },
    error && createElement('div', { className: 'tts-error' }, error),
    result !== '' && createElement('div', { className: 'toolbox-desc' }, result),
    createElement('label', { className: 'tts-label' }, '角色图地址',
      createElement('input', { type: 'text', value: image, onChange: (e: React.ChangeEvent<HTMLInputElement>) => setImage(e.target.value), placeholder: 'https://… 或 data:image/…' })),
    createElement('label', { className: 'tts-label' }, '参考动作视频（可选）',
      createElement('input', { type: 'text', value: reference, onChange: (e: React.ChangeEvent<HTMLInputElement>) => setReference(e.target.value), placeholder: 'https://…mp4' })),
    createElement('label', { className: 'tts-label' }, '动作描述（可选）',
      createElement('input', { type: 'text', value: prompt, onChange: (e: React.ChangeEvent<HTMLInputElement>) => setPrompt(e.target.value), placeholder: '人物挥手、转身' })),
    createElement('div', { className: 'tts-actions' },
      createElement('button', { className: 'agnes-btn agnes-btn-primary', disabled: busy, onClick: () => { void handleRun() } }, busy ? '生成中（可能几分钟）…' : '开始迁移')),
    createElement('div', { className: 'toolbox-desc' }, '模型默认 agnes-video-2.5-flash 的 reference 模式；平台若上架了专门的动作迁移模型，用 DSH_ANIMATE_MODEL 指定。'),
  )
}
