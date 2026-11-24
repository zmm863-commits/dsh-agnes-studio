/**
 * 微动效层（第 21 层）：dock 的悬停放大与滚轮逐格滑动。
 *
 * 两个目标：
 *   1. 鼠标滑过 dock 项时**放大并轻微上浮**，让人确认"这个是可按的"；
 *      放大只动画 `transform`（合成层，不触发重排），所以列表不会抖。
 *   2. 滚轮不再是连续滚动，而是「一格一格」把后面的图标带出来 ——
 *      配合 scroll-snap 与 JS 里的步进逻辑，一次滚轮 = 一格。
 *
 * 尊重 prefers-reduced-motion：系统开了减少动效，就只保留位移不做缩放动画。
 */
export const MOTION_DOCK_CSS = `
/* ── 悬停放大 ─────────────────────────────────────────────────────── */
[data-dsh-agnes-studio] .agnes-rail-item {
  transform-origin: 50% 78%;
  transition:
    transform 180ms cubic-bezier(0.22, 0.61, 0.36, 1),
    background 150ms ease,
    box-shadow 180ms ease,
    color 150ms ease;
  will-change: transform;
}
[data-dsh-agnes-studio] .agnes-rail-item:hover {
  transform: translateY(-3px) scale(1.10);
  z-index: 2;
}
[data-dsh-agnes-studio] .agnes-rail-item:active {
  transform: translateY(-1px) scale(1.02);
}
[data-dsh-agnes-studio] .agnes-rail-item.active {
  transform: translateY(-2px) scale(1.04);
}

/* 图标跟着放大一点点，标签别跟着抖 */
[data-dsh-agnes-studio] .agnes-rail-icon {
  transition: transform 180ms cubic-bezier(0.22, 0.61, 0.36, 1), background 150ms ease;
}
[data-dsh-agnes-studio] .agnes-rail-item:hover .agnes-rail-icon {
  transform: scale(1.08);
}

/* ── dock 视窗：只露 5 个，其余靠滑动 ───────────────────────────── */
/* 6 × 58px + 5 × 2px 间距 + 左右内边距 = 约 380px，正好剪出"还有更多"的暗示 */
[data-dsh-agnes-studio] .agnes-rail {
  position: relative;
  /* 关键：溢出时不能用 center —— 会把开头的几项推到负坐标，scrollLeft 夹在 0
     之后那些项就永远看不见（dock 一开屏就"从中间开始"的元凶）。 */
  justify-content: flex-start;
  width: 380px;
  max-width: min(380px, calc(100% - 24px));
}

/* 尾部主操作紧跟在 dock 右侧，永远可见（不参与滚动） */
[data-dsh-agnes-studio] .agnes-dock-wrap {
  gap: 10px;
}
[data-dsh-agnes-studio] .agnes-dock-wrap > .agnes-dock-primary {
  margin-left: 0;
  padding-left: 0;
  border-left: none;
}

/* ── 逐格滚动 ─────────────────────────────────────────────────────── */
/* 不用 scroll-snap：它会和 JS 的逐格滚动抢滚动位置，首屏会莫名跳到中段 */

/* ── 「更多」浮层：逐条淡入 ───────────────────────────────────────── */
@keyframes ag-dock-pop {
  from { opacity: 0; transform: translateY(6px) scale(0.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
[data-dsh-agnes-studio] .agnes-dock-more {
  animation: ag-dock-pop 180ms cubic-bezier(0.22, 0.61, 0.36, 1) both;
}
[data-dsh-agnes-studio] .agnes-dock-more-item {
  animation: ag-dock-pop 200ms cubic-bezier(0.22, 0.61, 0.36, 1) both;
}
[data-dsh-agnes-studio] .agnes-dock-more-item:hover {
  transform: translateY(-1px) scale(1.03);
}

/* ── 减少动效 ─────────────────────────────────────────────────────── */
@media (prefers-reduced-motion: reduce) {
  [data-dsh-agnes-studio] .agnes-rail-item:hover,
  [data-dsh-agnes-studio] .agnes-rail-item:active,
  [data-dsh-agnes-studio] .agnes-rail-item.active {
    transform: none;
  }
  [data-dsh-agnes-studio] .agnes-rail { scroll-behavior: auto; }
  [data-dsh-agnes-studio] .agnes-dock-more,
  [data-dsh-agnes-studio] .agnes-dock-more-item { animation: none; }
}
`
