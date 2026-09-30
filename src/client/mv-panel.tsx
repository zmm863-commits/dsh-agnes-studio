/**
 * MTV 生成面板
 * 功能：上传音乐/形象、启动生成、查看状态、确认阶段、预览成片
 */

import { React, useState, useEffect, useCallback, createElement } from './react-shim.ts'

// ─── 类型定义 ──────────────────────────────────────────────────────────────

interface MvTask {
  task_id: string
  status: 'pending' | 'music' | 'design' | 'storyboard' | 'video' | 'completed' | 'failed' | 'stopped'
  message: string
  audio_file?: string
  avatar_file?: string
  lyrics?: string
  music_id?: string
  design_id?: string
  video_id?: string
  text_model: string
  image_model: string
  video_model: string
  created_at: number
  updated_at: number
}

// ─── API 调用 ──────────────────────────────────────────────────────────────

const API_BASE = '/agnes-studio/api/mv'

async function apiCall<T>(method: string, path: string, body?: unknown): Promise<T> {
  const resp = await fetch(`${API_BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = await resp.json().catch(() => ({}))
  if (!resp.ok || data?.error) throw new Error(data?.error || `请求失败（HTTP ${resp.status}）`)
  return data as T
}

// ─── 组件 ──────────────────────────────────────────────────────────────────

export function MvPanel() {
  const [tasks, setTasks] = useState<MvTask[]>([])
  const [currentTask, setCurrentTask] = useState<MvTask | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // 表单状态
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [lyrics, setLyrics] = useState('')
  const [audioMode, setAudioMode] = useState<'upload' | 'doubao'>('upload')

  // 加载任务列表
  const loadTasks = useCallback(async () => {
    try {
      const data = await apiCall<{ tasks: MvTask[] }>('GET', '/tasks')
      setTasks(data.tasks)
    } catch (e) {
      setError(e instanceof Error ? e.message : '加载任务列表失败')
    }
  }, [])

  useEffect(() => { loadTasks() }, [loadTasks])

  // 启动生成
  const handleStart = useCallback(async () => {
    if (!audioFile && !lyrics) {
      setError('请上传音乐或输入歌词')
      return
    }

    setLoading(true)
    setError('')

    try {
      const data = await apiCall<{ task_id: string }>('POST', '/start', {
        audio_file: audioFile?.name || '',
        avatar_file: avatarFile?.name || '',
        lyrics,
      })

      // 轮询状态
      const pollStatus = async () => {
        const statusData = await apiCall<{ task: MvTask }>('GET', `/status/${data.task_id}`)
        setCurrentTask(statusData.task)
        if (statusData.task.status === 'completed') {
          setLoading(false)
          loadTasks()
        } else if (statusData.task.status === 'failed' || statusData.task.status === 'stopped') {
          setLoading(false)
          setError(statusData.task.message)
        } else {
          setTimeout(pollStatus, 2000)
        }
      }
      pollStatus()
    } catch (e) {
      setError(e instanceof Error ? e.message : '启动失败')
      setLoading(false)
    }
  }, [audioFile, avatarFile, lyrics, loadTasks])

  // 确认阶段
  const handleConfirm = useCallback(async (stage: string) => {
    if (!currentTask) return
    try {
      await apiCall('POST', '/confirm', { task_id: currentTask.task_id, stage })
      const statusData = await apiCall<{ task: MvTask }>('GET', `/status/${currentTask.task_id}`)
      setCurrentTask(statusData.task)
    } catch (e) {
      setError(e instanceof Error ? e.message : '确认失败')
    }
  }, [currentTask])

  // 停止任务
  const handleStop = useCallback(async () => {
    if (!currentTask) return
    try {
      await apiCall('POST', '/stop', { task_id: currentTask.task_id })
      setCurrentTask(null)
      loadTasks()
    } catch (e) {
      setError(e instanceof Error ? e.message : '停止失败')
    }
  }, [currentTask, loadTasks])

  // 文件选择辅助
  const handleFileSelect = (setter: (f: File | null) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setter(e.target.files?.[0] || null)
  }

  const statusLabel = (status: string) => {
    switch (status) {
      case 'music': return '谱曲中'
      case 'design': return '设计中'
      case 'storyboard': return '分镜中'
      case 'video': return '生成中'
      case 'completed': return '已完成'
      case 'failed': return '失败'
      case 'stopped': return '已停止'
      default: return '待处理'
    }
  }

  return createElement('div', { className: 'mv-panel' },
    // 标题
    createElement('div', { className: 'mv-header' },
      createElement('h3', null, '🎵 MTV 生成'),
      createElement('p', { className: 'mv-desc' }, '上传音乐/形象 → AI 谱曲 → 设计 → 分镜 → 视频 → 合成'),
    ),

    // 错误提示
    error && createElement('div', { className: 'mv-error' }, error),

    // 当前任务状态
    currentTask && createElement('div', { className: 'mv-status' },
      createElement('div', { className: 'mv-status-header' },
        createElement('span', null, `任务 ${currentTask.task_id}`),
        createElement('span', { className: `mv-badge mv-badge-${currentTask.status}` },
          statusLabel(currentTask.status)),
      ),
      createElement('p', null, currentTask.message),
    ),

    // 素材上传
    createElement('div', { className: 'mv-section' },
      createElement('h4', null, '① 上传素材'),
      createElement('div', { className: 'mv-form' },
        createElement('label', { className: 'mv-label' },
          '音源模式',
          createElement('select', { value: audioMode, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => setAudioMode(e.target.value) },
            createElement('option', { value: 'upload' }, '上传音乐'),
            createElement('option', { value: 'doubao' }, '豆包谱曲'),
          ),
        ),

        audioMode === 'upload' && createElement('label', { className: 'mv-label' },
          '🎵 音乐文件',
          createElement('input', { type: 'file', accept: 'audio/*', onChange: handleFileSelect(setAudioFile) }),
        ),
        audioFile && createElement('span', { className: 'mv-file' }, audioFile.name),

        createElement('label', { className: 'mv-label' },
          '🎤 歌词',
          createElement('textarea', {
            value: lyrics,
            onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => setLyrics(e.target.value),
            placeholder: '输入歌词...',
            rows: 4,
          }),
        ),

        createElement('label', { className: 'mv-label' },
          '👤 形象照（可选）',
          createElement('input', { type: 'file', accept: 'image/*', onChange: handleFileSelect(setAvatarFile) }),
        ),
        avatarFile && createElement('span', { className: 'mv-file' }, avatarFile.name),
      ),
    ),

    // 操作按钮
    createElement('div', { className: 'mv-actions' },
      createElement('button', {
        className: 'mv-btn mv-btn-primary',
        onClick: handleStart,
        disabled: loading || (!audioFile && !lyrics.trim()),
      }, loading ? '⏳ 处理中...' : '🎵 开始生成 MTV'),

      currentTask && createElement('button', {
        className: 'mv-btn mv-btn-danger',
        onClick: handleStop,
      }, '⏹ 停止'),
    ),

    // 阶段确认
    currentTask && createElement('div', { className: 'mv-section' },
      createElement('h4', null, '② 阶段确认'),
      createElement('div', { className: 'mv-form' },
        currentTask.status === 'music' && createElement('button', {
          className: 'mv-btn mv-btn-secondary',
          onClick: () => handleConfirm('music'),
        }, '✅ 确认谱曲完成'),
        currentTask.status === 'design' && createElement('button', {
          className: 'mv-btn mv-btn-secondary',
          onClick: () => handleConfirm('design'),
        }, '✅ 确认设计完成'),
        currentTask.status === 'storyboard' && createElement('button', {
          className: 'mv-btn mv-btn-secondary',
          onClick: () => handleConfirm('storyboard'),
        }, '✅ 确认分镜完成'),
      ),
    ),

    // 成片预览
    currentTask?.status === 'completed' && createElement('div', { className: 'mv-section' },
      createElement('h4', null, '③ 成片预览'),
      createElement('div', { className: 'mv-form' },
        createElement('video', { controls: true, className: 'mv-video' },
          createElement('source', { src: `/agnes-studio/api/mv/video/${currentTask.task_id}`, type: 'video/mp4' }),
          '您的浏览器不支持视频播放'
        ),
      ),
    ),

    // 任务列表
    createElement('div', { className: 'mv-section' },
      createElement('h4', null, '历史任务'),
      tasks.length === 0
        ? createElement('p', { className: 'mv-empty' }, '暂无任务')
        : createElement('div', { className: 'mv-task-list' },
            tasks.slice(0, 5).map(task =>
              createElement('div', {
                key: task.task_id,
                className: 'mv-task-item',
                onClick: () => setCurrentTask(task),
              },
                createElement('span', null, `任务 ${task.task_id}`),
                createElement('span', { className: `mv-badge mv-badge-${task.status}` },
                  statusLabel(task.status)),
                createElement('span', { className: 'mv-task-time' }, new Date(task.created_at).toLocaleString()),
              )
            ),
          ),
    ),
  )
}
