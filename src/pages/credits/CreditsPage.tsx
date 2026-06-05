/* 积分消耗明细页 — 顶部额度卡片 + 消耗日志表格 */

import { useState, useMemo, useEffect } from 'react'
import { Sparkles, Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTabStore } from '@/lib/tabStore'
import { useAuthStore } from '@/lib/authStore'

/* ── 模型额度 ── */
const MODEL_BALANCES = [
  { key: 'claude', label: 'Claude', icon: '🟣', balance: 320, total: 500, color: 'bg-purple-500' },
  { key: 'gemini', label: 'Gemini', icon: '✦', balance: 500, total: 500, color: 'bg-blue-500' },
  { key: 'gpt', label: 'GPT', icon: '🤖', balance: 180, total: 500, color: 'bg-green-500' },
  { key: 'deepseek', label: 'DeepSeek', icon: '🔵', balance: 450, total: 500, color: 'bg-cyan-500' },
]

/* ── 消耗日志 Mock ── */
interface CreditLog {
  id: string
  time: string
  model: string
  modelLabel: string
  action: string
  tokens: number
  cost: number      // 消耗金额（元）
  user: string
  project: string
}

const MOCK_LOGS: CreditLog[] = [
  { id: 'log-001', time: '2026-06-05 14:32:15', model: 'claude', modelLabel: 'Claude', action: 'AI 识别设计稿', tokens: 12580, cost: 2.5, user: '艾米莉', project: '斗罗3D' },
  { id: 'log-002', time: '2026-06-05 14:28:03', model: 'claude', modelLabel: 'Claude', action: 'AI 对话 — 活动配参', tokens: 8420, cost: 1.68, user: '艾米莉', project: '斗罗3D' },
  { id: 'log-003', time: '2026-06-05 13:55:41', model: 'gemini', modelLabel: 'Gemini', action: 'AI 生图 — 618大促Banner', tokens: 0, cost: 3.0, user: '小王', project: '斗罗MMO' },
  { id: 'log-004', time: '2026-06-05 11:20:08', model: 'deepseek', modelLabel: 'DeepSeek', action: 'AI 对话 — 组件推荐', tokens: 6200, cost: 0.12, user: '小李', project: '凡人修仙传' },
  { id: 'log-005', time: '2026-06-05 10:15:33', model: 'gpt', modelLabel: 'GPT', action: 'AI 改图 — 智能改尺寸', tokens: 4300, cost: 1.2, user: '艾米莉', project: '斗罗3D' },
  { id: 'log-006', time: '2026-06-04 18:42:19', model: 'claude', modelLabel: 'Claude', action: 'AI 识别设计稿', tokens: 15200, cost: 3.04, user: '小王', project: '斗罗MMO' },
  { id: 'log-007', time: '2026-06-04 16:30:55', model: 'gemini', modelLabel: 'Gemini', action: 'AI 生图 — 签到活动弹窗', tokens: 0, cost: 2.5, user: '艾米莉', project: '斗罗3D' },
  { id: 'log-008', time: '2026-06-04 15:18:42', model: 'gpt', modelLabel: 'GPT', action: 'AI 对话 — 活动方案', tokens: 9800, cost: 2.94, user: '小王', project: '斗罗3D' },
  { id: 'log-009', time: '2026-06-04 14:05:11', model: 'deepseek', modelLabel: 'DeepSeek', action: 'AI 对话 — 文案生成', tokens: 3100, cost: 0.06, user: '艾米莉', project: '织梦森林' },
  { id: 'log-010', time: '2026-06-04 11:22:38', model: 'claude', modelLabel: 'Claude', action: 'AI 对话 — 组件配参', tokens: 7600, cost: 1.52, user: '小李', project: '生存33天' },
  { id: 'log-011', time: '2026-06-03 17:45:20', model: 'gpt', modelLabel: 'GPT', action: 'AI 改图 — 换背景', tokens: 5100, cost: 1.53, user: '艾米莉', project: '斗罗MMO' },
  { id: 'log-012', time: '2026-06-03 16:10:05', model: 'gemini', modelLabel: 'Gemini', action: 'AI 生图 — 开屏图', tokens: 0, cost: 3.5, user: '小王', project: '斗罗3D' },
  { id: 'log-013', time: '2026-06-03 14:30:18', model: 'deepseek', modelLabel: 'DeepSeek', action: 'AI 对话 — 活动规则', tokens: 4500, cost: 0.09, user: '小李', project: '小小蚁国' },
  { id: 'log-014', time: '2026-06-03 10:55:42', model: 'claude', modelLabel: 'Claude', action: 'AI 识别设计稿', tokens: 18900, cost: 3.78, user: '艾米莉', project: '凡人修仙传' },
  { id: 'log-015', time: '2026-06-02 15:20:30', model: 'gpt', modelLabel: 'GPT', action: 'AI 对话 — 模板推荐', tokens: 3200, cost: 0.96, user: '小王', project: '斗罗MMO' },
  { id: 'log-016', time: '2026-06-02 13:10:15', model: 'claude', modelLabel: 'Claude', action: 'AI 对话 — 活动配参', tokens: 11300, cost: 2.26, user: '艾米莉', project: '斗罗3D' },
  { id: 'log-017', time: '2026-06-02 10:45:08', model: 'gemini', modelLabel: 'Gemini', action: 'AI 生图 — 推送图', tokens: 0, cost: 2.0, user: '小王', project: '斗罗3D' },
  { id: 'log-018', time: '2026-06-01 18:30:22', model: 'deepseek', modelLabel: 'DeepSeek', action: 'AI 对话 — 数据分析', tokens: 8800, cost: 0.18, user: '小李', project: '斗罗3D' },
]

const MODEL_ICON_MAP: Record<string, string> = {
  claude: '🟣', gemini: '✦', gpt: '🤖', deepseek: '🔵',
}

const MODEL_FILTER = [
  { key: 'all', label: '全部模型' },
  { key: 'claude', label: 'Claude' },
  { key: 'gemini', label: 'Gemini' },
  { key: 'gpt', label: 'GPT' },
  { key: 'deepseek', label: 'DeepSeek' },
]

const PAGE_SIZE = 10

export default function CreditsPage() {
  const openTab = useTabStore((s) => s.openTab)
  useEffect(() => { openTab('/credits', '积分明细') }, [openTab])

  const [modelFilter, setModelFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const currentUser = useAuthStore((s) => s.user)

  const filtered = useMemo(() => {
    // 只展示当前登录账号的消耗
    let list = MOCK_LOGS.filter((l) => l.user === currentUser?.name)
    if (modelFilter !== 'all') list = list.filter((l) => l.model === modelFilter)
    if (search.trim()) {
      const kw = search.trim().toLowerCase()
      list = list.filter((l) =>
        l.action.toLowerCase().includes(kw) ||
        l.user.toLowerCase().includes(kw) ||
        l.project.toLowerCase().includes(kw)
      )
    }
    return list
  }, [modelFilter, search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paged = useMemo(() => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [filtered, page])
  const totalCost = useMemo(() => filtered.reduce((sum, l) => sum + l.cost, 0), [filtered])

  useEffect(() => { setPage(1) }, [modelFilter, search])

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* 顶部 */}
      <div className="shrink-0 px-6 pt-5 pb-4">
        <div className="flex items-center gap-3 mb-5">
          <Sparkles className="w-5 h-5 text-orange-500" />
          <h1 className="text-lg font-semibold text-gray-900">积分明细</h1>
        </div>

        {/* 额度卡片 */}
        <div className="grid grid-cols-4 gap-4 mb-5">
          {MODEL_BALANCES.map((m) => {
            const pct = Math.round((m.balance / m.total) * 100)
            return (
              <div key={m.key} className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{m.icon}</span>
                    <span className="text-sm font-medium text-gray-700">{m.label}</span>
                  </div>
                  <span className="text-xs text-gray-400">{pct}%</span>
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-2">
                  ¥{m.balance}<span className="text-sm font-normal text-gray-400 ml-1">/ {m.total}</span>
                </div>
                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className={cn('h-full rounded-full transition-all', m.color)} style={{ width: `${pct}%` }} />
                </div>
              </div>
            )
          })}
        </div>

        {/* 筛选栏 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            {MODEL_FILTER.map((f) => (
              <button key={f.key} onClick={() => setModelFilter(f.key)}
                className={cn('px-2.5 py-1 rounded text-xs font-medium transition-colors',
                  modelFilter === f.key ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-100')}>
                {f.label}
              </button>
            ))}
          </div>
          <div className="relative w-52">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="搜索操作、用户、项目..."
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-orange-400" />
          </div>
        </div>
      </div>

      {/* 日志表格 */}
      <div className="flex-1 overflow-auto px-6">
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm table-fixed">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 w-[16%]">时间</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 w-[10%]">模型</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 w-[28%]">操作</th>
                <th className="text-right px-4 py-2.5 text-xs font-medium text-gray-500 w-[10%]">Tokens</th>
                <th className="text-right px-4 py-2.5 text-xs font-medium text-gray-500 w-[10%]">消耗(元)</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 w-[10%]">用户</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 w-[16%]">所属项目</th>
              </tr>
            </thead>
            <tbody>
              {paged.map((log) => (
                <tr key={log.id} className="border-b border-gray-50 last:border-none hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{log.time}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-700">
                      <span>{MODEL_ICON_MAP[log.model]}</span>{log.modelLabel}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-800 font-medium truncate">{log.action}</td>
                  <td className="px-4 py-3 text-xs text-gray-500 text-right font-mono">
                    {log.tokens > 0 ? log.tokens.toLocaleString() : '—'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-xs font-semibold text-orange-600">-¥{log.cost.toFixed(2)}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600">{log.user}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">{log.project}</td>
                </tr>
              ))}
              {paged.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-sm text-gray-400">无匹配记录</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 底部分页 */}
      <div className="shrink-0 px-6 py-3 flex items-center justify-between border-t border-gray-100">
        <span className="text-xs text-gray-500">
          共 {filtered.length} 条记录 · 累计消耗 <span className="font-semibold text-orange-600">¥{totalCost.toFixed(2)}</span>
        </span>
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
    </div>
  )
}
