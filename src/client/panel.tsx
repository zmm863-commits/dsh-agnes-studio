/**
 * Agnes Creative Studio — Main Panel Component
 *
 * Plain React.createElement (no JSX). React is resolved from DSH's client
 * module loader: this file is bundled into the single client.js that runs
 * inside window.__ModuleLoader__.load({ factory: (require) => ... }), so
 * `require('react')` is the shell-provided React instance.
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
  generateProjectId,
  saveProject,
  listProjects,
  deleteProject,
  type KeyStatus,
  type StudioProject,
} from './studio.ts'
import { parseScript, isSupportedScript } from './import.ts'

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
type TabType = 'image' | 'video' | 'storyboard'

/** Image size options. */
const IMAGE_SIZES = ['1K', '2K', '3K', '4K']
const IMAGE_RATIOS = ['1:1', '3:4', '4:3', '16:9', '9:16', '2:3', '3:2', '21:9']
const VIDEO_DURATIONS = ['4', '5', '6', '7', '8', '10', '12']

/** Product name shown everywhere in the UI. */
const PRODUCT_NAME = '泡泡猫的影视工具'

/** Where a first-time user signs up and creates an Agnes API Key. */
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

  // State
  const [tab, setTab] = useState<TabType>('image')
  const [prompt, setPrompt] = useState('')
  const [imageSize, setImageSize] = useState('2K')
  const [imageRatio, setImageRatio] = useState('16:9')
  const [videoDuration, setVideoDuration] = useState('5')
  const [loading, setLoading] = useState(false)
  const [loadingText, setLoadingText] = useState('')
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<{ type: 'image' | 'video'; url: string } | null>(null)
  const [error, setError] = useState('')

  // Reference images for img2img
  const [refImages, setRefImages] = useState<string[]>([])

  // Storyboard
  const [project, setProject] = useState<StudioProject | null>(null)
  const [selectedScene, setSelectedScene] = useState<number>(0)
  const [projects, setProjects] = useState<StudioProject[]>([])

  // Drag state. The pointer origin lives in a ref (not state) so a drag never
  // depends on a re-render having landed; `dragging` only gates the listeners.
  const [dragging, setDragging] = useState(false)
  const dragOrigin = useRef<{ x: number; y: number; left: number; top: number } | null>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  // API key onboarding
  const [keyStatus, setKeyStatus] = useState<KeyStatus>('unknown')
  const [guideOpen, setGuideOpen] = useState(false)
  const [checkingKey, setCheckingKey] = useState(false)

  // Load projects and probe the API key on mount
  useEffect(() => {
    setProjects(listProjects())
  }, [])

  const checkKey = useCallback(async (openWhenMissing: boolean) => {
    setCheckingKey(true)
    const status = await fetchKeyStatus()
    setKeyStatus(status)
    if (status === 'missing' && openWhenMissing) setGuideOpen(true)
    setCheckingKey(false)
  }, [])

  useEffect(() => { void checkKey(true) }, [checkKey])

  // ── Drag handlers ───────────────────────────────────────────────────
  // The title bar also hosts the close button: a press that starts on an
  // interactive control must stay a plain click, otherwise the panel starts
  // moving under the pointer and the click never lands on the button.
  const onDragStart = useCallback((e: MouseEvent) => {
    const panel = panelRef.current
    if (panel === null) return
    const target = e.target as HTMLElement | null
    if (target !== null && typeof target.closest === 'function'
      && target.closest('button, input, select, textarea, a, [data-no-drag]') !== null) return
    const rect = panel.getBoundingClientRect()
    // Pin the panel to its current viewport position FIRST: from here on every
    // move is an absolute delta, so the panel cannot jump when the drag starts.
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
      // Keep the window grabbable: never let the title bar (and its ✕) leave
      // the viewport, whatever the pointer does.
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

  // ── Image generation ────────────────────────────────────────────────
  const handleGenerateImage = useCallback(async () => {
    if (!prompt.trim() || loading) return
    setLoading(true)
    setLoadingText('✨ 生成图片中...')
    setProgress(0)
    setError('')
    setResult(null)

    try {
      // Simulate progress
      const progressTimer = setInterval(() => {
        setProgress(p => Math.min(p + 8, 90))
      }, 500)

      const resp = await generateImage({
        prompt: prompt.trim(),
        size: imageSize,
        ratio: imageRatio,
        images: refImages.length > 0 ? refImages : undefined,
      })

      clearInterval(progressTimer)
      setProgress(100)
      setResult({ type: 'image', url: resp.url })

      // Add to storyboard if active
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
      // A missing/invalid key is an onboarding problem, not a generation one.
      if (looksLikeKeyProblem(message)) {
        setKeyStatus('missing')
        setGuideOpen(true)
      }
    } finally {
      setLoading(false)
      setLoadingText('')
    }
  }, [prompt, imageSize, imageRatio, refImages, loading, project, selectedScene])

  // ── Video generation ────────────────────────────────────────────────
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
        mode: refImages.length > 0 ? 'reference' : 'text',
        seconds: videoDuration,
        images: refImages.length > 0 ? refImages : undefined,
      })

      setLoadingText('🔄 视频生成中...')

      // Poll for completion
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

          // Update storyboard
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
  }, [prompt, videoDuration, refImages, loading, project, selectedScene])

  // ── Script import ───────────────────────────────────────────────────
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
          setProjects(listProjects())
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

  // ── New project ─────────────────────────────────────────────────────
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

  // ── Load project ────────────────────────────────────────────────────
  const handleLoadProject = useCallback((proj: StudioProject) => {
    setProject(proj)
    setSelectedScene(0)
    setTab('storyboard')
  }, [])

  // ── Delete project ──────────────────────────────────────────────────
  const handleDeleteProject = useCallback((id: string) => {
    deleteProject(id)
    setProjects(listProjects())
    if (project?.id === id) {
      setProject(null)
    }
  }, [project])

  // ── Add scene to storyboard ─────────────────────────────────────────
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

  // ── Update scene prompt ─────────────────────────────────────────────
  const handleUpdateScenePrompt = useCallback((idx: number, newPrompt: string) => {
    if (!project) return
    const scenes = [...project.scenes]
    scenes[idx] = { ...scenes[idx], prompt: newPrompt }
    const updated = { ...project, scenes, updatedAt: Date.now() }
    setProject(updated)
  }, [project])

  // ── Save scene prompt on blur ───────────────────────────────────────
  const handleSaveScenePrompt = useCallback(() => {
    if (project) saveProject(project)
  }, [project])

  // ── Generate scene image ────────────────────────────────────────────
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
  }, [project, loading, imageSize, imageRatio])

  // ── Batch generate all scenes ───────────────────────────────────────
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
  }, [project, loading, imageSize, imageRatio])

  // ── Download image ──────────────────────────────────────────────────
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

  // ── Render ──────────────────────────────────────────────────────────
  // NOTE: the dark scrim is owned by the vanilla overlay layer in index.ts —
  // rendering a second full-screen backdrop here would stack two scrims and
  // two competing close handlers on top of each other.
  return createElement('div', {
    ref: panelRef,
    'data-dsh-agnes-studio': '',
  },
      // ── Title bar ──
      createElement('div', {
        className: 'agnes-titlebar',
        onMouseDown: onDragStart,
      },
        createElement('span', { className: 'agnes-titlebar-icon' }, '🎬'),
        createElement('span', { className: 'agnes-titlebar-text' }, PRODUCT_NAME),
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
          'Key 只保存在本机、只由后端进程用于调用 Agnes，网页里不会出现；免费额度以平台规则为准。',
        ),
      ) : null,

      // ── Body ──
      createElement('div', { className: 'agnes-body' },

        // ── Left panel ──
        createElement('div', { className: 'agnes-left' },
          // Project header
          createElement('div', { className: 'agnes-left-header' }, '项目'),
          // Actions
          createElement('div', { style: { padding: '0 8px 8px', display: 'flex', gap: '6px' } },
            createElement('button', {
              className: 'agnes-btn agnes-btn-sm agnes-btn-primary',
              style: { flex: 1 },
              onClick: handleImport,
            }, '📥 导入剧本'),
            createElement('button', {
              className: 'agnes-btn agnes-btn-sm agnes-btn-secondary',
              onClick: handleNewProject,
            }, '+'),
          ),
          // Project list
          createElement('div', { className: 'agnes-left-content' },
            // Current project scenes
            project ? createElement('div', null,
              createElement('div', {
                style: { padding: '4px 10px', fontSize: '12px', fontWeight: 600, color: 'var(--dsw-alias-label-secondary, #6c6c80)' },
              }, project.name),
              ...project.scenes.map((scene, i) =>
                createElement('div', {
                  key: i,
                  className: `agnes-scene-item ${selectedScene === i ? 'active' : ''}`,
                  onClick: () => {
                    setSelectedScene(i)
                    setPrompt(scene.prompt)
                    setResult(scene.imageUrl ? { type: 'image', url: scene.imageUrl } : null)
                  },
                },
                  createElement('div', { className: 'agnes-scene-num' }, String(i + 1)),
                  createElement('div', { className: 'agnes-scene-info' },
                    createElement('div', { className: 'agnes-scene-name' }, scene.name),
                    createElement('div', {
                      className: `agnes-scene-status ${scene.status === 'done' ? 'done' : scene.status === 'generating-image' || scene.status === 'generating-video' ? 'generating' : ''}`,
                    }, scene.status === 'done' ? '✅ 完成' : scene.status === 'error' ? '❌ 失败' : scene.status === 'pending' ? '⏳ 待生成' : '🔄 生成中...'),
                  ),
                ),
              ),
              // Add scene button
              createElement('button', {
                className: 'agnes-btn agnes-btn-sm agnes-btn-ghost agnes-btn-full',
                onClick: handleAddScene,
                style: { marginTop: '4px' },
              }, '+ 添加场景'),
            ) : createElement('div', { className: 'agnes-empty' },
              createElement('div', { className: 'agnes-empty-icon' }, '🎬'),
              createElement('div', { className: 'agnes-empty-title' }, '开始创作'),
              createElement('div', { className: 'agnes-empty-desc' }, '导入剧本或新建项目'),
            ),

            // Saved projects
            projects.length > 0 ? createElement('div', { style: { marginTop: '16px' } },
              createElement('div', {
                style: { padding: '4px 10px', fontSize: '12px', fontWeight: 600, color: 'var(--dsw-alias-label-secondary, #6c6c80)', marginBottom: '4px' },
              }, '历史项目'),
              ...projects.slice(0, 10).map(proj =>
                createElement('div', {
                  key: proj.id,
                  className: `agnes-scene-item ${project?.id === proj.id ? 'active' : ''}`,
                  onClick: () => handleLoadProject(proj),
                },
                  createElement('div', { className: 'agnes-scene-info' },
                    createElement('div', { className: 'agnes-scene-name' }, proj.name),
                    createElement('div', { className: 'agnes-scene-status' }, `${proj.scenes.length} 个场景`),
                  ),
                  createElement('button', {
                    className: 'agnes-btn agnes-btn-sm agnes-btn-ghost',
                    onClick: (e: MouseEvent) => { e.stopPropagation(); handleDeleteProject(proj.id) },
                    style: { padding: '2px 6px', fontSize: '11px' },
                  }, '🗑'),
                ),
              ),
            ) : null,
          ),
        ),

        // ── Center workspace ──
        createElement('div', { className: 'agnes-center' },
          // Tabs
          createElement('div', { style: { padding: '8px 16px 0' } },
            createElement('div', { className: 'agnes-tabs' },
              ['image', 'video', 'storyboard'].map(t =>
                createElement('button', {
                  key: t,
                  className: `agnes-tab ${tab === t ? 'active' : ''}`,
                  onClick: () => setTab(t as TabType),
                }, t === 'image' ? '🎨 生图' : t === 'video' ? '🎬 生视频' : '📖 故事板'),
              ),
            ),
          ),

          // Preview area
          createElement('div', { className: 'agnes-preview-area' },
            // Loading state
            loading ? createElement('div', { className: 'agnes-skeleton' },
              createElement('div', { style: { fontSize: '24px' } }, '✨'),
              createElement('div', { className: 'agnes-skeleton-text' }, loadingText),
              createElement('div', { className: 'agnes-progress-bar' },
                createElement('div', { className: 'agnes-progress-fill', style: { width: `${progress}%` } }),
              ),
            ) :
            // Result
            result ? createElement('div', { style: { textAlign: 'center', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' } },
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
            ) :
            // Empty state
            createElement('div', { className: 'agnes-empty' },
              createElement('div', { className: 'agnes-empty-icon' },
                tab === 'image' ? '🎨' : tab === 'video' ? '🎬' : '📖',
              ),
              createElement('div', { className: 'agnes-empty-title' },
                tab === 'image' ? 'AI 生图' : tab === 'video' ? 'AI 生视频' : '故事板',
              ),
              createElement('div', { className: 'agnes-empty-desc' },
                tab === 'image' ? '在右侧输入提示词，点击生成' :
                tab === 'video' ? '在右侧输入提示词，描述想要的视频内容' :
                '导入剧本或新建项目，自动拆解分镜',
              ),
            ),
          ),

          // Action bar
          createElement('div', { className: 'agnes-action-bar' },
            createElement('button', {
              className: 'agnes-btn agnes-btn-primary',
              disabled: loading || !prompt.trim(),
              onClick: tab === 'image' ? handleGenerateImage : handleGenerateVideo,
            }, loading ? `⏳ ${loadingText}` : tab === 'image' ? '✨ 生成图片' : '🎬 生成视频'),
            tab === 'storyboard' && project ? createElement('button', {
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

        // ── Right panel ──
        createElement('div', { className: 'agnes-right' },
          createElement('div', { className: 'agnes-right-scroll' },

            // Prompt section
            createElement('div', { className: 'agnes-section' },
              createElement('div', { className: 'agnes-section-title' }, '📝 提示词'),
              createElement('textarea', {
                className: 'agnes-textarea',
                value: prompt,
                onChange: (e: Event) => setPrompt((e.target as HTMLTextAreaElement).value),
                placeholder: tab === 'image'
                  ? '描述你想要生成的图片...\n\n例如：赛博朋克城市街道，雨夜，霓虹灯倒映在湿漉漉的地面，低角度镜头，电影级光照'
                  : tab === 'video'
                  ? '描述你想要生成的视频...\n\n例如：雨后的未来城市街道，霓虹灯倒映在地面，一辆银色跑车缓慢驶过，电影级运镜'
                  : '选择左侧场景，在此编辑提示词',
                rows: 5,
              }),
            ),

            // Storyboard scene prompt (when in storyboard mode)
            tab === 'storyboard' && project && project.scenes[selectedScene] ? createElement('div', { className: 'agnes-section' },
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

            createElement('div', { className: 'agnes-divider' }),

            // Settings section
            createElement('div', { className: 'agnes-section' },
              createElement('div', { className: 'agnes-section-title' }, '📐 输出设置'),
              // Image settings
              tab === 'image' ? createElement('div', null,
                createElement('div', { className: 'agnes-input-row' },
                  createElement('div', null,
                    createElement('div', { style: { fontSize: '11px', color: 'var(--dsw-alias-label-secondary, #6c6c80)', marginBottom: '4px' } }, '尺寸'),
                    createElement('select', {
                      className: 'agnes-select',
                      value: imageSize,
                      onChange: (e: Event) => setImageSize((e.target as HTMLSelectElement).value),
                    },
                      ...IMAGE_SIZES.map(s =>
                        createElement('option', { key: s, value: s }, s),
                      ),
                    ),
                  ),
                  createElement('div', null,
                    createElement('div', { style: { fontSize: '11px', color: 'var(--dsw-alias-label-secondary, #6c6c80)', marginBottom: '4px' } }, '比例'),
                    createElement('select', {
                      className: 'agnes-select',
                      value: imageRatio,
                      onChange: (e: Event) => setImageRatio((e.target as HTMLSelectElement).value),
                    },
                      ...IMAGE_RATIOS.map(r =>
                        createElement('option', { key: r, value: r }, r),
                      ),
                    ),
                  ),
                ),
              ) : tab === 'video' ? createElement('div', null,
                createElement('div', { style: { fontSize: '11px', color: 'var(--dsw-alias-label-secondary, #6c6c80)', marginBottom: '4px' } }, '时长 (秒)'),
                createElement('select', {
                  className: 'agnes-select',
                  value: videoDuration,
                  onChange: (e: Event) => setVideoDuration((e.target as HTMLSelectElement).value),
                },
                  ...VIDEO_DURATIONS.map(d =>
                    createElement('option', { key: d, value: d }, `${d} 秒`),
                  ),
                ),
              ) : createElement('div', { style: { fontSize: '12px', color: 'var(--dsw-alias-label-secondary, #6c6c80)' } },
                '故事板使用上方统一设置',
              ),
            ),

            createElement('div', { className: 'agnes-divider' }),

            // Reference images
            createElement('div', { className: 'agnes-section' },
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
                style: { marginTop: '8px', fontSize: '11px', color: 'var(--dsw-alias-label-secondary, #6c6c80)' },
              }, `${refImages.length} 张参考图`) : createElement('div', {
                style: { marginTop: '8px', fontSize: '11px', color: 'var(--dsw-alias-label-secondary, #6c6c80)' },
              }, '无参考图（纯文生图/视频模式）'),
            ),

            // Info section
            createElement('div', { className: 'agnes-divider' }),
            createElement('div', { className: 'agnes-section' },
              createElement('div', { className: 'agnes-section-title' }, 'ℹ️ 模型信息'),
              createElement('div', { style: { fontSize: '12px', color: 'var(--dsw-alias-label-secondary, #6c6c80)', lineHeight: '1.6' } },
                createElement('div', null, '🎨 生图: agnes-image-2.5-flash (免费)'),
                createElement('div', null, '🎬 视频: agnes-video-2.5-flash (免费)'),
                createElement('div', null, '📐 支持 1K-4K 图片 / 4-12秒视频'),
                createElement('div', { style: { marginTop: '6px' } },
                  keyStatus === 'ready' ? '🔑 Agnes API Key：已配置'
                    : keyStatus === 'missing' ? '🔑 Agnes API Key：未配置'
                    : '🔑 Agnes API Key：未检测',
                ),
                createElement('button', {
                  className: 'agnes-btn agnes-btn-sm agnes-btn-ghost agnes-btn-full',
                  style: { marginTop: '6px' },
                  onClick: () => setGuideOpen(!guideOpen),
                }, guideOpen ? '收起 Key 指引' : '🔑 首次使用？如何获取 / 配置 Agnes Key'),
              ),
            ),
          ),
        ),
      ),

      // ── Status bar ──
      createElement('div', { className: 'agnes-statusbar' },
        createElement('div', { className: 'agnes-status-dot' }),
        createElement('span', null, keyStatus === 'missing' ? 'Agnes 未连接（缺 API Key）' : 'Agnes 已连接'),
        keyStatus === 'missing' ? createElement('button', {
          className: 'agnes-statusbar-link',
          onClick: () => setGuideOpen(true),
        }, '🔑 如何配置 Key') : null,
        project ? createElement('span', null, `📊 ${project.scenes.length} 个场景`) : null,
        result ? createElement('span', null, `✅ 已生成 ${result.type === 'image' ? '图片' : '视频'}`) : null,
      ),
  )
}
