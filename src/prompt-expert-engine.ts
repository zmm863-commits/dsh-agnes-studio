/**
 * 提示词专家引擎 — Host 端
 * 用户用中文说想法 → 文本模型生成专业提示词（中英文对照）
 */

// ─── 专家类型定义 ──────────────────────────────────────────────────────────

export interface ExpertField {
  key: string; label: string; type: 'select'; default: string; options: string[]
}

export interface ExpertType {
  key: string; icon: string; name: string; desc: string; placeholder: string
  fields: ExpertField[]
}

export const EXPERT_TYPES: ExpertType[] = [
  {
    key: 't2i', icon: '🖼', name: '文生图专家', desc: '把想法扩写成专业绘图提示词',
    placeholder: '例如：一个穿汉服的女孩在樱花树下弹古筝',
    fields: [
      { key: 'style', label: '画面风格', type: 'select', default: '不限', options: ['不限', '写实摄影', '动漫插画', '国风水墨', '赛博朋克', '3D渲染', '水彩手绘', '电影质感'] },
      { key: 'ratio', label: '画幅比例', type: 'select', default: '1:1', options: ['1:1', '16:9', '9:16', '4:3', '3:4'] },
      { key: 'shot', label: '景别', type: 'select', default: '不限', options: ['不限', '特写', '半身', '全身', '远景', '鸟瞰'] },
    ],
  },
  {
    key: 'i2i', icon: '🎨', name: '图生图专家', desc: '生成精准的改图指令',
    placeholder: '例如：把这张产品图的背景换成海边黄昏，保持产品不变',
    fields: [
      { key: 'strength', label: '改动幅度', type: 'select', default: '中等', options: ['轻微', '中等', '大幅重绘'] },
      { key: 'style', label: '目标风格', type: 'select', default: '不限', options: ['不限', '写实摄影', '动漫插画', '水彩手绘', '3D渲染', '电商主图'] },
    ],
  },
  {
    key: 't2v', icon: '🎬', name: '文生视频专家', desc: '生成含运镜与光线的视频提示词',
    placeholder: '例如：一只猫在夕阳下的海滩散步，海浪轻轻涌来',
    fields: [
      { key: 'camera', label: '镜头运动', type: 'select', default: '缓慢推进', options: ['固定镜头', '缓慢推进', '缓慢拉远', '左摇', '右摇', '跟随'] },
      { key: 'duration', label: '时长', type: 'select', default: '5秒', options: ['5秒', '10秒'] },
      { key: 'style', label: '画面风格', type: 'select', default: '电影感', options: ['电影感', '写实', '动漫', '赛博朋克', '国风'] },
    ],
  },
  {
    key: 'novel', icon: '📖', name: '小说生成专家', desc: '生成设定、大纲与开篇正文',
    placeholder: '例如：都市悬疑，法医女主追查连环失踪案',
    fields: [
      { key: 'genre', label: '题材', type: 'select', default: '都市', options: ['都市', '悬疑', '玄幻', '言情', '科幻', '历史', '恐怖'] },
      { key: 'words', label: '开篇字数', type: 'select', default: '800字', options: ['500字', '800字', '1500字', '3000字'] },
      { key: 'tone', label: '文风', type: 'select', default: '轻松明快', options: ['轻松明快', '沉稳厚重', '紧张刺激', '唯美抒情'] },
    ],
  },
  {
    key: 'drama', icon: '🎭', name: '短剧剧本专家', desc: '生成带钩子的竖屏短剧剧本',
    placeholder: '例如：外卖员逆袭成集团继承人，第一集被打脸',
    fields: [
      { key: 'genre', label: '题材', type: 'select', default: '逆袭', options: ['逆袭', '甜宠', '悬疑', '家庭伦理', '职场', '古装'] },
      { key: 'duration', label: '单集时长', type: 'select', default: '1-2分钟', options: ['1分钟', '1-2分钟', '3分钟'] },
    ],
  },
  {
    key: 'anchor', icon: '🎙', name: '数字人口播专家', desc: '生成适合 TTS 朗读的口播稿',
    placeholder: '例如：介绍一款降噪耳机，突出性价比',
    fields: [
      { key: 'length', label: '稿件长度', type: 'select', default: '约300字', options: ['约150字', '约300字', '约500字'] },
      { key: 'tone', label: '语气', type: 'select', default: '亲切自然', options: ['亲切自然', '专业理性', '激情带货', '轻松幽默'] },
    ],
  },
  {
    key: 'sheet', icon: '🧍', name: '角色三视图专家', desc: '生成角色设定与三视图提示词',
    placeholder: '例如：28岁职场女性，干练短发，穿深色西装',
    fields: [
      { key: 'style', label: '画风', type: 'select', default: '动漫插画', options: ['动漫插画', '写实', '国风', '3D渲染', '水彩'] },
      { key: 'gender', label: '性别', type: 'select', default: '不限', options: ['不限', '男性', '女性'] },
    ],
  },
]

// ─── System Prompt 模板 ────────────────────────────────────────────────────

const EXPERT_OUTPUT_RULE = `
输出格式（严格遵守，不要有任何前言、解释或 markdown 代码块）：
先输出【中文提示词】，再输出【English Prompt】，两段语义一一对应。
最后另起一行输出【推荐参数】，给出推荐尺寸/时长/风格等。`

const EXPERT_PROMPTS: Record<string, () => string> = {
  t2i: () => `你是一位资深 AI 绘画提示词工程师，擅长把口语化想法改写成高质量绘图提示词。
任务：把用户用中文描述的想法，扩写成可直接投喂文生图模型的专业提示词。
${EXPERT_OUTPUT_RULE}
英文提示词要求：一段式、逗号分隔，顺序为：主体→外观细节→姿态/动作→环境背景→构图景别→光线→风格→画质词。用词具体可视觉化。`,

  i2i: () => `你是一位图生图（Image-to-Image）改图提示词专家。
任务：根据用户想对参考图做的修改，写出精确的改图指令。
${EXPERT_OUTPUT_RULE}
改图指令要求：只描述"需要改变的部分"，明确写 keep everything else unchanged。不要重复描述原图已有的内容。`,

  t2v: () => `你是一位 AI 视频生成提示词专家，熟悉文生视频模型的特性。
任务：把用户想法改写为高质量视频提示词。
${EXPERT_OUTPUT_RULE}
视频提示词要求：顺序为 [主体]+[动作]+[场景]+[镜头运动]+[光线]+[风格]，英文一段式。只写一个连贯镜头能完成的动作。必须在末尾附加：no text, no subtitles, no watermarks。`,

  novel: () => `你是一位中文小说作家与选题策划人。
任务：根据用户想法产出小说方案与开篇正文。
输出格式（严格遵守）：【标题】【故事设定】世界观+核心冲突【章节大纲】3-5章【开篇正文】【English Summary】3-5句英文概要。`,

  drama: () => `你是一位短剧编剧，熟悉竖屏短剧的创作规律。
任务：根据用户想法产出短剧剧本。
输出格式：【剧名】【人物表】2-4个角色【分场剧本】每场含场次标题、画面描述、台词【English Summary】英文概要。开篇15秒必须有强钩子。`,

  anchor: () => `你是一位短视频口播文案策划。
任务：根据用户想法产出可直接配音的口播稿。
输出格式：【标题】【口播正文】分段输出，每段40-60字【English Summary】英文概要。开头3秒必须有钩子，句子短、口语化。`,

  sheet: () => `你是一位角色设定提示词专家。
任务：根据用户描述的角色，产出用于生成"三视图设定图"的专业提示词。
${EXPERT_OUTPUT_RULE}
要求：结构为人物身份/年龄→发型发色→五官特征→服装→配饰→身材比例。画面要求：正面+侧面+背面三视图，纯白背景。`
}

// ─── 路由处理 ──────────────────────────────────────────────────────────────

export async function handlePromptExpertRoute(
  method: string, urlPath: string, body: any,
  resolveApiKey: (vendor: string) => Promise<string>,
  getVendorFromModel: (model: string) => string,
): Promise<{ status: number; data: any } | null> {
  const ep = urlPath.replace(/^\/agnes-studio\/api\/?/, '').replace(/^prompt-expert\/?/, '')

  // GET /prompt-expert/types
  if (method === 'GET' && ep === 'types') {
    return { status: 200, data: { types: EXPERT_TYPES } }
  }

  // POST /prompt-expert/generate
  if (method === 'POST' && ep === 'generate') {
    const { type: expertKey, idea, params, model } = body || {}
    if (!expertKey || !idea) return { status: 400, data: { error: '缺少专家类型或想法' } }

    const promptBuilder = EXPERT_PROMPTS[expertKey]
    if (!promptBuilder) return { status: 400, data: { error: `未知专家类型: ${expertKey}` } }

    // Build param text
    const paramLines: string[] = []
    if (params && typeof params === 'object') {
      for (const [k, v] of Object.entries(params)) {
        if (v && v !== '不限') paramLines.push(`${k}: ${v}`)
      }
    }
    const paramText = paramLines.length > 0 ? paramLines.join('；') : '（用户未指定，按专业判断补充）'

    const userPrompt = `用户的想法：${idea}\n\n用户选择的参数：${paramText}\n\n请按系统提示要求的格式输出结果。`

    // Resolve model and API key
    const selectedModel = model || 'agnes-3.0-flash'
    const vendor = getVendorFromModel(selectedModel)
    let apiKey = ''
    try { apiKey = await resolveApiKey(vendor) } catch {
      return { status: 401, data: { error: 'API Key 未配置' } }
    }

    // Actually run the model and return the text. The client reads
    // `data.prompt`; returning a bare 202 made it display "生成中..." forever.
    try {
      const prompt = await generatePromptExpert(
        expertKey, idea, (params ?? {}) as Record<string, string>, apiKey, selectedModel,
      )
      if (!prompt) return { status: 502, data: { error: '模型没有返回内容' } }
      return { status: 200, data: { prompt, model: selectedModel } }
    } catch (e) {
      return { status: 502, data: { error: e instanceof Error ? e.message : String(e) } }
    }
  }

  return null
}

// ─── 文本模型调用 ──────────────────────────────────────────────────────────

const VENDOR_URLS: Record<string, string> = {
  agnes: 'https://api.agnes-ai.cn/v1', deepseek: 'https://api.deepseek.com/v1',
  qwen: 'https://dashscope.aliuncs.com/compatible-mode/v1', doubao: 'https://ark.cn-beijing.volces.com/api/v3',
  minimax: 'https://api.minimaxi.com/v1', ollama: 'http://localhost:11434/v1',
}

function getVendor(model: string): string {
  if (!model) return 'agnes'; const m = model.toLowerCase()
  if (m.startsWith('ollama:')) return 'ollama'
  for (const p of Object.keys(VENDOR_URLS)) { if (p !== 'agnes' && m.startsWith(p)) return p }
  return 'agnes'
}

async function callTextModelLocal(sysPrompt: string, userPrompt: string, apiKey: string, model: string, maxTokens = 2048): Promise<string> {
  const baseUrl = VENDOR_URLS[getVendor(model)] || VENDOR_URLS.agnes
  const ac = new AbortController(); const t = setTimeout(() => ac.abort(), 120_000)
  try {
    const r = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST', signal: ac.signal,
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, messages: [{ role: 'system', content: sysPrompt }, { role: 'user', content: userPrompt }], max_tokens: maxTokens, temperature: 0.7 }),
    })
    if (!r.ok) throw new Error(`API ${r.status}: ${(await r.text()).slice(0, 300)}`)
    const res = await r.json() as any; return res.choices?.[0]?.message?.content || ''
  } finally { clearTimeout(t) }
}

// ─── 异步生成（供 route 调用）────────────────────────────────────────────

export async function generatePromptExpert(
  expertKey: string, idea: string, params: Record<string, string>,
  apiKey: string, model: string,
): Promise<string> {
  const promptBuilder = EXPERT_PROMPTS[expertKey]
  if (!promptBuilder) throw new Error(`未知专家类型: ${expertKey}`)

  const paramLines: string[] = []
  for (const [k, v] of Object.entries(params)) {
    if (v && v !== '不限') paramLines.push(`${k}: ${v}`)
  }
  const paramText = paramLines.length > 0 ? paramLines.join('；') : '（用户未指定，按专业判断补充）'
  const userPrompt = `用户的想法：${idea}\n\n用户选择的参数：${paramText}\n\n请按系统提示要求的格式输出结果。`

  const result = await callTextModelLocal(promptBuilder(), userPrompt, apiKey, model, 2048)
  return result.trim()
}
