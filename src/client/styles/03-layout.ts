/**
 * 主体三栏布局 / 场景列表 / 画布区 / 右侧表单
 *
 * 层叠顺序：第 3/12 层（顺序即生效顺序，后写的覆盖先写的）。
 * 由原 styles.ts 第 363-1040 行机械切分而来，内容逐字未改。
 */
export const LAYOUT_CSS = `/* --- body layout ------------------------------------------------------ */
.agnes-body {
  display: flex;
  overflow: hidden;
  flex: 1;
  min-height: 0;
}


/* --- left panel (scene list / assets) --------------------------------- */
.agnes-left {
  width: 220px;
  flex: 0 0 220px;
  border-right: 1px solid var(--ag-line, rgba(32,74,150,0.15));
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.agnes-left-header {
  padding: 12px;
  font-size: 12px;
  font-weight: 600;
  color: var(--ag-text-3, #6e80a3);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.agnes-left-content {
  flex: 1;
  overflow-y: auto;
  padding: 0 8px 8px;
}

.agnes-left-content::-webkit-scrollbar {
  width: 4px;
}

.agnes-left-content::-webkit-scrollbar-thumb {
  background: rgba(108,92,231,0.3);
  border-radius: 2px;
}

/* scene item */
.agnes-scene-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.12s ease;
  margin-bottom: 2px;
}

.agnes-scene-item:hover {
  background: rgba(108,92,231,0.1);
}

.agnes-scene-item.active {
  background: rgba(108,92,231,0.2);
  border: 1px solid rgba(108,92,231,0.3);
}

.agnes-scene-num {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: rgba(108,92,231,0.2);
  color: #a29bfe;
  font-size: 11px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.agnes-scene-item.active .agnes-scene-num {
  background: #6c5ce7;
  color: #fff;
}

.agnes-scene-info {
  flex: 1;
  min-width: 0;
}

.agnes-scene-name {
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.agnes-scene-status {
  font-size: 11px;
  color: var(--ag-text-3, #6e80a3);
}

.agnes-scene-status.done {
  color: #00cec9;
}

.agnes-scene-status.generating {
  color: #fdcb6e;
}

/* thumbnail grid */
.agnes-thumb-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
  padding: 8px 0;
}

.agnes-thumb {
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  position: relative;
  border: 2px solid transparent;
  transition: border-color 0.15s ease, transform 0.15s ease;
}


.agnes-thumb.selected {
  border-color: #6c5ce7;
  box-shadow: 0 0 0 2px rgba(108,92,231,0.3);
}

.agnes-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* --- center workspace ------------------------------------------------- */
.agnes-center {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  overflow: hidden;
}

.agnes-preview-area {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  min-height: 0;
  position: relative;
}


.agnes-preview-img {
  max-width: 100%;
  max-height: 100%;
  border-radius: 10px;
  object-fit: contain;
  animation: agnes-image-reveal 0.4s ease-out;
}

@keyframes agnes-image-reveal {
  from { filter: blur(8px); opacity: 0; }
  to   { filter: blur(0); opacity: 1; }
}

.agnes-preview-video {
  max-width: 100%;
  max-height: 100%;
  border-radius: 10px;
}

/* skeleton loading */
.agnes-skeleton {
  width: 320px;
  height: 240px;
  border-radius: 12px;
  background: linear-gradient(90deg, var(--ag-surface-2, rgba(255,255,255,0.55)) 25%, rgba(108,92,231,0.08) 50%, var(--ag-surface-2, rgba(255,255,255,0.55)) 75%);
  background-size: 200% 100%;
  animation: agnes-shimmer 1.5s infinite;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 12px;
  color: var(--ag-text-2);
}


@keyframes agnes-shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.agnes-skeleton-text {
  font-size: 13px;
  color: var(--ag-text-3, #6e80a3);
}

.agnes-progress-bar {
  width: 200px;
  overflow: hidden;
  height: 6px;
  border-radius: 99px;
  background: rgba(32, 74, 150, 0.14);
}



/* action bar */
.agnes-action-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border-top: 1px solid var(--ag-line, rgba(32,74,150,0.15));
  flex-wrap: wrap;
}

/* empty state */
.agnes-empty {
  text-align: center;
  padding: 40px 20px;
  color: var(--ag-dim);
}


.agnes-empty-icon {
  filter: drop-shadow(0 8px 18px rgba(124,92,255,0.5));
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 14px;
  width: 76px;
  height: 76px;
  border-radius: 22px;
  font-size: 34px;
  background: var(--ag-grad);
  border: 1px solid rgba(255, 255, 255, 0.85);
  box-shadow: 0 20px 44px -18px rgba(8, 145, 178, 0.7), inset 0 1px 0 rgba(255,255,255,0.5);
}


.agnes-empty-title {
  font-size: 16px;
  margin-bottom: 6px;
  color: var(--ag-t1);
  font-weight: 800;
}


.agnes-empty-desc {
  font-size: 13px;
  line-height: 1.5;
  max-width: 320px;
  margin: 0 auto;
}

/* --- right panel (prompt / settings) ---------------------------------- */
.agnes-right {
  width: 280px;
  flex: 0 0 280px;
  border-left: 1px solid var(--ag-line, rgba(32,74,150,0.15));
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.agnes-right-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
}

.agnes-right-scroll::-webkit-scrollbar {
  width: 4px;
}

.agnes-right-scroll::-webkit-scrollbar-thumb {
  background: rgba(108,92,231,0.3);
  border-radius: 2px;
}

/* section */
.agnes-section {
  margin-bottom: 16px;
  padding: 16px 20px;
}


.agnes-section-title {
  /* 原先被 6 层分别定义过（03 / 05 / 06 / 07 / 08×2），靠「后写的赢」生效。
     此处收敛为层叠后的最终值 —— 校验口径见下方注释。
     ⚠ 合并这类多定义时不要靠肉眼「取最新的那条」：06 层写了 color: var(--ag-text-3)
     而后面的 08 层用 !important 改成了 var(--ag-text-2)，只看某一层必然取错。 */
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: var(--ag-font-mono);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--ag-text-2) !important;
  margin-bottom: 12px;
}

/* textarea */
.agnes-textarea {
  width: 100%;
  min-height: 100px;
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid var(--ag-line, rgba(32,74,150,0.15));
  background: var(--ag-surface-2, rgba(255,255,255,0.55));
  color: var(--ag-text, #0c1a33);
  font-size: 13px;
  line-height: 1.5;
  resize: vertical;
  font-family: inherit;
  transition: border-color 0.15s ease;
  box-sizing: border-box;
}

.agnes-textarea:focus {
  outline: none;
  border-color: #6c5ce7;
  box-shadow: 0 0 0 2px rgba(108,92,231,0.2);
}

.agnes-textarea::placeholder {
  color: var(--ag-text-3, #6e80a3);
  opacity: 0.6;
}

/* select */
.agnes-select {
  width: 100%;
  height: 34px;
  padding: 0 10px;
  border-radius: 8px;
  border: 1px solid var(--ag-line, rgba(32,74,150,0.15));
  background: var(--ag-surface-2, rgba(255,255,255,0.55));
  color: var(--ag-text, #0c1a33);
  font-size: 13px;
  font-family: inherit;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236c6c80' d='M3 4.5L6 8l3-3.5'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
  box-sizing: border-box;
}

.agnes-select:focus {
  outline: none;
  border-color: #6c5ce7;
}

/* input row */
.agnes-input-row {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}

.agnes-input-row > * {
  flex: 1;
}

/* buttons */
.agnes-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border: none;
  font-family: inherit;
  cursor: pointer;
  white-space: nowrap;
  transition: transform 0.12s ease, filter 0.15s ease, background 0.15s ease, box-shadow 0.15s ease;
  height: 36px;
  padding: 0 16px;
  font-size: 13px;
  letter-spacing: 0.01em;
  border-radius: 999px;
  font-weight: 600;
  position: relative;
  overflow: hidden;
  isolation: isolate;
}


.agnes-btn:disabled {
  cursor: not-allowed;
  opacity: 0.42;
  filter: grayscale(0.45);
}


.agnes-btn-primary {
  background: linear-gradient(135deg, #7c5cff 0%, #a78bfa 55%, #22d3ee 140%);
  color: #fff;
  border: 1px solid rgba(190, 175, 255, 0.55);
  box-shadow: 0 10px 26px -12px rgba(124, 92, 255, 1), inset 0 1px 0 rgba(255,255,255,0.3);
}


.agnes-btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(108,92,231,0.4);
}

.agnes-btn-primary:active:not(:disabled) {
  transform: translateY(0);
}

.agnes-btn-secondary {
  background: #ffffff !important;
  border: 1px solid var(--ag-line-2) !important;
  color: var(--ag-t2) !important;
  border-radius: 999px;
}


.agnes-btn-secondary:hover:not(:disabled) {
  background: var(--ag-surface-3, rgba(255,255,255,0.85));
  border-color: rgba(108,92,231,0.3);
}

.agnes-btn-ghost {
  background: rgba(255, 255, 255, 0.6) !important;
  border: 1px solid var(--ag-line) !important;
  color: var(--ag-muted) !important;
  border-radius: 999px;
}


.agnes-btn-ghost:hover:not(:disabled) {
  background: rgba(108,92,231,0.1);
  color: var(--ag-text, #0c1a33);
}

.agnes-btn-sm {
  height: 30px;
  padding: 0 11px;
  font-size: 12px;
  border-radius: 8px;
}


.agnes-btn-full {
  width: 100%;
}

.agnes-btn-danger {
  background: rgba(255, 107, 107, 0.14);
  color: #ff8f8f;
  border: 1px solid rgba(255, 107, 107, 0.45);
}


.agnes-btn-danger:hover:not(:disabled) {
  background: rgba(255,107,107,0.25);
}

/* tabs */
.agnes-tabs {
  display: flex;
  padding: 0;
  border-radius: 0;
  background: transparent;
  margin-bottom: 0;
  overflow-x: auto;
  scrollbar-width: none;
  gap: 8px;
  padding-bottom: 12px;
}


.agnes-tab {
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: inherit;
  cursor: pointer;
  position: relative;
  transition: color 0.15s ease, background 0.15s ease;
  white-space: nowrap;
  font-size: 12.5px;
  height: 38px;
  padding: 0 15px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid var(--ag-line);
  color: var(--ag-muted);
  font-weight: 600;
  box-shadow: 0 2px 8px -6px rgba(24, 50, 100, 0.4);
}

.agnes-tab.active {
  background: var(--ag-grad);
  border-color: transparent;
  color: #fff;
  box-shadow: var(--ag-glow-accent);
}



.agnes-tab:hover:not(.active) {
  background: #ffffff;
  border-color: var(--ag-line-2);
  color: var(--ag-t1);
}


/* badge */
.agnes-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: 999px;
  font-weight: 700;
  border: 1px solid rgba(8, 145, 178, 0.35);
  font-family: var(--ag-font-mono);
  font-size: 10px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--ag-mod-ink, #0e7490) !important;
  border-color: var(--ag-mod, #0891b2) !important;
  background: var(--ag-mod-soft) !important;
}


.agnes-badge-free {
  background: rgba(15, 157, 88, 0.12);
  border-color: rgba(15, 157, 88, 0.35);
  color: var(--ag-ok);
}


.agnes-badge-generating {
  background: rgba(253,203,110,0.15);
  color: #fdcb6e;
}

.agnes-badge-error {
  background: rgba(255,107,107,0.15);
  color: #ff6b6b;
}

/* divider */
.agnes-divider {
  height: 1px;
  margin: 12px 0;
  background: var(--ag-line);
}


/* file drop zone */
.agnes-dropzone {
  border: 2px dashed rgba(108,92,231,0.3);
  border-radius: 10px;
  padding: 24px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.agnes-dropzone:hover {
  border-color: rgba(108,92,231,0.5);
  background: rgba(108,92,231,0.05);
}

.agnes-dropzone.dragover {
  border-color: #6c5ce7;
  background: rgba(108,92,231,0.1);
}

/* reference image chips */
.agnes-ref-chips {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.agnes-ref-chip {
  position: relative;
  width: 48px;
  height: 48px;
  border-radius: 8px;
  overflow: hidden;
  border: 2px solid var(--ag-line, rgba(32,74,150,0.15));
}

.agnes-ref-chip img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.agnes-ref-chip-remove {
  position: absolute;
  top: -4px;
  right: -4px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #ff6b6b;
  color: #fff;
  font-size: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: none;
  line-height: 1;
}

.agnes-ref-chip-add {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  border: 2px dashed rgba(108,92,231,0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--ag-text-3, #6e80a3);
  font-size: 18px;
  transition: all 0.15s ease;
  background: transparent;
}

.agnes-ref-chip-add:hover {
  border-color: rgba(108,92,231,0.5);
  color: #a29bfe;
}

/* status bar */
.agnes-statusbar {
  height: 28px;
  flex: 0 0 28px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 14px;
  border-top: 1px solid var(--ag-line, rgba(32,74,150,0.15));
  font-size: 11px;
  color: var(--ag-text-3, #6e80a3);
}

.agnes-status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #00cec9;
}

/* scene card in storyboard mode */
.agnes-storyboard {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding: 16px;
  min-height: 200px;
}

.agnes-storyboard::-webkit-scrollbar {
  height: 4px;
}

.agnes-storyboard::-webkit-scrollbar-thumb {
  background: rgba(108,92,231,0.3);
  border-radius: 2px;
}

.agnes-storyboard-card {
  flex: 0 0 180px;
  background: var(--ag-surface-2, rgba(255,255,255,0.55));
  border-radius: 10px;
  border: 1px solid var(--ag-line, rgba(32,74,150,0.15));
  overflow: hidden;
  cursor: pointer;
  transition: all 0.15s ease;
}

.agnes-storyboard-card:hover {
  border-color: rgba(108,92,231,0.3);
  transform: translateY(-2px);
}

.agnes-storyboard-card.active {
  border-color: #6c5ce7;
  box-shadow: 0 0 0 2px rgba(108,92,231,0.2);
}

.agnes-storyboard-thumb {
  width: 100%;
  aspect-ratio: 16/9;
  object-fit: cover;
  display: block;
}

.agnes-storyboard-thumb-placeholder {
  width: 100%;
  aspect-ratio: 16/9;
  background: linear-gradient(135deg, rgba(108,92,231,0.1), rgba(162,155,254,0.05));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
}

.agnes-storyboard-body {
  padding: 8px 10px;
}

.agnes-storyboard-label {
  font-size: 12px;
  font-weight: 500;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.agnes-storyboard-meta {
  font-size: 11px;
  color: var(--ag-text-3, #6e80a3);
}

`
