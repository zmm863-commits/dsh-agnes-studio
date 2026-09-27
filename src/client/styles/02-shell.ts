/**
 * 标题栏 / 首次使用引导 / 数字人口播
 *
 * 层叠顺序：第 2/12 层（顺序即生效顺序，后写的覆盖先写的）。
 * 由原 styles.ts 第 171-362 行机械切分而来，内容逐字未改。
 */
export const SHELL_CSS = `/* --- title bar -------------------------------------------------------- */
.agnes-titlebar {
  display: flex;
  align-items: center;
  gap: 10px;
  user-select: none;
  cursor: move;
  position: relative;
  height: 64px;
  flex: 0 0 64px;
  padding: 0 20px;
  background: rgba(255, 255, 255, 0.66);
  backdrop-filter: blur(14px);
  border-bottom: 1px solid var(--ag-line);
  color: var(--ag-t1);
}


.agnes-titlebar-icon {
  line-height: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 11px;
  font-size: 16px;
  background: var(--ag-grad);
  box-shadow: var(--ag-glow-accent);
}


.agnes-titlebar-text {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 15.5px;
  font-weight: 800;
  letter-spacing: -0.01em;
  background: linear-gradient(90deg, #0c1a33, #12325f);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}


.agnes-titlebar-btn {
  font-size: 13px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s ease;
  background: #ffffff;
  border: 1px solid var(--ag-line-2);
  color: var(--ag-muted);
  width: 32px;
  height: 32px;
  border-radius: 10px;
  box-shadow: 0 2px 6px -3px rgba(24, 50, 100, 0.3);
}


.agnes-titlebar-btn:hover {
  background: #fff1f2;
  border-color: rgba(219, 39, 119, 0.5);
  color: #db2777;
}


/* --- first-use API key guide ------------------------------------------ */
.agnes-keyguide {
  flex: 0 0 auto;
  margin: 10px 16px 0;
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid rgba(161, 98, 7, 0.3);
  background: linear-gradient(135deg, rgba(255, 251, 235, 0.95), rgba(254, 243, 199, 0.6));
}


.agnes-keyguide-head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.agnes-keyguide-title {
  flex: 1;
  font-size: 13px;
  font-weight: 700;
  color: #854d0e;
}


.agnes-keyguide-close {
  border: none;
  background: transparent;
  color: var(--ag-text-2, #2a3c5e);
  font-size: 12px;
  cursor: pointer;
  padding: 2px 6px;
  border-radius: 6px;
}

.agnes-keyguide-close:hover {
  background: rgba(127,127,137,0.18);
  color: var(--ag-text, #0c1a33);
}

.agnes-keyguide-steps {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.agnes-keyguide-step {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 12px;
  line-height: 1.6;
  color: var(--ag-text-2, #2a3c5e);
}

.agnes-keyguide-num {
  flex: 0 0 18px;
  width: 18px;
  height: 18px;
  margin-top: 1px;
  border-radius: 50%;
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--ag-grad);
}


.agnes-keyguide-step code {
  padding: 1px 5px;
  border-radius: 5px;
  background: rgba(127,127,137,0.2);
  font-size: 11px;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
}

.agnes-keyguide-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-top: 10px;
}

.agnes-keyguide-actions a.agnes-btn {
  text-decoration: none;
}

.agnes-keyguide-ok {
  font-size: 12px;
  color: #2ecc71;
}

.agnes-keyguide-note {
  margin-top: 8px;
  font-size: 11px;
  line-height: 1.5;
  color: var(--ag-text-3, #6e80a3);
}

.agnes-statusbar-link {
  border: none;
  background: transparent;
  color: #ffd166;
  font-size: 11px;
  cursor: pointer;
  padding: 0 4px;
  text-decoration: underline;
}

/* --- talking avatar (数字人口播) -------------------------------------- */
.agnes-anchor {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 4px 0 16px;
}

.agnes-anchor .agnes-section {
  padding: 10px 16px;
}

.agnes-anchor .agnes-textarea {
  width: 100%;
  box-sizing: border-box;
  font-family: inherit;
  line-height: 1.6;
}

.agnes-error {
  margin: 0 16px;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 12px;
  line-height: 1.5;
  border: 1px solid rgba(219, 39, 119, 0.35);
  background: rgba(253, 242, 248, 0.9);
  color: #be185d;
}


.agnes-anchor video {
  max-height: 420px;
}

`
