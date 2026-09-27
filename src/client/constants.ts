/**
 * 跨组件共用的常量。
 *
 * 从 panel.tsx 的模块级常量中抽出 —— 设置页签拆分后，它和 panel 都需要这些值，
 * 若各自定义就会漂移（改一处漏一处）。这里作为唯一来源。
 */

/** Product name shown everywhere in the UI. */
export const PRODUCT_NAME = '泡泡猫的影视工具'

/** Where a first-time user signs up and creates an API Key. */
export const AGNES_PLATFORM_URL = 'https://platform.agnes-ai.cn'

/** Public quickstart (account → API key → first request). */
export const AGNES_DOCS_URL = 'https://agnes-ai.cn/zh-Hans/docs/quickstart'

// ─── 面板尺寸档位 ───────────────────────────────────────────────────────────

/** 面板尺寸档位。 */
export type PanelSize = 'compact' | 'standard' | 'full'

/** 点击时循环的顺序。 */
export const PANEL_SIZE_ORDER: readonly PanelSize[] = ['compact', 'standard', 'full']

/** 档位的中文名（按钮上显示）。 */
export const PANEL_SIZE_LABEL: Record<PanelSize, string> = { compact: '紧凑', standard: '标准', full: '全屏' }

/** 记住尺寸选择的 localStorage 键。 */
export const PANEL_SIZE_KEY = 'agnes-panel-size'

/**
 * 读取记住的面板尺寸；非法值或 localStorage 不可用时回落到「标准」。
 * @returns 面板尺寸档位。
 */
export function resolvePanelSize(): PanelSize {
  try {
    const saved = localStorage?.getItem(PANEL_SIZE_KEY)
    if (saved === 'compact' || saved === 'standard' || saved === 'full') return saved
  } catch { /* 无 localStorage 时用默认值 */ }
  return 'standard'
}

/** 记住「参数栏是否展开」的 localStorage 键。 */
export const PARAMS_OPEN_KEY = 'agnes-params-open'

/**
 * 读取记住的参数栏展开状态；默认展开（改造前的行为）。
 * @returns 是否展开。
 */
export function resolveParamsOpen(): boolean {
  try {
    const saved = localStorage?.getItem(PARAMS_OPEN_KEY)
    if (saved === '0') return false
    if (saved === '1') return true
  } catch { /* 无 localStorage 时用默认值 */ }
  return true
}
