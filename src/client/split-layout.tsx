/**
 * 统一的内页骨架 —— 左边展示，右边参数。
 *
 * 【为什么要这个】此前 16 个模块各写各的：生图/生视频是"展示区 + 参数区"，
 * 小说工具、公众号、多能宝箱、视频解析却是一整列从上往下排。同一件产品里换
 * 一个页签就换一套排布，用户每换一次都要重新找按钮。
 *
 * 【约定】所有模块统一：
 *   · 左列 = 展示/结果（素材、列表、解析结果、成片）
 *   · 右列 = 参数/操作（表单、按钮、进度）
 *   · 右列宽度固定 320px，可收起；窄屏自动叠成上下两段
 *
 * 用法：
 *   createElement(StudioSplit, { title, desc, params: form, children: display })
 */
import { createElement, useState } from './react-shim.ts'
import { iconSvg } from './icons.ts'

/** 属性。 */
export interface StudioSplitProps {
  /** 页面标题。 */
  title?: string
  /** 副标题。 */
  desc?: string
  /** 右列（参数/操作）。 */
  params?: unknown
  /** 右列标题，默认「参数」。 */
  paramsTitle?: string
  /** 左列（展示/结果）。 */
  children?: unknown
  /** 左列顶部可选的工具栏。 */
  toolbar?: unknown
  /** 默认是否展开参数列。 */
  defaultParamsOpen?: boolean
  /** 页签等顶部内容（跨两列）。 */
  header?: unknown
}

/**
 * 两列内页骨架。
 *
 * 收起参数列时左列自动占满；状态记在组件内（每个页面各自独立）。
 */
export function StudioSplit(props: StudioSplitProps): unknown {
  const [open, setOpen] = useState(props.defaultParamsOpen !== false)

  return createElement('div', { className: 'agnes-split' },
    (props.title !== undefined || props.desc !== undefined || props.header !== undefined)
      && createElement('div', { className: 'agnes-split-head' },
        props.title !== undefined && createElement('h3', { className: 'agnes-split-title' }, props.title),
        props.desc !== undefined && createElement('p', { className: 'agnes-split-desc' }, props.desc),
        props.header,
      ),

    createElement('div', { className: 'agnes-split-body' },
      // ── 左：展示 ──
      createElement('div', { className: 'agnes-split-display' },
        props.toolbar !== undefined && createElement('div', { className: 'agnes-split-toolbar' }, props.toolbar),
        createElement('div', { className: 'agnes-split-scroll' }, props.children),
      ),

      // ── 右：参数 ──
      props.params !== undefined && createElement('aside', {
        className: `agnes-split-params ${open ? '' : 'is-collapsed'}`,
      },
        createElement('div', { className: 'agnes-split-params-head' },
          createElement('span', null, props.paramsTitle ?? '参数'),
          createElement('button', {
            className: 'agnes-split-toggle',
            title: open ? '收起参数' : '展开参数',
            onClick: () => setOpen(!open),
            dangerouslySetInnerHTML: { __html: iconSvg(open ? 'panel-right-close' : 'panel-right-open', 14) },
          }),
        ),
        open && createElement('div', { className: 'agnes-split-params-body' }, props.params),
      ),
    ),
  )
}
