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
import { AgnesSeat } from './seat.tsx'
import { hidePanel, isPanelVisible, subscribePanel, togglePanel } from './panel-state.ts'

/** Required services. */
export const inject = ['slots']

/** The slice of the client slot service this plugin uses. */
interface SlotService {
  inject: (name: string, register: () => unknown) => unknown
  register: (
    spec: {
      name: string
      id?: string
      order?: number
      children?: Record<string, { kind: string; scope?: string }>
    },
    component: unknown,
  ) => unknown
}

/** Slot this panel occupies. */
const SHELL_OVERLAY = 'shell.overlay'

/** Sidebar entry icon (16px nav-icon look). */
const SIDEBAR_ICON =
  '<svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="1.5" y="3" width="13" height="10" rx="2.5"/><path d="M4 8.5l2.5 2.5L12 5.5"/></svg>'

/**
 * Register the panel seat, then mount the sidebar entry that toggles it.
 * @param ctx - client root context.
 */
export function apply(ctx: ClientContext): void {
  // Styles must exist before the entry row is placed (its own class names).
  injectStyles()

  const slots = (ctx as unknown as { slots: SlotService }).slots

  // ── The panel seat ──────────────────────────────────────────────────
  // This registration is ALSO the single declaration of the private slot that
  // carries the Oh Story workbench seat (a child slot may be declared exactly
  // once — see build.mjs). The seat asks for it at render time.
  ctx.effect(
    () => slots.inject(SHELL_OVERLAY, () => slots.register({
      name: SHELL_OVERLAY,
      id: 'agnes-studio',
      order: 100,
    }, AgnesSeat)),
    'dsh-agnes-studio: panel seat',
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
