import { useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useTabStore } from '@/lib/tabStore'
import { useUIStore } from '@/lib/uiStore'
import {
  LayoutDashboard,
  Sparkles,
  FolderOpen,
  Puzzle,
  LayoutTemplate,
  BarChart3,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react'

const navItems = [
  { path: '/', label: '工作台', icon: LayoutDashboard },
  { path: '/activities/create', label: '创建活动', icon: Sparkles, highlight: true },
  { path: '/activities', label: '活动管理', icon: FolderOpen },
  { path: '/components', label: '组件库', icon: Puzzle },
  { path: '/templates', label: '模板库', icon: LayoutTemplate },
  { path: '/data', label: '数据看板', icon: BarChart3 },
  { path: '/settings', label: '设置', icon: Settings },
]

export function Sidebar() {
  const navigate = useNavigate()
  const { tabs, activeTabId, openTab } = useTabStore()
  const { sidebarCollapsed, toggleSidebar } = useUIStore()

  const handleNav = (path: string, label: string) => {
    openTab(path, label)
    navigate(path)
  }

  const activePath = tabs.find((t) => t.id === activeTabId)?.path || '/'
  const collapsed = sidebarCollapsed

  return (
    <aside
      className={cn(
        'bg-white border-r border-gray-200 flex flex-col shrink-0 transition-all duration-200',
        collapsed ? 'w-14' : 'w-52'
      )}
    >
      {/* Logo */}
      <div className="h-10 flex items-center justify-between px-3 border-b border-gray-200">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-orange-500 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-semibold text-xs text-gray-900">AI 活动系统</span>
          </div>
        )}
        <button
          onClick={toggleSidebar}
          className={cn(
            'p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors',
            collapsed && 'mx-auto'
          )}
        >
          {collapsed ? (
            <PanelLeftOpen className="w-4 h-4" />
          ) : (
            <PanelLeftClose className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-2 px-2 space-y-0.5">
        {navItems.map((item) => {
          const isActive = activePath === item.path

          return (
            <button
              key={item.path}
              onClick={() => handleNav(item.path, item.label)}
              title={collapsed ? item.label : undefined}
              className={cn(
                'w-full flex items-center rounded-lg text-sm font-medium transition-colors text-left',
                collapsed ? 'justify-center px-0 py-2' : 'gap-2.5 px-2.5 py-1.5',
                isActive
                  ? 'bg-orange-50 text-orange-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                item.highlight && !isActive && 'text-orange-500 hover:text-orange-600'
              )}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              {!collapsed && (
                <>
                  <span className="text-xs">{item.label}</span>
                  {item.highlight && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-orange-400" />
                  )}
                </>
              )}
            </button>
          )
        })}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="px-3 py-2 border-t border-gray-200">
          <p className="text-xs text-gray-400">v0.1.0</p>
        </div>
      )}
    </aside>
  )
}
