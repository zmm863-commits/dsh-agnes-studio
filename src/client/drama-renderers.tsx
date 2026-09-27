/**
 * 短剧工作台的渲染件：常量、格式化工具，以及 8 个纯渲染函数。
 *
 * 由 drama-panel.tsx 上半部原样切出。这些函数本来就是**模块级自由函数**（不在
 * DramaPanel 内），只接收 task / opts 参数并返回元素，因此切分不改动任何一行
 * 逻辑，只需补 export。
 *
 * 留在 drama-panel.tsx 的只有 DramaPanelProps 与主组件（状态、轮询、确认动作）。
 */
import { createElement } from './react-shim.ts'
import { type DramaTask, type DramaShot, type VideoResult } from './drama.ts'

export const TEXT_MODELS: { value: string; label: string }[] = [
  { value: 'agnes-3.0-flash', label: 'Agnes 3.0 Flash (免费)' },
]

export const IMAGE_MODELS_DEFAULT: { value: string; label: string }[] = [
  { value: 'agnes-image-2.5-flash', label: 'Image 2.5 Flash (免费)' },
]

export const VIDEO_MODELS_DEFAULT: { value: string; label: string }[] = [
  { value: 'agnes-video-2.5-flash', label: 'Video 2.5 Flash (免费)' },
]

export const DURATION_OPTIONS = [3, 5, 8, 10]

/** Pipeline step definitions with their associated status values. */
const STEPS: { key: string; label: string; statuses: string[] }[] = [
  { key: 'story', label: '📝 故事梗概', statuses: ['step1', 'paused_story'] },
  { key: 'script', label: '📋 剧本', statuses: ['paused_script'] },
  { key: 'storyboard', label: '🎬 分镜', statuses: ['step2'] },
  { key: 'assets', label: '🎨 素材', statuses: ['step3', 'paused_assets'] },
  { key: 'video', label: '🎥 视频', statuses: ['step4', 'paused_video', 'merging'] },
]

/** Terminal statuses that stop polling. */
export const TERMINAL = new Set(['completed', 'failed', 'stopped'])

/** Human-readable status labels. */
export const STATUS_LABELS: Record<string, string> = {
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
export function formatTime(ts: number): string {
  try {
    const d = new Date(ts)
    const pad = (n: number) => String(n).padStart(2, '0')
    return `${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
  } catch {
    return '--'
  }
}

export function getStepIndex(task: DramaTask): number {
  const byStatus = STEPS.findIndex((s) => s.statuses.includes(task.status))
  if (byStatus >= 0) return byStatus

  // 下面这几种状态都不在 STEPS 的 statuses 里，原先 findIndex 会返回 -1 ——
  // 于是 isActive(idx === -1) 与 isDone(idx < -1) **双双恒为假**，任务**完成**时
  // 步骤条反而显示成「一步都没走完」。
  if (task.status === 'completed') return STEPS.length   // 全部标成已完成

  // engine 在推进过程中会把 step 写成 'step1' / 'step2'（这些值在 STEPS 里有），
  // 拿它兜一层：'generating' 时也能定位到当前步。
  const byStep = STEPS.findIndex((s) => s.statuses.includes(task.step))
  if (byStep >= 0) return byStep

  return 0   // started / pending / failed / stopped：退回第一步，至少不误导
}

export function getTaskPreview(task: DramaTask): string {
  const p = task.prompt || ''
  return p.length > 36 ? p.slice(0, 36) + '…' : p
}

export function buildModelOptions(
  record: Record<string, string>,
  defaults: { value: string; label: string }[],
): { value: string; label: string }[] {
  const entries = Object.entries(record)
  if (entries.length === 0) return defaults
  return entries.map(([value, label]) => ({ value, label }))
}

// ─── Sub-components ───────────────────────────────────────────────────────

/** 5-step vertical progress indicator. */
export function renderProgressSteps(task: DramaTask) {
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
export function renderStatusMessage(task: DramaTask) {
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
              color: 'var(--ag-text-3, #6e80a3)',
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
export function renderTextEditor(opts: {
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
export function renderReadOnlySection(opts: {
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
          background: 'var(--ag-surface-2, rgba(255,255,255,0.55))',
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
export function renderAssets(task: DramaTask) {
  const assets = task.assets || []
  if (assets.length === 0) {
    return createElement(
      'div',
      { className: 'agnes-section' },
      createElement('div', { className: 'agnes-section-title' }, '🎨 素材'),
      createElement(
        'div',
        { style: { color: 'var(--ag-text-3, #6e80a3)', fontSize: '13px', padding: '12px 0' } },
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
export function renderShots(task: DramaTask, onConfirmVideo: (shotIndex: number) => void) {
  const shots: DramaShot[] = task.shots || task.storyboard?.shots || []
  const videoResults: VideoResult[] = task.video_results || []

  if (shots.length === 0) {
    return createElement(
      'div',
      { className: 'agnes-section' },
      createElement('div', { className: 'agnes-section-title' }, '🎬 分镜'),
      createElement(
        'div',
        { style: { color: 'var(--ag-text-3, #6e80a3)', fontSize: '13px', padding: '12px 0' } },
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
              color: 'var(--ag-text-3, #6e80a3)',
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
                  color: 'var(--ag-text-2, #2a3c5e)',
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
                  color: 'var(--ag-text-2, #2a3c5e)',
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

/**
 * 成片区：一键生成全部镜头 → 合成成片（可烧字幕）→ 预览/下载。
 * 只在已经有分镜、且不在早期步骤时出现。
 */
export function renderFinalCut(
  task: DramaTask,
  opts: {
    merging: boolean
    finalCut: { url: string; duration: number; shots: number } | null
    notice: string
    ffmpegMissing?: boolean
    ffmpegHint?: string
    onGenerateAll: () => void
    onMerge: (withSubtitles: boolean) => void
  },
) {
  const results = task.video_results || []
  if (results.length === 0) return null

  const done = results.filter((v) => v.status === 'completed').length
  const failed = results.filter((v) => v.status === 'failed').length
  const generating = results.some((v) => v.status === 'generating' || v.status === 'pending')
  const canMerge = done > 0 && !opts.merging
  const notStarted = done === 0 && !generating

  return createElement(
    'div',
    { className: 'agnes-section' },
    // 高亮卡片：让"下一步做什么"一眼可见
    createElement(
      'div',
      { className: `agdp-next${notStarted ? ' primary' : ''}` },
      createElement(
        'div',
        { className: 'agdp-next-head' },
        createElement('span', { className: 'agdp-next-icon' }, notStarted ? '👉' : (generating ? '⏳' : '✅')),
        createElement(
          'div',
          null,
          createElement('div', { className: 'agdp-next-title' },
            notStarted ? '下一步：生成镜头视频' : (generating ? '镜头生成中…' : '镜头已就绪，可以合成成片')),
          createElement('div', { className: 'agdp-next-sub' },
            `镜头进度：${done}/${results.length} 已完成` +
              (failed > 0 ? ` · ${failed} 个失败` : '') +
              (generating ? ' · 生成中…' : '')),
        ),
      ),

      opts.ffmpegMissing
        ? createElement('div', { className: 'agdp-warn' },
            '⚠️ 未检测到 ffmpeg，无法合成成片。' + (opts.ffmpegHint || '请先安装 ffmpeg。'))
        : null,

      createElement(
        'div',
        { className: 'agdp-next-actions' },
        createElement(
          'button',
          {
            className: 'agnes-btn agnes-btn-primary',
            disabled: generating,
            onClick: opts.onGenerateAll,
          },
          generating ? '⏳ 正在生成镜头…' : '🎬 一键生成全部镜头',
        ),
        createElement(
          'button',
          {
            className: 'agnes-btn agnes-btn-secondary',
            disabled: !canMerge,
            onClick: () => opts.onMerge(false),
          },
          opts.merging ? '⏳ 合成中…' : '🎞 合成成片',
        ),
        createElement(
          'button',
          {
            className: 'agnes-btn agnes-btn-ghost',
            disabled: !canMerge,
            onClick: () => opts.onMerge(true),
          },
          opts.merging ? '⏳ 合成中…' : '💬 合成并烧字幕',
        ),
      ),
    ),
    opts.notice
      ? createElement(
          'div',
          { style: { marginTop: '8px', fontSize: '12px', color: '#2ecc71' } },
          opts.notice,
        )
      : null,
    opts.finalCut
      ? createElement(
          'div',
          { style: { marginTop: '12px' } },
          createElement('video', {
            src: opts.finalCut.url,
            controls: true,
            style: { width: '100%', borderRadius: '10px', background: '#000' },
          }),
          createElement(
            'div',
            { style: { display: 'flex', gap: '8px', alignItems: 'center', marginTop: '8px' } },
            createElement(
              'a',
              {
                className: 'agnes-btn agnes-btn-sm',
                href: opts.finalCut.url,
                download: `短剧成片-${task.drama_id}.mp4`,
                style: { textDecoration: 'none' },
              },
              '⬇️ 下载成片',
            ),
            createElement(
              'span',
              { style: { fontSize: '11px', color: 'var(--ag-text-3, #8a8a9e)' } },
              `${opts.finalCut.shots} 镜 · ${Number(opts.finalCut.duration || 0).toFixed(1)} 秒`,
            ),
          ),
        )
      : null,
  )
}

/** Completed status view with summary. */
export function renderCompletedView(task: DramaTask) {
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
            color: 'var(--ag-text-3, #6e80a3)',
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
                        color: 'var(--ag-text-2, #2a3c5e)',
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

