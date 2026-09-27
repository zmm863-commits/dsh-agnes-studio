/**
 * 面板可见性状态（进程内小 store）。
 *
 * 面板本身现在由 DSH 的 slot 渲染树渲染（见 seat.tsx 的说明），而侧边栏入口
 * 是命令式 DOM 注入的，两者需要一个共享的开关 —— 就是这个小 store。
 */

let visible = false
const listeners = new Set<() => void>()

/** 当前面板是否打开。 */
export function isPanelVisible(): boolean {
  return visible
}

/** 订阅开关变化，返回退订函数。 */
export function subscribePanel(listener: () => void): () => void {
  listeners.add(listener)
  return () => { listeners.delete(listener) }
}

function emit(): void {
  for (const listener of [...listeners]) {
    try {
      listener()
    } catch (error) {
      console.error('[dsh-agnes-studio] panel listener failed:', error)
    }
  }
}

/** 打开面板。 */
export function showPanel(): void {
  if (visible) return
  visible = true
  emit()
}

/** 关闭面板。 */
export function hidePanel(): void {
  if (!visible) return
  visible = false
  emit()
}

/** 切换面板。 */
export function togglePanel(): void {
  if (visible) hidePanel()
  else showPanel()
}
