/* 属性面板 — 组件参数配置（手动创建模式）
   embedded=true 时不渲染外层容器/标题栏/底部按钮，由父级统一管理 */

import { useState } from 'react'
import { Eye, Plus, Trash2, ChevronDown, ChevronUp, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useComponentStore } from '@/lib/componentStore'
import { CATEGORY_LABELS } from '@/types/component'
import type { CanvasItem } from '../hooks/useManualBuilder'
import type { ParameterSchema } from '@/types/component'

interface PropertyPanelProps {
  selectedItem: CanvasItem | null
  canvasCount: number
  onUpdateParam: (name: string, value: unknown) => void
  onUpdateVariant: (variantId: string) => void
  onPublish?: () => void
  embedded?: boolean
  /** embedded 模式下传入完整 canvas 列表，展示全部组件可折叠配置 */
  canvas?: CanvasItem[]
  selectedIdx?: number | null
  onSelect?: (idx: number | null) => void
  onUpdateParamAt?: (idx: number, name: string, value: unknown) => void
  onUpdateVariantAt?: (idx: number, variantId: string) => void
}

export function PropertyPanel({
  selectedItem, canvasCount, onUpdateParam, onUpdateVariant, onPublish, embedded,
  canvas, selectedIdx, onSelect, onUpdateParamAt, onUpdateVariantAt,
}: PropertyPanelProps) {
  const getById = useComponentStore((s) => s.getById)
  const compDef = selectedItem ? getById(selectedItem.componentId) : null
  const variants = compDef?.variants || []

  /* embedded 模式：展示所有组件，点击展开 */
  if (embedded) {
    if (!canvas || canvas.length === 0) return <EmptyState />
    return (
      <div className="h-full overflow-auto divide-y divide-gray-100">
        {canvas.map((item, idx) => {
          const def = getById(item.componentId)
          const itemVariants = def?.variants || []
          const isOpen = selectedIdx === idx
          return (
            <div key={item.instanceId}>
              {/* 组件行标题 */}
              <button
                onClick={() => onSelect?.(isOpen ? null : idx)}
                className={cn(
                  "w-full flex items-center gap-2.5 px-4 py-3 text-left transition-colors hover:bg-gray-50",
                  isOpen && "bg-orange-50"
                )}
              >
                <span className="text-lg leading-none">{item.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className={cn("text-sm font-medium truncate", isOpen ? "text-orange-600" : "text-gray-800")}>{item.name}</p>
                </div>
                <ChevronDown className={cn("w-4 h-4 text-gray-400 transition-transform shrink-0", isOpen && "rotate-180")} />
              </button>
              {/* 展开内容 */}
              {isOpen && (
                <div className="border-t border-orange-100 bg-white">
                  <ComponentConfig
                    selectedItem={item}
                    variants={itemVariants}
                    onUpdateParam={(name, value) => onUpdateParamAt?.(idx, name, value)}
                    onUpdateVariant={(variantId) => onUpdateVariantAt?.(idx, variantId)}
                    hideHeader
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>
    )
  }

  /* 独立模式：带外壳 */
  return (
    <div className="w-[320px] border-l border-gray-200 bg-white flex flex-col shrink-0">
      <div className="h-10 flex items-center px-4 border-b border-gray-100 shrink-0">
        <Eye className="w-4 h-4 text-gray-400 mr-2" />
        <span className="text-sm font-medium text-gray-700">组件配置</span>
      </div>
      <div className="flex-1 overflow-auto">
        {selectedItem ? (
          <ComponentConfig selectedItem={selectedItem} variants={variants} onUpdateParam={onUpdateParam} onUpdateVariant={onUpdateVariant} />
        ) : (
          <EmptyState />
        )}
      </div>
      {canvasCount > 0 && (
        <div className="border-t border-gray-100 px-4 py-3 flex items-center justify-end gap-2 shrink-0">
          <button className="px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">预览活动</button>
          <button onClick={onPublish} className="px-3 py-1.5 text-xs font-medium bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">发布</button>
        </div>
      )}
    </div>
  )
}

/* ── 空态 ── */
function EmptyState() {
  return (
    <div className="h-full flex items-center justify-center text-center p-6">
      <div>
        <Eye className="w-8 h-8 text-gray-300 mx-auto mb-2" />
        <p className="text-xs text-gray-400">点击画布中的组件</p>
        <p className="text-xs text-gray-400">查看和编辑属性</p>
      </div>
    </div>
  )
}

/* ── 组件配置内容 ── */
function ComponentConfig({ selectedItem, variants, onUpdateParam, onUpdateVariant, hideHeader }: {
  selectedItem: CanvasItem
  variants: { id: string; name: string; previewColors: [string, string] }[]
  onUpdateParam: (name: string, value: unknown) => void
  onUpdateVariant: (variantId: string) => void
  hideHeader?: boolean
}) {
  return (
    <div className="p-4 space-y-4">
      {!hideHeader && (
        <div className="flex items-center gap-2">
          <span className="text-2xl">{selectedItem.emoji}</span>
          <div>
            <p className="text-sm font-semibold text-gray-900">{selectedItem.name}</p>
            <p className="text-xs text-gray-400">{CATEGORY_LABELS[selectedItem.category]}</p>
          </div>
        </div>
      )}

      {variants.length > 1 && (
        <div>
          <p className="text-xs font-semibold text-gray-500 mb-2">样式变体</p>
          <div className="grid grid-cols-2 gap-1.5">
            {variants.map((v) => (
              <button
                key={v.id}
                onClick={() => onUpdateVariant(v.id)}
                className={cn(
                  'flex items-center gap-2 px-2.5 py-2 rounded-lg border text-left transition-colors',
                  selectedItem.variantId === v.id
                    ? 'border-orange-400 bg-orange-50'
                    : 'border-gray-200 hover:border-orange-200 hover:bg-gray-50'
                )}
              >
                <div className="flex gap-0.5 shrink-0">
                  {v.previewColors.map((c, i) => (
                    <div key={i} className="w-3 h-3 rounded-sm" style={{ backgroundColor: c }} />
                  ))}
                </div>
                <span className={cn('text-xs font-medium', selectedItem.variantId === v.id ? 'text-orange-700' : 'text-gray-600')}>{v.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {selectedItem.schema.length > 0 ? (
        <div className="space-y-3">
          <p className="text-xs font-semibold text-gray-500">参数配置</p>
          {selectedItem.schema.map((param) => (
            <ParamField key={param.name} param={param} value={selectedItem.params[param.name]} onChange={(v) => onUpdateParam(param.name, v)} />
          ))}
        </div>
      ) : (
        <p className="text-xs text-gray-400 text-center py-4">该组件无可配置参数</p>
      )}
    </div>
  )
}

/* ── 通用表单字段组件 ── */

function ParamField({ param, value, onChange }: { param: ParameterSchema; value: unknown; onChange: (v: unknown) => void }) {
  const isAI = param.aiInferable
  const borderClass = isAI ? 'border-green-200' : param.required ? 'border-orange-200' : 'border-gray-200'
  const bgClass = isAI ? 'bg-green-50/40' : param.required ? 'bg-orange-50/30' : 'bg-white'

  return (
    <div className={cn('rounded-lg border p-3', borderClass, bgClass)}>
      <div className="flex items-center gap-1.5 mb-1.5">
        <span className="text-xs font-medium text-gray-700">{param.label}</span>
        {param.required && <span className="text-orange-500 text-xs font-bold">*</span>}
        {isAI && (
          <span className="inline-flex items-center gap-0.5 text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-medium">
            <Sparkles className="w-3 h-3" />AI
          </span>
        )}
      </div>
      <FieldInput param={param} value={value} onChange={onChange} />
      {param.description && <p className="text-xs text-gray-400 mt-1">{param.description}</p>}
    </div>
  )
}

function FieldInput({ param, value, onChange }: { param: ParameterSchema; value: unknown; onChange: (v: unknown) => void }) {
  switch (param.type) {
    case 'boolean': return <BooleanField value={value} onChange={onChange} />
    case 'number': return <NumberField value={value} onChange={onChange} />
    case 'select': return <SelectField param={param} value={value} onChange={onChange} />
    case 'date': return <DateField value={value} onChange={onChange} />
    case 'array': return <ArrayField param={param} value={value} onChange={onChange} />
    case 'object': return <div className="text-xs text-gray-400 bg-gray-50 rounded-lg px-3 py-2 border border-gray-100">复杂对象类型，暂用 AI 模式配置</div>
    default: return <StringField value={value} onChange={onChange} placeholder={param.description} />
  }
}

function StringField({ value, onChange, placeholder }: { value: unknown; onChange: (v: string) => void; placeholder?: string }) {
  return <input type="text" value={value === undefined || value === null ? '' : String(value)} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-orange-400 bg-white" />
}

function NumberField({ value, onChange }: { value: unknown; onChange: (v: number) => void }) {
  return <input type="number" value={value === undefined || value === null ? '' : String(value)} onChange={(e) => onChange(Number(e.target.value))} className="w-full text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-orange-400 bg-white" />
}

function BooleanField({ value, onChange }: { value: unknown; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <div onClick={() => onChange(!value)} className={cn('w-9 h-5 rounded-full relative transition-colors cursor-pointer', value ? 'bg-orange-500' : 'bg-gray-300')}>
        <div className={cn('absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform', value ? 'translate-x-4' : 'translate-x-0.5')} />
      </div>
      <span className="text-xs text-gray-600">{value ? '是' : '否'}</span>
    </label>
  )
}

function SelectField({ param, value, onChange }: { param: ParameterSchema; value: unknown; onChange: (v: string) => void }) {
  return (
    <select value={String(value ?? '')} onChange={(e) => onChange(e.target.value)} className="w-full text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-orange-400 bg-white appearance-none cursor-pointer">
      <option value="" disabled>请选择</option>
      {(param.options || []).map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
    </select>
  )
}

function DateField({ value, onChange }: { value: unknown; onChange: (v: string) => void }) {
  return <input type="datetime-local" value={value === undefined || value === null ? '' : String(value)} onChange={(e) => onChange(e.target.value)} className="w-full text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-orange-400 bg-white" />
}

function ArrayField({ param, value, onChange }: { param: ParameterSchema; value: unknown; onChange: (v: unknown) => void }) {
  const items = Array.isArray(value) ? value : []
  const schema = param.arrayItemSchema
  if (!schema || schema.length === 0 || (schema.length === 1 && schema[0].type === 'string')) {
    return <SimpleArrayField items={items} onChange={onChange} fieldName={schema?.[0]?.name} />
  }
  return <StructuredArrayField items={items} schema={schema} onChange={onChange} />
}

function SimpleArrayField({ items, onChange, fieldName }: { items: unknown[]; onChange: (v: unknown) => void; fieldName?: string }) {
  const strItems = items.map((item) => {
    if (typeof item === 'string') return item
    if (typeof item === 'object' && item !== null && fieldName && fieldName in item) return String((item as Record<string, unknown>)[fieldName])
    return String(item)
  })
  const update = (idx: number, val: string) => { const next = [...strItems]; next[idx] = val; onChange(next) }
  const add = () => onChange([...strItems, ''])
  const remove = (idx: number) => onChange(strItems.filter((_, i) => i !== idx))

  return (
    <div className="space-y-1.5">
      {strItems.map((item, idx) => (
        <div key={idx} className="flex items-center gap-1.5">
          <span className="text-xs text-gray-400 w-4 text-right shrink-0">{idx + 1}.</span>
          <input type="text" value={item} onChange={(e) => update(idx, e.target.value)} className="flex-1 text-sm border border-gray-200 rounded-lg px-2.5 py-1 focus:outline-none focus:border-orange-400 bg-white" />
          <button onClick={() => remove(idx)} className="text-gray-400 hover:text-red-500 transition-colors shrink-0"><Trash2 className="w-3.5 h-3.5" /></button>
        </div>
      ))}
      <button onClick={add} className="flex items-center gap-1 text-xs text-orange-500 hover:text-orange-600 transition-colors pt-1"><Plus className="w-3.5 h-3.5" />添加一项</button>
    </div>
  )
}

function StructuredArrayField({ items, schema, onChange }: { items: unknown[]; schema: { name: string; label: string; type: 'string' | 'number' }[]; onChange: (v: unknown) => void }) {
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null)
  const objItems = items.map((item) => {
    if (typeof item === 'object' && item !== null) return item as Record<string, unknown>
    const defaults: Record<string, unknown> = {}; for (const s of schema) defaults[s.name] = s.type === 'number' ? 0 : ''; return defaults
  })
  const updateField = (idx: number, field: string, val: unknown) => { const next = [...objItems]; next[idx] = { ...next[idx], [field]: val }; onChange(next) }
  const add = () => { const defaults: Record<string, unknown> = {}; for (const s of schema) defaults[s.name] = s.type === 'number' ? 0 : ''; onChange([...objItems, defaults]); setExpandedIdx(objItems.length) }
  const remove = (idx: number) => { onChange(objItems.filter((_, i) => i !== idx)); if (expandedIdx === idx) setExpandedIdx(null); else if (expandedIdx !== null && expandedIdx > idx) setExpandedIdx(expandedIdx - 1) }
  const getItemSummary = (item: Record<string, unknown>) => { const firstStr = schema.find((s) => s.type === 'string'); const firstNum = schema.find((s) => s.type === 'number'); const name = firstStr ? String(item[firstStr.name] || '未填写') : ''; const num = firstNum ? String(item[firstNum.name] ?? '') : ''; return name + (num ? ` (${num})` : '') }

  return (
    <div className="space-y-1.5">
      {objItems.map((item, idx) => (
        <div key={idx} className="border border-gray-200 rounded-lg overflow-hidden bg-white">
          <div className="flex items-center gap-2 px-2.5 py-1.5 cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => setExpandedIdx(expandedIdx === idx ? null : idx)}>
            {expandedIdx === idx ? <ChevronUp className="w-3.5 h-3.5 text-gray-400 shrink-0" /> : <ChevronDown className="w-3.5 h-3.5 text-gray-400 shrink-0" />}
            <span className="text-xs text-gray-500 w-4 shrink-0">{idx + 1}.</span>
            <span className="text-xs text-gray-700 flex-1 truncate">{getItemSummary(item)}</span>
            <button onClick={(e) => { e.stopPropagation(); remove(idx) }} className="text-gray-400 hover:text-red-500 transition-colors shrink-0"><Trash2 className="w-3.5 h-3.5" /></button>
          </div>
          {expandedIdx === idx && (
            <div className="px-2.5 pb-2.5 space-y-2 border-t border-gray-100">
              {schema.map((s) => (
                <div key={s.name} className="pt-2">
                  <label className="block text-xs text-gray-500 mb-1">{s.label}</label>
                  <input type={s.type === 'number' ? 'number' : 'text'} value={item[s.name] === undefined ? '' : String(item[s.name])} onChange={(e) => updateField(idx, s.name, s.type === 'number' ? Number(e.target.value) : e.target.value)} className="w-full text-sm border border-gray-200 rounded-lg px-2.5 py-1 focus:outline-none focus:border-orange-400 bg-white" />
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
      <button onClick={add} className="flex items-center gap-1 text-xs text-orange-500 hover:text-orange-600 transition-colors pt-1"><Plus className="w-3.5 h-3.5" />添加一项</button>
    </div>
  )
}
