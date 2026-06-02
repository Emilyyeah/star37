/* 模板手机预览组件 — TemplateListPage 和 TemplateDetailPage 共用
   改这里的内容，两个页面同步生效 */

import { PhoneShell } from '@/components/PhoneShell'
import type { PreviewConfig } from '../data/mockTemplates'

/* ── 各主玩法 Widget ── */

function WheelWidget({ accent }: { accent: string }) {
  const slices = 8, r = 38, cx = 44, cy = 44
  return (
    <svg viewBox="0 0 88 88" className="w-full h-full">
      {Array.from({ length: slices }).map((_, i) => {
        const a0 = (i / slices) * 2 * Math.PI - Math.PI / 2
        const a1 = ((i + 1) / slices) * 2 * Math.PI - Math.PI / 2
        const x0 = cx + r * Math.cos(a0), y0 = cy + r * Math.sin(a0)
        const x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1)
        return (
          <path key={i}
            d={`M${cx},${cy} L${x0},${y0} A${r},${r} 0 0,1 ${x1},${y1} Z`}
            fill={i % 2 === 0 ? accent : 'rgba(255,255,255,0.15)'}
            stroke="rgba(255,255,255,0.3)" strokeWidth="0.5"
          />
        )
      })}
      <circle cx={cx} cy={cy} r="10" fill="white" opacity="0.9" />
      <circle cx={cx} cy={cy} r="5" fill={accent} />
      <polygon points={`${cx},${cy - r - 4} ${cx - 4},${cy - r + 6} ${cx + 4},${cy - r + 6}`} fill="white" />
    </svg>
  )
}

function Grid9Widget({ accent }: { accent: string }) {
  return (
    <div className="grid grid-cols-3 gap-1 p-1 w-full h-full">
      {Array.from({ length: 9 }).map((_, i) => {
        const isCenter = i === 4
        return (
          <div key={i} className="rounded flex items-center justify-center text-[9px] font-bold"
            style={{
              background: isCenter ? accent : 'rgba(255,255,255,0.12)',
              color: isCenter ? '#1a1a1a' : 'rgba(255,255,255,0.8)',
              border: `1px solid ${isCenter ? accent : 'rgba(255,255,255,0.2)'}`,
            }}>
            {isCenter ? '抽奖' : '奖品'}
          </div>
        )
      })}
    </div>
  )
}

function CheckinWidget({ accent }: { accent: string }) {
  const days = Array.from({ length: 7 }, (_, i) => ({ d: i + 1, done: i < 3 }))
  return (
    <div className="w-full h-full flex flex-col justify-center gap-1 px-1">
      <div className="text-[8px] text-white/60 text-center mb-1">7天签到</div>
      <div className="grid grid-cols-7 gap-0.5">
        {days.map(({ d, done }) => (
          <div key={d} className="aspect-square rounded flex items-center justify-center text-[8px] font-bold"
            style={{ background: done ? accent : 'rgba(255,255,255,0.1)', color: done ? '#fff' : 'rgba(255,255,255,0.5)' }}>
            {done ? '✓' : d}
          </div>
        ))}
      </div>
      <div className="text-[7px] text-white/40 text-center mt-1">已签 3/7 天</div>
    </div>
  )
}

function TasksWidget({ accent }: { accent: string }) {
  return (
    <div className="w-full h-full flex flex-col justify-center gap-1.5 px-1">
      {['每日分享', '邀请好友', '观看视频'].map((_t, i) => (
        <div key={i} className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center"
            style={{ background: i === 0 ? accent : 'rgba(255,255,255,0.15)' }}>
            <span className="text-[7px] text-white font-bold">{i === 0 ? '✓' : i + 1}</span>
          </div>
          <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${[100, 60, 20][i]}%`, background: accent }} />
          </div>
        </div>
      ))}
    </div>
  )
}

function GiftWidget({ accent }: { accent: string }) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-1">
      <div className="relative">
        <div className="w-10 h-8 rounded-sm flex items-center justify-center" style={{ background: accent }}>
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-2 rounded-t-sm" style={{ background: accent }} />
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-0.5 h-3 bg-white/80" />
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 flex gap-1">
            <div className="w-2 h-2 rounded-full bg-white/60" />
            <div className="w-2 h-2 rounded-full bg-white/60" />
          </div>
        </div>
      </div>
      <div className="text-[8px] text-white/70 text-center">邀请好友<br />双方得礼</div>
    </div>
  )
}

function ScratchWidget({ accent }: { accent: string }) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-1.5">
      <div className="w-20 h-10 rounded-lg flex items-center justify-center text-[9px] font-bold"
        style={{ background: `linear-gradient(135deg, ${accent}55, ${accent}22)`, border: `1px dashed ${accent}` }}>
        <span style={{ color: accent }}>刮我中大奖</span>
      </div>
      <div className="flex gap-1">
        {[1, 2, 3].map(i => (
          <div key={i} className="w-5 h-5 rounded text-[7px] flex items-center justify-center text-white/60"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}>
            ?
          </div>
        ))}
      </div>
    </div>
  )
}

function MainWidget({ cfg }: { cfg: PreviewConfig }) {
  const p = { accent: cfg.accentColor }
  switch (cfg.mainWidget) {
    case 'wheel':   return <WheelWidget {...p} />
    case 'grid9':   return <Grid9Widget {...p} />
    case 'checkin': return <CheckinWidget {...p} />
    case 'tasks':   return <TasksWidget {...p} />
    case 'gift':    return <GiftWidget {...p} />
    case 'scratch': return <ScratchWidget {...p} />
    default: return null
  }
}

/* ── 统一手机预览内容（与 PhoneShell 搭配使用） ── */
function TemplatePhoneContent({ cfg }: { cfg: PreviewConfig }) {
  return (
    <div style={{ background: cfg.pageBg }}>
      {/* Banner */}
      <div className="relative h-36 flex flex-col items-center justify-center px-4 overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${cfg.bannerFrom}, ${cfg.bannerTo})` }}>
        <div className="absolute -right-8 -top-8 w-28 h-28 rounded-full opacity-20" style={{ background: cfg.accentColor }} />
        <div className="absolute -left-5 bottom-0 w-20 h-20 rounded-full opacity-15" style={{ background: cfg.accentColor }} />
        <p className="text-white text-[14px] font-black leading-tight text-center drop-shadow-sm relative z-10">
          {cfg.bannerTitle}
        </p>
        {cfg.bannerSubtitle && (
          <p className="text-white/80 text-[11px] leading-tight text-center relative z-10 mt-1">
            {cfg.bannerSubtitle}
          </p>
        )}
      </div>

      {/* 主玩法区 */}
      <div className="h-[168px] flex items-center justify-center mx-3 my-2 rounded-xl overflow-hidden"
        style={{ background: cfg.widgetBg }}>
        <div className="w-full h-full">
          <MainWidget cfg={cfg} />
        </div>
      </div>

      {/* 按钮 */}
      <div className="flex justify-center px-4 mb-1">
        <div className="w-full h-9 rounded-full flex items-center justify-center text-white text-[12px] font-bold shadow-sm"
          style={{ background: cfg.btnColor }}>
          {cfg.btnText}
        </div>
      </div>

      {/* 规则条 */}
      <div className="mx-3 h-10 rounded-lg px-2.5 flex items-center gap-2"
        style={{ background: 'rgba(255,255,255,0.05)' }}>
        <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: cfg.accentColor }} />
        <div className="flex-1 space-y-0.5">
          <div className="h-[3px] rounded-full bg-white/20 w-3/4" />
          <div className="h-[3px] rounded-full bg-white/10 w-1/2" />
        </div>
      </div>
    </div>
  )
}

/* ── 导出：带 PhoneShell 的完整预览组件，传 width 控制大小 ── */
export function TemplatePhonePreview({ cfg, width = 200 }: { cfg: PreviewConfig; width?: number }) {
  return (
    <PhoneShell width={width} className="mx-auto">
      <TemplatePhoneContent cfg={cfg} />
    </PhoneShell>
  )
}
