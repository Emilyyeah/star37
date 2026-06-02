/* 预览面板 — AI 模式
   embedded=true 时不渲染外层容器/标题栏，由父级统一管理 */

import { PanelRightOpen, PanelRightClose, Eye, Smartphone } from 'lucide-react'
import { PhoneShell } from '@/components/PhoneShell'
import { cn } from '@/lib/utils'
import type { MatchedComponent } from '../types'

interface PreviewPanelProps {
  show: boolean
  components: MatchedComponent[]
  onToggle: (show: boolean) => void
  embedded?: boolean
  /** 当前高亮的组件 index */
  selectedIdx?: number | null
  /** 点击组件块时回调 */
  onSelectIdx?: (idx: number) => void
}

export function PreviewPanel({ show, components, onToggle, embedded, selectedIdx, onSelectIdx }: PreviewPanelProps) {
  if (embedded) {
    return (
      <div className="h-full overflow-auto p-4 flex justify-center items-start">
        <PhonePreview components={components} selectedIdx={selectedIdx} onSelectIdx={onSelectIdx} />
      </div>
    )
  }

  if (!show) {
    return (
      <div className="w-10 border-l border-gray-200 bg-white flex flex-col items-center py-2 shrink-0">
        <button onClick={() => onToggle(true)} className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors" title="展开预览">
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
        <button onClick={() => onToggle(false)} className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100" title="收起预览">
          <PanelRightClose className="w-4 h-4" />
        </button>
      </div>
      <div className="flex-1 overflow-auto p-4 flex justify-center items-start">
        <PhonePreview components={components} selectedIdx={selectedIdx} onSelectIdx={onSelectIdx} />
      </div>
    </div>
  )
}

/* ── 手机框预览 ── */
function PhonePreview({
  components, selectedIdx, onSelectIdx,
}: {
  components: MatchedComponent[]
  selectedIdx?: number | null
  onSelectIdx?: (idx: number) => void
}) {
  return (
    <PhoneShell width={240} contentHeight={460}>
      <div>
        {components.length > 0 ? (
          <div>
            {components.map((comp, idx) => (
              <div
                key={comp.id}
                onClick={() => onSelectIdx?.(idx)}
                className={cn(
                  'relative transition-all duration-150',
                  onSelectIdx && 'cursor-pointer',
                  selectedIdx === idx
                    ? 'ring-2 ring-orange-400 ring-inset z-10'
                    : onSelectIdx && 'hover:ring-1 hover:ring-orange-200 hover:ring-inset'
                )}
              >
                <PreviewBlock component={comp} />
                {selectedIdx === idx && (
                  <div className="absolute top-1 left-1 bg-orange-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded z-20 leading-none">
                    {idx + 1}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div style={{ height: 460 }} className="flex items-center justify-center text-center p-6">
            <div>
              <Smartphone className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-xs text-gray-400">等待组件确认后</p>
              <p className="text-xs text-gray-400">预览将实时更新</p>
            </div>
          </div>
        )}
      </div>
    </PhoneShell>
  )
}

/* ── 预览区组件块 — 全部 10 个组件 ── */
function PreviewBlock({ component }: { component: MatchedComponent }) {
  const p = (name: string) => component.params.find((x) => x.name === name)?.value

  if (component.name === '活动 Banner') {
    return (
      <div className="h-28 flex items-end p-3 bg-gradient-to-r from-orange-400 to-pink-400">
        <div>
          <p className="text-white font-bold text-sm">{String(p('title') || '活动标题')}</p>
          <p className="text-white/70 text-xs mt-0.5">活动进行中</p>
        </div>
      </div>
    )
  }

  if (component.name === '转盘抽奖') {
    return (
      <div className="py-4 flex flex-col items-center bg-gradient-to-b from-blue-50 to-white">
        <div className="w-36 h-36 rounded-full border-4 border-blue-200 bg-white flex items-center justify-center relative">
          {[0,1,2,3,4,5].map((i) => (
            <div key={i} className="absolute w-0.5 h-14 bg-blue-100 origin-bottom" style={{ transform: `rotate(${i*60}deg)`, bottom: '50%' }} />
          ))}
          <div className="w-10 h-10 rounded-full bg-orange-500 text-white font-bold text-xs z-10 shadow-lg flex items-center justify-center">抽奖</div>
        </div>
        <p className="text-xs text-gray-500 mt-2">每日 {String(p('dailyLimit') ?? 3)} 次机会</p>
      </div>
    )
  }

  if (component.name === '九宫格抽奖') {
    return (
      <div className="py-3 flex items-center justify-center bg-gradient-to-b from-purple-50 to-white">
        <div className="grid grid-cols-3 gap-1">
          {[1,2,3,4,'抽',5,6,7,8].map((x, i) => (
            <div key={i} className={cn('w-11 h-11 rounded-lg flex items-center justify-center text-xs font-bold', x==='抽' ? 'bg-orange-500 text-white' : 'bg-white border border-gray-200 text-gray-500')}>
              {x === '抽' ? '抽奖' : `奖${x}`}
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (component.name === '签到日历') {
    return (
      <div className="px-3 py-3">
        <p className="text-xs font-semibold text-gray-800 mb-2">签到日历</p>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className={cn('w-full aspect-square rounded flex items-center justify-center text-xs font-medium', i < 3 ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-400')}>
              {i < 3 ? '✓' : i + 1}
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (component.name === '任务列表') {
    const count = Math.min(Number(p('taskCount') ?? 3), 3)
    return (
      <div className="px-3 py-3 space-y-1.5">
        <p className="text-xs font-semibold text-gray-800 mb-1">做任务赚次数</p>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded bg-green-100 flex items-center justify-center text-xs">✓</div>
              <span className="text-xs text-gray-700">任务 {i + 1}</span>
            </div>
            <span className="text-xs text-orange-500 font-medium">+1次</span>
          </div>
        ))}
      </div>
    )
  }

  if (component.name === '排行榜') {
    return (
      <div className="px-3 py-3">
        <p className="text-xs font-semibold text-gray-800 mb-2">{String(p('title') || '排行榜')}</p>
        {[1,2,3].map((r) => (
          <div key={r} className="flex items-center gap-2 py-1.5 border-b border-gray-50 last:border-none">
            <span className="text-xs font-bold w-4 text-right" style={{ color: r === 1 ? '#f97316' : r === 2 ? '#94a3b8' : '#b45309' }}>{r}</span>
            <div className="w-5 h-5 rounded-full bg-gray-200" />
            <span className="text-xs text-gray-600">玩家{r}</span>
            <span className="ml-auto text-xs text-gray-400">{1000 - r * 100}分</span>
          </div>
        ))}
      </div>
    )
  }

  if (component.name === '倒计时') {
    return (
      <div className="px-3 py-2 flex items-center justify-center gap-1.5 bg-orange-50">
        <span className="text-xs text-gray-500">{String(p('title') || '距活动结束')}</span>
        {['02','14','36'].map((n, i) => (
          <span key={i} className="text-sm font-bold text-white px-1.5 py-0.5 rounded bg-orange-500">{n}</span>
        ))}
      </div>
    )
  }

  if (component.name === '弹窗') {
    return (
      <div className="px-3 py-2">
        <div className="border border-gray-200 rounded-xl p-3 text-center bg-white">
          <p className="text-xs font-semibold text-gray-800 mb-1">{String(p('title') || '弹窗标题')}</p>
          <p className="text-xs text-gray-400 mb-2">弹窗内容区域</p>
          <div className="bg-orange-500 text-white text-xs rounded-lg py-1.5">{String(p('confirmText') || '我知道了')}</div>
        </div>
      </div>
    )
  }

  if (component.name === '公告/跑马灯') {
    return (
      <div className="px-3 py-2 flex items-center gap-2 bg-orange-50">
        <span className="text-xs text-orange-500">📢</span>
        <span className="text-xs text-gray-500 truncate">恭喜玩家***获得大奖！</span>
      </div>
    )
  }

  if (component.name === '活动规则说明') {
    return (
      <div className="px-3 py-3">
        <p className="text-xs font-semibold text-gray-800 mb-1">活动规则</p>
        {['活动期间每日可参与3次', '奖品将在活动结束后发放'].map((t, i) => (
          <p key={i} className="text-xs text-gray-400 leading-relaxed">{i+1}. {t}</p>
        ))}
      </div>
    )
  }

  // 兜底
  return (
    <div className="px-3 py-2.5 flex items-center gap-2 border-b border-gray-100">
      <div className="w-2 h-2 rounded-full bg-gray-300" />
      <span className="text-xs text-gray-600">{component.name}</span>
    </div>
  )
}
