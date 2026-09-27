/**
 * 设置页签 + 「添加自定义模型」弹窗。
 *
 * 由 panel.tsx 内联的 renderSettings / renderAddModelModal 拆出。
 *
 * 设计约束：**纯展示组件**。
 * 它不调用 addCustomModel / removeCustomModel，也不重建模型列表 —— 这些副作用
 * 由 panel 通过 onRemoveCustomModel / onConfirm 回调注入。这样设置页的外观可以
 * 独立修改，而不会牵动 StudioPanel 的业务逻辑；也避免了两处各自维护一份
 * 「自定义模型 → 模型列表」的同步代码。
 */
import { createElement } from './react-shim.ts'
import { AGNES_DOCS_URL, AGNES_PLATFORM_URL, PRODUCT_NAME } from './constants.ts'
import type { KeyStatus } from './studio.ts'

/** 厂商凭据探测结果。 */
export interface VendorStatus {
  configured: boolean
  source: string | null
}

/** 设置页需要的全部数据与回调。 */
export interface SettingsTabProps {
  vendorStatus: Record<string, VendorStatus>
  checkingKey: boolean
  onRecheckKey: () => void
  guideOpen: boolean
  onToggleGuide: () => void
  keyStatus: KeyStatus
}

/** 添加自定义模型弹窗的表单草稿。 */
export interface NewModelDraft {
  id: string
  name: string
  type: 'text' | 'image' | 'video'
  base_url: string
  api_key: string
}

/** 弹窗的数据与回调。 */
export interface AddModelModalProps {
  open: boolean
  draft: NewModelDraft
  onDraftChange: (next: NewModelDraft) => void
  onClose: () => void
  onConfirm: () => void
}

/**
 * 设置页签：API Key 状态 / 配置指南 / 自定义模型 / 关于。
 * @param props - 数据与回调。
 */
export function SettingsTab(props: SettingsTabProps): unknown {
  const {
    vendorStatus, checkingKey, onRecheckKey, guideOpen, onToggleGuide,
    keyStatus,
  } = props

  return createElement('div', { className: 'agnes-settings' },
    createElement('div', { className: 'agnes-setting-group' },
      createElement('div', { className: 'agnes-setting-group-title' }, '🔑 API Key 状态'),
      ...Object.entries(vendorStatus).map(([vendor, status]) =>
        createElement('div', { key: vendor, className: 'agnes-setting-row' },
          createElement('span', { className: 'agnes-setting-label' }, vendor.charAt(0).toUpperCase() + vendor.slice(1)),
          createElement('span', {
            className: status.configured ? 'agnes-badge agnes-badge-free' : 'agnes-badge agnes-badge-error',
          }, status.configured ? '✅ 已配置' : '❌ 未配置'),
        ),
      ),
      Object.keys(vendorStatus).length === 0
        ? createElement('div', { className: 'agnes-setting-row' },
            createElement('span', { className: 'agnes-setting-label', style: { color: 'var(--ag-text-3, #6e80a3)' } }, '暂无厂商信息，点击下方按钮检测'),
          )
        : null,
      createElement('button', {
        className: 'agnes-btn agnes-btn-sm agnes-btn-ghost agnes-btn-full',
        style: { marginTop: '8px' },
        disabled: checkingKey,
        onClick: onRecheckKey,
      }, checkingKey ? '⏳ 检测中…' : '🔄 重新检测 Key'),
    ),

    createElement('div', { className: 'agnes-setting-group' },
      createElement('div', { className: 'agnes-setting-group-title' }, '📖 配置指南'),
      createElement('div', { style: { fontSize: '12px', color: 'var(--ag-text-3, #6e80a3)', lineHeight: '1.6', marginBottom: '8px' } },
        '如需使用付费模型，请在对应厂商平台获取 API Key 并配置到 DSH。',
      ),
      createElement('div', { style: { display: 'flex', gap: '6px', flexWrap: 'wrap' } },
        createElement('a', {
          className: 'agnes-btn agnes-btn-sm agnes-btn-secondary',
          href: AGNES_PLATFORM_URL,
          target: '_blank',
          rel: 'noopener noreferrer',
        }, '🌐 Agnes 平台'),
        createElement('a', {
          className: 'agnes-btn agnes-btn-sm agnes-btn-secondary',
          href: AGNES_DOCS_URL,
          target: '_blank',
          rel: 'noopener noreferrer',
        }, '📖 文档'),
      ),
      createElement('div', { style: { marginTop: '8px' } },
        createElement('button', {
          className: 'agnes-btn agnes-btn-sm agnes-btn-ghost agnes-btn-full',
          onClick: onToggleGuide,
        }, guideOpen ? '收起 Key 指引' : '🔑 首次使用？如何获取 / 配置 Key'),
      ),
    ),

    createElement('div', { className: 'agnes-setting-group' },
      createElement('div', { className: 'agnes-setting-group-title' }, '🔧 模型管理'),
      createElement('div', { style: { fontSize: '12px', color: 'var(--ag-text-3, #6e80a3)', lineHeight: '1.6' } },
        '模型清单与自定义模型的增删，已移到左侧导航「配置 → 模型」。',
      ),
    ),

    createElement('div', { className: 'agnes-setting-group' },
      createElement('div', { className: 'agnes-setting-group-title' }, 'ℹ️ 关于'),
      createElement('div', { style: { fontSize: '12px', color: 'var(--ag-text-3, #6e80a3)', lineHeight: '1.6' } },
        createElement('div', null, `版本: ${PRODUCT_NAME}`),
        createElement('div', null, '🎨 支持多家厂商图片/视频生成'),
        createElement('div', null, '📐 每个模型有独立的尺寸白名单'),
        createElement('div', null, '🔧 可添加自定义 API 兼容模型'),
        createElement('div', { style: { marginTop: '6px' } },
          keyStatus === 'ready' ? '🔑 Agnes API Key：已配置'
            : keyStatus === 'missing' ? '🔑 Agnes API Key：未配置'
              : '🔑 Agnes API Key：未检测',
        ),
      ),
    ),
  )
}

/**
 * 「添加自定义模型」弹窗。未打开时返回 null。
 * @param props - 草稿、变更回调与提交/关闭回调。
 */
export function AddModelModal(props: AddModelModalProps): unknown {
  const { open, draft, onDraftChange, onClose, onConfirm } = props
  if (!open) return null

  return createElement('div', {
    className: 'agnes-modal-backdrop',
    onClick: onClose,
  }, createElement('div', {
    className: 'agnes-modal',
    onClick: (e: Event) => e.stopPropagation(),
  },
    createElement('div', { className: 'agnes-modal-header' },
      createElement('span', null, '添加自定义模型'),
      createElement('button', {
        className: 'agnes-btn agnes-btn-sm agnes-btn-ghost',
        onClick: onClose,
      }, '✕'),
    ),
    createElement('div', { className: 'agnes-modal-body' },
      createElement('div', { className: 'agnes-form-group' },
        createElement('label', { className: 'agnes-form-label' }, '模型 ID'),
        createElement('input', {
          className: 'agnes-form-input',
          value: draft.id,
          onChange: (e: Event) => onDraftChange({ ...draft, id: (e.target as HTMLInputElement).value }),
          placeholder: '如 custom-image-1',
        }),
      ),
      createElement('div', { className: 'agnes-form-group' },
        createElement('label', { className: 'agnes-form-label' }, '显示名称'),
        createElement('input', {
          className: 'agnes-form-input',
          value: draft.name,
          onChange: (e: Event) => onDraftChange({ ...draft, name: (e.target as HTMLInputElement).value }),
          placeholder: '如 My Custom Image Model',
        }),
      ),
      createElement('div', { className: 'agnes-form-group' },
        createElement('label', { className: 'agnes-form-label' }, '类型'),
        createElement('select', {
          className: 'agnes-form-select',
          value: draft.type,
          onChange: (e: Event) => onDraftChange({ ...draft, type: (e.target as HTMLSelectElement).value as 'text' | 'image' | 'video' }),
        },
          createElement('option', { value: 'image' }, '图片'),
          createElement('option', { value: 'video' }, '视频'),
          createElement('option', { value: 'text' }, '文本'),
        ),
      ),
      createElement('div', { className: 'agnes-form-group' },
        createElement('label', { className: 'agnes-form-label' }, 'API Base URL'),
        createElement('input', {
          className: 'agnes-form-input',
          value: draft.base_url,
          onChange: (e: Event) => onDraftChange({ ...draft, base_url: (e.target as HTMLInputElement).value }),
          placeholder: 'https://api.example.com/v1',
        }),
      ),
      createElement('div', { className: 'agnes-form-group' },
        createElement('label', { className: 'agnes-form-label' }, 'API Key（可选）'),
        createElement('input', {
          className: 'agnes-form-input',
          value: draft.api_key,
          onChange: (e: Event) => onDraftChange({ ...draft, api_key: (e.target as HTMLInputElement).value }),
          placeholder: 'sk-...',
          type: 'password',
        }),
      ),
    ),
    createElement('div', { className: 'agnes-modal-footer' },
      createElement('button', {
        className: 'agnes-btn agnes-btn-secondary',
        onClick: onClose,
      }, '取消'),
      createElement('button', {
        className: 'agnes-btn agnes-btn-primary',
        onClick: onConfirm,
      }, '添加'),
    ),
  ))
}
