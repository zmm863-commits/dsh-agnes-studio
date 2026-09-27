/**
 * 设置栏 / 模型·尺寸·视频模式选择器 / 自定义模型弹窗 / 标签栏 / 步骤条
 *
 * 层叠顺序：第 4/12 层（顺序即生效顺序，后写的覆盖先写的）。
 * 由原 styles.ts 第 1041-1514 行机械切分而来，内容逐字未改。
 */
export const CONTROLS_CSS = `/* --- settings panel --------------------------------------------------- */
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
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  color: var(--ag-mod-ink, #0e7490) !important;
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
  font-size: 12px;
  color: var(--ag-muted);
}


.agnes-setting-value {
  font-size: 12px;
  font-weight: 600;
  color: var(--ag-t1);
}


/* --- model selector ---------------------------------------------------- */
.agnes-model-select {
  width: 100%;
  padding: 0 12px;
  font-size: 13px;
  font-family: inherit;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236c6c80' d='M3 4.5L6 8l3-3.5'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
  box-sizing: border-box;
  transition: border-color 0.15s ease;
  background: rgba(0, 0, 0, 0.42) !important;
  border: 1px solid var(--ag-line-strong) !important;
  border-radius: 10px !important;
  color: var(--ag-text) !important;
  font-weight: 600;
  height: 36px;
}


.agnes-model-select:focus {
  outline: none;
  border-color: #6c5ce7;
  box-shadow: 0 0 0 2px rgba(108,92,231,0.2);
}

.agnes-model-info {
  margin-top: 6px;
  font-size: 11px;
  color: var(--ag-text-2, #2a3c5e);
  line-height: 1.4;
  border-radius: 10px;
  padding: 8px 10px;
  background: rgba(255,255,255,0.7);
  border: 1px solid var(--ag-line);
}


.agnes-model-tag {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  border: 1px solid var(--ag-line-strong);
  border-radius: 999px;
  font-weight: 700;
  font-size: 10px;
  padding: 2px 8px;
  background: rgba(8,145,178,0.12);
  border-color: rgba(8,145,178,0.35);
  color: var(--ag-mod-ink, #0e7490) !important;
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
  margin-bottom: 4px;
  color: var(--ag-text-2) !important;
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

`
