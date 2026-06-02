/* 活动管理 — 按游戏分 Tab，全宽表格，底部分页 */

import { useState, useMemo, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { FolderOpen, Search, Plus, Copy, Pencil, Ban, X, ChevronLeft, ChevronRight, LayoutTemplate } from 'lucide-react'
import { SaveAsTemplateDialog } from './components/SaveAsTemplateDialog'
import { cn } from '@/lib/utils'
import { useTabStore } from '@/lib/tabStore'

/* ── 游戏项目 ── */
const GAME_TABS = [
  { key: 'all', label: '全部游戏' },
  { key: 'dl3d', label: '斗罗3D' },
  { key: 'dlmmo', label: '斗罗MMO' },
  { key: 'frxxt', label: '凡人修仙传' },
  { key: 'sc33', label: '生存33天' },
  { key: 'zmsl', label: '织梦森林' },
  { key: 'xxyg', label: '小小蚁国' },
]

/* ── 类型 ── */

type ActivityStatus = 'draft' | 'running' | 'ended'

interface ActivityItem {
  id: string; name: string; gameProject: string; gameName: string; status: ActivityStatus
  startTime: string; endTime: string; components: number; createdAt: string; creator: string
}

const STATUS_MAP: Record<ActivityStatus, { label: string; cls: string }> = {
  draft: { label: '草稿', cls: 'bg-gray-100 text-gray-600' },
  running: { label: '进行中', cls: 'bg-green-100 text-green-700' },
  ended: { label: '已结束', cls: 'bg-orange-100 text-orange-700' },
}

const STATUS_TABS: { key: ActivityStatus | 'all'; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'running', label: '进行中' },
  { key: 'ended', label: '已结束' },
  { key: 'draft', label: '草稿' },
]

const PAGE_SIZE = 10

const INITIAL_ACTIVITIES: ActivityItem[] = [
  { id: 'act-001', name: '618 大转盘抽奖', gameProject: 'dl3d', gameName: '斗罗3D', status: 'running', startTime: '2026-06-01 00:00', endTime: '2026-06-18 23:59', components: 5, createdAt: '2026-05-28 14:30', creator: '艾米莉' },
  { id: 'act-002', name: '新服签到福利', gameProject: 'dlmmo', gameName: '斗罗MMO', status: 'running', startTime: '2026-05-20 00:00', endTime: '2026-06-20 23:59', components: 3, createdAt: '2026-05-18 10:00', creator: '小王' },
  { id: 'act-003', name: '五一劳动节活动', gameProject: 'frxxt', gameName: '凡人修仙传', status: 'ended', startTime: '2026-05-01 00:00', endTime: '2026-05-07 23:59', components: 6, createdAt: '2026-04-25 16:20', creator: '艾米莉' },
  { id: 'act-004', name: '周年庆典大回馈', gameProject: 'xxyg', gameName: '小小蚁国', status: 'ended', startTime: '2026-04-15 00:00', endTime: '2026-04-30 23:59', components: 8, createdAt: '2026-04-10 09:00', creator: '小李' },
  { id: 'act-005', name: '夏日冲浪季', gameProject: 'sc33', gameName: '生存33天', status: 'draft', startTime: '', endTime: '', components: 2, createdAt: '2026-05-30 15:45', creator: '艾米莉' },
  { id: 'act-006', name: '邀请好友赢大奖', gameProject: 'zmsl', gameName: '织梦森林', status: 'ended', startTime: '2026-03-01 00:00', endTime: '2026-03-31 23:59', components: 4, createdAt: '2026-02-25 11:30', creator: '小王' },
  { id: 'act-007', name: '清明踏青活动', gameProject: 'dl3d', gameName: '斗罗3D', status: 'ended', startTime: '2026-04-04 00:00', endTime: '2026-04-06 23:59', components: 3, createdAt: '2026-03-28 14:00', creator: '小李' },
  { id: 'act-008', name: '端午龙舟赛', gameProject: 'dlmmo', gameName: '斗罗MMO', status: 'draft', startTime: '2026-06-25 00:00', endTime: '2026-06-28 23:59', components: 4, createdAt: '2026-05-31 09:00', creator: '艾米莉' },
  { id: 'act-009', name: '暑期狂欢节', gameProject: 'dl3d', gameName: '斗罗3D', status: 'draft', startTime: '2026-07-01 00:00', endTime: '2026-07-31 23:59', components: 0, createdAt: '2026-06-01 10:00', creator: '艾米莉' },
]

/* ── 页面 ── */

export default function ActivityListPage() {
  const navigate = useNavigate()
  const openTab = useTabStore((s) => s.openTab)

  useEffect(() => { openTab('/activities', '活动管理') }, [openTab])

  const [activities, setActivities] = useState<ActivityItem[]>(INITIAL_ACTIVITIES)
  const [gameTab, setGameTab] = useState('all')
  const [statusFilter, setStatusFilter] = useState<ActivityStatus | 'all'>('all')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [offlineConfirm, setOfflineConfirm] = useState<ActivityItem | null>(null)
  const [saveAsTpl, setSaveAsTpl] = useState<ActivityItem | null>(null)

  // 筛选后的全量数据
  const filtered = useMemo(() => {
    let list = activities
    if (gameTab !== 'all') list = list.filter((a) => a.gameProject === gameTab)
    if (statusFilter !== 'all') list = list.filter((a) => a.status === statusFilter)
    if (search.trim()) {
      const kw = search.trim().toLowerCase()
      list = list.filter((a) => a.name.toLowerCase().includes(kw))
    }
    return list
  }, [activities, gameTab, statusFilter, search])

  // 分页
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paged = useMemo(() => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [filtered, page])

  // 筛选条件变化时回到第一页
  useEffect(() => { setPage(1) }, [gameTab, statusFilter, search])


  const handleEdit = useCallback((id: string) => navigate(`/activities/create?edit=${id}`), [navigate])

  const handleCopy = useCallback((act: ActivityItem) => {
    const now = new Date()
    const ts = now.toISOString().slice(0, 16).replace('T', ' ')
    const newAct: ActivityItem = { ...act, id: `act-${Date.now().toString(36)}`, name: `${act.name}（副本）`, status: 'draft', createdAt: ts, creator: '艾米莉' }
    setActivities((prev) => [newAct, ...prev])
  }, [])

  const handleOfflineConfirm = useCallback(() => {
    if (!offlineConfirm) return
    setActivities((prev) => prev.map((a) => a.id === offlineConfirm.id ? { ...a, status: 'ended' as ActivityStatus } : a))
    setOfflineConfirm(null)
  }, [offlineConfirm])

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* 顶部栏 */}
      <div className="shrink-0 px-6 pt-5 pb-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <FolderOpen className="w-5 h-5 text-gray-400" />
            <h1 className="text-lg font-semibold text-gray-900">活动管理</h1>
          </div>
          <button onClick={() => navigate('/activities/create')} className="inline-flex items-center gap-1.5 px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors">
            <Plus className="w-4 h-4" />新建活动
          </button>
        </div>

        {/* 游戏 Tab（不显示数量） */}
        <div className="flex items-center gap-1 border-b border-gray-200 -mx-6 px-6">
          {GAME_TABS.map((tab) => (
            <button key={tab.key} onClick={() => { setGameTab(tab.key); setStatusFilter('all') }}
              className={cn('px-3 py-2 text-xs font-medium border-b-2 transition-colors -mb-px',
                gameTab === tab.key ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700')}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 筛选栏 */}
      <div className="shrink-0 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-1">
          {STATUS_TABS.map((tab) => (
            <button key={tab.key} onClick={() => setStatusFilter(tab.key)}
              className={cn('px-2.5 py-1 rounded text-xs font-medium transition-colors',
                statusFilter === tab.key ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-100')}>
              {tab.label}
            </button>
          ))}
        </div>
        <div className="relative w-52">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="搜索活动名称..."
            className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-orange-400" />
        </div>
      </div>

      {/* 表格 */}
      <div className="flex-1 overflow-auto px-6">
        {paged.length > 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-left table-fixed">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-4 py-2.5 text-xs font-medium text-gray-500 w-[22%]">活动名称</th>
                  {gameTab === 'all' && <th className="px-4 py-2.5 text-xs font-medium text-gray-500 w-[10%]">所属游戏</th>}
                  <th className="px-4 py-2.5 text-xs font-medium text-gray-500 w-[8%]">状态</th>
                  <th className="px-4 py-2.5 text-xs font-medium text-gray-500 w-[12%]">开始时间</th>
                  <th className="px-4 py-2.5 text-xs font-medium text-gray-500 w-[12%]">结束时间</th>
                  <th className="px-4 py-2.5 text-xs font-medium text-gray-500 w-[8%]">创建人</th>
                  <th className="px-4 py-2.5 text-xs font-medium text-gray-500 w-[16%]">创建时间</th>
                  <th className="px-4 py-2.5 text-xs font-medium text-gray-500 w-[10%] text-right">操作</th>
                </tr>
              </thead>
              <tbody>
                {paged.map((act) => (
                  <tr key={act.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <button onClick={() => navigate(`/activities/${act.id}`)} className="text-sm font-medium text-gray-900 hover:text-orange-600 transition-colors truncate block text-left">
                        {act.name}
                      </button>
                    </td>
                    {gameTab === 'all' && <td className="px-4 py-3 text-xs text-gray-600">{act.gameName}</td>}
                    <td className="px-4 py-3">
                      <span className={cn('inline-block px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap', STATUS_MAP[act.status].cls)}>{STATUS_MAP[act.status].label}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{act.startTime ? act.startTime.slice(0, 16) : <span className="text-gray-400">未设置</span>}</td>
                    <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{act.endTime ? act.endTime.slice(0, 16) : <span className="text-gray-400">未设置</span>}</td>
                    <td className="px-4 py-3 text-xs text-gray-600">{act.creator}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">{act.createdAt}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-0.5">
                        <button onClick={() => handleEdit(act.id)} className="p-1.5 rounded-md text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors" title="编辑">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleCopy(act)} className="p-1.5 rounded-md text-gray-400 hover:text-orange-600 hover:bg-orange-50 transition-colors" title="复制">
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        {act.status === 'running' && (
                          <button onClick={() => setOfflineConfirm(act)} className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors" title="下架">
                            <Ban className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button onClick={() => setSaveAsTpl(act)} className="p-1.5 rounded-md text-gray-400 hover:text-purple-600 hover:bg-purple-50 transition-colors" title="存为模板">
                          <LayoutTemplate className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <FolderOpen className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">无匹配活动</p>
          </div>
        )}
      </div>

      {/* 底部分页 */}
      <div className="shrink-0 px-6 py-3 flex items-center justify-between border-t border-gray-100">
        <span className="text-xs text-gray-500">共 {filtered.length} 条记录</span>
        <div className="flex items-center gap-1">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}
            className={cn('p-1.5 rounded-md transition-colors', page <= 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-100')}>
            <ChevronLeft className="w-4 h-4" />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button key={p} onClick={() => setPage(p)}
              className={cn('w-7 h-7 rounded-md text-xs font-medium transition-colors',
                page === p ? 'bg-orange-500 text-white' : 'text-gray-600 hover:bg-gray-100')}>
              {p}
            </button>
          ))}
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
            className={cn('p-1.5 rounded-md transition-colors', page >= totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-100')}>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 下架确认弹窗 */}
      {offlineConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOfflineConfirm(null)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-[380px] overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900">确认下架</h3>
              <button onClick={() => setOfflineConfirm(null)} className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"><X className="w-4 h-4" /></button>
            </div>
            <div className="px-5 py-4">
              <p className="text-sm text-gray-700">确定要下架活动「<span className="font-medium">{offlineConfirm.name}</span>」吗？</p>
              <p className="text-xs text-gray-500 mt-1.5">下架后活动将停止展示，状态变更为「已结束」。</p>
            </div>
            <div className="border-t border-gray-100 px-5 py-3.5 flex justify-end gap-2.5">
              <button onClick={() => setOfflineConfirm(null)} className="px-4 py-1.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">取消</button>
              <button onClick={handleOfflineConfirm} className="px-4 py-1.5 text-sm font-medium bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">确认下架</button>
            </div>
          </div>
        </div>
      )}

      {/* 存为模板弹窗 */}
      {saveAsTpl && (
        <SaveAsTemplateDialog
          activity={{
            name: saveAsTpl.name,
            componentNames: Array.from({ length: saveAsTpl.components }, (_, i) => `组件${i + 1}`),
          }}
          onClose={() => setSaveAsTpl(null)}
          onSaved={() => setSaveAsTpl(null)}
        />
      )}
    </div>
  )
}
