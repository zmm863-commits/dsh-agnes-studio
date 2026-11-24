/**
 * 底部 dock（第 23 层）—— 最终骨架：
 *
 *    ┌───────────────────────────────┬──────────────┐
 *    │           展示区              │   参数区     │
 *    ├───────────────────────────────┴──────────────┤
 *    │  dock：全部 16 个模块 + 参数开关 + 生成       │
 *    └──────────────────────────────────────────────┘
 *
 * 与 22-studio.ts 的差别只有一条：图标栏从**左侧竖列**换回**底部横条**，
 * 而且不再分段/轮播 —— 全部模块一次列出。
 * 22 层里「展示区 | 参数区」的两栏定义继续有效，不改。
 */
export const DOCK_BOTTOM_CSS = `
/* 外壳：内容在上、dock 在下 */
[data-dsh-agnes-studio] .agnes-shell {
  flex-direction: column-reverse;
  align-items: stretch;
}

/* dock：横向、全列出、居中；宽度超出时内部横滑（不换行、不隐藏条目） */
[data-dsh-agnes-studio] .agnes-rail {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: center;
  justify-content: flex-start;
  gap: 2px;
  width: max-content;
  max-width: calc(100% - 24px);
  flex: 0 0 auto;
  align-self: center;
  margin: 8px auto 12px;
  padding: 8px 10px;
  border-radius: 22px;
  overflow-x: auto;
  overflow-y: hidden;
  cursor: default;
  mask-image: none;
  -webkit-mask-image: none;
  scrollbar-width: none;
}
[data-dsh-agnes-studio] .agnes-rail::-webkit-scrollbar { display: none; }

/* 每一项：图标在上、小字在下，宽度收紧以便一行放下 16 个 */
[data-dsh-agnes-studio] .agnes-rail-item {
  flex: 0 0 auto;
  width: 54px;
  padding: 6px 2px;
  gap: 2px;
  border-radius: 12px;
  font-size: 9px;
  transform-origin: 50% 78%;
}
[data-dsh-agnes-studio] .agnes-rail-item:hover {
  transform: translateY(-2px) scale(1.07);
}
[data-dsh-agnes-studio] .agnes-rail-item.active {
  transform: translateY(-1px) scale(1.02);
}
[data-dsh-agnes-studio] .agnes-rail-icon {
  width: 22px;
  height: 22px;
}
[data-dsh-agnes-studio] .agnes-rail-label {
  font-size: 9px;
  line-height: 1.05;
  letter-spacing: 0;
}

/* 右侧主操作：与导航之间一条发丝线 */
[data-dsh-agnes-studio] .agnes-dock-primary {
  display: flex;
  align-items: center;
  flex: 0 0 auto;
  margin-left: 10px;
  padding-left: 12px;
  border-left: 1px solid rgba(255, 255, 255, 0.10);
}
[data-ag-theme="dark"][data-dsh-agnes-studio] .agnes-dock-go {
  height: 36px;
  padding: 0 22px;
  border-radius: 13px;
  font-size: 12.5px;
  font-weight: 600;
  white-space: nowrap;
}
[data-ag-theme="dark"][data-dsh-agnes-studio] .agnes-dock-params {
  height: 36px;
  padding: 0 12px;
  border-radius: 13px;
  font-size: 12px;
}

/* 展示区底部的次要操作条：dock 也在底部时，别让两条贴太近 */
[data-ag-theme="dark"][data-dsh-agnes-studio] .agnes-action-bar {
  margin: 6px 8px 4px;
}
`
