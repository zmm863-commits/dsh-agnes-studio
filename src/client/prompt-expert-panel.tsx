/**
 * 提示词专家面板 — 7 类专家，中文想法 → 中英对照提示词
 */

import { useState, useEffect, useCallback, createElement } from './react-shim.ts'

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

  const rootStyle: any = { padding: '16px', overflowY: 'auto', height: '100%' }

  return createElement('div', { style: rootStyle },
    createElement('div', { style: { fontSize: '16px', fontWeight: 700, marginBottom: '16px' } }, '✨ 提示词专家'),

    // Expert grid
    types.length > 0 ? createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '8px', marginBottom: '16px' } },
      ...types.map((t: ExpertType) =>
        createElement('div', {
          key: t.key,
          style: {
            padding: '10px', borderRadius: '8px', cursor: 'pointer',
            border: t.key === selected ? '1px solid #6c5ce7' : '1px solid rgba(255,255,255,0.06)',
            background: t.key === selected ? 'rgba(108,92,231,0.15)' : 'var(--ag-surface-2, rgba(255,255,255,0.55))',
          },
          onClick: () => { setSelected(t.key); setParams({}); setResult(''); setError('') },
        },
          createElement('div', { style: { fontSize: '20px', marginBottom: '4px' } }, t.icon),
          createElement('div', { style: { fontSize: '12px', fontWeight: 600 } }, t.name),
        )
      )
    ) : null,

    // Form
    currentType ? createElement('div', null,
      createElement('div', { style: { marginBottom: '8px' } },
        createElement('label', { style: { fontSize: '12px', color: 'var(--ag-text-2, #2a3c5e)', display: 'block', marginBottom: '4px' } }, '文本模型'),
        createElement('select', {
          style: { width: '100%', height: '32px', padding: '0 8px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)', background: '#252538', color: 'var(--ag-text, #0c1a33)', fontSize: '12px' },
          value: model,
          onChange: (e: Event) => setModel((e.target as HTMLSelectElement).value),
        },
          ...Object.entries(textModels).map(([id, name]) => createElement('option', { key: id, value: id }, name))
        ),
      ),
      ...currentType.fields.map((f: any) =>
        createElement('div', { key: f.key, style: { marginBottom: '8px' } },
          createElement('label', { style: { fontSize: '12px', color: 'var(--ag-text-2, #2a3c5e)', display: 'block', marginBottom: '4px' } }, f.label),
          createElement('select', {
            style: { width: '100%', height: '32px', padding: '0 8px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)', background: '#252538', color: 'var(--ag-text, #0c1a33)', fontSize: '12px' },
            value: params[f.key] || f.default,
            onChange: (e: Event) => setParams({ ...params, [f.key]: (e.target as HTMLSelectElement).value }),
          },
            ...f.options.map((o: string) => createElement('option', { key: o, value: o }, o))
          ),
        )
      ),
      createElement('div', { style: { marginBottom: '8px' } },
        createElement('label', { style: { fontSize: '12px', color: 'var(--ag-text-2, #2a3c5e)', display: 'block', marginBottom: '4px' } }, '你的想法'),
        createElement('textarea', {
          style: { width: '100%', minHeight: '60px', padding: '8px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)', background: '#252538', color: 'var(--ag-text, #0c1a33)', fontSize: '12px', fontFamily: 'inherit', boxSizing: 'border-box' },
          value: idea,
          onChange: (e: Event) => setIdea((e.target as HTMLTextAreaElement).value),
          placeholder: currentType.placeholder,
          rows: 3,
        }),
      ),
      createElement('button', {
        className: 'agnes-btn agnes-btn-primary',
        style: { width: '100%' },
        disabled: loading || !idea.trim(),
        onClick: handleGenerate,
      }, loading ? '⏳ 生成中...' : '✨ 生成提示词'),
      loading ? createElement('div', {
        style: { marginTop: '8px', fontSize: '11px', color: 'var(--ag-text-3, #6e80a3)', textAlign: 'center' },
      }, `正在调用 ${textModels[model] || model}…通常 5–20 秒`) : null,
      error ? createElement('div', { style: { marginTop: '8px', padding: '6px', borderRadius: '6px', background: 'rgba(255,107,107,0.12)', color: '#ff6b6b', fontSize: '11px' } }, error) : null,
      result ? createElement('div', {
        style: { marginTop: '12px', padding: '12px', borderRadius: '8px', background: '#252538', border: '1px solid rgba(255,255,255,0.06)', whiteSpace: 'pre-wrap', fontSize: '12px', lineHeight: 1.6, maxHeight: '300px', overflowY: 'auto' },
      },
        result,
        createElement('button', { className: 'agnes-btn agnes-btn-sm agnes-btn-secondary', style: { marginTop: '8px' }, onClick: () => handleCopy(result) }, '📋 复制'),
        // 打通到生图页：原先这里只有「复制」，用户得自己切页签再粘一遍。
        // 只在拿到英文提示词时更实用，但中文也能直接用，所以不做内容判断。
        onUseForImage ? createElement('button', {
          className: 'agnes-btn agnes-btn-sm agnes-btn-primary',
          style: { marginTop: '8px', marginLeft: '6px' },
          title: '把这段提示词填到「生图」页并切过去',
          onClick: () => onUseForImage(result),
        }, '🎨 去生图') : null,
        onUseForVideo ? createElement('button', {
          className: 'agnes-btn agnes-btn-sm agnes-btn-secondary',
          style: { marginTop: '8px', marginLeft: '6px' },
          title: '把这段提示词填到「生视频」页并切过去',
          onClick: () => onUseForVideo(result),
        }, '🎬 去生视频') : null,
      ) : null,

      // 生成历史：原先只写进 localStorage（20 条）却没有任何界面入口 ——
      // 存了、但用户永远看不到。这里补上，点击即载入那一条。
      history.length > 0 ? createElement('div', { style: { marginTop: '16px' } },
        createElement('div', {
          style: { fontSize: '12px', fontWeight: 600, color: 'var(--ag-text-2, #2a3c5e)', marginBottom: '6px' },
        }, `🕘 历史（${history.length}）`),
        ...history.map((h, i) =>
          createElement('div', {
            key: `${h.time}-${i}`,
            title: '点击载入这一条',
            style: {
              padding: '8px', marginBottom: '6px', borderRadius: '6px', cursor: 'pointer',
              background: 'var(--ag-surface-2, rgba(255,255,255,0.55))',
              border: '1px solid rgba(255,255,255,0.06)',
            },
            onClick: () => { setSelected(h.type); setIdea(h.idea); setResult(h.result); setError('') },
          },
            createElement('div', { style: { fontSize: '11px', color: 'var(--ag-text-3, #6e80a3)' } },
              `${types.find((t: ExpertType) => t.key === h.type)?.name || h.type} · ${new Date(h.time).toLocaleString()}`),
            createElement('div', {
              style: { fontSize: '11px', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
            }, h.idea),
          ),
        ),
      ) : null,
    ) : createElement('div', { style: { padding: '40px', textAlign: 'center', color: 'var(--ag-text-3, #6e80a3)' } }, '👆 选择一个专家开始'),
  )
}
