/* 工作台 */

import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, CheckCircle2, AlertTriangle, ArrowRight, ChevronLeft, ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTabStore } from '@/lib/tabStore'

/* ══════════════════════════════════════
   Mock 数据
══════════════════════════════════════ */

type ActivityStatus = 'draft' | 'running' | 'ended'

interface DashActivity {
  id: string; name: string; gameProject: string; gameName: string
  status: ActivityStatus; startTime: string; endTime: string; creator: string
}

const ACTIVITIES: DashActivity[] = [
  { id: 'act-001', name: '618 大转盘抽奖',  gameProject: 'dl3d',  gameName: '斗罗大陆3D',  status: 'running', startTime: '2026-06-01', endTime: '2026-06-08', creator: '艾米莉' },
  { id: 'act-009', name: '暑期狂欢节',      gameProject: 'dl3d',  gameName: '斗罗大陆3D',  status: 'draft',   startTime: '2026-07-01', endTime: '2026-07-31', creator: '艾米莉' },
  { id: 'act-007', name: '清明踏青活动',    gameProject: 'dl3d',  gameName: '斗罗大陆3D',  status: 'ended',   startTime: '2026-04-04', endTime: '2026-04-06', creator: '小李' },
  { id: 'act-012', name: '元旦签到活动',    gameProject: 'dl3d',  gameName: '斗罗大陆3D',  status: 'ended',   startTime: '2026-01-01', endTime: '2026-01-07', creator: '小李' },
  { id: 'act-013', name: '春节大礼包',      gameProject: 'dl3d',  gameName: '斗罗大陆3D',  status: 'ended',   startTime: '2026-02-01', endTime: '2026-02-14', creator: '艾米莉' },
  { id: 'act-002', name: '新服签到福利',    gameProject: 'dlmmo', gameName: '斗罗大陆MMO', status: 'running', startTime: '2026-05-20', endTime: '2026-06-18', creator: '小王' },
  { id: 'act-008', name: '端午龙舟赛',      gameProject: 'dlmmo', gameName: '斗罗大陆MMO', status: 'draft',   startTime: '2026-06-25', endTime: '2026-06-28', creator: '艾米莉' },
  { id: 'act-014', name: '情人节活动',      gameProject: 'dlmmo', gameName: '斗罗大陆MMO', status: 'ended',   startTime: '2026-02-14', endTime: '2026-02-20', creator: '小王' },
  { id: 'act-003', name: '五一劳动节活动',  gameProject: 'frxxt', gameName: '凡人修仙传',  status: 'ended',   startTime: '2026-05-01', endTime: '2026-05-07', creator: '艾米莉' },
  { id: 'act-011', name: '新手引导活动',    gameProject: 'frxxt', gameName: '凡人修仙传',  status: 'running', startTime: '2026-06-01', endTime: '2026-06-30', creator: '小李' },
  { id: 'act-015', name: '开服庆典',        gameProject: 'frxxt', gameName: '凡人修仙传',  status: 'ended',   startTime: '2026-03-15', endTime: '2026-03-20', creator: '小李' },
  { id: 'act-005', name: '夏日冲浪季',      gameProject: 'sc33',  gameName: '生存33天',    status: 'draft',   startTime: '2026-07-01', endTime: '2026-07-31', creator: '艾米莉' },
  { id: 'act-010', name: '夏季登录奖励',    gameProject: 'sc33',  gameName: '生存33天',    status: 'running', startTime: '2026-06-01', endTime: '2026-06-07', creator: '小王' },
  { id: 'act-006', name: '邀请好友赢大奖',  gameProject: 'zmsl',  gameName: '织梦森林',    status: 'ended',   startTime: '2026-03-01', endTime: '2026-03-31', creator: '小王' },
  { id: 'act-016', name: '织梦周年庆',      gameProject: 'zmsl',  gameName: '织梦森林',    status: 'ended',   startTime: '2026-05-10', endTime: '2026-05-20', creator: '艾米莉' },
  { id: 'act-004', name: '周年庆典大回馈',  gameProject: 'xxyg',  gameName: '小小蚁国',    status: 'ended',   startTime: '2026-04-15', endTime: '2026-04-30', creator: '小李' },
  { id: 'act-017', name: '蚁国春节活动',    gameProject: 'xxyg',  gameName: '小小蚁国',    status: 'ended',   startTime: '2026-01-28', endTime: '2026-02-10', creator: '小李' },
]

const GAMES = [
  { key: 'dl3d',  name: '斗罗大陆3D',  color: '#f97316' },
  { key: 'dlmmo', name: '斗罗大陆MMO', color: '#3b82f6' },
  { key: 'frxxt', name: '凡人修仙传',  color: '#10b981' },
  { key: 'sc33',  name: '生存33天',    color: '#a855f7' },
  { key: 'zmsl',  name: '织梦森林',    color: '#f59e0b' },
  { key: 'xxyg',  name: '小小蚁国',    color: '#ef4444' },
]

/* ══════════════════════════════════════
   工具函数
══════════════════════════════════════ */

function daysFromToday(dateStr: string): number {
  if (!dateStr) return Infinity
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const target = new Date(dateStr); target.setHours(0, 0, 0, 0)
  return Math.round((target.getTime() - today.getTime()) / 86400000)
}

function isExpiringSoon(act: DashActivity) {
  if (act.status !== 'running') return false
  const d = daysFromToday(act.endTime)
  return d >= 0 && d <= 7
}

function remainText(endTime: string) {
  const d = daysFromToday(endTime)
  if (d < 0)   return { text: '已过期',   urgent: true }
  if (d === 0) return { text: '今天到期', urgent: true }
  if (d === 1) return { text: '明天到期', urgent: true }
  return { text: `${d} 天后`, urgent: false }
}

function inMonth(act: DashActivity, year: number, month: number) {
  if (!act.startTime) return false
  const d = new Date(act.startTime)
  return d.getFullYear() === year && d.getMonth() + 1 === month
}

/* ══════════════════════════════════════
   顶部：折线图趋势（按月，纯 SVG）
══════════════════════════════════════ */

function TrendChart() {
  const now = new Date()
  const year = now.getFullYear()
  const curMonth = now.getMonth() + 1

  // 月度数据（1-6月）
  const months = [1, 2, 3, 4, 5, 6]
  const monthLabels = ['1月', '2月', '3月', '4月', '5月', '6月']

  // 每月按游戏统计
  const monthTotals = months.map((m) => ACTIVITIES.filter((a) => inMonth(a, year, m)).length)

  // 季度汇总
  const q1 = months.slice(0, 3).reduce((s, m) => s + ACTIVITIES.filter((a) => inMonth(a, year, m)).length, 0)
  const q2 = months.slice(3, 6).reduce((s, m) => s + ACTIVITIES.filter((a) => inMonth(a, year, m)).length, 0)
  const lastM = curMonth === 1 ? 12 : curMonth - 1
  const lastMCount = ACTIVITIES.filter((a) => inMonth(a, year === 2026 && curMonth === 1 ? year - 1 : year, lastM)).length

  // SVG 折线图参数
  const W = 600, H = 80, PAD_L = 8, PAD_R = 8, PAD_T = 8, PAD_B = 4
  const chartW = W - PAD_L - PAD_R
  const chartH = H - PAD_T - PAD_B
  const max = Math.max(...monthTotals, 1)

  const pts = monthTotals.map((v, i) => ({
    x: PAD_L + (i / (months.length - 1)) * chartW,
    y: PAD_T + chartH - (v / max) * chartH,
    v,
  }))

  const polyline = pts.map((p) => `${p.x},${p.y}`).join(' ')

  // 渐变填充路径
  const area = [
    `M${pts[0].x},${PAD_T + chartH}`,
    ...pts.map((p) => `L${p.x},${p.y}`),
    `L${pts[pts.length - 1].x},${PAD_T + chartH}`,
    'Z',
  ].join(' ')

  return (
    <div className="bg-white rounded-2xl border border-gray-200 px-6 py-5">
      {/* 头部：季度汇总数字 */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm font-semibold text-gray-800 mb-0.5">活动趋势</p>
          <p className="text-xs text-gray-400">{year}年 按月统计</p>
        </div>
        <div className="flex items-center gap-6">
          {[
            { label: 'Q1（1-3月）', value: q1 },
            { label: 'Q2（4-6月）', value: q2 },
            { label: `上月（${lastM}月）`, value: lastMCount },
          ].map((s) => (
            <div key={s.label} className="text-right">
              <p className="text-xl font-bold text-gray-900 leading-none">{s.value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 折线图 */}
      <div className="relative">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 80 }}>
          <defs>
            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f97316" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
            </linearGradient>
          </defs>
          {/* 面积填充 */}
          <path d={area} fill="url(#areaGrad)" />
          {/* 折线 */}
          <polyline points={polyline} fill="none" stroke="#f97316" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
          {/* 数据点 + 数值标注 */}
          {pts.map((p, i) => (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r="3" fill="#f97316" stroke="white" strokeWidth="1.5" />
              {p.v > 0 && (
                <text x={p.x} y={p.y - 7} textAnchor="middle" fontSize="10" fill="#f97316" fontWeight="600">
                  {p.v}
                </text>
              )}
            </g>
          ))}
          {/* Q1/Q2 分割线 */}
          {(() => {
            const qx = PAD_L + (2.5 / (months.length - 1)) * chartW
            return <line x1={qx} y1={PAD_T} x2={qx} y2={PAD_T + chartH} stroke="#e5e7eb" strokeWidth="1" strokeDasharray="3,3" />
          })()}
        </svg>

        {/* X 轴标签 */}
        <div className="flex justify-between mt-1 px-1">
          {monthLabels.map((l, i) => (
            <span key={i} className={cn('text-[11px]', i + 1 <= curMonth ? 'text-gray-500' : 'text-gray-300')}>
              {l}
            </span>
          ))}
        </div>

        {/* Q 标注 */}
        <div className="absolute top-0 left-0 right-0 flex pointer-events-none">
          <div className="flex-1 flex justify-center">
            <span className="text-[10px] text-gray-300 bg-white px-1">Q1</span>
          </div>
          <div className="flex-1 flex justify-center">
            <span className="text-[10px] text-gray-300 bg-white px-1">Q2</span>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════
   共用：按游戏分组活动列表
══════════════════════════════════════ */

function GameGroup({
  game, list, urgentColor = false,
  onClickAct,
}: {
  game: { key: string; name: string; color: string }
  list: DashActivity[]
  urgentColor?: boolean
  onClickAct: (act: DashActivity) => void
}) {
  return (
    <div>
      {/* 游戏名行 */}
      <div className="flex items-center gap-2.5 px-4 pt-3 pb-1.5">
        <div className="w-2.5 h-2.5 rounded-full shrink-0 border-2 border-white shadow-sm" style={{ backgroundColor: game.color }} />
        <span className="text-xs font-semibold text-gray-700">{game.name}</span>
        <span className="text-[11px] text-gray-400 font-normal">{list.length} 个活动</span>
      </div>
      {/* 活动行 — 缩进竖线 */}
      <div className="ml-4 mb-2 pl-3.5 border-l-2 border-gray-100">
        {list.map((act) => {
          const { text, urgent } = remainText(act.endTime)
          return (
            <div
              key={act.id}
              onClick={() => onClickAct(act)}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors group',
                urgent ? 'hover:bg-red-50' : 'hover:bg-gray-50'
              )}
            >
              {urgent && <AlertTriangle className="w-3 h-3 text-red-500 shrink-0" />}
              <span className={cn('flex-1 text-sm truncate', urgent ? 'text-red-700 font-medium' : 'text-gray-700')}>
                {act.name}
              </span>
              <span className="text-xs text-gray-400 shrink-0">{act.endTime}</span>
              <span className={cn('text-xs font-medium shrink-0 w-14 text-right',
                urgent ? 'text-red-600' : urgentColor ? 'text-orange-500' : 'text-gray-400'
              )}>
                {text}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ══════════════════════════════════════
   下方左：进行中活动
══════════════════════════════════════ */

function RunningPanel() {
  const navigate = useNavigate()
  const openTab = useTabStore((s) => s.openTab)

  const byGame = useMemo(() =>
    GAMES.map((g) => ({
      game: g,
      list: ACTIVITIES.filter((a) => a.status === 'running' && a.gameProject === g.key)
        .sort((a, b) => daysFromToday(a.endTime) - daysFromToday(b.endTime)),
    })).filter((g) => g.list.length > 0),
  [])

  const total = byGame.reduce((s, g) => s + g.list.length, 0)
  const goAct = (act: DashActivity) => { openTab(`/activities/${act.id}`, act.name); navigate(`/activities/${act.id}`) }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 flex flex-col min-h-0">
      <div className="flex items-center gap-2 px-5 py-3.5 border-b border-gray-100 shrink-0">
        <CheckCircle2 className="w-4 h-4 text-green-500" />
        <h2 className="text-sm font-semibold text-gray-800">进行中活动</h2>
        <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-medium">{total}</span>
      </div>
      <div className="flex-1 overflow-auto">
        {byGame.length === 0
          ? <div className="flex items-center justify-center h-24 text-sm text-gray-400">暂无进行中的活动</div>
          : byGame.map(({ game, list }) => <GameGroup key={game.key} game={game} list={list} onClickAct={goAct} />)
        }
      </div>
    </div>
  )
}
/* ══════════════════════════════════════
   下方右：即将到期
══════════════════════════════════════ */

function ExpiringPanel() {
  const navigate = useNavigate()
  const openTab = useTabStore((s) => s.openTab)

  const byGame = useMemo(() =>
    GAMES.map((g) => ({
      game: g,
      list: ACTIVITIES.filter((a) => isExpiringSoon(a) && a.gameProject === g.key)
        .sort((a, b) => daysFromToday(a.endTime) - daysFromToday(b.endTime)),
    })).filter((g) => g.list.length > 0),
  [])

  const total = byGame.reduce((s, g) => s + g.list.length, 0)
  const goAct = (act: DashActivity) => { openTab(`/activities/${act.id}`, act.name); navigate(`/activities/${act.id}`) }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 flex flex-col min-h-0">
      <div className="flex items-center gap-2 px-5 py-3.5 border-b border-gray-100 shrink-0">
        <AlertTriangle className="w-4 h-4 text-red-500" />
        <h2 className="text-sm font-semibold text-gray-800">即将到期</h2>
        <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full font-medium">{total}</span>
        <span className="text-xs text-gray-400 ml-auto">7天内结束</span>
      </div>
      <div className="flex-1 overflow-auto">
        {byGame.length === 0
          ? <div className="flex items-center justify-center h-24 text-sm text-gray-400">本周无即将到期的活动</div>
          : byGame.map(({ game, list }) => <GameGroup key={game.key} game={game} list={list} urgentColor onClickAct={goAct} />)
        }
      </div>
    </div>
  )
}
/* ══════════════════════════════════════
   下方右：游戏活动量排行
══════════════════════════════════════ */

const RANK_DATA: Record<string, Record<string, number>> = {
  today:     { dl3d: 3, dlmmo: 2, frxxt: 1, sc33: 2, zmsl: 0, xxyg: 1 },
  yesterday: { dl3d: 5, dlmmo: 3, frxxt: 2, sc33: 1, zmsl: 1, xxyg: 0 },
  week7:     { dl3d: 18, dlmmo: 12, frxxt: 8, sc33: 10, zmsl: 4, xxyg: 3 },
  month30:   { dl3d: 62, dlmmo: 45, frxxt: 31, sc33: 38, zmsl: 14, xxyg: 11 },
}

const RANK_TABS = [
  { key: 'today',     label: '今日' },
  { key: 'yesterday', label: '昨日' },
  { key: 'week7',     label: '近7天' },
  { key: 'month30',   label: '近30天' },
]

function RankPanel() {
  const [tab, setTab] = useState('today')

  const ranked = useMemo(() => {
    const data = RANK_DATA[tab] || {}
    return [...GAMES]
      .map((g) => ({ ...g, count: data[g.key] || 0 }))
      .sort((a, b) => b.count - a.count)
  }, [tab])

  const max = ranked[0]?.count || 1

  return (
    <div className="bg-white rounded-2xl border border-gray-200 flex flex-col min-h-0">
      <div className="px-5 py-3.5 border-b border-gray-100 shrink-0">
        <h2 className="text-sm font-semibold text-gray-800 mb-3">游戏活动量排行</h2>
        <div className="flex gap-1 bg-gray-100 rounded-lg p-0.5">
          {RANK_TABS.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={cn('flex-1 py-1 text-xs font-medium rounded-md transition-colors',
                tab === t.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              )}>
              {t.label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-auto px-5 py-4 space-y-3.5">
        {ranked.map((g, idx) => (
          <div key={g.key} className="flex items-center gap-3">
            <span className={cn(
              'w-5 h-5 rounded flex items-center justify-center text-xs font-bold shrink-0',
              idx === 0 ? 'bg-orange-500 text-white' :
              idx === 1 ? 'bg-gray-300 text-gray-700' :
              idx === 2 ? 'bg-amber-600 text-white' : 'text-gray-400'
            )}>
              {idx + 1}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-700 truncate">{g.name}</span>
                <span className="text-xs font-semibold text-gray-800 ml-2 shrink-0">{g.count}</span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: max > 0 ? `${(g.count / max) * 100}%` : '0%',
                    backgroundColor: g.color,
                    opacity: idx === 0 ? 1 : 0.6,
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ══════════════════════════════════════
   主页面
══════════════════════════════════════ */

export default function DashboardPage() {
  const openTab = useTabStore((s) => s.openTab)
  useEffect(() => { openTab('/', '工作台') }, [openTab])

  return (
    <div className="h-full flex flex-col gap-4">
      {/* 页头 */}
      <div className="flex items-center gap-3 shrink-0">
        <LayoutDashboard className="w-6 h-6 text-gray-400" />
        <h1 className="text-xl font-semibold text-gray-900">工作台</h1>
      </div>

      {/* 顶部趋势图 */}
      <div className="shrink-0">
        <TrendChart />
      </div>

      {/* 下方三栏 */}
      <div className="flex-1 grid grid-cols-3 gap-4 min-h-0">
        <RunningPanel />
        <ExpiringPanel />
        <RankPanel />
      </div>
    </div>
  )
}
