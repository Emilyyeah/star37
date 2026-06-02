/* 组件库 — Mock 预览渲染（按 variant.previewLayout 分支渲染） */

import { cn } from '@/lib/utils'
import type { ComponentVariant } from '@/types/component'

export function MockPreview({ variant, emoji, componentName }: { variant: ComponentVariant; emoji: string; componentName: string }) {
  const [c1, c2] = variant.previewColors
  const grad = `linear-gradient(135deg, ${c1}, ${c2})`

  if (variant.previewLayout === 'wide') {
    return (
      <div className="h-full flex flex-col">
        <div className="h-32" style={{ background: grad }}>
          <div className="h-full flex items-end p-3">
            <div><p className="text-white font-bold text-sm">夏日大促</p><p className="text-white/70 text-xs mt-0.5">限时福利</p></div>
          </div>
        </div>
        <div className="flex-1 bg-gray-50 p-3"><div className="space-y-2">{[1, 2, 3].map((i) => <div key={i} className="h-8 bg-white rounded-lg border border-gray-100" />)}</div></div>
      </div>
    )
  }
  if (variant.previewLayout === 'square') {
    return (
      <div className="h-full flex flex-col items-center justify-center p-4 bg-gray-50">
        <div className="w-36 h-36 rounded-2xl flex items-center justify-center" style={{ background: grad }}>
          <div className="text-center"><p className="text-white font-bold text-sm">活动标题</p><p className="text-white/70 text-xs mt-1">副标题</p></div>
        </div>
      </div>
    )
  }
  if (variant.previewLayout === 'slim') {
    return (
      <div className="h-full flex flex-col">
        <div className="h-14 flex items-center px-3" style={{ background: grad }}><p className="text-white font-bold text-xs">活动通栏标题</p></div>
        <div className="flex-1 bg-gray-50 p-3 space-y-2">{[1, 2, 3, 4, 5].map((i) => <div key={i} className="h-6 bg-white rounded border border-gray-100" />)}</div>
      </div>
    )
  }
  if (variant.previewLayout === 'circle') {
    return (
      <div className="h-full flex flex-col items-center justify-center" style={{ background: `linear-gradient(180deg, ${c1}15, white)` }}>
        <div className="w-36 h-36 rounded-full border-4 flex items-center justify-center relative" style={{ borderColor: c1 }}>
          {[0, 1, 2, 3, 4, 5].map((i) => (<div key={i} className="absolute w-0.5 h-14 origin-bottom opacity-20" style={{ transform: `rotate(${i * 60}deg)`, bottom: '50%', backgroundColor: c1 }} />))}
          <button className="w-12 h-12 rounded-full text-white font-bold text-xs shadow-lg" style={{ backgroundColor: c1 }}>抽奖</button>
        </div>
        <p className="text-xs mt-3" style={{ color: c1 }}>每日 3 次机会</p>
      </div>
    )
  }
  if (variant.previewLayout === 'grid') {
    return (
      <div className="h-full flex items-center justify-center p-4" style={{ background: `linear-gradient(180deg, ${c1}10, white)` }}>
        <div className="grid grid-cols-3 gap-1.5">
          {[1, 2, 3, 4, 'GO', 5, 6, 7, 8].map((item, i) => (
            <div key={i} className={cn('w-14 h-14 rounded-lg flex items-center justify-center text-xs font-bold', item === 'GO' ? 'text-white' : 'bg-white border border-gray-200 text-gray-600')} style={item === 'GO' ? { backgroundColor: c1 } : undefined}>
              {item === 'GO' ? '抽奖' : `奖品${item}`}
            </div>
          ))}
        </div>
      </div>
    )
  }
  if (variant.previewLayout === 'calendar') {
    return (
      <div className="h-full p-3 bg-gray-50">
        <p className="text-xs font-semibold text-gray-700 mb-2">签到日历</p>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className={cn('w-full aspect-square rounded-md flex items-center justify-center text-xs font-medium', i < 4 ? 'text-white' : 'bg-white border border-gray-200 text-gray-400')} style={i < 4 ? { backgroundColor: c1 } : undefined}>{i < 4 ? '✓' : i + 1}</div>
          ))}
        </div>
        <div className="mt-3 space-y-1.5">{['连续3天：10积分', '连续7天：50积分'].map((t) => (<div key={t} className="text-xs text-gray-500 bg-white rounded-lg px-2 py-1.5 border border-gray-100">{t}</div>))}</div>
      </div>
    )
  }
  if (variant.previewLayout === 'timeline') {
    return (
      <div className="h-full p-3 bg-gray-50">
        <p className="text-xs font-semibold text-gray-700 mb-3">签到进度</p>
        <div className="flex items-center gap-1 mb-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div className={cn('w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold', i < 4 ? 'text-white' : 'bg-white border-2 text-gray-400')} style={i < 4 ? { backgroundColor: c1, borderColor: c1 } : { borderColor: '#d1d5db' }}>{i < 4 ? '✓' : i + 1}</div>
              {i < 6 && <div className="w-full h-0.5 rounded" style={{ backgroundColor: i < 3 ? c1 : '#e5e7eb' }} />}
            </div>
          ))}
        </div>
      </div>
    )
  }
  if (variant.previewLayout === 'cards') {
    return (
      <div className="h-full p-3 bg-gray-50 space-y-2">
        <p className="text-xs font-semibold text-gray-700 mb-1">做任务赚次数</p>
        {['每日分享', '邀请好友', '浏览商品', '完善资料'].map((t) => (
          <div key={t} className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-gray-100">
            <div className="flex items-center gap-2"><div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs" style={{ backgroundColor: `${c1}20`, color: c1 }}>✓</div><span className="text-xs text-gray-700">{t}</span></div>
            <span className="text-xs font-medium" style={{ color: c1 }}>+1次</span>
          </div>
        ))}
      </div>
    )
  }
  if (variant.previewLayout === 'compact') {
    return (
      <div className="h-full p-3 bg-gray-50">
        <p className="text-xs font-semibold text-gray-700 mb-2">做任务赚次数</p>
        {['每日分享', '邀请好友', '浏览商品', '完善资料', '关注公众号'].map((t) => (
          <div key={t} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"><span className="text-xs text-gray-600">{t}</span><span className="text-xs font-medium" style={{ color: c1 }}>+1次</span></div>
        ))}
      </div>
    )
  }
  if (variant.previewLayout === 'podium') {
    return (
      <div className="h-full p-3 bg-gray-50">
        <p className="text-xs font-semibold text-gray-700 mb-3">排行榜</p>
        <div className="flex items-end justify-center gap-2 mb-3">
          {[{ h: 52, rank: 2, color: '#94a3b8' }, { h: 68, rank: 1, color: c1 }, { h: 40, rank: 3, color: '#d97706' }].map((p) => (
            <div key={p.rank} className="flex flex-col items-center"><div className="w-8 h-8 rounded-full bg-gray-200 mb-1" /><div className="w-14 rounded-t-lg flex items-center justify-center text-white text-xs font-bold" style={{ height: p.h, backgroundColor: p.color }}>{p.rank}</div></div>
          ))}
        </div>
        {[4, 5].map((r) => (<div key={r} className="flex items-center gap-2 py-1.5 border-b border-gray-100"><span className="text-xs font-bold text-gray-400 w-4 text-right">{r}</span><div className="w-5 h-5 rounded-full bg-gray-200" /><span className="text-xs text-gray-600">用户{r}</span><span className="ml-auto text-xs text-gray-400">{100 - r * 10}分</span></div>))}
      </div>
    )
  }
  return (
    <div className="h-full flex flex-col items-center justify-center" style={{ background: `linear-gradient(180deg, ${c1}10, white)` }}>
      <span className="text-4xl mb-2">{emoji}</span>
      <p className="text-xs font-medium text-gray-700">{componentName}</p>
      <p className="text-xs text-gray-400 mt-0.5">{variant.name}</p>
    </div>
  )
}
