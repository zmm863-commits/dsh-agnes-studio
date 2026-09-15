import { defineConfig } from 'tsdown'

export default defineConfig([
  {
    entry: { index: 'src/index.ts' },
    outDir: 'lib',
    format: 'esm',
    platform: 'node',
    dts: true,
    clean: false,
    outExtensions: () => ({ js: '.js' }),
  },
  {
    entry: { client: 'src/client/index.ts' },
    outDir: 'lib',
    format: 'esm',
    platform: 'browser',
    dts: true,
    clean: false,
    outExtensions: () => ({ js: '.js' }),
    // DSH requires ONE client.js file: no code splitting, everything inlined.
    // build.mjs then wraps it into window.__ModuleLoader__.load(...).
    // A dynamic import() would break: its relative path resolves against the
    // PAGE url, not this bundle, so the chunk 404s and clicks do nothing.
    noCodeSplit: true,
    // Shell-provided modules stay as loader `require()` calls.
    external: ['react', 'react-dom/client', '@deepseek-ai/dsh-client-runtime/client'],
  },
])
