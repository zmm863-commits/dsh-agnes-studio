/**
 * 素材库（空镜 / B-roll）—— 本地优先，Pexels 可选。
 *
 * 借鉴墨影 brolllib 的一条核心经验：**不让模型直接产搜索词**。
 * 它们的做法是"Pexels 抓候选 → 人工挑 → 技术体检 + 打标 → 入库 → 按文案匹配"，
 * 候选永远是给人挑的。
 *
 * 这里的取舍：
 *   · **本地库是主力**：扫描用户自己的素材目录，ffprobe 体检（时长/分辨率/有没有音轨），
 *     文件名与目录名做词元打标。零依赖、零联网、离线可用。
 *   · **Pexels 是补充**：配了 `PEXELS_API_KEY` 才启用；只返回候选（带缩略图与时长），
 *     由用户挑，不自动入库 —— 与墨影一致。
 *
 * 索引落盘在 `<数据目录>/broll/index.json`，扫描是增量的（按 mtime+size 判断变化）。
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs'
import { join, basename, extname, dirname } from 'node:path'
import { dataRoot, ffmpeg } from './ffmpeg.js'

/** 一条素材。 */
export interface BrollAsset {
  /** 绝对路径。 */
  file: string
  /** 文件名（便于展示）。 */
  name: string
  /** 类型。 */
  kind: 'video' | 'image'
  /** 字节数。 */
  size: number
  /** 修改时间（毫秒）。 */
  mtime: number
  /** 视频时长（秒），图片为 0。 */
  durationSec: number
  width: number
  height: number
  /** 是否含音轨（空镜通常没有）。 */
  hasAudio: boolean
  /** 自动打标：来自文件名与目录名的词元。 */
  tags: string[]
}

/** 索引文件结构。 */
interface BrollIndex {
  version: 1
  /** 已扫描过的根目录。 */
  roots: string[]
  assets: BrollAsset[]
}

const VIDEO_EXT = new Set(['.mp4', '.mov', '.mkv', '.webm', '.avi', '.m4v'])
const IMAGE_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif'])
const MAX_SCAN_FILES = 4000

/** 索引文件路径。 */
export function brollIndexPath(): string {
  return join(dataRoot(), 'broll', 'index.json')
}

/** 读索引（读坏返回空索引，绝不让面板打不开）。 */
export function loadBrollIndex(): BrollIndex {
  try {
    const raw = JSON.parse(readFileSync(brollIndexPath(), 'utf8')) as BrollIndex
    if (Array.isArray(raw.assets) && Array.isArray(raw.roots)) return raw
  } catch { /* 不存在或损坏 */ }
  return { version: 1, roots: [], assets: [] }
}

/** 写索引。 */
export function saveBrollIndex(index: BrollIndex): void {
  const path = brollIndexPath()
  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(path, JSON.stringify(index, null, 2), 'utf8')
}

/**
 * 把文件名与目录名切成检索词元。
 *
 * 中文没有空格，所以除了按分隔符切之外，还要按 2-gram 补充 —— 这样"城市夜景"
 * 能被"夜景"命中。纯英文按单词切并小写。
 */
export function tokenizeTags(filePath: string): string[] {
  const raw = `${basename(dirname(filePath))} ${basename(filePath, extname(filePath))}`
  const tokens = new Set<string>()
  for (const part of raw.split(/[\s_\-.,，、/\\()（）[\]]+/)) {
    const clean = part.trim().toLowerCase()
    if (clean.length < 2) continue
    if (/^[\x00-\x7F]+$/.test(clean)) {
      tokens.add(clean)
    } else {
      // 中文：整词 + 2-gram
      tokens.add(clean)
      for (let i = 0; i + 2 <= clean.length; i++) tokens.add(clean.slice(i, i + 2))
    }
  }
  return [...tokens].slice(0, 24)
}

/** 用 ffprobe/ffmpeg 体检一个文件。 */
async function probeAsset(file: string, kind: 'video' | 'image'): Promise<{ durationSec: number; width: number; height: number; hasAudio: boolean }> {
  const res = await ffmpeg(['-i', file], 30_000)
  const text = res.stderr
  const dur = /Duration:\s*(\d+):(\d+):(\d+\.?\d*)/.exec(text)
  const durationSec = dur === null ? 0 : Number(dur[1]) * 3600 + Number(dur[2]) * 60 + Number(dur[3])
  const dim = /(\d{2,5})x(\d{2,5})/.exec(text)
  const hasAudio = /Stream #\d+:\d+.*: Audio:/.test(text)
  return {
    durationSec: kind === 'image' ? 0 : Number(durationSec.toFixed(2)),
    width: dim === null ? 0 : Number(dim[1]),
    height: dim === null ? 0 : Number(dim[2]),
    hasAudio,
  }
}

/**
 * 扫描若干目录并更新索引。
 *
 * @param roots - 要扫描的绝对目录。
 * @param onProgress - 进度回调（已处理/总数）。
 * @returns 索引统计。
 */
export async function scanBroll(
  roots: string[],
  onProgress?: (done: number, total: number, file: string) => void,
): Promise<{ roots: string[]; total: number; added: number; updated: number; skipped: number; errors: string[] }> {
  const index = loadBrollIndex()
  const byPath = new Map(index.assets.map(asset => [asset.file, asset]))
  const errors: string[] = []
  const found: string[] = []

  const walk = (dir: string, depth: number): void => {
    if (depth > 6 || found.length >= MAX_SCAN_FILES) return
    let entries: string[] = []
    try {
      entries = readdirSync(dir)
    } catch (error) {
      errors.push(`${dir}: ${error instanceof Error ? error.message : String(error)}`)
      return
    }
    for (const entry of entries) {
      if (entry.startsWith('.')) continue
      const full = join(dir, entry)
      let st
      try {
        st = statSync(full)
      } catch { continue }
      if (st.isDirectory()) {
        walk(full, depth + 1)
        continue
      }
      const ext = extname(entry).toLowerCase()
      if (!VIDEO_EXT.has(ext) && !IMAGE_EXT.has(ext)) continue
      found.push(full)
      if (found.length >= MAX_SCAN_FILES) return
    }
  }

  for (const root of roots) {
    if (!existsSync(root)) {
      errors.push(`${root}: 目录不存在`)
      continue
    }
    walk(root, 0)
  }

  let added = 0
  let updated = 0
  let skipped = 0
  for (let i = 0; i < found.length; i++) {
    const file = found[i]
    onProgress?.(i + 1, found.length, file)
    let st
    try {
      st = statSync(file)
    } catch { continue }
    const existing = byPath.get(file)
    if (existing !== undefined && existing.mtime === st.mtimeMs && existing.size === st.size) {
      skipped++
      continue
    }
    const ext = extname(file).toLowerCase()
    const kind: 'video' | 'image' = VIDEO_EXT.has(ext) ? 'video' : 'image'
    const probe = await probeAsset(file, kind)
    const asset: BrollAsset = {
      file,
      name: basename(file),
      kind,
      size: st.size,
      mtime: st.mtimeMs,
      ...probe,
      tags: tokenizeTags(file),
    }
    if (existing === undefined) added++
    else updated++
    byPath.set(file, asset)
  }

  const scanned = found.map(file => byPath.get(file)).filter((a): a is BrollAsset => a !== undefined)
  const next: BrollIndex = {
    version: 1,
    roots: [...new Set([...index.roots, ...roots])],
    assets: scanned,
  }
  saveBrollIndex(next)
  return { roots: next.roots, total: next.assets.length, added, updated, skipped, errors }
}

/**
 * 按关键词给素材打分并排序。
 *
 * 打分规则（简单可解释）：标题/标签命中数 ×2 + 目录命中 ×1 − 时长不匹配惩罚。
 *
 * @param query - 关键词（空格分隔或中文短语）。
 * @param options - 时长区间与数量上限。
 * @returns 命中素材（分数从高到低）。
 */
export function matchBroll(
  query: string,
  options: { minDurationSec?: number; maxDurationSec?: number; limit?: number } = {},
): Array<{ asset: BrollAsset; score: number }> {
  const index = loadBrollIndex()
  const terms = query
    .toLowerCase()
    .split(/[\s,，、]+/)
    .flatMap(term => (term.length > 2 && !/^[\x00-\x7F]+$/.test(term) ? [term, ...Array.from({ length: term.length - 1 }, (_, i) => term.slice(i, i + 2))] : [term]))
    .filter(term => term.length >= 1)

  const min = options.minDurationSec ?? 0
  const max = options.maxDurationSec ?? Number.POSITIVE_INFINITY
  const limit = options.limit ?? 30

  const scored = index.assets.map(asset => {
    let score = 0
    const name = asset.name.toLowerCase()
    for (const term of terms) {
      if (name.includes(term)) score += 2
      else if (asset.tags.some(tag => tag.includes(term))) score += 1
    }
    if (asset.kind === 'video' && (asset.durationSec < min || asset.durationSec > max)) score -= 5
    return { asset, score }
  })

  return scored
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score || a.asset.name.localeCompare(b.asset.name))
    .slice(0, limit)
}

/** 从索引里移除一条。 */
export function removeBrollAsset(file: string): boolean {
  const index = loadBrollIndex()
  const before = index.assets.length
  index.assets = index.assets.filter(asset => asset.file !== file)
  if (index.assets.length === before) return false
  saveBrollIndex(index)
  return true
}

/** Pexels 候选（只在配了 Key 时可用）。 */
export interface PexelsCandidate {
  id: number
  url: string
  thumb: string
  durationSec: number
  width: number
  height: number
  author: string
}

/**
 * 查 Pexels 候选视频。
 *
 * 只返回候选，**不自动入库** —— 墨影的经验是机器挑不准，必须人工看一眼。
 *
 * @param query - 检索词（由用户给，模型不参与产词）。
 * @param apiKey - Pexels API Key。
 */
export async function searchPexels(query: string, apiKey: string, perPage = 12): Promise<PexelsCandidate[]> {
  const url = `https://api.pexels.com/videos/search?query=${encodeURIComponent(query)}&per_page=${perPage}&orientation=landscape`
  const ac = new AbortController()
  const timer = setTimeout(() => ac.abort(), 30_000)
  try {
    const resp = await fetch(url, { headers: { Authorization: apiKey }, signal: ac.signal })
    if (!resp.ok) {
      throw new Error(`Pexels ${resp.status}：${(await resp.text()).slice(0, 160)}`)
    }
    const data = await resp.json() as {
      videos?: Array<{
        id: number
        duration: number
        width: number
        height: number
        user?: { name?: string }
        image?: string
        video_files?: Array<{ link: string; width: number; height: number; quality?: string }>
      }>
    }
    return (data.videos ?? []).map(video => {
      const best = (video.video_files ?? []).sort((a, b) => b.width - a.width)[0]
      return {
        id: video.id,
        url: best?.link ?? '',
        thumb: video.image ?? '',
        durationSec: video.duration,
        width: video.width,
        height: video.height,
        author: video.user?.name ?? '',
      }
    }).filter(candidate => candidate.url !== '')
  } finally {
    clearTimeout(timer)
  }
}

/** 把一条 Pexels 候选下载进本地库（用户挑完才调用）。 */
export async function downloadPexels(candidate: PexelsCandidate, dir: string): Promise<string> {
  mkdirSync(dir, { recursive: true })
  const target = join(dir, `pexels-${candidate.id}.mp4`)
  const ac = new AbortController()
  const timer = setTimeout(() => ac.abort(), 10 * 60 * 1000)
  try {
    const resp = await fetch(candidate.url, { signal: ac.signal })
    if (!resp.ok) throw new Error(`下载失败 HTTP ${resp.status}`)
    const buffer = Buffer.from(await resp.arrayBuffer())
    writeFileSync(target, buffer)
    return target
  } finally {
    clearTimeout(timer)
  }
}
