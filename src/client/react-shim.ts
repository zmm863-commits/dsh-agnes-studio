/**
 * 客户端 React 引导层 —— 全部 *-panel 共用。
 *
 * 为什么必须存在兜底（历史教训，勿简化）：
 *  - React 由 DSH 的客户端 module loader 提供，此处通过 require('react') 取；
 *  - 这些模块在 client.js **加载期**就会被求值，任何一处抛异常都会让整个
 *    浏览器半下线，而不只是某一个面板失效。所以每个兜底都不能省。
 *
 * 本文件抽取自原先**散落在 7 个文件里的同名副本**。统一取最强兜底：
 *  - `useState` 支持函数式初始化。此前 canvas/anchor/cover/prompt-expert 的副本
 *    写成 `(i) => [i, NOOP]`，React 缺失时传函数初始化器会直接拿到那个函数；
 *  - `shellRequire` 带回退链与注释。
 * React 正常可用时（实际环境）这些兜底根本不参与求值，故行为与改造前一致。
 */

declare const require: ((id: string) => unknown) | undefined

/** Resolve one shell-provided module without ever throwing at load time. */
export function shellRequire(id: string): any {
  try {
    if (typeof require === 'function') {
      const mod = require(id)
      if (mod !== undefined && mod !== null) return mod
    }
  } catch { /* fall through to the global */ }
  return undefined
}

/**
 * React runtime, resolved once. A missing runtime must NOT throw here: this
 * module is evaluated while client.js loads, and a load-time throw would take
 * the whole browser half down instead of just this panel.
 */
export const React: any = shellRequire('react') ?? (globalThis as any).React ?? null

/** No-op stand-ins keep the module loadable; the panel reports the real error. */
export const NOOP = (): void => {}
export const useState: any = React?.useState ?? ((initial: unknown) => [typeof initial === 'function' ? (initial as () => unknown)() : initial, NOOP])
export const useEffect: any = React?.useEffect ?? NOOP
export const useCallback: any = React?.useCallback ?? ((fn: unknown) => fn)
export const useRef: any = React?.useRef ?? ((initial: unknown) => ({ current: initial }))

/** Build a detached element when React is unusable (keeps render paths safe). */
export const createElement: any = React?.createElement ?? (() => null)
