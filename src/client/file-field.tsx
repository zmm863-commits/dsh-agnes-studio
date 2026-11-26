/**
 * 文件选择控件 —— 替掉原生的 `<input type="file">`。
 *
 * 【为什么不用原生】原生按钮由浏览器渲染，文字跟着系统语言走：中文环境下是
 * 「选择文件 / 未选择文件」，英文环境下是 "Choose File / No file chosen"。
 * 同一个面板一半中文一半英文，而且那块浅色的原生按钮在深色玻璃界面里非常刺眼
 * —— 这正是"填写区和界面风格不搭"的主要来源之一。
 *
 * 这里用 label 包一个隐藏的 input：外观、文案、状态都由我们自己控制，
 * 域名（accept）与多选行为保持不变。
 */
import { createElement, useState } from './react-shim.ts'

/** 属性。 */
export interface FileFieldProps {
  /** 接受的文件类型，如 `audio/*`。 */
  accept?: string
  /** 是否多选。 */
  multiple?: boolean
  /** 按钮文案，默认「选择文件」。 */
  label?: string
  /** 空状态文案，默认「未选择文件」。 */
  emptyLabel?: string
  /** 选中后回调（拿到 File 列表）。 */
  onPick: (files: FileList) => void
}

/**
 * 深色玻璃风格的文件选择器。
 *
 * @param props - 类型限制、文案与回调。
 */
export function FileField(props: FileFieldProps): unknown {
  const [name, setName] = useState(props.emptyLabel ?? '未选择文件')

  return createElement('label', { className: 'agnes-file' },
    createElement('span', { className: 'agnes-file-btn' }, props.label ?? '选择文件'),
    createElement('span', { className: 'agnes-file-name', title: name }, name),
    createElement('input', {
      type: 'file',
      accept: props.accept,
      multiple: props.multiple,
      style: { display: 'none' },
      onChange: (e: { target: HTMLInputElement }) => {
        const files = e.target.files
        if (files === null || files.length === 0) {
          setName(props.emptyLabel ?? '未选择文件')
          return
        }
        setName(files.length > 1 ? `已选 ${files.length} 个文件` : files[0].name)
        props.onPick(files)
      },
    }),
  )
}
