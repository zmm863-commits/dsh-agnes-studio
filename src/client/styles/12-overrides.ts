/**
 * 末期覆盖与禁用态修正
 *
 * 层叠顺序：第 12/12 层（顺序即生效顺序，后写的覆盖先写的）。
 * 由原 styles.ts 第 4394-4672 行机械切分而来，内容逐字未改。
 */
export const OVERRIDES_CSS = `/* ═══════════════════════════════════════════════════════════════════════
   v9 — 亮色「炫酷科技」强化
   亮色不再是素白：加彩色环境光、玻璃面板、渐变描边、彩色辉光，
   并把扫光改成在浅底上也看得见的高光。
   ═══════════════════════════════════════════════════════════════════════ */



/* 顶部一道彩色光带 */
[data-ag-theme="light"] .agnes-titlebar {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.92), rgba(255, 255, 255, 0.6));
  border-bottom: 1px solid rgba(6, 182, 212, 0.22);
}

[data-ag-theme="light"] .agnes-rail {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.7), rgba(238, 243, 251, 0.6));
  border-right: 1px solid rgba(6, 182, 212, 0.2);
}

[data-ag-theme="light"] .agnes-rail-item.active {
  background: linear-gradient(135deg, rgba(6, 182, 212, 0.16), rgba(124, 58, 237, 0.12));
  border-color: rgba(6, 182, 212, 0.5);
  box-shadow: 0 12px 28px -16px rgba(6, 182, 212, 0.9), inset 0 1px 0 rgba(255,255,255,0.9);
}

/* 玻璃卡片：渐变描边（亮底上才看得见） */
[data-ag-theme="light"] .agcv-card,
[data-ag-theme="light"] .agnes-anchor-card,
[data-ag-theme="light"] .agnes-anchor-side,
[data-ag-theme="light"] .agcv-preview,
[data-ag-theme="light"] .agdp-next {
  position: relative;
  border: 1.5px solid transparent !important;
  background:
    linear-gradient(180deg, #ffffff, #f7fafe) padding-box,
    linear-gradient(135deg, rgba(6,182,212,0.55), rgba(124,58,237,0.35), rgba(255,255,255,0.9)) border-box !important;
  box-shadow:
    0 18px 42px -24px rgba(20, 45, 95, 0.42),
    0 0 0 1px rgba(255, 255, 255, 0.7) inset,
    0 0 34px -22px rgba(6, 182, 212, 0.7) !important;
  backdrop-filter: blur(10px);
}

[data-ag-theme="light"] .agcv-card:hover,
[data-ag-theme="light"] .agnes-anchor-card:hover,
[data-ag-theme="light"] .agdp-next:hover {
  background:
    linear-gradient(180deg, #ffffff, #f2f8ff) padding-box,
    conic-gradient(from var(--ag-angle),
      rgba(6,182,212,0.9), rgba(124,58,237,0.7), rgba(219,39,119,0.6), rgba(6,182,212,0.9)) border-box !important;
  box-shadow:
    0 22px 50px -24px rgba(20, 45, 95, 0.5),
    0 0 30px -8px rgba(6, 182, 212, 0.75),
    0 0 60px -20px rgba(124, 58, 237, 0.5) !important;
  animation: ag-border-spin 3s linear infinite;
}

/* 亮底上的扫光：收敛成一条高亮带（白扫光在浅底看不见） */
[data-ag-theme="light"] .agnes-btn::after {
  background: linear-gradient(100deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.55) 42%,
    rgba(255, 255, 255, 1) 50%,
    rgba(255, 255, 255, 0.55) 58%,
    rgba(255, 255, 255, 0) 100%);
  mix-blend-mode: screen;
}

/* 次级/幽灵按钮在亮底上的描边流光 */
[data-ag-theme="light"] .agnes-btn-secondary,
[data-ag-theme="light"] .agnes-btn-ghost {
  background: rgba(255, 255, 255, 0.92) !important;
  border: 1.5px solid transparent !important;
  background-image:
    linear-gradient(#ffffff, #ffffff),
    linear-gradient(135deg, rgba(6,182,212,0.5), rgba(124,58,237,0.3)) !important;
  background-origin: border-box !important;
  background-clip: padding-box, border-box !important;
  color: var(--ag-t2) !important;
  box-shadow: 0 6px 18px -12px rgba(20, 45, 95, 0.55);
}

[data-ag-theme="light"] .agnes-btn-secondary:not(:disabled):hover,
[data-ag-theme="light"] .agnes-btn-ghost:not(:disabled):hover {
  color: var(--ag-accent) !important;
  box-shadow: 0 0 0 1px rgba(6,182,212,0.6), 0 0 22px -6px rgba(6,182,212,0.7) !important;
}

/* 选中胶囊：亮底上用饱和渐变 + 彩色投影 */
[data-ag-theme="light"] .agnes-size-btn.active,
[data-ag-theme="light"] .agnes-ratio-btn.active,
[data-ag-theme="light"] .agnes-mode-btn.active,
[data-ag-theme="light"] .agcv-style.active,
[data-ag-theme="light"] .agnes-mode-card.active {
  background: linear-gradient(120deg, var(--ag-mod), var(--ag-mod-2)) !important;
  color: #ffffff !important;
  border-color: transparent !important;
  box-shadow: 0 12px 26px -12px var(--ag-mod), 0 0 0 1px rgba(255,255,255,0.5) inset !important;
}

[data-ag-theme="light"] .agnes-mode-card.active .agnes-mode-desc { color: rgba(255,255,255,0.92) !important; }
[data-ag-theme="light"] .agnes-mode-card.active,
[data-ag-theme="light"] .agnes-mode-card.active > span { color: #ffffff !important; }

/* 输入框：干净白底 + 青色聚焦光环 */
[data-ag-theme="light"] input:not([type="checkbox"]):not([type="radio"]):not([type="file"]):not(.agc-node-title),
[data-ag-theme="light"] select,
[data-ag-theme="light"] textarea {
  background: rgba(255, 255, 255, 0.95) !important;
  border: 1px solid rgba(6, 182, 212, 0.28) !important;
  color: var(--ag-t1) !important;
  box-shadow: inset 0 1px 2px rgba(20, 45, 95, 0.05) !important;
}

[data-ag-theme="light"] input:not(.agc-node-title):focus,
[data-ag-theme="light"] select:focus,
[data-ag-theme="light"] textarea:focus {
  border-color: var(--ag-accent) !important;
  box-shadow: 0 0 0 3px rgba(6, 182, 212, 0.18), 0 0 22px -8px rgba(6,182,212,0.8) !important;
}

/* HUD 角标在亮底上换成青→紫 */
[data-ag-theme="light"] .agcv-card::before,
[data-ag-theme="light"] .agcv-card::after,
[data-ag-theme="light"] .agnes-anchor-card::before,
[data-ag-theme="light"] .agnes-anchor-card::after,
[data-ag-theme="light"] .agcv-preview::before,
[data-ag-theme="light"] .agcv-preview::after,
[data-ag-theme="light"] .agnes-anchor-side::before,
[data-ag-theme="light"] .agnes-anchor-side::after {
  border-color: var(--ag-accent);
  opacity: 0.75;
}

[data-ag-theme="light"] .agnes-tab,
[data-ag-theme="light"] .agnes-badge {
  background: rgba(255, 255, 255, 0.85);
}

[data-ag-theme="light"] .agnes-section-title {
  color: #33456b !important;
}

[data-ag-theme="light"] .agcv-card-title {
  color: var(--ag-mod-ink, #0e7490) !important;
}

.agnes-theme-toggle,
.agnes-size-toggle { position: relative; z-index: 3; }


/* ═══════════════════════════════════════════════════════════════════════
   v10 — 亮色对比度修正（实测像素审计抓出来的 13 处）
   病根：亮色主题里"白色文字压在亮粉彩模块色上"。
   规则：① 浅底上的渐变 chip 一律用深色字；
        ② 主 CTA 换成深色品牌渐变 + 白字（对齐参考站，且有对比度）。
   ═══════════════════════════════════════════════════════════════════════ */

/* ① 主 CTA：深青→深紫，白字（白字在浅粉彩上是 2.0，在深渐变上是 5-7） */
[data-ag-theme="light"] .agnes-btn-primary:not(:disabled) {
  background:
    linear-gradient(120deg, #0e7490, #4c1d95) padding-box,
    conic-gradient(from var(--ag-angle),
      rgba(255, 255, 255, 0.25),
      #22d3ee,
      rgba(255, 255, 255, 0.95),
      #a78bfa,
      rgba(255, 255, 255, 0.25) 100%) border-box !important;
  color: #ffffff !important;
  box-shadow: 0 12px 30px -14px rgba(14, 116, 144, 0.85), 0 0 26px -12px rgba(76, 29, 149, 0.8) !important;
}

[data-ag-theme="light"] .agnes-btn-primary:not(:disabled):hover {
  box-shadow: 0 16px 38px -14px rgba(14, 116, 144, 0.95), 0 0 34px -10px rgba(76, 29, 149, 0.9) !important;
}

/* ② 亮底上的渐变 chip：文字改深色（与深色主题一致） */
[data-ag-theme="light"] .agnes-size-btn.active,
[data-ag-theme="light"] .agnes-ratio-btn.active,
[data-ag-theme="light"] .agnes-mode-btn.active,
[data-ag-theme="light"] .agcv-style.active,
[data-ag-theme="light"] .agnes-mode-card.active,
[data-ag-theme="light"] .agnes-mode-card.active > span,
[data-ag-theme="light"] .agnes-mode-card.active .agnes-mode-icon,
[data-ag-theme="light"] .agnes-mode-card.active .agnes-mode-desc,
[data-ag-theme="light"] .agnes-model-tag-free {
  color: #06121f !important;
}

[data-ag-theme="light"] .agnes-mode-card.active .agnes-mode-desc {
  color: rgba(6, 18, 31, 0.78) !important;
}

[data-ag-theme="light"] .agnes-mode-card.active {
  box-shadow: 0 14px 30px -14px var(--ag-mod), inset 0 1px 0 rgba(255,255,255,0.6) !important;
}

/* ③ 卡片小标题（青色 #06b6d4 在白色上只有 2.45）→ 用深色 ink */




[data-ag-theme="light"] .agnes-badge {
  color: var(--ag-mod-ink, #0e7490) !important;
  border-color: var(--ag-mod, #06b6d4) !important;
}

[data-ag-theme="light"] .agnes-model-tag:not(.agnes-model-tag-free) {
  color: var(--ag-mod-ink, #0e7490) !important;
}

[data-ag-theme="light"] .agnes-titlebar-module { color: var(--ag-mod-ink, #0e7490) !important; }
[data-ag-theme="light"] .agnes-titlebar-module::before { background: var(--ag-mod-ink, #0e7490); }

[data-ag-theme="light"] .agnes-setting-group-title { color: var(--ag-mod-ink, #0e7490) !important; }

/* ④ 亮底上的空状态图标：深字压在亮渐变上 */
[data-ag-theme="light"] .agnes-empty-icon { color: #06121f; }


/* --- disabled primary: inert-looking but still legible (was 2.0:1) ---- */
.agnes-btn-primary:disabled,
[data-ag-theme="light"] .agnes-btn-primary:disabled,
[data-ag-theme="dark"] .agnes-btn-primary:disabled {
  background: linear-gradient(120deg, rgba(148, 163, 184, 0.42), rgba(148, 163, 184, 0.26)) !important;
  border: 1.5px solid rgba(100, 116, 139, 0.35) !important;
  color: #55637a !important;
  box-shadow: none !important;
  animation: none !important;
  filter: none !important;
}

[data-ag-theme="dark"] .agnes-btn-primary:disabled {
  background: linear-gradient(120deg, rgba(120, 140, 180, 0.22), rgba(120, 140, 180, 0.12)) !important;
  border-color: rgba(140, 160, 200, 0.28) !important;
  color: #93a3c0 !important;
}

.agnes-btn-primary:disabled::after { animation: none !important; opacity: 0 !important; }


/* --- disabled primary: the muted palette already reads as inactive, so do
   NOT also fade to 0.42 (that made the label nearly invisible). ---------- */
.agnes-btn-primary:disabled,
.agnes-btn-primary:disabled:hover {
  opacity: 1 !important;
  background: linear-gradient(120deg, rgba(148, 163, 184, 0.5), rgba(148, 163, 184, 0.3)) !important;
  border: 1.5px solid rgba(100, 116, 139, 0.42) !important;
  color: #52627c !important;
  box-shadow: none !important;
  animation: none !important;
  filter: none !important;
  transform: none !important;
}

[data-ag-theme="dark"] .agnes-btn-primary:disabled,
[data-ag-theme="dark"] .agnes-btn-primary:disabled:hover {
  background: linear-gradient(120deg, rgba(120, 140, 180, 0.26), rgba(120, 140, 180, 0.14)) !important;
  border-color: rgba(140, 160, 200, 0.3) !important;
  color: #a7b6d1 !important;
}

`
