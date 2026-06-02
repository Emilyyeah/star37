/* 活动详情页 — 活动配置 + 组件配置（可折叠） + 预览 */

import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Copy, Gamepad2, Calendar, Users, Layers, Smartphone, ChevronDown, ChevronRight, LayoutTemplate } from 'lucide-react'
import { SaveAsTemplateDialog } from './components/SaveAsTemplateDialog'
import { cn } from '@/lib/utils'
import { useTabStore } from '@/lib/tabStore'

/* ── Mock 详情数据 ── */

type ActivityStatus = 'draft' | 'running' | 'ended'

interface CompParam { label: string; value: string; aiInferred?: boolean }
interface CompDetail { name: string; category: string; emoji: string; variant: string; params: CompParam[] }
interface ActivityDetail {
  id: string; name: string; gameName: string; gameId: string; status: ActivityStatus
  startTime: string; endTime: string; createdAt: string; creator: string
  loginMethods: string[]; guideWecom: boolean; guideHome: boolean; guideOpenGame: boolean
  shareTitle: string; shareDesc: string; shareImage: string; activityUrl: string
  components: CompDetail[]
}

const STATUS_MAP: Record<ActivityStatus, { label: string; cls: string }> = {
  draft: { label: '草稿', cls: 'bg-gray-100 text-gray-600' },
  running: { label: '进行中', cls: 'bg-green-100 text-green-700' },
  ended: { label: '已结束', cls: 'bg-orange-100 text-orange-700' },
}

const MOCK_DETAILS: Record<string, ActivityDetail> = {
  'act-001': {
    id: 'act-001', name: '618 大转盘抽奖', gameName: '斗罗3D', gameId: 'G20001',
    status: 'running', startTime: '2026-06-01 00:00', endTime: '2026-06-18 23:59',
    createdAt: '2026-05-28', creator: '艾米莉', loginMethods: ['37手游账号登录', '微信登录'],
    guideWecom: false, guideHome: true, guideOpenGame: true,
    shareTitle: '618超级大转盘', shareDesc: '来斗罗3D抽大奖！', shareImage: '',
    activityUrl: 'https://activity.37.com/act-001',
    components: [
      { name: '活动 Banner', category: '展示', emoji: '🖼️', variant: '宽幅横版', params: [
        { label: '标题', value: '618 狂欢盛典', aiInferred: true },
        { label: '副标题', value: '转盘抽奖赢好礼', aiInferred: true },
        { label: '背景图', value: 'banner_618.png' },
        { label: '高度', value: '200px' },
        { label: '文字对齐', value: '居中' },
      ]},
      { name: '转盘抽奖', category: '抽奖', emoji: '🎡', variant: '经典圆盘', params: [
        { label: '每日次数', value: '3', aiInferred: true },
        { label: '消耗类型', value: '免费', aiInferred: true },
        { label: '单次消耗', value: '0' },
        { label: '未中奖提示', value: '谢谢参与' },
        { label: '奖品-一等奖', value: '概率 5%' },
        { label: '奖品-二等奖', value: '概率 15%' },
        { label: '奖品-三等奖', value: '概率 30%' },
        { label: '奖品-谢谢参与', value: '概率 50%' },
      ]},
      { name: '任务列表', category: '任务', emoji: '✅', variant: '卡片式', params: [
        { label: '任务数量', value: '4', aiInferred: true },
        { label: '奖励单位', value: '次', aiInferred: true },
        { label: '任务1', value: '每日分享 → +1次' },
        { label: '任务2', value: '邀请好友 → +3次' },
        { label: '任务3', value: '观看视频 → +1次' },
      ]},
      { name: '排行榜', category: '互动', emoji: '🏆', variant: '领奖台式', params: [
        { label: '展示人数', value: '10', aiInferred: true },
        { label: '排名维度', value: '积分' },
        { label: '标题', value: '排行榜', aiInferred: true },
      ]},
      { name: '活动规则说明', category: '展示', emoji: '📋', variant: '列表式', params: [
        { label: '标题', value: '活动规则', aiInferred: true },
        { label: '默认折叠', value: '是' },
        { label: '规则1', value: '活动期间每日可参与一次' },
        { label: '规则2', value: '奖品以实际发放为准' },
      ]},
    ],
  },
  'act-002': {
    id: 'act-002', name: '新服签到福利', gameName: '斗罗MMO', gameId: 'G20002',
    status: 'running', startTime: '2026-05-20 00:00', endTime: '2026-06-20 23:59',
    createdAt: '2026-05-18', creator: '小王', loginMethods: ['37手游账号登录'],
    guideWecom: false, guideHome: true, guideOpenGame: false,
    shareTitle: '新服签到领好礼', shareDesc: '连续签到赢大奖', shareImage: '',
    activityUrl: 'https://activity.37.com/act-002',
    components: [
      { name: '活动 Banner', category: '展示', emoji: '🖼️', variant: '宽幅横版', params: [
        { label: '标题', value: '新服签到福利', aiInferred: true },
        { label: '背景图', value: 'banner_checkin.png' },
        { label: '高度', value: '200px' },
      ]},
      { name: '签到日历', category: '任务', emoji: '📅', variant: '日历网格', params: [
        { label: '签到周期', value: '7 天' },
        { label: '第1天奖励', value: '10积分' },
        { label: '第3天奖励', value: '30积分' },
        { label: '第7天奖励', value: '100积分' },
      ]},
      { name: '活动规则说明', category: '展示', emoji: '📋', variant: '列表式', params: [
        { label: '标题', value: '活动规则', aiInferred: true },
        { label: '默认折叠', value: '是' },
        { label: '规则1', value: '每日签到一次，不可补签' },
        { label: '规则2', value: '奖励将在签到后自动发放' },
      ]},
    ],
  },
}

/* ── 页面 ── */

export default function ActivityDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const openTab = useTabStore((s) => s.openTab)
  const detail = id ? MOCK_DETAILS[id] : null
  const [showSaveTpl, setShowSaveTpl] = useState(false)

  useEffect(() => {
    if (detail) openTab(`/activities/${id}`, detail.name)
    else if (id) openTab(`/activities/${id}`, '活动详情')
  }, [openTab, id, detail])

  if (!detail) {
    return (
      <div className="p-6">
        <button onClick={() => navigate('/activities')} className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
          <ArrowLeft className="w-4 h-4" />返回活动列表
        </button>
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-sm text-gray-500">活动不存在或暂无详情数据</p>
          <p className="text-xs text-gray-400 mt-1">Mock 数据仅支持 act-001、act-002</p>
        </div>
      </div>
    )
  }

  const s = STATUS_MAP[detail.status]
  const guides = [detail.guideHome && '返回首页', detail.guideOpenGame && '打开游戏', detail.guideWecom && '企微入口'].filter(Boolean)

  return (
    <div className="flex h-full overflow-hidden">
      {/* 左侧：活动配置 + 组件配置 */}
      <div className="flex-1 overflow-auto p-6 min-w-0">
        <div className="flex items-center justify-between mb-5">
          <button onClick={() => navigate('/activities')} className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors">
            <ArrowLeft className="w-4 h-4" />返回列表
          </button>
          <div className="flex items-center gap-2">
            <button onClick={() => navigate(`/activities/create?copy=${detail.id}`)} className="inline-flex items-center gap-1 px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors">
              <Copy className="w-3.5 h-3.5" />复制活动
            </button>
            <button onClick={() => setShowSaveTpl(true)} className="inline-flex items-center gap-1 px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors">
              <LayoutTemplate className="w-3.5 h-3.5" />存为模板
            </button>
            <button onClick={() => navigate(`/activities/create?edit=${detail.id}`)} className="px-3 py-1.5 bg-orange-500 text-white rounded-lg text-xs font-medium hover:bg-orange-600 transition-colors">
              编辑活动
            </button>
          </div>
        </div>

        {/* 活动配置 */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-lg font-semibold text-gray-900">{detail.name}</h1>
              <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500">
                <span className="flex items-center gap-1"><Gamepad2 className="w-3 h-3" />{detail.gameName}（{detail.gameId}）</span>
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{detail.createdAt}</span>
                <span className="flex items-center gap-1"><Users className="w-3 h-3" />{detail.creator}</span>
              </div>
            </div>
            <span className={cn('px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap', s.cls)}>{s.label}</span>
          </div>
          <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
            <ConfigItem label="开始时间" value={detail.startTime || '未设置'} />
            <ConfigItem label="结束时间" value={detail.endTime || '未设置'} />
            <ConfigItem label="登录方式" value={detail.loginMethods.join('、')} />
            <ConfigItem label="入口引导" value={guides.length > 0 ? guides.join('、') : '无'} />
            <ConfigItem label="分享标题" value={detail.shareTitle || '—'} />
            <ConfigItem label="分享描述" value={detail.shareDesc || '—'} />
            <ConfigItem label="活动链接" value={detail.activityUrl} mono />
          </div>
        </div>

        {/* 组件配置 — 可折叠 */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Layers className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-semibold text-gray-800">活动组件</span>
            <span className="text-xs text-gray-400">{detail.components.length} 个</span>
          </div>
          <div className="space-y-2">
            {detail.components.map((comp, idx) => (
              <CompCard key={idx} comp={comp} />
            ))}
          </div>
        </div>
      </div>

      {/* 右侧：手机预览 */}
      <div className="w-[320px] border-l border-gray-200 bg-gray-50 flex flex-col items-center justify-start pt-8 shrink-0">
        <p className="text-xs font-medium text-gray-500 mb-3 flex items-center gap-1"><Smartphone className="w-3.5 h-3.5" />活动预览</p>
        <div className="w-[260px] bg-gray-900 rounded-[2rem] p-2.5 shadow-xl">
          <div className="bg-white rounded-[1.5rem] overflow-hidden" style={{ height: 480 }}>
            <div className="h-7 bg-gray-50 flex items-center justify-center">
              <div className="w-16 h-3 bg-gray-900 rounded-full" />
            </div>
            <div className="overflow-auto" style={{ height: 453 }}>
              {detail.components.map((comp, idx) => <PreviewBlock key={idx} comp={comp} />)}
            </div>
          </div>
        </div>
      </div>

      {/* 存为模板弹窗 */}
      {showSaveTpl && (
        <SaveAsTemplateDialog
          activity={{
            name: detail.name,
            componentNames: detail.components.map((c) => c.name),
          }}
          onClose={() => setShowSaveTpl(false)}
          onSaved={() => setShowSaveTpl(false)}
        />
      )}
    </div>
  )
}

/* ═══ 子组件 ═══ */

function ConfigItem({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <span className="text-xs text-gray-400">{label}</span>
      <p className={cn('text-sm text-gray-800 mt-0.5', mono && 'font-mono text-xs break-all')}>{value}</p>
    </div>
  )
}

/** 可折叠组件配置卡片 */
function CompCard({ comp }: { comp: CompDetail }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border border-gray-100 rounded-lg overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center gap-2 px-3 py-2.5 hover:bg-gray-50 transition-colors text-left">
        {open ? <ChevronDown className="w-3.5 h-3.5 text-gray-400 shrink-0" /> : <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />}
        <span className="text-base">{comp.emoji}</span>
        <span className="text-sm font-medium text-gray-800">{comp.name}</span>
        <span className="text-xs text-gray-400">{comp.category}</span>
        <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded ml-auto shrink-0">{comp.variant}</span>
        <span className="text-xs text-gray-400 shrink-0">{comp.params.length} 项参数</span>
      </button>
      {open && (
        <div className="px-3 pb-3 border-t border-gray-100">
          <table className="w-full mt-2">
            <tbody>
              {comp.params.map((p, i) => (
                <tr key={i} className="border-b border-gray-50 last:border-0">
                  <td className="py-1.5 pr-3 text-xs text-gray-400 whitespace-nowrap w-[120px] align-top">{p.label}</td>
                  <td className="py-1.5 text-xs text-gray-700">
                    {p.value}
                    {p.aiInferred && <span className="ml-1.5 text-green-600 bg-green-50 px-1 py-0.5 rounded text-xs">AI</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function PreviewBlock({ comp }: { comp: CompDetail }) {
  if (comp.name === '活动 Banner') {
    return <div className="h-24 flex items-end p-3 bg-gradient-to-r from-orange-400 to-pink-400"><p className="text-white font-bold text-sm">{comp.params.find(p => p.label === '标题')?.value || '活动标题'}</p></div>
  }
  if (comp.name === '转盘抽奖') {
    return (
      <div className="py-4 flex flex-col items-center bg-gradient-to-b from-blue-50 to-white">
        <div className="w-32 h-32 rounded-full border-4 border-blue-200 bg-white flex items-center justify-center relative">
          {[0, 1, 2, 3, 4, 5].map((i) => <div key={i} className="absolute w-0.5 h-12 bg-blue-100 origin-bottom" style={{ transform: `rotate(${i * 60}deg)`, bottom: '50%' }} />)}
          <div className="w-9 h-9 rounded-full bg-orange-500 text-white font-bold text-xs z-10 shadow-lg flex items-center justify-center">抽奖</div>
        </div>
      </div>
    )
  }
  if (comp.name === '签到日历') {
    return (
      <div className="px-3 py-3">
        <p className="text-xs font-semibold text-gray-800 mb-2">签到日历</p>
        <div className="grid grid-cols-7 gap-1">{Array.from({ length: 7 }).map((_, i) => <div key={i} className={cn('w-full aspect-square rounded flex items-center justify-center text-xs', i < 3 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400')}>{i + 1}</div>)}</div>
      </div>
    )
  }
  if (comp.name === '任务列表') {
    return (
      <div className="px-3 py-3 space-y-1.5">
        <p className="text-xs font-semibold text-gray-800 mb-1">做任务赚次数</p>
        {['每日分享', '邀请好友'].map((t, i) => (
          <div key={i} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
            <span className="text-xs text-gray-700">{t}</span><span className="text-xs text-orange-500 font-medium">+1次</span>
          </div>
        ))}
      </div>
    )
  }
  return (
    <div className="px-3 py-2.5 border-b border-gray-100 flex items-center gap-2">
      <span className="text-sm">{comp.emoji}</span><span className="text-xs text-gray-600">{comp.name}</span>
    </div>
  )
}
