/**
 * 创作台面板 —— 把 Oh Story 那套「在对话里敲命令建工作区、生成小说」搬成图形界面。
 *
 * 结构（自上而下）：
 *   工作区 → 创作项目（识别 / 一键新建）→ **创作流程**（当前选中项目，逐步引导）
 *   → 文件（浏览 / 编辑）→ 自由任务
 *
 * 「创作流程」是这一页的核心：选中一个项目后，按项目类型列出它该有的几步
 * （总纲 / 世界观 / 正文…），检查各文件是否已有实质内容，把**第一个未完成的**
 * 标成「下一步」，并给一个按钮直接发起对应的创作任务。
 *
 * 能力边界：文件层的事全在这里做（不经模型）；需要写内容的那几步本质上是
 * **模型创作** —— 按钮只负责把一条含上下文的提示词发给当前会话，后台仍由 Agent
 * 按对应技能执行，结果写回项目文件，回来点「刷新进度」即可看到。
 *
 * 数据全部来自宿主半 /agnes-studio/api/ohstory/*（见 src/ohstory-fs.ts）。
 */
import { useState, useEffect, useCallback, createElement } from './react-shim.ts'
import { injectStyles } from './styles.ts'
import {
  fetchWorkspaces, fetchProjects, fetchEntries, readFile, writeFile, createProject,
  type DshWorkspace, type CreativeProject, type FsEntry,
} from './ohstory.ts'

const ROW = { display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' as const }
const HINT = { fontSize: '11px', color: 'var(--ag-text-3, #6e80a3)' }
const INPUT = {
  height: '30px', padding: '0 8px', borderRadius: '6px', fontSize: '12px',
  border: '1px solid rgba(255,255,255,0.1)', background: 'var(--ag-surface-2, #252538)',
  color: 'var(--ag-text)', boxSizing: 'border-box' as const,
}

const KIND_LABEL: Record<string, string> = { long: '长篇', short: '短篇', analysis: '拆文库' }

/** 一个创作步骤。 */
interface Step {
  key: string
  label: string
  /** 用来判断进度的文件（相对项目目录）。 */
  probe: string
  /** 超过这个字节数才算「已有内容」。 */
  minBytes: number
  /** 已有内容时可打开看的文件。 */
  open?: string
  /** 发起任务时交给 Agent 的那句话。 */
  intent: string
  /** 可以反复做（写完一章还能写下一章）。 */
  repeatable?: boolean
}

/**
 * 按项目类型给出创作步骤。
 * @param project - 项目。
 * @returns 步骤清单（拆文库没有写作流程，返回空）。
 */
function stepsOf(project: CreativeProject, chapterCount: number): Step[] {
  const name = project.name
  if (project.kind === 'long') {
    const next = chapterCount + 1
    const pad = String(next).padStart(3, '0')
    return [
      {
        key: 'outline', label: '总纲（写什么）', probe: '大纲/总纲.md', minBytes: 200,
        open: '大纲/总纲.md',
        intent: `用 story-long-write 技能，为长篇《${name}》写总纲，写入 大纲/总纲.md（保留已成文内容）。至少包含：一句话简介、主角设定、核心冲突、分卷规划。信息不足时先问我题材与主角。`,
      },
      {
        key: 'world', label: '世界观设定', probe: '设定/世界观.md', minBytes: 200,
        open: '设定/世界观.md',
        intent: `用 story-long-write 技能，为长篇《${name}》写世界观设定，写入 设定/世界观.md。包含时代背景、核心规则、势力格局、金手指（若有）。`,
      },
      {
        // 动态：写完一章后这一步自动变成「第 N+1 章」，所以可以一直往下续
        key: 'chapter', label: next === 1 ? '第一章' : `第 ${next} 章`,
        probe: `正文/第${pad}章.md`, minBytes: 500,
        open: `正文/第${pad}章.md`,
        repeatable: true,
        intent: next === 1
          ? `用 story-long-write 技能，为长篇《${name}》写第一章，写入 正文/第001章.md，并更新 追踪/_tracking-state.json 记录本章。第一章要有钩子。`
          : `用 story-long-write 技能，为长篇《${name}》续写第 ${next} 章，写入 正文/第${pad}章.md，并更新 追踪/_tracking-state.json 记录本章。请先读 追踪/上下文.md 与上一章结尾，接住悬念。`,
      },
    ]
  }
  if (project.kind === 'short') {
    return [
      {
        key: 'outline', label: '小节大纲', probe: '小节大纲.md', minBytes: 200,
        open: '小节大纲.md',
        intent: `用 story-short-write 技能，为短篇《${name}》写小节大纲，写入 小节大纲.md。突出情绪线与反转。`,
      },
      {
        key: 'body', label: '正文', probe: '正文.md', minBytes: 500, repeatable: true,
        open: '正文.md',
        intent: `用 story-short-write 技能，按 小节大纲.md 为《${name}》写正文，写入 正文.md。`,
      },
    ]
  }
  return []
}

interface Props {
  /** 向当前会话发一条提示词。拿不到时（宿主未注入）为 undefined。 */
  sendTask?: (text: string) => void
}

/**
 * 创作台。
 * @param props - sendTask 由槽位注入。
 * @returns 面板内容。
 */
export function OhStoryPanel({ sendTask }: Props): unknown {
  injectStyles()

  const [workspaces, setWorkspaces] = useState<DshWorkspace[]>([])
  const [root, setRoot] = useState('')
  const [projects, setProjects] = useState<CreativeProject[]>([])
  const [project, setProject] = useState<CreativeProject | null>(null)
  /** 当前选中项目的文件 → 字节数（用于判断各步骤进度）。 */
  const [projectFiles, setProjectFiles] = useState<Map<string, number>>(new Map())
  /** 当前浏览的相对目录（'' 为工作区根）。 */
  const [browseDir, setBrowseDir] = useState('')
  const [entries, setEntries] = useState<FsEntry[]>([])
  const [editing, setEditing] = useState<{ rel: string; content: string; dirty: boolean } | null>(null)
  const [newName, setNewName] = useState('')
  const [taskText, setTaskText] = useState('')
  const [busy, setBusy] = useState(false)
  /** 正在执行的任务：面板自己盯目标文件来判断进度，用户不用去盯对话框。 */
  const [task, setTask] = useState<{ label: string; probe: string; before: number; startedAt: number; state: 'running' | 'done' | 'stalled' } | null>(null)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  /** 挂载：拉工作区清单，默认选第一个。 */
  useEffect(() => {
    void (async () => {
      const ws = await fetchWorkspaces()
      setWorkspaces(ws)
      if (ws.length > 0) setRoot(ws[0].path)
      else setError('没读到任何 DSH 工作区（检查 DSH_HOME/storages/workspace.json）')
    })()
  }, [])

  /** 切工作区：重拉项目、清空选中。 */
  useEffect(() => {
    if (root === '') return
    setProject(null)
    setProjectFiles(new Map())
    setBrowseDir('')
    setEditing(null)
    void (async () => {
      try {
        setProjects(await fetchProjects(root))
        setError('')
      } catch (e) {
        setError(e instanceof Error ? e.message : '加载项目失败')
      }
    })()
  }, [root])

  /** 列某个目录。 */
  const browse = useCallback(async (rel: string) => {
    if (root === '') return
    try {
      setEntries(await fetchEntries(root, rel))
      setBrowseDir(rel)
      setError('')
    } catch (e) {
      setError(e instanceof Error ? e.message : '列目录失败')
    }
  }, [root])

  useEffect(() => {
    if (root !== '' && project === null) void browse('')
  }, [root, project, browse])

  /** 递归收集一个项目下的文件与大小（两层深，够覆盖 正文/大纲/设定/追踪）。 */
  const scanProject = useCallback(async (p: CreativeProject) => {
    const files = new Map<string, number>()
    try {
      const top = await fetchEntries(root, p.dir)
      for (const en of top) {
        if (en.type === 'file') {
          files.set(en.rel.slice(p.dir.length + 1), en.size ?? 0)
        } else {
          const kids = await fetchEntries(root, en.rel)
          for (const k of kids) {
            if (k.type === 'file') files.set(k.rel.slice(p.dir.length + 1), k.size ?? 0)
          }
        }
      }
    } catch { /* 读不到就当空 */ }
    setProjectFiles(files)
    return files
  }, [root])

  /** 选中一个项目。 */
  const pick = useCallback(async (p: CreativeProject) => {
    setProject(p)
    setEditing(null)
    setNotice('')
    await scanProject(p)
    void browse(p.dir)
  }, [browse, scanProject])

  /** 重新检查当前项目的进度（Agent 写完内容后点）。 */
  const refresh = useCallback(async () => {
    if (project === null) return
    setBusy(true)
    try {
      await scanProject(project)
      await browse(browseDir)
      setNotice('进度已刷新')
    } finally {
      setBusy(false)
    }
  }, [project, scanProject, browse, browseDir])

  /** 把一个创作动作发给当前会话。 */
  const runStep = useCallback((step: Step) => {
    if (sendTask === undefined || project === null) return
    sendTask(step.intent)
    // 记下发送前的大小，之后靠"文件变大了"来判断它写完了 ——
    // 这样进度显示在面板里，不用切到对话框去看。
    setTask({
      label: step.label,
      probe: step.probe,
      before: projectFiles.get(step.probe) ?? 0,
      startedAt: Date.now(),
      state: 'running',
    })
    setNotice('')
  }, [sendTask, project, projectFiles])

  /** 跟踪：每 3 秒看一次目标文件有没有写出来。 */
  useEffect(() => {
    if (task === null || task.state !== 'running' || project === null || root === '') return undefined
    const timer = setInterval(() => {
      void (async () => {
        const files = await scanProject(project)
        const size = files.get(task.probe)
        if (size !== undefined && size >= 200 && size > task.before) {
          setTask(t => (t === null ? null : { ...t, state: 'done' }))
        } else if (Date.now() - task.startedAt > 5 * 60 * 1000) {
          setTask(t => (t === null ? null : { ...t, state: 'stalled' }))
        }
      })()
    }, 3000)
    return () => { clearInterval(timer) }
  }, [task, project, root, scanProject])

  /** 打开一个文件。 */
  const open = useCallback(async (rel: string) => {
    try {
      const f = await readFile(root, rel)
      setEditing({ rel, content: f.content, dirty: false })
      setNotice('')
      setError('')
    } catch (e) {
      setError(e instanceof Error ? e.message : '读取失败')
    }
  }, [root])

  /** 保存当前编辑。 */
  const save = useCallback(async () => {
    if (editing === null) return
    setBusy(true)
    try {
      await writeFile(root, editing.rel, editing.content)
      setEditing({ ...editing, dirty: false })
      if (project !== null) await scanProject(project)
      setNotice(`已保存 ${editing.rel}`)
      setError('')
    } catch (e) {
      setError(e instanceof Error ? e.message : '保存失败')
    } finally {
      setBusy(false)
    }
  }, [editing, root, project, scanProject])

  /** 新建项目（纯模板，不经 Agent），建完直接选中它。 */
  const makeProject = useCallback(async (kind: 'long' | 'short') => {
    if (newName.trim() === '') return
    setBusy(true)
    try {
      const dir = await createProject(root, kind, newName.trim())
      setNewName('')
      const list = await fetchProjects(root)
      setProjects(list)
      setNotice(`已创建${KIND_LABEL[kind]}项目「${dir}」—— 下面是它的创作流程，第一步点「✨ 生成」`)
      setError('')
      const created = list.find(p => p.dir === dir)
      if (created !== undefined) await pick(created)
      else void browse('')
    } catch (e) {
      setError(e instanceof Error ? e.message : '创建失败')
    } finally {
      setBusy(false)
    }
  }, [newName, root, browse, pick])

  /** 自由任务。 */
  const fire = useCallback(() => {
    if (sendTask === undefined || taskText.trim() === '') return
    sendTask(taskText.trim())
    setTaskText('')
    setNotice('已把任务发给当前会话 —— 执行过程在对话框里，结果会写回项目文件')
  }, [sendTask, taskText])

  const crumbs = browseDir === '' ? [] : browseDir.split('/')

  // ── 流程状态：每一步是否已有内容，第一个未完成的就是「下一步」 ──
  /** 已有正文章节数（按 正文/第NNN章.md 数）。 */
  const chapterCount = [...projectFiles.keys()]
    .filter(k => /^正文\/第\d+章\.md$/.test(k)).length
  const steps = project === null ? [] : stepsOf(project, chapterCount)
  const stepState = steps.map(s => {
    const size = projectFiles.get(s.probe)
    return { step: s, size, done: size !== undefined && size >= s.minBytes }
  })
  const nextIdx = stepState.findIndex(x => !x.done)

  return createElement('div', { className: 'agnes-settings', style: { padding: '16px', overflowY: 'auto', height: '100%' } },
    createElement('div', { style: { fontSize: '16px', fontWeight: 700, marginBottom: '4px' } }, '✍️ 创作台'),
    createElement('div', { style: { ...HINT, marginBottom: '14px' } },
      '建项目 → 照流程一步步生成 → 内容都落在项目目录里。生成由模型完成，所以中间会在对话框里看到它执行。'),

    // ── 工作区 ──
    createElement('div', { className: 'agnes-setting-group' },
      createElement('div', { className: 'agnes-setting-group-title' }, '📂 工作区'),
      createElement('div', { style: ROW },
        createElement('select', {
          style: { ...INPUT, minWidth: '260px', flex: 1 },
          value: root,
          onChange: (e: Event) => setRoot((e.target as HTMLSelectElement).value),
        },
          ...(workspaces.length === 0
            ? [createElement('option', { key: 'none', value: '' }, '（未读到工作区）')]
            : workspaces.map(w => createElement('option', { key: w.id, value: w.path }, `${w.title}　${w.path}`))),
        ),
        createElement('span', { style: HINT }, `${workspaces.length} 个`),
      ),
    ),

    // ── 项目 ──
    createElement('div', { className: 'agnes-setting-group' },
      createElement('div', { className: 'agnes-setting-group-title' }, '📚 创作项目'),
      createElement('div', { style: { ...ROW, marginBottom: '8px' } },
        createElement('input', {
          style: { ...INPUT, flex: 1, minWidth: '180px' },
          value: newName,
          placeholder: '新项目名，如 都市医仙',
          onChange: (e: Event) => setNewName((e.target as HTMLInputElement).value),
        }),
        createElement('button', {
          className: 'agnes-btn agnes-btn-sm agnes-btn-primary',
          disabled: busy || newName.trim() === '',
          onClick: () => { void makeProject('long') },
        }, '＋ 长篇'),
        createElement('button', {
          className: 'agnes-btn agnes-btn-sm agnes-btn-secondary',
          disabled: busy || newName.trim() === '',
          onClick: () => { void makeProject('short') },
        }, '＋ 短篇'),
      ),
      projects.length === 0
        ? createElement('div', { style: HINT }, '这个工作区里还没有创作项目。上面输入名字即可一键创建。')
        : createElement('div', { style: ROW },
            ...projects.map(p =>
              createElement('button', {
                key: p.dir,
                className: 'agnes-btn agnes-btn-sm ' + (project?.dir === p.dir ? 'agnes-btn-primary' : 'agnes-btn-ghost'),
                title: p.dir,
                onClick: () => { void pick(p) },
              }, `${KIND_LABEL[p.kind] ?? p.kind}·${p.name}`),
            ),
          ),
    ),

    // ── 创作流程（核心）──
    project !== null && steps.length > 0
      ? createElement('div', { className: 'agnes-setting-group' },
          createElement('div', { style: { ...ROW, marginBottom: '8px' } },
            createElement('div', { className: 'agnes-setting-group-title', style: { marginBottom: 0 } },
              `🧭 ${project.name} · 创作流程`),
            createElement('button', {
              className: 'agnes-btn agnes-btn-sm agnes-btn-ghost',
              disabled: busy,
              title: 'Agent 写完后点这里重新检查文件',
              onClick: () => { void refresh() },
            }, busy ? '刷新中…' : '🔄 刷新进度'),
          ),
          nextIdx < 0
            ? createElement('div', { style: { fontSize: '12px', marginBottom: '8px' } },
                '🎉 这几步都有内容了。接着写就往下面的「自由任务」发指令。')
            : null,
          createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: '6px' } },
            ...stepState.map((x, i) =>
              createElement('div', {
                key: x.step.key,
                style: {
                  display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px',
                  borderRadius: '8px',
                  border: i === nextIdx ? '1px solid rgba(108,92,231,0.55)' : '1px solid rgba(255,255,255,0.06)',
                  background: i === nextIdx ? 'rgba(108,92,231,0.10)' : 'transparent',
                },
              },
                createElement('span', { style: { fontSize: '12px', flex: 1 } },
                  `${x.done ? '✅' : i === nextIdx ? '▶' : '·'} ${x.step.label}`),
                createElement('span', { style: HINT },
                  x.size === undefined
                    ? '未创建'
                    : x.size < x.step.minBytes ? `${x.size}B · 还空着` : `${x.size}B`),
                x.done && x.step.open !== undefined
                  ? createElement('button', {
                      className: 'agnes-btn agnes-btn-sm agnes-btn-ghost',
                      onClick: () => { void open(`${project.dir}/${x.step.open}`) },
                    }, '📖 看')
                  : null,
                sendTask !== undefined
                  ? createElement('button', {
                      className: 'agnes-btn agnes-btn-sm ' + (i === nextIdx ? 'agnes-btn-primary' : 'agnes-btn-secondary'),
                      title: '把这条任务发给会话，由 Agent 按技能执行',
                      onClick: () => runStep(x.step),
                    }, x.done
                      ? (x.step.repeatable === true ? '✍️ 写下一章' : '↻ 重写')
                      : '✨ 生成')
                  : null,
              ),
            ),
          ),
          task !== null
            ? createElement('div', {
                style: {
                  marginTop: '8px', padding: '8px 10px', borderRadius: '8px', fontSize: '12px',
                  background: task.state === 'done' ? 'rgba(0,206,201,0.10)' : 'rgba(108,92,231,0.10)',
                  border: '1px solid ' + (task.state === 'done' ? 'rgba(0,206,201,0.35)' : 'rgba(108,92,231,0.35)'),
                },
              },
                task.state === 'running'
                  ? `⏳ 正在生成「${task.label}」…面板每 3 秒自己看一次文件，不用切到对话框盯`
                  : task.state === 'done'
                    ? `✅ 「${task.label}」已写完并落入项目文件。`
                    : `⚠ 「${task.label}」超过 5 分钟还没写出内容。可点「🔄 刷新进度」再看看。`,
              )
            : null,
          sendTask === undefined
            ? createElement('div', { style: { ...HINT, marginTop: '6px' } },
                '当前会话拿不到任务通道（宿主未注入 conversation），只能用下面的文件区手动写。')
            : createElement('div', { style: { ...HINT, marginTop: '6px' } },
                '「生成」由 Agent 按对应技能在后台写文件；过程会出现在会话里（模型必须在那里跑），但进度看这个面板就行。'),
        )
      : null,

    // ── 文件 ──
    createElement('div', { className: 'agnes-setting-group' },
      createElement('div', { style: { ...ROW, marginBottom: '8px' } },
        createElement('div', { className: 'agnes-setting-group-title', style: { marginBottom: 0 } }, '🗂 文件'),
        createElement('button', {
          className: 'agnes-btn agnes-btn-sm agnes-btn-ghost',
          onClick: () => { void browse('') },
        }, '⌂ 工作区根'),
        crumbs.length > 0 ? createElement('span', { style: HINT }, '/ ' + crumbs.join(' / ')) : null,
      ),
      browseDir !== ''
        ? createElement('button', {
            className: 'agnes-btn agnes-btn-sm agnes-btn-ghost',
            style: { marginBottom: '6px' },
            onClick: () => { void browse(browseDir.split('/').slice(0, -1).join('/')) },
          }, '⬆ 上一层')
        : null,
      entries.length === 0
        ? createElement('div', { style: HINT }, '（空目录）')
        : createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: '4px' } },
            ...entries.map(en =>
              createElement('button', {
                key: en.rel,
                className: 'agnes-btn agnes-btn-sm ' + (en.type === 'dir' ? 'agnes-btn-ghost' : 'agnes-btn-secondary'),
                style: { justifyContent: 'flex-start', textAlign: 'left', opacity: en.type === 'file' && en.editable === false ? 0.5 : 1 },
                title: en.rel,
                onClick: () => {
                  if (en.type === 'dir') void browse(en.rel)
                  else if (en.editable === false) setError('该文件类型不支持在面板里编辑')
                  else void open(en.rel)
                },
              }, `${en.type === 'dir' ? '📁' : '📄'} ${en.name}${en.size !== undefined ? `　${en.size}B` : ''}`),
            ),
          ),
    ),

    // ── 编辑器 ──
    editing !== null
      ? createElement('div', { className: 'agnes-setting-group' },
          createElement('div', { style: { ...ROW, marginBottom: '6px' } },
            createElement('div', { className: 'agnes-setting-group-title', style: { marginBottom: 0 } }, '📝 编辑'),
            createElement('span', { style: HINT }, editing.rel),
            editing.dirty ? createElement('span', { style: { ...HINT, color: 'var(--ag-warn, #ffd166)' } }, '未保存') : null,
            createElement('button', {
              className: 'agnes-btn agnes-btn-sm agnes-btn-primary',
              disabled: busy || !editing.dirty,
              onClick: () => { void save() },
            }, busy ? '保存中…' : '💾 保存'),
            createElement('button', {
              className: 'agnes-btn agnes-btn-sm agnes-btn-ghost',
              onClick: () => setEditing(null),
            }, '关闭'),
          ),
          createElement('textarea', {
            style: {
              width: '100%', minHeight: '320px', padding: '10px', borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.1)', background: 'var(--ag-surface-2, #252538)',
              color: 'var(--ag-text)', fontSize: '12.5px', lineHeight: 1.6, fontFamily: 'inherit',
              boxSizing: 'border-box', resize: 'vertical',
            },
            value: editing.content,
            onChange: (e: Event) => setEditing({ ...editing, content: (e.target as HTMLTextAreaElement).value, dirty: true }),
          }),
        )
      : null,

    // ── 自由任务 ──
    createElement('div', { className: 'agnes-setting-group' },
      createElement('div', { className: 'agnes-setting-group-title' }, '🤖 自由任务'),
      sendTask !== undefined
        ? createElement('div', { style: ROW },
            createElement('input', {
              style: { ...INPUT, flex: 1, minWidth: '220px' },
              value: taskText,
              placeholder: '不在流程里的需求，例如：把这章去 AI 味 / 帮我拆这本书',
              onChange: (e: Event) => setTaskText((e.target as HTMLInputElement).value),
              onKeyDown: (e: Event) => { if ((e as KeyboardEvent).key === 'Enter') fire() },
            }),
            createElement('button', {
              className: 'agnes-btn agnes-btn-sm agnes-btn-primary',
              disabled: taskText.trim() === '',
              onClick: () => fire(),
            }, '▶ 发起'),
          )
        : createElement('div', { style: HINT }, '当前会话拿不到任务通道（宿主未注入 conversation）。'),
    ),

    notice ? createElement('div', { style: { ...HINT, marginTop: '10px' } }, '✅ ' + notice) : null,
    error ? createElement('div', { style: { marginTop: '10px', fontSize: '12px', color: '#ff6b6b' } }, '⚠ ' + error) : null,
  )
}
