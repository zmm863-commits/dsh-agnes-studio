/**
 * 面板「框架件」：标题栏 / 首用 Key 引导 / 左侧导航 rail。
 *
 * 由 panel.tsx 主渲染内联拆出。三者都是纯展示 + 回调，不持有 StudioPanel 的
 * 状态 —— 主题持久化、Key 检测等副作用仍由 panel 通过回调注入。
 *
 * MODULES 也随之搬到这里：它原本被标题栏和 rail 各读一次，放本文件后可保证
 * 「导航顺序」只有一个来源（此前两处依赖同一个数组，改一处容易忘另一处）。
 */
import { createElement, useEffect, useRef, useState } from './react-shim.ts'
import { iconSvg } from './icons.ts'
import { AGNES_DOCS_URL, AGNES_PLATFORM_URL, PANEL_SIZE_LABEL, PRODUCT_NAME, type PanelSize } from './constants.ts'
import type { KeyStatus } from './studio.ts'

/** 左侧导航的模块定义（数组顺序即界面顺序）。 */
/** 一个导航项。`icon` 是 icons.ts 里的图标名（不是 emoji）。 */
export interface NavModule {
  id: string
  icon: string
  name: string
}

/**
 * 左侧导航的分组（数组顺序即界面顺序）。
 *
 * 7 个模块原先平铺在一个竖条里 —— 要找「生视频」得先把 7 个图标扫一遍。现在按
 * 用途分三组，用组标题与间距建立层级：
 *   生成 —— 一步出活的；创作 —— 需要分步走的；配置 —— 低频的。
 */
export const MODULE_GROUPS: Array<{ id: string; label: string; items: NavModule[] }> = [
  {
    id: 'generate',
    label: '生成',
    items: [
      { id: 'image', icon: 'image', name: '生图' },
      { id: 'video', icon: 'video', name: '生视频' },
    ],
  },
  {
    id: 'create',
    label: '创作',
    items: [
      { id: 'ohstory', icon: 'ohstory', name: '创作台' },
      { id: 'storyboard', icon: 'storyboard', name: '短剧' },
      { id: 'bgvideo', icon: 'bgvideo', name: '背景视频' },
      { id: 'mv', icon: 'mv', name: 'MTV' },
      { id: 'novel-split', icon: 'novel', name: '小说工具' },
      { id: 'toolbox', icon: 'toolbox', name: '多能宝箱' },
      { id: 'videoparse', icon: 'videoparse', name: '视频解析' },
      { id: 'wechat', icon: 'wechat', name: '公众号' },
      { id: 'canvas', icon: 'canvas', name: '画布' },
      { id: 'anchor', icon: 'anchor', name: '口播' },
      { id: 'cover', icon: 'cover', name: '封面' },
      { id: 'expert', icon: 'expert', name: '提示词' },
      { id: 'vpt', icon: 'vpt', name: '转提示词' },
    ],
  },
]

/** 底部「配置」组（界面上与上面几组用 spacer 隔开，故不放进 MODULE_GROUPS）。 */
export const CONFIG_GROUP: { id: string; label: string; items: NavModule[] } = {
  id: 'config',
  label: '配置',
  items: [
    { id: 'settings', icon: 'settings', name: '设置' },
  ],
}

/** 全部模块拍平（标题栏按 tab 查模块名用）。 */
export const MODULES: NavModule[] = [
  ...MODULE_GROUPS.flatMap(g => g.items),
  ...CONFIG_GROUP.items,
]

/** 标题栏。 */
export interface TitlebarProps {
  /** 当前页签 id，用于显示模块名。 */
  tab: string
  /** 固定为 dark（保留字段是为了不改动调用方签名）。 */
  onToggleTheme: () => void
  /** 当前面板尺寸档位。 */
  panelSize: PanelSize
  /** 循环切换到下一档。 */
  onCycleSize: () => void
  onClose: () => void
  onDragStart: (e: MouseEvent) => void
}

/**
 * 标题栏：图标 + 产品名 + 当前模块名 + 主题切换 + 关闭，整条可拖拽。
 * @param props - 数据与回调。
 */
export function PanelTitlebar(props: TitlebarProps): unknown {
  const { tab, panelSize, onCycleSize, onClose, onDragStart } = props
  const moduleName = MODULES.find(m => m.id === tab)?.name ?? (tab === 'settings' ? '设置' : '')

  return createElement('div', {
    className: 'agnes-titlebar',
    onMouseDown: onDragStart,
  },
    createElement('span', {
      className: 'agnes-titlebar-icon',
      dangerouslySetInnerHTML: { __html: iconSvg('video', 16) },
    }),
    createElement('span', { className: 'agnes-titlebar-text' }, PRODUCT_NAME),
    createElement('span', { className: 'agnes-titlebar-module' }, moduleName),
    createElement('div', { className: 'agnes-titlebar-spacer' }),
    createElement('button', {
      className: 'agnes-size-toggle',
      onClick: onCycleSize,
      title: `面板尺寸：${PANEL_SIZE_LABEL[panelSize]}（点击切换紧凑 / 标准 / 全屏）`,
    }, PANEL_SIZE_LABEL[panelSize]),
    // 主题切换按钮已移除：本插件只有深色一套皮肤（浅色主题的样式与深色玻璃
    // 面板冲突太多，维护两套成本高于收益）。
    createElement('span', { className: 'agnes-badge agnes-badge-free' }, '生图/视频免费'),
    createElement('button', {
      className: 'agnes-titlebar-btn',
      onClick: onClose,
      title: '关闭',
      'aria-label': '关闭',
    }, '✕'),
  )
}

/** 首用 API Key 引导。 */
export interface KeyGuideProps {
  checkingKey: boolean
  keyStatus: KeyStatus
  onClose: () => void
  onRecheck: () => void
}

/**
 * 首次使用的 Key 获取引导（三步 + 去注册/文档 + 重新检测）。
 * @param props - 数据与回调。
 */
export function KeyGuide(props: KeyGuideProps): unknown {
  const { checkingKey, keyStatus, onClose, onRecheck } = props

  return createElement('div', { className: 'agnes-keyguide' },
    createElement('div', { className: 'agnes-keyguide-head' },
      createElement('span', { className: 'agnes-keyguide-title' }, '首次使用：需要一个 Agnes API Key'),
      createElement('button', {
        className: 'agnes-keyguide-close',
        onClick: onClose,
        title: '收起',
      }, '收起'),
    ),
    createElement('div', { className: 'agnes-keyguide-steps' },
      createElement('div', { className: 'agnes-keyguide-step' },
        createElement('span', { className: 'agnes-keyguide-num' }, '1'),
        createElement('span', null, '注册 / 登录 Agnes AI 平台（免费注册）'),
      ),
      createElement('div', { className: 'agnes-keyguide-step' },
        createElement('span', { className: 'agnes-keyguide-num' }, '2'),
        createElement('span', null, '在控制台「API Keys」里创建密钥，复制 sk- 开头的那一串'),
      ),
      createElement('div', { className: 'agnes-keyguide-step' },
        createElement('span', { className: 'agnes-keyguide-num' }, '3'),
        createElement('span', null,
          '把它填到本机（任选一种）：DSH 设置 → 模型 → 凭据，新增 ',
          createElement('code', null, 'agnes-api-key'),
          '；或在本机 ',
          createElement('code', null, '/dsh/.env'),
          ' 写一行 ',
          createElement('code', null, 'AGNES_API_KEY=sk-...'),
        ),
      ),
    ),
    createElement('div', { className: 'agnes-keyguide-actions' },
      createElement('a', {
        className: 'agnes-btn agnes-btn-sm agnes-btn-primary',
        href: AGNES_PLATFORM_URL,
        target: '_blank',
        rel: 'noopener noreferrer',
      }, '去注册 / 登录'),
      createElement('a', {
        className: 'agnes-btn agnes-btn-sm agnes-btn-secondary',
        href: AGNES_DOCS_URL,
        target: '_blank',
        rel: 'noopener noreferrer',
      }, '官方文档'),
      createElement('button', {
        className: 'agnes-btn agnes-btn-sm agnes-btn-ghost',
        disabled: checkingKey,
        onClick: onRecheck,
      }, checkingKey ? '检测中…' : '重新检测'),
      keyStatus === 'ready'
        ? createElement('span', { className: 'agnes-keyguide-ok' }, 'Key 已配置')
        : null,
    ),
    createElement('div', { className: 'agnes-keyguide-note' },
      'Key 只保存在本机、只由后端进程用于调用 API，网页里不会出现；免费额度以平台规则为准。',
    ),
  )
}

/** 左侧图标栏：全部模块一次列出。 */
export interface NavRailProps {
  /** 当前页签 id。 */
  tab: string
  onSelect: (id: string) => void
  /** 保留位：把主操作注入到栏底（当前由工作区自己承载）。 */
  trailing?: unknown
}

/**
 * dock 常驻的入口。
 *
 * 为什么不是全部 16 个：dock 是"动线终点"，塞满之后每一项都变得难瞄；
 * 稿子也是 6 个左右。其余模块收进「更多」浮层，仍然一次点击可达。
 */
const DOCK_PRIMARY = MODULES.map(m => m.id)

/** 「更多」浮层里的图标。 */
const MORE_ICON =
  '<svg viewBox="0 0 16 16" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.35" '
  + 'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'
  + '<circle cx="3.2" cy="3.2" r="1.1"/><circle cx="8" cy="3.2" r="1.1"/><circle cx="12.8" cy="3.2" r="1.1"/>'
  + '<circle cx="3.2" cy="8" r="1.1"/><circle cx="8" cy="8" r="1.1"/><circle cx="12.8" cy="8" r="1.1"/>'
  + '<circle cx="3.2" cy="12.8" r="1.1"/><circle cx="8" cy="12.8" r="1.1"/><circle cx="12.8" cy="12.8" r="1.1"/>'
  + '</svg>'

/**
 * 底部 dock：常驻主入口 + 「更多」浮层 + 尾部主操作。
 *
 * 交互约定：
 *  - dock 可以**横向拖动/滚动**（鼠标拖、触控板横向滑、滚轮），窄窗口不会把按钮压扁；
 *  - 拖动超过 4px 就吞掉随后的 click，避免"滑一下顺手切了页签"；
 *  - 「更多」是原地浮层，不新开面板，点外部/按 Esc 关闭。
 *
 * @param props - 数据与回调。
 */
export function NavRail(props: NavRailProps): unknown {
  const { tab, onSelect, trailing } = props
  const railRef = useRef<HTMLElement | null>(null)
  const drag = useRef({ active: false, startX: 0, scrollLeft: 0, moved: 0 })

  const primary = DOCK_PRIMARY
    .map(id => MODULES.find(m => m.id === id))
    .filter((m): m is NavModule => m !== undefined)

  const item = (m: NavModule): unknown => createElement('button', {
    key: m.id,
    className: `agnes-rail-item${tab === m.id ? ' active' : ''}`,
    'data-tab': m.id,
    onClick: () => {
      if (drag.current.moved > 4) { drag.current.moved = 0; return }
      onSelect(m.id)
    },
    title: m.name,
  },
    createElement('span', {
      className: 'agnes-rail-icon',
      dangerouslySetInnerHTML: { __html: iconSvg(m.icon, 18) },
    }),
    createElement('span', { className: 'agnes-rail-label' }, m.name),
  )

  // 拖动滚动：鼠标按下即抓取，位移超过阈值就当成滑动而不是点击
  const onPointerDown = (event: MouseEvent | TouchEvent): void => {
    const node = railRef.current
    if (node === null) return
    const point = 'touches' in event ? event.touches[0] : (event as MouseEvent)
    drag.current = { active: true, startX: point.clientX, scrollLeft: node.scrollLeft, moved: 0 }
    node.dataset.dragging = 'true'
  }
  const onPointerMove = (event: MouseEvent | TouchEvent): void => {
    const node = railRef.current
    if (node === null || !drag.current.active) return
    const point = 'touches' in event ? event.touches[0] : (event as MouseEvent)
    const dx = point.clientX - drag.current.startX
    drag.current.moved = Math.max(drag.current.moved, Math.abs(dx))
    if (drag.current.moved > 4) node.scrollLeft = drag.current.scrollLeft - dx
  }
  const onPointerUp = (): void => {
    const node = railRef.current
    drag.current.active = false
    if (node !== null) delete node.dataset.dragging
    // 让 click 先跑完再复位，避免误判为滑动
    setTimeout(() => { drag.current.moved = 0 }, 0)
  }

  // 切换页签后把当前项带回视窗内：滑走之后不能让人不知道自己在哪
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const node = railRef.current
      if (node === null || node.scrollWidth <= node.clientWidth + 1) return
      const active = node.querySelector<HTMLElement>('.agnes-rail-item.active')
      if (active === null) return
      // offsetLeft 是布局值：面板入场动画的 transform 不会让它失真
      const itemLeft = active.offsetLeft
      const viewLeft = node.scrollLeft
      const inside = itemLeft >= viewLeft - 1 && itemLeft + active.offsetWidth <= viewLeft + node.clientWidth + 1
      if (inside) return
      node.scrollTo({
        left: Math.max(0, itemLeft - (node.clientWidth - active.offsetWidth) / 2),
        behavior: 'smooth',
      })
    })
    return () => cancelAnimationFrame(frame)
  }, [tab])

  // 滚轮：一次滚轮 = 一格，把后面的图标"依次"带出来。
  // 必须用原生监听（React 的 onWheel 在部分环境是 passive，preventDefault 无效）。
  useEffect(() => {
    const node = railRef.current
    if (node === null) return undefined
    let lockedUntil = 0
    const onWheel = (event: WheelEvent): void => {
      // 触摸板的横向手势交给浏览器原生处理
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return
      if (node.scrollWidth <= node.clientWidth + 1) return
      event.preventDefault()
      const now = Date.now()
      // 220ms 闸门：一次滚轮手感的"一格"内不重复推进
      if (now < lockedUntil) return
      lockedUntil = now + 220
      const item = node.querySelector<HTMLElement>('.agnes-rail-item')
      const step = (item?.offsetWidth ?? 58) + 2
      const max = node.scrollWidth - node.clientWidth
      const next = node.scrollLeft + (event.deltaY > 0 ? step : -step)
      node.scrollTo({ left: Math.min(max, Math.max(0, next)), behavior: 'smooth' })
    }
    node.addEventListener('wheel', onWheel, { passive: false })
    return () => { node.removeEventListener('wheel', onWheel) }
  }, [])


  return createElement('div', { className: 'agnes-dock-wrap' },
    createElement('nav', {
      className: 'agnes-rail',
      ref: railRef,
      onMouseDown: onPointerDown,
      onMouseMove: onPointerMove,
      onMouseUp: onPointerUp,
      onMouseLeave: onPointerUp,
      onTouchStart: onPointerDown,
      onTouchMove: onPointerMove,
      onTouchEnd: onPointerUp,
    },
      ...primary.map(item),
    ),
    trailing ?? null,
  )
}

