/**
 * 分批拆分 + 去 AI 味面板
 * 功能：导入小说、AI 拆分章节、去 AI 味处理
 */

import { React, useState, useEffect, useCallback, createElement } from './react-shim.ts'
import { StudioSplit } from './split-layout.tsx'

// ─── 类型定义 ──────────────────────────────────────────────────────────────

interface SplitTask {
  id: string
  status: 'pending' | 'running' | 'completed' | 'failed' | 'stopped'
  message: string
  source: string
  n_eps: number
  eps: number
  words: number
  title: string
  created_at: number
  updated_at: number
}

interface DeaiTask {
  id: string
  status: 'pending' | 'running' | 'completed' | 'failed' | 'stopped'
  message: string
  text: string
  op: 'light' | 'medium' | 'heavy'
  model: string
  result?: string
  created_at: number
  updated_at: number
}

// ─── API 调用 ──────────────────────────────────────────────────────────────

const API_SPLIT = '/agnes-studio/api/novel-split'
const API_DEAI = '/agnes-studio/api/deai'

async function apiCall<T>(baseUrl: string, method: string, path: string, body?: unknown): Promise<T> {
  const resp = await fetch(`${baseUrl}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = await resp.json().catch(() => ({}))
  if (!resp.ok || data?.error) throw new Error(data?.error || `请求失败（HTTP ${resp.status}）`)
  return data as T
}

// ─── 组件 ──────────────────────────────────────────────────────────────────

export function NovelSplitPanel() {
  const [activeTab, setActiveTab] = useState<'split' | 'deai'>('split')

  return createElement('div', { className: 'novel-split-page' },
    // 标题
    createElement('div', { className: 'novel-split-header' },
      createElement('h3', null, '小说工具'),
      createElement('p', { className: 'novel-split-desc' }, '分批拆分 + 去 AI 味'),
    ),

    // 页签切换
    createElement('div', { className: 'novel-split-tabs' },
      createElement('button', {
        className: `novel-split-tab ${activeTab === 'split' ? 'active' : ''}`,
        onClick: () => setActiveTab('split'),
      }, '分批拆分'),
      createElement('button', {
        className: `novel-split-tab ${activeTab === 'deai' ? 'active' : ''}`,
        onClick: () => setActiveTab('deai'),
      }, '去 AI 味'),
    ),

    // 内容
    activeTab === 'split'
      ? createElement(SplitPanel)
      : createElement(DeaiPanel),
  )
}

// ─── 分批拆分面板 ──────────────────────────────────────────────────────────

function SplitPanel() {
  const [sourceText, setSourceText] = useState('')
  const [nEps, setNEps] = useState(10)
  const [currentTask, setCurrentTask] = useState<SplitTask | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // 启动拆分
  const handleStart = useCallback(async () => {
    if (!sourceText.trim()) {
      setError('请输入小说内容')
      return
    }

    setLoading(true)
    setError('')

    try {
      const data = await apiCall<{ id: string }>(API_SPLIT, 'POST', '/start', {
        source: sourceText,
        n_eps: nEps,
      })

      // 轮询状态
      const pollStatus = async () => {
        const statusData = await apiCall<{ task: SplitTask }>(API_SPLIT, 'GET', `/status/${data.id}`)
        setCurrentTask(statusData.task)
        if (statusData.task.status === 'completed') {
          setLoading(false)
        } else if (statusData.task.status === 'failed' || statusData.task.status === 'stopped') {
          setLoading(false)
          setError(statusData.task.message)
        } else {
          setTimeout(pollStatus, 1000)
        }
      }
      pollStatus()
    } catch (e) {
      setError(e instanceof Error ? e.message : '启动失败')
      setLoading(false)
    }
  }, [sourceText, nEps])

  // 停止任务
  const handleStop = useCallback(async () => {
    if (!currentTask) return
    try {
      await apiCall(API_SPLIT, 'POST', `/stop/${currentTask.id}`)
      setCurrentTask(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : '停止失败')
    }
  }, [currentTask])

  return createElement(StudioSplit, {
    title: '分批拆分',
    desc: '按章节真切，再按字数均摊成集；每集写成一个 md 文件。',
    params: [
      error && createElement('div', { className: 'split-error' }, error),

      // 输入区域
      createElement('div', { className: 'split-section' },
        createElement('h4', null, '小说全文或文件路径'),
        createElement('div', { className: 'split-form' },
          createElement('textarea', {
            value: sourceText,
            onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => setSourceText(e.target.value),
            placeholder: '粘贴小说内容，或直接填 /path/to/novel.txt',
            rows: 8,
          }),
          createElement('label', { className: 'split-label' },
            '拆分集数',
            createElement('input', { type: 'number', value: nEps, onChange: (e: React.ChangeEvent<HTMLInputElement>) => setNEps(Number(e.target.value)), min: 2, max: 50 }),
          ),
        ),
      ),

      // 操作按钮
      createElement('div', { className: 'split-actions' },
        createElement('button', {
          className: 'split-btn split-btn-primary',
          onClick: handleStart,
          disabled: loading || !sourceText.trim(),
        }, loading ? '拆分中...' : '开始拆分'),
        currentTask && createElement('button', {
          className: 'split-btn split-btn-danger',
          onClick: handleStop,
        }, '停止'),
      ),
    ],
    children: [
      // 当前任务状态
      currentTask !== null && createElement('div', { className: 'split-status' },
        createElement('div', { className: 'split-status-header' },
          createElement('span', null, `任务 ${currentTask.id}`),
          createElement('span', { className: `split-badge split-badge-${currentTask.status}` },
            currentTask.status === 'running' ? '拆分中' :
            currentTask.status === 'completed' ? '已完成' :
            currentTask.status === 'failed' ? '失败' : '已停止'),
        ),
        createElement('p', null, currentTask.message),
        createElement('p', null, `已拆 ${currentTask.eps}/${currentTask.n_eps} 集`),
      ),

      // 拆分结果
      currentTask?.status === 'completed' && createElement('div', { className: 'split-section' },
        createElement('h4', null, '拆分结果'),
        createElement('div', { className: 'split-result' },
          createElement('p', null, `共拆分 ${currentTask.n_eps} 集`),
          createElement('p', null, `总字数：${currentTask.words}`),
        ),
      ),

      currentTask === null && createElement('div', { className: 'agnes-empty' },
        '拆好的每一集都会写成 md 文件。填好右侧参数后点「开始拆分」，进度会显示在这里。'),
    ],
  })
}

// ─── 去 AI 味面板 ──────────────────────────────────────────────────────────

function DeaiPanel() {
  const [inputText, setInputText] = useState('')
  const [op, setOp] = useState<'light' | 'medium' | 'heavy'>('medium')
  const [currentTask, setCurrentTask] = useState<DeaiTask | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // 启动去 AI 味
  const handleStart = useCallback(async () => {
    if (!inputText.trim()) {
      setError('请输入文本内容')
      return
    }

    setLoading(true)
    setError('')

    try {
      const data = await apiCall<{ tid: string }>(API_DEAI, 'POST', '/process', {
        text: inputText,
        op,
      })

      // 轮询状态
      const pollStatus = async () => {
        const statusData = await apiCall<{ status: string; message: string; text?: string }>(API_DEAI, 'GET', `/status/${data.tid}`)
        if (statusData.status === 'completed') {
          setLoading(false)
          setError('处理完成')
        } else if (statusData.status === 'failed' || statusData.status === 'stopped') {
          setLoading(false)
          setError(statusData.message)
        } else {
          setTimeout(pollStatus, 1000)
        }
      }
      pollStatus()
    } catch (e) {
      setError(e instanceof Error ? e.message : '启动失败')
      setLoading(false)
    }
  }, [inputText, op])

  return createElement(StudioSplit, {
    title: '去 AI 味',
    desc: '分块送文本模型改写，三档强度；结果整段返回。',
    params: [
      error && createElement('div', { className: 'deai-error' }, error),

      // 输入区域
      createElement('div', { className: 'deai-section' },
        createElement('h4', null, '待处理文本'),
        createElement('div', { className: 'deai-form' },
          createElement('textarea', {
            value: inputText,
            onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => setInputText(e.target.value),
            placeholder: '粘贴需要去 AI 味的文本...',
            rows: 8,
          }),
          createElement('label', { className: 'deai-label' },
            '处理模式',
            createElement('select', { value: op, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => setOp(e.target.value as 'light' | 'medium' | 'heavy') },
              createElement('option', { value: 'light' }, '轻度（去除明显 AI 痕迹）'),
              createElement('option', { value: 'medium' }, '中度（重写更自然）'),
              createElement('option', { value: 'heavy' }, '重度（彻底重写）'),
            ),
          ),
        ),
      ),

      // 操作按钮
      createElement('div', { className: 'deai-actions' },
        createElement('button', {
          className: 'deai-btn deai-btn-primary',
          onClick: handleStart,
          disabled: loading || !inputText.trim(),
        }, loading ? '处理中...' : '开始处理'),
      ),
    ],
    children: [
      // 当前任务状态
      currentTask !== null && createElement('div', { className: 'deai-status' },
        createElement('div', { className: 'deai-status-header' },
          createElement('span', null, `任务 ${currentTask.id}`),
          createElement('span', { className: `deai-badge deai-badge-${currentTask.status}` },
            currentTask.status === 'running' ? '处理中' :
            currentTask.status === 'completed' ? '已完成' :
            currentTask.status === 'failed' ? '失败' : '已停止'),
        ),
        createElement('p', null, currentTask.message),
      ),

      // 处理结果
      currentTask?.status === 'completed' && createElement('div', { className: 'deai-section' },
        createElement('h4', null, '处理结果'),
        createElement('div', { className: 'deai-result' },
          createElement('textarea', {
            value: currentTask.result || '',
            readOnly: true,
            rows: 8,
          }),
        ),
      ),

      currentTask === null && createElement('div', { className: 'agnes-empty' },
        '改写结果会整段显示在这里，可直接全选复制。'),
    ],
  })
}
