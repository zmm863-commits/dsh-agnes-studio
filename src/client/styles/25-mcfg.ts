/**
 * 模型配置页样式（第 25 层）。
 *
 * 这一页是「设置」的主体，信息密度比创作区高：每条厂商要放下
 * Base URL、Key、保存、测试四个控件，所以行高比别处更紧。
 */
export const MCFG_CSS = `
[data-dsh-agnes-studio] .agnes-mcfg {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 2px 0 24px;
}

[data-ag-theme="dark"][data-dsh-agnes-studio] .agnes-mcfg .agnes-section {
  padding: 14px 16px;
  margin: 0 0 12px;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.028);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08);
}

[data-ag-theme="dark"][data-dsh-agnes-studio] .agnes-mcfg-vendor,
[data-ag-theme="dark"][data-dsh-agnes-studio] .agnes-mcfg-custom,
[data-ag-theme="dark"][data-dsh-agnes-studio] .agnes-mcfg-dsh {
  padding: 10px 12px;
  margin-bottom: 8px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.07);
  background: rgba(255, 255, 255, 0.022);
}
[data-dsh-agnes-studio] .agnes-mcfg-custom,
[data-dsh-agnes-studio] .agnes-mcfg-dsh {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

[data-dsh-agnes-studio] .agnes-mcfg-head {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

[data-dsh-agnes-studio] .agnes-mcfg-name {
  font-size: 12.5px;
  font-weight: 600;
  color: #eef0f7;
  letter-spacing: -0.01em;
}

[data-ag-theme="dark"][data-dsh-agnes-studio] .agnes-mcfg .agnes-badge {
  font-size: 10px;
  letter-spacing: 0.06em;
  text-transform: none;
  padding: 2px 8px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.06);
  color: rgba(238, 240, 247, 0.6);
}
[data-ag-theme="dark"][data-dsh-agnes-studio] .agnes-mcfg .agnes-badge.agnes-mcfg-ok {
  color: #9ae6b4;
  background: rgba(126, 224, 168, 0.12);
}

[data-dsh-agnes-studio] .agnes-mcfg-row {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

[data-dsh-agnes-studio] .agnes-mcfg-row > input,
[data-dsh-agnes-studio] .agnes-mcfg-row > select {
  min-width: 0;
}

/* 窄屏：每个控件独占一行，不要挤成三条 10px 宽 */
@media (max-width: 1100px) {
  [data-dsh-agnes-studio] .agnes-mcfg-row > input,
  [data-dsh-agnes-studio] .agnes-mcfg-row > select {
    flex: 1 1 100% !important;
  }
}
`
