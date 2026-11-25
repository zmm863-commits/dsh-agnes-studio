#!/usr/bin/env node
/**
 * 宿主自检工具：不重启 DSH，直接把插件宿主半挂到一个临时 HTTP 端口上跑接口。
 *
 * 用途：改完宿主路由后先在这里过一遍真实请求（会真的调模型/ffmpeg），
 * 确认没问题再重启 DSH 让面板生效。
 *
 * 用法：
 *   node scripts/host-harness.mjs            # 监听 127.0.0.1:3099
 *   HARNESS_PORT=3101 node scripts/host-harness.mjs
 *
 * 说明：
 * - 只实现插件真正用到的四个 ctx 成员（webServer / systemPrompt / credentials / effect）；
 * - 会把 $DSH_HOME/.env 灌进 process.env，密钥解析与真实运行时一致；
 * - 它写的是**同一份**插件数据目录，测试产生的密钥/自定义模型记得清掉。
 */
import { createServer } from 'node:http'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'

/** 从 .env 载入环境变量（与 DSH 启动时的行为一致）。 */
function loadDotEnv(path) {
  try {
    for (const line of readFileSync(path, 'utf8').split('\n')) {
      const m = /^([A-Z0-9_]+)=(.*)$/.exec(line.trim())
      if (m !== null && process.env[m[1]] === undefined) process.env[m[1]] = m[2].trim()
    }
  } catch { /* 没有 .env 就跳过 */ }
}

const DSH_HOME = process.env.DSH_HOME || '/dsh'
loadDotEnv(`${DSH_HOME}/.env`)

const PORT = Number(process.env.HARNESS_PORT || 3099)
const require = createRequire(import.meta.url)
const pluginPath = process.env.PLUGIN_PATH
  || `${DSH_HOME}/profiles/web/node_modules/dsh-agnes-studio/lib/index.js`
const plugin = await import(pluginPath)

const routes = []
const ctx = {
  effect: (fn) => {
    const dispose = fn()
    return () => { if (typeof dispose === 'function') dispose() }
  },
  credentials: {
    resolve: async () => undefined,
    describe: async () => ({ configured: false }),
  },
  systemPrompt: {
    section: () => () => {},
    context: () => () => {},
    tools: () => () => {},
    variable: () => () => {},
  },
  webServer: {
    getOrigin: () => `http://127.0.0.1:${PORT}`,
    register: (route) => {
      routes.push(route)
      return () => {}
    },
    tapIndex: () => () => {},
    applyIndexTaps: (html) => html,
    collectIndexInjections: () => [],
  },
  logger: console,
}

plugin.apply(ctx)
console.log(`[harness] ${routes.length} 组路由已挂载 · node ${process.versions.node}`)

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', `http://127.0.0.1:${PORT}`)
  for (const route of routes) {
    const matches = typeof route.path === 'string'
      ? (url.pathname === route.path || url.pathname.startsWith(route.path))
      : (route.path instanceof RegExp && route.path.test(url.pathname))
    if (!matches) continue
    if (route.method !== undefined && route.method !== req.method) continue
    try {
      await route.handler(req, res)
    } catch (error) {
      if (!res.headersSent) res.writeHead(500, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: String(error) }))
    }
    return
  }
  res.writeHead(404, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({ error: 'no route', path: url.pathname }))
})

server.listen(PORT, '127.0.0.1', () => {
  console.log(`[harness] listening on http://127.0.0.1:${PORT}`)
})
