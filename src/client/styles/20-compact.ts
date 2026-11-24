/**
 * 创作区「一屏」布局（第 20 层）。
 *
 * 目标：生图 / 生视频的核心流程 —— 提示词、模型、尺寸、比例、参考图、生成 ——
 * 在 1000px 高的窗口里**不用滚动**就能全部看到，生成在底部 dock。
 *
 * 做法是把参数卡的度量压到"信息密度优先"：
 *   区块间距 16 → 10，标题 13 → 12，输入框最小高 96 → 68，
 *   尺寸/比例改成三列 28px 的小胶囊，参考图 54px。
 * 只作用于浮起的参数卡（.agnes-right），不影响其它面板里的同名控件。
 */
export const COMPACT_CSS = `
[data-dsh-agnes-studio] .agnes-right-scroll {
  padding: 12px 12px 14px;
}

[data-dsh-agnes-studio] .agnes-right .agnes-section {
  padding: 0 0 8px;
  margin: 0 0 8px;
}
[data-dsh-agnes-studio] .agnes-right .agnes-section:last-child {
  padding-bottom: 0;
  margin-bottom: 0;
}
[data-dsh-agnes-studio] .agnes-right .agnes-section-title {
  padding: 0 0 5px;
  font-size: 12px;
}
[data-dsh-agnes-studio] .agnes-right .agnes-section-title::before {
  height: 11px;
}
[data-dsh-agnes-studio] .agnes-right .agnes-divider {
  margin: 2px 0 10px;
}

/* 提示词输入：够用就好，别把半屏吃掉 */
[data-dsh-agnes-studio] .agnes-right .agnes-textarea {
  height: 60px;
  min-height: 60px;
  padding: 8px 10px;
  font-size: 12px;
  line-height: 1.55;
}

/* 尺寸 / 宽高比：三列小胶囊，两行装完 */
[data-dsh-agnes-studio] .agnes-right .agnes-size-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 5px;
}
[data-dsh-agnes-studio] .agnes-right .agnes-ratio-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 5px;
}
[data-dsh-agnes-studio] .agnes-right .agnes-size-btn,
[data-dsh-agnes-studio] .agnes-right .agnes-ratio-btn {
  height: 24px;
  padding: 0 6px;
  border-radius: 8px;
  font-size: 10.5px;
  font-weight: 500;
  white-space: nowrap;
}

/* 模型下拉与标签 */
[data-dsh-agnes-studio] .agnes-right .agnes-model-select {
  height: 34px;
  padding: 0 10px;
  font-size: 12px;
  border-radius: 12px;
}
[data-dsh-agnes-studio] .agnes-right .agnes-model-info { display: none; }
[data-dsh-agnes-studio] .agnes-right .agnes-model-tag {
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 8px;
}

/* 参考图：一行缩略图，别占一整块 */
[data-dsh-agnes-studio] .agnes-right .agnes-ref-chips {
  gap: 6px;
}
[data-dsh-agnes-studio] .agnes-right .agnes-ref-chip,
[data-dsh-agnes-studio] .agnes-right .agnes-ref-chip-add {
  width: 44px;
  height: 44px;
  border-radius: 11px;
}

/* 建议词胶囊 */
[data-dsh-agnes-studio] .agnes-right .agnes-chip {
  height: 24px;
  padding: 0 9px;
  font-size: 11px;
  letter-spacing: 0;
  text-transform: none;
  white-space: nowrap;
}
[data-dsh-agnes-studio] .agnes-right .agnes-chip-row,
[data-dsh-agnes-studio] .agnes-right [class*="chip-row"] {
  flex-wrap: nowrap;
  overflow-x: auto;
  scrollbar-width: none;
}
[data-dsh-agnes-studio] .agnes-right [class*="chip-row"]::-webkit-scrollbar { display: none; }

/* 模型信息：不是主流程，压成两行灰字 */
[data-dsh-agnes-studio] .agnes-right .agnes-section:last-child > div:last-child {
  font-size: 11px !important;
  line-height: 1.5 !important;
}
`
