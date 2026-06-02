/* 手动创建模式 — 组件面板 + 画布 + 属性面板 */

import { useState, useMemo } from 'react'
import {
  ChevronRight, Trash2, ChevronUp, ChevronDown,
  Smartphone, Search, Eye,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { PhoneShell } from '@/components/PhoneShell'
import { useComponentStore } from '@/lib/componentStore'
import {
  CATEGORY_LABELS,
  type ComponentCategory,
  type ComponentItem,
  type ParameterSchema,
} from '@/types/component'

/* 画布中的组件实例 */
interface CanvasItem {
  instanceId: string
  componentId: string
  name: string
  emoji: string
  category: ComponentCategory
  params: Record<string, unknown>
  schema: ParameterSchema[]
}

/* 分类顺序 */
const CATEGORY_ORDER: ComponentCategory[] = ['display', 'lottery', 'task', 'exchange', 'interaction']
const CATEGORY_EMOJI: Record<ComponentCategory, string> = {
  display: '📐',
  lottery: '🎲',
  task: '📋',
  exchange: '🎁',
  interaction: '💬',
}

export function ManualBuilder() {
  const components = useComponentStore((s) => s.components)

  /* 只展示已上线组件 */
  const availableComponents = useMemo(
    () => components.filter((c) => c.status === 'available'),
    [components]
  )

  /* 按分类分组 */
  const grouped = useMemo(() => {
    const map = new Map<ComponentCategory, ComponentItem[]>()
    for (const cat of CATEGORY_ORDER) {
      const items = availableComponents.filter((c) => c.category === cat)
      if (items.length > 0) map.set(cat, items)
    }
    return map
  }, [availableComponents])

  const [search, setSearch] = useState('')
  const [collapsedCats, setCollapsedCats] = useState<Set<ComponentCategory>>(new Set())
  const [canvas, setCanvas] = useState<CanvasItem[]>([])
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null)

  const selectedItem = selectedIdx !== null ? canvas[selectedIdx] : null

  /* 搜索过滤 */
  const filteredGrouped = useMemo(() => {
    if (!search.trim()) return grouped
    const kw = search.trim().toLowerCase()
    const map = new Map<ComponentCategory, ComponentItem[]>()
    for (const [cat, items] of grouped) {
      const filtered = items.filter(
        (c) => c.name.toLowerCase().includes(kw) || c.aiSignature.keywords.some((k) => k.toLowerCase().includes(kw))
      )
      if (filtered.length > 0) map.set(cat, filtered)
    }
    return map
  }, [grouped, search])

  /* 分类折叠 */
  const toggleCat = (cat: ComponentCategory) => {
    setCollapsedCats((prev) => {
      const next = new Set(prev)
      next.has(cat) ? next.delete(cat) : next.add(cat)
      return next
    })
  }

  /* 添加组件到画布 */
  const addToCanvas = (comp: ComponentItem) => {
    const defaults: Record<string, unknown> = {}
    for (const p of comp.parameterSchema) {
      defaults[p.name] = p.defaultValue
    }
    const item: CanvasItem = {
      instanceId: `inst-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      componentId: comp.id,
      name: comp.name,
      emoji: comp.previewEmoji,
      category: comp.category,
      params: defaults,
      schema: comp.parameterSchema,
    }
    setCanvas((prev) => [...prev, item])
    setSelectedIdx(canvas.length)
  }

  /* 画布操作 */
  const removeFromCanvas = (idx: number) => {
    setCanvas((prev) => prev.filter((_, i) => i !== idx))
    if (selectedIdx === idx) setSelectedIdx(null)
    else if (selectedIdx !== null && selectedIdx > idx) setSelectedIdx(selectedIdx - 1)
  }

  const moveUp = (idx: number) => {
    if (idx === 0) return
    setCanvas((prev) => {
      const next = [...prev]
      ;[next[idx - 1], next[idx]] = [next[idx], next[idx - 1]]
      return next
    })
    if (selectedIdx === idx) setSelectedIdx(idx - 1)
    else if (selectedIdx === idx - 1) setSelectedIdx(idx)
  }

  const moveDown = (idx: number) => {
    if (idx >= canvas.length - 1) return
    setCanvas((prev) => {
      const next = [...prev]
      ;[next[idx], next[idx + 1]] = [next[idx + 1], next[idx]]
      return next
    })
    if (selectedIdx === idx) setSelectedIdx(idx + 1)
    else if (selectedIdx === idx + 1) setSelectedIdx(idx)
  }

  const updateParam = (idx: number, paramName: string, value: unknown) => {
    setCanvas((prev) =>
      prev.map((item, i) =>
        i === idx ? { ...item, params: { ...item.params, [paramName]: value } } : item
      )
    )
  }

  return (
    <div className="flex-1 flex min-h-0 overflow-hidden">
      {/* ═══ 左栏：组件面板 ═══ */}
      <div className="w-[340px] border-r border-gray-200 bg-white flex flex-col shrink-0">
        <div className="px-3 pt-3 pb-2 border-b border-gray-100 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-900">组件面板</span>
            <span className="text-xs text-gray-400">{availableComponents.length} 个可用</span>
          </div>
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索组件..."
              className="w-full pl-7 pr-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-orange-400 transition-colors"
            />
          </div>
        </div>
        <div className="flex-1 overflow-auto">
          {Array.from(filteredGrouped).map(([cat, items]) => (
            <div key={cat} className="border-b border-gray-100 last:border-0">
              <button
                onClick={() => toggleCat(cat)}
                className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-gray-50 transition-colors"
              >
                <ChevronRight className={cn('w-3 h-3 text-gray-400 transition-transform', !collapsedCats.has(cat) && 'rotate-90')} />
                <span className="text-sm">{CATEGORY_EMOJI[cat]}</span>
                <span className="text-xs font-semibold text-gray-600">{CATEGORY_LABELS[cat]}</span>
                <span className="text-xs text-gray-400">{items.length}</span>
              </button>
              {!collapsedCats.has(cat) && (
                <div className="grid grid-cols-4 gap-1.5 px-3 pb-3">
                  {items.map((comp) => (
                    <button
                      key={comp.id}
                      onClick={() => addToCanvas(comp)}
                      className="flex flex-col items-center gap-1 p-2 rounded-xl transition-all text-center hover:bg-orange-50 hover:ring-1 hover:ring-orange-200 active:scale-95"
                      title={`点击添加「${comp.name}」`}
                    >
                      <span className="text-2xl leading-none">{comp.previewEmoji}</span>
                      <span className="text-xs font-medium text-gray-700 leading-tight line-clamp-2">{comp.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
          {filteredGrouped.size === 0 && (
            <div className="px-4 py-10 text-center">
              <p className="text-xs text-gray-400">无匹配组件</p>
            </div>
          )}
        </div>
      </div>

      {/* ═══ 中栏：画布 ═══ */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-gray-50">
        <div className="h-10 flex items-center justify-between px-4 border-b border-gray-200 bg-white shrink-0">
          <span className="text-sm font-medium text-gray-700">活动画布</span>
          <span className="text-xs text-gray-400">{canvas.length} 个组件</span>
        </div>
        <div className="flex-1 overflow-auto p-4 flex justify-center">
          {/* 手机框 */}
          <PhoneShell width={280}>
            <div className="min-h-[533px]">
                  {canvas.length > 0 ? (
                    <div>
                      {canvas.map((item, idx) => (
                        <div
                          key={item.instanceId}
                          onClick={() => setSelectedIdx(idx)}
                          className={cn(
                            'group relative border-2 transition-colors cursor-pointer',
                            selectedIdx === idx ? 'border-orange-400' : 'border-transparent hover:border-orange-200'
                          )}
                        >
                          {/* 组件占位渲染 */}
                          <CanvasBlock item={item} />
                          {/* 悬浮操作 */}
                          <div className={cn(
                            'absolute top-1 right-1 flex items-center gap-0.5 transition-opacity',
                            selectedIdx === idx ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                          )}>
                            <button onClick={(e) => { e.stopPropagation(); moveUp(idx) }} disabled={idx === 0}
                              className="w-5 h-5 rounded bg-white/90 shadow flex items-center justify-center text-gray-500 hover:text-gray-700 disabled:opacity-30">
                              <ChevronUp className="w-3 h-3" />
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); moveDown(idx) }} disabled={idx >= canvas.length - 1}
                              className="w-5 h-5 rounded bg-white/90 shadow flex items-center justify-center text-gray-500 hover:text-gray-700 disabled:opacity-30">
                              <ChevronDown className="w-3 h-3" />
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); removeFromCanvas(idx) }}
                              className="w-5 h-5 rounded bg-white/90 shadow flex items-center justify-center text-gray-500 hover:text-red-500">
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="h-[533px] flex items-center justify-center text-center p-6">
                      <div>
                        <Smartphone className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                        <p className="text-sm text-gray-400 mb-1">从左侧选择组件</p>
                        <p className="text-xs text-gray-300">点击组件即可添加到画布</p>
                      </div>
                    </div>
                  )}
            </div>
          </PhoneShell>
        </div>
      </div>

      {/* ═══ 右栏：属性面板 ═══ */}
      <div className="w-[320px] border-l border-gray-200 bg-white flex flex-col shrink-0">
        <div className="h-10 flex items-center px-4 border-b border-gray-100 shrink-0">
          <Eye className="w-4 h-4 text-gray-400 mr-2" />
          <span className="text-sm font-medium text-gray-700">属性配置</span>
        </div>
        <div className="flex-1 overflow-auto">
          {selectedItem ? (
            <div className="p-4 space-y-4">
              {/* 组件信息 */}
              <div className="flex items-center gap-2">
                <span className="text-2xl">{selectedItem.emoji}</span>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{selectedItem.name}</p>
                  <p className="text-xs text-gray-400">{CATEGORY_LABELS[selectedItem.category]}</p>
                </div>
              </div>
              {/* 参数表单 */}
              {selectedItem.schema.length > 0 ? (
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-gray-500">参数配置</p>
                  {selectedItem.schema.map((param) => (
                    <ParamField
                      key={param.name}
                      param={param}
                      value={selectedItem.params[param.name]}
                      onChange={(v) => updateParam(selectedIdx!, param.name, v)}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400 text-center py-4">该组件无可配置参数</p>
              )}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-center p-6">
              <div>
                <Eye className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-xs text-gray-400">点击画布中的组件</p>
                <p className="text-xs text-gray-400">查看和编辑属性</p>
              </div>
            </div>
          )}
        </div>
        {/* 底部操作 */}
        {canvas.length > 0 && (
          <div className="border-t border-gray-100 px-4 py-3 flex items-center justify-end gap-2">
            <button className="px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              预览活动
            </button>
            <button className="px-3 py-1.5 text-xs font-medium bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
              发布
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

/* ═══ 子组件 ═══ */

/* 画布中的组件块渲染 */
function CanvasBlock({ item }: { item: CanvasItem }) {
  if (item.category === 'display' && item.name.includes('Banner')) {
    return (
      <div className="h-28 bg-gradient-to-r from-orange-400 to-pink-400 flex items-end p-3">
        <div>
          <p className="text-white font-bold text-sm">{String(item.params.title || '活动标题')}</p>
          <p className="text-white/70 text-xs mt-0.5">{String(item.params.subtitle || '副标题')}</p>
        </div>
      </div>
    )
  }
  if (item.name.includes('转盘')) {
    return (
      <div className="py-5 flex flex-col items-center bg-gradient-to-b from-blue-50 to-white">
        <div className="w-32 h-32 rounded-full border-4 border-blue-200 bg-white flex items-center justify-center relative">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="absolute w-0.5 h-12 bg-blue-100 origin-bottom" style={{ transform: `rotate(${i * 60}deg)`, bottom: '50%' }} />
          ))}
          <div className="w-10 h-10 rounded-full bg-orange-500 text-white font-bold text-xs flex items-center justify-center z-10 shadow-lg">抽奖</div>
        </div>
        <p className="text-xs text-gray-500 mt-2">每日 {String(item.params.dailyLimit || 3)} 次机会</p>
      </div>
    )
  }
  if (item.name.includes('任务')) {
    const count = Number(item.params.taskCount || 3)
    return (
      <div className="px-3 py-3 space-y-1.5">
        <p className="text-xs font-semibold text-gray-700 mb-1">做任务赚次数</p>
        {Array.from({ length: Math.min(count, 4) }).map((_, i) => (
          <div key={i} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded bg-green-100 flex items-center justify-center text-xs text-green-600">✓</div>
              <span className="text-xs text-gray-600">任务 {i + 1}</span>
            </div>
            <span className="text-xs text-orange-500 font-medium">+1{String(item.params.rewardUnit || '次')}</span>
          </div>
        ))}
      </div>
    )
  }
  if (item.name.includes('签到')) {
    return (
      <div className="px-3 py-3">
        <p className="text-xs font-semibold text-gray-700 mb-2">签到日历</p>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className={cn('w-full aspect-square rounded flex items-center justify-center text-xs font-medium', i < 3 ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-400')}>
              {i < 3 ? '✓' : i + 1}
            </div>
          ))}
        </div>
      </div>
    )
  }
  if (item.name.includes('排行')) {
    return (
      <div className="px-3 py-3">
        <p className="text-xs font-semibold text-gray-700 mb-2">{String(item.params.title || '排行榜')}</p>
        {[1, 2, 3].map((r) => (
          <div key={r} className="flex items-center gap-2 py-1.5 border-b border-gray-50">
            <span className={cn('text-xs font-bold w-4 text-right', r <= 3 ? 'text-orange-500' : 'text-gray-400')}>{r}</span>
            <div className="w-5 h-5 rounded-full bg-gray-200" />
            <span className="text-xs text-gray-600">用户{r}</span>
            <span className="ml-auto text-xs text-gray-400">{100 - r * 10}分</span>
          </div>
        ))}
      </div>
    )
  }
  if (item.name.includes('倒计时')) {
    return (
      <div className="px-3 py-3 flex items-center justify-center gap-2">
        <span className="text-xs text-gray-500">{String(item.params.title || '距活动结束还剩')}</span>
        {['02', '14', '36', '08'].map((n, i) => (
          <span key={i} className="text-sm font-bold bg-gray-900 text-white px-1.5 py-0.5 rounded">{n}</span>
        ))}
      </div>
    )
  }
  if (item.name.includes('弹窗')) {
    return (
      <div className="px-3 py-3">
        <div className="border border-gray-200 rounded-xl p-3 text-center">
          <p className="text-xs font-semibold text-gray-700 mb-1">{String(item.params.title || '弹窗标题')}</p>
          <p className="text-xs text-gray-400 mb-2">弹窗内容区域</p>
          <div className="bg-orange-500 text-white text-xs rounded-lg py-1.5">{String(item.params.confirmText || '我知道了')}</div>
        </div>
      </div>
    )
  }
  /* 通用 fallback */
  return (
    <div className="px-3 py-4 flex items-center gap-2 bg-gray-50">
      <span className="text-xl">{item.emoji}</span>
      <span className="text-xs font-medium text-gray-600">{item.name}</span>
    </div>
  )
}

/* 参数输入字段 */
function ParamField({ param, value, onChange }: { param: ParameterSchema; value: unknown; onChange: (v: unknown) => void }) {
  const strValue = value === undefined || value === null ? '' : String(value)

  if (param.type === 'boolean') {
    return (
      <label className="flex items-center justify-between">
        <span className="text-xs text-gray-700">{param.label}</span>
        <input type="checkbox" checked={Boolean(value)} onChange={(e) => onChange(e.target.checked)} className="w-4 h-4 accent-orange-500" />
      </label>
    )
  }
  if (param.type === 'number') {
    return (
      <div>
        <label className="block text-xs text-gray-700 mb-1">
          {param.label}
          {param.required && <span className="text-red-400 ml-0.5">*</span>}
        </label>
        <input type="number" value={strValue} onChange={(e) => onChange(Number(e.target.value))}
          className="w-full text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-orange-400" />
      </div>
    )
  }
  if (param.type === 'array' || param.type === 'object') {
    return (
      <div>
        <label className="block text-xs text-gray-700 mb-1">{param.label}</label>
        <div className="text-xs text-gray-400 bg-gray-50 rounded-lg px-3 py-2 border border-gray-200">
          复杂类型，暂用 AI 模式配置
        </div>
      </div>
    )
  }
  /* string / date / select fallback */
  return (
    <div>
      <label className="block text-xs text-gray-700 mb-1">
        {param.label}
        {param.required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      <input type="text" value={strValue} onChange={(e) => onChange(e.target.value)} placeholder={param.description}
        className="w-full text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-orange-400" />
    </div>
  )
}
