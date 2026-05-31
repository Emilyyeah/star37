/* 预览面板 */

import { PanelRightOpen, PanelRightClose, Eye, Smartphone } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { MatchedComponent } from '../types'

interface PreviewPanelProps {
  show: boolean
  components: MatchedComponent[]
  onToggle: (show: boolean) => void
}

export function PreviewPanel({ show, components, onToggle }: PreviewPanelProps) {
  if (!show) {
    return (
      <div className="w-10 border-l border-gray-200 bg-white flex flex-col items-center py-2 shrink-0">
        <button
          onClick={() => onToggle(true)}
          className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          title="展开预览"
        >
          <PanelRightOpen className="w-4 h-4" />
        </button>
      </div>
    )
  }

  return (
    <div className="w-[380px] border-l border-gray-200 bg-white flex flex-col shrink-0">
      <div className="h-10 flex items-center justify-between px-4 border-b border-gray-100 shrink-0">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-700">活动预览</span>
        </div>
        <button
          onClick={() => onToggle(false)}
          className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          title="收起预览"
        >
          <PanelRightClose className="w-4 h-4" />
        </button>
      </div>
      <div className="flex-1 overflow-auto p-4 flex justify-center items-start">
        <div className="w-[280px] bg-gray-900 rounded-[2rem] p-2.5 shadow-xl">
          <div className="bg-white rounded-[1.5rem] overflow-hidden" style={{ height: 500 }}>
            <div className="h-7 bg-gray-50 flex items-center justify-center">
              <div className="w-16 h-3 bg-gray-900 rounded-full" />
            </div>
            <div className="overflow-auto" style={{ height: 473 }}>
              {components.length > 0 ? (
                <div>
                  {components.map((comp) => (
                    <PreviewBlock key={comp.id} component={comp} />
                  ))}
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-center p-6">
                  <div>
                    <Smartphone className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-xs text-gray-400">等待组件确认后</p>
                    <p className="text-xs text-gray-400">预览将实时更新</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* 预览区组件块 */
function PreviewBlock({ component }: { component: MatchedComponent }) {
  const colors: Record<string, string> = {
    '展示': 'bg-gradient-to-r from-orange-400 to-pink-400',
    '抽奖': 'bg-gradient-to-r from-blue-400 to-purple-500',
    '任务': 'bg-gradient-to-r from-green-400 to-teal-500',
  }
  const bg = colors[component.category] || 'bg-gray-200'

  if (component.name === '活动 Banner') {
    return (
      <div className={cn('h-36 flex items-end p-4', bg)}>
        <div>
          <p className="text-white font-bold text-lg">
            {String(component.params.find((p) => p.name === 'title')?.value || '活动标题')}
          </p>
          <p className="text-white/70 text-xs mt-1">活动进行中</p>
        </div>
      </div>
    )
  }

  if (component.name === '转盘抽奖') {
    return (
      <div className="py-6 flex flex-col items-center bg-gradient-to-b from-blue-50 to-white">
        <div className="w-48 h-48 rounded-full border-4 border-blue-200 bg-white flex items-center justify-center relative">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="absolute w-0.5 h-20 bg-blue-100 origin-bottom" style={{ transform: `rotate(${i * 60}deg)`, bottom: '50%' }} />
          ))}
          <button className="w-14 h-14 rounded-full bg-orange-500 text-white font-bold text-xs z-10 shadow-lg">抽奖</button>
        </div>
        <p className="text-xs text-gray-500 mt-3">
          每日 {String(component.params.find((p) => p.name === 'dailyLimit')?.value || 3)} 次机会
        </p>
      </div>
    )
  }

  if (component.name === '任务列表') {
    const count = Number(component.params.find((p) => p.name === 'taskCount')?.value || 3)
    return (
      <div className="px-4 py-4 space-y-2">
        <p className="text-sm font-semibold text-gray-800 mb-2">做任务赚次数</p>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center text-xs">✓</div>
              <span className="text-xs text-gray-700">任务 {i + 1}</span>
            </div>
            <span className="text-xs text-orange-500 font-medium">+1次</span>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="px-4 py-3 border-b border-gray-100">
      <div className="flex items-center gap-2">
        <div className={cn('w-2 h-2 rounded-full', bg)} />
        <span className="text-xs text-gray-600">{component.name}</span>
      </div>
    </div>
  )
}
