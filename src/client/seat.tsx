/**
 * 影视工具面板的 slot 座位（seat）。
 *
 * 为什么面板必须由 slot 渲染树渲染 —— 这是实测出来的硬约束，不是风格选择：
 * DSH 的 renderer host 通过 React context(`HostContext`) 传给组件，
 * `useHost()` 在 context 为 null 时抛
 *   SlotAssemblyError: slot machinery rendered outside the installed renderer tree
 * 也就是说用 `ReactDOM.createRoot` 自建的树，**无论挂在 DOM 的哪个位置**都拿不到
 * 槽位运行时。
 *
 * 因此面板整体作为 `shell.overlay` 的一个 occupant 渲染：由运行时挂载，位于
 * slot 渲染树内，能拿到运行时通过 props 交给它的东西。
 * 外观与交互（浮层、遮罩、Esc、与会话区抢占）与改造前保持一致。
 */

import { useState, useEffect, useRef, createElement } from './react-shim.ts'

import { StudioPanel } from './panel.tsx'
import { hidePanel, isPanelVisible, subscribePanel } from './panel-state.ts'
import { getPanelSender, setPanelSender, subscribePanelSender } from './panel-bridge.ts'

/** Props the slot runtime hands to an occupant of `shell.overlay`. */
export interface SeatProps {
  renderSlot?: (name: string, props: Record<string, unknown>) => unknown
  [key: string]: unknown
}

/**
 * 往当前会话发消息的**无渲染**占用者。
 *
 * 它注册在 `conversation.session.header.actions`（会话作用域的 list 槽）上，
 * 唯一职责是把 `inject(sessionId)` 拿到的发送能力发布到 panel-bridge，
 * 自己渲染 null —— 不会在会话头部留下任何视觉痕迹。
 *
 * @param props - sendTask 由该子槽的 inject 注入。
 */
export function SessionBridge(props: { sendTask?: (text: string) => void }): unknown {
  useEffect(() => {
    setPanelSender(props.sendTask)
    return () => { setPanelSender(undefined) }
  }, [props.sendTask])
  return null
}

export function AgnesSeat(props: SeatProps): unknown {
  const [visible, setVisible] = useState(isPanelVisible())
  const [sendTask, setSendTask] = useState(getPanelSender())
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => subscribePanel(() => { setVisible(isPanelVisible()) }), [])
  useEffect(() => subscribePanelSender(() => { setSendTask(getPanelSender()) }), [])

  // Opening hands the screen back: sibling panels close on this event.
  useEffect(() => {
    if (!visible) return undefined
    document.dispatchEvent(new CustomEvent('dsh-panel-activate', { detail: 'agnes-studio' }))
    const onOtherActivate = (event: Event): void => {
      if ((event as CustomEvent).detail !== 'agnes-studio') hidePanel()
    }
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') hidePanel()
    }
    document.addEventListener('dsh-panel-activate', onOtherActivate)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('dsh-panel-activate', onOtherActivate)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [visible])

  // Keep the floating studio clear of the shell sidebar so the entry row behind
  // it stays reachable. A missing style hook must never stop the panel opening.
  useEffect(() => {
    if (!visible || containerRef.current === null) return
    const sidebar = document.querySelector<HTMLElement>('[data-pane="sidebar"], [class*="sidebarCol"]')
    const width = sidebar?.getBoundingClientRect().width ?? 0
    containerRef.current.style.setProperty?.('--agnes-sidebar-w', Math.round(width) + 'px')
  }, [visible])

  if (!visible) return null

  return createElement('div', {
    ref: containerRef,
    'data-dsh-agnes-studio-container': '',
    style: { position: 'fixed', inset: 0, zIndex: 9998, pointerEvents: 'auto' },
  },
    // The vanilla overlay layer owns the ONLY scrim, and this wrapper must not
    // carry the attribute the stylesheet positions: a transformed wrapper would
    // become the containing block for the fixed panel inside it.
    createElement('div', { 'data-dsh-agnes-backdrop': '', onClick: hidePanel }),
    createElement('div', { 'data-dsh-agnes-studio-frame': '' },
      // 面板本体由座位直接渲染。
      // 曾经这里 renderSlot('agnes.workspace')：那是 root 父槽下的 session 子槽，
      // DSH 会直接抛 SlotAssemblyError，整个面板空白。详见 panel-bridge.ts 的说明。
      createElement(StudioPanel, { onClose: hidePanel, sendTask }),
    ),
  )
}
