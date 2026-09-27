/**
 * 右侧面板的三个选择器片段：模型 / 尺寸 / 视频模式。
 *
 * 由 panel.tsx 内联的 renderModelSelector / renderSizeSelector /
 * renderVideoModeSelector 拆出（连同只服务于它们的四个候选值常量）。
 *
 * 设计约束：与 settings-tab 一致 —— **纯展示 + 回调**。
 * 组件不直接持有 StudioPanel 的 state；唯一保留在组件内的逻辑是「切换模型 →
 * 尺寸白名单联动」，因为那是这个控件自身的交互语义，不属于业务编排。
 */
import { createElement } from './react-shim.ts'
import { getImageSizeOptions } from './studio.ts'

/** 图片宽高比候选。 */
export const IMAGE_RATIOS = ['1:1', '3:4', '4:3', '16:9', '9:16', '2:3', '3:2', '21:9']

/** 视频时长候选（秒）。 */
export const VIDEO_DURATIONS = ['4', '5', '6', '7', '8', '10', '12']

/** 视频分辨率候选。 */
export const VIDEO_RESOLUTIONS = ['720P', '1080P']

/** 视频宽高比候选。 */
export const VIDEO_ASPECT_RATIOS = ['16:9', '9:16', '1:1', '4:3', '3:4']

/** 视频生成模式。 */
export type VideoMode = 'text' | 'keyframe' | 'reference'

/** 视频模式候选（顺序即界面顺序）。 */
const VIDEO_MODES = ['text', 'keyframe', 'reference'] as const

/** 模型选择器。 */
export interface ModelSelectorProps {
  /** 当前页签类型，决定标题文案与联动行为。 */
  kind: 'image' | 'video'
  /** 当前类型可用的模型表（id → 显示名）。 */
  models: Record<string, string>
  /** 当前选中的模型 id。 */
  value: string
  /** 当前图片尺寸，用于切换模型后校正到新白名单。 */
  imageSize: string
  onValueChange: (id: string) => void
  /** 仅 kind === 'image' 时调用。 */
  onSizesChange: (sizes: string[]) => void
  /** 仅 kind === 'image' 时调用。 */
  onImageSizeChange: (size: string) => void
}

/**
 * 模型下拉 + 免费/付费标记。
 * @param props - 数据与回调。
 */
export function ModelSelector(props: ModelSelectorProps): unknown {
  const { kind, models, value, imageSize, onValueChange, onSizesChange, onImageSizeChange } = props
  const displayName = models[value] || value
  const free = value.startsWith('agnes-')

  return createElement('div', { className: 'agnes-section' },
    createElement('div', { className: 'agnes-section-title' },
      kind === 'image' ? '🎨 图片模型' : '🎬 视频模型',
    ),
    createElement('select', {
      className: 'agnes-model-select',
      value,
      onChange: (e: Event) => {
        const val = (e.target as HTMLSelectElement).value
        onValueChange(val)
        if (kind === 'image') {
          const sizes = getImageSizeOptions(val)
          onSizesChange(sizes)
          if (sizes.length > 0 && !sizes.includes(imageSize)) onImageSizeChange(sizes[0])
        }
      },
    },
      ...Object.entries(models).map(([id, name]) =>
        createElement('option', { key: id, value: id }, name),
      ),
    ),
    createElement('div', { className: 'agnes-model-info' },
      free
        ? createElement('span', { className: 'agnes-model-tag agnes-model-tag-free' }, '🎉 免费')
        : createElement('span', { className: 'agnes-model-tag' }, '💎 付费'),
      createElement('span', { style: { marginLeft: '6px', fontSize: '12px', color: 'var(--ag-text-3, #6e80a3)' } }, displayName),
    ),
  )
}

/** 图片尺寸 + 宽高比选择器。 */
export interface SizeSelectorProps {
  /** 当前模型允许的尺寸白名单。 */
  sizes: string[]
  size: string
  onSizeChange: (size: string) => void
  ratio: string
  onRatioChange: (ratio: string) => void
}

/**
 * 尺寸宫格 + 宽高比宫格。
 * @param props - 数据与回调。
 */
export function SizeSelector(props: SizeSelectorProps): unknown {
  const { sizes, size, onSizeChange, ratio, onRatioChange } = props

  return createElement('div', { className: 'agnes-section' },
    createElement('div', { className: 'agnes-section-title' }, '📐 尺寸'),
    createElement('div', { className: 'agnes-size-grid' },
      ...sizes.map(s =>
        createElement('button', {
          key: s,
          className: `agnes-size-btn ${size === s ? 'active' : ''}`,
          onClick: () => onSizeChange(s),
        }, s.replace('x', '×')),
      ),
    ),
    createElement('div', { className: 'agnes-section-title', style: { marginTop: '12px' } }, '📏 宽高比'),
    createElement('div', { className: 'agnes-ratio-grid' },
      ...IMAGE_RATIOS.map(r =>
        createElement('button', {
          key: r,
          className: `agnes-ratio-btn ${ratio === r ? 'active' : ''}`,
          onClick: () => onRatioChange(r),
        }, r),
      ),
    ),
  )
}

/** 视频生成模式 + 首尾帧 + 分辨率 / 宽高比 / 时长。 */
export interface VideoModeSelectorProps {
  mode: VideoMode
  onModeChange: (mode: VideoMode) => void
  firstFrame: string
  lastFrame: string
  onUploadFrame: (target: 'first' | 'last') => void
  resolution: string
  onResolutionChange: (value: string) => void
  aspectRatio: string
  onAspectRatioChange: (value: string) => void
  duration: string
  onDurationChange: (value: string) => void
}

/** 三个小下拉统一的标签样式（原先内联重复了三次）。 */
const FIELD_LABEL_STYLE = { fontSize: '11px', color: 'var(--ag-text-3, #6e80a3)', marginBottom: '4px' }

/**
 * 视频模式选择器。
 * @param props - 数据与回调。
 */
export function VideoModeSelector(props: VideoModeSelectorProps): unknown {
  const {
    mode, onModeChange, firstFrame, lastFrame, onUploadFrame,
    resolution, onResolutionChange, aspectRatio, onAspectRatioChange,
    duration, onDurationChange,
  } = props

  return createElement('div', { className: 'agnes-section' },
    createElement('div', { className: 'agnes-section-title' }, '🎥 生成模式'),
    createElement('div', { className: 'agnes-mode-grid' },
      ...VIDEO_MODES.map(m =>
        createElement('button', {
          key: m,
          className: `agnes-mode-btn ${mode === m ? 'active' : ''}`,
          onClick: () => onModeChange(m),
        }, m === 'text' ? '📝 文生视频' : m === 'keyframe' ? '🖼 首尾帧' : '📷 参考图'),
      ),
    ),
    mode === 'keyframe' ? createElement('div', { className: 'agnes-frame-upload' },
      createElement('div', {
        className: `agnes-frame-item ${firstFrame ? 'has-image' : ''}`,
        onClick: () => onUploadFrame('first'),
      },
        firstFrame
          ? createElement('img', { src: firstFrame, alt: '首帧', style: { width: '100%', height: '100%', objectFit: 'cover' } })
          : '🖼 首帧',
      ),
      createElement('div', {
        className: `agnes-frame-item ${lastFrame ? 'has-image' : ''}`,
        onClick: () => onUploadFrame('last'),
      },
        lastFrame
          ? createElement('img', { src: lastFrame, alt: '尾帧', style: { width: '100%', height: '100%', objectFit: 'cover' } })
          : '🖼 尾帧（可选）',
      ),
    ) : null,
    createElement('div', { className: 'agnes-input-row', style: { marginTop: '8px' } },
      createElement('div', null,
        createElement('div', { style: FIELD_LABEL_STYLE }, '分辨率'),
        createElement('select', {
          className: 'agnes-select',
          value: resolution,
          onChange: (e: Event) => onResolutionChange((e.target as HTMLSelectElement).value),
        },
          ...VIDEO_RESOLUTIONS.map(r =>
            createElement('option', { key: r, value: r }, r),
          ),
        ),
      ),
      createElement('div', null,
        createElement('div', { style: FIELD_LABEL_STYLE }, '宽高比'),
        createElement('select', {
          className: 'agnes-select',
          value: aspectRatio,
          onChange: (e: Event) => onAspectRatioChange((e.target as HTMLSelectElement).value),
        },
          ...VIDEO_ASPECT_RATIOS.map(r =>
            createElement('option', { key: r, value: r }, r),
          ),
        ),
      ),
    ),
    createElement('div', { style: { marginTop: '8px' } },
      createElement('div', { style: FIELD_LABEL_STYLE }, '时长 (秒)'),
      createElement('select', {
        className: 'agnes-select',
        value: duration,
        onChange: (e: Event) => onDurationChange((e.target as HTMLSelectElement).value),
      },
        ...VIDEO_DURATIONS.map(d =>
          createElement('option', { key: d, value: d }, `${d} 秒`),
        ),
      ),
    ),
  )
}
