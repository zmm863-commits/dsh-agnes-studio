/**
 * dsh-agnes-studio styles —— 汇总入口。
 *
 * 【为什么拆】原先是一个 4686 行的单文件模板字符串，是**逐层叠加**长出来的：
 * 同一个选择器（如 .agnes-titlebar）在暗色层、浅色层、渐变层里被重复定义，
 * 靠"后写的赢"生效。想改一个颜色，得先猜是哪一层在起作用 —— 这是界面难改的
 * 原因之一，也是本次重构要暴露出来的问题。
 *
 * 【怎么拆】按**原本的层叠顺序**切成 12 个片段，文件名前缀就是层叠序号。
 * ⚠️ 下方数组的顺序 = CSS 层叠顺序，调整顺序会直接改变视觉结果。
 *
 * 【后续怎么改】重做界面时应当**按组件合并**这些跨层覆盖（例如把 .agnes-titlebar
 * 的三处定义收敛成一处），而不是继续往数组末尾追加第 13 层。
 */
import { TOKENS_CSS } from './styles/01-tokens.ts'
import { SHELL_CSS } from './styles/02-shell.ts'
import { LAYOUT_CSS } from './styles/03-layout.ts'
import { CONTROLS_CSS } from './styles/04-controls.ts'
import { REFINE_V2_CSS } from './styles/05-refine-v2.ts'
import { DARK_CSS } from './styles/06-dark.ts'
import { MODULE_CSS } from './styles/07-module.ts'
import { LIGHT_CSS } from './styles/08-light.ts'
import { CONTRAST_CSS } from './styles/09-contrast.ts'
import { GRADIENTS_CSS } from './styles/10-gradients.ts'
import { MOTION_CSS } from './styles/11-motion.ts'
import { OVERRIDES_CSS } from './styles/12-overrides.ts'

/**
 * 层的顺序即层叠顺序（后写的覆盖先写的），请勿随意调整。
 * 拼接结果与原单文件 CSS 逐字节一致（切分时已断言）。
 */
const CSS = [
  TOKENS_CSS,
  SHELL_CSS,
  LAYOUT_CSS,
  CONTROLS_CSS,
  REFINE_V2_CSS,
  DARK_CSS,
  MODULE_CSS,
  LIGHT_CSS,
  CONTRAST_CSS,
  GRADIENTS_CSS,
  MOTION_CSS,
  OVERRIDES_CSS,
].join('')


const STYLE_ID = 'dsh-agnes-studio/styles.css'

/** Inject the plugin stylesheet once (idempotent). */
export function injectStyles(): void {
  if (typeof document === 'undefined') return
  if (document.querySelector('style[data-plugin-css="' + STYLE_ID + '"]') !== null) return
  const tag = document.createElement('style')
  tag.dataset.plugin = 'dsh-agnes-studio'
  tag.dataset.pluginCss = STYLE_ID
  tag.textContent = CSS
  document.head.appendChild(tag)
}
