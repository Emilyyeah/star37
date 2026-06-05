/* 系统设置 — 基础配置中心
   Tab1: 项目管理  Tab2: 组件分类  Tab3: 模板分类 */

import { useState, useEffect } from 'react'
import { Settings, Plus, Pencil, Trash2, X, Shield, Users, Image } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTabStore } from '@/lib/tabStore'
import { useAuthStore, ALL_GAMES, ALL_FEATURES, type RoleInfo, type UserInfo, type GamePermission, type FeatureKey } from '@/lib/authStore'
import { useAssetCategoryStore, type AssetCategory } from '@/lib/assetCategoryStore'

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

const INIT_COMP_CATS: Category[] = [
  { id: 'lottery', label: '抽奖', description: '转盘、九宫格等抽奖类组件', enabled: true },
  { id: 'task', label: '任务', description: '签到、任务列表等任务类组件', enabled: true },
  { id: 'display', label: '展示', description: 'Banner、弹窗等展示类组件', enabled: true },
  { id: 'exchange', label: '兑换', description: '积分兑换等兑换类组件', enabled: true },
  { id: 'interaction', label: '互动', description: '排行榜等互动类组件', enabled: true },
]

/* [模板功能暂停]
const INIT_TPL_CATS: Category[] = [
  { id: 'lottery', label: '抽奖类', description: '转盘、九宫格等抽奖活动模板', enabled: true },
  { id: 'checkin', label: '签到类', description: '签到打卡类活动模板', enabled: true },
  { id: 'task', label: '任务类', description: '任务积分兑换类活动模板', enabled: true },
  { id: 'welfare', label: '福利类', description: '节日福利、周年庆类活动模板', enabled: true },
]
*/

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
   Tab：素材分类管理（场景分类 + 业务渠道）
══════════════════════════════════════ */
function AssetCatsTab() {
  const scenes   = useAssetCategoryStore((s) => s.scenes)
  const channels = useAssetCategoryStore((s) => s.channels)
  const addScene    = useAssetCategoryStore((s) => s.addScene)
  const updateScene = useAssetCategoryStore((s) => s.updateScene)
  const removeScene = useAssetCategoryStore((s) => s.removeScene)
  const addChannel    = useAssetCategoryStore((s) => s.addChannel)
  const updateChannel = useAssetCategoryStore((s) => s.updateChannel)
  const removeChannel = useAssetCategoryStore((s) => s.removeChannel)

  const [subTab, setSubTab] = useState<'scene' | 'channel'>('scene')

  return (
    <div className="space-y-4">
      {/* 子 Tab */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-0.5 w-fit">
        <button onClick={() => setSubTab('scene')}
          className={cn('px-3 py-1.5 text-xs font-medium rounded-md transition-colors', subTab === 'scene' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700')}>
          <Image className="w-3 h-3 inline mr-1" />场景分类
        </button>
        <button onClick={() => setSubTab('channel')}
          className={cn('px-3 py-1.5 text-xs font-medium rounded-md transition-colors', subTab === 'channel' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700')}>
          <Image className="w-3 h-3 inline mr-1" />业务渠道
        </button>
      </div>

      {subTab === 'scene'
        ? <AssetCatList noun="场景" items={scenes} onAdd={addScene} onUpdate={updateScene} onRemove={removeScene} />
        : <AssetCatList noun="渠道" items={channels} onAdd={addChannel} onUpdate={updateChannel} onRemove={removeChannel} />
      }
    </div>
  )
}

/* ── 通用素材分类列表（增删改） ── */
function AssetCatList({ noun, items, onAdd, onUpdate, onRemove }: {
  noun: string
  items: AssetCategory[]
  onAdd: (item: AssetCategory) => void
  onUpdate: (id: string, patch: Partial<AssetCategory>) => void
  onRemove: (id: string) => void
}) {
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formLabel, setFormLabel] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const openCreate = () => { setEditingId(null); setFormLabel(''); setShowForm(true) }
  const openEdit = (item: AssetCategory) => { setEditingId(item.id); setFormLabel(item.label); setShowForm(true) }
  const handleSave = () => {
    if (!formLabel.trim()) return
    if (editingId) {
      onUpdate(editingId, { label: formLabel.trim() })
    } else {
      onAdd({ id: `cat-${Date.now()}`, label: formLabel.trim(), enabled: true })
    }
    setShowForm(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-500">{items.length} 个{noun}</p>
        <button onClick={openCreate} className="inline-flex items-center gap-1.5 px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-xl transition-colors">
          <Plus className="w-4 h-4" />新增{noun}
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">{noun}名称</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">ID</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">状态</th>
              <th className="px-4 py-3 w-[100px]" />
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b border-gray-50 last:border-none hover:bg-gray-50/50 transition-colors">
                <td className="px-4 py-3 font-medium text-gray-800">{item.label}</td>
                <td className="px-4 py-3 text-gray-400 font-mono text-xs">{item.id}</td>
                <td className="px-4 py-3">
                  <button onClick={() => onUpdate(item.id, { enabled: !item.enabled })}
                    className={cn('text-xs px-2 py-0.5 rounded-full font-medium transition-colors', item.enabled ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200')}>
                    {item.enabled ? '启用' : '停用'}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1 justify-end">
                    <button onClick={() => openEdit(item)} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                    {deleteId === item.id ? (
                      <div className="flex items-center gap-1">
                        <button onClick={() => { onRemove(item.id); setDeleteId(null) }} className="text-xs px-2 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600">确认</button>
                        <button onClick={() => setDeleteId(null)} className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-lg">取消</button>
                      </div>
                    ) : (
                      <button onClick={() => setDeleteId(item.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-sm text-gray-400">暂无{noun}，点击「新增{noun}」添加</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold text-gray-900">{editingId ? `编辑${noun}` : `新增${noun}`}</h2>
              <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><X className="w-4 h-4" /></button>
            </div>
            <Field label={`${noun}名称`} required>
              <input autoFocus value={formLabel} onChange={(e) => setFormLabel(e.target.value)}
                placeholder={`如：${noun === '场景' ? '活动封面' : '视频号'}`}
                className="field-input"
                onKeyDown={(e) => e.key === 'Enter' && handleSave()} />
            </Field>
            <div className="flex gap-2.5 mt-6">
              <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">取消</button>
              <button onClick={handleSave} disabled={!formLabel.trim()}
                className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-40 text-white rounded-xl text-sm font-semibold transition-colors">
                {editingId ? '保存修改' : `创建${noun}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ══════════════════════════════════════
   Tab 4：账号权限管理（角色管理 + 账号管理）
══════════════════════════════════════ */

/* ── 游戏权限矩阵（共享组件） ── */
function GamePermMatrix({ perms, onChange }: { perms: GamePermission[]; onChange: (perms: GamePermission[]) => void }) {
  const toggle = (gameKey: string, field: 'view' | 'edit' | 'data') => {
    onChange(perms.map((p) => {
      if (p.gameKey !== gameKey) return p
      const next = { ...p, [field]: !p[field] }
      if ((field === 'edit' || field === 'data') && next[field]) next.view = true
      if (field === 'view' && !next.view) { next.edit = false; next.data = false }
      return next
    }))
  }
  const setAll = (field: 'view' | 'edit' | 'data', value: boolean) => {
    onChange(perms.map((p) => {
      const next = { ...p, [field]: value }
      if ((field === 'edit' || field === 'data') && value) next.view = true
      if (field === 'view' && !value) { next.edit = false; next.data = false }
      return next
    }))
  }

  return (
    <div>
      <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left px-3 py-2 text-xs font-medium text-gray-500">游戏</th>
              <th className="text-center px-3 py-2 text-xs font-medium text-gray-500">
                <button onClick={() => { const allOn = perms.every((p) => p.view); setAll('view', !allOn) }} className="hover:text-orange-500 transition-colors">查看</button>
              </th>
              <th className="text-center px-3 py-2 text-xs font-medium text-gray-500">
                <button onClick={() => { const allOn = perms.every((p) => p.edit); setAll('edit', !allOn) }} className="hover:text-orange-500 transition-colors">编辑</button>
              </th>
              <th className="text-center px-3 py-2 text-xs font-medium text-gray-500">
                <button onClick={() => { const allOn = perms.every((p) => p.data); setAll('data', !allOn) }} className="hover:text-orange-500 transition-colors">数据</button>
              </th>
            </tr>
          </thead>
          <tbody>
            {perms.map((perm) => {
              const game = ALL_GAMES.find((g) => g.key === perm.gameKey)
              return (
                <tr key={perm.gameKey} className="border-b border-gray-100 last:border-none">
                  <td className="px-3 py-2 text-xs font-medium text-gray-700">{game?.label}</td>
                  {(['view', 'edit', 'data'] as const).map((f) => (
                    <td key={f} className="px-3 py-2 text-center">
                      <input type="checkbox" checked={perm[f]} onChange={() => toggle(perm.gameKey, f)}
                        className="rounded border-gray-300 text-orange-500 focus:ring-orange-400" />
                    </td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <p className="text-[10px] text-gray-400 mt-1.5">开启编辑或数据权限时，查看权限会自动开启</p>
    </div>
  )
}

function AccountsTab() {
  const [subTab, setSubTab] = useState<'roles' | 'users'>('roles')
  return (
    <div className="space-y-4">
      {/* 子 Tab */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-0.5 w-fit">
        <button onClick={() => setSubTab('roles')}
          className={cn('px-3 py-1.5 text-xs font-medium rounded-md transition-colors', subTab === 'roles' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700')}>
          <Shield className="w-3 h-3 inline mr-1" />角色管理
        </button>
        <button onClick={() => setSubTab('users')}
          className={cn('px-3 py-1.5 text-xs font-medium rounded-md transition-colors', subTab === 'users' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700')}>
          <Users className="w-3 h-3 inline mr-1" />账号管理
        </button>
      </div>
      {subTab === 'roles' ? <RolesPanel /> : <UsersPanel />}
    </div>
  )
}

/* ══════════════════════════════════════
   角色管理面板
══════════════════════════════════════ */
function RolesPanel() {
  const roles = useAuthStore((s) => s.roles)
  const addRole = useAuthStore((s) => s.addRole)
  const updateRole = useAuthStore((s) => s.updateRole)
  const removeRole = useAuthStore((s) => s.removeRole)

  const [showForm, setShowForm] = useState(false)
  const [editingRole, setEditingRole] = useState<RoleInfo | null>(null) // null=新增
  const [formName, setFormName] = useState('')
  const [formFeatures, setFormFeatures] = useState<FeatureKey[]>([])
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const openCreate = () => {
    setEditingRole(null)
    setFormName('')
    setFormFeatures(['dashboard'])
    setShowForm(true)
  }
  const openEdit = (role: RoleInfo) => {
    setEditingRole(role)
    setFormName(role.name)
    setFormFeatures([...role.features])
    setShowForm(true)
  }
  const handleSave = () => {
    if (!formName.trim()) return
    if (editingRole) {
      updateRole(editingRole.id, { name: formName.trim(), features: formFeatures })
    } else {
      addRole({ id: `role-${Date.now()}`, name: formName.trim(), features: formFeatures })
    }
    setShowForm(false)
  }
  const toggleFeature = (key: FeatureKey) => {
    setFormFeatures((prev) => prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key])
  }
  const handleDelete = (id: string) => {
    removeRole(id)
    setDeleteId(null)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-500">{roles.length} 个角色</p>
        <button onClick={openCreate} className="inline-flex items-center gap-1.5 px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-xl transition-colors">
          <Plus className="w-4 h-4" />新增角色
        </button>
      </div>

      {/* 角色表格 */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">角色名称</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">功能权限</th>
              <th className="px-4 py-3 w-[100px]" />
            </tr>
          </thead>
          <tbody>
            {roles.map((role) => (
              <tr key={role.id} className="border-b border-gray-50 last:border-none hover:bg-gray-50/50 transition-colors">
                <td className="px-4 py-3 font-medium text-gray-800">{role.name}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {role.features.map((f) => {
                      const feat = ALL_FEATURES.find((af) => af.key === f)
                      return <span key={f} className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 font-medium">{feat?.label ?? f}</span>
                    })}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1 justify-end">
                    <button onClick={() => openEdit(role)} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                    {deleteId === role.id ? (
                      <div className="flex items-center gap-1">
                        <button onClick={() => handleDelete(role.id)} className="text-xs px-2 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600">确认</button>
                        <button onClick={() => setDeleteId(null)} className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-lg">取消</button>
                      </div>
                    ) : (
                      <button onClick={() => setDeleteId(role.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 新增/编辑角色弹窗 */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold text-gray-900">{editingRole ? '编辑角色' : '新增角色'}</h2>
              <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-4">
              <Field label="角色名称" required>
                <input autoFocus value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="如：运营主管" className="field-input" />
              </Field>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">功能权限</label>
                <div className="grid grid-cols-2 gap-2">
                  {ALL_FEATURES.map((feat) => (
                    <label key={feat.key} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer">
                      <input type="checkbox" checked={formFeatures.includes(feat.key)} onChange={() => toggleFeature(feat.key)}
                        className="rounded border-gray-300 text-orange-500 focus:ring-orange-400" />
                      <span className="text-xs text-gray-700">{feat.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-2.5 mt-6">
              <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">取消</button>
              <button onClick={handleSave} disabled={!formName.trim()}
                className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-40 text-white rounded-xl text-sm font-semibold transition-colors">
                {editingRole ? '保存修改' : '创建角色'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ══════════════════════════════════════
   账号管理面板
══════════════════════════════════════ */
function UsersPanel() {
  const roles = useAuthStore((s) => s.roles)
  const users = useAuthStore((s) => s.users)
  const addUser = useAuthStore((s) => s.addUser)
  const updateUser = useAuthStore((s) => s.updateUser)
  const removeUser = useAuthStore((s) => s.removeUser)
  const getRoleName = useAuthStore((s) => s.getRoleName)

  const [showForm, setShowForm] = useState(false)
  const [editingUser, setEditingUser] = useState<UserInfo | null>(null) // null=新增
  const [deleteId, setDeleteId] = useState<string | null>(null)

  /* 表单状态 */
  const [formName, setFormName] = useState('')
  const [formUsername, setFormUsername] = useState('')
  const [formPassword, setFormPassword] = useState('')
  const [formAvatar, setFormAvatar] = useState('👤')
  const [formRoleId, setFormRoleId] = useState('')
  const [formPerms, setFormPerms] = useState<GamePermission[]>([])

  const makeEmptyPerms = (): GamePermission[] =>
    ALL_GAMES.map((g) => ({ gameKey: g.key, view: false, edit: false, data: false }))

  const openCreate = () => {
    setEditingUser(null)
    setFormName(''); setFormUsername(''); setFormPassword('123456'); setFormAvatar('👤')
    setFormRoleId(roles[0]?.id ?? '')
    setFormPerms(makeEmptyPerms())
    setShowForm(true)
  }
  const openEdit = (user: UserInfo) => {
    setEditingUser(user)
    setFormName(user.name); setFormUsername(user.username); setFormPassword(user.password); setFormAvatar(user.avatar)
    setFormRoleId(user.roleId)
    setFormPerms(ALL_GAMES.map((g) => {
      const existing = user.gamePermissions.find((p) => p.gameKey === g.key)
      return existing ?? { gameKey: g.key, view: false, edit: false, data: false }
    }))
    setShowForm(true)
  }
  const handleSave = () => {
    if (!formName.trim() || !formUsername.trim()) return
    if (editingUser) {
      updateUser(editingUser.id, {
        name: formName.trim(), username: formUsername.trim(), password: formPassword || editingUser.password,
        avatar: formAvatar, roleId: formRoleId, gamePermissions: formPerms,
      })
    } else {
      addUser({
        id: `user-${Date.now()}`, name: formName.trim(), username: formUsername.trim(),
        password: formPassword || '123456', avatar: formAvatar, roleId: formRoleId, gamePermissions: formPerms,
      })
    }
    setShowForm(false)
  }
  const handleDelete = (id: string) => { removeUser(id); setDeleteId(null) }

  const AVATARS = ['👤', '👩‍💼', '👨‍💻', '🧑‍🔧', '👩‍🎨', '👨‍🔬', '🧑‍💼', '👩‍💻']

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-500">{users.length} 个账号</p>
        <button onClick={openCreate} className="inline-flex items-center gap-1.5 px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-xl transition-colors">
          <Plus className="w-4 h-4" />新增账号
        </button>
      </div>

      {/* 账号表格 */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 w-[50px]"></th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">姓名</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">账号</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">角色</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">可查看游戏</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">可编辑游戏</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">可看数据</th>
              <th className="px-4 py-3 w-[100px]" />
            </tr>
          </thead>
          <tbody>
            {users.map((user) => {
              const viewG = user.gamePermissions.filter((g) => g.view)
              const editG = user.gamePermissions.filter((g) => g.edit)
              const dataG = user.gamePermissions.filter((g) => g.data)
              const gameLabel = (list: GamePermission[]) =>
                list.length === ALL_GAMES.length ? '全部' : list.map((g) => ALL_GAMES.find((a) => a.key === g.gameKey)?.label).join('、') || '无'
              return (
                <tr key={user.id} className="border-b border-gray-50 last:border-none hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3 text-xl">{user.avatar}</td>
                  <td className="px-4 py-3 font-medium text-gray-800">{user.name}</td>
                  <td className="px-4 py-3 text-gray-500 font-mono text-xs">{user.username}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-blue-50 text-blue-600">{getRoleName(user.roleId)}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">{gameLabel(viewG)}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">{gameLabel(editG)}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">{gameLabel(dataG)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      <button onClick={() => openEdit(user)} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                      {deleteId === user.id ? (
                        <div className="flex items-center gap-1">
                          <button onClick={() => handleDelete(user.id)} className="text-xs px-2 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600">确认</button>
                          <button onClick={() => setDeleteId(null)} className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-lg">取消</button>
                        </div>
                      ) : (
                        <button onClick={() => setDeleteId(user.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
            {users.length === 0 && (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-sm text-gray-400">暂无账号，点击「新增账号」添加</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 新增/编辑账号弹窗 */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold text-gray-900">{editingUser ? '编辑账号' : '新增账号'}</h2>
              <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-4">
              {/* 头像选择 */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">头像</label>
                <div className="flex gap-2">
                  {AVATARS.map((a) => (
                    <button key={a} onClick={() => setFormAvatar(a)}
                      className={cn('w-9 h-9 rounded-lg text-xl flex items-center justify-center transition-colors',
                        formAvatar === a ? 'bg-orange-100 ring-2 ring-orange-400' : 'bg-gray-100 hover:bg-gray-200')}>
                      {a}
                    </button>
                  ))}
                </div>
              </div>

              <Field label="姓名" required>
                <input value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="如：张三" className="field-input" />
              </Field>
              <Field label="登录账号" required>
                <input value={formUsername} onChange={(e) => setFormUsername(e.target.value)} placeholder="如：zhangsan" className="field-input font-mono" />
              </Field>
              <Field label={editingUser ? '密码（留空不修改）' : '初始密码'}>
                <input value={formPassword} onChange={(e) => setFormPassword(e.target.value)} placeholder="默认 123456" className="field-input font-mono" />
              </Field>

              {/* 角色 */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">角色 <span className="text-red-500">*</span></label>
                <div className="flex flex-wrap gap-2">
                  {roles.map((role) => (
                    <button key={role.id} onClick={() => setFormRoleId(role.id)}
                      className={cn('px-3 py-2 text-sm rounded-xl border transition-colors',
                        formRoleId === role.id ? 'border-orange-400 bg-orange-50 text-orange-600 font-medium' : 'border-gray-200 text-gray-600 hover:border-gray-300')}>
                      {role.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* 游戏权限 */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">游戏权限</label>
                <GamePermMatrix perms={formPerms} onChange={setFormPerms} />
              </div>
            </div>

            <div className="flex gap-2.5 mt-6">
              <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">取消</button>
              <button onClick={handleSave} disabled={!formName.trim() || !formUsername.trim() || !formRoleId}
                className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-40 text-white rounded-xl text-sm font-semibold transition-colors">
                {editingUser ? '保存修改' : '创建账号'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ══════════════════════════════════════
   主页面
══════════════════════════════════════ */
type SettingTab = 'projects' | 'comp-cats' | 'asset-cats' | 'accounts'
const TABS: { key: SettingTab; label: string }[] = [
  { key: 'projects', label: '项目管理' },
  { key: 'comp-cats', label: '组件分类' },
  // { key: 'tpl-cats', label: '模板分类' }, /* [模板功能暂停] */
  { key: 'asset-cats', label: '素材分类' },
  { key: 'accounts', label: '账号权限' },
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
      {activeTab === 'asset-cats' && <AssetCatsTab />}
      {/* {activeTab === 'tpl-cats'  && <CategoryTab initCats={INIT_TPL_CATS} noun="模板" />} */} {/* [模板功能暂停] */}
      {activeTab === 'accounts'  && <AccountsTab />}
    </div>
  )
}
