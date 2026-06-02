/* 活动全局配置面板 */

import { useState } from 'react'
import { ChevronDown, ChevronUp, Gamepad2, LogIn, Navigation, Share2, Bell, Plus, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ActivityGlobalConfig, SubscribeTemplate, GlobalSubscribeEntry } from '../hooks/useManualBuilder'

/* 游戏项目列表 */
const GAME_PROJECTS = [
  { label: '斗罗3D', value: 'dl3d', gameId: 'G20001' },
  { label: '斗罗MMO', value: 'dlmmo', gameId: 'G20002' },
  { label: '凡人修仙传', value: 'frxxt', gameId: 'G20003' },
  { label: '生存33天', value: 'sc33', gameId: 'G20004' },
  { label: '织梦森林', value: 'zmsl', gameId: 'G20005' },
  { label: '小小蚁国', value: 'xxyg', gameId: 'G20006' },
]
const LOGIN_METHODS = [
  { label: '37手游账号登录', value: '37sy' },
  { label: '渠道账号/角色信息登录', value: 'channel' },
  { label: '微信登录', value: 'wechat' },
]
const ENTRY_STYLES = [
  { label: '浮窗按钮', value: 'float' },
  { label: '顶部引导条', value: 'banner' },
]

const ENTRY_TRIGGERS = [
  { label: '首次进入', value: 'first_visit' },
  { label: '每次进入', value: 'every_visit' },
  { label: '手动点击', value: 'manual' },
]

interface GlobalConfigPanelProps {
  config: ActivityGlobalConfig
  onUpdate: <K extends keyof ActivityGlobalConfig>(key: K, value: ActivityGlobalConfig[K]) => void
}

type SectionKey = 'basic' | 'login' | 'guide' | 'share' | 'subscribe'

export function GlobalConfigPanel({ config, onUpdate }: GlobalConfigPanelProps) {
  const [collapsed, setCollapsed] = useState<Set<SectionKey>>(new Set(['guide', 'share', 'subscribe']))

  const toggle = (key: SectionKey) => {
    setCollapsed((prev) => { const next = new Set(prev); next.has(key) ? next.delete(key) : next.add(key); return next })
  }

  const handleGameChange = (projectValue: string) => {
    const project = GAME_PROJECTS.find((p) => p.value === projectValue)
    onUpdate('gameProject', projectValue)
    onUpdate('gameId', project?.gameId || '')
  }

  const handleLoginMethodToggle = (method: string) => {
    const current = config.loginMethods
    const next = current.includes(method) ? current.filter((m) => m !== method) : [...current, method]; if (next.length > 0) onUpdate('loginMethods', next)
  }

  /* ── 订阅模板池操作 ── */
  const addTemplate = () => {
    const tpl: SubscribeTemplate = { id: `tpl-${Date.now()}`, templateId: '', name: '', description: '' }
    onUpdate('subscribeTemplates', [...config.subscribeTemplates, tpl])
  }
  const updateTemplate = (id: string, field: keyof SubscribeTemplate, value: string) => {
    onUpdate('subscribeTemplates', config.subscribeTemplates.map((t) => t.id === id ? { ...t, [field]: value } : t))
  }
  const removeTemplate = (id: string) => {
    onUpdate('subscribeTemplates', config.subscribeTemplates.filter((t) => t.id !== id))
    const entry = config.globalSubscribeEntry
    if (entry.templateRefs.includes(id)) {
      onUpdate('globalSubscribeEntry', { ...entry, templateRefs: entry.templateRefs.filter((r) => r !== id) })
    }
  }

  /* ── 全局入口操作 ── */
  const updateEntry = <K extends keyof GlobalSubscribeEntry>(key: K, value: GlobalSubscribeEntry[K]) => {
    onUpdate('globalSubscribeEntry', { ...config.globalSubscribeEntry, [key]: value })
  }
  const toggleEntryTemplate = (tplId: string) => {
    const refs = config.globalSubscribeEntry.templateRefs
    updateEntry('templateRefs', refs.includes(tplId) ? refs.filter((r) => r !== tplId) : [...refs, tplId])
  }

  const requiredFields = [config.gameProject, config.activityName, config.startTime, config.endTime]
  const filledCount = requiredFields.filter(Boolean).length
  const isComplete = filledCount === requiredFields.length

  return (
    <div className="bg-gray-50/50">
      <div className="divide-y divide-gray-100">

        {/* 1. 基础信息 */}
        <ConfigSection
          icon={<Gamepad2 className="w-3.5 h-3.5" />} title="基础信息"
          badge={!isComplete ? `${filledCount}/${requiredFields.length}` : undefined}
          badgeColor={isComplete ? 'green' : 'orange'}
          collapsed={collapsed.has('basic')} onToggle={() => toggle('basic')}
        >
          <div className="space-y-3">
            <Field label="所属游戏" required>
              <select value={config.gameProject} onChange={(e) => handleGameChange(e.target.value)} className="w-full text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-orange-400 bg-white">
                <option value="">请选择游戏项目</option>
                {GAME_PROJECTS.map((g) => <option key={g.value} value={g.value}>{g.label}（{g.gameId}）</option>)}
              </select>
            </Field>
            <Field label="活动名称" required>
              <input type="text" value={config.activityName} onChange={(e) => onUpdate('activityName', e.target.value)} placeholder="例如：618 大转盘抽奖活动" className="w-full text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-orange-400 bg-white" />
            </Field>
            <div className="grid grid-cols-2 gap-2">
              <Field label="开始时间" required>
                <input type="datetime-local" value={config.startTime} onChange={(e) => onUpdate('startTime', e.target.value)} className="w-full text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:border-orange-400 bg-white" />
              </Field>
              <Field label="结束时间" required>
                <input type="datetime-local" value={config.endTime} onChange={(e) => onUpdate('endTime', e.target.value)} className="w-full text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:border-orange-400 bg-white" />
              </Field>
            </div>
          </div>
        </ConfigSection>

        {/* 2. 登录组件 */}
        <ConfigSection
          icon={<LogIn className="w-3.5 h-3.5" />} title="登录组件"
          collapsed={collapsed.has('login')} onToggle={() => toggle('login')}
        >
          <div className="space-y-2">
            <p className="text-xs text-gray-500">登录方式（可多选）</p>
            <div className="flex flex-wrap gap-1.5">
              {LOGIN_METHODS.map((m) => (
                <button key={m.value} onClick={() => handleLoginMethodToggle(m.value)}
                  className={cn('px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors',
                    config.loginMethods.includes(m.value) ? 'border-orange-400 bg-orange-50 text-orange-700' : 'border-gray-200 text-gray-500 hover:border-gray-300')}>
                  {m.label}
                </button>
              ))}
            </div>
          </div>
        </ConfigSection>

        {/* 3. 入口引导 */}
        <ConfigSection
          icon={<Navigation className="w-3.5 h-3.5" />} title="入口引导"
          collapsed={collapsed.has('guide')} onToggle={() => toggle('guide')}
        >
          <div className="space-y-2">
            <GuideToggle label="添加企微入口" value={config.guideWecom} onChange={(v) => onUpdate('guideWecom', v)} />
            <GuideToggle label="返回首页按钮" value={config.guideHome} onChange={(v) => onUpdate('guideHome', v)} />
            <GuideToggle label="打开游戏按钮" value={config.guideOpenGame} onChange={(v) => onUpdate('guideOpenGame', v)} />
          </div>
        </ConfigSection>

        {/* 4. 分享卡片 */}
        <ConfigSection
          icon={<Share2 className="w-3.5 h-3.5" />} title="分享卡片"
          collapsed={collapsed.has('share')} onToggle={() => toggle('share')}
        >
          <div className="space-y-3">
            <Field label="分享标题">
              <input type="text" value={config.shareTitle} onChange={(e) => onUpdate('shareTitle', e.target.value)} placeholder="分享到微信时显示的标题" className="w-full text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-orange-400 bg-white" />
            </Field>
            <Field label="分享描述">
              <input type="text" value={config.shareDesc} onChange={(e) => onUpdate('shareDesc', e.target.value)} placeholder="分享卡片的描述文案" className="w-full text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-orange-400 bg-white" />
            </Field>
            <Field label="分享封面图">
              <input type="text" value={config.shareImage} onChange={(e) => onUpdate('shareImage', e.target.value)} placeholder="封面图 URL（5:4 比例）" className="w-full text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-orange-400 bg-white" />
            </Field>
          </div>
        </ConfigSection>

        {/* 5. 订阅消息 */}
        <ConfigSection
          icon={<Bell className="w-3.5 h-3.5" />} title="订阅消息"
          collapsed={collapsed.has('subscribe')} onToggle={() => toggle('subscribe')}
          badge={config.subscribeTemplates.length > 0 ? `${config.subscribeTemplates.length} 个模板` : undefined}
          badgeColor="green"
        >
          <div className="space-y-4">
            {/* 模板池 */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium text-gray-600">消息模板池</p>
                <button onClick={addTemplate} className="flex items-center gap-0.5 text-xs text-orange-500 hover:text-orange-600 transition-colors">
                  <Plus className="w-3 h-3" />添加模板
                </button>
              </div>
              {config.subscribeTemplates.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-3 bg-gray-50 rounded-lg border border-dashed border-gray-200">暂无模板，点击上方添加</p>
              ) : (
                <div className="space-y-2">
                  {config.subscribeTemplates.map((tpl) => (
                    <div key={tpl.id} className="border border-gray-200 rounded-lg p-2.5 bg-white space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <input type="text" value={tpl.name} onChange={(e) => updateTemplate(tpl.id, 'name', e.target.value)} placeholder="模板名称（如：活动开始提醒）" className="flex-1 text-xs font-medium border-0 border-b border-gray-200 px-0 py-0.5 focus:outline-none focus:border-orange-400 bg-transparent" />
                        <button onClick={() => removeTemplate(tpl.id)} className="text-gray-400 hover:text-red-500 transition-colors shrink-0 mt-0.5"><Trash2 className="w-3 h-3" /></button>
                      </div>
                      <input type="text" value={tpl.templateId} onChange={(e) => updateTemplate(tpl.id, 'templateId', e.target.value)} placeholder="小程序模板 ID" className="w-full text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:border-orange-400 bg-white text-gray-600" />
                      <input type="text" value={tpl.description} onChange={(e) => updateTemplate(tpl.id, 'description', e.target.value)} placeholder="用途说明（可选）" className="w-full text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:border-orange-400 bg-white text-gray-500" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 全局订阅入口 */}
            {config.subscribeTemplates.length > 0 && (
              <div className="border-t border-gray-100 pt-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-medium text-gray-600">全局订阅入口</p>
                  <ToggleSwitch value={config.globalSubscribeEntry.enabled} onChange={(v) => updateEntry('enabled', v)} />
                </div>
                {config.globalSubscribeEntry.enabled && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <Field label="入口样式">
                        <select value={config.globalSubscribeEntry.style} onChange={(e) => updateEntry('style', e.target.value as 'float' | 'banner')} className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:border-orange-400 bg-white">
                          {ENTRY_STYLES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                        </select>
                      </Field>
                      <Field label="弹出时机">
                        <select value={config.globalSubscribeEntry.trigger} onChange={(e) => updateEntry('trigger', e.target.value as 'first_visit' | 'every_visit' | 'manual')} className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:border-orange-400 bg-white">
                          {ENTRY_TRIGGERS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                        </select>
                      </Field>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1.5">绑定模板（用户点击时一次性授权）</p>
                      <div className="space-y-1">
                        {config.subscribeTemplates.map((tpl) => (
                          <label key={tpl.id} className="flex items-center gap-2 py-1 cursor-pointer">
                            <input type="checkbox" checked={config.globalSubscribeEntry.templateRefs.includes(tpl.id)} onChange={() => toggleEntryTemplate(tpl.id)} className="w-3.5 h-3.5 accent-orange-500" />
                            <span className="text-xs text-gray-700">{tpl.name || '未命名模板'}</span>
                            {tpl.templateId && <span className="text-xs text-gray-400 truncate max-w-[100px]">{tpl.templateId}</span>}
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 提示 */}
            {config.subscribeTemplates.length > 0 && (
              <div className="bg-blue-50 rounded-lg px-3 py-2">
                <p className="text-xs text-blue-600">各弹窗组件可在「组件配置」中选择绑定上方模板，实现场景化订阅触达。</p>
              </div>
            )}
          </div>
        </ConfigSection>
      </div>
    </div>
  )
}

/* ═══ 子组件 ═══ */

function ConfigSection({ icon, title, badge, badgeColor, collapsed, onToggle, right, children }: {
  icon: React.ReactNode; title: string; badge?: string; badgeColor?: 'green' | 'orange'
  collapsed: boolean; onToggle: () => void; right?: React.ReactNode; children: React.ReactNode
}) {
  return (
    <div>
      <button onClick={onToggle} className="w-full flex items-center gap-2 px-4 py-2.5 text-left hover:bg-gray-50 transition-colors">
        <span className="text-gray-400">{icon}</span>
        <span className="text-xs font-semibold text-gray-700 flex-1">{title}</span>
        {badge && <span className={cn('text-xs px-1.5 py-0.5 rounded font-medium', badgeColor === 'green' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700')}>{badge}</span>}
        {right && <div onClick={(e) => e.stopPropagation()}>{right}</div>}
        {collapsed ? <ChevronDown className="w-3.5 h-3.5 text-gray-400" /> : <ChevronUp className="w-3.5 h-3.5 text-gray-400" />}
      </button>
      {!collapsed && <div className="px-4 pb-3">{children}</div>}
    </div>
  )
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}{required && <span className="text-orange-500 ml-0.5">*</span>}</label>
      {children}
    </div>
  )
}

function ToggleSwitch({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div onClick={() => onChange(!value)} className={cn('w-8 h-[18px] rounded-full relative transition-colors cursor-pointer', value ? 'bg-orange-500' : 'bg-gray-300')}>
      <div className={cn('absolute top-[2px] w-[14px] h-[14px] bg-white rounded-full shadow transition-transform', value ? 'translate-x-[14px]' : 'translate-x-[2px]')} />
    </div>
  )
}

function GuideToggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between py-0.5">
      <span className="text-xs text-gray-600">{label}</span>
      <ToggleSwitch value={value} onChange={onChange} />
    </div>
  )
}
