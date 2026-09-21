# 🎬 dsh-agnes-studio — 泡泡猫的影视工具

充分利用 Agnes AI 免费生图/视频大模型的 DSH 插件（内部名：Agnes 创意工作站）。

## 核心特性

- **🎨 文生图** — Image 2.5 Flash，支持 1K-4K 尺寸，免费
- **🖼 图生图** — 风格迁移、场景变换、多图合成
- **🎬 文生视频** — Video 2.5 Flash，4-12 秒，免费
- **📹 图生视频** — 首帧控制、多模态参考
- **📖 短剧流水线** — 剧本导入 → 分镜 → 逐镜头真实生成 → **自动合成成片**（可烧中文字幕）
- **🎙 数字人口播** — 文稿自动分段 → TTS 配音 → 画面 → 字幕 → 成片
  - 三种画面模式：静态形象图 / 视频素材 / AI 生成画面
  - AI 模式支持**逐段生成画面**（每段台词配一段画面，更贴合内容）
- **🕸 无限画布** — 节点化编排（文本/图片/视频），缩放拖拽、连线传参考图、逐节点真实生成，自动保存
- **📕 小说封面** — 上传 TXT/DOCX 自动提取书名/作者/简介，一键生成 3:4 标准封面
- **✨ 提示词专家** — 中文想法一键扩写成专业中英文提示词


## 环境依赖

短剧合成与口播需要本机具备：

| 依赖 | 用途 | 缺失时 |
|---|---|---|
| **ffmpeg + ffprobe** | 视频拼接、字幕烧录、音画合成 | 面板顶部提示安装方法；可设 `AGNES_FFMPEG` 指定路径 |
| **中文字体** | 烧录中文字幕 | 明确报错（不会静默输出豆腐块）；可设 `AGNES_SUBTITLE_FONT` |
| **MIMO_API_KEY** | 口播 TTS 配音 | 口播页提示配置（`mimo-api-key` 凭据或环境变量） |

安装 ffmpeg：
```bash
# Linux
apt-get install -y ffmpeg fonts-wqy-zenhei
# macOS
brew install ffmpeg && brew install --cask font-noto-sans-cjk-sc
# Windows: 安装 ffmpeg 加入 PATH（或设 AGNES_FFMPEG），系统自带微软雅黑即可
```

## 技术亮点

- **不堵对话框** — 使用 `shell.overlay` 浮层，对话框完全可用
- **API Key 安全** — 走 Host 端代理，浏览器不暴露 Key
- **真实可用性验证** — 生图/生视频/拼接/TTS/字幕全部有端到端实测脚本
- **字幕按真实像素排版** — 用 ASS + `PlayResY` 声明分辨率，字号/边距不受 libass 默认 288 行缩放影响
- **拼接自动归一化** — 镜头分辨率或帧率不一致时逐个归一化再拼，避免时间轴错乱


## 安装

```bash
cd /dsh/profiles/web
npm install /root/软件/dsh-agnes-studio
# 编辑 package.json 的 dsh.profile.bundles 添加 "dsh-agnes-studio"
# 编辑 package.json 的 dependencies 添加 "dsh-agnes-studio": "file:/root/软件/dsh-agnes-studio"
# 重启 DSH 容器
```

## 首次使用：获取 Agnes API Key

1. 打开 <https://platform.agnes-ai.cn> 注册 / 登录（免费）
2. 在控制台「API Keys」创建密钥，复制 `sk-` 开头的那串
3. 填到本机（任选一种）：
   - 在 DSH 设置 → 模型 → 凭据 中新增 `agnes-api-key`
   - 或在本机 `/dsh/.env` 写入 `AGNES_API_KEY=sk-...`

面板首屏会显示同样的指引；Key 只由宿主进程读取，浏览器不会接触。

## 使用

1. 侧边栏点击「🎬 泡泡猫的影视工具」
2. **生图 / 生视频**：输入提示词，点击生成
3. **短剧**：剧本导入 → 生成分镜 → 「一键生成全部镜头」→「合成成片」（可选烧字幕）→ 下载
4. **口播**：切到「🎙 口播」→ 输入文稿 → 选形象图 → 开始生成 → 预览/下载
5. **画布**：切到「🕸 画布」→ 拖空白平移、滚轮缩放、节点右圆点拖到左圆点连线（图片节点连到视频节点即作为参考图）→ 节点上直接生成
6. **封面**：切到「📕 封面」→ 上传 TXT/DOCX 或手填书名 → 选风格 → 生成封面
7. 关闭：标题栏 ✕、Esc，或再次点击侧边栏入口

> ⚠️ 改动了插件**宿主半**（`lib/index.js`）后需**重启 DSH** 才生效；只改客户端刷新页面即可。
> 画布状态保存在浏览器 localStorage，无需后端。


