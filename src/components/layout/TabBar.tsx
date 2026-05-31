import { useNavigate } from 'react-router-dom'
import { X, LayoutDashboard } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTabStore, type Tab } from '@/lib/tabStore'

export function TabBar() {
  const navigate = useNavigate()
  const { tabs, activeTabId, setActiveTab, closeTab } = useTabStore()

  const handleClick = (tab: Tab) => {
    setActiveTab(tab.id)
    navigate(tab.path)
  }

  const handleClose = (e: React.MouseEvent, tab: Tab) => {
    e.stopPropagation()
    const nextPath = closeTab(tab.id)
    if (nextPath) navigate(nextPath)
  }

  return (
    <div className="h-10 bg-gray-50 border-b border-gray-200 flex items-end px-2 gap-0.5 overflow-x-auto">
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
  )
}
