import { LayoutDashboard, Sparkles, Puzzle, FolderOpen } from 'lucide-react'

const stats = [
  { label: '活动总数', value: '0', icon: FolderOpen, color: 'bg-blue-50 text-blue-600' },
  { label: '组件库', value: '0', icon: Puzzle, color: 'bg-green-50 text-green-600' },
  { label: '本月活动', value: '0', icon: Sparkles, color: 'bg-orange-50 text-orange-600' },
]

export default function DashboardPage() {
  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <LayoutDashboard className="w-6 h-6 text-gray-400" />
        <h1 className="text-xl font-semibold text-gray-900">工作台</h1>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-500">{s.label}</span>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${s.color}`}>
                <s.icon className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
        <Sparkles className="w-12 h-12 text-orange-300 mx-auto mb-4" />
        <h2 className="text-lg font-semibold text-gray-900 mb-2">开始创建第一个活动</h2>
        <p className="text-sm text-gray-500 mb-4">上传设计稿，AI 自动识别并生成活动页面</p>
        <a
          href="/activities/create"
          className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors"
        >
          <Sparkles className="w-4 h-4" />
          创建活动
        </a>
      </div>
    </div>
  )
}
