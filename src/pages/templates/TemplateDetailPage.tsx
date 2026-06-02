/* 模板详情页 — 左：模板信息+组件列表  右：手机预览（同列表页样式，放大版） + 使用按钮 */

import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Sparkles, LayoutTemplate, Copy, Calendar,
  BarChart2, Smartphone, ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTabStore } from '@/lib/tabStore'
import { MOCK_TEMPLATES, CATEGORY_LABELS, type MockTemplate } from './data/mockTemplates'
import { TemplatePhonePreview } from './components/TemplatePhonePreview'

/* ═══════════════════════════════════════
   手机预览组件 — 与列表页完全一致，尺寸放大
   ═══════════════════════════════════════ */

/* ═══════════════════════════════════════
   组件行
   ═══════════════════════════════════════ */
function ComponentRow({ comp, index }: { comp: MockTemplate['components'][number]; index: number }) {
  const CATEGORY_COLORS: Record<string, string> = {
    展示: 'bg-blue-50 text-blue-600',
    抽奖: 'bg-orange-50 text-orange-600',
    任务: 'bg-green-50 text-green-700',
    互动: 'bg-purple-50 text-purple-600',
  }
  return (
    <div className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-none">
      <span className="w-6 h-6 rounded-full bg-gray-100 text-gray-500 text-xs font-semibold flex items-center justify-center shrink-0">
        {index + 1}
      </span>
      <span className="text-xl leading-none">{comp.emoji}</span>
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-800">{comp.name}</p>
        <p className="text-xs text-gray-400">{comp.variant}</p>
      </div>
      <span className={cn('text-[11px] px-2 py-0.5 rounded-full font-medium', CATEGORY_COLORS[comp.category] ?? 'bg-gray-100 text-gray-500')}>
        {comp.category}
      </span>
    </div>
  )
}

/* ═══════════════════════════════════════
   页面
   ═══════════════════════════════════════ */
export default function TemplateDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const openTab = useTabStore((s) => s.openTab)

  const tpl: MockTemplate | undefined = MOCK_TEMPLATES.find((t) => t.id === id)

  useEffect(() => {
    if (tpl) openTab(`/templates/${tpl.id}`, tpl.name)
  }, [tpl, openTab])

  const handleUse = () => {
    openTab('/activities/create', '创建活动')
    navigate('/activities/create')
  }

  if (!tpl) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <LayoutTemplate className="w-10 h-10 text-gray-200" />
        <p className="text-sm text-gray-500">模板不存在</p>
        <button onClick={() => navigate('/templates')} className="text-sm text-orange-500 hover:underline">
          返回模板库
        </button>
      </div>
    )
  }

  return (
    <div>
      {/* 面包屑 */}
      <button
        onClick={() => navigate('/templates')}
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 mb-5 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        模板库
        <ChevronRight className="w-3 h-3 text-gray-300" />
        <span className="text-gray-800 font-medium">{tpl.name}</span>
      </button>

      <div className="flex gap-6 items-start">

        {/* ═══ 左栏 ═══ */}
        <div className="flex-1 min-w-0 space-y-4">

          {/* 信息卡 */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <div className="flex items-center gap-2 mb-1.5">
              <h1 className="text-lg font-semibold text-gray-900">{tpl.name}</h1>
              <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full font-medium">
                {CATEGORY_LABELS[tpl.category]}
              </span>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed mb-3">{tpl.description}</p>
            <div className="flex flex-wrap gap-1.5">
              {tpl.tags.map((tag) => (
                <span key={tag} className="text-xs px-2.5 py-0.5 rounded-full bg-orange-50 text-orange-600 font-medium">
                  {tag}
                </span>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1.5">
                <BarChart2 className="w-3.5 h-3.5" />
                已使用 <strong className="text-gray-800">{tpl.usageCount}</strong> 次
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                创建于 {tpl.createdAt}
              </span>
              {tpl.createdFrom && (
                <span className="flex items-center gap-1.5">
                  <Copy className="w-3.5 h-3.5" />
                  来源：{tpl.createdFrom}
                </span>
              )}
            </div>
          </div>

          {/* 组件列表 */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-orange-400" />
              <h2 className="text-sm font-semibold text-gray-800">包含组件</h2>
              <span className="text-xs text-gray-400">{tpl.components.length} 个</span>
            </div>
            <p className="text-xs text-gray-400 mb-3">使用此模板后，以下组件将自动加载到画布</p>
            {tpl.components.map((c, i) => (
              <ComponentRow key={i} comp={c} index={i} />
            ))}
          </div>
        </div>

        {/* ═══ 右栏 ═══ */}
        <div className="w-60 shrink-0 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <div className="flex items-center gap-2 mb-4">
              <Smartphone className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">预览</span>
            </div>
            <TemplatePhonePreview cfg={tpl.preview} width={200} />
          </div>

          <button
            onClick={handleUse}
            className="w-full flex items-center justify-center gap-2 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm rounded-2xl transition-colors shadow-sm shadow-orange-200"
          >
            <Sparkles className="w-4 h-4" />
            使用此模板
          </button>
          <button
            onClick={() => navigate('/templates')}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium text-sm rounded-2xl transition-colors"
          >
            返回模板库
          </button>
        </div>

      </div>
    </div>
  )
}
