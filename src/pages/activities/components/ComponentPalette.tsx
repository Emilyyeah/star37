/* 组件面板 — 左栏（手动创建模式） */

import { useState, useMemo } from 'react'
import { ChevronRight, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useComponentStore } from '@/lib/componentStore'
import { CATEGORY_LABELS, type ComponentCategory, type ComponentItem } from '@/types/component'

const CATEGORY_ORDER: ComponentCategory[] = ['display', 'lottery', 'task', 'exchange', 'interaction']

export function ComponentPalette({ onAdd }: { onAdd: (comp: ComponentItem) => void }) {
  const components = useComponentStore((s) => s.components)
  const available = useMemo(() => components.filter((c) => c.status === 'available'), [components])

  const grouped = useMemo(() => {
    const map = new Map<ComponentCategory, ComponentItem[]>()
    for (const cat of CATEGORY_ORDER) {
      const items = available.filter((c) => c.category === cat)
      if (items.length > 0) map.set(cat, items)
    }
    return map
  }, [available])

  const [search, setSearch] = useState('')
  const [collapsed, setCollapsed] = useState<Set<ComponentCategory>>(new Set())

  const filtered = useMemo(() => {
    if (!search.trim()) return grouped
    const kw = search.trim().toLowerCase()
    const map = new Map<ComponentCategory, ComponentItem[]>()
    for (const [cat, items] of grouped) {
      const f = items.filter((c) => c.name.toLowerCase().includes(kw) || c.aiSignature.keywords.some((k) => k.toLowerCase().includes(kw)))
      if (f.length > 0) map.set(cat, f)
    }
    return map
  }, [grouped, search])

  const toggleCat = (cat: ComponentCategory) => {
    setCollapsed((prev) => { const n = new Set(prev); n.has(cat) ? n.delete(cat) : n.add(cat); return n })
  }

  return (
    <>
      <div className="px-3 pt-2 pb-2 border-b border-gray-100 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-900">组件面板</span>
          <span className="text-xs text-gray-400">{available.length} 个可用</span>
        </div>
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="搜索组件..."
            className="w-full pl-7 pr-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-orange-400 transition-colors" />
        </div>
      </div>
      <div className="flex-1 overflow-auto">
        {Array.from(filtered).map(([cat, items]) => (
          <div key={cat} className="border-b border-gray-100 last:border-0">
            <button onClick={() => toggleCat(cat)} className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-gray-50 transition-colors">
              <ChevronRight className={cn('w-3 h-3 text-gray-400 transition-transform', !collapsed.has(cat) && 'rotate-90')} />
              <span className="text-xs font-semibold text-gray-600">{CATEGORY_LABELS[cat]}</span>
              <span className="text-xs text-gray-400">{items.length}</span>
            </button>
            {!collapsed.has(cat) && (
              <div className="grid grid-cols-4 gap-1.5 px-3 pb-3">
                {items.map((comp) => (
                  <button key={comp.id} onClick={() => onAdd(comp)}
                    className="flex flex-col items-center gap-1 p-2 rounded-xl transition-all text-center hover:bg-orange-50 hover:ring-1 hover:ring-orange-200 active:scale-95"
                    title={`点击添加「${comp.name}」`}>
                    <span className="text-2xl leading-none">{comp.previewEmoji}</span>
                    <span className="text-xs font-medium text-gray-700 leading-tight w-[5em] text-center">{comp.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
        {filtered.size === 0 && <div className="px-4 py-10 text-center"><p className="text-xs text-gray-400">无匹配组件</p></div>}
      </div>
    </>
  )
}
