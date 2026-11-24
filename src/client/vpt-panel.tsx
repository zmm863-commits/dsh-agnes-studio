/**
 * 转提示词（VPT）面板
 *
 * 上传图片或视频 → 关键帧逆向 → 输出可直接用于其它生成模型的提示词。
 * 后端：`/agnes-studio/api/vpt/image`、`/agnes-studio/api/vpt/video`。
 */
import { createElement, useEffect, useRef, useState } from './react-shim.ts'

const TARGETS: Array<{ id: string; label: string }> = [
  { id: 'general', label: '通用' },
  { id: 'seedance', label: 'Seedance（中文长镜头）' },
  { id: 'veo', label: 'Veo（英文电影语法）' },
  { id: 'kling', label: '可灵 Kling（分层简洁）' },
  { id: 'wan', label: '阿里 Wan（主体在前）' },
  { id: 'midjourney', label: 'Midjourney（风格关键词）' },
  { id: 'flux', label: 'FLUX（自然语言长描述）' },
]

/** 图片上限 10MB，视频上限 40MB（base64 后约 1.33 倍）。 */
const IMAGE_LIMIT = 10 * 1024 * 1024
const VIDEO_LIMIT = 40 * 1024 * 1024

export interface VptPanelProps {
  /** 可选视觉模型（复用文本模型清单）。 */
  textModels: Record<string, string>
}

export function VptPanel(props: VptPanelProps): unknown {
  const { textModels } = props
  const [mode, setMode] = useState<'image' | 'video'>('image')
  const [dataUrl, setDataUrl] = useState<string>('')
  const [fileName, setFileName] = useState<string>('')
  const [fileSize, setFileSize] = useState<number>(0)
  const [target, setTarget] = useState<string>('general')
  const [lang, setLang] = useState<'zh' | 'en'>('zh')
  const [frames, setFrames] = useState<number>(6)
  const [model, setModel] = useState<string>('agnes-2.5-flash')
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState<string>('')
  const [error, setError] = useState<string>('')
  const [copied, setCopied] = useState(false)
  const inputRef = useRef<HTMLInputElement | null>(null)

  const modelOptions = Object.keys(textModels).length
    ? textModels
    : { 'agnes-2.5-flash': 'Agnes 2.5 Flash' }

  useEffect(() => {
    if (!copied) return
    const t = setTimeout(() => setCopied(false), 1600)
    return () => clearTimeout(t)
  }, [copied])

  const accept = mode === 'image'
    ? 'image/png,image/jpeg,image/webp,image/gif'
    : 'video/mp4,video/webm,video/quicktime,video/x-matroska'

  const pick = () => inputRef.current?.click()

  const onFile = (file: File | null | undefined) => {
    if (!file) return
    const limit = mode === 'image' ? IMAGE_LIMIT : VIDEO_LIMIT
    if (file.size > limit) {
      setError(`文件 ${(file.size / 1048576).toFixed(1)}MB 超过 ${limit / 1048576}MB 上限`)
      return
    }
    setError('')
    setResult('')
    setFileName(file.name)
    setFileSize(file.size)
    const reader = new FileReader()
    reader.onload = () => setDataUrl(String(reader.result ?? ''))
    reader.onerror = () => setError('读取文件失败')
    reader.readAsDataURL(file)
  }

  const submit = async () => {
    if (!dataUrl || busy) return
    setBusy(true)
    setError('')
    setResult('')
    try {
      const endpoint = mode === 'image' ? '/agnes-studio/api/vpt/image' : '/agnes-studio/api/vpt/video'
      const payload: Record<string, unknown> = { target, lang, model }
      if (mode === 'image') payload.image = dataUrl
      else { payload.video = dataUrl; payload.frames = frames }
      const r = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await r.json() as { prompt?: string; error?: string; frames?: number; duration?: number }
      if (!r.ok || data.error) throw new Error(data.error || `HTTP ${r.status}`)
      setResult(String(data.prompt ?? ''))
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setBusy(false)
    }
  }

  const copy = async () => {
    if (!result) return
    try {
      await navigator.clipboard.writeText(result)
      setCopied(true)
    } catch {
      setError('复制失败，请手动选中')
    }
  }

  const seg = (id: 'image' | 'video', label: string) => createElement('button', {
    key: id,
    className: `agnes-btn agnes-btn-secondary agnes-vpt-seg${mode === id ? ' active' : ''}`,
    onClick: () => { setMode(id); setDataUrl(''); setFileName(''); setFileSize(0); setResult(''); setError('') },
  }, label)

  return createElement('div', { className: 'agnes-vpt' },
    createElement('div', { className: 'agnes-section' },
      createElement('div', { className: 'agnes-section-title' }, '转提示词'),
      createElement('p', { className: 'agnes-vpt-lead' },
        '上传图片或视频，逐帧逆向出可直接用于其它生成模型的提示词。全程走本机代理，文件不离开你的机器。'),

      createElement('div', { className: 'agnes-vpt-row' }, seg('image', '🖼 图片'), seg('video', '🎬 视频')),

      createElement('input', {
        ref: inputRef,
        type: 'file',
        accept,
        style: { display: 'none' },
        onChange: (e: Event) => onFile((e.target as HTMLInputElement).files?.[0]),
      }),

      createElement('div', {
        className: `agnes-vpt-drop${dataUrl ? ' has-file' : ''}`,
        onClick: pick,
      },
        dataUrl && mode === 'image'
          ? createElement('img', { src: dataUrl, className: 'agnes-vpt-thumb', alt: '' })
          : dataUrl && mode === 'video'
            ? createElement('video', { src: dataUrl, className: 'agnes-vpt-thumb', muted: true })
            : createElement('div', { className: 'agnes-vpt-drop-hint' },
                createElement('div', { className: 'agnes-vpt-drop-icon' }, mode === 'image' ? '🖼' : '🎬'),
                createElement('div', null, `点击选择${mode === 'image' ? '图片' : '视频'}`),
                createElement('div', { className: 'agnes-vpt-drop-sub' },
                  mode === 'image' ? 'PNG / JPG / WebP / GIF，≤10MB' : 'MP4 / WebM / MOV，≤40MB'),
              ),
        fileName ? createElement('div', { className: 'agnes-vpt-file' },
          `${fileName} · ${(fileSize / 1048576).toFixed(1)}MB`) : null,
      ),

      createElement('div', { className: 'agnes-vpt-opts' },
        createElement('label', { className: 'agnes-vpt-field' },
          createElement('span', null, '目标格式'),
          createElement('select', {
            className: 'agnes-select',
            value: target,
            onChange: (e: Event) => setTarget((e.target as HTMLSelectElement).value),
          }, ...TARGETS.map(t => createElement('option', { key: t.id, value: t.id }, t.label))),
        ),
        createElement('label', { className: 'agnes-vpt-field' },
          createElement('span', null, '输出语言'),
          createElement('select', {
            className: 'agnes-select',
            value: lang,
            onChange: (e: Event) => setLang((e.target as HTMLSelectElement).value as 'zh' | 'en'),
          },
            createElement('option', { value: 'zh' }, '简体中文'),
            createElement('option', { value: 'en' }, 'English'),
          ),
        ),
        mode === 'video'
          ? createElement('label', { className: 'agnes-vpt-field' },
              createElement('span', null, '抽帧数'),
              createElement('select', {
                className: 'agnes-select',
                value: String(frames),
                onChange: (e: Event) => setFrames(Number((e.target as HTMLSelectElement).value)),
              },
                createElement('option', { value: '4' }, '4 帧'),
                createElement('option', { value: '6' }, '6 帧'),
                createElement('option', { value: '8' }, '8 帧'),
              ),
            )
          : null,
        createElement('label', { className: 'agnes-vpt-field' },
          createElement('span', null, '视觉模型'),
          createElement('select', {
            className: 'agnes-select',
            value: model,
            onChange: (e: Event) => setModel((e.target as HTMLSelectElement).value),
          }, ...Object.entries(modelOptions).map(([id, label]) =>
            createElement('option', { key: id, value: id }, String(label)),
          )),
        ),
      ),

      error ? createElement('div', { className: 'agnes-vpt-error' }, error) : null,

      createElement('div', { className: 'agnes-vpt-actions' },
        createElement('button', {
          className: 'agnes-btn agnes-btn-primary',
          disabled: !dataUrl || busy,
          onClick: () => { void submit() },
        }, busy ? (mode === 'video' ? '抽帧与逆向分析中…' : '分析中…') : '生成提示词'),
        result
          ? createElement('button', {
              className: 'agnes-btn agnes-btn-secondary',
              onClick: () => { void copy() },
            }, copied ? '已复制' : '复制')
          : null,
      ),

      result
        ? createElement('div', { className: 'agnes-vpt-result' },
            createElement('textarea', {
              className: 'agnes-textarea agnes-vpt-out',
              value: result,
              readOnly: true,
            }),
          )
        : null,
    ),
  )
}
