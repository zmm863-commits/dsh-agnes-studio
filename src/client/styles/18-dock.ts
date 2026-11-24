/**
 * J · 底部 Dock 布局（第 18 层）—— 结构性重构，不是又一次上色。
 *
 * 与 14/17 层的差别：
 *   17 层解决"材质"，这一层解决"骨架"。
 *   稿子的骨架是：内容占满整块画布 → 参数卡浮在画布右侧压上去 → 功能入口在**底部**。
 *   之前的骨架是：左竖条 + 中间 + 右栏三等分，功能全在左侧 —— 那是另一套骨架，
 *   上多少层颜色都变不过来。
 *
 * 具体做法（全部靠层叠覆盖，不改各面板的内部结构，可整层回退）：
 *   1. .agnes-shell 反转成纵向：内容在上、dock 在下
 *   2. .agnes-body 变成"画布容器"（position: relative），内容 wrap 在里面
 *   3. .agnes-right 从"右栏"变成"浮起的参数卡"（absolute，压在画布右侧）
 *   4. .agnes-action-bar 变成浮在画布底部的一条 dock-bar
 *   5. .agnes-rail 从左侧竖条变成底部横向 dock（含分组分隔线）
 */
export const DOCK_CSS = `
/* ═══════════════════════════════════════════════════════════════════════
   0 · 容器底色：紫青双向的雾面，比纯黑有层次（对齐稿子的底）
   ═══════════════════════════════════════════════════════════════════════ */
[data-ag-theme="dark"][data-dsh-agnes-studio] {
  background:
    radial-gradient(780px 470px at 80% -10%, rgba(129, 102, 241, 0.30), transparent 62%),
    radial-gradient(660px 420px at 4% 98%, rgba(236, 72, 153, 0.15), transparent 66%),
    radial-gradient(620px 380px at 98% 94%, rgba(20, 184, 166, 0.16), transparent 68%),
    radial-gradient(1.2px 1.2px at 16% 24%, rgba(255, 255, 255, 0.42), transparent),
    radial-gradient(1px 1px at 62% 16%, rgba(255, 255, 255, 0.28), transparent),
    linear-gradient(158deg, #141327 0%, #121322 52%, #0d0e16 100%);
}

/* ═══════════════════════════════════════════════════════════════════════
   1 · 骨架：内容在上，dock 在下
   ═══════════════════════════════════════════════════════════════════════ */
[data-dsh-agnes-studio] .agnes-shell {
  flex-direction: column-reverse;
  gap: 0;
  padding: 0;
  overflow: hidden;
}

/* 画布容器：内容铺满，参数卡绝对定位压在右侧 */
[data-dsh-agnes-studio] .agnes-body {
  position: relative;
  flex: 1;
  min-height: 0;
  padding: 12px 12px 0;
  gap: 12px;
}

[data-dsh-agnes-studio] .agnes-main {
  flex: 1;
  min-height: 0;
  padding: 0;
}

/* ═══════════════════════════════════════════════════════════════════════
   2 · 画布与浮起的参数卡
   ═══════════════════════════════════════════════════════════════════════ */
[data-ag-theme="dark"][data-dsh-agnes-studio] .agnes-center {
  border-radius: 22px;
}
[data-ag-theme="dark"][data-dsh-agnes-studio] .agnes-preview-area {
  border-radius: 22px;
}

[data-ag-theme="dark"][data-dsh-agnes-studio] .agnes-right {
  position: absolute;
  top: 12px;
  right: 12px;
  bottom: 12px;
  width: 320px;
  z-index: 6;
  margin: 0;
  border-radius: 22px;
  background: rgba(24, 23, 38, 0.78);
  border: 1px solid rgba(255, 255, 255, 0.16);
  backdrop-filter: blur(30px) saturate(1.12);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.24),
    0 44px 100px -34px rgba(0, 0, 0, 0.98);
}

/* ═══════════════════════════════════════════════════════════════════════
   3 · 底部 dock-bar（主操作）与 dock（功能入口）
   ═══════════════════════════════════════════════════════════════════════ */
[data-ag-theme="dark"][data-dsh-agnes-studio] .agnes-action-bar {
  margin: 8px 8px 10px;
  padding: 9px 12px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 18px;
  background: rgba(24, 23, 38, 0.72);
  backdrop-filter: blur(26px) saturate(1.1);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.20),
    0 26px 60px -30px rgba(0, 0, 0, 0.95);
}

/* 导航 rail：竖条 → 底部横向 dock */
[data-dsh-agnes-studio] .agnes-rail {
  display: flex;
  flex-wrap: nowrap;
  flex: 0 0 auto;
  width: auto;
  max-width: calc(100% - 24px);
  align-self: center;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 2px;
  margin: 8px 12px 12px;
  padding: 8px 10px;
  border-radius: 22px;
  overflow-x: auto;
  overflow-y: hidden;
  scrollbar-width: none;
}
[data-dsh-agnes-studio] .agnes-rail::-webkit-scrollbar { display: none; }

[data-dsh-agnes-studio] .agnes-rail-group {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 2px;
}
[data-dsh-agnes-studio] .agnes-rail-group + .agnes-rail-group {
  margin-left: 8px;
  padding-left: 8px;
  border-left: 1px solid rgba(255, 255, 255, 0.08);
}
/* dock 里不显示分组标题：图标 + 文字已经能读，标题只会把 dock 撑高 */
[data-dsh-agnes-studio] .agnes-rail-group-label { display: none; }
[data-dsh-agnes-studio] .agnes-rail-spacer { display: none; }

[data-dsh-agnes-studio] .agnes-rail-item {
  flex: 0 0 auto;
  width: 58px;
  padding: 8px 4px;
  gap: 5px;
  border-radius: 16px;
  font-size: 10.5px;
  font-weight: 500;
}

[data-ag-theme="dark"][data-dsh-agnes-studio] .agnes-rail-icon {
  width: 26px;
  height: 26px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 150ms ease, box-shadow 150ms ease;
}
[data-ag-theme="dark"][data-dsh-agnes-studio] .agnes-rail-item:hover .agnes-rail-icon {
  background: rgba(255, 255, 255, 0.06);
}
[data-ag-theme="dark"][data-dsh-agnes-studio] .agnes-rail-item.active .agnes-rail-icon {
  background: rgba(255, 255, 255, 0.12);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.22);
}
[data-ag-theme="dark"][data-dsh-agnes-studio] .agnes-rail-item.active {
  background: transparent;
  box-shadow: none;
  color: #eef0f7;
}

/* dock 尾部主操作：与导航之间用发丝线隔开，按钮比导航项宽一档 */
[data-dsh-agnes-studio] .agnes-dock-primary {
  display: flex;
  align-items: center;
  margin-left: 10px;
  padding-left: 12px;
  border-left: 1px solid rgba(255, 255, 255, 0.10);
}
[data-ag-theme="dark"][data-dsh-agnes-studio] .agnes-dock-go {
  height: 38px;
  padding: 0 24px;
  border-radius: 14px;
  font-size: 12.5px;
  font-weight: 600;
  letter-spacing: 0.02em;
  white-space: nowrap;
}
[data-ag-theme="dark"][data-dsh-agnes-studio] .agnes-dock-params {
  height: 38px;
  padding: 0 12px;
  border-radius: 14px;
  font-size: 12px;
}

/* 空状态图标：渐变底 + 深色字形，对比度才够 */
[data-ag-theme="dark"][data-dsh-agnes-studio] .agnes-empty-icon {
  color: #06070f;
  border: 1px solid rgba(255, 255, 255, 0.45);
  box-shadow:
    0 24px 50px -20px rgba(129, 140, 248, 0.8),
    inset 0 1px 0 rgba(255, 255, 255, 0.55);
}

/* 全宽面板的内容列：别让表单横着摊满 1400px，收到一个读得动的宽度 */
[data-dsh-agnes-studio] .agnes-vpt {
  max-width: 880px;
  margin: 0 auto;
  padding: 20px 24px 28px;
}

/* 全宽面板（转提示词 / 短剧 / 画布…）在画布里自带留白 */
[data-dsh-agnes-studio] .agnes-main > div { min-height: 0; }
`
