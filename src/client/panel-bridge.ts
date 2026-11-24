/**
 * 面板 → 会话 的发送通道（进程内小 store）。
 *
 * 背景（重要，别再把这块改回子槽）：
 * 面板挂在 `shell.overlay`，而 `shell.overlay` 是 **root 作用域**的槽。
 * 旧实现让面板去 renderSlot 一个 `scope: 'session'` 的子槽，好拿到
 * `inject(sessionId)`；但 DSH 的槽运行时对"root 父槽下渲染 session 子槽"
 * 是硬报错：
 *   SlotAssemblyError: strict session slot 'agnes.workspace' rendered without a scope binding
 * 结果就是面板一点开就整片空白（不是样式问题，是渲染直接抛错）。
 *
 * 现在的做法：
 *   - 面板本体直接由座位组件渲染，不再经过子槽；
 *   - 另外挂一个**无渲染**的占用者到 `conversation.session.header.actions`
 *     （那是会话作用域的 list 槽），由它的 inject(sessionId) 把"往当前会话
 *     发一条消息"的能力发布到这里。
 *
 * 面板是全局浮层，可能在没有任何会话时打开 —— 此时 sender 为空，
 * 相关按钮就是禁用态，这是预期行为，不是 bug。
 */

/** 往某个会话发一段文本。 */
export type PanelSender = (text: string) => void

let current: PanelSender | undefined
const listeners = new Set<() => void>()

/** 当前是否有可用的发送通道。 */
export function getPanelSender(): PanelSender | undefined {
  return current
}

/** 订阅发送通道变化，返回退订函数。 */
export function subscribePanelSender(listener: () => void): () => void {
  listeners.add(listener)
  return () => { listeners.delete(listener) }
}

/** 发布发送通道；传 undefined 表示撤销。 */
export function setPanelSender(next: PanelSender | undefined): void {
  const changed = next !== current
  current = next
  if (!changed) return
  for (const listener of [...listeners]) {
    try {
      listener()
    } catch (error) {
      console.error('[dsh-agnes-studio] sender listener failed:', error)
    }
  }
}
