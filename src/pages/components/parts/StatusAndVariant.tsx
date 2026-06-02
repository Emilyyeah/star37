/* 组件库 — StatusSection（状态分区卡片网格）+ VariantPreview（变体预览） */

import { useState } from 'react'
import { ChevronRight, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ComponentItem, ComponentVariant } from '@/types/component'
import { MockPreview } from './MockPreview'

/* ── 状态分区 ── */
export function StatusSection({
  title, count, dotColor, items, selectedId, onSelect, defaultOpen, collapsible, onToggle,
}: {
  title: string
  count: number
  dotColor: string
  items: ComponentItem[]
  selectedId: string | null
  onSelect: (id: string) => void
  defaultOpen?: boolean
  collapsible?: boolean
  onToggle?: () => void
}) {
  const [open, setOpen] = useState(defaultOpen ?? true)

  if (items.length === 0) return null

  const toggle = () => {
    if (collapsible && onToggle) onToggle()
    setOpen(!open)
  }

  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        onClick={toggle}
        className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-gray-50 transition-colors"
      >
        <ChevronRight className={cn('w-3 h-3 text-gray-400 transition-transform', open && 'rotate-90')} />
        <span className={cn('w-1.5 h-1.5 rounded-full', dotColor)} />
        <span className="text-xs font-semibold text-gray-600">{title}</span>
        <span className="text-xs text-gray-400">{count}</span>
      </button>
      {open && (
        <div className="grid grid-cols-4 gap-1.5 px-3 pb-3">
          {items.map((comp) => (
            <button
              key={comp.id}
              onClick={() => onSelect(comp.id)}
              className={cn(
                'flex flex-col items-center gap-1 p-2 rounded-xl transition-all text-center',
                selectedId === comp.id ? 'bg-orange-50 ring-1 ring-orange-300' : 'hover:bg-gray-50'
              )}
            >
              <span className="text-2xl leading-none">{comp.previewEmoji}</span>
              <span className={cn('text-xs font-medium leading-tight w-[5em] text-center', selectedId === comp.id ? 'text-orange-700' : 'text-gray-700')}>
                {comp.name}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/* ── 变体预览 ── */
export function VariantPreview({
  variants, activeIdx, onSwitch, emoji, componentName, onAddVariant,
}: {
  variants: ComponentVariant[]
  activeIdx: number
  onSwitch: (i: number) => void
  emoji: string
  componentName: string
  onAddVariant?: () => void
}) {
  const v = variants[activeIdx] || variants[0]
  if (!v) return null

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="flex items-center gap-1 px-4 pt-3 pb-2">
        <span className="text-xs text-gray-400 mr-2">样式变体</span>
        {variants.map((vt, i) => (
          <button
            key={vt.id}
            onClick={() => onSwitch(i)}
            className={cn(
              'px-2.5 py-1 rounded-md text-xs font-medium transition-colors',
              i === activeIdx ? 'bg-orange-50 text-orange-600' : 'text-gray-500 hover:bg-gray-50'
            )}
          >
            {vt.name}
          </button>
        ))}
        {onAddVariant && (
          <button
            onClick={onAddVariant}
            className="inline-flex items-center gap-0.5 px-2 py-1 rounded-md text-xs font-medium bg-orange-500 text-white hover:bg-orange-600 transition-colors ml-1"
          >
            <Plus className="w-3 h-3" />添加
          </button>
        )}
      </div>
      <div className="px-4 pb-4 pt-2">
        <div className="flex gap-4">
          <div className="w-[220px] shrink-0">
            <div className="bg-gray-900 rounded-[1.6rem] p-2 shadow-xl">
              <div className="bg-white rounded-[1.2rem] overflow-hidden" style={{ height: 380 }}>
                <div className="h-6 bg-gray-50 flex items-center justify-center">
                  <div className="w-12 h-2.5 bg-gray-900 rounded-full" />
                </div>
                <div className="overflow-hidden" style={{ height: 354 }}>
                  <MockPreview variant={v} emoji={emoji} componentName={componentName} />
                </div>
              </div>
            </div>
          </div>
          <div className="flex-1 pt-2">
            <h3 className="text-sm font-semibold text-gray-900 mb-1">{v.name}</h3>
            <p className="text-xs text-gray-500 mb-3">{v.description}</p>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs text-gray-400">预览色</span>
              <div className="flex gap-1">
                {v.previewColors.map((c, i) => (
                  <div key={i} className="w-5 h-5 rounded-md border border-gray-200" style={{ backgroundColor: c }} />
                ))}
              </div>
            </div>
            <div className="text-xs text-gray-400">
              <span>布局：{v.previewLayout}</span>
              <span className="mx-2">·</span>
              <span>ID：{v.id}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
