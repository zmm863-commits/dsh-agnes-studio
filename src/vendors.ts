/**
 * 厂商端点表 —— **唯一来源**。
 *
 * 这个表原先在 index.ts / drama-engine.ts / prompt-expert-engine.ts 各写了一份，
 * 于是同一个笔误被复制了两遍：Qwen 的域名 `aliyuncs` 少打了一个 y（写成 ali+uncs）。
 * 表现为「选 Qwen 模型时，提示词专家与短剧引擎都请求失败」。
 * 三份表放一起维护，就是为了让这类不一致没有再次发生的机会。
 */

/** 厂商 → OpenAI 兼容端点基址。 */
export const VENDOR_BASE_URLS: Record<string, string> = {
  agnes: 'https://api.agnes-ai.cn/v1',
  deepseek: 'https://api.deepseek.com/v1',
  qwen: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
  doubao: 'https://ark.cn-beijing.volces.com/api/v3',
  minimax: 'https://api.minimaxi.com/v1',
  ollama: 'http://localhost:11434/v1',
}

/**
 * 从模型名推断厂商。
 * @param model - 模型 id，如 `deepseek-v4-flash`、`ollama:llama3`。
 * @returns 厂商键；无法识别时回落 agnes。
 */
export function getVendorFromModel(model: string): string {
  if (!model) return 'agnes'
  const m = model.toLowerCase()
  if (m.startsWith('ollama:')) return 'ollama'
  for (const prefix of Object.keys(VENDOR_BASE_URLS)) {
    if (prefix !== 'agnes' && m.startsWith(prefix)) return prefix
  }
  return 'agnes'
}
