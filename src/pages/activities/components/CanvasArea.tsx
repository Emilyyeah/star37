/* 画布区域 — 中栏（手动创建模式） */

import { Smartphone, ChevronUp, ChevronDown, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useComponentStore } from '@/lib/componentStore'
import type { CanvasItem } from '../hooks/useManualBuilder'

interface CanvasAreaProps {
  canvas: CanvasItem[]
  selectedIdx: number | null
  onSelect: (idx: number | null) => void
  onMoveUp: (idx: number) => void
  onMoveDown: (idx: number) => void
  onRemove: (idx: number) => void
}

export function CanvasArea({ canvas, selectedIdx, onSelect, onMoveUp, onMoveDown, onRemove }: CanvasAreaProps) {
  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-gray-50">
      <div className="h-10 flex items-center justify-between px-4 border-b border-gray-200 bg-white shrink-0">
        <span className="text-sm font-medium text-gray-700">活动画布</span>
        <span className="text-xs text-gray-400">{canvas.length} 个组件</span>
      </div>
      <div className="flex-1 overflow-auto p-4 flex justify-center">
        <div className="w-[320px] shrink-0">
          <div className="bg-gray-900 rounded-[2rem] p-2.5 shadow-xl">
            <div className="bg-white rounded-[1.5rem] overflow-hidden" style={{ minHeight: 560 }}>
              <div className="h-7 bg-gray-50 flex items-center justify-center">
                <div className="w-16 h-3 bg-gray-900 rounded-full" />
              </div>
              <div className="min-h-[533px]">
                {canvas.length > 0 ? (
                  <div>
                    {canvas.map((item, idx) => (
                      <div
                        key={item.instanceId}
                        onClick={() => onSelect(selectedIdx === idx ? null : idx)}
                        className={cn(
                          'group relative border-2 transition-colors cursor-pointer',
                          selectedIdx === idx ? 'border-orange-400' : 'border-transparent hover:border-orange-200'
                        )}
                      >
                        <CanvasBlock item={item} />
                        <div className={cn('absolute top-1 right-1 flex items-center gap-0.5 transition-opacity', selectedIdx === idx ? 'opacity-100' : 'opacity-0 group-hover:opacity-100')}>
                          <button onClick={(e) => { e.stopPropagation(); onMoveUp(idx) }} disabled={idx === 0} className="w-5 h-5 rounded bg-white/90 shadow flex items-center justify-center text-gray-500 hover:text-gray-700 disabled:opacity-30"><ChevronUp className="w-3 h-3" /></button>
                          <button onClick={(e) => { e.stopPropagation(); onMoveDown(idx) }} disabled={idx >= canvas.length - 1} className="w-5 h-5 rounded bg-white/90 shadow flex items-center justify-center text-gray-500 hover:text-gray-700 disabled:opacity-30"><ChevronDown className="w-3 h-3" /></button>
                          <button onClick={(e) => { e.stopPropagation(); onRemove(idx) }} className="w-5 h-5 rounded bg-white/90 shadow flex items-center justify-center text-gray-500 hover:text-red-500"><Trash2 className="w-3 h-3" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-[533px] flex items-center justify-center text-center p-6">
                    <div>
                      <Smartphone className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                      <p className="text-sm text-gray-400 mb-1">从左侧选择组件</p>
                      <p className="text-xs text-gray-300">点击组件即可添加到画布</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* 画布中的组件块渲染 — 根据 variantId 读取配色 */
function CanvasBlock({ item }: { item: CanvasItem }) {
  const getById = useComponentStore((s) => s.getById)
  const compDef = getById(item.componentId)
  const variant = compDef?.variants.find((v) => v.id === item.variantId) || compDef?.variants[0]
  const [c1, c2] = variant?.previewColors || ['#f97316', '#ec4899']
  const grad = `linear-gradient(135deg, ${c1}, ${c2})`

  if (item.name.includes('Banner')) {
    return (
      <div className="h-28 flex items-end p-3" style={{ background: grad }}>
        <div>
          <p className="text-white font-bold text-sm">{String(item.params.title || '活动标题')}</p>
          <p className="text-white/70 text-xs mt-0.5">{String(item.params.subtitle || '副标题')}</p>
        </div>
      </div>
    )
  }
  if (item.name.includes('转盘')) {
    return (
      <div className="py-5 flex flex-col items-center" style={{ background: `linear-gradient(180deg, ${c1}15, white)` }}>
        <div className="w-32 h-32 rounded-full border-4 bg-white flex items-center justify-center relative" style={{ borderColor: `${c1}40` }}>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="absolute w-0.5 h-12 origin-bottom opacity-20" style={{ transform: `rotate(${i * 60}deg)`, bottom: '50%', backgroundColor: c1 }} />
          ))}
          <div className="w-10 h-10 rounded-full text-white font-bold text-xs flex items-center justify-center z-10 shadow-lg" style={{ backgroundColor: c1 }}>抽奖</div>
        </div>
        <p className="text-xs mt-2" style={{ color: c1 }}>每日 {String(item.params.dailyLimit || 3)} 次机会</p>
      </div>
    )
  }
  if (item.name.includes('九宫格')) {
    return (
      <div className="py-4 flex items-center justify-center" style={{ background: `linear-gradient(180deg, ${c1}10, white)` }}>
        <div className="grid grid-cols-3 gap-1">
          {[1, 2, 3, 4, 'GO', 5, 6, 7, 8].map((x, i) => (
            <div key={i} className={cn('w-12 h-12 rounded-lg flex items-center justify-center text-xs font-bold', x === 'GO' ? 'text-white' : 'bg-white border border-gray-200 text-gray-600')} style={x === 'GO' ? { backgroundColor: c1 } : undefined}>
              {x === 'GO' ? '抽奖' : `奖品${x}`}
            </div>
          ))}
        </div>
      </div>
    )
  }
  if (item.name.includes('任务')) {
    const count = Math.min(Number(item.params.taskCount || 3), 4)
    return (
      <div className="px-3 py-3 space-y-1.5">
        <p className="text-xs font-semibold text-gray-700 mb-1">做任务赚次数</p>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded flex items-center justify-center text-xs text-white" style={{ backgroundColor: c1 }}>✓</div>
              <span className="text-xs text-gray-600">任务 {i + 1}</span>
            </div>
            <span className="text-xs font-medium" style={{ color: c1 }}>+1{String(item.params.rewardUnit || '次')}</span>
          </div>
        ))}
      </div>
    )
  }
  if (item.name.includes('签到')) {
    return (
      <div className="px-3 py-3">
        <p className="text-xs font-semibold text-gray-700 mb-2">签到日历</p>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className={cn('w-full aspect-square rounded flex items-center justify-center text-xs font-medium', i < 3 ? 'text-white' : 'bg-gray-100 text-gray-400')} style={i < 3 ? { backgroundColor: c1 } : undefined}>
              {i < 3 ? '✓' : i + 1}
            </div>
          ))}
        </div>
      </div>
    )
  }
  if (item.name.includes('排行')) {
    return (
      <div className="px-3 py-3">
        <p className="text-xs font-semibold text-gray-700 mb-2">{String(item.params.title || '排行榜')}</p>
        {[1, 2, 3].map((r) => (
          <div key={r} className="flex items-center gap-2 py-1.5 border-b border-gray-50">
            <span className="text-xs font-bold w-4 text-right" style={{ color: r <= 3 ? c1 : '#9ca3af' }}>{r}</span>
            <div className="w-5 h-5 rounded-full bg-gray-200" />
            <span className="text-xs text-gray-600">用户{r}</span>
            <span className="ml-auto text-xs text-gray-400">{100 - r * 10}分</span>
          </div>
        ))}
      </div>
    )
  }
  if (item.name.includes('倒计时')) {
    return (
      <div className="px-3 py-3 flex items-center justify-center gap-2">
        <span className="text-xs text-gray-500">{String(item.params.title || '距活动结束还剩')}</span>
        {['02', '14', '36', '08'].map((n, i) => (
          <span key={i} className="text-sm font-bold text-white px-1.5 py-0.5 rounded" style={{ backgroundColor: c1 }}>{n}</span>
        ))}
      </div>
    )
  }
  if (item.name.includes('弹窗')) {
    return (
      <div className="px-3 py-3">
        <div className="border border-gray-200 rounded-xl p-3 text-center">
          <p className="text-xs font-semibold text-gray-700 mb-1">{String(item.params.title || '弹窗标题')}</p>
          <p className="text-xs text-gray-400 mb-2">弹窗内容区域</p>
          <div className="text-white text-xs rounded-lg py-1.5" style={{ backgroundColor: c1 }}>{String(item.params.confirmText || '我知道了')}</div>
        </div>
      </div>
    )
  }
  if (item.name.includes('公告') || item.name.includes('跑马灯')) {
    return (
      <div className="px-3 py-2 flex items-center gap-2" style={{ backgroundColor: `${c1}10` }}>
        <span className="text-xs" style={{ color: c1 }}>📢</span>
        <span className="text-xs text-gray-500 truncate">恭喜用户***获得大奖！</span>
      </div>
    )
  }
  if (item.name.includes('规则')) {
    return (
      <div className="px-3 py-3">
        <p className="text-xs font-semibold text-gray-700 mb-1">{String(item.params.title || '活动规则')}</p>
        {['活动期间每日可参与3次', '奖品将在活动结束后发放'].map((t, i) => (
          <p key={i} className="text-xs text-gray-400 leading-relaxed">{i + 1}. {t}</p>
        ))}
      </div>
    )
  }
  return (
    <div className="px-3 py-4 flex items-center gap-2" style={{ backgroundColor: `${c1}08` }}>
      <span className="text-xl">{item.emoji}</span>
      <span className="text-xs font-medium text-gray-600">{item.name}</span>
    </div>
  )
}
