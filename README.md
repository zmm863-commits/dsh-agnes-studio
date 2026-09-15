# 🎬 dsh-agnes-studio — 泡泡猫的影视工具

充分利用 Agnes AI 免费生图/视频大模型的 DSH 插件（内部名：Agnes 创意工作站）。

## 核心特性

- **🎨 文生图** — Image 2.5 Flash，支持 1K-4K 尺寸，免费
- **🖼 图生图** — 风格迁移、场景变换、多图合成
- **🎬 文生视频** — Video 2.5 Flash，4-12 秒，免费
- **📹 图生视频** — 首帧控制、多模态参考
- **📖 剧本导入** — 支持 .txt / .md / .json 格式，自动拆解分镜
- **🎞 故事板** — 分镜预览 + 批量生成

## 技术亮点

- **不堵对话框** — 使用 `shell.overlay` 浮层，对话框完全可用
- **API Key 安全** — 走 Host 端代理，浏览器不暴露 Key
- **响应式设计** — 跟随 DSH 主题（深色/浅色）

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
2. 输入提示词，点击生成
3. 导入剧本自动拆解分镜
4. 批量生成所有场景图片/视频
5. 关闭：标题栏 ✕、Esc，或再次点击侧边栏入口
