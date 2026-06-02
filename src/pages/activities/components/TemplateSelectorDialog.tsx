/* 模板选择弹窗 — 在创建活动对话流中使用 */

import { useState, useEffect } from 'react'
import { X, Search, Sparkles, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  MOCK_TEMPLATES, CATEGORY_LABELS,
  type MockTemplate, type TemplateCategory,
} from '@/pages/templates/data/mockTemplates'
import { TemplatePhonePreview } from '@/pages/templates/components/TemplatePhonePreview'

const CATEGORIES: TemplateCategory[] = ['all', 'lottery', 'checkin', 'task', 'welfare']

interface TemplateSelectorDialogProps {
  onClose: () => void
  onSelect: (tpl: MockTemplate) => void
}

export function TemplateSelectorDialog({ onClose, onSelect }: TemplateSelectorDialogProps) {
  const [category, setCategory] = useState<TemplateCategory>('all')
  const [search, setSearch] = useState('')
  const [hovered, setHovered] = useState<string | null>(null)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const filtered = MOCK_TEMPLATES.filter((t) => {
    const catOk = category === 'all' || t.category === category
    const kwOk  = !search.trim() || t.name.includes(search) || t.tags.some((g) => g.includes(search))
    return catOk && kwOk
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
      <div
        className="relative bg-white rounded-2xl shadow-2xl flex flex-col"
        style={{ width: 860, maxHeight: '80vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 头部 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-orange-400" />
            <h2 className="text-base font-semibold text-gray-900">选择模板</h2>
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{MOCK_TEMPLATES.length} 个</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 筛选栏 */}
        <div className="flex items-center gap-3 px-6 py-3 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={cn(
                  'px-3 py-1 text-xs font-medium rounded-lg transition-colors',
                  category === cat ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                )}
              >
                {CATEGORY_LABELS[cat]}
              </button>
            ))}
          </div>
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="搜索模板…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400/40 focus:border-orange-400 transition"
            />
          </div>
        </div>

        {/* 模板网格 */}
        <div className="flex-1 overflow-auto p-6">
          {filtered.length > 0 ? (
            <div className="grid grid-cols-4 gap-5">
              {filtered.map((tpl) => (
                <div
                  key={tpl.id}
                  onMouseEnter={() => setHovered(tpl.id)}
                  onMouseLeave={() => setHovered(null)}
                  className="group flex flex-col items-center gap-2 cursor-pointer"
                  onClick={() => onSelect(tpl)}
                >
                  <div className="relative transition-all duration-200 group-hover:-translate-y-1 group-hover:drop-shadow-xl">
                    <TemplatePhonePreview cfg={tpl.preview} width={160} />
                    {/* hover 蒙层 */}
                    <div className={cn(
                      'absolute inset-0 rounded-[27px] flex items-center justify-center transition-all',
                      hovered === tpl.id ? 'bg-black/15' : 'bg-transparent'
                    )}>
                      {hovered === tpl.id && (
                        <span className="flex items-center gap-1 bg-orange-500 text-white text-xs font-semibold px-3 py-1.5 rounded-xl shadow-lg">
                          使用此模板 <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      )}
                    </div>
                    {/* 使用次数 */}
                    <div className="absolute -top-1.5 -right-1.5 bg-orange-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-sm leading-none">
                      {tpl.usageCount}次
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-medium text-gray-700 group-hover:text-orange-500 transition-colors">{tpl.name}</p>
                    <p className="text-[10px] text-gray-400">{CATEGORY_LABELS[tpl.category]}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Sparkles className="w-10 h-10 text-gray-200 mb-3" />
              <p className="text-sm text-gray-500">没有找到匹配的模板</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
