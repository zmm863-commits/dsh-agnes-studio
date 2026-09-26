/**
 * 小说封面设计 —— 上传 TXT/DOCX 自动提取书名/作者/简介，生成 3:4 标准封面。
 */
declare const require: ((id: string) => unknown) | undefined
function shellRequire(id: string): any { try { return typeof require === 'function' ? require(id) : undefined } catch { return undefined } }
const React: any = shellRequire('react') ?? (globalThis as any).React ?? null
const NOOP = (): void => {}
const useState: any = React?.useState ?? ((i: unknown) => [i, NOOP])
const useEffect: any = React?.useEffect ?? NOOP
const useCallback: any = React?.useCallback ?? ((f: unknown) => f)
const createElement: any = React?.createElement ?? (() => null)

import { injectStyles } from './styles.ts'
import { generateImage } from './studio.ts'

const API_BASE = '/agnes-studio/api'

interface CoverResult { url: string; prompt: string; style: string; at: number }

/**
 * Fallback style list. The host route is the source of truth, but carrying a
 * local copy means the panel still renders a complete UI when the host half is
 * an older build (routes appear only after a DSH restart).
 */
const FALLBACK_STYLES = [
  { key: 'guofeng', name: '国风水墨' },
  { key: 'dushi', name: '都市写实' },
  { key: 'xianxia', name: '仙侠玄幻' },
  { key: 'xuanyi', name: '悬疑暗调' },
  { key: 'yanqing', name: '言情清新' },
  { key: 'kehuan', name: '科幻未来' },
]

async function fetchStyles(): Promise<Array<{ key: string; name: string }>> {
  try {
    const r = await fetch(`${API_BASE}/cover/styles`)
    const d = await r.json().catch(() => ({}))
    if (Array.isArray(d?.styles) && d.styles.length > 0) return d.styles
  } catch { /* host route not available yet */ }
  return FALLBACK_STYLES
}

/** 把 File 读成 base64（去掉 data URL 前缀）。 */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const fr = new FileReader()
    fr.onload = () => {
      const s = String(fr.result)
      const i = s.indexOf(',')
      resolve(i >= 0 ? s.slice(i + 1) : s)
    }
    fr.onerror = () => reject(new Error('读取文件失败'))
    fr.readAsDataURL(file)
  })
}

export function CoverPanel({ imageModels }: { imageModels: Record<string, string> }) {
  injectStyles()
  const [styles, setStyles] = useState<Array<{ key: string; name: string }>>(FALLBACK_STYLES)
  const [styleKey, setStyleKey] = useState('guofeng')
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [summary, setSummary] = useState('')
  const [extra, setExtra] = useState('')
  const [refImage, setRefImage] = useState('')
  const [model, setModel] = useState(() => Object.keys(imageModels)[0] || 'agnes-image-2.5-flash')
  const [loading, setLoading] = useState(false)
  const [parsing, setParsing] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [covers, setCovers] = useState<CoverResult[]>([])

  useEffect(() => {
    fetchStyles().then(s => { if (s.length) setStyles(s) }).catch(() => {})
    try {
      const raw = localStorage?.getItem('agnes-covers')
      if (raw) setCovers(JSON.parse(raw))
    } catch { /* ignore */ }
  }, [])

  const persist = useCallback((list: CoverResult[]) => {
    setCovers(list)
    try { localStorage?.setItem('agnes-covers', JSON.stringify(list.slice(0, 12))) } catch { /* ignore */ }
  }, [])

  const handleUpload = useCallback(async (file: File | undefined) => {
    if (!file) return
    setParsing(true); setError(''); setNotice('')
    try {
      const b64 = await fileToBase64(file)
      const r = await fetch(`${API_BASE}/cover/parse`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: file.name, content: b64 }),
      })
      const d = await r.json().catch(() => ({}))
      if (!r.ok || d?.error) throw new Error(d?.error || `解析失败（HTTP ${r.status}）`)
      setTitle(d.meta.title || '')
      setAuthor(d.meta.author || '')
      setSummary(d.meta.summary || '')
      setNotice(`已解析 ${file.name}（${d.meta.charCount} 字）`)
    } catch (e: any) {
      setError(e?.message || '解析失败')
    } finally { setParsing(false) }
  }, [])

  const handleGenerate = useCallback(async () => {
    if (!title.trim()) { setError('请先填写或上传解析出书名'); return }
    setLoading(true); setError(''); setNotice('')
    try {
      const payload = {
        title: title.trim(),
        author: author.trim(),
        summary: summary.trim(),
        style: styleKey,
        extra: extra.trim(),
        model,
      }
      const r = await fetch(`${API_BASE}/cover/build`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const d = await r.json().catch(() => ({}))
      if (!r.ok || d?.error) throw new Error(d?.error || `构建提示词失败（HTTP ${r.status}）`)

      const gen = await generateImage({
        prompt: d.prompt,
        model,
        ratio: '3:4',
        size: '1024x1024',
        images: refImage ? [refImage] : undefined,
      })
      const entry: CoverResult = { url: gen.url, prompt: d.prompt, style: styleKey, at: Date.now() }
      persist([entry, ...covers].slice(0, 12))
      setNotice('封面已生成')
    } catch (e: any) {
      setError(e?.message || '生成失败')
    } finally { setLoading(false) }
  }, [title, author, summary, styleKey, extra, model, refImage, covers, persist])

  const inputStyle = {
    width: '100%', boxSizing: 'border-box' as const, padding: '8px 10px', borderRadius: '8px',
    border: '1px solid var(--ag-line, rgba(255,255,255,0.12))',
    background: 'var(--ag-surface-1, #1d1d33)',
    color: 'var(--ag-text, #ececf5)', fontSize: '13px', fontFamily: 'inherit',
  }

  return createElement('div', { className: 'agnes-cover' },
    createElement('div', { className: 'agnes-cover-grid' },
      // 左：表单
      createElement('div', { className: 'agcv-form' },
        createElement('div', { className: 'agcv-card' },
          createElement('div', { className: 'agcv-card-title' }, '📄 导入小说（可选）'),
          createElement('label', { className: 'agnes-btn agnes-btn-ghost agnes-btn-full' },
            parsing ? '解析中…' : '选择 TXT / DOCX 文件',
            createElement('input', {
              type: 'file', accept: '.txt,.docx,text/plain',
              style: { display: 'none' },
              onChange: (e: any) => handleUpload(e.target.files?.[0]),
            }),
          ),
          createElement('div', { className: 'agcv-hint' }, '自动提取书名、作者、简介；.docx 无需另存为 txt'),
        ),

        createElement('div', { className: 'agcv-card' },
          createElement('div', { className: 'agcv-card-title' }, '📝 作品信息'),
          createElement('div', { className: 'agcv-field' },
            createElement('label', null, '书名'),
            createElement('input', { style: inputStyle, value: title, onChange: (e: any) => setTitle(e.target.value), placeholder: '例如：重生之都市医仙' }),
          ),
          createElement('div', { className: 'agcv-field' },
            createElement('label', null, '作者'),
            createElement('input', { style: inputStyle, value: author, onChange: (e: any) => setAuthor(e.target.value), placeholder: '例如：云中客' }),
          ),
          createElement('div', { className: 'agcv-field' },
            createElement('label', null, '作品简介'),
            createElement('textarea', {
              style: { ...inputStyle, minHeight: '72px', resize: 'vertical' as const },
              value: summary, onChange: (e: any) => setSummary(e.target.value),
              placeholder: '剧情梗概，影响封面画面',
            }),
          ),
        ),

        createElement('div', { className: 'agcv-card' },
          createElement('div', { className: 'agcv-card-title' }, '🎨 风格与模型'),
          createElement('div', { className: 'agcv-styles' },
            ...styles.map(s => createElement('button', {
              key: s.key,
              className: `agcv-style${styleKey === s.key ? ' active' : ''}`,
              onClick: () => setStyleKey(s.key),
            }, s.name)),
          ),
          createElement('div', { className: 'agcv-field' },
            createElement('label', null, '补充描述（可选）'),
            createElement('input', { style: inputStyle, value: extra, onChange: (e: any) => setExtra(e.target.value), placeholder: '例如：主色调偏暗红，逆光剪影' }),
          ),
          createElement('div', { className: 'agcv-field' },
            createElement('label', null, '图像模型'),
            createElement('select', { style: inputStyle, value: model, onChange: (e: any) => setModel(e.target.value) },
              ...Object.keys(imageModels).map(k => createElement('option', { key: k, value: k }, k)),
            ),
          ),
          createElement('div', { className: 'agcv-field' },
            createElement('label', null, '参考图（可选，图生图）'),
            createElement('label', { className: 'agnes-btn agnes-btn-ghost agnes-btn-sm' },
              refImage ? '✅ 已选参考图' : '选择参考图',
              createElement('input', {
                type: 'file', accept: 'image/*', style: { display: 'none' },
                onChange: async (e: any) => {
                  const f = e.target.files?.[0]
                  if (!f) return
                  const b64 = await fileToBase64(f)
                  setRefImage(`data:${f.type || 'image/png'};base64,${b64}`)
                },
              }),
            ),
          ),
        ),

        error ? createElement('div', { className: 'agnes-error' }, error) : null,
        notice ? createElement('div', { className: 'agcv-notice' }, notice) : null,

        createElement('button', {
          className: 'agnes-btn agnes-btn-primary agnes-btn-full',
          disabled: loading,
          onClick: handleGenerate,
          style: { height: '40px' },
        }, loading ? '⏳ 生成中…' : '🎨 生成封面（3:4）'),
      ),

      // 右：预览与历史
      createElement('div', { className: 'agcv-preview' },
        covers[0]
          ? createElement('div', { className: 'agcv-main' },
              createElement('img', { src: covers[0].url, alt: '封面', className: 'agcv-cover-img' }),
              createElement('a', {
                className: 'agnes-btn agnes-btn-secondary agnes-btn-sm',
                href: covers[0].url, target: '_blank', rel: 'noreferrer', download: `${title || '封面'}.png`,
                style: { textDecoration: 'none', marginTop: '12px' },
              }, '⬇️ 下载封面'),
            )
          : createElement('div', { className: 'agcv-empty' },
              // 3:4 虚线海报框，明确告诉用户"封面会出现在这里"
              createElement('div', { className: 'agcv-poster-slot' },
                createElement('div', { className: 'agnes-empty-icon' }, '📕'),
                createElement('div', { className: 'agcv-poster-title' }, '封面预览位'),
                createElement('div', { className: 'agcv-hint' }, '3 : 4 标准比例'),
              ),
              createElement('div', { className: 'agcv-slot-row' },
                ...[1, 2, 3].map(i => createElement('div', { key: i, className: 'agcv-slot-mini' },
                  createElement('span', null, String(i))
                )),
              ),
              createElement('div', { className: 'agcv-empty-title', style: { marginTop: '14px' } }, '还没有封面'),
              createElement('div', { className: 'agcv-hint' }, '上传小说或直接填写书名，点下方按钮生成'),
            ),
        covers.length > 1
          ? createElement('div', { style: { width: '100%', marginTop: '14px' } },
              createElement('div', { className: 'agcv-card-title', style: { fontSize: '12px' } }, '历史封面'),
              createElement('div', { className: 'agcv-history' },
                ...covers.slice(1).map((c, i) => createElement('img', {
                  key: c.at + '-' + i, src: c.url, alt: '历史封面', className: 'agcv-thumb',
                  onClick: () => persist([c, ...covers.filter(x => x.at !== c.at)]),
                })),
              ),
            )
          : null,
      ),
    ),
  )
}
