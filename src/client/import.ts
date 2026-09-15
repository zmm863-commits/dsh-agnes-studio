/**
 * Script import parser.
 *
 * Parses .txt, .md, and .json script files into structured scenes
 * for the storyboard workflow.
 */

import type { StoryScene } from './studio.ts'

/** Parse a script file into scenes. */
export function parseScript(filename: string, content: string): StoryScene[] {
  const ext = filename.split('.').pop()?.toLowerCase() || ''

  if (ext === 'json') {
    return parseJsonScript(content)
  }
  if (ext === 'md' || ext === 'markdown') {
    return parseMarkdownScript(content)
  }
  // Default: treat as plain text
  return parsePlainTextScript(content)
}

/** Parse JSON format script. */
function parseJsonScript(content: string): StoryScene[] {
  try {
    const data = JSON.parse(content)

    // Handle { scenes: [...] } format
    if (data.scenes && Array.isArray(data.scenes)) {
      return data.scenes.map((s: Record<string, unknown>, i: number) => ({
        name: String(s.name || s.title || `场景 ${i + 1}`),
        prompt: String(s.prompt || s.description || s画面 || ''),
        motion: String(s.motion || s.action || s动作 || ''),
        duration: Number(s.duration || 5),
        status: 'pending' as const,
      }))
    }

    // Handle array format
    if (Array.isArray(data)) {
      return data.map((s: Record<string, unknown>, i: number) => ({
        name: String(s.name || s.title || `场景 ${i + 1}`),
        prompt: String(s.prompt || s.description || ''),
        motion: String(s.motion || s.action || ''),
        duration: Number(s.duration || 5),
        status: 'pending' as const,
      }))
    }

    throw new Error('JSON 格式不正确，需要 { scenes: [...] } 或 [...] 格式')
  } catch (e) {
    if (e instanceof SyntaxError) {
      throw new Error('JSON 解析失败：' + e.message)
    }
    throw e
  }
}

/** Parse Markdown format script. */
function parseMarkdownScript(content: string): StoryScene[] {
  const scenes: StoryScene[] = []
  const lines = content.split('\n')

  let currentScene: Partial<StoryScene> | null = null
  let buffer: string[] = []

  const flushScene = () => {
    if (currentScene && currentScene.name) {
      // Build prompt from collected lines
      if (!currentScene.prompt && buffer.length > 0) {
        currentScene.prompt = buffer.join('\n').trim()
      }
      scenes.push({
        name: currentScene.name,
        prompt: currentScene.prompt || '',
        motion: currentScene.motion || '',
        duration: currentScene.duration || 5,
        status: 'pending',
      })
    }
    buffer = []
  }

  for (const line of lines) {
    const trimmed = line.trim()

    // Detect scene headers: # Scene, ## Scene, **Scene**, ---
    const sceneMatch = trimmed.match(/^#{1,3}\s+(.+)/)
    const boldMatch = trimmed.match(/^\*\*(.+?)\*\*/)
    const dashMatch = trimmed.match(/^---+$/)

    if (sceneMatch || boldMatch) {
      const name = (sceneMatch?.[1] || boldMatch?.[1] || '').trim()
      if (name && name.length > 1 && !name.match(/^(场景|第|幕|章)/)) {
        // This looks like a section header, skip (like "## Settings", "## Cast")
        continue
      }
      if (name) {
        flushScene()
        currentScene = { name }
        continue
      }
    }

    if (dashMatch && currentScene) {
      flushScene()
      currentScene = null
      continue
    }

    // Parse structured fields
    const fieldMatch = trimmed.match(/^[*\-]\s*\*?\*?(画面?|场景?|描述?|prompt)\*?\*?\s*[:：]\s*(.+)/i)
    const motionMatch = trimmed.match(/^[*\-]\s*\*?\*?(动作?|运动?|motion|action)\*?\*?\s*[:：]\s*(.+)/i)
    const durationMatch = trimmed.match(/^[*\-]\s*\*?\*?(时长?|duration|seconds?)\*?\*?\s*[:：]\s*(\d+)/i)
    const lensMatch = trimmed.match(/^[*\-]\s*\*?\*?(镜头?|camera|lens)\*?\*?\s*[:：]\s*(.+)/i)
    const moodMatch = trimmed.match(/^[*\-]\s*\*?\*?(氛围?|mood|style)\*?\*?\s*[:：]\s*(.+)/i)

    if (fieldMatch) {
      buffer.push(fieldMatch[2].trim())
    } else if (motionMatch) {
      if (currentScene) currentScene.motion = motionMatch[2].trim()
      else buffer.push(`运动: ${motionMatch[2].trim()}`)
    } else if (durationMatch) {
      if (currentScene) currentScene.duration = Number(durationMatch[2])
    } else if (lensMatch) {
      buffer.push(`镜头: ${lensMatch[2].trim()}`)
    } else if (moodMatch) {
      buffer.push(`氛围: ${moodMatch[2].trim()}`)
    } else if (trimmed && !trimmed.startsWith('#') && !trimmed.startsWith('---')) {
      // Accumulate as prompt text
      if (trimmed.length > 2) {
        buffer.push(trimmed)
      }
    }
  }

  flushScene()

  // If no scenes found, try splitting by double newlines
  if (scenes.length === 0) {
    const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim().length > 5)
    return paragraphs.map((p, i) => ({
      name: `场景 ${i + 1}`,
      prompt: p.trim().replace(/\n/g, ' '),
      status: 'pending' as const,
    }))
  }

  return scenes
}

/** Parse plain text format script. */
function parsePlainTextScript(content: string): StoryScene[] {
  const scenes: StoryScene[] = []

  // Try to detect scene separators
  // Pattern 1: "场景N：" or "Scene N:" or "第N幕"
  const scenePattern = /(?:场景|第.+幕|Scene|SCENE)\s*(\d+|[一二三四五六七八九十]+)\s*[:：]/gi
  const parts = content.split(scenePattern).filter(s => s.trim().length > 0)

  if (parts.length > 1) {
    // Has scene markers
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i].trim()
      if (!part) continue

      // Check if this is a scene number/title
      const numMatch = part.match(/^(\d+|[一二三四五六七八九十]+)$/)
      if (numMatch) {
        const num = numMatch[1]
        const nextPart = parts[i + 1]?.trim() || ''
        if (nextPart) {
          // Extract scene name from first line
          const firstLine = nextPart.split('\n')[0].replace(/[:：]/g, '').trim()
          scenes.push({
            name: `场景 ${num}: ${firstLine.slice(0, 20)}`,
            prompt: nextPart,
            status: 'pending',
          })
          i++ // Skip the content part
        }
        continue
      }

      // This is content without a preceding number
      if (part.length > 5) {
        const firstLine = part.split('\n')[0].trim()
        scenes.push({
          name: `场景 ${scenes.length + 1}: ${firstLine.slice(0, 20)}`,
          prompt: part,
          status: 'pending',
        })
      }
    }
  }

  // Pattern 2: Split by double newlines (paragraphs)
  if (scenes.length === 0) {
    const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim().length > 5)
    return paragraphs.map((p, i) => ({
      name: `场景 ${i + 1}`,
      prompt: p.trim().replace(/\n/g, ' '),
      status: 'pending',
    }))
  }

  return scenes
}

/** Detect if a file is a supported script format. */
export function isSupportedScript(filename: string): boolean {
  const ext = filename.split('.').pop()?.toLowerCase() || ''
  return ['txt', 'md', 'markdown', 'json'].includes(ext)
}
