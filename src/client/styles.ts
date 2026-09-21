/**
 * dsh-agnes-studio styles.
 *
 * Scoped by data-plugin-css attribute — nothing leaks into the DSH shell.
 * Colors ride --dsw-* theme tokens so the panel follows light/dark modes.
 */

const CSS = `
/* ═══════════════════════════════════════════════════════════════════════
   AGNES CREATIVE STUDIO — Shell Overlay Panel
   UI 注册在 shell.overlay，不碰 conversation DOM，对话框完全不受影响。
   ═══════════════════════════════════════════════════════════════════════ */

/* --- overlay container ------------------------------------------------ */
/* The custom property --agnes-sidebar-w is set by the overlay owner in
   index.ts when the panel opens, so the window centres in the workspace and
   never covers the sidebar. */
[data-dsh-agnes-studio] {
  /* ---- design tokens (scoped: nothing leaks into the shell) ---- */
  /* Deliberately NOT the host theme surfaces: the shell's light-purple tokens
     flattened every card into the background. This panel drives its own
     deep-space palette so layers actually read as layers. */
  --ag-accent: #7c5cff;
  --ag-accent-2: #a78bfa;
  --ag-accent-3: #22d3ee;
  --ag-accent-soft: rgba(124, 92, 255, 0.16);
  --ag-glow: 0 0 24px -4px rgba(124, 92, 255, 0.65);
  --ag-kind-text: #7c5cff;
  --ag-kind-image: #22d3ee;
  --ag-kind-video: #f472b6;
  --ag-surface-0: #0a0a12;
  --ag-surface-1: #13131f;
  --ag-surface-2: #1c1c2b;
  --ag-surface-3: #262638;
  --ag-surface-4: #32324a;
  --ag-line: rgba(255, 255, 255, 0.09);
  --ag-line-strong: rgba(255, 255, 255, 0.17);
  --ag-text: #f2f2f8;
  --ag-text-2: #a9a9c4;
  --ag-text-3: rgba(169, 169, 196, 0.55);
  --ag-ok: #2ecc71;
  --ag-warn: #ffd166;
  --ag-danger: #ff6b6b;
  --ag-radius-sm: 8px;
  --ag-radius: 12px;
  --ag-radius-lg: 18px;
  --ag-shadow: 0 28px 90px rgba(0, 0, 0, 0.5), 0 2px 0 rgba(255, 255, 255, 0.04) inset;
  --ag-ring: 0 0 0 3px rgba(108, 92, 231, 0.35);

  position: fixed;
  top: 50%;
  left: calc(50% + var(--agnes-sidebar-w, 0px) / 2);
  transform: translate(-50%, -50%);
  width: min(calc(100vw - var(--agnes-sidebar-w, 0px) - 32px), 1400px);
  height: min(90vh, 880px);
  background:
    radial-gradient(900px 380px at 20% -10%, rgba(124, 92, 255, 0.16), transparent 70%),
    radial-gradient(700px 320px at 85% -5%, rgba(34, 211, 238, 0.10), transparent 70%),
    var(--ag-surface-0);
  border-radius: var(--ag-radius-lg);
  border: 1px solid var(--ag-line-strong);
  box-shadow:
    0 40px 120px rgba(0, 0, 0, 0.7),
    0 0 0 1px rgba(124, 92, 255, 0.14),
    inset 0 1px 0 rgba(255, 255, 255, 0.06);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  z-index: 9999;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
  color: var(--ag-text);
  animation: agnes-studio-enter 0.25s ease-out;
}

/* Keyboard focus ring, applied consistently across the panel. */
[data-dsh-agnes-studio] :focus-visible {
  outline: none;
  box-shadow: var(--ag-ring);
  border-radius: var(--ag-radius-sm);
}

/* Slim theme-matched scrollbars instead of the raw OS bar. */
[data-dsh-agnes-studio] ::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}

[data-dsh-agnes-studio] ::-webkit-scrollbar-track {
  background: transparent;
}

[data-dsh-agnes-studio] ::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.13);
  border: 3px solid transparent;
  background-clip: content-box;
  border-radius: 99px;
}

[data-dsh-agnes-studio] ::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.24);
  background-clip: content-box;
}

@keyframes agnes-studio-enter {
  from { opacity: 0; transform: translate(-50%, -50%) scale(0.96); }
  to   { opacity: 1; transform: translate(-50%, -50%) scale(1); }
}

/* --- sidebar entry row (own styles — no dependency on other plugins) --- */

.agnes-entry {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  height: 32px;
  padding: 0 12px;
  background: transparent;
  border: none;
  /* NOTE: .agnes-entry lives in the DSH sidebar, OUTSIDE this panel, so it
     cannot read our --ag-* tokens (they are scoped to the panel root). It must
     keep the host theme tokens or it renders dark-on-dark and disappears. */
  border-radius: 8px;
  color: var(--dsw-alias-label-secondary, #9a9ab0);
  cursor: pointer;
  font-size: 13px;
  font-family: inherit;
  white-space: nowrap;
  transition: background-color .12s ease, color .12s ease;
}

.agnes-entry:hover {
  background: var(--dsw-specific-sidebar-nav-item-hover, rgba(127,127,137,.12));
  color: var(--dsw-alias-label-primary, #e6e6ef);
}

.agnes-entry[data-active] {
  background: var(--dsw-specific-sidebar-nav-item-active, rgba(108,92,231,.18));
  color: var(--dsw-alias-brand-primary, #a29bfe);
  font-weight: 600;
}

.agnes-entry-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  flex: 0 0 16px;
}

.agnes-entry-label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* backdrop */
[data-dsh-agnes-backdrop] {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  z-index: 9998;
  animation: agnes-backdrop-enter 0.2s ease-out;
}

@keyframes agnes-backdrop-enter {
  from { opacity: 0; }
  to   { opacity: 1; }
}

/* --- title bar -------------------------------------------------------- */
.agnes-titlebar {
  height: 44px;
  flex: 0 0 44px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 16px;
  background: linear-gradient(135deg, #6c5ce7 0%, #a29bfe 100%);
  color: #fff;
  user-select: none;
  cursor: move;
}

.agnes-titlebar-icon {
  font-size: 16px;
  line-height: 1;
}

.agnes-titlebar-text {
  flex: 1;
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.agnes-titlebar-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 6px;
  background: rgba(255,255,255,0.15);
  color: #fff;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.12s ease;
}

.agnes-titlebar-btn:hover {
  background: rgba(255,255,255,0.25);
}

/* --- first-use API key guide ------------------------------------------ */
.agnes-keyguide {
  flex: 0 0 auto;
  margin: 10px 16px 0;
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid rgba(108,92,231,0.45);
  background: linear-gradient(180deg, rgba(108,92,231,0.16), rgba(108,92,231,0.06));
}

.agnes-keyguide-head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.agnes-keyguide-title {
  flex: 1;
  font-size: 13px;
  font-weight: 700;
  color: var(--ag-text, #0c1a33);
}

.agnes-keyguide-close {
  border: none;
  background: transparent;
  color: var(--ag-text-2, #2a3c5e);
  font-size: 12px;
  cursor: pointer;
  padding: 2px 6px;
  border-radius: 6px;
}

.agnes-keyguide-close:hover {
  background: rgba(127,127,137,0.18);
  color: var(--ag-text, #0c1a33);
}

.agnes-keyguide-steps {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.agnes-keyguide-step {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 12px;
  line-height: 1.6;
  color: var(--ag-text-2, #2a3c5e);
}

.agnes-keyguide-num {
  flex: 0 0 18px;
  width: 18px;
  height: 18px;
  margin-top: 1px;
  border-radius: 50%;
  background: var(--ag-accent, #0891b2);
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.agnes-keyguide-step code {
  padding: 1px 5px;
  border-radius: 5px;
  background: rgba(127,127,137,0.2);
  font-size: 11px;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
}

.agnes-keyguide-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-top: 10px;
}

.agnes-keyguide-actions a.agnes-btn {
  text-decoration: none;
}

.agnes-keyguide-ok {
  font-size: 12px;
  color: #2ecc71;
}

.agnes-keyguide-note {
  margin-top: 8px;
  font-size: 11px;
  line-height: 1.5;
  color: var(--ag-text-3, #6e80a3);
}

.agnes-statusbar-link {
  border: none;
  background: transparent;
  color: #ffd166;
  font-size: 11px;
  cursor: pointer;
  padding: 0 4px;
  text-decoration: underline;
}

/* --- talking avatar (数字人口播) -------------------------------------- */
.agnes-anchor {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 4px 0 16px;
}

.agnes-anchor .agnes-section {
  padding: 10px 16px;
}

.agnes-anchor .agnes-textarea {
  width: 100%;
  box-sizing: border-box;
  font-family: inherit;
  line-height: 1.6;
}

.agnes-error {
  margin: 0 16px;
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid rgba(255,107,107,0.4);
  background: rgba(255,107,107,0.12);
  color: #ff8f8f;
  font-size: 12px;
  line-height: 1.5;
}

.agnes-anchor video {
  max-height: 420px;
}

/* --- body layout ------------------------------------------------------ */
.agnes-body {
  flex: 1;
  display: flex;
  min-height: 0;
  overflow: hidden;
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

.agnes-thumb:hover {
  border-color: rgba(108,92,231,0.4);
  transform: scale(1.03);
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
  height: 4px;
  border-radius: 2px;
  background: rgba(108,92,231,0.15);
  overflow: hidden;
}

.agnes-progress-fill {
  height: 100%;
  border-radius: 2px;
  background: linear-gradient(90deg, #6c5ce7, #a29bfe);
  transition: width 0.3s ease;
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
  color: var(--ag-text-3, #6e80a3);
}

.agnes-empty-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.agnes-empty-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--ag-text, #0c1a33);
  margin-bottom: 6px;
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
}

.agnes-section-title {
  font-size: 12px;
  font-weight: 600;
  color: var(--ag-text-3, #6e80a3);
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
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
  height: 34px;
  padding: 0 14px;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;
}

.agnes-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.agnes-btn-primary {
  background: linear-gradient(135deg, #6c5ce7, #a29bfe);
  color: #fff;
}

.agnes-btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(108,92,231,0.4);
}

.agnes-btn-primary:active:not(:disabled) {
  transform: translateY(0);
}

.agnes-btn-secondary {
  background: var(--ag-surface-2, rgba(255,255,255,0.55));
  color: var(--ag-text, #0c1a33);
  border: 1px solid var(--ag-line, rgba(32,74,150,0.15));
}

.agnes-btn-secondary:hover:not(:disabled) {
  background: var(--ag-surface-3, rgba(255,255,255,0.85));
  border-color: rgba(108,92,231,0.3);
}

.agnes-btn-ghost {
  background: transparent;
  color: var(--ag-text-3, #6e80a3);
}

.agnes-btn-ghost:hover:not(:disabled) {
  background: rgba(108,92,231,0.1);
  color: var(--ag-text, #0c1a33);
}

.agnes-btn-sm {
  height: 28px;
  padding: 0 10px;
  font-size: 12px;
  border-radius: 6px;
}

.agnes-btn-full {
  width: 100%;
}

.agnes-btn-danger {
  background: rgba(255,107,107,0.15);
  color: #ff6b6b;
  border: 1px solid rgba(255,107,107,0.2);
}

.agnes-btn-danger:hover:not(:disabled) {
  background: rgba(255,107,107,0.25);
}

/* tabs */
.agnes-tabs {
  display: flex;
  gap: 2px;
  padding: 3px;
  border-radius: 8px;
  background: var(--ag-surface-2, rgba(255,255,255,0.55));
  margin-bottom: 12px;
}

.agnes-tab {
  flex: 1;
  height: 30px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--ag-text-3, #6e80a3);
  font-size: 12px;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.12s ease;
}

.agnes-tab.active {
  background: var(--ag-panel-solid, #ffffff);
  color: var(--ag-text, #0c1a33);
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
}

.agnes-tab:hover:not(.active) {
  color: var(--ag-text, #0c1a33);
}

/* badge */
.agnes-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 500;
}

.agnes-badge-free {
  background: rgba(0,206,201,0.15);
  color: #00cec9;
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
  background: var(--ag-line, rgba(32,74,150,0.15));
  margin: 12px 0;
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

/* --- settings panel --------------------------------------------------- */
.agnes-settings {
  padding: 16px;
  overflow-y: auto;
  max-height: 100%;
}

.agnes-settings::-webkit-scrollbar {
  width: 4px;
}

.agnes-settings::-webkit-scrollbar-thumb {
  background: rgba(108,92,231,0.3);
  border-radius: 2px;
}

.agnes-setting-group {
  margin-bottom: 20px;
}

.agnes-setting-group-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--ag-text, #0c1a33);
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.agnes-setting-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  border-radius: 8px;
  background: var(--ag-surface-2, rgba(255,255,255,0.55));
  margin-bottom: 6px;
  font-size: 13px;
}

.agnes-setting-label {
  color: var(--ag-text-2, #2a3c5e);
}

.agnes-setting-value {
  color: var(--ag-text, #0c1a33);
  font-weight: 500;
}

/* --- model selector ---------------------------------------------------- */
.agnes-model-select {
  width: 100%;
  height: 36px;
  padding: 0 12px;
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
  transition: border-color 0.15s ease;
}

.agnes-model-select:focus {
  outline: none;
  border-color: #6c5ce7;
  box-shadow: 0 0 0 2px rgba(108,92,231,0.2);
}

.agnes-model-info {
  margin-top: 6px;
  padding: 6px 8px;
  border-radius: 6px;
  background: rgba(108,92,231,0.08);
  font-size: 11px;
  color: var(--ag-text-2, #2a3c5e);
  line-height: 1.4;
}

.agnes-model-tag {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 500;
}

.agnes-model-tag-free {
  background: rgba(0,206,201,0.15);
  color: #00cec9;
}

.agnes-model-tag-vendor {
  background: rgba(108,92,231,0.15);
  color: #a29bfe;
}

/* --- size selector ---------------------------------------------------- */
.agnes-size-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.agnes-size-btn {
  flex: 0 0 auto;
  min-width: 60px;
  height: 28px;
  padding: 0 8px;
  border-radius: 6px;
  border: 1px solid var(--ag-line, rgba(32,74,150,0.15));
  background: var(--ag-surface-2, rgba(255,255,255,0.55));
  color: var(--ag-text-2, #2a3c5e);
  font-size: 11px;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.12s ease;
}

.agnes-size-btn:hover {
  border-color: rgba(108,92,231,0.3);
  color: var(--ag-text, #0c1a33);
}

.agnes-size-btn.active {
  background: #6c5ce7;
  border-color: #6c5ce7;
  color: #fff;
}

.agnes-ratio-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.agnes-ratio-btn {
  flex: 0 0 auto;
  min-width: 44px;
  height: 26px;
  padding: 0 6px;
  border-radius: 5px;
  border: 1px solid var(--ag-line, rgba(32,74,150,0.15));
  background: var(--ag-surface-2, rgba(255,255,255,0.55));
  color: var(--ag-text-2, #2a3c5e);
  font-size: 10px;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.12s ease;
}

.agnes-ratio-btn:hover {
  border-color: rgba(108,92,231,0.3);
}

.agnes-ratio-btn.active {
  background: rgba(108,92,231,0.2);
  border-color: #6c5ce7;
  color: #a29bfe;
}

/* --- video mode selector ----------------------------------------------- */
.agnes-mode-grid {
  display: flex;
  gap: 6px;
  margin-bottom: 8px;
}

.agnes-mode-btn {
  flex: 1;
  height: 32px;
  padding: 0 8px;
  border-radius: 6px;
  border: 1px solid var(--ag-line, rgba(32,74,150,0.15));
  background: var(--ag-surface-2, rgba(255,255,255,0.55));
  color: var(--ag-text-2, #2a3c5e);
  font-size: 11px;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.12s ease;
  text-align: center;
}

.agnes-mode-btn:hover {
  border-color: rgba(108,92,231,0.3);
  color: var(--ag-text, #0c1a33);
}

.agnes-mode-btn.active {
  background: #6c5ce7;
  border-color: #6c5ce7;
  color: #fff;
}

.agnes-frame-upload {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.agnes-frame-item {
  flex: 1;
  border: 2px dashed rgba(108,92,231,0.3);
  border-radius: 8px;
  padding: 12px;
  text-align: center;
  cursor: pointer;
  transition: all 0.15s ease;
  font-size: 12px;
  color: var(--ag-text-3, #6e80a3);
}

.agnes-frame-item:hover {
  border-color: rgba(108,92,231,0.5);
  background: rgba(108,92,231,0.05);
}

.agnes-frame-item.has-image {
  border-style: solid;
  border-color: rgba(108,92,231,0.4);
  padding: 4px;
}

.agnes-frame-item img {
  width: 100%;
  height: 80px;
  object-fit: cover;
  border-radius: 4px;
}

/* --- custom models ---------------------------------------------------- */
.agnes-custom-model-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.agnes-custom-model-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 10px;
  border-radius: 8px;
  background: var(--ag-surface-2, rgba(255,255,255,0.55));
  font-size: 12px;
}

.agnes-custom-model-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
  min-width: 0;
}

.agnes-custom-model-name {
  font-weight: 500;
  color: var(--ag-text, #0c1a33);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.agnes-custom-model-meta {
  font-size: 11px;
  color: var(--ag-text-3, #6e80a3);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* modal / dialog for adding custom model */
.agnes-modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.agnes-modal {
  width: min(480px, 90vw);
  max-height: 80vh;
  background: var(--ag-panel-solid, #ffffff);
  border-radius: 12px;
  border: 1px solid var(--ag-line, rgba(32,74,150,0.15));
  box-shadow: 0 16px 48px rgba(0,0,0,0.4);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.agnes-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid var(--ag-line, rgba(32,74,150,0.15));
  font-size: 14px;
  font-weight: 600;
  color: var(--ag-text, #0c1a33);
}

.agnes-modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.agnes-modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 12px 16px;
  border-top: 1px solid var(--ag-line, rgba(32,74,150,0.15));
}

.agnes-form-group {
  margin-bottom: 12px;
}

.agnes-form-label {
  display: block;
  font-size: 12px;
  font-weight: 500;
  color: var(--ag-text-2, #2a3c5e);
  margin-bottom: 4px;
}

.agnes-form-input {
  width: 100%;
  height: 34px;
  padding: 0 10px;
  border-radius: 8px;
  border: 1px solid var(--ag-line, rgba(32,74,150,0.15));
  background: var(--ag-surface-2, rgba(255,255,255,0.55));
  color: var(--ag-text, #0c1a33);
  font-size: 13px;
  font-family: inherit;
  box-sizing: border-box;
  transition: border-color 0.15s ease;
}

.agnes-form-input:focus {
  outline: none;
  border-color: #6c5ce7;
  box-shadow: 0 0 0 2px rgba(108,92,231,0.2);
}

.agnes-form-input::placeholder {
  color: var(--ag-text-3, #6e80a3);
  opacity: 0.6;
}

.agnes-form-select {
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

.agnes-form-select:focus {
  outline: none;
  border-color: #6c5ce7;
}

/* --- tab bar (top-level: image/video/storyboard/settings) -------------- */
.agnes-top-tabs {
  display: flex;
  gap: 2px;
  padding: 4px;
  border-radius: 10px;
  background: var(--ag-surface-2, rgba(255,255,255,0.55));
}

.agnes-top-tab {
  flex: 1;
  height: 32px;
  border: none;
  border-radius: 7px;
  background: transparent;
  color: var(--ag-text-3, #6e80a3);
  font-size: 12px;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.12s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.agnes-top-tab.active {
  background: var(--ag-panel-solid, #ffffff);
  color: var(--ag-text, #0c1a33);
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
}

.agnes-top-tab:hover:not(.active) {
  color: var(--ag-text, #0c1a33);
}

/* --- progress steps --------------------------------------------------- */
.agnes-steps {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
}

.agnes-step {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: var(--ag-text-2, #2a3c5e);
}

.agnes-step.active {
  color: var(--ag-text, #0c1a33);
}

.agnes-step.done {
  color: #00cec9;
}

.agnes-step-icon {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  background: var(--ag-surface-3, rgba(255,255,255,0.85));
  flex-shrink: 0;
}

.agnes-step.active .agnes-step-icon {
  background: #6c5ce7;
  color: #fff;
}

.agnes-step.done .agnes-step-icon {
  background: #00cec9;
  color: #fff;
}

/* ═══════════════════════════════════════════════════════════════════════
   v2 redesign — segmented tab bar, canvas, cover
   ═══════════════════════════════════════════════════════════════════════ */

/* --- header + tab bar ------------------------------------------------- */
.agnes-tabbar {
  padding: 10px 16px 0;
  border-bottom: 1px solid var(--ag-line);
  background: linear-gradient(180deg, rgba(255,255,255,0.03), transparent);
}

.agnes-tabs {
  display: flex;
  gap: 4px;
  padding: 0;
  border-radius: 0;
  background: transparent;
  margin-bottom: 0;
  overflow-x: auto;
  scrollbar-width: none;
}

.agnes-tabs::-webkit-scrollbar { display: none; }

.agnes-tab {
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 38px;
  padding: 0 14px;
  border: none;
  border-radius: 10px 10px 0 0;
  background: transparent;
  color: var(--ag-text-2);
  font-size: 13px;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  position: relative;
  transition: color 0.15s ease, background 0.15s ease;
  white-space: nowrap;
}

.agnes-tab-icon { font-size: 15px; line-height: 1; }
.agnes-tab-name { line-height: 1; }

.agnes-tab:hover:not(.active) {
  color: var(--ag-text);
  background: var(--ag-surface-2);
}

.agnes-tab.active {
  color: var(--ag-text);
  background: var(--ag-surface-2);
}

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
}

/* --- generic cards / polish ------------------------------------------ */
.agnes-section {
  padding: 14px 16px;
}

.agnes-section-title {
  font-size: 13px;
  font-weight: 650;
  letter-spacing: 0.01em;
  color: var(--ag-text);
  margin-bottom: 10px;
}

.agnes-btn {
  border-radius: 10px;
  transition: transform 0.12s ease, filter 0.15s ease, background 0.15s ease, box-shadow 0.15s ease;
}

.agnes-btn:not(:disabled):hover { filter: brightness(1.08); }
.agnes-btn:not(:disabled):active { transform: translateY(1px); }

.agnes-btn-primary {
  box-shadow: 0 6px 18px -8px rgba(108, 92, 231, 0.9);
}

.agnes-btn-ghost {
  background: var(--ag-surface-2);
  color: var(--ag-text-2);
}

.agnes-btn-ghost:not(:disabled):hover {
  background: var(--ag-surface-3);
  color: var(--ag-text);
}

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
  padding: 10px 14px;
  border-bottom: 1px solid var(--ag-line);
  background: var(--ag-surface-1);
  flex-wrap: wrap;
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
  color: var(--ag-text-2);
  min-width: 44px;
  text-align: center;
  font-variant-numeric: tabular-nums;
}

.agc-tips {
  font-size: 11px;
  color: var(--ag-text-3);
}

.agc-viewport {
  position: relative;
  flex: 1;
  min-height: 0;
  overflow: hidden;
  cursor: grab;
  background-color: #101020;
  /* dotted grid gives the canvas a sense of infinite space */
  background-image: radial-gradient(rgba(255,255,255,0.09) 1px, transparent 1px);
  background-size: 22px 22px;
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
  stroke: var(--ag-accent-2);
  stroke-width: 2;
  opacity: 0.75;
  pointer-events: stroke;
  cursor: pointer;
}

.agc-edge:hover { stroke: var(--ag-danger); opacity: 1; stroke-width: 3; }

.agc-node {
  position: absolute;
  display: flex;
  flex-direction: column;
  border-radius: var(--ag-radius);
  border: 1px solid var(--ag-line-strong);
  background: var(--ag-surface-1);
  box-shadow: 0 10px 26px -12px rgba(0,0,0,0.8);
  user-select: none;
  transition: box-shadow 0.15s ease, border-color 0.15s ease;
}

.agc-node:hover { border-color: rgba(162, 155, 254, 0.5); }

.agc-node.active {
  border-color: var(--ag-accent-2);
  box-shadow: 0 0 0 1px var(--ag-accent-2), 0 14px 30px -12px rgba(0,0,0,0.9);
}

.agc-node-head {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 8px;
  border-bottom: 1px solid var(--ag-line);
  background: linear-gradient(180deg, rgba(255,255,255,0.055), transparent);
  border-radius: var(--ag-radius) var(--ag-radius) 0 0;
  cursor: move;
}

.agc-node-icon { font-size: 13px; }

.agc-node-title {
  flex: 1;
  min-width: 0;
  border: none;
  background: transparent;
  color: var(--ag-text);
  font-size: 12px;
  font-weight: 600;
  font-family: inherit;
  outline: none;
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
  border: 1px dashed var(--ag-line-strong);
  border-radius: var(--ag-radius-sm);
  color: var(--ag-text-3);
  font-size: 11px;
  text-align: center;
  padding: 8px;
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
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--ag-surface-1);
  border: 2px solid var(--ag-accent-2);
  cursor: crosshair;
  transition: transform 0.12s ease, background 0.12s ease;
}

.agc-port:hover { transform: scale(1.35); background: var(--ag-accent-2); }
.agc-port-in { left: -6px; }
.agc-port-out { right: -6px; }

.agc-status {
  padding: 7px 14px;
  border-top: 1px solid var(--ag-line);
  background: var(--ag-surface-1);
  font-size: 11px;
  color: var(--ag-text-3);
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
  border-color: rgba(162, 155, 254, 0.55);
  background: linear-gradient(135deg, rgba(108,92,231,0.16), rgba(108,92,231,0.04));
  box-shadow: 0 12px 34px -18px rgba(108,92,231,0.95);
}

.agdp-next-head {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.agdp-next-icon { font-size: 18px; line-height: 1.2; }

.agdp-next-title {
  font-size: 14px;
  font-weight: 650;
  color: var(--ag-text);
}

.agdp-next-sub {
  font-size: 12px;
  color: var(--ag-text-2);
  margin-top: 2px;
}

.agdp-next-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.agdp-warn {
  font-size: 12px;
  color: var(--ag-warn);
  background: rgba(255, 209, 102, 0.1);
  border-radius: var(--ag-radius-sm);
  padding: 8px 10px;
  line-height: 1.5;
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
  font-size: 12px;
  font-weight: 650;
  color: var(--ag-text);
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
  border: 1px solid var(--ag-line-strong);
  background: var(--ag-surface-2);
  color: var(--ag-text-2);
  border-radius: 99px;
  padding: 5px 12px;
  font-size: 12px;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.15s ease;
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
  box-shadow: 0 18px 40px -14px rgba(0,0,0,0.9);
}

.agcv-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  flex: 1;
  color: var(--ag-text-3);
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

/* ═══════════════════════════════════════════════════════════════════════
   v3 — cinematic dark studio
   Layering rule: surface-0 (void) → 1 (card) → 2 (raised) → 3 (hover) → 4 (active).
   Colour rule: violet = primary/action, cyan = image, pink = video. Accent is
   scarce so it always points at the next action.
   ═══════════════════════════════════════════════════════════════════════ */

/* --- title bar: dark with a gradient hairline, not a purple slab ------ */
.agnes-titlebar {
  height: 56px;
  flex: 0 0 56px;
  padding: 0 18px;
  background: linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.01));
  border-bottom: 1px solid var(--ag-line);
  color: var(--ag-text);
  position: relative;
}

.agnes-titlebar::after {
  content: '';
  position: absolute;
  left: 0; right: 0; bottom: -1px;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--ag-accent), var(--ag-accent-3), transparent);
  opacity: 0.85;
}

.agnes-titlebar-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 9px;
  font-size: 15px;
  background: linear-gradient(135deg, var(--ag-accent), #b06ab3);
  box-shadow: var(--ag-glow);
}

.agnes-titlebar-text {
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 0.2px;
  background: linear-gradient(90deg, #ffffff, #cfc6ff);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.agnes-titlebar-btn {
  width: 30px;
  height: 30px;
  border-radius: 9px;
  background: var(--ag-surface-2);
  border: 1px solid var(--ag-line);
  color: var(--ag-text-2);
  font-size: 13px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s ease;
}

.agnes-titlebar-btn:hover {
  background: rgba(255, 107, 107, 0.18);
  border-color: rgba(255, 107, 107, 0.5);
  color: #ff8f8f;
}

/* --- tab bar: segmented pills with a glowing active state ------------- */
.agnes-tabbar {
  padding: 12px 16px 0;
  background: linear-gradient(180deg, rgba(255,255,255,0.02), transparent);
  border-bottom: 1px solid var(--ag-line);
}

.agnes-tabs {
  gap: 6px;
  padding-bottom: 10px;
}

.agnes-tab {
  height: 36px;
  padding: 0 13px;
  border-radius: 10px;
  border: 1px solid transparent;
  background: var(--ag-surface-1);
  color: var(--ag-text-2);
  font-size: 12.5px;
  font-weight: 600;
}

.agnes-tab-icon { font-size: 14px; filter: saturate(1.15); }

.agnes-tab:hover:not(.active) {
  background: var(--ag-surface-3);
  border-color: var(--ag-line-strong);
  color: var(--ag-text);
}

.agnes-tab.active {
  background: linear-gradient(135deg, rgba(124,92,255,0.95), rgba(167,139,250,0.85));
  border-color: rgba(190, 175, 255, 0.7);
  color: #fff;
  box-shadow: var(--ag-glow), inset 0 1px 0 rgba(255,255,255,0.28);
}

.agnes-tab.active::after { display: none; }

/* --- surfaces: cards that actually lift off the void ------------------ */
.agnes-section { padding: 16px; }

.agnes-section-title {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--ag-text-3);
  margin-bottom: 12px;
}

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
.agnes-btn {
  height: 36px;
  padding: 0 16px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 13px;
  letter-spacing: 0.01em;
}

.agnes-btn-primary {
  background: linear-gradient(135deg, #7c5cff 0%, #a78bfa 55%, #22d3ee 140%);
  color: #fff;
  border: 1px solid rgba(190, 175, 255, 0.55);
  box-shadow: 0 10px 26px -12px rgba(124, 92, 255, 1), inset 0 1px 0 rgba(255,255,255,0.3);
}

.agnes-btn-primary:not(:disabled):hover {
  box-shadow: 0 14px 34px -12px rgba(124, 92, 255, 1), inset 0 1px 0 rgba(255,255,255,0.4);
  filter: brightness(1.08);
}

.agnes-btn-secondary {
  background: var(--ag-surface-3);
  color: var(--ag-text);
  border: 1px solid var(--ag-line-strong);
}

.agnes-btn-secondary:not(:disabled):hover {
  background: var(--ag-surface-4);
  border-color: rgba(167, 139, 250, 0.6);
}

.agnes-btn-ghost {
  background: transparent;
  color: var(--ag-text-2);
  border: 1px solid var(--ag-line-strong);
}

.agnes-btn-ghost:not(:disabled):hover {
  background: var(--ag-surface-2);
  color: var(--ag-text);
  border-color: var(--ag-accent-2);
}

.agnes-btn-danger {
  background: rgba(255, 107, 107, 0.14);
  color: #ff8f8f;
  border: 1px solid rgba(255, 107, 107, 0.45);
}

.agnes-btn-sm { height: 30px; padding: 0 11px; font-size: 12px; border-radius: 8px; }

.agnes-btn:disabled { opacity: 0.42; filter: grayscale(0.45); }

/* --- canvas: coloured node grammar ----------------------------------- */
.agc-toolbar {
  background: rgba(0, 0, 0, 0.35);
  border-bottom: 1px solid var(--ag-line);
  padding: 12px 16px;
}

.agc-viewport {
  background-color: #07070d;
  background-image:
    radial-gradient(rgba(124, 92, 255, 0.22) 1px, transparent 1px),
    radial-gradient(900px 400px at 50% 0%, rgba(34, 211, 238, 0.06), transparent 70%);
  background-size: 24px 24px, 100% 100%;
}

.agc-node {
  background: linear-gradient(180deg, var(--ag-surface-2), var(--ag-surface-1));
  border: 1px solid var(--ag-line-strong);
  border-radius: 14px;
  box-shadow: 0 18px 40px -18px rgba(0,0,0,1), inset 0 1px 0 rgba(255,255,255,0.07);
}

.agc-node-head {
  padding: 9px 10px;
  border-radius: 14px 14px 0 0;
  border-bottom: 1px solid var(--ag-line);
  font-weight: 600;
}

/* type colour on the node header + left edge */
.agc-node-text  .agc-node-head { background: linear-gradient(180deg, rgba(124,92,255,0.30), rgba(124,92,255,0.05)); }
.agc-node-image .agc-node-head { background: linear-gradient(180deg, rgba(34,211,238,0.28), rgba(34,211,238,0.04)); }
.agc-node-video .agc-node-head { background: linear-gradient(180deg, rgba(244,114,182,0.28), rgba(244,114,182,0.04)); }

.agc-node-text  { border-color: rgba(124,92,255,0.45); }
.agc-node-image { border-color: rgba(34,211,238,0.42); }
.agc-node-video { border-color: rgba(244,114,182,0.42); }

.agc-node.active { box-shadow: 0 0 0 2px var(--ag-accent-2), 0 22px 46px -18px rgba(0,0,0,1); }

.agc-node-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 6px;
  font-size: 11px;
  background: rgba(0,0,0,0.35);
}

.agc-port {
  width: 14px;
  height: 14px;
  border-width: 2px;
  box-shadow: 0 0 12px rgba(124, 92, 255, 0.75);
  background: #0a0a12;
}

.agc-port-out { border-color: var(--ag-accent-2); }
.agc-port-in  { border-color: var(--ag-accent-3); box-shadow: 0 0 12px rgba(34,211,238,0.7); }

.agc-edge {
  stroke: url(#agEdgeGrad);
  stroke: var(--ag-accent-2);
  stroke-width: 2.5;
  filter: drop-shadow(0 0 6px rgba(124, 92, 255, 0.85));
  opacity: 0.95;
}

.agc-status {
  background: rgba(0, 0, 0, 0.4);
  color: var(--ag-text-3);
  letter-spacing: 0.02em;
}

/* --- cover: poster-wall preview -------------------------------------- */
.agcv-card {
  background: linear-gradient(180deg, var(--ag-surface-2), var(--ag-surface-1));
  border: 1px solid var(--ag-line-strong);
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.06);
}

.agcv-card-title { font-size: 12px; letter-spacing: 0.04em; text-transform: uppercase; color: var(--ag-text-3); }

.agcv-preview {
  background:
    radial-gradient(600px 300px at 50% 0%, rgba(124,92,255,0.14), transparent 70%),
    repeating-linear-gradient(45deg, rgba(255,255,255,0.014) 0 12px, transparent 12px 24px),
    rgba(0, 0, 0, 0.35);
  border: 1px solid var(--ag-line-strong);
  min-height: 460px;
}

.agcv-cover-img {
  border: 1px solid rgba(190, 175, 255, 0.5);
  box-shadow: 0 26px 60px -20px rgba(0,0,0,1), 0 0 40px -12px rgba(124,92,255,0.7);
}

.agcv-style {
  background: var(--ag-surface-2);
  border: 1px solid var(--ag-line-strong);
  font-weight: 600;
}

.agcv-style.active {
  background: linear-gradient(135deg, rgba(124,92,255,0.95), rgba(34,211,238,0.75));
  border-color: rgba(190, 175, 255, 0.8);
  color: #fff;
  box-shadow: var(--ag-glow);
}

.agcv-empty { color: var(--ag-text-2); }

/* --- anchor: mode picker as cards ------------------------------------ */
.agnes-anchor .agnes-btn[title] {
  height: auto;
  min-height: 44px;
  line-height: 1.35;
  white-space: normal;
  text-align: center;
}

.agnes-keyguide {
  border: 1px solid rgba(255, 209, 102, 0.4);
  background: linear-gradient(135deg, rgba(255, 209, 102, 0.12), rgba(255, 209, 102, 0.03));
}

.agnes-error {
  border: 1px solid rgba(255, 107, 107, 0.45);
  background: linear-gradient(135deg, rgba(255,107,107,0.16), rgba(255,107,107,0.05));
  color: #ff9d9d;
}

.agdp-next.primary {
  border-color: rgba(167, 139, 250, 0.6);
  background: linear-gradient(135deg, rgba(124,92,255,0.24), rgba(34,211,238,0.07));
  box-shadow: 0 18px 44px -22px rgba(124, 92, 255, 1), inset 0 1px 0 rgba(255,255,255,0.07);
}

.agdp-next-title { font-size: 15px; }

/* --- misc polish ------------------------------------------------------ */
.agnes-badge { border-radius: 999px; font-weight: 600; }
.agnes-empty-icon { font-size: 40px; filter: drop-shadow(0 8px 18px rgba(124,92,255,0.5)); }
.agnes-skeleton { color: var(--ag-text-2); }


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
.agnes-model-select {
  background: rgba(0, 0, 0, 0.42) !important;
  border: 1px solid var(--ag-line-strong) !important;
  border-radius: 10px !important;
  color: var(--ag-text) !important;
  font-weight: 600;
  height: 36px;
}

.agnes-model-info {
  background: rgba(0, 0, 0, 0.28);
  border: 1px solid var(--ag-line);
  border-radius: 10px;
  padding: 8px 10px;
}

.agnes-model-tag {
  background: var(--ag-surface-3);
  border: 1px solid var(--ag-line-strong);
  border-radius: 999px;
  font-weight: 700;
  font-size: 10px;
  padding: 2px 8px;
}

.agnes-model-tag-free {
  background: linear-gradient(135deg, rgba(34,211,238,0.9), rgba(124,92,255,0.9));
  border-color: rgba(190,175,255,0.7);
  color: #fff;
}

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

.agnes-thumb:hover { border-color: var(--ag-accent-2); box-shadow: var(--ag-glow); }

/* empty states: bigger, with a glowing disc behind the glyph */
.agnes-empty-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 84px;
  height: 84px;
  border-radius: 26px;
  font-size: 38px;
  margin-bottom: 14px;
  background: linear-gradient(135deg, rgba(124,92,255,0.24), rgba(34,211,238,0.12));
  border: 1px solid rgba(167, 139, 250, 0.4);
  box-shadow: 0 20px 46px -18px rgba(124,92,255,1), inset 0 1px 0 rgba(255,255,255,0.12);
}

.agnes-empty-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--ag-text);
  margin-bottom: 6px;
}

.agnes-empty { color: var(--ag-text-3); }

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
.agnes-setting-group-title {
  color: var(--ag-accent-2);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.07em;
  text-transform: uppercase;
}

.agnes-setting-label { color: var(--ag-text-2); font-size: 12px; }
.agnes-setting-value { color: var(--ag-text); font-size: 12px; font-weight: 600; }
.agnes-divider { background: var(--ag-line); }

/* canvas nodes: lift the body off the card so text reads */
.agc-node-body { background: rgba(0, 0, 0, 0.18); }

.agc-node-empty {
  border-color: rgba(255,255,255,0.22);
  color: var(--ag-text-2);
  background: rgba(0, 0, 0, 0.3);
  font-weight: 500;
}

.agc-node-text { min-height: 104px; }

/* anchor mode picker: readable cards with a clear selected state */
.agnes-anchor .agnes-btn[title] {
  border-radius: 12px;
  font-weight: 600;
  padding: 10px 12px;
}


/* --- cover: poster-frame empty state --------------------------------- */
.agcv-poster-slot {
  width: 210px;
  aspect-ratio: 3 / 4;
  border: 1.5px dashed rgba(167, 139, 250, 0.5);
  border-radius: 14px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  background: linear-gradient(180deg, rgba(124,92,255,0.10), rgba(34,211,238,0.04));
  box-shadow: inset 0 0 40px -18px rgba(124, 92, 255, 0.9);
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
  color: var(--ag-text-3);
  font-size: 11px;
  background: rgba(0, 0, 0, 0.25);
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
  border-color: var(--ag-accent-2);
  color: var(--ag-text);
  transform: translateY(-1px);
}

.agnes-mode-card .agnes-mode-icon { font-size: 20px; line-height: 1; }

.agnes-mode-card .agnes-mode-desc {
  font-size: 11px;
  font-weight: 400;
  color: var(--ag-text-3);
  line-height: 1.45;
}

.agnes-mode-card.active {
  border-color: rgba(190, 175, 255, 0.85);
  background: linear-gradient(135deg, rgba(124,92,255,0.95), rgba(167,139,250,0.8));
  color: #fff;
  box-shadow: 0 14px 34px -16px rgba(124, 92, 255, 1), inset 0 1px 0 rgba(255,255,255,0.28);
}

.agnes-mode-card.active .agnes-mode-desc { color: rgba(255, 255, 255, 0.82); }

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
.agc-node-title {
  background: transparent !important;
  border: 1px solid transparent !important;
  border-radius: 6px !important;
  padding: 2px 6px !important;
  color: #fff !important;
  font-size: 12.5px !important;
  font-weight: 700 !important;
  letter-spacing: 0.01em;
  box-shadow: none !important;
  min-width: 0;
}

.agc-node-title:hover { background: rgba(0, 0, 0, 0.28) !important; }

.agc-node-title:focus {
  background: rgba(0, 0, 0, 0.5) !important;
  border-color: rgba(255, 255, 255, 0.4) !important;
  box-shadow: none !important;
}

/* node body text a touch taller so short paragraphs are not clipped */
.agc-node-text { min-height: 118px; }
.agc-node { backdrop-filter: blur(2px); }


/* ═══════════════════════════════════════════════════════════════════════
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
  background: radial-gradient(900px 200px at 50% 0%, var(--ag-mod-soft), transparent 70%);
  opacity: 0.9;
  z-index: 0;
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

.agnes-tab {
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.035);
  border: 1px solid rgba(255, 255, 255, 0.07);
}

.agnes-tab .agnes-tab-icon {
  filter: none;
  font-size: 15px;
}

.agnes-tab:hover:not(.active) {
  background: var(--ts, var(--ag-surface-3));
  border-color: var(--t, var(--ag-line-strong));
  color: #fff;
}

.agnes-tab.active {
  background: linear-gradient(135deg, var(--t, #7c5cff), var(--t2, #a78bfa));
  border-color: rgba(255, 255, 255, 0.35);
  color: #fff;
  box-shadow: 0 10px 26px -12px var(--t, #7c5cff), inset 0 1px 0 rgba(255,255,255,0.32);
}

/* --- section titles: colour dot + bold, 剪映式分区感 ------------------ */
.agnes-section-title {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.05em;
  color: var(--ag-text);
  text-transform: none;
}

.agnes-section-title::before {
  content: '';
  width: 4px;
  height: 14px;
  border-radius: 99px;
  background: linear-gradient(180deg, var(--ag-mod), var(--ag-mod-2));
  box-shadow: 0 0 10px var(--ag-mod-glow);
  flex: 0 0 auto;
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
  background: linear-gradient(135deg, var(--ag-mod), var(--ag-mod-2));
  border-color: rgba(255, 255, 255, 0.32);
  box-shadow: 0 12px 30px -14px var(--ag-mod), inset 0 1px 0 rgba(255,255,255,0.32);
  height: 38px;
}

.agnes-root .agnes-btn-primary:not(:disabled):hover {
  box-shadow: 0 16px 38px -14px var(--ag-mod), inset 0 1px 0 rgba(255,255,255,0.42);
  transform: translateY(-1px);
}

/* --- progress / accents follow the module ---------------------------- */
.agnes-progress-fill {
  background: linear-gradient(90deg, var(--ag-mod), var(--ag-mod-2)) !important;
  box-shadow: 0 0 14px -2px var(--ag-mod-glow);
}

.agnes-progress-bar {
  background: rgba(255, 255, 255, 0.08);
  height: 6px;
  border-radius: 99px;
}

/* --- empty states: bigger, colourful -------------------------------- */
.agnes-empty-icon {
  width: 92px;
  height: 92px;
  border-radius: 28px;
  font-size: 42px;
  background: linear-gradient(135deg, var(--ag-mod), var(--ag-mod-2));
  border: 1px solid rgba(255, 255, 255, 0.28);
  box-shadow: 0 22px 50px -18px var(--ag-mod), inset 0 1px 0 rgba(255,255,255,0.35);
}

/* --- selected states take the module colour -------------------------- */
.agnes-size-btn.active,
.agnes-ratio-btn.active,
.agnes-mode-btn.active,
.agcv-style.active,
.agnes-mode-card.active,
.agnes-tab.active {
  color: #fff;
}

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

.agnes-mode-card.active {
  background: linear-gradient(135deg, var(--ag-mod), var(--ag-mod-2));
  border-color: rgba(255, 255, 255, 0.35);
  box-shadow: 0 16px 36px -16px var(--ag-mod), inset 0 1px 0 rgba(255,255,255,0.3);
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
.agnes-titlebar-icon {
  background: linear-gradient(135deg, var(--ag-mod), var(--ag-mod-2));
  box-shadow: 0 6px 20px -6px var(--ag-mod);
}

.agnes-titlebar::after {
  background: linear-gradient(90deg, transparent, var(--ag-mod), var(--ag-mod-2), transparent);
}

/* --- badges/chips are punchier --------------------------------------- */
.agnes-badge {
  background: var(--ag-mod-soft);
  border: 1px solid var(--ag-mod);
  color: #fff;
  font-weight: 700;
}

.agdp-next.primary {
  border-color: var(--ag-mod);
  background: linear-gradient(135deg, var(--ag-mod-soft), rgba(0,0,0,0.15));
  box-shadow: 0 18px 44px -22px var(--ag-mod), inset 0 1px 0 rgba(255,255,255,0.08);
}

.agdp-next-title { font-size: 15px; font-weight: 800; }

/* --- node grammar keeps its own colours (not the module's) ----------- */
.agc-node-text  .agc-node-head { background: linear-gradient(180deg, rgba(124,92,255,0.42), rgba(124,92,255,0.08)) !important; }
.agc-node-image .agc-node-head { background: linear-gradient(180deg, rgba(34,211,238,0.38), rgba(34,211,238,0.07)) !important; }
.agc-node-video .agc-node-head { background: linear-gradient(180deg, rgba(244,114,182,0.38), rgba(244,114,182,0.07)) !important; }

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

.agcv-poster-slot {
  border-color: var(--ag-mod);
  background: linear-gradient(180deg, var(--ag-mod-soft), rgba(0,0,0,0.25));
  box-shadow: inset 0 0 44px -18px var(--ag-mod);
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


/* ═══════════════════════════════════════════════════════════════════════
   v5 — 光洁科技感（对齐 soft.zmm168.top 的视觉语言）
   浅色底 + 半透明白面板 + 青色主色 + 渐变 CTA + HUD 角标 + 等宽大写微标签。
   ═══════════════════════════════════════════════════════════════════════ */

[data-dsh-agnes-studio] {
  --ag-bg: #eef3fb;
  --ag-bg-1: #e5ecf8;
  --ag-bg-2: #dae4f5;
  --ag-panel: rgba(255, 255, 255, 0.72);
  --ag-panel-solid: #ffffff;
  --ag-panel-strong: rgba(255, 255, 255, 0.94);
  --ag-line: rgba(32, 74, 150, 0.15);
  --ag-line-2: rgba(32, 96, 190, 0.32);
  --ag-t1: #0c1a33;
  --ag-t2: #2a3c5e;
  --ag-muted: #566a8d;
  --ag-dim: #6e80a3;
  --ag-accent: #0891b2;
  --ag-accent-2: #7c3aed;
  --ag-accent-3: #db2777;
  --ag-ok: #0f9d58;
  --ag-warn: #a16207;
  --ag-grad: linear-gradient(120deg, #0891b2, #7c3aed);
  --ag-grad-3: linear-gradient(120deg, #0891b2, #7c3aed 55%, #db2777);
  --ag-glow-accent: 0 10px 26px -14px rgba(8, 145, 178, 0.55);
  --ag-glow-soft: 0 18px 44px -24px rgba(24, 50, 100, 0.30);
  --ag-radius: 16px;
  --ag-radius-sm: 10px;
  --ag-radius-lg: 24px;
  --ag-font-mono: ui-monospace, "JetBrains Mono", "SF Mono", SFMono-Regular, Menlo, Consolas, monospace;
  --ag-ease: cubic-bezier(0.22, 0.61, 0.36, 1);

  /* re-point the palette v3/v4 read from */
  --ag-surface-0: #eef3fb;
  --ag-surface-1: rgba(255, 255, 255, 0.72);
  --ag-surface-2: rgba(255, 255, 255, 0.55);
  --ag-surface-3: rgba(255, 255, 255, 0.85);
  --ag-surface-4: #ffffff;
  --ag-text: #0c1a33;
  --ag-text-2: #2a3c5e;
  --ag-text-3: #6e80a3;
  --ag-line-strong: rgba(32, 96, 190, 0.32);

  background:
    radial-gradient(900px 420px at 12% -8%, rgba(8, 145, 178, 0.14), transparent 62%),
    radial-gradient(760px 400px at 88% -6%, rgba(124, 58, 237, 0.13), transparent 62%),
    linear-gradient(180deg, #f4f8ff 0%, #e8eefa 55%, #e2e9f7 100%);
  border: 1px solid rgba(255, 255, 255, 0.9);
  box-shadow:
    0 40px 110px -30px rgba(20, 45, 95, 0.45),
    0 0 0 1px rgba(32, 74, 150, 0.10),
    inset 0 1px 0 #ffffff;
  color: var(--ag-t1);
}

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

.agnes-root::before { background: radial-gradient(900px 220px at 50% 0%, var(--ag-mod-soft), transparent 72%); opacity: 0.55; }

/* --- title bar: white glass, navy type, mono subtitle ---------------- */
.agnes-titlebar {
  height: 64px;
  flex: 0 0 64px;
  padding: 0 20px;
  background: rgba(255, 255, 255, 0.66);
  backdrop-filter: blur(14px);
  border-bottom: 1px solid var(--ag-line);
  color: var(--ag-t1);
}

.agnes-titlebar::after {
  height: 2px;
  background: var(--ag-grad-3);
  opacity: 0.9;
}

.agnes-titlebar-icon {
  width: 34px;
  height: 34px;
  border-radius: 11px;
  font-size: 16px;
  background: var(--ag-grad);
  box-shadow: var(--ag-glow-accent);
}

.agnes-titlebar-text {
  font-size: 15.5px;
  font-weight: 800;
  letter-spacing: -0.01em;
  background: linear-gradient(90deg, #0c1a33, #12325f);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.agnes-titlebar-btn {
  background: #ffffff;
  border: 1px solid var(--ag-line-2);
  color: var(--ag-muted);
  width: 32px;
  height: 32px;
  border-radius: 10px;
  box-shadow: 0 2px 6px -3px rgba(24, 50, 100, 0.3);
}

.agnes-titlebar-btn:hover {
  background: #fff1f2;
  border-color: rgba(219, 39, 119, 0.5);
  color: #db2777;
}

/* --- tabs: white pills, gradient active ------------------------------ */
.agnes-tabbar {
  padding: 12px 20px 0;
  background: rgba(255, 255, 255, 0.42);
  border-bottom: 1px solid var(--ag-line);
}

.agnes-tabs { gap: 8px; padding-bottom: 12px; }

.agnes-tab {
  height: 38px;
  padding: 0 15px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid var(--ag-line);
  color: var(--ag-muted);
  font-weight: 600;
  box-shadow: 0 2px 8px -6px rgba(24, 50, 100, 0.4);
}

.agnes-tab:hover:not(.active) {
  background: #ffffff;
  border-color: var(--ag-line-2);
  color: var(--ag-t1);
}

.agnes-tab.active {
  background: var(--ag-grad);
  border-color: transparent;
  color: #fff;
  box-shadow: var(--ag-glow-accent);
}

/* --- section titles: mono uppercase eyebrow (as on the reference) ---- */
.agnes-section { padding: 16px 20px; }

.agnes-section-title {
  font-family: var(--ag-font-mono);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--ag-muted);
  gap: 8px;
}

.agnes-section-title::before {
  width: 14px;
  height: 2px;
  border-radius: 2px;
  background: var(--ag-mod, var(--ag-accent));
  box-shadow: none;
}

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

.agcv-card-title {
  font-family: var(--ag-font-mono);
  font-size: 10.5px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--ag-accent);
}

/* --- buttons: gradient pill CTA -------------------------------------- */
.agnes-root .agnes-btn-primary {
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

.agnes-btn-secondary {
  background: #ffffff !important;
  border: 1px solid var(--ag-line-2) !important;
  color: var(--ag-t2) !important;
  border-radius: 999px;
}

.agnes-btn-secondary:not(:disabled):hover {
  border-color: var(--ag-accent) !important;
  color: var(--ag-accent) !important;
}

.agnes-btn-ghost {
  background: rgba(255, 255, 255, 0.6) !important;
  border: 1px solid var(--ag-line) !important;
  color: var(--ag-muted) !important;
  border-radius: 999px;
}

.agnes-btn-ghost:not(:disabled):hover {
  background: #ffffff !important;
  border-color: var(--ag-line-2) !important;
  color: var(--ag-t1) !important;
}

.agnes-btn { border-radius: 999px; font-weight: 600; }

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
.agnes-empty-icon {
  width: 76px;
  height: 76px;
  border-radius: 22px;
  font-size: 34px;
  background: var(--ag-grad);
  border: 1px solid rgba(255, 255, 255, 0.85);
  box-shadow: 0 20px 44px -18px rgba(8, 145, 178, 0.7), inset 0 1px 0 rgba(255,255,255,0.5);
}

.agnes-empty-title { color: var(--ag-t1); font-weight: 800; }
.agnes-empty { color: var(--ag-dim); }

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

.agcv-poster-slot {
  border: 1.5px dashed var(--ag-line-2);
  background: linear-gradient(180deg, rgba(8,145,178,0.07), rgba(124,58,237,0.04));
  box-shadow: none;
}

.agcv-slot-mini { border-color: var(--ag-line-2); background: rgba(255,255,255,0.6); color: var(--ag-dim); }
.agcv-cover-img { border: 1px solid rgba(255,255,255,0.9); box-shadow: 0 26px 60px -22px rgba(20,45,95,0.55), 0 0 0 1px rgba(32,74,150,0.14); }

.agcv-style {
  background: #ffffff;
  border: 1px solid var(--ag-line-2);
  color: var(--ag-muted);
  font-weight: 600;
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

.agnes-mode-card:hover { border-color: var(--ag-line-2); color: var(--ag-t1); transform: translateY(-2px); }

.agnes-mode-card .agnes-mode-desc { color: var(--ag-dim); }

.agnes-mode-card.active {
  background: linear-gradient(120deg, var(--ag-mod), var(--ag-mod-2));
  border-color: transparent;
  color: #fff;
  box-shadow: 0 14px 30px -16px var(--ag-mod-glow);
}

.agnes-mode-card.active .agnes-mode-desc { color: rgba(255,255,255,0.88); }

/* --- canvas: light engineering surface ------------------------------ */
.agc-toolbar {
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--ag-line);
}

.agc-viewport {
  background-color: #eaf1fb;
  background-image:
    radial-gradient(rgba(32, 96, 190, 0.22) 1.2px, transparent 1.2px),
    radial-gradient(800px 380px at 50% 0%, rgba(8,145,178,0.10), transparent 70%);
  background-size: 24px 24px, 100% 100%;
}

.agc-node {
  background: #ffffff;
  border: 1px solid var(--ag-line-2);
  border-radius: var(--ag-radius);
  box-shadow: 0 18px 40px -22px rgba(20, 45, 95, 0.5), 0 1px 0 rgba(255,255,255,0.9) inset;
}

.agc-node-head { border-bottom: 1px solid var(--ag-line); }
.agc-node-title { color: var(--ag-t1) !important; }
.agc-node-title:hover { background: rgba(32, 74, 150, 0.06) !important; }

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

.agc-node-empty {
  border: 1px dashed var(--ag-line-2);
  background: rgba(238, 243, 251, 0.7);
  color: var(--ag-dim);
}

.agc-edge { stroke: var(--ag-accent) !important; filter: drop-shadow(0 2px 4px rgba(8,145,178,0.35)); opacity: 0.9; }

.agc-status {
  background: rgba(255, 255, 255, 0.55);
  border-top: 1px solid var(--ag-line);
  color: var(--ag-dim);
  font-family: var(--ag-font-mono);
  font-size: 10.5px;
  letter-spacing: 0.08em;
}

.agc-tips { font-family: var(--ag-font-mono); font-size: 10px; letter-spacing: 0.06em; color: var(--ag-dim); }
.agc-zoom { font-family: var(--ag-font-mono); color: var(--ag-muted); }

/* --- misc: light surfaces for rails, bars, badges ------------------- */
.agnes-left, .agnes-right {
  background: rgba(255, 255, 255, 0.5);
  border-color: var(--ag-line);
}

.agnes-left-header,
.agnes-action-bar,
.agnes-statusbar,
.agnes-tabbar { color: var(--ag-muted); }

.agnes-action-bar, .agnes-statusbar {
  background: rgba(255, 255, 255, 0.62);
  border-color: var(--ag-line);
}

.agnes-statusbar { font-family: var(--ag-font-mono); font-size: 10.5px; letter-spacing: 0.06em; color: var(--ag-dim); }

.agnes-badge {
  background: rgba(8, 145, 178, 0.12);
  border: 1px solid rgba(8, 145, 178, 0.35);
  color: var(--ag-accent);
  font-family: var(--ag-font-mono);
  font-size: 10px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.agnes-badge-free {
  background: rgba(15, 157, 88, 0.12);
  border-color: rgba(15, 157, 88, 0.35);
  color: var(--ag-ok);
}

.agnes-keyguide {
  border: 1px solid rgba(161, 98, 7, 0.3);
  background: linear-gradient(135deg, rgba(255, 251, 235, 0.95), rgba(254, 243, 199, 0.6));
}

.agnes-keyguide-title { color: #854d0e; }
.agnes-keyguide-note, .agnes-keyguide-step { color: #6b7280; }
.agnes-keyguide-num { background: var(--ag-grad); }

.agnes-error {
  border: 1px solid rgba(219, 39, 119, 0.35);
  background: rgba(253, 242, 248, 0.9);
  color: #be185d;
}

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

.agnes-progress-bar { background: rgba(32, 74, 150, 0.14); }

.agnes-model-info { background: rgba(255,255,255,0.7); border: 1px solid var(--ag-line); }
.agnes-model-tag { background: rgba(8,145,178,0.12); border-color: rgba(8,145,178,0.35); color: var(--ag-accent); }
.agnes-model-tag-free { background: var(--ag-grad); border-color: transparent; color: #fff; }

.agnes-setting-group-title { color: var(--ag-accent); }
.agnes-setting-label { color: var(--ag-muted); }
.agnes-setting-value { color: var(--ag-t1); }
.agnes-divider { background: var(--ag-line); }

.agdp-next {
  background: var(--ag-panel-strong);
  border: 1px solid var(--ag-line);
  box-shadow: var(--ag-glow-soft);
  border-radius: var(--ag-radius);
}

.agdp-next.primary {
  border-color: rgba(8, 145, 178, 0.4);
  background: linear-gradient(135deg, rgba(236, 254, 255, 0.95), rgba(245, 243, 255, 0.9));
  box-shadow: var(--ag-glow-accent);
}

.agdp-next-title { color: var(--ag-t1); }
.agdp-next-sub { color: var(--ag-muted); }

.agdp-warn {
  background: rgba(255, 251, 235, 0.95);
  border: 1px solid rgba(161, 98, 7, 0.3);
  color: var(--ag-warn);
}

/* scrollbars for light surfaces */
[data-dsh-agnes-studio] ::-webkit-scrollbar-thumb { background: rgba(32, 74, 150, 0.22); background-clip: content-box; }
[data-dsh-agnes-studio] ::-webkit-scrollbar-thumb:hover { background: rgba(32, 74, 150, 0.4); background-clip: content-box; }

[data-dsh-agnes-studio] :focus-visible { box-shadow: 0 0 0 3px rgba(8, 145, 178, 0.3); }


/* --- v5 canvas polish: ports + node headers on the light surface ----- */
.agc-port {
  background: #ffffff !important;
  border-width: 2.5px !important;
  box-shadow: 0 2px 8px -2px rgba(20, 45, 95, 0.45) !important;
}
.agc-port-out { border-color: var(--ag-accent-2) !important; }
.agc-port-in  { border-color: var(--ag-accent) !important; }
.agc-port:hover { background: var(--ag-accent) !important; }

.agc-node-text  .agc-node-head { background: linear-gradient(180deg, rgba(124,58,237,0.16), rgba(124,58,237,0.04)) !important; }
.agc-node-image .agc-node-head { background: linear-gradient(180deg, rgba(8,145,178,0.18), rgba(8,145,178,0.04)) !important; }
.agc-node-video .agc-node-head { background: linear-gradient(180deg, rgba(219,39,119,0.16), rgba(219,39,119,0.04)) !important; }

.agc-node-text  { border-color: rgba(124,58,237,0.35) !important; }
.agc-node-image { border-color: rgba(8,145,178,0.38) !important; }
.agc-node-video { border-color: rgba(219,39,119,0.35) !important; }

.agc-node-icon { background: rgba(255,255,255,0.85) !important; border: 1px solid var(--ag-line); }

.agc-node.active {
  box-shadow: 0 0 0 2px var(--ag-accent), 0 22px 46px -22px rgba(20, 45, 95, 0.55) !important;
}

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
.agnes-preview-area { position: relative; }
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

.agc-node-empty {
  color: var(--ag-t2) !important;
  background: rgba(255, 255, 255, 0.9) !important;
  border-color: var(--ag-line-2) !important;
}

.agnes-section-title { color: var(--ag-text-2) !important; }
.agnes-empty-desc, .agnes-skeleton-text { color: var(--ag-muted) !important; }
.agnes-form-label { color: var(--ag-text-2) !important; }


/* ═══════════════════════════════════════════════════════════════════════
   v6 — 结构大动：顶部标签 → 左侧竖向导航栏
   内容区因此拿到完整宽度（画布/封面/短剧尤其受益）。
   ═══════════════════════════════════════════════════════════════════════ */

.agnes-shell {
  flex: 1;
  min-height: 0;
  display: flex;
  overflow: hidden;
}

.agnes-rail {
  flex: 0 0 88px;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 6px;
  padding: 14px 10px;
  background: rgba(255, 255, 255, 0.55);
  border-right: 1px solid var(--ag-line);
  overflow-y: auto;
  scrollbar-width: none;
}

.agnes-rail::-webkit-scrollbar { display: none; }

.agnes-rail-spacer { flex: 1; min-height: 10px; }

.agnes-rail-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding: 11px 6px;
  border: 1px solid transparent;
  border-radius: 14px;
  background: transparent;
  color: var(--ag-muted);
  font-family: inherit;
  font-size: 11.5px;
  font-weight: 600;
  cursor: pointer;
  position: relative;
  transition: all 0.16s var(--ag-ease);
}

.agnes-rail-icon {
  font-size: 20px;
  line-height: 1;
  filter: grayscale(0.25);
}

.agnes-rail-label { line-height: 1; letter-spacing: 0.01em; }

.agnes-rail-item:hover {
  background: #ffffff;
  border-color: var(--ag-line);
  color: var(--ag-t1);
  box-shadow: 0 6px 16px -12px rgba(24, 50, 100, 0.6);
}

.agnes-rail-item:hover .agnes-rail-icon { filter: none; }

.agnes-rail-item.active {
  background: #ffffff;
  border-color: var(--ag-line-2);
  color: var(--ag-t1);
  box-shadow: 0 10px 24px -16px rgba(24, 50, 100, 0.7);
}

.agnes-rail-item.active .agnes-rail-icon { filter: none; }

/* module colour bar marks the current module */
.agnes-rail-item.active::before {
  content: '';
  position: absolute;
  left: -10px;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 26px;
  border-radius: 0 4px 4px 0;
  background: linear-gradient(180deg, var(--ag-mod), var(--ag-mod-2));
  box-shadow: 0 0 12px var(--ag-mod-glow);
}

.agnes-titlebar-spacer { flex: 1; }

.agnes-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* module name shown in the header, next to the product name */
.agnes-titlebar-module {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 4px 12px;
  border-radius: 999px;
  background: var(--ag-mod-soft);
  border: 1px solid var(--ag-mod);
  font-family: var(--ag-font-mono);
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--ag-mod);
}

.agnes-titlebar-module::before {
  content: '';
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--ag-mod);
  box-shadow: 0 0 8px var(--ag-mod-glow);
}

/* content surfaces now sit beside the rail */
.agnes-body { flex: 1; min-height: 0; }

.agnes-tabbar { display: none; }


/* --- module-tinted TEXT uses the dark ink variant (contrast) ---------- */
.agnes-titlebar-module {
  color: var(--ag-mod-ink, #0e7490) !important;
}
.agnes-titlebar-module::before { background: var(--ag-mod-ink, #0e7490); }
.agnes-section-title::before { background: var(--ag-mod-ink, #0e7490); }
.agcv-card-title { color: var(--ag-mod-ink, #0e7490) !important; }
.agnes-setting-group-title { color: var(--ag-mod-ink, #0e7490) !important; }
.agnes-model-tag { color: var(--ag-mod-ink, #0e7490) !important; }
.agnes-badge {
  color: var(--ag-mod-ink, #0e7490) !important;
  border-color: var(--ag-mod, #0891b2) !important;
  background: var(--ag-mod-soft) !important;
}


/* --- filled gradient chips keep WHITE text (ink is for tinted surfaces) --- */
.agnes-model-tag-free {
  color: #ffffff !important;
  background: var(--ag-grad) !important;
  border-color: transparent !important;
}

/* tinted (non-gradient) chips take the dark ink */
.agnes-model-tag:not(.agnes-model-tag-free) {
  color: var(--ag-mod-ink, #0e7490) !important;
  background: var(--ag-mod-soft) !important;
  border-color: var(--ag-mod, #0891b2) !important;
}


/* ═══════════════════════════════════════════════════════════════════════
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
.agnes-mode-card.active .agnes-mode-desc {
  color: rgba(4, 18, 31, 0.82) !important;
}

.agnes-mode-card.active .agnes-mode-icon,
.agnes-mode-card.active > span { color: #04121f; }

.agnes-size-btn.active, .agnes-ratio-btn.active, .agnes-mode-btn.active,
.agcv-style.active, .agnes-model-tag-free {
  color: #04121f !important;
}

.agdp-next.primary .agdp-next-title,
.agdp-next.primary .agdp-next-sub { color: var(--ag-text) !important; }


/* --- light theme: solid base colours behind its gradients ------------ */
[data-ag-theme="light"][data-dsh-agnes-studio] { background-color: #eef3fb; }

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
.agnes-theme-toggle {
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

.agnes-theme-toggle:hover {
  border-color: var(--ag-accent);
  color: var(--ag-text);
}

/* the scrim stays subtle in BOTH themes (it is not inside the theme root) */
[data-dsh-agnes-backdrop] {
  background: rgba(2, 6, 16, 0.20) !important;
  backdrop-filter: blur(1.5px);
}


/* ═══════════════════════════════════════════════════════════════════════
   v8 — 闪光层（边框 / 按钮 / 卡片）
   ① 旋转渐变描边（@property 驱动 --ag-angle）
   ② 扫光（sheen）扫过按钮
   ③ 脉冲辉光（CTA 常驻 + hover 增强）
   全部动画都受 prefers-reduced-motion 保护。
   ═══════════════════════════════════════════════════════════════════════ */

@property --ag-angle {
  syntax: '<angle>';
  initial-value: 0deg;
  inherits: false;
}

@keyframes ag-border-spin {
  to { --ag-angle: 360deg; }
}

@keyframes ag-sheen {
  0%   { transform: translateX(-130%) skewX(-18deg); opacity: 0; }
  12%  { opacity: 1; }
  100% { transform: translateX(230%) skewX(-18deg); opacity: 0; }
}

@keyframes ag-pulse {
  0%, 100% { box-shadow: 0 12px 30px -14px var(--ag-glow, rgba(34,211,238,0.7)), 0 0 0 0 rgba(34, 211, 238, 0); }
  50%      { box-shadow: 0 16px 38px -12px var(--ag-glow, rgba(34,211,238,0.9)), 0 0 0 5px rgba(34, 211, 238, 0.10); }
}

@keyframes ag-glow-breathe {
  0%, 100% { box-shadow: 0 0 0 1px var(--ag-line-2), 0 18px 44px -26px rgba(0, 0, 0, 0.9); }
  50%      { box-shadow: 0 0 0 1px var(--ag-accent, #22d3ee), 0 0 26px -8px var(--ag-glow, rgba(34,211,238,0.7)), 0 18px 44px -26px rgba(0,0,0,0.9); }
}

@keyframes ag-corner-flash {
  0%, 100% { opacity: 0.45; filter: drop-shadow(0 0 5px var(--ag-glow, rgba(34,211,238,0.5))); }
  50%      { opacity: 1;    filter: drop-shadow(0 0 12px var(--ag-glow, rgba(34,211,238,0.95))); }
}

/* ── ① 按钮：扫光 + 旋转描边 + 脉冲 ─────────────────────────────────── */
.agnes-btn {
  position: relative;
  overflow: hidden;
  isolation: isolate;
}

/* 扫光条：默认藏在左边，hover 时扫过；CTA 常驻慢速循环 */
.agnes-btn::after {
  content: '';
  position: absolute;
  top: -20%;
  bottom: -20%;
  left: 0;
  width: 45%;
  border-radius: 999px;
  background: linear-gradient(100deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.42) 45%,
    rgba(255, 255, 255, 0.75) 50%,
    rgba(255, 255, 255, 0.42) 55%,
    rgba(255, 255, 255, 0) 100%);
  transform: translateX(-130%) skewX(-18deg);
  opacity: 0;
  pointer-events: none;
  z-index: 2;
}

.agnes-btn:not(:disabled):hover::after {
  animation: ag-sheen 0.85s cubic-bezier(0.22, 0.61, 0.36, 1);
}

/* 主 CTA：常驻缓慢扫光，让人一眼看到"这就是主操作" */
.agnes-btn-primary:not(:disabled)::after {
  animation: ag-sheen 4.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
}

.agnes-btn-primary:not(:disabled) {
  position: relative;
  border: 1.5px solid transparent !important;
  background:
    linear-gradient(120deg, var(--ag-mod, #22d3ee), var(--ag-mod-2, #8b5cf6)) padding-box,
    conic-gradient(from var(--ag-angle),
      rgba(255, 255, 255, 0.15),
      var(--ag-accent, #22d3ee),
      rgba(255, 255, 255, 0.9),
      var(--ag-accent-2, #8b5cf6),
      rgba(255, 255, 255, 0.15) 100%) border-box !important;
  animation: ag-border-spin 3.6s linear infinite, ag-pulse 3s ease-in-out infinite;
}

.agnes-btn-primary:not(:disabled):hover {
  animation: ag-border-spin 1.4s linear infinite, ag-pulse 1.6s ease-in-out infinite;
  transform: translateY(-1px);
}

/* 次级/幽灵：hover 时描边亮起 + 扫光 */
.agnes-btn-secondary:not(:disabled):hover,
.agnes-btn-ghost:not(:disabled):hover {
  box-shadow: 0 0 0 1px var(--ag-accent), 0 0 20px -6px var(--ag-glow, rgba(34,211,238,0.7)) !important;
}

/* ── ② 卡片：边框呼吸辉光 + HUD 角标闪烁 ───────────────────────────── */
.agcv-card,
.agnes-anchor-card,
.agdp-next,
.agnes-anchor-side,
.agcv-preview {
  transition: box-shadow 0.25s ease, border-color 0.25s ease;
}

.agcv-card:hover,
.agnes-anchor-card:hover,
.agdp-next:hover {
  border-color: var(--ag-accent) !important;
  box-shadow:
    0 0 0 1px var(--ag-accent),
    0 0 28px -8px var(--ag-glow, rgba(34,211,238,0.75)),
    0 24px 60px -30px rgba(0, 0, 0, 0.95) !important;
}

/* HUD 角标：缓慢闪烁，像仪器指示灯 */
.agcv-card::before,
.agcv-card::after,
.agnes-anchor-card::before,
.agnes-anchor-card::after,
.agcv-preview::before,
.agcv-preview::after,
.agnes-anchor-side::before,
.agnes-anchor-side::after {
  animation: ag-corner-flash 3.2s ease-in-out infinite;
}

/* 主 CTA 所在的强调卡片：边框呼吸 */
.agdp-next.primary {
  animation: ag-glow-breathe 3.4s ease-in-out infinite;
}

/* ── ③ 选中态 / 导航 / 面板边 ──────────────────────────────────────── */
.agnes-size-btn.active,
.agnes-ratio-btn.active,
.agnes-mode-btn.active,
.agcv-style.active {
  position: relative;
  overflow: hidden;
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.35), 0 10px 26px -14px var(--ag-glow, rgba(34,211,238,0.8)) !important;
}

.agnes-rail-item.active {
  animation: ag-glow-breathe 3.6s ease-in-out infinite;
}

/* 画布节点：选中时描边流光 */
.agc-node.active {
  animation: ag-glow-breathe 3s ease-in-out infinite;
}

/* 面板顶边：一道缓慢流动的光带 */
.agnes-titlebar::after {
  background-size: 220% 100%;
  animation: ag-topflow 5s linear infinite;
}

@keyframes ag-topflow {
  0%   { background-position: 0% 50%; }
  100% { background-position: 200% 50%; }
}

.agnes-titlebar::after {
  background-image: linear-gradient(90deg,
    transparent 0%, var(--ag-accent) 25%, #ffffff 50%, var(--ag-accent-2) 75%, transparent 100%);
}

/* ── 无障碍：尊重系统"减少动态效果" ──────────────────────────────── */
@media (prefers-reduced-motion: reduce) {
  .agnes-btn::after,
  .agnes-btn-primary:not(:disabled),
  .agnes-btn-primary:not(:disabled):hover,
  .agcv-card::before, .agcv-card::after,
  .agnes-anchor-card::before, .agnes-anchor-card::after,
  .agcv-preview::before, .agcv-preview::after,
  .agnes-anchor-side::before, .agnes-anchor-side::after,
  .agdp-next.primary,
  .agnes-rail-item.active,
  .agc-node.active,
  .agnes-titlebar::after {
    animation: none !important;
  }
}


/* ═══════════════════════════════════════════════════════════════════════
   v9 — 亮色「炫酷科技」强化
   亮色不再是素白：加彩色环境光、玻璃面板、渐变描边、彩色辉光，
   并把扫光改成在浅底上也看得见的高光。
   ═══════════════════════════════════════════════════════════════════════ */

[data-ag-theme="light"][data-dsh-agnes-studio] {
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

[data-ag-theme="light"] .agnes-section-title { color: #2a3c5e; }
[data-ag-theme="light"] .agcv-card-title { color: var(--ag-accent) !important; }
.agnes-theme-toggle { position: relative; z-index: 3; }


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
[data-ag-theme="light"] .agcv-card-title {
  color: var(--ag-mod-ink, #0e7490) !important;
}

[data-ag-theme="light"] .agnes-section-title { color: #33456b !important; }

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

const STYLE_ID = 'dsh-agnes-studio/styles.css'

/** Inject the plugin stylesheet once (idempotent). */
export function injectStyles(): void {
  if (typeof document === 'undefined') return
  if (document.querySelector('style[data-plugin-css="' + STYLE_ID + '"]') !== null) return
  const tag = document.createElement('style')
  tag.dataset.plugin = 'dsh-agnes-studio'
  tag.dataset.pluginCss = STYLE_ID
  tag.textContent = CSS
  document.head.appendChild(tag)
}
