/**
 * dsh-agnes-studio client entry.
 *
 * Mounts the creative studio panel as a frame-wide floating overlay.
 * The conversation DOM is never touched, so the chat stays fully usable.
 *
 * Registered through DSH's client module loader:
 *   window.__ModuleLoader__.load({ id, factory: (require) => ... })
 * Static imports below are inlined into this single bundle at build time —
 * a dynamic import() would resolve relative to the PAGE url, not this file.
 */
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
import { StudioPanel, mountReact } from './panel.tsx'
import { injectStyles } from './styles.ts'

/** Required services. */
export const inject = ['slots']

/** Sidebar entry icon (16px nav-icon look). */
const SIDEBAR_ICON =
  '<svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="1.5" y="3" width="13" height="10" rx="2.5"/><path d="M4 8.5l2.5 2.5L12 5.5"/></svg>'

/**
 * Mount the sidebar entry and the floating studio panel.
 * @param ctx - client root context.
 */
export function apply(ctx: ClientContext): void {
  // Styles must exist before the entry row is placed (its own class names).
  injectStyles()

  let panelVisible = false
  let backdropEl: HTMLDivElement | null = null
  let panelEl: HTMLDivElement | null = null
  let unmountReact: (() => void) | null = null

  /** Container the overlay lives in (created on first open). */
  function ensureContainer(): HTMLDivElement {
    let container = document.querySelector<HTMLDivElement>('[data-dsh-agnes-studio-container]')
    if (container === null) {
      container = document.createElement('div')
      container.dataset.dshAgnesStudioContainer = ''
      container.style.cssText = 'position:fixed;inset:0;z-index:9998;pointer-events:none;'
      document.body.appendChild(container)
    }
    return container
  }

  /** Open the panel. */
  function showPanel(): void {
    if (panelVisible) return
    panelVisible = true

    const container = ensureContainer()
    container.style.pointerEvents = 'auto'
    // Keep the floating studio clear of the shell's sidebar so the entry row
    // behind it stays reachable while the panel is open.
    const sidebar = document.querySelector<HTMLElement>('[data-pane="sidebar"], [class*="sidebarCol"]')
    const sidebarWidth = sidebar?.getBoundingClientRect().width ?? 0
    // setProperty may be absent in stripped-down DOM shims; a missing style
    // hook must never stop the panel from opening.
    container.style.setProperty?.('--agnes-sidebar-w', Math.round(sidebarWidth) + 'px')

    backdropEl = document.createElement('div')
    backdropEl.dataset.dshAgnesBackdrop = ''
    backdropEl.addEventListener('click', hidePanel)

    panelEl = document.createElement('div')
    // Deliberately NOT `data-dsh-agnes-studio`: the stylesheet positions that
    // attribute as the floating window, and a transformed wrapper would become
    // the containing block for the fixed panel inside it — which made every
    // drag (and every click with a pixel of movement) jump the panel by the
    // wrapper's own offset and pull buttons out from under the pointer.
    panelEl.dataset.dshAgnesStudioFrame = ''

    container.append(backdropEl, panelEl)

    try {
      unmountReact = mountReact(panelEl, StudioPanel, { onClose: hidePanel })
    } catch (error) {
      // A render failure degrades the panel only — never the GUI.
      console.error('[dsh-agnes-studio] panel render failed:', error)
      hidePanel()
      return
    }
    syncEntryActive()
  }

  /** Close the panel (state is kept, only the DOM is removed). */
  function hidePanel(): void {
    if (!panelVisible) return
    panelVisible = false

    try {
      unmountReact?.()
    } catch { /* already unmounted */ }
    unmountReact = null

    backdropEl?.remove()
    backdropEl = null
    panelEl?.remove()
    panelEl = null

    const container = document.querySelector<HTMLDivElement>('[data-dsh-agnes-studio-container]')
    if (container !== null) container.style.pointerEvents = 'none'
    syncEntryActive()
  }

  function togglePanel(): void {
    if (panelVisible) hidePanel()
    else showPanel()
  }

  // ── Sidebar entry (self-healing DOM injection) ──────────────────────
  const ENTRY_SELECTOR = '[data-dsh-agnes-studio-entry]'

  const entry = document.createElement('button')
  entry.type = 'button'
  entry.dataset.dshAgnesStudioEntry = ''
  entry.className = 'agnes-entry'
  entry.setAttribute('aria-label', '泡泡猫的影视工具')
  entry.setAttribute('title', '泡泡猫的影视工具 — AI 生图 / 生视频 / 故事板')
  entry.innerHTML =
    '<span class="agnes-entry-icon">' + SIDEBAR_ICON + '</span>' +
    '<span class="agnes-entry-label">泡泡猫的影视工具</span>'

  const onEntryClick = (event: MouseEvent): void => {
    event.preventDefault()
    event.stopPropagation()
    togglePanel()
  }
  entry.addEventListener('click', onEntryClick)

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

  function syncEntryActive(): void {
    if (panelVisible) entry.dataset.active = 'true'
    else delete entry.dataset.active
  }

  // Opening this panel closes sibling panels, and clicking a session row
  // hands the screen back to the conversation.
  const ACTIVATE_EVENT = 'dsh-panel-activate'
  if (panelVisible) document.dispatchEvent(new CustomEvent(ACTIVATE_EVENT, { detail: 'agnes-studio' }))
  const onOtherActivate = (event: Event): void => {
    const detail = (event as CustomEvent).detail
    if (detail !== 'agnes-studio' && panelVisible) hidePanel()
  }
  document.addEventListener(ACTIVATE_EVENT, onOtherActivate)

  const onKeyDown = (event: KeyboardEvent): void => {
    if (event.key === 'Escape' && panelVisible) hidePanel()
  }
  document.addEventListener('keydown', onKeyDown)

  tryPlace()

  // ── Teardown ────────────────────────────────────────────────────────
  ctx.effect(() => () => {
    waitObserver.disconnect()
    rootObserver.disconnect()
    document.removeEventListener(ACTIVATE_EVENT, onOtherActivate)
    document.removeEventListener('keydown', onKeyDown)
    entry.removeEventListener('click', onEntryClick)
    entry.remove()
    hidePanel()
    document.querySelector<HTMLDivElement>('[data-dsh-agnes-studio-container]')?.remove()
  }, 'dsh-agnes-studio: ui mounts')
}
