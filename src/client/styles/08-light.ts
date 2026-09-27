/**
 * 浅色（白玻璃）主题
 *
 * 层叠顺序：第 8/12 层（顺序即生效顺序，后写的覆盖先写的）。
 * 由原 styles.ts 第 3042-3670 行机械切分而来，内容逐字未改。
 */
export const LIGHT_CSS = `/* ═══════════════════════════════════════════════════════════════════════
   v5 — 光洁科技感（对齐 soft.zmm168.top 的视觉语言）
   浅色底 + 半透明白面板 + 青色主色 + 渐变 CTA + HUD 角标 + 等宽大写微标签。
   ═══════════════════════════════════════════════════════════════════════ */



/* faint engineering grid behind everything */
[data-dsh-agnes-studio]::after {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background-image:
    linear-gradient(rgba(32, 74, 150, 0.045) 1px, transparent 1px),
    linear-gradient(90deg, rgba(32, 74, 150, 0.045) 1px, transparent 1px);
  background-size: 28px 28px;
  mask-image: radial-gradient(circle at 50% 0%, #000 0%, transparent 78%);
  z-index: 0;
}



/* --- title bar: white glass, navy type, mono subtitle ---------------- */












/* --- tabs: white pills, gradient active ------------------------------ */








/* --- section titles: mono uppercase eyebrow (as on the reference) ---- */





/* --- cards: white glass + HUD corner brackets ------------------------ */
.agcv-card,
.agnes-anchor-card {
  position: relative;
  border: 1px solid var(--ag-line);
  border-radius: var(--ag-radius);
  background: var(--ag-panel-strong);
  box-shadow: var(--ag-glow-soft);
  backdrop-filter: blur(8px);
  padding: 16px;
}

.agcv-card::before,
.agnes-anchor-card::before,
.agcv-preview::before,
.agnes-anchor-side::before {
  content: '';
  position: absolute;
  top: 9px;
  left: 9px;
  width: 16px;
  height: 16px;
  border: 2px solid var(--ag-mod, var(--ag-accent));
  border-right: 0;
  border-bottom: 0;
  border-radius: 6px 0 0 0;
  opacity: 0.7;
  pointer-events: none;
}

.agcv-card::after,
.agnes-anchor-card::after,
.agcv-preview::after,
.agnes-anchor-side::after {
  content: '';
  position: absolute;
  bottom: 9px;
  right: 9px;
  width: 16px;
  height: 16px;
  border: 2px solid var(--ag-mod, var(--ag-accent));
  border-left: 0;
  border-top: 0;
  border-radius: 0 0 6px 0;
  opacity: 0.7;
  pointer-events: none;
}



/* --- buttons: gradient pill CTA -------------------------------------- */






.agnes-btn-secondary:not(:disabled):hover {
  border-color: var(--ag-accent) !important;
  color: var(--ag-accent) !important;
}






/* --- form controls: white fields, cyan focus ------------------------- */
[data-dsh-agnes-studio] input:not([type="checkbox"]):not([type="radio"]):not([type="file"]):not(.agc-node-title),
[data-dsh-agnes-studio] select,
[data-dsh-agnes-studio] textarea {
  background: #ffffff !important;
  border: 1px solid var(--ag-line-2) !important;
  color: var(--ag-t1) !important;
  border-radius: var(--ag-radius-sm) !important;
  box-shadow: inset 0 1px 2px rgba(24, 50, 100, 0.04);
}

[data-dsh-agnes-studio] input::placeholder,
[data-dsh-agnes-studio] textarea::placeholder { color: #96a5c0 !important; }

[data-dsh-agnes-studio] input:not(.agc-node-title):focus,
[data-dsh-agnes-studio] select:focus,
[data-dsh-agnes-studio] textarea:focus {
  border-color: var(--ag-accent) !important;
  box-shadow: 0 0 0 3px rgba(8, 145, 178, 0.16) !important;
}

/* --- empty states: gradient icon chip ------------------------------- */





/* --- cover / anchor preview: white HUD panels ----------------------- */
.agcv-preview,
.agnes-anchor-side {
  position: relative;
  background:
    radial-gradient(620px 300px at 50% 0%, var(--ag-mod-soft), transparent 68%),
    var(--ag-panel-strong);
  border: 1px solid var(--ag-line);
  border-radius: var(--ag-radius);
  box-shadow: var(--ag-glow-soft);
  backdrop-filter: blur(8px);
}








.agcv-style.active {
  background: linear-gradient(120deg, var(--ag-mod), var(--ag-mod-2));
  border-color: transparent;
  color: #fff;
  box-shadow: 0 10px 24px -14px var(--ag-mod-glow);
}

/* --- anchor mode cards ---------------------------------------------- */
.agnes-mode-card {
  position: relative;
  background: var(--ag-panel-strong);
  border: 1px solid var(--ag-line);
  border-radius: var(--ag-radius);
  color: var(--ag-t2);
  box-shadow: var(--ag-glow-soft);
}








/* --- canvas: light engineering surface ------------------------------ */










.agc-node-text,
.agc-node-prompt {
  background: #ffffff !important;
  border: 1px solid var(--ag-line) !important;
  color: var(--ag-t2) !important;
  box-shadow: none !important;
}

.agc-node-text:focus,
.agc-node-prompt:focus {
  border-color: var(--ag-accent) !important;
  box-shadow: 0 0 0 3px rgba(8,145,178,0.16) !important;
}










/* --- misc: light surfaces for rails, bars, badges ------------------- */
.agnes-left, .agnes-right {
  background: rgba(255, 255, 255, 0.5);
  border-color: var(--ag-line);
}

.agnes-left-header,
.agnes-action-bar,
.agnes-statusbar
{ color: var(--ag-muted); }

.agnes-action-bar, .agnes-statusbar {
  background: rgba(255, 255, 255, 0.62);
  border-color: var(--ag-line);
}

.agnes-statusbar { font-family: var(--ag-font-mono); font-size: 10.5px; letter-spacing: 0.06em; color: var(--ag-dim); }








.agnes-keyguide-note, .agnes-keyguide-step { color: #6b7280; }




.agnes-scene-item, .agnes-thumb, .agnes-storyboard-card {
  background: #ffffff;
  border: 1px solid var(--ag-line);
  box-shadow: 0 2px 8px -6px rgba(24, 50, 100, 0.5);
}

.agnes-scene-item:hover, .agnes-thumb:hover { border-color: var(--ag-accent); box-shadow: var(--ag-glow-accent); }

.agnes-size-btn, .agnes-ratio-btn, .agnes-mode-btn {
  background: #ffffff;
  border: 1px solid var(--ag-line-2);
  color: var(--ag-muted);
}

.agnes-size-btn.active, .agnes-ratio-btn.active, .agnes-mode-btn.active {
  background: linear-gradient(120deg, var(--ag-mod), var(--ag-mod-2));
  border-color: transparent;
  color: #fff;
  box-shadow: 0 10px 24px -14px var(--ag-mod-glow);
}

.angles-progress-fill, .agnes-progress-fill {
  background: var(--ag-grad) !important;
  box-shadow: none;
}











.agdp-next {
  background: var(--ag-panel-strong);
  border: 1px solid var(--ag-line);
  box-shadow: var(--ag-glow-soft);
  border-radius: var(--ag-radius);
}








/* scrollbars for light surfaces */






/* --- v5 canvas polish: ports + node headers on the light surface ----- */









.agc-node-text  { border-color: rgba(124,58,237,0.35) !important; }







/* HUD corner marks on the canvas viewport = instrument-panel feel */
.agc-viewport::before,
.agc-viewport::after {
  content: '';
  position: absolute;
  width: 22px;
  height: 22px;
  border: 2px solid var(--ag-accent);
  opacity: 0.45;
  pointer-events: none;
  z-index: 5;
}
.agc-viewport::before { top: 10px; left: 10px; border-right: 0; border-bottom: 0; border-radius: 8px 0 0 0; }
.agc-viewport::after { bottom: 10px; right: 10px; border-left: 0; border-top: 0; border-radius: 0 0 8px 0; }

/* centre preview stage gets HUD brackets + a mono status line */

.agnes-preview-area::before,
.agnes-preview-area::after {
  content: '';
  position: absolute;
  width: 22px;
  height: 22px;
  border: 2px solid var(--ag-mod, var(--ag-accent));
  opacity: 0.4;
  pointer-events: none;
}
.agnes-preview-area::before { top: 12px; left: 12px; border-right: 0; border-bottom: 0; border-radius: 8px 0 0 0; }
.agnes-preview-area::after { bottom: 12px; right: 12px; border-left: 0; border-top: 0; border-radius: 0 0 8px 0; }

.agnes-skeleton-text,
.agnes-empty-desc {
  font-family: var(--ag-font-mono);
  font-size: 11px;
  letter-spacing: 0.04em;
  color: var(--ag-dim);
}


/* --- v5 contrast fixes (found by the contrast audit) ------------------ */
.agnes-left-header {
  color: var(--ag-t1) !important;
  background: rgba(255, 255, 255, 0.72) !important;
  border-bottom: 1px solid var(--ag-line) !important;
  font-weight: 700;
}



.agnes-empty-desc, .agnes-skeleton-text { color: var(--ag-muted) !important; }




.agnes-mode-card.active {
  background: linear-gradient(120deg, var(--ag-mod), var(--ag-mod-2));
  border-color: transparent;
  color: #fff;
  box-shadow: 0 14px 30px -16px var(--ag-mod-glow);
}

.agnes-progress-fill {
  height: 100%;
  border-radius: 2px;
  transition: width 0.3s ease;
  background: var(--ag-grad) !important;
  box-shadow: none;
}

.agnes-thumb:hover {
  transform: scale(1.03);
  border-color: var(--ag-accent);
  box-shadow: var(--ag-glow-accent);
}
`
