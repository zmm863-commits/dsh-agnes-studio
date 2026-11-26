/**
 * 面板页签选中态修正（第 26 层，最后生效）。
 *
 * 问题：13-new-panels.ts 里 `.toolbox-tab.active` 用的是浅色卡片配色
 * （`background: var(--ag-surface, #ffffff)` + 深色文字）。在深色宿主下
 * `--ag-surface` 没有定义，回退成纯白 —— 于是选中页签变成**白底白字**。
 *
 * 这里按"深色主题下一律用浅色叠加 + 亮色文字"重写一遍，并把浅色主题的
 * 情形单独放行（宿主是 light 主题时不覆盖）。
 */
export const tabFixStyles = `
/* ── 选中页签：深色主题下必须是浅色叠加，不能是纯白 ── */
html:not([data-dsh-theme="light"]) .toolbox-tab.active,
html:not([data-dsh-theme="light"]) .novel-split-tab.active,
html:not([data-dsh-theme="light"]) .videoparse-tab.active,
html:not([data-dsh-theme="light"]) .wechat-tab.active,
html:not([data-dsh-theme="light"]) .agnes-tab.active {
  background: rgba(255, 255, 255, 0.14) !important;
  color: #f2f4fb !important;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.18),
    0 2px 8px rgba(0, 0, 0, 0.25) !important;
  font-weight: 600;
}

/* 未选中的页签在深色下也要够亮，否则读不清 */
html:not([data-dsh-theme="light"]) .toolbox-tab,
html:not([data-dsh-theme="light"]) .novel-split-tab,
html:not([data-dsh-theme="light"]) .videoparse-tab,
html:not([data-dsh-theme="light"]) .wechat-tab,
html:not([data-dsh-theme="light"]) .agnes-tab {
  color: rgba(226, 231, 245, 0.72);
}

html:not([data-dsh-theme="light"]) .toolbox-tab:hover,
html:not([data-dsh-theme="light"]) .novel-split-tab:hover,
html:not([data-dsh-theme="light"]) .videoparse-tab:hover,
html:not([data-dsh-theme="light"]) .wechat-tab:hover,
html:not([data-dsh-theme="light"]) .agnes-tab:hover {
  background: rgba(255, 255, 255, 0.08);
  color: #f2f4fb;
}
`
