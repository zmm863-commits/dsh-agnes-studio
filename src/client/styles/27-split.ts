/**
 * 内页两列骨架的样式（第 27 层）。
 *
 * 与 split-layout.tsx 配套：左展示、右参数，参数列 320px 可收起。
 * 只新增类名（.agnes-split*），不覆盖任何旧规则，所以不会影响还没改的面板。
 */
export const splitLayoutStyles = `
/* ═══════════════════════════════════════════════════════════════════════
   内页两列骨架 —— 左展示 / 右参数
   ═══════════════════════════════════════════════════════════════════════ */
[data-dsh-agnes-studio] .agnes-split {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  min-width: 0;
  padding: 12px 16px 14px;
  gap: 10px;
}

/* ── 标题区（跨两列）── */
[data-dsh-agnes-studio] .agnes-split-head {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 0 0 auto;
}
[data-dsh-agnes-studio] .agnes-split-title {
  margin: 0;
  font-size: 15px;
  font-weight: 650;
  letter-spacing: 0.01em;
  color: var(--ag-text-1, rgba(238, 242, 250, 0.96));
}
[data-dsh-agnes-studio] .agnes-split-desc {
  margin: 0;
  font-size: 12px;
  line-height: 1.5;
  color: var(--ag-text-3, rgba(180, 194, 220, 0.66));
}

/* ── 两列主体 ── */
[data-dsh-agnes-studio] .agnes-split-body {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  gap: 12px;
  flex: 1;
  min-height: 0;
  align-items: stretch;
}
/* 参数列收起时，展示区占满 */
[data-dsh-agnes-studio] .agnes-split-body:has(> .agnes-split-params.is-collapsed) {
  grid-template-columns: minmax(0, 1fr) 44px;
}

/* ── 左：展示 ── */
[data-dsh-agnes-studio] .agnes-split-display {
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
  border-radius: 16px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02));
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.07);
  overflow: hidden;
}
[data-dsh-agnes-studio] .agnes-split-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  flex: 0 0 auto;
}
[data-dsh-agnes-studio] .agnes-split-scroll {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: 12px;
  scrollbar-gutter: stable;
}

/* ── 右：参数 ── */
[data-dsh-agnes-studio] .agnes-split-params {
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
  border-radius: 16px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.025));
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08);
  overflow: hidden;
}
[data-dsh-agnes-studio] .agnes-split-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 8px;
  border: none;
  background: rgba(255, 255, 255, 0.08);
  color: rgba(226, 231, 245, 0.8);
  cursor: pointer;
  flex: 0 0 auto;
}
[data-dsh-agnes-studio] .agnes-split-toggle:hover {
  background: rgba(255, 255, 255, 0.16);
  color: #fff;
}
[data-dsh-agnes-studio] .agnes-split-params-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 8px 10px 8px 14px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.02em;
  color: var(--ag-text-2, rgba(214, 224, 244, 0.82));
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  flex: 0 0 auto;
}
[data-dsh-agnes-studio] .agnes-split-params-body {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  scrollbar-gutter: stable;
}
[data-dsh-agnes-studio] .agnes-split-params.is-collapsed .agnes-split-params-head {
  writing-mode: vertical-rl;
  padding: 12px 0;
  border-bottom: none;
  justify-content: flex-start;
  height: 100%;
}

/* ── 参数列里的表单统一样式（面板内部不用再各写各的）── */
[data-dsh-agnes-studio] .agnes-split-params-body label,
[data-dsh-agnes-studio] .agnes-split-params-body .agnes-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 12px;
  color: var(--ag-text-2, rgba(214, 224, 244, 0.8));
}
[data-dsh-agnes-studio] .agnes-split-params-body input[type="text"],
[data-dsh-agnes-studio] .agnes-split-params-body input[type="password"],
[data-dsh-agnes-studio] .agnes-split-params-body input[type="number"],
[data-dsh-agnes-studio] .agnes-split-params-body textarea,
[data-dsh-agnes-studio] .agnes-split-params-body select {
  width: 100%;
  box-sizing: border-box;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.06);
  color: var(--ag-text-1, #eef0f7);
  font-family: inherit;
  font-size: 12.5px;
  padding: 8px 10px;
  outline: none;
  transition: border-color 0.15s ease, background 0.15s ease;
}
[data-dsh-agnes-studio] .agnes-split-params-body textarea {
  min-height: 88px;
  resize: vertical;
  line-height: 1.55;
}
[data-dsh-agnes-studio] .agnes-split-params-body input:focus,
[data-dsh-agnes-studio] .agnes-split-params-body textarea:focus,
[data-dsh-agnes-studio] .agnes-split-params-body select:focus {
  border-color: rgba(120, 160, 255, 0.55);
  background: rgba(255, 255, 255, 0.09);
}
[data-dsh-agnes-studio] .agnes-split-params-body .agnes-btn {
  width: 100%;
  justify-content: center;
}

/* ── 窄屏：叠成上下两段 ── */
@media (max-width: 1080px) {
  [data-dsh-agnes-studio] .agnes-split-body {
    grid-template-columns: minmax(0, 1fr);
    grid-template-rows: minmax(0, 1fr) auto;
  }
  [data-dsh-agnes-studio] .agnes-split-params {
    max-height: 46vh;
  }
}

/* ── 浅色主题 ── */
[data-ag-theme="light"] .agnes-split-display,
[data-ag-theme="light"] .agnes-split-params {
  background: rgba(255, 255, 255, 0.72);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.9), 0 1px 2px rgba(16, 24, 40, 0.05);
}
[data-ag-theme="light"] .agnes-split-params-head {
  color: #475467;
  border-bottom-color: rgba(16, 24, 40, 0.08);
}
[data-ag-theme="light"] .agnes-split-params-body input[type="text"],
[data-ag-theme="light"] .agnes-split-params-body input[type="password"],
[data-ag-theme="light"] .agnes-split-params-body input[type="number"],
[data-ag-theme="light"] .agnes-split-params-body textarea,
[data-ag-theme="light"] .agnes-split-params-body select {
  background: #fff;
  border-color: rgba(16, 24, 40, 0.14);
  color: #101828;
}
`

/** 页签页面（工具箱这类"上面页签、下面两列"的结构）。 */
export const tabbedPageStyles = `
[data-dsh-agnes-studio] .toolbox-page,
[data-dsh-agnes-studio] .novel-split-page {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  min-width: 0;
  padding: 12px 16px 0;
  gap: 10px;
}
[data-dsh-agnes-studio] .toolbox-page > .toolbox-header,
[data-dsh-agnes-studio] .novel-split-page > .novel-split-header {
  flex: 0 0 auto;
}
[data-dsh-agnes-studio] .toolbox-page > .agnes-split,
[data-dsh-agnes-studio] .novel-split-page > .agnes-split {
  padding: 0 0 14px;
}

/* 统一空状态 */
[data-dsh-agnes-studio] .agnes-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 120px;
  padding: 24px;
  border-radius: 12px;
  border: 1px dashed rgba(255, 255, 255, 0.12);
  color: var(--ag-text-3, rgba(180, 194, 220, 0.6));
  font-size: 12.5px;
  line-height: 1.6;
  text-align: center;
}
html[data-dsh-theme="light"] .agnes-empty {
  border-color: rgba(16, 24, 40, 0.14);
  color: #667085;
}
`

/**
 * 封面页的列序修正：它本来就是两列，但表单在左、预览在右，
 * 与其它页面「左展示 / 右参数」相反。这里只调顺序与列宽，不动结构。
 */
export const coverOrderStyles = `
[data-dsh-agnes-studio] .agnes-cover-grid {
  grid-template-columns: minmax(0, 1fr) 340px;
  align-items: stretch;
}
[data-dsh-agnes-studio] .agnes-cover-grid > .agcv-form {
  order: 2;
  min-width: 0;
}
[data-dsh-agnes-studio] .agnes-cover-grid > .agcv-preview {
  order: 1;
  min-width: 0;
}
@media (max-width: 1080px) {
  [data-dsh-agnes-studio] .agnes-cover-grid {
    grid-template-columns: minmax(0, 1fr);
  }
  [data-dsh-agnes-studio] .agnes-cover-grid > .agcv-form { order: 1; }
  [data-dsh-agnes-studio] .agnes-cover-grid > .agcv-preview { order: 2; }
}
`

/** 提示词专家：专家类型选择的紧凑网格 + 结果块。 */
export const expertStyles = `
[data-dsh-agnes-studio] .pe-types {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 6px;
}
[data-dsh-agnes-studio] .pe-type {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 9px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.04);
  color: rgba(226, 231, 245, 0.82);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.15s ease;
  min-width: 0;
}
[data-dsh-agnes-studio] .pe-type:hover { background: rgba(255, 255, 255, 0.08); }
[data-dsh-agnes-studio] .pe-type.active {
  border-color: rgba(124, 148, 255, 0.6);
  background: rgba(108, 132, 255, 0.18);
  color: #eef2ff;
}
[data-dsh-agnes-studio] .pe-type-icon { font-size: 14px; line-height: 1; }
[data-dsh-agnes-studio] .pe-result {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
[data-dsh-agnes-studio] .pe-result-text {
  padding: 12px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.045);
  border: 1px solid rgba(255, 255, 255, 0.07);
  font-size: 12.5px;
  line-height: 1.7;
  white-space: pre-wrap;
  max-height: 52vh;
  overflow: auto;
}
[data-dsh-agnes-studio] .pe-result-actions { display: flex; gap: 8px; flex-wrap: wrap; }
[data-dsh-agnes-studio] .pe-history { display: flex; flex-direction: column; gap: 6px; margin-top: 4px; }
[data-dsh-agnes-studio] .pe-history-title { font-size: 12px; font-weight: 600; color: rgba(214, 224, 244, 0.8); }
[data-dsh-agnes-studio] .pe-history-item {
  padding: 8px 10px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.06);
  cursor: pointer;
}
[data-dsh-agnes-studio] .pe-history-item:hover { background: rgba(255, 255, 255, 0.08); }
[data-dsh-agnes-studio] .pe-history-meta { font-size: 11px; color: rgba(180, 194, 220, 0.6); }
[data-dsh-agnes-studio] .pe-history-idea {
  font-size: 11.5px;
  margin-top: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: rgba(226, 231, 245, 0.86);
}
`

/** 文件选择框：原生「选择文件」按钮在深色里像补丁，统一成胶囊样式。 */
export const fileInputStyles = `
[data-dsh-agnes-studio] .agnes-split input[type="file"] {
  width: 100%;
  box-sizing: border-box;
  font-size: 11.5px;
  color: rgba(214, 224, 244, 0.75);
  background: rgba(255, 255, 255, 0.04);
  border: 1px dashed rgba(255, 255, 255, 0.14);
  border-radius: 12px;
  padding: 6px 8px;
  cursor: pointer;
}
[data-dsh-agnes-studio] .agnes-split input[type="file"]::file-selector-button {
  margin-right: 10px;
  padding: 5px 12px;
  border-radius: 9px;
  border: 1px solid rgba(140, 170, 255, 0.35);
  background: linear-gradient(180deg, rgba(120, 150, 255, 0.28), rgba(96, 128, 240, 0.18));
  color: #eaf0ff;
  font-size: 11.5px;
  font-family: inherit;
  cursor: pointer;
  transition: background 0.15s ease;
}
[data-dsh-agnes-studio] .agnes-split input[type="file"]::file-selector-button:hover {
  background: linear-gradient(180deg, rgba(140, 170, 255, 0.4), rgba(110, 140, 250, 0.26));
}
[data-ag-theme="light"] .agnes-split input[type="file"] {
  background: #fff;
  border-color: rgba(16, 24, 40, 0.16);
  color: #344054;
}
`
