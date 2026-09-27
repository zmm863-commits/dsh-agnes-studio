/**
 * 模块配色：每个页签一套色
 *
 * 层叠顺序：第 7/12 层（顺序即生效顺序，后写的覆盖先写的）。
 * 由原 styles.ts 第 2774-3041 行机械切分而来，内容逐字未改。
 */
export const MODULE_CSS = `/* ═══════════════════════════════════════════════════════════════════════
   v4 — 剪映式「浓烈创作感」
   每个模块一套主题色：标签、区块标题、主按钮、进度、空状态都跟着走。
   ═══════════════════════════════════════════════════════════════════════ */

/* --- module palettes: set on the panel root by the active tab --------- */
.agnes-root {
  --ag-mod-ink: #0e7490;
  --ag-mod: #7c5cff;
  --ag-mod-2: #a78bfa;
  --ag-mod-soft: rgba(124, 92, 255, 0.18);
  --ag-mod-glow: rgba(124, 92, 255, 0.65);
}
.agnes-mod-image      { --ag-mod-ink: #0e7490; --ag-mod: #22d3ee; --ag-mod-2: #67e8f9; --ag-mod-soft: rgba(34,211,238,0.18);  --ag-mod-glow: rgba(34,211,238,0.6); }
.agnes-mod-video      { --ag-mod-ink: #6d28d9; --ag-mod: #8b5cf6; --ag-mod-2: #c4b5fd; --ag-mod-soft: rgba(139,92,246,0.20);  --ag-mod-glow: rgba(139,92,246,0.7); }
.agnes-mod-storyboard { --ag-mod-ink: #be123c; --ag-mod: #fb7185; --ag-mod-2: #fda4af; --ag-mod-soft: rgba(251,113,133,0.18); --ag-mod-glow: rgba(251,113,133,0.6); }
.agnes-mod-anchor     { --ag-mod-ink: #047857; --ag-mod: #34d399; --ag-mod-2: #6ee7b7; --ag-mod-soft: rgba(52,211,153,0.18);  --ag-mod-glow: rgba(52,211,153,0.6); }
.agnes-mod-canvas     { --ag-mod-ink: #4338ca; --ag-mod: #6366f1; --ag-mod-2: #a5b4fc; --ag-mod-soft: rgba(99,102,241,0.20);  --ag-mod-glow: rgba(99,102,241,0.7); }
.agnes-mod-cover      { --ag-mod-ink: #b45309; --ag-mod: #fbbf24; --ag-mod-2: #fcd34d; --ag-mod-soft: rgba(251,191,36,0.18);  --ag-mod-glow: rgba(251,191,36,0.55); }
.agnes-mod-expert     { --ag-mod-ink: #7e22ce; --ag-mod: #c084fc; --ag-mod-2: #d8b4fe; --ag-mod-soft: rgba(192,132,252,0.18); --ag-mod-glow: rgba(192,132,252,0.6); }
.agnes-mod-settings   { --ag-mod-ink: #475569; --ag-mod: #94a3b8; --ag-mod-2: #cbd5e1; --ag-mod-soft: rgba(148,163,184,0.18); --ag-mod-glow: rgba(148,163,184,0.5); }

/* the module colour also washes the whole panel very lightly */
.agnes-root::before {
  content: '';
  position: absolute;
  inset: 0 0 auto 0;
  height: 190px;
  pointer-events: none;
  z-index: 0;
  background: radial-gradient(900px 220px at 50% 0%, var(--ag-mod-soft), transparent 72%);
  opacity: 0.55;
}


.agnes-root > * { position: relative; z-index: 1; }

/* --- tabs: every module keeps its own colour -------------------------- */
.agnes-tab[data-tab="image"]      { --t: #22d3ee; --t2: #0ea5e9; --ts: rgba(34,211,238,0.16); }
.agnes-tab[data-tab="video"]      { --t: #8b5cf6; --t2: #a78bfa; --ts: rgba(139,92,246,0.18); }
.agnes-tab[data-tab="storyboard"] { --t: #fb7185; --t2: #f472b6; --ts: rgba(251,113,133,0.16); }
.agnes-tab[data-tab="anchor"]     { --t: #34d399; --t2: #22d3ee; --ts: rgba(52,211,153,0.16); }
.agnes-tab[data-tab="canvas"]     { --t: #6366f1; --t2: #8b5cf6; --ts: rgba(99,102,241,0.18); }
.agnes-tab[data-tab="cover"]      { --t: #fbbf24; --t2: #f59e0b; --ts: rgba(251,191,36,0.16); }
.agnes-tab[data-tab="expert"]     { --t: #c084fc; --t2: #a855f7; --ts: rgba(192,132,252,0.16); }
.agnes-tab[data-tab="settings"]   { --t: #94a3b8; --t2: #64748b; --ts: rgba(148,163,184,0.16); }



.agnes-tab .agnes-tab-icon {
  filter: none;
  font-size: 15px;
}




/* --- section titles: colour dot + bold, 剪映式分区感 ------------------ */

.agnes-section-title::before {
  content: '';
  flex: 0 0 auto;
  width: 14px;
  height: 2px;
  border-radius: 2px;
  box-shadow: none;
  background: var(--ag-mod-ink, #0e7490);
}


/* --- cards: chunkier, tinted, more presence --------------------------- */
.agcv-card,
.agnes-anchor-card,
.agnes-mode-card,
.agnes-setting-row {
  border-radius: 16px;
}

.agnes-anchor-card,
.agcv-card {
  border-color: rgba(255, 255, 255, 0.13);
  background:
    linear-gradient(180deg, rgba(255,255,255,0.055), rgba(255,255,255,0.012)),
    var(--ag-surface-1);
  box-shadow: 0 14px 32px -22px rgba(0,0,0,1), inset 0 1px 0 rgba(255,255,255,0.07);
}

/* --- primary action uses the module colour --------------------------- */
.agnes-root .agnes-btn-primary {
  border-color: rgba(255, 255, 255, 0.32);
  background: var(--ag-grad) !important;
  border: 1px solid transparent !important;
  color: #fff !important;
  border-radius: 999px !important;
  height: 40px !important;
  font-weight: 700;
  box-shadow: var(--ag-glow-accent) !important;
}


.agnes-root .agnes-btn-primary:not(:disabled):hover {
  filter: brightness(1.06);
  transform: translateY(-1px);
  box-shadow: 0 14px 32px -14px rgba(8, 145, 178, 0.75) !important;
}


/* --- progress / accents follow the module ---------------------------- */



/* --- empty states: bigger, colourful -------------------------------- */


/* --- selected states take the module colour -------------------------- */
.agnes-size-btn.active,
.agnes-ratio-btn.active,
.agnes-mode-btn.active,
.agcv-style.active,

.agnes-size-btn.active,
.agnes-ratio-btn.active,
.agnes-mode-btn.active {
  background: linear-gradient(135deg, var(--ag-mod), var(--ag-mod-2));
  border-color: rgba(255, 255, 255, 0.35);
  box-shadow: 0 8px 20px -10px var(--ag-mod);
}

.agcv-style.active {
  background: linear-gradient(135deg, var(--ag-mod), var(--ag-mod-2));
  box-shadow: 0 8px 20px -10px var(--ag-mod);
}


/* --- focus ring picks up the module colour --------------------------- */
.agnes-root :focus-visible { box-shadow: 0 0 0 3px var(--ag-mod-soft), 0 0 0 1px var(--ag-mod); }

[data-dsh-agnes-studio] input:not(.agc-node-title):focus,
[data-dsh-agnes-studio] select:focus,
[data-dsh-agnes-studio] textarea:focus {
  border-color: var(--ag-mod, #7c5cff) !important;
  box-shadow: 0 0 0 3px var(--ag-mod-soft, rgba(124,92,255,0.22)) !important;
}

/* --- titlebar icon adopts the module colour -------------------------- */




/* --- badges/chips are punchier --------------------------------------- */






/* --- node grammar keeps its own colours (not the module's) ----------- */




.agc-node-foot .agnes-btn-primary {
  background: linear-gradient(135deg, rgba(124,92,255,0.95), rgba(167,139,250,0.85));
}

/* --- anchor side preview + cover preview: module tint ---------------- */
.agnes-anchor-side,
.agcv-preview {
  background:
    radial-gradient(620px 300px at 50% 0%, var(--ag-mod-soft), transparent 70%),
    repeating-linear-gradient(45deg, rgba(255,255,255,0.016) 0 12px, transparent 12px 24px),
    rgba(0, 0, 0, 0.34);
  border-color: rgba(255, 255, 255, 0.14);
}




/* --- anchor params: label sits with its control, never split --------- */
.agnes-param-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
  gap: 10px 14px;
  align-items: end;
}

.agnes-param {
  display: flex;
  flex-direction: column;
  gap: 5px;
  min-width: 0;
}

.agnes-param-label {
  font-size: 11.5px;
  font-weight: 600;
  color: var(--ag-text-2);
}

.agnes-param-control { width: 100%; }

.agnes-param-check {
  flex-direction: row;
  align-items: center;
  gap: 8px;
  padding-bottom: 8px;
  cursor: pointer;
}


`
