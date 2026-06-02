/* 存为模板弹窗 — 活动列表/详情页共用 */

import { useState, useEffect } from 'react'
import { X, LayoutTemplate, ChevronDown, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { MOCK_TEMPLATES, type MockTemplate, type TemplateCategory } from '@/pages/templates/data/mockTemplates'

const CATEGORY_OPTIONS: { value: Exclude<TemplateCategory, 'all'>; label: string }[] = [
  { value: 'lottery', label: '抽奖类' },
  { value: 'checkin', label: '签到类' },
  { value: 'task',    label: '任务类' },
  { value: 'welfare', label: '福利类' },
]

/** 根据活动组件名称猜测分类 */
function guessCategory(componentNames: string[]): Exclude<TemplateCategory, 'all'> {
  const joined = componentNames.join('')
  if (joined.includes('转盘') || joined.includes('九宫格') || joined.includes('抽奖')) return 'lottery'
  if (joined.includes('签到')) return 'checkin'
  if (joined.includes('任务') || joined.includes('邀请')) return 'task'
  return 'welfare'
}

/** 简易 toast — 挂到 body */
function showToast(msg: string) {
  const el = document.createElement('div')
  el.textContent = msg
  el.style.cssText = [
    'position:fixed', 'bottom:32px', 'left:50%', 'transform:translateX(-50%)',
    'background:#1a1a1a', 'color:#fff', 'padding:10px 20px',
    'border-radius:10px', 'font-size:13px', 'z-index:9999',
    'pointer-events:none', 'white-space:nowrap',
    'box-shadow:0 4px 16px rgba(0,0,0,0.25)',
  ].join(';')
  document.body.appendChild(el)
  setTimeout(() => el.remove(), 2500)
}

export interface SaveAsTemplateDialogProps {
  /** 来源活动信息 */
  activity: {
    name: string
    componentNames: string[]   // 用于猜测分类
  }
  onClose: () => void
  /** 确认保存后回调（可在此跳转模板库） */
  onSaved: (tpl: MockTemplate) => void
}

export function SaveAsTemplateDialog({ activity, onClose, onSaved }: SaveAsTemplateDialogProps) {
  const guessed = guessCategory(activity.componentNames)

  const [name, setName]           = useState(`${activity.name} 模板`)
  const [category, setCategory]   = useState<Exclude<TemplateCategory, 'all'>>(guessed)
  const [description, setDescription] = useState('')
  const [catOpen, setCatOpen]     = useState(false)
  const [saving, setSaving]       = useState(false)
  const [saved, setSaved]         = useState(false)

  // ESC 关闭
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const handleSave = () => {
    if (!name.trim()) return
    setSaving(true)

    // Mock 延迟模拟保存
    setTimeout(() => {
      const newTpl: MockTemplate = {
        id: `tpl-${Date.now().toString(36)}`,
        name: name.trim(),
        description: description.trim() || `从活动「${activity.name}」生成的模板`,
        category,
        tags: [activity.name],
        usageCount: 0,
        createdFrom: activity.name,
        createdAt: new Date().toISOString().slice(0, 10),
        preview: {
          pageBg: '#1a0a2e',
          bannerFrom: '#f97316', bannerTo: '#ef4444',
          bannerTitle: name.trim().slice(0, 6),
          accentColor: '#fbbf24',
          mainWidget: guessed === 'lottery' ? 'wheel' : guessed === 'checkin' ? 'checkin' : guessed === 'task' ? 'tasks' : 'gift',
          widgetBg: '#2d1b5e',
          btnText: '立即参与', btnColor: '#f97316',
        },
        components: activity.componentNames.map((n) => ({
          name: n, category: '展示', emoji: '📦', variant: '默认',
        })),
      }

      // 推入模板列表（修改共享数组）
      MOCK_TEMPLATES.unshift(newTpl)

      setSaving(false)
      setSaved(true)
      showToast(`「${newTpl.name}」已保存到模板库`)

      setTimeout(() => {
        onSaved(newTpl)
      }, 800)
    }, 600)
  }

  return (
    /* 蒙层 */
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      {/* 背景遮罩 */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />

      {/* 弹窗体 */}
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 标题 */}
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-8 h-8 rounded-xl bg-orange-50 flex items-center justify-center">
            <LayoutTemplate className="w-4 h-4 text-orange-500" />
          </div>
          <h2 className="text-base font-semibold text-gray-900">保存为模板</h2>
          <button onClick={onClose} className="ml-auto p-1 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 来源提示 */}
        <div className="mb-4 px-3 py-2 bg-gray-50 rounded-lg text-xs text-gray-500">
          来源活动：<span className="font-medium text-gray-700">{activity.name}</span>
          <span className="ml-2 text-gray-400">· {activity.componentNames.length} 个组件</span>
        </div>

        {/* 表单 */}
        <div className="space-y-4">
          {/* 模板名称 */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              模板名称 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={30}
              placeholder="给模板起个名字…"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400/40 focus:border-orange-400 transition"
            />
          </div>

          {/* 分类 */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">分类</label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setCatOpen((v) => !v)}
                className="w-full flex items-center justify-between px-3 py-2 text-sm border border-gray-200 rounded-xl hover:border-gray-300 transition bg-white"
              >
                <span className="text-gray-800">
                  {CATEGORY_OPTIONS.find((o) => o.value === category)?.label}
                </span>
                <ChevronDown className={cn('w-4 h-4 text-gray-400 transition-transform', catOpen && 'rotate-180')} />
              </button>
              {catOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-10">
                  {CATEGORY_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => { setCategory(opt.value); setCatOpen(false) }}
                      className={cn(
                        'w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-gray-50 transition-colors',
                        category === opt.value ? 'text-orange-600' : 'text-gray-700'
                      )}
                    >
                      {opt.label}
                      {category === opt.value && <Check className="w-4 h-4 text-orange-500" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 描述 */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              描述 <span className="text-gray-400 font-normal">（可选）</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              maxLength={100}
              placeholder="简单描述这个模板的适用场景…"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-orange-400/40 focus:border-orange-400 transition"
            />
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex items-center gap-2.5 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim() || saving || saved}
            className={cn(
              'flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2',
              saved
                ? 'bg-green-500 text-white'
                : 'bg-orange-500 hover:bg-orange-600 text-white disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            {saved ? (
              <><Check className="w-4 h-4" />已保存</>
            ) : saving ? (
              <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />保存中…</>
            ) : (
              <><LayoutTemplate className="w-4 h-4" />保存为模板</>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
