import { FolderOpen } from 'lucide-react'

export default function ActivityListPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FolderOpen className="w-6 h-6 text-gray-400" />
          <h1 className="text-xl font-semibold text-gray-900">活动管理</h1>
        </div>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <FolderOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <p className="text-sm text-gray-500">暂无活动记录</p>
        <p className="text-xs text-gray-400 mt-2">创建活动后将在此显示历史列表</p>
      </div>
    </div>
  )
}
