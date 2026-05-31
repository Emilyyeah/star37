import { LayoutTemplate } from 'lucide-react'

export default function TemplateListPage() {
  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <LayoutTemplate className="w-6 h-6 text-gray-400" />
        <h1 className="text-xl font-semibold text-gray-900">模板库</h1>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <LayoutTemplate className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <p className="text-sm text-gray-500">暂无模板</p>
        <p className="text-xs text-gray-400 mt-2">模板库将在 Step 3 实现</p>
      </div>
    </div>
  )
}
