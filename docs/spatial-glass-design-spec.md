# 泡泡猫 · Spatial Glass 界面设计规范 v1.0

> 适用：dsh-agnes-studio（泡泡猫的影视工具）v0.7.x
> 实现文件：`src/client/styles/14-spatial.ts`
> 风格代号：J · Spatial Layered Glass
> 更新：2026-11-24

---

## 0. 一句话

**深空底 + 极光光球 + 多层毛玻璃 + 单一渐变强调色。**

画面是主角，界面是玻璃框。所有装饰都退到视觉层级之下，只留一个高饱和元素指向"下一步该点哪"。

---

## 1. 风格定义与谱系

### 1.1 正式名称

| 叫法 | 侧重 | 代表产品 |
|---|---|---|
| Glassmorphism | 玻璃材质：半透明、模糊、内高光 | macOS Big Sur、Windows 11 Mica |
| Spatial Glass / visionOS-style | 空间层次：面板浮在深度里 | Apple visionOS |
| Aurora / Mesh Gradient UI | 背景层：彩色光球大面积模糊 | Stripe、Linear 营销页 |
| Dark Layered UI | 暗底 + 逐级提亮的面板 | Raycast、Arc |
| **Spatial Layered Glass** | 以上四者的交集（本项目采用） | — |

完整英文描述：**Dark Aurora Glassmorphism with spatial depth**。

### 1.2 五个判别特征

1. **背景不是纯色**：深色底上叠 2–4 团大半径彩色模糊（`blur 100px+`），通常是紫、青、粉、橙各一团。
2. **面板半透明**：`rgba(255,255,255,0.04~0.10)` + `backdrop-filter: blur(20~30px)`。
3. **边框是内发光而非实线**：`box-shadow: inset 0 1px 0 rgba(255,255,255,.18)`，模拟光扫过玻璃棱边。
4. **层次靠位移，不靠硬阴影**：浮起元素用 `translateZ()` 或更大更软的投影，形成"离你更近"的感觉。
5. **只有一个高饱和色**：主按钮用渐变（靛蓝→青），其余全部中性。强调色稀缺才有指向性。

### 1.3 不做什么

- × 不用纯黑 `#000` 做大面积底色（会显得廉价，且光球失去层次）
- × 不用第二个高饱和色（会破坏"唯一指向"）
- × 不用实线边框定义结构（用 1px 低对比 + 内高光）
- × 不用重投影（`0 8px 24px rgba(0,0,0,.8)` 这类会让玻璃变"塑料"）
- × 不用纯白文字做正文（用 85% 透明度，留对比余量）

---

## 2. 设计令牌

### 2.1 颜色

**表面（按层级，越靠前越亮）**

| Token | 值 | 用途 |
|---|---|---|
| `--ag-surface-0` | `#0a0c16` | 容器最深底（只出现在渐变里） |
| `--ag-surface-1` | `rgba(255,255,255,0.055)` | 玻璃面板基准 |
| `--ag-surface-2` | `rgba(255,255,255,0.095)` | 悬停/激活的玻璃 |
| `--ag-surface-3` | `rgba(255,255,255,0.14)` | 浮起卡片的底 |
| `--ag-line` | `rgba(255,255,255,0.12)` | 发丝边框 |
| `--ag-line-strong` | `rgba(255,255,255,0.22)` | 激活边框 |

**文字**

| Token | 值 | 用途 |
|---|---|---|
| `--ag-text` | `#eef0f7` | 主文字（非纯白） |
| `--ag-text-2` | `rgba(238,240,247,0.62)` | 次要文字 |
| `--ag-text-3` | `rgba(238,240,247,0.48)` | 标签、元信息 |

**强调**

| Token | 值 | 用途 |
|---|---|---|
| `--ag-indigo` | `#818cf8` | 渐变起点 |
| `--ag-cyan` | `#22d3ee` | 渐变终点 |
| `--ag-grad` | `linear-gradient(100deg,#818cf8,#22d3ee)` | **只用于主按钮与进度条** |

**背景光球**

| 位置 | 颜色 | 尺寸 | 模糊 |
|---|---|---|---|
| 右上 | `rgba(99,102,241,0.26)` | 900×520 | 内联渐变 |
| 左下 | `rgba(236,72,153,0.14)` | 740×460 | 内联渐变 |
| 可选加 | `rgba(245,158,11,0.10)` | 520×320 | 内联渐变 |

### 2.2 圆角

只有三档，不允许第四种：

| Token | 值 | 用途 |
|---|---|---|
| `--ag-radius-lg` | `26px` | 面板容器 |
| `--ag-radius` | `16px` | 卡片、图片、面板内区块 |
| `--ag-radius-sm` | `12px` | 按钮、输入框、chip |

### 2.3 间距

8 的倍数，窗口内用 10/12/14 做微调：

| 场景 | 值 |
|---|---|
| 面板内边距 | `26px` |
| 卡片间距 | `13px` |
| 区块间距 | `16px` |
| 控件内边距 | `12px` |
| 标签与控件之间 | `5px` |

### 2.4 字体

```css
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI",
             "Noto Sans SC", "PingFang SC", "Microsoft YaHei", system-ui, sans-serif;
font-family-mono: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
```

| 角色 | 字号 | 字重 | 字距 |
|---|---|---|---|
| 大标题 | 28–30px | 700 | `-0.02em` |
| 区块标题 | 17px | 600 | `-0.01em` |
| 正文 | 13px | 400 | `0` |
| 控件文字 | 12px | 500 | `0` |
| 元信息 | 10–11px | 400 | `0.06em`，大写 |
| 时间码 | 10px | 400 | `0.08em`，等宽 |

### 2.5 阴影与光

```css
/* 容器：深而软，营造悬浮 */
--ag-shadow-panel:
  0 1px 0 rgba(255,255,255,0.18) inset,
  0 60px 140px -50px rgba(0,0,0,0.98);

/* 玻璃面板：只保留内高光 */
--ag-shadow-glass:
  0 1px 0 rgba(255,255,255,0.16) inset;

/* 浮起卡片：位移感 */
--ag-shadow-float:
  0 1px 0 rgba(255,255,255,0.24) inset,
  0 40px 90px -30px rgba(0,0,0,0.95);

/* 主按钮：彩色光晕 */
--ag-shadow-accent:
  0 12px 30px -14px rgba(129,140,248,0.7);
```

### 2.6 模糊

| 场景 | 值 |
|---|---|
| 面板玻璃 | `blur(24px) saturate(1.15)` |
| 标题栏 | `blur(22px) saturate(1.15)` |
| 悬浮卡片 | `blur(30px)` |
| 背景光球 | `blur(100–120px)` |

---

## 3. 层次模型

```
z 轴（从远到近）
├── 0  星点 / 极光光球（容器 background）
├── 1  玻璃面板（rail / aside / stage）
├── 2  卡片、输入框
└── 3  浮起的参数卡、底部 dock、弹层
```

规则：

- 上一层只能比下一层**更亮**（`0.055 → 0.095 → 0.14`）或**更靠近观者**（`translateZ`）。
- 同一层级内不叠加阴影，避免"塑料堆叠"。
- 浮起元素必须带**更大的柔投影**，否则会被误认为普通卡片。

---

## 4. 组件规范

### 4.1 面板容器

```css
.panel {
  background:
    radial-gradient(900px 520px at 72% -12%, rgba(99,102,241,.26), transparent 62%),
    radial-gradient(740px 460px at 8% 108%, rgba(236,72,153,.14), transparent 64%),
    radial-gradient(1.2px 1.2px at 14% 22%, rgba(255,255,255,.5), transparent),
    radial-gradient(1px 1px at 68% 12%, rgba(255,255,255,.34), transparent),
    linear-gradient(158deg, #0a0c16 0%, #0c0a18 54%, #08080f 100%);
  border: 1px solid rgba(255,255,255,.12);
  border-radius: 26px;
  box-shadow:
    0 1px 0 rgba(255,255,255,.18) inset,
    0 60px 140px -50px rgba(0,0,0,.98);
}
```

要点：星点用极小半径的 `radial-gradient` 直接叠在 `background` 列表里，**不要新增伪元素**（会和已有装饰层冲突）。

### 4.2 标题栏

```css
.titlebar {
  height: 44px;
  background: rgba(255,255,255,.035);
  backdrop-filter: blur(22px) saturate(1.15);
  border-bottom: 1px solid rgba(255,255,255,.08);
}
```

### 4.3 左侧导航（玻璃竖条）

```css
.rail {
  margin: 10px 0 10px 10px;
  border-radius: 20px;
  background: rgba(255,255,255,.055);
  border: 1px solid rgba(255,255,255,.10);
  backdrop-filter: blur(24px);
  box-shadow: 0 1px 0 rgba(255,255,255,.16) inset;
}
.rail-item { border-radius: 14px; color: rgba(238,240,247,.48); }
.rail-item:hover { background: rgba(255,255,255,.06); color: #eef0f7; }
.rail-item.active {
  background: rgba(255,255,255,.095);
  color: #eef0f7;
  box-shadow: 0 0 0 1px rgba(255,255,255,.14) inset;
}
```

要点：导航条**不贴边**，留 10px 外边距让它"浮"在容器里。

### 4.4 主按钮

```css
.btn-primary {
  background: linear-gradient(100deg, #818cf8, #22d3ee);
  color: #06070f;
  border: none;
  border-radius: 12px;
  box-shadow: 0 12px 30px -14px rgba(129,140,248,.7);
}
```

### 4.5 输入框 / 下拉

```css
.textarea, .select {
  background: rgba(255,255,255,.06);
  border: 1px solid rgba(255,255,255,.12);
  border-radius: 12px;
}
.textarea:focus, .select:focus {
  border-color: rgba(129,140,248,.55);
  box-shadow: 0 0 0 3px rgba(129,140,248,.16);
}
```

### 4.6 卡片

```css
.card {
  border-radius: 16px;
  border: 1px solid rgba(255,255,255,.10);
  background: rgba(255,255,255,.045);
}
```

### 4.7 浮起参数卡

```css
.parent { perspective: 1600px; }
.float-card {
  transform: rotateX(3deg) rotateY(-4deg) translateZ(60px);
  background: rgba(18,18,30,.72);
  border: 1px solid rgba(255,255,255,.18);
  backdrop-filter: blur(30px);
  border-radius: 22px;
  box-shadow:
    0 1px 0 rgba(255,255,255,.24) inset,
    0 40px 90px -30px rgba(0,0,0,.95);
}
```

要点：`rotate` 控制在 2–4 度。超过 5 度会显得歪，且文字抗锯齿变差。

### 4.8 滚动条

```css
::-webkit-scrollbar { width: 8px; height: 8px; }
::-webkit-scrollbar-thumb { background: rgba(255,255,255,.16); border-radius: 99px; }
::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,.26); }
::-webkit-scrollbar-track { background: transparent; }
```

---

## 5. 动效

| 场景 | 参数 |
|---|---|
| 面板出现 | `opacity 0→1` + `translateY(8px)→0`，240ms，`cubic-bezier(.22,.61,.36,1)` |
| 悬停 | `background` 150ms，不改尺寸（避免布局抖动） |
| 选中态 | `box-shadow` 180ms |
| 光球漂移（可选） | 20–30s 缓慢位移，`prefers-reduced-motion` 下禁用 |

```css
@media (prefers-reduced-motion: reduce) {
  * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
}
```

---

## 6. 可访问性

1. **对比度**：正文 `#eef0f7` 在 `#0a0c16` 上约 15:1，远超 WCAG AA。但 `rgba(255,255,255,.48)` 的元信息只有约 4.5:1，**仅用于非关键信息**。
2. **焦点环**：必须可见，不能只靠颜色变化：
   ```css
   :focus-visible { outline: 2px solid rgba(129,140,248,.85); outline-offset: 2px; }
   ```
3. **玻璃上的文字**：`backdrop-filter` 会让背景透上来，纯色文字可能对比不足。规则：玻璃面板上的文字必须 ≥ `rgba(238,240,247,.62)`。
4. **不依赖颜色**：选中态除了边框变色，还要有 `box-shadow` 或图标变化。
5. **减弱动效**：必须响应 `prefers-reduced-motion`。

---

## 7. 性能与降级

`backdrop-filter` 与大面积 `blur` 是这套风格最大的成本。实测与策略：

| 风险 | 表现 | 处理 |
|---|---|---|
| 多层 backdrop-filter | 低端核显掉帧 | 同屏最多 3 个模糊层（rail / stage / float） |
| 光球 blur 110px | 大面积高斯模糊，GPU 压力大 | 静态化：预渲染为 PNG 背景，或降到 60px |
| 嵌套 backdrop-filter | 子元素重复模糊，成本翻倍 | 子元素不再加 blur，只加半透明底色 |
| 移动端/低 DPI | 模糊计算量减半但视觉变糊 | 单栏模式关闭 rail 模糊 |

降级顺序（从高到低）：

```css
/* 1. 完整效果 */
backdrop-filter: blur(24px) saturate(1.15);

/* 2. 无 backdrop-filter 支持 */
@supports not (backdrop-filter: blur(1px)) {
  background: rgba(18,18,30,.92);
}

/* 3. 用户要求减少透明 */
@media (prefers-reduced-transparency: reduce) {
  backdrop-filter: none;
  background: #14141f;
}
```

---

## 8. 在 dsh-agnes-studio 中的落地

### 8.1 文件结构

```
src/client/styles/
  01-tokens.ts      ← 基础令牌（浅色）
  02-shell.ts
  03-layout.ts
  ...
  13-new-panels.ts
  14-spatial.ts     ← 新增：J 皮肤层（只作用暗色）
styles.ts           ← 汇总数组，顺序即层叠顺序
```

### 8.2 为什么单独一层而不是改原文件

`01–13` 层是历史叠加产物（同一个选择器被重复定义 5 次），直接改容易误伤浅色主题。新增 `14-spatial.ts` 作为**最后一层**，只覆盖暗色选择器：

```css
[data-ag-theme="dark"][data-dsh-agnes-studio] { ... }
```

这样：

- 浅色主题完全不受影响
- 出问题可以整层删除
- 未来应当按组件把这些声明合并进 `01–13`，再删掉本层

### 8.3 主题选择器

主题挂在根容器的 `data-ag-theme` 属性上：

```html
<div data-dsh-agnes-studio data-ag-theme="dark">
```

因此所有覆盖选择器都要带 `[data-ag-theme="dark"]` 前缀。

### 8.4 构建与部署

```bash
cd /root/DSH3(修改影视工具)/dsh-agnes-studio
npm run bundle                       # tsdown + build.mjs
cp -f lib/*.js /dsh/profiles/web/node_modules/dsh-agnes-studio/lib/
# 刷新浏览器（client bundle 是静态资源，无需重启 DSH 进程）
```

### 8.5 回退

```bash
# 关闭皮肤
git revert <commit>       # 或删除 14-spatial.ts 的 import

# 恢复默认浅色主题
# 编辑 src/client/panel.tsx 的 resolveTheme：return 'dark' → 'light'
```

---

## 9. 移植到其它项目

### 9.1 最小可用集

只需要三段：容器背景、玻璃面板、主按钮。其余可以逐项加。

### 9.2 换色板

```css
:root {
  --sp-indigo: #818cf8;   /* 换这里 */
  --sp-cyan:   #22d3ee;   /* 和这里 */
}
```

光球颜色也要同步换成同色系的低饱和版本，否则会打架。

### 9.3 换成浅色版

把 `--ag-surface-*` 反过来（白底 + 更低透明度的黑），光球改为浅色模糊（粉/蓝/黄），玻璃边框改用 `rgba(0,0,0,.08)`。**内高光要改成内阴影**（`inset 0 1px 0 rgba(255,255,255,.6)`），否则浅色下看不到棱边。

### 9.4 去掉 3D 透视

删除 `perspective` 和 `rotateX/rotateY`，只保留 `translateZ` 或改用更大投影。适合不想有倾斜感的场景。

---

## 10. 设计检查清单

发布前逐项确认：

- [ ] 是否只有**一个**高饱和色？其余全中性？
- [ ] 玻璃边缘是否有 `inset 0 1px 0 rgba(255,255,255,.16~.24)`？
- [ ] 圆角是否只有 26 / 16 / 12 三档？
- [ ] 边框是否都 ≤ `rgba(255,255,255,.14)`？
- [ ] 浮起元素是否有更大的柔投影？
- [ ] 同屏模糊层是否 ≤ 3 个？
- [ ] 正文对比度是否 ≥ 4.5:1？
- [ ] 焦点环是否可见且不依赖颜色？
- [ ] `prefers-reduced-motion` 是否生效？
- [ ] 浅色主题是否完全不受影响？

---

## 11. AI 提示词

### 11.1 界面设计（v0 / Figma AI / Claude）

```
Design a dark AI creative studio panel, 1180×760.
Style: Dark Aurora Glassmorphism with spatial depth.

Background: layered radial gradients — four large blurred color orbs
(violet #6366F1, cyan #0891B2, pink #EC4899, amber #F59E0B) at
blur 110px on a near-black canvas #08080F, plus a very faint starfield.

Surfaces: frosted glass — rgba(255,255,255,0.055) fill with
backdrop-filter blur(26px), 1px inner top highlight
(inset 0 1px 0 rgba(255,255,255,0.18)), 1px outer border
rgba(255,255,255,0.10). No hard shadows on inner panels.

Geometry: oversized radii — container 26px, cards 16px, controls 12px.
Left nav is a floating glass pill, not a full-height column.

Depth: the parameter card floats above the main panel, offset outward
with a stronger soft shadow (0 40px 90px -30px rgba(0,0,0,.95)),
giving a sense of z-distance. Bottom dock floats at the same depth.

Color discipline: exactly one saturated element — the primary button,
linear-gradient(100deg,#818CF8,#22D3EE) with dark text.
Everything else is neutral white at 35–95% opacity.

Typography: system sans, tight letter-spacing (-0.01em) on headings,
10–11px uppercase labels at 0.12em tracking for metadata.
```

### 11.2 代码实现（Claude Code / Cursor）

```
用 CSS 实现 Dark Aurora Glassmorphism，约束如下：

容器：
  background:
    radial-gradient(900px 520px at 72% -12%, rgba(99,102,241,.26), transparent 62%),
    radial-gradient(740px 460px at 8% 108%, rgba(236,72,153,.14), transparent 64%),
    linear-gradient(158deg,#0a0c16,#0c0a18 54%,#08080f);
  border: 1px solid rgba(255,255,255,.12);
  border-radius: 26px;
  box-shadow: 0 1px 0 rgba(255,255,255,.18) inset,
              0 60px 140px -50px rgba(0,0,0,.98);

玻璃面板：
  background: rgba(255,255,255,.055);
  backdrop-filter: blur(24px) saturate(1.15);
  border: 1px solid rgba(255,255,255,.10);
  box-shadow: 0 1px 0 rgba(255,255,255,.16) inset;

浮起卡片：
  在玻璃面板基础上，加 transform: translateZ(60px)
  （父级需要 perspective: 1600px）
  投影加深到 0 40px 90px -30px rgba(0,0,0,.95)

主按钮：
  background: linear-gradient(100deg,#818cf8,#22d3ee);
  color: #06070f; border: none; border-radius: 12px;
  box-shadow: 0 12px 30px -14px rgba(129,140,248,.7);

规则：除主按钮外不得出现第二个高饱和色；
     所有边框 ≤ rgba(255,255,255,.14)；
     圆角只用 26 / 16 / 12 三档；
     backdrop-filter 在低端设备降级为纯 rgba 填充。
```

### 11.3 图像生成（Midjourney / SD）

```
dark AI creative studio UI, glassmorphism, spatial depth,
frosted translucent panels floating over a deep space gradient,
four large blurred aurora orbs in violet cyan pink amber,
hairline inner highlights on glass edges, oversized rounded corners,
single indigo-to-cyan gradient button, minimal neutral typography,
cinematic dark ambient, ultra clean, 8k ui design shot,
--ar 16:10 --style raw
```

---

## 12. 附：为什么"内高光"是灵魂

大多数玻璃拟态只写 `backdrop-filter: blur()`，边缘是平的，看起来像贴了一层灰。这套风格的质感来自这一行：

```css
box-shadow: inset 0 1px 0 rgba(255,255,255,.18);
```

它模拟光从上方扫过玻璃的棱边。少了这行，整个界面会立刻从"玻璃"退化成"半透明色块"。同理，浮起卡片的 `inset 0 1px 0 rgba(255,255,255,.24)` 要更亮，因为它在更高的一层，受光更强。

这是本规范里最容易被忽略、但影响最大的一个细节。
