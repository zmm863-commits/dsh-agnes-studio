# 不重启 DSH 验证宿主改动

宿主半（`src/index.ts` 的路由、各 `*-engine.ts`）改完之后，DSH 进程里跑的还是旧代码，
面板会一直走旧路径。重启 DSH 会中断当前对话，所以准备了这个自检工具。

## 用法

```bash
cd "/root/DSH3(修改影视工具)/dsh-agnes-studio"
npm run host:harness           # 默认监听 127.0.0.1:3099
# 或指定端口
HARNESS_PORT=3101 npm run host:harness
```

它做三件事：

1. 读 `$DSH_HOME/.env` 灌进 `process.env`（密钥解析与真实运行时一致）；
2. `import` 已经构建好的 `lib/index.js`，用一个最小 `ctx` 把路由注册进去
   （只实现插件真正用到的 `webServer / systemPrompt / credentials / effect`）；
3. 起一个普通 HTTP 服务转发请求 —— 于是可以用 `curl` 直接打真实接口。

## 它能验证什么

- 路由是否注册、路径是否正确、状态码是否符合预期
- 真实模型调用（会消耗额度）、ffmpeg 产物、文件读写
- 密钥优先级（本页配置 → DSH 凭据 → `.env`）

## 它验证不了什么

- 面板 UI（浏览器那一半要刷新页面才生效，与宿主无关）
- DSH 生命周期相关行为（插件卸载、会话绑定等）

## 注意

harness 与真实运行时**共用同一份**插件数据目录（`<tmp>/dsh-agnes-studio`），
测试时写入的密钥/自定义模型会留在里面，测完记得清理：

```bash
# 清掉某个厂商的配置
curl -X POST -H 'Content-Type: application/json' \
  -d '{"vendor":"deepseek"}' http://127.0.0.1:3099/agnes-studio/api/model-config/remove
```
