/**
 * 左导航 rail —— 两列网格重排。
 *
 * 问题：模块从 7 个长到 16 个，原来的单列竖条在 800–900px 高的面板里装不下，
 * 溢出部分被容器裁掉且滚动条被隐藏（09-contrast 里 `::-webkit-scrollbar{display:none}`），
 * 底部的「设置」根本看不到 —— 看起来像界面被切坏了。
 *
 * 解法：不改模块数量，改排布。两列网格 + 组标题横跨两列，
 * 16 项从 ~16 行压到 ~8 行，常见面板高度下一屏放得下。
 * 视觉仍是 14-spatial 定义的玻璃竖条（这里只覆盖排布相关的属性）。
 */
export const RAIL_GRID_CSS = `
.agnes-rail {
  flex: 0 0 132px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  align-content: start;
  gap: 6px;
  padding: 12px 10px;
  overflow-y: auto;
  scrollbar-width: thin;
}

/* 溢出时给一条可见的细滚动条（此前被完全隐藏，等于没有提示） */
.agnes-rail::-webkit-scrollbar { display: block; width: 4px; }
.agnes-rail::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.16);
  border-radius: 99px;
}
.agnes-rail::-webkit-scrollbar-track { background: transparent; }

/* 分组容器不再自成一块，让组标题与导航项一起进网格 */
.agnes-rail-group { display: contents; }

.agnes-rail-group-label {
  grid-column: 1 / -1;
  padding: 8px 2px 2px;
  text-align: left;
  font-size: 9.5px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.agnes-rail-spacer {
  grid-column: 1 / -1;
  flex: none;
  height: 8px;
  min-height: 0;
}

.agnes-rail-item {
  padding: 9px 4px;
  gap: 5px;
  font-size: 10.5px;
  font-weight: 600;
}

.agnes-rail-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 18px;
  filter: none;
}

.agnes-rail-label {
  line-height: 1.1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

/* 标题栏品牌图标与导航图标一样走 currentColor */
.agnes-titlebar-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.agnes-titlebar-icon svg { display: block; }
`
