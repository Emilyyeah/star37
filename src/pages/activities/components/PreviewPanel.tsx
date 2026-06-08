/* 预览面板 — 简约白卡风格
   页面底色跟随头图主色（浅色），组件统一白卡 */

import { PanelRightOpen, PanelRightClose, Eye, Smartphone } from 'lucide-react'
import { PhoneShell } from '@/components/PhoneShell'
import { cn } from '@/lib/utils'
import type { MatchedComponent } from '../types'
import { useThemeStore, type ActivityTheme } from '@/lib/themeStore'

interface PreviewPanelProps {
  show: boolean
  components: MatchedComponent[]
  onToggle: (show: boolean) => void
  embedded?: boolean
  selectedIdx?: number | null
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
        <button onClick={() => onToggle(true)} className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100" title="展开预览">
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
        <button onClick={() => onToggle(false)} className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100">
          <PanelRightClose className="w-4 h-4" />
        </button>
      </div>
      <div className="flex-1 overflow-auto p-4 flex justify-center items-start">
        <PhonePreview components={components} selectedIdx={selectedIdx} onSelectIdx={onSelectIdx} />
      </div>
    </div>
  )
}

/* ── 手机框 ── */
function PhonePreview({ components, selectedIdx, onSelectIdx }: {
  components: MatchedComponent[]
  selectedIdx?: number | null
  onSelectIdx?: (idx: number) => void
}) {
  const theme = useThemeStore((s) => s.theme)
  const heroImageUrl = useThemeStore((s) => s.heroImageUrl)

  return (
    <PhoneShell width={240} contentHeight={460}>
      {/* 页面底色 = 主色浅版 */}
      <div style={{ background: theme.primaryBg, minHeight: '100%' }}>

        {/* 头图区域 — 全出血，固定高度 */}
        <div style={{
          height: 130,
          background: heroImageUrl
            ? `url(${heroImageUrl}) center/cover no-repeat`
            : `linear-gradient(160deg, ${theme.primaryColor} 0%, ${theme.primaryText} 100%)`,
          position: 'relative',
        }}>
          {!heroImageUrl && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 14 }}>
              <p style={{ fontSize: 15, fontWeight: 800, color: '#fff', letterSpacing: 1,
                textShadow: '0 1px 6px rgba(0,0,0,0.4)' }}>活动标题</p>
              <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.7)', marginTop: 3 }}>活动进行中</p>
            </div>
          )}
        </div>

        {/* 组件列表 */}
        <div style={{ padding: '0 0 12px' }}>
          {components.length > 0 ? components.map((comp, idx) => (
            <div key={comp.id}
              onClick={() => onSelectIdx?.(idx)}
              style={{ position: 'relative', cursor: onSelectIdx ? 'pointer' : 'default' }}
              className={cn(selectedIdx === idx ? 'ring-2 ring-inset' : '')}
              {...(selectedIdx === idx ? { style: { position: 'relative', cursor: 'pointer', outline: `2px solid ${theme.primaryColor}`, outlineOffset: '-2px' } } : {})}
            >
              {selectedIdx === idx && (
                <div style={{ position: 'absolute', top: 8, left: 8, zIndex: 20,
                  background: theme.primaryColor, color: theme.btnTextColor,
                  fontSize: 9, fontWeight: 700, padding: '1px 6px', borderRadius: 4 }}>
                  {idx + 1}
                </div>
              )}
              <PreviewBlock component={comp} theme={theme} />
            </div>
          )) : (
            <div style={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 8 }}>
              <Smartphone style={{ width: 28, height: 28, opacity: 0.2 }} />
              <p style={{ fontSize: 10, color: '#999' }}>确认组件后实时更新</p>
            </div>
          )}
        </div>

      </div>
    </PhoneShell>
  )
}

/* ═══════════════════════════════════════
   通用样式工具
═══════════════════════════════════════ */

/** 白卡容器 */
const card = (extra?: React.CSSProperties): React.CSSProperties => ({
  margin: '8px 10px 0',
  borderRadius: 10,
  background: '#FFFFFF',
  boxShadow: '0 1px 6px rgba(0,0,0,0.08)',
  overflow: 'hidden',
  ...extra,
})

/** 卡片标题行（带左侧竖条） */
function CardTitle({ text, theme }: { text: string; theme: ActivityTheme }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 12px 6px' }}>
      <div style={{ width: 3, height: 12, borderRadius: 2, background: theme.primaryColor }} />
      <span style={{ fontSize: 11, fontWeight: 700, color: '#1A1A1A' }}>{text}</span>
    </div>
  )
}

/** 主按钮 */
function PrimaryBtn({ text, theme, small }: { text: string; theme: ActivityTheme; small?: boolean }) {
  return (
    <div style={{
      margin: small ? '0' : '0 12px 12px',
      padding: small ? '5px 16px' : '8px 0',
      borderRadius: 20,
      background: theme.primaryColor,
      color: theme.btnTextColor,
      fontSize: small ? 10 : 12,
      fontWeight: 700,
      textAlign: 'center',
      boxShadow: `0 3px 10px ${theme.primaryColor}40`,
      cursor: 'pointer',
    }}>{text}</div>
  )
}

/** 描边按钮 */
function OutlineBtn({ text, theme }: { text: string; theme: ActivityTheme }) {
  return (
    <div style={{
      padding: '3px 10px', borderRadius: 12,
      border: `1px solid ${theme.primaryColor}`,
      color: theme.primaryColor,
      fontSize: 9, fontWeight: 600, cursor: 'pointer',
      whiteSpace: 'nowrap',
    }}>{text}</div>
  )
}

/* ═══════════════════════════════════════
   10 个组件预览块
═══════════════════════════════════════ */
function PreviewBlock({ component, theme }: { component: MatchedComponent; theme: ActivityTheme }) {
  const p = (name: string) => component.params.find((x) => x.name === name)?.value

  /* ── Banner ── */
  if (component.name === '活动 Banner') {
    return (
      <div style={{ ...card({ margin: '6px 10px 0', height: 56 }),
        background: `linear-gradient(135deg, ${theme.primaryColor} 0%, ${theme.primaryText} 100%)`,
        display: 'flex', alignItems: 'center', padding: '0 12px' }}>
        <div>
          <p style={{ fontSize: 12, fontWeight: 800, color: '#fff' }}>{String(p('title') || '活动标题')}</p>
          <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.75)', marginTop: 2 }}>活动进行中</p>
        </div>
      </div>
    )
  }

  /* ── 转盘抽奖 ── */
  if (component.name === '转盘抽奖') {
    return (
      <div style={card()}>
        <CardTitle text="转盘抽奖" theme={theme} />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '4px 0 12px' }}>
          {/* 转盘 */}
          <div style={{ position: 'relative', width: 90, height: 90, marginBottom: 8 }}>
            <svg viewBox="0 0 90 90" style={{ width: '100%', height: '100%' }}>
              {[0,1,2,3,4,5].map((i) => {
                const a1 = (i * 60 - 90) * Math.PI / 180
                const a2 = ((i + 1) * 60 - 90) * Math.PI / 180
                const x1 = 45 + 40 * Math.cos(a1), y1 = 45 + 40 * Math.sin(a1)
                const x2 = 45 + 40 * Math.cos(a2), y2 = 45 + 40 * Math.sin(a2)
                return (
                  <path key={i} d={`M45,45 L${x1},${y1} A40,40 0 0,1 ${x2},${y2} Z`}
                    fill={i % 2 === 0 ? theme.primaryBg : '#F5F5F5'}
                    stroke="#E5E5E5" strokeWidth="0.5" />
                )
              })}
              {/* 中心圆 */}
              <circle cx="45" cy="45" r="15" fill={theme.primaryColor} />
              <text x="45" y="49" textAnchor="middle" fontSize="8" fontWeight="bold" fill={theme.btnTextColor}>抽奖</text>
              <circle cx="45" cy="45" r="40" fill="none" stroke={theme.primaryColor} strokeWidth="1.5" opacity="0.3" />
            </svg>
          </div>
          <p style={{ fontSize: 9, color: '#999', marginBottom: 8 }}>每日 {String(p('dailyLimit') ?? 3)} 次机会</p>
          <div style={{ width: 88 }}><PrimaryBtn text="立即抽奖" theme={theme} small /></div>
        </div>
      </div>
    )
  }

  /* ── 九宫格 ── */
  if (component.name === '九宫格抽奖') {
    return (
      <div style={card()}>
        <CardTitle text="九宫格抽奖" theme={theme} />
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4px 0 12px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 4 }}>
            {[1,2,3,4,'抽',5,6,7,8].map((x, i) => (
              <div key={i} style={{
                width: 38, height: 38, borderRadius: 6,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 9, fontWeight: 700,
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

  /* ── 签到日历 ── */
  if (component.name === '签到日历') {
    return (
      <div style={card()}>
        <CardTitle text="每日签到" theme={theme} />
        <div style={{ padding: '4px 12px 12px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 3, marginBottom: 8 }}>
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} style={{
                aspectRatio: '1', borderRadius: 5,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 9, fontWeight: 600,
                background: i < 3 ? theme.primaryColor : '#F5F5F5',
                color: i < 3 ? theme.btnTextColor : '#999',
                border: i === 3 ? `1px solid ${theme.primaryColor}` : '1px solid transparent',
              }}>
                {i < 3 ? '✓' : i + 1}
              </div>
            ))}
          </div>
          <PrimaryBtn text="今日已签到" theme={theme} />
        </div>
      </div>
    )
  }

  /* ── 任务列表 ── */
  if (component.name === '任务列表') {
    const count = Math.min(Number(p('taskCount') ?? 3), 3)
    return (
      <div style={card()}>
        <CardTitle text="做任务赚次数" theme={theme} />
        <div style={{ padding: '0 12px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {Array.from({ length: count }).map((_, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '7px 0', borderBottom: i < count - 1 ? '1px solid #F0F0F0' : 'none',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 16, height: 16, borderRadius: '50%', border: `1.5px solid ${theme.primaryColor}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: theme.primaryColor }}>
                  {i + 1}
                </div>
                <span style={{ fontSize: 10, color: '#333' }}>任务 {i + 1}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 9, color: theme.primaryColor }}>+1次</span>
                <OutlineBtn text="去完成" theme={theme} />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  /* ── 排行榜 ── */
  if (component.name === '排行榜') {
    const medals = ['🥇', '🥈', '🥉']
    return (
      <div style={card()}>
        <CardTitle text={String(p('title') || '排行榜')} theme={theme} />
        <div style={{ padding: '0 12px 12px' }}>
          {[1,2,3].map((r) => (
            <div key={r} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '7px 0', borderBottom: r < 3 ? '1px solid #F5F5F5' : 'none',
            }}>
              <span style={{ fontSize: 14, width: 20 }}>{medals[r - 1]}</span>
              <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#F0F0F0' }} />
              <span style={{ fontSize: 10, color: '#333', flex: 1 }}>玩家 {r}</span>
              <span style={{ fontSize: 10, color: theme.primaryColor, fontWeight: 600 }}>{1000 - r * 100} 分</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  /* ── 倒计时 ── */
  if (component.name === '倒计时') {
    return (
      <div style={{ ...card({ margin: '6px 10px 0' }),
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: 6, padding: '8px 12px' }}>
        <span style={{ fontSize: 9, color: '#666' }}>{String(p('title') || '距活动结束')}</span>
        {['02', '14', '36'].map((n, i) => (
          <span key={i} style={{ fontSize: 13, fontWeight: 800, color: theme.btnTextColor,
            background: theme.primaryColor, padding: '2px 6px', borderRadius: 5,
            boxShadow: `0 2px 6px ${theme.primaryColor}40` }}>
            {n}
          </span>
        ))}
      </div>
    )
  }

  /* ── 弹窗 ── */
  if (component.name === '弹窗') {
    return (
      <div style={{ ...card(), padding: 12, textAlign: 'center' }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: '#1A1A1A', marginBottom: 4 }}>
          {String(p('title') || '弹窗标题')}
        </p>
        <p style={{ fontSize: 9, color: '#999', marginBottom: 10 }}>弹窗内容区域</p>
        <PrimaryBtn text={String(p('confirmText') || '我知道了')} theme={theme} />
      </div>
    )
  }

  /* ── 公告/跑马灯 ── */
  if (component.name === '公告/跑马灯') {
    return (
      <div style={{ margin: '4px 0', padding: '6px 12px',
        background: `${theme.primaryColor}12`,
        borderLeft: `3px solid ${theme.primaryColor}`,
        display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontSize: 10, color: theme.primaryColor }}>📢</span>
        <span style={{ fontSize: 9, color: '#555' }}>恭喜玩家***获得大奖！</span>
      </div>
    )
  }

  /* ── 活动规则说明 ── */
  if (component.name === '活动规则说明') {
    return (
      <div style={card()}>
        <CardTitle text="活动规则" theme={theme} />
        <div style={{ padding: '0 12px 10px' }}>
          {['活动期间每日可参与3次', '奖品将在活动结束后发放', '参与需满足等级要求'].map((t, i) => (
            <p key={i} style={{ fontSize: 9, color: '#888', lineHeight: 1.8, paddingLeft: 12, position: 'relative' }}>
              <span style={{ position: 'absolute', left: 0, color: theme.primaryColor }}>{i + 1}.</span>
              {t}
            </p>
          ))}
        </div>
      </div>
    )
  }

  /* 兜底 */
  return (
    <div style={{ ...card(), padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
      <div style={{ width: 6, height: 6, borderRadius: '50%', background: theme.primaryColor }} />
      <span style={{ fontSize: 10, color: '#555' }}>{component.name}</span>
    </div>
  )
}
