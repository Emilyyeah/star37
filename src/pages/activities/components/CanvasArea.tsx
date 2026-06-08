/* 画布区域 — 中栏（手动创建模式）
   使用与 AI 创建预览 Tab 相同的手机壳 + 白卡组件渲染 */

import { Smartphone, ChevronUp, ChevronDown, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PhoneShell } from '@/components/PhoneShell'
import type { CanvasItem } from '../hooks/useManualBuilder'
import { useThemeStore, type ActivityTheme } from '@/lib/themeStore'

interface CanvasAreaProps {
  canvas: CanvasItem[]
  selectedIdx: number | null
  onSelect: (idx: number | null) => void
  onMoveUp: (idx: number) => void
  onMoveDown: (idx: number) => void
  onRemove: (idx: number) => void
}

export function CanvasArea({ canvas, selectedIdx, onSelect, onMoveUp, onMoveDown, onRemove }: CanvasAreaProps) {
  const theme = useThemeStore((s) => s.theme)
  const heroImageUrl = useThemeStore((s) => s.heroImageUrl)

  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-gray-50">
      <div className="h-10 flex items-center justify-between px-4 border-b border-gray-200 bg-white shrink-0">
        <span className="text-sm font-medium text-gray-700">活动画布</span>
        <span className="text-xs text-gray-400">{canvas.length} 个组件</span>
      </div>
      <div className="flex-1 overflow-auto p-6 flex justify-center items-start">
        <PhoneShell width={280} contentHeight={520}>
          {/* 页面底色跟随头图主色 */}
          <div style={{ background: theme.primaryBg, minHeight: '100%' }}>

            {/* 头图区域 */}
            <div style={{
              height: 140,
              background: heroImageUrl
                ? `url(${heroImageUrl}) center/cover no-repeat`
                : `linear-gradient(160deg, ${theme.primaryColor} 0%, ${theme.primaryText} 100%)`,
              position: 'relative', flexShrink: 0,
            }}>
              {!heroImageUrl && (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 16 }}>
                  <p style={{ fontSize: 16, fontWeight: 800, color: '#fff', letterSpacing: 1,
                    textShadow: '0 1px 6px rgba(0,0,0,0.4)' }}>活动标题</p>
                  <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', marginTop: 3 }}>活动进行中</p>
                </div>
              )}
            </div>

            {/* 组件列表 — 内部可滚动 */}
            {canvas.length > 0 ? (
              <div style={{ paddingBottom: 16 }}>
                {canvas.map((item, idx) => (
                  <div
                    key={item.instanceId}
                    onClick={() => onSelect(selectedIdx === idx ? null : idx)}
                    style={{
                      position: 'relative', cursor: 'pointer',
                      outline: selectedIdx === idx ? `2px solid ${theme.primaryColor}` : '2px solid transparent',
                      outlineOffset: '-2px', transition: 'outline 0.15s',
                    }}
                    className="group"
                  >
                    {/* 选中序号 */}
                    {selectedIdx === idx && (
                      <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 20,
                        background: theme.primaryColor, color: theme.btnTextColor,
                        fontSize: 9, fontWeight: 700, padding: '1px 6px', borderRadius: 4 }}>
                        {idx + 1}
                      </div>
                    )}
                    {/* 操作按钮 */}
                    <div className={cn(
                      'absolute top-1 right-1 z-10 flex items-center gap-0.5 transition-opacity',
                      selectedIdx === idx ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                    )}>
                      <button onClick={(e) => { e.stopPropagation(); onMoveUp(idx) }} disabled={idx === 0}
                        className="w-5 h-5 rounded bg-white/90 shadow flex items-center justify-center text-gray-500 hover:text-gray-700 disabled:opacity-30">
                        <ChevronUp className="w-3 h-3" />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); onMoveDown(idx) }} disabled={idx >= canvas.length - 1}
                        className="w-5 h-5 rounded bg-white/90 shadow flex items-center justify-center text-gray-500 hover:text-gray-700 disabled:opacity-30">
                        <ChevronDown className="w-3 h-3" />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); onRemove(idx) }}
                        className="w-5 h-5 rounded bg-white/90 shadow flex items-center justify-center text-gray-500 hover:text-red-500">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                    <CanvasBlock item={item} theme={theme} />
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexDirection: 'column', gap: 8 }}>
                <Smartphone style={{ width: 28, height: 28, opacity: 0.2 }} />
                <p style={{ fontSize: 10, color: '#999' }}>从左侧选择组件</p>
              </div>
            )}
          </div>
        </PhoneShell>
      </div>
    </div>
  )
}

/* ── 白卡组件块（与 PreviewPanel 相同风格） ── */
function CanvasBlock({ item, theme }: { item: CanvasItem; theme: ActivityTheme }) {

  const card: React.CSSProperties = {
    margin: '8px 10px 0',
    borderRadius: 10,
    background: '#FFFFFF',
    boxShadow: '0 1px 6px rgba(0,0,0,0.08)',
    overflow: 'hidden',
  }

  function CardTitle({ text }: { text: string }) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 12px 6px' }}>
        <div style={{ width: 3, height: 13, borderRadius: 2, background: theme.primaryColor }} />
        <span style={{ fontSize: 12, fontWeight: 700, color: '#1A1A1A' }}>{text}</span>
      </div>
    )
  }

  function PrimaryBtn({ text }: { text: string }) {
    return (
      <div style={{
        margin: '0 12px 12px', padding: '8px 0', borderRadius: 20,
        background: theme.primaryColor, color: theme.btnTextColor,
        fontSize: 12, fontWeight: 700, textAlign: 'center',
        boxShadow: `0 3px 10px ${theme.primaryColor}40`,
      }}>{text}</div>
    )
  }

  function OutlineBtn({ text }: { text: string }) {
    return (
      <div style={{
        padding: '3px 10px', borderRadius: 12,
        border: `1px solid ${theme.primaryColor}`,
        color: theme.primaryColor, fontSize: 9, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
      }}>{text}</div>
    )
  }

  /* Banner */
  if (item.name.includes('Banner')) {
    return (
      <div style={{ ...card, height: 72, margin: '6px 10px 0',
        background: `linear-gradient(135deg, ${theme.primaryColor} 0%, ${theme.primaryText} 100%)`,
        display: 'flex', alignItems: 'flex-end', padding: '0 14px 10px' }}>
        <div>
          <p style={{ fontSize: 13, fontWeight: 800, color: '#fff' }}>{String(item.params.title || '活动标题')}</p>
          <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.75)', marginTop: 2 }}>{String(item.params.subtitle || '活动进行中')}</p>
        </div>
      </div>
    )
  }

  /* 转盘 */
  if (item.name.includes('转盘')) {
    return (
      <div style={card}>
        <CardTitle text="转盘抽奖" />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '4px 0 12px' }}>
          <div style={{ position: 'relative', width: 100, height: 100, marginBottom: 8 }}>
            <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
              {[0,1,2,3,4,5].map((i) => {
                const a1 = (i * 60 - 90) * Math.PI / 180
                const a2 = ((i + 1) * 60 - 90) * Math.PI / 180
                const x1 = 50 + 44 * Math.cos(a1), y1 = 50 + 44 * Math.sin(a1)
                const x2 = 50 + 44 * Math.cos(a2), y2 = 50 + 44 * Math.sin(a2)
                return <path key={i} d={`M50,50 L${x1},${y1} A44,44 0 0,1 ${x2},${y2} Z`}
                  fill={i % 2 === 0 ? theme.primaryBg : '#F5F5F5'} stroke="#E5E5E5" strokeWidth="0.5" />
              })}
              <circle cx="50" cy="50" r="16" fill={theme.primaryColor} />
              <text x="50" y="54" textAnchor="middle" fontSize="9" fontWeight="bold" fill={theme.btnTextColor}>抽奖</text>
              <circle cx="50" cy="50" r="44" fill="none" stroke={theme.primaryColor} strokeWidth="1.5" opacity="0.3" />
            </svg>
          </div>
          <p style={{ fontSize: 10, color: '#999', marginBottom: 8 }}>每日 {String(item.params.dailyLimit || 3)} 次机会</p>
          <div style={{ width: 96 }}><PrimaryBtn text="立即抽奖" /></div>
        </div>
      </div>
    )
  }

  /* 九宫格 */
  if (item.name.includes('九宫格')) {
    return (
      <div style={card}>
        <CardTitle text="九宫格抽奖" />
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4px 0 12px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 4 }}>
            {[1,2,3,4,'抽',5,6,7,8].map((x, i) => (
              <div key={i} style={{
                width: 44, height: 44, borderRadius: 6,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 10, fontWeight: 700,
                background: x === '抽' ? theme.primaryColor : '#F8F8F8',
                border: `1px solid ${x === '抽' ? theme.primaryColor : '#EBEBEB'}`,
                color: x === '抽' ? theme.btnTextColor : '#666',
              }}>
                {x === '抽' ? '抽奖' : `奖${x}`}
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  /* 签到 */
  if (item.name.includes('签到')) {
    return (
      <div style={card}>
        <CardTitle text="每日签到" />
        <div style={{ padding: '4px 12px 12px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 3, marginBottom: 8 }}>
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} style={{
                aspectRatio: '1', borderRadius: 5,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 10, fontWeight: 600,
                background: i < 3 ? theme.primaryColor : '#F5F5F5',
                color: i < 3 ? theme.btnTextColor : '#999',
                border: i === 3 ? `1px solid ${theme.primaryColor}` : '1px solid transparent',
              }}>
                {i < 3 ? '✓' : i + 1}
              </div>
            ))}
          </div>
          <PrimaryBtn text="今日已签到" />
        </div>
      </div>
    )
  }

  /* 任务 */
  if (item.name.includes('任务')) {
    const count = Math.min(Number(item.params.taskCount || 3), 3)
    return (
      <div style={card}>
        <CardTitle text="做任务赚次数" />
        <div style={{ padding: '0 12px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {Array.from({ length: count }).map((_, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '7px 0', borderBottom: i < count - 1 ? '1px solid #F0F0F0' : 'none',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 18, height: 18, borderRadius: '50%', border: `1.5px solid ${theme.primaryColor}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: theme.primaryColor }}>
                  {i + 1}
                </div>
                <span style={{ fontSize: 10, color: '#333' }}>任务 {i + 1}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 10, color: theme.primaryColor }}>+1次</span>
                <OutlineBtn text="去完成" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  /* 排行榜 */
  if (item.name.includes('排行')) {
    return (
      <div style={card}>
        <CardTitle text={String(item.params.title || '排行榜')} />
        <div style={{ padding: '0 12px 12px' }}>
          {['🥇','🥈','🥉'].map((medal, r) => (
            <div key={r} style={{ display: 'flex', alignItems: 'center', gap: 8,
              padding: '7px 0', borderBottom: r < 2 ? '1px solid #F5F5F5' : 'none' }}>
              <span style={{ fontSize: 15 }}>{medal}</span>
              <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#F0F0F0' }} />
              <span style={{ fontSize: 10, color: '#333', flex: 1 }}>玩家 {r + 1}</span>
              <span style={{ fontSize: 10, color: theme.primaryColor, fontWeight: 600 }}>{1000 - (r + 1) * 100} 分</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  /* 倒计时 */
  if (item.name.includes('倒计时')) {
    return (
      <div style={{ ...card, margin: '6px 10px 0',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px 12px' }}>
        <span style={{ fontSize: 10, color: '#666' }}>{String(item.params.title || '距活动结束')}</span>
        {['02','14','36'].map((n, i) => (
          <span key={i} style={{ fontSize: 13, fontWeight: 800, color: theme.btnTextColor,
            background: theme.primaryColor, padding: '2px 6px', borderRadius: 5 }}>{n}</span>
        ))}
      </div>
    )
  }

  /* 弹窗 */
  if (item.name.includes('弹窗')) {
    return (
      <div style={{ ...card, padding: 12, textAlign: 'center' }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: '#1A1A1A', marginBottom: 4 }}>
          {String(item.params.title || '弹窗标题')}
        </p>
        <p style={{ fontSize: 10, color: '#999', marginBottom: 10 }}>弹窗内容区域</p>
        <PrimaryBtn text={String(item.params.confirmText || '我知道了')} />
      </div>
    )
  }

  /* 公告/跑马灯 */
  if (item.name.includes('公告') || item.name.includes('跑马灯')) {
    return (
      <div style={{ margin: '4px 0', padding: '7px 12px',
        background: `${theme.primaryColor}12`,
        borderLeft: `3px solid ${theme.primaryColor}`,
        display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontSize: 11, color: theme.primaryColor }}>📢</span>
        <span style={{ fontSize: 10, color: '#555' }}>恭喜玩家***获得大奖！</span>
      </div>
    )
  }

  /* 活动规则 */
  if (item.name.includes('规则')) {
    return (
      <div style={card}>
        <CardTitle text="活动规则" />
        <div style={{ padding: '0 12px 10px' }}>
          {['活动期间每日可参与3次', '奖品将在活动结束后发放'].map((t, i) => (
            <p key={i} style={{ fontSize: 10, color: '#888', lineHeight: 1.8, paddingLeft: 12, position: 'relative' }}>
              <span style={{ position: 'absolute', left: 0, color: theme.primaryColor }}>{i + 1}.</span>{t}
            </p>
          ))}
        </div>
      </div>
    )
  }

  /* 兜底 */
  return (
    <div style={{ ...card, padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
      <div style={{ width: 6, height: 6, borderRadius: '50%', background: theme.primaryColor }} />
      <span style={{ fontSize: 10, color: '#555' }}>{item.name}</span>
    </div>
  )
}
