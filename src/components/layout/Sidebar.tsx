import { useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useTabStore } from '@/lib/tabStore'
import { useUIStore } from '@/lib/uiStore'
import { useAuthStore, type FeatureKey } from '@/lib/authStore'
import {
  LayoutDashboard,
  Sparkles,
  FolderOpen,
  Puzzle,
  // LayoutTemplate, /* [模板功能暂停] */
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
  feature?: FeatureKey  // 需要的功能权限
}

interface NavItem {
  path: string
  label: string
  icon: React.ElementType
  feature?: FeatureKey  // 需要的功能权限（无子菜单时使用）
  children?: NavChild[]
}

const navItems: NavItem[] = [
  { path: '/', label: '工作台', icon: LayoutDashboard, feature: 'dashboard' },
  { path: '/activities/create', label: '创建活动', icon: Sparkles, feature: 'activity.create' },
  { path: '/activities', label: '活动管理', icon: FolderOpen, feature: 'activity.list' },
  { path: '/components', label: '组件库', icon: Puzzle, feature: 'component.list' },
  // { path: '/templates', label: '模板库', icon: LayoutTemplate, feature: 'template.list' }, /* [模板功能暂停] */
  {
    path: '/assets',
    label: '美术素材库',
    icon: Image,
    children: [
      { path: '/assets', label: '素材库', icon: FolderOpen, feature: 'asset.list' },
      { path: '/assets/generate', label: 'AI 生图', icon: ImagePlus, feature: 'asset.generate' },
      { path: '/assets/edit', label: 'AI 改图', icon: Wand2, feature: 'asset.edit' },
    ],
  },
  {
    path: '/analytics',
    label: '数据分析',
    icon: BarChart3,
    feature: 'analytics',
    children: [
      { path: '/analytics/overview',   label: '活动概览',     icon: LineChart },
      { path: '/analytics/components', label: '组件分析',     icon: BarChart2 },
      { path: '/analytics/effects',    label: '活动效果分析', icon: Activity },
      { path: '/analytics/detail',     label: '活动数据明细', icon: Table2 },
    ],
  },
  { path: '/settings', label: '设置', icon: Settings, feature: 'settings' },
]

export function Sidebar() {
  const navigate = useNavigate()
  const { tabs, activeTabId, openTab } = useTabStore()
  const { sidebarCollapsed, toggleSidebar, expandedGroups, toggleGroup, expandGroup } = useUIStore()
  const hasFeature = useAuthStore((s) => s.hasFeature)

  /*
   * 手动 toggle 的折叠集合 — 记录用户「主动收起」的组。
   * 展开逻辑：
   *   1) 当前路径属于某组 → 该组强制展开（忽略 toggle）
   *   2) 当前路径不属于某组 → 看 manualExpanded 是否包含该组
   */

  const handleNav = (path: string, label: string) => {
    openTab(path, label)
    navigate(path)
  }

  const activePath = tabs.find((t) => t.id === activeTabId)?.path || '/'
  const collapsed = sidebarCollapsed

  /* 判断某个父菜单或其子项是否处于激活态 */
  const isGroupActive = (item: NavItem) => {
    if (!item.children) return activePath === item.path
    return item.children.some((c) => activePath === c.path)
  }

  /* 判断子菜单是否应该展开 */
  const isGroupExpanded = (item: NavItem) => {
    return expandedGroups.has(item.path)
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
        {navItems
        .filter((item) => {
          // 无子菜单 → 直接检查 feature
          if (!item.children) return !item.feature || hasFeature(item.feature)
          // 有子菜单 → 如果父级有 feature 就检查；否则检查子项至少有一个有权限
          if (item.feature) return hasFeature(item.feature)
          return item.children.some((c) => !c.feature || hasFeature(c.feature))
        })
        .map((item) => {
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
                    expandGroup(item.path)
                    handleNav(first.path, first.label)
                  } else {
                    toggleGroup(item.path)
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
                <div className="mt-0.5 space-y-0.5" onClick={(e) => e.stopPropagation()}>
                  {item.children!.filter((c) => !c.feature || hasFeature(c.feature)).map((child) => {
                    const childActive = activePath === child.path
                    return (
                      <button
                        key={child.path}
                        onClick={() => { expandGroup(item.path); handleNav(child.path, child.label) }}
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
