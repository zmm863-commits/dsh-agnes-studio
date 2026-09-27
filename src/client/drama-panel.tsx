/**
 * Agnes Creative Studio — Drama Pipeline Panel
 *
 * Complete short-drama creation workbench: story → script → storyboard →
 * assets → video, with per-step editing, confirmation, regeneration, and
 * live polling.  Uses plain React.createElement (no JSX). React is resolved
 * from DSH's client module loader.
 */

import { useState, useEffect, useCallback, useRef, createElement } from './react-shim.ts'

// ─── Imports ──────────────────────────────────────────────────────────────

import { injectStyles } from './styles.ts'
import { renderNewTaskForm, renderTaskList, renderCenter, renderRight, type DramaViewVars } from './drama-views.tsx'
import { type DramaTask, createDrama, getDramaStatus, stopDrama, resumeDrama, confirmDrama, regenerateDrama, generateAllShotVideos, mergeDrama, pollDramaStatus, saveDramaTask, listDramaTasks, deleteDramaTask } from './drama.ts'

// ─── Constants ────────────────────────────────────────────────────────────


// ─── Renderers（原同文件上半部，已切到单独模块）─────────────────────────────

import { IMAGE_MODELS_DEFAULT, VIDEO_MODELS_DEFAULT, TERMINAL, buildModelOptions } from './drama-renderers.tsx'

// ─── Props ────────────────────────────────────────────────────────────────

export interface DramaPanelProps {
  imageModels: Record<string, string>
  videoModels: Record<string, string>
  onGenerateImage?: (prompt: string, model: string) => void
}

// ─── Helpers ──────────────────────────────────────────────────────────────

export function DramaPanel({ imageModels, videoModels }: DramaPanelProps) {
  injectStyles()

  // ── State ─────────────────────────────────────────────────────────────
  const [currentTask, setCurrentTask] = useState<DramaTask | null>(null)
  const [taskList, setTaskList] = useState<DramaTask[]>([])
  const [prompt, setPrompt] = useState('')
  const [textModel, setTextModel] = useState('agnes-3.0-flash')
  const [imageModel, setImageModel] = useState('agnes-image-2.5-flash')
  const [videoModel, setVideoModel] = useState('agnes-video-2.5-flash')
  const [shotDuration, setShotDuration] = useState(5)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [editContent, setEditContent] = useState('')
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const [merging, setMerging] = useState(false)
  const [ffStatus, setFfStatus] = useState<{ available: boolean; hint: string } | null>(null)
  const [notice, setNotice] = useState('')
  const [finalCut, setFinalCut] = useState<{ url: string; duration: number; shots: number } | null>(null)

  // Polling ref so we can clean up on unmount
  const stopPollRef = useRef<(() => void) | null>(null)

  // 合成需要 ffmpeg：提前探测，缺了就在成片区预警而不是等到点按钮才报错
  useEffect(() => {
    fetch('/agnes-studio/api/ffmpeg')
      .then(r => (r.ok ? r.json() : null))
      .then(d => {
        // null = route missing / probe failed → unknown, do NOT warn.
        if (!d || typeof d.available !== 'boolean') { setFfStatus(null); return }
        setFfStatus({ available: d.available, hint: String(d.hint ?? '') })
      })
      .catch(() => setFfStatus(null))
  }, [])

  // ── Model option lists ────────────────────────────────────────────────
  const imgOpts = buildModelOptions(imageModels, IMAGE_MODELS_DEFAULT)
  const vidOpts = buildModelOptions(videoModels, VIDEO_MODELS_DEFAULT)

  // ── Load task list on mount ────────────────────────────────────────────
  useEffect(() => {
    setTaskList(listDramaTasks())
    return () => {
      if (stopPollRef.current) stopPollRef.current()
    }
  }, [])

  // ── Keep task list synced when currentTask changes ─────────────────────
  useEffect(() => {
    if (currentTask) {
      setTaskList(listDramaTasks())
    }
  }, [currentTask])

  // ── Start new drama ───────────────────────────────────────────────────
  const handleStart = useCallback(async () => {
    if (!prompt.trim() || loading) return
    setLoading(true)
    setError('')
    setEditContent('')
    try {
      const { drama_id } = await createDrama({
        prompt: prompt.trim(),
        text_model: textModel,
        image_model: imageModel,
        video_model: videoModel,
        shot_duration: shotDuration,
      })

      const initialTask: DramaTask = {
        drama_id,
        prompt: prompt.trim(),
        status: 'started',
        step: '',
        message: '正在启动...',
        text_model: textModel,
        image_model: imageModel,
        video_model: videoModel,
        shot_duration: shotDuration,
        created_at: Date.now(),
        updated_at: Date.now(),
      }
      setCurrentTask(initialTask)
      setSelectedTaskId(drama_id)
      saveDramaTask(initialTask)
      setTaskList(listDramaTasks())

      // Start polling
      if (stopPollRef.current) stopPollRef.current()
      const stopPolling = pollDramaStatus(drama_id, (task) => {
        setCurrentTask(task)
        saveDramaTask(task)
        setTaskList(listDramaTasks())
        if (TERMINAL.has(task.status)) {
          stopPolling()
        }
      })
      stopPollRef.current = stopPolling
    } catch (e) {
      setError(e instanceof Error ? e.message : '启动失败')
    } finally {
      setLoading(false)
    }
  }, [prompt, textModel, imageModel, videoModel, shotDuration, loading])

  // ── Select a task from history ────────────────────────────────────────
  const handleSelectTask = useCallback(
    (dramaId: string) => {
      if (stopPollRef.current) {
        stopPollRef.current()
        stopPollRef.current = null
      }

      setSelectedTaskId(dramaId)
      setEditContent('')

      const found = taskList.find((t) => t.drama_id === dramaId)
      if (found) {
        setCurrentTask(found)

        if (!TERMINAL.has(found.status)) {
          const stopPolling = pollDramaStatus(dramaId, (task) => {
            setCurrentTask(task)
            saveDramaTask(task)
            setTaskList(listDramaTasks())
            if (TERMINAL.has(task.status)) {
              stopPolling()
            }
          })
          stopPollRef.current = stopPolling
        }
      } else {
        setLoading(true)
        getDramaStatus(dramaId)
          .then((task) => {
            setCurrentTask(task)
            saveDramaTask(task)
            setTaskList(listDramaTasks())
            if (!TERMINAL.has(task.status)) {
              const stopPolling = pollDramaStatus(dramaId, (t) => {
                setCurrentTask(t)
                saveDramaTask(t)
                setTaskList(listDramaTasks())
                if (TERMINAL.has(t.status)) stopPolling()
              })
              stopPollRef.current = stopPolling
            }
          })
          .catch(() => setError('加载任务失败'))
          .finally(() => setLoading(false))
      }
    },
    [taskList],
  )

  // ── Stop / Resume / Delete ────────────────────────────────────────────
  const handleStop = useCallback(async () => {
    if (!currentTask) return
    try {
      await stopDrama(currentTask.drama_id)
      if (stopPollRef.current) {
        stopPollRef.current()
        stopPollRef.current = null
      }
      const updated = { ...currentTask, status: 'stopped' as const }
      setCurrentTask(updated)
      saveDramaTask(updated)
      setTaskList(listDramaTasks())
    } catch (e) {
      setError(e instanceof Error ? e.message : '停止失败')
    }
  }, [currentTask])

  const handleResume = useCallback(async () => {
    if (!currentTask) return
    try {
      await resumeDrama(currentTask.drama_id)
      const stopPolling = pollDramaStatus(currentTask.drama_id, (task) => {
        setCurrentTask(task)
        saveDramaTask(task)
        setTaskList(listDramaTasks())
        if (TERMINAL.has(task.status)) stopPolling()
      })
      stopPollRef.current = stopPolling
    } catch (e) {
      setError(e instanceof Error ? e.message : '恢复失败')
    }
  }, [currentTask])

  const handleDeleteTask = useCallback(
    (dramaId: string) => {
      deleteDramaTask(dramaId)
      setTaskList(listDramaTasks())
      if (selectedTaskId === dramaId) {
        if (stopPollRef.current) {
          stopPollRef.current()
          stopPollRef.current = null
        }
        setCurrentTask(null)
        setSelectedTaskId(null)
        setEditContent('')
      }
    },
    [selectedTaskId],
  )

  // ── Confirm / regenerate wrappers ────────────────────────────────────
  const handleConfirmField = useCallback(
    async (field: 'story' | 'script', content: string) => {
      if (!currentTask) return
      try {
        await confirmDrama(currentTask.drama_id, { field, content })
        setEditContent('')
      } catch (e) {
        setError(e instanceof Error ? e.message : '确认失败')
      }
    },
    [currentTask],
  )

  const handleRegenerateStep = useCallback(
    async (step: 'story' | 'script') => {
      if (!currentTask) return
      try {
        setEditContent('')
        await regenerateDrama(currentTask.drama_id, { step })
      } catch (e) {
        setError(e instanceof Error ? e.message : '重新生成失败')
      }
    },
    [currentTask],
  )

  const handleConfirmVideoShot = useCallback(
    async (shotIndex: number) => {
      if (!currentTask) return
      try {
        await confirmDrama(currentTask.drama_id, {
          field: 'video',
          shot_index: shotIndex,
          action: 'start',
        })
      } catch (e) {
        setError(e instanceof Error ? e.message : '生成视频失败')
      }
    },
    [currentTask],
  )

  /** 一键生成所有未完成镜头（后台依次跑，靠轮询刷新进度） */
  const handleGenerateAllVideos = useCallback(async () => {
    if (!currentTask) return
    try {
      setError('')
      const r = await generateAllShotVideos(currentTask.drama_id)
      setNotice(`已排队 ${r.queued} 个镜头，正在依次生成（每个约 2-4 分钟）…`)
    } catch (e) {
      setError(e instanceof Error ? e.message : '启动失败')
    }
  }, [currentTask])

  /** 把已完成的镜头合成为成片 */
  const handleMerge = useCallback(
    async (withSubtitles: boolean) => {
      if (!currentTask || merging) return
      setMerging(true)
      setError('')
      setNotice('')
      try {
        const r = await mergeDrama(currentTask.drama_id, { subtitles: withSubtitles })
        setFinalCut({ url: r.url, duration: r.duration, shots: r.shots })
        setNotice(`成片已生成：${r.shots} 个镜头，${Number(r.duration || 0).toFixed(1)} 秒`)
      } catch (e) {
        setError(e instanceof Error ? e.message : '合成失败')
      } finally {
        setMerging(false)
      }
    },
    [currentTask, merging],
  )

  // ── New task panel ────────────────────────────────────────────────────
  // ── 视图变量汇总（传给 drama-views.tsx 的四个视图）────────────────────────
  const viewVars: DramaViewVars = {
    currentTask, taskList, prompt, textModel, imageModel, videoModel, shotDuration, loading, error,
    editContent, selectedTaskId, merging, ffStatus, notice, finalCut,
    setPrompt, setTextModel, setImageModel, setVideoModel, setShotDuration, setLoading, setError, setEditContent,
    setTaskList, setSelectedTaskId,
    handleStart, handleSelectTask, handleStop, handleResume, handleDeleteTask, handleConfirmField,
    handleRegenerateStep, handleConfirmVideoShot, handleGenerateAllVideos, handleMerge,
    imgOpts, vidOpts,
  }

  // ── Root layout ──────────────────────────────────────────────────────
  return createElement(
    'div',
    {
      style: {
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
        overflow: 'hidden',
      },
    },
    renderNewTaskForm(viewVars),
    createElement(
      'div',
      { className: 'agnes-body', style: { flex: 1, minHeight: 0 } },
      renderTaskList(viewVars),
      renderCenter(viewVars),
      renderRight(viewVars),
    ),
    createElement(
      'div',
      { className: 'agnes-statusbar' },
      createElement('div', { className: 'agnes-status-dot' }),
      createElement('span', null, '短剧流水线'),
      createElement('span', null, '·'),
      createElement('span', null, taskList.length + ' 个任务'),
      currentTask && !TERMINAL.has(currentTask.status)
        ? createElement('span', { style: { marginLeft: 'auto', color: '#fdcb6e' } }, '⚡ 制作中')
        : null,
    ),
  )
}
