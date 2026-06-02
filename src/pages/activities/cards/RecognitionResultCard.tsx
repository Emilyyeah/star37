import { useState, useRef, useEffect } from 'react'
import { X, Plus, Search, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { RecognitionRegion } from '../types'

interface RecognitionResultCardProps {
  regions: RecognitionRegion[]
  onConfirm: (regions: RecognitionRegion[]) => void
  /** 增删组件时实时回调，用于同步预览 */
  onItemsChange?: (regions: RecognitionRegion[]) => void
}

/* 可手动添加的组件列表 */
const COMPONENT_OPTIONS = [
  '活动 Banner', '弹窗', '倒计时', '活动规则说明', '公告/跑马灯',
  '转盘抽奖', '九宫格抽奖', '签到日历', '任务列表', '排行榜',
]

export function RecognitionResultCard({ regions, onConfirm, onItemsChange }: RecognitionResultCardProps) {
  const [items, setItems] = useState(regions)
  const [showAdd, setShowAdd] = useState(false)
  const [addSearch, setAddSearch] = useState('')
  const addPanelRef = useRef<HTMLDivElement>(null)
  const listRef     = useRef<HTMLDivElement>(null)

  const toggleConfirm = (id: string) => setItems((p) => {
    const next = p.map((r) => (r.id === id ? { ...r, confirmed: !r.confirmed } : r))
    onItemsChange?.(next)
    return next
  })
  const removeItem = (id: string) => setItems((p) => {
    const next = p.filter((r) => r.id !== id)
    onItemsChange?.(next)
    return next
  })
  const allConfirmed  = items.length > 0 && items.every((r) => r.confirmed)

  /* 点外部关闭 */
  useEffect(() => {
    if (!showAdd) return
    const handler = (e: MouseEvent) => {
      if (addPanelRef.current && !addPanelRef.current.contains(e.target as Node)) {
        setShowAdd(false)
        setAddSearch('')
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showAdd])

  const handleAddComponent = (compName: string) => {
    /* 已存在则不重复添加 */
    if (items.some((r) => r.matchedComponent === compName)) return
    const newItem: RecognitionRegion = {
      id: `manual-${Date.now()}`,
      label: '手动添加',
      matchedComponent: compName,
      confidence: 100,
      confirmed: false,
    }
    setItems((p) => {
      const next = [...p, newItem]
      onItemsChange?.(next)
      return next
    })
    setShowAdd(false)
    setAddSearch('')
    setTimeout(() => {
      listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
    }, 50)
  }

  const filteredOptions = COMPONENT_OPTIONS.filter((name) => {
    const already = items.some((r) => r.matchedComponent === name)
    const match   = name.includes(addSearch.trim())
    return !already && match
  })

  return (
    <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-md p-5 space-y-3">
      <div ref={listRef} className="space-y-2 max-h-[320px] overflow-y-auto">
        {items.map((region) => (
          <div key={region.id} className={cn(
            'flex items-center gap-3 p-3 rounded-xl border transition-colors',
            region.confirmed ? 'border-green-200 bg-green-50/50' : 'border-gray-200'
          )}>
            <button onClick={() => toggleConfirm(region.id)} className={cn(
              'w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors',
              region.confirmed ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300'
            )}>
              {region.confirmed && <span className="text-xs">✓</span>}
            </button>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium text-gray-900">{region.label}</span>
                <span className="text-xs text-gray-400">→</span>
                <span className="text-sm text-blue-600">{region.matchedComponent}</span>
                {region.label === '手动添加' && (
                  <span className="text-[10px] px-1.5 py-0.5 bg-blue-50 text-blue-500 rounded font-medium">手动</span>
                )}
              </div>
            </div>
            <ConfidenceBadge confidence={region.confidence} />
            <button onClick={() => removeItem(region.id)}
              className="shrink-0 w-6 h-6 rounded-md flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between pt-2 relative">
        {/* 补充遗漏组件按钮 + 下拉面板 */}
        <div ref={addPanelRef} className="relative">
          <button
            onClick={() => setShowAdd((v) => !v)}
            className="inline-flex items-center gap-1 text-xs text-blue-500 hover:text-blue-600 font-medium transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            补充遗漏组件
            <ChevronDown className={cn('w-3 h-3 transition-transform', showAdd && 'rotate-180')} />
          </button>

          {showAdd && (
            <div className="absolute bottom-full left-0 mb-2 w-56 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-20">
              {/* 搜索框 */}
              <div className="p-2 border-b border-gray-100">
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                  <input
                    autoFocus
                    type="text"
                    value={addSearch}
                    onChange={(e) => setAddSearch(e.target.value)}
                    placeholder="搜索组件…"
                    className="w-full pl-7 pr-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400"
                  />
                </div>
              </div>

              {/* 组件列表 */}
              <div className="max-h-44 overflow-y-auto">
                {filteredOptions.length > 0 ? (
                  filteredOptions.map((name) => (
                    <button
                      key={name}
                      onClick={() => handleAddComponent(name)}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                    >
                      {name}
                    </button>
                  ))
                ) : (
                  <div className="px-3 py-4 text-xs text-gray-400 text-center">
                    {addSearch ? '无匹配组件' : '所有组件已添加'}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <button
          onClick={() => onConfirm(items.filter((r) => r.confirmed))}
          disabled={!allConfirmed}
          className={cn('px-4 py-2 rounded-lg text-sm font-medium transition-colors',
            allConfirmed ? 'bg-orange-500 text-white hover:bg-orange-600' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          )}
        >
          全部确认，下一步
        </button>
      </div>
    </div>
  )
}

function ConfidenceBadge({ confidence }: { confidence: number }) {
  const color = confidence === 100
    ? 'bg-blue-100 text-blue-600'
    : confidence >= 95
    ? 'bg-green-100 text-green-700'
    : confidence >= 90
    ? 'bg-yellow-100 text-yellow-700'
    : 'bg-red-100 text-red-700'
  const label = confidence === 100 ? '手动' : `${confidence}%`
  return <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full shrink-0', color)}>{label}</span>
}
