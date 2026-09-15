// ─── 短剧流水线客户端 API 模块 ─────────────────────────────────────────────
// 与 Host 端短剧 API 通信、管理任务状态、提供类型定义
// ─────────────────────────────────────────────────────────────────────────────

// ─── 类型定义 ──────────────────────────────────────────────────────────────

/** 短剧任务状态 */
export interface DramaTask {
  drama_id: string;
  prompt: string;
  status: DramaStatus;
  step: string;
  message: string;
  // 文本内容
  story?: string;
  edited_story?: string;
  script?: string;
  edited_script?: string;
  storyboard?: { shots: DramaShot[] };
  shots?: DramaShot[];
  // 素材
  assets?: DramaAsset[];
  // 视频
  video_results?: VideoResult[];
  // 配置
  text_model: string;
  image_model: string;
  video_model: string;
  shot_duration: number;
  // 时间戳
  created_at: number;
  updated_at: number;
}

export type DramaStatus =
  | 'started'
  | 'step1'
  | 'paused_story'
  | 'paused_script'
  | 'step2'
  | 'step3'
  | 'paused_assets'
  | 'step4'
  | 'paused_video'
  | 'merging'
  | 'completed'
  | 'failed'
  | 'stopped';

/** 分镜镜头 */
export interface DramaShot {
  shot_index: number;
  scene_desc: string;
  characters: string[];
  action: string;
  camera: string;
  camera_movement: { type: string; intent: string };
  dialogue?: string;
  prompt_en: string;
  transition: { type: string; description: string };
}

/** 素材 */
export interface DramaAsset {
  category: 'characters' | 'scenes' | 'props';
  name: string;
  desc: string;
  prompt_en?: string;
  img_prompt?: string;
  image_url?: string;
  status: 'pending' | 'generating' | 'done' | 'error';
}

/** 视频结果 */
export interface VideoResult {
  shot_index: number;
  status: 'pending' | 'generating' | 'completed' | 'failed';
  video_url?: string;
  error?: string;
  prompt?: string;
}

/** 创建短剧请求 */
export interface CreateDramaRequest {
  prompt: string;
  text_model?: string;
  image_model?: string;
  video_model?: string;
  shot_duration?: number;
}

// ─── API 基础 ──────────────────────────────────────────────────────────────

const API_BASE = '/agnes-studio/api';

// ─── API 函数 ──────────────────────────────────────────────────────────────

/** 导入剧本，跳过故事+剧本步骤，直接从分镜开始 */
export async function importScript(req: {
  script: string;
  prompt?: string;
  text_model?: string;
  image_model?: string;
  video_model?: string;
  shot_duration?: number;
}): Promise<{ drama_id: string }> {
  const resp = await fetch(`${API_BASE}/drama/import`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  });
  if (!resp.ok) throw new Error('导入剧本失败');
  const data = await resp.json();
  if (data.error) throw new Error(data.error);
  return data;
}

/** 创建短剧任务 */
export async function createDrama(
  req: CreateDramaRequest,
): Promise<{ drama_id: string }> {
  const resp = await fetch(`${API_BASE}/drama/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  });
  if (!resp.ok) throw new Error('创建短剧失败');
  const data = await resp.json();
  if (data.error) throw new Error(data.error);
  return data;
}

/** 查询短剧状态 */
export async function getDramaStatus(dramaId: string): Promise<DramaTask> {
  const resp = await fetch(`${API_BASE}/drama/status/${dramaId}`);
  if (!resp.ok) throw new Error('查询短剧状态失败');
  const data = await resp.json();
  if (data.error) throw new Error(data.error);
  return data;
}

/** 停止短剧 */
export async function stopDrama(dramaId: string): Promise<void> {
  await fetch(`${API_BASE}/drama/${dramaId}/stop`, { method: 'POST' });
}

/** 恢复短剧 */
export async function resumeDrama(dramaId: string): Promise<void> {
  await fetch(`${API_BASE}/drama/${dramaId}/resume`, { method: 'POST' });
}

/** 确认/编辑内容 */
export async function confirmDrama(
  dramaId: string,
  payload: {
    field: 'story' | 'script' | 'assets' | 'video';
    content?: string;
    action?: 'approve' | 'start';
    shot_index?: number;
  },
): Promise<void> {
  await fetch(`${API_BASE}/drama/${dramaId}/confirm`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

/** 重新生成某步 */
export async function regenerateDrama(
  dramaId: string,
  payload: {
    step: 'story' | 'script' | 'storyboard' | 'asset';
    asset_index?: number;
  },
): Promise<void> {
  await fetch(`${API_BASE}/drama/${dramaId}/regenerate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

/** 轮询短剧状态（自动间隔） */
export function pollDramaStatus(
  dramaId: string,
  callback: (task: DramaTask) => void,
  intervalMs: number = 3000,
): () => void {
  let stopped = false;
  const poll = async () => {
    if (stopped) return;
    try {
      const task = await getDramaStatus(dramaId);
      callback(task);
      if (
        task.status !== 'completed' &&
        task.status !== 'failed' &&
        task.status !== 'stopped'
      ) {
        setTimeout(poll, intervalMs);
      }
    } catch {
      if (!stopped) setTimeout(poll, intervalMs * 2);
    }
  };
  poll();
  return () => {
    stopped = true;
  };
}

// ─── 本地存储 ──────────────────────────────────────────────────────────────

const STORAGE_KEY = 'agnes-studio-drama-tasks';
const MAX_TASKS = 20;

/** 保存短剧任务到 localStorage */
export function saveDramaTask(task: DramaTask): void {
  try {
    const tasks = listDramaTasks();
    const idx = tasks.findIndex((t) => t.drama_id === task.drama_id);
    if (idx >= 0) tasks[idx] = task;
    else tasks.unshift(task);
    if (tasks.length > MAX_TASKS) tasks.length = MAX_TASKS;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch {
    // localStorage 不可用时静默失败
  }
}

/** 加载所有短剧任务 */
export function listDramaTasks(): DramaTask[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/** 删除短剧任务 */
export function deleteDramaTask(dramaId: string): void {
  const tasks = listDramaTasks().filter((t) => t.drama_id !== dramaId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

/** 生成唯一 ID */
export function generateDramaId(): string {
  return (
    'drama_' +
    Date.now().toString(36) +
    '_' +
    Math.random().toString(36).slice(2, 8)
  );
}
