/**
 * 动效（扫光 / 呼吸辉光 / 选中态）+ 无障碍
 *
 * 层叠顺序：第 11/12 层（顺序即生效顺序，后写的覆盖先写的）。
 * 由原 styles.ts 第 4204-4393 行机械切分而来，内容逐字未改。
 */
export const MOTION_CSS = `/* ═══════════════════════════════════════════════════════════════════════
   v8 — 闪光层（边框 / 按钮 / 卡片）
   ① 旋转渐变描边（@property 驱动 --ag-angle）
   ② 扫光（sheen）扫过按钮
   ③ 脉冲辉光（CTA 常驻 + hover 增强）
   全部动画都受 prefers-reduced-motion 保护。
   ═══════════════════════════════════════════════════════════════════════ */

@property --ag-angle {
  syntax: '<angle>';
  initial-value: 0deg;
  inherits: false;
}

@keyframes ag-border-spin {
  to { --ag-angle: 360deg; }
}

@keyframes ag-sheen {
  0%   { transform: translateX(-130%) skewX(-18deg); opacity: 0; }
  12%  { opacity: 1; }
  100% { transform: translateX(230%) skewX(-18deg); opacity: 0; }
}

@keyframes ag-pulse {
  0%, 100% { box-shadow: 0 12px 30px -14px var(--ag-glow, rgba(34,211,238,0.7)), 0 0 0 0 rgba(34, 211, 238, 0); }
  50%      { box-shadow: 0 16px 38px -12px var(--ag-glow, rgba(34,211,238,0.9)), 0 0 0 5px rgba(34, 211, 238, 0.10); }
}

@keyframes ag-glow-breathe {
  0%, 100% { box-shadow: 0 0 0 1px var(--ag-line-2), 0 18px 44px -26px rgba(0, 0, 0, 0.9); }
  50%      { box-shadow: 0 0 0 1px var(--ag-accent, #22d3ee), 0 0 26px -8px var(--ag-glow, rgba(34,211,238,0.7)), 0 18px 44px -26px rgba(0,0,0,0.9); }
}

@keyframes ag-corner-flash {
  0%, 100% { opacity: 0.45; filter: drop-shadow(0 0 5px var(--ag-glow, rgba(34,211,238,0.5))); }
  50%      { opacity: 1;    filter: drop-shadow(0 0 12px var(--ag-glow, rgba(34,211,238,0.95))); }
}

/* ── ① 按钮：扫光 + 旋转描边 + 脉冲 ─────────────────────────────────── */


/* 扫光条：默认藏在左边，hover 时扫过；CTA 常驻慢速循环 */
.agnes-btn::after {
  content: '';
  position: absolute;
  top: -20%;
  bottom: -20%;
  left: 0;
  width: 45%;
  border-radius: 999px;
  background: linear-gradient(100deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.42) 45%,
    rgba(255, 255, 255, 0.75) 50%,
    rgba(255, 255, 255, 0.42) 55%,
    rgba(255, 255, 255, 0) 100%);
  transform: translateX(-130%) skewX(-18deg);
  opacity: 0;
  pointer-events: none;
  z-index: 2;
}

.agnes-btn:not(:disabled):hover::after {
  animation: ag-sheen 0.85s cubic-bezier(0.22, 0.61, 0.36, 1);
}

/* 主 CTA：常驻缓慢扫光，让人一眼看到"这就是主操作" */
.agnes-btn-primary:not(:disabled)::after {
  animation: ag-sheen 4.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
}

.agnes-btn-primary:not(:disabled) {
  position: relative;
  border: 1.5px solid transparent !important;
  background:
    linear-gradient(120deg, var(--ag-mod, #22d3ee), var(--ag-mod-2, #8b5cf6)) padding-box,
    conic-gradient(from var(--ag-angle),
      rgba(255, 255, 255, 0.15),
      var(--ag-accent, #22d3ee),
      rgba(255, 255, 255, 0.9),
      var(--ag-accent-2, #8b5cf6),
      rgba(255, 255, 255, 0.15) 100%) border-box !important;
  animation: ag-border-spin 3.6s linear infinite, ag-pulse 3s ease-in-out infinite;
}



/* 次级/幽灵：hover 时描边亮起 + 扫光 */
.agnes-btn-secondary:not(:disabled):hover
{
  box-shadow: 0 0 0 1px var(--ag-accent), 0 0 20px -6px var(--ag-glow, rgba(34,211,238,0.7)) !important;
}

/* ── ② 卡片：边框呼吸辉光 + HUD 角标闪烁 ───────────────────────────── */
.agcv-card,
.agnes-anchor-card,
.agdp-next,
.agnes-anchor-side,
.agcv-preview {
  transition: box-shadow 0.25s ease, border-color 0.25s ease;
}

.agcv-card:hover,
.agnes-anchor-card:hover,
.agdp-next:hover {
  border-color: var(--ag-accent) !important;
  box-shadow:
    0 0 0 1px var(--ag-accent),
    0 0 28px -8px var(--ag-glow, rgba(34,211,238,0.75)),
    0 24px 60px -30px rgba(0, 0, 0, 0.95) !important;
}

/* HUD 角标：缓慢闪烁，像仪器指示灯 */
.agcv-card::before,
.agcv-card::after,
.agnes-anchor-card::before,
.agnes-anchor-card::after,
.agcv-preview::before,
.agcv-preview::after,
.agnes-anchor-side::before,
.agnes-anchor-side::after {
  animation: ag-corner-flash 3.2s ease-in-out infinite;
}

/* 主 CTA 所在的强调卡片：边框呼吸 */


/* ── ③ 选中态 / 导航 / 面板边 ──────────────────────────────────────── */
.agnes-size-btn.active,
.agnes-ratio-btn.active,
.agnes-mode-btn.active,
.agcv-style.active {
  position: relative;
  overflow: hidden;
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.35), 0 10px 26px -14px var(--ag-glow, rgba(34,211,238,0.8)) !important;
}



/* 画布节点：选中时描边流光 */


/* 面板顶边：一道缓慢流动的光带 */


@keyframes ag-topflow {
  0%   { background-position: 0% 50%; }
  100% { background-position: 200% 50%; }
}



/* ── 无障碍：尊重系统"减少动态效果" ──────────────────────────────── */
@media (prefers-reduced-motion: reduce) {
  .agnes-btn::after,
  .agnes-btn-primary:not(:disabled),
  .agnes-btn-primary:not(:disabled):hover,
  .agcv-card::before, .agcv-card::after,
  .agnes-anchor-card::before, .agnes-anchor-card::after,
  .agcv-preview::before, .agcv-preview::after,
  .agnes-anchor-side::before, .agnes-anchor-side::after,
  .agdp-next.primary,
  .agnes-rail-item.active,
  .agc-node.active,
  .agnes-titlebar::after {
    animation: none !important;
  }
}



.agnes-btn-ghost:not(:disabled):hover {
  background: #ffffff !important;
  border-color: var(--ag-line-2) !important;
  color: var(--ag-t1) !important;
  box-shadow: 0 0 0 1px var(--ag-accent), 0 0 20px -6px var(--ag-glow, rgba(34,211,238,0.7)) !important;
}
`
