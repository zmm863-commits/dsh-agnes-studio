/**
 * 工作台骨架（第 22 层）：左图标栏 + 展示区 + 参数区。
 *
 * 取代 18/19/21 层的底部 dock：
 *   · 全部模块**一次列出来**（不做轮播、不做「更多」浮层）；
 *   · 左侧是图标栏（窄，图标 + 小字），右侧的工作区再分成两块 ——
 *     展示区（画布 / 预览）在左，参数区在右；
 *   · 生成按钮回到展示区底部，参数区可收起。
 *
 * 这一层只覆盖排布；材质与令牌仍由 14/17 层提供。
 */
export const STUDIO_CSS = `
/* ═══════════════════════════════════════════════════════════════════════
   1 · 外壳：横向 = 图标栏 | 工作区
   ═══════════════════════════════════════════════════════════════════════ */
[data-dsh-agnes-studio] .agnes-shell {
  flex-direction: row;
  align-items: stretch;
  gap: 0;
  padding: 0;
  overflow: hidden;
}

/* 图标栏：竖向、全列出、不换行不轮播 */
[data-dsh-agnes-studio] .agnes-rail {
  position: relative;
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  align-items: stretch;
  justify-content: flex-start;
  gap: 1px;
  width: 72px;
  max-width: 72px;
  flex: 0 0 72px;
  align-self: stretch;
  max-height: none;
  margin: 12px 0 12px 12px;
  padding: 8px 6px;
  border-radius: 20px;
  overflow-x: hidden;
  overflow-y: auto;
  cursor: default;
  mask-image: none;
  -webkit-mask-image: none;
  scrollbar-width: none;
}
[data-dsh-agnes-studio] .agnes-rail::-webkit-scrollbar { display: none; }

[data-dsh-agnes-studio] .agnes-rail-item {
  width: 100%;
  padding: 4px 2px;
  gap: 1px;
  border-radius: 10px;
  font-size: 8.5px;
  transform-origin: 50% 50%;
}
[data-dsh-agnes-studio] .agnes-rail-item:hover {
  transform: translateX(2px) scale(1.06);
}
[data-dsh-agnes-studio] .agnes-rail-item.active {
  transform: none;
}
[data-dsh-agnes-studio] .agnes-rail-icon {
  width: 20px;
  height: 20px;
}
[data-dsh-agnes-studio] .agnes-rail-label {
  font-size: 8.5px;
  line-height: 1.05;
  letter-spacing: 0;
}

/* ═══════════════════════════════════════════════════════════════════════
   2 · 工作区：展示区 | 参数区
   ═══════════════════════════════════════════════════════════════════════ */
[data-dsh-agnes-studio] .agnes-main {
  flex: 1;
  min-height: 0;
  min-width: 0;
  padding: 12px 12px 12px 10px;
}

[data-dsh-agnes-studio] .agnes-body {
  display: flex;
  flex-direction: row;
  align-items: stretch;
  gap: 12px;
  height: 100%;
  padding: 0;
  position: relative;
}

/* 展示区：占满剩余宽度 */
[data-ag-theme="dark"][data-dsh-agnes-studio] .agnes-center {
  flex: 1;
  min-width: 0;
  border-radius: 22px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background:
    radial-gradient(680px 380px at 50% -10%, rgba(99, 102, 241, 0.14), transparent 68%),
    rgba(255, 255, 255, 0.018);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.10);
  overflow: hidden;
}

/* 参数区：右侧固定宽度的一列，不再是绝对定位的浮卡 */
[data-ag-theme="dark"][data-dsh-agnes-studio] .agnes-right {
  position: static;
  flex: 0 0 320px;
  width: 320px;
  margin: 0;
  border-radius: 22px;
  transform: none;
  background: rgba(24, 23, 38, 0.62);
  border: 1px solid rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(26px) saturate(1.1);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.18),
    0 24px 60px -40px rgba(0, 0, 0, 0.9);
}

/* 展示区底部的操作条：贴底、不浮 */
[data-ag-theme="dark"][data-dsh-agnes-studio] .agnes-action-bar {
  margin: 8px;
  padding: 8px 10px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.09);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.10);
}

/* ═══════════════════════════════════════════════════════════════════════
   3 · 统一内页外框：全宽面板（转提示词/设置/短剧…）用同一套留白与卡片
   ═══════════════════════════════════════════════════════════════════════ */
[data-dsh-agnes-studio] .agnes-main > div {
  min-height: 0;
}
[data-dsh-agnes-studio] .agnes-vpt,
[data-dsh-agnes-studio] .agnes-toolbox,
[data-dsh-agnes-studio] .agnes-novel,
[data-dsh-agnes-studio] .agnes-wechat {
  max-width: 920px;
  margin: 0 auto;
  padding: 4px 4px 16px;
}
`
