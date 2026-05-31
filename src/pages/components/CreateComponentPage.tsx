import { Puzzle } from 'lucide-react'

export default function CreateComponentPage() {
  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Puzzle className="w-6 h-6 text-gray-400" />
        <h1 className="text-xl font-semibold text-gray-900">创建组件</h1>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-8">
        <p className="text-sm text-gray-500">AI 辅助组件创建将在 Step 3 实现</p>
      </div>
    </div>
  )
}
