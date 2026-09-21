/**
 * 小说封面设计引擎（Host 端）
 * 解析 TXT / DOCX 抽取书名、作者、简介，供面板生成 3:4 封面。
 *
 * DOCX 是 ZIP；这里用 node:zlib 手写一个最小 ZIP 读取器，避免引入依赖，
 * 只取 word/document.xml 并剥离标签。
 */

import { inflateRawSync } from 'node:zlib'
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { basename, join, extname } from 'node:path'
import { dataRoot } from './ffmpeg.js'

// ─── 最小 ZIP 读取 ──────────────────────────────────────────────────────────

interface ZipEntry { name: string; offset: number; compressedSize: number; method: number }

/** Parse the ZIP central directory (enough to locate + inflate one entry). */
function readZipEntries(buf: Buffer): ZipEntry[] {
  // End of central directory record: signature 0x06054b50, scan backwards.
  let eocd = -1
  for (let i = buf.length - 22; i >= 0 && i > buf.length - 66_000; i--) {
    if (buf.readUInt32LE(i) === 0x06054b50) { eocd = i; break }
  }
  if (eocd < 0) return []
  const count = buf.readUInt16LE(eocd + 10)
  let ptr = buf.readUInt32LE(eocd + 16)
  const entries: ZipEntry[] = []
  for (let i = 0; i < count; i++) {
    if (ptr + 46 > buf.length || buf.readUInt32LE(ptr) !== 0x02014b50) break
    const method = buf.readUInt16LE(ptr + 10)
    const compressedSize = buf.readUInt32LE(ptr + 20)
    const nameLen = buf.readUInt16LE(ptr + 28)
    const extraLen = buf.readUInt16LE(ptr + 30)
    const commentLen = buf.readUInt16LE(ptr + 32)
    const localOffset = buf.readUInt32LE(ptr + 42)
    const name = buf.slice(ptr + 46, ptr + 46 + nameLen).toString('utf8')
    entries.push({ name, offset: localOffset, compressedSize, method })
    ptr += 46 + nameLen + extraLen + commentLen
  }
  return entries
}

/** Extract one entry's bytes from the local file header. */
function readZipEntry(buf: Buffer, entry: ZipEntry): Buffer | null {
  const off = entry.offset
  if (off + 30 > buf.length || buf.readUInt32LE(off) !== 0x04034b50) return null
  const nameLen = buf.readUInt16LE(off + 26)
  const extraLen = buf.readUInt16LE(off + 28)
  const dataStart = off + 30 + nameLen + extraLen
  const data = buf.slice(dataStart, dataStart + entry.compressedSize)
  try {
    if (entry.method === 0) return data                 // stored
    if (entry.method === 8) return inflateRawSync(data)  // deflate
  } catch { return null }
  return null
}

/** Pull plain text out of a .docx document body. */
export function extractDocxText(buf: Buffer): string {
  const entries = readZipEntries(buf)
  const doc = entries.find(e => e.name === 'word/document.xml')
  if (!doc) return ''
  const xml = readZipEntry(buf, doc)?.toString('utf8') ?? ''
  // Paragraph / line breaks become newlines before tags are stripped.
  const withBreaks = xml
    .replace(/<w:br\s*\/>/g, '\n')
    .replace(/<\/w:p>/g, '\n')
    .replace(/<w:tab\s*\/>/g, ' ')
  const text = withBreaks.replace(/<[^>]+>/g, '')
  return decodeXmlEntities(text)
}

function decodeXmlEntities(s: string): string {
  return s
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&amp;/g, '&')
}

/** Decode a text buffer, honouring UTF-8 BOM and falling back to GBK-ish bytes. */
function decodeText(buf: Buffer): string {
  let b = buf
  if (b.length >= 3 && b[0] === 0xef && b[1] === 0xbb && b[2] === 0xbf) b = b.slice(3)
  const utf8 = b.toString('utf8')
  // Replacement chars mean it was not UTF-8 (common with Chinese .txt from Windows).
  const bad = (utf8.match(/\uFFFD/g) ?? []).length
  if (bad > 0 && bad > utf8.length * 0.01) {
    try {
      return new TextDecoder('gb18030').decode(b)
    } catch {
      try { return new TextDecoder('gbk').decode(b) } catch { return utf8 }
    }
  }
  return utf8
}

// ─── 元信息抽取 ─────────────────────────────────────────────────────────────

export interface NovelMeta {
  title: string
  author: string
  summary: string
  charCount: number
  source: string
}

const TITLE_HINTS = [/^\s*《(.+?)》\s*$/, /^\s*书名[:：]\s*(.+)$/, /^\s*title[:：]\s*(.+)$/i]
const AUTHOR_HINTS = [/^\s*作者[:：]\s*(.+)$/, /^\s*作\s*者[:：]\s*(.+)$/, /^\s*by[:：]?\s*(.+)$/i, /^\s*著[:：]\s*(.+)$/]

/**
 * Derive title / author / summary from a novel file.
 * Title falls back to the filename; summary is the opening prose with
 * chapter headings and metadata lines removed.
 */
export function extractNovelMeta(text: string, filename: string): NovelMeta {
  const lines = text.split(/\r?\n/).map(l => l.trim())
  const nonEmpty = lines.filter(Boolean)

  let title = ''
  let author = ''

  // Only look at the head of the document for metadata.
  for (const line of nonEmpty.slice(0, 30)) {
    if (!title) {
      for (const re of TITLE_HINTS) {
        const m = re.exec(line)
        if (m?.[1]?.trim()) { title = m[1].trim(); break }
      }
    }
    if (!author) {
      for (const re of AUTHOR_HINTS) {
        const m = re.exec(line)
        if (m?.[1]?.trim()) { author = m[1].trim(); break }
      }
    }
    if (title && author) break
  }

  if (!title) title = basename(filename, extname(filename)).replace(/[《》]/g, '').trim() || '未命名作品'

  // Summary: skip metadata/heading lines, take the first substantial prose.
  const noise = /^(书名|作者|作\s*者|简介|内容简介|摘要|前言|序|第[一二三四五六七八九十百千\d]+[章节回卷]|chapter\s*\d+|[-=*_—]{3,})/i
  const isJunk = (l: string) =>
    noise.test(l)
    || /HYPERLINK|PAGEREF|\\l\s+"|toc_auto/i.test(l)   // Word TOC field leftovers
    || /^[\d.\s、]+$/.test(l)                            // bare numbering
  const prose = nonEmpty
    .filter(l => !isJunk(l) && l.length > 12)
    .join('')
  const summary = prose.slice(0, 400).trim()

  return {
    title: title.slice(0, 60),
    author: author.slice(0, 40),
    summary,
    charCount: text.length,
    source: filename,
  }
}

/** Save an uploaded novel file and return its extracted metadata. */
export function analyzeNovelFile(
  filename: string,
  contentBase64: string,
): { ok: true; meta: NovelMeta } | { ok: false; error: string } {
  try {
    const buf = Buffer.from(contentBase64, 'base64')
    if (buf.length === 0) return { ok: false, error: '文件内容为空' }
    if (buf.length > 40 * 1024 * 1024) return { ok: false, error: '文件过大（上限 40MB）' }

    const ext = extname(filename).toLowerCase()
    let text = ''
    if (ext === '.docx') {
      text = extractDocxText(buf)
      if (!text.trim()) return { ok: false, error: '未能从 DOCX 中解析出文字（可能不是标准 .docx，试试另存为 .txt）' }
    } else if (ext === '.doc') {
      return { ok: false, error: '不支持旧版 .doc，请在 Word 中另存为 .docx 或 .txt' }
    } else {
      text = decodeText(buf)
      if (!text.trim()) return { ok: false, error: '文件内容为空或不是纯文本' }
    }

    const meta = extractNovelMeta(text, filename)

    // Keep a copy so the cover can be regenerated later without re-uploading.
    const dir = join(dataRoot(), 'covers')
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
    writeFileSync(join(dir, `source${ext === '.docx' ? '.txt' : ext}`), text, 'utf8')

    return { ok: true, meta }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) }
  }
}

// ─── 封面提示词 ─────────────────────────────────────────────────────────────

export interface CoverStyle { key: string; name: string; prompt: string }

export const COVER_STYLES: CoverStyle[] = [
  { key: 'guofeng', name: '国风水墨', prompt: 'Chinese ink-wash painting style, elegant, rice-paper texture, negative space, subtle red seal accent' },
  { key: 'dushi', name: '都市写实', prompt: 'cinematic urban photography, moody lighting, shallow depth of field, modern city atmosphere' },
  { key: 'xianxia', name: '仙侠玄幻', prompt: 'ethereal xianxia fantasy, glowing spiritual energy, misty mountains, dramatic celestial light' },
  { key: 'xuanyi', name: '悬疑暗调', prompt: 'dark suspense thriller mood, high contrast, cold tones, mysterious fog, cinematic tension' },
  { key: 'yanqing', name: '言情清新', prompt: 'soft romantic illustration, pastel palette, warm gentle light, dreamy bokeh' },
  { key: 'kehuan', name: '科幻未来', prompt: 'science-fiction concept art, neon and chrome, futuristic skyline, volumetric light' },
]

/** Build the image prompt for a cover. */
export function buildCoverPrompt(meta: NovelMeta, styleKey: string, extra: string): string {
  const style = COVER_STYLES.find(s => s.key === styleKey) ?? COVER_STYLES[0]
  const theme = meta.summary.slice(0, 160)
  const bits = [
    `Book cover artwork for a Chinese web novel titled "${meta.title}".`,
    theme ? `Story theme: ${theme}` : '',
    style.prompt,
    'Vertical portrait composition with clear space at the top for the title and at the bottom for the author name.',
    'No text, no letters, no watermark in the image.',
    extra ? String(extra).slice(0, 200) : '',
  ]
  return bits.filter(Boolean).join(' ')
}
