import { Puzzle } from 'lucide-react'

export default function ComponentListPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Puzzle className="w-6 h-6 text-gray-400" />
          <h1 className="text-xl font-semibold text-gray-900">组件库</h1>
        </div>
        <a
          href="/components/create"
          className="inline-flex items-center gap-2 px-3 py-1.5 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors"
        >
          创建组件
        </a>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <Puzzle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <p className="text-sm text-gray-500">组件库为空</p>
        <p className="text-xs text-gray-400 mt-2">组件库管理将在 Step 3 实现</p>
      </div>
    </div>
  )
}
