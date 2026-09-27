/**
 * 模型管理页签。
 *
 * 从设置页里独立出来：自定义模型原先埋在设置页的第三组，而它其实是会**反复用到**
 * 的功能（加一个厂商模型、删掉不再用的）。独立成一页后，设置页只剩「凭据 + 关于」，
 * 这一页则同时回答「我现在能用哪些模型」—— 之前这个问题只能靠打开模型下拉才知道。
 *
 * 模型列表直接复用设置页的行样式（.agnes-setting-row / .agnes-badge），不新造视觉。
 * 「自定义」的判定沿用模型列表的命名约定：自定义项的显示名以 "(自定义)" 结尾。
 */
import { createElement } from './react-shim.ts'
import { vendorOf, type CustomModel } from './studio.ts'

/** 模型管理页的数据与回调。 */
export interface ModelsTabProps {
  /** 图片模型 id → 显示名（含自定义）。 */
  imageModels: Record<string, string>
  /** 视频模型 id → 显示名（含自定义）。 */
  videoModels: Record<string, string>
  /** 已添加的自定义模型（带来源地址，可删）。 */
  customModels: CustomModel[]
  onOpenAddModel: () => void
  onRemoveCustomModel: (modelId: string) => void
}

/** 显示名以 "(自定义)" 结尾即视为自加的模型。 */
function isCustom(name: string): boolean {
  return name.includes('(自定义)')
}

/**
 * 模型管理页签。
 * @param props - 模型表与增删回调。
 */
export function ModelsTab(props: ModelsTabProps): unknown {
  const { imageModels, videoModels, customModels, onOpenAddModel, onRemoveCustomModel } = props

  /** 一行一个模型：显示名 + 内置/自定义标记。 */
  const rows = (models: Record<string, string>): unknown[] =>
    Object.entries(models).map(([id, name]) =>
      createElement('div', { key: id, className: 'agnes-setting-row' },
        createElement('span', { className: 'agnes-setting-label' }, name),
        // 厂商徽章：模型 id 自带厂商前缀，但界面上只显示中文名，不标就看不出该配哪家的 Key
        createElement('span', { className: 'agnes-badge' }, vendorOf(id)),
        isCustom(name)
          ? createElement('span', { className: 'agnes-badge' }, '自定义')
          : createElement('span', { className: 'agnes-badge agnes-badge-free' }, '内置'),
      ),
    )

  return createElement('div', { className: 'agnes-settings' },
    createElement('div', { className: 'agnes-setting-group' },
      createElement('div', { className: 'agnes-setting-group-title' }, '🎨 图片模型'),
      ...rows(imageModels),
    ),

    createElement('div', { className: 'agnes-setting-group' },
      createElement('div', { className: 'agnes-setting-group-title' }, '🎬 视频模型'),
      ...rows(videoModels),
    ),

    createElement('div', { className: 'agnes-setting-group' },
      createElement('div', { className: 'agnes-setting-group-title' }, '🔧 自定义模型'),
      createElement('button', {
        className: 'agnes-btn agnes-btn-sm agnes-btn-primary',
        style: { marginBottom: '8px' },
        onClick: onOpenAddModel,
      }, '+ 添加模型'),
      customModels.length > 0
        ? createElement('div', { className: 'agnes-custom-model-list' },
            ...customModels.map(model =>
              createElement('div', { key: model.id, className: 'agnes-custom-model-item' },
                createElement('div', { className: 'agnes-custom-model-info' },
                  createElement('div', { className: 'agnes-custom-model-name' }, model.name),
                  createElement('div', { className: 'agnes-custom-model-meta' }, `${model.type} · ${model.base_url}`),
                ),
                createElement('button', {
                  className: 'agnes-btn agnes-btn-sm agnes-btn-ghost',
                  onClick: () => onRemoveCustomModel(model.id),
                }, '🗑'),
              ),
            ),
          )
        : createElement('div', { style: { fontSize: '12px', color: 'var(--ag-text-3, #6e80a3)', padding: '8px 0' } },
            '暂无自定义模型。添加后可在模型选择器里直接选用。',
          ),
    ),
  )
}
