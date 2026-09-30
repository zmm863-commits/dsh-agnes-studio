/**
 * 视频解析 + VPT 面板
 * 功能：视频内容分析、关键帧提取、视频提示词生成
 */

import { React, useState, useCallback, createElement } from './react-shim.ts'

// ─── 类型定义 ──────────────────────────────────────────────────────────────

interface VideoparseTask {
  id: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  message: string
  video_file: string
  scenes?: Array<{ index: number; start: number; end: number; description: string }>
  keyframes?: string[]
  created_at: number
  updated_at: number
}

interface VptTask {
  id: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  message: string
  video_file: string
  prompt?: string
  optimized_prompt?: string
  created_at: number
  updated_at: number
}

// ─── API 调用 ──────────────────────────────────────────────────────────────

const API_VIDEO = '/agnes-studio/api/video'
const API_VPT = '/agnes-studio/api/vpt'

async function apiCall<T>(baseUrl: string, method: string, path: string, body?: unknown): Promise<T> {
  const resp = await fetch(`${baseUrl}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = await resp.json().catch(() => ({}))
  if (!resp.ok || data?.error) throw new Error(data?.error || `请求失败（HTTP ${resp.status}）`)
  return data as T
}

// ─── 组件 ──────────────────────────────────────────────────────────────────

export function VideoparsePanel() {
  const [activeTab, setActiveTab] = useState<'parse' | 'vpt'>('parse')

  return createElement('div', { className: 'videoparse-panel' },
    // 标题
    createElement('div', { className: 'videoparse-header' },
      createElement('h3', null, '🎬 视频解析 + VPT'),
      createElement('p', { className: 'videoparse-desc' }, '视频内容分析 + 视频提示词生成'),
    ),

    // 页签切换
    createElement('div', { className: 'videoparse-tabs' },
      createElement('button', {
        className: `videoparse-tab ${activeTab === 'parse' ? 'active' : ''}`,
        onClick: () => setActiveTab('parse'),
      }, '📹 视频解析'),
      createElement('button', {
        className: `videoparse-tab ${activeTab === 'vpt' ? 'active' : ''}`,
        onClick: () => setActiveTab('vpt'),
      }, '✨ VPT 提示词'),
    ),

    // 内容
    activeTab === 'parse'
      ? createElement(ParsePanel)
      : createElement(VptPanel),
  )
}

// ─── 视频解析面板 ──────────────────────────────────────────────────────────

function ParsePanel() {
  const [videoFile, setVideoFile] = useState('')
  const [currentTask, setCurrentTask] = useState<VideoparseTask | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleParse = useCallback(async () => {
    if (!videoFile.trim()) {
      setError('请输入视频文件路径')
      return
    }

    setLoading(true)
    setError('')

    try {
      const data = await apiCall<{ id: string }>(API_VIDEO, 'POST', '/parse', { video_file: videoFile })

      // 轮询状态
      const pollStatus = async () => {
        const statusData = await apiCall<{ task: VideoparseTask }>(API_VIDEO, 'GET', `/parse/status/${data.id}`)
        setCurrentTask(statusData.task)
        if (statusData.task.status === 'completed') {
          setLoading(false)
        } else if (statusData.task.status === 'failed') {
          setLoading(false)
          setError(statusData.task.message)
        } else {
          setTimeout(pollStatus, 1000)
        }
      }
      pollStatus()
    } catch (e) {
      setError(e instanceof Error ? e.message : '解析失败')
      setLoading(false)
    }
  }, [videoFile])

  return createElement('div', { className: 'parse-panel' },
    error && createElement('div', { className: 'parse-error' }, error),

    // 当前任务状态
    currentTask && createElement('div', { className: 'parse-status' },
      createElement('div', { className: 'parse-status-header' },
        createElement('span', null, `任务 ${currentTask.id}`),
        createElement('span', { className: `parse-badge parse-badge-${currentTask.status}` },
          currentTask.status === 'running' ? '解析中' :
          currentTask.status === 'completed' ? '已完成' : '失败'),
      ),
      createElement('p', null, currentTask.message),
    ),

    // 输入区域
    createElement('div', { className: 'parse-section' },
      createElement('h4', null, '① 输入视频'),
      createElement('div', { className: 'parse-form' },
        createElement('label', { className: 'parse-label' },
          '视频文件路径',
          createElement('input', { type: 'text', value: videoFile, onChange: (e: React.ChangeEvent<HTMLInputElement>) => setVideoFile(e.target.value), placeholder: '/path/to/video.mp4' }),
        ),
        createElement('button', {
          className: 'parse-btn parse-btn-primary',
          onClick: handleParse,
          disabled: loading || !videoFile.trim(),
        }, loading ? '⏳ 解析中...' : '📹 开始解析'),
      ),
    ),

    // 解析结果
    currentTask?.status === 'completed' && createElement('div', { className: 'parse-section' },
      createElement('h4', null, '② 解析结果'),
      createElement('div', { className: 'parse-result' },
        currentTask.scenes && createElement('div', { className: 'parse-scenes' },
          createElement('h5', null, '场景列表'),
          currentTask.scenes.map(scene =>
            createElement('div', { key: scene.index, className: 'parse-scene' },
              createElement('span', null, `场景 ${scene.index}`),
              createElement('span', { className: 'parse-scene-time' }, `${scene.start}s - ${scene.end}s`),
              createElement('p', null, scene.description),
            )
          ),
        ),
        currentTask.keyframes && createElement('div', { className: 'parse-keyframes' },
          createElement('h5', null, '关键帧'),
          createElement('div', { className: 'parse-keyframe-grid' },
            currentTask.keyframes.slice(0, 10).map((kf, i) =>
              createElement('div', { key: i, className: 'parse-keyframe' },
                createElement('img', { src: kf, alt: `Keyframe ${i + 1}` }),
                createElement('span', null, `${i + 1}`),
              )
            ),
          ),
        ),
      ),
    ),
  )
}

// ─── VPT 面板 ──────────────────────────────────────────────────────────────

function VptPanel() {
  const [videoFile, setVideoFile] = useState('')
  const [currentTask, setCurrentTask] = useState<VptTask | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleGenerate = useCallback(async () => {
    if (!videoFile.trim()) {
      setError('请输入视频文件路径')
      return
    }

    setLoading(true)
    setError('')

    try {
      const data = await apiCall<{ id: string }>(API_VPT, 'POST', '/generate', { video_file: videoFile })

      // 轮询状态
      const pollStatus = async () => {
        const statusData = await apiCall<{ task: VptTask }>(API_VPT, 'GET', `/status/${data.id}`)
        setCurrentTask(statusData.task)
        if (statusData.task.status === 'completed') {
          setLoading(false)
        } else if (statusData.task.status === 'failed') {
          setLoading(false)
          setError(statusData.task.message)
        } else {
          setTimeout(pollStatus, 1000)
        }
      }
      pollStatus()
    } catch (e) {
      setError(e instanceof Error ? e.message : '生成失败')
      setLoading(false)
    }
  }, [videoFile])

  return createElement('div', { className: 'vpt-panel' },
    error && createElement('div', { className: 'vpt-error' }, error),

    // 当前任务状态
    currentTask && createElement('div', { className: 'vpt-status' },
      createElement('div', { className: 'vpt-status-header' },
        createElement('span', null, `任务 ${currentTask.id}`),
        createElement('span', { className: `vpt-badge vpt-badge-${currentTask.status}` },
          currentTask.status === 'running' ? '生成中' :
          currentTask.status === 'completed' ? '已完成' : '失败'),
      ),
      createElement('p', null, currentTask.message),
    ),

    // 输入区域
    createElement('div', { className: 'vpt-section' },
      createElement('h4', null, '① 输入视频'),
      createElement('div', { className: 'vpt-form' },
        createElement('label', { className: 'vpt-label' },
          '视频文件路径',
          createElement('input', { type: 'text', value: videoFile, onChange: (e: React.ChangeEvent<HTMLInputElement>) => setVideoFile(e.target.value), placeholder: '/path/to/video.mp4' }),
        ),
        createElement('button', {
          className: 'vpt-btn vpt-btn-primary',
          onClick: handleGenerate,
          disabled: loading || !videoFile.trim(),
        }, loading ? '⏳ 生成中...' : '✨ 生成提示词'),
      ),
    ),

    // 生成结果
    currentTask?.status === 'completed' && createElement('div', { className: 'vpt-section' },
      createElement('h4', null, '② 生成结果'),
      createElement('div', { className: 'vpt-result' },
        createElement('textarea', {
          value: currentTask.prompt || '',
          readOnly: true,
          rows: 6,
        }),
      ),
    ),
  )
}
