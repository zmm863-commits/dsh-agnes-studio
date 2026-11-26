/**
 * 按钮统一（第 29 层）—— 深色主题下的次要按钮 / 幽灵按钮。
 *
 * 03-layout.ts 把 `.agnes-btn-secondary` 写成纯白底（`background:#fff !important`），
 * 10-gradients.ts 里虽然有深色版本，但选择器挂在 `[data-ag-theme="dark"]` 上 ——
 * 实际运行时宿主用的是 `data-dsh-theme`，那个属性根本不存在，所以深色下从来没生效。
 * 结果就是设置页、工具箱里一排"白胶囊"按钮，和玻璃界面完全不搭。
 *
 * 这一层按 `html:not([data-dsh-theme="light"])` 重新定义，浅色主题保持原样。
 */
export const buttonStyles = `
/* ── 次要按钮：浅色叠加，不是纯白 ───────────────────────────────────── */
[data-dsh-agnes-studio] .agnes-btn-secondary {
  background: rgba(255, 255, 255, 0.075) !important;
  border: 1px solid rgba(255, 255, 255, 0.14) !important;
  color: rgba(234, 240, 252, 0.88) !important;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08) !important;
}
[data-dsh-agnes-studio] .agnes-btn-secondary:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.13) !important;
  border-color: rgba(140, 170, 255, 0.5) !important;
  color: #ffffff !important;
}

/* ── 幽灵按钮：只留描边 ────────────────────────────────────────────── */
[data-dsh-agnes-studio] .agnes-btn-ghost {
  background: transparent !important;
  border: 1px solid rgba(255, 255, 255, 0.13) !important;
  color: rgba(226, 233, 248, 0.82) !important;
  box-shadow: none !important;
}
[data-dsh-agnes-studio] .agnes-btn-ghost:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.08) !important;
  border-color: rgba(140, 170, 255, 0.45) !important;
  color: #ffffff !important;
}

/* ── 主按钮：单一强调色渐变（靛蓝 → 青），不做纯白 ──────────────────── */
[data-dsh-agnes-studio] .agnes-btn-primary {
  background: linear-gradient(135deg, #5a6bf0 0%, #6b7dfa 52%, #2fbcd6 130%) !important;
  border: 1px solid rgba(150, 175, 255, 0.42) !important;
  color: #ffffff !important;
  border-radius: 999px !important;
  box-shadow: 0 10px 22px -16px rgba(70, 100, 240, 0.95), inset 0 1px 0 rgba(255, 255, 255, 0.2) !important;
}
[data-dsh-agnes-studio] .agnes-btn-primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #6a7bf5 0%, #7b8dff 52%, #40cbe2 130%) !important;
}
[data-dsh-agnes-studio] .agnes-btn:disabled {
  opacity: 0.45 !important;
  filter: saturate(0.6);
}

/* ── 小号按钮不要被拉成圆形胶囊 ─────────────────────────────────── */
[data-dsh-agnes-studio] .agnes-btn-sm {
  border-radius: 10px !important;
  height: 30px !important;
  padding: 0 12px !important;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.14) !important;
}

/* ── 配置行里的按钮排成一行等宽 ──────────────────────────────────── */
[data-dsh-agnes-studio] .agnes-mcfg-row .agnes-btn {
  border-radius: 10px !important;
  white-space: nowrap;
}

/* ── 徽标 / 状态胶囊：深色下别用白底 ────────────────────────────────── */
[data-dsh-agnes-studio] .agnes-badge,
[data-dsh-agnes-studio] .wechat-badge,
[data-dsh-agnes-studio] .split-badge,
[data-dsh-agnes-studio] .parse-badge,
[data-dsh-agnes-studio] .bgvideo-badge,
[data-dsh-agnes-studio] .mv-badge {
  background: rgba(255, 255, 255, 0.09) !important;
  border: 1px solid rgba(255, 255, 255, 0.12) !important;
  color: rgba(226, 233, 248, 0.85) !important;
  border-radius: 999px !important;
}
`
