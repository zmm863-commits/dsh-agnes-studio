/**
 * 模块内强调色统一（第 30 层）。
 *
 * 口播的「画面模式」卡片选中态用的是 `--ag-mod / --ag-mod-2`，这两个变量在口播
 * 模块下是荧光绿 —— 与全局唯一的靛蓝强调色冲突，看起来像另一个产品。这里把
 * 选中态收敛到主强调色（靛蓝 → 青），并顺带修掉大屏下卡片被裁切的问题。
 */
export const moduleAccentStyles = `
/* ── 模式卡片：选中态走主强调色 ─────────────────────────────────────── */
[data-dsh-agnes-studio] .agnes-mode-card.active {
  background: linear-gradient(135deg, rgba(96, 120, 255, 0.92), rgba(120, 150, 255, 0.82) 55%, rgba(64, 203, 226, 0.75)) !important;
  border-color: rgba(150, 175, 255, 0.55) !important;
  color: #ffffff !important;
  box-shadow: 0 12px 26px -16px rgba(80, 110, 255, 0.9), inset 0 1px 0 rgba(255, 255, 255, 0.22) !important;
}
[data-dsh-agnes-studio] .agnes-mode-card.active .agnes-mode-icon,
[data-dsh-agnes-studio] .agnes-mode-card.active .agnes-mode-desc {
  color: rgba(244, 248, 255, 0.9) !important;
}
[data-dsh-agnes-studio] .agnes-mode-card {
  background: rgba(255, 255, 255, 0.045) !important;
  border: 1px solid rgba(255, 255, 255, 0.09) !important;
}
[data-dsh-agnes-studio] .agnes-mode-card:hover {
  border-color: rgba(140, 170, 255, 0.45) !important;
  background: rgba(255, 255, 255, 0.075) !important;
}
[data-dsh-agnes-studio] .agnes-mode-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
}
[data-dsh-agnes-studio] .agnes-mode-icon svg { width: 18px; height: 18px; }

/* ── 口播：整页可滚动，参数不再被裁掉 ──────────────────────────────── */
[data-dsh-agnes-studio] .agnes-anchor-grid {
  grid-template-columns: minmax(320px, 420px) minmax(0, 1fr) !important;
  gap: 14px !important;
  align-items: start !important;
  padding: 14px 16px 18px !important;
  overflow: auto;
  min-height: 0;
  flex: 1;
}
[data-dsh-agnes-studio] .agnes-anchor-col { min-width: 0; }

/* ── 空状态图标统一尺寸（SVG 替换 emoji 后）──────────────────────────── */
[data-dsh-agnes-studio] .agnes-empty-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
[data-dsh-agnes-studio] .agnes-empty-icon svg { width: 22px; height: 22px; }
`

/** 口播左侧栏再紧一点：三张模式卡排一行，参数才不会被挤出屏幕。 */
export const anchorCompactStyles = `
[data-dsh-agnes-studio] .agnes-mode-cards {
  grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
  gap: 8px !important;
}
[data-dsh-agnes-studio] .agnes-mode-card {
  padding: 10px 11px !important;
  gap: 4px !important;
}
[data-dsh-agnes-studio] .agnes-mode-card .agnes-mode-desc {
  font-size: 10.5px !important;
  line-height: 1.45 !important;
}
[data-dsh-agnes-studio] .agnes-anchor-col .agnes-textarea {
  min-height: 84px !important;
}
`
