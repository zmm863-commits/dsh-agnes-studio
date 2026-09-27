/**
 * 设计令牌 / overlay 容器 / 焦点环 / 滚动条 / 侧边栏入口 / 遮罩
 *
 * 层叠顺序：第 1/12 层（顺序即生效顺序，后写的覆盖先写的）。
 * 由原 styles.ts 第 9-170 行机械切分而来，内容逐字未改。
 */
export const TOKENS_CSS = `
/* ═══════════════════════════════════════════════════════════════════════
   AGNES CREATIVE STUDIO — Shell Overlay Panel
   UI 注册在 shell.overlay，不碰 conversation DOM，对话框完全不受影响。
   ═══════════════════════════════════════════════════════════════════════ */

/* --- overlay container ------------------------------------------------ */
/* The custom property --agnes-sidebar-w is set by the overlay owner in
   index.ts when the panel opens, so the window centres in the workspace and
   never covers the sidebar. */
[data-dsh-agnes-studio] {
  --ag-accent-soft: rgba(124, 92, 255, 0.16);
  --ag-glow: 0 0 24px -4px rgba(124, 92, 255, 0.65);
  --ag-kind-text: #7c5cff;
  --ag-kind-image: #22d3ee;
  --ag-kind-video: #f472b6;
  --ag-danger: #ff6b6b;
  --ag-shadow: 0 28px 90px rgba(0, 0, 0, 0.5), 0 2px 0 rgba(255, 255, 255, 0.04) inset;
  --ag-ring: 0 0 0 3px rgba(108, 92, 231, 0.35);
  position: fixed;
  top: 50%;
  left: calc(50% + var(--agnes-sidebar-w, 0px) / 2);
  transform: translate(-50%, -50%);
  width: min(calc(100vw - var(--agnes-sidebar-w, 0px) - 32px), 1400px);
  height: min(90vh, 880px);
  border-radius: var(--ag-radius-lg);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  z-index: 9999;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
  animation: agnes-studio-enter 0.25s ease-out;
  --ag-bg: #eef3fb;
  --ag-bg-1: #e5ecf8;
  --ag-bg-2: #dae4f5;
  --ag-panel: rgba(255, 255, 255, 0.72);
  --ag-panel-solid: #ffffff;
  --ag-panel-strong: rgba(255, 255, 255, 0.94);
  --ag-line: rgba(32, 74, 150, 0.15);
  --ag-line-2: rgba(32, 96, 190, 0.32);
  --ag-t1: #0c1a33;
  --ag-t2: #2a3c5e;
  --ag-muted: #566a8d;
  --ag-dim: #6e80a3;
  --ag-accent: #0891b2;
  --ag-accent-2: #7c3aed;
  --ag-accent-3: #db2777;
  --ag-ok: #0f9d58;
  --ag-warn: #a16207;
  --ag-grad: linear-gradient(120deg, #0891b2, #7c3aed);
  --ag-grad-3: linear-gradient(120deg, #0891b2, #7c3aed 55%, #db2777);
  --ag-glow-accent: 0 10px 26px -14px rgba(8, 145, 178, 0.55);
  --ag-glow-soft: 0 18px 44px -24px rgba(24, 50, 100, 0.30);
  --ag-radius: 16px;
  --ag-radius-sm: 10px;
  --ag-radius-lg: 24px;
  --ag-font-mono: ui-monospace, "JetBrains Mono", "SF Mono", SFMono-Regular, Menlo, Consolas, monospace;
  --ag-ease: cubic-bezier(0.22, 0.61, 0.36, 1);
  --ag-surface-0: #eef3fb;
  --ag-surface-1: rgba(255, 255, 255, 0.72);
  --ag-surface-2: rgba(255, 255, 255, 0.55);
  --ag-surface-3: rgba(255, 255, 255, 0.85);
  --ag-surface-4: #ffffff;
  --ag-text: #0c1a33;
  --ag-text-2: #2a3c5e;
  --ag-text-3: #6e80a3;
  --ag-line-strong: rgba(32, 96, 190, 0.32);
  background:
    radial-gradient(900px 420px at 12% -8%, rgba(8, 145, 178, 0.14), transparent 62%),
    radial-gradient(760px 400px at 88% -6%, rgba(124, 58, 237, 0.13), transparent 62%),
    linear-gradient(180deg, #f4f8ff 0%, #e8eefa 55%, #e2e9f7 100%);
  border: 1px solid rgba(255, 255, 255, 0.9);
  box-shadow:
    0 40px 110px -30px rgba(20, 45, 95, 0.45),
    0 0 0 1px rgba(32, 74, 150, 0.10),
    inset 0 1px 0 #ffffff;
  color: var(--ag-t1);
}


/* ─── 尺寸档位 ─────────────────────────────────────────────────────────────
   由标题栏的「🪟」按钮循环切换（紧凑 → 标准 → 全屏），选择写进 localStorage。
   「标准」就是上面的默认规则，这里只补另外两档。                            */

/* 紧凑：小屏，或只想快速取用一次 */
[data-dsh-agnes-studio][data-ag-size="compact"] {
  width: min(calc(100vw - var(--agnes-sidebar-w, 0px) - 32px), 1040px);
  height: min(74vh, 700px);
}

/* 全屏：占满侧边栏右侧的全部空间（去圆角、去外阴影，三边贴边） */
[data-dsh-agnes-studio][data-ag-size="full"] {
  top: 0;
  left: var(--agnes-sidebar-w, 0px);
  transform: none;
  width: calc(100vw - var(--agnes-sidebar-w, 0px));
  height: 100vh;
  border-radius: 0;
  border-top: none;
  border-right: none;
  border-bottom: none;
  box-shadow: none;
}

/* Keyboard focus ring, applied consistently across the panel. */
[data-dsh-agnes-studio] :focus-visible {
  outline: none;
  border-radius: var(--ag-radius-sm);
  box-shadow: 0 0 0 3px rgba(8, 145, 178, 0.3);
}


/* Slim theme-matched scrollbars instead of the raw OS bar. */
[data-dsh-agnes-studio] ::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}

[data-dsh-agnes-studio] ::-webkit-scrollbar-track {
  background: transparent;
}

[data-dsh-agnes-studio] ::-webkit-scrollbar-thumb {
  border: 3px solid transparent;
  border-radius: 99px;
  background: rgba(32, 74, 150, 0.22);
  background-clip: content-box;
}


[data-dsh-agnes-studio] ::-webkit-scrollbar-thumb:hover {
  background: rgba(32, 74, 150, 0.4);
  background-clip: content-box;
}


@keyframes agnes-studio-enter {
  from { opacity: 0; transform: translate(-50%, -50%) scale(0.96); }
  to   { opacity: 1; transform: translate(-50%, -50%) scale(1); }
}

/* --- sidebar entry row (own styles — no dependency on other plugins) --- */

.agnes-entry {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  height: 32px;
  padding: 0 12px;
  background: transparent;
  border: none;
  /* NOTE: .agnes-entry lives in the DSH sidebar, OUTSIDE this panel, so it
     cannot read our --ag-* tokens (they are scoped to the panel root). It must
     keep the host theme tokens or it renders dark-on-dark and disappears. */
  border-radius: 8px;
  color: var(--dsw-alias-label-secondary, #9a9ab0);
  cursor: pointer;
  font-size: 13px;
  font-family: inherit;
  white-space: nowrap;
  transition: background-color .12s ease, color .12s ease;
}

.agnes-entry:hover {
  background: var(--dsw-specific-sidebar-nav-item-hover, rgba(127,127,137,.12));
  color: var(--dsw-alias-label-primary, #e6e6ef);
}

.agnes-entry[data-active] {
  background: var(--dsw-specific-sidebar-nav-item-active, rgba(108,92,231,.18));
  color: var(--dsw-alias-brand-primary, #a29bfe);
  font-weight: 600;
}

.agnes-entry-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  flex: 0 0 16px;
}

.agnes-entry-label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* backdrop */
[data-dsh-agnes-backdrop] {
  position: fixed;
  inset: 0;
  z-index: 9998;
  animation: agnes-backdrop-enter 0.2s ease-out;
  background: rgba(2, 6, 16, 0.20) !important;
  backdrop-filter: blur(1.5px);
}


@keyframes agnes-backdrop-enter {
  from { opacity: 0; }
  to   { opacity: 1; }
}

`
