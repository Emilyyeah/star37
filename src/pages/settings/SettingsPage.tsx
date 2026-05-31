import { Settings } from 'lucide-react'

export default function SettingsPage() {
  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Settings className="w-6 h-6 text-gray-400" />
        <h1 className="text-xl font-semibold text-gray-900">系统设置</h1>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-8">
        <p className="text-sm text-gray-500">系统设置页面待实现</p>
      </div>
    </div>
  )
}
