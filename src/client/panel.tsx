/**
 * Agnes Creative Studio — Main Panel Component
 *
 * Multi-vendor AI creative studio panel supporting image, video, storyboard,
 * and settings tabs. Uses plain React.createElement (no JSX). React is
 * resolved from DSH's client module loader.
 */

import { React, shellRequire, useState, useEffect, useCallback, useRef, createElement } from './react-shim.ts'

import { injectStyles } from './styles.ts'
import { generateImage, generateVideo, pollVideoStatus, fetchKeyStatus, fetchModels, generateProjectId, saveProject, listProjects, deleteProject, getCustomModels, addCustomModel, removeCustomModel, IMAGE_MODEL_OPTIONS, VIDEO_MODEL_OPTIONS, TEXT_MODEL_OPTIONS, type KeyStatus, type StudioProject, type CustomModel, type GenHistoryItem, listHistory, pushHistory } from './studio.ts'
import { parseScript, isSupportedScript } from './import.ts'
import { PromptExpertPanel } from './prompt-expert-panel.tsx'
import { AnchorPanel } from './anchor-panel.tsx'
import { CanvasPanel } from './canvas-panel.tsx'
import { CoverPanel } from './cover-panel.tsx'
import { SettingsTab, AddModelModal } from './settings-tab.tsx'
import { PanelTitlebar, KeyGuide, NavRail } from './panel-chrome.tsx'
import { ImageVideoWorkspace } from './image-video-workspace.tsx'
import {
  PANEL_SIZE_KEY, PANEL_SIZE_ORDER, PARAMS_OPEN_KEY, resolvePanelSize, resolveParamsOpen, type PanelSize,
} from './constants.ts'
import { ModelsTab } from './models-tab.tsx'
import { OhStoryPanel } from './ohstory-panel.tsx'

/**
 * Mount a component into a container with React 18's createRoot.
 * @returns a disposer unmounting the tree.
 */
export function mountReact(
  container: HTMLElement,
  Component: (props: PanelProps) => unknown,
  props: PanelProps,
): () => void {
  if (React === null) {
    throw new Error('[dsh-agnes-studio] React runtime is not available from the shell')
  }
  const ReactDOM = shellRequire('react-dom/client')
  if (ReactDOM?.createRoot === undefined) {
    throw new Error('[dsh-agnes-studio] react-dom/client is not available from the shell')
  }
  const root = ReactDOM.createRoot(container)
  root.render(createElement(Component, props))
  return () => { root.unmount() }
}

/** Panel props. */
interface PanelProps {
  onClose: () => void
  /** 向当前会话发一条提示词（由槽位 inject 注入；拿不到时为 undefined）。 */
  sendTask?: (text: string) => void
}

/** Tab type. */



/** Theme choice: 'auto' follows the DSH shell, or an explicit override. */
type ThemeChoice = 'auto' | 'light' | 'dark'
const THEME_KEY = 'agnes-theme'

/** Read the shell's own background luminance to decide light vs dark. */
function detectShellTheme(): 'light' | 'dark' {
  try {
    const cs = getComputedStyle(document.body)
    const raw = cs.getPropertyValue('--dsw-alias-bg-layer-1').trim() || cs.backgroundColor
    const m = /rgba?\(([^)]+)\)/.exec(raw)
    if (!m) return 'dark'
    const [r, g, b] = m[1].split(',').map(Number)
    const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255
    return lum > 0.5 ? 'light' : 'dark'
  } catch { return 'dark' }
}

function resolveTheme(choice: ThemeChoice): 'light' | 'dark' {
  if (choice === 'light' || choice === 'dark') return choice
  try {
    const saved = localStorage?.getItem(THEME_KEY)
    if (saved === 'light' || saved === 'dark') return saved
  } catch { /* ignore */ }
  // Default to the bright "tech" skin; users can switch to dark in the header.
  return 'light'
}

type TabType =
  | 'image' | 'video' | 'storyboard'
  | 'anchor' | 'canvas' | 'cover'
  | 'expert' | 'models' | 'settings'
  | 'ohstory'



/** True when an error message means "no/invalid API key" rather than a build error. */
function looksLikeKeyProblem(message: string): boolean {
  return message.includes('未配置')
    || message.includes('agnes-api-key')
    || /\b401\b/.test(message)
    || /invalid api key|api key is invalid|unauthorized|no api key/i.test(message)
}

/** Main panel component. */
export function StudioPanel({ onClose, sendTask }: PanelProps) {
  injectStyles()

  // ── Core state ─────────────────────────────────────────────────────────
  const [tab, setTab] = useState<TabType>('image')
  // Light/dark are BOTH supported; this only picks the starting one.
  const [theme, setTheme] = useState<'light' | 'dark'>(() => resolveTheme('auto'))
  const [panelSize, setPanelSize] = useState<PanelSize>(() => resolvePanelSize())
  const [paramsOpen, setParamsOpen] = useState<boolean>(() => resolveParamsOpen())
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingText, setLoadingText] = useState('')
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<{ type: 'image' | 'video'; url: string } | null>(null)
  const [error, setError] = useState('')
  /** 生成历史（localStorage 持久化）。 */
  const [history, setHistory] = useState<GenHistoryItem[]>(() => listHistory())
  /** 中性提示（如「已停止等待」）—— 不是错误，别用 setError 显示。 */
  const [notice, setNotice] = useState('')

  // ── Reference images ───────────────────────────────────────────────────
  const [refImages, setRefImages] = useState<string[]>([])

  // ── Model selection ────────────────────────────────────────────────────
  const [selectedImageModel, setSelectedImageModel] = useState('agnes-image-2.5-flash')
  const [selectedVideoModel, setSelectedVideoModel] = useState('agnes-video-2.5-flash')
  const [availableImageSizes, setAvailableImageSizes] = useState<string[]>(['1024x1024', '1024x768', '768x1024', '1280x720', '720x1280'])
  const [imageSize, setImageSize] = useState('1024x1024')
  const [imageRatio, setImageRatio] = useState('16:9')
  const [videoDuration, setVideoDuration] = useState('5')

  // ── Model lists (from Host + custom) ───────────────────────────────────
  const [imageModels, setImageModels] = useState<Record<string, string>>(IMAGE_MODEL_OPTIONS)
  const [videoModels, setVideoModels] = useState<Record<string, string>>(VIDEO_MODEL_OPTIONS)

  // ── Vendor key status ──────────────────────────────────────────────────
  const [vendorStatus, setVendorStatus] = useState<Record<string, { configured: boolean; source: string | null }>>({})

  // ── Custom models ──────────────────────────────────────────────────────
  const [customModels, setCustomModels] = useState<CustomModel[]>([])
  const [showAddModelModal, setShowAddModelModal] = useState(false)
  const [newModel, setNewModel] = useState<{ id: string; name: string; type: 'text' | 'image' | 'video'; base_url: string; api_key: string }>({
    id: '', name: '', type: 'image', base_url: '', api_key: '',
  })

  // ── Video mode ─────────────────────────────────────────────────────────
  const [videoMode, setVideoMode] = useState<'text' | 'keyframe' | 'reference'>('text')
  const [firstFrame, setFirstFrame] = useState<string>('')
  const [lastFrame, setLastFrame] = useState<string>('')
  const [videoResolution, setVideoResolution] = useState('720P')
  const [videoAspectRatio, setVideoAspectRatio] = useState('16:9')

  // ── Storyboard ─────────────────────────────────────────────────────────
  const [project, setProject] = useState<StudioProject | null>(null)
  const [selectedScene, setSelectedScene] = useState<number>(0)
  const [projects, setProjects] = useState<StudioProject[]>([])

  // ── Drag state ─────────────────────────────────────────────────────────
  const [dragging, setDragging] = useState(false)
  const dragOrigin = useRef<{ x: number; y: number; left: number; top: number } | null>(null)
  /**
   * 视频生成的轮询取消标记。置 true 后，下一次 tick 跳出轮询循环。
   * 注意：只停「等待」，不撤销已经在平台侧跑起来的任务 —— 文案里要讲清楚。
   */
  const cancelRef = useRef(false)
  const panelRef = useRef<HTMLDivElement>(null)

  // ── API key onboarding ─────────────────────────────────────────────────
  const [keyStatus, setKeyStatus] = useState<KeyStatus>('unknown')
  const [guideOpen, setGuideOpen] = useState(false)
  const [checkingKey, setCheckingKey] = useState(false)

  // ── Initialization ─────────────────────────────────────────────────────
  useEffect(() => {
    setProjects(listProjects())
    setCustomModels(getCustomModels())

    // Fetch available models from Host
    fetchModels().then(models => {
      const custom = getCustomModels()
      const imgModels = { ...models.image }
      const vidModels = { ...models.video }
      custom.forEach(m => {
        if (m.type === 'image') imgModels[m.id] = `${m.name} (自定义)`
        if (m.type === 'video') vidModels[m.id] = `${m.name} (自定义)`
      })
      setImageModels(imgModels)
      setVideoModels(vidModels)
    }).catch(() => {})

    // Fetch vendor key status
    fetchKeyStatus().then(status => {
      if (status.vendors) setVendorStatus(status.vendors)
    }).catch(() => {})
  }, [])

  const checkKey = useCallback(async (openWhenMissing: boolean) => {
    setCheckingKey(true)
    const status = await fetchKeyStatus()
    setKeyStatus(status.configured ? 'ready' : 'missing')
    if (!status.configured && openWhenMissing) setGuideOpen(true)
    if (status.vendors) setVendorStatus(status.vendors)
    setCheckingKey(false)
  }, [])

  useEffect(() => { void checkKey(true) }, [checkKey])

  // ── Drag handlers ──────────────────────────────────────────────────────
  const onDragStart = useCallback((e: MouseEvent) => {
    const panel = panelRef.current
    if (panel === null) return
    const target = e.target as HTMLElement | null
    if (target !== null && typeof target.closest === 'function'
      && target.closest('button, input, select, textarea, a, [data-no-drag]') !== null) return
    const rect = panel.getBoundingClientRect()
    panel.style.left = rect.left + 'px'
    panel.style.top = rect.top + 'px'
    panel.style.transform = 'none'
    dragOrigin.current = { x: e.clientX, y: e.clientY, left: rect.left, top: rect.top }
    setDragging(true)
  }, [])

  useEffect(() => {
    if (!dragging) return
    const onMove = (e: MouseEvent) => {
      const panel = panelRef.current
      const origin = dragOrigin.current
      if (panel === null || origin === null) return
      const width = panel.offsetWidth
      const lower = 200 - width
      const upper = Math.max(window.innerWidth - width, lower)
      const nextLeft = Math.min(Math.max(origin.left + e.clientX - origin.x, lower), upper)
      const nextTop = Math.min(Math.max(origin.top + e.clientY - origin.y, 0), Math.max(0, window.innerHeight - 60))
      panel.style.left = nextLeft + 'px'
      panel.style.top = nextTop + 'px'
    }
    const onUp = () => {
      dragOrigin.current = null
      setDragging(false)
    }
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
    return () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
    }
  }, [dragging])

  // ── Image generation ───────────────────────────────────────────────────
  const handleGenerateImage = useCallback(async () => {
    if (!prompt.trim() || loading) return
    setLoading(true)
    setLoadingText('✨ 生成图片中...')
    setProgress(0)
    setError('')
    setNotice('')
    setResult(null)

    try {
      const progressTimer = setInterval(() => {
        setProgress(p => Math.min(p + 8, 90))
      }, 500)

      const resp = await generateImage({
        prompt: prompt.trim(),
        model: selectedImageModel,
        size: imageSize,
        ratio: imageRatio,
        images: refImages.length > 0 ? refImages : undefined,
      })

      clearInterval(progressTimer)
      setProgress(100)
      setResult({ type: 'image', url: resp.url })
      setHistory(pushHistory({ type: 'image', url: resp.url, prompt: prompt.trim(), model: selectedImageModel }))

      if (project) {
        const scenes = [...project.scenes]
        if (scenes[selectedScene]) {
          scenes[selectedScene] = { ...scenes[selectedScene], imageUrl: resp.url, status: 'done' }
          const updated = { ...project, scenes, updatedAt: Date.now() }
          setProject(updated)
          saveProject(updated)
          setProjects(listProjects())
          // 回写是静默的，用户不知道结果已经进了项目 —— 说一声
          setNotice(`已写入「场景 ${selectedScene + 1}」`)
        }
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : '图片生成失败'
      setError(message)
      if (looksLikeKeyProblem(message)) {
        setKeyStatus('missing')
        setGuideOpen(true)
      }
    } finally {
      setLoading(false)
      setLoadingText('')
    }
  }, [prompt, selectedImageModel, imageSize, imageRatio, refImages, loading, project, selectedScene])

  // ── Video generation ───────────────────────────────────────────────────
  const handleGenerateVideo = useCallback(async () => {
    if (!prompt.trim() || loading) return
    setLoading(true)
    setLoadingText('🎬 提交视频任务...')
    setProgress(0)
    setError('')
    setResult(null)

    try {
      const resp = await generateVideo({
        prompt: prompt.trim(),
        model: selectedVideoModel,
        mode: videoMode,
        seconds: videoDuration,
        size: videoResolution,
        aspectRatio: videoAspectRatio,
        firstFrame: videoMode === 'keyframe' ? firstFrame : undefined,
        lastFrame: videoMode === 'keyframe' ? lastFrame : undefined,
        images: videoMode === 'reference' ? refImages : undefined,
      })

      setLoadingText('🔄 视频生成中...')

      let attempts = 0
      const maxAttempts = 180
      cancelRef.current = false
      while (attempts < maxAttempts) {
        await new Promise(r => setTimeout(r, 3000))
        if (cancelRef.current) {
          // 只是不再等它；平台侧的任务可能还在跑，所以措辞要准确
          setNotice('已停止等待。任务可能仍在平台侧生成，稍后可从平台查看。')
          break
        }
        attempts++

        const status = await pollVideoStatus(resp.videoId)
        setProgress(Math.min(status.progress || 0, 99))

        if (status.status === 'completed' && status.url) {
          setProgress(100)
          setResult({ type: 'video', url: status.url })
          setHistory(pushHistory({ type: 'video', url: status.url, prompt: prompt.trim(), model: selectedVideoModel }))

          if (project) {
            const scenes = [...project.scenes]
            if (scenes[selectedScene]) {
              scenes[selectedScene] = { ...scenes[selectedScene], videoUrl: status.url, status: 'done' }
              // 同上：回写要有个回执
              setNotice(`已写入「场景 ${selectedScene + 1}」`)
              const updated = { ...project, scenes, updatedAt: Date.now() }
              setProject(updated)
              saveProject(updated)
              setProjects(listProjects())
            }
          }
          break
        }

        if (status.status === 'failed') {
          throw new Error(status.error || '视频生成失败')
        }

        setLoadingText(`🔄 视频生成中... ${status.progress || 0}%`)
      }

      if (attempts >= maxAttempts) {
        throw new Error('视频生成超时')
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : '视频生成失败'
      setError(message)
      if (looksLikeKeyProblem(message)) {
        setKeyStatus('missing')
        setGuideOpen(true)
      }
    } finally {
      setLoading(false)
      setLoadingText('')
    }
  }, [prompt, selectedVideoModel, videoMode, videoDuration, videoResolution, videoAspectRatio, firstFrame, lastFrame, refImages, loading, project, selectedScene])

  // ── Script import ──────────────────────────────────────────────────────
  const handleImport = useCallback(() => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.txt,.md,.markdown,.json'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      if (!isSupportedScript(file.name)) {
        setError('不支持的文件格式。支持 .txt, .md, .json')
        return
      }

      const reader = new FileReader()
      reader.onload = (ev) => {
        const content = ev.target?.result as string
        if (!content) return

        try {
          const scenes = parseScript(file.name, content)
          if (scenes.length === 0) {
            setError('未能从文件中解析出任何场景')
            return
          }

          const newProject: StudioProject = {
            id: generateProjectId(),
            name: file.name.replace(/\.[^.]+$/, ''),
            scenes,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          }

          setProject(newProject)
          setSelectedScene(0)
          saveProject(newProject)
          setProjects(listProjects())
          setTab('storyboard')
          setError('')
        } catch (e) {
          setError(e instanceof Error ? e.message : '解析失败')
        }
      }
      reader.readAsText(file)
    }
    input.click()
  }, [])

  // ── New project ────────────────────────────────────────────────────────
  const handleNewProject = useCallback(() => {
    const newProject: StudioProject = {
      id: generateProjectId(),
      name: '新项目',
      scenes: [
        { name: '场景 1', prompt: '', status: 'pending' },
      ],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    setProject(newProject)
    setSelectedScene(0)
    saveProject(newProject)
    setProjects(listProjects())
    setTab('storyboard')
  }, [])

  // ── Load project ───────────────────────────────────────────────────────
  const handleLoadProject = useCallback((proj: StudioProject) => {
    setProject(proj)
    setSelectedScene(0)
    setTab('storyboard')
  }, [])

  // ── Delete project ─────────────────────────────────────────────────────
  const handleDeleteProject = useCallback((id: string) => {
    deleteProject(id)
    setProjects(listProjects())
    if (project?.id === id) {
      setProject(null)
    }
  }, [project])

  // ── Add scene to storyboard ────────────────────────────────────────────
  const handleAddScene = useCallback(() => {
    if (!project) return
    const scenes = [...project.scenes, {
      name: `场景 ${project.scenes.length + 1}`,
      prompt: '',
      status: 'pending' as const,
    }]
    const updated = { ...project, scenes, updatedAt: Date.now() }
    setProject(updated)
    saveProject(updated)
  }, [project])

  // ── Update scene prompt ────────────────────────────────────────────────
  const handleUpdateScenePrompt = useCallback((idx: number, newPrompt: string) => {
    if (!project) return
    const scenes = [...project.scenes]
    scenes[idx] = { ...scenes[idx], prompt: newPrompt }
    const updated = { ...project, scenes, updatedAt: Date.now() }
    setProject(updated)
  }, [project])

  // ── Save scene prompt on blur ──────────────────────────────────────────
  const handleSaveScenePrompt = useCallback(() => {
    if (project) saveProject(project)
  }, [project])

  // ── Generate scene image ───────────────────────────────────────────────
  const handleGenerateSceneImage = useCallback(async (idx: number) => {
    if (!project || loading) return
    const scene = project.scenes[idx]
    if (!scene.prompt.trim()) return

    setLoading(true)
    setLoadingText(`✨ 生成场景 ${idx + 1} 图片...`)
    setProgress(0)
    setError('')

    try {
      const progressTimer = setInterval(() => {
        setProgress(p => Math.min(p + 8, 90))
      }, 500)

      const resp = await generateImage({
        prompt: scene.prompt,
        model: selectedImageModel,
        size: imageSize,
        ratio: imageRatio,
      })

      clearInterval(progressTimer)

      const scenes = [...project.scenes]
      scenes[idx] = { ...scenes[idx], imageUrl: resp.url, status: 'done' }
      const updated = { ...project, scenes, updatedAt: Date.now() }
      setProject(updated)
      saveProject(updated)
      setProjects(listProjects())
      setProgress(100)
    } catch (e) {
      const scenes = [...project.scenes]
      scenes[idx] = { ...scenes[idx], status: 'error', error: e instanceof Error ? e.message : '失败' }
      const updated = { ...project, scenes, updatedAt: Date.now() }
      setProject(updated)
      saveProject(updated)
      setError(e instanceof Error ? e.message : '生成失败')
    } finally {
      setLoading(false)
      setLoadingText('')
    }
  }, [project, loading, selectedImageModel, imageSize, imageRatio])

  // ── Batch generate all scenes ──────────────────────────────────────────
  const handleBatchGenerate = useCallback(async () => {
    if (!project || loading) return

    setLoading(true)
    setProgress(0)
    setError('')

    const total = project.scenes.filter(s => s.prompt.trim()).length
    let done = 0

    for (let i = 0; i < project.scenes.length; i++) {
      const scene = project.scenes[i]
      if (!scene.prompt.trim()) continue

      setLoadingText(`✨ 生成场景 ${i + 1}/${project.scenes.length}...`)
      setProgress(Math.round((done / total) * 100))

      try {
        const resp = await generateImage({
          prompt: scene.prompt,
          model: selectedImageModel,
          size: imageSize,
          ratio: imageRatio,
        })

        const scenes = [...project.scenes]
        scenes[i] = { ...scenes[i], imageUrl: resp.url, status: 'done' }
        const updated = { ...project, scenes, updatedAt: Date.now() }
        setProject(updated)
        saveProject(updated)
        setProjects(listProjects())
      } catch {
        const scenes = [...project.scenes]
        scenes[i] = { ...scenes[i], status: 'error', error: '生成失败' }
        const updated = { ...project, scenes, updatedAt: Date.now() }
        setProject(updated)
        saveProject(updated)
      }

      done++
      setProgress(Math.round((done / total) * 100))
    }

    setLoading(false)
    setLoadingText('')
    setProgress(100)
  }, [project, loading, selectedImageModel, imageSize, imageRatio])

  // ── Download ───────────────────────────────────────────────────────────
  const handleDownload = useCallback((url: string, filename: string) => {
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.target = '_blank'
    a.rel = 'noopener'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }, [])

  // ── Frame upload helper ────────────────────────────────────────────────
  const handleUploadFrame = useCallback((target: 'first' | 'last') => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = (ev) => {
        const url = ev.target?.result as string
        if (url) {
          if (target === 'first') setFirstFrame(url)
          else setLastFrame(url)
        }
      }
      reader.readAsDataURL(file)
    }
    input.click()
  }, [])

  // ═════════════════════════════════════════════════════════════════════════
  // ── Render helpers ────────────────────────────────────────────────────
  // ═════════════════════════════════════════════════════════════════════════

  /** Get the display name for the currently selected model. */
  const getModelDisplayName = (modelId: string, models: Record<string, string>): string => {
    return models[modelId] || modelId
  }

  // ── Settings panel ─────────────────────────────────────────────────────
  /**
   * 新增自定义模型，并把它并进图片 / 视频模型下拉列表。
   * 由 AddModelModal 的 onConfirm 触发（业务副作用留在 panel，组件只管展示）。
   */
  const handleAddCustomModel = useCallback(() => {
    if (!(newModel.id && newModel.name && newModel.base_url)) return
    addCustomModel(newModel as CustomModel)
    const updated = getCustomModels()
    setCustomModels(updated)
    const imgModels = { ...IMAGE_MODEL_OPTIONS }
    const vidModels = { ...VIDEO_MODEL_OPTIONS }
    updated.forEach(m => {
      if (m.type === 'image') imgModels[m.id] = `${m.name} (自定义)`
      if (m.type === 'video') vidModels[m.id] = `${m.name} (自定义)`
    })
    setImageModels(imgModels)
    setVideoModels(vidModels)
    setShowAddModelModal(false)
    setNewModel({ id: '', name: '', type: 'image', base_url: '', api_key: '' })
  }, [newModel])

  /**
   * 删除一个自定义模型并重建模型下拉列表。
   * 由 SettingsTab 的 onRemoveCustomModel 触发。
   */
  const handleRemoveCustomModel = useCallback((modelId: string) => {
    removeCustomModel(modelId)
    const updated = getCustomModels()
    setCustomModels(updated)
    const imgModels = { ...IMAGE_MODEL_OPTIONS }
    const vidModels = { ...VIDEO_MODEL_OPTIONS }
    updated.forEach(m => {
      if (m.type === 'image') imgModels[m.id] = `${m.name} (自定义)`
      if (m.type === 'video') vidModels[m.id] = `${m.name} (自定义)`
    })
    setImageModels(imgModels)
    setVideoModels(vidModels)
  }, [])
  // ═════════════════════════════════════════════════════════════════════════
  // ── Main render ───────────────────────────────────────────────────────
  // ═════════════════════════════════════════════════════════════════════════

  return createElement('div', {
    ref: panelRef,
    className: `agnes-root agnes-mod-${tab}`,
    'data-dsh-agnes-studio': '',
    'data-ag-tab': tab,
    'data-ag-theme': theme,
    'data-ag-size': panelSize,
  },
    createElement(PanelTitlebar, {
      tab,
      theme,
      panelSize,
      onCycleSize: () => {
        const i = PANEL_SIZE_ORDER.indexOf(panelSize)
        const next = PANEL_SIZE_ORDER[(i + 1) % PANEL_SIZE_ORDER.length]
        setPanelSize(next)
        try { localStorage?.setItem(PANEL_SIZE_KEY, next) } catch { /* ignore */ }
      },
      onToggleTheme: () => {
        const next = theme === 'dark' ? 'light' : 'dark'
        setTheme(next)
        try { localStorage?.setItem(THEME_KEY, next) } catch { /* ignore */ }
      },
      onClose,
      onDragStart,
    }),
    guideOpen ? createElement(KeyGuide, {
      checkingKey,
      keyStatus,
      onClose: () => setGuideOpen(false),
      onRecheck: () => { void checkKey(false) },
    }) : null,
    // ── Workspace: vertical nav rail + content ──
    createElement('div', { className: 'agnes-shell' },
      createElement(NavRail, {
        tab,
        onSelect: (id) => setTab(id as TabType),
      }),
      createElement('div', { className: 'agnes-main' },

    // ── Content area ──
    tab === 'canvas'
      // The canvas owns the full area (pan/zoom needs room).
      ? createElement('div', { style: { flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' } },
          createElement(CanvasPanel, { textModels: TEXT_MODEL_OPTIONS, imageModels, videoModels }),
        )
      : (tab === 'expert' || tab === 'settings' || tab === 'anchor' || tab === 'cover' || tab === 'models' || tab === 'ohstory')
      // Full-width panels
      ? createElement('div', { style: { flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' } },
          tab === 'expert'
            ? createElement(PromptExpertPanel, {
                textModels: TEXT_MODEL_OPTIONS,
                onUseForImage: (text) => { setPrompt(text); setTab('image') },
                onUseForVideo: (text) => { setPrompt(text); setTab('video') },
              })
            : tab === 'anchor'
              ? createElement(AnchorPanel)
              : tab === 'ohstory'
                ? createElement(OhStoryPanel, { sendTask })
                : tab === 'cover'
                  ? createElement(CoverPanel, { imageModels })
                  : tab === 'models'
                    ? createElement(ModelsTab, {
                        imageModels,
                        videoModels,
                        customModels,
                        onOpenAddModel: () => setShowAddModelModal(true),
                        onRemoveCustomModel: handleRemoveCustomModel,
                      })
                    : createElement(SettingsTab, {
                        vendorStatus,
                        checkingKey,
                        onRecheckKey: () => { void checkKey(false) },
                        guideOpen,
                        onToggleGuide: () => setGuideOpen(!guideOpen),
                        keyStatus,
                      })
        )
      // Three-column layout (image / video / storyboard)
      : createElement(ImageVideoWorkspace, {
          tab,
          paramsOpen,
          onCancel: () => { cancelRef.current = true },
          notice,
          history,
          onShowHistory: (item) => setResult({ type: item.type, url: item.url }),
          onToggleParams: () => {
            const next = !paramsOpen
            setParamsOpen(next)
            try { localStorage?.setItem(PARAMS_OPEN_KEY, next ? '1' : '0') } catch { /* ignore */ }
          },
          imageModels,
          videoModels,
          prompt,
          onPromptChange: setPrompt,
          loading,
          loadingText,
          progress,
          result,
          onClearResult: () => setResult(null),
          error,
          onGenerateImage: handleGenerateImage,
          onGenerateVideo: handleGenerateVideo,
          onBatchGenerate: handleBatchGenerate,
          onDownload: handleDownload,
          project,
          selectedScene,
          onSelectScene: setSelectedScene,
          onUpdateScenePrompt: handleUpdateScenePrompt,
          onSaveScenePrompt: handleSaveScenePrompt,
          onGenerateSceneImage: handleGenerateSceneImage,
          selectedImageModel,
          selectedVideoModel,
          onSelectImageModel: setSelectedImageModel,
          onSelectVideoModel: setSelectedVideoModel,
          availableImageSizes,
          onAvailableSizesChange: setAvailableImageSizes,
          imageSize,
          onImageSizeChange: setImageSize,
          imageRatio,
          onImageRatioChange: setImageRatio,
          videoMode,
          onVideoModeChange: setVideoMode,
          firstFrame,
          lastFrame,
          onUploadFrame: handleUploadFrame,
          videoResolution,
          onVideoResolutionChange: setVideoResolution,
          videoAspectRatio,
          onVideoAspectRatioChange: setVideoAspectRatio,
          videoDuration,
          onVideoDurationChange: setVideoDuration,
          refImages,
          onRefImagesChange: setRefImages,
          keyStatus,
        }),

      ),
    ),

    // ── Status bar ──

    createElement('div', { className: 'agnes-statusbar' },
      createElement('div', { className: 'agnes-status-dot' }),
      createElement('span', null, keyStatus === 'missing' ? 'API 未连接（缺 Key）' : 'API 已连接'),
      keyStatus === 'missing' ? createElement('button', {
        className: 'agnes-statusbar-link',
        onClick: () => setGuideOpen(true),
      }, '🔑 如何配置 Key') : null,
      project ? createElement('span', null, `📊 ${project.scenes.length} 个场景`) : null,
      result ? createElement('span', null, `✅ 已生成 ${result.type === 'image' ? '图片' : '视频'}`) : null,
      (tab === 'image' || tab === 'video') ? createElement('span', {
        style: { marginLeft: 'auto', fontSize: '11px', color: 'var(--ag-text-3, #6e80a3)' },
      }, tab === 'image'
        ? `🎨 ${getModelDisplayName(selectedImageModel, imageModels).split('(')[0].trim()}`
        : `🎬 ${getModelDisplayName(selectedVideoModel, videoModels).split('(')[0].trim()}`) : null,
    ),

    // ── Modals ──
    createElement(AddModelModal, {
      open: showAddModelModal,
      draft: newModel,
      onDraftChange: setNewModel,
      onClose: () => setShowAddModelModal(false),
      onConfirm: handleAddCustomModel,
    }),
  )
}
