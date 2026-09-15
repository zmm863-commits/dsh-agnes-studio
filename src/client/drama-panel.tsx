/**
 * Agnes Creative Studio — Drama Pipeline Panel
 *
 * Complete short-drama creation workbench: story → script → storyboard →
 * assets → video, with per-step editing, confirmation, regeneration, and
 * live polling.  Uses plain React.createElement (no JSX). React is resolved
 * from DSH's client module loader.
 */

// ─── React bootstrap ──────────────────────────────────────────────────────

declare const require: ((id: string) => unknown) | undefined

function shellRequire(id: string): any {
  try {
    if (typeof require === 'function') {
      const mod = require(id)
      if (mod !== undefined && mod !== null) return mod
    }
  } catch { /* fall through */ }
  return undefined
}

const React: any = shellRequire('react') ?? (globalThis as any).React ?? null
const NOOP = (): void => {}
const useState: any = React?.useState ?? ((initial: unknown) => [typeof initial === 'function' ? (initial as () => unknown)() : initial, NOOP])
const useEffect: any = React?.useEffect ?? NOOP
const useCallback: any = React?.useCallback ?? ((fn: unknown) => fn)
const useRef: any = React?.useRef ?? ((initial: unknown) => ({ current: initial }))
const createElement: any = React?.createElement ?? (() => null)

// ─── Imports ──────────────────────────────────────────────────────────────

import { injectStyles } from './styles.ts'
import {
  type DramaTask,
  type DramaShot,
  type DramaAsset,
  type VideoResult,
  createDrama,
  importScript,
  getDramaStatus,
  stopDrama,
  resumeDrama,
  confirmDrama,
  regenerateDrama,
  pollDramaStatus,
  saveDramaTask,
  listDramaTasks,
  deleteDramaTask,
  generateDramaId,
} from './drama.ts'

// ─── Constants ────────────────────────────────────────────────────────────

const TEXT_MODELS: { value: string; label: string }[] = [
  { value: 'agnes-3.0-flash', label: 'Agnes 3.0 Flash (免费)' },
]

const IMAGE_MODELS_DEFAULT: { value: string; label: string }[] = [
  { value: 'agnes-image-2.5-flash', label: 'Image 2.5 Flash (免费)' },
]

const VIDEO_MODELS_DEFAULT: { value: string; label: string }[] = [
  { value: 'agnes-video-2.5-flash', label: 'Video 2.5 Flash (免费)' },
]

const DURATION_OPTIONS = [3, 5, 8, 10]

/** Pipeline step definitions with their associated status values. */
const STEPS: { key: string; label: string; statuses: string[] }[] = [
  { key: 'story', label: '📝 故事梗概', statuses: ['step1', 'paused_story'] },
  { key: 'script', label: '📋 剧本', statuses: ['paused_script'] },
  { key: 'storyboard', label: '🎬 分镜', statuses: ['step2'] },
  { key: 'assets', label: '🎨 素材', statuses: ['step3', 'paused_assets'] },
  { key: 'video', label: '🎥 视频', statuses: ['step4', 'paused_video', 'merging'] },
]

/** Terminal statuses that stop polling. */
const TERMINAL = new Set(['completed', 'failed', 'stopped'])

/** Human-readable status labels. */
const STATUS_LABELS: Record<string, string> = {
  started: '🚀 启动中',
  step1: '📝 生成故事梗概…',
  paused_story: '⏸ 故事梗概待确认',
  paused_script: '⏸ 剧本待确认',
  step2: '🎬 生成分镜…',
  step3: '🎨 生成素材…',
  paused_assets: '⏸ 素材待确认',
  step4: '🎥 生成视频…',
  paused_video: '⏸ 视频生成中',
  merging: '🎞 合成中…',
  completed: '✅ 完成',
  failed: '❌ 失败',
  stopped: '⏹ 已停止',
}

/** Asset category labels. */
const ASSET_CATEGORIES: Record<string, string> = {
  characters: '👤 角色',
  scenes: '🏞 场景',
  props: '🎭 道具',
}

// ─── Props ────────────────────────────────────────────────────────────────

export interface DramaPanelProps {
  imageModels: Record<string, string>
  videoModels: Record<string, string>
  onGenerateImage?: (prompt: string, model: string) => void
}

// ─── Helpers ──────────────────────────────────────────────────────────────

function formatTime(ts: number): string {
  try {
    const d = new Date(ts)
    const pad = (n: number) => String(n).padStart(2, '0')
    return `${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
  } catch {
    return '--'
  }
}

function getStepIndex(task: DramaTask): number {
  return STEPS.findIndex((s) => s.statuses.includes(task.status))
}

function getTaskPreview(task: DramaTask): string {
  const p = task.prompt || ''
  return p.length > 36 ? p.slice(0, 36) + '…' : p
}

function buildModelOptions(
  record: Record<string, string>,
  defaults: { value: string; label: string }[],
): { value: string; label: string }[] {
  const entries = Object.entries(record)
  if (entries.length === 0) return defaults
  return entries.map(([value, label]) => ({ value, label }))
}

// ─── Sub-components ───────────────────────────────────────────────────────

/** 5-step vertical progress indicator. */
function renderProgressSteps(task: DramaTask) {
  const currentIdx = getStepIndex(task)

  return createElement(
    'div',
    { className: 'agnes-steps' },
    ...STEPS.map((step, idx) => {
      const isActive = idx === currentIdx
      const isDone = idx < currentIdx
      const cls =
        'agnes-step' + (isActive ? ' active' : '') + (isDone ? ' done' : '')
      return createElement(
        'div',
        { key: step.key, className: cls },
        createElement(
          'div',
          { className: 'agnes-step-icon' },
          isDone ? '✓' : String(idx + 1),
        ),
        createElement('span', null, step.label),
      )
    }),
  )
}

/** Status bar message area. */
function renderStatusMessage(task: DramaTask) {
  const label = STATUS_LABELS[task.status] || task.status
  const isActive = !TERMINAL.has(task.status)

  return createElement(
    'div',
    {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 12px',
        borderRadius: '8px',
        background: isActive
          ? 'rgba(108,92,231,0.08)'
          : task.status === 'completed'
            ? 'rgba(0,206,201,0.08)'
            : 'rgba(255,107,107,0.08)',
        fontSize: '13px',
      },
    },
    createElement('span', null, label),
    task.message && task.message !== label
      ? createElement(
          'span',
          {
            style: {
              color: 'var(--dsw-alias-label-secondary, #6c6c80)',
              fontSize: '12px',
            },
          },
          ' — ' + task.message,
        )
      : null,
    isActive
      ? createElement('span', {
          style: {
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: '#fdcb6e',
          },
        })
      : null,
  )
}

/** Story / script editor (textarea + action buttons). */
function renderTextEditor(opts: {
  task: DramaTask
  field: 'story' | 'script'
  editContent: string
  onEditChange: (v: string) => void
  onConfirm: (field: 'story' | 'script', content: string) => void
  onRegenerate: (step: 'story' | 'script') => void
}) {
  const { task, field, editContent, onEditChange, onConfirm, onRegenerate } = opts
  const title = field === 'story' ? '📝 故事梗概' : '📋 剧本'
  const content = editContent || (field === 'story' ? task.story : task.script) || ''

  return createElement(
    'div',
    { className: 'agnes-section' },
    createElement('div', { className: 'agnes-section-title' }, title),
    createElement('textarea', {
      className: 'agnes-textarea',
      value: content,
      onChange: (e: Event) => onEditChange((e.target as HTMLTextAreaElement).value),
      rows: 10,
      style: { minHeight: '200px', fontFamily: 'monospace', fontSize: '13px', lineHeight: '1.6' },
    }),
    createElement(
      'div',
      { style: { display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' } },
      createElement(
        'button',
        {
          className: 'agnes-btn agnes-btn-primary',
          onClick: () => onConfirm(field, editContent || content),
        },
        '✅ 确认并继续',
      ),
      createElement(
        'button',
        {
          className: 'agnes-btn agnes-btn-secondary',
          onClick: () => onConfirm(field, editContent || content),
        },
        '✏️ 保存编辑',
      ),
      createElement(
        'button',
        {
          className: 'agnes-btn agnes-btn-ghost',
          onClick: () => {
            onEditChange('')
            onRegenerate(field)
          },
        },
        '🔄 重新生成',
      ),
    ),
  )
}

/** Read-only text display for completed steps. */
function renderReadOnlySection(opts: {
  title: string
  content: string
}) {
  const { title, content } = opts
  if (!content) return null

  return createElement(
    'div',
    { className: 'agnes-section' },
    createElement('div', { className: 'agnes-section-title' }, title),
    createElement(
      'div',
      {
        style: {
          padding: '12px',
          borderRadius: '8px',
          background: 'var(--dsw-alias-bg-layer-2, #252538)',
          fontSize: '13px',
          lineHeight: '1.6',
          whiteSpace: 'pre-wrap',
          maxHeight: '300px',
          overflowY: 'auto',
        },
      },
      content,
    ),
  )
}

/** Asset cards grouped by category. */
function renderAssets(task: DramaTask) {
  const assets = task.assets || []
  if (assets.length === 0) {
    return createElement(
      'div',
      { className: 'agnes-section' },
      createElement('div', { className: 'agnes-section-title' }, '🎨 素材'),
      createElement(
        'div',
        { style: { color: 'var(--dsw-alias-label-secondary, #6c6c80)', fontSize: '13px', padding: '12px 0' } },
        '素材生成中…',
      ),
    )
  }

  return createElement(
    'div',
    null,
    ...Object.entries(ASSET_CATEGORIES).map(([cat, label]) => {
      const items = assets.filter((a) => a.category === cat)
      if (items.length === 0) return null
      return createElement(
        'div',
        { key: cat, className: 'agnes-section' },
        createElement('div', { className: 'agnes-section-title' }, label),
        createElement(
          'div',
          {
            style: {
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
              gap: '8px',
            },
          },
          ...items.map((asset, idx) =>
            createElement(
              'div',
              {
                key: idx,
                className: 'agnes-custom-model-item',
                style: {
                  flexDirection: 'column',
                  alignItems: 'stretch',
                  padding: '10px',
                },
              },
              asset.image_url
                ? createElement('img', {
                    src: asset.image_url,
                    style: {
                      width: '100%',
                      borderRadius: '8px',
                      marginBottom: '6px',
                      aspectRatio: '1',
                      objectFit: 'cover',
                    },
                  })
                : createElement(
                    'div',
                    {
                      style: {
                        width: '100%',
                        aspectRatio: '1',
                        borderRadius: '8px',
                        marginBottom: '6px',
                        background: 'linear-gradient(135deg, rgba(108,92,231,0.1), rgba(162,155,254,0.05))',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '24px',
                      },
                    },
                    asset.status === 'generating' ? '⏳' : '🎨',
                  ),
              createElement(
                'div',
                { className: 'agnes-custom-model-name' },
                asset.name,
              ),
              createElement(
                'div',
                { className: 'agnes-custom-model-meta' },
                (asset.desc || '').slice(0, 50) +
                  (asset.desc && asset.desc.length > 50 ? '…' : ''),
              ),
              createElement(
                'div',
                { style: { marginTop: '4px' } },
                asset.status === 'pending'
                  ? createElement('span', { className: 'agnes-badge agnes-badge-generating' }, '⏳ 待生成')
                  : asset.status === 'done'
                    ? createElement('span', { className: 'agnes-badge agnes-badge-free' }, '✅ 完成')
                    : asset.status === 'error'
                      ? createElement('span', { className: 'agnes-badge agnes-badge-error' }, '❌ 失败')
                      : createElement('span', { className: 'agnes-badge agnes-badge-generating' }, '🔄 生成中'),
              ),
            ),
          ),
        ),
      )
    }),
  )
}

/** Storyboard shot list with video generation controls. */
function renderShots(task: DramaTask, onConfirmVideo: (shotIndex: number) => void) {
  const shots: DramaShot[] = task.shots || task.storyboard?.shots || []
  const videoResults: VideoResult[] = task.video_results || []

  if (shots.length === 0) {
    return createElement(
      'div',
      { className: 'agnes-section' },
      createElement('div', { className: 'agnes-section-title' }, '🎬 分镜'),
      createElement(
        'div',
        { style: { color: 'var(--dsw-alias-label-secondary, #6c6c80)', fontSize: '13px', padding: '12px 0' } },
        '分镜生成中…',
      ),
    )
  }

  return createElement(
    'div',
    { className: 'agnes-section' },
    createElement(
      'div',
      { className: 'agnes-section-title' },
      '🎬 分镜 (' + shots.length + ' 个镜头)',
    ),
    ...shots.map((shot, idx) => {
      const vr = videoResults.find((v) => v.shot_index === shot.shot_index)
      const isGenerating = vr?.status === 'generating' || vr?.status === 'pending'

      return createElement(
        'div',
        {
          key: idx,
          className: 'agnes-custom-model-item',
          style: {
            flexDirection: 'column',
            alignItems: 'flex-start',
            padding: '12px',
          },
        },
        // Header row
        createElement(
          'div',
          { style: { display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' } },
          createElement(
            'span',
            { style: { fontWeight: 600, fontSize: '13px' } },
            '镜头 ' + shot.shot_index,
          ),
          vr
            ? vr.status === 'completed'
              ? createElement('span', { className: 'agnes-badge agnes-badge-free' }, '✅ 已生成')
              : isGenerating
                ? createElement('span', { className: 'agnes-badge agnes-badge-generating' }, '🔄 生成中')
                : vr.status === 'failed'
                  ? createElement('span', { className: 'agnes-badge agnes-badge-error' }, '❌ 失败')
                  : null
            : null,
        ),
        // Scene description
        createElement(
          'div',
          {
            style: {
              fontSize: '12px',
              color: 'var(--dsw-alias-label-secondary, #6c6c80)',
              marginTop: '4px',
              lineHeight: '1.5',
            },
          },
          (shot.scene_desc || '').slice(0, 100) +
            (shot.scene_desc && shot.scene_desc.length > 100 ? '…' : ''),
        ),
        // Camera info
        shot.camera
          ? createElement(
              'div',
              {
                style: {
                  fontSize: '11px',
                  color: 'var(--dsw-alias-label-secondary, #9a9ab0)',
                  marginTop: '2px',
                },
              },
              '📷 ' +
                shot.camera +
                (shot.camera_movement ? ' / ' + shot.camera_movement.intent : ''),
            )
          : null,
        // Action
        shot.action
          ? createElement(
              'div',
              {
                style: {
                  fontSize: '11px',
                  color: 'var(--dsw-alias-label-secondary, #9a9ab0)',
                  marginTop: '2px',
                },
              },
              '🎬 ' + shot.action,
            )
          : null,
        // Dialogue
        shot.dialogue
          ? createElement(
              'div',
              {
                style: {
                  fontSize: '12px',
                  fontStyle: 'italic',
                  marginTop: '4px',
                  color: '#a29bfe',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  background: 'rgba(162,155,254,0.08)',
                },
              },
              '💬 ' + shot.dialogue,
            )
          : null,
        // Generate button
        vr?.status !== 'completed' &&
        vr?.status !== 'generating' &&
        vr?.status !== 'pending'
          ? createElement(
              'button',
              {
                className: 'agnes-btn agnes-btn-sm agnes-btn-primary',
                style: { marginTop: '6px' },
                onClick: () => onConfirmVideo(shot.shot_index),
              },
              '🎬 生成视频',
            )
          : null,
        // Video preview
        vr?.video_url
          ? createElement('video', {
              src: vr.video_url,
              controls: true,
              style: {
                width: '100%',
                marginTop: '8px',
                borderRadius: '8px',
              },
            })
          : null,
        // Error message
        vr?.error
          ? createElement(
              'div',
              {
                style: {
                  fontSize: '11px',
                  color: '#ff6b6b',
                  marginTop: '4px',
                },
              },
              '⚠ ' + vr.error,
            )
          : null,
      )
    }),
  )
}

/** Completed status view with summary. */
function renderCompletedView(task: DramaTask) {
  const shots: DramaShot[] = task.shots || task.storyboard?.shots || []
  const videoResults: VideoResult[] = task.video_results || []
  const completedVideos = videoResults.filter((v) => v.status === 'completed')

  return createElement(
    'div',
    { className: 'agnes-section' },
    createElement(
      'div',
      {
        style: {
          padding: '16px',
          borderRadius: '10px',
          background: 'rgba(0,206,201,0.08)',
          border: '1px solid rgba(0,206,201,0.2)',
          textAlign: 'center',
        },
      },
      createElement('div', { style: { fontSize: '32px', marginBottom: '8px' } }, '🎉'),
      createElement(
        'div',
        { style: { fontSize: '16px', fontWeight: 600, marginBottom: '4px' } },
        '短剧制作完成！',
      ),
      createElement(
        'div',
        {
          style: {
            fontSize: '13px',
            color: 'var(--dsw-alias-label-secondary, #6c6c80)',
          },
        },
        shots.length + ' 个镜头 · ' + completedVideos.length + ' 个视频',
      ),
    ),
    // Show all completed videos
    completedVideos.length > 0
      ? createElement(
          'div',
          { className: 'agnes-section', style: { marginTop: '12px' } },
          createElement('div', { className: 'agnes-section-title' }, '🎥 视频预览'),
          ...completedVideos.map((vr) =>
            vr.video_url
              ? createElement(
                  'div',
                  { key: vr.shot_index, style: { marginBottom: '8px' } },
                  createElement(
                    'div',
                    {
                      style: {
                        fontSize: '12px',
                        fontWeight: 500,
                        marginBottom: '4px',
                        color: 'var(--dsw-alias-label-secondary, #9a9ab0)',
                      },
                    },
                    '镜头 ' + vr.shot_index,
                  ),
                  createElement('video', {
                    src: vr.video_url,
                    controls: true,
                    style: { width: '100%', borderRadius: '8px' },
                  }),
                )
              : null,
          ),
        )
      : null,
  )
}

// ─── Main Component ───────────────────────────────────────────────────────

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

  // Polling ref so we can clean up on unmount
  const stopPollRef = useRef<(() => void) | null>(null)

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

  // ── New task panel ────────────────────────────────────────────────────
  const renderNewTaskForm = () =>
    createElement(
      'div',
      {
        style: {
          padding: '12px 16px',
          borderBottom: '1px solid var(--dsw-alias-border-l1, rgba(255,255,255,0.06))',
          background: 'var(--dsw-alias-bg-layer-2, #252538)',
        },
      },
      createElement(
        'div',
        { className: 'agnes-section-title', style: { marginBottom: '8px' } },
        '🎬 新建短剧',
      ),
      createElement('textarea', {
        className: 'agnes-textarea',
        value: prompt,
        onChange: (e: Event) => setPrompt((e.target as HTMLTextAreaElement).value),
        placeholder:
          '描述你想创作的短剧内容…\n例如：一个关于失忆侦探在雨夜城市中寻找真相的悬疑故事',
        rows: 3,
        style: { minHeight: '64px', fontSize: '13px', marginBottom: '8px' },
      }),
      createElement(
        'div',
        { className: 'agnes-input-row' },
        createElement(
          'div',
          null,
          createElement('label', {
            style: {
              fontSize: '11px',
              color: 'var(--dsw-alias-label-secondary, #6c6c80)',
              marginBottom: '2px',
              display: 'block',
            },
          }, '文本模型'),
          createElement(
            'select',
            {
              className: 'agnes-select',
              value: textModel,
              onChange: (e: Event) => setTextModel((e.target as HTMLSelectElement).value),
            },
            ...TEXT_MODELS.map((m) =>
              createElement('option', { key: m.value, value: m.value }, m.label),
            ),
          ),
        ),
        createElement(
          'div',
          null,
          createElement('label', {
            style: {
              fontSize: '11px',
              color: 'var(--dsw-alias-label-secondary, #6c6c80)',
              marginBottom: '2px',
              display: 'block',
            },
          }, '图像模型'),
          createElement(
            'select',
            {
              className: 'agnes-select',
              value: imageModel,
              onChange: (e: Event) => setImageModel((e.target as HTMLSelectElement).value),
            },
            ...imgOpts.map((m) =>
              createElement('option', { key: m.value, value: m.value }, m.label),
            ),
          ),
        ),
        createElement(
          'div',
          null,
          createElement('label', {
            style: {
              fontSize: '11px',
              color: 'var(--dsw-alias-label-secondary, #6c6c80)',
              marginBottom: '2px',
              display: 'block',
            },
          }, '视频模型'),
          createElement(
            'select',
            {
              className: 'agnes-select',
              value: videoModel,
              onChange: (e: Event) => setVideoModel((e.target as HTMLSelectElement).value),
            },
            ...vidOpts.map((m) =>
              createElement('option', { key: m.value, value: m.value }, m.label),
            ),
          ),
        ),
      ),
      createElement(
        'div',
        { style: { display: 'flex', alignItems: 'flex-end', gap: '8px' } },
        createElement(
          'div',
          null,
          createElement('label', {
            style: {
              fontSize: '11px',
              color: 'var(--dsw-alias-label-secondary, #6c6c80)',
              marginBottom: '2px',
              display: 'block',
            },
          }, '每镜头时长(秒)'),
          createElement(
            'select',
            {
              className: 'agnes-select',
              value: String(shotDuration),
              onChange: (e: Event) =>
                setShotDuration(Number((e.target as HTMLSelectElement).value)),
              style: { width: '80px' },
            },
            ...DURATION_OPTIONS.map((d) =>
              createElement('option', { key: d, value: String(d) }, d + 's'),
            ),
          ),
        ),
        createElement(
          'button',
          {
            className: 'agnes-btn agnes-btn-primary',
            onClick: handleStart,
            disabled: loading || !prompt.trim(),
            style: { flex: 1 },
          },
          loading ? '⏳ 启动中…' : '🚀 开始创作',
        ),
        createElement(
          'button',
          {
            className: 'agnes-btn agnes-btn-secondary',
            onClick: () => {
              const input = document.createElement('input')
              input.type = 'file'
              input.accept = '.txt,.md,.markdown,.json'
              input.onchange = async (e: Event) => {
                const file = (e.target as HTMLInputElement).files?.[0]
                if (!file) return
                const reader = new FileReader()
                reader.onload = async (ev) => {
                  const content = ev.target?.result as string
                  if (!content) return
                  setLoading(true); setError('')
                  try {
                    const { drama_id } = await importScript({
                      script: content,
                      prompt: file.name.replace(/\.[^.]+$/, ''),
                      text_model: newDramaTextModel,
                      image_model: newDramaImageModel,
                      video_model: newDramaVideoModel,
                      shot_duration: newDramaShotDuration,
                    })
                    const stopPoll = pollDramaStatus(drama_id, (task) => {
                      saveDramaTask(task)
                      if (['completed', 'failed', 'stopped'].includes(task.status)) {
                        stopPoll(); setTasks(listDramaTasks())
                      }
                    }, 3000)
                    setTasks(listDramaTasks())
                    setActiveTaskId(drama_id)
                  } catch (err) {
                    setError(err instanceof Error ? err.message : '导入失败')
                  } finally { setLoading(false) }
                }
                reader.readAsText(file)
              }
              input.click()
            },
            disabled: loading,
          },
          '📥 导入剧本',
        ),
        error
        ? createElement(
            'div',
            {
              style: {
                marginTop: '8px',
                padding: '6px 10px',
                borderRadius: '6px',
                background: 'rgba(255,107,107,0.12)',
                color: '#ff6b6b',
                fontSize: '12px',
              },
            },
            '⚠ ' + error,
          )
        : null,
    ))

  // ── Left panel: task list ─────────────────────────────────────────────
  const renderTaskList = () =>
    createElement(
      'div',
      { className: 'agnes-left' },
      createElement('div', { className: 'agnes-left-header' }, '📁 任务列表'),
      createElement(
        'div',
        { className: 'agnes-left-content' },
        taskList.length === 0
          ? createElement(
              'div',
              {
                style: {
                  textAlign: 'center',
                  padding: '20px 12px',
                  fontSize: '12px',
                  color: 'var(--dsw-alias-label-secondary, #6c6c80)',
                },
              },
              '暂无任务',
              createElement('br'),
              '在上方输入短剧创意开始创作',
            )
          : taskList.map((task) => {
              const isActive = selectedTaskId === task.drama_id
              const statusIcon = TERMINAL.has(task.status)
                ? task.status === 'completed'
                  ? '✅'
                  : task.status === 'failed'
                    ? '❌'
                    : '⏹'
                : '🔄'

              return createElement(
                'div',
                {
                  key: task.drama_id,
                  className: 'agnes-scene-item' + (isActive ? ' active' : ''),
                  onClick: () => handleSelectTask(task.drama_id),
                },
                createElement('div', { className: 'agnes-scene-num' }, statusIcon),
                createElement(
                  'div',
                  { className: 'agnes-scene-info' },
                  createElement('div', { className: 'agnes-scene-name' }, getTaskPreview(task)),
                  createElement(
                    'div',
                    {
                      className: 'agnes-scene-status' + (TERMINAL.has(task.status) ? ' done' : ' generating'),
                    },
                    STATUS_LABELS[task.status] || task.status,
                  ),
                  createElement(
                    'div',
                    {
                      style: {
                        fontSize: '10px',
                        color: 'var(--dsw-alias-label-secondary, #6c6c80)',
                        marginTop: '2px',
                      },
                    },
                    formatTime(task.created_at),
                  ),
                ),
                createElement(
                  'button',
                  {
                    style: {
                      border: 'none',
                      background: 'transparent',
                      color: 'var(--dsw-alias-label-secondary, #6c6c80)',
                      cursor: 'pointer',
                      fontSize: '12px',
                      padding: '2px 4px',
                      borderRadius: '4px',
                      opacity: isActive ? 1 : 0.5,
                    },
                    title: '删除任务',
                    onClick: (e: Event) => {
                      e.stopPropagation()
                      handleDeleteTask(task.drama_id)
                    },
                  },
                  '✕',
                ),
              )
            }),
      ),
    )

  // ── Center panel: main content ────────────────────────────────────────
  const renderCenter = () => {
    if (!currentTask) {
      return createElement(
        'div',
        { className: 'agnes-center' },
        createElement(
          'div',
          { className: 'agnes-empty' },
          createElement('div', { className: 'agnes-empty-icon' }, '🎬'),
          createElement('div', { className: 'agnes-empty-title' }, '短剧创作工作台'),
          createElement(
            'div',
            { className: 'agnes-empty-desc' },
            '输入创意描述，AI 将自动生成故事梗概 → 剧本 → 分镜 → 素材 → 视频的完整短剧流水线。',
          ),
        ),
      )
    }

    const task = currentTask
    const stepIdx = getStepIndex(task)

    return createElement(
      'div',
      { className: 'agnes-center' },
      renderProgressSteps(task),
      renderStatusMessage(task),
      createElement(
        'div',
        { style: { flex: 1, overflowY: 'auto', padding: '12px 16px' } },
        // Story editor
        task.status === 'paused_story'
          ? renderTextEditor({ task, field: 'story', editContent, onEditChange: setEditContent, onConfirm: handleConfirmField, onRegenerate: handleRegenerateStep })
          : null,
        // Script editor
        task.status === 'paused_script'
          ? renderTextEditor({ task, field: 'script', editContent, onEditChange: setEditContent, onConfirm: handleConfirmField, onRegenerate: handleRegenerateStep })
          : null,
        // Completed view
        task.status === 'completed' ? renderCompletedView(task) : null,
        // Read-only story
        task.story && task.status !== 'paused_story'
          ? renderReadOnlySection({ title: '📝 故事梗概', content: task.edited_story || task.story })
          : null,
        // Read-only script
        task.script && task.status !== 'paused_script' && stepIdx >= 1
          ? renderReadOnlySection({ title: '📋 剧本', content: task.edited_script || task.script })
          : null,
        // Shots
        stepIdx >= 2 && task.status !== 'paused_story' && task.status !== 'paused_script'
          ? renderShots(task, handleConfirmVideoShot)
          : null,
        // Assets
        stepIdx >= 3 && task.status !== 'paused_story' && task.status !== 'paused_script'
          ? renderAssets(task)
          : null,
      ),
      // Action bar
      createElement(
        'div',
        { className: 'agnes-action-bar' },
        task.status === 'stopped'
          ? createElement('button', { className: 'agnes-btn agnes-btn-primary', onClick: handleResume }, '▶ 恢复')
          : null,
        !TERMINAL.has(task.status) && task.status !== 'stopped'
          ? createElement('button', { className: 'agnes-btn agnes-btn-danger', onClick: handleStop }, '⏹ 停止')
          : null,
        task.status === 'failed'
          ? createElement('button', { className: 'agnes-btn agnes-btn-primary', onClick: handleResume }, '🔄 重试')
          : null,
        createElement(
          'div',
          { style: { marginLeft: 'auto', fontSize: '11px', color: 'var(--dsw-alias-label-secondary, #6c6c80)' } },
          '文本: ' + task.text_model + ' · 图像: ' + task.image_model + ' · 视频: ' + task.video_model,
        ),
      ),
    )
  }

  // ── Right panel: detail / settings ────────────────────────────────────
  const renderRight = () => {
    if (!currentTask) {
      return createElement(
        'div',
        { className: 'agnes-right' },
        createElement(
          'div',
          { className: 'agnes-right-scroll' },
          createElement(
            'div',
            { className: 'agnes-section' },
            createElement('div', { className: 'agnes-section-title' }, '⚙ 创作设置'),
            createElement(
              'div',
              { className: 'agnes-form-group' },
              createElement('label', { className: 'agnes-form-label' }, '文本模型'),
              createElement(
                'select',
                { className: 'agnes-form-select', value: textModel, onChange: (e: Event) => setTextModel((e.target as HTMLSelectElement).value) },
                ...TEXT_MODELS.map((m) => createElement('option', { key: m.value, value: m.value }, m.label)),
              ),
            ),
            createElement(
              'div',
              { className: 'agnes-form-group' },
              createElement('label', { className: 'agnes-form-label' }, '图像模型'),
              createElement(
                'select',
                { className: 'agnes-form-select', value: imageModel, onChange: (e: Event) => setImageModel((e.target as HTMLSelectElement).value) },
                ...imgOpts.map((m) => createElement('option', { key: m.value, value: m.value }, m.label)),
              ),
            ),
            createElement(
              'div',
              { className: 'agnes-form-group' },
              createElement('label', { className: 'agnes-form-label' }, '视频模型'),
              createElement(
                'select',
                { className: 'agnes-form-select', value: videoModel, onChange: (e: Event) => setVideoModel((e.target as HTMLSelectElement).value) },
                ...vidOpts.map((m) => createElement('option', { key: m.value, value: m.value }, m.label)),
              ),
            ),
            createElement(
              'div',
              { className: 'agnes-form-group' },
              createElement('label', { className: 'agnes-form-label' }, '每镜头时长'),
              createElement(
                'div',
                { className: 'agnes-size-grid' },
                ...DURATION_OPTIONS.map((d) =>
                  createElement(
                    'button',
                    { key: d, className: 'agnes-size-btn' + (shotDuration === d ? ' active' : ''), onClick: () => setShotDuration(d) },
                    d + 's',
                  ),
                ),
              ),
            ),
          ),
          createElement('div', { className: 'agnes-divider' }),
          createElement(
            'div',
            { className: 'agnes-section' },
            createElement('div', { className: 'agnes-section-title' }, '💡 使用提示'),
            createElement(
              'div',
              { style: { fontSize: '12px', lineHeight: '1.6', color: 'var(--dsw-alias-label-secondary, #9a9ab0)' } },
              '• 描述越详细，生成效果越好',
              createElement('br'),
              '• 可在每步暂停时编辑内容',
              createElement('br'),
              '• 分镜和视频可逐个生成',
              createElement('br'),
              '• 历史任务自动保存在本地',
            ),
          ),
        ),
      )
    }

    const task = currentTask
    const stepIdx = getStepIndex(task)

    return createElement(
      'div',
      { className: 'agnes-right' },
      createElement(
        'div',
        { className: 'agnes-right-scroll' },
        createElement(
          'div',
          { className: 'agnes-section' },
          createElement('div', { className: 'agnes-section-title' }, '📋 任务信息'),
          createElement('div', { className: 'agnes-setting-row' },
            createElement('span', { className: 'agnes-setting-label' }, '状态'),
            createElement('span', { className: 'agnes-setting-value' }, STATUS_LABELS[task.status] || task.status),
          ),
          createElement('div', { className: 'agnes-setting-row' },
            createElement('span', { className: 'agnes-setting-label' }, '创建时间'),
            createElement('span', { className: 'agnes-setting-value' }, formatTime(task.created_at)),
          ),
          createElement('div', { className: 'agnes-setting-row' },
            createElement('span', { className: 'agnes-setting-label' }, '镜头时长'),
            createElement('span', { className: 'agnes-setting-value' }, task.shot_duration + 's'),
          ),
          createElement('div', { className: 'agnes-setting-row' },
            createElement('span', { className: 'agnes-setting-label' }, '进度'),
            createElement('span', { className: 'agnes-setting-value' }, (stepIdx + 1) + ' / 5'),
          ),
        ),
        createElement('div', { className: 'agnes-divider' }),
        createElement(
          'div',
          { className: 'agnes-section' },
          createElement('div', { className: 'agnes-section-title' }, '📊 生成详情'),
          task.storyboard?.shots
            ? createElement('div', { className: 'agnes-setting-row' },
                createElement('span', { className: 'agnes-setting-label' }, '分镜数'),
                createElement('span', { className: 'agnes-setting-value' }, String(task.storyboard.shots.length)),
              )
            : null,
          task.assets
            ? createElement('div', { className: 'agnes-setting-row' },
                createElement('span', { className: 'agnes-setting-label' }, '素材数'),
                createElement('span', { className: 'agnes-setting-value' }, String(task.assets.length)),
              )
            : null,
          task.video_results
            ? createElement('div', { className: 'agnes-setting-row' },
                createElement('span', { className: 'agnes-setting-label' }, '视频数'),
                createElement('span', { className: 'agnes-setting-value' },
                  task.video_results.filter((v) => v.status === 'completed').length + ' / ' + (task.storyboard?.shots?.length || task.video_results.length),
                ),
              )
            : null,
          createElement(
            'div',
            { className: 'agnes-form-group', style: { marginTop: '8px' } },
            createElement('label', { className: 'agnes-form-label' }, '创作提示'),
            createElement(
              'div',
              {
                style: {
                  padding: '8px',
                  borderRadius: '6px',
                  background: 'var(--dsw-alias-bg-layer-2, #252538)',
                  fontSize: '12px',
                  lineHeight: '1.5',
                  color: 'var(--dsw-alias-label-secondary, #9a9ab0)',
                  maxHeight: '120px',
                  overflowY: 'auto',
                  whiteSpace: 'pre-wrap',
                },
              },
              task.prompt,
            ),
          ),
        ),
        createElement('div', { className: 'agnes-divider' }),
        createElement(
          'div',
          { className: 'agnes-section' },
          createElement('div', { className: 'agnes-section-title' }, '🤖 模型配置'),
          createElement('div', { className: 'agnes-setting-row' },
            createElement('span', { className: 'agnes-setting-label' }, '文本'),
            createElement('span', { className: 'agnes-setting-value', style: { fontSize: '11px' } }, task.text_model),
          ),
          createElement('div', { className: 'agnes-setting-row' },
            createElement('span', { className: 'agnes-setting-label' }, '图像'),
            createElement('span', { className: 'agnes-setting-value', style: { fontSize: '11px' } }, task.image_model),
          ),
          createElement('div', { className: 'agnes-setting-row' },
            createElement('span', { className: 'agnes-setting-label' }, '视频'),
            createElement('span', { className: 'agnes-setting-value', style: { fontSize: '11px' } }, task.video_model),
          ),
        ),
      ),
    )
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
    renderNewTaskForm(),
    createElement(
      'div',
      { className: 'agnes-body', style: { flex: 1, minHeight: 0 } },
      renderTaskList(),
      renderCenter(),
      renderRight(),
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
