# NOTICE — 第三方代码归属

`dsh-agnes-studio`（泡泡猫的影视工具）本身以 MIT 许可发布。
自 **v0.5.0** 起，本包**全量并入**了 Oh Story 创作套件（原独立插件 `@oh-story/dsh`），
其代码与技能资料原样存放于本仓库的 `vendor/oh-story/` 目录。

## 并入内容

| 来源 | 版本 / 提交 | 许可 | 位置 |
|---|---|---|---|
| `@oh-story/dsh`（npm） | 0.1.9 | MIT | `vendor/oh-story/index.js`、`vendor/oh-story/client.js`、`vendor/oh-story/types/` |
| `zenstory-ai/drama-skills` | `bc96c5eb9c`（2026-09-10） | MIT，Copyright (c) 2026 drama-skills contributors | `vendor/oh-story/drama/` |
| `zenstory-ai/oh-story-claudecode` | `abe96630d1`（2026-09-10） | MIT | `vendor/oh-story/oh-story/` |
| `zenstory-ai/novel-to-game` | `e13a6fb4d6`（2026-09-10） | MIT，Copyright (c) 2026 NovelToGame contributors | `vendor/oh-story/novel-to-game/` |
| `zenstory-ai/video-recap-skills` | `ec369e7e38`（2026-09-10） | MIT，Copyright (c) 2026 PiteChen | `vendor/oh-story/video-recap/` |

各子树的原始许可全文随文件一同保留（`LICENSE`、`LICENSE.upstream`）。

## 相对上游的全部改动

全部改动都由 `build.mjs` 在构建期施加，`vendor/oh-story/` 目录本身与上游逐字节一致：

1. **客户端模块注册 id**：`client.js` 里
   `window.__ModuleLoader__.load({ id: "@oh-story/dsh", … })` 改写为私有 id
   `dsh-agnes-studio/oh-story`。原因见 `build.mjs` 注释：DSH 会把所有插件的客户端
   bundle 拼成同一个 combo 脚本，而模块系统禁止重复注册同一 id；若某个 profile 仍把
   `@oh-story/dsh` 当独立插件行加载，原样注册会与那一行冲突并让整个 UI 起不来。
2. **工作台座位改挂私有槽位**：座位原本注册进 `shell.overlay`，现改为
   `oh-story.panel-seat`。子槽位在 DSH 里**只能被声明一次**（运行时全局校验），
   影视工具面板要成为它唯一的声明者与渲染者，才能把工作台内置进面板。
3. **工作台布局锚点搬迁**：工作台不是内联组件 —— 它把三栏书写面 portal 进
   `[data-conversation-scroll]`，并有 60+ 条 CSS 规则按该元素改造布局。搬到面板后
   这两处必须一起改：`[data-conversation-scroll]` → `[data-agnes-suite]`，
   `[data-slot="conversation.session"]` → `[data-agnes-suite-session]`
   （面板按这两个属性提供容器，`src/client/panel.tsx` 的「创作套件」页签）。
4. **未附带 `*.map`**：vendoring 时排除了 sourcemap（约 600 KB），不影响运行。

宿主半（`index.js`）与四套技能/角色资料**未作任何改写**。

此外 `@oh-story/dsh` 的 `lib/examples/`（`novel-to-game` 的示例游戏资产，约 13 MB）
按原样保留，未删除。

## 上游项目

- 插件仓库：<https://github.com/zenstory-ai/oh-story-dsh>
- 短剧技能：<https://github.com/zenstory-ai/drama-skills>
- 视频解说技能：<https://github.com/zenstory-ai/video-recap-skills>
- 小说改游戏：<https://github.com/zenstory-ai/novel-to-game>
