/**
 * 表单控件统一（第 28 层）—— 深色主题下的输入框、下拉、文本域、文件选择。
 *
 * 【为什么需要这一层】08-light.ts 里有一条不含主题判断的规则：
 *
 *   [data-dsh-agnes-studio] input, select, textarea { background:#fff !important }
 *
 * 它是按浅色主题写的，但 `!important` 会一路盖到深色主题上 —— 结果就是深色玻璃
 * 面板里嵌着一堆纯白输入框（背景视频的上传区、口播的文稿框、封面的书名/简介都
 * 是这种"补丁感"）。这一层只在**深色主题**下用 !important 反向覆盖，浅色主题
 * 原样不动。
 *
 * 覆盖清单：
 *   1. 文本框 / 数字 / 密码 / 搜索
 *   2. 多行文本域
 *   3. 原生 select（去掉系统箭头，换成内联 SVG 箭头）
 *   4. 文件选择（含 ::file-selector-button）
 *   5. checkbox / radio 的强调色
 *   6. 占位符与聚焦态
 */
export const formControlStyles = `
/* ── 1 · 文本框 ─────────────────────────────────────────────────────── */
[data-dsh-agnes-studio] input:not([type="checkbox"]):not([type="radio"]):not([type="file"]),
[data-dsh-agnes-studio] textarea,
[data-dsh-agnes-studio] select {
  background: rgba(255, 255, 255, 0.055) !important;
  border: 1px solid rgba(255, 255, 255, 0.13) !important;
  color: rgba(238, 242, 250, 0.94) !important;
  border-radius: 12px !important;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06) !important;
  font-family: inherit !important;
  transition: border-color 0.15s ease, background 0.15s ease !important;
}

[data-dsh-agnes-studio] input:not([type="checkbox"]):not([type="radio"]):not([type="file"]),
[data-dsh-agnes-studio] select {
  height: 34px !important;
  padding: 0 12px !important;
  font-size: 12.5px !important;
}

[data-dsh-agnes-studio] textarea {
  padding: 10px 12px !important;
  font-size: 12.5px !important;
  line-height: 1.6 !important;
  resize: vertical;
}

/* ── 2 · 占位符 ─────────────────────────────────────────────────────── */
[data-dsh-agnes-studio] input::placeholder,
[data-dsh-agnes-studio] textarea::placeholder {
  color: rgba(180, 194, 220, 0.42) !important;
}

/* ── 3 · 聚焦态：单一强调色（靛蓝） ──────────────────────────────────── */
[data-dsh-agnes-studio] input:not([type="checkbox"]):not([type="radio"]):not([type="file"]):focus,
[data-dsh-agnes-studio] textarea:focus,
[data-dsh-agnes-studio] select:focus {
  border-color: rgba(124, 148, 255, 0.7) !important;
  background: rgba(255, 255, 255, 0.085) !important;
  box-shadow: 0 0 0 3px rgba(98, 122, 255, 0.18), inset 0 1px 0 rgba(255, 255, 255, 0.08) !important;
  outline: none !important;
}

/* ── 4 · 下拉框：去掉系统箭头，换成内联 SVG ──────────────────────────── */
[data-dsh-agnes-studio] select {
  appearance: none !important;
  -webkit-appearance: none !important;
  padding-right: 32px !important;
  background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 16 16' fill='none' stroke='%23b7c4dc' stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M4 6l4 4 4-4'/%3E%3C/svg%3E") !important;
  background-repeat: no-repeat !important;
  background-position: right 11px center !important;
  background-size: 12px 12px !important;
  cursor: pointer;
}
[data-dsh-agnes-studio] select option {
  background: #1b2132;
  color: #eef2fa;
}

/* ── 5 · 文件选择 ───────────────────────────────────────────────────── */
[data-dsh-agnes-studio] input[type="file"] {
  background: rgba(255, 255, 255, 0.045) !important;
  border: 1px dashed rgba(255, 255, 255, 0.16) !important;
  border-radius: 12px !important;
  color: rgba(214, 224, 244, 0.62) !important;
  font-size: 11.5px !important;
  font-family: inherit !important;
  padding: 6px 8px !important;
  width: 100%;
  box-sizing: border-box;
  cursor: pointer;
}
[data-dsh-agnes-studio] input[type="file"]::file-selector-button {
  margin-right: 10px !important;
  padding: 5px 13px !important;
  border-radius: 9px !important;
  border: 1px solid rgba(140, 170, 255, 0.4) !important;
  background: linear-gradient(180deg, rgba(126, 154, 255, 0.34), rgba(98, 128, 240, 0.22)) !important;
  color: #f0f4ff !important;
  font-size: 11.5px !important;
  font-family: inherit !important;
  cursor: pointer;
  transition: background 0.15s ease;
}
[data-dsh-agnes-studio] input[type="file"]::file-selector-button:hover {
  background: linear-gradient(180deg, rgba(146, 172, 255, 0.46), rgba(112, 142, 250, 0.3)) !important;
}
[data-dsh-agnes-studio] input[type="file"]::-webkit-file-upload-button {
  margin-right: 10px;
  padding: 5px 13px;
  border-radius: 9px;
  border: 1px solid rgba(140, 170, 255, 0.4);
  background: rgba(112, 142, 250, 0.28);
  color: #f0f4ff;
  font-size: 11.5px;
  font-family: inherit;
  cursor: pointer;
}

/* ── 6 · 勾选框 / 单选框 ────────────────────────────────────────────── */
[data-dsh-agnes-studio] input[type="checkbox"],
[data-dsh-agnes-studio] input[type="radio"] {
  accent-color: #6f8cff !important;
  cursor: pointer;
}

/* ── 7 · 表单里的裸按钮（没带 agnes-btn 的）也统一成次要按钮外观 ──────── */
[data-dsh-agnes-studio] .agnes-split-params-body button:not(.agnes-btn):not(.agnes-split-toggle):not([class*="card"]):not([class*="tab"]),
[data-dsh-agnes-studio] .toolbox-page button:not(.agnes-btn):not([class*="tab"]):not([class*="type"]) {
  border-radius: 10px !important;
  border: 1px solid rgba(255, 255, 255, 0.14) !important;
  background: rgba(255, 255, 255, 0.07) !important;
  color: rgba(234, 240, 255, 0.9) !important;
  font-size: 12px !important;
  font-family: inherit !important;
}
`

/**
 * 自定义文件选择器（FileField）—— 完全替掉原生控件，
 * 文案是中文、配色是深色玻璃，不再出现 "Choose File / No file chosen"。
 */
export const fileFieldStyles = `
[data-dsh-agnes-studio] .agnes-file {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  width: 100%;
  box-sizing: border-box;
  padding: 5px 6px 5px 5px;
  border-radius: 12px;
  border: 1px dashed rgba(255, 255, 255, 0.13);
  background: rgba(255, 255, 255, 0.03);
  cursor: pointer;
  transition: border-color 0.15s ease, background 0.15s ease;
}
[data-dsh-agnes-studio] .agnes-file:hover {
  border-color: rgba(140, 170, 255, 0.45);
  background: rgba(255, 255, 255, 0.05);
}
[data-dsh-agnes-studio] .agnes-file-btn {
  flex: 0 0 auto;
  padding: 5px 12px;
  border-radius: 9px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.08);
  color: rgba(238, 242, 250, 0.92);
  font-size: 11.5px;
  white-space: nowrap;
}
[data-dsh-agnes-studio] .agnes-file:hover .agnes-file-btn {
  border-color: rgba(140, 170, 255, 0.4);
  background: rgba(126, 154, 255, 0.16);
}
[data-dsh-agnes-studio] .agnes-file-name {
  flex: 1 1 auto;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 11.5px;
  color: rgba(180, 194, 220, 0.55);
}
[data-ag-theme="light"] [data-dsh-agnes-studio] .agnes-file {
  border-color: rgba(16, 24, 40, 0.16);
  background: #fff;
}
[data-ag-theme="light"] [data-dsh-agnes-studio] .agnes-file-btn {
  background: #f2f4f7;
  border-color: rgba(16, 24, 40, 0.14);
  color: #344054;
}
[data-ag-theme="light"] [data-dsh-agnes-studio] .agnes-file-name { color: #667085; }
`

/**
 * 参数列里不要再套一层卡片。
 *
 * 旧的各面板都有 `.wechat-section / .parse-section / .split-section / ...`，
 * 它们自带边框+底色（当年是整页扁平排布时的分区手段）。放进已经成卡片的参数列后
 * 就变成"卡片套卡片"，视觉上多一圈的框。这里只去掉外层装饰，不动结构。
 */
export const flatSectionsStyles = `
[data-dsh-agnes-studio] .agnes-split-params-body > .wechat-section,
[data-dsh-agnes-studio] .agnes-split-params-body > .parse-section,
[data-dsh-agnes-studio] .agnes-split-params-body > .split-section,
[data-dsh-agnes-studio] .agnes-split-params-body > .deai-section,
[data-dsh-agnes-studio] .agnes-split-params-body > .vpt-section,
[data-dsh-agnes-studio] .agnes-split-params-body > .bgvideo-section,
[data-dsh-agnes-studio] .agnes-split-params-body > .mv-section,
[data-dsh-agnes-studio] .agnes-split-params-body > .agnes-section,
[data-dsh-agnes-studio] .agnes-split-params-body > .vidbee-form,
[data-dsh-agnes-studio] .agnes-split-params-body > .tts-form,
[data-dsh-agnes-studio] .agnes-split-params-body > .broll-panel {
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  padding: 0 !important;
  margin: 0 !important;
  border-radius: 0 !important;
}
[data-dsh-agnes-studio] .agnes-split-params-body > .wechat-section > h4,
[data-dsh-agnes-studio] .agnes-split-params-body > .parse-section > h4,
[data-dsh-agnes-studio] .agnes-split-params-body > .split-section > h4,
[data-dsh-agnes-studio] .agnes-split-params-body > .bgvideo-section > h4,
[data-dsh-agnes-studio] .agnes-split-params-body > .mv-section > h4,
[data-dsh-agnes-studio] .agnes-split-params-body > .vpt-section > h4 {
  margin: 0 0 8px;
  font-size: 12px;
  font-weight: 600;
  color: rgba(226, 232, 245, 0.82);
  letter-spacing: 0.01em;
}
`
