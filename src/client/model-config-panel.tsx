/**
 * 模型配置页 —— 「设置」页签的主体。
 *
 * 对照墨影 AI 工场的配置中心，这里提供同样的四件事：
 *   1. 每个厂商各自的密钥 / Base URL（含站点覆盖）；
 *   2. 自定义模型：任意 OpenAI 兼容端点，自带 baseUrl 与 key；
 *   3. 连通测试：不消耗生成额度，只探一次 /models 或最小 chat；
 *   4. DSH 侧已配置的厂商与模型只读展示 —— 让用户知道"这里还有一份"。
 *
 * 所有密钥都只存在宿主进程里，本页只显示打码形态；输入框是**只写**的：
 * 不填就表示"不改"，填了就覆盖。
 */
import { createElement, useCallback, useEffect, useState } from './react-shim.ts'
import { iconSvg } from './icons.ts'

/** 厂商视图（与宿主 VendorView 对齐）。 */
interface VendorView {
  id: string
  label: string
  baseUrl: string
  baseUrlOverridden: boolean
  configured: boolean
  source: string
  maskedKey: string
  note: string
}

interface CustomModelView {
  id: string
  name: string
  kind: 'text' | 'image' | 'video'
  baseUrl: string
  vendor: string
  hasKey: boolean
  maskedKey: string
}

interface DshView {
  available: boolean
  providers: Array<{ id: string; models: string[] }>
}

interface ConfigView {
  configPath: string
  vendors: VendorView[]
  customModels: CustomModelView[]
  dsh: DshView
}

/** 来源标签。 */
const SOURCE_LABEL: Record<string, string> = {
  file: '本页配置',
  credentials: 'DSH 凭据',
  env: '.env 环境变量',
  'built-in': '无需配置',
  none: '未配置',
}

const HINT: Record<string, string> = {
  color: 'var(--ag-text-3, #6e80a3)',
  fontSize: '11px',
  lineHeight: '1.6',
}

/** 读接口；宿主没重启时返回 notReady，界面据此给出重启提示而不是报错。 */
async function fetchConfig(): Promise<{ view: ConfigView | null; notReady: boolean; error: string }> {
  try {
    const response = await requestJson('/agnes-studio/api/model-config', 'GET')
    if (response.status === 404) return { view: null, notReady: true, error: '' }
    if (response.status < 200 || response.status >= 300) {
      return { view: null, notReady: false, error: String((response.data as { error?: string }).error ?? `HTTP ${response.status}`) }
    }
    return { view: response.data as unknown as ConfigView, notReady: false, error: '' }
  } catch (e) {
    return { view: null, notReady: false, error: e instanceof Error ? e.message : String(e) }
  }
}

/**
 * 用 XHR 发请求（带 10s 超时）。
 *
 * 为什么不用 fetch：这一页在真实浏览器里出现过 fetch 请求被挂住、既不 resolve
 * 也不 reject 的情况（界面停在"读取中…"）。XHR 有确定性的 timeout 语义，
 * 至少能给出可读的失败，而不是无限等待。
 */
function requestJson(url: string, method: 'GET' | 'POST', body?: unknown): Promise<{ status: number; data: Record<string, unknown> }> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open(method, url, true)
    xhr.timeout = 10_000
    xhr.setRequestHeader('Accept', 'application/json')
    if (body !== undefined) xhr.setRequestHeader('Content-Type', 'application/json')
    xhr.onload = () => {
      let data: Record<string, unknown> = {}
      try { data = JSON.parse(xhr.responseText) as Record<string, unknown> } catch { data = { raw: xhr.responseText.slice(0, 200) } }
      resolve({ status: xhr.status, data })
    }
    xhr.onerror = () => reject(new Error('网络错误：连不上本机后端'))
    xhr.ontimeout = () => reject(new Error('请求超时（10s）：本机后端没有响应'))
    try {
      xhr.send(body === undefined ? undefined : JSON.stringify(body))
    } catch (e) {
      reject(e instanceof Error ? e : new Error(String(e)))
    }
  })
}

async function postJson(path: string, body: unknown): Promise<{ ok: boolean; status: number; data: Record<string, unknown> }> {
  const r = await requestJson(path, 'POST', body)
  return { ok: r.status >= 200 && r.status < 300, status: r.status, data: r.data }
}

/** 模型配置页。 */
export function ModelConfigPanel(): unknown {
  const [view, setView] = useState<ConfigView | null>(null)
  const [notReady, setNotReady] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState('')

  // 正在编辑的厂商（baseUrl / key 输入框）
  const [draft, setDraft] = useState<Record<string, { baseUrl: string; apiKey: string }>>({})
  const [testing, setTesting] = useState<string>('')
  const [testResult, setTestResult] = useState<Record<string, { ok: boolean; detail: string }>>({})

  // 自定义模型表单
  const [newModel, setNewModel] = useState({ id: '', name: '', kind: 'text' as 'text' | 'image' | 'video', baseUrl: '', apiKey: '' })

  const reload = useCallback(async () => {
    const result = await fetchConfig()
    setView(result.view)
    setNotReady(result.notReady)
    setError(result.error)
    if (result.view !== null) {
      const next: Record<string, { baseUrl: string; apiKey: string }> = {}
      for (const vendor of result.view.vendors) next[vendor.id] = { baseUrl: vendor.baseUrl, apiKey: '' }
      setDraft(next)
    }
  }, [])

  useEffect(() => {
    void reload()
  }, [reload])

  const flash = (text: string): void => {
    setNotice(text)
    window.setTimeout(() => setNotice(''), 2400)
  }

  const saveVendor = async (vendor: VendorView): Promise<void> => {
    const d = draft[vendor.id] ?? { baseUrl: '', apiKey: '' }
    setBusy(true)
    try {
      const r = await postJson('/agnes-studio/api/model-config/vendor', {
        vendor: vendor.id,
        baseUrl: d.baseUrl,
        apiKey: d.apiKey === '' ? undefined : d.apiKey,
      })
      if (!r.ok) throw new Error(String(r.data.error ?? `HTTP ${r.status}`))
      await reload()
      flash(`${vendor.label} 已保存`)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setBusy(false)
    }
  }

  const clearVendorKey = async (vendor: VendorView): Promise<void> => {
    setBusy(true)
    try {
      const r = await postJson('/agnes-studio/api/model-config/vendor', { vendor: vendor.id, clearKey: true })
      if (!r.ok) throw new Error(String(r.data.error ?? `HTTP ${r.status}`))
      await reload()
      flash(`${vendor.label} 的密钥已清除（会回退到 DSH 凭据 / .env）`)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setBusy(false)
    }
  }

  const testVendor = async (vendor: VendorView): Promise<void> => {
    const d = draft[vendor.id] ?? { baseUrl: '', apiKey: '' }
    setTesting(vendor.id)
    try {
      const r = await postJson('/agnes-studio/api/model-config/test', {
        vendor: vendor.id,
        baseUrl: d.baseUrl === '' ? undefined : d.baseUrl,
        apiKey: d.apiKey === '' ? undefined : d.apiKey,
      })
      const result = { ok: r.data.ok === true, detail: String(r.data.detail ?? r.data.error ?? `HTTP ${r.status}`) }
      setTestResult(prev => ({ ...prev, [vendor.id]: result }))
    } catch (e) {
      setTestResult(prev => ({ ...prev, [vendor.id]: { ok: false, detail: e instanceof Error ? e.message : String(e) } }))
    } finally {
      setTesting('')
    }
  }

  const addCustom = async (): Promise<void> => {
    setBusy(true)
    try {
      const r = await postJson('/agnes-studio/api/model-config/custom', {
        id: newModel.id.trim(),
        name: newModel.name.trim() === '' ? newModel.id.trim() : newModel.name.trim(),
        kind: newModel.kind,
        baseUrl: newModel.baseUrl.trim(),
        apiKey: newModel.apiKey.trim() === '' ? undefined : newModel.apiKey.trim(),
      })
      if (!r.ok) throw new Error(String(r.data.error ?? `HTTP ${r.status}`))
      setNewModel({ id: '', name: '', kind: 'text', baseUrl: '', apiKey: '' })
      await reload()
      flash('自定义模型已加入模型清单')
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setBusy(false)
    }
  }

  const removeCustom = async (id: string): Promise<void> => {
    setBusy(true)
    try {
      const r = await postJson('/agnes-studio/api/model-config/remove', { id })
      if (!r.ok) throw new Error(String(r.data.error ?? `HTTP ${r.status}`))
      await reload()
      flash('已删除')
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setBusy(false)
    }
  }

  // ── 渲染 ──────────────────────────────────────────────────────────
  if (notReady) {
    return createElement('div', { className: 'agnes-mcfg' },
      createElement('div', { className: 'agnes-section' },
        createElement('div', { className: 'agnes-section-title' }, '模型配置'),
        createElement('div', { style: { ...HINT, color: 'rgba(255, 214, 102, 0.9)' } },
          '这一版的后端路由要重启 DSH 才会加载。重启后本页即可直接填密钥、测试连通性。'),
        createElement('div', { style: HINT },
          '在此之前，模型清单与密钥仍然沿用「DSH 凭据 / .env」的老路径，功能不受影响。'),
      ),
    )
  }

  if (view === null) {
    return createElement('div', { className: 'agnes-mcfg' },
      createElement('div', { className: 'agnes-section' },
        createElement('div', { className: 'agnes-section-title' }, '模型配置'),
        createElement('div', { style: { ...HINT, color: '#ff9a9a' } }, error === '' ? '读取中…' : `读取失败：${error}`),
      ),
    )
  }

  const inputStyle = {
    height: '30px',
    padding: '0 10px',
    borderRadius: '10px',
    border: '1px solid rgba(255,255,255,0.12)',
    background: 'rgba(255,255,255,0.06)',
    color: '#eef0f7',
    fontSize: '12px',
    fontFamily: 'inherit',
    outline: 'none',
    minWidth: '0',
  }

  const vendorRow = (vendor: VendorView): unknown => {
    const d = draft[vendor.id] ?? { baseUrl: '', apiKey: '' }
    const result = testResult[vendor.id]
    return createElement('div', { key: vendor.id, className: 'agnes-mcfg-vendor' },
      createElement('div', { className: 'agnes-mcfg-head' },
        createElement('span', { className: 'agnes-mcfg-name' }, vendor.label),
        createElement('span', {
          className: `agnes-badge${vendor.configured ? ' agnes-mcfg-ok' : ''}`,
        }, `${SOURCE_LABEL[vendor.source] ?? vendor.source}${vendor.maskedKey === '' ? '' : ' · ' + vendor.maskedKey}`),
      ),
      createElement('div', { className: 'agnes-mcfg-row' },
        createElement('input', {
          style: { ...inputStyle, flex: '1 1 auto' },
          value: d.baseUrl,
          placeholder: 'Base URL（含 /v1）',
          onChange: (e: Event) => {
            const value = (e.target as HTMLInputElement).value
            setDraft(prev => ({ ...prev, [vendor.id]: { ...prev[vendor.id] ?? { baseUrl: '', apiKey: '' }, baseUrl: value } }))
          },
        }),
        createElement('input', {
          style: { ...inputStyle, flex: '0 0 200px' },
          type: 'password',
          value: d.apiKey,
          placeholder: vendor.configured ? '留空 = 不修改' : 'API Key',
          onChange: (e: Event) => {
            const value = (e.target as HTMLInputElement).value
            setDraft(prev => ({ ...prev, [vendor.id]: { ...prev[vendor.id] ?? { baseUrl: '', apiKey: '' }, apiKey: value } }))
          },
        }),
        createElement('button', {
          className: 'agnes-btn agnes-btn-sm agnes-btn-primary',
          disabled: busy,
          onClick: () => { void saveVendor(vendor) },
        }, '保存'),
        createElement('button', {
          className: 'agnes-btn agnes-btn-sm agnes-btn-secondary',
          disabled: busy || testing === vendor.id,
          onClick: () => { void testVendor(vendor) },
        }, testing === vendor.id ? '测试中…' : '测试'),
        vendor.configured && vendor.source === 'file'
          ? createElement('button', {
              className: 'agnes-btn agnes-btn-sm agnes-btn-ghost',
              disabled: busy,
              onClick: () => { void clearVendorKey(vendor) },
            }, '清除密钥')
          : null,
      ),
      result !== undefined
        ? createElement('div', { style: { ...HINT, color: result.ok ? '#7ee0a8' : '#ff9a9a', marginTop: '6px' } },
            `${result.ok ? '✓' : '✕'} ${result.detail}`)
        : null,
    )
  }

  return createElement('div', { className: 'agnes-mcfg' },
    error !== '' ? createElement('div', { style: { ...HINT, color: '#ff9a9a', marginBottom: '10px' } }, `操作失败：${error}`) : null,
    notice !== '' ? createElement('div', { style: { ...HINT, color: '#7ee0a8', marginBottom: '10px' } }, notice) : null,

    // ── 厂商 ──
    createElement('div', { className: 'agnes-section' },
      createElement('div', { className: 'agnes-section-title' }, '厂商密钥与端点'),
      createElement('div', { style: { ...HINT, marginBottom: '10px' } },
        '填了就存在本机（', view.configPath, '），只由宿主进程调用时使用，网页里只会看到打码后的形态。优先级：本页配置 → DSH 凭据 → .env。'),
      ...view.vendors.map(vendorRow),
    ),

    // ── 自定义模型 ──
    createElement('div', { className: 'agnes-section' },
      createElement('div', { className: 'agnes-section-title' }, '自定义模型'),
      createElement('div', { style: { ...HINT, marginBottom: '10px' } },
        '任何 OpenAI 兼容端点都可以接进来（中转站、本地 vLLM、自建网关）。加进来后会出现在模型下拉框里，带「（自定义）」后缀。'),
      view.customModels.length === 0
        ? createElement('div', { style: HINT }, '还没有自定义模型。')
        : createElement('div', null, ...view.customModels.map(model =>
            createElement('div', { key: model.id, className: 'agnes-mcfg-custom' },
              createElement('span', { className: 'agnes-mcfg-name' }, model.name),
              createElement('span', { style: HINT }, `${model.id} · ${model.kind} · ${model.baseUrl}`),
              createElement('span', { className: 'agnes-badge' }, model.hasKey ? model.maskedKey : '无密钥'),
              createElement('button', {
                className: 'agnes-btn agnes-btn-sm agnes-btn-ghost',
                disabled: busy,
                onClick: () => { void removeCustom(model.id) },
              }, '删除'),
            ),
          )),
      createElement('div', { className: 'agnes-mcfg-row', style: { marginTop: '10px' } },
        createElement('input', {
          style: { ...inputStyle, flex: '0 0 160px' },
          placeholder: '模型 id（如 my-gpt）',
          value: newModel.id,
          onChange: (e: Event) => setNewModel(prev => ({ ...prev, id: (e.target as HTMLInputElement).value })),
        }),
        createElement('input', {
          style: { ...inputStyle, flex: '0 0 160px' },
          placeholder: '显示名（可选）',
          value: newModel.name,
          onChange: (e: Event) => setNewModel(prev => ({ ...prev, name: (e.target as HTMLInputElement).value })),
        }),
        createElement('select', {
          style: { ...inputStyle, flex: '0 0 96px' },
          value: newModel.kind,
          onChange: (e: Event) => setNewModel(prev => ({ ...prev, kind: (e.target as HTMLSelectElement).value as 'text' })),
        },
          createElement('option', { value: 'text' }, '文本'),
          createElement('option', { value: 'image' }, '图像'),
          createElement('option', { value: 'video' }, '视频'),
        ),
        createElement('input', {
          style: { ...inputStyle, flex: '1 1 auto' },
          placeholder: 'Base URL（含 /v1）',
          value: newModel.baseUrl,
          onChange: (e: Event) => setNewModel(prev => ({ ...prev, baseUrl: (e.target as HTMLInputElement).value })),
        }),
        createElement('input', {
          style: { ...inputStyle, flex: '0 0 160px' },
          type: 'password',
          placeholder: 'API Key（可空）',
          value: newModel.apiKey,
          onChange: (e: Event) => setNewModel(prev => ({ ...prev, apiKey: (e.target as HTMLInputElement).value })),
        }),
        createElement('button', {
          className: 'agnes-btn agnes-btn-sm agnes-btn-primary',
          disabled: busy || newModel.id.trim() === '' || newModel.baseUrl.trim() === '',
          onClick: () => { void addCustom() },
        }, '添加'),
      ),
    ),

    // ── DSH 侧 ──
    // DSH 会把同一家厂商再挂一份「+ 自动识图」的视觉路由，列表里全是重复项，
    // 这里按「去掉后缀」归并，只展示真正可用的厂商。
    (() => {
      const merged = new Map<string, string[]>()
      for (const provider of view.dsh.providers) {
        const name = provider.id.replace(/\s*\+\s*自动识图$/, '')
        const existing = merged.get(name) ?? []
        for (const model of provider.models) if (!existing.includes(model)) existing.push(model)
        merged.set(name, existing)
      }
      const rows = [...merged.entries()]
      return createElement('div', { className: 'agnes-section' },
        createElement('div', { className: 'agnes-section-title' }, 'DSH 已配置的模型'),
        view.dsh.available
          ? createElement('div', null,
              createElement('div', { style: { ...HINT, marginBottom: '8px' } },
                `DSH 里有 ${rows.length} 个厂商路由（已按「+ 自动识图」归并）。它们由 DSH 自己管密钥，本页只做展示；想在这里用，就把同一把 Key 填到上面。`),
              ...rows.map(([name, models]) =>
                createElement('div', { key: name, className: 'agnes-mcfg-dsh' },
                  createElement('span', { className: 'agnes-mcfg-name' }, name),
                  createElement('span', { style: HINT },
                    models.length === 0
                      ? '未列出模型（可用性取决于该厂商是否暴露 /models）'
                      : `${models.length} 个模型：${models.slice(0, 6).join('、')}${models.length > 6 ? '…' : ''}`),
                ),
              ),
            )
          : createElement('div', { style: HINT }, '宿主没有暴露 llm 服务（或没有配置任何厂商），这里为空。'),
      )
    })(),
  )
}
