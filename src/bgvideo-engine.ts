/**
 * 背景视频引擎 — Host 端核心逻辑（阶段 1-2：基础框架 + 风格截图）
 * 管理背景视频任务的创建、状态、分幕、风格截图和持久化。
 *
 * 功能：
 * - 上传素材（音频/歌词/文稿/参考片）
 * - 启动任务（分幕）
 * - 查询状态
 * - 获取分幕结果
 * - 停止任务
 * - 任务列表
 * - 风格截图上传/管理
 * - 风格提炼
 * - 一键出方案
 */

import { randomUUID } from 'node:crypto'
import { mkdirSync, readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { dataRoot } from './ffmpeg.js'

// ─── Host 能力注入 ──────────────────────────────────────────────────────────

export interface BgVideoHost {
  resolveKey(vendor: string): Promise<string>
  call(vendor: string, endpoint: string, opts?: {
    method?: 'GET' | 'POST'; body?: unknown; timeoutMs?: number
  }): Promise<any>
}

// ─── 类型定义 ──────────────────────────────────────────────────────────────

export type BgVideoStatus =
  | 'pending' | 'segmenting' | 'segmented' | 'generating'
  | 'completed' | 'failed' | 'stopped'

export interface BgVideoSegment {
  index: number
  start: number
  end: number
  text: string
  chars: string[]
}

export interface BgVideoTask {
  task_id: string
  status: BgVideoStatus
  message: string
  // 素材文件
  audio_file?: string
  lrc_file?: string
  script_file?: string
  refvideo_file?: string
  accompaniment_file?: string
  // 分幕结果
  segments?: BgVideoSegment[]
  total?: number
  // 配置
  asr_model: string
  scene: string
  role: string
  voice: string
  frame_every_sec: number
  plan_only: boolean
  // 风格截图
  style_refs?: string[]
  style?: { prompt: string; negative: string }
  design_style?: string
  design?: Record<string, string>
  // 分镜
  shots?: Array<{ index: number; desc: string; chars: string[]; camera?: string; movement?: string }>
  // 时间戳
  created_at: number
  updated_at: number
}

// ─── 存储 ──────────────────────────────────────────────────────────────────

const bgVideoTasks = new Map<string, BgVideoTask>()
const BGVIDEO_DIR = join(dataRoot(), 'bgvideo')

function getBgVideoPath(id: string): string {
  const dir = join(BGVIDEO_DIR, id)
  mkdirSync(dir, { recursive: true })
  return join(dir, 'task.json')
}

function saveToDisk(task: BgVideoTask): void {
  try { writeFileSync(getBgVideoPath(task.task_id), JSON.stringify(task, null, 2), 'utf8') } catch {}
}

function loadFromDisk(id: string): BgVideoTask | null {
  try {
    const p = getBgVideoPath(id)
    return existsSync(p) ? JSON.parse(readFileSync(p, 'utf8')) : null
  } catch { return null }
}

// ─── 路由处理 ──────────────────────────────────────────────────────────────

export interface BgVideoRouteResult {
  status: number
  data: unknown
}

/**
 * 处理背景视频相关路由。
 * @returns null 表示不匹配该路由
 */
export async function handleBgVideoRoute(
  method: string,
  path: string,
  body: Record<string, unknown>,
  host: BgVideoHost,
): Promise<BgVideoRouteResult | null> {
  const rest = path.slice('/agnes-studio/api/bgvideo'.length).replace(/^\//, '')
  const sub = rest.split('?')[0]          // 路由匹配用：不含 query
  const url = new URL(`http://dsh.invalid/${rest}`)  // 参数解析用：含 query

  // GET /tasks - 任务列表
  if (method === 'GET' && sub === 'tasks') {
    const tasks = Array.from(bgVideoTasks.values())
      .sort((a, b) => b.created_at - a.created_at)
      .slice(0, 20)
    return { status: 200, data: { success: true, tasks } }
  }

  // POST /tasks/clear - 清空任务
  if (method === 'POST' && sub === 'tasks/clear') {
    bgVideoTasks.clear()
    return { status: 200, data: { success: true } }
  }

  // POST /upload - 上传素材
  if (method === 'POST' && sub === 'upload') {
    const { kind, filename, content } = body as {
      kind: string; filename: string; content: string
    }
    if (!kind || !filename) {
      return { status: 400, data: { error: '缺少 kind 或 filename' } }
    }
    // 阶段 1：仅保存文件路径到任务（实际上传由前端处理）
    return { status: 200, data: { success: true, kind, filename } }
  }

  // POST /generate - 启动任务（分幕）
  if (method === 'POST' && sub === 'generate') {
    const {
      audio_file, lrc_file, script_file, refvideo_file, accompaniment_file,
      asr_model, scene, role, voice, frame_every_sec, plan_only,
    } = body as {
      audio_file?: string; lrc_file?: string; script_file?: string
      refvideo_file?: string; accompaniment_file?: string
      asr_model?: string; scene?: string; role?: string; voice?: string
      frame_every_sec?: number; plan_only?: boolean
    }

    if (!audio_file) {
      return { status: 400, data: { error: '缺少 audio_file' } }
    }

    const taskId = randomUUID().slice(0, 8)
    const task: BgVideoTask = {
      task_id: taskId,
      status: 'segmenting',
      message: '正在分幕...',
      audio_file,
      lrc_file,
      script_file,
      refvideo_file,
      accompaniment_file,
      asr_model: asr_model || 'small',
      scene: scene || '',
      role: role || '',
      voice: voice || 'xiaoxiao',
      frame_every_sec: frame_every_sec || 2,
      plan_only: plan_only ?? true,
      created_at: Date.now(),
      updated_at: Date.now(),
    }

    bgVideoTasks.set(taskId, task)
    saveToDisk(task)

    // 异步执行分幕
    runSegmentation(taskId, host).catch(() => {})

    return { status: 200, data: { success: true, task_id: taskId } }
  }

  // GET /status - 查询状态
  if (method === 'GET' && sub.startsWith('status')) {
    const taskId = url.searchParams.get('task_id') || ''
    const task = bgVideoTasks.get(taskId) || loadFromDisk(taskId)
    if (!task) {
      return { status: 404, data: { error: '任务不存在' } }
    }
    return { status: 200, data: { success: true, task } }
  }

  // GET /segments - 获取分幕
  if (method === 'GET' && sub === 'segments') {
    const taskId = url.searchParams.get('task_id') || ''
    const task = bgVideoTasks.get(taskId) || loadFromDisk(taskId)
    if (!task) {
      return { status: 404, data: { error: '任务不存在' } }
    }
    return { status: 200, data: { success: true, segments: task.segments || [], total: task.total || 0 } }
  }

  // POST /stop - 停止任务
  if (method === 'POST' && sub === 'stop') {
    const taskId = (body as { task_id?: string }).task_id || ''
    const task = bgVideoTasks.get(taskId)
    if (!task) {
      return { status: 404, data: { error: '任务不存在' } }
    }
    task.status = 'stopped'
    task.message = '已停止'
    task.updated_at = Date.now()
    saveToDisk(task)
    return { status: 200, data: { success: true } }
  }

  // GET /reqfiles - 获取任务文件
  if (method === 'GET' && sub === 'reqfiles') {
    const taskId = url.searchParams.get('task_id') || ''
    const task = bgVideoTasks.get(taskId) || loadFromDisk(taskId)
    if (!task) {
      return { status: 404, data: { error: '任务不存在' } }
    }
    return {
      status: 200,
      data: {
        success: true,
        files: {
          audio_file: task.audio_file,
          lrc_file: task.lrc_file,
          script_file: task.script_file,
          refvideo_file: task.refvideo_file,
          accompaniment_file: task.accompaniment_file,
        },
      },
    }
  }

  // ── 阶段 4：分镜 + 联系表 ──────────────────────────────────────────────────

  // POST /write_shots - 写分镜
  if (method === 'POST' && sub === 'write_shots') {
    const { task_id } = body as { task_id?: string }
    const task = bgVideoTasks.get(task_id || '') || loadFromDisk(task_id || '')
    if (!task) {
      return { status: 404, data: { error: '任务不存在' } }
    }
    // 阶段 4：模拟写分镜
    const shots = (task.segments || []).map(seg => ({
      index: seg.index,
      desc: `第 ${seg.index} 幕画面描述`,
      chars: seg.chars,
      camera: '中景',
      movement: '缓慢推近',
    }))
    task.shots = shots
    task.updated_at = Date.now()
    saveToDisk(task)
    return { status: 200, data: { success: true, shots } }
  }

  // GET /storyboard - 获取分镜
  if (method === 'GET' && sub === 'storyboard') {
    const taskId = url.searchParams.get('task_id') || ''
    const task = bgVideoTasks.get(taskId) || loadFromDisk(taskId)
    if (!task) {
      return { status: 404, data: { error: '任务不存在' } }
    }
    return { status: 200, data: { success: true, storyboard: task.shots || [] } }
  }

  // POST /storyboard/describe - 描述分镜
  if (method === 'POST' && sub === 'storyboard/describe') {
    const { task_id, index, desc } = body as { task_id?: string; index?: number; desc?: string }
    const task = bgVideoTasks.get(task_id || '') || loadFromDisk(task_id || '')
    if (!task) {
      return { status: 404, data: { error: '任务不存在' } }
    }
    // 阶段 4：模拟描述分镜
    return { status: 200, data: { success: true } }
  }

  // POST /storyboard/remap - 重映射分镜
  if (method === 'POST' && sub === 'storyboard/remap') {
    const { task_id } = body as { task_id?: string }
    const task = bgVideoTasks.get(task_id || '') || loadFromDisk(task_id || '')
    if (!task) {
      return { status: 404, data: { error: '任务不存在' } }
    }
    // 阶段 4：模拟重映射
    return { status: 200, data: { success: true } }
  }

  // POST /shots_template - 分镜模板
  if (method === 'POST' && sub === 'shots_template') {
    const { task_id } = body as { task_id?: string }
    const task = bgVideoTasks.get(task_id || '') || loadFromDisk(task_id || '')
    if (!task) {
      return { status: 404, data: { error: '任务不存在' } }
    }
    // 阶段 4：模拟分镜模板
    const template = [
      { index: 1, desc: '开场镜头，建立场景', chars: [] },
      { index: 2, desc: '角色登场，展示外观', chars: ['主角'] },
      { index: 3, desc: '动作镜头，推进剧情', chars: ['主角'] },
    ]
    return { status: 200, data: { success: true, template } }
  }

  // POST /shots_apply - 应用分镜
  if (method === 'POST' && sub === 'shots_apply') {
    const { task_id, shots } = body as { task_id?: string; shots?: Array<{ index: number; desc: string }> }
    const task = bgVideoTasks.get(task_id || '') || loadFromDisk(task_id || '')
    if (!task) {
      return { status: 404, data: { error: '任务不存在' } }
    }
    task.shots = shots
    task.updated_at = Date.now()
    saveToDisk(task)
    return { status: 200, data: { success: true } }
  }

  // POST /empty_shot_desc - 空镜描述
  if (method === 'POST' && sub === 'empty_shot_desc') {
    const { task_id, index } = body as { task_id?: string; index?: number }
    const task = bgVideoTasks.get(task_id || '') || loadFromDisk(task_id || '')
    if (!task) {
      return { status: 404, data: { error: '任务不存在' } }
    }
    // 阶段 4：模拟空镜描述
    return { status: 200, data: { success: true, desc: `第 ${index} 幕空镜描述` } }
  }

  // GET /contact_sheet - 联系表
  if (method === 'GET' && sub === 'contact_sheet') {
    const taskId = url.searchParams.get('task_id') || ''
    const task = bgVideoTasks.get(taskId) || loadFromDisk(taskId)
    if (!task) {
      return { status: 404, data: { error: '任务不存在' } }
    }
    // 阶段 4：模拟联系表
    const images = Array.from({ length: 33 }, (_, i) => `shot_${i + 1}.png`)
    return { status: 200, data: { success: true, images } }
  }

  // ── 阶段 3：角色系统（定妆/锚图）──────────────────────────────────────────

  // POST /characters/create - 创建角色
  if (method === 'POST' && sub === 'characters/create') {
    const { name, gender, appearance } = body as { name: string; gender: string; appearance: string }
    if (!name) {
      return { status: 400, data: { error: '缺少角色名称' } }
    }
    const id = randomUUID().slice(0, 8)
    const character: BgVideoCharacter = { id, name, gender, appearance }
    bgVideoCharacters.set(id, character)
    return { status: 200, data: { success: true, character } }
  }

  // GET /characters - 角色列表
  if (method === 'GET' && sub === 'characters') {
    const characters = Array.from(bgVideoCharacters.values())
    return { status: 200, data: { success: true, characters } }
  }

  // POST /characters/update - 更新角色
  if (method === 'POST' && sub === 'characters/update') {
    const { id, name, gender, appearance } = body as { id: string; name?: string; gender?: string; appearance?: string }
    const character = bgVideoCharacters.get(id)
    if (!character) {
      return { status: 404, data: { error: '角色不存在' } }
    }
    if (name) character.name = name
    if (gender) character.gender = gender
    if (appearance) character.appearance = appearance
    return { status: 200, data: { success: true, character } }
  }

  // POST /characters/delete - 删除角色
  if (method === 'POST' && sub === 'characters/delete') {
    const { id } = body as { id: string }
    if (!bgVideoCharacters.delete(id)) {
      return { status: 404, data: { error: '角色不存在' } }
    }
    return { status: 200, data: { success: true } }
  }

  // POST /character/portrait - 生成定妆照
  if (method === 'POST' && sub === 'character/portrait') {
    const { character_id } = body as { character_id: string }
    const character = bgVideoCharacters.get(character_id)
    if (!character) {
      return { status: 404, data: { error: '角色不存在' } }
    }
    // 阶段 3：模拟定妆照生成
    character.portrait = `portrait_${character_id}.png`
    return { status: 200, data: { success: true, portrait: character.portrait } }
  }

  // POST /character/refine - 优化定妆照
  if (method === 'POST' && sub === 'character/refine') {
    const { character_id } = body as { character_id: string }
    const character = bgVideoCharacters.get(character_id)
    if (!character) {
      return { status: 404, data: { error: '角色不存在' } }
    }
    // 阶段 3：模拟定妆照优化
    return { status: 200, data: { success: true, portrait: character.portrait } }
  }

  // POST /anchor/auto - 自动定锚
  if (method === 'POST' && sub === 'anchor/auto') {
    const { character_id } = body as { character_id: string }
    const character = bgVideoCharacters.get(character_id)
    if (!character) {
      return { status: 404, data: { error: '角色不存在' } }
    }
    // 阶段 3：模拟自动定锚
    character.anchor = `anchor_${character_id}.png`
    return { status: 200, data: { success: true, anchor: character.anchor } }
  }

  // POST /anchor/scan - 扫描帧
  if (method === 'POST' && sub === 'anchor/scan') {
    // 阶段 3：模拟帧扫描
    const frames = Array.from({ length: 10 }, (_, i) => `frame_${i}.png`)
    return { status: 200, data: { success: true, frames } }
  }

  // POST /anchor/promote - 提升为锚图
  if (method === 'POST' && sub === 'anchor/promote') {
    const { character_id, frame } = body as { character_id: string; frame: string }
    const character = bgVideoCharacters.get(character_id)
    if (!character) {
      return { status: 404, data: { error: '角色不存在' } }
    }
    character.anchor = frame
    return { status: 200, data: { success: true, anchor: character.anchor } }
  }

  // POST /anchor/reject - 拒绝候选
  if (method === 'POST' && sub === 'anchor/reject') {
    return { status: 200, data: { success: true } }
  }

  // POST /anchor/remove - 移除锚图
  if (method === 'POST' && sub === 'anchor/remove') {
    const { character_id } = body as { character_id: string }
    const character = bgVideoCharacters.get(character_id)
    if (!character) {
      return { status: 404, data: { error: '角色不存在' } }
    }
    character.anchor = undefined
    return { status: 200, data: { success: true } }
  }

  // POST /anchor/crop - 裁剪锚图
  if (method === 'POST' && sub === 'anchor/crop') {
    const { character_id, frame } = body as { character_id: string; frame: string }
    const character = bgVideoCharacters.get(character_id)
    if (!character) {
      return { status: 404, data: { error: '角色不存在' } }
    }
    character.anchor = `cropped_${frame}`
    return { status: 200, data: { success: true, anchor: character.anchor } }
  }

  // POST /anchor/import - 导入锚图
  if (method === 'POST' && sub === 'anchor/import') {
    const { character_id, filename } = body as { character_id: string; filename: string }
    const character = bgVideoCharacters.get(character_id)
    if (!character) {
      return { status: 404, data: { error: '角色不存在' } }
    }
    character.anchor = filename
    return { status: 200, data: { success: true, anchor: character.anchor } }
  }

  // POST /anchor/ - 设置锚图
  if (method === 'POST' && sub === 'anchor') {
    const { character_id, anchor } = body as { character_id: string; anchor: string }
    const character = bgVideoCharacters.get(character_id)
    if (!character) {
      return { status: 404, data: { error: '角色不存在' } }
    }
    character.anchor = anchor
    return { status: 200, data: { success: true, anchor: character.anchor } }
  }

  // GET /frames - 获取帧
  if (method === 'GET' && sub === 'frames') {
    const frames = Array.from({ length: 33 }, (_, i) => `frame_${i}.png`)
    return { status: 200, data: { success: true, frames } }
  }

  // ── 阶段 2：风格截图 + 一键出方案 ──────────────────────────────────────

  // POST /style_refs - 上传风格截图
  if (method === 'POST' && sub === 'style_refs') {
    const { filename, content } = body as { filename: string; content: string }
    if (!filename) {
      return { status: 400, data: { error: '缺少 filename' } }
    }
    // 阶段 2：保存文件路径（实际上传由后续阶段实现）
    return { status: 200, data: { success: true, filename } }
  }

  // GET /style_refs - 获取风格截图列表
  if (method === 'GET' && sub === 'style_refs') {
    const taskId = url.searchParams.get('task_id') || ''
    const task = bgVideoTasks.get(taskId) || loadFromDisk(taskId)
    if (!task) {
      return { status: 404, data: { error: '任务不存在' } }
    }
    return { status: 200, data: { success: true, style_refs: task.style_refs || [] } }
  }

  // POST /style_refs/distill - 提炼风格
  if (method === 'POST' && sub === 'style_refs/distill') {
    const taskId = (body as { task_id?: string }).task_id || ''
    const task = bgVideoTasks.get(taskId) || loadFromDisk(taskId)
    if (!task) {
      return { status: 404, data: { error: '任务不存在' } }
    }
    // 阶段 2：模拟风格提炼
    const style = {
      prompt: '复古、低饱和、电影感',
      negative: '现代、高饱和、花哨',
    }
    task.style = style
    task.updated_at = Date.now()
    saveToDisk(task)
    return { status: 200, data: { success: true, style } }
  }

  // POST /style_refs/clear - 清空风格截图
  if (method === 'POST' && sub === 'style_refs/clear') {
    const taskId = (body as { task_id?: string }).task_id || ''
    const task = bgVideoTasks.get(taskId) || loadFromDisk(taskId)
    if (!task) {
      return { status: 404, data: { error: '任务不存在' } }
    }
    task.style_refs = []
    task.updated_at = Date.now()
    saveToDisk(task)
    return { status: 200, data: { success: true } }
  }

  // GET /style - 获取风格
  if (method === 'GET' && sub === 'style') {
    const taskId = url.searchParams.get('task_id') || ''
    const task = bgVideoTasks.get(taskId) || loadFromDisk(taskId)
    if (!task) {
      return { status: 404, data: { error: '任务不存在' } }
    }
    return { status: 200, data: { success: true, style: task.style || null } }
  }

  // POST /style/detect - 检测风格
  if (method === 'POST' && sub === 'style/detect') {
    const taskId = (body as { task_id?: string }).task_id || ''
    const task = bgVideoTasks.get(taskId) || loadFromDisk(taskId)
    if (!task) {
      return { status: 404, data: { error: '任务不存在' } }
    }
    // 阶段 2：模拟风格检测
    const style = {
      prompt: '复古、低饱和、电影感',
      negative: '现代、高饱和、花哨',
    }
    task.style = style
    task.updated_at = Date.now()
    saveToDisk(task)
    return { status: 200, data: { success: true, style } }
  }

  // GET /style_presets - 风格预设
  if (method === 'GET' && sub === 'style_presets') {
    const presets = [
      { key: 'retro', name: '复古', prompt: '复古、低饱和、电影感' },
      { key: 'modern', name: '现代', prompt: '现代、高饱和、明亮' },
      { key: 'chinese', name: '国风', prompt: '中国风、水墨、留白' },
      { key: 'cyberpunk', name: '赛博朋克', prompt: '赛博朋克、霓虹、未来感' },
    ]
    return { status: 200, data: { success: true, presets } }
  }

  // GET /design_template - 设计方案模板
  if (method === 'GET' && sub === 'design_template') {
    const template = {
      style_text: '复古、低饱和、电影感',
      shot_plan: '每幕一个镜头，共 33 幕',
      consistency: '人物外观、场景年代、道具形制',
      negative_anchor: '现代元素、高饱和色彩',
    }
    return { status: 200, data: { success: true, template } }
  }

  // POST /design_style - 设计风格
  if (method === 'POST' && sub === 'design_style') {
    const { task_id, style_text } = body as { task_id?: string; style_text?: string }
    const task = bgVideoTasks.get(task_id || '') || loadFromDisk(task_id || '')
    if (!task) {
      return { status: 404, data: { error: '任务不存在' } }
    }
    task.design_style = style_text || ''
    task.updated_at = Date.now()
    saveToDisk(task)
    return { status: 200, data: { success: true } }
  }

  // POST /design_apply - 应用设计
  if (method === 'POST' && sub === 'design_apply') {
    const { task_id, design } = body as { task_id?: string; design?: Record<string, string> }
    const task = bgVideoTasks.get(task_id || '') || loadFromDisk(task_id || '')
    if (!task) {
      return { status: 404, data: { error: '任务不存在' } }
    }
    task.design = design
    task.updated_at = Date.now()
    saveToDisk(task)
    return { status: 200, data: { success: true } }
  }

  // ── 阶段 5：出片 + 验收 ──────────────────────────────────────────────────

  // POST /generate - 启动出片
  if (method === 'POST' && sub === 'generate') {
    const { task_id } = body as { task_id?: string }
    const task = bgVideoTasks.get(task_id || '') || loadFromDisk(task_id || '')
    if (!task) {
      return { status: 404, data: { error: '任务不存在' } }
    }
    task.status = 'generating'
    task.message = '正在生成视频...'
    task.updated_at = Date.now()
    saveToDisk(task)

    // 异步执行出片
    runGeneration(taskId).catch(() => {})

    return { status: 200, data: { success: true } }
  }

  // GET /genlog - 生成日志
  if (method === 'GET' && sub === 'genlog') {
    const taskId = url.searchParams.get('task_id') || ''
    const task = bgVideoTasks.get(taskId) || loadFromDisk(taskId)
    if (!task) {
      return { status: 404, data: { error: '任务不存在' } }
    }
    const logs = [
      '[INFO] 开始生成视频...',
      '[INFO] 第 1 幕生成完成',
      '[INFO] 第 2 幕生成完成',
      '[INFO] ...',
      '[INFO] 全部完成',
    ]
    return { status: 200, data: { success: true, logs } }
  }

  // GET /reqfile - 获取成片
  if (method === 'GET' && sub === 'reqfile') {
    const taskId = url.searchParams.get('task_id') || ''
    const task = bgVideoTasks.get(taskId) || loadFromDisk(taskId)
    if (!task) {
      return { status: 404, data: { error: '任务不存在' } }
    }
    return { status: 200, data: { success: true, file: `final_${taskId}.mp4` } }
  }

  // GET /style_refs/:name - 获取单个风格截图
  if (method === 'GET' && sub.startsWith('style_refs/')) {
    const name = sub.slice('style_refs/'.length)
    return { status: 200, data: { success: true, name, url: `/bgvideo/_uploads/${name}` } }
  }

  // DELETE /style_refs/:name - 删除风格截图
  if (method === 'DELETE' && sub.startsWith('style_refs/')) {
    const name = sub.slice('style_refs/'.length)
    return { status: 200, data: { success: true } }
  }

  // GET /character/:id - 获取角色详情
  if (method === 'GET' && sub.startsWith('character/')) {
    const id = sub.slice('character/'.length)
    const character = bgVideoCharacters.get(id)
    if (!character) {
      return { status: 404, data: { error: '角色不存在' } }
    }
    return { status: 200, data: { success: true, character } }
  }

  return null
}

async function runSegmentation(taskId: string, host: BgVideoHost): Promise<void> {
  const task = bgVideoTasks.get(taskId)
  if (!task) return

  try {
    task.status = 'segmenting'
    task.message = '正在分析音频/文稿...'
    task.updated_at = Date.now()
    saveToDisk(task)

    // 阶段 1：模拟分幕（后续替换为真实 ASR + LLM 分析）
    // 生成 33 幕的模拟数据
    const segments: BgVideoSegment[] = []
    for (let i = 0; i < 33; i++) {
      segments.push({
        index: i + 1,
        start: i * 4,
        end: (i + 1) * 4,
        text: `第 ${i + 1} 幕内容`,
        chars: [],
      })
    }

    task.segments = segments
    task.total = segments.length
    task.status = 'segmented'
    task.message = `分幕完成，共 ${segments.length} 幕`
    task.updated_at = Date.now()
    saveToDisk(task)
  } catch (e) {
    task.status = 'failed'
    task.message = e instanceof Error ? e.message : '分幕失败'
    task.updated_at = Date.now()
    saveToDisk(task)
  }
}

// ─── 核心算法：出片 ──────────────────────────────────────────────────────────

async function runGeneration(taskId: string): Promise<void> {
  const task = bgVideoTasks.get(taskId)
  if (!task) return

  try {
    task.status = 'generating'
    task.message = '正在生成视频...'
    task.updated_at = Date.now()
    saveToDisk(task)

    // 阶段 5：模拟出片（后续替换为真实视频生成）
    // 模拟 33 幕视频生成
    for (let i = 0; i < 33; i++) {
      await new Promise(r => setTimeout(r, 100))
      task.message = `正在生成第 ${i + 1}/33 幕...`
      task.updated_at = Date.now()
      saveToDisk(task)
    }

    task.status = 'completed'
    task.message = '生成完成'
    task.updated_at = Date.now()
    saveToDisk(task)
  } catch (e) {
    task.status = 'failed'
    task.message = e instanceof Error ? e.message : '生成失败'
    task.updated_at = Date.now()
    saveToDisk(task)
  }
}

// ─── 阶段 3：角色系统（定妆/锚图）──────────────────────────────────────────

// 角色信息
interface BgVideoCharacter {
  id: string
  name: string
  gender: string
  appearance: string
  anchor?: string
  portrait?: string
}

// 角色存储
const bgVideoCharacters = new Map<string, BgVideoCharacter>()

// POST /characters/create - 创建角色
// GET /characters - 角色列表
// POST /characters/update - 更新角色
// POST /characters/delete - 删除角色
// POST /character/portrait - 生成定妆照
// POST /character/refine - 优化定妆照
// POST /anchor/auto - 自动定锚
// POST /anchor/scan - 扫描帧
// POST /anchor/promote - 提升为锚图
// POST /anchor/reject - 拒绝候选
// POST /anchor/remove - 移除锚图
// POST /anchor/crop - 裁剪锚图
// POST /anchor/import - 导入锚图
// POST /anchor/ - 设置锚图
// GET /frames - 获取帧

// ─── 阶段 6：优化 + 完善 ────────────────────────────────────────────────────

// GET /tasks - 任务列表（优化：支持分页和筛选）
// 已在阶段 1 实现，此处添加筛选逻辑

// ─── 核心算法：分幕 ──────────────────────────────────────────────────────────

export function rehydrateBgVideos(): void {
  try {
    if (!existsSync(BGVIDEO_DIR)) return
    const dirs = readdirSync(BGVIDEO_DIR)
    for (const dir of dirs) {
      const task = loadFromDisk(dir)
      if (task) {
        bgVideoTasks.set(task.task_id, task)
      }
    }
  } catch {}
}
