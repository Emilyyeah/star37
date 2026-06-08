import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, LayoutDashboard, LogOut, ChevronDown, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTabStore, type Tab } from '@/lib/tabStore'
import { useAuthStore } from '@/lib/authStore'

/* ── Token 额度数据（Mock） ── */
const TOKEN_BALANCES = [
  { key: 'claude', label: 'Claude', icon: '🟣', balance: 320, unit: '元' },
  { key: 'gemini', label: 'Gemini', icon: '✦', balance: 500, unit: '元', color: 'text-blue-500' },
  { key: 'gpt', label: 'GPT', icon: '🤖', balance: 180, unit: '元' },
  { key: 'deepseek', label: 'DeepSeek', icon: '🔵', balance: 450, unit: '元' },
]

export function TabBar() {
  const navigate = useNavigate()
  const { tabs, activeTabId, setActiveTab, closeTab, openTab } = useTabStore()
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const getRoleName = useAuthStore((s) => s.getRoleName)
  const [showUserMenu, setShowUserMenu] = useState(false)

  const handleClick = (tab: Tab) => {
    setActiveTab(tab.id)
    navigate(tab.path)
  }

  const handleClose = (e: React.MouseEvent, tab: Tab) => {
    e.stopPropagation()
    const nextPath = closeTab(tab.id)
    if (nextPath) navigate(nextPath)
  }

  const handleLogout = () => {
    setShowUserMenu(false)
    logout()
    navigate('/login')
  }

  const handleCredits = () => {
    openTab('/credits', '积分明细')
    navigate('/credits')
  }

  return (
    <div className="h-12 bg-gray-50 border-b border-gray-200 flex items-end shrink-0">
      {/* 系统名 — 与标签同行，左侧固定 */}
      <div className="h-full flex items-center px-4 shrink-0 border-r border-gray-200 pb-0">
        <span className="text-xl font-bold text-gray-900 whitespace-nowrap">魔方活动平台</span>
      </div>
      {/* 标签列表 */}
      <div className="flex items-end flex-1 px-2 gap-0.5 overflow-x-auto h-full">
      {tabs.map((tab) => {
        const isActive = tab.id === activeTabId
        return (
          <button
            key={tab.id}
            onClick={() => handleClick(tab)}
            className={cn(
              'group flex items-center gap-1.5 px-3 h-9 rounded-t-lg text-xs font-medium transition-colors shrink-0 max-w-[160px] relative',
              isActive
                ? 'bg-white text-gray-900 border-t border-l border-r border-gray-200 -mb-px'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100/80'
            )}
          >
            {tab.path === '/' && <LayoutDashboard className="w-3.5 h-3.5 shrink-0" />}
            <span className="truncate">{tab.label}</span>
            {tab.closable && (
              <span
                onClick={(e) => handleClose(e, tab)}
                className={cn(
                  'shrink-0 w-4 h-4 rounded flex items-center justify-center transition-colors',
                  isActive
                    ? 'hover:bg-gray-200 text-gray-400 hover:text-gray-600'
                    : 'opacity-0 group-hover:opacity-100 hover:bg-gray-300/50 text-gray-400'
                )}
              >
                <X className="w-3 h-3" />
              </span>
            )}
          </button>
        )
      })}
      </div>

      {/* 右侧：Token 额度 + 用户信息 */}
      {user && (
        <div className="h-full flex items-center shrink-0">
          {/* Token 额度条 */}
          <div className="h-full flex items-center gap-0 px-2 border-l border-gray-200">
            {/* 我的积分入口 */}
            <button
              onClick={handleCredits}
              className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <Sparkles className="w-3 h-3 text-orange-500" />
              <span>我的积分</span>
            </button>
            <span className="text-gray-200 mx-0.5">|</span>
            {/* 各模型额度 */}
            {TOKEN_BALANCES.map((t, i) => (
              <div key={t.key} className="flex items-center">
                <span className="flex items-center gap-1 px-1.5 py-1 text-[11px] text-gray-500 whitespace-nowrap">
                  <span className={t.color ?? ''}>{t.icon}</span>
                  <span className="text-gray-400">{t.label}:</span>
                  <span className="font-medium text-gray-700">{t.balance}</span>
                </span>
                {i < TOKEN_BALANCES.length - 1 && <span className="text-gray-200">|</span>}
              </div>
            ))}
          </div>

          {/* 用户信息 */}
          <div className="h-full flex items-center px-3 border-l border-gray-200 relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <span className="text-base leading-none">{user.avatar}</span>
              <div className="text-left">
                <p className="text-xs font-medium text-gray-700 leading-none">{user.name}</p>
                <p className="text-[10px] text-gray-400 leading-tight mt-0.5">{getRoleName(user.roleId)}</p>
              </div>
              <ChevronDown className="w-3 h-3 text-gray-400" />
            </button>

            {/* 下拉菜单 */}
            {showUserMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowUserMenu(false)} />
                <div className="absolute right-3 top-full mt-1 w-36 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                  <div className="px-3 py-2 border-b border-gray-100">
                    <p className="text-xs font-medium text-gray-700">{user.name}</p>
                    <p className="text-[10px] text-gray-400">{getRoleName(user.roleId)}</p>
                  </div>
                  <button
                    onClick={() => { setShowUserMenu(false); handleCredits() }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    积分明细
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-600 hover:bg-gray-50 hover:text-red-600 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    退出登录
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
