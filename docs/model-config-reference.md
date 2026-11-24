# 模型配置参考：墨影 AI 工场 vs 泡泡猫的影视工具

> 来源：`墨影解析.zip`（Ghidra 反编译 PE + Python 字节码反汇编 + Flask 路由精确绑定）
> 对照对象：dsh-agnes-studio v0.7.1 的宿主半 `src/model-config-engine.ts`

---

## 1. 墨影是怎么做模型配置的

全部集中在 `src/config.py` 一个模块，向上派生出四个能力：

| 能力 | 函数 | 行为 |
|---|---|---|
| 配置文件定位 | `get_config_path()` | `AGNES_DATA_DIR` 优先，否则程序目录旁的 `config.json` |
| 取密钥 | `get_vendor_api_key(model, fallback)` | 自定义模型自带 key → 厂商专用 key → 全局 key；Agnes 支持多 key 轮换 |
| 推厂商 | `get_vendor_from_model(model)` | 按模型名前缀推断（`agnes` / `ollama:` / …） |
| 取端点 | `get_vendor_base_url(model)` | 自定义模型配置 → 用户自定义配置 → 默认表；返回含 `/v1` 的完整基址 |
| 站点选择 | `agnes_sites.base_url_for_key(key)` | 同一家的国内站 / 国际站 Key 打不同域名；用户手写 `agnes_base_url` 时以它为准 |

配套的运维能力（`api_config` 模块，19 个端点）：

- 读写 `config.json`
- **KEY 测试**：单独测一把 key 是否可用
- **站点探测**：判断 key 属于哪个站
- **视频 KEY 池实时状态** `/api/video-keys/live`
- Ollama 配置 / 检测

密钥存储：`config.json` 明文，`mask_key()` 只用于回显（前 8 + `****` + 后 4）。

---

## 2. 泡泡猫原来差在哪

| 维度 | 墨影 | 泡泡猫（改造前） |
|---|---|---|
| 密钥来源 | 配置文件（面板可改） | 只有 DSH 凭据 + `.env`，面板里改不了 |
| 厂商端点 | 用户可覆盖 | 写死在 `vendors.ts` |
| 自定义模型 | 有，带自己的 baseUrl + key，可接任意 OpenAI 兼容服务 | 只有 localStorage 里的半成品，且文本类不生效 |
| 连通测试 | 有 | 无（只能发一次真请求看报错） |
| 站点区分 | 有 | 无 |
| 多 key 轮换 | 有（并发基础） | 无 |

结果就是：用户想把插件接到自己的中转站、本地 vLLM、或者换一个站点，**没有入口**。

---

## 3. 本次改造（v0.8.0）

新增宿主模块 `src/model-config-engine.ts`，四件事与墨影对齐：

1. **厂商配置**：`vendors[vendor] = { apiKey, baseUrl, note }`，落盘 `<数据目录>/model-config.json`（`DSH_AGNES_STUDIO_CONFIG` 可覆盖路径）
2. **自定义模型**：`customModels[] = { id, name, kind, baseUrl, apiKey }`，任何 OpenAI 兼容端点
3. **密钥优先级**：自定义模型自带 → 本页配置 → DSH 凭据 → `.env` → 明确报错
4. **端点探测**：`probeEndpoint()` 先打 `/models`，失败再打一次最小 `chat/completions`；401/403 直接判定密钥被拒

新增 HTTP 路由（宿主半）：

```
GET  /agnes-studio/api/model-config          读配置（密钥打码）+ DSH 侧厂商/模型
POST /agnes-studio/api/model-config/vendor   保存某厂商的 key / baseUrl
POST /agnes-studio/api/model-config/custom   新增或覆盖自定义模型
POST /agnes-studio/api/model-config/remove   删除自定义模型 / 清厂商配置
POST /agnes-studio/api/model-config/test     连通测试（不消耗生成额度）
```

前端：`设置` 页替换为 `src/client/model-config-panel.tsx`，三块：
厂商密钥（Base URL / Key / 保存 / 测试 / 清除）、自定义模型（增删）、DSH 已配置的模型（只读展示）。

`/agnes-studio/api/models` 会把自定义模型并入下拉框，显示名带「（自定义）」后缀；
代理层会优先使用自定义模型自带的 `baseUrl` 与 `key`。

---

## 4. 与墨影有意不同的地方

| 项 | 墨影 | 本插件 | 原因 |
|---|---|---|---|
| 密钥存储 | `config.json` 明文 | 同样落本地文件，但**永不下发浏览器**（接口只回打码值） | 面板是网页，回传等于泄露 |
| DSH 集成 | 无 | 只读展示 DSH 已配置的厂商与模型 | 用户已经在 DSH 填过一次，不该再填第二遍 |
| 多 key 轮换 | 有（视频并发刚需） | 暂未做 | 本插件的并发需求还没到那个量级，先不做复杂度 |

---

## 5. 一句话结论

墨影的模型配置本质是「**一个中心化的 config + 三个派生函数 + 一组运维端点**」。
这套结构值得照搬；但密钥的**下发面**要比它更严 —— 它靠桌面程序，我们靠浏览器。
