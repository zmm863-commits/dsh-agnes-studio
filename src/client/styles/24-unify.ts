/**
 * 内页统一（第 24 层）。
 *
 * 前面几层统一的是「壳」：标题栏、dock、展示区、参数区。
 * 这一层统一的是**每个内页自己的排版**，让 16 个模块看起来是同一个产品：
 *
 *   1. 页面框架统一：内容列宽度、内边距、滚动行为一致；
 *   2. 区块标题统一：`h3`（旧面板手写的）与 `.agnes-section-title` 同规格；
 *   3. 表单统一：标签、输入框、下拉、按钮的度量和圆角一致；
 *   4. 参数列统一：任何塞进右列的表单都自动改成单列排布（短剧的新建表单就是这种情况）；
 *   5. 空状态统一。
 *
 * 只覆盖视觉与排布，不改任何面板的行为。
 */
export const UNIFY_CSS = `
/* ═══════════════════════════════════════════════════════════════════════
   1 · 页面框架
   ═══════════════════════════════════════════════════════════════════════ */
/* 全宽面板的容器（工作区自己的 .agnes-body 不算） */
[data-dsh-agnes-studio] .agnes-main > div:not(.agnes-body) {
  padding: 10px 16px 16px;
}
[data-dsh-agnes-studio] .agnes-main > div:not(.agnes-body) > * {
  max-width: 960px;
  margin-left: auto;
  margin-right: auto;
  width: 100%;
}
/* 画布 / 创作台这类自己管布局的页面，不要再套 960 的限制 */
[data-dsh-agnes-studio] .agnes-main > div:not(.agnes-body)[style*="flex: 1"] > * {
  max-width: none;
}

/* ═══════════════════════════════════════════════════════════════════════
   2 · 标题层级
   ═══════════════════════════════════════════════════════════════════════ */
[data-dsh-agnes-studio] .agnes-main h3,
[data-dsh-agnes-studio] .agnes-main h4 {
  margin: 0 0 10px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", system-ui, sans-serif;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: -0.01em;
  color: #eef0f7;
}
[data-dsh-agnes-studio] .agnes-main h3::before {
  content: "";
  display: inline-block;
  width: 3px;
  height: 12px;
  margin-right: 8px;
  border-radius: 99px;
  vertical-align: -1px;
  background: linear-gradient(180deg, #818cf8, #22d3ee);
  box-shadow: 0 0 12px rgba(129, 140, 248, 0.65);
}
[data-ag-theme="dark"][data-dsh-agnes-studio] .agnes-setting-group-title {
  margin: 14px 0 6px;
  color: rgba(238, 240, 247, 0.62) !important;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", system-ui, sans-serif;
  font-size: 11.5px;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: rgba(238, 240, 247, 0.62);
}
[data-ag-theme="dark"][data-dsh-agnes-studio] .agnes-form-label,
[data-ag-theme="dark"][data-dsh-agnes-studio] .agnes-setting-label {
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.02em;
  color: rgba(238, 240, 247, 0.55);
}

/* ═══════════════════════════════════════════════════════════════════════
   3 · 表单度量
   ═══════════════════════════════════════════════════════════════════════ */
[data-dsh-agnes-studio] .agnes-main .agnes-input,
[data-dsh-agnes-studio] .agnes-main .agnes-select {
  height: 32px;
  padding: 0 10px;
  font-size: 12px;
  border-radius: 10px;
}
[data-dsh-agnes-studio] .agnes-main .agnes-textarea {
  padding: 9px 11px;
  font-size: 12px;
  line-height: 1.6;
  border-radius: 12px;
}
/* 旧面板里有大量裸 <input>/<select>/<textarea>。
   注意：08-light.ts 里那条 background: #ffffff !important 是给浅色主题写的，
   但它**没有限定主题**，于是暗色下也生效 —— 白底 + 近白字 = 看不见的输入框。
   这里用同等的 !important 把它按主题收回来。 */
[data-ag-theme="dark"][data-dsh-agnes-studio] .agnes-main input:not([type="checkbox"]):not([type="radio"]):not([type="file"]):not([type="range"]),
[data-ag-theme="dark"][data-dsh-agnes-studio] .agnes-main select,
[data-ag-theme="dark"][data-dsh-agnes-studio] .agnes-main textarea {
  background: rgba(255, 255, 255, 0.06) !important;
  border: 1px solid rgba(255, 255, 255, 0.12) !important;
  color: #eef0f7 !important;
  border-radius: 10px !important;
  box-shadow: none !important;
  height: 32px;
  padding: 0 10px;
  font-family: inherit;
  font-size: 12px;
  outline: none;
}
[data-ag-theme="dark"][data-dsh-agnes-studio] .agnes-main textarea {
  height: auto;
  padding: 9px 11px;
  line-height: 1.6;
}
[data-ag-theme="dark"][data-dsh-agnes-studio] .agnes-main input::placeholder,
[data-ag-theme="dark"][data-dsh-agnes-studio] .agnes-main textarea::placeholder {
  color: rgba(238, 240, 247, 0.34) !important;
}
[data-ag-theme="dark"][data-dsh-agnes-studio] .agnes-main select option {
  background: #1b1a2b;
  color: #eef0f7;
}
[data-ag-theme="dark"][data-dsh-agnes-studio] .agnes-main input:focus,
[data-ag-theme="dark"][data-dsh-agnes-studio] .agnes-main select:focus,
[data-ag-theme="dark"][data-dsh-agnes-studio] .agnes-main textarea:focus {
  border-color: rgba(129, 140, 248, 0.55) !important;
  box-shadow: 0 0 0 3px rgba(129, 140, 248, 0.16) !important;
}

[data-dsh-agnes-studio] .agnes-main .agnes-form-group { margin-bottom: 10px; }
[data-ag-theme="dark"][data-dsh-agnes-studio] .agnes-main .agnes-setting-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 0 12px;
  height: 38px;
  margin-bottom: 6px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.03);
  font-size: 12px;
}
[data-ag-theme="dark"][data-dsh-agnes-studio] .agnes-main .agnes-setting-value {
  color: #eef0f7;
  font-size: 12px;
}
/* 「检测中…」这种整宽按钮别撑成一条 */
[data-ag-theme="dark"][data-dsh-agnes-studio] .agnes-main .agnes-btn-full {
  width: auto;
  align-self: flex-start;
  padding: 0 16px;
}

/* ═══════════════════════════════════════════════════════════════════════
   4 · 参数列里的一切都改成单列
   ═══════════════════════════════════════════════════════════════════════ */
[data-dsh-agnes-studio] .agnes-right .agnes-input-row {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
[data-dsh-agnes-studio] .agnes-right .agnes-input-row > div { width: 100%; }
[data-dsh-agnes-studio] .agnes-right .agnes-btn {
  height: 32px;
  border-radius: 10px;
  font-size: 12px;
}
[data-ag-theme="dark"][data-dsh-agnes-studio] .agnes-right .agnes-btn-primary {
  width: 100%;
}

/* 短剧左列（任务列表）与右列同高、同圆角 */
[data-ag-theme="dark"][data-dsh-agnes-studio] .agnes-left {
  flex: 0 0 210px;
  width: 210px;
  margin: 0;
  border-radius: 20px;
  background: rgba(24, 23, 38, 0.55);
  border: 1px solid rgba(255, 255, 255, 0.10);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.14);
}
[data-ag-theme="dark"][data-dsh-agnes-studio] .agnes-left-header {
  padding: 12px 12px 8px;
  font-size: 12px;
  font-weight: 600;
  color: #eef0f7;
}

/* ═══════════════════════════════════════════════════════════════════════
   5 · 撤掉旧设计语言的装饰（封面色卡 / 口播侧栏上的 HUD 角标）
   ═══════════════════════════════════════════════════════════════════════ */
[data-ag-theme="dark"][data-dsh-agnes-studio] .agcv-card::before,
[data-ag-theme="dark"][data-dsh-agnes-studio] .agcv-card::after,
[data-ag-theme="dark"][data-dsh-agnes-studio] .agcv-preview::before,
[data-ag-theme="dark"][data-dsh-agnes-studio] .agcv-preview::after,
[data-ag-theme="dark"][data-dsh-agnes-studio] .agnes-anchor-card::before,
[data-ag-theme="dark"][data-dsh-agnes-studio] .agnes-anchor-card::after,
[data-ag-theme="dark"][data-dsh-agnes-studio] .agnes-anchor-side::before,
[data-ag-theme="dark"][data-dsh-agnes-studio] .agnes-anchor-side::after,
[data-ag-theme="dark"][data-dsh-agnes-studio] .agc-viewport::before,
[data-ag-theme="dark"][data-dsh-agnes-studio] .agc-viewport::after {
  display: none;
}

/* ═══════════════════════════════════════════════════════════════════════
   6 · 空状态与状态条
   ═══════════════════════════════════════════════════════════════════════ */
[data-dsh-agnes-studio] .agnes-main .agnes-empty-title {
  font-size: 13px;
  font-weight: 600;
  letter-spacing: -0.01em;
}
[data-dsh-agnes-studio] .agnes-main .agnes-empty-desc {
  font-size: 11.5px;
  color: rgba(238, 240, 247, 0.45);
}
[data-ag-theme="dark"][data-dsh-agnes-studio] .agnes-statusbar {
  margin: 0 12px 10px;
  padding: 7px 12px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.03);
  font-size: 11px;
  color: rgba(238, 240, 247, 0.5);
}
`
