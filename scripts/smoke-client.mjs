/**
 * Headless smoke test for the dsh-agnes-studio client bundle.
 *
 * Reproduces the DSH browser loading contract without a browser:
 *   1. window.__ModuleLoader__.load({ id, factory }) is what the shell calls
 *   2. the factory receives `require`, which must resolve 'react' and
 *      'react-dom/client' from the shell
 *   3. apply(ctx) must place the sidebar entry and open the panel on click
 *
 * A regression here is exactly the "点击没反应" failure: if the entry is never
 * placed, or the click handler never reaches a render, this test fails.
 */
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createContext, runInContext } from 'node:vm'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const clientPath = join(root, 'lib', 'client.js')
const source = readFileSync(clientPath, 'utf8')

// ── minimal DOM ────────────────────────────────────────────────────────
class FakeElement {
  constructor(tag) {
    this.tagName = String(tag).toUpperCase()
    this.children = []
    this.parentElement = null
    this.dataset = {}
    this.style = {
      cssText: '',
      cssProps: {},
      setProperty(name, value) { this.cssProps[name] = value },
      getPropertyValue(name) { return this.cssProps[name] ?? '' },
    }
    this.attributes = {}
    this.listeners = {}
    this.textContent = ''
    this.innerHTML = ''
    this.isConnected = true
  }
  set className(v) { this._class = v }
  get className() { return this._class ?? '' }
  appendChild(child) { child.parentElement = this; this.children.push(child); return child }
  append(...nodes) { for (const n of nodes) this.appendChild(n) }
  insertBefore(node, ref) {
    node.parentElement = this
    const i = ref === undefined || ref === null ? this.children.length : this.children.indexOf(ref)
    this.children.splice(i < 0 ? this.children.length : i, 0, node)
    return node
  }
  removeChild(child) { const i = this.children.indexOf(child); if (i >= 0) this.children.splice(i, 1); child.parentElement = null }
  remove() { this.parentElement?.removeChild(this); this.isConnected = false }
  addEventListener(type, fn) { (this.listeners[type] ??= []).push(fn) }
  removeEventListener(type, fn) { const l = this.listeners[type]; if (l) this.listeners[type] = l.filter(f => f !== fn) }
  dispatch(type, event = {}) {
    for (const fn of [...(this.listeners[type] ?? [])]) fn({ type, preventDefault() {}, stopPropagation() {}, ...event })
  }
  setAttribute(k, v) { this.attributes[k] = v }
  getAttribute(k) { return this.attributes[k] ?? null }
  /** Descendant search supporting the two selector shapes the plugin uses. */
  querySelector(selector) {
    return this.#find(el => matchesSelector(el, selector))
  }
  querySelectorAll(selector) { return this.#findAll(el => matchesSelector(el, selector)) }
  #findAll(pred) {
    const out = []
    const walk = el => {
      for (const child of el.children) {
        if (pred(child)) out.push(child)
        walk(child)
      }
    }
    walk(this)
    return out
  }
  #find(pred) { return this.#findAll(pred)[0] ?? null }
  closest(selector) {
    let el = this
    while (el !== null && el !== undefined) {
      if (matchesSelector(el, selector)) return el
      el = el.parentElement
    }
    return null
  }
  matches(sel) { return matchesSelector(this, sel) }
  contains(el) { return el === this || this.#findAll(x => x === el).length > 0 }
  getBoundingClientRect() { return { left: 0, top: 0, width: 1100, height: 720 } }
  get firstElementChild() { return this.children[0] ?? null }
}

/** Minimal selector matching: attribute, class-substring, and tag forms. */
function matchesSelector(el, selector) {
  if (typeof selector !== 'string') return false
  for (const part of selector.split(',').map(s => s.trim())) {
    if (part.startsWith('[') && part.endsWith(']')) {
      const body = part.slice(1, -1)
      const eq = body.indexOf('=')
      if (eq < 0) {
        if (Object.prototype.hasOwnProperty.call(el.dataset, camel(body)) || el.attributes?.[body] !== undefined) return true
        continue
      }
      const attr = body.slice(0, eq)
      const raw = body.slice(eq + 1).replace(/^["']|["']$/g, '')
      if (attr.startsWith('data-')) {
        if (el.dataset[camel(attr)] === raw) return true
      } else if (attr === 'class') {
        if (raw.startsWith('*')) { if ((el.className ?? '').includes(raw.slice(1))) return true }
        else if ((el.className ?? '').split(/\s+/).includes(raw)) return true
      }
      continue
    }
    if (part.includes('[')) {
      // tag[attr*=value] / tag[attr=value]
      const m = part.match(/^(\w*)\[([\w-]+)([*^$]?)=(.*)\]$/)
      if (m !== null) {
        const [, tag, attr, op, rawValue] = m
        const value = rawValue.replace(/^["']|["']$/g, '')
        if (tag && el.tagName !== tag.toUpperCase()) continue
        const actual = attr.startsWith('data-')
          ? el.dataset[camel(attr)]
          : attr === 'class' ? el.className : el.attributes?.[attr]
        if (typeof actual !== 'string') continue
        if (op === '*') { if (actual.includes(value)) return true }
        else if (actual === value) return true
      }
      continue
    }
    if (part.startsWith('.')) {
      if ((el.className ?? '').split(/\s+/).includes(part.slice(1))) return true
      continue
    }
    if (el.tagName === part.toUpperCase()) return true
  }
  return false
}

/** data-attribute name → dataset camelCase key. */
function camel(attr) {
  return attr.replace(/^data-/, '').replace(/-([a-z])/g, (_, c) => c.toUpperCase())
}

const head = new FakeElement('head')
const body = new FakeElement('body')
const documentElement = new FakeElement('html')

// ── a faithful slice of the shell sidebar ──────────────────────────────
// column > wrapper > root(logoRow owner) > logoRow > newSession button
const sidebarColumn = new FakeElement('div')
sidebarColumn.dataset.pane = 'sidebar'
const sidebarWrapper = new FakeElement('div')
const sidebarRoot = new FakeElement('div')
const logoRow = new FakeElement('div')
logoRow.className = 'logoRow_abc'
const newSessionButton = new FakeElement('button')
newSessionButton.className = 'newSessionBtn_x1'
logoRow.appendChild(newSessionButton)
sidebarRoot.appendChild(logoRow)
sidebarWrapper.appendChild(sidebarRoot)
sidebarColumn.appendChild(sidebarWrapper)
body.appendChild(sidebarColumn)

const containers = {}

const document = {
  head,
  body,
  documentElement,
  createElement: tag => new FakeElement(tag),
  // Delegates to the same matcher the plugin's DOM queries rely on.
  querySelector: sel => body.querySelector(sel) ?? head.querySelector(sel),
  querySelectorAll: sel => body.querySelectorAll(sel),
  addEventListener() {},
  removeEventListener() {},
}

// ── React + ReactDOM stubs (what the shell's require() returns) ─────────
const rendered = []
const React = {
  createElement: (type, props, ...children) => ({ $$type: type, props, children }),
  useState: initial => [initial, () => {}],
  useEffect: () => {},
  useCallback: fn => fn,
  useRef: initial => ({ current: initial }),
}
const ReactDOM = {
  createRoot: container => ({
    render(element) { rendered.push({ container, element }) },
    unmount() {},
  }),
}
// Oh Story's client half requires react/jsx-runtime at module scope; its jsx()
// calls only run inside components, which this harness never renders.
const jsxRuntime = { jsx: () => null, jsxs: () => null, Fragment: 'Fragment' }

// ── module loader contract ─────────────────────────────────────────────
// The MERGED bundle registers TWO factories in one file: the vendored
// @oh-story/dsh half and the dsh-agnes-studio half. The shell's loader
// collects both, and a factory resolves its sibling through require().
const registrations = []
const window = {
  __ModuleLoader__: { load(spec) { registrations.push(spec) } },
  location: { origin: 'http://127.0.0.1:3080', search: '', href: '' },
  addEventListener() {}, removeEventListener() {},
}

// Oh Story's apply() registers into these; the stub plays the slot runtime:
// it records every registration (spec + occupant component) and invokes the
// inject callbacks exactly like the real slots service does, so the harness can
// later render the panel occupant the way the runtime renders it.
const slotCalls = []
const slotRegistrations = []
const ctx = {
  effect(fn) { fn(); return () => {} },
  get: () => undefined,
  on: () => () => {},
  slots: {
    inject(name, register) { slotCalls.push(['inject', name]); register(); return () => {} },
    register(spec, component) {
      slotCalls.push(['register', spec?.name])
      slotRegistrations.push({ spec, component })
      return () => {}
    },
  },
}

const sandbox = {
  window,
  document,
  globalThis: undefined,
  console,
  setTimeout,
  clearTimeout,
  fetch: async () => ({ ok: true, json: async () => ({}) }),
  MutationObserver: class { observe() {} disconnect() {} takeRecords() { return [] } },
  TextEncoder, TextDecoder,
  navigator: { clipboard: { writeText() {} } },
  localStorage: { getItem: () => null, setItem() {}, removeItem() {} },
  CustomEvent: class { constructor(type, init) { this.type = type; this.detail = init?.detail } },
  URLSearchParams,
}
sandbox.globalThis = sandbox
sandbox.self = sandbox

// ── run ────────────────────────────────────────────────────────────────
const failures = []
const check = (label, ok, detail) => {
  if (ok) console.log(`  ✅ ${label}`)
  else { console.log(`  ❌ ${label}${detail ? ' — ' + detail : ''}`); failures.push(label) }
}

console.log('dsh-agnes-studio client smoke test\n')

const context = createContext(sandbox)
try {
  runInContext(source, context, { filename: 'client.js' })
} catch (error) {
  console.error('  ❌ client.js threw while loading:', error.message)
  process.exit(1)
}
check('client.js loads without throwing', true)

const byId = new Map(registrations.map(spec => [spec.id, spec]))
check('bundle registers exactly one factory', registrations.length === 1, `got ${registrations.length}`)
check('no vendored Oh Story client half is registered', !byId.has('dsh-agnes-studio/oh-story'), [...byId.keys()].join(', '))
check('registers the package own id', byId.has('dsh-agnes-studio'), [...byId.keys()].join(', '))
const loaded = byId.get('dsh-agnes-studio')
if (loaded === undefined) process.exit(1)
check('factory is a function', typeof loaded.factory === 'function')
if (typeof loaded.factory !== 'function') process.exit(1)

// The shell passes ctx into the module's apply through the factory result, and
// hands each factory a require() that resolves the sibling registration.
const requested = []
const factoryRequire = id => {
  requested.push(id)
  if (id === 'react') return React
  if (id === 'react-dom' || id === 'react-dom/client') return ReactDOM
  if (id === 'react/jsx-runtime') return jsxRuntime
  if (id === '@deepseek-ai/dsh-client-store') return { defineStore: spec => spec }
  const sibling = byId.get(id)
  if (sibling !== undefined) {
    if (sibling.exports === undefined) sibling.exports = sibling.factory(factoryRequire)
    return sibling.exports
  }
  throw new Error('Unknown module: ' + id)
}

let exportsObj
try {
  exportsObj = loaded.factory(factoryRequire)
} catch (error) {
  console.error('  ❌ factory threw:', error.message)
  process.exit(1)
}

check('inject declares slots',
  Array.isArray(exportsObj.inject) && exportsObj.inject.includes('slots'))
// sessions / conversation 是 **DSH 官方服务**，不是 Oh Story 的私有物。
// 撤销创作套件时客户端不再需要它们，故当时一并去掉；现在为了「从面板向当前会话
// 发起创作任务」重新需要（槽位 inject(sessionId) → conversation.send）。
// 真正要防 Oh Story 残留的是下面那条：不得 require 已撤下的 vendored sibling。
check('inject declares the DSH-native task-dispatch services',
  ['sessions', 'conversation'].every(s => (exportsObj.inject ?? []).includes(s)),
  (exportsObj.inject ?? []).join(','))
check('exports apply', typeof exportsObj.apply === 'function')
check('resolved react from the shell', requested.includes('react'))
check('does NOT require the withdrawn vendored sibling',
  !requested.includes('dsh-agnes-studio/oh-story'))
if (typeof exportsObj.apply !== 'function') process.exit(1)

// No sidebar in this harness: apply must still not throw, and the entry is
// created (placement waits for the shell's sidebar to appear).
let applyError = null
try {
  await exportsObj.apply(ctx)
} catch (error) {
  applyError = error
}
check('apply() runs without throwing', applyError === null, applyError?.message)

// The client half no longer vendors Oh Story at all (the 「✦ 创作套件」 tab was
// withdrawn 2026-09-26), so none of its slots or tool views may be registered
// from here. NOTE: this costs the dedicated tool-call views for the oh_story_*
// tools (they fall back to the shell's default rendering) — the tools
// themselves still work, they are provided by the host half.
check('client registers no Oh Story seat slot',
  !slotRegistrations.some(r => r.spec?.name === 'oh-story.panel-seat'))
check('client registers no Oh Story workbench slots',
  !slotRegistrations.some(r => String(r.spec?.name ?? '').includes('oh-story')))
check('client registers no Oh Story tool views',
  slotRegistrations.filter(r => r.spec?.name === 'tool.call.toolview').length === 0,
  JSON.stringify(slotRegistrations.map(r => r.spec?.name)))

// ── the click path: entry click must open the slot-rendered panel ──────
// The panel is an occupant of shell.overlay now, so the harness plays the slot
// runtime: it captures the registration and invokes the occupant component the
// way the runtime would (passing renderSlot).
const entries = body.querySelectorAll('[data-dsh-agnes-studio-entry]')
const entry = entries[0] ?? null
if (entry === null) {
  console.log('    · sidebar column found:', body.querySelector('[data-pane="sidebar"]') !== null)
  console.log('    · body child count:', body.children.length)
  const col = body.querySelector('[data-pane="sidebar"]')
  console.log('    · column children:', col?.children.length ?? 'n/a')
  console.log('    · logoRow owner found:', col?.querySelector('[class*="logoRow"]')?.parentElement !== undefined)
}
check('sidebar entry element was created', entry !== null)

if (entry !== null) {
  check('entry has a click listener', (entry.listeners.click ?? []).length > 0)
  check('entry has visible label', entry.innerHTML.includes('泡泡猫的影视工具'))

  // The panel seat: registered into shell.overlay, and the ONLY declarer of the
  // private slot that carries the Oh Story workbench (a child slot can be
  // declared exactly once — this is what makes the in-panel hosting legal).
  const seat = slotRegistrations.find(r => r.spec?.id === 'agnes-studio')
  check('panel seat registered in shell.overlay', seat !== undefined,
    JSON.stringify(slotRegistrations.map(r => r.spec)))
  // The withdrawn 「✦ 创作套件」 tab used to declare a private child slot here.
  // It must stay gone: a stale declaration would re-open the whole slot plumbing.
  check('panel seat declares no retired creative-suite child slot',
    seat?.spec?.children?.['oh-story.panel-seat'] === undefined,
    JSON.stringify(seat?.spec?.children))

  // Closed by default: the occupant renders nothing until the entry is clicked.
  check('panel is hidden before the click', seat.component({ renderSlot: () => null }) === null)
  entry.dispatch('click')
  check('entry click marks the sidebar row active', entry.dataset.active === 'true')

  // Now the occupant renders the panel tree, exactly like the runtime renders it.
  const suiteSlotCalls = []
  const renderSlot = (name, props) => { suiteSlotCalls.push([name, props]); return { $$type: 'slot', name } }
  const tree = seat.component({ renderSlot, SessionProvider: () => null })
  check('occupant renders a panel tree after the click', tree !== null && typeof tree === 'object')
  const treeText = JSON.stringify(tree)
  check('overlay container renders', treeText.includes('data-dsh-agnes-studio-container'))
  check('overlay layer owns the backdrop', treeText.includes('data-dsh-agnes-backdrop'))
  check('overlay frame is not the styled panel node',
    treeText.includes('data-dsh-agnes-studio-frame') && !treeText.includes('data-dsh-agnes-studio"'))

  // The panel is no longer wired to any slot renderer: the 创作套件 tab that
  // consumed `renderSlot` was withdrawn. Assert the prop did not come back.
  const findWithSuiteProp = (node, out = []) => {
    if (node === null || typeof node !== 'object') return out
    if (typeof node.$$type === 'function' && node.props?.creativeSuite !== undefined) out.push(node)
    for (const child of [node.children ?? [], node.props?.children ?? []].flat(2)) findWithSuiteProp(child, out)
    return out
  }
  const withSuiteProp = findWithSuiteProp(tree)
  check('StudioPanel is NOT wired to a creative-suite renderer', withSuiteProp.length === 0,
    String(withSuiteProp.length))
  // 座位现在**会**调 renderSlot —— 但用的是我们自己的会话作用域子槽 agnes.workspace
  // （sendTask 靠它注入，见 index.ts 的两段注册）。要防的是复活 Oh Story 已撤下的槽名。
  const RETIRED_SLOTS = ['oh-story.panel-seat', 'oh-story.workspace']
  check('panel never asks the slot runtime for a retired Oh Story seat',
    suiteSlotCalls.every(([name]) => !RETIRED_SLOTS.includes(name)),
    JSON.stringify(suiteSlotCalls))
  check('panel seat declares our own session-scoped child slot',
    seat?.spec?.children?.['agnes.workspace']?.scope === 'session',
    JSON.stringify(seat?.spec?.children))

  // Source-level regressions. The React stub never invokes the component, so
  // naming/tree assertions read the shipped bundle itself.
  check('panel title uses the product name (泡泡猫的影视工具)', source.includes('泡泡猫的影视工具'))
  check('no legacy "Agnes 创意工作站" UI title left in the client',
    !source.includes('Agnes 创意工作站'))
  check('first-use key guide ships with the panel',
    source.includes('platform.agnes-ai.cn') && source.includes('agnes-api-key'))
  // The seat owns the ONLY scrim now (the whole overlay lives in the slot tree),
  // so what must not come back is a second, imperatively created backdrop.
  check('no imperative scrim left behind (the seat owns the only backdrop)',
    !/dataset\.dshAgnesBackdrop\s*=/.test(source))
  const backdropNodes = (treeText.match(/data-dsh-agnes-backdrop/g) ?? []).length
  check('exactly one backdrop element in the panel tree', backdropNodes === 1, String(backdropNodes))
  // 创作套件相关的东西必须彻底消失（功能已撤，2026-09-26）。
  check('creative suite tab is gone from the rail', !source.includes('创作套件'))
  check('no workbench layout anchor is shipped', !source.includes('[data-agnes-suite]'))
  check('no session anchor for a portalled workbench', !source.includes('data-agnes-suite-session'))
  check('no Oh Story workbench slot names in the client',
    !source.includes('oh-story.panel-seat') && !source.includes('oh-story.panel-workspace'))

  // 短剧步骤条：completed 必须映射到「全部完成」。
  // 原来的实现直接返回 STEPS.findIndex(...)，而未列出的状态会得到 -1 —— completed
  // 恰好没列在 STEPS 里，于是 isActive(idx === -1) 与 isDone(idx < -1) 双双恒假：
  // 任务跑完时步骤条全灭，而且 stepIdx >= 1/2/3 那几处还会把剧本、镜头、素材一起藏掉。
  check('drama step index maps the completed boundary to "all done"',
    /getStepIndex[\s\S]{0,500}?task\.status === "completed"[\s\S]{0,120}?return STEPS\.length/.test(source))

  // The sidebar entry renders in the DSH sidebar, OUTSIDE the panel root, so
  // our panel-scoped --ag-* tokens are undefined there and would fall back to a
  // dark value on a dark surface (invisible text). It must use host tokens.
  const cssNoComments = source.replace(/\/\*[\s\S]*?\*\//g, '')
  const entryBlocks = cssNoComments.match(/\.agnes-entry[^{]*\{[^}]*\}/g) ?? []
  check('sidebar entry CSS is present', entryBlocks.length >= 3, String(entryBlocks.length))
  check('sidebar entry uses host theme tokens, not panel-scoped --ag-*',
    entryBlocks.length > 0 && !entryBlocks.some(b => /--ag-/.test(b)),
    entryBlocks.filter(b => /--ag-/.test(b)).join(' ').slice(0, 160))
}

console.log('')
if (failures.length > 0) {
  console.log(`FAILED: ${failures.length} check(s) — ${failures.join('; ')}`)
  process.exit(1)
}
console.log('All checks passed.')
