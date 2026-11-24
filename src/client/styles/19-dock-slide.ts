/**
 * 底部 dock：精简入口 + 横向滑动 + 「更多」浮层（第 19 层）。
 *
 * 为什么要这一层：
 *   16 个模块一字排开，dock 变成"功能表"，每一项都变小、都难瞄。
 *   现在 dock 常驻 5 个主入口 + 「更多」+ 尾部主操作，
 *   其余模块收进原地浮层 —— 仍然一次点击可达，但视野干净。
 *
 * dock 本身可以横向滑动（鼠标拖 / 触控板横滑 / 滚轮），
 * 窄窗口下不会把按钮压扁，也不会出现可见的滚动条。
 */
export const DOCK_SLIDE_CSS = `
/* 外层：浮层定位的锚点，同时负责 dock 居中 */
[data-dsh-agnes-studio] .agnes-dock-wrap {
  position: relative;
  flex: 0 0 auto;
  display: flex;
  justify-content: center;
  padding: 0;
}

/* dock：可滑动的胶囊，宽度随内容但不超过画布 */
[data-dsh-agnes-studio] .agnes-rail {
  max-width: min(760px, calc(100% - 24px));
  scroll-behavior: smooth;
  overscroll-behavior-x: contain;
  cursor: grab;
  user-select: none;
  -webkit-user-select: none;
}
[data-dsh-agnes-studio] .agnes-rail[data-dragging="true"] {
  cursor: grabbing;
  scroll-behavior: auto;
}
/* 两侧渐隐，暗示"还能滑" */
[data-dsh-agnes-studio] .agnes-rail {
  mask-image: linear-gradient(90deg, transparent 0, #000 10px, #000 calc(100% - 10px), transparent 100%);
  -webkit-mask-image: linear-gradient(90deg, transparent 0, #000 10px, #000 calc(100% - 10px), transparent 100%);
}

/* 「更多」：浮在 dock 上方的小格子面板 */
[data-dsh-agnes-studio] .agnes-dock-more-wrap { position: relative; display: flex; }

[data-ag-theme="dark"][data-dsh-agnes-studio] .agnes-dock-more {
  position: absolute;
  bottom: calc(100% + 14px);
  left: 50%;
  transform: translateX(-50%);
  z-index: 40;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 6px;
  width: 340px;
  padding: 10px;
  border-radius: 20px;
  background: rgba(24, 23, 38, 0.86);
  border: 1px solid rgba(255, 255, 255, 0.16);
  backdrop-filter: blur(28px) saturate(1.12);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.22),
    0 34px 80px -30px rgba(0, 0, 0, 0.98);
}
[data-ag-theme="dark"][data-dsh-agnes-studio] .agnes-dock-more::after {
  /* 与 dock 之间的小三角，指明来源 */
  content: "";
  position: absolute;
  bottom: -6px;
  left: 50%;
  width: 12px;
  height: 12px;
  margin-left: -6px;
  transform: rotate(45deg);
  background: rgba(24, 23, 38, 0.86);
  border-right: 1px solid rgba(255, 255, 255, 0.16);
  border-bottom: 1px solid rgba(255, 255, 255, 0.16);
}

[data-dsh-agnes-studio] .agnes-dock-more-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 9px 10px;
  border-radius: 12px;
  border: 1px solid transparent;
  background: transparent;
  color: rgba(238, 240, 247, 0.72);
  font-family: inherit;
  font-size: 12px;
  text-align: left;
  cursor: pointer;
  transition: background 150ms ease, color 150ms ease;
}
[data-dsh-agnes-studio] .agnes-dock-more-item:hover {
  background: rgba(255, 255, 255, 0.07);
  color: #eef0f7;
}
[data-dsh-agnes-studio] .agnes-dock-more-item.active {
  background: rgba(255, 255, 255, 0.10);
  color: #eef0f7;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.14);
}
[data-dsh-agnes-studio] .agnes-dock-more-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: inherit;
}
`
