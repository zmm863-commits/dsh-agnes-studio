/**
 * 短剧工作台的四个视图：新建任务表单 / 任务列表 / 中间主区 / 右侧详情。
 *
 * 由 drama-panel.tsx 主组件内联的 renderNewTaskForm / renderTaskList / renderCenter /
 * renderRight 搬出。搬移方式：这四段原本是组件内的箭头函数，**靠闭包**读取
 * DramaPanel 的 state 与回调；搬出后改为接收汇总对象 `v`，函数体开头把它解构成
 * 与原来同名的局部变量 —— 因此**函数体一行未改**，只是取得变量的方式从闭包
 * 变成了参数。
 *
 * 变量用一个 DramaViewVars 汇总而不是逐个传参：35 个依赖里有相当一部分被两个以上
 * 视图共用，逐个列在调用处反而更难看出它们共享了什么。
 */
import { createElement } from './react-shim.ts'
import {
  type DramaTask, createDrama, importScript, getDramaStatus, stopDrama, resumeDrama, confirmDrama,
  regenerateDrama, generateAllShotVideos, mergeDrama, pollDramaStatus, saveDramaTask, listDramaTasks,
  deleteDramaTask,
} from './drama.ts'
import {
  TEXT_MODELS, IMAGE_MODELS_DEFAULT, VIDEO_MODELS_DEFAULT, DURATION_OPTIONS, TERMINAL, STATUS_LABELS,
  formatTime, getStepIndex, getTaskPreview, buildModelOptions,
  renderProgressSteps, renderStatusMessage, renderTextEditor, renderReadOnlySection,
  renderAssets, renderShots, renderFinalCut, renderCompletedView,
} from './drama-renderers.tsx'

/** 四个视图共享的组件内变量与回调（搬出前它们是闭包变量）。 */
export interface DramaViewVars {
  // ── 状态 ──
  currentTask: DramaTask | null
  taskList: DramaTask[]
  prompt: string
  textModel: string
  imageModel: string
  videoModel: string
  shotDuration: number
  loading: boolean
  error: string
  editContent: string
  selectedTaskId: string | null
  merging: boolean
  ffStatus: { available: boolean; hint: string } | null
  notice: string
  finalCut: { url: string; duration: number; shots: number } | null

  // ── 状态写入 ──
  setPrompt: (value: string) => void
  setTextModel: (value: string) => void
  setImageModel: (value: string) => void
  setVideoModel: (value: string) => void
  setShotDuration: (value: number) => void
  setLoading: (value: boolean) => void
  setError: (value: string) => void
  setEditContent: (value: string) => void
  setTaskList: (tasks: DramaTask[]) => void
  setSelectedTaskId: (id: string | null) => void

  // ── 动作 ──
  handleStart: () => void | Promise<void>
  handleSelectTask: (dramaId: string) => void
  handleStop: () => void | Promise<void>
  handleResume: () => void | Promise<void>
  handleDeleteTask: (dramaId: string) => void
  handleConfirmField: (field: 'story' | 'script', content: string) => void | Promise<void>
  handleRegenerateStep: (step: 'story' | 'script') => void | Promise<void>
  handleConfirmVideoShot: (shotIndex: number) => void | Promise<void>
  handleGenerateAllVideos: () => void | Promise<void>
  handleMerge: (withSubtitles: boolean) => void | Promise<void>

  // ── 派生值 ──
  imgOpts: ReturnType<typeof buildModelOptions>
  vidOpts: ReturnType<typeof buildModelOptions>
}

export function renderNewTaskForm(v: DramaViewVars): unknown {
  const { setTaskList, setSelectedTaskId, error, handleStart, imageModel, imgOpts, loading, prompt, setError, setImageModel, setLoading, setPrompt, setShotDuration, setTextModel, setVideoModel, shotDuration, textModel, vidOpts, videoModel } = v

  return (
    createElement(
      'div',
      {
        style: {
          padding: '12px 16px',
          borderBottom: '1px solid var(--ag-line, rgba(32,74,150,0.15))',
          background: 'var(--ag-surface-2, rgba(255,255,255,0.55))',
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
              color: 'var(--ag-text-3, #6e80a3)',
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
              color: 'var(--ag-text-3, #6e80a3)',
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
              color: 'var(--ag-text-3, #6e80a3)',
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
              color: 'var(--ag-text-3, #6e80a3)',
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
                      text_model: textModel,
                      image_model: imageModel,
                      video_model: videoModel,
                      shot_duration: shotDuration,
                    })
                    const stopPoll = pollDramaStatus(drama_id, (task) => {
                      saveDramaTask(task)
                      if (['completed', 'failed', 'stopped'].includes(task.status)) {
                        stopPoll(); setTaskList(listDramaTasks())
                      }
                    }, 3000)
                    setTaskList(listDramaTasks())
                    setSelectedTaskId(drama_id)
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
  )
}

export function renderTaskList(v: DramaViewVars): unknown {
  const { handleDeleteTask, handleSelectTask, selectedTaskId, taskList } = v

  return (
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
                  color: 'var(--ag-text-3, #6e80a3)',
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
                        color: 'var(--ag-text-3, #6e80a3)',
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
                      color: 'var(--ag-text-3, #6e80a3)',
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
  )
}

export function renderCenter(v: DramaViewVars): unknown {
  const { currentTask, editContent, ffStatus, finalCut, handleConfirmField, handleConfirmVideoShot, handleGenerateAllVideos, handleMerge, handleRegenerateStep, handleResume, handleStop, merging, notice, setEditContent } = v

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
        // Final cut (成片合成)
        renderFinalCut(task, {
          merging, finalCut, notice,
          ffmpegMissing: ffStatus ? !ffStatus.available : false,
          ffmpegHint: ffStatus?.hint,
          onGenerateAll: handleGenerateAllVideos,
          onMerge: handleMerge,
        }),
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
          { style: { marginLeft: 'auto', fontSize: '11px', color: 'var(--ag-text-3, #6e80a3)' } },
          '文本: ' + task.text_model + ' · 图像: ' + task.image_model + ' · 视频: ' + task.video_model,
        ),
      ),
    )
}

export function renderRight(v: DramaViewVars): unknown {
  const { currentTask, imageModel, imgOpts, prompt, setImageModel, setShotDuration, setTextModel, setVideoModel, shotDuration, textModel, vidOpts, videoModel } = v

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
              { style: { fontSize: '12px', lineHeight: '1.6', color: 'var(--ag-text-2, #2a3c5e)' } },
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
                  background: 'var(--ag-surface-2, rgba(255,255,255,0.55))',
                  fontSize: '12px',
                  lineHeight: '1.5',
                  color: 'var(--ag-text-2, #2a3c5e)',
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
