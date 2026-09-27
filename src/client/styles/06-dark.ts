/**
 * 暗色主题精修
 *
 * 层叠顺序：第 6/12 层（顺序即生效顺序，后写的覆盖先写的）。
 * 由原 styles.ts 第 2031-2773 行机械切分而来，内容逐字未改。
 */
export const DARK_CSS = `/* ═══════════════════════════════════════════════════════════════════════
   v3 — cinematic dark studio
   Layering rule: surface-0 (void) → 1 (card) → 2 (raised) → 3 (hover) → 4 (active).
   Colour rule: violet = primary/action, cyan = image, pink = video. Accent is
   scarce so it always points at the next action.
   ═══════════════════════════════════════════════════════════════════════ */

/* --- title bar: dark with a gradient hairline, not a purple slab ------ */


.agnes-titlebar::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: -1px;
  height: 2px;
  background: var(--ag-grad-3);
  opacity: 0.9;
  background-size: 220% 100%;
  animation: ag-topflow 5s linear infinite;
  background-image: linear-gradient(90deg,
    transparent 0%, var(--ag-accent) 25%, #ffffff 50%, var(--ag-accent-2) 75%, transparent 100%);
}










/* --- tab bar: segmented pills with a glowing active state ------------- */












/* --- surfaces: cards that actually lift off the void ------------------ */



.agnes-left,
.agnes-right,
.agnes-center { background: transparent; }

.agnes-right,
.agnes-left {
  border-color: var(--ag-line);
  background: rgba(0, 0, 0, 0.22);
}

/* --- controls: visible borders + a real focus state ------------------- */
.agnes-textarea,
.agnes-select,
.agnes-input-row input,
.agcv-field input,
.agcv-field textarea,
.agcv-field select,
.agc-node-text,
.agc-node-prompt {
  background: rgba(0, 0, 0, 0.42) !important;
  border: 1px solid var(--ag-line-strong) !important;
  border-radius: 10px !important;
  color: var(--ag-text) !important;
  font-size: 13px;
  transition: border-color 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
}

.agnes-textarea::placeholder,
.agcv-field input::placeholder,
.agcv-field textarea::placeholder { color: rgba(169,169,196,0.42); }

.agnes-textarea:focus,
.agnes-select:focus,
.agcv-field input:focus,
.agcv-field textarea:focus,
.agcv-field select:focus,
.agc-node-text:focus,
.agc-node-prompt:focus {
  outline: none;
  border-color: var(--ag-accent) !important;
  box-shadow: 0 0 0 3px rgba(124, 92, 255, 0.22), 0 0 18px -6px rgba(124,92,255,0.8) !important;
  background: rgba(0, 0, 0, 0.55) !important;
}

/* --- buttons: three clear weights, primary glows ---------------------- */




.agnes-btn-primary:not(:disabled):hover {
  box-shadow: 0 14px 34px -12px rgba(124, 92, 255, 1), inset 0 1px 0 rgba(255,255,255,0.4);
  filter: brightness(1.08);
  animation: ag-border-spin 1.4s linear infinite, ag-pulse 1.6s ease-in-out infinite;
  transform: translateY(-1px);
}




.agnes-btn-secondary:not(:disabled):hover {
  background: var(--ag-surface-4);
  border-color: rgba(167, 139, 250, 0.6);
}










/* --- canvas: coloured node grammar ----------------------------------- */








/* type colour on the node header + left edge */
.agc-node-text  .agc-node-head {
  background: linear-gradient(180deg, rgba(124,58,237,0.16), rgba(124,58,237,0.04)) !important;
}

.agc-node-image .agc-node-head {
  background: linear-gradient(180deg, rgba(8,145,178,0.18), rgba(8,145,178,0.04)) !important;
}

.agc-node-video .agc-node-head {
  background: linear-gradient(180deg, rgba(219,39,119,0.16), rgba(219,39,119,0.04)) !important;
}


.agc-node-text  { border-color: rgba(124,92,255,0.45); }
.agc-node-image {
  border-color: rgba(8,145,178,0.38) !important;
}

.agc-node-video {
  border-color: rgba(219,39,119,0.35) !important;
}















/* --- cover: poster-wall preview -------------------------------------- */
.agcv-card {
  background: linear-gradient(180deg, var(--ag-surface-2), var(--ag-surface-1));
  border: 1px solid var(--ag-line-strong);
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.06);
}



.agcv-preview {
  background:
    radial-gradient(600px 300px at 50% 0%, rgba(124,92,255,0.14), transparent 70%),
    repeating-linear-gradient(45deg, rgba(255,255,255,0.014) 0 12px, transparent 12px 24px),
    rgba(0, 0, 0, 0.35);
  border: 1px solid var(--ag-line-strong);
  min-height: 460px;
}





.agcv-style.active {
  background: linear-gradient(135deg, rgba(124,92,255,0.95), rgba(34,211,238,0.75));
  border-color: rgba(190, 175, 255, 0.8);
  color: #fff;
  box-shadow: var(--ag-glow);
}



/* --- anchor: mode picker as cards ------------------------------------ */
.agnes-anchor .agnes-btn[title] {
  height: auto;
  min-height: 44px;
  line-height: 1.35;
  white-space: normal;
  text-align: center;
  border-radius: 12px;
  font-weight: 600;
  padding: 10px 12px;
}










/* --- misc polish ------------------------------------------------------ */





/* --- v3 sweep: components still on host theme tokens ---------------- */
.agnes-size-btn,
.agnes-ratio-btn,
.agnes-mode-btn,
.agnes-ref-chip,
.agnes-ref-chip-add,
.agnes-storyboard-card,
.agnes-setting-row {
  background: var(--ag-surface-2);
  border: 1px solid var(--ag-line-strong);
  color: var(--ag-text-2);
}

.agnes-size-btn { height: 32px; border-radius: 9px; font-size: 11.5px; font-weight: 600; }
.agnes-ratio-btn { height: 30px; border-radius: 9px; font-size: 11px; font-weight: 600; }

.agnes-size-btn:hover,
.agnes-ratio-btn:hover,
.agnes-mode-btn:hover,
.agnes-ref-chip-add:hover {
  background: var(--ag-surface-3);
  border-color: var(--ag-accent-2);
  color: var(--ag-text);
}

.agnes-size-btn.active,
.agnes-ratio-btn.active,
.agnes-mode-btn.active {
  background: linear-gradient(135deg, #7c5cff, #a78bfa);
  border-color: rgba(190, 175, 255, 0.8);
  color: #fff;
  box-shadow: 0 6px 18px -8px rgba(124, 92, 255, 1);
}

/* model picker: a proper card instead of a bare native select */







/* left rail: scene/asset items */
.agnes-left-header {
  background: rgba(0, 0, 0, 0.3);
  border-bottom: 1px solid var(--ag-line);
  color: var(--ag-text-2);
  font-weight: 600;
}

.agnes-left { background: rgba(0, 0, 0, 0.32); }

.agnes-scene-item {
  background: var(--ag-surface-1);
  border: 1px solid var(--ag-line);
  border-radius: 10px;
  transition: all 0.15s ease;
}

.agnes-scene-item:hover {
  background: var(--ag-surface-2);
  border-color: var(--ag-accent-2);
}

.agnes-thumb {
  border: 1px solid var(--ag-line-strong);
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.4);
  transition: all 0.15s ease;
}


/* empty states: bigger, with a glowing disc behind the glyph */






/* action bar + status bar */
.agnes-action-bar {
  background: rgba(0, 0, 0, 0.35);
  border-top: 1px solid var(--ag-line);
}

.agnes-statusbar {
  background: rgba(0, 0, 0, 0.45);
  border-top: 1px solid var(--ag-line);
  color: var(--ag-text-3);
}

/* settings rows */






/* canvas nodes: lift the body off the card so text reads */




.agc-node-text { min-height: 104px; }

/* anchor mode picker: readable cards with a clear selected state */



/* --- cover: poster-frame empty state --------------------------------- */
.agcv-poster-slot {
  width: 210px;
  aspect-ratio: 3 / 4;
  border-radius: 14px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  border-color: var(--ag-mod);
  border: 1.5px dashed var(--ag-line-2);
  background: linear-gradient(180deg, rgba(8,145,178,0.07), rgba(124,58,237,0.04));
  box-shadow: none;
}


.agcv-poster-slot .agnes-empty-icon {
  width: 64px;
  height: 64px;
  border-radius: 20px;
  font-size: 28px;
  margin-bottom: 6px;
}

.agcv-poster-title {
  font-size: 13px;
  font-weight: 700;
  color: var(--ag-text-2);
}

.agcv-slot-row {
  display: flex;
  gap: 10px;
  margin-top: 14px;
}

.agcv-slot-mini {
  width: 54px;
  aspect-ratio: 3 / 4;
  border: 1px dashed var(--ag-line-strong);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  border-color: var(--ag-line-2);
  background: rgba(255,255,255,0.6);
  color: var(--ag-dim);
}



/* --- v3: blanket form-control surface -------------------------------
   The drama/settings panels use plain <select>/<input> with no class, so
   per-class overrides kept missing them and they rendered with the host
   theme's indigo fill. Style every control inside the panel instead. */
[data-dsh-agnes-studio] input:not([type="checkbox"]):not([type="radio"]):not([type="file"]):not(.agc-node-title),
[data-dsh-agnes-studio] select,
[data-dsh-agnes-studio] textarea {
  background: rgba(0, 0, 0, 0.42) !important;
  border: 1px solid var(--ag-line-strong) !important;
  border-radius: 9px !important;
  color: var(--ag-text) !important;
  font-family: inherit !important;
  font-size: 12.5px !important;
  padding: 6px 9px !important;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

[data-dsh-agnes-studio] input:not([type="checkbox"]):not([type="radio"]):not([type="file"]):not(.agc-node-title):focus,
[data-dsh-agnes-studio] select:focus,
[data-dsh-agnes-studio] textarea:focus {
  outline: none !important;
  border-color: var(--ag-accent) !important;
  box-shadow: 0 0 0 3px rgba(124, 92, 255, 0.22) !important;
}

[data-dsh-agnes-studio] select option {
  background: #16161f;
  color: var(--ag-text);
}

[data-dsh-agnes-studio] input[type="checkbox"] {
  accent-color: var(--ag-accent);
  width: 15px;
  height: 15px;
  cursor: pointer;
}

/* --- anchor: mode cards with an unmistakable selected state --------- */
.agnes-mode-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 10px;
}

.agnes-mode-card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 5px;
  padding: 13px 14px;
  border-radius: 13px;
  border: 1px solid var(--ag-line-strong);
  background: linear-gradient(180deg, var(--ag-surface-2), var(--ag-surface-1));
  color: var(--ag-text-2);
  font-family: inherit;
  font-size: 13px;
  font-weight: 600;
  text-align: left;
  cursor: pointer;
  transition: all 0.15s ease;
}

.agnes-mode-card:hover {
  border-color: var(--ag-line-2);
  color: var(--ag-t1);
  transform: translateY(-2px);
}


.agnes-mode-card .agnes-mode-icon { font-size: 20px; line-height: 1; }

.agnes-mode-card .agnes-mode-desc {
  font-size: 11px;
  font-weight: 400;
  line-height: 1.45;
  color: var(--ag-dim);
}



.agnes-mode-card.active .agnes-mode-desc {
  color: rgba(4, 18, 31, 0.82) !important;
}


/* --- anchor: two-column workbench so wide panels are not a void ------ */
.agnes-anchor-grid {
  display: grid;
  grid-template-columns: minmax(340px, 460px) 1fr;
  gap: 18px;
  align-items: start;
  padding: 16px;
}

@media (max-width: 1000px) {
  .agnes-anchor-grid { grid-template-columns: 1fr; }
}

.agnes-anchor-col { display: flex; flex-direction: column; gap: 14px; }

.agnes-anchor-card {
  border: 1px solid var(--ag-line-strong);
  border-radius: var(--ag-radius);
  background: linear-gradient(180deg, var(--ag-surface-2), var(--ag-surface-1));
  padding: 14px;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.05);
}

.agnes-anchor-side {
  border: 1px solid var(--ag-line-strong);
  border-radius: var(--ag-radius);
  background:
    radial-gradient(600px 280px at 50% 0%, rgba(124,92,255,0.13), transparent 70%),
    rgba(0, 0, 0, 0.3);
  min-height: 460px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 20px;
}

.agnes-anchor-side video {
  width: 100%;
  border-radius: 12px;
  border: 1px solid rgba(190, 175, 255, 0.4);
  box-shadow: 0 24px 54px -22px rgba(0,0,0,1), 0 0 34px -14px rgba(124,92,255,0.8);
}


/* --- canvas node title: inline editable, never a form field ---------- */


.agc-node-title:hover {
  background: rgba(32, 74, 150, 0.06) !important;
}


.agc-node-title:focus {
  background: rgba(0, 0, 0, 0.5) !important;
  border-color: rgba(255, 255, 255, 0.4) !important;
  box-shadow: none !important;
}

/* node body text a touch taller so short paragraphs are not clipped */
.agc-node-text { min-height: 118px; }



`
