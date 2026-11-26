/**
 * 提示词专家面板 — 7 类专家，中文想法 → 中英对照提示词
 */

import { useState, useEffect, useCallback, createElement } from './react-shim.ts'
import { StudioSplit } from './split-layout.tsx'

import { injectStyles } from './styles.ts'
import { fetchExpertTypes, generateExpertPrompt, type ExpertType } from './prompt-expert.ts'

interface Props {
  textModels: Record<string, string>
  /** 把生成的提示词直接送到「生图」页。未提供时不显示该按钮。 */
  onUseForImage?: (prompt: string) => void
  /** 把生成的提示词直接送到「生视频」页。未提供时不显示该按钮。 */
  onUseForVideo?: (prompt: string) => void
}

export function PromptExpertPanel({ textModels, onUseForImage, onUseForVideo }: Props) {
  injectStyles()
  const [types, setTypes] = useState<ExpertType[]>([])
  const [selected, setSelected] = useState('')
  const [idea, setIdea] = useState('')
  const [params, setParams] = useState<Record<string, string>>({})
  const [model, setModel] = useState(() => {
    try { return Object.keys(textModels)[0] || 'agnes-3.0-flash' } catch { return 'agnes-3.0-flash' }
  })
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [history, setHistory] = useState<Array<{ type: string; idea: string; result: string; time: number }>>([])

  useEffect(() => {
    fetchExpertTypes().then(setTypes).catch(() => {})
    try {
      const raw = localStorage?.getItem('agnes-expert-history')
      if (raw) setHistory(JSON.parse(raw))
    } catch { /* ignore */ }
  }, [])

  const currentType = types.find((t: ExpertType) => t.key === selected)

  const handleGenerate = useCallback(async () => {
    if (!selected || !idea.trim() || loading) return
    setLoading(true); setError(''); setResult('')
    try {
      const r = await generateExpertPrompt({ type: selected, idea: idea.trim(), params, model })
      setResult(r)
      const entry = { type: selected, idea: idea.trim(), result: r, time: Date.now() }
      const newHistory = [entry, ...history].slice(0, 20)
      setHistory(newHistory)
      try { localStorage?.setItem('agnes-expert-history', JSON.stringify(newHistory)) } catch { /* ignore */ }
    } catch (e: any) {
      setError(e?.message || '生成失败')
    } finally { setLoading(false) }
  }, [selected, idea, params, model, loading, history])

  const handleCopy = useCallback((text: string) => {
    try { navigator.clipboard?.writeText(text) } catch { /* ignore */ }
  }, [])

  return createElement(StudioSplit, {
    title: '提示词专家',
    desc: '中文想法 → 中英对照提示词；生成后可直接送进生图 / 生视频。',
    params: [
      error !== '' ? createElement('div', {
        style: { padding: '6px', borderRadius: '8px', background: 'rgba(255,107,107,0.12)', color: '#ff8d8d', fontSize: '11.5px' },
      }, error) : null,

      // 专家类型
      createElement('div', { className: 'pe-types' },
        ...types.map((t: ExpertType) => createElement('button', {
          key: t.key,
          className: `pe-type${t.key === selected ? ' active' : ''}`,
          onClick: () => { setSelected(t.key); setParams({}); setResult(''); setError('') },
        },
          createElement('span', { className: 'pe-type-icon' }, t.icon),
          createElement('span', null, t.name),
        )),
      ),
      types.length === 0 ? createElement('div', { className: 'agnes-empty' }, '正在读取专家列表…') : null,

      currentType !== null && currentType !== undefined ? createElement('div', null,
        createElement('label', { className: 'agnes-field' }, '文本模型',
          createElement('select', {
            value: model,
            onChange: (e: Event) => setModel((e.target as HTMLSelectElement).value),
          },
            ...Object.entries(textModels).map(([id, name]) => createElement('option', { key: id, value: id }, name)),
          ),
        ),
        ...currentType.fields.map((f: any) =>
          createElement('label', { key: f.key, className: 'agnes-field' }, f.label,
            createElement('select', {
              value: params[f.key] || f.default,
              onChange: (e: Event) => setParams({ ...params, [f.key]: (e.target as HTMLSelectElement).value }),
            },
              ...f.options.map((o: string) => createElement('option', { key: o, value: o }, o)),
            ),
          ),
        ),
        createElement('label', { className: 'agnes-field' }, '你的想法',
          createElement('textarea', {
            value: idea,
            onChange: (e: Event) => setIdea((e.target as HTMLTextAreaElement).value),
            placeholder: currentType.placeholder,
            rows: 4,
          }),
        ),
        createElement('button', {
          className: 'agnes-btn agnes-btn-primary',
          disabled: loading || !idea.trim(),
          onClick: handleGenerate,
        }, loading ? '生成中…' : '生成提示词'),
        loading ? createElement('div', { style: { fontSize: '11px', color: 'rgba(180,194,220,0.7)', textAlign: 'center' } },
          `正在调用 ${textModels[model] || model}…通常 5–20 秒`) : null,
      ) : createElement('div', { className: 'agnes-empty' }, '先选一个专家类型'),
    ],
    children: [
      result !== '' ? createElement('div', { className: 'pe-result' },
        createElement('div', { className: 'pe-result-text' }, result),
        createElement('div', { className: 'pe-result-actions' },
          createElement('button', { className: 'agnes-btn agnes-btn-sm agnes-btn-secondary', onClick: () => handleCopy(result) }, '复制'),
          onUseForImage !== undefined ? createElement('button', {
            className: 'agnes-btn agnes-btn-sm agnes-btn-primary',
            title: '把这段提示词填到「生图」页并切过去',
            onClick: () => onUseForImage(result),
          }, '去生图') : null,
          onUseForVideo !== undefined ? createElement('button', {
            className: 'agnes-btn agnes-btn-sm agnes-btn-secondary',
            title: '把这段提示词填到「生视频」页并切过去',
            onClick: () => onUseForVideo(result),
          }, '去生视频') : null,
        ),
      ) : createElement('div', { className: 'agnes-empty' },
        '生成的提示词会显示在这里。历史上最多保留 20 条，点一下即可载回。'),

      // 生成历史：原先只写进 localStorage（20 条）却没有任何界面入口 ——
      // 存了、但用户永远看不到。这里补上，点击即载入那一条。
      history.length > 0 ? createElement('div', { className: 'pe-history' },
        createElement('div', { className: 'pe-history-title' }, `历史（${history.length}）`),
        ...history.map((h, i) =>
          createElement('div', {
            key: `${h.time}-${i}`,
            className: 'pe-history-item',
            title: '点击载入这一条',
            onClick: () => { setSelected(h.type); setIdea(h.idea); setResult(h.result); setError('') },
          },
            createElement('div', { className: 'pe-history-meta' },
              `${types.find((t: ExpertType) => t.key === h.type)?.name || h.type} · ${new Date(h.time).toLocaleString()}`),
            createElement('div', { className: 'pe-history-idea' }, h.idea),
          ),
        ),
      ) : null,
    ],
  })
}
