/**
 * 转提示词（VPT）面板样式。
 *
 * 第 15 层：只服务 vpt-panel，颜色全部走 --ag-* 变量，
 * 因此暗色（含 14-spatial 皮肤）和浅色主题都能直接用。
 */
export const VPT_CSS = `
.agnes-vpt { padding: 16px; display: flex; flex-direction: column; gap: 14px; }
.agnes-vpt .agnes-section { display: flex; flex-direction: column; gap: 12px; }
.agnes-vpt-lead { font-size: 12px; line-height: 1.65; color: var(--ag-text-3, #6e80a3); margin: 0; }

.agnes-vpt-row { display: flex; gap: 6px; }
.agnes-vpt-seg { min-width: 96px; }
.agnes-vpt-seg.active {
  background: var(--ag-accent-soft, rgba(124, 92, 255, 0.16));
  border-color: var(--ag-accent, #7c5cff);
  color: var(--ag-text, #0c1a33);
}

.agnes-vpt-drop {
  min-height: 200px;
  border: 1px dashed var(--ag-line, rgba(255, 255, 255, 0.14));
  border-radius: 14px;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 8px; cursor: pointer; position: relative; overflow: hidden;
  background: var(--ag-surface-2, rgba(255, 255, 255, 0.03));
  transition: border-color 0.16s var(--ag-ease, ease), background 0.16s var(--ag-ease, ease);
}
.agnes-vpt-drop:hover { border-color: var(--ag-accent, #7c5cff); }
.agnes-vpt-drop.has-file { border-style: solid; padding: 10px; }

.agnes-vpt-drop-hint {
  display: flex; flex-direction: column; align-items: center; gap: 6px;
  color: var(--ag-text-3, #6e80a3); font-size: 12px; text-align: center;
}
.agnes-vpt-drop-icon { font-size: 30px; opacity: 0.72; }
.agnes-vpt-drop-sub { font-size: 10.5px; opacity: 0.75; }

.agnes-vpt-thumb {
  max-width: 100%; max-height: 340px; border-radius: 12px; display: block;
  box-shadow: 0 18px 40px -24px rgba(0, 0, 0, 0.8);
}
.agnes-vpt-file {
  position: absolute; left: 12px; bottom: 9px;
  font-size: 10px; color: var(--ag-text-3, #6e80a3);
  font-family: var(--ag-font-mono, ui-monospace, monospace);
}

.agnes-vpt-opts {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 10px;
}
.agnes-vpt-field { display: flex; flex-direction: column; gap: 5px; font-size: 11px; color: var(--ag-text-3, #6e80a3); }

.agnes-vpt-error { color: #ff6b6b; font-size: 11.5px; line-height: 1.5; }
.agnes-vpt-actions { display: flex; gap: 8px; align-items: center; }
.agnes-vpt-result { display: flex; }
.agnes-vpt-out { width: 100%; min-height: 150px; resize: vertical; font-size: 12.5px; line-height: 1.65; }
`
