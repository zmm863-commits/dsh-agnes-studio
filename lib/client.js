window.__ModuleLoader__.load({ id: "dsh-agnes-studio", factory: (require) => {
  var module = { exports: {} }; var exports = module.exports;
//#region \0rolldown/runtime.js
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, { get: (a, b) => (typeof require !== "undefined" ? require : a)[b] }) : x)(function(x) {
	if (typeof require !== "undefined") return require.apply(this, arguments);
	throw Error("Calling `require` for \"" + x + "\" in an environment that doesn't expose the `require` function. See https://rolldown.rs/in-depth/bundling-cjs#require-external-modules for more details.");
});
//#endregion
//#region src/client/styles.ts
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

`;
const STYLE_ID = "dsh-agnes-studio/styles.css";
/** Inject the plugin stylesheet once (idempotent). */
function injectStyles() {
	if (typeof document === "undefined") return;
	if (document.querySelector("style[data-plugin-css=\"" + STYLE_ID + "\"]") !== null) return;
	const tag = document.createElement("style");
	tag.dataset.plugin = "dsh-agnes-studio";
	tag.dataset.pluginCss = STYLE_ID;
	tag.textContent = CSS;
	document.head.appendChild(tag);
}
//#endregion
//#region src/client/studio.ts
/**
* Multi-vendor AI Studio client-side wrapper.
*
* All API calls go through the Host proxy endpoint (POST /agnes-studio/api/proxy)
* to keep API keys server-side. The browser never sees any key.
*
* Supported vendors: Agnes, MiniMax, DeepSeek, Qwen, Doubao (Seedream/Seaweed).
*/
/** Text model options grouped by vendor. */
const TEXT_MODEL_OPTIONS = {
	"agnes-3.0-flash": "Agnes 3.0 Flash (推荐)",
	"agnes-2.5-flash": "Agnes 2.5 Flash",
	"MiniMax-M3": "MiniMax M3",
	"deepseek-v4-flash": "DeepSeek V4 Flash",
	"deepseek-chat": "DeepSeek Chat",
	"deepseek-reasoner": "DeepSeek Reasoner",
	"qwen-turbo": "Qwen Turbo",
	"qwen-plus": "Qwen Plus"
};
/** Image model options grouped by vendor. */
const IMAGE_MODEL_OPTIONS = {
	"agnes-image-2.5-flash": "Agnes Image 2.5 Flash (推荐)",
	"agnes-image-2.1-flash": "Agnes Image 2.1 Flash",
	"agnes-image-2.0-flash": "Agnes Image 2.0 Flash",
	"doubao-seedream-3-0": "豆包 Seedream 3.0",
	"minimax-image-01": "MiniMax Image 01",
	"qwen-image-plus": "Qwen Image Plus"
};
/** Video model options grouped by vendor. */
const VIDEO_MODEL_OPTIONS = {
	"agnes-video-2.5-flash": "Agnes Video 2.5 Flash (推荐)",
	"agnes-video-2.5": "Agnes Video 2.5",
	"MiniMax-H3": "MiniMax H3",
	"agnes-video-v2.0": "Agnes Video 2.0",
	"minimax-video-01": "MiniMax Video 01",
	"doubao-seaweed-t2v": "豆包 Seaweed T2V"
};
const IMAGE_MODEL_SIZE_SUPPORTED = {
	"agnes-image": [
		"1024x1024",
		"1024x768",
		"768x1024",
		"1280x720",
		"720x1280"
	],
	"doubao-seedream": [
		"1024x1024",
		"864x1152",
		"1152x864",
		"1280x720",
		"720x1280"
	],
	"minimax-image": [
		"1024x1024",
		"1024x768",
		"768x1024",
		"1280x720",
		"720x1280"
	],
	"qwen-image": [
		"1024x1024",
		"1024x768",
		"768x1024",
		"1280x720",
		"720x1280"
	]
};
const DEFAULT_IMAGE_SIZES = [
	"1024x1024",
	"1024x768",
	"768x1024",
	"1280x720",
	"720x1280"
];
/** Return the supported sizes for a given image model. */
function getImageSizeOptions(model) {
	if (!model) return DEFAULT_IMAGE_SIZES;
	const m = model.toLowerCase();
	for (const [prefix, sizes] of Object.entries(IMAGE_MODEL_SIZE_SUPPORTED)) if (m.startsWith(prefix)) return [...sizes, ...DEFAULT_IMAGE_SIZES.filter((s) => !sizes.includes(s))];
	return DEFAULT_IMAGE_SIZES;
}
/** Read custom models from localStorage. */
function getCustomModels() {
	try {
		const raw = localStorage.getItem("agnes-studio-custom-models");
		return raw ? JSON.parse(raw) : [];
	} catch {
		return [];
	}
}
/** Persist custom models to localStorage. */
function saveCustomModels(models) {
	localStorage.setItem("agnes-studio-custom-models", JSON.stringify(models));
}
/** Add a custom model. Returns false if the id already exists. */
function addCustomModel(model) {
	const models = getCustomModels();
	if (models.some((m) => m.id === model.id)) return false;
	models.push(model);
	saveCustomModels(models);
	return true;
}
/** Remove a custom model by id. */
function removeCustomModel(modelId) {
	saveCustomModels(getCustomModels().filter((m) => m.id !== modelId));
}
/** Generate image through Host proxy — supports multiple vendors. */
async function generateImage(req) {
	const params = {
		model: req.model || "agnes-image-2.5-flash",
		prompt: req.prompt,
		size: req.size || "1024x1024",
		extra_body: { response_format: "url" }
	};
	if (req.ratio) params.extra_body.ratio = req.ratio;
	if (req.images && req.images.length > 0) params.extra_body.image = req.images;
	if (req.negative_prompt) params.negative_prompt = req.negative_prompt;
	if (req.seed !== void 0) params.seed = req.seed;
	const data = (await callHostProxy("/v1/images/generations", params)).data;
	if (data && data[0] && data[0].url) return { url: data[0].url };
	throw new Error("图片生成失败：未返回 URL");
}
/** Generate video through Host proxy — supports multiple vendors and modes. */
async function generateVideo(req) {
	const model = req.model || "agnes-video-2.5-flash";
	if (model.startsWith("agnes-video-2.5")) {
		const params = {
			model,
			prompt: req.prompt,
			mode: req.mode || "text",
			seconds: req.seconds || "5",
			size: req.size || "720P"
		};
		if (req.aspectRatio) params.aspect_ratio = req.aspectRatio;
		if (req.mode === "keyframe") {
			if (req.firstFrame) params.first_frame = req.firstFrame;
			if (req.lastFrame) params.last_frame = req.lastFrame;
		}
		if (req.mode === "reference") {
			if (req.images && req.images.length > 0) params.images = req.images;
		}
		if (req.seed !== void 0) params.seed = req.seed;
		const resp = await callHostProxy("/v1/videos", params);
		return {
			videoId: String(resp.video_id || resp.id || ""),
			taskId: String(resp.task_id || resp.id || "")
		};
	}
	if (model.toLowerCase().includes("minimax") && model.includes("H3")) {
		const params = {
			model,
			prompt: req.prompt,
			duration: parseInt(req.seconds || "5"),
			resolution: req.size || "768P",
			ratio: req.aspectRatio || "16:9"
		};
		if (req.firstFrame) params.first_frame = req.firstFrame;
		if (req.lastFrame) params.last_frame = req.lastFrame;
		const resp = await callHostProxy("/v2/video_generation", params);
		return {
			videoId: "",
			taskId: String(resp.task_id || "")
		};
	}
	const params = {
		model,
		prompt: req.prompt,
		width: req.width || 1152,
		height: req.height || 768,
		num_frames: req.num_frames || 121,
		frame_rate: req.frame_rate || 24
	};
	if (req.images && req.images.length > 0) params.image = req.images.length === 1 ? req.images[0] : req.images;
	if (req.negative_prompt) params.negative_prompt = req.negative_prompt;
	if (req.seed !== void 0) params.seed = req.seed;
	const resp = await callHostProxy("/v1/videos", params);
	return {
		videoId: String(resp.video_id || resp.id || ""),
		taskId: String(resp.task_id || resp.id || "")
	};
}
/** Poll video task status. */
async function pollVideoStatus(videoId) {
	const resp = await callHostProxy(`/agnesapi?video_id=${encodeURIComponent(videoId)}&model_name=agnes-video-2.5-flash`, void 0, "GET");
	const status = String(resp.status || "");
	const progress = Number(resp.progress || 0);
	if (status === "completed") {
		const meta = resp.metadata;
		return {
			status: "completed",
			url: String(meta?.url || ""),
			progress: 100
		};
	}
	if (status === "failed") {
		const err = resp.error;
		return {
			status: "failed",
			error: String(err?.message || "视频生成失败"),
			progress
		};
	}
	return {
		status,
		progress
	};
}
/**
* Fetch API key status for all configured vendors.
*
* Preferred route is `/agnes-studio/api/status`, which resolves keys without
* calling upstream. Falls back to a proxy probe for older host builds.
*/
async function fetchKeyStatus() {
	try {
		const resp = await fetch("/agnes-studio/api/status", { method: "GET" });
		if (resp.ok) {
			const data = await resp.json();
			if (typeof data.configured === "boolean") return data;
		}
	} catch {}
	try {
		await callHostProxy("/__dsh_agnes_key_probe__", {});
		return {
			configured: true,
			source: null
		};
	} catch (e) {
		const message = e instanceof Error ? e.message : String(e);
		if (message.includes("未配置") || message.includes("agnes-api-key")) return {
			configured: false,
			source: null
		};
		if (/invalid api key|api key is invalid|unauthorized|no api key/i.test(message)) return {
			configured: false,
			source: null
		};
		if (message.includes("Agnes API")) return {
			configured: true,
			source: null
		};
		return {
			configured: false,
			source: null
		};
	}
}
/**
* Fetch available models from the host (with fallback to built-in defaults).
*/
async function fetchModels() {
	try {
		const resp = await fetch("/agnes-studio/api/models", { method: "GET" });
		if (resp.ok) return await resp.json();
	} catch {}
	return {
		text: TEXT_MODEL_OPTIONS,
		image: IMAGE_MODEL_OPTIONS,
		video: VIDEO_MODEL_OPTIONS
	};
}
/** Call the Host proxy endpoint. */
async function callHostProxy(endpoint, params, method = "POST") {
	const resp = await fetch("/agnes-studio/api/proxy", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			endpoint,
			params,
			method
		})
	});
	if (!resp.ok) {
		const text = await resp.text().catch(() => "");
		let message = text;
		try {
			const parsed = JSON.parse(text);
			if (parsed !== null && typeof parsed.error === "string") message = parsed.error;
		} catch {}
		throw new Error(message.slice(0, 300));
	}
	const result = await resp.json();
	if (result.error) throw new Error(String(result.error));
	return result;
}
/** Generate a unique project ID. */
function generateProjectId() {
	return "proj_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 8);
}
/** Save project to localStorage. */
function saveProject(project) {
	try {
		const projects = listProjects();
		const idx = projects.findIndex((p) => p.id === project.id);
		if (idx >= 0) projects[idx] = project;
		else projects.unshift(project);
		if (projects.length > 50) projects.length = 50;
		localStorage.setItem("agnes-studio-projects", JSON.stringify(projects));
	} catch {}
}
/** Load all projects from localStorage. */
function listProjects() {
	try {
		const raw = localStorage.getItem("agnes-studio-projects");
		return raw ? JSON.parse(raw) : [];
	} catch {
		return [];
	}
}
/** Delete a project from localStorage. */
function deleteProject(id) {
	try {
		const projects = listProjects().filter((p) => p.id !== id);
		localStorage.setItem("agnes-studio-projects", JSON.stringify(projects));
	} catch {}
}
//#endregion
//#region src/client/import.ts
/** Parse a script file into scenes. */
function parseScript(filename, content) {
	const ext = filename.split(".").pop()?.toLowerCase() || "";
	if (ext === "json") return parseJsonScript(content);
	if (ext === "md" || ext === "markdown") return parseMarkdownScript(content);
	return parsePlainTextScript(content);
}
/** Parse JSON format script. */
function parseJsonScript(content) {
	try {
		const data = JSON.parse(content);
		if (data.scenes && Array.isArray(data.scenes)) return data.scenes.map((s, i) => ({
			name: String(s.name || s.title || `场景 ${i + 1}`),
			prompt: String(s.prompt || s.description || s画面 || ""),
			motion: String(s.motion || s.action || s动作 || ""),
			duration: Number(s.duration || 5),
			status: "pending"
		}));
		if (Array.isArray(data)) return data.map((s, i) => ({
			name: String(s.name || s.title || `场景 ${i + 1}`),
			prompt: String(s.prompt || s.description || ""),
			motion: String(s.motion || s.action || ""),
			duration: Number(s.duration || 5),
			status: "pending"
		}));
		throw new Error("JSON 格式不正确，需要 { scenes: [...] } 或 [...] 格式");
	} catch (e) {
		if (e instanceof SyntaxError) throw new Error("JSON 解析失败：" + e.message);
		throw e;
	}
}
/** Parse Markdown format script. */
function parseMarkdownScript(content) {
	const scenes = [];
	const lines = content.split("\n");
	let currentScene = null;
	let buffer = [];
	const flushScene = () => {
		if (currentScene && currentScene.name) {
			if (!currentScene.prompt && buffer.length > 0) currentScene.prompt = buffer.join("\n").trim();
			scenes.push({
				name: currentScene.name,
				prompt: currentScene.prompt || "",
				motion: currentScene.motion || "",
				duration: currentScene.duration || 5,
				status: "pending"
			});
		}
		buffer = [];
	};
	for (const line of lines) {
		const trimmed = line.trim();
		const sceneMatch = trimmed.match(/^#{1,3}\s+(.+)/);
		const boldMatch = trimmed.match(/^\*\*(.+?)\*\*/);
		const dashMatch = trimmed.match(/^---+$/);
		if (sceneMatch || boldMatch) {
			const name = (sceneMatch?.[1] || boldMatch?.[1] || "").trim();
			if (name && name.length > 1 && !name.match(/^(场景|第|幕|章)/)) continue;
			if (name) {
				flushScene();
				currentScene = { name };
				continue;
			}
		}
		if (dashMatch && currentScene) {
			flushScene();
			currentScene = null;
			continue;
		}
		const fieldMatch = trimmed.match(/^[*\-]\s*\*?\*?(画面?|场景?|描述?|prompt)\*?\*?\s*[:：]\s*(.+)/i);
		const motionMatch = trimmed.match(/^[*\-]\s*\*?\*?(动作?|运动?|motion|action)\*?\*?\s*[:：]\s*(.+)/i);
		const durationMatch = trimmed.match(/^[*\-]\s*\*?\*?(时长?|duration|seconds?)\*?\*?\s*[:：]\s*(\d+)/i);
		const lensMatch = trimmed.match(/^[*\-]\s*\*?\*?(镜头?|camera|lens)\*?\*?\s*[:：]\s*(.+)/i);
		const moodMatch = trimmed.match(/^[*\-]\s*\*?\*?(氛围?|mood|style)\*?\*?\s*[:：]\s*(.+)/i);
		if (fieldMatch) buffer.push(fieldMatch[2].trim());
		else if (motionMatch) {
			if (currentScene) currentScene.motion = motionMatch[2].trim();
			else buffer.push(`运动: ${motionMatch[2].trim()}`);
		} else if (durationMatch) {
			if (currentScene) currentScene.duration = Number(durationMatch[2]);
		} else if (lensMatch) buffer.push(`镜头: ${lensMatch[2].trim()}`);
		else if (moodMatch) buffer.push(`氛围: ${moodMatch[2].trim()}`);
		else if (trimmed && !trimmed.startsWith("#") && !trimmed.startsWith("---")) {
			if (trimmed.length > 2) buffer.push(trimmed);
		}
	}
	flushScene();
	if (scenes.length === 0) return content.split(/\n\s*\n/).filter((p) => p.trim().length > 5).map((p, i) => ({
		name: `场景 ${i + 1}`,
		prompt: p.trim().replace(/\n/g, " "),
		status: "pending"
	}));
	return scenes;
}
/** Parse plain text format script. */
function parsePlainTextScript(content) {
	const scenes = [];
	const parts = content.split(/(?:场景|第.+幕|Scene|SCENE)\s*(\d+|[一二三四五六七八九十]+)\s*[:：]/gi).filter((s) => s.trim().length > 0);
	if (parts.length > 1) for (let i = 0; i < parts.length; i++) {
		const part = parts[i].trim();
		if (!part) continue;
		const numMatch = part.match(/^(\d+|[一二三四五六七八九十]+)$/);
		if (numMatch) {
			const num = numMatch[1];
			const nextPart = parts[i + 1]?.trim() || "";
			if (nextPart) {
				const firstLine = nextPart.split("\n")[0].replace(/[:：]/g, "").trim();
				scenes.push({
					name: `场景 ${num}: ${firstLine.slice(0, 20)}`,
					prompt: nextPart,
					status: "pending"
				});
				i++;
			}
			continue;
		}
		if (part.length > 5) {
			const firstLine = part.split("\n")[0].trim();
			scenes.push({
				name: `场景 ${scenes.length + 1}: ${firstLine.slice(0, 20)}`,
				prompt: part,
				status: "pending"
			});
		}
	}
	if (scenes.length === 0) return content.split(/\n\s*\n/).filter((p) => p.trim().length > 5).map((p, i) => ({
		name: `场景 ${i + 1}`,
		prompt: p.trim().replace(/\n/g, " "),
		status: "pending"
	}));
	return scenes;
}
/** Detect if a file is a supported script format. */
function isSupportedScript(filename) {
	const ext = filename.split(".").pop()?.toLowerCase() || "";
	return [
		"txt",
		"md",
		"markdown",
		"json"
	].includes(ext);
}
//#endregion
//#region src/client/drama.ts
const API_BASE$4 = "/agnes-studio/api";
/** 导入剧本，跳过故事+剧本步骤，直接从分镜开始 */
async function importScript(req) {
	const resp = await fetch(`${API_BASE$4}/drama/import`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(req)
	});
	if (!resp.ok) throw new Error("导入剧本失败");
	const data = await resp.json();
	if (data.error) throw new Error(data.error);
	return data;
}
/** 创建短剧任务 */
async function createDrama(req) {
	const resp = await fetch(`${API_BASE$4}/drama/start`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(req)
	});
	if (!resp.ok) throw new Error("创建短剧失败");
	const data = await resp.json();
	if (data.error) throw new Error(data.error);
	return data;
}
/** 查询短剧状态 */
async function getDramaStatus(dramaId) {
	const resp = await fetch(`${API_BASE$4}/drama/status/${dramaId}`);
	if (!resp.ok) throw new Error("查询短剧状态失败");
	const data = await resp.json();
	if (data.error) throw new Error(data.error);
	return data;
}
/** 停止短剧 */
async function stopDrama(dramaId) {
	await fetch(`${API_BASE$4}/drama/${dramaId}/stop`, { method: "POST" });
}
/** 恢复短剧 */
async function resumeDrama(dramaId) {
	await fetch(`${API_BASE$4}/drama/${dramaId}/resume`, { method: "POST" });
}
/** 确认/编辑内容 */
async function confirmDrama(dramaId, payload) {
	await fetch(`${API_BASE$4}/drama/${dramaId}/confirm`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(payload)
	});
}
/** 依次生成所有未完成的镜头视频 */
async function generateAllShotVideos(dramaId) {
	const resp = await fetch(`${API_BASE$4}/drama/${dramaId}/videos`, { method: "POST" });
	const data = await resp.json().catch(() => ({}));
	if (!resp.ok || data?.error) throw new Error(data?.error || `启动失败（HTTP ${resp.status}）`);
	return data;
}
/** 合成成片：把已完成的镜头按顺序拼接，可选烧录字幕 */
async function mergeDrama(dramaId, opts = {}) {
	const resp = await fetch(`${API_BASE$4}/drama/${dramaId}/merge`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(opts)
	});
	const data = await resp.json().catch(() => ({}));
	if (!resp.ok || data?.error) throw new Error(data?.error || `合成失败（HTTP ${resp.status}）`);
	return data;
}
/** 重新生成某步 */
async function regenerateDrama(dramaId, payload) {
	await fetch(`${API_BASE$4}/drama/${dramaId}/regenerate`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(payload)
	});
}
/** 轮询短剧状态（自动间隔） */
function pollDramaStatus(dramaId, callback, intervalMs = 3e3) {
	let stopped = false;
	const poll = async () => {
		if (stopped) return;
		try {
			const task = await getDramaStatus(dramaId);
			callback(task);
			if (task.status !== "completed" && task.status !== "failed" && task.status !== "stopped") setTimeout(poll, intervalMs);
		} catch {
			if (!stopped) setTimeout(poll, intervalMs * 2);
		}
	};
	poll();
	return () => {
		stopped = true;
	};
}
const STORAGE_KEY$1 = "agnes-studio-drama-tasks";
const MAX_TASKS = 20;
/** 保存短剧任务到 localStorage */
function saveDramaTask(task) {
	try {
		const tasks = listDramaTasks();
		const idx = tasks.findIndex((t) => t.drama_id === task.drama_id);
		if (idx >= 0) tasks[idx] = task;
		else tasks.unshift(task);
		if (tasks.length > MAX_TASKS) tasks.length = MAX_TASKS;
		localStorage.setItem(STORAGE_KEY$1, JSON.stringify(tasks));
	} catch {}
}
/** 加载所有短剧任务 */
function listDramaTasks() {
	try {
		const raw = localStorage.getItem(STORAGE_KEY$1);
		return raw ? JSON.parse(raw) : [];
	} catch {
		return [];
	}
}
/** 删除短剧任务 */
function deleteDramaTask(dramaId) {
	const tasks = listDramaTasks().filter((t) => t.drama_id !== dramaId);
	localStorage.setItem(STORAGE_KEY$1, JSON.stringify(tasks));
}
//#endregion
//#region src/client/drama-panel.tsx
function shellRequire$5(id) {
	try {
		if (typeof __require === "function") {
			const mod = __require(id);
			if (mod !== void 0 && mod !== null) return mod;
		}
	} catch {}
}
const React$5 = shellRequire$5("react") ?? globalThis.React ?? null;
const NOOP$5 = () => {};
const useState$5 = React$5?.useState ?? ((initial) => [typeof initial === "function" ? initial() : initial, NOOP$5]);
const useEffect$5 = React$5?.useEffect ?? NOOP$5;
const useCallback$5 = React$5?.useCallback ?? ((fn) => fn);
const useRef$3 = React$5?.useRef ?? ((initial) => ({ current: initial }));
const createElement$5 = React$5?.createElement ?? (() => null);
const TEXT_MODELS = [{
	value: "agnes-3.0-flash",
	label: "Agnes 3.0 Flash (免费)"
}];
const IMAGE_MODELS_DEFAULT = [{
	value: "agnes-image-2.5-flash",
	label: "Image 2.5 Flash (免费)"
}];
const VIDEO_MODELS_DEFAULT = [{
	value: "agnes-video-2.5-flash",
	label: "Video 2.5 Flash (免费)"
}];
const DURATION_OPTIONS = [
	3,
	5,
	8,
	10
];
/** Pipeline step definitions with their associated status values. */
const STEPS = [
	{
		key: "story",
		label: "📝 故事梗概",
		statuses: ["step1", "paused_story"]
	},
	{
		key: "script",
		label: "📋 剧本",
		statuses: ["paused_script"]
	},
	{
		key: "storyboard",
		label: "🎬 分镜",
		statuses: ["step2"]
	},
	{
		key: "assets",
		label: "🎨 素材",
		statuses: ["step3", "paused_assets"]
	},
	{
		key: "video",
		label: "🎥 视频",
		statuses: [
			"step4",
			"paused_video",
			"merging"
		]
	}
];
/** Terminal statuses that stop polling. */
const TERMINAL = /* @__PURE__ */ new Set([
	"completed",
	"failed",
	"stopped"
]);
/** Human-readable status labels. */
const STATUS_LABELS = {
	started: "🚀 启动中",
	step1: "📝 生成故事梗概…",
	paused_story: "⏸ 故事梗概待确认",
	paused_script: "⏸ 剧本待确认",
	step2: "🎬 生成分镜…",
	step3: "🎨 生成素材…",
	paused_assets: "⏸ 素材待确认",
	step4: "🎥 生成视频…",
	paused_video: "⏸ 视频生成中",
	merging: "🎞 合成中…",
	completed: "✅ 完成",
	failed: "❌ 失败",
	stopped: "⏹ 已停止"
};
/** Asset category labels. */
const ASSET_CATEGORIES = {
	characters: "👤 角色",
	scenes: "🏞 场景",
	props: "🎭 道具"
};
function formatTime(ts) {
	try {
		const d = new Date(ts);
		const pad = (n) => String(n).padStart(2, "0");
		return `${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
	} catch {
		return "--";
	}
}
function getStepIndex(task) {
	return STEPS.findIndex((s) => s.statuses.includes(task.status));
}
function getTaskPreview(task) {
	const p = task.prompt || "";
	return p.length > 36 ? p.slice(0, 36) + "…" : p;
}
function buildModelOptions(record, defaults) {
	const entries = Object.entries(record);
	if (entries.length === 0) return defaults;
	return entries.map(([value, label]) => ({
		value,
		label
	}));
}
/** 5-step vertical progress indicator. */
function renderProgressSteps(task) {
	const currentIdx = getStepIndex(task);
	return createElement$5("div", { className: "agnes-steps" }, ...STEPS.map((step, idx) => {
		const isActive = idx === currentIdx;
		const isDone = idx < currentIdx;
		const cls = "agnes-step" + (isActive ? " active" : "") + (isDone ? " done" : "");
		return createElement$5("div", {
			key: step.key,
			className: cls
		}, createElement$5("div", { className: "agnes-step-icon" }, isDone ? "✓" : String(idx + 1)), createElement$5("span", null, step.label));
	}));
}
/** Status bar message area. */
function renderStatusMessage(task) {
	const label = STATUS_LABELS[task.status] || task.status;
	const isActive = !TERMINAL.has(task.status);
	return createElement$5("div", { style: {
		display: "flex",
		alignItems: "center",
		gap: "8px",
		padding: "8px 12px",
		borderRadius: "8px",
		background: isActive ? "rgba(108,92,231,0.08)" : task.status === "completed" ? "rgba(0,206,201,0.08)" : "rgba(255,107,107,0.08)",
		fontSize: "13px"
	} }, createElement$5("span", null, label), task.message && task.message !== label ? createElement$5("span", { style: {
		color: "var(--ag-text-3, #6e80a3)",
		fontSize: "12px"
	} }, " — " + task.message) : null, isActive ? createElement$5("span", { style: {
		width: "8px",
		height: "8px",
		borderRadius: "50%",
		background: "#fdcb6e"
	} }) : null);
}
/** Story / script editor (textarea + action buttons). */
function renderTextEditor(opts) {
	const { task, field, editContent, onEditChange, onConfirm, onRegenerate } = opts;
	const title = field === "story" ? "📝 故事梗概" : "📋 剧本";
	const content = editContent || (field === "story" ? task.story : task.script) || "";
	return createElement$5("div", { className: "agnes-section" }, createElement$5("div", { className: "agnes-section-title" }, title), createElement$5("textarea", {
		className: "agnes-textarea",
		value: content,
		onChange: (e) => onEditChange(e.target.value),
		rows: 10,
		style: {
			minHeight: "200px",
			fontFamily: "monospace",
			fontSize: "13px",
			lineHeight: "1.6"
		}
	}), createElement$5("div", { style: {
		display: "flex",
		gap: "8px",
		marginTop: "8px",
		flexWrap: "wrap"
	} }, createElement$5("button", {
		className: "agnes-btn agnes-btn-primary",
		onClick: () => onConfirm(field, editContent || content)
	}, "✅ 确认并继续"), createElement$5("button", {
		className: "agnes-btn agnes-btn-secondary",
		onClick: () => onConfirm(field, editContent || content)
	}, "✏️ 保存编辑"), createElement$5("button", {
		className: "agnes-btn agnes-btn-ghost",
		onClick: () => {
			onEditChange("");
			onRegenerate(field);
		}
	}, "🔄 重新生成")));
}
/** Read-only text display for completed steps. */
function renderReadOnlySection(opts) {
	const { title, content } = opts;
	if (!content) return null;
	return createElement$5("div", { className: "agnes-section" }, createElement$5("div", { className: "agnes-section-title" }, title), createElement$5("div", { style: {
		padding: "12px",
		borderRadius: "8px",
		background: "var(--ag-surface-2, rgba(255,255,255,0.55))",
		fontSize: "13px",
		lineHeight: "1.6",
		whiteSpace: "pre-wrap",
		maxHeight: "300px",
		overflowY: "auto"
	} }, content));
}
/** Asset cards grouped by category. */
function renderAssets(task) {
	const assets = task.assets || [];
	if (assets.length === 0) return createElement$5("div", { className: "agnes-section" }, createElement$5("div", { className: "agnes-section-title" }, "🎨 素材"), createElement$5("div", { style: {
		color: "var(--ag-text-3, #6e80a3)",
		fontSize: "13px",
		padding: "12px 0"
	} }, "素材生成中…"));
	return createElement$5("div", null, ...Object.entries(ASSET_CATEGORIES).map(([cat, label]) => {
		const items = assets.filter((a) => a.category === cat);
		if (items.length === 0) return null;
		return createElement$5("div", {
			key: cat,
			className: "agnes-section"
		}, createElement$5("div", { className: "agnes-section-title" }, label), createElement$5("div", { style: {
			display: "grid",
			gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
			gap: "8px"
		} }, ...items.map((asset, idx) => createElement$5("div", {
			key: idx,
			className: "agnes-custom-model-item",
			style: {
				flexDirection: "column",
				alignItems: "stretch",
				padding: "10px"
			}
		}, asset.image_url ? createElement$5("img", {
			src: asset.image_url,
			style: {
				width: "100%",
				borderRadius: "8px",
				marginBottom: "6px",
				aspectRatio: "1",
				objectFit: "cover"
			}
		}) : createElement$5("div", { style: {
			width: "100%",
			aspectRatio: "1",
			borderRadius: "8px",
			marginBottom: "6px",
			background: "linear-gradient(135deg, rgba(108,92,231,0.1), rgba(162,155,254,0.05))",
			display: "flex",
			alignItems: "center",
			justifyContent: "center",
			fontSize: "24px"
		} }, asset.status === "generating" ? "⏳" : "🎨"), createElement$5("div", { className: "agnes-custom-model-name" }, asset.name), createElement$5("div", { className: "agnes-custom-model-meta" }, (asset.desc || "").slice(0, 50) + (asset.desc && asset.desc.length > 50 ? "…" : "")), createElement$5("div", { style: { marginTop: "4px" } }, asset.status === "pending" ? createElement$5("span", { className: "agnes-badge agnes-badge-generating" }, "⏳ 待生成") : asset.status === "done" ? createElement$5("span", { className: "agnes-badge agnes-badge-free" }, "✅ 完成") : asset.status === "error" ? createElement$5("span", { className: "agnes-badge agnes-badge-error" }, "❌ 失败") : createElement$5("span", { className: "agnes-badge agnes-badge-generating" }, "🔄 生成中"))))));
	}));
}
/** Storyboard shot list with video generation controls. */
function renderShots(task, onConfirmVideo) {
	const shots = task.shots || task.storyboard?.shots || [];
	const videoResults = task.video_results || [];
	if (shots.length === 0) return createElement$5("div", { className: "agnes-section" }, createElement$5("div", { className: "agnes-section-title" }, "🎬 分镜"), createElement$5("div", { style: {
		color: "var(--ag-text-3, #6e80a3)",
		fontSize: "13px",
		padding: "12px 0"
	} }, "分镜生成中…"));
	return createElement$5("div", { className: "agnes-section" }, createElement$5("div", { className: "agnes-section-title" }, "🎬 分镜 (" + shots.length + " 个镜头)"), ...shots.map((shot, idx) => {
		const vr = videoResults.find((v) => v.shot_index === shot.shot_index);
		const isGenerating = vr?.status === "generating" || vr?.status === "pending";
		return createElement$5("div", {
			key: idx,
			className: "agnes-custom-model-item",
			style: {
				flexDirection: "column",
				alignItems: "flex-start",
				padding: "12px"
			}
		}, createElement$5("div", { style: {
			display: "flex",
			justifyContent: "space-between",
			width: "100%",
			alignItems: "center"
		} }, createElement$5("span", { style: {
			fontWeight: 600,
			fontSize: "13px"
		} }, "镜头 " + shot.shot_index), vr ? vr.status === "completed" ? createElement$5("span", { className: "agnes-badge agnes-badge-free" }, "✅ 已生成") : isGenerating ? createElement$5("span", { className: "agnes-badge agnes-badge-generating" }, "🔄 生成中") : vr.status === "failed" ? createElement$5("span", { className: "agnes-badge agnes-badge-error" }, "❌ 失败") : null : null), createElement$5("div", { style: {
			fontSize: "12px",
			color: "var(--ag-text-3, #6e80a3)",
			marginTop: "4px",
			lineHeight: "1.5"
		} }, (shot.scene_desc || "").slice(0, 100) + (shot.scene_desc && shot.scene_desc.length > 100 ? "…" : "")), shot.camera ? createElement$5("div", { style: {
			fontSize: "11px",
			color: "var(--ag-text-2, #2a3c5e)",
			marginTop: "2px"
		} }, "📷 " + shot.camera + (shot.camera_movement ? " / " + shot.camera_movement.intent : "")) : null, shot.action ? createElement$5("div", { style: {
			fontSize: "11px",
			color: "var(--ag-text-2, #2a3c5e)",
			marginTop: "2px"
		} }, "🎬 " + shot.action) : null, shot.dialogue ? createElement$5("div", { style: {
			fontSize: "12px",
			fontStyle: "italic",
			marginTop: "4px",
			color: "#a29bfe",
			padding: "4px 8px",
			borderRadius: "4px",
			background: "rgba(162,155,254,0.08)"
		} }, "💬 " + shot.dialogue) : null, vr?.status !== "completed" && vr?.status !== "generating" && vr?.status !== "pending" ? createElement$5("button", {
			className: "agnes-btn agnes-btn-sm agnes-btn-primary",
			style: { marginTop: "6px" },
			onClick: () => onConfirmVideo(shot.shot_index)
		}, "🎬 生成视频") : null, vr?.video_url ? createElement$5("video", {
			src: vr.video_url,
			controls: true,
			style: {
				width: "100%",
				marginTop: "8px",
				borderRadius: "8px"
			}
		}) : null, vr?.error ? createElement$5("div", { style: {
			fontSize: "11px",
			color: "#ff6b6b",
			marginTop: "4px"
		} }, "⚠ " + vr.error) : null);
	}));
}
/**
* 成片区：一键生成全部镜头 → 合成成片（可烧字幕）→ 预览/下载。
* 只在已经有分镜、且不在早期步骤时出现。
*/
function renderFinalCut(task, opts) {
	const results = task.video_results || [];
	if (results.length === 0) return null;
	const done = results.filter((v) => v.status === "completed").length;
	const failed = results.filter((v) => v.status === "failed").length;
	const generating = results.some((v) => v.status === "generating" || v.status === "pending");
	const canMerge = done > 0 && !opts.merging;
	const notStarted = done === 0 && !generating;
	return createElement$5("div", { className: "agnes-section" }, createElement$5("div", { className: `agdp-next${notStarted ? " primary" : ""}` }, createElement$5("div", { className: "agdp-next-head" }, createElement$5("span", { className: "agdp-next-icon" }, notStarted ? "👉" : generating ? "⏳" : "✅"), createElement$5("div", null, createElement$5("div", { className: "agdp-next-title" }, notStarted ? "下一步：生成镜头视频" : generating ? "镜头生成中…" : "镜头已就绪，可以合成成片"), createElement$5("div", { className: "agdp-next-sub" }, `镜头进度：${done}/${results.length} 已完成` + (failed > 0 ? ` · ${failed} 个失败` : "") + (generating ? " · 生成中…" : "")))), opts.ffmpegMissing ? createElement$5("div", { className: "agdp-warn" }, "⚠️ 未检测到 ffmpeg，无法合成成片。" + (opts.ffmpegHint || "请先安装 ffmpeg。")) : null, createElement$5("div", { className: "agdp-next-actions" }, createElement$5("button", {
		className: "agnes-btn agnes-btn-primary",
		disabled: generating,
		onClick: opts.onGenerateAll
	}, generating ? "⏳ 正在生成镜头…" : "🎬 一键生成全部镜头"), createElement$5("button", {
		className: "agnes-btn agnes-btn-secondary",
		disabled: !canMerge,
		onClick: () => opts.onMerge(false)
	}, opts.merging ? "⏳ 合成中…" : "🎞 合成成片"), createElement$5("button", {
		className: "agnes-btn agnes-btn-ghost",
		disabled: !canMerge,
		onClick: () => opts.onMerge(true)
	}, opts.merging ? "⏳ 合成中…" : "💬 合成并烧字幕"))), opts.notice ? createElement$5("div", { style: {
		marginTop: "8px",
		fontSize: "12px",
		color: "#2ecc71"
	} }, opts.notice) : null, opts.finalCut ? createElement$5("div", { style: { marginTop: "12px" } }, createElement$5("video", {
		src: opts.finalCut.url,
		controls: true,
		style: {
			width: "100%",
			borderRadius: "10px",
			background: "#000"
		}
	}), createElement$5("div", { style: {
		display: "flex",
		gap: "8px",
		alignItems: "center",
		marginTop: "8px"
	} }, createElement$5("a", {
		className: "agnes-btn agnes-btn-sm",
		href: opts.finalCut.url,
		download: `短剧成片-${task.drama_id}.mp4`,
		style: { textDecoration: "none" }
	}, "⬇️ 下载成片"), createElement$5("span", { style: {
		fontSize: "11px",
		color: "var(--ag-text-3, #8a8a9e)"
	} }, `${opts.finalCut.shots} 镜 · ${Number(opts.finalCut.duration || 0).toFixed(1)} 秒`))) : null);
}
/** Completed status view with summary. */
function renderCompletedView(task) {
	const shots = task.shots || task.storyboard?.shots || [];
	const completedVideos = (task.video_results || []).filter((v) => v.status === "completed");
	return createElement$5("div", { className: "agnes-section" }, createElement$5("div", { style: {
		padding: "16px",
		borderRadius: "10px",
		background: "rgba(0,206,201,0.08)",
		border: "1px solid rgba(0,206,201,0.2)",
		textAlign: "center"
	} }, createElement$5("div", { style: {
		fontSize: "32px",
		marginBottom: "8px"
	} }, "🎉"), createElement$5("div", { style: {
		fontSize: "16px",
		fontWeight: 600,
		marginBottom: "4px"
	} }, "短剧制作完成！"), createElement$5("div", { style: {
		fontSize: "13px",
		color: "var(--ag-text-3, #6e80a3)"
	} }, shots.length + " 个镜头 · " + completedVideos.length + " 个视频")), completedVideos.length > 0 ? createElement$5("div", {
		className: "agnes-section",
		style: { marginTop: "12px" }
	}, createElement$5("div", { className: "agnes-section-title" }, "🎥 视频预览"), ...completedVideos.map((vr) => vr.video_url ? createElement$5("div", {
		key: vr.shot_index,
		style: { marginBottom: "8px" }
	}, createElement$5("div", { style: {
		fontSize: "12px",
		fontWeight: 500,
		marginBottom: "4px",
		color: "var(--ag-text-2, #2a3c5e)"
	} }, "镜头 " + vr.shot_index), createElement$5("video", {
		src: vr.video_url,
		controls: true,
		style: {
			width: "100%",
			borderRadius: "8px"
		}
	})) : null)) : null);
}
function DramaPanel({ imageModels, videoModels }) {
	injectStyles();
	const [currentTask, setCurrentTask] = useState$5(null);
	const [taskList, setTaskList] = useState$5([]);
	const [prompt, setPrompt] = useState$5("");
	const [textModel, setTextModel] = useState$5("agnes-3.0-flash");
	const [imageModel, setImageModel] = useState$5("agnes-image-2.5-flash");
	const [videoModel, setVideoModel] = useState$5("agnes-video-2.5-flash");
	const [shotDuration, setShotDuration] = useState$5(5);
	const [loading, setLoading] = useState$5(false);
	const [error, setError] = useState$5("");
	const [editContent, setEditContent] = useState$5("");
	const [selectedTaskId, setSelectedTaskId] = useState$5(null);
	const [merging, setMerging] = useState$5(false);
	const [ffStatus, setFfStatus] = useState$5(null);
	const [notice, setNotice] = useState$5("");
	const [finalCut, setFinalCut] = useState$5(null);
	const stopPollRef = useRef$3(null);
	useEffect$5(() => {
		fetch("/agnes-studio/api/ffmpeg").then((r) => r.ok ? r.json() : null).then((d) => {
			if (!d || typeof d.available !== "boolean") {
				setFfStatus(null);
				return;
			}
			setFfStatus({
				available: d.available,
				hint: String(d.hint ?? "")
			});
		}).catch(() => setFfStatus(null));
	}, []);
	const imgOpts = buildModelOptions(imageModels, IMAGE_MODELS_DEFAULT);
	const vidOpts = buildModelOptions(videoModels, VIDEO_MODELS_DEFAULT);
	useEffect$5(() => {
		setTaskList(listDramaTasks());
		return () => {
			if (stopPollRef.current) stopPollRef.current();
		};
	}, []);
	useEffect$5(() => {
		if (currentTask) setTaskList(listDramaTasks());
	}, [currentTask]);
	const handleStart = useCallback$5(async () => {
		if (!prompt.trim() || loading) return;
		setLoading(true);
		setError("");
		setEditContent("");
		try {
			const { drama_id } = await createDrama({
				prompt: prompt.trim(),
				text_model: textModel,
				image_model: imageModel,
				video_model: videoModel,
				shot_duration: shotDuration
			});
			const initialTask = {
				drama_id,
				prompt: prompt.trim(),
				status: "started",
				step: "",
				message: "正在启动...",
				text_model: textModel,
				image_model: imageModel,
				video_model: videoModel,
				shot_duration: shotDuration,
				created_at: Date.now(),
				updated_at: Date.now()
			};
			setCurrentTask(initialTask);
			setSelectedTaskId(drama_id);
			saveDramaTask(initialTask);
			setTaskList(listDramaTasks());
			if (stopPollRef.current) stopPollRef.current();
			const stopPolling = pollDramaStatus(drama_id, (task) => {
				setCurrentTask(task);
				saveDramaTask(task);
				setTaskList(listDramaTasks());
				if (TERMINAL.has(task.status)) stopPolling();
			});
			stopPollRef.current = stopPolling;
		} catch (e) {
			setError(e instanceof Error ? e.message : "启动失败");
		} finally {
			setLoading(false);
		}
	}, [
		prompt,
		textModel,
		imageModel,
		videoModel,
		shotDuration,
		loading
	]);
	const handleSelectTask = useCallback$5((dramaId) => {
		if (stopPollRef.current) {
			stopPollRef.current();
			stopPollRef.current = null;
		}
		setSelectedTaskId(dramaId);
		setEditContent("");
		const found = taskList.find((t) => t.drama_id === dramaId);
		if (found) {
			setCurrentTask(found);
			if (!TERMINAL.has(found.status)) {
				const stopPolling = pollDramaStatus(dramaId, (task) => {
					setCurrentTask(task);
					saveDramaTask(task);
					setTaskList(listDramaTasks());
					if (TERMINAL.has(task.status)) stopPolling();
				});
				stopPollRef.current = stopPolling;
			}
		} else {
			setLoading(true);
			getDramaStatus(dramaId).then((task) => {
				setCurrentTask(task);
				saveDramaTask(task);
				setTaskList(listDramaTasks());
				if (!TERMINAL.has(task.status)) {
					const stopPolling = pollDramaStatus(dramaId, (t) => {
						setCurrentTask(t);
						saveDramaTask(t);
						setTaskList(listDramaTasks());
						if (TERMINAL.has(t.status)) stopPolling();
					});
					stopPollRef.current = stopPolling;
				}
			}).catch(() => setError("加载任务失败")).finally(() => setLoading(false));
		}
	}, [taskList]);
	const handleStop = useCallback$5(async () => {
		if (!currentTask) return;
		try {
			await stopDrama(currentTask.drama_id);
			if (stopPollRef.current) {
				stopPollRef.current();
				stopPollRef.current = null;
			}
			const updated = {
				...currentTask,
				status: "stopped"
			};
			setCurrentTask(updated);
			saveDramaTask(updated);
			setTaskList(listDramaTasks());
		} catch (e) {
			setError(e instanceof Error ? e.message : "停止失败");
		}
	}, [currentTask]);
	const handleResume = useCallback$5(async () => {
		if (!currentTask) return;
		try {
			await resumeDrama(currentTask.drama_id);
			const stopPolling = pollDramaStatus(currentTask.drama_id, (task) => {
				setCurrentTask(task);
				saveDramaTask(task);
				setTaskList(listDramaTasks());
				if (TERMINAL.has(task.status)) stopPolling();
			});
			stopPollRef.current = stopPolling;
		} catch (e) {
			setError(e instanceof Error ? e.message : "恢复失败");
		}
	}, [currentTask]);
	const handleDeleteTask = useCallback$5((dramaId) => {
		deleteDramaTask(dramaId);
		setTaskList(listDramaTasks());
		if (selectedTaskId === dramaId) {
			if (stopPollRef.current) {
				stopPollRef.current();
				stopPollRef.current = null;
			}
			setCurrentTask(null);
			setSelectedTaskId(null);
			setEditContent("");
		}
	}, [selectedTaskId]);
	const handleConfirmField = useCallback$5(async (field, content) => {
		if (!currentTask) return;
		try {
			await confirmDrama(currentTask.drama_id, {
				field,
				content
			});
			setEditContent("");
		} catch (e) {
			setError(e instanceof Error ? e.message : "确认失败");
		}
	}, [currentTask]);
	const handleRegenerateStep = useCallback$5(async (step) => {
		if (!currentTask) return;
		try {
			setEditContent("");
			await regenerateDrama(currentTask.drama_id, { step });
		} catch (e) {
			setError(e instanceof Error ? e.message : "重新生成失败");
		}
	}, [currentTask]);
	const handleConfirmVideoShot = useCallback$5(async (shotIndex) => {
		if (!currentTask) return;
		try {
			await confirmDrama(currentTask.drama_id, {
				field: "video",
				shot_index: shotIndex,
				action: "start"
			});
		} catch (e) {
			setError(e instanceof Error ? e.message : "生成视频失败");
		}
	}, [currentTask]);
	/** 一键生成所有未完成镜头（后台依次跑，靠轮询刷新进度） */
	const handleGenerateAllVideos = useCallback$5(async () => {
		if (!currentTask) return;
		try {
			setError("");
			const r = await generateAllShotVideos(currentTask.drama_id);
			setNotice(`已排队 ${r.queued} 个镜头，正在依次生成（每个约 2-4 分钟）…`);
		} catch (e) {
			setError(e instanceof Error ? e.message : "启动失败");
		}
	}, [currentTask]);
	/** 把已完成的镜头合成为成片 */
	const handleMerge = useCallback$5(async (withSubtitles) => {
		if (!currentTask || merging) return;
		setMerging(true);
		setError("");
		setNotice("");
		try {
			const r = await mergeDrama(currentTask.drama_id, { subtitles: withSubtitles });
			setFinalCut({
				url: r.url,
				duration: r.duration,
				shots: r.shots
			});
			setNotice(`成片已生成：${r.shots} 个镜头，${Number(r.duration || 0).toFixed(1)} 秒`);
		} catch (e) {
			setError(e instanceof Error ? e.message : "合成失败");
		} finally {
			setMerging(false);
		}
	}, [currentTask, merging]);
	const renderNewTaskForm = () => createElement$5("div", { style: {
		padding: "12px 16px",
		borderBottom: "1px solid var(--ag-line, rgba(32,74,150,0.15))",
		background: "var(--ag-surface-2, rgba(255,255,255,0.55))"
	} }, createElement$5("div", {
		className: "agnes-section-title",
		style: { marginBottom: "8px" }
	}, "🎬 新建短剧"), createElement$5("textarea", {
		className: "agnes-textarea",
		value: prompt,
		onChange: (e) => setPrompt(e.target.value),
		placeholder: "描述你想创作的短剧内容…\n例如：一个关于失忆侦探在雨夜城市中寻找真相的悬疑故事",
		rows: 3,
		style: {
			minHeight: "64px",
			fontSize: "13px",
			marginBottom: "8px"
		}
	}), createElement$5("div", { className: "agnes-input-row" }, createElement$5("div", null, createElement$5("label", { style: {
		fontSize: "11px",
		color: "var(--ag-text-3, #6e80a3)",
		marginBottom: "2px",
		display: "block"
	} }, "文本模型"), createElement$5("select", {
		className: "agnes-select",
		value: textModel,
		onChange: (e) => setTextModel(e.target.value)
	}, ...TEXT_MODELS.map((m) => createElement$5("option", {
		key: m.value,
		value: m.value
	}, m.label)))), createElement$5("div", null, createElement$5("label", { style: {
		fontSize: "11px",
		color: "var(--ag-text-3, #6e80a3)",
		marginBottom: "2px",
		display: "block"
	} }, "图像模型"), createElement$5("select", {
		className: "agnes-select",
		value: imageModel,
		onChange: (e) => setImageModel(e.target.value)
	}, ...imgOpts.map((m) => createElement$5("option", {
		key: m.value,
		value: m.value
	}, m.label)))), createElement$5("div", null, createElement$5("label", { style: {
		fontSize: "11px",
		color: "var(--ag-text-3, #6e80a3)",
		marginBottom: "2px",
		display: "block"
	} }, "视频模型"), createElement$5("select", {
		className: "agnes-select",
		value: videoModel,
		onChange: (e) => setVideoModel(e.target.value)
	}, ...vidOpts.map((m) => createElement$5("option", {
		key: m.value,
		value: m.value
	}, m.label))))), createElement$5("div", { style: {
		display: "flex",
		alignItems: "flex-end",
		gap: "8px"
	} }, createElement$5("div", null, createElement$5("label", { style: {
		fontSize: "11px",
		color: "var(--ag-text-3, #6e80a3)",
		marginBottom: "2px",
		display: "block"
	} }, "每镜头时长(秒)"), createElement$5("select", {
		className: "agnes-select",
		value: String(shotDuration),
		onChange: (e) => setShotDuration(Number(e.target.value)),
		style: { width: "80px" }
	}, ...DURATION_OPTIONS.map((d) => createElement$5("option", {
		key: d,
		value: String(d)
	}, d + "s")))), createElement$5("button", {
		className: "agnes-btn agnes-btn-primary",
		onClick: handleStart,
		disabled: loading || !prompt.trim(),
		style: { flex: 1 }
	}, loading ? "⏳ 启动中…" : "🚀 开始创作"), createElement$5("button", {
		className: "agnes-btn agnes-btn-secondary",
		onClick: () => {
			const input = document.createElement("input");
			input.type = "file";
			input.accept = ".txt,.md,.markdown,.json";
			input.onchange = async (e) => {
				const file = e.target.files?.[0];
				if (!file) return;
				const reader = new FileReader();
				reader.onload = async (ev) => {
					const content = ev.target?.result;
					if (!content) return;
					setLoading(true);
					setError("");
					try {
						const { drama_id } = await importScript({
							script: content,
							prompt: file.name.replace(/\.[^.]+$/, ""),
							text_model: newDramaTextModel,
							image_model: newDramaImageModel,
							video_model: newDramaVideoModel,
							shot_duration: newDramaShotDuration
						});
						const stopPoll = pollDramaStatus(drama_id, (task) => {
							saveDramaTask(task);
							if ([
								"completed",
								"failed",
								"stopped"
							].includes(task.status)) {
								stopPoll();
								setTasks(listDramaTasks());
							}
						}, 3e3);
						setTasks(listDramaTasks());
						setActiveTaskId(drama_id);
					} catch (err) {
						setError(err instanceof Error ? err.message : "导入失败");
					} finally {
						setLoading(false);
					}
				};
				reader.readAsText(file);
			};
			input.click();
		},
		disabled: loading
	}, "📥 导入剧本"), error ? createElement$5("div", { style: {
		marginTop: "8px",
		padding: "6px 10px",
		borderRadius: "6px",
		background: "rgba(255,107,107,0.12)",
		color: "#ff6b6b",
		fontSize: "12px"
	} }, "⚠ " + error) : null));
	const renderTaskList = () => createElement$5("div", { className: "agnes-left" }, createElement$5("div", { className: "agnes-left-header" }, "📁 任务列表"), createElement$5("div", { className: "agnes-left-content" }, taskList.length === 0 ? createElement$5("div", { style: {
		textAlign: "center",
		padding: "20px 12px",
		fontSize: "12px",
		color: "var(--ag-text-3, #6e80a3)"
	} }, "暂无任务", createElement$5("br"), "在上方输入短剧创意开始创作") : taskList.map((task) => {
		const isActive = selectedTaskId === task.drama_id;
		const statusIcon = TERMINAL.has(task.status) ? task.status === "completed" ? "✅" : task.status === "failed" ? "❌" : "⏹" : "🔄";
		return createElement$5("div", {
			key: task.drama_id,
			className: "agnes-scene-item" + (isActive ? " active" : ""),
			onClick: () => handleSelectTask(task.drama_id)
		}, createElement$5("div", { className: "agnes-scene-num" }, statusIcon), createElement$5("div", { className: "agnes-scene-info" }, createElement$5("div", { className: "agnes-scene-name" }, getTaskPreview(task)), createElement$5("div", { className: "agnes-scene-status" + (TERMINAL.has(task.status) ? " done" : " generating") }, STATUS_LABELS[task.status] || task.status), createElement$5("div", { style: {
			fontSize: "10px",
			color: "var(--ag-text-3, #6e80a3)",
			marginTop: "2px"
		} }, formatTime(task.created_at))), createElement$5("button", {
			style: {
				border: "none",
				background: "transparent",
				color: "var(--ag-text-3, #6e80a3)",
				cursor: "pointer",
				fontSize: "12px",
				padding: "2px 4px",
				borderRadius: "4px",
				opacity: isActive ? 1 : .5
			},
			title: "删除任务",
			onClick: (e) => {
				e.stopPropagation();
				handleDeleteTask(task.drama_id);
			}
		}, "✕"));
	})));
	const renderCenter = () => {
		if (!currentTask) return createElement$5("div", { className: "agnes-center" }, createElement$5("div", { className: "agnes-empty" }, createElement$5("div", { className: "agnes-empty-icon" }, "🎬"), createElement$5("div", { className: "agnes-empty-title" }, "短剧创作工作台"), createElement$5("div", { className: "agnes-empty-desc" }, "输入创意描述，AI 将自动生成故事梗概 → 剧本 → 分镜 → 素材 → 视频的完整短剧流水线。")));
		const task = currentTask;
		const stepIdx = getStepIndex(task);
		return createElement$5("div", { className: "agnes-center" }, renderProgressSteps(task), renderStatusMessage(task), createElement$5("div", { style: {
			flex: 1,
			overflowY: "auto",
			padding: "12px 16px"
		} }, task.status === "paused_story" ? renderTextEditor({
			task,
			field: "story",
			editContent,
			onEditChange: setEditContent,
			onConfirm: handleConfirmField,
			onRegenerate: handleRegenerateStep
		}) : null, task.status === "paused_script" ? renderTextEditor({
			task,
			field: "script",
			editContent,
			onEditChange: setEditContent,
			onConfirm: handleConfirmField,
			onRegenerate: handleRegenerateStep
		}) : null, task.status === "completed" ? renderCompletedView(task) : null, task.story && task.status !== "paused_story" ? renderReadOnlySection({
			title: "📝 故事梗概",
			content: task.edited_story || task.story
		}) : null, task.script && task.status !== "paused_script" && stepIdx >= 1 ? renderReadOnlySection({
			title: "📋 剧本",
			content: task.edited_script || task.script
		}) : null, stepIdx >= 2 && task.status !== "paused_story" && task.status !== "paused_script" ? renderShots(task, handleConfirmVideoShot) : null, stepIdx >= 3 && task.status !== "paused_story" && task.status !== "paused_script" ? renderAssets(task) : null, renderFinalCut(task, {
			merging,
			finalCut,
			notice,
			ffmpegMissing: ffStatus ? !ffStatus.available : false,
			ffmpegHint: ffStatus?.hint,
			onGenerateAll: handleGenerateAllVideos,
			onMerge: handleMerge
		})), createElement$5("div", { className: "agnes-action-bar" }, task.status === "stopped" ? createElement$5("button", {
			className: "agnes-btn agnes-btn-primary",
			onClick: handleResume
		}, "▶ 恢复") : null, !TERMINAL.has(task.status) && task.status !== "stopped" ? createElement$5("button", {
			className: "agnes-btn agnes-btn-danger",
			onClick: handleStop
		}, "⏹ 停止") : null, task.status === "failed" ? createElement$5("button", {
			className: "agnes-btn agnes-btn-primary",
			onClick: handleResume
		}, "🔄 重试") : null, createElement$5("div", { style: {
			marginLeft: "auto",
			fontSize: "11px",
			color: "var(--ag-text-3, #6e80a3)"
		} }, "文本: " + task.text_model + " · 图像: " + task.image_model + " · 视频: " + task.video_model)));
	};
	const renderRight = () => {
		if (!currentTask) return createElement$5("div", { className: "agnes-right" }, createElement$5("div", { className: "agnes-right-scroll" }, createElement$5("div", { className: "agnes-section" }, createElement$5("div", { className: "agnes-section-title" }, "⚙ 创作设置"), createElement$5("div", { className: "agnes-form-group" }, createElement$5("label", { className: "agnes-form-label" }, "文本模型"), createElement$5("select", {
			className: "agnes-form-select",
			value: textModel,
			onChange: (e) => setTextModel(e.target.value)
		}, ...TEXT_MODELS.map((m) => createElement$5("option", {
			key: m.value,
			value: m.value
		}, m.label)))), createElement$5("div", { className: "agnes-form-group" }, createElement$5("label", { className: "agnes-form-label" }, "图像模型"), createElement$5("select", {
			className: "agnes-form-select",
			value: imageModel,
			onChange: (e) => setImageModel(e.target.value)
		}, ...imgOpts.map((m) => createElement$5("option", {
			key: m.value,
			value: m.value
		}, m.label)))), createElement$5("div", { className: "agnes-form-group" }, createElement$5("label", { className: "agnes-form-label" }, "视频模型"), createElement$5("select", {
			className: "agnes-form-select",
			value: videoModel,
			onChange: (e) => setVideoModel(e.target.value)
		}, ...vidOpts.map((m) => createElement$5("option", {
			key: m.value,
			value: m.value
		}, m.label)))), createElement$5("div", { className: "agnes-form-group" }, createElement$5("label", { className: "agnes-form-label" }, "每镜头时长"), createElement$5("div", { className: "agnes-size-grid" }, ...DURATION_OPTIONS.map((d) => createElement$5("button", {
			key: d,
			className: "agnes-size-btn" + (shotDuration === d ? " active" : ""),
			onClick: () => setShotDuration(d)
		}, d + "s"))))), createElement$5("div", { className: "agnes-divider" }), createElement$5("div", { className: "agnes-section" }, createElement$5("div", { className: "agnes-section-title" }, "💡 使用提示"), createElement$5("div", { style: {
			fontSize: "12px",
			lineHeight: "1.6",
			color: "var(--ag-text-2, #2a3c5e)"
		} }, "• 描述越详细，生成效果越好", createElement$5("br"), "• 可在每步暂停时编辑内容", createElement$5("br"), "• 分镜和视频可逐个生成", createElement$5("br"), "• 历史任务自动保存在本地"))));
		const task = currentTask;
		const stepIdx = getStepIndex(task);
		return createElement$5("div", { className: "agnes-right" }, createElement$5("div", { className: "agnes-right-scroll" }, createElement$5("div", { className: "agnes-section" }, createElement$5("div", { className: "agnes-section-title" }, "📋 任务信息"), createElement$5("div", { className: "agnes-setting-row" }, createElement$5("span", { className: "agnes-setting-label" }, "状态"), createElement$5("span", { className: "agnes-setting-value" }, STATUS_LABELS[task.status] || task.status)), createElement$5("div", { className: "agnes-setting-row" }, createElement$5("span", { className: "agnes-setting-label" }, "创建时间"), createElement$5("span", { className: "agnes-setting-value" }, formatTime(task.created_at))), createElement$5("div", { className: "agnes-setting-row" }, createElement$5("span", { className: "agnes-setting-label" }, "镜头时长"), createElement$5("span", { className: "agnes-setting-value" }, task.shot_duration + "s")), createElement$5("div", { className: "agnes-setting-row" }, createElement$5("span", { className: "agnes-setting-label" }, "进度"), createElement$5("span", { className: "agnes-setting-value" }, stepIdx + 1 + " / 5"))), createElement$5("div", { className: "agnes-divider" }), createElement$5("div", { className: "agnes-section" }, createElement$5("div", { className: "agnes-section-title" }, "📊 生成详情"), task.storyboard?.shots ? createElement$5("div", { className: "agnes-setting-row" }, createElement$5("span", { className: "agnes-setting-label" }, "分镜数"), createElement$5("span", { className: "agnes-setting-value" }, String(task.storyboard.shots.length))) : null, task.assets ? createElement$5("div", { className: "agnes-setting-row" }, createElement$5("span", { className: "agnes-setting-label" }, "素材数"), createElement$5("span", { className: "agnes-setting-value" }, String(task.assets.length))) : null, task.video_results ? createElement$5("div", { className: "agnes-setting-row" }, createElement$5("span", { className: "agnes-setting-label" }, "视频数"), createElement$5("span", { className: "agnes-setting-value" }, task.video_results.filter((v) => v.status === "completed").length + " / " + (task.storyboard?.shots?.length || task.video_results.length))) : null, createElement$5("div", {
			className: "agnes-form-group",
			style: { marginTop: "8px" }
		}, createElement$5("label", { className: "agnes-form-label" }, "创作提示"), createElement$5("div", { style: {
			padding: "8px",
			borderRadius: "6px",
			background: "var(--ag-surface-2, rgba(255,255,255,0.55))",
			fontSize: "12px",
			lineHeight: "1.5",
			color: "var(--ag-text-2, #2a3c5e)",
			maxHeight: "120px",
			overflowY: "auto",
			whiteSpace: "pre-wrap"
		} }, task.prompt))), createElement$5("div", { className: "agnes-divider" }), createElement$5("div", { className: "agnes-section" }, createElement$5("div", { className: "agnes-section-title" }, "🤖 模型配置"), createElement$5("div", { className: "agnes-setting-row" }, createElement$5("span", { className: "agnes-setting-label" }, "文本"), createElement$5("span", {
			className: "agnes-setting-value",
			style: { fontSize: "11px" }
		}, task.text_model)), createElement$5("div", { className: "agnes-setting-row" }, createElement$5("span", { className: "agnes-setting-label" }, "图像"), createElement$5("span", {
			className: "agnes-setting-value",
			style: { fontSize: "11px" }
		}, task.image_model)), createElement$5("div", { className: "agnes-setting-row" }, createElement$5("span", { className: "agnes-setting-label" }, "视频"), createElement$5("span", {
			className: "agnes-setting-value",
			style: { fontSize: "11px" }
		}, task.video_model)))));
	};
	return createElement$5("div", { style: {
		display: "flex",
		flexDirection: "column",
		height: "100%",
		width: "100%",
		overflow: "hidden"
	} }, renderNewTaskForm(), createElement$5("div", {
		className: "agnes-body",
		style: {
			flex: 1,
			minHeight: 0
		}
	}, renderTaskList(), renderCenter(), renderRight()), createElement$5("div", { className: "agnes-statusbar" }, createElement$5("div", { className: "agnes-status-dot" }), createElement$5("span", null, "短剧流水线"), createElement$5("span", null, "·"), createElement$5("span", null, taskList.length + " 个任务"), currentTask && !TERMINAL.has(currentTask.status) ? createElement$5("span", { style: {
		marginLeft: "auto",
		color: "#fdcb6e"
	} }, "⚡ 制作中") : null));
}
//#endregion
//#region src/client/prompt-expert.ts
const API_BASE$3 = "/agnes-studio/api";
/** 获取专家类型列表 */
async function fetchExpertTypes() {
	try {
		const resp = await fetch(`${API_BASE$3}/prompt-expert/types`);
		if (resp.ok) return (await resp.json()).types || [];
	} catch {}
	return BUILTIN_EXPERT_TYPES;
}
/** 生成提示词 */
async function generateExpertPrompt(req) {
	const resp = await fetch(`${API_BASE$3}/prompt-expert/generate`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(req)
	});
	if (!resp.ok) {
		const data = await resp.json().catch(() => ({}));
		throw new Error(data.error || "生成失败");
	}
	const data = await resp.json();
	if (data.accepted) return data.prompt || "生成中...";
	return data.prompt || "";
}
const BUILTIN_EXPERT_TYPES = [
	{
		key: "t2i",
		icon: "🖼",
		name: "文生图专家",
		desc: "把想法扩写成专业绘图提示词",
		placeholder: "例如：一个穿汉服的女孩在樱花树下弹古筝",
		fields: [
			{
				key: "style",
				label: "画面风格",
				type: "select",
				default: "不限",
				options: [
					"不限",
					"写实摄影",
					"动漫插画",
					"国风水墨",
					"赛博朋克",
					"3D渲染",
					"水彩手绘",
					"电影质感"
				]
			},
			{
				key: "ratio",
				label: "画幅比例",
				type: "select",
				default: "1:1",
				options: [
					"1:1",
					"16:9",
					"9:16",
					"4:3",
					"3:4"
				]
			},
			{
				key: "shot",
				label: "景别",
				type: "select",
				default: "不限",
				options: [
					"不限",
					"特写",
					"半身",
					"全身",
					"远景",
					"鸟瞰"
				]
			}
		]
	},
	{
		key: "i2i",
		icon: "🎨",
		name: "图生图专家",
		desc: "生成精准的改图指令",
		placeholder: "例如：把这张产品图的背景换成海边黄昏",
		fields: [{
			key: "strength",
			label: "改动幅度",
			type: "select",
			default: "中等",
			options: [
				"轻微",
				"中等",
				"大幅重绘"
			]
		}, {
			key: "style",
			label: "目标风格",
			type: "select",
			default: "不限",
			options: [
				"不限",
				"写实摄影",
				"动漫插画",
				"水彩手绘",
				"3D渲染",
				"电商主图"
			]
		}]
	},
	{
		key: "t2v",
		icon: "🎬",
		name: "文生视频专家",
		desc: "生成含运镜与光线的视频提示词",
		placeholder: "例如：一只猫在夕阳下的海滩散步",
		fields: [
			{
				key: "camera",
				label: "镜头运动",
				type: "select",
				default: "缓慢推进",
				options: [
					"固定镜头",
					"缓慢推进",
					"缓慢拉远",
					"左摇",
					"右摇",
					"跟随"
				]
			},
			{
				key: "duration",
				label: "时长",
				type: "select",
				default: "5秒",
				options: ["5秒", "10秒"]
			},
			{
				key: "style",
				label: "画面风格",
				type: "select",
				default: "电影感",
				options: [
					"电影感",
					"写实",
					"动漫",
					"赛博朋克",
					"国风"
				]
			}
		]
	},
	{
		key: "novel",
		icon: "📖",
		name: "小说生成专家",
		desc: "生成设定、大纲与开篇正文",
		placeholder: "例如：都市悬疑，法医女主追查连环失踪案",
		fields: [
			{
				key: "genre",
				label: "题材",
				type: "select",
				default: "都市",
				options: [
					"都市",
					"悬疑",
					"玄幻",
					"言情",
					"科幻",
					"历史",
					"恐怖"
				]
			},
			{
				key: "words",
				label: "开篇字数",
				type: "select",
				default: "800字",
				options: [
					"500字",
					"800字",
					"1500字",
					"3000字"
				]
			},
			{
				key: "tone",
				label: "文风",
				type: "select",
				default: "轻松明快",
				options: [
					"轻松明快",
					"沉稳厚重",
					"紧张刺激",
					"唯美抒情"
				]
			}
		]
	},
	{
		key: "drama",
		icon: "🎭",
		name: "短剧剧本专家",
		desc: "生成带钩子的竖屏短剧剧本",
		placeholder: "例如：外卖员逆袭成集团继承人",
		fields: [{
			key: "genre",
			label: "题材",
			type: "select",
			default: "逆袭",
			options: [
				"逆袭",
				"甜宠",
				"悬疑",
				"家庭伦理",
				"职场",
				"古装"
			]
		}, {
			key: "duration",
			label: "单集时长",
			type: "select",
			default: "1-2分钟",
			options: [
				"1分钟",
				"1-2分钟",
				"3分钟"
			]
		}]
	},
	{
		key: "anchor",
		icon: "🎙",
		name: "数字人口播专家",
		desc: "生成适合 TTS 朗读的口播稿",
		placeholder: "例如：介绍一款降噪耳机，突出性价比",
		fields: [{
			key: "length",
			label: "稿件长度",
			type: "select",
			default: "约300字",
			options: [
				"约150字",
				"约300字",
				"约500字"
			]
		}, {
			key: "tone",
			label: "语气",
			type: "select",
			default: "亲切自然",
			options: [
				"亲切自然",
				"专业理性",
				"激情带货",
				"轻松幽默"
			]
		}]
	},
	{
		key: "sheet",
		icon: "🧍",
		name: "角色三视图专家",
		desc: "生成角色设定与三视图提示词",
		placeholder: "例如：28岁职场女性，干练短发",
		fields: [{
			key: "style",
			label: "画风",
			type: "select",
			default: "动漫插画",
			options: [
				"动漫插画",
				"写实",
				"国风",
				"3D渲染",
				"水彩"
			]
		}, {
			key: "gender",
			label: "性别",
			type: "select",
			default: "不限",
			options: [
				"不限",
				"男性",
				"女性"
			]
		}]
	}
];
//#endregion
//#region src/client/prompt-expert-panel.tsx
function shellRequire$4(id) {
	try {
		return typeof __require === "function" ? __require(id) : void 0;
	} catch {
		return;
	}
}
const React$4 = shellRequire$4("react") ?? globalThis.React ?? null;
const NOOP$4 = () => {};
const useState$4 = React$4?.useState ?? ((i) => [i, NOOP$4]);
const useEffect$4 = React$4?.useEffect ?? NOOP$4;
const useCallback$4 = React$4?.useCallback ?? ((f) => f);
const createElement$4 = React$4?.createElement ?? (() => null);
function PromptExpertPanel({ textModels }) {
	injectStyles();
	const [types, setTypes] = useState$4([]);
	const [selected, setSelected] = useState$4("");
	const [idea, setIdea] = useState$4("");
	const [params, setParams] = useState$4({});
	const [model, setModel] = useState$4(() => {
		try {
			return Object.keys(textModels)[0] || "agnes-3.0-flash";
		} catch {
			return "agnes-3.0-flash";
		}
	});
	const [result, setResult] = useState$4("");
	const [loading, setLoading] = useState$4(false);
	const [error, setError] = useState$4("");
	const [history, setHistory] = useState$4([]);
	useEffect$4(() => {
		fetchExpertTypes().then(setTypes).catch(() => {});
		try {
			const raw = localStorage?.getItem("agnes-expert-history");
			if (raw) setHistory(JSON.parse(raw));
		} catch {}
	}, []);
	const currentType = types.find((t) => t.key === selected);
	const handleGenerate = useCallback$4(async () => {
		if (!selected || !idea.trim() || loading) return;
		setLoading(true);
		setError("");
		setResult("");
		try {
			const r = await generateExpertPrompt({
				type: selected,
				idea: idea.trim(),
				params,
				model
			});
			setResult(r);
			const newHistory = [{
				type: selected,
				idea: idea.trim(),
				result: r,
				time: Date.now()
			}, ...history].slice(0, 20);
			setHistory(newHistory);
			try {
				localStorage?.setItem("agnes-expert-history", JSON.stringify(newHistory));
			} catch {}
		} catch (e) {
			setError(e?.message || "生成失败");
		} finally {
			setLoading(false);
		}
	}, [
		selected,
		idea,
		params,
		model,
		loading,
		history
	]);
	const handleCopy = useCallback$4((text) => {
		try {
			navigator.clipboard?.writeText(text);
		} catch {}
	}, []);
	return createElement$4("div", { style: {
		padding: "16px",
		overflowY: "auto",
		height: "100%"
	} }, createElement$4("div", { style: {
		fontSize: "16px",
		fontWeight: 700,
		marginBottom: "16px"
	} }, "✨ 提示词专家"), types.length > 0 ? createElement$4("div", { style: {
		display: "grid",
		gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
		gap: "8px",
		marginBottom: "16px"
	} }, ...types.map((t) => createElement$4("div", {
		key: t.key,
		style: {
			padding: "10px",
			borderRadius: "8px",
			cursor: "pointer",
			border: t.key === selected ? "1px solid #6c5ce7" : "1px solid rgba(255,255,255,0.06)",
			background: t.key === selected ? "rgba(108,92,231,0.15)" : "var(--ag-surface-2, rgba(255,255,255,0.55))"
		},
		onClick: () => {
			setSelected(t.key);
			setParams({});
			setResult("");
			setError("");
		}
	}, createElement$4("div", { style: {
		fontSize: "20px",
		marginBottom: "4px"
	} }, t.icon), createElement$4("div", { style: {
		fontSize: "12px",
		fontWeight: 600
	} }, t.name)))) : null, currentType ? createElement$4("div", null, createElement$4("div", { style: { marginBottom: "8px" } }, createElement$4("label", { style: {
		fontSize: "12px",
		color: "var(--ag-text-2, #2a3c5e)",
		display: "block",
		marginBottom: "4px"
	} }, "文本模型"), createElement$4("select", {
		style: {
			width: "100%",
			height: "32px",
			padding: "0 8px",
			borderRadius: "6px",
			border: "1px solid rgba(255,255,255,0.1)",
			background: "#252538",
			color: "var(--ag-text, #0c1a33)",
			fontSize: "12px"
		},
		value: model,
		onChange: (e) => setModel(e.target.value)
	}, ...Object.entries(textModels).map(([id, name]) => createElement$4("option", {
		key: id,
		value: id
	}, name)))), ...currentType.fields.map((f) => createElement$4("div", {
		key: f.key,
		style: { marginBottom: "8px" }
	}, createElement$4("label", { style: {
		fontSize: "12px",
		color: "var(--ag-text-2, #2a3c5e)",
		display: "block",
		marginBottom: "4px"
	} }, f.label), createElement$4("select", {
		style: {
			width: "100%",
			height: "32px",
			padding: "0 8px",
			borderRadius: "6px",
			border: "1px solid rgba(255,255,255,0.1)",
			background: "#252538",
			color: "var(--ag-text, #0c1a33)",
			fontSize: "12px"
		},
		value: params[f.key] || f.default,
		onChange: (e) => setParams({
			...params,
			[f.key]: e.target.value
		})
	}, ...f.options.map((o) => createElement$4("option", {
		key: o,
		value: o
	}, o))))), createElement$4("div", { style: { marginBottom: "8px" } }, createElement$4("label", { style: {
		fontSize: "12px",
		color: "var(--ag-text-2, #2a3c5e)",
		display: "block",
		marginBottom: "4px"
	} }, "你的想法"), createElement$4("textarea", {
		style: {
			width: "100%",
			minHeight: "60px",
			padding: "8px",
			borderRadius: "6px",
			border: "1px solid rgba(255,255,255,0.1)",
			background: "#252538",
			color: "var(--ag-text, #0c1a33)",
			fontSize: "12px",
			fontFamily: "inherit",
			boxSizing: "border-box"
		},
		value: idea,
		onChange: (e) => setIdea(e.target.value),
		placeholder: currentType.placeholder,
		rows: 3
	})), createElement$4("button", {
		className: "agnes-btn agnes-btn-primary",
		style: { width: "100%" },
		disabled: loading || !idea.trim(),
		onClick: handleGenerate
	}, loading ? "⏳ 生成中..." : "✨ 生成提示词"), error ? createElement$4("div", { style: {
		marginTop: "8px",
		padding: "6px",
		borderRadius: "6px",
		background: "rgba(255,107,107,0.12)",
		color: "#ff6b6b",
		fontSize: "11px"
	} }, error) : null, result ? createElement$4("div", { style: {
		marginTop: "12px",
		padding: "12px",
		borderRadius: "8px",
		background: "#252538",
		border: "1px solid rgba(255,255,255,0.06)",
		whiteSpace: "pre-wrap",
		fontSize: "12px",
		lineHeight: 1.6,
		maxHeight: "300px",
		overflowY: "auto"
	} }, result, createElement$4("button", {
		className: "agnes-btn agnes-btn-sm agnes-btn-secondary",
		style: { marginTop: "8px" },
		onClick: () => handleCopy(result)
	}, "📋 复制")) : null) : createElement$4("div", { style: {
		padding: "40px",
		textAlign: "center",
		color: "var(--ag-text-3, #6e80a3)"
	} }, "👆 选择一个专家开始"));
}
//#endregion
//#region src/client/anchor.ts
const API_BASE$2 = "/agnes-studio/api";
/** 提交口播任务 */
async function startAnchor(req) {
	const resp = await fetch(`${API_BASE$2}/anchor/start`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(req)
	});
	const data = await resp.json().catch(() => ({}));
	if (!resp.ok || data?.error) throw new Error(data?.error || `提交失败（HTTP ${resp.status}）`);
	return data;
}
/** 查询口播任务状态 */
async function getAnchorStatus(anchorId) {
	const resp = await fetch(`${API_BASE$2}/anchor/${anchorId}/status`);
	const data = await resp.json().catch(() => ({}));
	if (!resp.ok || data?.error) throw new Error(data?.error || "查询失败");
	return data;
}
/** 完整任务详情（含每段文本） */
async function getAnchorTask(anchorId) {
	const resp = await fetch(`${API_BASE$2}/anchor/${anchorId}`);
	const data = await resp.json().catch(() => ({}));
	if (!resp.ok || data?.error) throw new Error(data?.error || "查询失败");
	return data;
}
/** 停止任务 */
async function stopAnchor(anchorId) {
	await fetch(`${API_BASE$2}/anchor/${anchorId}/stop`, { method: "POST" });
}
/** 重新生成（恢复） */
async function resumeAnchor(anchorId) {
	await fetch(`${API_BASE$2}/anchor/${anchorId}/resume`, { method: "POST" });
}
/** 轮询状态，返回取消函数 */
function pollAnchorStatus(anchorId, callback, intervalMs = 3e3) {
	let stopped = false;
	const tick = async () => {
		if (stopped) return;
		try {
			const s = await getAnchorStatus(anchorId);
			callback(s);
			if (s.status === "completed" || s.status === "failed" || s.status === "stopped") return;
		} catch {}
		if (!stopped) setTimeout(tick, intervalMs);
	};
	tick();
	return () => {
		stopped = true;
	};
}
/**
* ffmpeg / 字体 能力状态。
*
* Returns null when the probe itself is unavailable (e.g. the host half is an
* older build without the /ffmpeg route). Returning a default "unavailable"
* object would make the panel cry "缺少 ffmpeg" on a machine where ffmpeg is
* perfectly fine — a false alarm is worse than no banner.
*/
async function fetchFfmpegStatus() {
	try {
		const resp = await fetch(`${API_BASE$2}/ffmpeg`);
		if (!resp.ok) return null;
		const data = await resp.json().catch(() => null);
		if (!data || typeof data.available !== "boolean") return null;
		return {
			available: data.available,
			path: String(data.path ?? ""),
			version: String(data.version ?? ""),
			ffprobe: Boolean(data.ffprobe),
			font: String(data.font ?? ""),
			hint: String(data.hint ?? "")
		};
	} catch {
		return null;
	}
}
/** 可选的 MiMo 音色 */
const ANCHOR_VOICES = [{
	id: "mimo_default",
	name: "默认音色"
}];
/** 把 File 读成 data URL（用于上传形象图/素材视频） */
function fileToDataUrl(file) {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => resolve(String(reader.result));
		reader.onerror = () => reject(/* @__PURE__ */ new Error("读取文件失败"));
		reader.readAsDataURL(file);
	});
}
//#endregion
//#region src/client/anchor-panel.tsx
function shellRequire$3(id) {
	try {
		return typeof __require === "function" ? __require(id) : void 0;
	} catch {
		return;
	}
}
const React$3 = shellRequire$3("react") ?? globalThis.React ?? null;
const NOOP$3 = () => {};
const useState$3 = React$3?.useState ?? ((i) => [i, NOOP$3]);
const useEffect$3 = React$3?.useEffect ?? NOOP$3;
const useCallback$3 = React$3?.useCallback ?? ((f) => f);
const useRef$2 = React$3?.useRef ?? ((i) => ({ current: i }));
const createElement$3 = React$3?.createElement ?? (() => null);
const MODES = [
	{
		id: "static",
		icon: "🖼",
		name: "静态形象图",
		desc: "一张形象图循环展示（最快最稳）"
	},
	{
		id: "clip",
		icon: "🎞",
		name: "视频素材",
		desc: "上传视频按旁白长度循环/截取"
	},
	{
		id: "ai",
		icon: "✨",
		name: "AI 生成画面",
		desc: "用 AI 生成背景片再铺满（约 2-4 分钟）"
	}
];
const SAMPLE = "大家好，欢迎使用泡泡猫的影视工具。这里是数字人口播功能，只要输入文稿，系统就会自动完成分段、配音、画面和字幕。";
function AnchorPanel() {
	injectStyles();
	const [text, setText] = useState$3("");
	const [mode, setMode] = useState$3("static");
	const [voice, setVoice] = useState$3(ANCHOR_VOICES[0]?.id ?? "mimo_default");
	const [minSeg, setMinSeg] = useState$3(4);
	const [subtitles, setSubtitles] = useState$3(true);
	const [aiPrompt, setAiPrompt] = useState$3("");
	const [perSegment, setPerSegment] = useState$3(false);
	const [imageData, setImageData] = useState$3("");
	const [clipData, setClipData] = useState$3("");
	const [busy, setBusy] = useState$3(false);
	const [error, setError] = useState$3("");
	const [status, setStatus] = useState$3(null);
	const [segments, setSegments] = useState$3([]);
	const [ff, setFf] = useState$3(null);
	const cancelRef = useRef$2(null);
	useEffect$3(() => {
		fetchFfmpegStatus().then(setFf).catch(() => setFf(null));
		return () => {
			cancelRef.current?.();
		};
	}, []);
	const pickFile = useCallback$3(async (file, kind) => {
		if (!file) return;
		try {
			const url = await fileToDataUrl(file);
			if (kind === "image") setImageData(url);
			else setClipData(url);
			setError("");
		} catch (e) {
			setError(e?.message || "读取文件失败");
		}
	}, []);
	const handleStart = useCallback$3(async () => {
		if (!text.trim()) {
			setError("请先输入口播文稿");
			return;
		}
		if (mode === "static" && !imageData) {
			setError("静态形象图模式需要先选择一张图片");
			return;
		}
		if (mode === "clip" && !clipData) {
			setError("视频素材模式需要先选择一个视频");
			return;
		}
		setBusy(true);
		setError("");
		setStatus(null);
		setSegments([]);
		try {
			const payload = {
				text: text.trim(),
				mode,
				voice,
				min_seg_sec: minSeg,
				subtitles
			};
			if (mode === "static") payload.image = {
				kind: "data",
				value: imageData
			};
			if (mode === "clip") payload.clip = {
				kind: "data",
				value: clipData
			};
			if (mode === "ai") {
				payload.ai_prompt = aiPrompt.trim() || void 0;
				payload.ai_per_segment = perSegment;
			}
			const r = await startAnchor(payload);
			cancelRef.current?.();
			cancelRef.current = pollAnchorStatus(r.anchor_id, (s) => {
				setStatus(s);
				if (s.status === "completed" || s.status === "failed" || s.status === "stopped") {
					setBusy(false);
					getAnchorTask(r.anchor_id).then((t) => setSegments(t.segments || [])).catch(() => {});
				}
			});
		} catch (e) {
			setError(e?.message || "提交失败");
			setBusy(false);
		}
	}, [
		text,
		mode,
		voice,
		minSeg,
		subtitles,
		imageData,
		clipData,
		aiPrompt,
		perSegment
	]);
	const handleStop = useCallback$3(async () => {
		if (status?.anchor_id) await stopAnchor(status.anchor_id).catch(() => {});
		setBusy(false);
	}, [status]);
	const handleResume = useCallback$3(async () => {
		if (!status?.anchor_id) return;
		setBusy(true);
		await resumeAnchor(status.anchor_id).catch(() => {});
		cancelRef.current?.();
		cancelRef.current = pollAnchorStatus(status.anchor_id, (s) => {
			setStatus(s);
			if (s.status === "completed" || s.status === "failed") setBusy(false);
		});
	}, [status]);
	const rowStyle = {
		display: "flex",
		gap: "8px",
		alignItems: "center",
		flexWrap: "wrap"
	};
	const labelStyle = {
		fontSize: "12px",
		color: "var(--ag-text-2, #2a3c5e)",
		minWidth: "64px"
	};
	const inputStyle = {
		flex: 1,
		minWidth: "160px",
		padding: "7px 10px",
		borderRadius: "8px",
		border: "1px solid var(--ag-line-2, rgba(32,96,190,0.32))",
		background: "var(--ag-surface-2, rgba(255,255,255,0.55))",
		color: "var(--ag-text, #0c1a33)",
		fontSize: "13px"
	};
	return createElement$3("div", { className: "agnes-anchor" }, ff && !ff.available ? createElement$3("div", {
		className: "agnes-keyguide",
		style: { margin: "16px 16px 0" }
	}, createElement$3("div", { className: "agnes-keyguide-head" }, createElement$3("div", { className: "agnes-keyguide-title" }, "⚠️ 缺少 ffmpeg，口播功能不可用")), createElement$3("div", { className: "agnes-keyguide-note" }, ff.hint || "请安装 ffmpeg 后重试")) : null, ff && ff.available && !ff.font ? createElement$3("div", {
		className: "agnes-keyguide",
		style: { margin: "16px 16px 0" }
	}, createElement$3("div", { className: "agnes-keyguide-head" }, createElement$3("div", { className: "agnes-keyguide-title" }, "⚠️ 未找到中文字体")), createElement$3("div", { className: "agnes-keyguide-note" }, ff.hint || "字幕会显示成方块，建议安装中文字体")) : null, createElement$3("div", { className: "agnes-anchor-grid" }, createElement$3("div", { className: "agnes-anchor-col" }, createElement$3("div", { className: "agnes-section" }, createElement$3("div", { className: "agnes-section-title" }, "🎙 文稿"), createElement$3("textarea", {
		className: "agnes-textarea",
		rows: 5,
		placeholder: "输入口播文稿，支持中文标点自动分段…",
		value: text,
		onChange: (e) => setText(e.target.value),
		style: {
			width: "100%",
			resize: "vertical"
		}
	}), createElement$3("div", { style: {
		...rowStyle,
		marginTop: "8px"
	} }, createElement$3("button", {
		className: "agnes-btn agnes-btn-ghost",
		onClick: () => setText(SAMPLE)
	}, "填入示例文稿"), createElement$3("span", { style: {
		fontSize: "12px",
		color: "var(--ag-text-2, #2a3c5e)"
	} }, `${text.length} 字`))), createElement$3("div", { className: "agnes-section" }, createElement$3("div", { className: "agnes-section-title" }, "🎬 画面模式"), createElement$3("div", { className: "agnes-mode-cards" }, ...MODES.map((m) => createElement$3("button", {
		key: m.id,
		className: `agnes-mode-card${mode === m.id ? " active" : ""}`,
		onClick: () => setMode(m.id),
		title: m.desc
	}, createElement$3("span", { className: "agnes-mode-icon" }, m.icon), createElement$3("span", null, m.name), createElement$3("span", { className: "agnes-mode-desc" }, m.desc)))), mode === "static" ? createElement$3("div", { style: {
		...rowStyle,
		marginTop: "8px"
	} }, createElement$3("label", { className: "agnes-btn agnes-btn-ghost" }, imageData ? "✅ 已选择形象图" : "选择形象图", createElement$3("input", {
		type: "file",
		accept: "image/*",
		style: { display: "none" },
		onChange: (e) => pickFile(e.target.files?.[0], "image")
	})), imageData ? createElement$3("img", {
		src: imageData,
		alt: "形象图",
		style: {
			height: "48px",
			borderRadius: "6px",
			border: "1px solid rgba(255,255,255,0.12)"
		}
	}) : null) : null, mode === "clip" ? createElement$3("div", { style: {
		...rowStyle,
		marginTop: "8px"
	} }, createElement$3("label", { className: "agnes-btn agnes-btn-ghost" }, clipData ? "✅ 已选择视频" : "选择视频素材", createElement$3("input", {
		type: "file",
		accept: "video/*",
		style: { display: "none" },
		onChange: (e) => pickFile(e.target.files?.[0], "clip")
	})), clipData ? createElement$3("video", {
		src: clipData,
		muted: true,
		style: {
			height: "48px",
			borderRadius: "6px"
		}
	}) : null) : null, mode === "ai" ? createElement$3("div", null, createElement$3("div", { style: {
		...rowStyle,
		marginTop: "8px"
	} }, createElement$3("span", { style: labelStyle }, "画面风格"), createElement$3("input", {
		style: inputStyle,
		placeholder: "例如：城市夜景，霓虹灯，电影质感，无人",
		value: aiPrompt,
		onChange: (e) => setAiPrompt(e.target.value)
	})), createElement$3("label", { style: {
		...rowStyle,
		marginTop: "8px",
		cursor: "pointer"
	} }, createElement$3("input", {
		type: "checkbox",
		checked: perSegment,
		onChange: (e) => setPerSegment(e.target.checked)
	}), createElement$3("span", { style: { fontSize: "12px" } }, "逐段生成画面（每段台词配一段画面，更贴合内容）")), createElement$3("div", {
		className: "agnes-keyguide-note",
		style: { marginTop: "4px" }
	}, perSegment ? "⚠️ 每段各生成一段视频，耗时 ≈ 段数 × 2-4 分钟，且按段消耗额度" : "整片只生成一段背景画面并循环铺满（快、省额度）")) : null), createElement$3("div", { className: "agnes-section" }, createElement$3("div", { className: "agnes-section-title" }, "⚙ 参数"), createElement$3("div", { className: "agnes-param-grid" }, createElement$3("label", { className: "agnes-param" }, createElement$3("span", { className: "agnes-param-label" }, "音色"), createElement$3("select", {
		className: "agnes-param-control",
		value: voice,
		onChange: (e) => setVoice(e.target.value)
	}, ...ANCHOR_VOICES.map((v) => createElement$3("option", {
		key: v.id,
		value: v.id
	}, v.name)))), createElement$3("label", { className: "agnes-param" }, createElement$3("span", { className: "agnes-param-label" }, "每段最少"), createElement$3("select", {
		className: "agnes-param-control",
		value: String(minSeg),
		onChange: (e) => setMinSeg(Number(e.target.value))
	}, ...[
		3,
		4,
		6,
		8,
		10
	].map((s) => createElement$3("option", {
		key: s,
		value: String(s)
	}, `${s} 秒`)))), createElement$3("label", { className: "agnes-param agnes-param-check" }, createElement$3("input", {
		type: "checkbox",
		checked: subtitles,
		onChange: (e) => setSubtitles(e.target.checked)
	}), createElement$3("span", { className: "agnes-param-label" }, "烧录字幕")))), error ? createElement$3("div", { className: "agnes-error" }, error) : null, createElement$3("div", { style: { ...rowStyle } }, createElement$3("button", {
		className: `agnes-btn ${busy ? "agnes-btn-danger" : "agnes-btn-primary"}`,
		onClick: busy ? handleStop : handleStart,
		style: {
			flex: "0 0 auto",
			minWidth: "200px"
		}
	}, busy ? "⏹ 停止生成" : "🎙 开始生成口播视频"), busy ? createElement$3("span", { style: {
		fontSize: "12px",
		color: "var(--ag-text-2, #2a3c5e)"
	} }, "生成中…（配音约 3-5 秒/段，AI 画面模式另需 2-4 分钟）") : null)), createElement$3("div", { className: "agnes-anchor-col" }, createElement$3("div", { className: "agnes-anchor-side" }, !status ? createElement$3("div", { className: "agcv-empty" }, createElement$3("div", { className: "agnes-empty-icon" }, "🎙"), createElement$3("div", { className: "agnes-empty-title" }, "口播成片"), createElement$3("div", { className: "agcv-hint" }, "左侧填写文稿并选择画面模式，点击生成后成片会出现在这里"), createElement$3("div", { className: "agcv-slot-row" }, ...[
		1,
		2,
		3
	].map((i) => createElement$3("div", {
		key: i,
		className: "agcv-slot-mini"
	}, createElement$3("span", null, String(i)))))) : null, status && status.status !== "completed" ? createElement$3("div", {
		className: "agnes-section",
		style: { width: "100%" }
	}, createElement$3("div", { className: "agnes-section-title" }, "📊 进度"), createElement$3("div", { style: {
		fontSize: "13px",
		marginBottom: "6px"
	} }, status.message), createElement$3("div", {
		className: "agnes-progress-bar",
		style: { width: "100%" }
	}, createElement$3("div", {
		className: "agnes-progress-fill",
		style: { width: `${status.segments ? Math.round(status.done / status.segments * 100) : 0}%` }
	})), createElement$3("div", { style: {
		fontSize: "12px",
		color: "var(--ag-text-2, #2a3c5e)",
		marginTop: "4px"
	} }, `配音 ${status.done}/${status.segments} 段`), status.error ? createElement$3("div", {
		className: "agnes-error",
		style: { marginTop: "8px" }
	}, `❌ ${status.error}`) : null, status.status === "failed" ? createElement$3("button", {
		className: "agnes-btn",
		onClick: handleResume,
		style: { marginTop: "8px" }
	}, "🔄 重新生成") : null) : null, status?.status === "completed" && status.final ? createElement$3("div", { className: "agnes-section" }, createElement$3("div", { className: "agnes-section-title" }, "🎬 成片"), createElement$3("video", {
		src: status.final,
		controls: true,
		style: {
			width: "100%",
			borderRadius: "10px",
			background: "#000"
		}
	}), createElement$3("div", { style: {
		...rowStyle,
		marginTop: "10px"
	} }, createElement$3("a", {
		className: "agnes-btn",
		href: status.final,
		download: `口播-${status.anchor_id}.mp4`,
		style: { textDecoration: "none" }
	}, "⬇️ 下载成片"), createElement$3("span", { style: {
		fontSize: "12px",
		color: "var(--ag-text-2, #2a3c5e)"
	} }, `${status.segments} 段 · ${Number(status.total_duration || 0).toFixed(1)} 秒`)), segments.length > 0 ? createElement$3("div", { style: { marginTop: "12px" } }, createElement$3("div", {
		className: "agnes-section-title",
		style: { fontSize: "12px" }
	}, "分段台词"), ...segments.map((s) => createElement$3("div", {
		key: s.index,
		style: {
			fontSize: "12px",
			padding: "5px 8px",
			marginTop: "4px",
			borderRadius: "6px",
			background: "var(--ag-surface-2, rgba(255,255,255,0.55))",
			color: "var(--ag-text-2, #2a3c5e)"
		}
	}, `${s.index + 1}. [${s.start.toFixed(1)}-${s.end.toFixed(1)}s] ${s.text}`))) : null) : null))));
}
//#endregion
//#region src/client/canvas.ts
const STORAGE_KEY = "agnes-canvas-v1";
const NODE_SIZE = {
	text: {
		w: 260,
		h: 190
	},
	image: {
		w: 260,
		h: 250
	},
	video: {
		w: 280,
		h: 265
	}
};
const KIND_META = {
	text: {
		icon: "📝",
		name: "文本",
		hint: "剧本 / 分镜 / 灵感，可让 AI 续写"
	},
	image: {
		icon: "🖼",
		name: "图片",
		hint: "文生图，可接图片作参考"
	},
	video: {
		icon: "🎬",
		name: "视频",
		hint: "文生视频 / 图生视频"
	}
};
function createNode(kind, x, y) {
	return {
		id: "n" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
		kind,
		x: Math.round(x),
		y: Math.round(y),
		title: KIND_META[kind].name,
		text: "",
		status: "idle",
		createdAt: Date.now()
	};
}
/** A small starter graph so the canvas is not an empty void on first open. */
function createStarterDoc() {
	const n1 = createNode("text", 60, 80);
	n1.title = "剧本";
	n1.text = "雨夜，林越站在医院天台，手里攥着那枚古玉。楼下传来救护车的鸣笛。";
	const n2 = createNode("image", 380, 60);
	n2.title = "分镜 1";
	n2.text = "雨夜医院天台，男子手持青色古玉，电影感，冷色调，远景";
	const n3 = createNode("video", 700, 80);
	n3.title = "镜头 1";
	n3.text = "男子缓缓展开手掌，古玉微微发光，雨点打在肩头，镜头缓慢推近";
	return {
		version: 1,
		nodes: [
			n1,
			n2,
			n3
		],
		edges: [{
			id: "e1",
			from: n2.id,
			to: n3.id
		}],
		viewport: {
			x: 0,
			y: 0,
			scale: 1
		},
		updatedAt: Date.now()
	};
}
function loadCanvas() {
	try {
		const raw = localStorage?.getItem(STORAGE_KEY);
		if (!raw) return null;
		const doc = JSON.parse(raw);
		if (doc?.version !== 1 || !Array.isArray(doc.nodes)) return null;
		return doc;
	} catch {
		return null;
	}
}
function saveCanvas(doc) {
	try {
		localStorage?.setItem(STORAGE_KEY, JSON.stringify({
			...doc,
			updatedAt: Date.now()
		}));
	} catch {}
}
function clearCanvas() {
	try {
		localStorage?.removeItem(STORAGE_KEY);
	} catch {}
}
/** Upstream nodes feeding `id` (their media can be used as reference). */
function inputsOf(doc, id) {
	return doc.edges.filter((e) => e.to === id).map((e) => doc.nodes.find((n) => n.id === e.from)).filter((n) => n !== void 0);
}
//#endregion
//#region src/client/canvas-panel.tsx
function shellRequire$2(id) {
	try {
		return typeof __require === "function" ? __require(id) : void 0;
	} catch {
		return;
	}
}
const React$2 = shellRequire$2("react") ?? globalThis.React ?? null;
const NOOP$2 = () => {};
const useState$2 = React$2?.useState ?? ((i) => [i, NOOP$2]);
const useEffect$2 = React$2?.useEffect ?? NOOP$2;
const useCallback$2 = React$2?.useCallback ?? ((f) => f);
const useRef$1 = React$2?.useRef ?? ((i) => ({ current: i }));
const createElement$2 = React$2?.createElement ?? (() => null);
const API_BASE$1 = "/agnes-studio/api";
/** 文本模型续写（走宿主代理的 OpenAI 兼容端点）。 */
async function continueText(prompt, model) {
	const data = await (await fetch(`${API_BASE$1}/proxy`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			endpoint: "/v1/chat/completions",
			params: {
				model,
				messages: [{
					role: "system",
					content: "你是影视分镜与剧本助手。用简洁中文续写或扩写，只输出正文，不要解释。"
				}, {
					role: "user",
					content: prompt
				}],
				max_tokens: 800
			}
		})
	})).json().catch(() => ({}));
	if (data?.error) throw new Error(data.error);
	const out = data?.choices?.[0]?.message?.content;
	if (!out) throw new Error("文本模型未返回内容");
	return String(out);
}
function CanvasPanel({ textModels, imageModels, videoModels }) {
	injectStyles();
	const [doc, setDoc] = useState$2(() => loadCanvas() ?? createStarterDoc());
	const [selected, setSelected] = useState$2("");
	const [busy, setBusy] = useState$2(false);
	const [error, setError] = useState$2("");
	const [linkFrom, setLinkFrom] = useState$2("");
	const [spaceDown, setSpaceDown] = useState$2(false);
	const wrapRef = useRef$1(null);
	const dragRef = useRef$1(null);
	const textModel = Object.keys(textModels)[0] || "agnes-3.0-flash";
	const imageModel = Object.keys(imageModels)[0] || "agnes-image-2.5-flash";
	const videoModel = Object.keys(videoModels)[0] || "agnes-video-2.5-flash";
	useEffect$2(() => {
		const t = setTimeout(() => saveCanvas(doc), 400);
		return () => clearTimeout(t);
	}, [doc]);
	useEffect$2(() => {
		const down = (e) => {
			if (e.code === "Space") setSpaceDown(true);
		};
		const up = (e) => {
			if (e.code === "Space") setSpaceDown(false);
		};
		window.addEventListener("keydown", down);
		window.addEventListener("keyup", up);
		return () => {
			window.removeEventListener("keydown", down);
			window.removeEventListener("keyup", up);
		};
	}, []);
	const patchNode = useCallback$2((id, patch) => {
		setDoc((d) => ({
			...d,
			nodes: d.nodes.map((n) => n.id === id ? {
				...n,
				...patch
			} : n)
		}));
	}, []);
	const onBackgroundDown = useCallback$2((e) => {
		if (e.target !== e.currentTarget && !spaceDown) return;
		if (e.button !== 0) return;
		dragRef.current = {
			kind: "pan",
			sx: e.clientX,
			sy: e.clientY,
			ox: doc.viewport.x,
			oy: doc.viewport.y
		};
		const move = (ev) => {
			const d = dragRef.current;
			if (!d) return;
			setDoc((cur) => ({
				...cur,
				viewport: {
					...cur.viewport,
					x: d.ox + (ev.clientX - d.sx),
					y: d.oy + (ev.clientY - d.sy)
				}
			}));
		};
		const up = () => {
			dragRef.current = null;
			window.removeEventListener("mousemove", move);
			window.removeEventListener("mouseup", up);
		};
		window.addEventListener("mousemove", move);
		window.addEventListener("mouseup", up);
	}, [doc.viewport, spaceDown]);
	const onWheel = useCallback$2((e) => {
		const rect = wrapRef.current?.getBoundingClientRect?.();
		if (!rect) return;
		const factor = e.deltaY < 0 ? 1.1 : 1 / 1.1;
		setDoc((cur) => {
			const scale = Math.min(2.5, Math.max(.3, cur.viewport.scale * factor));
			const k = scale / cur.viewport.scale;
			const cx = e.clientX - rect.left;
			const cy = e.clientY - rect.top;
			return {
				...cur,
				viewport: {
					scale,
					x: cx - k * (cx - cur.viewport.x),
					y: cy - k * (cy - cur.viewport.y)
				}
			};
		});
	}, []);
	const zoomBy = useCallback$2((factor) => {
		setDoc((cur) => ({
			...cur,
			viewport: {
				...cur.viewport,
				scale: Math.min(2.5, Math.max(.3, cur.viewport.scale * factor))
			}
		}));
	}, []);
	const resetView = useCallback$2(() => {
		setDoc((cur) => ({
			...cur,
			viewport: {
				x: 0,
				y: 0,
				scale: 1
			}
		}));
	}, []);
	const onNodeDown = useCallback$2((e, node) => {
		if (e.button !== 0) return;
		const tag = String(e.target?.tagName ?? "").toLowerCase();
		if (tag === "textarea" || tag === "input" || tag === "button" || tag === "select" || tag === "a") return;
		if (e.target?.dataset?.port !== void 0) return;
		e.stopPropagation();
		setSelected(node.id);
		const scale = doc.viewport.scale;
		dragRef.current = {
			kind: "node",
			id: node.id,
			sx: e.clientX,
			sy: e.clientY,
			ox: node.x,
			oy: node.y,
			scale
		};
		const move = (ev) => {
			const d = dragRef.current;
			if (!d || d.kind !== "node") return;
			const nx = d.ox + (ev.clientX - d.sx) / d.scale;
			const ny = d.oy + (ev.clientY - d.sy) / d.scale;
			setDoc((cur) => ({
				...cur,
				nodes: cur.nodes.map((n) => n.id === d.id ? {
					...n,
					x: Math.round(nx),
					y: Math.round(ny)
				} : n)
			}));
		};
		const up = () => {
			dragRef.current = null;
			window.removeEventListener("mousemove", move);
			window.removeEventListener("mouseup", up);
		};
		window.addEventListener("mousemove", move);
		window.addEventListener("mouseup", up);
	}, [doc.viewport.scale]);
	const startLink = useCallback$2((e, node) => {
		e.stopPropagation();
		setLinkFrom(node.id);
	}, []);
	const finishLink = useCallback$2((e, target) => {
		e.stopPropagation();
		if (!linkFrom || linkFrom === target.id) {
			setLinkFrom("");
			return;
		}
		setDoc((cur) => {
			if (cur.edges.some((x) => x.from === linkFrom && x.to === target.id)) return cur;
			return {
				...cur,
				edges: [...cur.edges, {
					id: "e" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
					from: linkFrom,
					to: target.id
				}]
			};
		});
		setLinkFrom("");
	}, [linkFrom]);
	const removeEdge = useCallback$2((id) => {
		setDoc((cur) => ({
			...cur,
			edges: cur.edges.filter((e) => e.id !== id)
		}));
	}, []);
	const addNode = useCallback$2((kind) => {
		setDoc((cur) => {
			const n = createNode(kind, 80 + cur.nodes.length * 26, 120 + cur.nodes.length * 22);
			return {
				...cur,
				nodes: [...cur.nodes, n]
			};
		});
	}, []);
	const removeNode = useCallback$2((id) => {
		setDoc((cur) => ({
			...cur,
			nodes: cur.nodes.filter((n) => n.id !== id),
			edges: cur.edges.filter((e) => e.from !== id && e.to !== id)
		}));
		setSelected("");
	}, []);
	const generate = useCallback$2(async (node) => {
		if (busy) return;
		const prompt = (node.text || "").trim();
		if (!prompt) {
			setError("请先填写提示词");
			return;
		}
		setBusy(true);
		setError("");
		patchNode(node.id, {
			status: "running",
			error: void 0
		});
		try {
			if (node.kind === "text") {
				const out = await continueText(prompt, textModel);
				patchNode(node.id, {
					status: "done",
					url: void 0,
					prompt,
					text: prompt + "\n\n" + out
				});
			} else if (node.kind === "image") {
				const refs = inputsOf(doc, node.id).filter((n) => n.kind === "image" && n.url).map((n) => n.url);
				const r = await generateImage({
					prompt,
					model: imageModel,
					images: refs.length ? refs : void 0
				});
				patchNode(node.id, {
					status: "done",
					url: r.url,
					prompt
				});
			} else {
				const refs = inputsOf(doc, node.id).filter((n) => n.kind === "image" && n.url).map((n) => n.url);
				const req = {
					prompt,
					model: videoModel,
					mode: refs.length ? "reference" : "text",
					seconds: "5",
					size: "720P"
				};
				if (refs.length) req.images = refs;
				const { videoId, taskId } = await generateVideo(req);
				const key = videoId || taskId;
				if (!key) throw new Error("视频接口未返回任务 ID");
				const deadline = Date.now() + 9e5;
				let url = "";
				while (Date.now() < deadline) {
					await new Promise((r) => setTimeout(r, 8e3));
					const st = await pollVideoStatus(key);
					if (st.status === "completed" && st.url) {
						url = st.url;
						break;
					}
					if (st.status === "failed") throw new Error(st.error || "视频生成失败");
				}
				if (!url) throw new Error("视频生成超时");
				patchNode(node.id, {
					status: "done",
					url,
					prompt
				});
			}
		} catch (e) {
			patchNode(node.id, {
				status: "error",
				error: e?.message || "生成失败"
			});
			setError(e?.message || "生成失败");
		} finally {
			setBusy(false);
		}
	}, [
		busy,
		doc,
		textModel,
		imageModel,
		videoModel,
		patchNode
	]);
	const resetDoc = useCallback$2(() => {
		clearCanvas();
		setDoc(createStarterDoc());
		setSelected("");
	}, []);
	const { nodes, edges, viewport } = doc;
	const sel = nodes.find((n) => n.id === selected);
	const renderNode = (node) => {
		const size = NODE_SIZE[node.kind];
		const meta = KIND_META[node.kind];
		const active = selected === node.id;
		return createElement$2("div", {
			key: node.id,
			className: `agc-node agc-node-${node.kind}${active ? " active" : ""}`,
			style: {
				left: node.x,
				top: node.y,
				width: size.w,
				minHeight: size.h,
				...linkFrom && linkFrom !== node.id ? { boxShadow: "0 0 0 2px var(--ag-accent-2)" } : {}
			},
			onMouseDown: (e) => onNodeDown(e, node),
			onClick: () => setSelected(node.id)
		}, createElement$2("div", { className: "agc-node-head" }, createElement$2("span", { className: "agc-node-icon" }, meta.icon), createElement$2("input", {
			className: "agc-node-title",
			value: node.title,
			onChange: (e) => patchNode(node.id, { title: e.target.value }),
			placeholder: meta.name
		}), createElement$2("button", {
			className: "agc-node-x",
			title: "删除节点",
			onClick: (e) => {
				e.stopPropagation();
				removeNode(node.id);
			}
		}, "✕")), createElement$2("div", { className: "agc-node-body" }, node.kind === "text" ? createElement$2("textarea", {
			className: "agc-node-text",
			value: node.text,
			placeholder: meta.hint,
			onChange: (e) => patchNode(node.id, { text: e.target.value }),
			onMouseDown: (e) => e.stopPropagation()
		}) : createElement$2("div", { className: "agc-node-media" }, node.url ? node.kind === "image" ? createElement$2("img", {
			src: node.url,
			alt: node.title,
			className: "agc-media"
		}) : createElement$2("video", {
			src: node.url,
			controls: true,
			className: "agc-media"
		}) : createElement$2("div", { className: "agc-node-empty" }, node.status === "running" ? createElement$2("span", null, "⏳ 生成中…") : createElement$2("span", null, meta.hint)), node.kind !== "text" ? createElement$2("textarea", {
			className: "agc-node-prompt",
			value: node.text,
			placeholder: "提示词…",
			onChange: (e) => patchNode(node.id, { text: e.target.value }),
			onMouseDown: (e) => e.stopPropagation()
		}) : null), node.status === "error" && node.error ? createElement$2("div", { className: "agc-node-err" }, node.error.slice(0, 120)) : null), createElement$2("div", { className: "agc-node-foot" }, createElement$2("button", {
			className: "agnes-btn agnes-btn-primary agnes-btn-sm",
			disabled: busy || node.status === "running",
			onClick: (e) => {
				e.stopPropagation();
				generate(node);
			}
		}, node.status === "running" ? "生成中…" : node.kind === "text" ? "✨ AI 续写" : node.kind === "image" ? "✨ 生成图" : "🎬 生成视频")), createElement$2("div", {
			className: "agc-port agc-port-in",
			title: "输入：连线过来的图片会作为参考",
			"data-port": "in",
			onMouseUp: (e) => finishLink(e, node)
		}), createElement$2("div", {
			className: "agc-port agc-port-out",
			title: "输出：拖到别的节点输入口连线",
			"data-port": "out",
			onMouseDown: (e) => startLink(e, node)
		}));
	};
	const renderEdges = () => {
		const w = NODE_SIZE;
		const paths = edges.map((edge) => {
			const a = nodes.find((n) => n.id === edge.from);
			const b = nodes.find((n) => n.id === edge.to);
			if (!a || !b) return null;
			const x1 = a.x + w[a.kind].w;
			const y1 = a.y + 42;
			const x2 = b.x;
			const y2 = b.y + 42;
			const dx = Math.max(40, Math.abs(x2 - x1) * .5);
			const d = `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;
			return createElement$2("path", {
				key: edge.id,
				d,
				className: "agc-edge",
				onClick: () => removeEdge(edge.id)
			});
		});
		return createElement$2("svg", { className: "agc-edges" }, ...paths.filter(Boolean));
	};
	return createElement$2("div", { className: "agnes-canvas" }, createElement$2("div", { className: "agc-toolbar" }, createElement$2("div", { className: "agc-tools-left" }, createElement$2("button", {
		className: "agnes-btn agnes-btn-secondary agnes-btn-sm",
		onClick: () => addNode("text")
	}, "＋ 文本"), createElement$2("button", {
		className: "agnes-btn agnes-btn-secondary agnes-btn-sm",
		onClick: () => addNode("image")
	}, "＋ 图片"), createElement$2("button", {
		className: "agnes-btn agnes-btn-secondary agnes-btn-sm",
		onClick: () => addNode("video")
	}, "＋ 视频"), createElement$2("span", { className: "agc-sep" }), createElement$2("button", {
		className: "agnes-btn agnes-btn-ghost agnes-btn-sm",
		onClick: () => zoomBy(1 / 1.15)
	}, "－"), createElement$2("span", { className: "agc-zoom" }, `${Math.round(viewport.scale * 100)}%`), createElement$2("button", {
		className: "agnes-btn agnes-btn-ghost agnes-btn-sm",
		onClick: () => zoomBy(1.15)
	}, "＋"), createElement$2("button", {
		className: "agnes-btn agnes-btn-ghost agnes-btn-sm",
		onClick: resetView
	}, "重置视图"), createElement$2("span", { className: "agc-sep" }), createElement$2("button", {
		className: "agnes-btn agnes-btn-ghost agnes-btn-sm",
		onClick: resetDoc
	}, "清空画布")), createElement$2("div", { className: "agc-tips" }, linkFrom ? "连线中：点目标节点的左侧圆点完成连接" : "拖空白平移 · 滚轮缩放 · 右圆点拖到左圆点连线 · 点连线删除")), error ? createElement$2("div", {
		className: "agnes-error",
		style: { margin: "0 14px" }
	}, error) : null, createElement$2("div", {
		className: `agc-viewport${spaceDown ? " grabbing" : ""}`,
		ref: wrapRef,
		onMouseDown: onBackgroundDown,
		onWheel,
		onClick: (e) => {
			if (e.target === e.currentTarget) setSelected("");
		}
	}, createElement$2("div", {
		className: "agc-world",
		style: {
			transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.scale})`,
			transformOrigin: "0 0"
		}
	}, renderEdges(), ...nodes.map(renderNode))), createElement$2("div", { className: "agc-status" }, `${nodes.length} 个节点 · ${edges.length} 条连线`, sel ? ` · 选中：${KIND_META[sel.kind].icon} ${sel.title || KIND_META[sel.kind].name}` : "", " · 已自动保存"));
}
//#endregion
//#region src/client/cover-panel.tsx
function shellRequire$1(id) {
	try {
		return typeof __require === "function" ? __require(id) : void 0;
	} catch {
		return;
	}
}
const React$1 = shellRequire$1("react") ?? globalThis.React ?? null;
const NOOP$1 = () => {};
const useState$1 = React$1?.useState ?? ((i) => [i, NOOP$1]);
const useEffect$1 = React$1?.useEffect ?? NOOP$1;
const useCallback$1 = React$1?.useCallback ?? ((f) => f);
const createElement$1 = React$1?.createElement ?? (() => null);
const API_BASE = "/agnes-studio/api";
/**
* Fallback style list. The host route is the source of truth, but carrying a
* local copy means the panel still renders a complete UI when the host half is
* an older build (routes appear only after a DSH restart).
*/
const FALLBACK_STYLES = [
	{
		key: "guofeng",
		name: "国风水墨"
	},
	{
		key: "dushi",
		name: "都市写实"
	},
	{
		key: "xianxia",
		name: "仙侠玄幻"
	},
	{
		key: "xuanyi",
		name: "悬疑暗调"
	},
	{
		key: "yanqing",
		name: "言情清新"
	},
	{
		key: "kehuan",
		name: "科幻未来"
	}
];
async function fetchStyles() {
	try {
		const d = await (await fetch(`${API_BASE}/cover/styles`)).json().catch(() => ({}));
		if (Array.isArray(d?.styles) && d.styles.length > 0) return d.styles;
	} catch {}
	return FALLBACK_STYLES;
}
/** 把 File 读成 base64（去掉 data URL 前缀）。 */
function fileToBase64(file) {
	return new Promise((resolve, reject) => {
		const fr = new FileReader();
		fr.onload = () => {
			const s = String(fr.result);
			const i = s.indexOf(",");
			resolve(i >= 0 ? s.slice(i + 1) : s);
		};
		fr.onerror = () => reject(/* @__PURE__ */ new Error("读取文件失败"));
		fr.readAsDataURL(file);
	});
}
function CoverPanel({ imageModels }) {
	injectStyles();
	const [styles, setStyles] = useState$1(FALLBACK_STYLES);
	const [styleKey, setStyleKey] = useState$1("guofeng");
	const [title, setTitle] = useState$1("");
	const [author, setAuthor] = useState$1("");
	const [summary, setSummary] = useState$1("");
	const [extra, setExtra] = useState$1("");
	const [refImage, setRefImage] = useState$1("");
	const [model, setModel] = useState$1(() => Object.keys(imageModels)[0] || "agnes-image-2.5-flash");
	const [loading, setLoading] = useState$1(false);
	const [parsing, setParsing] = useState$1(false);
	const [error, setError] = useState$1("");
	const [notice, setNotice] = useState$1("");
	const [covers, setCovers] = useState$1([]);
	useEffect$1(() => {
		fetchStyles().then((s) => {
			if (s.length) setStyles(s);
		}).catch(() => {});
		try {
			const raw = localStorage?.getItem("agnes-covers");
			if (raw) setCovers(JSON.parse(raw));
		} catch {}
	}, []);
	const persist = useCallback$1((list) => {
		setCovers(list);
		try {
			localStorage?.setItem("agnes-covers", JSON.stringify(list.slice(0, 12)));
		} catch {}
	}, []);
	const handleUpload = useCallback$1(async (file) => {
		if (!file) return;
		setParsing(true);
		setError("");
		setNotice("");
		try {
			const b64 = await fileToBase64(file);
			const r = await fetch(`${API_BASE}/cover/parse`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					filename: file.name,
					content: b64
				})
			});
			const d = await r.json().catch(() => ({}));
			if (!r.ok || d?.error) throw new Error(d?.error || `解析失败（HTTP ${r.status}）`);
			setTitle(d.meta.title || "");
			setAuthor(d.meta.author || "");
			setSummary(d.meta.summary || "");
			setNotice(`已解析 ${file.name}（${d.meta.charCount} 字）`);
		} catch (e) {
			setError(e?.message || "解析失败");
		} finally {
			setParsing(false);
		}
	}, []);
	const handleGenerate = useCallback$1(async () => {
		if (!title.trim()) {
			setError("请先填写或上传解析出书名");
			return;
		}
		setLoading(true);
		setError("");
		setNotice("");
		try {
			const payload = {
				title: title.trim(),
				author: author.trim(),
				summary: summary.trim(),
				style: styleKey,
				extra: extra.trim(),
				model
			};
			const r = await fetch(`${API_BASE}/cover/build`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload)
			});
			const d = await r.json().catch(() => ({}));
			if (!r.ok || d?.error) throw new Error(d?.error || `构建提示词失败（HTTP ${r.status}）`);
			const entry = {
				url: (await generateImage({
					prompt: d.prompt,
					model,
					ratio: "3:4",
					size: "1024x1024",
					images: refImage ? [refImage] : void 0
				})).url,
				prompt: d.prompt,
				style: styleKey,
				at: Date.now()
			};
			persist([entry, ...covers].slice(0, 12));
			setNotice("封面已生成");
		} catch (e) {
			setError(e?.message || "生成失败");
		} finally {
			setLoading(false);
		}
	}, [
		title,
		author,
		summary,
		styleKey,
		extra,
		model,
		refImage,
		covers,
		persist
	]);
	const inputStyle = {
		width: "100%",
		boxSizing: "border-box",
		padding: "8px 10px",
		borderRadius: "8px",
		border: "1px solid var(--ag-line, rgba(255,255,255,0.12))",
		background: "var(--ag-surface-1, #1d1d33)",
		color: "var(--ag-text, #ececf5)",
		fontSize: "13px",
		fontFamily: "inherit"
	};
	return createElement$1("div", { className: "agnes-cover" }, createElement$1("div", { className: "agnes-cover-grid" }, createElement$1("div", { className: "agcv-form" }, createElement$1("div", { className: "agcv-card" }, createElement$1("div", { className: "agcv-card-title" }, "📄 导入小说（可选）"), createElement$1("label", { className: "agnes-btn agnes-btn-ghost agnes-btn-full" }, parsing ? "解析中…" : "选择 TXT / DOCX 文件", createElement$1("input", {
		type: "file",
		accept: ".txt,.docx,text/plain",
		style: { display: "none" },
		onChange: (e) => handleUpload(e.target.files?.[0])
	})), createElement$1("div", { className: "agcv-hint" }, "自动提取书名、作者、简介；.docx 无需另存为 txt")), createElement$1("div", { className: "agcv-card" }, createElement$1("div", { className: "agcv-card-title" }, "📝 作品信息"), createElement$1("div", { className: "agcv-field" }, createElement$1("label", null, "书名"), createElement$1("input", {
		style: inputStyle,
		value: title,
		onChange: (e) => setTitle(e.target.value),
		placeholder: "例如：重生之都市医仙"
	})), createElement$1("div", { className: "agcv-field" }, createElement$1("label", null, "作者"), createElement$1("input", {
		style: inputStyle,
		value: author,
		onChange: (e) => setAuthor(e.target.value),
		placeholder: "例如：云中客"
	})), createElement$1("div", { className: "agcv-field" }, createElement$1("label", null, "作品简介"), createElement$1("textarea", {
		style: {
			...inputStyle,
			minHeight: "72px",
			resize: "vertical"
		},
		value: summary,
		onChange: (e) => setSummary(e.target.value),
		placeholder: "剧情梗概，影响封面画面"
	}))), createElement$1("div", { className: "agcv-card" }, createElement$1("div", { className: "agcv-card-title" }, "🎨 风格与模型"), createElement$1("div", { className: "agcv-styles" }, ...styles.map((s) => createElement$1("button", {
		key: s.key,
		className: `agcv-style${styleKey === s.key ? " active" : ""}`,
		onClick: () => setStyleKey(s.key)
	}, s.name))), createElement$1("div", { className: "agcv-field" }, createElement$1("label", null, "补充描述（可选）"), createElement$1("input", {
		style: inputStyle,
		value: extra,
		onChange: (e) => setExtra(e.target.value),
		placeholder: "例如：主色调偏暗红，逆光剪影"
	})), createElement$1("div", { className: "agcv-field" }, createElement$1("label", null, "图像模型"), createElement$1("select", {
		style: inputStyle,
		value: model,
		onChange: (e) => setModel(e.target.value)
	}, ...Object.keys(imageModels).map((k) => createElement$1("option", {
		key: k,
		value: k
	}, k)))), createElement$1("div", { className: "agcv-field" }, createElement$1("label", null, "参考图（可选，图生图）"), createElement$1("label", { className: "agnes-btn agnes-btn-ghost agnes-btn-sm" }, refImage ? "✅ 已选参考图" : "选择参考图", createElement$1("input", {
		type: "file",
		accept: "image/*",
		style: { display: "none" },
		onChange: async (e) => {
			const f = e.target.files?.[0];
			if (!f) return;
			const b64 = await fileToBase64(f);
			setRefImage(`data:${f.type || "image/png"};base64,${b64}`);
		}
	})))), error ? createElement$1("div", { className: "agnes-error" }, error) : null, notice ? createElement$1("div", { className: "agcv-notice" }, notice) : null, createElement$1("button", {
		className: "agnes-btn agnes-btn-primary agnes-btn-full",
		disabled: loading,
		onClick: handleGenerate,
		style: { height: "40px" }
	}, loading ? "⏳ 生成中…" : "🎨 生成封面（3:4）")), createElement$1("div", { className: "agcv-preview" }, covers[0] ? createElement$1("div", { className: "agcv-main" }, createElement$1("img", {
		src: covers[0].url,
		alt: "封面",
		className: "agcv-cover-img"
	}), createElement$1("a", {
		className: "agnes-btn agnes-btn-secondary agnes-btn-sm",
		href: covers[0].url,
		target: "_blank",
		rel: "noreferrer",
		download: `${title || "封面"}.png`,
		style: {
			textDecoration: "none",
			marginTop: "12px"
		}
	}, "⬇️ 下载封面")) : createElement$1("div", { className: "agcv-empty" }, createElement$1("div", { className: "agcv-poster-slot" }, createElement$1("div", { className: "agnes-empty-icon" }, "📕"), createElement$1("div", { className: "agcv-poster-title" }, "封面预览位"), createElement$1("div", { className: "agcv-hint" }, "3 : 4 标准比例")), createElement$1("div", { className: "agcv-slot-row" }, ...[
		1,
		2,
		3
	].map((i) => createElement$1("div", {
		key: i,
		className: "agcv-slot-mini"
	}, createElement$1("span", null, String(i))))), createElement$1("div", {
		className: "agcv-empty-title",
		style: { marginTop: "14px" }
	}, "还没有封面"), createElement$1("div", { className: "agcv-hint" }, "上传小说或直接填写书名，点下方按钮生成")), covers.length > 1 ? createElement$1("div", { style: {
		width: "100%",
		marginTop: "14px"
	} }, createElement$1("div", {
		className: "agcv-card-title",
		style: { fontSize: "12px" }
	}, "历史封面"), createElement$1("div", { className: "agcv-history" }, ...covers.slice(1).map((c, i) => createElement$1("img", {
		key: c.at + "-" + i,
		src: c.url,
		alt: "历史封面",
		className: "agcv-thumb",
		onClick: () => persist([c, ...covers.filter((x) => x.at !== c.at)])
	})))) : null)));
}
//#endregion
//#region src/client/panel.tsx
/** Resolve one shell-provided module without ever throwing at load time. */
function shellRequire(id) {
	try {
		if (typeof __require === "function") {
			const mod = __require(id);
			if (mod !== void 0 && mod !== null) return mod;
		}
	} catch {}
}
/**
* React runtime, resolved once. A missing runtime must NOT throw here: this
* module is evaluated while client.js loads, and a load-time throw would take
* the whole browser half down instead of just this panel.
*/
const React = shellRequire("react") ?? globalThis.React ?? null;
/** No-op stand-ins keep the module loadable; the panel reports the real error. */
const NOOP = () => {};
const useState = React?.useState ?? ((initial) => [typeof initial === "function" ? initial() : initial, NOOP]);
const useEffect = React?.useEffect ?? NOOP;
const useCallback = React?.useCallback ?? ((fn) => fn);
const useRef = React?.useRef ?? ((initial) => ({ current: initial }));
/** Build a detached element when React is unusable (keeps render paths safe). */
const createElement = React?.createElement ?? (() => null);
/**
* Mount a component into a container with React 18's createRoot.
* @returns a disposer unmounting the tree.
*/
function mountReact(container, Component, props) {
	if (React === null) throw new Error("[dsh-agnes-studio] React runtime is not available from the shell");
	const ReactDOM = shellRequire("react-dom/client");
	if (ReactDOM?.createRoot === void 0) throw new Error("[dsh-agnes-studio] react-dom/client is not available from the shell");
	const root = ReactDOM.createRoot(container);
	root.render(createElement(Component, props));
	return () => {
		root.unmount();
	};
}
/** Tab type. */
/** Left-rail modules: id, icon, and the label shown under the icon. */
const MODULES = [
	{
		id: "image",
		icon: "🎨",
		name: "生图"
	},
	{
		id: "video",
		icon: "🎬",
		name: "生视频"
	},
	{
		id: "storyboard",
		icon: "📖",
		name: "短剧"
	},
	{
		id: "anchor",
		icon: "🎙",
		name: "口播"
	},
	{
		id: "canvas",
		icon: "🕸",
		name: "画布"
	},
	{
		id: "cover",
		icon: "📕",
		name: "封面"
	},
	{
		id: "expert",
		icon: "✨",
		name: "提示词"
	}
];
const THEME_KEY = "agnes-theme";
function resolveTheme(choice) {
	if (choice === "light" || choice === "dark") return choice;
	try {
		const saved = localStorage?.getItem(THEME_KEY);
		if (saved === "light" || saved === "dark") return saved;
	} catch {}
	return "light";
}
/** Image aspect ratios. */
const IMAGE_RATIOS = [
	"1:1",
	"3:4",
	"4:3",
	"16:9",
	"9:16",
	"2:3",
	"3:2",
	"21:9"
];
/** Video durations in seconds. */
const VIDEO_DURATIONS = [
	"4",
	"5",
	"6",
	"7",
	"8",
	"10",
	"12"
];
/** Video resolutions. */
const VIDEO_RESOLUTIONS = ["720P", "1080P"];
/** Video aspect ratios. */
const VIDEO_ASPECT_RATIOS = [
	"16:9",
	"9:16",
	"1:1",
	"4:3",
	"3:4"
];
/** Product name shown everywhere in the UI. */
const PRODUCT_NAME = "泡泡猫的影视工具";
/** Where a first-time user signs up and creates an API Key. */
const AGNES_PLATFORM_URL = "https://platform.agnes-ai.cn";
/** Public quickstart (account → API key → first request). */
const AGNES_DOCS_URL = "https://agnes-ai.cn/zh-Hans/docs/quickstart";
/** True when an error message means "no/invalid API key" rather than a build error. */
function looksLikeKeyProblem(message) {
	return message.includes("未配置") || message.includes("agnes-api-key") || /\b401\b/.test(message) || /invalid api key|api key is invalid|unauthorized|no api key/i.test(message);
}
/** Main panel component. */
function StudioPanel({ onClose }) {
	injectStyles();
	const [tab, setTab] = useState("image");
	const [theme, setTheme] = useState(() => resolveTheme("auto"));
	const [prompt, setPrompt] = useState("");
	const [loading, setLoading] = useState(false);
	const [loadingText, setLoadingText] = useState("");
	const [progress, setProgress] = useState(0);
	const [result, setResult] = useState(null);
	const [error, setError] = useState("");
	const [refImages, setRefImages] = useState([]);
	const [selectedImageModel, setSelectedImageModel] = useState("agnes-image-2.5-flash");
	const [selectedVideoModel, setSelectedVideoModel] = useState("agnes-video-2.5-flash");
	const [availableImageSizes, setAvailableImageSizes] = useState([
		"1024x1024",
		"1024x768",
		"768x1024",
		"1280x720",
		"720x1280"
	]);
	const [imageSize, setImageSize] = useState("1024x1024");
	const [imageRatio, setImageRatio] = useState("16:9");
	const [videoDuration, setVideoDuration] = useState("5");
	const [imageModels, setImageModels] = useState(IMAGE_MODEL_OPTIONS);
	const [videoModels, setVideoModels] = useState(VIDEO_MODEL_OPTIONS);
	const [vendorStatus, setVendorStatus] = useState({});
	const [customModels, setCustomModels] = useState([]);
	const [showAddModelModal, setShowAddModelModal] = useState(false);
	const [newModel, setNewModel] = useState({
		id: "",
		name: "",
		type: "image",
		base_url: "",
		api_key: ""
	});
	const [videoMode, setVideoMode] = useState("text");
	const [firstFrame, setFirstFrame] = useState("");
	const [lastFrame, setLastFrame] = useState("");
	const [videoResolution, setVideoResolution] = useState("720P");
	const [videoAspectRatio, setVideoAspectRatio] = useState("16:9");
	const [project, setProject] = useState(null);
	const [selectedScene, setSelectedScene] = useState(0);
	const [projects, setProjects] = useState([]);
	const [dragging, setDragging] = useState(false);
	const dragOrigin = useRef(null);
	const panelRef = useRef(null);
	const [keyStatus, setKeyStatus] = useState("unknown");
	const [guideOpen, setGuideOpen] = useState(false);
	const [checkingKey, setCheckingKey] = useState(false);
	useEffect(() => {
		setProjects(listProjects());
		setCustomModels(getCustomModels());
		fetchModels().then((models) => {
			const custom = getCustomModels();
			const imgModels = { ...models.image };
			const vidModels = { ...models.video };
			custom.forEach((m) => {
				if (m.type === "image") imgModels[m.id] = `${m.name} (自定义)`;
				if (m.type === "video") vidModels[m.id] = `${m.name} (自定义)`;
			});
			setImageModels(imgModels);
			setVideoModels(vidModels);
		}).catch(() => {});
		fetchKeyStatus().then((status) => {
			if (status.vendors) setVendorStatus(status.vendors);
		}).catch(() => {});
	}, []);
	const checkKey = useCallback(async (openWhenMissing) => {
		setCheckingKey(true);
		const status = await fetchKeyStatus();
		setKeyStatus(status.configured ? "ready" : "missing");
		if (!status.configured && openWhenMissing) setGuideOpen(true);
		if (status.vendors) setVendorStatus(status.vendors);
		setCheckingKey(false);
	}, []);
	useEffect(() => {
		checkKey(true);
	}, [checkKey]);
	const onDragStart = useCallback((e) => {
		const panel = panelRef.current;
		if (panel === null) return;
		const target = e.target;
		if (target !== null && typeof target.closest === "function" && target.closest("button, input, select, textarea, a, [data-no-drag]") !== null) return;
		const rect = panel.getBoundingClientRect();
		panel.style.left = rect.left + "px";
		panel.style.top = rect.top + "px";
		panel.style.transform = "none";
		dragOrigin.current = {
			x: e.clientX,
			y: e.clientY,
			left: rect.left,
			top: rect.top
		};
		setDragging(true);
	}, []);
	useEffect(() => {
		if (!dragging) return;
		const onMove = (e) => {
			const panel = panelRef.current;
			const origin = dragOrigin.current;
			if (panel === null || origin === null) return;
			const width = panel.offsetWidth;
			const lower = 200 - width;
			const upper = Math.max(window.innerWidth - width, lower);
			const nextLeft = Math.min(Math.max(origin.left + e.clientX - origin.x, lower), upper);
			const nextTop = Math.min(Math.max(origin.top + e.clientY - origin.y, 0), Math.max(0, window.innerHeight - 60));
			panel.style.left = nextLeft + "px";
			panel.style.top = nextTop + "px";
		};
		const onUp = () => {
			dragOrigin.current = null;
			setDragging(false);
		};
		document.addEventListener("mousemove", onMove);
		document.addEventListener("mouseup", onUp);
		return () => {
			document.removeEventListener("mousemove", onMove);
			document.removeEventListener("mouseup", onUp);
		};
	}, [dragging]);
	const handleGenerateImage = useCallback(async () => {
		if (!prompt.trim() || loading) return;
		setLoading(true);
		setLoadingText("✨ 生成图片中...");
		setProgress(0);
		setError("");
		setResult(null);
		try {
			const progressTimer = setInterval(() => {
				setProgress((p) => Math.min(p + 8, 90));
			}, 500);
			const resp = await generateImage({
				prompt: prompt.trim(),
				model: selectedImageModel,
				size: imageSize,
				ratio: imageRatio,
				images: refImages.length > 0 ? refImages : void 0
			});
			clearInterval(progressTimer);
			setProgress(100);
			setResult({
				type: "image",
				url: resp.url
			});
			if (project) {
				const scenes = [...project.scenes];
				if (scenes[selectedScene]) {
					scenes[selectedScene] = {
						...scenes[selectedScene],
						imageUrl: resp.url,
						status: "done"
					};
					const updated = {
						...project,
						scenes,
						updatedAt: Date.now()
					};
					setProject(updated);
					saveProject(updated);
					setProjects(listProjects());
				}
			}
		} catch (e) {
			const message = e instanceof Error ? e.message : "图片生成失败";
			setError(message);
			if (looksLikeKeyProblem(message)) {
				setKeyStatus("missing");
				setGuideOpen(true);
			}
		} finally {
			setLoading(false);
			setLoadingText("");
		}
	}, [
		prompt,
		selectedImageModel,
		imageSize,
		imageRatio,
		refImages,
		loading,
		project,
		selectedScene
	]);
	const handleGenerateVideo = useCallback(async () => {
		if (!prompt.trim() || loading) return;
		setLoading(true);
		setLoadingText("🎬 提交视频任务...");
		setProgress(0);
		setError("");
		setResult(null);
		try {
			const resp = await generateVideo({
				prompt: prompt.trim(),
				model: selectedVideoModel,
				mode: videoMode,
				seconds: videoDuration,
				size: videoResolution,
				aspectRatio: videoAspectRatio,
				firstFrame: videoMode === "keyframe" ? firstFrame : void 0,
				lastFrame: videoMode === "keyframe" ? lastFrame : void 0,
				images: videoMode === "reference" ? refImages : void 0
			});
			setLoadingText("🔄 视频生成中...");
			let attempts = 0;
			const maxAttempts = 180;
			while (attempts < maxAttempts) {
				await new Promise((r) => setTimeout(r, 3e3));
				attempts++;
				const status = await pollVideoStatus(resp.videoId);
				setProgress(Math.min(status.progress || 0, 99));
				if (status.status === "completed" && status.url) {
					setProgress(100);
					setResult({
						type: "video",
						url: status.url
					});
					if (project) {
						const scenes = [...project.scenes];
						if (scenes[selectedScene]) {
							scenes[selectedScene] = {
								...scenes[selectedScene],
								videoUrl: status.url,
								status: "done"
							};
							const updated = {
								...project,
								scenes,
								updatedAt: Date.now()
							};
							setProject(updated);
							saveProject(updated);
							setProjects(listProjects());
						}
					}
					break;
				}
				if (status.status === "failed") throw new Error(status.error || "视频生成失败");
				setLoadingText(`🔄 视频生成中... ${status.progress || 0}%`);
			}
			if (attempts >= maxAttempts) throw new Error("视频生成超时");
		} catch (e) {
			const message = e instanceof Error ? e.message : "视频生成失败";
			setError(message);
			if (looksLikeKeyProblem(message)) {
				setKeyStatus("missing");
				setGuideOpen(true);
			}
		} finally {
			setLoading(false);
			setLoadingText("");
		}
	}, [
		prompt,
		selectedVideoModel,
		videoMode,
		videoDuration,
		videoResolution,
		videoAspectRatio,
		firstFrame,
		lastFrame,
		refImages,
		loading,
		project,
		selectedScene
	]);
	useCallback(() => {
		const input = document.createElement("input");
		input.type = "file";
		input.accept = ".txt,.md,.markdown,.json";
		input.onchange = (e) => {
			const file = e.target.files?.[0];
			if (!file) return;
			if (!isSupportedScript(file.name)) {
				setError("不支持的文件格式。支持 .txt, .md, .json");
				return;
			}
			const reader = new FileReader();
			reader.onload = (ev) => {
				const content = ev.target?.result;
				if (!content) return;
				try {
					const scenes = parseScript(file.name, content);
					if (scenes.length === 0) {
						setError("未能从文件中解析出任何场景");
						return;
					}
					const newProject = {
						id: generateProjectId(),
						name: file.name.replace(/\.[^.]+$/, ""),
						scenes,
						createdAt: Date.now(),
						updatedAt: Date.now()
					};
					setProject(newProject);
					setSelectedScene(0);
					saveProject(newProject);
					setProjects(listProjects());
					setTab("storyboard");
					setError("");
				} catch (e) {
					setError(e instanceof Error ? e.message : "解析失败");
				}
			};
			reader.readAsText(file);
		};
		input.click();
	}, []);
	useCallback(() => {
		const newProject = {
			id: generateProjectId(),
			name: "新项目",
			scenes: [{
				name: "场景 1",
				prompt: "",
				status: "pending"
			}],
			createdAt: Date.now(),
			updatedAt: Date.now()
		};
		setProject(newProject);
		setSelectedScene(0);
		saveProject(newProject);
		setProjects(listProjects());
		setTab("storyboard");
	}, []);
	useCallback((proj) => {
		setProject(proj);
		setSelectedScene(0);
		setTab("storyboard");
	}, []);
	useCallback((id) => {
		deleteProject(id);
		setProjects(listProjects());
		if (project?.id === id) setProject(null);
	}, [project]);
	useCallback(() => {
		if (!project) return;
		const scenes = [...project.scenes, {
			name: `场景 ${project.scenes.length + 1}`,
			prompt: "",
			status: "pending"
		}];
		const updated = {
			...project,
			scenes,
			updatedAt: Date.now()
		};
		setProject(updated);
		saveProject(updated);
	}, [project]);
	const handleUpdateScenePrompt = useCallback((idx, newPrompt) => {
		if (!project) return;
		const scenes = [...project.scenes];
		scenes[idx] = {
			...scenes[idx],
			prompt: newPrompt
		};
		const updated = {
			...project,
			scenes,
			updatedAt: Date.now()
		};
		setProject(updated);
	}, [project]);
	const handleSaveScenePrompt = useCallback(() => {
		if (project) saveProject(project);
	}, [project]);
	const handleGenerateSceneImage = useCallback(async (idx) => {
		if (!project || loading) return;
		const scene = project.scenes[idx];
		if (!scene.prompt.trim()) return;
		setLoading(true);
		setLoadingText(`✨ 生成场景 ${idx + 1} 图片...`);
		setProgress(0);
		setError("");
		try {
			const progressTimer = setInterval(() => {
				setProgress((p) => Math.min(p + 8, 90));
			}, 500);
			const resp = await generateImage({
				prompt: scene.prompt,
				model: selectedImageModel,
				size: imageSize,
				ratio: imageRatio
			});
			clearInterval(progressTimer);
			const scenes = [...project.scenes];
			scenes[idx] = {
				...scenes[idx],
				imageUrl: resp.url,
				status: "done"
			};
			const updated = {
				...project,
				scenes,
				updatedAt: Date.now()
			};
			setProject(updated);
			saveProject(updated);
			setProjects(listProjects());
			setProgress(100);
		} catch (e) {
			const scenes = [...project.scenes];
			scenes[idx] = {
				...scenes[idx],
				status: "error",
				error: e instanceof Error ? e.message : "失败"
			};
			const updated = {
				...project,
				scenes,
				updatedAt: Date.now()
			};
			setProject(updated);
			saveProject(updated);
			setError(e instanceof Error ? e.message : "生成失败");
		} finally {
			setLoading(false);
			setLoadingText("");
		}
	}, [
		project,
		loading,
		selectedImageModel,
		imageSize,
		imageRatio
	]);
	const handleBatchGenerate = useCallback(async () => {
		if (!project || loading) return;
		setLoading(true);
		setProgress(0);
		setError("");
		const total = project.scenes.filter((s) => s.prompt.trim()).length;
		let done = 0;
		for (let i = 0; i < project.scenes.length; i++) {
			const scene = project.scenes[i];
			if (!scene.prompt.trim()) continue;
			setLoadingText(`✨ 生成场景 ${i + 1}/${project.scenes.length}...`);
			setProgress(Math.round(done / total * 100));
			try {
				const resp = await generateImage({
					prompt: scene.prompt,
					model: selectedImageModel,
					size: imageSize,
					ratio: imageRatio
				});
				const scenes = [...project.scenes];
				scenes[i] = {
					...scenes[i],
					imageUrl: resp.url,
					status: "done"
				};
				const updated = {
					...project,
					scenes,
					updatedAt: Date.now()
				};
				setProject(updated);
				saveProject(updated);
				setProjects(listProjects());
			} catch {
				const scenes = [...project.scenes];
				scenes[i] = {
					...scenes[i],
					status: "error",
					error: "生成失败"
				};
				const updated = {
					...project,
					scenes,
					updatedAt: Date.now()
				};
				setProject(updated);
				saveProject(updated);
			}
			done++;
			setProgress(Math.round(done / total * 100));
		}
		setLoading(false);
		setLoadingText("");
		setProgress(100);
	}, [
		project,
		loading,
		selectedImageModel,
		imageSize,
		imageRatio
	]);
	const handleDownload = useCallback((url, filename) => {
		const a = document.createElement("a");
		a.href = url;
		a.download = filename;
		a.target = "_blank";
		a.rel = "noopener";
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
	}, []);
	const handleUploadFrame = useCallback((target) => {
		const input = document.createElement("input");
		input.type = "file";
		input.accept = "image/*";
		input.onchange = (e) => {
			const file = e.target.files?.[0];
			if (!file) return;
			const reader = new FileReader();
			reader.onload = (ev) => {
				const url = ev.target?.result;
				if (url) {
					if (target === "first") setFirstFrame(url);
					else setLastFrame(url);
				}
			};
			reader.readAsDataURL(file);
		};
		input.click();
	}, []);
	/** Get the display name for the currently selected model. */
	const getModelDisplayName = (modelId, models) => {
		return models[modelId] || modelId;
	};
	/** Determine if the current model tag should show "free". */
	const isFreeModel = (modelId) => {
		return modelId.startsWith("agnes-");
	};
	const renderModelSelector = () => {
		const currentModels = tab === "image" ? imageModels : videoModels;
		const currentModelId = tab === "image" ? selectedImageModel : selectedVideoModel;
		const currentModelName = getModelDisplayName(currentModelId, currentModels);
		const free = isFreeModel(currentModelId);
		return createElement("div", { className: "agnes-section" }, createElement("div", { className: "agnes-section-title" }, tab === "image" ? "🎨 图片模型" : "🎬 视频模型"), createElement("select", {
			className: "agnes-model-select",
			value: currentModelId,
			onChange: (e) => {
				const val = e.target.value;
				if (tab === "image") {
					setSelectedImageModel(val);
					const sizes = getImageSizeOptions(val);
					setAvailableImageSizes(sizes);
					if (sizes.length > 0 && !sizes.includes(imageSize)) setImageSize(sizes[0]);
				} else setSelectedVideoModel(val);
			}
		}, ...Object.entries(currentModels).map(([id, name]) => createElement("option", {
			key: id,
			value: id
		}, name))), createElement("div", { className: "agnes-model-info" }, free ? createElement("span", { className: "agnes-model-tag agnes-model-tag-free" }, "🎉 免费") : createElement("span", { className: "agnes-model-tag" }, "💎 付费"), createElement("span", { style: {
			marginLeft: "6px",
			fontSize: "12px",
			color: "var(--ag-text-3, #6e80a3)"
		} }, currentModelName)));
	};
	const renderSizeSelector = () => {
		if (tab !== "image") return null;
		return createElement("div", { className: "agnes-section" }, createElement("div", { className: "agnes-section-title" }, "📐 尺寸"), createElement("div", { className: "agnes-size-grid" }, ...availableImageSizes.map((size) => createElement("button", {
			key: size,
			className: `agnes-size-btn ${imageSize === size ? "active" : ""}`,
			onClick: () => setImageSize(size)
		}, size.replace("x", "×")))), createElement("div", {
			className: "agnes-section-title",
			style: { marginTop: "12px" }
		}, "📏 宽高比"), createElement("div", { className: "agnes-ratio-grid" }, ...IMAGE_RATIOS.map((ratio) => createElement("button", {
			key: ratio,
			className: `agnes-ratio-btn ${imageRatio === ratio ? "active" : ""}`,
			onClick: () => setImageRatio(ratio)
		}, ratio))));
	};
	const renderVideoModeSelector = () => {
		if (tab !== "video") return null;
		return createElement("div", { className: "agnes-section" }, createElement("div", { className: "agnes-section-title" }, "🎥 生成模式"), createElement("div", { className: "agnes-mode-grid" }, ...[
			"text",
			"keyframe",
			"reference"
		].map((mode) => createElement("button", {
			key: mode,
			className: `agnes-mode-btn ${videoMode === mode ? "active" : ""}`,
			onClick: () => setVideoMode(mode)
		}, mode === "text" ? "📝 文生视频" : mode === "keyframe" ? "🖼 首尾帧" : "📷 参考图"))), videoMode === "keyframe" ? createElement("div", { className: "agnes-frame-upload" }, createElement("div", {
			className: `agnes-frame-item ${firstFrame ? "has-image" : ""}`,
			onClick: () => handleUploadFrame("first")
		}, firstFrame ? createElement("img", {
			src: firstFrame,
			alt: "首帧",
			style: {
				width: "100%",
				height: "100%",
				objectFit: "cover"
			}
		}) : "🖼 首帧"), createElement("div", {
			className: `agnes-frame-item ${lastFrame ? "has-image" : ""}`,
			onClick: () => handleUploadFrame("last")
		}, lastFrame ? createElement("img", {
			src: lastFrame,
			alt: "尾帧",
			style: {
				width: "100%",
				height: "100%",
				objectFit: "cover"
			}
		}) : "🖼 尾帧（可选）")) : null, createElement("div", {
			className: "agnes-input-row",
			style: { marginTop: "8px" }
		}, createElement("div", null, createElement("div", { style: {
			fontSize: "11px",
			color: "var(--ag-text-3, #6e80a3)",
			marginBottom: "4px"
		} }, "分辨率"), createElement("select", {
			className: "agnes-select",
			value: videoResolution,
			onChange: (e) => setVideoResolution(e.target.value)
		}, ...VIDEO_RESOLUTIONS.map((r) => createElement("option", {
			key: r,
			value: r
		}, r)))), createElement("div", null, createElement("div", { style: {
			fontSize: "11px",
			color: "var(--ag-text-3, #6e80a3)",
			marginBottom: "4px"
		} }, "宽高比"), createElement("select", {
			className: "agnes-select",
			value: videoAspectRatio,
			onChange: (e) => setVideoAspectRatio(e.target.value)
		}, ...VIDEO_ASPECT_RATIOS.map((r) => createElement("option", {
			key: r,
			value: r
		}, r))))), createElement("div", { style: { marginTop: "8px" } }, createElement("div", { style: {
			fontSize: "11px",
			color: "var(--ag-text-3, #6e80a3)",
			marginBottom: "4px"
		} }, "时长 (秒)"), createElement("select", {
			className: "agnes-select",
			value: videoDuration,
			onChange: (e) => setVideoDuration(e.target.value)
		}, ...VIDEO_DURATIONS.map((d) => createElement("option", {
			key: d,
			value: d
		}, `${d} 秒`)))));
	};
	const renderSettings = () => createElement("div", { className: "agnes-settings" }, createElement("div", { className: "agnes-setting-group" }, createElement("div", { className: "agnes-setting-group-title" }, "🔑 API Key 状态"), ...Object.entries(vendorStatus).map(([vendor, status]) => createElement("div", {
		key: vendor,
		className: "agnes-setting-row"
	}, createElement("span", { className: "agnes-setting-label" }, vendor.charAt(0).toUpperCase() + vendor.slice(1)), createElement("span", { className: status.configured ? "agnes-badge agnes-badge-free" : "agnes-badge agnes-badge-error" }, status.configured ? "✅ 已配置" : "❌ 未配置"))), Object.keys(vendorStatus).length === 0 ? createElement("div", { className: "agnes-setting-row" }, createElement("span", {
		className: "agnes-setting-label",
		style: { color: "var(--ag-text-3, #6e80a3)" }
	}, "暂无厂商信息，点击下方按钮检测")) : null, createElement("button", {
		className: "agnes-btn agnes-btn-sm agnes-btn-ghost agnes-btn-full",
		style: { marginTop: "8px" },
		disabled: checkingKey,
		onClick: () => {
			checkKey(false);
		}
	}, checkingKey ? "⏳ 检测中…" : "🔄 重新检测 Key")), createElement("div", { className: "agnes-setting-group" }, createElement("div", { className: "agnes-setting-group-title" }, "📖 配置指南"), createElement("div", { style: {
		fontSize: "12px",
		color: "var(--ag-text-3, #6e80a3)",
		lineHeight: "1.6",
		marginBottom: "8px"
	} }, "如需使用付费模型，请在对应厂商平台获取 API Key 并配置到 DSH。"), createElement("div", { style: {
		display: "flex",
		gap: "6px",
		flexWrap: "wrap"
	} }, createElement("a", {
		className: "agnes-btn agnes-btn-sm agnes-btn-secondary",
		href: AGNES_PLATFORM_URL,
		target: "_blank",
		rel: "noopener noreferrer"
	}, "🌐 Agnes 平台"), createElement("a", {
		className: "agnes-btn agnes-btn-sm agnes-btn-secondary",
		href: AGNES_DOCS_URL,
		target: "_blank",
		rel: "noopener noreferrer"
	}, "📖 文档")), createElement("div", { style: { marginTop: "8px" } }, createElement("button", {
		className: "agnes-btn agnes-btn-sm agnes-btn-ghost agnes-btn-full",
		onClick: () => setGuideOpen(!guideOpen)
	}, guideOpen ? "收起 Key 指引" : "🔑 首次使用？如何获取 / 配置 Key"))), createElement("div", { className: "agnes-setting-group" }, createElement("div", { className: "agnes-setting-group-title" }, "🔧 自定义模型"), createElement("button", {
		className: "agnes-btn agnes-btn-sm agnes-btn-primary",
		style: { marginBottom: "8px" },
		onClick: () => setShowAddModelModal(true)
	}, "+ 添加模型"), customModels.length > 0 ? createElement("div", { className: "agnes-custom-model-list" }, ...customModels.map((model) => createElement("div", {
		key: model.id,
		className: "agnes-custom-model-item"
	}, createElement("div", { className: "agnes-custom-model-info" }, createElement("div", { className: "agnes-custom-model-name" }, model.name), createElement("div", { className: "agnes-custom-model-meta" }, `${model.type} · ${model.base_url}`)), createElement("button", {
		className: "agnes-btn agnes-btn-sm agnes-btn-ghost",
		onClick: () => {
			removeCustomModel(model.id);
			setCustomModels(getCustomModels());
			const updated = getCustomModels();
			const imgModels = { ...IMAGE_MODEL_OPTIONS };
			const vidModels = { ...VIDEO_MODEL_OPTIONS };
			updated.forEach((m) => {
				if (m.type === "image") imgModels[m.id] = `${m.name} (自定义)`;
				if (m.type === "video") vidModels[m.id] = `${m.name} (自定义)`;
			});
			setImageModels(imgModels);
			setVideoModels(vidModels);
		}
	}, "🗑")))) : createElement("div", { style: {
		fontSize: "12px",
		color: "var(--ag-text-3, #6e80a3)",
		padding: "8px 0"
	} }, "暂无自定义模型。添加后可在模型选择器中使用。")), createElement("div", { className: "agnes-setting-group" }, createElement("div", { className: "agnes-setting-group-title" }, "ℹ️ 关于"), createElement("div", { style: {
		fontSize: "12px",
		color: "var(--ag-text-3, #6e80a3)",
		lineHeight: "1.6"
	} }, createElement("div", null, `版本: ${PRODUCT_NAME}`), createElement("div", null, "🎨 支持多家厂商图片/视频生成"), createElement("div", null, "📐 每个模型有独立的尺寸白名单"), createElement("div", null, "🔧 可添加自定义 API 兼容模型"), createElement("div", { style: { marginTop: "6px" } }, keyStatus === "ready" ? "🔑 Agnes API Key：已配置" : keyStatus === "missing" ? "🔑 Agnes API Key：未配置" : "🔑 Agnes API Key：未检测"))));
	const renderAddModelModal = () => showAddModelModal ? createElement("div", {
		className: "agnes-modal-backdrop",
		onClick: () => setShowAddModelModal(false)
	}, createElement("div", {
		className: "agnes-modal",
		onClick: (e) => e.stopPropagation()
	}, createElement("div", { className: "agnes-modal-header" }, createElement("span", null, "添加自定义模型"), createElement("button", {
		className: "agnes-btn agnes-btn-sm agnes-btn-ghost",
		onClick: () => setShowAddModelModal(false)
	}, "✕")), createElement("div", { className: "agnes-modal-body" }, createElement("div", { className: "agnes-form-group" }, createElement("label", { className: "agnes-form-label" }, "模型 ID"), createElement("input", {
		className: "agnes-form-input",
		value: newModel.id,
		onChange: (e) => setNewModel({
			...newModel,
			id: e.target.value
		}),
		placeholder: "如 custom-image-1"
	})), createElement("div", { className: "agnes-form-group" }, createElement("label", { className: "agnes-form-label" }, "显示名称"), createElement("input", {
		className: "agnes-form-input",
		value: newModel.name,
		onChange: (e) => setNewModel({
			...newModel,
			name: e.target.value
		}),
		placeholder: "如 My Custom Image Model"
	})), createElement("div", { className: "agnes-form-group" }, createElement("label", { className: "agnes-form-label" }, "类型"), createElement("select", {
		className: "agnes-form-select",
		value: newModel.type,
		onChange: (e) => setNewModel({
			...newModel,
			type: e.target.value
		})
	}, createElement("option", { value: "image" }, "图片"), createElement("option", { value: "video" }, "视频"), createElement("option", { value: "text" }, "文本"))), createElement("div", { className: "agnes-form-group" }, createElement("label", { className: "agnes-form-label" }, "API Base URL"), createElement("input", {
		className: "agnes-form-input",
		value: newModel.base_url,
		onChange: (e) => setNewModel({
			...newModel,
			base_url: e.target.value
		}),
		placeholder: "https://api.example.com/v1"
	})), createElement("div", { className: "agnes-form-group" }, createElement("label", { className: "agnes-form-label" }, "API Key（可选）"), createElement("input", {
		className: "agnes-form-input",
		value: newModel.api_key,
		onChange: (e) => setNewModel({
			...newModel,
			api_key: e.target.value
		}),
		placeholder: "sk-...",
		type: "password"
	}))), createElement("div", { className: "agnes-modal-footer" }, createElement("button", {
		className: "agnes-btn agnes-btn-secondary",
		onClick: () => setShowAddModelModal(false)
	}, "取消"), createElement("button", {
		className: "agnes-btn agnes-btn-primary",
		onClick: () => {
			if (newModel.id && newModel.name && newModel.base_url) {
				addCustomModel(newModel);
				const updated = getCustomModels();
				setCustomModels(updated);
				const imgModels = { ...IMAGE_MODEL_OPTIONS };
				const vidModels = { ...VIDEO_MODEL_OPTIONS };
				updated.forEach((m) => {
					if (m.type === "image") imgModels[m.id] = `${m.name} (自定义)`;
					if (m.type === "video") vidModels[m.id] = `${m.name} (自定义)`;
				});
				setImageModels(imgModels);
				setVideoModels(vidModels);
				setShowAddModelModal(false);
				setNewModel({
					id: "",
					name: "",
					type: "image",
					base_url: "",
					api_key: ""
				});
			}
		}
	}, "添加")))) : null;
	return createElement("div", {
		ref: panelRef,
		className: `agnes-root agnes-mod-${tab}`,
		"data-dsh-agnes-studio": "",
		"data-ag-tab": tab,
		"data-ag-theme": theme
	}, createElement("div", {
		className: "agnes-titlebar",
		onMouseDown: onDragStart
	}, createElement("span", { className: "agnes-titlebar-icon" }, "🎬"), createElement("span", { className: "agnes-titlebar-text" }, PRODUCT_NAME), createElement("span", { className: "agnes-titlebar-module" }, MODULES.find((m) => m.id === tab)?.name ?? (tab === "settings" ? "设置" : "")), createElement("div", { className: "agnes-titlebar-spacer" }), createElement("button", {
		className: "agnes-theme-toggle",
		onClick: () => {
			const next = theme === "dark" ? "light" : "dark";
			setTheme(next);
			try {
				localStorage?.setItem(THEME_KEY, next);
			} catch {}
		},
		title: theme === "dark" ? "切换到亮色主题" : "切换到暗色主题"
	}, theme === "dark" ? "☀️ 亮色" : "🌙 暗色"), createElement("span", { className: "agnes-badge agnes-badge-free" }, "🎉 生图/视频免费"), createElement("button", {
		className: "agnes-titlebar-btn",
		onClick: onClose,
		title: "关闭",
		"aria-label": "关闭"
	}, "✕")), guideOpen ? createElement("div", { className: "agnes-keyguide" }, createElement("div", { className: "agnes-keyguide-head" }, createElement("span", { className: "agnes-keyguide-title" }, "🔑 首次使用：需要一个 Agnes API Key"), createElement("button", {
		className: "agnes-keyguide-close",
		onClick: () => setGuideOpen(false),
		title: "收起"
	}, "收起")), createElement("div", { className: "agnes-keyguide-steps" }, createElement("div", { className: "agnes-keyguide-step" }, createElement("span", { className: "agnes-keyguide-num" }, "1"), createElement("span", null, "注册 / 登录 Agnes AI 平台（免费注册）")), createElement("div", { className: "agnes-keyguide-step" }, createElement("span", { className: "agnes-keyguide-num" }, "2"), createElement("span", null, "在控制台「API Keys」里创建密钥，复制 sk- 开头的那一串")), createElement("div", { className: "agnes-keyguide-step" }, createElement("span", { className: "agnes-keyguide-num" }, "3"), createElement("span", null, "把它填到本机（任选一种）：DSH 设置 → 模型 → 凭据，新增 ", createElement("code", null, "agnes-api-key"), "；或在本机 ", createElement("code", null, "/dsh/.env"), " 写一行 ", createElement("code", null, "AGNES_API_KEY=sk-...")))), createElement("div", { className: "agnes-keyguide-actions" }, createElement("a", {
		className: "agnes-btn agnes-btn-sm agnes-btn-primary",
		href: AGNES_PLATFORM_URL,
		target: "_blank",
		rel: "noopener noreferrer"
	}, "🌐 去注册 / 登录"), createElement("a", {
		className: "agnes-btn agnes-btn-sm agnes-btn-secondary",
		href: AGNES_DOCS_URL,
		target: "_blank",
		rel: "noopener noreferrer"
	}, "📖 官方文档"), createElement("button", {
		className: "agnes-btn agnes-btn-sm agnes-btn-ghost",
		disabled: checkingKey,
		onClick: () => {
			checkKey(false);
		}
	}, checkingKey ? "⏳ 检测中…" : "🔄 重新检测"), keyStatus === "ready" ? createElement("span", { className: "agnes-keyguide-ok" }, "✅ Key 已配置") : null), createElement("div", { className: "agnes-keyguide-note" }, "Key 只保存在本机、只由后端进程用于调用 API，网页里不会出现；免费额度以平台规则为准。")) : null, createElement("div", { className: "agnes-shell" }, createElement("nav", { className: "agnes-rail" }, ...MODULES.map((m) => createElement("button", {
		key: m.id,
		className: `agnes-rail-item${tab === m.id ? " active" : ""}`,
		"data-tab": m.id,
		onClick: () => setTab(m.id),
		title: m.name
	}, createElement("span", { className: "agnes-rail-icon" }, m.icon), createElement("span", { className: "agnes-rail-label" }, m.name))), createElement("div", { className: "agnes-rail-spacer" }), createElement("button", {
		className: `agnes-rail-item${tab === "settings" ? " active" : ""}`,
		"data-tab": "settings",
		onClick: () => setTab("settings"),
		title: "设置"
	}, createElement("span", { className: "agnes-rail-icon" }, "⚙"), createElement("span", { className: "agnes-rail-label" }, "设置"))), createElement("div", { className: "agnes-main" }, tab === "canvas" ? createElement("div", { style: {
		flex: 1,
		minHeight: 0,
		display: "flex",
		flexDirection: "column"
	} }, createElement(CanvasPanel, {
		textModels: TEXT_MODEL_OPTIONS,
		imageModels,
		videoModels
	})) : tab === "expert" || tab === "settings" || tab === "anchor" || tab === "cover" ? createElement("div", { style: {
		flex: 1,
		overflow: "auto",
		display: "flex",
		flexDirection: "column"
	} }, tab === "expert" ? createElement(PromptExpertPanel, { textModels: TEXT_MODEL_OPTIONS }) : tab === "anchor" ? createElement(AnchorPanel) : tab === "cover" ? createElement(CoverPanel, { imageModels }) : renderSettings()) : createElement("div", { className: "agnes-body" }, createElement("div", { className: "agnes-center" }, createElement("div", {
		className: "agnes-preview-area",
		style: tab === "storyboard" ? {
			alignItems: "stretch",
			justifyContent: "stretch"
		} : void 0
	}, tab === "storyboard" ? createElement(DramaPanel, {
		textModels: TEXT_MODEL_OPTIONS,
		imageModels,
		videoModels
	}) : loading ? createElement("div", { className: "agnes-skeleton" }, createElement("div", { style: { fontSize: "24px" } }, "✨"), createElement("div", { className: "agnes-skeleton-text" }, loadingText), createElement("div", { className: "agnes-progress-bar" }, createElement("div", {
		className: "agnes-progress-fill",
		style: { width: `${progress}%` }
	}))) : result ? createElement("div", { style: {
		textAlign: "center",
		width: "100%",
		height: "100%",
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
		justifyContent: "center"
	} }, result.type === "image" ? createElement("img", {
		src: result.url,
		alt: "生成结果",
		className: "agnes-preview-img",
		style: {
			maxWidth: "100%",
			maxHeight: "calc(100% - 40px)"
		}
	}) : createElement("video", {
		src: result.url,
		controls: true,
		className: "agnes-preview-video",
		style: {
			maxWidth: "100%",
			maxHeight: "calc(100% - 40px)"
		}
	}), createElement("div", { style: {
		marginTop: "8px",
		display: "flex",
		gap: "8px"
	} }, createElement("button", {
		className: "agnes-btn agnes-btn-sm agnes-btn-secondary",
		onClick: () => handleDownload(result.url, `agnes-${Date.now()}.${result.type === "image" ? "png" : "mp4"}`)
	}, "📥 下载"), createElement("button", {
		className: "agnes-btn agnes-btn-sm agnes-btn-ghost",
		onClick: () => {
			navigator.clipboard?.writeText(result.url);
		}
	}, "📋 复制链接"))) : createElement("div", { className: "agnes-empty" }, createElement("div", { className: "agnes-empty-icon" }, tab === "image" ? "🎨" : tab === "video" ? "🎬" : "📖"), createElement("div", { className: "agnes-empty-title" }, tab === "image" ? "AI 生图" : tab === "video" ? "AI 生视频" : "🎬 短剧工作台"), createElement("div", { className: "agnes-empty-desc" }, tab === "image" ? "在右侧输入提示词，选择模型和尺寸，点击生成" : tab === "video" ? "在右侧输入提示词，选择模型和模式，描述想要的视频内容" : "在「短剧」标签页中开始创作"))), createElement("div", { className: "agnes-action-bar" }, createElement("button", {
		className: "agnes-btn agnes-btn-primary",
		disabled: loading || !prompt.trim() || tab === "settings",
		onClick: tab === "image" ? handleGenerateImage : handleGenerateVideo
	}, loading ? `⏳ ${loadingText}` : tab === "image" ? "✨ 生成图片" : "🎬 生成视频"), (tab === "image" || tab === "video") && project ? createElement("button", {
		className: "agnes-btn agnes-btn-secondary",
		disabled: loading,
		onClick: handleBatchGenerate
	}, "▶ 批量生成所有场景") : null, result ? createElement("button", {
		className: "agnes-btn agnes-btn-ghost",
		onClick: () => setResult(null)
	}, "✕ 清除预览") : null, error ? createElement("div", { style: {
		marginLeft: "auto",
		fontSize: "12px",
		color: "#ff6b6b"
	} }, error) : null)), tab === "image" || tab === "video" ? createElement("div", { className: "agnes-right" }, createElement("div", { className: "agnes-right-scroll" }, tab === "image" || tab === "video" ? createElement("div", { className: "agnes-section" }, createElement("div", { className: "agnes-section-title" }, "📝 提示词"), createElement("textarea", {
		className: "agnes-textarea",
		value: prompt,
		onChange: (e) => setPrompt(e.target.value),
		placeholder: tab === "image" ? "描述你想要生成的图片...\n\n例如：赛博朋克城市街道，雨夜，霓虹灯倒映在湿漉漉的地面，低角度镜头，电影级光照" : "描述你想要生成的视频...\n\n例如：雨后的未来城市街道，霓虹灯倒映在地面，一辆银色跑车缓慢驶过，电影级运镜",
		rows: 5
	})) : null, (tab === "image" || tab === "video") && project && project.scenes[selectedScene] ? createElement("div", { className: "agnes-section" }, createElement("div", { className: "agnes-section-title" }, `🎞 场景 ${selectedScene + 1} 提示词`), createElement("textarea", {
		className: "agnes-textarea",
		value: project.scenes[selectedScene].prompt,
		onChange: (e) => handleUpdateScenePrompt(selectedScene, e.target.value),
		onBlur: handleSaveScenePrompt,
		placeholder: `为场景 ${selectedScene + 1} 编写提示词...`,
		rows: 4
	}), createElement("div", { style: {
		marginTop: "8px",
		display: "flex",
		gap: "6px"
	} }, createElement("button", {
		className: "agnes-btn agnes-btn-sm agnes-btn-primary",
		disabled: loading || !project.scenes[selectedScene].prompt.trim(),
		onClick: () => handleGenerateSceneImage(selectedScene),
		style: { flex: 1 }
	}, "✨ 生成此场景"), createElement("button", {
		className: "agnes-btn agnes-btn-sm agnes-btn-ghost",
		onClick: () => {
			if (selectedScene > 0) setSelectedScene(selectedScene - 1);
		},
		disabled: selectedScene === 0
	}, "←"), createElement("button", {
		className: "agnes-btn agnes-btn-sm agnes-btn-ghost",
		onClick: () => {
			if (project && selectedScene < project.scenes.length - 1) setSelectedScene(selectedScene + 1);
		},
		disabled: !project || selectedScene >= project.scenes.length - 1
	}, "→"))) : null, tab === "image" || tab === "video" ? renderModelSelector() : null, tab === "image" ? renderSizeSelector() : null, tab === "video" ? renderVideoModeSelector() : null, tab === "image" || tab === "video" ? createElement("div", { className: "agnes-divider" }) : null, tab === "image" || tab === "video" ? createElement("div", { className: "agnes-section" }, createElement("div", { className: "agnes-section-title" }, "🖼 参考图片"), createElement("div", { className: "agnes-ref-chips" }, ...refImages.map((url, i) => createElement("div", {
		key: i,
		className: "agnes-ref-chip"
	}, createElement("img", {
		src: url,
		alt: `参考 ${i + 1}`
	}), createElement("button", {
		className: "agnes-ref-chip-remove",
		onClick: () => setRefImages(refImages.filter((_, j) => j !== i))
	}, "×"))), createElement("button", {
		className: "agnes-ref-chip-add",
		onClick: () => {
			const input = document.createElement("input");
			input.type = "file";
			input.accept = "image/*";
			input.onchange = (e) => {
				const file = e.target.files?.[0];
				if (!file) return;
				const reader = new FileReader();
				reader.onload = (ev) => {
					const url = ev.target?.result;
					if (url) setRefImages([...refImages, url]);
				};
				reader.readAsDataURL(file);
			};
			input.click();
		}
	}, "+")), refImages.length > 0 ? createElement("div", { style: {
		marginTop: "8px",
		fontSize: "11px",
		color: "var(--ag-text-3, #6e80a3)"
	} }, `${refImages.length} 张参考图`) : createElement("div", { style: {
		marginTop: "8px",
		fontSize: "11px",
		color: "var(--ag-text-3, #6e80a3)"
	} }, tab === "video" && videoMode === "keyframe" ? "纯文生视频模式（或上传首尾帧）" : "无参考图（纯文生模式）")) : null, tab === "image" || tab === "video" ? createElement("div", { className: "agnes-divider" }) : null, tab === "image" || tab === "video" ? createElement("div", { className: "agnes-section" }, createElement("div", { className: "agnes-section-title" }, "ℹ️ 模型信息"), createElement("div", { style: {
		fontSize: "12px",
		color: "var(--ag-text-3, #6e80a3)",
		lineHeight: "1.6"
	} }, createElement("div", null, `🎨 当前图片模型: ${getModelDisplayName(selectedImageModel, imageModels)}`), createElement("div", null, `🎬 当前视频模型: ${getModelDisplayName(selectedVideoModel, videoModels)}`), createElement("div", null, `📐 图片尺寸: ${imageSize} · 比例: ${imageRatio}`), tab === "video" ? createElement("div", null, `🎥 视频模式: ${videoMode === "text" ? "文生视频" : videoMode === "keyframe" ? "首尾帧" : "参考图"} · ${videoResolution} · ${videoAspectRatio}`) : null, createElement("div", { style: { marginTop: "6px" } }, keyStatus === "ready" ? "🔑 API Key：已配置" : keyStatus === "missing" ? "🔑 API Key：未配置" : "🔑 API Key：未检测"))) : null)) : null))), createElement("div", { className: "agnes-statusbar" }, createElement("div", { className: "agnes-status-dot" }), createElement("span", null, keyStatus === "missing" ? "API 未连接（缺 Key）" : "API 已连接"), keyStatus === "missing" ? createElement("button", {
		className: "agnes-statusbar-link",
		onClick: () => setGuideOpen(true)
	}, "🔑 如何配置 Key") : null, project ? createElement("span", null, `📊 ${project.scenes.length} 个场景`) : null, result ? createElement("span", null, `✅ 已生成 ${result.type === "image" ? "图片" : "视频"}`) : null, tab === "image" || tab === "video" ? createElement("span", { style: {
		marginLeft: "auto",
		fontSize: "11px",
		color: "var(--ag-text-3, #6e80a3)"
	} }, tab === "image" ? `🎨 ${getModelDisplayName(selectedImageModel, imageModels).split("(")[0].trim()}` : `🎬 ${getModelDisplayName(selectedVideoModel, videoModels).split("(")[0].trim()}`) : null), renderAddModelModal());
}
//#endregion
//#region src/client/index.ts
/** Required services. */
const inject = ["slots"];
/**
* Mount the sidebar entry and the floating studio panel.
* @param ctx - client root context.
*/
function apply(ctx) {
	injectStyles();
	let panelVisible = false;
	let backdropEl = null;
	let panelEl = null;
	let unmountReact = null;
	/** Container the overlay lives in (created on first open). */
	function ensureContainer() {
		let container = document.querySelector("[data-dsh-agnes-studio-container]");
		if (container === null) {
			container = document.createElement("div");
			container.dataset.dshAgnesStudioContainer = "";
			container.style.cssText = "position:fixed;inset:0;z-index:9998;pointer-events:none;";
			document.body.appendChild(container);
		}
		return container;
	}
	/** Open the panel. */
	function showPanel() {
		if (panelVisible) return;
		panelVisible = true;
		const container = ensureContainer();
		container.style.pointerEvents = "auto";
		const sidebarWidth = document.querySelector("[data-pane=\"sidebar\"], [class*=\"sidebarCol\"]")?.getBoundingClientRect().width ?? 0;
		container.style.setProperty?.("--agnes-sidebar-w", Math.round(sidebarWidth) + "px");
		backdropEl = document.createElement("div");
		backdropEl.dataset.dshAgnesBackdrop = "";
		backdropEl.addEventListener("click", hidePanel);
		panelEl = document.createElement("div");
		panelEl.dataset.dshAgnesStudioFrame = "";
		container.append(backdropEl, panelEl);
		try {
			unmountReact = mountReact(panelEl, StudioPanel, { onClose: hidePanel });
		} catch (error) {
			console.error("[dsh-agnes-studio] panel render failed:", error);
			hidePanel();
			return;
		}
		syncEntryActive();
	}
	/** Close the panel (state is kept, only the DOM is removed). */
	function hidePanel() {
		if (!panelVisible) return;
		panelVisible = false;
		try {
			unmountReact?.();
		} catch {}
		unmountReact = null;
		backdropEl?.remove();
		backdropEl = null;
		panelEl?.remove();
		panelEl = null;
		const container = document.querySelector("[data-dsh-agnes-studio-container]");
		if (container !== null) container.style.pointerEvents = "none";
		syncEntryActive();
	}
	function togglePanel() {
		if (panelVisible) hidePanel();
		else showPanel();
	}
	const entry = document.createElement("button");
	entry.type = "button";
	entry.dataset.dshAgnesStudioEntry = "";
	entry.className = "agnes-entry";
	entry.setAttribute("aria-label", "泡泡猫的影视工具");
	entry.setAttribute("title", "泡泡猫的影视工具 — AI 生图 / 生视频 / 故事板");
	entry.innerHTML = "<span class=\"agnes-entry-icon\"><svg viewBox=\"0 0 16 16\" width=\"14\" height=\"14\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.3\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><rect x=\"1.5\" y=\"3\" width=\"13\" height=\"10\" rx=\"2.5\"/><path d=\"M4 8.5l2.5 2.5L12 5.5\"/></svg></span><span class=\"agnes-entry-label\">泡泡猫的影视工具</span>";
	const onEntryClick = (event) => {
		event.preventDefault();
		event.stopPropagation();
		togglePanel();
	};
	entry.addEventListener("click", onEntryClick);
	function sidebarRoot() {
		const column = document.querySelector("[data-pane=\"sidebar\"], [class*=\"sidebarCol\"]");
		if (column === null) return void 0;
		return column.querySelector("[class*=\"logoRow\"]")?.parentElement ?? column.firstElementChild;
	}
	function anchorRow(root) {
		const nested = root.querySelector("button[class*=\"newSession\"]");
		if (nested !== null) {
			const row = nested.closest("[class*=\"logoRow\"]");
			if (row !== null && row.parentElement === root) return row;
			return nested;
		}
		for (const child of root.children) if (child.tagName === "BUTTON") return child;
	}
	function placeEntry(root) {
		const anchor = anchorRow(root);
		if (anchor === void 0) return false;
		if (entry.parentElement !== root) root.insertBefore(entry, anchor.nextElementSibling);
		return true;
	}
	let rootEl;
	let placed = false;
	const rootObserver = new MutationObserver(() => {
		if (rootEl === void 0 || !rootEl.isConnected) {
			placed = false;
			tryPlace();
			return;
		}
		if (!rootEl.contains(entry)) placed = placeEntry(rootEl);
	});
	function tryPlace() {
		if (rootEl !== void 0 && !rootEl.isConnected) {
			rootObserver.disconnect();
			rootEl = void 0;
			placed = false;
		}
		if (placed) {
			if (document.body.contains(entry)) return;
			rootObserver.disconnect();
			rootEl = void 0;
			placed = false;
		}
		rootEl ??= sidebarRoot();
		if (rootEl === void 0) return;
		placed = placeEntry(rootEl);
		if (placed) rootObserver.observe(rootEl, {
			childList: true,
			subtree: true
		});
	}
	const waitObserver = new MutationObserver(() => {
		tryPlace();
	});
	waitObserver.observe(document.body, {
		childList: true,
		subtree: true
	});
	function syncEntryActive() {
		if (panelVisible) entry.dataset.active = "true";
		else delete entry.dataset.active;
	}
	const ACTIVATE_EVENT = "dsh-panel-activate";
	if (panelVisible) document.dispatchEvent(new CustomEvent(ACTIVATE_EVENT, { detail: "agnes-studio" }));
	const onOtherActivate = (event) => {
		if (event.detail !== "agnes-studio" && panelVisible) hidePanel();
	};
	document.addEventListener(ACTIVATE_EVENT, onOtherActivate);
	const onKeyDown = (event) => {
		if (event.key === "Escape" && panelVisible) hidePanel();
	};
	document.addEventListener("keydown", onKeyDown);
	tryPlace();
	ctx.effect(() => () => {
		waitObserver.disconnect();
		rootObserver.disconnect();
		document.removeEventListener(ACTIVATE_EVENT, onOtherActivate);
		document.removeEventListener("keydown", onKeyDown);
		entry.removeEventListener("click", onEntryClick);
		entry.remove();
		hidePanel();
		document.querySelector("[data-dsh-agnes-studio-container]")?.remove();
	}, "dsh-agnes-studio: ui mounts");
}
//#endregion
module.exports = { apply, inject };

//# sourceMappingURL=client.js.map
  return module.exports;
} });
