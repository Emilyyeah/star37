/* 工作台 — 概览统计 + 最近活动 + 快捷入口 */

import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Sparkles, Puzzle, FolderOpen, LayoutTemplate,
  Plus, ArrowRight, TrendingUp, CheckCircle2, Clock, FileEdit,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTabStore } from '@/lib/tabStore'

/* ── Mock 数据 ── */
const STATS = [
  { label: '活动总数', value: 9, sub: '较上月 +2', trend: 'up', icon: FolderOpen, accent: 'text-blue-600', bg: 'bg-blue-50' },
  { label: '进行中', value: 2, sub: '本月活跃', trend: 'up', icon: TrendingUp, accent: 'text-green-600', bg: 'bg-green-50' },
  { label: '组件库', value: 10, sub: '已上线组件', trend: 'neutral', icon: Puzzle, accent: 'text-purple-600', bg: 'bg-purple-50' },
  { label: '模板数量', value: 6, sub: '可直接使用', trend: 'neutral', icon: LayoutTemplate, accent: 'text-orange-600', bg: 'bg-orange-50' },
]

type ActivityStatus = 'running' | 'ended' | 'draft'
const STATUS_MAP: Record<ActivityStatus, { label: string; icon: React.ElementType; cls: string }> = {
  running: { label: '进行中', icon: CheckCircle2, cls: 'text-green-600' },
  ended:   { label: '已结束', icon: Clock, cls: 'text-gray-400' },
  draft:   { label: '草稿', icon: FileEdit, cls: 'text-orange-500' },
}

const RECENT_ACTIVITIES = [
  { id: 'act-009', name: '暑期狂欢节', game: '斗罗3D', status: 'draft' as ActivityStatus, updatedAt: '今天 10:00', components: 0 },
  { id: 'act-008', name: '端午龙舟赛', game: '斗罗MMO', status: 'draft' as ActivityStatus, updatedAt: '昨天 09:00', components: 4 },
  { id: 'act-001', name: '618 大转盘抽奖', game: '斗罗3D', status: 'running' as ActivityStatus, updatedAt: '2026-06-01', components: 5 },
  { id: 'act-002', name: '新服签到福利', game: '斗罗MMO', status: 'running' as ActivityStatus, updatedAt: '2026-05-18', components: 3 },
  { id: 'act-005', name: '夏日冲浪季', game: '生存33天', status: 'draft' as ActivityStatus, updatedAt: '2026-05-30', components: 2 },
]

const QUICK_ACTIONS = [
  { label: '创建活动', desc: '上传设计稿，AI 识别生成', path: '/activities/create', tabLabel: '创建活动', icon: Plus, highlight: true },
  { label: '活动管理', desc: '查看所有活动列表', path: '/activities', tabLabel: '活动管理', icon: FolderOpen, highlight: false },
  { label: '组件库', desc: '管理可复用组件', path: '/components', tabLabel: '组件库', icon: Puzzle, highlight: false },
  { label: '模板库', desc: '浏览并使用模板', path: '/templates', tabLabel: '模板库', icon: LayoutTemplate, highlight: false },
]

/* ── 组件 ── */
export default function DashboardPage() {
  const navigate = useNavigate()
  const openTab = useTabStore((s) => s.openTab)

  useEffect(() => { openTab('/', '工作台') }, [openTab])

  const go = (path: string, label: string) => {
    openTab(path, label)
    navigate(path)
  }

  return (
    <div className="space-y-6">

      {/* 页头 */}
      <div className="flex items-center gap-3">
        <LayoutDashboard className="w-6 h-6 text-gray-400" />
        <h1 className="text-xl font-semibold text-gray-900">工作台</h1>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {STATS.map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-sm transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-500">{s.label}</span>
              <div className={cn('w-8 h-8 rounded-xl flex items-center justify-center', s.bg)}>
                <s.icon className={cn('w-4 h-4', s.accent)} />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">{s.value}</p>
            <p className={cn('text-xs', s.trend === 'up' ? 'text-green-500' : 'text-gray-400')}>{s.sub}</p>
          </div>
        ))}
      </div>

      {/* 中区：最近活动 + 快捷入口 */}
      <div className="grid grid-cols-3 gap-4">

        {/* 最近活动 — 占 2/3 */}
        <div className="col-span-2 bg-white rounded-2xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-800">最近活动</h2>
            <button
              onClick={() => go('/activities', '活动管理')}
              className="text-xs text-orange-500 hover:text-orange-600 flex items-center gap-0.5 transition-colors"
            >
              查看全部 <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-400 border-b border-gray-100">
                <th className="text-left pb-2 font-medium">活动名称</th>
                <th className="text-left pb-2 font-medium">游戏</th>
                <th className="text-left pb-2 font-medium">状态</th>
                <th className="text-left pb-2 font-medium">组件数</th>
                <th className="text-left pb-2 font-medium">更新时间</th>
                <th className="pb-2" />
              </tr>
            </thead>
            <tbody>
              {RECENT_ACTIVITIES.map((act) => {
                const s = STATUS_MAP[act.status]
                return (
                  <tr
                    key={act.id}
                    className="border-b border-gray-50 last:border-none hover:bg-gray-50/60 cursor-pointer transition-colors"
                    onClick={() => go(`/activities/${act.id}`, act.name)}
                  >
                    <td className="py-3 pr-3 font-medium text-gray-800 truncate max-w-[180px]">{act.name}</td>
                    <td className="py-3 pr-3 text-gray-500 text-xs">{act.game}</td>
                    <td className="py-3 pr-3">
                      <span className={cn('inline-flex items-center gap-1 text-xs font-medium', s.cls)}>
                        <s.icon className="w-3 h-3" />
                        {s.label}
                      </span>
                    </td>
                    <td className="py-3 pr-3 text-gray-500 text-xs">{act.components} 个</td>
                    <td className="py-3 pr-3 text-gray-400 text-xs">{act.updatedAt}</td>
                    <td className="py-3">
                      <ArrowRight className="w-3.5 h-3.5 text-gray-300" />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* 快捷入口 — 占 1/3 */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-800 mb-4">快捷入口</h2>
          <div className="space-y-2">
            {QUICK_ACTIONS.map((a) => (
              <button
                key={a.path}
                onClick={() => go(a.path, a.tabLabel)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all',
                  a.highlight
                    ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-sm shadow-orange-200'
                    : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                )}
              >
                <div className={cn(
                  'w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
                  a.highlight ? 'bg-white/20' : 'bg-white border border-gray-200'
                )}>
                  <a.icon className={cn('w-4 h-4', a.highlight ? 'text-white' : 'text-gray-500')} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn('text-sm font-medium', a.highlight ? 'text-white' : 'text-gray-800')}>{a.label}</p>
                  <p className={cn('text-xs truncate', a.highlight ? 'text-white/75' : 'text-gray-400')}>{a.desc}</p>
                </div>
                <ArrowRight className={cn('w-3.5 h-3.5 shrink-0', a.highlight ? 'text-white/60' : 'text-gray-300')} />
              </button>
            ))}
          </div>

          {/* AI 提示 */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-start gap-2 p-3 bg-orange-50 rounded-xl">
              <Sparkles className="w-4 h-4 text-orange-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-medium text-orange-700">AI 提示</p>
                <p className="text-xs text-orange-600/80 mt-0.5">上传设计稿，AI 可自动识别组件并完成配参，效率提升 80%</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
