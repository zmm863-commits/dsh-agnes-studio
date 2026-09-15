#!/usr/bin/env node
/**
 * dsh-agnes-studio client bundle wrapper.
 *
 * DSH loads plugin client bundles through window.__ModuleLoader__.load({ id,
 * factory }): the browser half must REGISTER a factory, not just export one.
 * tsdown emits a bare ESM module (`export { apply, inject }`), so this step
 * rewrites lib/client.js into the official loader-wrapped form:
 *
 *   window.__ModuleLoader__.load({ id: "dsh-agnes-studio", factory: (require) => {
 *     var module = { exports: {} }; var exports = module.exports;
 *     ... bundle body (export statement stripped) ...
 *     return module.exports;
 *   } });
 *
 * The bundle has zero external imports (pure internal code), so the CJS
 * factory form needs no module mapping — the body runs as-is and the trailing
 * `export { apply, inject }` is replaced by `module.exports = { apply, inject }`.
 *
 * Run after `tsdown` (see package.json "build": "tsdown && node build.mjs").
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(fileURLToPath(new URL('./package.json', import.meta.url)))
const clientPath = join(root, 'lib', 'client.js')
const PLUGIN_ID = 'dsh-agnes-studio'

const src = readFileSync(clientPath, 'utf8')

// The bundle must end with the single export line tsdown emits.
const exportLine = 'export { apply, inject };'
if (!src.includes(exportLine)) {
  console.error('[dsh-agnes-studio] build.mjs: expected "' + exportLine + '" in lib/client.js')
  process.exit(1)
}
if (src.includes('window.__ModuleLoader__.load')) {
  console.log('[dsh-agnes-studio] client.js already wrapped — skipping')
  process.exit(0)
}

const body = src.replace(exportLine, 'module.exports = { apply, inject };')

const wrapped =
  'window.__ModuleLoader__.load({ id: "' + PLUGIN_ID + '", factory: (require) => {\n' +
  '  var module = { exports: {} }; var exports = module.exports;\n' +
  body +
  '\n  return module.exports;\n' +
  '} });\n'

writeFileSync(clientPath, wrapped)
console.log('[dsh-agnes-studio] client.js wrapped for __ModuleLoader__.load ✓')
