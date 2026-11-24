/**
 * dsh-agnes-studio client entry.
 *
 * Two pieces:
 *
 * 1. The **sidebar entry** — imperative, self-healing DOM injection (the shell
 *    owns that column and re-renders it, so a plain React mount would be
 *    evicted).
 * 2. The **panel seat** — registered as an occupant of `shell.overlay` so the
 *    slot runtime renders it. That is mandatory, not stylistic: the renderer
 *    host arrives through React context, so a tree mounted with our own
 *    `createRoot` can never render slot content.
 *    See seat.tsx.
 *
 * Registered through DSH's client module loader:
 *   window.__ModuleLoader__.load({ id, factory: (require) => ... })
 * Static imports below are inlined into this single bundle at build time —
 * a dynamic import() would resolve relative to the PAGE url, not this file.
 */
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
import { injectStyles } from './styles.ts'
import { AgnesSeat, SessionBridge } from './seat.tsx'
import { hidePanel, isPanelVisible, subscribePanel, togglePanel } from './panel-state.ts'

/** Required services. */
// sessions / conversation 是为了「从面板发起创作任务」：
// 槽位注册支持 inject(sessionId)，据此可以拿到该会话的 conversation.send。
// Oh Story 的客户端也是这么声明与使用的。
export const inject = ['slots', 'sessions', 'conversation']

/** The slice of the client slot service this plugin uses. */
interface SlotService {
  inject: (name: string, register: () => unknown) => unknown
  register: (
    spec: {
      name: string
      id?: string
      order?: number
      children?: Record<string, { kind: string; scope?: string }>
      /** 槽位运行时会把 sessionId 传进来；返回的对象成为组件的 props。 */
      inject?: (sessionId: string) => Record<string, unknown>
    },
    component: unknown,
  ) => unknown
}

/** Slot this panel occupies. */
const SHELL_OVERLAY = 'shell.overlay'

/**
 * 会话作用域的 list 槽：我们在这里挂一个**无渲染**的占用者，
 * 只为拿 inject(sessionId)，把"往当前会话发消息"的能力发布给面板。
 * 会话头部真正的动作按钮不受影响（list 槽是叠加的，不是替换）。
 */
const SESSION_ACTIONS_SLOT = 'conversation.session.header.actions'

/** Sidebar entry icon (16px nav-icon look). */
const SIDEBAR_ICON =
  '<svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="1.5" y="3" width="13" height="10" rx="2.5"/><path d="M4 8.5l2.5 2.5L12 5.5"/></svg>'

/**
 * 把一段文本发进指定会话。
 *
 * 走 `ctx.sessions.retain()`（ISessions 的公开面）拿会话作用域，
 * 再从它的 ctx 上取 conversation 服务 —— 旧实现用的 `sessions.binding(id)`
 * 在现行 ISessions 上并不存在，所以那条通道其实一直是空的。
 * 任何一步失败都只吞掉并告警：面板不能因为发不出去而崩。
 */
function sendIntoSession(ctx: ClientContext, sessionId: string, text: string): void {
  if (text.trim() === '') return
  const sessions = (ctx as unknown as {
    sessions?: {
      retain?: (id: string, options: { source: string }) => {
        binding?: { ctx?: { get?: (key: string) => unknown } }
        release?: () => void
      }
    }
  }).sessions
  if (typeof sessions?.retain !== 'function') {
    console.warn('[dsh-agnes-studio] sessions service unavailable; task not sent')
    return
  }
  let released = false
  try {
    const reference = sessions.retain(sessionId, { source: 'gateway' })
    try {
      const conversation = reference.binding?.ctx?.get?.('conversation') as { send?: (t: string) => unknown } | undefined
      if (typeof conversation?.send === 'function') void conversation.send(text)
      else console.warn('[dsh-agnes-studio] conversation service unavailable; task not sent')
    } finally {
      reference.release?.()
      released = true
    }
  } catch (error) {
    console.warn('[dsh-agnes-studio] failed to send task into session:', error)
  } finally {
    if (!released) { /* nothing else to release */ }
  }
}

/**
 * Register the panel seat, then mount the sidebar entry that toggles it.
 * @param ctx - client root context.
 */
export function apply(ctx: ClientContext): void {
  // Styles must exist before the entry row is placed (its own class names).
  injectStyles()

  const slots = (ctx as unknown as { slots: SlotService }).slots

  // ── The panel seat ──────────────────────────────────────────────────
  // ① 面板座位。`shell.overlay` 是 root 作用域，所以**不能**在这里声明
  //    session 作用域的子槽：DSH 的槽运行时对此是硬报错
  //    （strict session slot … rendered without a scope binding），
  //    面板会整片空白。发送通道改走 ② 的独立占用者，见 panel-bridge.ts。
  ctx.effect(
    () => slots.inject(SHELL_OVERLAY, () => slots.register({
      name: SHELL_OVERLAY,
      id: 'agnes-studio',
      order: 100,
    }, AgnesSeat)),
    'dsh-agnes-studio: panel seat',
  )

  // ② 发送通道：挂在会话头部的 actions list 槽上，渲染 null。
  //    slots.inject 会等这个槽被别的插件声明出来；没有会话界面时它就静静等着，
  //    面板照常可用，只是"发送到会话"按钮是禁用态。
  ctx.effect(
    () => slots.inject(SESSION_ACTIONS_SLOT, () => slots.register({
      name: SESSION_ACTIONS_SLOT,
      id: 'agnes-studio-session-bridge',
      order: 900,
      inject: (sessionId: string) => ({
        sendTask: (text: string) => { sendIntoSession(ctx, sessionId, text) },
      }),
    }, SessionBridge)),
    'dsh-agnes-studio: session bridge',
  )

  // ── Sidebar entry (self-healing DOM injection) ──────────────────────
  const entry = document.createElement('button')
  entry.type = 'button'
  entry.dataset.dshAgnesStudioEntry = ''
  entry.className = 'agnes-entry'
  entry.setAttribute('aria-label', '泡泡猫的影视工具')
  entry.setAttribute('title', '泡泡猫的影视工具 — AI 生图 / 生视频 / 短剧 / 口播 / 画布 / 封面')
  entry.innerHTML =
    '<span class="agnes-entry-icon">' + SIDEBAR_ICON + '</span>' +
    '<span class="agnes-entry-label">泡泡猫的影视工具</span>'

  const onEntryClick = (event: MouseEvent): void => {
    event.preventDefault()
    event.stopPropagation()
    togglePanel()
  }
  entry.addEventListener('click', onEntryClick)

  function syncEntryActive(): void {
    if (isPanelVisible()) entry.dataset.active = 'true'
    else delete entry.dataset.active
  }
  const unsubscribeEntry = subscribePanel(syncEntryActive)

  function sidebarRoot(): HTMLElement | undefined {
    const column = document.querySelector<HTMLElement>('[data-pane="sidebar"], [class*="sidebarCol"]')
    if (column === null) return undefined
    const logoOwner = column.querySelector<HTMLElement>('[class*="logoRow"]')?.parentElement
    return logoOwner ?? (column.firstElementChild as HTMLElement | undefined)
  }

  function anchorRow(root: HTMLElement): HTMLElement | undefined {
    const nested = root.querySelector<HTMLButtonElement>('button[class*="newSession"]')
    if (nested !== null) {
      const row = nested.closest<HTMLElement>('[class*="logoRow"]')
      if (row !== null && row.parentElement === root) return row
      return nested
    }
    for (const child of root.children) {
      if (child.tagName === 'BUTTON') return child as HTMLElement
    }
    return undefined
  }

  function placeEntry(root: HTMLElement): boolean {
    const anchor = anchorRow(root)
    if (anchor === undefined) return false
    if (entry.parentElement !== root) {
      root.insertBefore(entry, anchor.nextElementSibling)
    }
    return true
  }

  let rootEl: HTMLElement | undefined
  let placed = false

  const rootObserver = new MutationObserver(() => {
    if (rootEl === undefined || !rootEl.isConnected) {
      placed = false
      tryPlace()
      return
    }
    if (!rootEl.contains(entry)) placed = placeEntry(rootEl)
  })

  function tryPlace(): void {
    if (rootEl !== undefined && !rootEl.isConnected) {
      rootObserver.disconnect()
      rootEl = undefined
      placed = false
    }
    if (placed) {
      if (document.body.contains(entry)) return
      rootObserver.disconnect()
      rootEl = undefined
      placed = false
    }
    rootEl ??= sidebarRoot()
    if (rootEl === undefined) return
    placed = placeEntry(rootEl)
    if (placed) rootObserver.observe(rootEl, { childList: true, subtree: true })
  }

  const waitObserver = new MutationObserver(() => { tryPlace() })
  waitObserver.observe(document.body, { childList: true, subtree: true })

  // Clicking a session row hands the screen back to the conversation.
  const onOtherActivate = (event: Event): void => {
    const detail = (event as CustomEvent).detail
    if (detail !== 'agnes-studio' && isPanelVisible()) hidePanel()
  }
  document.addEventListener('dsh-panel-activate', onOtherActivate)

  tryPlace()

  // ── Teardown ────────────────────────────────────────────────────────
  ctx.effect(() => () => {
    waitObserver.disconnect()
    rootObserver.disconnect()
    unsubscribeEntry()
    document.removeEventListener('dsh-panel-activate', onOtherActivate)
    entry.removeEventListener('click', onEntryClick)
    entry.remove()
    hidePanel()
  }, 'dsh-agnes-studio: sidebar entry')
}
