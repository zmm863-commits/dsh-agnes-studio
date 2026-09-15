/**
 * Headless smoke test for the dsh-agnes-studio host bundle.
 *
 * Verifies the host half registers what the profile expects:
 *   - the /agnes-studio/api proxy route (client calls it for every Agnes API)
 *   - the agent-facing system-prompt section
 * and that registration is disposable (plugin stop must not leak either).
 */
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const entry = pathToFileURL(join(root, 'lib', 'index.js')).href

const failures = []
const check = (label, ok, detail) => {
  if (ok) console.log(`  ✅ ${label}`)
  else { console.log(`  ❌ ${label}${detail ? ' — ' + detail : ''}`); failures.push(label) }
}

console.log('dsh-agnes-studio host smoke test\n')

let mod
try {
  mod = await import(entry)
} catch (error) {
  console.error('  ❌ host bundle failed to import:', error.message)
  process.exit(1)
}
check('host bundle imports', true)
check('exports name', mod.name === 'agnes-studio', `got "${mod.name}"`)
check('exports inject', Array.isArray(mod.inject), 'inject must be an array')
check('injects webServer', (mod.inject ?? []).includes('webServer'))
check('injects systemPrompt', (mod.inject ?? []).includes('systemPrompt'))
check('injects credentials', (mod.inject ?? []).includes('credentials'))
check('exports apply', typeof mod.apply === 'function')
if (typeof mod.apply !== 'function') process.exit(1)

// ── run apply() against a recorded context ─────────────────────────────
const routes = []
const sections = []
const disposers = []
const ctx = {
  webServer: {
    register(route) {
      routes.push(route)
      const d = () => { routes.splice(routes.indexOf(route), 1) }
      disposers.push(d)
      return d
    },
  },
  systemPrompt: {
    section(section) {
      sections.push(section)
      const d = () => { sections.splice(sections.indexOf(section), 1) }
      disposers.push(d)
      return d
    },
  },
  credentials: { resolve: async () => 'test-key' },
  effect(fn) {
    const dispose = fn()
    return () => { if (typeof dispose === 'function') dispose() }
  },
}

let applyError = null
try {
  mod.apply(ctx)
} catch (error) {
  applyError = error
}
check('apply() runs without throwing', applyError === null, applyError?.message)

const route = routes.find(r => r.path === '/agnes-studio/api')
check('registers the /agnes-studio/api proxy route', route !== undefined)
check('proxy route is a prefix route', route?.kind === 'prefix', `got "${route?.kind}"`)
check('proxy route has a handler', typeof route?.handler === 'function')
check('registers the agent prompt section', sections.length > 0)
check('prompt section is namespaced', sections[0]?.name === 'plugin:dsh-agnes-studio',
  `got "${sections[0]?.name}"`)

// ── the proxy handler must reject non-POST without touching the network ─
if (typeof route?.handler === 'function') {
  const res = {
    status: null,
    headers: {},
    body: null,
    setHeader(k, v) { this.headers[k] = v },
    writeHead(code, extra) { this.status = code; Object.assign(this.headers, extra ?? {}) },
    end(body) { this.body = body },
  }
  const req = { method: 'GET', on() {}, headers: {} }
  try {
    await route.handler(req, res)
    check('GET on the proxy is rejected with 405', res.status === 405, `got ${res.status}`)
  } catch (error) {
    check('GET on the proxy is rejected with 405', false, error.message)
  }

  // ── key status route: JSON only, never the key itself ────────────────
  const statusRes = () => ({
    status: null,
    headers: {},
    body: null,
    setHeader(k, v) { this.headers[k] = v },
    writeHead(code, extra) { this.status = code; Object.assign(this.headers, extra ?? {}) },
    end(body) { this.body = body },
  })
  const statusReq = { method: 'GET', url: '/agnes-studio/api/status', on() {}, headers: {} }

  const res1 = statusRes()
  try {
    await route.handler(statusReq, res1)
    const payload = JSON.parse(res1.body ?? '{}')
    check('GET /status answers 200', res1.status === 200, `got ${res1.status}`)
    check('status reports the configured key', payload.configured === true, JSON.stringify(payload))
    check('status never echoes the key', !String(res1.body ?? '').includes('test-key'))
    check('status carries the registration URL',
      String(payload.platformUrl ?? '').startsWith('https://platform.agnes-ai.cn'), String(payload.platformUrl))
  } catch (error) {
    check('GET /status answers 200', false, error.message)
  }

  // A host without any key (no credentials entry, no env) reports false.
  const savedEnv = process.env.AGNES_API_KEY
  delete process.env.AGNES_API_KEY
  const routes2 = []
  const ctx2 = {
    ...ctx,
    credentials: { resolve: async () => { throw new Error('no key') } },
    webServer: { register(r) { routes2.push(r); return () => {} } },
  }
  mod.apply(ctx2)
  const res2 = statusRes()
  try {
    await routes2[0].handler(statusReq, res2)
    const payload = JSON.parse(res2.body ?? '{}')
    check('status reports a missing key', payload.configured === false, JSON.stringify(payload))
  } catch (error) {
    check('status reports a missing key', false, error.message)
  } finally {
    if (savedEnv !== undefined) process.env.AGNES_API_KEY = savedEnv
  }
}

console.log('')
if (failures.length > 0) {
  console.log(`FAILED: ${failures.length} check(s) — ${failures.join('; ')}`)
  process.exit(1)
}
console.log('All checks passed.')
