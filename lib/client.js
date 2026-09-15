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
  position: fixed;
  top: 50%;
  left: calc(50% + var(--agnes-sidebar-w, 0px) / 2);
  transform: translate(-50%, -50%);
  width: min(calc(100vw - var(--agnes-sidebar-w, 0px) - 32px), 1100px);
  height: min(88vh, 720px);
  background: var(--dsw-alias-bg-layer-1, #1a1a2e);
  border-radius: 16px;
  border: 1px solid var(--dsw-alias-border-l1, rgba(255,255,255,0.06));
  box-shadow: 0 24px 80px rgba(0,0,0,0.45), 0 0 0 1px rgba(108,92,231,0.08);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  z-index: 9999;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
  color: var(--dsw-alias-label-primary, #e8e8ef);
  animation: agnes-studio-enter 0.25s ease-out;
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
  color: var(--dsw-alias-label-primary, #e8e8ef);
}

.agnes-keyguide-close {
  border: none;
  background: transparent;
  color: var(--dsw-alias-label-secondary, #9a9ab0);
  font-size: 12px;
  cursor: pointer;
  padding: 2px 6px;
  border-radius: 6px;
}

.agnes-keyguide-close:hover {
  background: rgba(127,127,137,0.18);
  color: var(--dsw-alias-label-primary, #e6e6ef);
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
  color: var(--dsw-alias-label-secondary, #b9b9c9);
}

.agnes-keyguide-num {
  flex: 0 0 18px;
  width: 18px;
  height: 18px;
  margin-top: 1px;
  border-radius: 50%;
  background: var(--dsw-alias-brand-primary, #6c5ce7);
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
  color: var(--dsw-alias-label-secondary, #6c6c80);
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
  border-right: 1px solid var(--dsw-alias-border-l1, rgba(255,255,255,0.06));
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.agnes-left-header {
  padding: 12px;
  font-size: 12px;
  font-weight: 600;
  color: var(--dsw-alias-label-secondary, #6c6c80);
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
  color: var(--dsw-alias-label-secondary, #6c6c80);
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
  background: linear-gradient(90deg, var(--dsw-alias-bg-layer-2, #252538) 25%, rgba(108,92,231,0.08) 50%, var(--dsw-alias-bg-layer-2, #252538) 75%);
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
  color: var(--dsw-alias-label-secondary, #6c6c80);
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
  border-top: 1px solid var(--dsw-alias-border-l1, rgba(255,255,255,0.06));
  flex-wrap: wrap;
}

/* empty state */
.agnes-empty {
  text-align: center;
  padding: 40px 20px;
  color: var(--dsw-alias-label-secondary, #6c6c80);
}

.agnes-empty-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.agnes-empty-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--dsw-alias-label-primary, #e8e8ef);
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
  border-left: 1px solid var(--dsw-alias-border-l1, rgba(255,255,255,0.06));
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
  color: var(--dsw-alias-label-secondary, #6c6c80);
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
  border: 1px solid var(--dsw-alias-border-l1, rgba(255,255,255,0.1));
  background: var(--dsw-alias-bg-layer-2, #252538);
  color: var(--dsw-alias-label-primary, #e8e8ef);
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
  color: var(--dsw-alias-label-secondary, #6c6c80);
  opacity: 0.6;
}

/* select */
.agnes-select {
  width: 100%;
  height: 34px;
  padding: 0 10px;
  border-radius: 8px;
  border: 1px solid var(--dsw-alias-border-l1, rgba(255,255,255,0.1));
  background: var(--dsw-alias-bg-layer-2, #252538);
  color: var(--dsw-alias-label-primary, #e8e8ef);
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
  background: var(--dsw-alias-bg-layer-2, #252538);
  color: var(--dsw-alias-label-primary, #e8e8ef);
  border: 1px solid var(--dsw-alias-border-l1, rgba(255,255,255,0.1));
}

.agnes-btn-secondary:hover:not(:disabled) {
  background: var(--dsw-alias-bg-layer-3, #2e2e44);
  border-color: rgba(108,92,231,0.3);
}

.agnes-btn-ghost {
  background: transparent;
  color: var(--dsw-alias-label-secondary, #6c6c80);
}

.agnes-btn-ghost:hover:not(:disabled) {
  background: rgba(108,92,231,0.1);
  color: var(--dsw-alias-label-primary, #e8e8ef);
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
  background: var(--dsw-alias-bg-layer-2, #252538);
  margin-bottom: 12px;
}

.agnes-tab {
  flex: 1;
  height: 30px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--dsw-alias-label-secondary, #6c6c80);
  font-size: 12px;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.12s ease;
}

.agnes-tab.active {
  background: var(--dsw-alias-bg-layer-1, #1a1a2e);
  color: var(--dsw-alias-label-primary, #e8e8ef);
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
}

.agnes-tab:hover:not(.active) {
  color: var(--dsw-alias-label-primary, #e8e8ef);
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
  background: var(--dsw-alias-border-l1, rgba(255,255,255,0.06));
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
  border: 2px solid var(--dsw-alias-border-l1, rgba(255,255,255,0.1));
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
  color: var(--dsw-alias-label-secondary, #6c6c80);
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
  border-top: 1px solid var(--dsw-alias-border-l1, rgba(255,255,255,0.06));
  font-size: 11px;
  color: var(--dsw-alias-label-secondary, #6c6c80);
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
  background: var(--dsw-alias-bg-layer-2, #252538);
  border-radius: 10px;
  border: 1px solid var(--dsw-alias-border-l1, rgba(255,255,255,0.06));
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
  color: var(--dsw-alias-label-secondary, #6c6c80);
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
  color: var(--dsw-alias-label-primary, #e8e8ef);
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
  background: var(--dsw-alias-bg-layer-2, #252538);
  margin-bottom: 6px;
  font-size: 13px;
}

.agnes-setting-label {
  color: var(--dsw-alias-label-secondary, #9a9ab0);
}

.agnes-setting-value {
  color: var(--dsw-alias-label-primary, #e8e8ef);
  font-weight: 500;
}

/* --- model selector ---------------------------------------------------- */
.agnes-model-select {
  width: 100%;
  height: 36px;
  padding: 0 12px;
  border-radius: 8px;
  border: 1px solid var(--dsw-alias-border-l1, rgba(255,255,255,0.1));
  background: var(--dsw-alias-bg-layer-2, #252538);
  color: var(--dsw-alias-label-primary, #e8e8ef);
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
  color: var(--dsw-alias-label-secondary, #9a9ab0);
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
  border: 1px solid var(--dsw-alias-border-l1, rgba(255,255,255,0.1));
  background: var(--dsw-alias-bg-layer-2, #252538);
  color: var(--dsw-alias-label-secondary, #9a9ab0);
  font-size: 11px;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.12s ease;
}

.agnes-size-btn:hover {
  border-color: rgba(108,92,231,0.3);
  color: var(--dsw-alias-label-primary, #e8e8ef);
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
  border: 1px solid var(--dsw-alias-border-l1, rgba(255,255,255,0.1));
  background: var(--dsw-alias-bg-layer-2, #252538);
  color: var(--dsw-alias-label-secondary, #9a9ab0);
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
  border: 1px solid var(--dsw-alias-border-l1, rgba(255,255,255,0.1));
  background: var(--dsw-alias-bg-layer-2, #252538);
  color: var(--dsw-alias-label-secondary, #9a9ab0);
  font-size: 11px;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.12s ease;
  text-align: center;
}

.agnes-mode-btn:hover {
  border-color: rgba(108,92,231,0.3);
  color: var(--dsw-alias-label-primary, #e8e8ef);
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
  color: var(--dsw-alias-label-secondary, #6c6c80);
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
  background: var(--dsw-alias-bg-layer-2, #252538);
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
  color: var(--dsw-alias-label-primary, #e8e8ef);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.agnes-custom-model-meta {
  font-size: 11px;
  color: var(--dsw-alias-label-secondary, #6c6c80);
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
  background: var(--dsw-alias-bg-layer-1, #1a1a2e);
  border-radius: 12px;
  border: 1px solid var(--dsw-alias-border-l1, rgba(255,255,255,0.1));
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
  border-bottom: 1px solid var(--dsw-alias-border-l1, rgba(255,255,255,0.06));
  font-size: 14px;
  font-weight: 600;
  color: var(--dsw-alias-label-primary, #e8e8ef);
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
  border-top: 1px solid var(--dsw-alias-border-l1, rgba(255,255,255,0.06));
}

.agnes-form-group {
  margin-bottom: 12px;
}

.agnes-form-label {
  display: block;
  font-size: 12px;
  font-weight: 500;
  color: var(--dsw-alias-label-secondary, #9a9ab0);
  margin-bottom: 4px;
}

.agnes-form-input {
  width: 100%;
  height: 34px;
  padding: 0 10px;
  border-radius: 8px;
  border: 1px solid var(--dsw-alias-border-l1, rgba(255,255,255,0.1));
  background: var(--dsw-alias-bg-layer-2, #252538);
  color: var(--dsw-alias-label-primary, #e8e8ef);
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
  color: var(--dsw-alias-label-secondary, #6c6c80);
  opacity: 0.6;
}

.agnes-form-select {
  width: 100%;
  height: 34px;
  padding: 0 10px;
  border-radius: 8px;
  border: 1px solid var(--dsw-alias-border-l1, rgba(255,255,255,0.1));
  background: var(--dsw-alias-bg-layer-2, #252538);
  color: var(--dsw-alias-label-primary, #e8e8ef);
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
  background: var(--dsw-alias-bg-layer-2, #252538);
}

.agnes-top-tab {
  flex: 1;
  height: 32px;
  border: none;
  border-radius: 7px;
  background: transparent;
  color: var(--dsw-alias-label-secondary, #6c6c80);
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
  background: var(--dsw-alias-bg-layer-1, #1a1a2e);
  color: var(--dsw-alias-label-primary, #e8e8ef);
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
}

.agnes-top-tab:hover:not(.active) {
  color: var(--dsw-alias-label-primary, #e8e8ef);
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
  color: var(--dsw-alias-label-secondary, #9a9ab0);
}

.agnes-step.active {
  color: var(--dsw-alias-label-primary, #e8e8ef);
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
  background: var(--dsw-alias-bg-layer-3, #2e2e44);
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
const API_BASE$1 = "/agnes-studio/api";
/** 导入剧本，跳过故事+剧本步骤，直接从分镜开始 */
async function importScript(req) {
	const resp = await fetch(`${API_BASE$1}/drama/import`, {
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
	const resp = await fetch(`${API_BASE$1}/drama/start`, {
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
	const resp = await fetch(`${API_BASE$1}/drama/status/${dramaId}`);
	if (!resp.ok) throw new Error("查询短剧状态失败");
	const data = await resp.json();
	if (data.error) throw new Error(data.error);
	return data;
}
/** 停止短剧 */
async function stopDrama(dramaId) {
	await fetch(`${API_BASE$1}/drama/${dramaId}/stop`, { method: "POST" });
}
/** 恢复短剧 */
async function resumeDrama(dramaId) {
	await fetch(`${API_BASE$1}/drama/${dramaId}/resume`, { method: "POST" });
}
/** 确认/编辑内容 */
async function confirmDrama(dramaId, payload) {
	await fetch(`${API_BASE$1}/drama/${dramaId}/confirm`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(payload)
	});
}
/** 重新生成某步 */
async function regenerateDrama(dramaId, payload) {
	await fetch(`${API_BASE$1}/drama/${dramaId}/regenerate`, {
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
const STORAGE_KEY = "agnes-studio-drama-tasks";
const MAX_TASKS = 20;
/** 保存短剧任务到 localStorage */
function saveDramaTask(task) {
	try {
		const tasks = listDramaTasks();
		const idx = tasks.findIndex((t) => t.drama_id === task.drama_id);
		if (idx >= 0) tasks[idx] = task;
		else tasks.unshift(task);
		if (tasks.length > MAX_TASKS) tasks.length = MAX_TASKS;
		localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
	} catch {}
}
/** 加载所有短剧任务 */
function listDramaTasks() {
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		return raw ? JSON.parse(raw) : [];
	} catch {
		return [];
	}
}
/** 删除短剧任务 */
function deleteDramaTask(dramaId) {
	const tasks = listDramaTasks().filter((t) => t.drama_id !== dramaId);
	localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}
//#endregion
//#region src/client/drama-panel.tsx
function shellRequire$2(id) {
	try {
		if (typeof __require === "function") {
			const mod = __require(id);
			if (mod !== void 0 && mod !== null) return mod;
		}
	} catch {}
}
const React$2 = shellRequire$2("react") ?? globalThis.React ?? null;
const NOOP$2 = () => {};
const useState$2 = React$2?.useState ?? ((initial) => [typeof initial === "function" ? initial() : initial, NOOP$2]);
const useEffect$2 = React$2?.useEffect ?? NOOP$2;
const useCallback$2 = React$2?.useCallback ?? ((fn) => fn);
const useRef$1 = React$2?.useRef ?? ((initial) => ({ current: initial }));
const createElement$2 = React$2?.createElement ?? (() => null);
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
	return createElement$2("div", { className: "agnes-steps" }, ...STEPS.map((step, idx) => {
		const isActive = idx === currentIdx;
		const isDone = idx < currentIdx;
		const cls = "agnes-step" + (isActive ? " active" : "") + (isDone ? " done" : "");
		return createElement$2("div", {
			key: step.key,
			className: cls
		}, createElement$2("div", { className: "agnes-step-icon" }, isDone ? "✓" : String(idx + 1)), createElement$2("span", null, step.label));
	}));
}
/** Status bar message area. */
function renderStatusMessage(task) {
	const label = STATUS_LABELS[task.status] || task.status;
	const isActive = !TERMINAL.has(task.status);
	return createElement$2("div", { style: {
		display: "flex",
		alignItems: "center",
		gap: "8px",
		padding: "8px 12px",
		borderRadius: "8px",
		background: isActive ? "rgba(108,92,231,0.08)" : task.status === "completed" ? "rgba(0,206,201,0.08)" : "rgba(255,107,107,0.08)",
		fontSize: "13px"
	} }, createElement$2("span", null, label), task.message && task.message !== label ? createElement$2("span", { style: {
		color: "var(--dsw-alias-label-secondary, #6c6c80)",
		fontSize: "12px"
	} }, " — " + task.message) : null, isActive ? createElement$2("span", { style: {
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
	return createElement$2("div", { className: "agnes-section" }, createElement$2("div", { className: "agnes-section-title" }, title), createElement$2("textarea", {
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
	}), createElement$2("div", { style: {
		display: "flex",
		gap: "8px",
		marginTop: "8px",
		flexWrap: "wrap"
	} }, createElement$2("button", {
		className: "agnes-btn agnes-btn-primary",
		onClick: () => onConfirm(field, editContent || content)
	}, "✅ 确认并继续"), createElement$2("button", {
		className: "agnes-btn agnes-btn-secondary",
		onClick: () => onConfirm(field, editContent || content)
	}, "✏️ 保存编辑"), createElement$2("button", {
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
	return createElement$2("div", { className: "agnes-section" }, createElement$2("div", { className: "agnes-section-title" }, title), createElement$2("div", { style: {
		padding: "12px",
		borderRadius: "8px",
		background: "var(--dsw-alias-bg-layer-2, #252538)",
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
	if (assets.length === 0) return createElement$2("div", { className: "agnes-section" }, createElement$2("div", { className: "agnes-section-title" }, "🎨 素材"), createElement$2("div", { style: {
		color: "var(--dsw-alias-label-secondary, #6c6c80)",
		fontSize: "13px",
		padding: "12px 0"
	} }, "素材生成中…"));
	return createElement$2("div", null, ...Object.entries(ASSET_CATEGORIES).map(([cat, label]) => {
		const items = assets.filter((a) => a.category === cat);
		if (items.length === 0) return null;
		return createElement$2("div", {
			key: cat,
			className: "agnes-section"
		}, createElement$2("div", { className: "agnes-section-title" }, label), createElement$2("div", { style: {
			display: "grid",
			gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
			gap: "8px"
		} }, ...items.map((asset, idx) => createElement$2("div", {
			key: idx,
			className: "agnes-custom-model-item",
			style: {
				flexDirection: "column",
				alignItems: "stretch",
				padding: "10px"
			}
		}, asset.image_url ? createElement$2("img", {
			src: asset.image_url,
			style: {
				width: "100%",
				borderRadius: "8px",
				marginBottom: "6px",
				aspectRatio: "1",
				objectFit: "cover"
			}
		}) : createElement$2("div", { style: {
			width: "100%",
			aspectRatio: "1",
			borderRadius: "8px",
			marginBottom: "6px",
			background: "linear-gradient(135deg, rgba(108,92,231,0.1), rgba(162,155,254,0.05))",
			display: "flex",
			alignItems: "center",
			justifyContent: "center",
			fontSize: "24px"
		} }, asset.status === "generating" ? "⏳" : "🎨"), createElement$2("div", { className: "agnes-custom-model-name" }, asset.name), createElement$2("div", { className: "agnes-custom-model-meta" }, (asset.desc || "").slice(0, 50) + (asset.desc && asset.desc.length > 50 ? "…" : "")), createElement$2("div", { style: { marginTop: "4px" } }, asset.status === "pending" ? createElement$2("span", { className: "agnes-badge agnes-badge-generating" }, "⏳ 待生成") : asset.status === "done" ? createElement$2("span", { className: "agnes-badge agnes-badge-free" }, "✅ 完成") : asset.status === "error" ? createElement$2("span", { className: "agnes-badge agnes-badge-error" }, "❌ 失败") : createElement$2("span", { className: "agnes-badge agnes-badge-generating" }, "🔄 生成中"))))));
	}));
}
/** Storyboard shot list with video generation controls. */
function renderShots(task, onConfirmVideo) {
	const shots = task.shots || task.storyboard?.shots || [];
	const videoResults = task.video_results || [];
	if (shots.length === 0) return createElement$2("div", { className: "agnes-section" }, createElement$2("div", { className: "agnes-section-title" }, "🎬 分镜"), createElement$2("div", { style: {
		color: "var(--dsw-alias-label-secondary, #6c6c80)",
		fontSize: "13px",
		padding: "12px 0"
	} }, "分镜生成中…"));
	return createElement$2("div", { className: "agnes-section" }, createElement$2("div", { className: "agnes-section-title" }, "🎬 分镜 (" + shots.length + " 个镜头)"), ...shots.map((shot, idx) => {
		const vr = videoResults.find((v) => v.shot_index === shot.shot_index);
		const isGenerating = vr?.status === "generating" || vr?.status === "pending";
		return createElement$2("div", {
			key: idx,
			className: "agnes-custom-model-item",
			style: {
				flexDirection: "column",
				alignItems: "flex-start",
				padding: "12px"
			}
		}, createElement$2("div", { style: {
			display: "flex",
			justifyContent: "space-between",
			width: "100%",
			alignItems: "center"
		} }, createElement$2("span", { style: {
			fontWeight: 600,
			fontSize: "13px"
		} }, "镜头 " + shot.shot_index), vr ? vr.status === "completed" ? createElement$2("span", { className: "agnes-badge agnes-badge-free" }, "✅ 已生成") : isGenerating ? createElement$2("span", { className: "agnes-badge agnes-badge-generating" }, "🔄 生成中") : vr.status === "failed" ? createElement$2("span", { className: "agnes-badge agnes-badge-error" }, "❌ 失败") : null : null), createElement$2("div", { style: {
			fontSize: "12px",
			color: "var(--dsw-alias-label-secondary, #6c6c80)",
			marginTop: "4px",
			lineHeight: "1.5"
		} }, (shot.scene_desc || "").slice(0, 100) + (shot.scene_desc && shot.scene_desc.length > 100 ? "…" : "")), shot.camera ? createElement$2("div", { style: {
			fontSize: "11px",
			color: "var(--dsw-alias-label-secondary, #9a9ab0)",
			marginTop: "2px"
		} }, "📷 " + shot.camera + (shot.camera_movement ? " / " + shot.camera_movement.intent : "")) : null, shot.action ? createElement$2("div", { style: {
			fontSize: "11px",
			color: "var(--dsw-alias-label-secondary, #9a9ab0)",
			marginTop: "2px"
		} }, "🎬 " + shot.action) : null, shot.dialogue ? createElement$2("div", { style: {
			fontSize: "12px",
			fontStyle: "italic",
			marginTop: "4px",
			color: "#a29bfe",
			padding: "4px 8px",
			borderRadius: "4px",
			background: "rgba(162,155,254,0.08)"
		} }, "💬 " + shot.dialogue) : null, vr?.status !== "completed" && vr?.status !== "generating" && vr?.status !== "pending" ? createElement$2("button", {
			className: "agnes-btn agnes-btn-sm agnes-btn-primary",
			style: { marginTop: "6px" },
			onClick: () => onConfirmVideo(shot.shot_index)
		}, "🎬 生成视频") : null, vr?.video_url ? createElement$2("video", {
			src: vr.video_url,
			controls: true,
			style: {
				width: "100%",
				marginTop: "8px",
				borderRadius: "8px"
			}
		}) : null, vr?.error ? createElement$2("div", { style: {
			fontSize: "11px",
			color: "#ff6b6b",
			marginTop: "4px"
		} }, "⚠ " + vr.error) : null);
	}));
}
/** Completed status view with summary. */
function renderCompletedView(task) {
	const shots = task.shots || task.storyboard?.shots || [];
	const completedVideos = (task.video_results || []).filter((v) => v.status === "completed");
	return createElement$2("div", { className: "agnes-section" }, createElement$2("div", { style: {
		padding: "16px",
		borderRadius: "10px",
		background: "rgba(0,206,201,0.08)",
		border: "1px solid rgba(0,206,201,0.2)",
		textAlign: "center"
	} }, createElement$2("div", { style: {
		fontSize: "32px",
		marginBottom: "8px"
	} }, "🎉"), createElement$2("div", { style: {
		fontSize: "16px",
		fontWeight: 600,
		marginBottom: "4px"
	} }, "短剧制作完成！"), createElement$2("div", { style: {
		fontSize: "13px",
		color: "var(--dsw-alias-label-secondary, #6c6c80)"
	} }, shots.length + " 个镜头 · " + completedVideos.length + " 个视频")), completedVideos.length > 0 ? createElement$2("div", {
		className: "agnes-section",
		style: { marginTop: "12px" }
	}, createElement$2("div", { className: "agnes-section-title" }, "🎥 视频预览"), ...completedVideos.map((vr) => vr.video_url ? createElement$2("div", {
		key: vr.shot_index,
		style: { marginBottom: "8px" }
	}, createElement$2("div", { style: {
		fontSize: "12px",
		fontWeight: 500,
		marginBottom: "4px",
		color: "var(--dsw-alias-label-secondary, #9a9ab0)"
	} }, "镜头 " + vr.shot_index), createElement$2("video", {
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
	const [currentTask, setCurrentTask] = useState$2(null);
	const [taskList, setTaskList] = useState$2([]);
	const [prompt, setPrompt] = useState$2("");
	const [textModel, setTextModel] = useState$2("agnes-3.0-flash");
	const [imageModel, setImageModel] = useState$2("agnes-image-2.5-flash");
	const [videoModel, setVideoModel] = useState$2("agnes-video-2.5-flash");
	const [shotDuration, setShotDuration] = useState$2(5);
	const [loading, setLoading] = useState$2(false);
	const [error, setError] = useState$2("");
	const [editContent, setEditContent] = useState$2("");
	const [selectedTaskId, setSelectedTaskId] = useState$2(null);
	const stopPollRef = useRef$1(null);
	const imgOpts = buildModelOptions(imageModels, IMAGE_MODELS_DEFAULT);
	const vidOpts = buildModelOptions(videoModels, VIDEO_MODELS_DEFAULT);
	useEffect$2(() => {
		setTaskList(listDramaTasks());
		return () => {
			if (stopPollRef.current) stopPollRef.current();
		};
	}, []);
	useEffect$2(() => {
		if (currentTask) setTaskList(listDramaTasks());
	}, [currentTask]);
	const handleStart = useCallback$2(async () => {
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
	const handleSelectTask = useCallback$2((dramaId) => {
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
	const handleStop = useCallback$2(async () => {
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
	const handleResume = useCallback$2(async () => {
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
	const handleDeleteTask = useCallback$2((dramaId) => {
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
	const handleConfirmField = useCallback$2(async (field, content) => {
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
	const handleRegenerateStep = useCallback$2(async (step) => {
		if (!currentTask) return;
		try {
			setEditContent("");
			await regenerateDrama(currentTask.drama_id, { step });
		} catch (e) {
			setError(e instanceof Error ? e.message : "重新生成失败");
		}
	}, [currentTask]);
	const handleConfirmVideoShot = useCallback$2(async (shotIndex) => {
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
	const renderNewTaskForm = () => createElement$2("div", { style: {
		padding: "12px 16px",
		borderBottom: "1px solid var(--dsw-alias-border-l1, rgba(255,255,255,0.06))",
		background: "var(--dsw-alias-bg-layer-2, #252538)"
	} }, createElement$2("div", {
		className: "agnes-section-title",
		style: { marginBottom: "8px" }
	}, "🎬 新建短剧"), createElement$2("textarea", {
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
	}), createElement$2("div", { className: "agnes-input-row" }, createElement$2("div", null, createElement$2("label", { style: {
		fontSize: "11px",
		color: "var(--dsw-alias-label-secondary, #6c6c80)",
		marginBottom: "2px",
		display: "block"
	} }, "文本模型"), createElement$2("select", {
		className: "agnes-select",
		value: textModel,
		onChange: (e) => setTextModel(e.target.value)
	}, ...TEXT_MODELS.map((m) => createElement$2("option", {
		key: m.value,
		value: m.value
	}, m.label)))), createElement$2("div", null, createElement$2("label", { style: {
		fontSize: "11px",
		color: "var(--dsw-alias-label-secondary, #6c6c80)",
		marginBottom: "2px",
		display: "block"
	} }, "图像模型"), createElement$2("select", {
		className: "agnes-select",
		value: imageModel,
		onChange: (e) => setImageModel(e.target.value)
	}, ...imgOpts.map((m) => createElement$2("option", {
		key: m.value,
		value: m.value
	}, m.label)))), createElement$2("div", null, createElement$2("label", { style: {
		fontSize: "11px",
		color: "var(--dsw-alias-label-secondary, #6c6c80)",
		marginBottom: "2px",
		display: "block"
	} }, "视频模型"), createElement$2("select", {
		className: "agnes-select",
		value: videoModel,
		onChange: (e) => setVideoModel(e.target.value)
	}, ...vidOpts.map((m) => createElement$2("option", {
		key: m.value,
		value: m.value
	}, m.label))))), createElement$2("div", { style: {
		display: "flex",
		alignItems: "flex-end",
		gap: "8px"
	} }, createElement$2("div", null, createElement$2("label", { style: {
		fontSize: "11px",
		color: "var(--dsw-alias-label-secondary, #6c6c80)",
		marginBottom: "2px",
		display: "block"
	} }, "每镜头时长(秒)"), createElement$2("select", {
		className: "agnes-select",
		value: String(shotDuration),
		onChange: (e) => setShotDuration(Number(e.target.value)),
		style: { width: "80px" }
	}, ...DURATION_OPTIONS.map((d) => createElement$2("option", {
		key: d,
		value: String(d)
	}, d + "s")))), createElement$2("button", {
		className: "agnes-btn agnes-btn-primary",
		onClick: handleStart,
		disabled: loading || !prompt.trim(),
		style: { flex: 1 }
	}, loading ? "⏳ 启动中…" : "🚀 开始创作"), createElement$2("button", {
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
	}, "📥 导入剧本"), error ? createElement$2("div", { style: {
		marginTop: "8px",
		padding: "6px 10px",
		borderRadius: "6px",
		background: "rgba(255,107,107,0.12)",
		color: "#ff6b6b",
		fontSize: "12px"
	} }, "⚠ " + error) : null));
	const renderTaskList = () => createElement$2("div", { className: "agnes-left" }, createElement$2("div", { className: "agnes-left-header" }, "📁 任务列表"), createElement$2("div", { className: "agnes-left-content" }, taskList.length === 0 ? createElement$2("div", { style: {
		textAlign: "center",
		padding: "20px 12px",
		fontSize: "12px",
		color: "var(--dsw-alias-label-secondary, #6c6c80)"
	} }, "暂无任务", createElement$2("br"), "在上方输入短剧创意开始创作") : taskList.map((task) => {
		const isActive = selectedTaskId === task.drama_id;
		const statusIcon = TERMINAL.has(task.status) ? task.status === "completed" ? "✅" : task.status === "failed" ? "❌" : "⏹" : "🔄";
		return createElement$2("div", {
			key: task.drama_id,
			className: "agnes-scene-item" + (isActive ? " active" : ""),
			onClick: () => handleSelectTask(task.drama_id)
		}, createElement$2("div", { className: "agnes-scene-num" }, statusIcon), createElement$2("div", { className: "agnes-scene-info" }, createElement$2("div", { className: "agnes-scene-name" }, getTaskPreview(task)), createElement$2("div", { className: "agnes-scene-status" + (TERMINAL.has(task.status) ? " done" : " generating") }, STATUS_LABELS[task.status] || task.status), createElement$2("div", { style: {
			fontSize: "10px",
			color: "var(--dsw-alias-label-secondary, #6c6c80)",
			marginTop: "2px"
		} }, formatTime(task.created_at))), createElement$2("button", {
			style: {
				border: "none",
				background: "transparent",
				color: "var(--dsw-alias-label-secondary, #6c6c80)",
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
		if (!currentTask) return createElement$2("div", { className: "agnes-center" }, createElement$2("div", { className: "agnes-empty" }, createElement$2("div", { className: "agnes-empty-icon" }, "🎬"), createElement$2("div", { className: "agnes-empty-title" }, "短剧创作工作台"), createElement$2("div", { className: "agnes-empty-desc" }, "输入创意描述，AI 将自动生成故事梗概 → 剧本 → 分镜 → 素材 → 视频的完整短剧流水线。")));
		const task = currentTask;
		const stepIdx = getStepIndex(task);
		return createElement$2("div", { className: "agnes-center" }, renderProgressSteps(task), renderStatusMessage(task), createElement$2("div", { style: {
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
		}) : null, stepIdx >= 2 && task.status !== "paused_story" && task.status !== "paused_script" ? renderShots(task, handleConfirmVideoShot) : null, stepIdx >= 3 && task.status !== "paused_story" && task.status !== "paused_script" ? renderAssets(task) : null), createElement$2("div", { className: "agnes-action-bar" }, task.status === "stopped" ? createElement$2("button", {
			className: "agnes-btn agnes-btn-primary",
			onClick: handleResume
		}, "▶ 恢复") : null, !TERMINAL.has(task.status) && task.status !== "stopped" ? createElement$2("button", {
			className: "agnes-btn agnes-btn-danger",
			onClick: handleStop
		}, "⏹ 停止") : null, task.status === "failed" ? createElement$2("button", {
			className: "agnes-btn agnes-btn-primary",
			onClick: handleResume
		}, "🔄 重试") : null, createElement$2("div", { style: {
			marginLeft: "auto",
			fontSize: "11px",
			color: "var(--dsw-alias-label-secondary, #6c6c80)"
		} }, "文本: " + task.text_model + " · 图像: " + task.image_model + " · 视频: " + task.video_model)));
	};
	const renderRight = () => {
		if (!currentTask) return createElement$2("div", { className: "agnes-right" }, createElement$2("div", { className: "agnes-right-scroll" }, createElement$2("div", { className: "agnes-section" }, createElement$2("div", { className: "agnes-section-title" }, "⚙ 创作设置"), createElement$2("div", { className: "agnes-form-group" }, createElement$2("label", { className: "agnes-form-label" }, "文本模型"), createElement$2("select", {
			className: "agnes-form-select",
			value: textModel,
			onChange: (e) => setTextModel(e.target.value)
		}, ...TEXT_MODELS.map((m) => createElement$2("option", {
			key: m.value,
			value: m.value
		}, m.label)))), createElement$2("div", { className: "agnes-form-group" }, createElement$2("label", { className: "agnes-form-label" }, "图像模型"), createElement$2("select", {
			className: "agnes-form-select",
			value: imageModel,
			onChange: (e) => setImageModel(e.target.value)
		}, ...imgOpts.map((m) => createElement$2("option", {
			key: m.value,
			value: m.value
		}, m.label)))), createElement$2("div", { className: "agnes-form-group" }, createElement$2("label", { className: "agnes-form-label" }, "视频模型"), createElement$2("select", {
			className: "agnes-form-select",
			value: videoModel,
			onChange: (e) => setVideoModel(e.target.value)
		}, ...vidOpts.map((m) => createElement$2("option", {
			key: m.value,
			value: m.value
		}, m.label)))), createElement$2("div", { className: "agnes-form-group" }, createElement$2("label", { className: "agnes-form-label" }, "每镜头时长"), createElement$2("div", { className: "agnes-size-grid" }, ...DURATION_OPTIONS.map((d) => createElement$2("button", {
			key: d,
			className: "agnes-size-btn" + (shotDuration === d ? " active" : ""),
			onClick: () => setShotDuration(d)
		}, d + "s"))))), createElement$2("div", { className: "agnes-divider" }), createElement$2("div", { className: "agnes-section" }, createElement$2("div", { className: "agnes-section-title" }, "💡 使用提示"), createElement$2("div", { style: {
			fontSize: "12px",
			lineHeight: "1.6",
			color: "var(--dsw-alias-label-secondary, #9a9ab0)"
		} }, "• 描述越详细，生成效果越好", createElement$2("br"), "• 可在每步暂停时编辑内容", createElement$2("br"), "• 分镜和视频可逐个生成", createElement$2("br"), "• 历史任务自动保存在本地"))));
		const task = currentTask;
		const stepIdx = getStepIndex(task);
		return createElement$2("div", { className: "agnes-right" }, createElement$2("div", { className: "agnes-right-scroll" }, createElement$2("div", { className: "agnes-section" }, createElement$2("div", { className: "agnes-section-title" }, "📋 任务信息"), createElement$2("div", { className: "agnes-setting-row" }, createElement$2("span", { className: "agnes-setting-label" }, "状态"), createElement$2("span", { className: "agnes-setting-value" }, STATUS_LABELS[task.status] || task.status)), createElement$2("div", { className: "agnes-setting-row" }, createElement$2("span", { className: "agnes-setting-label" }, "创建时间"), createElement$2("span", { className: "agnes-setting-value" }, formatTime(task.created_at))), createElement$2("div", { className: "agnes-setting-row" }, createElement$2("span", { className: "agnes-setting-label" }, "镜头时长"), createElement$2("span", { className: "agnes-setting-value" }, task.shot_duration + "s")), createElement$2("div", { className: "agnes-setting-row" }, createElement$2("span", { className: "agnes-setting-label" }, "进度"), createElement$2("span", { className: "agnes-setting-value" }, stepIdx + 1 + " / 5"))), createElement$2("div", { className: "agnes-divider" }), createElement$2("div", { className: "agnes-section" }, createElement$2("div", { className: "agnes-section-title" }, "📊 生成详情"), task.storyboard?.shots ? createElement$2("div", { className: "agnes-setting-row" }, createElement$2("span", { className: "agnes-setting-label" }, "分镜数"), createElement$2("span", { className: "agnes-setting-value" }, String(task.storyboard.shots.length))) : null, task.assets ? createElement$2("div", { className: "agnes-setting-row" }, createElement$2("span", { className: "agnes-setting-label" }, "素材数"), createElement$2("span", { className: "agnes-setting-value" }, String(task.assets.length))) : null, task.video_results ? createElement$2("div", { className: "agnes-setting-row" }, createElement$2("span", { className: "agnes-setting-label" }, "视频数"), createElement$2("span", { className: "agnes-setting-value" }, task.video_results.filter((v) => v.status === "completed").length + " / " + (task.storyboard?.shots?.length || task.video_results.length))) : null, createElement$2("div", {
			className: "agnes-form-group",
			style: { marginTop: "8px" }
		}, createElement$2("label", { className: "agnes-form-label" }, "创作提示"), createElement$2("div", { style: {
			padding: "8px",
			borderRadius: "6px",
			background: "var(--dsw-alias-bg-layer-2, #252538)",
			fontSize: "12px",
			lineHeight: "1.5",
			color: "var(--dsw-alias-label-secondary, #9a9ab0)",
			maxHeight: "120px",
			overflowY: "auto",
			whiteSpace: "pre-wrap"
		} }, task.prompt))), createElement$2("div", { className: "agnes-divider" }), createElement$2("div", { className: "agnes-section" }, createElement$2("div", { className: "agnes-section-title" }, "🤖 模型配置"), createElement$2("div", { className: "agnes-setting-row" }, createElement$2("span", { className: "agnes-setting-label" }, "文本"), createElement$2("span", {
			className: "agnes-setting-value",
			style: { fontSize: "11px" }
		}, task.text_model)), createElement$2("div", { className: "agnes-setting-row" }, createElement$2("span", { className: "agnes-setting-label" }, "图像"), createElement$2("span", {
			className: "agnes-setting-value",
			style: { fontSize: "11px" }
		}, task.image_model)), createElement$2("div", { className: "agnes-setting-row" }, createElement$2("span", { className: "agnes-setting-label" }, "视频"), createElement$2("span", {
			className: "agnes-setting-value",
			style: { fontSize: "11px" }
		}, task.video_model)))));
	};
	return createElement$2("div", { style: {
		display: "flex",
		flexDirection: "column",
		height: "100%",
		width: "100%",
		overflow: "hidden"
	} }, renderNewTaskForm(), createElement$2("div", {
		className: "agnes-body",
		style: {
			flex: 1,
			minHeight: 0
		}
	}, renderTaskList(), renderCenter(), renderRight()), createElement$2("div", { className: "agnes-statusbar" }, createElement$2("div", { className: "agnes-status-dot" }), createElement$2("span", null, "短剧流水线"), createElement$2("span", null, "·"), createElement$2("span", null, taskList.length + " 个任务"), currentTask && !TERMINAL.has(currentTask.status) ? createElement$2("span", { style: {
		marginLeft: "auto",
		color: "#fdcb6e"
	} }, "⚡ 制作中") : null));
}
//#endregion
//#region src/client/prompt-expert.ts
const API_BASE = "/agnes-studio/api";
/** 获取专家类型列表 */
async function fetchExpertTypes() {
	try {
		const resp = await fetch(`${API_BASE}/prompt-expert/types`);
		if (resp.ok) return (await resp.json()).types || [];
	} catch {}
	return BUILTIN_EXPERT_TYPES;
}
/** 生成提示词 */
async function generateExpertPrompt(req) {
	const resp = await fetch(`${API_BASE}/prompt-expert/generate`, {
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
function PromptExpertPanel({ textModels }) {
	injectStyles();
	const [types, setTypes] = useState$1([]);
	const [selected, setSelected] = useState$1("");
	const [idea, setIdea] = useState$1("");
	const [params, setParams] = useState$1({});
	const [model, setModel] = useState$1(() => {
		try {
			return Object.keys(textModels)[0] || "agnes-3.0-flash";
		} catch {
			return "agnes-3.0-flash";
		}
	});
	const [result, setResult] = useState$1("");
	const [loading, setLoading] = useState$1(false);
	const [error, setError] = useState$1("");
	const [history, setHistory] = useState$1([]);
	useEffect$1(() => {
		fetchExpertTypes().then(setTypes).catch(() => {});
		try {
			const raw = localStorage?.getItem("agnes-expert-history");
			if (raw) setHistory(JSON.parse(raw));
		} catch {}
	}, []);
	const currentType = types.find((t) => t.key === selected);
	const handleGenerate = useCallback$1(async () => {
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
	const handleCopy = useCallback$1((text) => {
		try {
			navigator.clipboard?.writeText(text);
		} catch {}
	}, []);
	return createElement$1("div", { style: {
		padding: "16px",
		overflowY: "auto",
		height: "100%"
	} }, createElement$1("div", { style: {
		fontSize: "16px",
		fontWeight: 700,
		marginBottom: "16px"
	} }, "✨ 提示词专家"), types.length > 0 ? createElement$1("div", { style: {
		display: "grid",
		gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
		gap: "8px",
		marginBottom: "16px"
	} }, ...types.map((t) => createElement$1("div", {
		key: t.key,
		style: {
			padding: "10px",
			borderRadius: "8px",
			cursor: "pointer",
			border: t.key === selected ? "1px solid #6c5ce7" : "1px solid rgba(255,255,255,0.06)",
			background: t.key === selected ? "rgba(108,92,231,0.15)" : "var(--dsw-alias-bg-layer-2, #252538)"
		},
		onClick: () => {
			setSelected(t.key);
			setParams({});
			setResult("");
			setError("");
		}
	}, createElement$1("div", { style: {
		fontSize: "20px",
		marginBottom: "4px"
	} }, t.icon), createElement$1("div", { style: {
		fontSize: "12px",
		fontWeight: 600
	} }, t.name)))) : null, currentType ? createElement$1("div", null, createElement$1("div", { style: { marginBottom: "8px" } }, createElement$1("label", { style: {
		fontSize: "12px",
		color: "#9a9ab0",
		display: "block",
		marginBottom: "4px"
	} }, "文本模型"), createElement$1("select", {
		style: {
			width: "100%",
			height: "32px",
			padding: "0 8px",
			borderRadius: "6px",
			border: "1px solid rgba(255,255,255,0.1)",
			background: "#252538",
			color: "#e8e8ef",
			fontSize: "12px"
		},
		value: model,
		onChange: (e) => setModel(e.target.value)
	}, ...Object.entries(textModels).map(([id, name]) => createElement$1("option", {
		key: id,
		value: id
	}, name)))), ...currentType.fields.map((f) => createElement$1("div", {
		key: f.key,
		style: { marginBottom: "8px" }
	}, createElement$1("label", { style: {
		fontSize: "12px",
		color: "#9a9ab0",
		display: "block",
		marginBottom: "4px"
	} }, f.label), createElement$1("select", {
		style: {
			width: "100%",
			height: "32px",
			padding: "0 8px",
			borderRadius: "6px",
			border: "1px solid rgba(255,255,255,0.1)",
			background: "#252538",
			color: "#e8e8ef",
			fontSize: "12px"
		},
		value: params[f.key] || f.default,
		onChange: (e) => setParams({
			...params,
			[f.key]: e.target.value
		})
	}, ...f.options.map((o) => createElement$1("option", {
		key: o,
		value: o
	}, o))))), createElement$1("div", { style: { marginBottom: "8px" } }, createElement$1("label", { style: {
		fontSize: "12px",
		color: "#9a9ab0",
		display: "block",
		marginBottom: "4px"
	} }, "你的想法"), createElement$1("textarea", {
		style: {
			width: "100%",
			minHeight: "60px",
			padding: "8px",
			borderRadius: "6px",
			border: "1px solid rgba(255,255,255,0.1)",
			background: "#252538",
			color: "#e8e8ef",
			fontSize: "12px",
			fontFamily: "inherit",
			boxSizing: "border-box"
		},
		value: idea,
		onChange: (e) => setIdea(e.target.value),
		placeholder: currentType.placeholder,
		rows: 3
	})), createElement$1("button", {
		className: "agnes-btn agnes-btn-primary",
		style: { width: "100%" },
		disabled: loading || !idea.trim(),
		onClick: handleGenerate
	}, loading ? "⏳ 生成中..." : "✨ 生成提示词"), error ? createElement$1("div", { style: {
		marginTop: "8px",
		padding: "6px",
		borderRadius: "6px",
		background: "rgba(255,107,107,0.12)",
		color: "#ff6b6b",
		fontSize: "11px"
	} }, error) : null, result ? createElement$1("div", { style: {
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
	} }, result, createElement$1("button", {
		className: "agnes-btn agnes-btn-sm agnes-btn-secondary",
		style: { marginTop: "8px" },
		onClick: () => handleCopy(result)
	}, "📋 复制")) : null) : createElement$1("div", { style: {
		padding: "40px",
		textAlign: "center",
		color: "#6c6c80"
	} }, "👆 选择一个专家开始"));
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
			color: "var(--dsw-alias-label-secondary, #6c6c80)"
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
			color: "var(--dsw-alias-label-secondary, #6c6c80)",
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
			color: "var(--dsw-alias-label-secondary, #6c6c80)",
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
			color: "var(--dsw-alias-label-secondary, #6c6c80)",
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
		style: { color: "var(--dsw-alias-label-secondary, #6c6c80)" }
	}, "暂无厂商信息，点击下方按钮检测")) : null, createElement("button", {
		className: "agnes-btn agnes-btn-sm agnes-btn-ghost agnes-btn-full",
		style: { marginTop: "8px" },
		disabled: checkingKey,
		onClick: () => {
			checkKey(false);
		}
	}, checkingKey ? "⏳ 检测中…" : "🔄 重新检测 Key")), createElement("div", { className: "agnes-setting-group" }, createElement("div", { className: "agnes-setting-group-title" }, "📖 配置指南"), createElement("div", { style: {
		fontSize: "12px",
		color: "var(--dsw-alias-label-secondary, #6c6c80)",
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
		color: "var(--dsw-alias-label-secondary, #6c6c80)",
		padding: "8px 0"
	} }, "暂无自定义模型。添加后可在模型选择器中使用。")), createElement("div", { className: "agnes-setting-group" }, createElement("div", { className: "agnes-setting-group-title" }, "ℹ️ 关于"), createElement("div", { style: {
		fontSize: "12px",
		color: "var(--dsw-alias-label-secondary, #6c6c80)",
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
		"data-dsh-agnes-studio": ""
	}, createElement("div", {
		className: "agnes-titlebar",
		onMouseDown: onDragStart
	}, createElement("span", { className: "agnes-titlebar-icon" }, "🎬"), createElement("span", { className: "agnes-titlebar-text" }, PRODUCT_NAME), createElement("span", { className: "agnes-badge agnes-badge-free" }, "🎉 生图/视频免费"), createElement("button", {
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
	}, checkingKey ? "⏳ 检测中…" : "🔄 重新检测"), keyStatus === "ready" ? createElement("span", { className: "agnes-keyguide-ok" }, "✅ Key 已配置") : null), createElement("div", { className: "agnes-keyguide-note" }, "Key 只保存在本机、只由后端进程用于调用 API，网页里不会出现；免费额度以平台规则为准。")) : null, createElement("div", { style: { padding: "8px 16px 0" } }, createElement("div", { className: "agnes-tabs" }, [
		"image",
		"video",
		"storyboard",
		"expert",
		"settings"
	].map((t) => createElement("button", {
		key: t,
		className: `agnes-tab ${tab === t ? "active" : ""}`,
		onClick: () => setTab(t)
	}, t === "image" ? "🎨 生图" : t === "video" ? "🎬 生视频" : t === "storyboard" ? "📖 短剧" : t === "expert" ? "✨ 提示词" : "⚙ 设置")))), tab === "expert" || tab === "settings" ? createElement("div", { style: {
		flex: 1,
		overflow: "hidden",
		display: "flex",
		flexDirection: "column"
	} }, tab === "expert" ? createElement(PromptExpertPanel, { textModels: TEXT_MODEL_OPTIONS }) : renderSettings()) : createElement("div", { className: "agnes-body" }, createElement("div", { className: "agnes-center" }, createElement("div", {
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
	} }, error) : null)), createElement("div", { className: "agnes-right" }, createElement("div", { className: "agnes-right-scroll" }, tab === "image" || tab === "video" ? createElement("div", { className: "agnes-section" }, createElement("div", { className: "agnes-section-title" }, "📝 提示词"), createElement("textarea", {
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
		color: "var(--dsw-alias-label-secondary, #6c6c80)"
	} }, `${refImages.length} 张参考图`) : createElement("div", { style: {
		marginTop: "8px",
		fontSize: "11px",
		color: "var(--dsw-alias-label-secondary, #6c6c80)"
	} }, tab === "video" && videoMode === "keyframe" ? "纯文生视频模式（或上传首尾帧）" : "无参考图（纯文生模式）")) : null, tab === "image" || tab === "video" ? createElement("div", { className: "agnes-divider" }) : null, tab === "image" || tab === "video" ? createElement("div", { className: "agnes-section" }, createElement("div", { className: "agnes-section-title" }, "ℹ️ 模型信息"), createElement("div", { style: {
		fontSize: "12px",
		color: "var(--dsw-alias-label-secondary, #6c6c80)",
		lineHeight: "1.6"
	} }, createElement("div", null, `🎨 当前图片模型: ${getModelDisplayName(selectedImageModel, imageModels)}`), createElement("div", null, `🎬 当前视频模型: ${getModelDisplayName(selectedVideoModel, videoModels)}`), createElement("div", null, `📐 图片尺寸: ${imageSize} · 比例: ${imageRatio}`), tab === "video" ? createElement("div", null, `🎥 视频模式: ${videoMode === "text" ? "文生视频" : videoMode === "keyframe" ? "首尾帧" : "参考图"} · ${videoResolution} · ${videoAspectRatio}`) : null, createElement("div", { style: { marginTop: "6px" } }, keyStatus === "ready" ? "🔑 API Key：已配置" : keyStatus === "missing" ? "🔑 API Key：未配置" : "🔑 API Key：未检测"))) : null))), createElement("div", { className: "agnes-statusbar" }, createElement("div", { className: "agnes-status-dot" }), createElement("span", null, keyStatus === "missing" ? "API 未连接（缺 Key）" : "API 已连接"), keyStatus === "missing" ? createElement("button", {
		className: "agnes-statusbar-link",
		onClick: () => setGuideOpen(true)
	}, "🔑 如何配置 Key") : null, project ? createElement("span", null, `📊 ${project.scenes.length} 个场景`) : null, result ? createElement("span", null, `✅ 已生成 ${result.type === "image" ? "图片" : "视频"}`) : null, tab === "image" || tab === "video" ? createElement("span", { style: {
		marginLeft: "auto",
		fontSize: "11px",
		color: "var(--dsw-alias-label-secondary, #6c6c80)"
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
