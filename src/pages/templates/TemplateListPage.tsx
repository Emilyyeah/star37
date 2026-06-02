/* 模板库 — 手机竖屏预览卡片网格 */

import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { LayoutTemplate, Search, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { TemplatePhonePreview } from './components/TemplatePhonePreview'
import { useTabStore } from '@/lib/tabStore'
import {
  MOCK_TEMPLATES,
  CATEGORY_LABELS,
  type TemplateCategory,
  type MockTemplate,
} from './data/mockTemplates'

const CATEGORIES: TemplateCategory[] = ['all', 'lottery', 'checkin', 'task', 'welfare']

/* ═══════════════════════════════════════
   模板卡片
   ═══════════════════════════════════════ */
function TemplateCard({ tpl, onClick }: { tpl: MockTemplate; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="group cursor-pointer flex flex-col items-center gap-2"
    >
      {/* 手机预览 — hover 浮起 + 蓝色边框选中感 */}
      <div className="relative transition-all duration-200 group-hover:-translate-y-1 group-hover:drop-shadow-xl">
        <TemplatePhonePreview cfg={tpl.preview} width={200} />
        {/* hover 蒙层 */}
        <div className="absolute inset-0 rounded-3xl bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none" />
        {/* 使用次数徽章 */}
        <div className="absolute -top-1.5 -right-1.5 bg-orange-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-sm leading-none">
          {tpl.usageCount}次
        </div>
      </div>

      {/* 名称 — 手机下方居中 */}
      <p className="text-sm font-medium text-gray-700 text-center leading-tight group-hover:text-orange-500 transition-colors">
        {tpl.name}
      </p>
    </div>
  )
}

/* ═══════════════════════════════════════
   页面
   ═══════════════════════════════════════ */
export default function TemplateListPage() {
  const navigate = useNavigate()
  const openTab = useTabStore((s) => s.openTab)

  const [category, setCategory] = useState<TemplateCategory>('all')
  const [search, setSearch] = useState('')

  useEffect(() => { openTab('/templates', '模板库') }, [openTab])

  const filtered = useMemo(() => {
    let list = MOCK_TEMPLATES
    if (category !== 'all') list = list.filter((t) => t.category === category)
    if (search.trim()) {
      const kw = search.trim().toLowerCase()
      list = list.filter(
        (t) =>
          t.name.toLowerCase().includes(kw) ||
          t.tags.some((tag) => tag.toLowerCase().includes(kw))
      )
    }
    return list
  }, [category, search])

  const handleView = (tpl: MockTemplate) => {
    openTab(`/templates/${tpl.id}`, tpl.name)
    navigate(`/templates/${tpl.id}`)
  }

  return (
    <div>
      {/* 页头 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <LayoutTemplate className="w-6 h-6 text-gray-400" />
          <h1 className="text-xl font-semibold text-gray-900">模板库</h1>
          <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium">
            {MOCK_TEMPLATES.length} 个模板
          </span>
        </div>
      </div>

      {/* 筛选栏 */}
      <div className="flex items-center gap-4 mb-8">
        <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={cn(
                'px-3 py-1.5 text-sm font-medium rounded-lg transition-colors',
                category === cat
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              )}
            >
              {CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>

        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="搜索模板名称或标签…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400/40 focus:border-orange-400 transition"
          />
        </div>
      </div>

      {/* 模板网格 — 手机卡片排列，每行 4~6 个 */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-x-8 gap-y-10">
          {filtered.map((tpl) => (
            <TemplateCard key={tpl.id} tpl={tpl} onClick={() => handleView(tpl)} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
          <Sparkles className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="text-sm text-gray-500">没有找到匹配的模板</p>
          <p className="text-xs text-gray-400 mt-1">试试清除筛选条件</p>
        </div>
      )}
    </div>
  )
}
