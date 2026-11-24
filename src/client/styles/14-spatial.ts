/**
 * J · 空间层叠皮肤（暗色）
 *
 * 层叠顺序：第 14/14 层（最后追加，优先级最高）。
 *
 * 设计语言：
 *   · 深空底 + 微弱星点，面板像浮在空间里
 *   · 玻璃材质（半透明白 + backdrop blur + 内发光边）
 *   · 大圆角（容器 26 / 卡片 16 / 控件 12）
 *   · 单一强调色渐变（靛蓝 → 青），其余全部中性
 *
 * 只作用于暗色主题；浅色主题维持原样，方便对比与回退。
 * 注意：本层是"新皮肤"，不是修复补丁 —— 后续应按组件把 01-13 层
 * 的相关声明合并进来，而不是继续横向追加第 15 层。
 */

export const SPATIAL_CSS = `
/* ═══════════════════════════════════════════════════════════════════════
   J — spatial glass
   ═══════════════════════════════════════════════════════════════════════ */

[data-ag-theme="dark"][data-dsh-agnes-studio] {
  --sp-glass: rgba(255, 255, 255, 0.055);
  --sp-glass-2: rgba(255, 255, 255, 0.095);
  --sp-line: rgba(255, 255, 255, 0.12);
  --sp-line-2: rgba(255, 255, 255, 0.22);
  --sp-ink: #eef0f7;
  --sp-dim: rgba(238, 240, 247, 0.48);
  --sp-indigo: #818cf8;
  --sp-cyan: #22d3ee;

  background:
    radial-gradient(900px 520px at 72% -12%, rgba(99, 102, 241, 0.26), transparent 62%),
    radial-gradient(700px 420px at 16% -8%, rgba(34, 211, 238, 0.16), transparent 62%),
    radial-gradient(740px 460px at 8% 108%, rgba(236, 72, 153, 0.14), transparent 64%),
    radial-gradient(560px 340px at 94% 98%, rgba(245, 158, 11, 0.10), transparent 64%),
    radial-gradient(1.2px 1.2px at 14% 22%, rgba(255, 255, 255, 0.5), transparent),
    radial-gradient(1px 1px at 68% 12%, rgba(255, 255, 255, 0.34), transparent),
    radial-gradient(1.4px 1.4px at 84% 64%, rgba(255, 255, 255, 0.42), transparent),
    radial-gradient(1px 1px at 32% 78%, rgba(255, 255, 255, 0.3), transparent),
    radial-gradient(1px 1px at 52% 44%, rgba(255, 255, 255, 0.24), transparent),
    linear-gradient(158deg, #0a0c16 0%, #0c0a18 54%, #08080f 100%);
  border: 1px solid var(--sp-line);
  border-radius: 26px;
  box-shadow:
    0 1px 0 rgba(255, 255, 255, 0.18) inset,
    0 60px 140px -50px rgba(0, 0, 0, 0.98);
}

/* 标题栏：玻璃条，去掉原有的彩色流光 */
[data-ag-theme="dark"][data-dsh-agnes-studio] .agnes-titlebar {
  background: rgba(255, 255, 255, 0.035);
  backdrop-filter: blur(22px) saturate(1.15);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}
[data-ag-theme="dark"][data-dsh-agnes-studio] .agnes-titlebar::after { display: none; }

/* 左导航：独立玻璃竖条 */
[data-ag-theme="dark"][data-dsh-agnes-studio] .agnes-rail {
  margin: 10px 0 10px 10px;
  border-radius: 20px;
  background: var(--sp-glass);
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(24px);
  box-shadow: 0 1px 0 rgba(255, 255, 255, 0.16) inset;
}
[data-ag-theme="dark"][data-dsh-agnes-studio] .agnes-rail-item {
  border-radius: 14px;
  color: var(--sp-dim);
}
[data-ag-theme="dark"][data-dsh-agnes-studio] .agnes-rail-item:hover {
  background: rgba(255, 255, 255, 0.06);
  color: var(--sp-ink);
}
[data-ag-theme="dark"][data-dsh-agnes-studio] .agnes-rail-item.active {
  background: var(--sp-glass-2);
  color: var(--sp-ink);
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.14) inset;
}

/* 主区与两栏：让玻璃露出容器底色，不再各自铺深色 */
[data-ag-theme="dark"][data-dsh-agnes-studio] .agnes-main,
[data-ag-theme="dark"][data-dsh-agnes-studio] .agnes-shell,
[data-ag-theme="dark"][data-dsh-agnes-studio] .agnes-left,
[data-ag-theme="dark"][data-dsh-agnes-studio] .agnes-right {
  background: transparent;
}

/* 卡片：大圆角 + 发丝边 */
[data-ag-theme="dark"][data-dsh-agnes-studio] .agnes-mode-card,
[data-ag-theme="dark"][data-dsh-agnes-studio] .agnes-storyboard-card,
[data-ag-theme="dark"][data-dsh-agnes-studio] .agnes-anchor-card,
[data-ag-theme="dark"][data-dsh-agnes-studio] .agnes-frame-item {
  border-radius: 16px;
  border-color: rgba(255, 255, 255, 0.1);
}

/* 输入与下拉：玻璃内嵌 */
[data-ag-theme="dark"][data-dsh-agnes-studio] .agnes-textarea,
[data-ag-theme="dark"][data-dsh-agnes-studio] .agnes-select {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.12);
  border-radius: 12px;
}
[data-ag-theme="dark"][data-dsh-agnes-studio] .agnes-textarea:focus,
[data-ag-theme="dark"][data-dsh-agnes-studio] .agnes-select:focus {
  border-color: rgba(129, 140, 248, 0.55);
  box-shadow: 0 0 0 3px rgba(129, 140, 248, 0.16);
}

/* 主按钮：唯一的高饱和元素 */
[data-ag-theme="dark"][data-dsh-agnes-studio] .agnes-btn-primary {
  background: linear-gradient(100deg, var(--sp-indigo), var(--sp-cyan));
  border: none;
  color: #06070f;
  border-radius: 12px;
  box-shadow: 0 12px 30px -14px rgba(129, 140, 248, 0.7);
}
[data-ag-theme="dark"][data-dsh-agnes-studio] .agnes-btn-secondary,
[data-ag-theme="dark"][data-dsh-agnes-studio] .agnes-btn-ghost {
  border-radius: 12px;
  border-color: rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.05);
}

/* 状态栏：贴底，弱化 */
[data-ag-theme="dark"][data-dsh-agnes-studio] .agnes-statusbar {
  background: rgba(255, 255, 255, 0.02);
  border-top: 1px solid rgba(255, 255, 255, 0.07);
}

/* 滚动条 */
[data-ag-theme="dark"][data-dsh-agnes-studio] ::-webkit-scrollbar { width: 8px; height: 8px; }
[data-ag-theme="dark"][data-dsh-agnes-studio] ::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.16);
  border-radius: 99px;
}
[data-ag-theme="dark"][data-dsh-agnes-studio] ::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.26);
}
[data-ag-theme="dark"][data-dsh-agnes-studio] ::-webkit-scrollbar-track { background: transparent; }
`

/* ── 第二轮：两栏浮起、缩略图、标题栏控件 ─────────────────────────── */

export const SPATIAL_CSS_2 = `
/* 左右两栏：从"切分的面板"变成"浮起的玻璃卡" */
[data-ag-theme="dark"][data-dsh-agnes-studio] .agnes-left,
[data-ag-theme="dark"][data-dsh-agnes-studio] .agnes-right {
  margin: 10px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.045);
  border: 1px solid rgba(255, 255, 255, 0.10);
  box-shadow:
    0 1px 0 rgba(255, 255, 255, 0.14) inset,
    0 24px 50px -24px rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(18px) saturate(1.1);
}
[data-ag-theme="dark"][data-dsh-agnes-studio] .agnes-left { border-right: none; }
[data-ag-theme="dark"][data-dsh-agnes-studio] .agnes-right { border-left: none; }

/* 左栏标题与内容的内边距，配合圆角 */
[data-ag-theme="dark"][data-dsh-agnes-studio] .agnes-left-header {
  padding: 14px 14px 10px;
  letter-spacing: 0.08em;
}
[data-ag-theme="dark"][data-dsh-agnes-studio] .agnes-left-content {
  padding: 0 10px 10px;
}

/* 右栏滚动容器同样圆角收口 */
[data-ag-theme="dark"][data-dsh-agnes-studio] .agnes-right-scroll {
  border-radius: 18px;
}

/* 缩略图 / 历史卡片 */
[data-ag-theme="dark"][data-dsh-agnes-studio] .agnes-thumb {
  border-radius: 14px;
  overflow: hidden;
}
[data-ag-theme="dark"][data-dsh-agnes-studio] .agnes-preview-area {
  border-radius: 18px;
}

/* 标题栏控件：胶囊玻璃 */
[data-ag-theme="dark"][data-dsh-agnes-studio] .agnes-titlebar-btn,
[data-ag-theme="dark"][data-dsh-agnes-studio] .agnes-theme-toggle,
[data-ag-theme="dark"][data-dsh-agnes-studio] .agnes-size-toggle {
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.05);
  color: rgba(238, 240, 247, 0.72);
}
[data-ag-theme="dark"][data-dsh-agnes-studio] .agnes-titlebar-btn:hover,
[data-ag-theme="dark"][data-dsh-agnes-studio] .agnes-theme-toggle:hover,
[data-ag-theme="dark"][data-dsh-agnes-studio] .agnes-size-toggle:hover {
  border-color: rgba(129, 140, 248, 0.55);
  color: #eef0f7;
}

/* 分段按钮 / 比例按钮：玻璃底 */
[data-ag-theme="dark"][data-dsh-agnes-studio] .agnes-size-btn,
[data-ag-theme="dark"][data-dsh-agnes-studio] .agnes-ratio-btn,
[data-ag-theme="dark"][data-dsh-agnes-studio] .agnes-mode-btn {
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.10);
  background: rgba(255, 255, 255, 0.04);
}
[data-ag-theme="dark"][data-dsh-agnes-studio] .agnes-size-btn.active,
[data-ag-theme="dark"][data-dsh-agnes-studio] .agnes-ratio-btn.active,
[data-ag-theme="dark"][data-dsh-agnes-studio] .agnes-mode-btn.active {
  background: rgba(129, 140, 248, 0.18);
  border-color: rgba(129, 140, 248, 0.45);
  color: #eef0f7;
}
`
