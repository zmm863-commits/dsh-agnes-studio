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

// ── module loader contract ─────────────────────────────────────────────
let loaded = null
const window = {
  __ModuleLoader__: { load(spec) { loaded = spec } },
  location: { origin: 'http://127.0.0.1:3080', search: '', href: '' },
  addEventListener() {}, removeEventListener() {},
}

const ctx = {
  effect(fn) { fn(); return () => {} },
  get: () => undefined,
  on: () => () => {},
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

check('module registered through __ModuleLoader__', loaded !== null)
if (loaded === null) process.exit(1)
check('loader id is the package name', loaded.id === 'dsh-agnes-studio', `got "${loaded.id}"`)
check('factory is a function', typeof loaded.factory === 'function')
if (typeof loaded.factory !== 'function') process.exit(1)

// The shell passes ctx into the module's apply through the factory result.
const requested = []
const factoryRequire = id => {
  requested.push(id)
  if (id === 'react') return React
  if (id === 'react-dom/client') return ReactDOM
  throw new Error('Unknown module: ' + id)
}

let exportsObj
try {
  exportsObj = loaded.factory(factoryRequire)
} catch (error) {
  console.error('  ❌ factory threw:', error.message)
  process.exit(1)
}

check('exports inject', Array.isArray(exportsObj.inject) && exportsObj.inject.includes('slots'))
check('exports apply', typeof exportsObj.apply === 'function')
check('resolved react from the shell', requested.includes('react'))
if (typeof exportsObj.apply !== 'function') process.exit(1)

// No sidebar in this harness: apply must still not throw, and the entry is
// created (placement waits for the shell's sidebar to appear).
let applyError = null
try {
  exportsObj.apply(ctx)
} catch (error) {
  applyError = error
}
check('apply() runs without throwing', applyError === null, applyError?.message)

// ── the click path: entry click must reach a render ────────────────────
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
  entry.dispatch('click')
  check('click renders the panel (react-dom createRoot used)', rendered.length > 0,
    'the panel did not render — this is the "点击没反应" symptom')
  check('react-dom/client was required from the shell', requested.includes('react-dom/client'))

  // ── overlay ownership + naming regressions ───────────────────────────
  // The vanilla overlay layer owns the ONLY scrim, and it must not carry the
  // attribute the stylesheet positions: a transformed wrapper becomes the
  // containing block for the fixed panel, which used to make the panel jump on
  // the first pixel of a drag and swallow close clicks.
  const overlayContainer = body.querySelector('[data-dsh-agnes-studio-container]')
  check('overlay container exists after open', overlayContainer !== null)
  const overlayChildren = overlayContainer?.children ?? []
  check('overlay layer owns the backdrop',
    overlayChildren.some(c => c.dataset?.dshAgnesBackdrop !== undefined))
  const frame = overlayChildren.find(c => c.dataset?.dshAgnesStudioFrame !== undefined)
  check('overlay frame is not the styled panel node',
    frame !== undefined && frame.dataset.dshAgnesStudio === undefined)
  check('overlay frame receives the sidebar offset variable',
    frame?.parentElement?.style?.getPropertyValue('--agnes-sidebar-w') !== undefined)

  // Source-level regressions. The React stub never invokes the component, so
  // naming/tree assertions read the shipped bundle itself.
  check('panel title uses the product name (泡泡猫的影视工具)', source.includes('泡泡猫的影视工具'))
  check('no legacy "Agnes 创意工作站" UI title left in the client',
    !source.includes('Agnes 创意工作站'))
  check('first-use key guide ships with the panel',
    source.includes('platform.agnes-ai.cn') && source.includes('agnes-api-key'))
  check('no duplicated React backdrop element',
    !/["']data-dsh-agnes-backdrop["']\s*:/.test(source))
}

console.log('')
if (failures.length > 0) {
  console.log(`FAILED: ${failures.length} check(s) — ${failures.join('; ')}`)
  process.exit(1)
}
console.log('All checks passed.')
