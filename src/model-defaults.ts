/**
 * 按「用途」解析默认模型。
 *
 * 问题背景：面板上只有"生图/生视频"能选模型，而分镜、写稿、解析、配音这些
 * 功能都在引擎里**写死了** agnes-2.5-flash 之类的名字 —— 用户填了多个模型之后，
 * 根本不知道某个功能到底用哪一把。
 *
 * 这里统一成一条解析链（后面的优先级更低）：
 *
 *   1. 调用方显式传入的模型（面板上的下拉选择、任务里指定的）
 *   2. 设置 → 默认模型 → 该用途的选择        ← 本条文件负责的部分
 *   3. 环境变量覆盖（DSH_AGNES_TEXT_MODEL 等，给终端用户留的口子）
 *   4. 内置兜底
 *
 * 用途只有 5 类，与界面上「默认模型」那 5 个下拉一一对应：
 *   text（写作/分镜/改写）· vision（读图）· image（出图）· video（出片）· tts（语音）
 */
import { loadModelConfig } from './model-config-engine.js'

/** 用途分类。 */
export type Capability = 'text' | 'vision' | 'image' | 'video' | 'tts'

/** 内置兜底（同时是"用户没选时"的安全值）。 */
export const CAPABILITY_FALLBACK: Record<Capability, string> = {
  text: 'agnes-2.5-flash',
  vision: 'agnes-2.5-flash',
  image: 'agnes-image-2.5-flash',
  video: 'agnes-video-2.5-flash',
  tts: 'mimo-v2.5-tts',
}

/** 用途的中文名（设置页与提示语共用）。 */
export const CAPABILITY_LABEL: Record<Capability, string> = {
  text: '文本（写作 / 分镜 / 改写）',
  vision: '视觉（读图 / 解析画面）',
  image: '图片（出图）',
  video: '视频（出片）',
  tts: '语音（配音）',
}

/** 环境变量覆盖名。 */
const ENV_OVERRIDE: Record<Capability, string> = {
  text: 'DSH_AGNES_TEXT_MODEL',
  vision: 'DSH_AGNES_VISION_MODEL',
  image: 'DSH_AGNES_IMAGE_MODEL',
  video: 'DSH_AGNES_VIDEO_MODEL',
  tts: 'DSH_AGNES_TTS_MODEL',
}

/**
 * 取某用途当前应使用的模型。
 *
 * @param capability - 用途。
 * @param explicit - 调用方显式指定的模型（优先级最高）。
 * @returns 模型名。
 */
export function modelFor(capability: Capability, explicit?: string): string {
  if (explicit !== undefined && explicit.trim() !== '') return explicit.trim()

  // 设置里选的
  try {
    const configured = loadModelConfig().defaults?.[capability]
    if (configured !== undefined && configured.trim() !== '') return configured.trim()
  } catch { /* 配置读不到就走后面的 */ }

  // 环境变量
  const fromEnv = process.env[ENV_OVERRIDE[capability]]
  if (fromEnv !== undefined && fromEnv.trim() !== '') return fromEnv.trim()

  return CAPABILITY_FALLBACK[capability]
}

/**
 * 描述某用途当前的模型来源（给界面显示"这个功能用哪把"用）。
 */
export function describeModelFor(capability: Capability, explicit?: string): { model: string; source: 'explicit' | 'settings' | 'env' | 'fallback' } {
  if (explicit !== undefined && explicit.trim() !== '') return { model: explicit.trim(), source: 'explicit' }
  try {
    const configured = loadModelConfig().defaults?.[capability]
    if (configured !== undefined && configured.trim() !== '') return { model: configured.trim(), source: 'settings' }
  } catch { /* ignore */ }
  const fromEnv = process.env[ENV_OVERRIDE[capability]]
  if (fromEnv !== undefined && fromEnv.trim() !== '') return { model: fromEnv.trim(), source: 'env' }
  return { model: CAPABILITY_FALLBACK[capability], source: 'fallback' }
}
