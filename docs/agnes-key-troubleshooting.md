# 给用户的完整提示词：修复「泡泡猫的影视工具」读不到 Agnes Key

> 用法：把下面两条横线之间的全部内容，原样粘贴到 DeepSeek Harness 的对话框里发给 AI 助手。
> 它会自己检查你的配置、把 Key 写到正确位置，并告诉你什么时候重启。

---

你是我的 DeepSeek Harness 配置助手，现在要帮我修复一个具体问题：我安装了「泡泡猫的影视工具」（插件包名 `dsh-agnes-studio`），但面板显示未配置 Agnes API Key，或者生图 / 生视频失败。请你自己动手排查并修复，不要只给我建议。

## 你可以使用的工具

你可以运行终端命令、读写文件、发 HTTP 请求。请直接用这些能力完成下面的步骤。

## 必须先知道的既定事实（不要重新推导，也不要推翻）

1. 插件读取 Agnes Key **只有一条有效路径**：宿主进程的环境变量 `process.env.AGNES_API_KEY`（变量名一字不差，全大写，下划线）。
2. 插件还会尝试读取 DSH 凭据（credentials）里名为 `agnes-api-key` 的引用，但 **这个名字在 DSH 凭据系统里不合法**（ref 名不允许连字符，正则 `^[A-Za-z_][A-Za-z0-9_]*$`），永远存不进去、也永远读不到。所以这条路径是死路，不要去配置它。
3. DSH 启动时加载环境变量，优先级从高到低：
   - 已经存在的系统环境变量（最高，`.env` 不会覆盖它）
   - `<启动目录>/.env`
   - `$DSH_HOME/.env`
   并且只有在 `process.env[变量名]` 未定义时才会写入。默认 `DSH_HOME` 是 `~/.dsh`。
4. `.env` **只在 DSH 启动时读取一次**，改完必须完全重启 DSH 进程，刷新页面无效。
5. 插件的模型清单是写死在代码里的静态表（文本 8 个、图像 6 个、视频 6 个），不读取我在 DSH 里配置的 provider / models；插件的请求端点也是写死的六家官方地址，不支持中转或自建端点。
6. 插件面板里「发到对话」是走 DSH 自己的模型；只有「生图 / 生视频 / 短剧」走插件自己的代理和上面这套 Key。

## 请按顺序执行

### 第 1 步：定位 DSH 主目录

```bash
echo "DSH_HOME=${DSH_HOME:-$HOME/.dsh}"
```

若 `DSH_HOME` 为空或不存在，就用 `~/.dsh`。

### 第 2 步：检查文件层和插件自己的判定（不要打印 Key 明文）

```bash
H="${DSH_HOME:-$HOME/.dsh}"
BASE="${DSH_WEB_URL:-http://127.0.0.1:3080}"
echo "H=$H"
echo "BASE=$BASE"
echo "== DSH_HOME/.env =="
grep -c '^AGNES_API_KEY=' "$H/.env" 2>/dev/null || echo "0（文件不存在或无该行）"
echo "== 启动目录 .env =="
grep -c '^AGNES_API_KEY=' "$PWD/.env" 2>/dev/null || echo "0（无该行）"
echo "== 插件视角（唯一权威判据）=="
curl -s --max-time 5 "$BASE/agnes-studio/api/status" \
  | grep -o '"agnes":{[^}]*}' || echo "接口不可达：先 echo \$DSH_WEB_URL 确认真实地址"
```

**重要**：不要用 `node -e 'console.log(process.env.AGNES_API_KEY)'` 或 `printenv` 来判断。DSH 派生子进程时会剥离宿主运行时加载的环境变量，那里显示「未设置」并不代表宿主进程没配。**唯一可信的判据是上面的 status 接口**，因为它跑在宿主进程里。

### 第 3 步：判断并处理

按实际情况选择分支，不要全部执行：

**分支 A：status 里 `"configured":false`，且两个 .env 都没有这一行**
说明还没配置。请向我索要 Key（我在 https://platform.agnes-ai.cn 的「API Keys」创建，`sk-` 开头），然后写到 `$DSH_HOME/.env`。不要加引号、不要加空格、不要改变量名：

```bash
H="${DSH_HOME:-$HOME/.dsh}"
# 先删掉可能存在的同名旧行，再写新值，避免重复定义
sed -i.bak '/^AGNES_API_KEY=/d' "$H/.env" 2>/dev/null || true
printf 'AGNES_API_KEY=这里替换成真实key\n' >> "$H/.env"
```

**分支 B：status 里 `"configured":false`，但 .env 里确实有这一行**
说明 DSH 启动时没读到这个文件。逐项检查：
- 路径是否是 `$DSH_HOME/.env`（拼写、隐藏文件、是不是写在别的用户目录下）
- 是否被存成了 `.env.txt` 之类的错误文件名
- Windows 上是否存成了 UTF-8 with BOM（必须 UTF-8 无 BOM）
- 改完之后**是否真的重启过 DSH 进程**（改 .env 不重启等于没改）

**分支 C：status 里 `"configured":true`，但面板仍不能用**
Key 这层已经通了，问题不在 Key。请直接跳到第 5 步，重点看模型名和端点。

**分支 D：status 里 `"configured":true`，但我用的是中转 / 自建 Agnes 端点**
这属于用户侧无法解决的情况：插件把端点写死为官方地址。请直接告诉我「必须等插件更新或改用官方端点」，不要反复尝试修改配置。

### 第 4 步：让我重启并复验

如果第 3 步写过文件，请明确提醒我：**完全退出 DSH 再启动**（关掉进程，不是刷新浏览器），因为 `.env` 只在启动时读一次。

重启后请你再跑一次同样的检查，确认变成：

```json
"agnes":{"configured":true,"source":"env",...}
```

- 变成 `configured:true` → Key 这层完成，进入第 5 步。
- 仍是 `configured:false` → 说明文件路径或变量名仍有问题，回到分支 B 逐项核对，不要重复写入。
- 接口连不上 → 先 `echo $DSH_WEB_URL` 确认真实地址，再换端口重试。

### 第 5 步：如果 Key 已通但生成仍失败，判断是不是另外两个原因

```bash
BASE="${DSH_WEB_URL:-http://127.0.0.1:3080}"
curl -s --max-time 5 "$BASE/agnes-studio/api/models"
```

- 如果我想用的模型**不在**返回的 `textModels` / `imageModels` / `videoModels` 列表里 → 这是插件的静态模型表限制，用户侧无法解决，必须等插件更新。请明确告诉我这一点，不要反复尝试。
- 如果返回 401 → Key 无效或已过期。
- 如果返回 404，或我把 Agnes 配的是中转 / 自建端点 → 插件写死了官方地址 `https://api.agnes-ai.cn/v1`，用户侧无法改，必须等插件更新或使用官方端点。

## 硬性约束

- **绝对不要**输出、回显、记录我的 API Key 明文。只允许显示前 5 位和总长度。
- **不要**去 DSH 设置或 `.credentials.yaml` 里新增 `agnes-api-key`：那个名字不合法，做了也没用。
- **不要**修改 `cordis.patch.yml` 里的 provider 配置，也不要删除我已有的模型配置。
- **不要**自行创建或改写 `.env` 里的其他变量，只处理 `AGNES_API_KEY`。
- 写文件前，如果已存在同名行，先删除旧行再写入，避免重复定义。
- 每一步做完都告诉我「做了什么、看到什么」，不要一次性静默执行完。

## 最后请给我一份结论

用下面的格式收尾：

- 结论：已修复 / 需要我操作 / 用户侧无法解决
- Key 现在的状态：status 里 agnes 的 configured 是 true 还是 false
- 我接下来要做的：完整重启 DSH（关掉进程再启动，不是刷新页面）
- 重启后怎么确认：打开「泡泡猫的影视工具」→ 设置页签 → Agnes 显示「已配置 / env」
- 如果仍不行，把 `/agnes-studio/api/status` 的返回贴给我，不要贴 Key

---

## 附：给不想用 AI 的用户的三步简版

1. 打开终端，执行 `echo $DSH_HOME`，没有输出就用 `~/.dsh`。
2. 在这个目录下打开（没有就新建）文件 `.env`，加一行：`AGNES_API_KEY=你的key`，保存。
3. 完全退出 DSH 再打开，进入「泡泡猫的影视工具」→「设置」，看到 Agnes「已配置」即成功。

Windows 用户用 PowerShell：

```powershell
$dir = if ($env:DSH_HOME) { $env:DSH_HOME } else { "$env:USERPROFILE\.dsh" }
Add-Content "$dir\.env" "AGNES_API_KEY=你的key"
```

> 注意：变量名必须是 `AGNES_API_KEY`。写成 `AGNES_KEY`、`AGNES_AI_API_KEY` 都不行；也不要去「设置 → 凭据」里加 `agnes-api-key`，那里存不进这个名字。
