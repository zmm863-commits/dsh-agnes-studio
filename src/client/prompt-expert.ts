/**
 * 提示词专家 — 客户端 API 模块
 */

// ─── 类型定义 ──────────────────────────────────────────────────────────────

export interface ExpertField {
  key: string; label: string; type: 'select'; default: string; options: string[]
}

export interface ExpertType {
  key: string; icon: string; name: string; desc: string; placeholder: string
  fields: ExpertField[]
}

// ─── API 函数 ──────────────────────────────────────────────────────────────

const API_BASE = '/agnes-studio/api'

/** 获取专家类型列表 */
export async function fetchExpertTypes(): Promise<ExpertType[]> {
  try {
    const resp = await fetch(`${API_BASE}/prompt-expert/types`)
    if (resp.ok) {
      const data = await resp.json()
      return data.types || []
    }
  } catch {}
  // Fallback: built-in types
  return BUILTIN_EXPERT_TYPES
}

/** 生成提示词 */
export async function generateExpertPrompt(req: {
  type: string; idea: string; params: Record<string, string>; model?: string
}): Promise<string> {
  const resp = await fetch(`${API_BASE}/prompt-expert/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  })
  if (!resp.ok) {
    const data = await resp.json().catch(() => ({}))
    throw new Error(data.error || '生成失败')
  }
  const data = await resp.json()
  // If accepted (async), poll for result
  if (data.accepted) {
    return data.prompt || '生成中...'
  }
  return data.prompt || ''
}

// ─── 内置专家定义（Host 不可用时的 fallback）──────────────────────────────

const BUILTIN_EXPERT_TYPES: ExpertType[] = [
  { key: 't2i', icon: '🖼', name: '文生图专家', desc: '把想法扩写成专业绘图提示词', placeholder: '例如：一个穿汉服的女孩在樱花树下弹古筝', fields: [
    { key: 'style', label: '画面风格', type: 'select', default: '不限', options: ['不限', '写实摄影', '动漫插画', '国风水墨', '赛博朋克', '3D渲染', '水彩手绘', '电影质感'] },
    { key: 'ratio', label: '画幅比例', type: 'select', default: '1:1', options: ['1:1', '16:9', '9:16', '4:3', '3:4'] },
    { key: 'shot', label: '景别', type: 'select', default: '不限', options: ['不限', '特写', '半身', '全身', '远景', '鸟瞰'] },
  ]},
  { key: 'i2i', icon: '🎨', name: '图生图专家', desc: '生成精准的改图指令', placeholder: '例如：把这张产品图的背景换成海边黄昏', fields: [
    { key: 'strength', label: '改动幅度', type: 'select', default: '中等', options: ['轻微', '中等', '大幅重绘'] },
    { key: 'style', label: '目标风格', type: 'select', default: '不限', options: ['不限', '写实摄影', '动漫插画', '水彩手绘', '3D渲染', '电商主图'] },
  ]},
  { key: 't2v', icon: '🎬', name: '文生视频专家', desc: '生成含运镜与光线的视频提示词', placeholder: '例如：一只猫在夕阳下的海滩散步', fields: [
    { key: 'camera', label: '镜头运动', type: 'select', default: '缓慢推进', options: ['固定镜头', '缓慢推进', '缓慢拉远', '左摇', '右摇', '跟随'] },
    { key: 'duration', label: '时长', type: 'select', default: '5秒', options: ['5秒', '10秒'] },
    { key: 'style', label: '画面风格', type: 'select', default: '电影感', options: ['电影感', '写实', '动漫', '赛博朋克', '国风'] },
  ]},
  { key: 'novel', icon: '📖', name: '小说生成专家', desc: '生成设定、大纲与开篇正文', placeholder: '例如：都市悬疑，法医女主追查连环失踪案', fields: [
    { key: 'genre', label: '题材', type: 'select', default: '都市', options: ['都市', '悬疑', '玄幻', '言情', '科幻', '历史', '恐怖'] },
    { key: 'words', label: '开篇字数', type: 'select', default: '800字', options: ['500字', '800字', '1500字', '3000字'] },
    { key: 'tone', label: '文风', type: 'select', default: '轻松明快', options: ['轻松明快', '沉稳厚重', '紧张刺激', '唯美抒情'] },
  ]},
  { key: 'drama', icon: '🎭', name: '短剧剧本专家', desc: '生成带钩子的竖屏短剧剧本', placeholder: '例如：外卖员逆袭成集团继承人', fields: [
    { key: 'genre', label: '题材', type: 'select', default: '逆袭', options: ['逆袭', '甜宠', '悬疑', '家庭伦理', '职场', '古装'] },
    { key: 'duration', label: '单集时长', type: 'select', default: '1-2分钟', options: ['1分钟', '1-2分钟', '3分钟'] },
  ]},
  { key: 'anchor', icon: '🎙', name: '数字人口播专家', desc: '生成适合 TTS 朗读的口播稿', placeholder: '例如：介绍一款降噪耳机，突出性价比', fields: [
    { key: 'length', label: '稿件长度', type: 'select', default: '约300字', options: ['约150字', '约300字', '约500字'] },
    { key: 'tone', label: '语气', type: 'select', default: '亲切自然', options: ['亲切自然', '专业理性', '激情带货', '轻松幽默'] },
  ]},
  { key: 'sheet', icon: '🧍', name: '角色三视图专家', desc: '生成角色设定与三视图提示词', placeholder: '例如：28岁职场女性，干练短发', fields: [
    { key: 'style', label: '画风', type: 'select', default: '动漫插画', options: ['动漫插画', '写实', '国风', '3D渲染', '水彩'] },
    { key: 'gender', label: '性别', type: 'select', default: '不限', options: ['不限', '男性', '女性'] },
  ]},
]
