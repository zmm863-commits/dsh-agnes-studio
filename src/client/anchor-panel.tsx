/**
 * 数字人口播面板 —— 文稿 → 分段 → 配音 → 画面 → 字幕 → 成片
 *
 * 三种画面模式：静态形象图 / 视频素材 / AI 生成画面。
 * 依赖（ffmpeg、中文字体、TTS Key）缺失时给出明确指引，而不是静默失败。
 */
declare const require: ((id: string) => unknown) | undefined
function shellRequire(id: string): any { try { return typeof require === 'function' ? require(id) : undefined } catch { return undefined } }
const React: any = shellRequire('react') ?? (globalThis as any).React ?? null
const NOOP = (): void => {}
const useState: any = React?.useState ?? ((i: unknown) => [i, NOOP])
const useEffect: any = React?.useEffect ?? NOOP
const useCallback: any = React?.useCallback ?? ((f: unknown) => f)
const useRef: any = React?.useRef ?? ((i: unknown) => ({ current: i }))
const createElement: any = React?.createElement ?? (() => null)

import { injectStyles } from './styles.ts'
import {
  startAnchor, getAnchorTask, pollAnchorStatus, stopAnchor, resumeAnchor,
  fetchFfmpegStatus, fileToDataUrl, ANCHOR_VOICES,
  type VisualMode, type AnchorStatusPayload, type AnchorSegment,
} from './anchor.ts'

const MODES: Array<{ id: VisualMode; icon: string; name: string; desc: string }> = [
  { id: 'static', icon: '🖼', name: '静态形象图', desc: '一张形象图循环展示（最快最稳）' },
  { id: 'clip', icon: '🎞', name: '视频素材', desc: '上传视频按旁白长度循环/截取' },
  { id: 'ai', icon: '✨', name: 'AI 生成画面', desc: '用 AI 生成背景片再铺满（约 2-4 分钟）' },
]

const SAMPLE = '大家好，欢迎使用泡泡猫的影视工具。这里是数字人口播功能，只要输入文稿，系统就会自动完成分段、配音、画面和字幕。'

export function AnchorPanel() {
  injectStyles()
  const [text, setText] = useState('')
  const [mode, setMode] = useState<VisualMode>('static')
  const [voice, setVoice] = useState(ANCHOR_VOICES[0]?.id ?? 'mimo_default')
  const [minSeg, setMinSeg] = useState(4)
  const [subtitles, setSubtitles] = useState(true)
  const [aiPrompt, setAiPrompt] = useState('')
  const [perSegment, setPerSegment] = useState(false)
  const [imageData, setImageData] = useState('')
  const [clipData, setClipData] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [status, setStatus] = useState<AnchorStatusPayload | null>(null)
  const [segments, setSegments] = useState<AnchorSegment[]>([])
  const [ff, setFf] = useState<{ available: boolean; font: string; hint: string } | null>(null)
  const cancelRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    fetchFfmpegStatus().then(setFf).catch(() => setFf(null))
    return () => { cancelRef.current?.() }
  }, [])

  const pickFile = useCallback(async (file: File | undefined, kind: 'image' | 'clip') => {
    if (!file) return
    try {
      const url = await fileToDataUrl(file)
      if (kind === 'image') setImageData(url)
      else setClipData(url)
      setError('')
    } catch (e: any) {
      setError(e?.message || '读取文件失败')
    }
  }, [])

  const handleStart = useCallback(async () => {
    if (!text.trim()) { setError('请先输入口播文稿'); return }
    if (mode === 'static' && !imageData) { setError('静态形象图模式需要先选择一张图片'); return }
    if (mode === 'clip' && !clipData) { setError('视频素材模式需要先选择一个视频'); return }
    setBusy(true); setError(''); setStatus(null); setSegments([])
    try {
      const payload: any = {
        text: text.trim(), mode, voice, min_seg_sec: minSeg, subtitles,
      }
      if (mode === 'static') payload.image = { kind: 'data', value: imageData }
      if (mode === 'clip') payload.clip = { kind: 'data', value: clipData }
      if (mode === 'ai') {
        payload.ai_prompt = aiPrompt.trim() || undefined
        payload.ai_per_segment = perSegment
      }

      const r = await startAnchor(payload)
      cancelRef.current?.()
      cancelRef.current = pollAnchorStatus(r.anchor_id, (s) => {
        setStatus(s)
        if (s.status === 'completed' || s.status === 'failed' || s.status === 'stopped') {
          setBusy(false)
          getAnchorTask(r.anchor_id).then(t => setSegments(t.segments || [])).catch(() => {})
        }
      })
    } catch (e: any) {
      setError(e?.message || '提交失败')
      setBusy(false)
    }
  }, [text, mode, voice, minSeg, subtitles, imageData, clipData, aiPrompt, perSegment])

  const handleStop = useCallback(async () => {
    if (status?.anchor_id) await stopAnchor(status.anchor_id).catch(() => {})
    setBusy(false)
  }, [status])

  const handleResume = useCallback(async () => {
    if (!status?.anchor_id) return
    setBusy(true)
    await resumeAnchor(status.anchor_id).catch(() => {})
    cancelRef.current?.()
    cancelRef.current = pollAnchorStatus(status.anchor_id, (s) => {
      setStatus(s)
      if (s.status === 'completed' || s.status === 'failed') setBusy(false)
    })
  }, [status])

  const rowStyle = { display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' as const }
  const labelStyle = { fontSize: '12px', color: 'var(--ag-text-2, #2a3c5e)', minWidth: '64px' }
  const inputStyle = {
    flex: 1, minWidth: '160px', padding: '7px 10px', borderRadius: '8px',
    border: '1px solid var(--ag-line-2, rgba(32,96,190,0.32))',
    background: 'var(--ag-surface-2, rgba(255,255,255,0.55))',
    color: 'var(--ag-text, #0c1a33)', fontSize: '13px',
  }

  return createElement(
    'div',
    { className: 'agnes-anchor' },
    // 依赖提示
    ff && !ff.available
      ? createElement('div', { className: 'agnes-keyguide', style: { margin: '16px 16px 0' } },
          createElement('div', { className: 'agnes-keyguide-head' },
            createElement('div', { className: 'agnes-keyguide-title' }, '⚠️ 缺少 ffmpeg，口播功能不可用'),
          ),
          createElement('div', { className: 'agnes-keyguide-note' }, ff.hint || '请安装 ffmpeg 后重试'),
        )
      : null,
    ff && ff.available && !ff.font
      ? createElement('div', { className: 'agnes-keyguide', style: { margin: '16px 16px 0' } },
          createElement('div', { className: 'agnes-keyguide-head' },
            createElement('div', { className: 'agnes-keyguide-title' }, '⚠️ 未找到中文字体'),
          ),
          createElement('div', { className: 'agnes-keyguide-note' }, ff.hint || '字幕会显示成方块，建议安装中文字体'),
        )
      : null,

    createElement('div', { className: 'agnes-anchor-grid' },
      createElement('div', { className: 'agnes-anchor-col' },
    createElement('div', { className: 'agnes-section' },
      createElement('div', { className: 'agnes-section-title' }, '🎙 文稿'),
      createElement('textarea', {
        className: 'agnes-textarea',
        rows: 5,
        placeholder: '输入口播文稿，支持中文标点自动分段…',
        value: text,
        onChange: (e: any) => setText(e.target.value),
        style: { width: '100%', resize: 'vertical' as const },
      }),
      createElement('div', { style: { ...rowStyle, marginTop: '8px' } },
        createElement('button', {
          className: 'agnes-btn agnes-btn-ghost',
          onClick: () => setText(SAMPLE),
        }, '填入示例文稿'),
        createElement('span', { style: { fontSize: '12px', color: 'var(--ag-text-2, #2a3c5e)' } },
          `${text.length} 字`),
      ),
    ),

    createElement('div', { className: 'agnes-section' },
      createElement('div', { className: 'agnes-section-title' }, '🎬 画面模式'),
      createElement('div', { className: 'agnes-mode-cards' },
        ...MODES.map(m => createElement('button', {
          key: m.id,
          className: `agnes-mode-card${mode === m.id ? ' active' : ''}`,
          onClick: () => setMode(m.id),
          title: m.desc,
        },
          createElement('span', { className: 'agnes-mode-icon' }, m.icon),
          createElement('span', null, m.name),
          createElement('span', { className: 'agnes-mode-desc' }, m.desc),
        )),
      ),

      mode === 'static'
        ? createElement('div', { style: { ...rowStyle, marginTop: '8px' } },
            createElement('label', { className: 'agnes-btn agnes-btn-ghost' },
              imageData ? '✅ 已选择形象图' : '选择形象图',
              createElement('input', {
                type: 'file', accept: 'image/*', style: { display: 'none' },
                onChange: (e: any) => pickFile(e.target.files?.[0], 'image'),
              }),
            ),
            imageData ? createElement('img', {
              src: imageData, alt: '形象图',
              style: { height: '48px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.12)' },
            }) : null,
          )
        : null,

      mode === 'clip'
        ? createElement('div', { style: { ...rowStyle, marginTop: '8px' } },
            createElement('label', { className: 'agnes-btn agnes-btn-ghost' },
              clipData ? '✅ 已选择视频' : '选择视频素材',
              createElement('input', {
                type: 'file', accept: 'video/*', style: { display: 'none' },
                onChange: (e: any) => pickFile(e.target.files?.[0], 'clip'),
              }),
            ),
            clipData ? createElement('video', {
              src: clipData, muted: true,
              style: { height: '48px', borderRadius: '6px' },
            }) : null,
          )
        : null,

      mode === 'ai'
        ? createElement('div', null,
            createElement('div', { style: { ...rowStyle, marginTop: '8px' } },
              createElement('span', { style: labelStyle }, '画面风格'),
              createElement('input', {
                style: inputStyle,
                placeholder: '例如：城市夜景，霓虹灯，电影质感，无人',
                value: aiPrompt,
                onChange: (e: any) => setAiPrompt(e.target.value),
              }),
            ),
            createElement('label', { style: { ...rowStyle, marginTop: '8px', cursor: 'pointer' } },
              createElement('input', {
                type: 'checkbox', checked: perSegment,
                onChange: (e: any) => setPerSegment(e.target.checked),
              }),
              createElement('span', { style: { fontSize: '12px' } }, '逐段生成画面（每段台词配一段画面，更贴合内容）'),
            ),
            createElement('div', { className: 'agnes-keyguide-note', style: { marginTop: '4px' } },
              perSegment
                ? '⚠️ 每段各生成一段视频，耗时 ≈ 段数 × 2-4 分钟，且按段消耗额度'
                : '整片只生成一段背景画面并循环铺满（快、省额度）'),
          )
        : null,
    ),

    createElement('div', { className: 'agnes-section' },
      createElement('div', { className: 'agnes-section-title' }, '⚙ 参数'),
      // 标签与控件成组，避免 flex 换行时把 label 和 select 拆到两行
      createElement('div', { className: 'agnes-param-grid' },
        createElement('label', { className: 'agnes-param' },
          createElement('span', { className: 'agnes-param-label' }, '音色'),
          createElement('select', {
            className: 'agnes-param-control',
            value: voice,
            onChange: (e: any) => setVoice(e.target.value),
          }, ...ANCHOR_VOICES.map(v => createElement('option', { key: v.id, value: v.id }, v.name))),
        ),
        createElement('label', { className: 'agnes-param' },
          createElement('span', { className: 'agnes-param-label' }, '每段最少'),
          createElement('select', {
            className: 'agnes-param-control',
            value: String(minSeg),
            onChange: (e: any) => setMinSeg(Number(e.target.value)),
          }, ...[3, 4, 6, 8, 10].map(s => createElement('option', { key: s, value: String(s) }, `${s} 秒`))),
        ),
        createElement('label', { className: 'agnes-param agnes-param-check' },
          createElement('input', {
            type: 'checkbox', checked: subtitles,
            onChange: (e: any) => setSubtitles(e.target.checked),
          }),
          createElement('span', { className: 'agnes-param-label' }, '烧录字幕'),
        ),
      ),
    ),

    error ? createElement('div', { className: 'agnes-error' }, error) : null,

    createElement('div', { style: { ...rowStyle } },
      createElement('button', {
        className: `agnes-btn ${busy ? 'agnes-btn-danger' : 'agnes-btn-primary'}`,
        onClick: busy ? handleStop : handleStart,
        style: { flex: '0 0 auto', minWidth: '200px' },
      }, busy ? '⏹ 停止生成' : '🎙 开始生成口播视频'),
      busy ? createElement('span', { style: { fontSize: '12px', color: 'var(--ag-text-2, #2a3c5e)' } },
        '生成中…（配音约 3-5 秒/段，AI 画面模式另需 2-4 分钟）') : null,
    ),

      ),
      createElement('div', { className: 'agnes-anchor-col' },
    createElement('div', { className: 'agnes-anchor-side' },
    // 空态（还没有任务时也要有内容，避免右列塌成黑洞）
    !status
      ? createElement('div', { className: 'agcv-empty' },
          createElement('div', { className: 'agnes-empty-icon' }, '🎙'),
          createElement('div', { className: 'agnes-empty-title' }, '口播成片'),
          createElement('div', { className: 'agcv-hint' }, '左侧填写文稿并选择画面模式，点击生成后成片会出现在这里'),
          createElement('div', { className: 'agcv-slot-row' },
            ...[1, 2, 3].map(i => createElement('div', { key: i, className: 'agcv-slot-mini' }, createElement('span', null, String(i)))),
          ),
        )
      : null,
    // 进度
    status && status.status !== 'completed'
      ? createElement('div', { className: 'agnes-section', style: { width: '100%' } },
          createElement('div', { className: 'agnes-section-title' }, '📊 进度'),
          createElement('div', { style: { fontSize: '13px', marginBottom: '6px' } }, status.message),
          createElement('div', { className: 'agnes-progress-bar', style: { width: '100%' } },
            createElement('div', {
              className: 'agnes-progress-fill',
              style: {
                width: `${status.segments ? Math.round((status.done / status.segments) * 100) : 0}%`,
              },
            }),
          ),
          createElement('div', { style: { fontSize: '12px', color: 'var(--ag-text-2, #2a3c5e)', marginTop: '4px' } },
            `配音 ${status.done}/${status.segments} 段`),
          status.error ? createElement('div', { className: 'agnes-error', style: { marginTop: '8px' } },
            `❌ ${status.error}`) : null,
          status.status === 'failed'
            ? createElement('button', { className: 'agnes-btn', onClick: handleResume, style: { marginTop: '8px' } },
                '🔄 重新生成')
            : null,
        )
      : null,

    // 成片
    status?.status === 'completed' && status.final
      ? createElement('div', { className: 'agnes-section' },
          createElement('div', { className: 'agnes-section-title' }, '🎬 成片'),
          createElement('video', {
            src: status.final, controls: true,
            style: { width: '100%', borderRadius: '10px', background: '#000' },
          }),
          createElement('div', { style: { ...rowStyle, marginTop: '10px' } },
            createElement('a', {
              className: 'agnes-btn', href: status.final, download: `口播-${status.anchor_id}.mp4`,
              style: { textDecoration: 'none' },
            }, '⬇️ 下载成片'),
            createElement('span', { style: { fontSize: '12px', color: 'var(--ag-text-2, #2a3c5e)' } },
              `${status.segments} 段 · ${Number(status.total_duration || 0).toFixed(1)} 秒`),
          ),
          segments.length > 0
            ? createElement('div', { style: { marginTop: '12px' } },
                createElement('div', { className: 'agnes-section-title', style: { fontSize: '12px' } }, '分段台词'),
                ...segments.map(s => createElement('div', {
                  key: s.index,
                  style: {
                    fontSize: '12px', padding: '5px 8px', marginTop: '4px', borderRadius: '6px',
                    background: 'var(--ag-surface-2, rgba(255,255,255,0.55))',
                    color: 'var(--ag-text-2, #2a3c5e)',
                  },
                }, `${s.index + 1}. [${s.start.toFixed(1)}-${s.end.toFixed(1)}s] ${s.text}`)),
              )
            : null,
        )
      : null,
    ),
      ),
    ),
  )
}
