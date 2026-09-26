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

declare const require: ((id: string) => unknown) | undefined

/** Resolve one shell-provided module without ever throwing at load time. */
function shellRequire(id: string): any {
  try {
    if (typeof require === 'function') {
      const mod = require(id)
      if (mod !== undefined && mod !== null) return mod
    }
  } catch { /* fall through to the global */ }
  return undefined
}

const React: any = shellRequire('react') ?? (globalThis as any).React ?? null
const NOOP = (): void => {}
const useState: any = React?.useState ?? ((initial: unknown) => [typeof initial === 'function' ? (initial as () => unknown)() : initial, NOOP])
const useEffect: any = React?.useEffect ?? NOOP
const useRef: any = React?.useRef ?? ((initial: unknown) => ({ current: initial }))
const createElement: any = React?.createElement ?? (() => null)

import { StudioPanel } from './panel.tsx'
import { hidePanel, isPanelVisible, subscribePanel } from './panel-state.ts'

/** Props the slot runtime hands to an occupant of `shell.overlay`. */
export interface SeatProps {
  renderSlot?: (name: string, props: Record<string, unknown>) => unknown
  [key: string]: unknown
}

/**
 * The studio panel seat.
 *
 * @param props - slot host props; `renderSlot` is required for the creative suite.
 */
export function AgnesSeat(): unknown {
  const [visible, setVisible] = useState(isPanelVisible())
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => subscribePanel(() => { setVisible(isPanelVisible()) }), [])

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
      createElement(StudioPanel, { onClose: hidePanel }),
    ),
  )
}
