/**
 * 面板「框架件」：标题栏 / 首用 Key 引导 / 左侧导航 rail。
 *
 * 由 panel.tsx 主渲染内联拆出。三者都是纯展示 + 回调，不持有 StudioPanel 的
 * 状态 —— 主题持久化、Key 检测等副作用仍由 panel 通过回调注入。
 *
 * MODULES 也随之搬到这里：它原本被标题栏和 rail 各读一次，放本文件后可保证
 * 「导航顺序」只有一个来源（此前两处依赖同一个数组，改一处容易忘另一处）。
 */
import { createElement } from './react-shim.ts'
import { AGNES_DOCS_URL, AGNES_PLATFORM_URL, PANEL_SIZE_LABEL, PRODUCT_NAME, type PanelSize } from './constants.ts'
import type { KeyStatus } from './studio.ts'

/** 左侧导航的模块定义（数组顺序即界面顺序）。 */
/** 一个导航项。 */
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
      { id: 'image', icon: '🎨', name: '生图' },
      { id: 'video', icon: '🎬', name: '生视频' },
    ],
  },
  {
    id: 'create',
    label: '创作',
    items: [
      { id: 'ohstory', icon: '✍️', name: '创作台' },
      { id: 'storyboard', icon: '📖', name: '短剧' },
      { id: 'bgvideo', icon: '🎬', name: '背景视频' },
      { id: 'mv', icon: '🎵', name: 'MTV' },
      { id: 'novel-split', icon: '📖', name: '小说工具' },
      { id: 'toolbox', icon: '🧰', name: '多能宝箱' },
      { id: 'videoparse', icon: '🎬', name: '视频解析' },
      { id: 'wechat', icon: '📱', name: '公众号' },
      { id: 'canvas', icon: '🕸', name: '画布' },
      { id: 'anchor', icon: '🎙', name: '口播' },
      { id: 'cover', icon: '📕', name: '封面' },
      { id: 'expert', icon: '✨', name: '提示词' },
    ],
  },
]

/** 底部「配置」组（界面上与上面几组用 spacer 隔开，故不放进 MODULE_GROUPS）。 */
export const CONFIG_GROUP: { id: string; label: string; items: NavModule[] } = {
  id: 'config',
  label: '配置',
  items: [
    { id: 'settings', icon: '⚙', name: '设置' },
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
  theme: 'light' | 'dark'
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
  const { tab, theme, onToggleTheme, panelSize, onCycleSize, onClose, onDragStart } = props
  const moduleName = MODULES.find(m => m.id === tab)?.name ?? (tab === 'settings' ? '设置' : '')

  return createElement('div', {
    className: 'agnes-titlebar',
    onMouseDown: onDragStart,
  },
    createElement('span', { className: 'agnes-titlebar-icon' }, '🎬'),
    createElement('span', { className: 'agnes-titlebar-text' }, PRODUCT_NAME),
    createElement('span', { className: 'agnes-titlebar-module' }, moduleName),
    createElement('div', { className: 'agnes-titlebar-spacer' }),
    createElement('button', {
      className: 'agnes-size-toggle',
      onClick: onCycleSize,
      title: `面板尺寸：${PANEL_SIZE_LABEL[panelSize]}（点击切换紧凑 / 标准 / 全屏）`,
    }, `🪟 ${PANEL_SIZE_LABEL[panelSize]}`),
    createElement('button', {
      className: 'agnes-theme-toggle',
      onClick: onToggleTheme,
      title: theme === 'dark' ? '切换到亮色主题' : '切换到暗色主题',
    }, theme === 'dark' ? '☀️ 亮色' : '🌙 暗色'),
    createElement('span', { className: 'agnes-badge agnes-badge-free' }, '🎉 生图/视频免费'),
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
      createElement('span', { className: 'agnes-keyguide-title' }, '🔑 首次使用：需要一个 Agnes API Key'),
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
      }, '🌐 去注册 / 登录'),
      createElement('a', {
        className: 'agnes-btn agnes-btn-sm agnes-btn-secondary',
        href: AGNES_DOCS_URL,
        target: '_blank',
        rel: 'noopener noreferrer',
      }, '📖 官方文档'),
      createElement('button', {
        className: 'agnes-btn agnes-btn-sm agnes-btn-ghost',
        disabled: checkingKey,
        onClick: onRecheck,
      }, checkingKey ? '⏳ 检测中…' : '🔄 重新检测'),
      keyStatus === 'ready'
        ? createElement('span', { className: 'agnes-keyguide-ok' }, '✅ Key 已配置')
        : null,
    ),
    createElement('div', { className: 'agnes-keyguide-note' },
      'Key 只保存在本机、只由后端进程用于调用 API，网页里不会出现；免费额度以平台规则为准。',
    ),
  )
}

/** 左侧导航 rail。 */
export interface NavRailProps {
  /** 当前页签 id。 */
  tab: string
  onSelect: (id: string) => void
}

/**
 * 左侧垂直导航：模块列表 + 底部设置入口。
 * @param props - 数据与回调。
 */
export function NavRail(props: NavRailProps): unknown {
  const { tab, onSelect } = props

  const item = (m: NavModule): unknown => createElement('button', {
    key: m.id,
    className: `agnes-rail-item${tab === m.id ? ' active' : ''}`,
    'data-tab': m.id,
    onClick: () => onSelect(m.id),
    title: m.name,
  },
    createElement('span', { className: 'agnes-rail-icon' }, m.icon),
    createElement('span', { className: 'agnes-rail-label' }, m.name),
  )

  const group = (id: string, label: string, items: NavModule[]): unknown => createElement('div', {
    key: id,
    className: 'agnes-rail-group',
  },
    createElement('div', { className: 'agnes-rail-group-label' }, label),
    ...items.map(item),
  )

  return createElement('nav', { className: 'agnes-rail' },
    ...MODULE_GROUPS.map(g => group(g.id, g.label, g.items)),
    createElement('div', { className: 'agnes-rail-spacer' }),
    group(CONFIG_GROUP.id, CONFIG_GROUP.label, CONFIG_GROUP.items),
  )
}
