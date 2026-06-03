/* 系统设置 — 基础配置中心
   Tab1: 项目管理  Tab2: 组件分类  Tab3: 模板分类 */

import { useState, useEffect } from 'react'
import { Settings, Plus, Pencil, Trash2, Check, X, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTabStore } from '@/lib/tabStore'
import { CATEGORY_LABELS as COMP_CATEGORY_LABELS } from '@/types/component'
import { CATEGORY_LABELS as TPL_CATEGORY_LABELS } from '@/pages/templates/data/mockTemplates'

/* ══════════════════════════════════════
   类型定义
══════════════════════════════════════ */

type Channel = 'app' | 'miniapp' | 'both'
const CHANNEL_LABELS: Record<Channel, string> = {
  app: 'App',
  miniapp: '小游戏',
  both: 'App & 小游戏',
}

interface Project {
  id: string
  name: string
  gameId: string
  channel: Channel
  status: 'active' | 'inactive'
  remark: string
  createdAt: string
}

interface Category {
  id: string
  label: string
  description: string
  enabled: boolean
}

/* ══════════════════════════════════════
   Mock 初始数据
══════════════════════════════════════ */

const INIT_PROJECTS: Project[] = [
  { id: 'p-001', name: '斗罗大陆3D', gameId: 'douluo-3d', channel: 'app', status: 'active', remark: '主力产品', createdAt: '2026-01-01' },
  { id: 'p-002', name: '斗罗大陆MMO', gameId: 'douluo-mmo', channel: 'both', status: 'active', remark: '', createdAt: '2026-02-15' },
  { id: 'p-003', name: '生存33天', gameId: 'survival-33', channel: 'miniapp', status: 'inactive', remark: '已停运', createdAt: '2025-06-01' },
]

const INIT_COMP_CATS: Category[] = Object.entries(COMP_CATEGORY_LABELS).map(([id, label]) => ({
  id, label, description: '', enabled: true,
}))

const INIT_TPL_CATS: Category[] = Object.entries(TPL_CATEGORY_LABELS)
  .filter(([id]) => id !== 'all')
  .map(([id, label]) => ({ id, label, description: '', enabled: true }))

/* ══════════════════════════════════════
   通用：内联编辑行
══════════════════════════════════════ */
function EditableRow({
  value, onSave, onCancel,
}: { value: string; onSave: (v: string) => void; onCancel: () => void }) {
  const [v, setV] = useState(value)
  return (
    <div className="flex items-center gap-2">
      <input
        autoFocus
        value={v}
        onChange={(e) => setV(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') onSave(v); if (e.key === 'Escape') onCancel() }}
        className="flex-1 text-sm border border-orange-400 rounded-lg px-2.5 py-1 focus:outline-none"
      />
      <button onClick={() => onSave(v)} className="p-1 text-green-600 hover:bg-green-50 rounded"><Check className="w-4 h-4" /></button>
      <button onClick={onCancel} className="p-1 text-gray-400 hover:bg-gray-100 rounded"><X className="w-4 h-4" /></button>
    </div>
  )
}

/* ══════════════════════════════════════
   Tab 1：项目管理
══════════════════════════════════════ */
function ProjectTab() {
  const [projects, setProjects] = useState<Project[]>(INIT_PROJECTS)
  const [editing, setEditing] = useState<Project | null>(null)  // null=新增, Project=编辑
  const [showForm, setShowForm] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const emptyForm: Omit<Project, 'id' | 'createdAt'> = { name: '', gameId: '', channel: 'app', status: 'active', remark: '' }
  const [form, setForm] = useState({ ...emptyForm })

  const openCreate = () => {
    setEditing(null)
    setForm({ ...emptyForm })
    setShowForm(true)
  }
  const openEdit = (p: Project) => {
    setEditing(p)
    setForm({ name: p.name, gameId: p.gameId, channel: p.channel, status: p.status, remark: p.remark })
    setShowForm(true)
  }
  const handleSave = () => {
    if (!form.name.trim() || !form.gameId.trim()) return
    if (editing) {
      setProjects((prev) => prev.map((p) => p.id === editing.id ? { ...p, ...form } : p))
    } else {
      setProjects((prev) => [...prev, { ...form, id: `p-${Date.now()}`, createdAt: new Date().toISOString().slice(0, 10) }])
    }
    setShowForm(false)
  }
  const handleDelete = (id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id))
    setDeleteId(null)
  }
  const toggleStatus = (id: string) => {
    setProjects((prev) => prev.map((p) => p.id === id ? { ...p, status: p.status === 'active' ? 'inactive' : 'active' } : p))
  }

  return (
    <div className="space-y-4">
      {/* 工具栏 */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-500">{projects.length} 个项目</p>
        <button onClick={openCreate} className="inline-flex items-center gap-1.5 px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-xl transition-colors">
          <Plus className="w-4 h-4" />新增项目
        </button>
      </div>

      {/* 表格 */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">项目名称</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">项目 ID</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">渠道</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">状态</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">备注</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">创建时间</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {projects.map((p) => (
              <tr key={p.id} className="border-b border-gray-50 last:border-none hover:bg-gray-50/50 transition-colors">
                <td className="px-4 py-3 font-medium text-gray-800">{p.name}</td>
                <td className="px-4 py-3 text-gray-500 font-mono text-xs">{p.gameId}</td>
                <td className="px-4 py-3">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 font-medium">{CHANNEL_LABELS[p.channel]}</span>
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => toggleStatus(p.id)} className={cn('text-xs px-2 py-0.5 rounded-full font-medium transition-colors', p.status === 'active' ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200')}>
                    {p.status === 'active' ? '启用' : '停用'}
                  </button>
                </td>
                <td className="px-4 py-3 text-gray-400 text-xs">{p.remark || '—'}</td>
                <td className="px-4 py-3 text-gray-400 text-xs">{p.createdAt}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1 justify-end">
                    <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                    {deleteId === p.id ? (
                      <div className="flex items-center gap-1">
                        <button onClick={() => handleDelete(p.id)} className="text-xs px-2 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600">确认</button>
                        <button onClick={() => setDeleteId(null)} className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-lg">取消</button>
                      </div>
                    ) : (
                      <button onClick={() => setDeleteId(p.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 新增/编辑弹窗 */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold text-gray-900">{editing ? '编辑项目' : '新增项目'}</h2>
              <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-4">
              <Field label="项目名称" required>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="如：斗罗大陆3D" className="field-input" />
              </Field>
              <Field label="项目 ID" required>
                <input value={form.gameId} onChange={(e) => setForm({ ...form, gameId: e.target.value })} placeholder="如：douluo-3d" className="field-input font-mono" />
              </Field>
              <Field label="渠道">
                <div className="flex gap-2">
                  {(Object.entries(CHANNEL_LABELS) as [Channel, string][]).map(([val, label]) => (
                    <button key={val} onClick={() => setForm({ ...form, channel: val })}
                      className={cn('flex-1 py-2 text-sm rounded-xl border transition-colors', form.channel === val ? 'border-orange-400 bg-orange-50 text-orange-600 font-medium' : 'border-gray-200 text-gray-600 hover:border-gray-300')}>
                      {label}
                    </button>
                  ))}
                </div>
              </Field>
              <Field label="状态">
                <div className="flex gap-2">
                  {(['active', 'inactive'] as const).map((s) => (
                    <button key={s} onClick={() => setForm({ ...form, status: s })}
                      className={cn('flex-1 py-2 text-sm rounded-xl border transition-colors', form.status === s ? 'border-orange-400 bg-orange-50 text-orange-600 font-medium' : 'border-gray-200 text-gray-600 hover:border-gray-300')}>
                      {s === 'active' ? '启用' : '停用'}
                    </button>
                  ))}
                </div>
              </Field>
              <Field label="备注">
                <input value={form.remark} onChange={(e) => setForm({ ...form, remark: e.target.value })} placeholder="可选" className="field-input" />
              </Field>
            </div>
            <div className="flex gap-2.5 mt-6">
              <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">取消</button>
              <button onClick={handleSave} disabled={!form.name.trim() || !form.gameId.trim()}
                className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-40 text-white rounded-xl text-sm font-semibold transition-colors">
                {editing ? '保存修改' : '创建项目'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ══════════════════════════════════════
   通用：分类管理 Tab（弹窗式）
══════════════════════════════════════ */
function CategoryTab({ initCats, noun }: { initCats: Category[]; noun: string }) {
  const [cats, setCats] = useState<Category[]>(initCats)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Category | null>(null)
  const [form, setForm] = useState({ label: '', description: '' })
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const openCreate = () => {
    setEditing(null)
    setForm({ label: '', description: '' })
    setShowForm(true)
  }
  const openEdit = (cat: Category) => {
    setEditing(cat)
    setForm({ label: cat.label, description: cat.description })
    setShowForm(true)
  }
  const handleSave = () => {
    if (!form.label.trim()) return
    if (editing) {
      setCats((prev) => prev.map((c) => c.id === editing.id ? { ...c, ...form } : c))
    } else {
      setCats((prev) => [...prev, { id: `cat-${Date.now()}`, label: form.label.trim(), description: form.description.trim(), enabled: true }])
    }
    setShowForm(false)
  }
  const toggleEnabled = (id: string) => {
    setCats((prev) => prev.map((c) => c.id === id ? { ...c, enabled: !c.enabled } : c))
  }
  const handleDelete = (id: string) => {
    setCats((prev) => prev.filter((c) => c.id !== id))
    setDeleteId(null)
  }

  return (
    <div className="space-y-4">
      {/* 工具栏 */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-500">{cats.length} 个{noun}分类</p>
        <button onClick={openCreate}
          className="inline-flex items-center gap-1.5 px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-xl transition-colors">
          <Plus className="w-4 h-4" />新增分类
        </button>
      </div>

      {/* 表格 */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">分类名称</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">描述</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">状态</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {cats.map((cat) => (
              <tr key={cat.id} className="border-b border-gray-50 last:border-none hover:bg-gray-50/50 transition-colors">
                <td className="px-4 py-3 font-medium text-gray-800">{cat.label}</td>
                <td className="px-4 py-3 text-gray-400 text-xs">{cat.description || '—'}</td>
                <td className="px-4 py-3">
                  <button onClick={() => toggleEnabled(cat.id)}
                    className={cn('text-xs px-2 py-0.5 rounded-full font-medium transition-colors', cat.enabled ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200')}>
                    {cat.enabled ? '启用' : '停用'}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1 justify-end">
                    <button onClick={() => openEdit(cat)} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                    {deleteId === cat.id ? (
                      <div className="flex items-center gap-1">
                        <button onClick={() => handleDelete(cat.id)} className="text-xs px-2 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600">确认</button>
                        <button onClick={() => setDeleteId(null)} className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-lg">取消</button>
                      </div>
                    ) : (
                      <button onClick={() => setDeleteId(cat.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {cats.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-sm text-gray-400">暂无分类，点击「新增分类」添加</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 弹窗 */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold text-gray-900">{editing ? `编辑${noun}分类` : `新增${noun}分类`}</h2>
              <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-4">
              <Field label={`${noun}类别名`} required>
                <input
                  autoFocus
                  value={form.label}
                  onChange={(e) => setForm({ ...form, label: e.target.value })}
                  placeholder={`如：${noun === '组件' ? '抽奖' : '活动类'}`}
                  className="field-input"
                />
              </Field>
              <Field label={`${noun}类别描述`}>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="简单描述该分类的用途…"
                  rows={3}
                  className="field-input resize-none"
                />
              </Field>
            </div>
            <div className="flex gap-2.5 mt-6">
              <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">取消</button>
              <button onClick={handleSave} disabled={!form.label.trim()}
                className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-40 text-white rounded-xl text-sm font-semibold transition-colors">
                {editing ? '保存修改' : '创建分类'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ══════════════════════════════════════
   辅助：表单字段
══════════════════════════════════════ */
function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-700 mb-1.5">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}

/* ══════════════════════════════════════
   主页面
══════════════════════════════════════ */
type SettingTab = 'projects' | 'comp-cats' | 'tpl-cats'
const TABS: { key: SettingTab; label: string }[] = [
  { key: 'projects', label: '项目管理' },
  { key: 'comp-cats', label: '组件分类' },
  { key: 'tpl-cats', label: '模板分类' },
]

export default function SettingsPage() {
  const openTab = useTabStore((s) => s.openTab)
  const [activeTab, setActiveTab] = useState<SettingTab>('projects')

  useEffect(() => { openTab('/settings', '系统设置') }, [openTab])

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Settings className="w-6 h-6 text-gray-400" />
        <h1 className="text-xl font-semibold text-gray-900">系统设置</h1>
      </div>

      {/* Tab 栏 */}
      <div className="flex gap-1 mb-6 bg-gray-100 rounded-xl p-1 w-fit">
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className={cn('px-4 py-2 text-sm font-medium rounded-lg transition-colors', activeTab === t.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700')}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab 内容 */}
      {activeTab === 'projects'  && <ProjectTab />}
      {activeTab === 'comp-cats' && <CategoryTab initCats={INIT_COMP_CATS} noun="组件" />}
      {activeTab === 'tpl-cats'  && <CategoryTab initCats={INIT_TPL_CATS} noun="模板" />}
    </div>
  )
}
