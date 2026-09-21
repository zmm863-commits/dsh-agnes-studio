/**
 * Agnes Creative Studio — Main Panel Component
 *
 * Multi-vendor AI creative studio panel supporting image, video, storyboard,
 * and settings tabs. Uses plain React.createElement (no JSX). React is
 * resolved from DSH's client module loader.
 */

declare const require: ((id: string) => unknown) | undefined

/** Resolve one shell-provided module without ever throwing at load time. */
function shellRequire(id: string): any {
  try {
    if (typeof require === 'function') {
      const mod = require(id)
      if (mod !== undefined && mod !== null) return mod
    }
  } catch { /* fall through to the global */ }
  return undefined
}

/**
 * React runtime, resolved once. A missing runtime must NOT throw here: this
 * module is evaluated while client.js loads, and a load-time throw would take
 * the whole browser half down instead of just this panel.
 */
const React: any = shellRequire('react') ?? (globalThis as any).React ?? null

/** No-op stand-ins keep the module loadable; the panel reports the real error. */
const NOOP = (): void => {}
const useState: any = React?.useState ?? ((initial: unknown) => [typeof initial === 'function' ? (initial as () => unknown)() : initial, NOOP])
const useEffect: any = React?.useEffect ?? NOOP
const useCallback: any = React?.useCallback ?? ((fn: unknown) => fn)
const useRef: any = React?.useRef ?? ((initial: unknown) => ({ current: initial }))

/** Build a detached element when React is unusable (keeps render paths safe). */
const createElement: any = React?.createElement ?? (() => null)

import { injectStyles } from './styles.ts'
import {
  generateImage,
  generateVideo,
  pollVideoStatus,
  fetchKeyStatus,
  fetchModels,
  generateProjectId,
  saveProject,
  listProjects,
  deleteProject,
  getCustomModels,
  addCustomModel,
  removeCustomModel,
  getImageSizeOptions,
  IMAGE_MODEL_OPTIONS,
  VIDEO_MODEL_OPTIONS,
  TEXT_MODEL_OPTIONS,
  type KeyStatus,
  type StudioProject,
  type CustomModel,
} from './studio.ts'
import { parseScript, isSupportedScript } from './import.ts'
import { DramaPanel } from './drama-panel.tsx'
import { PromptExpertPanel } from './prompt-expert-panel.tsx'
import { AnchorPanel } from './anchor-panel.tsx'
import { CanvasPanel } from './canvas-panel.tsx'
import { CoverPanel } from './cover-panel.tsx'

/**
 * Mount a component into a container with React 18's createRoot.
 * @returns a disposer unmounting the tree.
 */
export function mountReact(
  container: HTMLElement,
  Component: (props: { onClose: () => void }) => unknown,
  props: { onClose: () => void },
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
}

/** Tab type. */

/** Left-rail modules: id, icon, and the label shown under the icon. */
const MODULES: Array<{ id: string; icon: string; name: string }> = [
  { id: 'image', icon: '🎨', name: '生图' },
  { id: 'video', icon: '🎬', name: '生视频' },
  { id: 'storyboard', icon: '📖', name: '短剧' },
  { id: 'anchor', icon: '🎙', name: '口播' },
  { id: 'canvas', icon: '🕸', name: '画布' },
  { id: 'cover', icon: '📕', name: '封面' },
  { id: 'expert', icon: '✨', name: '提示词' },
]


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

type TabType = 'image' | 'video' | 'storyboard' | 'anchor' | 'canvas' | 'cover' | 'expert' | 'settings'

/** Image aspect ratios. */
const IMAGE_RATIOS = ['1:1', '3:4', '4:3', '16:9', '9:16', '2:3', '3:2', '21:9']
/** Video durations in seconds. */
const VIDEO_DURATIONS = ['4', '5', '6', '7', '8', '10', '12']
/** Video resolutions. */
const VIDEO_RESOLUTIONS = ['720P', '1080P']
/** Video aspect ratios. */
const VIDEO_ASPECT_RATIOS = ['16:9', '9:16', '1:1', '4:3', '3:4']

/** Product name shown everywhere in the UI. */
const PRODUCT_NAME = '泡泡猫的影视工具'

/** Where a first-time user signs up and creates an API Key. */
const AGNES_PLATFORM_URL = 'https://platform.agnes-ai.cn'
/** Public quickstart (account → API key → first request). */
const AGNES_DOCS_URL = 'https://agnes-ai.cn/zh-Hans/docs/quickstart'

/** True when an error message means "no/invalid API key" rather than a build error. */
function looksLikeKeyProblem(message: string): boolean {
  return message.includes('未配置')
    || message.includes('agnes-api-key')
    || /\b401\b/.test(message)
    || /invalid api key|api key is invalid|unauthorized|no api key/i.test(message)
}

/** Main panel component. */
export function StudioPanel({ onClose }: PanelProps) {
  injectStyles()

  // ── Core state ─────────────────────────────────────────────────────────
  const [tab, setTab] = useState<TabType>('image')
  // Light/dark are BOTH supported; this only picks the starting one.
  const [theme, setTheme] = useState<'light' | 'dark'>(() => resolveTheme('auto'))
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingText, setLoadingText] = useState('')
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<{ type: 'image' | 'video'; url: string } | null>(null)
  const [error, setError] = useState('')

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

      if (project) {
        const scenes = [...project.scenes]
        if (scenes[selectedScene]) {
          scenes[selectedScene] = { ...scenes[selectedScene], imageUrl: resp.url, status: 'done' }
          const updated = { ...project, scenes, updatedAt: Date.now() }
          setProject(updated)
          saveProject(updated)
          setProjects(listProjects())
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
      while (attempts < maxAttempts) {
        await new Promise(r => setTimeout(r, 3000))
        attempts++

        const status = await pollVideoStatus(resp.videoId)
        setProgress(Math.min(status.progress || 0, 99))

        if (status.status === 'completed' && status.url) {
          setProgress(100)
          setResult({ type: 'video', url: status.url })

          if (project) {
            const scenes = [...project.scenes]
            if (scenes[selectedScene]) {
              scenes[selectedScene] = { ...scenes[selectedScene], videoUrl: status.url, status: 'done' }
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

  /** Determine if the current model tag should show "free". */
  const isFreeModel = (modelId: string): boolean => {
    return modelId.startsWith('agnes-')
  }

  // ── Model selector section (right panel) ───────────────────────────────
  const renderModelSelector = () => {
    const currentModels = tab === 'image' ? imageModels : videoModels
    const currentModelId = tab === 'image' ? selectedImageModel : selectedVideoModel
    const currentModelName = getModelDisplayName(currentModelId, currentModels)
    const free = isFreeModel(currentModelId)

    return createElement('div', { className: 'agnes-section' },
      createElement('div', { className: 'agnes-section-title' },
        tab === 'image' ? '🎨 图片模型' : '🎬 视频模型'
      ),
      createElement('select', {
        className: 'agnes-model-select',
        value: currentModelId,
        onChange: (e: Event) => {
          const val = (e.target as HTMLSelectElement).value
          if (tab === 'image') {
            setSelectedImageModel(val)
            const sizes = getImageSizeOptions(val)
            setAvailableImageSizes(sizes)
            if (sizes.length > 0 && !sizes.includes(imageSize)) {
              setImageSize(sizes[0])
            }
          } else {
            setSelectedVideoModel(val)
          }
        },
      },
        ...Object.entries(currentModels).map(([id, name]) =>
          createElement('option', { key: id, value: id }, name)
        )
      ),
      createElement('div', { className: 'agnes-model-info' },
        free
          ? createElement('span', { className: 'agnes-model-tag agnes-model-tag-free' }, '🎉 免费')
          : createElement('span', { className: 'agnes-model-tag' }, '💎 付费'),
        createElement('span', { style: { marginLeft: '6px', fontSize: '12px', color: 'var(--ag-text-3, #6e80a3)' } }, currentModelName),
      ),
    )
  }

  // ── Image size selector ────────────────────────────────────────────────
  const renderSizeSelector = () => {
    if (tab !== 'image') return null

    return createElement('div', { className: 'agnes-section' },
      createElement('div', { className: 'agnes-section-title' }, '📐 尺寸'),
      createElement('div', { className: 'agnes-size-grid' },
        ...availableImageSizes.map(size =>
          createElement('button', {
            key: size,
            className: `agnes-size-btn ${imageSize === size ? 'active' : ''}`,
            onClick: () => setImageSize(size),
          }, size.replace('x', '×'))
        )
      ),
      createElement('div', { className: 'agnes-section-title', style: { marginTop: '12px' } }, '📏 宽高比'),
      createElement('div', { className: 'agnes-ratio-grid' },
        ...IMAGE_RATIOS.map(ratio =>
          createElement('button', {
            key: ratio,
            className: `agnes-ratio-btn ${imageRatio === ratio ? 'active' : ''}`,
            onClick: () => setImageRatio(ratio),
          }, ratio)
        )
      ),
    )
  }

  // ── Video mode selector ────────────────────────────────────────────────
  const renderVideoModeSelector = () => {
    if (tab !== 'video') return null

    return createElement('div', { className: 'agnes-section' },
      createElement('div', { className: 'agnes-section-title' }, '🎥 生成模式'),
      createElement('div', { className: 'agnes-mode-grid' },
        ...(['text', 'keyframe', 'reference'] as const).map(mode =>
          createElement('button', {
            key: mode,
            className: `agnes-mode-btn ${videoMode === mode ? 'active' : ''}`,
            onClick: () => setVideoMode(mode),
          }, mode === 'text' ? '📝 文生视频' : mode === 'keyframe' ? '🖼 首尾帧' : '📷 参考图')
        )
      ),
      videoMode === 'keyframe' ? createElement('div', { className: 'agnes-frame-upload' },
        createElement('div', {
          className: `agnes-frame-item ${firstFrame ? 'has-image' : ''}`,
          onClick: () => handleUploadFrame('first'),
        },
          firstFrame
            ? createElement('img', { src: firstFrame, alt: '首帧', style: { width: '100%', height: '100%', objectFit: 'cover' } })
            : '🖼 首帧'
        ),
        createElement('div', {
          className: `agnes-frame-item ${lastFrame ? 'has-image' : ''}`,
          onClick: () => handleUploadFrame('last'),
        },
          lastFrame
            ? createElement('img', { src: lastFrame, alt: '尾帧', style: { width: '100%', height: '100%', objectFit: 'cover' } })
            : '🖼 尾帧（可选）'
        ),
      ) : null,
      createElement('div', { className: 'agnes-input-row', style: { marginTop: '8px' } },
        createElement('div', null,
          createElement('div', { style: { fontSize: '11px', color: 'var(--ag-text-3, #6e80a3)', marginBottom: '4px' } }, '分辨率'),
          createElement('select', {
            className: 'agnes-select',
            value: videoResolution,
            onChange: (e: Event) => setVideoResolution((e.target as HTMLSelectElement).value),
          },
            ...VIDEO_RESOLUTIONS.map(r =>
              createElement('option', { key: r, value: r }, r)
            )
          ),
        ),
        createElement('div', null,
          createElement('div', { style: { fontSize: '11px', color: 'var(--ag-text-3, #6e80a3)', marginBottom: '4px' } }, '宽高比'),
          createElement('select', {
            className: 'agnes-select',
            value: videoAspectRatio,
            onChange: (e: Event) => setVideoAspectRatio((e.target as HTMLSelectElement).value),
          },
            ...VIDEO_ASPECT_RATIOS.map(r =>
              createElement('option', { key: r, value: r }, r)
            )
          ),
        ),
      ),
      createElement('div', { style: { marginTop: '8px' } },
        createElement('div', { style: { fontSize: '11px', color: 'var(--ag-text-3, #6e80a3)', marginBottom: '4px' } }, '时长 (秒)'),
        createElement('select', {
          className: 'agnes-select',
          value: videoDuration,
          onChange: (e: Event) => setVideoDuration((e.target as HTMLSelectElement).value),
        },
          ...VIDEO_DURATIONS.map(d =>
            createElement('option', { key: d, value: d }, `${d} 秒`)
          )
        ),
      ),
    )
  }

  // ── Settings panel ─────────────────────────────────────────────────────
  const renderSettings = () => createElement('div', { className: 'agnes-settings' },
    createElement('div', { className: 'agnes-setting-group' },
      createElement('div', { className: 'agnes-setting-group-title' }, '🔑 API Key 状态'),
      ...Object.entries(vendorStatus).map(([vendor, status]) =>
        createElement('div', { key: vendor, className: 'agnes-setting-row' },
          createElement('span', { className: 'agnes-setting-label' }, vendor.charAt(0).toUpperCase() + vendor.slice(1)),
          createElement('span', {
            className: status.configured ? 'agnes-badge agnes-badge-free' : 'agnes-badge agnes-badge-error'
          }, status.configured ? '✅ 已配置' : '❌ 未配置'),
        )
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
        onClick: () => { void checkKey(false) },
      }, checkingKey ? '⏳ 检测中…' : '🔄 重新检测 Key'),
    ),

    createElement('div', { className: 'agnes-setting-group' },
      createElement('div', { className: 'agnes-setting-group-title' }, '📖 配置指南'),
      createElement('div', { style: { fontSize: '12px', color: 'var(--ag-text-3, #6e80a3)', lineHeight: '1.6', marginBottom: '8px' } },
        '如需使用付费模型，请在对应厂商平台获取 API Key 并配置到 DSH。'
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
          onClick: () => setGuideOpen(!guideOpen),
        }, guideOpen ? '收起 Key 指引' : '🔑 首次使用？如何获取 / 配置 Key'),
      ),
    ),

    createElement('div', { className: 'agnes-setting-group' },
      createElement('div', { className: 'agnes-setting-group-title' }, '🔧 自定义模型'),
      createElement('button', {
        className: 'agnes-btn agnes-btn-sm agnes-btn-primary',
        style: { marginBottom: '8px' },
        onClick: () => setShowAddModelModal(true),
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
                  onClick: () => {
                    removeCustomModel(model.id)
                    setCustomModels(getCustomModels())
                    const updated = getCustomModels()
                    const imgModels = { ...IMAGE_MODEL_OPTIONS }
                    const vidModels = { ...VIDEO_MODEL_OPTIONS }
                    updated.forEach(m => {
                      if (m.type === 'image') imgModels[m.id] = `${m.name} (自定义)`
                      if (m.type === 'video') vidModels[m.id] = `${m.name} (自定义)`
                    })
                    setImageModels(imgModels)
                    setVideoModels(vidModels)
                  },
                }, '🗑'),
              )
            )
          )
        : createElement('div', { style: { fontSize: '12px', color: 'var(--ag-text-3, #6e80a3)', padding: '8px 0' } },
            '暂无自定义模型。添加后可在模型选择器中使用。',
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

  // ── Add custom model modal ─────────────────────────────────────────────
  const renderAddModelModal = () => showAddModelModal ? createElement('div', {
    className: 'agnes-modal-backdrop',
    onClick: () => setShowAddModelModal(false),
  }, createElement('div', {
    className: 'agnes-modal',
    onClick: (e: Event) => e.stopPropagation(),
  },
    createElement('div', { className: 'agnes-modal-header' },
      createElement('span', null, '添加自定义模型'),
      createElement('button', {
        className: 'agnes-btn agnes-btn-sm agnes-btn-ghost',
        onClick: () => setShowAddModelModal(false),
      }, '✕'),
    ),
    createElement('div', { className: 'agnes-modal-body' },
      createElement('div', { className: 'agnes-form-group' },
        createElement('label', { className: 'agnes-form-label' }, '模型 ID'),
        createElement('input', {
          className: 'agnes-form-input',
          value: newModel.id,
          onChange: (e: Event) => setNewModel({ ...newModel, id: (e.target as HTMLInputElement).value }),
          placeholder: '如 custom-image-1',
        }),
      ),
      createElement('div', { className: 'agnes-form-group' },
        createElement('label', { className: 'agnes-form-label' }, '显示名称'),
        createElement('input', {
          className: 'agnes-form-input',
          value: newModel.name,
          onChange: (e: Event) => setNewModel({ ...newModel, name: (e.target as HTMLInputElement).value }),
          placeholder: '如 My Custom Image Model',
        }),
      ),
      createElement('div', { className: 'agnes-form-group' },
        createElement('label', { className: 'agnes-form-label' }, '类型'),
        createElement('select', {
          className: 'agnes-form-select',
          value: newModel.type,
          onChange: (e: Event) => setNewModel({ ...newModel, type: (e.target as HTMLSelectElement).value as 'text' | 'image' | 'video' }),
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
          value: newModel.base_url,
          onChange: (e: Event) => setNewModel({ ...newModel, base_url: (e.target as HTMLInputElement).value }),
          placeholder: 'https://api.example.com/v1',
        }),
      ),
      createElement('div', { className: 'agnes-form-group' },
        createElement('label', { className: 'agnes-form-label' }, 'API Key（可选）'),
        createElement('input', {
          className: 'agnes-form-input',
          value: newModel.api_key,
          onChange: (e: Event) => setNewModel({ ...newModel, api_key: (e.target as HTMLInputElement).value }),
          placeholder: 'sk-...',
          type: 'password',
        }),
      ),
    ),
    createElement('div', { className: 'agnes-modal-footer' },
      createElement('button', {
        className: 'agnes-btn agnes-btn-secondary',
        onClick: () => setShowAddModelModal(false),
      }, '取消'),
      createElement('button', {
        className: 'agnes-btn agnes-btn-primary',
        onClick: () => {
          if (newModel.id && newModel.name && newModel.base_url) {
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
          }
        },
      }, '添加'),
    ),
  )) : null

  // ═════════════════════════════════════════════════════════════════════════
  // ── Main render ───────────────────────────────────────────────────────
  // ═════════════════════════════════════════════════════════════════════════

  return createElement('div', {
    ref: panelRef,
    className: `agnes-root agnes-mod-${tab}`,
    'data-dsh-agnes-studio': '',
    'data-ag-tab': tab,
    'data-ag-theme': theme,
  },
    // ── Title bar ──
    createElement('div', {
      className: 'agnes-titlebar',
      onMouseDown: onDragStart,
    },
      createElement('span', { className: 'agnes-titlebar-icon' }, '🎬'),
      createElement('span', { className: 'agnes-titlebar-text' }, PRODUCT_NAME),
      createElement('span', { className: 'agnes-titlebar-module' },
        (MODULES.find(m => m.id === tab)?.name) ?? (tab === 'settings' ? '设置' : '')),
      createElement('div', { className: 'agnes-titlebar-spacer' }),
      createElement('button', {
        className: 'agnes-theme-toggle',
        onClick: () => {
          const next = theme === 'dark' ? 'light' : 'dark'
          setTheme(next)
          try { localStorage?.setItem(THEME_KEY, next) } catch { /* ignore */ }
        },
        title: theme === 'dark' ? '切换到亮色主题' : '切换到暗色主题',
      }, theme === 'dark' ? '☀️ 亮色' : '🌙 暗色'),
      createElement('span', { className: 'agnes-badge agnes-badge-free' }, '🎉 生图/视频免费'),
      createElement('button', {
        className: 'agnes-titlebar-btn',
        onClick: onClose,
        title: '关闭',
        'aria-label': '关闭',
      }, '✕'),
    ),

    // ── First-use API key guide ──
    guideOpen ? createElement('div', { className: 'agnes-keyguide' },
      createElement('div', { className: 'agnes-keyguide-head' },
        createElement('span', { className: 'agnes-keyguide-title' }, '🔑 首次使用：需要一个 Agnes API Key'),
        createElement('button', {
          className: 'agnes-keyguide-close',
          onClick: () => setGuideOpen(false),
          title: '收起',
        }, '收起'),
      ),
      createElement('div', { className: 'agnes-keyguide-steps' },
        createElement('div', { className: 'agnes-keyguide-step' },
          createElement('span', { className: 'agnes-keyguide-num' }, '1'),
          createElement('span', null, '注册 / 登录 Agnes AI 平台（免费注册）'),
        ),
        createElement('div', { className: 'agnes-keyguide-step' },
          createElement('span', { className: 'agnes-keyguide-num' }, '2'),
          createElement('span', null, '在控制台「API Keys」里创建密钥，复制 sk- 开头的那一串'),
        ),
        createElement('div', { className: 'agnes-keyguide-step' },
          createElement('span', { className: 'agnes-keyguide-num' }, '3'),
          createElement('span', null,
            '把它填到本机（任选一种）：DSH 设置 → 模型 → 凭据，新增 ',
            createElement('code', null, 'agnes-api-key'),
            '；或在本机 ',
            createElement('code', null, '/dsh/.env'),
            ' 写一行 ',
            createElement('code', null, 'AGNES_API_KEY=sk-...'),
          ),
        ),
      ),
      createElement('div', { className: 'agnes-keyguide-actions' },
        createElement('a', {
          className: 'agnes-btn agnes-btn-sm agnes-btn-primary',
          href: AGNES_PLATFORM_URL,
          target: '_blank',
          rel: 'noopener noreferrer',
        }, '🌐 去注册 / 登录'),
        createElement('a', {
          className: 'agnes-btn agnes-btn-sm agnes-btn-secondary',
          href: AGNES_DOCS_URL,
          target: '_blank',
          rel: 'noopener noreferrer',
        }, '📖 官方文档'),
        createElement('button', {
          className: 'agnes-btn agnes-btn-sm agnes-btn-ghost',
          disabled: checkingKey,
          onClick: () => { void checkKey(false) },
        }, checkingKey ? '⏳ 检测中…' : '🔄 重新检测'),
        keyStatus === 'ready'
          ? createElement('span', { className: 'agnes-keyguide-ok' }, '✅ Key 已配置')
          : null,
      ),
      createElement('div', { className: 'agnes-keyguide-note' },
        'Key 只保存在本机、只由后端进程用于调用 API，网页里不会出现；免费额度以平台规则为准。',
      ),
    ) : null,

    // ── Workspace: vertical nav rail + content ──
    createElement('div', { className: 'agnes-shell' },
      createElement('nav', { className: 'agnes-rail' },
        ...MODULES.map(m =>
          createElement('button', {
            key: m.id,
            className: `agnes-rail-item${tab === m.id ? ' active' : ''}`,
            'data-tab': m.id,
            onClick: () => setTab(m.id as TabType),
            title: m.name,
          },
            createElement('span', { className: 'agnes-rail-icon' }, m.icon),
            createElement('span', { className: 'agnes-rail-label' }, m.name),
          ),
        ),
        createElement('div', { className: 'agnes-rail-spacer' }),
        createElement('button', {
          className: `agnes-rail-item${tab === 'settings' ? ' active' : ''}`,
          'data-tab': 'settings',
          onClick: () => setTab('settings' as TabType),
          title: '设置',
        },
          createElement('span', { className: 'agnes-rail-icon' }, '⚙'),
          createElement('span', { className: 'agnes-rail-label' }, '设置'),
        ),
      ),
      createElement('div', { className: 'agnes-main' },

    // ── Content area ──
    tab === 'canvas'
      // The canvas owns the full area (pan/zoom needs room).
      ? createElement('div', { style: { flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' } },
          createElement(CanvasPanel, { textModels: TEXT_MODEL_OPTIONS, imageModels, videoModels }),
        )
      : (tab === 'expert' || tab === 'settings' || tab === 'anchor' || tab === 'cover')
      // Full-width panels
      ? createElement('div', { style: { flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' } },
          tab === 'expert'
            ? createElement(PromptExpertPanel, { textModels: TEXT_MODEL_OPTIONS })
            : tab === 'anchor'
              ? createElement(AnchorPanel)
              : tab === 'cover'
                ? createElement(CoverPanel, { imageModels })
                : renderSettings()
        )
      // Three-column layout (image / video / storyboard)
      : createElement('div', { className: 'agnes-body' },
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
                    onClick: () => handleDownload(result.url, `agnes-${Date.now()}.${result.type === 'image' ? 'png' : 'mp4'}`),
                  }, '📥 下载'),
                  createElement('button', {
                    className: 'agnes-btn agnes-btn-sm agnes-btn-ghost',
                    onClick: () => { navigator.clipboard?.writeText(result.url) },
                  }, '📋 复制链接'),
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
            onClick: tab === 'image' ? handleGenerateImage : handleGenerateVideo,
          }, loading ? `⏳ ${loadingText}` : tab === 'image' ? '✨ 生成图片' : '🎬 生成视频'),
          (tab === 'image' || tab === 'video') && project ? createElement('button', {
            className: 'agnes-btn agnes-btn-secondary',
            disabled: loading,
            onClick: handleBatchGenerate,
          }, '▶ 批量生成所有场景') : null,
          result ? createElement('button', {
            className: 'agnes-btn agnes-btn-ghost',
            onClick: () => setResult(null),
          }, '✕ 清除预览') : null,
          error ? createElement('div', {
            style: { marginLeft: 'auto', fontSize: '12px', color: '#ff6b6b' },
          }, error) : null,
        ),
      ),

      // ═══ Right panel — ONLY for image/video ═══
      // The storyboard workbench renders its own right column, so mounting this
      // one too left an empty 280px sidebar beside it.
      (tab === 'image' || tab === 'video')
        ? createElement('div', { className: 'agnes-right' },
            createElement('div', { className: 'agnes-right-scroll' },

          (tab === 'image' || tab === 'video') ? createElement('div', { className: 'agnes-section' },
            createElement('div', { className: 'agnes-section-title' }, '📝 提示词'),
            createElement('textarea', {
              className: 'agnes-textarea',
              value: prompt,
              onChange: (e: Event) => setPrompt((e.target as HTMLTextAreaElement).value),
              placeholder: tab === 'image'
                ? '描述你想要生成的图片...\n\n例如：赛博朋克城市街道，雨夜，霓虹灯倒映在湿漉漉的地面，低角度镜头，电影级光照'
                : '描述你想要生成的视频...\n\n例如：雨后的未来城市街道，霓虹灯倒映在地面，一辆银色跑车缓慢驶过，电影级运镜',
              rows: 5,
            }),
          ) : null,

          (tab === 'image' || tab === 'video') && project && project.scenes[selectedScene] ? createElement('div', { className: 'agnes-section' },
            createElement('div', { className: 'agnes-section-title' }, `🎞 场景 ${selectedScene + 1} 提示词`),
            createElement('textarea', {
              className: 'agnes-textarea',
              value: project.scenes[selectedScene].prompt,
              onChange: (e: Event) => handleUpdateScenePrompt(selectedScene, (e.target as HTMLTextAreaElement).value),
              onBlur: handleSaveScenePrompt,
              placeholder: `为场景 ${selectedScene + 1} 编写提示词...`,
              rows: 4,
            }),
            createElement('div', { style: { marginTop: '8px', display: 'flex', gap: '6px' } },
              createElement('button', {
                className: 'agnes-btn agnes-btn-sm agnes-btn-primary',
                disabled: loading || !project.scenes[selectedScene].prompt.trim(),
                onClick: () => handleGenerateSceneImage(selectedScene),
                style: { flex: 1 },
              }, '✨ 生成此场景'),
              createElement('button', {
                className: 'agnes-btn agnes-btn-sm agnes-btn-ghost',
                onClick: () => {
                  if (selectedScene > 0) setSelectedScene(selectedScene - 1)
                },
                disabled: selectedScene === 0,
              }, '←'),
              createElement('button', {
                className: 'agnes-btn agnes-btn-sm agnes-btn-ghost',
                onClick: () => {
                  if (project && selectedScene < project.scenes.length - 1) setSelectedScene(selectedScene + 1)
                },
                disabled: !project || selectedScene >= project.scenes.length - 1,
              }, '→'),
            ),
          ) : null,

          (tab === 'image' || tab === 'video') ? renderModelSelector() : null,
          tab === 'image' ? renderSizeSelector() : null,
          tab === 'video' ? renderVideoModeSelector() : null,

          (tab === 'image' || tab === 'video')
            ? createElement('div', { className: 'agnes-divider' })
            : null,

          (tab === 'image' || tab === 'video') ? createElement('div', { className: 'agnes-section' },
            createElement('div', { className: 'agnes-section-title' }, '🖼 参考图片'),
            createElement('div', { className: 'agnes-ref-chips' },
              ...refImages.map((url, i) =>
                createElement('div', { key: i, className: 'agnes-ref-chip' },
                  createElement('img', { src: url, alt: `参考 ${i + 1}` }),
                  createElement('button', {
                    className: 'agnes-ref-chip-remove',
                    onClick: () => setRefImages(refImages.filter((_, j) => j !== i)),
                  }, '×'),
                ),
              ),
              createElement('button', {
                className: 'agnes-ref-chip-add',
                onClick: () => {
                  const input = document.createElement('input')
                  input.type = 'file'
                  input.accept = 'image/*'
                  input.onchange = (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0]
                    if (!file) return
                    const reader = new FileReader()
                    reader.onload = (ev) => {
                      const url = ev.target?.result as string
                      if (url) setRefImages([...refImages, url])
                    }
                    reader.readAsDataURL(file)
                  }
                  input.click()
                },
              }, '+'),
            ),
            refImages.length > 0 ? createElement('div', {
              style: { marginTop: '8px', fontSize: '11px', color: 'var(--ag-text-3, #6e80a3)' },
            }, `${refImages.length} 张参考图`) : createElement('div', {
              style: { marginTop: '8px', fontSize: '11px', color: 'var(--ag-text-3, #6e80a3)' },
            }, tab === 'video' && videoMode === 'keyframe' ? '纯文生视频模式（或上传首尾帧）' : '无参考图（纯文生模式）'),
          ) : null,

          (tab === 'image' || tab === 'video') ? createElement('div', { className: 'agnes-divider' }) : null,

          (tab === 'image' || tab === 'video') ? createElement('div', { className: 'agnes-section' },
            createElement('div', { className: 'agnes-section-title' }, 'ℹ️ 模型信息'),
            createElement('div', { style: { fontSize: '12px', color: 'var(--ag-text-3, #6e80a3)', lineHeight: '1.6' } },
              createElement('div', null, `🎨 当前图片模型: ${getModelDisplayName(selectedImageModel, imageModels)}`),
              createElement('div', null, `🎬 当前视频模型: ${getModelDisplayName(selectedVideoModel, videoModels)}`),
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
    ),

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
    renderAddModelModal(),
  )
}
