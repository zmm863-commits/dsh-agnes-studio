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
