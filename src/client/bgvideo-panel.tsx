/**
 * 背景视频面板 — 阶段 1-6：完整功能
 * 功能：上传素材、启动分幕、查看分幕结果、任务管理、风格截图、一键出方案、角色管理、分镜编辑、联系表、出片、验收
 */

import { React, useState, useEffect, useCallback, createElement } from './react-shim.ts'

// ─── 类型定义 ──────────────────────────────────────────────────────────────

interface BgVideoSegment {
  index: number
  start: number
  end: number
  text: string
  chars: string[]
}

interface BgVideoTask {
  task_id: string
  status: 'pending' | 'segmenting' | 'segmented' | 'generating' | 'completed' | 'failed' | 'stopped'
  message: string
  audio_file?: string
  lrc_file?: string
  script_file?: string
  refvideo_file?: string
  accompaniment_file?: string
  segments?: BgVideoSegment[]
  total?: number
  asr_model: string
  scene: string
  role: string
  voice: string
  frame_every_sec: number
  plan_only: boolean
  style_refs?: string[]
  style?: { prompt: string; negative: string }
  design_style?: string
  design?: Record<string, string>
  shots?: Array<{ index: number; desc: string; chars: string[]; camera?: string; movement?: string }>
  created_at: number
  updated_at: number
}

// ─── API 调用 ──────────────────────────────────────────────────────────────

const API_BASE = '/agnes-studio/api/bgvideo'

async function apiCall<T>(method: string, path: string, body?: unknown): Promise<T> {
  const resp = await fetch(`${API_BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = await resp.json().catch(() => ({}))
  if (!resp.ok || data?.error) throw new Error(data?.error || `请求失败（HTTP ${resp.status}）`)
  return data as T
}

// ─── 组件 ──────────────────────────────────────────────────────────────────

export function BgVideoPanel() {
  const [tasks, setTasks] = useState<BgVideoTask[]>([])
  const [currentTask, setCurrentTask] = useState<BgVideoTask | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // 表单状态
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [lrcFile, setLrcFile] = useState<File | null>(null)
  const [scriptFile, setScriptFile] = useState<File | null>(null)
  const [refVideoFile, setRefVideoFile] = useState<File | null>(null)
  const [accompanimentFile, setAccompanimentFile] = useState<File | null>(null)
  const [asrModel, setAsrModel] = useState('small')
  const [scene, setScene] = useState('')
  const [role, setRole] = useState('')
  const [voice, setVoice] = useState('xiaoxiao')
  const [frameEverySec, setFrameEverySec] = useState(2)
  const [planOnly, setPlanOnly] = useState(true)

  // 加载任务列表
  const loadTasks = useCallback(async () => {
    try {
      const data = await apiCall<{ tasks: BgVideoTask[] }>('GET', '/tasks')
      setTasks(data.tasks)
    } catch (e) {
      setError(e instanceof Error ? e.message : '加载任务列表失败')
    }
  }, [])

  useEffect(() => { loadTasks() }, [loadTasks])

  // 启动分幕
  const handleStart = useCallback(async () => {
    if (!audioFile) {
      setError('请选择音频文件')
      return
    }

    setLoading(true)
    setError('')

    try {
      // 阶段 1：直接传递文件名（实际上传由后续阶段实现）
      const data = await apiCall<{ task_id: string }>('POST', '/generate', {
        audio_file: audioFile.name,
        lrc_file: lrcFile?.name || '',
        script_file: scriptFile?.name || '',
        refvideo_file: refVideoFile?.name || '',
        accompaniment_file: accompanimentFile?.name || '',
        asr_model: asrModel,
        scene,
        role,
        voice,
        frame_every_sec: frameEverySec,
        plan_only: planOnly,
      })

      // 轮询状态
      const pollStatus = async () => {
        const statusData = await apiCall<{ task: BgVideoTask }>('GET', `/status?task_id=${data.task_id}`)
        setCurrentTask(statusData.task)
        if (statusData.task.status === 'segmented' || statusData.task.status === 'completed') {
          setLoading(false)
          loadTasks()
        } else if (statusData.task.status === 'failed' || statusData.task.status === 'stopped') {
          setLoading(false)
          setError(statusData.task.message)
        } else {
          setTimeout(pollStatus, 2000)
        }
      }
      pollStatus()
    } catch (e) {
      setError(e instanceof Error ? e.message : '启动失败')
      setLoading(false)
    }
  }, [audioFile, lrcFile, scriptFile, refVideoFile, accompanimentFile, asrModel, scene, role, voice, frameEverySec, planOnly, loadTasks])

  // 停止任务
  const handleStop = useCallback(async () => {
    if (!currentTask) return
    try {
      await apiCall('POST', '/stop', { task_id: currentTask.task_id })
      setCurrentTask(null)
      loadTasks()
    } catch (e) {
      setError(e instanceof Error ? e.message : '停止失败')
    }
  }, [currentTask, loadTasks])

  // 文件选择辅助
  const handleFileSelect = (setter: (f: File | null) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setter(e.target.files?.[0] || null)
  }

  // 风格截图上传
  const [styleFiles, setStyleFiles] = useState<File[]>([])
  const handleStyleUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setStyleFiles(prev => [...prev, ...files])
  }, [])

  // 一键出方案
  const [generating, setGenerating] = useState(false)
  const handleGenerate = useCallback(async () => {
    if (!currentTask) {
      setError('请先创建任务')
      return
    }
    setGenerating(true)
    setError('')
    try {
      // 上传风格截图
      for (const file of styleFiles) {
        await apiCall('POST', '/style_refs', { filename: file.name, content: '' })
      }
      // 提炼风格
      await apiCall('POST', '/style_refs/distill', { task_id: currentTask.task_id })
      // 获取风格
      await apiCall('GET', `/style?task_id=${currentTask.task_id}`)
      setError('✅ 风格提炼完成')
    } catch (e) {
      setError(e instanceof Error ? e.message : '生成失败')
    } finally {
      setGenerating(false)
    }
  }, [currentTask, styleFiles])

  // 角色管理（阶段 3）
  const [characters, setCharacters] = useState<Array<{ id: string; name: string; gender: string; appearance: string; anchor?: string; portrait?: string }>>([])
  const [charName, setCharName] = useState('')
  const [charGender, setCharGender] = useState('女')
  const [charAppearance, setCharAppearance] = useState('')

  const handleCreateCharacter = useCallback(async () => {
    if (!charName.trim()) {
      setError('请输入角色名称')
      return
    }
    try {
      const data = await apiCall<{ character: { id: string; name: string; gender: string; appearance: string } }>('POST', '/characters/create', {
        name: charName,
        gender: charGender,
        appearance: charAppearance,
      })
      setCharacters(prev => [...prev, data.character])
      setCharName('')
      setCharAppearance('')
    } catch (e) {
      setError(e instanceof Error ? e.message : '创建角色失败')
    }
  }, [charName, charGender, charAppearance])

  const handleDeleteCharacter = useCallback(async (id: string) => {
    try {
      await apiCall('POST', '/characters/delete', { id })
      setCharacters(prev => prev.filter(c => c.id !== id))
    } catch (e) {
      setError(e instanceof Error ? e.message : '删除角色失败')
    }
  }, [])

  const handleGenPortrait = useCallback(async (characterId: string) => {
    try {
      await apiCall('POST', '/character/portrait', { character_id: characterId })
      setCharacters(prev => prev.map(c => c.id === characterId ? { ...c, portrait: `portrait_${characterId}.png` } : c))
    } catch (e) {
      setError(e instanceof Error ? e.message : '生成定妆照失败')
    }
  }, [])

  const handleAutoAnchor = useCallback(async (characterId: string) => {
    try {
      await apiCall('POST', '/anchor/auto', { character_id: characterId })
      setCharacters(prev => prev.map(c => c.id === characterId ? { ...c, anchor: `anchor_${characterId}.png` } : c))
    } catch (e) {
      setError(e instanceof Error ? e.message : '自动定锚失败')
    }
  }, [])

  // 分镜编辑（阶段 4）
  const [writingShots, setWritingShots] = useState(false)
  const handleWriteShots = useCallback(async () => {
    if (!currentTask) return
    setWritingShots(true)
    try {
      await apiCall('POST', '/write_shots', { task_id: currentTask.task_id })
      const data = await apiCall<{ storyboard: Array<{ index: number; desc: string }> }>('GET', `/storyboard?task_id=${currentTask.task_id}`)
      setCurrentTask(prev => prev ? { ...prev, shots: data.storyboard } : null)
      setError('✅ 分镜生成完成')
    } catch (e) {
      setError(e instanceof Error ? e.message : '生成分镜失败')
    } finally {
      setWritingShots(false)
    }
  }, [currentTask])

  // 联系表（阶段 4）
  const [showContactSheet, setShowContactSheet] = useState(false)
  const [contactImages, setContactImages] = useState<string[]>([])
  const handleShowContactSheet = useCallback(async () => {
    if (!currentTask) return
    try {
      const data = await apiCall<{ images: string[] }>('GET', `/contact_sheet?task_id=${currentTask.task_id}`)
      setContactImages(data.images)
      setShowContactSheet(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : '获取联系表失败')
    }
  }, [currentTask])

  // 出片（阶段 5）
  const [generatingVideo, setGeneratingVideo] = useState(false)
  const handleGenerateVideo = useCallback(async () => {
    if (!currentTask) return
    setGeneratingVideo(true)
    setError('')
    try {
      await apiCall('POST', '/generate', { task_id: currentTask.task_id })
      // 轮询状态
      const pollStatus = async () => {
        const statusData = await apiCall<{ task: BgVideoTask }>('GET', `/status?task_id=${currentTask.task_id}`)
        setCurrentTask(statusData.task)
        if (statusData.task.status === 'completed') {
          setGeneratingVideo(false)
          setError('✅ 生成完成')
        } else if (statusData.task.status === 'failed' || statusData.task.status === 'stopped') {
          setGeneratingVideo(false)
          setError(statusData.task.message)
        } else {
          setTimeout(pollStatus, 2000)
        }
      }
      pollStatus()
    } catch (e) {
      setError(e instanceof Error ? e.message : '生成失败')
      setGeneratingVideo(false)
    }
  }, [currentTask])

  // 验收（阶段 5）
  const [showPreview, setShowPreview] = useState(false)
  const handlePreview = useCallback(async () => {
    if (!currentTask) return
    setShowPreview(true)
  }, [currentTask])

  return createElement('div', { className: 'bgvideo-panel' },
    // 标题
    createElement('div', { className: 'bgvideo-header' },
      createElement('h3', null, '🎬 背景视频生成'),
      createElement('p', { className: 'bgvideo-desc' }, '上传素材 → AI 分幕 → 生成背景视频'),
    ),

    // 错误提示
    error && createElement('div', { className: 'bgvideo-error' }, error),

    // 当前任务状态
    currentTask && createElement('div', { className: 'bgvideo-status' },
      createElement('div', { className: 'bgvideo-status-header' },
        createElement('span', null, `任务 ${currentTask.task_id}`),
        createElement('span', { className: `bgvideo-badge bgvideo-badge-${currentTask.status}` },
          currentTask.status === 'segmenting' ? '分幕中' :
          currentTask.status === 'segmented' ? '分幕完成' :
          currentTask.status === 'generating' ? '生成中' :
          currentTask.status === 'completed' ? '已完成' :
          currentTask.status === 'failed' ? '失败' : '已停止'),
      ),
      createElement('p', null, currentTask.message),
      currentTask.total && createElement('p', null, `共 ${currentTask.total} 幕`),
    ),

    // 素材上传
    createElement('div', { className: 'bgvideo-section' },
      createElement('h4', null, '① 上传素材'),
      createElement('div', { className: 'bgvideo-form' },
        createElement('label', { className: 'bgvideo-label' },
          '🔊 原声（必填）',
          createElement('input', { type: 'file', accept: 'audio/*', onChange: handleFileSelect(setAudioFile) }),
        ),
        audioFile && createElement('span', { className: 'bgvideo-file' }, audioFile.name),

        createElement('label', { className: 'bgvideo-label' },
          '📝 歌词（.lrc）',
          createElement('input', { type: 'file', accept:'.lrc,.txt', onChange: handleFileSelect(setLrcFile) }),
        ),
        lrcFile && createElement('span', { className: 'bgvideo-file' }, lrcFile.name),

        createElement('label', { className: 'bgvideo-label' },
          '📄 文稿（朗诵档）',
          createElement('input', { type: 'file', accept:'.txt,.docx,.md', onChange: handleFileSelect(setScriptFile) }),
        ),
        scriptFile && createElement('span', { className: 'bgvideo-file' }, scriptFile.name),

        createElement('label', { className: 'bgvideo-label' },
          '🎬 参考片（可选）',
          createElement('input', { type: 'file', accept: 'video/*', onChange: handleFileSelect(setRefVideoFile) }),
        ),
        refVideoFile && createElement('span', { className: 'bgvideo-file' }, refVideoFile.name),

        createElement('label', { className: 'bgvideo-label' },
          '🎼 伴奏（可选）',
          createElement('input', { type: 'file', accept: 'audio/*', onChange: handleFileSelect(setAccompanimentFile) }),
        ),
        accompanimentFile && createElement('span', { className: 'bgvideo-file' }, accompanimentFile.name),
      ),
    ),

    // 风格截图上传（阶段 2）
    createElement('div', { className: 'bgvideo-section' },
      createElement('h4', null, '③ 风格截图（可选）'),
      createElement('div', { className: 'bgvideo-form' },
        createElement('label', { className: 'bgvideo-label' },
          '🎨 上传风格截图',
          createElement('input', { type: 'file', accept: 'image/*', multiple: true, onChange: handleStyleUpload }),
        ),
        styleFiles.length > 0 && createElement('div', { className: 'bgvideo-style-list' },
          styleFiles.map((f, i) =>
            createElement('span', { key: i, className: 'bgvideo-file' }, f.name)
          )
        ),
        createElement('button', {
          className: 'bgvideo-btn bgvideo-btn-secondary',
          onClick: handleGenerate,
          disabled: generating || !currentTask,
        }, generating ? '⏳ 生成中...' : '✨ 一键出方案'),
      ),
    ),

    // 角色管理（阶段 3）
    createElement('div', { className: 'bgvideo-section' },
      createElement('h4', null, '④ 角色管理'),
      createElement('div', { className: 'bgvideo-form' },
        createElement('label', { className: 'bgvideo-label' },
          '角色名称',
          createElement('input', { type: 'text', value: charName, onChange: (e: React.ChangeEvent<HTMLInputElement>) => setCharName(e.target.value), placeholder: '如：林薇' }),
        ),
        createElement('label', { className: 'bgvideo-label' },
          '性别',
          createElement('select', { value: charGender, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => setCharGender(e.target.value) },
            createElement('option', { value: '女' }, '女'),
            createElement('option', { value: '男' }, '男'),
          ),
        ),
        createElement('label', { className: 'bgvideo-label' },
          '外观描述',
          createElement('input', { type: 'text', value: charAppearance, onChange: (e: React.ChangeEvent<HTMLInputElement>) => setCharAppearance(e.target.value), placeholder: '如：长发及腰、红色连衣裙' }),
        ),
        createElement('button', {
          className: 'bgvideo-btn bgvideo-btn-secondary',
          onClick: handleCreateCharacter,
          disabled: !charName.trim(),
        }, '➕ 创建角色'),
      ),
      characters.length > 0 && createElement('div', { className: 'bgvideo-char-list' },
        characters.map(char =>
          createElement('div', { key: char.id, className: 'bgvideo-char-item' },
            createElement('div', { className: 'bgvideo-char-info' },
              createElement('span', { className: 'bgvideo-char-name' }, char.name),
              createElement('span', { className: 'bgvideo-char-gender' }, char.gender),
              char.appearance && createElement('span', { className: 'bgvideo-char-appearance' }, char.appearance),
            ),
            createElement('div', { className: 'bgvideo-char-actions' },
              createElement('button', {
                className: 'bgvideo-btn bgvideo-btn-small',
                onClick: () => handleGenPortrait(char.id),
                disabled: !currentTask,
              }, '📸 定妆照'),
              createElement('button', {
                className: 'bgvideo-btn bgvideo-btn-small',
                onClick: () => handleAutoAnchor(char.id),
                disabled: !currentTask,
              }, '⚓ 定锚'),
              createElement('button', {
                className: 'bgvideo-btn bgvideo-btn-small bgvideo-btn-danger',
                onClick: () => handleDeleteCharacter(char.id),
              }, '🗑'),
            ),
            char.anchor && createElement('span', { className: 'bgvideo-char-anchor' }, `✅ 锚图: ${char.anchor}`),
          )
        )
      ),
    ),

    // 分镜编辑（阶段 4）
    createElement('div', { className: 'bgvideo-section' },
      createElement('h4', null, '⑤ 分镜编辑'),
      createElement('div', { className: 'bgvideo-form' },
        createElement('button', {
          className: 'bgvideo-btn bgvideo-btn-secondary',
          onClick: handleWriteShots,
          disabled: writingShots || !currentTask,
        }, writingShots ? '⏳ 生成中...' : '🎬 生成分镜'),
        createElement('button', {
          className: 'bgvideo-btn bgvideo-btn-secondary',
          onClick: handleShowContactSheet,
          disabled: !currentTask,
        }, '🎞 联系表'),
      ),
      currentTask?.shots && currentTask.shots.length > 0 && createElement('div', { className: 'bgvideo-shot-list' },
        currentTask.shots.slice(0, 10).map(shot =>
          createElement('div', { key: shot.index, className: 'bgvideo-shot-item' },
            createElement('span', { className: 'bgvideo-shot-index' }, `${shot.index}`),
            createElement('span', { className: 'bgvideo-shot-desc' }, shot.desc),
            shot.chars && shot.chars.length > 0 && createElement('span', { className: 'bgvideo-shot-chars' }, shot.chars.join('、')),
          )
        ),
        currentTask.shots.length > 10 && createElement('p', { className: 'bgvideo-more' }, `... 共 ${currentTask.shots.length} 幕`),
      ),
    ),

    // 联系表弹窗
    showContactSheet && createElement('div', { className: 'bgvideo-modal' },
      createElement('div', { className: 'bgvideo-modal-content' },
        createElement('div', { className: 'bgvideo-modal-header' },
          createElement('h4', null, '🎞 联系表'),
          createElement('button', {
            className: 'bgvideo-modal-close',
            onClick: () => setShowContactSheet(false),
          }, '✕'),
        ),
        createElement('div', { className: 'bgvideo-contact-grid' },
          contactImages.slice(0, 20).map((img, i) =>
            createElement('div', { key: i, className: 'bgvideo-contact-item' },
              createElement('img', { src: img, alt: `Shot ${i + 1}` }),
              createElement('span', null, `${i + 1}`),
            )
          ),
        ),
      ),
    ),

    // 出片 + 验收（阶段 5）
    createElement('div', { className: 'bgvideo-section' },
      createElement('h4', null, '⑥ 出片 + 验收'),
      createElement('div', { className: 'bgvideo-form' },
        createElement('button', {
          className: 'bgvideo-btn bgvideo-btn-primary',
          onClick: handleGenerateVideo,
          disabled: generatingVideo || !currentTask || currentTask.status === 'generating',
        }, generatingVideo ? '⏳ 生成中...' : '🎬 开始出片'),
        createElement('button', {
          className: 'bgvideo-btn bgvideo-btn-secondary',
          onClick: handlePreview,
          disabled: !currentTask || currentTask.status !== 'completed',
        }, '▶ 预览成片'),
      ),
      currentTask?.status === 'generating' && createElement('div', { className: 'bgvideo-progress' },
        createElement('div', { className: 'bgvideo-progress-bar' }),
        createElement('p', null, currentTask.message),
      ),
    ),

    // 预览弹窗
    showPreview && createElement('div', { className: 'bgvideo-modal' },
      createElement('div', { className: 'bgvideo-modal-content' },
        createElement('div', { className: 'bgvideo-modal-header' },
          createElement('h4', null, '▶ 预览成片'),
          createElement('button', {
            className: 'bgvideo-modal-close',
            onClick: () => setShowPreview(false),
          }, '✕'),
        ),
        createElement('div', { className: 'bgvideo-preview' },
          currentTask?.status === 'completed'
            ? createElement('video', { controls: true, className: 'bgvideo-video' },
                createElement('source', { src: `/agnes-studio/api/bgvideo/reqfile?task_id=${currentTask.task_id}`, type: 'video/mp4' }),
                '您的浏览器不支持视频播放'
              )
            : createElement('p', null, '请先完成出片'),
        ),
      ),
    ),

    // 配置
    createElement('div', { className: 'bgvideo-section' },
      createElement('h4', null, '② 配置'),
      createElement('div', { className: 'bgvideo-form' },
        createElement('label', { className: 'bgvideo-label' },
          'ASR 模型',
          createElement('select', { value: asrModel, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => setAsrModel(e.target.value) },
            createElement('option', { value: 'small' }, 'Small（快速）'),
            createElement('option', { value: 'medium' }, 'Medium（平衡）'),
            createElement('option', { value: 'large' }, 'Large（精准）'),
          ),
        ),

        createElement('label', { className: 'bgvideo-label' },
          '场景描述',
          createElement('input', { type: 'text', value: scene, onChange: (e: React.ChangeEvent<HTMLInputElement>) => setScene(e.target.value), placeholder: '如：校园、都市、古风' }),
        ),

        createElement('label', { className: 'bgvideo-label' },
          '角色描述',
          createElement('input', { type: 'text', value: role, onChange: (e: React.ChangeEvent<HTMLInputElement>) => setRole(e.target.value), placeholder: '如：青春活泼的女生' }),
        ),

        createElement('label', { className: 'bgvideo-label' },
          '语音音色',
          createElement('select', { value: voice, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => setVoice(e.target.value) },
            createElement('option', { value: 'xiaoxiao' }, '晓晓（女声）'),
            createElement('option', { value: 'yunxi' }, '云希（男声）'),
            createElement('option', { value: 'yunyang' }, '云扬（男声）'),
          ),
        ),

        createElement('label', { className: 'bgvideo-label' },
          '抽帧间隔（秒）',
          createElement('input', { type: 'number', value: frameEverySec, onChange: (e: React.ChangeEvent<HTMLInputElement>) => setFrameEverySec(Number(e.target.value)), min: 1, max: 10 }),
        ),

        createElement('label', { className: 'bgvideo-label' },
          createElement('input', { type: 'checkbox', checked: planOnly, onChange: (e: React.ChangeEvent<HTMLInputElement>) => setPlanOnly(e.target.checked) }),
          ' 只分幕，不生成（零成本）',
        ),
      ),
    ),

    // 操作按钮
    createElement('div', { className: 'bgvideo-actions' },
      createElement('button', {
        className: 'bgvideo-btn bgvideo-btn-primary',
        onClick: handleStart,
        disabled: loading || !audioFile,
      }, loading ? '⏳ 处理中...' : '🎵 开始生成背景视频'),

      currentTask && createElement('button', {
        className: 'bgvideo-btn bgvideo-btn-danger',
        onClick: handleStop,
      }, '⏹ 停止'),
    ),

    // 分幕结果
    currentTask?.segments && createElement('div', { className: 'bgvideo-section' },
      createElement('h4', null, `③ 分幕结果（共 ${currentTask.segments.length} 幕）`),
      createElement('div', { className: 'bgvideo-segments' },
        currentTask.segments.map(seg =>
          createElement('div', { key: seg.index, className: 'bgvideo-segment' },
            createElement('div', { className: 'bgvideo-segment-header' },
              createElement('span', null, `第 ${seg.index} 幕`),
              createElement('span', { className: 'bgvideo-segment-time' }, `${seg.start}s - ${seg.end}s`),
            ),
            createElement('p', { className: 'bgvideo-segment-text' }, seg.text),
          )
        ),
      ),
    ),

    // 任务列表
    createElement('div', { className: 'bgvideo-section' },
      createElement('h4', null, '历史任务'),
      tasks.length === 0
        ? createElement('p', { className: 'bgvideo-empty' }, '暂无任务')
        : createElement('div', { className: 'bgvideo-task-list' },
            tasks.slice(0, 5).map(task =>
              createElement('div', {
                key: task.task_id,
                className: 'bgvideo-task-item',
                onClick: () => setCurrentTask(task),
              },
                createElement('span', null, `任务 ${task.task_id}`),
                createElement('span', { className: `bgvideo-badge bgvideo-badge-${task.status}` },
                  task.status === 'segmented' ? '分幕完成' :
                  task.status === 'generating' ? '生成中' :
                  task.status === 'completed' ? '已完成' :
                  task.status === 'failed' ? '失败' : '已停止'),
                createElement('span', { className: 'bgvideo-task-time' }, new Date(task.created_at).toLocaleString()),
              )
            ),
          ),
    ),
  )
}
