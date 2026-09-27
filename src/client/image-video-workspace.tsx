/**
 * 生图 / 生视频的工作区：中间预览 + 操作栏 + 右侧参数面板。
 *
 * 由 panel.tsx 主渲染内联拆出（原 699-922 行）。
 * 注意：短剧页签会占用这里的**预览位**，但右侧参数栏只对 image/video 渲染 ——
 * 短剧工作台自带右栏，再多渲染一个会留下一条 280px 的空侧栏（原注释里记着这个坑）。
 *
 * 设计约束：**纯展示 + 回调，state 仍由 panel 持有**。这是刻意选择：
 * 如果把 prompt / 加载态下沉到本组件，切到「短剧」再切回来会因组件卸载而丢状态，
 * 与改造前行为不一致。代价是 props 较多，但每一个都是显式的。
 */
import { createElement } from './react-shim.ts'
import { TEXT_MODEL_OPTIONS, type GenHistoryItem, type KeyStatus, type StudioProject } from './studio.ts'
import { DramaPanel } from './drama-panel.tsx'
import { ModelSelector, SizeSelector, VideoModeSelector, type VideoMode } from './selector-sections.tsx'

/** 生成结果。 */
export interface GenerationResult {
  type: 'image' | 'video'
  url: string
}

/** 工作区的数据与回调。 */
export interface ImageVideoWorkspaceProps {
  /** 当前页签：image / video / storyboard。 */
  tab: string
  /** 图片 / 视频模型表（供短剧面板与各选择器使用）。 */
  imageModels: Record<string, string>
  videoModels: Record<string, string>

  // ── 生成状态 ──────────────────────────────────────────────────────────
  prompt: string
  onPromptChange: (value: string) => void
  loading: boolean
  loadingText: string
  progress: number
  result: GenerationResult | null
  onClearResult: () => void
  error: string

  // ── 生成动作 ──────────────────────────────────────────────────────────
  onGenerateImage: () => void
  onGenerateVideo: () => void
  onBatchGenerate: () => void
  onDownload: (url: string, filename: string) => void

  // ── 项目 / 场景 ───────────────────────────────────────────────────────
  project: StudioProject | null
  selectedScene: number
  onSelectScene: (index: number) => void
  onUpdateScenePrompt: (index: number, prompt: string) => void
  onSaveScenePrompt: () => void
  onGenerateSceneImage: (index: number) => void

  // ── 模型选择 ──────────────────────────────────────────────────────────
  selectedImageModel: string
  selectedVideoModel: string
  onSelectImageModel: (id: string) => void
  onSelectVideoModel: (id: string) => void

  // ── 图片尺寸 ──────────────────────────────────────────────────────────
  availableImageSizes: string[]
  onAvailableSizesChange: (sizes: string[]) => void
  imageSize: string
  onImageSizeChange: (size: string) => void
  imageRatio: string
  onImageRatioChange: (ratio: string) => void

  // ── 视频参数 ──────────────────────────────────────────────────────────
  videoMode: VideoMode
  onVideoModeChange: (mode: VideoMode) => void
  firstFrame: string
  lastFrame: string
  onUploadFrame: (target: 'first' | 'last') => void
  videoResolution: string
  onVideoResolutionChange: (value: string) => void
  videoAspectRatio: string
  onVideoAspectRatioChange: (value: string) => void
  videoDuration: string
  onVideoDurationChange: (value: string) => void

  // ── 参数栏 ────────────────────────────────────────────────────────────
  /** 参数栏是否展开（收起后预览区占满整条）。 */
  paramsOpen: boolean
  /** 切换参数栏展开状态。 */
  onToggleParams: () => void
  /** 停止等待当前生成（不撤销平台侧任务）。 */
  onCancel: () => void
  /** 中性提示（非错误）。 */
  notice: string
  /** 生成历史（最新在前）。 */
  history: GenHistoryItem[]
  /** 把某条历史重新显示到预览区。 */
  onShowHistory: (item: GenHistoryItem) => void

  // ── 参考图 ────────────────────────────────────────────────────────────
  refImages: string[]
  onRefImagesChange: (urls: string[]) => void

  /** Agnes Key 状态（模型信息区展示）。 */
  keyStatus: KeyStatus
}

/**
 * 提示词示例：short 是按钮上的短标签，text 是点击后填进输入框的完整提示词。
 *
 * 之前的新手路径是「盯着空 textarea 和一段 placeholder 发呆」—— placeholder
 * 只在没输入时可见，一旦敲了第一个字就没了，也没有一键可用的起点。
 */
const PROMPT_EXAMPLES: Record<'image' | 'video', Array<{ short: string; text: string }>> = {
  image: [
    { short: '赛博朋克街景', text: '赛博朋克城市街道，雨夜，霓虹灯倒映在湿漉漉的地面，低角度镜头，电影级光照' },
    { short: '治愈系插画', text: '治愈系插画，一只小猫趴在窗台晒太阳，暖色调，柔光，细腻笔触' },
    { short: '产品摄影', text: '产品摄影，白色背景，极简构图，柔和阴影，高细节，商业级打光' },
  ],
  video: [
    { short: '雨夜跑车', text: '雨后未来城市街道，霓虹灯倒映在地面，一辆银色跑车缓慢驶过，电影级运镜' },
    { short: '咖啡特写', text: '热咖啡倒入白色陶瓷杯，慢动作特写，蒸汽升腾，暖色灯光，浅景深' },
    { short: '云海日出', text: '航拍云海日出，金色阳光穿透云层，镜头缓慢前推，宏大氛围' },
  ],
}

/**
 * 把一个图片文件读成 dataURL；非图片或读取失败返回 null。
 * 点选文件与拖拽投递这两条路径共用它，避免两处各写一遍 FileReader。
 * @param file - 用户提供的文件。
 * @returns dataURL 或 null。
 */
function readImageFile(file: File): Promise<string | null> {
  return new Promise((resolve) => {
    if (!file.type.startsWith('image/')) {
      resolve(null)
      return
    }
    const reader = new FileReader()
    reader.onload = (ev) => resolve((ev.target?.result as string) ?? null)
    reader.onerror = () => resolve(null)
    reader.readAsDataURL(file)
  })
}

/** 把若干文件读成 dataURL 列表（跳过非图片）。 */
async function readImageFiles(files: File[]): Promise<string[]> {
  const urls: string[] = []
  for (const f of files) {
    const url = await readImageFile(f)
    if (url) urls.push(url)
  }
  return urls
}

/** 右下角说明小字的统一样式（原先内联重复了多次）。 */
const HINT_STYLE = { fontSize: '11px', color: 'var(--ag-text-3, #6e80a3)', marginTop: '8px' }

/**
 * 生图 / 生视频工作区。
 * @param props - 数据与回调。
 */
export function ImageVideoWorkspace(props: ImageVideoWorkspaceProps): unknown {
  const {
    tab, imageModels, videoModels,
    prompt, onPromptChange, loading, loadingText, progress, result, onClearResult, error,
    onGenerateImage, onGenerateVideo, onBatchGenerate, onDownload,
    project, selectedScene, onSelectScene, onUpdateScenePrompt, onSaveScenePrompt, onGenerateSceneImage,
    selectedImageModel, selectedVideoModel, onSelectImageModel, onSelectVideoModel,
    availableImageSizes, onAvailableSizesChange, imageSize, onImageSizeChange, imageRatio, onImageRatioChange,
    videoMode, onVideoModeChange, firstFrame, lastFrame, onUploadFrame,
    videoResolution, onVideoResolutionChange, videoAspectRatio, onVideoAspectRatioChange,
    videoDuration, onVideoDurationChange,
    refImages, onRefImagesChange, keyStatus,
    paramsOpen, onToggleParams, onCancel, notice, history, onShowHistory,
  } = props

  const isMedia = tab === 'image' || tab === 'video'
  /** 模型 id → 显示名（原 panel 内的 getModelDisplayName，逻辑仅此一行）。 */
  const modelName = (id: string, models: Record<string, string>): string => models[id] || id
  const currentScene = project?.scenes[selectedScene]

  return createElement('div', { className: 'agnes-body' },
    createElement('div', { className: 'agnes-center' },
      createElement('div', { className: 'agnes-preview-area', style: tab === 'storyboard' ? { alignItems: 'stretch', justifyContent: 'stretch' } : undefined },
        tab === 'storyboard'
          ? createElement(DramaPanel, { textModels: TEXT_MODEL_OPTIONS, imageModels, videoModels })
          : loading ? createElement('div', { className: 'agnes-skeleton' },
              createElement('div', { style: { fontSize: '24px' } }, '✨'),
              createElement('div', { className: 'agnes-skeleton-text' }, loadingText),
              createElement('div', { className: 'agnes-progress-bar' },
                createElement('div', { className: 'agnes-progress-fill', style: { width: `${progress}%` } }),
              ),
            )
            : result ? createElement('div', { style: { textAlign: 'center', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' } },
                result.type === 'image'
                  ? createElement('img', {
                      src: result.url,
                      alt: '生成结果',
                      className: 'agnes-preview-img',
                      style: { maxWidth: '100%', maxHeight: 'calc(100% - 40px)' },
                    })
                  : createElement('video', {
                      src: result.url,
                      controls: true,
                      className: 'agnes-preview-video',
                      style: { maxWidth: '100%', maxHeight: 'calc(100% - 40px)' },
                    }),
                createElement('div', { style: { marginTop: '8px', display: 'flex', gap: '8px' } },
                  createElement('button', {
                    className: 'agnes-btn agnes-btn-sm agnes-btn-secondary',
                    onClick: () => onDownload(result.url, `agnes-${Date.now()}.${result.type === 'image' ? 'png' : 'mp4'}`),
                  }, '📥 下载'),
                  createElement('button', {
                    className: 'agnes-btn agnes-btn-sm agnes-btn-ghost',
                    onClick: () => { navigator.clipboard?.writeText(result.url) },
                  }, '📋 复制链接'),
                  // 只有图片能当参考图；视频结果是任务产物，不能回灌进 images 参数
                  result.type === 'image' ? createElement('button', {
                    className: 'agnes-btn agnes-btn-sm agnes-btn-ghost',
                    title: refImages.includes(result.url) ? '已在参考图里' : '把它加入参考图，接着做下一张',
                    onClick: () => {
                      if (!refImages.includes(result.url)) onRefImagesChange([...refImages, result.url])
                    },
                  }, refImages.includes(result.url) ? '✅ 已加入参考图' : '🖼 作为参考图') : null,
                ),
              )
              : createElement('div', { className: 'agnes-empty' },
                  createElement('div', { className: 'agnes-empty-icon' },
                    tab === 'image' ? '🎨' : tab === 'video' ? '🎬' : '📖',
                  ),
                  createElement('div', { className: 'agnes-empty-title' },
                    tab === 'image' ? 'AI 生图' : tab === 'video' ? 'AI 生视频' : '🎬 短剧工作台',
                  ),
                  createElement('div', { className: 'agnes-empty-desc' },
                    tab === 'image' ? '在右侧输入提示词，选择模型和尺寸，点击生成' :
                    tab === 'video' ? '在右侧输入提示词，选择模型和模式，描述想要的视频内容' :
                    '在「短剧」标签页中开始创作',
                  ),
                ),
      ),

      createElement('div', { className: 'agnes-action-bar' },
        createElement('button', {
          className: 'agnes-btn agnes-btn-primary',
          disabled: loading || !prompt.trim() || tab === 'settings',
          onClick: tab === 'image' ? onGenerateImage : onGenerateVideo,
        }, loading ? `⏳ ${loadingText}` : tab === 'image' ? '✨ 生成图片' : '🎬 生成视频'),
        isMedia && project ? createElement('button', {
          className: 'agnes-btn agnes-btn-secondary',
          disabled: loading,
          onClick: onBatchGenerate,
        }, '▶ 批量生成所有场景') : null,
        result ? createElement('button', {
          className: 'agnes-btn agnes-btn-ghost',
          onClick: onClearResult,
        }, '✕ 清除预览') : null,
        loading ? createElement('button', {
          className: 'agnes-btn agnes-btn-sm agnes-btn-ghost',
          onClick: onCancel,
          title: '停止等待（平台侧任务可能仍在生成）',
        }, '⏹ 停止') : null,
        isMedia ? createElement('button', {
          className: 'agnes-btn agnes-btn-sm agnes-btn-ghost',
          onClick: onToggleParams,
          title: paramsOpen ? '收起参数栏，让预览更大' : '展开参数栏',
        }, paramsOpen ? '⇥ 收起参数' : '⇤ 参数栏') : null,
        notice ? createElement('div', {
          style: { marginLeft: 'auto', fontSize: '12px', color: 'var(--ag-text-3, #6e80a3)' },
        }, notice) : null,
        error ? createElement('div', {
          style: { marginLeft: 'auto', fontSize: '12px', color: '#ff6b6b' },
        }, error) : null,
      ),

      // ── 生成历史：缩略图带走马灯，点击回看 ──
      history.length > 0 ? createElement('div', {
        style: {
          display: 'flex', gap: '6px', padding: '8px 16px', overflowX: 'auto',
          borderTop: '1px solid var(--ag-line)', flex: '0 0 auto',
        },
      },
        ...history.map(h =>
          createElement('button', {
            key: h.id,
            title: h.prompt.length > 80 ? h.prompt.slice(0, 80) + '…' : h.prompt,
            style: {
              flex: '0 0 auto', width: '46px', height: '46px', padding: 0, cursor: 'pointer',
              border: '1px solid var(--ag-line)', borderRadius: '8px', overflow: 'hidden',
              background: 'var(--ag-surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            },
            onClick: () => onShowHistory(h),
          },
            h.type === 'image'
              ? createElement('img', { src: h.url, alt: '', style: { width: '100%', height: '100%', objectFit: 'cover' } })
              : createElement('span', { style: { fontSize: '18px' } }, '🎬'),
          ),
        ),
      ) : null,
    ),

    // ═══ 右栏 —— 仅 image / video；收起后让预览占满 ═══
    isMedia && paramsOpen
      ? createElement('div', { className: 'agnes-right' },
          createElement('div', { className: 'agnes-right-scroll' },

        isMedia ? createElement('div', { className: 'agnes-section' },
          createElement('div', { className: 'agnes-section-title' }, '📝 提示词'),
          createElement('textarea', {
            className: 'agnes-textarea',
            value: prompt,
            onChange: (e: Event) => onPromptChange((e.target as HTMLTextAreaElement).value),
            placeholder: tab === 'image'
              ? '描述你想要生成的图片...\n\n例如：赛博朋克城市街道，雨夜，霓虹灯倒映在湿漉漉的地面，低角度镜头，电影级光照'
              : '描述你想要生成的视频...\n\n例如：雨后的未来城市街道，霓虹灯倒映在地面，一辆银色跑车缓慢驶过，电影级运镜',
            rows: 5,
          }),
          createElement('div', {
            style: { display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center', marginTop: '8px' },
          },
            createElement('span', { style: { fontSize: '11px', color: 'var(--ag-text-3, #6e80a3)' } }, '试试：'),
            ...PROMPT_EXAMPLES[tab === 'video' ? 'video' : 'image'].map(ex =>
              createElement('button', {
                key: ex.short,
                className: 'agnes-btn agnes-btn-sm agnes-btn-ghost',
                title: ex.text,
                onClick: () => onPromptChange(ex.text),
              }, ex.short),
            ),
          ),
        ) : null,

        isMedia && currentScene ? createElement('div', { className: 'agnes-section' },
          createElement('div', { className: 'agnes-section-title' }, `🎞 场景 ${selectedScene + 1} 提示词`),
          createElement('textarea', {
            className: 'agnes-textarea',
            value: currentScene.prompt,
            onChange: (e: Event) => onUpdateScenePrompt(selectedScene, (e.target as HTMLTextAreaElement).value),
            onBlur: onSaveScenePrompt,
            placeholder: `为场景 ${selectedScene + 1} 编写提示词...`,
            rows: 4,
          }),
          createElement('div', { style: { marginTop: '8px', display: 'flex', gap: '6px' } },
            createElement('button', {
              className: 'agnes-btn agnes-btn-sm agnes-btn-primary',
              disabled: loading || !currentScene.prompt.trim(),
              onClick: () => onGenerateSceneImage(selectedScene),
              style: { flex: 1 },
            }, '✨ 生成此场景'),
            createElement('button', {
              className: 'agnes-btn agnes-btn-sm agnes-btn-ghost',
              onClick: () => { if (selectedScene > 0) onSelectScene(selectedScene - 1) },
              disabled: selectedScene === 0,
            }, '←'),
            createElement('button', {
              className: 'agnes-btn agnes-btn-sm agnes-btn-ghost',
              onClick: () => { if (project && selectedScene < project.scenes.length - 1) onSelectScene(selectedScene + 1) },
              disabled: !project || selectedScene >= project.scenes.length - 1,
            }, '→'),
          ),
        ) : null,

        isMedia ? createElement(ModelSelector, {
          kind: tab as 'image' | 'video',
          models: tab === 'image' ? imageModels : videoModels,
          value: tab === 'image' ? selectedImageModel : selectedVideoModel,
          imageSize,
          onValueChange: tab === 'image' ? onSelectImageModel : onSelectVideoModel,
          onSizesChange: onAvailableSizesChange,
          onImageSizeChange: onImageSizeChange,
        }) : null,
        tab === 'image' ? createElement(SizeSelector, {
          sizes: availableImageSizes,
          size: imageSize,
          onSizeChange: onImageSizeChange,
          ratio: imageRatio,
          onRatioChange: onImageRatioChange,
        }) : null,
        tab === 'video' ? createElement(VideoModeSelector, {
          mode: videoMode,
          onModeChange: onVideoModeChange,
          firstFrame,
          lastFrame,
          onUploadFrame: onUploadFrame,
          resolution: videoResolution,
          onResolutionChange: onVideoResolutionChange,
          aspectRatio: videoAspectRatio,
          onAspectRatioChange: onVideoAspectRatioChange,
          duration: videoDuration,
          onDurationChange: onVideoDurationChange,
        }) : null,
        isMedia ? createElement('div', { className: 'agnes-divider' }) : null,

        isMedia ? createElement('div', { className: 'agnes-section' },
          createElement('div', { className: 'agnes-section-title' }, '🖼 参考图片'),
          createElement('div', {
            className: 'agnes-ref-chips',
            // 支持把图片直接拖进来（与点「+」选文件等效）
            onDragOver: (e: Event) => { e.preventDefault() },
            onDrop: (e: Event) => {
              e.preventDefault()
              const files = Array.from((e as DragEvent).dataTransfer?.files ?? [])
              if (files.length === 0) return
              void (async () => {
                const urls = await readImageFiles(files)
                if (urls.length > 0) onRefImagesChange([...refImages, ...urls])
              })()
            },
          },
            ...refImages.map((url, i) =>
              createElement('div', { key: i, className: 'agnes-ref-chip' },
                createElement('img', { src: url, alt: `参考 ${i + 1}` }),
                createElement('button', {
                  className: 'agnes-ref-chip-remove',
                  onClick: () => onRefImagesChange(refImages.filter((_, j) => j !== i)),
                }, '×'),
              ),
            ),
            createElement('button', {
              className: 'agnes-ref-chip-add',
              onClick: () => {
                const input = document.createElement('input')
                input.type = 'file'
                input.accept = 'image/*'
                input.multiple = true
                input.onchange = (e) => {
                  const files = Array.from((e.target as HTMLInputElement).files ?? [])
                  if (files.length === 0) return
                  void (async () => {
                    const urls = await readImageFiles(files)
                    if (urls.length > 0) onRefImagesChange([...refImages, ...urls])
                  })()
                }
                input.click()
              },
            }, '+'),
          ),
          refImages.length > 0
            ? createElement('div', { style: HINT_STYLE }, `${refImages.length} 张参考图`)
            : createElement('div', { style: HINT_STYLE },
                tab === 'video' && videoMode === 'keyframe' ? '纯文生视频模式（或上传首尾帧）' : '无参考图（纯文生模式）'),
        ) : null,

        isMedia ? createElement('div', { className: 'agnes-divider' }) : null,

        isMedia ? createElement('div', { className: 'agnes-section' },
          createElement('div', { className: 'agnes-section-title' }, 'ℹ️ 模型信息'),
          createElement('div', { style: { fontSize: '12px', color: 'var(--ag-text-3, #6e80a3)', lineHeight: '1.6' } },
            createElement('div', null, `🎨 当前图片模型: ${modelName(selectedImageModel, imageModels)}`),
            createElement('div', null, `🎬 当前视频模型: ${modelName(selectedVideoModel, videoModels)}`),
            createElement('div', null, `📐 图片尺寸: ${imageSize} · 比例: ${imageRatio}`),
            tab === 'video' ? createElement('div', null, `🎥 视频模式: ${videoMode === 'text' ? '文生视频' : videoMode === 'keyframe' ? '首尾帧' : '参考图'} · ${videoResolution} · ${videoAspectRatio}`) : null,
            createElement('div', { style: { marginTop: '6px' } },
              keyStatus === 'ready' ? '🔑 API Key：已配置'
                : keyStatus === 'missing' ? '🔑 API Key：未配置'
                  : '🔑 API Key：未检测',
            ),
          ),
        ) : null,
          ),
        )
      : null,
  )
}
