/**
 * 线性图标集（16×16，`stroke: currentColor`）。
 *
 * 为什么不用 emoji：
 *   1. 缺字即豆腐块 —— 容器 / 无 emoji 字体的 Linux 桌面、部分 Windows 精简版上
 *      直接渲染成 □，而导航条没有文字就完全不可读；
 *   2. emoji 自带颜色，会打破「整块只有一处高饱和」的层次规则；
 *   3. 同一屏里 🎬 被生视频 / 背景视频 / 视频解析三处复用，认不出来。
 *
 * 因此导航与标题栏统一走内联 SVG：跟着 currentColor 走主题，
 * 在任何字体环境下渲染结果一致。
 */

/** 图标名 → SVG 片段（不含外层 <svg>）。 */
const PATHS: Record<string, string> = {
  // 生图：画框 + 太阳 + 山
  image: '<rect x="2" y="3" width="12" height="10" rx="2.4"/><circle cx="5.8" cy="6.6" r="1.1"/><path d="M3 11.4l3-3 2.2 2.2 1.8-1.8 3 3"/>',
  // 生视频：画框 + 播放三角
  video: '<rect x="2" y="3.5" width="12" height="9" rx="2.4"/><path d="M6.6 6.4l3.4 1.6-3.4 1.6z"/>',
  // 创作台：笔
  ohstory: '<path d="M3 13l.7-2.8 6.6-6.6a1.6 1.6 0 012.3 2.3L6 12.5 3 13z"/><path d="M9.6 4.4l2 2"/>',
  // 短剧：场记板
  storyboard: '<rect x="2.2" y="5.4" width="11.6" height="7.4" rx="1.8"/><path d="M2.2 8.2h11.6"/><path d="M3.4 5.4l1.4-2.2M7 5.4l1.4-2.2M10.6 5.4l1.4-2.2"/>',
  // 背景视频：图层
  bgvideo: '<path d="M8 2.4l5.6 3-5.6 3-5.6-3z"/><path d="M2.4 8.4L8 11.4l5.6-3"/><path d="M2.4 11.2L8 14.2l5.6-3"/>',
  // MTV：音符
  mv: '<path d="M6.4 11.6V3.6l5.2-1v7.6"/><circle cx="4.9" cy="11.9" r="1.6"/><circle cx="10.1" cy="10.5" r="1.6"/>',
  // 小说工具：书
  novel: '<path d="M8 4.2C6.6 3.2 4.9 3 3 3.4v8.2c1.9-.4 3.6-.2 5 .8 1.4-1 3.1-1.2 5-.8V3.4c-1.9-.4-3.6-.2-5 .8z"/><path d="M8 4.2v8.2"/>',
  // 多能宝箱：箱子
  toolbox: '<rect x="2.2" y="6" width="11.6" height="7" rx="1.8"/><path d="M6 6V4.6a2 2 0 012-2h0a2 2 0 012 2V6"/><path d="M2.2 9.4h11.6"/>',
  // 视频解析：放大镜 + 播放
  videoparse: '<circle cx="7.2" cy="7.2" r="3.8"/><path d="M10.2 10.2L14 14"/><path d="M6.3 5.8l2.2 1.4-2.2 1.4z"/>',
  // 公众号：气泡
  wechat: '<path d="M13.6 8.6c0 2.2-2.4 3.9-5.4 3.9-.7 0-1.4-.1-2-.3L3.4 13l.8-2A3.7 3.7 0 012.6 8.6C2.6 6.4 5 4.7 8 4.7s5.6 1.7 5.6 3.9z"/>',
  // 画布：节点连线
  canvas: '<rect x="2" y="2.4" width="5" height="4.2" rx="1.2"/><rect x="9" y="9.4" width="5" height="4.2" rx="1.2"/><path d="M7 4.5h3.6a1.4 1.4 0 011.4 1.4v3.5"/><path d="M4.5 6.6v4.2a1.4 1.4 0 001.4 1.4H9"/>',
  // 口播：麦克风
  anchor: '<rect x="6.2" y="2.4" width="3.6" height="6.6" rx="1.8"/><path d="M4 8a4 4 0 008 0"/><path d="M8 12v1.6"/>',
  // 封面：图片 + 折角
  cover: '<path d="M3.4 2.6h5.2l4 4v6.8H3.4z"/><path d="M8.6 2.6v4h4"/>',
  // 提示词专家：星芒
  expert: '<path d="M8 2.2l1.3 3.5L12.8 7l-3.5 1.3L8 11.8 6.7 8.3 3.2 7l3.5-1.3z"/><path d="M12.2 11.4l.6 1.6 1.6.6-1.6.6-.6 1.6-.6-1.6-1.6-.6 1.6-.6z"/>',
  // 转提示词：循环箭头
  vpt: '<path d="M3.2 6.4A4.8 4.8 0 018 2.6c1.6 0 3 .8 3.9 2"/><path d="M12.8 9.6A4.8 4.8 0 018 13.4c-1.6 0-3-.8-3.9-2"/><path d="M11.9 2.4v2.4H9.5"/><path d="M4.1 13.6v-2.4h2.4"/>',
  // 设置：滑杆
  settings: '<path d="M2.6 5.2h10.8M2.6 10.8h10.8"/><circle cx="6" cy="5.2" r="1.6"/><circle cx="10" cy="10.8" r="1.6"/>',
}

/** 兜底图标（未知名字时用，避免空白按钮）。 */
const FALLBACK = '<circle cx="8" cy="8" r="5.2"/>'

/**
 * 生成一颗内联 SVG 图标的完整标记。
 *
 * @param name - 图标名；未知名字回落到一个中性圆点。
 * @param size - 边长（px），默认 16。
 * @returns SVG 标记字符串，供 dangerouslySetInnerHTML 使用。
 */
export function iconSvg(name: string, size = 16): string {
  const body = PATHS[name] ?? FALLBACK
  return `<svg viewBox="0 0 16 16" width="${size}" height="${size}" fill="none" `
    + 'stroke="currentColor" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round" '
    + `aria-hidden="true">${body}</svg>`
}

/** 已知图标名（供测试与导航校验）。 */
export const ICON_NAMES = Object.keys(PATHS)
