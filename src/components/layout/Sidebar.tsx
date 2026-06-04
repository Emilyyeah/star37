import { useState } from 'react'
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
  LineChart,
  BarChart2,
  Activity,
  Table2,
  Settings,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Image,
  ImagePlus,
  Wand2,
} from 'lucide-react'

/* ── 导航数据结构 ── */

interface NavChild {
  path: string
  label: string
  icon: React.ElementType
}

interface NavItem {
  path: string
  label: string
  icon: React.ElementType
  children?: NavChild[]
}

const navItems: NavItem[] = [
  { path: '/', label: '工作台', icon: LayoutDashboard },
  { path: '/activities/create', label: '创建活动', icon: Sparkles },
  { path: '/activities', label: '活动管理', icon: FolderOpen },
  { path: '/components', label: '组件库', icon: Puzzle },
  { path: '/templates', label: '模板库', icon: LayoutTemplate },
  {
    path: '/assets',
    label: '美术素材库',
    icon: Image,
    children: [
      { path: '/assets', label: '素材库', icon: FolderOpen },
      { path: '/assets/generate', label: 'AI 生图', icon: ImagePlus },
      { path: '/assets/edit', label: 'AI 改图', icon: Wand2 },
    ],
  },
  {
    path: '/analytics',
    label: '数据分析',
    icon: BarChart3,
    children: [
      { path: '/analytics/overview',   label: '活动概览',     icon: LineChart },
      { path: '/analytics/components', label: '组件分析',     icon: BarChart2 },
      { path: '/analytics/effects',    label: '活动效果分析', icon: Activity },
      { path: '/analytics/detail',     label: '活动数据明细', icon: Table2 },
    ],
  },
  { path: '/settings', label: '设置', icon: Settings },
]

/* 判断某个路径是否属于某个父菜单组的子项 */
function getActiveGroupPath(activePath: string): string | null {
  for (const item of navItems) {
    if (item.children?.some((c) => c.path === activePath)) {
      return item.path
    }
  }
  return null
}

export function Sidebar() {
  const navigate = useNavigate()
  const { tabs, activeTabId, openTab } = useTabStore()
  const { sidebarCollapsed, toggleSidebar } = useUIStore()

  /*
   * 手动 toggle 的折叠集合 — 记录用户「主动收起」的组。
   * 展开逻辑：
   *   1) 当前路径属于某组 → 该组强制展开（忽略 toggle）
   *   2) 当前路径不属于某组 → 看 manualExpanded 是否包含该组
   */
  const [manualExpanded, setManualExpanded] = useState<Set<string>>(new Set())

  const handleNav = (path: string, label: string) => {
    openTab(path, label)
    navigate(path)
  }

  const activePath = tabs.find((t) => t.id === activeTabId)?.path || '/'
  const collapsed = sidebarCollapsed

  /* 当前路径所属的父组 */
  const activeGroupPath = getActiveGroupPath(activePath)

  /* 判断某个父菜单或其子项是否处于激活态 */
  const isGroupActive = (item: NavItem) => {
    if (!item.children) return activePath === item.path
    return item.children.some((c) => activePath === c.path)
  }

  /* 判断子菜单是否应该展开 */
  const isGroupExpanded = (item: NavItem) => {
    // 当前路径在这个组内 → 强制展开
    if (activeGroupPath === item.path) return true
    // 否则看手动状态
    return manualExpanded.has(item.path)
  }

  /* 切换手动展开状态 */
  const toggleGroup = (groupPath: string) => {
    setManualExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(groupPath)) {
        next.delete(groupPath)
      } else {
        next.add(groupPath)
      }
      return next
    })
  }

  return (
    <aside
      className={cn(
        'bg-white border-r border-gray-200 flex flex-col shrink-0 transition-all duration-200 relative',
        collapsed ? 'w-14' : 'w-44'
      )}
    >
      {/* Logo — 居中 */}
      <div className="h-12 flex items-center justify-center border-b border-gray-200 shrink-0">
        <img
          src={`${import.meta.env.BASE_URL}logo.png`}
          alt="37手游"
          className="object-contain"
          style={{ height: collapsed ? 22 : 26, width: 'auto', maxWidth: collapsed ? 36 : '80%' }}
        />
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-2 px-2 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const hasChildren = !!item.children
          const groupActive = isGroupActive(item)

          /* ── 无子菜单：普通按钮（和原来完全一致） ── */
          if (!hasChildren) {
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
                )}
              >
                <item.icon className="w-4 h-4 shrink-0" />
                {!collapsed && <span className="text-xs">{item.label}</span>}
              </button>
            )
          }

          /* ── 有子菜单：可折叠组 ── */
          const expanded = isGroupExpanded(item)

          return (
            <div key={item.path}>
              {/* 父级按钮 */}
              <button
                onClick={() => {
                  if (collapsed) {
                    // 折叠态点父级 → 直接跳到第一个子项
                    const first = item.children![0]
                    handleNav(first.path, first.label)
                  } else {
                    // 当前路径在这个组内 → toggle 无效（始终保持展开）
                    if (activeGroupPath !== item.path) {
                      toggleGroup(item.path)
                    }
                  }
                }}
                title={collapsed ? item.label : undefined}
                className={cn(
                  'w-full flex items-center rounded-lg text-sm font-medium transition-colors text-left',
                  collapsed ? 'justify-center px-0 py-2' : 'gap-2.5 px-2.5 py-1.5',
                  groupActive
                    ? 'bg-orange-50 text-orange-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                )}
              >
                <item.icon className="w-4 h-4 shrink-0" />
                {!collapsed && (
                  <>
                    <span className="text-xs flex-1">{item.label}</span>
                    <ChevronDown
                      className={cn(
                        'w-3 h-3 shrink-0 text-gray-400 transition-transform duration-200',
                        expanded && 'rotate-180'
                      )}
                    />
                  </>
                )}
              </button>

              {/* 子菜单列表 — 折叠态隐藏 */}
              {!collapsed && expanded && (
                <div className="mt-0.5 space-y-0.5">
                  {item.children!.map((child) => {
                    const childActive = activePath === child.path
                    return (
                      <button
                        key={child.path}
                        onClick={() => handleNav(child.path, child.label)}
                        className={cn(
                          'w-full flex items-center gap-2 rounded-lg text-left transition-colors',
                          'pl-7 pr-2.5 py-1.5',
                          childActive
                            ? 'bg-orange-50 text-orange-600'
                            : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900',
                        )}
                      >
                        <child.icon className="w-3.5 h-3.5 shrink-0" />
                        <span className="text-xs font-medium">{child.label}</span>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="px-3 py-2 border-t border-gray-200">
          <p className="text-xs text-gray-400">v0.1.0</p>
        </div>
      )}

      {/* 收起/展开按钮 — 浮在右边缘垂直居中，胶囊形 */}
      <button
        onClick={toggleSidebar}
        className={cn(
          'absolute top-1/2 -translate-y-1/2 -right-3 z-10',
          'w-6 h-10 flex items-center justify-center',
          'bg-white border border-gray-200 rounded-r-full shadow-sm',
          'text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors'
        )}
      >
        {collapsed
          ? <ChevronRight className="w-3.5 h-3.5" />
          : <ChevronLeft className="w-3.5 h-3.5" />
        }
      </button>
    </aside>
  )
}
