/**
 * 第二轮补充：header·tab / 卡片打磨 / 无限画布 / 短剧 / 封面
 *
 * 层叠顺序：第 5/12 层（顺序即生效顺序，后写的覆盖先写的）。
 * 由原 styles.ts 第 1515-2030 行机械切分而来，内容逐字未改。
 */
export const REFINE_V2_CSS = `/* ═══════════════════════════════════════════════════════════════════════
   v2 redesign — segmented tab bar, canvas, cover
   ═══════════════════════════════════════════════════════════════════════ */

/* --- header + tab bar ------------------------------------------------- */



.agnes-tabs::-webkit-scrollbar { display: none; }



.agnes-tab-icon {
  line-height: 1;
  font-size: 14px;
  filter: saturate(1.15);
}

.agnes-tab-name { line-height: 1; }




/* accent underline marks the active tab */
.agnes-tab.active::after {
  content: '';
  position: absolute;
  left: 10px;
  right: 10px;
  bottom: -1px;
  height: 2px;
  border-radius: 2px;
  background: linear-gradient(90deg, var(--ag-accent), var(--ag-accent-2));
  display: none;
}


/* --- generic cards / polish ------------------------------------------ */





.agnes-btn:not(:disabled):hover { filter: brightness(1.08); }
.agnes-btn:not(:disabled):active { transform: translateY(1px); }






/* --- infinite canvas -------------------------------------------------- */
.agnes-canvas {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}

.agc-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--ag-line);
}


.agc-tools-left {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.agc-sep {
  width: 1px;
  height: 20px;
  background: var(--ag-line-strong);
  margin: 0 4px;
}

.agc-zoom {
  font-size: 12px;
  min-width: 44px;
  text-align: center;
  font-variant-numeric: tabular-nums;
  font-family: var(--ag-font-mono);
  color: var(--ag-muted);
}


.agc-tips {
  font-family: var(--ag-font-mono);
  font-size: 10px;
  letter-spacing: 0.06em;
  color: var(--ag-dim);
}


.agc-viewport {
  position: relative;
  flex: 1;
  min-height: 0;
  overflow: hidden;
  cursor: grab;
  background-color: #eaf1fb;
  background-image:
    radial-gradient(rgba(32, 96, 190, 0.22) 1.2px, transparent 1.2px),
    radial-gradient(800px 380px at 50% 0%, rgba(8,145,178,0.10), transparent 70%);
  background-size: 24px 24px, 100% 100%;
}


.agc-viewport.grabbing { cursor: grabbing; }

.agc-world {
  position: absolute;
  left: 0;
  top: 0;
  width: 0;
  height: 0;
}

.agc-edges {
  position: absolute;
  left: 0;
  top: 0;
  overflow: visible;
  pointer-events: none;
  width: 1px;
  height: 1px;
}

.agc-edge {
  fill: none;
  pointer-events: stroke;
  cursor: pointer;
  stroke-width: 2.5;
  stroke: var(--ag-accent) !important;
  filter: drop-shadow(0 2px 4px rgba(8,145,178,0.35));
  opacity: 0.9;
}


.agc-edge:hover { stroke: var(--ag-danger); opacity: 1; stroke-width: 3; }

.agc-node {
  position: absolute;
  display: flex;
  flex-direction: column;
  user-select: none;
  transition: box-shadow 0.15s ease, border-color 0.15s ease;
  backdrop-filter: blur(2px);
  background: #ffffff;
  border: 1px solid var(--ag-line-2);
  border-radius: var(--ag-radius);
  box-shadow: 0 18px 40px -22px rgba(20, 45, 95, 0.5), 0 1px 0 rgba(255,255,255,0.9) inset;
}


.agc-node:hover { border-color: rgba(162, 155, 254, 0.5); }

.agc-node.active {
  border-color: var(--ag-accent-2);
  box-shadow: 0 0 0 2px var(--ag-accent), 0 22px 46px -22px rgba(20, 45, 95, 0.55) !important;
  animation: ag-glow-breathe 3s ease-in-out infinite;
}


.agc-node-head {
  display: flex;
  align-items: center;
  gap: 6px;
  background: linear-gradient(180deg, rgba(255,255,255,0.055), transparent);
  cursor: move;
  padding: 9px 10px;
  border-radius: 14px 14px 0 0;
  font-weight: 600;
  border-bottom: 1px solid var(--ag-line);
}


.agc-node-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 6px;
  font-size: 11px;
  background: rgba(255,255,255,0.85) !important;
  border: 1px solid var(--ag-line);
}


.agc-node-title {
  flex: 1;
  font-family: inherit;
  outline: none;
  background: transparent !important;
  border: 1px solid transparent !important;
  border-radius: 6px !important;
  padding: 2px 6px !important;
  font-size: 12.5px !important;
  font-weight: 700 !important;
  letter-spacing: 0.01em;
  box-shadow: none !important;
  min-width: 0;
  color: var(--ag-t1) !important;
}


.agc-node-x {
  border: none;
  background: transparent;
  color: var(--ag-text-3);
  cursor: pointer;
  font-size: 11px;
  padding: 2px 5px;
  border-radius: 5px;
}

.agc-node-x:hover { background: rgba(255,107,107,0.18); color: var(--ag-danger); }

.agc-node-body {
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
  background: rgba(0, 0, 0, 0.18);
}


.agc-node-text,
.agc-node-prompt {
  width: 100%;
  box-sizing: border-box;
  border: 1px solid var(--ag-line);
  border-radius: var(--ag-radius-sm);
  background: rgba(0,0,0,0.25);
  color: var(--ag-text);
  font-size: 12px;
  font-family: inherit;
  line-height: 1.55;
  padding: 7px 8px;
  resize: vertical;
}

.agc-node-text { min-height: 92px; flex: 1; }
.agc-node-prompt { min-height: 42px; }

.agc-node-media {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.agc-media {
  width: 100%;
  border-radius: var(--ag-radius-sm);
  background: #000;
  max-height: 150px;
  object-fit: contain;
}

.agc-node-empty {
  height: 92px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--ag-radius-sm);
  font-size: 11px;
  text-align: center;
  padding: 8px;
  font-weight: 500;
  border: 1px dashed var(--ag-line-2);
  color: var(--ag-t2) !important;
  background: rgba(255, 255, 255, 0.9) !important;
  border-color: var(--ag-line-2) !important;
}


.agc-node-err {
  font-size: 11px;
  color: var(--ag-danger);
  line-height: 1.45;
}

.agc-node-foot {
  padding: 0 8px 8px;
  display: flex;
  gap: 6px;
}

.agc-node-foot .agnes-btn { flex: 1; }

.agc-port {
  position: absolute;
  top: 34px;
  border-radius: 50%;
  border: 2px solid var(--ag-accent-2);
  cursor: crosshair;
  transition: transform 0.12s ease, background 0.12s ease;
  width: 14px;
  height: 14px;
  background: #ffffff !important;
  border-width: 2.5px !important;
  box-shadow: 0 2px 8px -2px rgba(20, 45, 95, 0.45) !important;
}


.agc-port:hover {
  transform: scale(1.35);
  background: var(--ag-accent) !important;
}

.agc-port-in {
  left: -6px;
  box-shadow: 0 0 12px rgba(34,211,238,0.7);
  border-color: var(--ag-accent) !important;
}

.agc-port-out {
  right: -6px;
  border-color: var(--ag-accent-2) !important;
}


.agc-status {
  padding: 7px 14px;
  background: rgba(255, 255, 255, 0.55);
  border-top: 1px solid var(--ag-line);
  color: var(--ag-dim);
  font-family: var(--ag-font-mono);
  font-size: 10.5px;
  letter-spacing: 0.08em;
}


/* --- drama: prominent "next step" card -------------------------------- */
.agdp-next {
  border: 1px solid var(--ag-line-strong);
  border-radius: var(--ag-radius);
  background: var(--ag-surface-1);
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.agdp-next.primary {
  border-color: rgba(8, 145, 178, 0.4);
  background: linear-gradient(135deg, rgba(236, 254, 255, 0.95), rgba(245, 243, 255, 0.9));
  box-shadow: var(--ag-glow-accent);
  animation: ag-glow-breathe 3.4s ease-in-out infinite;
}


.agdp-next-head {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.agdp-next-icon { font-size: 18px; line-height: 1.2; }

.agdp-next-title {
  font-size: 15px;
  font-weight: 800;
  color: var(--ag-t1);
}


.agdp-next-sub {
  font-size: 12px;
  margin-top: 2px;
  color: var(--ag-muted);
}


.agdp-next-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.agdp-warn {
  font-size: 12px;
  border-radius: var(--ag-radius-sm);
  padding: 8px 10px;
  line-height: 1.5;
  background: rgba(255, 251, 235, 0.95);
  border: 1px solid rgba(161, 98, 7, 0.3);
  color: var(--ag-warn);
}


/* --- novel cover ------------------------------------------------------ */
.agnes-cover { padding: 16px; }

.agnes-cover-grid {
  display: grid;
  grid-template-columns: minmax(300px, 380px) 1fr;
  gap: 18px;
  align-items: start;
}

@media (max-width: 900px) {
  .agnes-cover-grid { grid-template-columns: 1fr; }
}

.agcv-form { display: flex; flex-direction: column; gap: 12px; }

.agcv-card {
  border: 1px solid var(--ag-line);
  border-radius: var(--ag-radius);
  background: var(--ag-surface-1);
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 9px;
}

.agcv-card-title {
  font-weight: 650;
  font-family: var(--ag-font-mono);
  font-size: 10.5px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--ag-mod-ink, #0e7490) !important;
}


.agcv-field { display: flex; flex-direction: column; gap: 5px; }

.agcv-field > label {
  font-size: 11px;
  color: var(--ag-text-2);
}

.agcv-hint { font-size: 11px; color: var(--ag-text-3); line-height: 1.5; }

.agcv-notice {
  font-size: 12px;
  color: var(--ag-ok);
  padding: 8px 10px;
  border-radius: var(--ag-radius-sm);
  background: rgba(46, 204, 113, 0.1);
}

.agcv-styles { display: flex; flex-wrap: wrap; gap: 6px; }

.agcv-style {
  border-radius: 99px;
  padding: 5px 12px;
  font-size: 12px;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.15s ease;
  background: #ffffff;
  border: 1px solid var(--ag-line-2);
  color: var(--ag-muted);
  font-weight: 600;
}


.agcv-style:hover { color: var(--ag-text); border-color: var(--ag-accent-2); }

.agcv-style.active {
  background: var(--ag-accent-soft);
  border-color: var(--ag-accent-2);
  color: var(--ag-text);
}

.agcv-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  border: 1px solid var(--ag-line);
  border-radius: var(--ag-radius);
  background: rgba(0,0,0,0.2);
  padding: 16px;
  min-height: 420px;
}

.agcv-main { display: flex; flex-direction: column; align-items: center; }

.agcv-cover-img {
  width: 300px;
  aspect-ratio: 3 / 4;
  object-fit: cover;
  border-radius: 10px;
  border: 1px solid rgba(255,255,255,0.9);
  box-shadow: 0 26px 60px -22px rgba(20,45,95,0.55), 0 0 0 1px rgba(32,74,150,0.14);
}


.agcv-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  flex: 1;
  color: var(--ag-text-2);
}


.agcv-empty-title { font-size: 14px; color: var(--ag-text-2); }

.agcv-history {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 6px;
}

.agcv-thumb {
  width: 62px;
  aspect-ratio: 3 / 4;
  object-fit: cover;
  border-radius: 6px;
  cursor: pointer;
  border: 1px solid var(--ag-line-strong);
  transition: transform 0.12s ease;
}

.agcv-thumb:hover { transform: translateY(-2px); }

`
