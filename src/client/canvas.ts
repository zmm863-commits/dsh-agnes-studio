// ─── 无限画布 — 客户端模型与持久化 ─────────────────────────────────────────
// 节点编排：文本 / 图片 / 视频；支持缩放、拖拽、连线、逐节点 AI 生成。
// 状态保存在 localStorage，生成能力复用现有的 Host 代理。
// ─────────────────────────────────────────────────────────────────────────────

export type NodeKind = 'text' | 'image' | 'video'

export interface CanvasNode {
  id: string
  kind: NodeKind
  x: number
  y: number
  title: string
  /** 文本节点正文 / 图片视频节点的提示词 */
  text: string
  /** 生成结果 URL */
  url?: string
  prompt?: string
  status: 'idle' | 'running' | 'done' | 'error'
  error?: string
  createdAt: number
}

export interface CanvasEdge {
  id: string
  from: string       // 源节点（其产物作为参考输入）
  to: string         // 目标节点
}

export interface CanvasDoc {
  version: 1
  nodes: CanvasNode[]
  edges: CanvasEdge[]
  viewport: { x: number; y: number; scale: number }
  updatedAt: number
}

const STORAGE_KEY = 'agnes-canvas-v1'

export const NODE_SIZE: Record<NodeKind, { w: number; h: number }> = {
  text: { w: 260, h: 190 },
  image: { w: 260, h: 250 },
  video: { w: 280, h: 265 },
}

export const KIND_META: Record<NodeKind, { icon: string; name: string; hint: string }> = {
  text: { icon: '📝', name: '文本', hint: '剧本 / 分镜 / 灵感，可让 AI 续写' },
  image: { icon: '🖼', name: '图片', hint: '文生图，可接图片作参考' },
  video: { icon: '🎬', name: '视频', hint: '文生视频 / 图生视频' },
}

export function createNode(kind: NodeKind, x: number, y: number): CanvasNode {
  return {
    id: 'n' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    kind,
    x: Math.round(x),
    y: Math.round(y),
    title: KIND_META[kind].name,
    text: '',
    status: 'idle',
    createdAt: Date.now(),
  }
}

/** A small starter graph so the canvas is not an empty void on first open. */
export function createStarterDoc(): CanvasDoc {
  const n1 = createNode('text', 60, 80)
  n1.title = '剧本'
  n1.text = '雨夜，林越站在医院天台，手里攥着那枚古玉。楼下传来救护车的鸣笛。'
  const n2 = createNode('image', 380, 60)
  n2.title = '分镜 1'
  n2.text = '雨夜医院天台，男子手持青色古玉，电影感，冷色调，远景'
  const n3 = createNode('video', 700, 80)
  n3.title = '镜头 1'
  n3.text = '男子缓缓展开手掌，古玉微微发光，雨点打在肩头，镜头缓慢推近'
  return {
    version: 1,
    nodes: [n1, n2, n3],
    edges: [{ id: 'e1', from: n2.id, to: n3.id }],
    viewport: { x: 0, y: 0, scale: 1 },
    updatedAt: Date.now(),
  }
}

export function loadCanvas(): CanvasDoc | null {
  try {
    const raw = localStorage?.getItem(STORAGE_KEY)
    if (!raw) return null
    const doc = JSON.parse(raw) as CanvasDoc
    if (doc?.version !== 1 || !Array.isArray(doc.nodes)) return null
    return doc
  } catch { return null }
}

export function saveCanvas(doc: CanvasDoc): void {
  try {
    localStorage?.setItem(STORAGE_KEY, JSON.stringify({ ...doc, updatedAt: Date.now() }))
  } catch { /* 配额满或不可用：忽略，画布不阻塞 */ }
}

export function clearCanvas(): void {
  try { localStorage?.removeItem(STORAGE_KEY) } catch { /* ignore */ }
}

/** Upstream nodes feeding `id` (their media can be used as reference). */
export function inputsOf(doc: CanvasDoc, id: string): CanvasNode[] {
  return doc.edges.filter(e => e.to === id)
    .map(e => doc.nodes.find(n => n.id === e.from))
    .filter((n): n is CanvasNode => n !== undefined)
}
