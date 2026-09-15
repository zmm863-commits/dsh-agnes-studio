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
/** Generate image through Host proxy. */
async function generateImage(req) {
	const params = {
		model: "agnes-image-2.5-flash",
		prompt: req.prompt,
		size: req.size || "2K",
		extra_body: { response_format: "url" }
	};
	if (req.ratio) {
		params.size = req.size || "2K";
		params.extra_body.ratio = req.ratio;
	}
	if (req.images && req.images.length > 0) params.extra_body.image = req.images;
	const data = (await callHostProxy("/v1/images/generations", params)).data;
	if (data && data[0] && data[0].url) return { url: data[0].url };
	throw new Error("图片生成失败：未返回 URL");
}
/** Generate video through Host proxy (returns video_id for polling). */
async function generateVideo(req) {
	const params = {
		model: "agnes-video-2.5-flash",
		prompt: req.prompt,
		mode: req.mode || "text",
		seconds: req.seconds || "5",
		size: "720P"
	};
	if (req.aspectRatio) params.aspect_ratio = req.aspectRatio;
	if (req.mode === "keyframe") {
		if (req.firstFrame) params.first_frame = req.firstFrame;
		if (req.lastFrame) params.last_frame = req.lastFrame;
	}
	if (req.mode === "reference") {
		if (req.images && req.images.length > 0) params.images = req.images;
		if (req.audios && req.audios.length > 0) params.audios = req.audios;
	}
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
/**
* Ask the host whether an Agnes API key is configured.
*
* Preferred route is the host's `/agnes-studio/api/status` endpoint, which
* resolves the key without calling Agnes. Host builds older than that route
* fall back to a proxy probe: the host resolves the key BEFORE it talks to
* Agnes, so "未配置" means missing while any later failure (the probe path
* 404s upstream) means the key is present.
*/
async function fetchKeyStatus() {
	try {
		const resp = await fetch("/agnes-studio/api/status", { method: "GET" });
		if (resp.ok) {
			const data = await resp.json();
			if (typeof data.configured === "boolean") return data.configured ? "ready" : "missing";
		}
	} catch {}
	try {
		await callHostProxy("/__dsh_agnes_key_probe__", {});
		return "ready";
	} catch (e) {
		const message = e instanceof Error ? e.message : String(e);
		if (message.includes("未配置") || message.includes("agnes-api-key")) return "missing";
		if (/invalid api key|api key is invalid|unauthorized|no api key/i.test(message)) return "missing";
		if (message.includes("Agnes API")) return "ready";
		return "unknown";
	}
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
/** Image size options. */
const IMAGE_SIZES = [
	"1K",
	"2K",
	"3K",
	"4K"
];
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
const VIDEO_DURATIONS = [
	"4",
	"5",
	"6",
	"7",
	"8",
	"10",
	"12"
];
/** Product name shown everywhere in the UI. */
const PRODUCT_NAME = "泡泡猫的影视工具";
/** Where a first-time user signs up and creates an Agnes API Key. */
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
	const [imageSize, setImageSize] = useState("2K");
	const [imageRatio, setImageRatio] = useState("16:9");
	const [videoDuration, setVideoDuration] = useState("5");
	const [loading, setLoading] = useState(false);
	const [loadingText, setLoadingText] = useState("");
	const [progress, setProgress] = useState(0);
	const [result, setResult] = useState(null);
	const [error, setError] = useState("");
	const [refImages, setRefImages] = useState([]);
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
	}, []);
	const checkKey = useCallback(async (openWhenMissing) => {
		setCheckingKey(true);
		const status = await fetchKeyStatus();
		setKeyStatus(status);
		if (status === "missing" && openWhenMissing) setGuideOpen(true);
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
				mode: refImages.length > 0 ? "reference" : "text",
				seconds: videoDuration,
				images: refImages.length > 0 ? refImages : void 0
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
		videoDuration,
		refImages,
		loading,
		project,
		selectedScene
	]);
	const handleImport = useCallback(() => {
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
					setProjects(listProjects());
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
	const handleNewProject = useCallback(() => {
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
	const handleLoadProject = useCallback((proj) => {
		setProject(proj);
		setSelectedScene(0);
		setTab("storyboard");
	}, []);
	const handleDeleteProject = useCallback((id) => {
		deleteProject(id);
		setProjects(listProjects());
		if (project?.id === id) setProject(null);
	}, [project]);
	const handleAddScene = useCallback(() => {
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
	}, checkingKey ? "⏳ 检测中…" : "🔄 重新检测"), keyStatus === "ready" ? createElement("span", { className: "agnes-keyguide-ok" }, "✅ Key 已配置") : null), createElement("div", { className: "agnes-keyguide-note" }, "Key 只保存在本机、只由后端进程用于调用 Agnes，网页里不会出现；免费额度以平台规则为准。")) : null, createElement("div", { className: "agnes-body" }, createElement("div", { className: "agnes-left" }, createElement("div", { className: "agnes-left-header" }, "项目"), createElement("div", { style: {
		padding: "0 8px 8px",
		display: "flex",
		gap: "6px"
	} }, createElement("button", {
		className: "agnes-btn agnes-btn-sm agnes-btn-primary",
		style: { flex: 1 },
		onClick: handleImport
	}, "📥 导入剧本"), createElement("button", {
		className: "agnes-btn agnes-btn-sm agnes-btn-secondary",
		onClick: handleNewProject
	}, "+")), createElement("div", { className: "agnes-left-content" }, project ? createElement("div", null, createElement("div", { style: {
		padding: "4px 10px",
		fontSize: "12px",
		fontWeight: 600,
		color: "var(--dsw-alias-label-secondary, #6c6c80)"
	} }, project.name), ...project.scenes.map((scene, i) => createElement("div", {
		key: i,
		className: `agnes-scene-item ${selectedScene === i ? "active" : ""}`,
		onClick: () => {
			setSelectedScene(i);
			setPrompt(scene.prompt);
			setResult(scene.imageUrl ? {
				type: "image",
				url: scene.imageUrl
			} : null);
		}
	}, createElement("div", { className: "agnes-scene-num" }, String(i + 1)), createElement("div", { className: "agnes-scene-info" }, createElement("div", { className: "agnes-scene-name" }, scene.name), createElement("div", { className: `agnes-scene-status ${scene.status === "done" ? "done" : scene.status === "generating-image" || scene.status === "generating-video" ? "generating" : ""}` }, scene.status === "done" ? "✅ 完成" : scene.status === "error" ? "❌ 失败" : scene.status === "pending" ? "⏳ 待生成" : "🔄 生成中...")))), createElement("button", {
		className: "agnes-btn agnes-btn-sm agnes-btn-ghost agnes-btn-full",
		onClick: handleAddScene,
		style: { marginTop: "4px" }
	}, "+ 添加场景")) : createElement("div", { className: "agnes-empty" }, createElement("div", { className: "agnes-empty-icon" }, "🎬"), createElement("div", { className: "agnes-empty-title" }, "开始创作"), createElement("div", { className: "agnes-empty-desc" }, "导入剧本或新建项目")), projects.length > 0 ? createElement("div", { style: { marginTop: "16px" } }, createElement("div", { style: {
		padding: "4px 10px",
		fontSize: "12px",
		fontWeight: 600,
		color: "var(--dsw-alias-label-secondary, #6c6c80)",
		marginBottom: "4px"
	} }, "历史项目"), ...projects.slice(0, 10).map((proj) => createElement("div", {
		key: proj.id,
		className: `agnes-scene-item ${project?.id === proj.id ? "active" : ""}`,
		onClick: () => handleLoadProject(proj)
	}, createElement("div", { className: "agnes-scene-info" }, createElement("div", { className: "agnes-scene-name" }, proj.name), createElement("div", { className: "agnes-scene-status" }, `${proj.scenes.length} 个场景`)), createElement("button", {
		className: "agnes-btn agnes-btn-sm agnes-btn-ghost",
		onClick: (e) => {
			e.stopPropagation();
			handleDeleteProject(proj.id);
		},
		style: {
			padding: "2px 6px",
			fontSize: "11px"
		}
	}, "🗑")))) : null)), createElement("div", { className: "agnes-center" }, createElement("div", { style: { padding: "8px 16px 0" } }, createElement("div", { className: "agnes-tabs" }, [
		"image",
		"video",
		"storyboard"
	].map((t) => createElement("button", {
		key: t,
		className: `agnes-tab ${tab === t ? "active" : ""}`,
		onClick: () => setTab(t)
	}, t === "image" ? "🎨 生图" : t === "video" ? "🎬 生视频" : "📖 故事板")))), createElement("div", { className: "agnes-preview-area" }, loading ? createElement("div", { className: "agnes-skeleton" }, createElement("div", { style: { fontSize: "24px" } }, "✨"), createElement("div", { className: "agnes-skeleton-text" }, loadingText), createElement("div", { className: "agnes-progress-bar" }, createElement("div", {
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
	}, "📋 复制链接"))) : createElement("div", { className: "agnes-empty" }, createElement("div", { className: "agnes-empty-icon" }, tab === "image" ? "🎨" : tab === "video" ? "🎬" : "📖"), createElement("div", { className: "agnes-empty-title" }, tab === "image" ? "AI 生图" : tab === "video" ? "AI 生视频" : "故事板"), createElement("div", { className: "agnes-empty-desc" }, tab === "image" ? "在右侧输入提示词，点击生成" : tab === "video" ? "在右侧输入提示词，描述想要的视频内容" : "导入剧本或新建项目，自动拆解分镜"))), createElement("div", { className: "agnes-action-bar" }, createElement("button", {
		className: "agnes-btn agnes-btn-primary",
		disabled: loading || !prompt.trim(),
		onClick: tab === "image" ? handleGenerateImage : handleGenerateVideo
	}, loading ? `⏳ ${loadingText}` : tab === "image" ? "✨ 生成图片" : "🎬 生成视频"), tab === "storyboard" && project ? createElement("button", {
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
	} }, error) : null)), createElement("div", { className: "agnes-right" }, createElement("div", { className: "agnes-right-scroll" }, createElement("div", { className: "agnes-section" }, createElement("div", { className: "agnes-section-title" }, "📝 提示词"), createElement("textarea", {
		className: "agnes-textarea",
		value: prompt,
		onChange: (e) => setPrompt(e.target.value),
		placeholder: tab === "image" ? "描述你想要生成的图片...\n\n例如：赛博朋克城市街道，雨夜，霓虹灯倒映在湿漉漉的地面，低角度镜头，电影级光照" : tab === "video" ? "描述你想要生成的视频...\n\n例如：雨后的未来城市街道，霓虹灯倒映在地面，一辆银色跑车缓慢驶过，电影级运镜" : "选择左侧场景，在此编辑提示词",
		rows: 5
	})), tab === "storyboard" && project && project.scenes[selectedScene] ? createElement("div", { className: "agnes-section" }, createElement("div", { className: "agnes-section-title" }, `🎞 场景 ${selectedScene + 1} 提示词`), createElement("textarea", {
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
	}, "→"))) : null, createElement("div", { className: "agnes-divider" }), createElement("div", { className: "agnes-section" }, createElement("div", { className: "agnes-section-title" }, "📐 输出设置"), tab === "image" ? createElement("div", null, createElement("div", { className: "agnes-input-row" }, createElement("div", null, createElement("div", { style: {
		fontSize: "11px",
		color: "var(--dsw-alias-label-secondary, #6c6c80)",
		marginBottom: "4px"
	} }, "尺寸"), createElement("select", {
		className: "agnes-select",
		value: imageSize,
		onChange: (e) => setImageSize(e.target.value)
	}, ...IMAGE_SIZES.map((s) => createElement("option", {
		key: s,
		value: s
	}, s)))), createElement("div", null, createElement("div", { style: {
		fontSize: "11px",
		color: "var(--dsw-alias-label-secondary, #6c6c80)",
		marginBottom: "4px"
	} }, "比例"), createElement("select", {
		className: "agnes-select",
		value: imageRatio,
		onChange: (e) => setImageRatio(e.target.value)
	}, ...IMAGE_RATIOS.map((r) => createElement("option", {
		key: r,
		value: r
	}, r)))))) : tab === "video" ? createElement("div", null, createElement("div", { style: {
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
	}, `${d} 秒`)))) : createElement("div", { style: {
		fontSize: "12px",
		color: "var(--dsw-alias-label-secondary, #6c6c80)"
	} }, "故事板使用上方统一设置")), createElement("div", { className: "agnes-divider" }), createElement("div", { className: "agnes-section" }, createElement("div", { className: "agnes-section-title" }, "🖼 参考图片"), createElement("div", { className: "agnes-ref-chips" }, ...refImages.map((url, i) => createElement("div", {
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
	} }, "无参考图（纯文生图/视频模式）")), createElement("div", { className: "agnes-divider" }), createElement("div", { className: "agnes-section" }, createElement("div", { className: "agnes-section-title" }, "ℹ️ 模型信息"), createElement("div", { style: {
		fontSize: "12px",
		color: "var(--dsw-alias-label-secondary, #6c6c80)",
		lineHeight: "1.6"
	} }, createElement("div", null, "🎨 生图: agnes-image-2.5-flash (免费)"), createElement("div", null, "🎬 视频: agnes-video-2.5-flash (免费)"), createElement("div", null, "📐 支持 1K-4K 图片 / 4-12秒视频"), createElement("div", { style: { marginTop: "6px" } }, keyStatus === "ready" ? "🔑 Agnes API Key：已配置" : keyStatus === "missing" ? "🔑 Agnes API Key：未配置" : "🔑 Agnes API Key：未检测"), createElement("button", {
		className: "agnes-btn agnes-btn-sm agnes-btn-ghost agnes-btn-full",
		style: { marginTop: "6px" },
		onClick: () => setGuideOpen(!guideOpen)
	}, guideOpen ? "收起 Key 指引" : "🔑 首次使用？如何获取 / 配置 Agnes Key")))))), createElement("div", { className: "agnes-statusbar" }, createElement("div", { className: "agnes-status-dot" }), createElement("span", null, keyStatus === "missing" ? "Agnes 未连接（缺 API Key）" : "Agnes 已连接"), keyStatus === "missing" ? createElement("button", {
		className: "agnes-statusbar-link",
		onClick: () => setGuideOpen(true)
	}, "🔑 如何配置 Key") : null, project ? createElement("span", null, `📊 ${project.scenes.length} 个场景`) : null, result ? createElement("span", null, `✅ 已生成 ${result.type === "image" ? "图片" : "视频"}`) : null));
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
