/**
 * 无限画布 —— 节点化创作编排。
 *
 * 能力：缩放（滚轮/按钮）、平移（拖空白/空格拖）、节点拖拽、连线、
 * 逐节点真实 AI 生成（文本续写 / 文生图 / 文生视频·图生视频），
 * 状态存 localStorage。
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
import { generateImage, generateVideo, pollVideoStatus } from './studio.ts'
import {
  createNode, createStarterDoc, loadCanvas, saveCanvas, clearCanvas, inputsOf,
  KIND_META, NODE_SIZE,
  type CanvasDoc, type CanvasNode, type NodeKind,
} from './canvas.ts'

const API_BASE = '/agnes-studio/api'

/** 文本模型续写（走宿主代理的 OpenAI 兼容端点）。 */
async function continueText(prompt: string, model: string): Promise<string> {
  const resp = await fetch(`${API_BASE}/proxy`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      endpoint: '/v1/chat/completions',
      params: {
        model,
        messages: [
          { role: 'system', content: '你是影视分镜与剧本助手。用简洁中文续写或扩写，只输出正文，不要解释。' },
          { role: 'user', content: prompt },
        ],
        max_tokens: 800,
      },
    }),
  })
  const data = await resp.json().catch(() => ({}))
  if (data?.error) throw new Error(data.error)
  const out = data?.choices?.[0]?.message?.content
  if (!out) throw new Error('文本模型未返回内容')
  return String(out)
}

interface Props {
  textModels: Record<string, string>
  imageModels: Record<string, string>
  videoModels: Record<string, string>
}

export function CanvasPanel({ textModels, imageModels, videoModels }: Props) {
  injectStyles()

  const [doc, setDoc] = useState<CanvasDoc>(() => loadCanvas() ?? createStarterDoc())
  const [selected, setSelected] = useState<string>('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [linkFrom, setLinkFrom] = useState<string>('')
  const [spaceDown, setSpaceDown] = useState(false)

  const wrapRef = useRef<any>(null)
  const dragRef = useRef<any>(null)

  const textModel = Object.keys(textModels)[0] || 'agnes-3.0-flash'
  const imageModel = Object.keys(imageModels)[0] || 'agnes-image-2.5-flash'
  const videoModel = Object.keys(videoModels)[0] || 'agnes-video-2.5-flash'

  // 自动保存（防抖 400ms）
  useEffect(() => {
    const t = setTimeout(() => saveCanvas(doc), 400)
    return () => clearTimeout(t)
  }, [doc])

  useEffect(() => {
    const down = (e: KeyboardEvent) => { if (e.code === 'Space') setSpaceDown(true) }
    const up = (e: KeyboardEvent) => { if (e.code === 'Space') setSpaceDown(false) }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
    }
  }, [])

  const patchNode = useCallback((id: string, patch: Partial<CanvasNode>) => {
    setDoc((d: CanvasDoc) => ({ ...d, nodes: d.nodes.map(n => n.id === id ? { ...n, ...patch } : n) }))
  }, [])

  // ── 平移 ────────────────────────────────────────────────────────────────
  const onBackgroundDown = useCallback((e: any) => {
    // 只响应空白处 / 空格拖拽，避免和节点拖拽打架
    if (e.target !== e.currentTarget && !spaceDown) return
    if (e.button !== 0) return
    dragRef.current = { kind: 'pan', sx: e.clientX, sy: e.clientY, ox: doc.viewport.x, oy: doc.viewport.y }
    const move = (ev: MouseEvent) => {
      const d = dragRef.current
      if (!d) return
      setDoc((cur: CanvasDoc) => ({
        ...cur,
        viewport: { ...cur.viewport, x: d.ox + (ev.clientX - d.sx), y: d.oy + (ev.clientY - d.sy) },
      }))
    }
    const up = () => { dragRef.current = null; window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up) }
    window.addEventListener('mousemove', move)
    window.addEventListener('mouseup', up)
  }, [doc.viewport, spaceDown])

  // ── 缩放 ────────────────────────────────────────────────────────────────
  const onWheel = useCallback((e: any) => {
    const rect = wrapRef.current?.getBoundingClientRect?.()
    if (!rect) return
    const factor = e.deltaY < 0 ? 1.1 : 1 / 1.1
    setDoc((cur: CanvasDoc) => {
      const scale = Math.min(2.5, Math.max(0.3, cur.viewport.scale * factor))
      const k = scale / cur.viewport.scale
      // 以光标为锚点缩放，缩放时画面不跑偏
      const cx = e.clientX - rect.left
      const cy = e.clientY - rect.top
      return {
        ...cur,
        viewport: {
          scale,
          x: cx - k * (cx - cur.viewport.x),
          y: cy - k * (cy - cur.viewport.y),
        },
      }
    })
  }, [])

  const zoomBy = useCallback((factor: number) => {
    setDoc((cur: CanvasDoc) => ({ ...cur, viewport: { ...cur.viewport, scale: Math.min(2.5, Math.max(0.3, cur.viewport.scale * factor)) } }))
  }, [])

  const resetView = useCallback(() => {
    setDoc((cur: CanvasDoc) => ({ ...cur, viewport: { x: 0, y: 0, scale: 1 } }))
  }, [])

  // ── 节点拖拽 ────────────────────────────────────────────────────────────
  const onNodeDown = useCallback((e: any, node: CanvasNode) => {
    if (e.button !== 0) return
    const tag = String(e.target?.tagName ?? '').toLowerCase()
    if (tag === 'textarea' || tag === 'input' || tag === 'button' || tag === 'select' || tag === 'a') return
    if (e.target?.dataset?.port !== undefined) return   // 端口自己处理
    e.stopPropagation()
    setSelected(node.id)
    const scale = doc.viewport.scale
    dragRef.current = { kind: 'node', id: node.id, sx: e.clientX, sy: e.clientY, ox: node.x, oy: node.y, scale }
    const move = (ev: MouseEvent) => {
      const d = dragRef.current
      if (!d || d.kind !== 'node') return
      const nx = d.ox + (ev.clientX - d.sx) / d.scale
      const ny = d.oy + (ev.clientY - d.sy) / d.scale
      setDoc((cur: CanvasDoc) => ({ ...cur, nodes: cur.nodes.map(n => n.id === d.id ? { ...n, x: Math.round(nx), y: Math.round(ny) } : n) }))
    }
    const up = () => { dragRef.current = null; window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up) }
    window.addEventListener('mousemove', move)
    window.addEventListener('mouseup', up)
  }, [doc.viewport.scale])

  // ── 连线 ────────────────────────────────────────────────────────────────
  const startLink = useCallback((e: any, node: CanvasNode) => {
    e.stopPropagation()
    setLinkFrom(node.id)
  }, [])

  const finishLink = useCallback((e: any, target: CanvasNode) => {
    e.stopPropagation()
    if (!linkFrom || linkFrom === target.id) { setLinkFrom(''); return }
    setDoc((cur: CanvasDoc) => {
      if (cur.edges.some(x => x.from === linkFrom && x.to === target.id)) return cur
      return {
        ...cur,
        edges: [...cur.edges, {
          id: 'e' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
          from: linkFrom, to: target.id,
        }],
      }
    })
    setLinkFrom('')
  }, [linkFrom])

  const removeEdge = useCallback((id: string) => {
    setDoc((cur: CanvasDoc) => ({ ...cur, edges: cur.edges.filter(e => e.id !== id) }))
  }, [])

  // ── 节点操作 ────────────────────────────────────────────────────────────
  const addNode = useCallback((kind: NodeKind) => {
    setDoc((cur: CanvasDoc) => {
      const n = createNode(kind, 80 + cur.nodes.length * 26, 120 + cur.nodes.length * 22)
      return { ...cur, nodes: [...cur.nodes, n] }
    })
  }, [])

  const removeNode = useCallback((id: string) => {
    setDoc((cur: CanvasDoc) => ({
      ...cur,
      nodes: cur.nodes.filter(n => n.id !== id),
      edges: cur.edges.filter(e => e.from !== id && e.to !== id),
    }))
    setSelected('')
  }, [])

  // ── 真实生成 ────────────────────────────────────────────────────────────
  const generate = useCallback(async (node: CanvasNode) => {
    if (busy) return
    const prompt = (node.text || '').trim()
    if (!prompt) { setError('请先填写提示词'); return }
    setBusy(true); setError('')
    patchNode(node.id, { status: 'running', error: undefined })

    try {
      if (node.kind === 'text') {
        const out = await continueText(prompt, textModel)
        patchNode(node.id, { status: 'done', url: undefined, prompt, text: prompt + '\n\n' + out })
      } else if (node.kind === 'image') {
        // 把上游图片节点当作参考图（图生图）
        const refs = inputsOf(doc, node.id).filter(n => n.kind === 'image' && n.url).map(n => n.url!)
        const r = await generateImage({ prompt, model: imageModel, images: refs.length ? refs : undefined })
        patchNode(node.id, { status: 'done', url: r.url, prompt })
      } else {
        const refs = inputsOf(doc, node.id).filter(n => n.kind === 'image' && n.url).map(n => n.url!)
        const req: any = {
          prompt,
          model: videoModel,
          mode: refs.length ? 'reference' : 'text',
          seconds: '5',
          size: '720P',
        }
        if (refs.length) req.images = refs
        const { videoId, taskId } = await generateVideo(req)
        const key = videoId || taskId
        if (!key) throw new Error('视频接口未返回任务 ID')
        // 轮询到完成（最长 15 分钟）
        const deadline = Date.now() + 15 * 60_000
        let url = ''
        while (Date.now() < deadline) {
          await new Promise(r => setTimeout(r, 8000))
          const st = await pollVideoStatus(key)
          if (st.status === 'completed' && st.url) { url = st.url; break }
          if (st.status === 'failed') throw new Error(st.error || '视频生成失败')
        }
        if (!url) throw new Error('视频生成超时')
        patchNode(node.id, { status: 'done', url, prompt })
      }
    } catch (e: any) {
      patchNode(node.id, { status: 'error', error: e?.message || '生成失败' })
      setError(e?.message || '生成失败')
    } finally {
      setBusy(false)
    }
  }, [busy, doc, textModel, imageModel, videoModel, patchNode])

  const resetDoc = useCallback(() => {
    clearCanvas()
    setDoc(createStarterDoc())
    setSelected('')
  }, [])

  // ── 渲染 ────────────────────────────────────────────────────────────────
  const { nodes, edges, viewport } = doc
  const sel = nodes.find(n => n.id === selected)

  const renderNode = (node: CanvasNode) => {
    const size = NODE_SIZE[node.kind]
    const meta = KIND_META[node.kind]
    const active = selected === node.id
    return createElement('div', {
      key: node.id,
      className: `agc-node agc-node-${node.kind}${active ? ' active' : ''}`,
      style: {
        left: node.x, top: node.y, width: size.w, minHeight: size.h,
        ...(linkFrom && linkFrom !== node.id ? { boxShadow: '0 0 0 2px var(--ag-accent-2)' } : {}),
      },
      onMouseDown: (e: any) => onNodeDown(e, node),
      onClick: () => setSelected(node.id),
    },
      // 头部：图标 + 标题 + 操作
      createElement('div', { className: 'agc-node-head' },
        createElement('span', { className: 'agc-node-icon' }, meta.icon),
        createElement('input', {
          className: 'agc-node-title',
          value: node.title,
          onChange: (e: any) => patchNode(node.id, { title: e.target.value }),
          placeholder: meta.name,
        }),
        createElement('button', {
          className: 'agc-node-x', title: '删除节点',
          onClick: (e: any) => { e.stopPropagation(); removeNode(node.id) },
        }, '✕'),
      ),

      // 主体
      createElement('div', { className: 'agc-node-body' },
        node.kind === 'text'
          ? createElement('textarea', {
              className: 'agc-node-text',
              value: node.text,
              placeholder: meta.hint,
              onChange: (e: any) => patchNode(node.id, { text: e.target.value }),
              onMouseDown: (e: any) => e.stopPropagation(),
            })
          : createElement('div', { className: 'agc-node-media' },
              node.url
                ? (node.kind === 'image'
                    ? createElement('img', { src: node.url, alt: node.title, className: 'agc-media' })
                    : createElement('video', { src: node.url, controls: true, className: 'agc-media' }))
                : createElement('div', { className: 'agc-node-empty' },
                    node.status === 'running'
                      ? createElement('span', null, '⏳ 生成中…')
                      : createElement('span', null, meta.hint)),
              node.kind !== 'text'
                ? createElement('textarea', {
                    className: 'agc-node-prompt',
                    value: node.text,
                    placeholder: '提示词…',
                    onChange: (e: any) => patchNode(node.id, { text: e.target.value }),
                    onMouseDown: (e: any) => e.stopPropagation(),
                  })
                : null,
            ),
        node.status === 'error' && node.error
          ? createElement('div', { className: 'agc-node-err' }, node.error.slice(0, 120))
          : null,
      ),

      // 底部：生成按钮
      createElement('div', { className: 'agc-node-foot' },
        createElement('button', {
          className: 'agnes-btn agnes-btn-primary agnes-btn-sm',
          disabled: busy || node.status === 'running',
          onClick: (e: any) => { e.stopPropagation(); generate(node) },
        }, node.status === 'running' ? '生成中…' : (node.kind === 'text' ? '✨ AI 续写' : (node.kind === 'image' ? '✨ 生成图' : '🎬 生成视频'))),
      ),

      // 输入端口（左）
      createElement('div', {
        className: 'agc-port agc-port-in', title: '输入：连线过来的图片会作为参考',
        'data-port': 'in',
        onMouseUp: (e: any) => finishLink(e, node),
      }),
      // 输出端口（右）
      createElement('div', {
        className: 'agc-port agc-port-out', title: '输出：拖到别的节点输入口连线',
        'data-port': 'out',
        onMouseDown: (e: any) => startLink(e, node),
      }),
    )
  }

  // 连线（SVG，跟随视口变换）
  const renderEdges = () => {
    const w = NODE_SIZE
    const paths = edges.map(edge => {
      const a = nodes.find(n => n.id === edge.from)
      const b = nodes.find(n => n.id === edge.to)
      if (!a || !b) return null
      const x1 = a.x + w[a.kind].w
      const y1 = a.y + 42
      const x2 = b.x
      const y2 = b.y + 42
      const dx = Math.max(40, Math.abs(x2 - x1) * 0.5)
      const d = `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`
      return createElement('path', {
        key: edge.id, d, className: 'agc-edge',
        onClick: () => removeEdge(edge.id),
      })
    })
    return createElement('svg', { className: 'agc-edges' }, ...paths.filter(Boolean))
  }

  return createElement('div', { className: 'agnes-canvas' },
    // 工具栏
    createElement('div', { className: 'agc-toolbar' },
      createElement('div', { className: 'agc-tools-left' },
        createElement('button', { className: 'agnes-btn agnes-btn-secondary agnes-btn-sm', onClick: () => addNode('text') }, '＋ 文本'),
        createElement('button', { className: 'agnes-btn agnes-btn-secondary agnes-btn-sm', onClick: () => addNode('image') }, '＋ 图片'),
        createElement('button', { className: 'agnes-btn agnes-btn-secondary agnes-btn-sm', onClick: () => addNode('video') }, '＋ 视频'),
        createElement('span', { className: 'agc-sep' }),
        createElement('button', { className: 'agnes-btn agnes-btn-ghost agnes-btn-sm', onClick: () => zoomBy(1 / 1.15) }, '－'),
        createElement('span', { className: 'agc-zoom' }, `${Math.round(viewport.scale * 100)}%`),
        createElement('button', { className: 'agnes-btn agnes-btn-ghost agnes-btn-sm', onClick: () => zoomBy(1.15) }, '＋'),
        createElement('button', { className: 'agnes-btn agnes-btn-ghost agnes-btn-sm', onClick: resetView }, '重置视图'),
        createElement('span', { className: 'agc-sep' }),
        createElement('button', { className: 'agnes-btn agnes-btn-ghost agnes-btn-sm', onClick: resetDoc }, '清空画布'),
      ),
      createElement('div', { className: 'agc-tips' },
        linkFrom
          ? '连线中：点目标节点的左侧圆点完成连接'
          : '拖空白平移 · 滚轮缩放 · 右圆点拖到左圆点连线 · 点连线删除'),
    ),

    error ? createElement('div', { className: 'agnes-error', style: { margin: '0 14px' } }, error) : null,

    // 画布
    createElement('div', {
      className: `agc-viewport${spaceDown ? ' grabbing' : ''}`,
      ref: wrapRef,
      onMouseDown: onBackgroundDown,
      onWheel,
      onClick: (e: any) => { if (e.target === e.currentTarget) setSelected('') },
    },
      createElement('div', {
        className: 'agc-world',
        style: {
          transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.scale})`,
          transformOrigin: '0 0',
        },
      },
        renderEdges(),
        ...nodes.map(renderNode),
      ),
    ),

    // 状态栏
    createElement('div', { className: 'agc-status' },
      `${nodes.length} 个节点 · ${edges.length} 条连线`,
      sel ? ` · 选中：${KIND_META[sel.kind].icon} ${sel.title || KIND_META[sel.kind].name}` : '',
      ' · 已自动保存',
    ),
  )
}
