/**
 * 渐变与主题切换
 *
 * 层叠顺序：第 10/12 层（顺序即生效顺序，后写的覆盖先写的）。
 * 由原 styles.ts 第 3832-4203 行机械切分而来，内容逐字未改。
 */
export const GRADIENTS_CSS = `/* ═══════════════════════════════════════════════════════════════════════
   v7 — 深色玻璃科技皮肤
   保留参考站的科技语言（HUD 角标 / 等宽微标签 / 青色主色 / 渐变 CTA /
   工程网格），但底色改为与 DSH 外壳同色系的深蓝玻璃：
   消除"暗外壳 + 白面板"的明暗撕裂，也无需再用重遮罩压暗全世界。
   ═══════════════════════════════════════════════════════════════════════ */
[data-ag-theme="dark"][data-dsh-agnes-studio] {
  --ag-bg-0: #0b1020;
  --ag-bg-1: #101731;
  --ag-panel: rgba(21, 29, 54, 0.72);
  --ag-panel-solid: #151d36;
  --ag-panel-strong: rgba(26, 35, 62, 0.9);
  --ag-line: rgba(125, 170, 255, 0.14);
  --ag-line-2: rgba(125, 170, 255, 0.30);
  --ag-t1: #eaf1ff;
  --ag-t2: #b9c6e4;
  --ag-muted: #8496be;
  --ag-dim: #6b7ca3;
  --ag-accent: #22d3ee;
  --ag-accent-2: #8b5cf6;
  --ag-accent-3: #f472b6;
  --ag-grad: linear-gradient(120deg, #22d3ee, #8b5cf6);
  --ag-grad-3: linear-gradient(120deg, #22d3ee, #8b5cf6 55%, #f472b6);
  --ag-glow-accent: 0 12px 30px -14px rgba(34, 211, 238, 0.7);
  --ag-glow-soft: 0 24px 60px -30px rgba(0, 0, 0, 0.95);

  /* re-point the surface/text tokens every earlier layer reads */
  --ag-surface-0: #0b1020;
  --ag-surface-1: rgba(21, 29, 54, 0.72);
  --ag-surface-2: rgba(33, 44, 76, 0.62);
  --ag-surface-3: rgba(45, 58, 96, 0.72);
  --ag-surface-4: rgba(58, 74, 118, 0.8);
  --ag-text: #eaf1ff;
  --ag-text-2: #b9c6e4;
  --ag-text-3: #8496be;
  --ag-line-strong: rgba(125, 170, 255, 0.30);
  /* on dark, module-tinted text uses the BRIGHT value, not the light-skin ink */
  --ag-mod-ink: var(--ag-mod);

  background:
    radial-gradient(900px 420px at 15% -10%, rgba(34, 211, 238, 0.16), transparent 62%),
    radial-gradient(760px 400px at 88% -6%, rgba(139, 92, 246, 0.18), transparent 62%),
    linear-gradient(180deg, #121a33 0%, #0d1428 55%, #0a0f1f 100%);
  border: 1px solid rgba(125, 170, 255, 0.22);
  box-shadow:
    0 50px 130px -34px rgba(0, 0, 0, 0.95),
    0 0 0 1px rgba(34, 211, 238, 0.10),
    inset 0 1px 0 rgba(255, 255, 255, 0.07);
  color: var(--ag-t1);
}
[data-ag-theme="dark"][data-dsh-agnes-studio]::after {
  background-image:
    linear-gradient(rgba(125, 170, 255, 0.055) 1px, transparent 1px),
    linear-gradient(90deg, rgba(125, 170, 255, 0.055) 1px, transparent 1px);
  mask-image: radial-gradient(circle at 50% 0%, #000 0%, transparent 76%);
}
[data-ag-theme="dark"] /* --- header --------------------------------------------------------- */
.agnes-titlebar {
  background: rgba(16, 23, 45, 0.72);
  border-bottom: 1px solid var(--ag-line);
  color: var(--ag-t1);
}
[data-ag-theme="dark"] .agnes-titlebar-text {
  background: linear-gradient(90deg, #ffffff, #9fe9f7);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}
[data-ag-theme="dark"] .agnes-titlebar-btn {
  background: rgba(33, 44, 76, 0.7);
  border: 1px solid var(--ag-line);
  color: var(--ag-t2);
}
[data-ag-theme="dark"] .agnes-titlebar-btn:hover {
  background: rgba(244, 114, 182, 0.18);
  border-color: rgba(244, 114, 182, 0.5);
  color: #f9a8d4;
}
[data-ag-theme="dark"] /* --- rail ------------------------------------------------------------ */
.agnes-rail {
  background: rgba(13, 19, 38, 0.6);
  border-right: 1px solid var(--ag-line);
}
[data-ag-theme="dark"] .agnes-rail-item {
  color: var(--ag-muted);
}
[data-ag-theme="dark"] .agnes-rail-item:hover {
  background: rgba(33, 44, 76, 0.7);
  border-color: var(--ag-line);
  color: var(--ag-t1);
  box-shadow: none;
}
[data-ag-theme="dark"] .agnes-rail-item.active {
  background: linear-gradient(180deg, rgba(34, 211, 238, 0.16), rgba(139, 92, 246, 0.12));
  border-color: rgba(34, 211, 238, 0.42);
  color: #fff;
  box-shadow: 0 10px 26px -16px rgba(34, 211, 238, 0.9), inset 0 1px 0 rgba(255,255,255,0.10);
}
[data-ag-theme="dark"] /* --- cards / panels -------------------------------------------------- */
.agcv-card,
[data-ag-theme="dark"] .agnes-anchor-card,
[data-ag-theme="dark"] .agnes-mode-card,
[data-ag-theme="dark"] .agcv-preview,
[data-ag-theme="dark"] .agnes-anchor-side,
[data-ag-theme="dark"] .agdp-next {
  background: linear-gradient(180deg, rgba(33, 44, 76, 0.72), rgba(18, 26, 50, 0.82));
  border: 1px solid var(--ag-line);
  box-shadow: var(--ag-glow-soft), inset 0 1px 0 rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
}
[data-ag-theme="dark"] .agcv-card-title,
[data-ag-theme="dark"] .agnes-section-title { color: var(--ag-accent); }
[data-ag-theme="dark"] .agnes-section-title { color: var(--ag-t2); }
[data-ag-theme="dark"] .agcv-card-title { color: var(--ag-accent) !important; }
[data-ag-theme="dark"] /* HUD corners glow cyan on dark */
.agcv-card::before,
[data-ag-theme="dark"] .agcv-card::after,
[data-ag-theme="dark"] .agnes-anchor-card::before,
[data-ag-theme="dark"] .agnes-anchor-card::after,
[data-ag-theme="dark"] .agcv-preview::before,
[data-ag-theme="dark"] .agcv-preview::after,
[data-ag-theme="dark"] .agnes-anchor-side::before,
[data-ag-theme="dark"] .agnes-anchor-side::after {
  border-color: var(--ag-accent);
  opacity: 0.55;
  filter: drop-shadow(0 0 6px rgba(34, 211, 238, 0.55));
}
[data-ag-theme="dark"] /* --- form controls --------------------------------------------------- */
[data-dsh-agnes-studio] input:not([type="checkbox"]):not([type="radio"]):not([type="file"]):not(.agc-node-title),
[data-ag-theme="dark"][data-dsh-agnes-studio] select,
[data-ag-theme="dark"][data-dsh-agnes-studio] textarea {
  background: rgba(9, 14, 30, 0.72) !important;
  border: 1px solid var(--ag-line-2) !important;
  color: var(--ag-t1) !important;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.45) !important;
}
[data-ag-theme="dark"][data-dsh-agnes-studio] input::placeholder,
[data-ag-theme="dark"][data-dsh-agnes-studio] textarea::placeholder { color: #6b7ca3 !important; }
[data-ag-theme="dark"][data-dsh-agnes-studio] select option { background: #131b33; color: var(--ag-t1); }
[data-ag-theme="dark"][data-dsh-agnes-studio] input:not(.agc-node-title):focus,
[data-ag-theme="dark"][data-dsh-agnes-studio] select:focus,
[data-ag-theme="dark"][data-dsh-agnes-studio] textarea:focus {
  border-color: var(--ag-accent) !important;
  box-shadow: 0 0 0 3px rgba(34, 211, 238, 0.20), inset 0 1px 3px rgba(0,0,0,0.45) !important;
}
[data-ag-theme="dark"] /* --- buttons --------------------------------------------------------- */
.agnes-btn-secondary {
  background: rgba(33, 44, 76, 0.7) !important;
  border: 1px solid var(--ag-line-2) !important;
  color: var(--ag-t2) !important;
}
[data-ag-theme="dark"] .agnes-btn-secondary:not(:disabled):hover {
  background: rgba(45, 58, 96, 0.85) !important;
  border-color: var(--ag-accent) !important;
  color: #fff !important;
}
[data-ag-theme="dark"] .agnes-btn-ghost {
  background: rgba(21, 29, 54, 0.5) !important;
  border: 1px solid var(--ag-line) !important;
  color: var(--ag-muted) !important;
}
[data-ag-theme="dark"] .agnes-btn-ghost:not(:disabled):hover {
  background: rgba(33, 44, 76, 0.8) !important;
  border-color: var(--ag-accent-2) !important;
  color: var(--ag-t1) !important;
}
[data-ag-theme="dark"] /* --- chips / badges -------------------------------------------------- */
.agnes-size-btn,
[data-ag-theme="dark"] .agnes-ratio-btn,
[data-ag-theme="dark"] .agnes-mode-btn,
[data-ag-theme="dark"] .agcv-style {
  background: rgba(21, 29, 54, 0.72);
  border: 1px solid var(--ag-line-2);
  color: var(--ag-t2);
}
[data-ag-theme="dark"] .agnes-size-btn.active,
[data-ag-theme="dark"] .agnes-ratio-btn.active,
[data-ag-theme="dark"] .agnes-mode-btn.active,
[data-ag-theme="dark"] .agcv-style.active,
[data-ag-theme="dark"] .agnes-mode-card.active {
  background: linear-gradient(120deg, var(--ag-mod), var(--ag-mod-2));
  border-color: transparent;
  color: #04121f;
  box-shadow: 0 10px 26px -14px var(--ag-mod-glow);
}
[data-ag-theme="dark"] .agnes-badge {
  background: rgba(34, 211, 238, 0.12) !important;
  border-color: rgba(34, 211, 238, 0.4) !important;
  color: #7ee7f7 !important;
}
[data-ag-theme="dark"] .agnes-badge-free {
  background: rgba(52, 211, 153, 0.14) !important;
  border-color: rgba(52, 211, 153, 0.45) !important;
  color: #6ee7b7 !important;
}
[data-ag-theme="dark"] .agnes-titlebar-module {
  color: var(--ag-mod) !important;
  background: color-mix(in srgb, var(--ag-mod) 14%, transparent) !important;
  border-color: color-mix(in srgb, var(--ag-mod) 45%, transparent) !important;
}
[data-ag-theme="dark"] .agnes-titlebar-module::before { background: var(--ag-mod); box-shadow: 0 0 8px var(--ag-mod-glow); }
[data-ag-theme="dark"] .agnes-model-info { background: rgba(21, 29, 54, 0.6); border: 1px solid var(--ag-line); }
[data-ag-theme="dark"] .agnes-model-tag-free { color: #04121f !important; }
[data-ag-theme="dark"] .agnes-model-tag:not(.agnes-model-tag-free) { color: var(--ag-mod) !important; background: rgba(21,29,54,.7) !important; }
[data-ag-theme="dark"] /* --- rails / bars / empty states ------------------------------------- */
.agnes-left,
[data-ag-theme="dark"] .agnes-right { background: rgba(13, 19, 38, 0.5); border-color: var(--ag-line); }
[data-ag-theme="dark"] .agnes-left-header,
[data-ag-theme="dark"] .agnes-action-bar,
[data-ag-theme="dark"] .agnes-statusbar { background: rgba(13, 19, 38, 0.7); border-color: var(--ag-line); }
[data-ag-theme="dark"] .agnes-left-header { color: var(--ag-t2) !important; background: rgba(13, 19, 38, 0.8) !important; }
[data-ag-theme="dark"] .agnes-statusbar { color: var(--ag-dim); }
[data-ag-theme="dark"] .agnes-empty-icon {
  background: linear-gradient(135deg, var(--ag-mod), var(--ag-mod-2));
  border: 1px solid rgba(255, 255, 255, 0.22);
  box-shadow: 0 22px 50px -20px var(--ag-mod), inset 0 1px 0 rgba(255,255,255,0.28);
  color: #04121f;
}
[data-ag-theme="dark"] .agnes-empty-title { color: var(--ag-t1); }
[data-ag-theme="dark"] .agnes-empty-desc,
[data-ag-theme="dark"] .agnes-skeleton-text { color: var(--ag-muted) !important; }
[data-ag-theme="dark"] /* --- canvas ---------------------------------------------------------- */
.agc-toolbar { background: rgba(13, 19, 38, 0.72); border-bottom: 1px solid var(--ag-line); }
[data-ag-theme="dark"] .agc-viewport {
  background-color: #070c18;
  background-image:
    radial-gradient(rgba(125, 170, 255, 0.20) 1.2px, transparent 1.2px),
    radial-gradient(820px 380px at 50% 0%, rgba(34, 211, 238, 0.10), transparent 70%);
  background-size: 24px 24px, 100% 100%;
}
[data-ag-theme="dark"] .agc-node {
  background: linear-gradient(180deg, rgba(33, 44, 76, 0.9), rgba(18, 26, 50, 0.95));
  border: 1px solid var(--ag-line-2);
  box-shadow: 0 22px 50px -26px rgba(0, 0, 0, 1), inset 0 1px 0 rgba(255,255,255,0.06);
}
[data-ag-theme="dark"] .agc-node-text,
[data-ag-theme="dark"] .agc-node-prompt {
  background: rgba(9, 14, 30, 0.75) !important;
  border: 1px solid var(--ag-line) !important;
  color: var(--ag-t2) !important;
}
[data-ag-theme="dark"] .agc-node-empty {
  background: rgba(9, 14, 30, 0.6) !important;
  border-color: var(--ag-line-2) !important;
  color: var(--ag-muted) !important;
}
[data-ag-theme="dark"] .agc-node-title { color: #fff !important; }
[data-ag-theme="dark"] .agc-port { background: #0b1020 !important; box-shadow: 0 0 12px rgba(34, 211, 238, 0.6) !important; }
[data-ag-theme="dark"] .agc-port-out { border-color: var(--ag-accent-2) !important; }
[data-ag-theme="dark"] .agc-port-in { border-color: var(--ag-accent) !important; }
[data-ag-theme="dark"] .agc-edge { stroke: var(--ag-accent) !important; filter: drop-shadow(0 0 6px rgba(34,211,238,0.7)); opacity: 0.9; }
[data-ag-theme="dark"] .agc-status { background: rgba(13, 19, 38, 0.8); border-top: 1px solid var(--ag-line); color: var(--ag-dim); font-family: var(--ag-font-mono); }
[data-ag-theme="dark"] /* --- cover / misc ---------------------------------------------------- */
.agcv-poster-slot {
  border-color: color-mix(in srgb, var(--ag-mod) 60%, transparent);
  background: linear-gradient(180deg, color-mix(in srgb, var(--ag-mod) 12%, transparent), rgba(9,14,30,0.5));
  box-shadow: inset 0 0 44px -18px var(--ag-mod);
}
[data-ag-theme="dark"] .agcv-slot-mini { border-color: var(--ag-line-2); background: rgba(9, 14, 30, 0.5); color: var(--ag-dim); }
[data-ag-theme="dark"] .agcv-cover-img { border: 1px solid var(--ag-line-2); box-shadow: 0 30px 70px -26px rgba(0,0,0,1), 0 0 40px -14px var(--ag-mod); }
[data-ag-theme="dark"] .agnes-keyguide { border-color: rgba(251, 191, 36, 0.35); background: linear-gradient(135deg, rgba(251,191,36,0.12), rgba(251,191,36,0.03)); }
[data-ag-theme="dark"] .agnes-keyguide-title { color: #fcd34d; }
[data-ag-theme="dark"] .agnes-keyguide-note,
[data-ag-theme="dark"] .agnes-keyguide-step { color: var(--ag-muted); }
[data-ag-theme="dark"] .agnes-keyguide-num { background: var(--ag-grad); color: #04121f; }
[data-ag-theme="dark"] .agnes-error { border-color: rgba(244,114,182,0.45); background: rgba(244,114,182,0.12); color: #f9a8d4; }
[data-ag-theme="dark"] .agnes-model-select { background: rgba(9, 14, 30, 0.72) !important; color: var(--ag-t1) !important; }
[data-ag-theme="dark"] .agdp-warn { background: rgba(251,191,36,0.12); border-color: rgba(251,191,36,0.35); color: #fcd34d; }
[data-ag-theme="dark"] .agnes-scene-item,
[data-ag-theme="dark"] .agnes-thumb,
[data-ag-theme="dark"] .agnes-storyboard-card {
  background: rgba(21, 29, 54, 0.7);
  border: 1px solid var(--ag-line);
}
[data-ag-theme="dark"] .agnes-progress-bar { background: rgba(125, 170, 255, 0.16); }
[data-ag-theme="dark"] /* --- scrim: barely-there separator,
[data-ag-theme="dark"] no more muddy world ------------- */
[data-dsh-agnes-backdrop] {
  background: rgba(2, 6, 16, 0.22);
  backdrop-filter: blur(1.5px);
}


/* --- solid base colours behind the gradients -------------------------
   Gradients alone leave background-color transparent, which makes layered
   rgba() surfaces composite against nothing (and breaks contrast auditing).
   Give every glass surface a real base so translucency resolves predictably. */
[data-ag-theme="dark"] [data-dsh-agnes-studio] { background-color: #0b1020; }

[data-ag-theme="dark"] .agcv-card,
[data-ag-theme="dark"] .agnes-anchor-card,
[data-ag-theme="dark"] .agnes-anchor-side,
[data-ag-theme="dark"] .agcv-preview,
[data-ag-theme="dark"] .agdp-next,
[data-ag-theme="dark"] .agnes-mode-card,
[data-ag-theme="dark"] .agc-node,
[data-ag-theme="dark"] .agnes-left,
[data-ag-theme="dark"] .agnes-right,
[data-ag-theme="dark"] .agnes-rail,
[data-ag-theme="dark"] .agnes-titlebar,
[data-ag-theme="dark"] .agc-toolbar {
  background-color: #121a30;
}

[data-ag-theme="dark"] .agc-node { background-color: #16203a; }


/* --- active gradient chips: ALL their text must be dark ink ---------- */


.agnes-mode-card.active .agnes-mode-icon,
.agnes-mode-card.active > span { color: #04121f; }

.agnes-size-btn.active, .agnes-ratio-btn.active, .agnes-mode-btn.active,
.agcv-style.active, .agnes-model-tag-free {
  color: #04121f !important;
}

.agdp-next.primary .agdp-next-title,
.agdp-next.primary .agdp-next-sub { color: var(--ag-text) !important; }


/* --- light theme: solid base colours behind its gradients ------------ */
[data-ag-theme="light"][data-dsh-agnes-studio] {
  background-color: #eef3fb;
  --ag-bg-0: #eef3fb;
  --ag-panel: rgba(255, 255, 255, 0.66);
  --ag-panel-solid: #ffffff;
  --ag-panel-strong: rgba(255, 255, 255, 0.9);
  --ag-accent: #06b6d4;
  --ag-accent-2: #7c3aed;
  --ag-accent-3: #db2777;
  --ag-glow: rgba(6, 182, 212, 0.55);
  --ag-glow-accent: 0 10px 26px -12px rgba(6, 182, 212, 0.55);
  background:
    radial-gradient(760px 380px at 10% -6%, rgba(6, 182, 212, 0.20), transparent 60%),
    radial-gradient(700px 360px at 92% -4%, rgba(124, 58, 237, 0.18), transparent 60%),
    radial-gradient(600px 500px at 50% 108%, rgba(219, 39, 119, 0.10), transparent 60%),
    linear-gradient(180deg, #f7fbff 0%, #eaf1fb 55%, #e4ecf9 100%);
  border: 1px solid rgba(255, 255, 255, 0.9);
  box-shadow:
    0 44px 120px -32px rgba(20, 45, 95, 0.42),
    0 0 0 1px rgba(6, 182, 212, 0.16),
    0 0 60px -24px rgba(124, 58, 237, 0.35),
    inset 0 1px 0 #ffffff;
}


[data-ag-theme="light"] .agcv-card,
[data-ag-theme="light"] .agnes-anchor-card,
[data-ag-theme="light"] .agnes-anchor-side,
[data-ag-theme="light"] .agcv-preview,
[data-ag-theme="light"] .agdp-next,
[data-ag-theme="light"] .agnes-mode-card,
[data-ag-theme="light"] .agnes-left,
[data-ag-theme="light"] .agnes-right,
[data-ag-theme="light"] .agnes-rail,
[data-ag-theme="light"] .agnes-titlebar,
[data-ag-theme="light"] .agc-toolbar { background-color: #ffffff; }

[data-ag-theme="light"] .agc-node { background-color: #ffffff; }

/* --- theme toggle in the header -------------------------------------- */
.agnes-theme-toggle,
.agnes-size-toggle {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 30px;
  padding: 0 11px;
  border-radius: 999px;
  background: var(--ag-surface-2);
  border: 1px solid var(--ag-line);
  color: var(--ag-text-2);
  font-family: var(--ag-font-mono);
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.08em;
  cursor: pointer;
  transition: all 0.16s var(--ag-ease);
}

.agnes-theme-toggle:hover ,
.agnes-size-toggle:hover {
  border-color: var(--ag-accent);
  color: var(--ag-text);
}

/* the scrim stays subtle in BOTH themes (it is not inside the theme root) */




.agnes-model-tag-free {
  background: var(--ag-grad) !important;
  border-color: transparent !important;
  color: #04121f !important;
}
`
