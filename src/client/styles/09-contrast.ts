/**
 * 对比度修复
 *
 * 层叠顺序：第 9/12 层（顺序即生效顺序，后写的覆盖先写的）。
 * 由原 styles.ts 第 3671-3831 行机械切分而来，内容逐字未改。
 */
export const CONTRAST_CSS = `/* ═══════════════════════════════════════════════════════════════════════
   v6 — 结构大动：顶部标签 → 左侧竖向导航栏
   内容区因此拿到完整宽度（画布/封面/短剧尤其受益）。
   ═══════════════════════════════════════════════════════════════════════ */

.agnes-shell {
  flex: 1;
  min-height: 0;
  display: flex;
  overflow: hidden;
}

.agnes-rail {
  flex: 0 0 88px;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 6px;
  padding: 14px 10px;
  background: rgba(255, 255, 255, 0.55);
  border-right: 1px solid var(--ag-line);
  overflow-y: auto;
  scrollbar-width: none;
}

.agnes-rail::-webkit-scrollbar { display: none; }

.agnes-rail-spacer { flex: 1; min-height: 10px; }

/* 导航分组：组内紧凑，组间靠标题与间距拉开层级 */
.agnes-rail-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.agnes-rail-group-label {
  padding: 6px 0 2px;
  text-align: center;
  font-size: 9.5px;
  letter-spacing: 0.12em;
  color: var(--ag-text-3, rgba(169, 169, 196, 0.55));
  user-select: none;
}

.agnes-rail-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding: 11px 6px;
  border: 1px solid transparent;
  border-radius: 14px;
  background: transparent;
  color: var(--ag-muted);
  font-family: inherit;
  font-size: 11.5px;
  font-weight: 600;
  cursor: pointer;
  position: relative;
  transition: all 0.16s var(--ag-ease);
}

.agnes-rail-icon {
  font-size: 20px;
  line-height: 1;
  filter: grayscale(0.25);
}

.agnes-rail-label { line-height: 1; letter-spacing: 0.01em; }

.agnes-rail-item:hover {
  background: #ffffff;
  border-color: var(--ag-line);
  color: var(--ag-t1);
  box-shadow: 0 6px 16px -12px rgba(24, 50, 100, 0.6);
}

.agnes-rail-item:hover .agnes-rail-icon { filter: none; }

.agnes-rail-item.active {
  background: #ffffff;
  border-color: var(--ag-line-2);
  color: var(--ag-t1);
  box-shadow: 0 10px 24px -16px rgba(24, 50, 100, 0.7);
  animation: ag-glow-breathe 3.6s ease-in-out infinite;
}


.agnes-rail-item.active .agnes-rail-icon { filter: none; }

/* module colour bar marks the current module */
.agnes-rail-item.active::before {
  content: '';
  position: absolute;
  left: -10px;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 26px;
  border-radius: 0 4px 4px 0;
  background: linear-gradient(180deg, var(--ag-mod), var(--ag-mod-2));
  box-shadow: 0 0 12px var(--ag-mod-glow);
}

.agnes-titlebar-spacer { flex: 1; }

.agnes-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* module name shown in the header, next to the product name */
.agnes-titlebar-module {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 4px 12px;
  border-radius: 999px;
  background: var(--ag-mod-soft);
  border: 1px solid var(--ag-mod);
  font-family: var(--ag-font-mono);
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--ag-mod-ink, #0e7490) !important;
}


.agnes-titlebar-module::before {
  content: '';
  width: 6px;
  height: 6px;
  border-radius: 50%;
  box-shadow: 0 0 8px var(--ag-mod-glow);
  background: var(--ag-mod-ink, #0e7490);
}


/* content surfaces now sit beside the rail */




/* --- module-tinted TEXT uses the dark ink variant (contrast) ---------- */









/* --- filled gradient chips keep WHITE text (ink is for tinted surfaces) --- */

/* tinted (non-gradient) chips take the dark ink */
.agnes-model-tag:not(.agnes-model-tag-free) {
  color: var(--ag-mod-ink, #0e7490) !important;
  background: var(--ag-mod-soft) !important;
  border-color: var(--ag-mod, #0891b2) !important;
}



.agnes-tabbar {
  padding: 12px 20px 0;
  background: rgba(255, 255, 255, 0.42);
  border-bottom: 1px solid var(--ag-line);
  color: var(--ag-muted);
  display: none;
}
`
