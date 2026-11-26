/**
 * KEY 池 —— 多把密钥轮换 + 冷却。
 *
 * 为什么需要（墨影的源码注释写得很直白）：**限流是按 KEY（账号）算的**，
 * N 把不同账号的 KEY ≈ N 倍并发；同一账号多开 KEY 不叠加。
 *
 * 冷却策略沿用它们的实测值：
 *   · 401 / 403 → 30 分钟（KEY 真坏了）
 *   · 429       → 60 秒（限流）
 *   · 5xx       → 20 秒 × 次数（上游抖动）
 *
 * KEY 从两个地方来：
 *   1. 环境变量：`AGNES_API_KEY`、`AGNES_API_KEY_2`、`AGNES_API_KEY_3` …（以及同样的
 *      `<VENDOR>_API_KEY_N` 形式）；
 *   2. 插件模型配置里该厂商的 `apiKey`（见 model-config-engine）。
 * 去重后进池。
 */
import { loadModelConfig } from './model-config-engine.js'

/** 单个 KEY 的状态。 */
interface KeyState {
  key: string
  /** 冷却到期时间戳（毫秒）；0 表示可用。 */
  cooldownUntil: number
  /** 最近一次失败原因。 */
  lastError?: string
  /** 成功次数（用于观测）。 */
  okCount: number
  failCount: number
}

/** 冷却时长常量（毫秒）。 */
const COOLDOWN_AUTH = 30 * 60 * 1000
const COOLDOWN_RATE = 60 * 1000
const COOLDOWN_5XX = 20 * 1000

const pools = new Map<string, KeyState[]>()
const roundRobin = new Map<string, number>()

/** 打码：保留前 4 后 4。 */
export function maskPoolKey(key: string): string {
  if (key.length <= 10) return '****'
  return key.slice(0, 4) + '****' + key.slice(-4)
}

/**
 * 收集某厂商的所有可用 KEY（环境变量 + 配置文件），去重。
 *
 * @param vendor - 厂商键，如 `agnes`。
 * @returns 去重后的 KEY 列表。
 */
export function collectKeys(vendor: string): string[] {
  const keys = new Set<string>()
  const prefix = `${vendor.toUpperCase()}_API_KEY`

  const base = process.env[prefix]
  if (base !== undefined && base !== '') keys.add(base.trim())
  for (let i = 2; i <= 9; i++) {
    const extra = process.env[`${prefix}_${i}`]
    if (extra !== undefined && extra !== '') keys.add(extra.trim())
  }

  const fromConfig = loadModelConfig().vendors[vendor]?.apiKey
  if (fromConfig !== undefined && fromConfig !== '') keys.add(fromConfig.trim())

  return [...keys]
}

/** 取（或初始化）某厂商的池。 */
function poolOf(vendor: string): KeyState[] {
  const keys = collectKeys(vendor)
  const existing = pools.get(vendor) ?? []
  const byKey = new Map(existing.map(state => [state.key, state]))
  const next: KeyState[] = keys.map(key => byKey.get(key) ?? { key, cooldownUntil: 0, okCount: 0, failCount: 0 })
  pools.set(vendor, next)
  return next
}

/**
 * 取一把当前可用的 KEY（轮询，跳过冷却中的）。
 *
 * @param vendor - 厂商键。
 * @param fallback - 池子为空时返回它（通常是"凭据服务解析出来的那一把"）。
 * @returns 可用的 KEY 与来源说明。
 */
export function acquireKey(vendor: string, fallback?: string): { key: string; source: 'pool' | 'fallback'; index: number } {
  const pool = poolOf(vendor)
  if (pool.length === 0) {
    if (fallback === undefined) throw new Error(`${vendor} 没有任何可用 KEY`)
    return { key: fallback, source: 'fallback', index: -1 }
  }

  const now = Date.now()
  const ready = pool.filter(state => state.cooldownUntil <= now)
  if (ready.length === 0) {
    // 全在冷却：等最早恢复的那把（这里不阻塞，直接返回最早可用的，让上游决定）
    const earliest = [...pool].sort((a, b) => a.cooldownUntil - b.cooldownUntil)[0]
    return { key: earliest.key, source: 'pool', index: pool.indexOf(earliest) }
  }

  const cursor = roundRobin.get(vendor) ?? 0
  const candidate = ready[cursor % ready.length]
  roundRobin.set(vendor, cursor + 1)
  return { key: candidate.key, source: 'pool', index: pool.indexOf(candidate) }
}

/**
 * 上报一次调用结果，按 HTTP 状态决定冷却多久。
 *
 * @param vendor - 厂商键。
 * @param key - 实际使用的 KEY。
 * @param status - HTTP 状态码；0 表示网络错误。
 * @param detail - 可选错误描述。
 */
export function reportKeyResult(vendor: string, key: string, status: number, detail?: string): void {
  const pool = poolOf(vendor)
  const state = pool.find(item => item.key === key)
  if (state === undefined) return
  const now = Date.now()

  if (status >= 200 && status < 300) {
    state.okCount++
    state.cooldownUntil = 0
    state.lastError = undefined
    return
  }

  state.failCount++
  state.lastError = detail ?? `HTTP ${status}`
  if (status === 401 || status === 403) state.cooldownUntil = now + COOLDOWN_AUTH
  else if (status === 429) state.cooldownUntil = now + COOLDOWN_RATE
  else if (status >= 500) state.cooldownUntil = now + COOLDOWN_5XX * Math.min(6, state.failCount)
  else if (status === 0) state.cooldownUntil = now + COOLDOWN_5XX
}

/** 池子的可观测状态（给设置页展示，KEY 打码）。 */
export function describePool(vendor: string): Array<{ masked: string; available: boolean; cooldownSec: number; okCount: number; failCount: number; lastError?: string }> {
  const now = Date.now()
  return poolOf(vendor).map(state => ({
    masked: maskPoolKey(state.key),
    available: state.cooldownUntil <= now,
    cooldownSec: Math.max(0, Math.round((state.cooldownUntil - now) / 1000)),
    okCount: state.okCount,
    failCount: state.failCount,
    lastError: state.lastError,
  }))
}

/** 该厂商池子里有几把 KEY。 */
export function poolSize(vendor: string): number {
  return poolOf(vendor).length
}
