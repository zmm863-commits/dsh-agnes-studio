/**
 * J · Spatial Glass 规范层（第 17 层，按 docs/spatial-glass-design-spec.md 落地）
 *
 * 与 14-spatial.ts 的关系：14 层是"上色"，这一层是"上结构" ——
 * 它把规范里那些**必须同时成立**的东西一次写清：
 *
 *   1. 层次靠位移：参数卡 translateZ(60px)（父级 perspective 1600），
 *      底栏同为浮起层；浮起层比玻璃层更亮、投影更大。
 *   2. 内高光：每一块玻璃都有 inset 0 1px 0 rgba(255,255,255,.16~.24)，
 *      这是这套风格"是不是玻璃"的分水岭（规范第 12 节）。
 *   3. 只有一个高饱和元素：主按钮的靛蓝→青渐变。其余全部中性。
 *   4. 圆角只有 26 / 16 / 12 三档。控件、卡片、容器各司其职。
 *   5. 导航是**浮起的玻璃胶囊**，不是通栏竖条（规范 4.3 / 11.1）。
 *
 * 全部作用在 [data-ag-theme="dark"][data-dsh-agnes-studio] 下：浅色主题一字不动。
 */
export const SPEC_CSS = `
/* ═══════════════════════════════════════════════════════════════════════
   1 · 容器与排版基线
   ═══════════════════════════════════════════════════════════════════════ */
[data-ag-theme="dark"][data-dsh-agnes-studio] {
  font-feature-settings: "ss01" 1;
  letter-spacing: -0.005em;
}

/* 标题栏：44px 玻璃条（规范 4.2） */
[data-ag-theme="dark"][data-dsh-agnes-studio] .agnes-titlebar {
  height: 44px;
  flex: 0 0 44px;
  padding: 0 16px;
  gap: 9px;
  background: rgba(255, 255, 255, 0.035);
  backdrop-filter: blur(22px) saturate(1.15);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}
[data-ag-theme="dark"][data-dsh-agnes-studio] .agnes-titlebar-icon {
  width: 26px;
  height: 26px;
  border-radius: 9px;
  color: #06070f;
  background: linear-gradient(100deg, #818cf8, #22d3ee);
  box-shadow: 0 10px 24px -14px rgba(129, 140, 248, 0.9);
}
[data-ag-theme="dark"][data-dsh-agnes-studio] .agnes-titlebar-text {
  flex: none;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: -0.01em;
  color: #eef0f7;
}
[data-ag-theme="dark"][data-dsh-agnes-studio] .agnes-titlebar-module {
  font-size: 10px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(238, 240, 247, 0.48);
}
[data-ag-theme="dark"][data-dsh-agnes-studio] .agnes-titlebar-btn,
[data-ag-theme="dark"][data-dsh-agnes-studio] .agnes-theme-toggle,
[data-ag-theme="dark"][data-dsh-agnes-studio] .agnes-size-toggle {
  height: 26px;
  padding: 0 10px;
  border-radius: 12px;
  font-size: 11px;
  letter-spacing: 0;
  color: rgba(238, 240, 247, 0.72);
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.10);
}
[data-ag-theme="dark"][data-dsh-agnes-studio] .agnes-titlebar-btn:hover,
[data-ag-theme="dark"][data-dsh-agnes-studio] .agnes-theme-toggle:hover,
[data-ag-theme="dark"][data-dsh-agnes-studio] .agnes-size-toggle:hover {
  background: rgba(255, 255, 255, 0.09);
  color: #eef0f7;
}

/* ═══════════════════════════════════════════════════════════════════════
   2 · 左导航：浮起的玻璃胶囊（不是通栏竖条）
   ═══════════════════════════════════════════════════════════════════════ */
[data-ag-theme="dark"][data-dsh-agnes-studio] .agnes-rail {
  align-self: flex-start;
  margin: 14px 4px 14px 14px;
  padding: 10px 8px;
  max-height: calc(100% - 28px);
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.055);
  border: 1px solid rgba(255, 255, 255, 0.10);
  backdrop-filter: blur(24px) saturate(1.15);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.18),
    0 30px 70px -44px rgba(0, 0, 0, 0.95);
}
[data-ag-theme="dark"][data-dsh-agnes-studio] .agnes-rail-group-label {
  font-size: 9px;
  letter-spacing: 0.16em;
  color: rgba(238, 240, 247, 0.38);
}
[data-ag-theme="dark"][data-dsh-agnes-studio] .agnes-rail-item {
  border-radius: 14px;
  color: rgba(238, 240, 247, 0.55);
}
[data-ag-theme="dark"][data-dsh-agnes-studio] .agnes-rail-item.active {
  color: #eef0f7;
  background: rgba(255, 255, 255, 0.095);
  box-shadow:
    inset 0 0 0 1px rgba(255, 255, 255, 0.14),
    inset 0 1px 0 rgba(255, 255, 255, 0.20);
  animation: none;
}

/* 撤掉旧语言：工程网格底纹 + HUD 角标。规范里"画面是主角，界面是玻璃框"，
   这类工程感装饰和极光玻璃是两种语言，混在一起就是"两个皮肤叠着"。 */
[data-ag-theme="dark"][data-dsh-agnes-studio]::after { display: none; }
[data-ag-theme="dark"][data-dsh-agnes-studio] .agnes-preview-area::before,
[data-ag-theme="dark"][data-dsh-agnes-studio] .agnes-preview-area::after { display: none; }

/* ═══════════════════════════════════════════════════════════════════════
   3 · 舞台与浮起两栏
   ═══════════════════════════════════════════════════════════════════════ */
[data-ag-theme="dark"][data-dsh-agnes-studio] .agnes-main {
  perspective: 1600px;
  padding: 14px 16px 14px 6px;
}

/* 舞台：不是深色色块，是一块被光晕托住的空场 */
[data-ag-theme="dark"][data-dsh-agnes-studio] .agnes-center {
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background:
    radial-gradient(680px 380px at 50% -10%, rgba(99, 102, 241, 0.14), transparent 68%),
    radial-gradient(520px 320px at 82% 108%, rgba(34, 211, 238, 0.08), transparent 70%),
    rgba(255, 255, 255, 0.018);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.10);
  overflow: hidden;
}
[data-ag-theme="dark"][data-dsh-agnes-studio] .agnes-preview-area {
  background: none;
}

/* 参数栏：浮起层（用更深的柔投影表达 z 距离；translateZ 会在 perspective 下被放大、撑出面板） */
[data-ag-theme="dark"][data-dsh-agnes-studio] .agnes-right {
  margin: 0 0 0 4px;
  border-radius: 22px;
  background: rgba(18, 18, 30, 0.72);
  border: 1px solid rgba(255, 255, 255, 0.18);
  backdrop-filter: blur(30px) saturate(1.1);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.24),
    0 46px 110px -46px rgba(0, 0, 0, 0.98);
}
[data-ag-theme="dark"][data-dsh-agnes-studio] .agnes-right-scroll {
  padding: 14px 12px;
}

/* 底部操作条：与参数栏同层的 dock */
[data-ag-theme="dark"][data-dsh-agnes-studio] .agnes-action-bar {
  margin: 0 12px 12px;
  padding: 10px 12px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 16px;
  background: rgba(18, 18, 30, 0.72);
  backdrop-filter: blur(26px) saturate(1.1);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.20),
    0 30px 70px -34px rgba(0, 0, 0, 0.95);
}

/* ═══════════════════════════════════════════════════════════════════════
   4 · 区块与文字层级
   ═══════════════════════════════════════════════════════════════════════ */
[data-ag-theme="dark"][data-dsh-agnes-studio] .agnes-section {
  border-radius: 16px;
  padding: 0 0 16px;
  margin-bottom: 4px;
}
[data-ag-theme="dark"][data-dsh-agnes-studio] .agnes-section-title {
  gap: 8px;
  padding: 0 0 10px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", system-ui, sans-serif;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: -0.01em;
  text-transform: none;
  color: #eef0f7;
}
[data-ag-theme="dark"][data-dsh-agnes-studio] .agnes-section-title::before {
  content: "";
  flex: none;
  width: 3px;
  height: 13px;
  border-radius: 99px;
  background: linear-gradient(180deg, #818cf8, #22d3ee);
  box-shadow: 0 0 14px rgba(129, 140, 248, 0.7);
}

/* 元信息统一走大写小字距（规范 2.4） */
[data-ag-theme="dark"][data-dsh-agnes-studio] .agnes-badge,
[data-ag-theme="dark"][data-dsh-agnes-studio] .agnes-chip {
  border-radius: 12px;
  font-size: 10px;
  letter-spacing: 0.10em;
  text-transform: uppercase;
}

/* ═══════════════════════════════════════════════════════════════════════
   5 · 控件
   ═══════════════════════════════════════════════════════════════════════ */
[data-ag-theme="dark"][data-dsh-agnes-studio] .agnes-btn {
  border-radius: 12px;
  font-weight: 500;
  letter-spacing: 0;
  transition: background 150ms ease, box-shadow 180ms ease, border-color 150ms ease;
}
[data-ag-theme="dark"][data-dsh-agnes-studio] .agnes-btn-secondary {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: rgba(238, 240, 247, 0.88);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.12);
}
[data-ag-theme="dark"][data-dsh-agnes-studio] .agnes-btn-secondary:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.10);
  border-color: rgba(255, 255, 255, 0.18);
}
[data-ag-theme="dark"][data-dsh-agnes-studio] .agnes-btn-ghost {
  background: transparent;
  border: 1px solid transparent;
  color: rgba(238, 240, 247, 0.62);
  box-shadow: none;
}
[data-ag-theme="dark"][data-dsh-agnes-studio] .agnes-btn-ghost:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.06);
  color: #eef0f7;
}

[data-ag-theme="dark"][data-dsh-agnes-studio] .agnes-textarea,
[data-ag-theme="dark"][data-dsh-agnes-studio] .agnes-input,
[data-ag-theme="dark"][data-dsh-agnes-studio] .agnes-select {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 12px;
  color: #eef0f7;
}
[data-ag-theme="dark"][data-dsh-agnes-studio] .agnes-textarea::placeholder,
[data-ag-theme="dark"][data-dsh-agnes-studio] .agnes-input::placeholder {
  color: rgba(238, 240, 247, 0.34);
}
[data-ag-theme="dark"][data-dsh-agnes-studio] .agnes-textarea:focus,
[data-ag-theme="dark"][data-dsh-agnes-studio] .agnes-input:focus,
[data-ag-theme="dark"][data-dsh-agnes-studio] .agnes-select:focus {
  border-color: rgba(129, 140, 248, 0.55);
  box-shadow: 0 0 0 3px rgba(129, 140, 248, 0.16);
  outline: none;
}

/* ═══════════════════════════════════════════════════════════════════════
   6 · 可访问性与性能降级
   ═══════════════════════════════════════════════════════════════════════ */
[data-dsh-agnes-studio] :focus-visible {
  outline: 2px solid rgba(129, 140, 248, 0.85);
  outline-offset: 2px;
}
[data-dsh-agnes-studio] ::-webkit-scrollbar { width: 8px; height: 8px; }
[data-dsh-agnes-studio] ::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.16);
  border-radius: 99px;
}
[data-dsh-agnes-studio] ::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.26); }
[data-dsh-agnes-studio] ::-webkit-scrollbar-track { background: transparent; }

@supports not (backdrop-filter: blur(1px)) {
  [data-ag-theme="dark"][data-dsh-agnes-studio] .agnes-rail,
  [data-ag-theme="dark"][data-dsh-agnes-studio] .agnes-right,
  [data-ag-theme="dark"][data-dsh-agnes-studio] .agnes-action-bar,
  [data-ag-theme="dark"][data-dsh-agnes-studio] .agnes-titlebar {
    background: rgba(18, 18, 30, 0.92);
  }
}

@media (prefers-reduced-motion: reduce) {
  [data-dsh-agnes-studio] *,
  [data-dsh-agnes-studio] *::before,
  [data-dsh-agnes-studio] *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
`
