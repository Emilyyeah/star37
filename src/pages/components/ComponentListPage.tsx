/* 组件库 — 左右分栏单页（主文件：布局编排 + 状态协调） */

import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Puzzle, Search, Plus, Clock, BarChart3,
  FileText, Eye, Activity, ChevronDown, Trash2, Pencil, Copy,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useComponentStore } from '@/lib/componentStore'
import { useTabStore } from '@/lib/tabStore'
import {
  CATEGORY_LABELS,
  STATUS_LABELS,
  STATUS_COLORS,
  CATEGORY_COLORS,
  type ComponentCategory,
  type ComponentStatus,
} from '@/types/component'
import { StatusSection, VariantPreview } from './parts/StatusAndVariant'
import { SchemaTable, SignatureView, UsageView } from './parts/DetailTabs'

const CATEGORIES: (ComponentCategory | 'all')[] = ['all', 'lottery', 'task', 'display', 'exchange', 'interaction']
const STATUS_FLOW: ComponentStatus[] = ['available', 'testing', 'draft']

const DETAIL_TABS = [
  { key: 'schema', label: '参数 Schema', icon: FileText },
  { key: 'signature', label: 'AI 视觉签名', icon: Eye },
  { key: 'usage', label: '使用记录', icon: Activity },
] as const
type DetailTabKey = (typeof DETAIL_TABS)[number]['key']

export default function ComponentListPage() {
  const navigate = useNavigate()
  const openTab = useTabStore((s) => s.openTab)
  const components = useComponentStore((s) => s.components)
  const updateStatus = useComponentStore((s) => s.updateStatus)
  const removeComp = useComponentStore((s) => s.remove)
  const duplicateComp = useComponentStore((s) => s.duplicate)
  const updateComp = useComponentStore((s) => s.update)

  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<ComponentCategory | 'all'>('all')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [variantIdx, setVariantIdx] = useState(0)
  const [detailTab, setDetailTab] = useState<DetailTabKey>('schema')
  const [statusOpen, setStatusOpen] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [showDisabled, setShowDisabled] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState({ name: '', description: '' })

  useEffect(() => { openTab('/components', '组件库') }, [openTab])

  /* 按分类+搜索筛选 */
  const filtered = useMemo(() => {
    let list = components
    if (category !== 'all') list = list.filter((c) => c.category === category)
    if (search.trim()) {
      const kw = search.trim().toLowerCase()
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(kw) ||
          c.description.toLowerCase().includes(kw) ||
          c.aiSignature.keywords.some((k) => k.toLowerCase().includes(kw))
      )
    }
    return list
  }, [components, category, search])

  /* 按状态分组 */
  const onlineList = useMemo(() => filtered.filter((c) => c.status === 'available'), [filtered])
  const pendingList = useMemo(() => filtered.filter((c) => c.status === 'testing'), [filtered])
  const disabledList = useMemo(() => filtered.filter((c) => c.status === 'draft'), [filtered])

  /* 选中组件 */
  const selected = useMemo(() => {
    if (selectedId) {
      const found = components.find((c) => c.id === selectedId)
      if (found) return found
    }
    return onlineList[0] || pendingList[0] || disabledList[0] || null
  }, [components, selectedId, onlineList, pendingList, disabledList])

  const handleSelect = (id: string) => {
    setSelectedId(id)
    setVariantIdx(0)
    setDetailTab('schema')
    setStatusOpen(false)
    setDeleteConfirm(false)
    setEditing(false)
  }

  const handleStatusChange = (newStatus: ComponentStatus) => {
    if (selected) updateStatus(selected.id, newStatus)
    setStatusOpen(false)
  }

  const handleDelete = () => {
    if (!selected || selected.status === 'available') return
    removeComp(selected.id)
    setSelectedId(null)
    setDeleteConfirm(false)
  }

  return (
    <div className="flex h-full -m-6 overflow-hidden">
      {/* ═══ 左栏：组件库 ═══ */}
      <div className="w-[340px] xl:w-[380px] border-r border-gray-200 bg-white flex flex-col shrink-0">
        <div className="px-3 pt-3 pb-2 border-b border-gray-100 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Puzzle className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-semibold text-gray-900">组件库</span>
              <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full font-medium">{components.length}</span>
            </div>
            <button
              onClick={() => { openTab('/components/create', '创建组件'); navigate('/components/create') }}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              <Plus className="w-3 h-3" />新建
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="搜索组件..."
              className="w-full pl-7 pr-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-orange-400 transition-colors" />
          </div>
          <div className="flex flex-wrap gap-1">
            {CATEGORIES.map((cat) => (
              <button key={cat} onClick={() => setCategory(cat)}
                className={cn('px-2 py-0.5 rounded text-xs font-medium transition-colors', category === cat ? 'bg-orange-50 text-orange-600' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50')}>
                {cat === 'all' ? '全部' : CATEGORY_LABELS[cat]}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <StatusSection title="已上线" count={onlineList.length} dotColor="bg-green-500" items={onlineList} selectedId={selected?.id ?? null} onSelect={handleSelect} defaultOpen />
          <StatusSection title="待上线" count={pendingList.length} dotColor="bg-blue-500" items={pendingList} selectedId={selected?.id ?? null} onSelect={handleSelect} defaultOpen />
          <StatusSection title="停用" count={disabledList.length} dotColor="bg-gray-400" items={disabledList} selectedId={selected?.id ?? null} onSelect={handleSelect} defaultOpen={showDisabled} onToggle={() => setShowDisabled(!showDisabled)} collapsible />
          {onlineList.length === 0 && pendingList.length === 0 && disabledList.length === 0 && (
            <div className="px-4 py-10 text-center">
              <Puzzle className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-xs text-gray-400">无匹配组件</p>
            </div>
          )}
        </div>
      </div>

      {/* ═══ 右栏：详情 + 预览 ═══ */}
      {selected ? (
        <div className="flex-1 overflow-auto bg-gray-50">
          <div className="p-5 space-y-4">
            {/* 顶部信息 */}
            {editing ? (
              <div className="bg-white rounded-xl border border-orange-200 p-5 space-y-3">
                <span className="text-xs font-semibold text-orange-500">编辑组件</span>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">组件名称</label>
                  <input type="text" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-orange-400" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">描述</label>
                  <textarea value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    rows={3} className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-orange-400 resize-none" />
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button onClick={() => setEditing(false)} className="px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">取消</button>
                  <button onClick={() => { updateComp(selected.id, { name: editForm.name.trim() || selected.name, description: editForm.description.trim() || selected.description }); setEditing(false) }}
                    className="px-3 py-1.5 text-xs font-medium bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">保存</button>
                </div>
              </div>
            ) : (
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h1 className="text-lg font-semibold text-gray-900">{selected.name}</h1>
                    <span className={cn('text-xs px-2 py-0.5 rounded-md font-medium', CATEGORY_COLORS[selected.category])}>{CATEGORY_LABELS[selected.category]}</span>
                    <span className={cn('text-xs px-2 py-0.5 rounded-md font-medium', STATUS_COLORS[selected.status])}>{STATUS_LABELS[selected.status]}</span>
                  </div>
                  <p className="text-sm text-gray-500 max-w-xl">{selected.description}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                    <span className="flex items-center gap-1"><BarChart3 className="w-3 h-3" />使用 {selected.usageCount} 次</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />更新于 {selected.updatedAt}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => { setEditing(true); setEditForm({ name: selected.name, description: selected.description }) }}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
                    <Pencil className="w-3 h-3" />编辑</button>
                  <button onClick={() => { const newId = duplicateComp(selected.id); if (newId) handleSelect(newId) }}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
                    <Copy className="w-3 h-3" />复制</button>
                  <div className="relative">
                    <button onClick={() => setStatusOpen(!statusOpen)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
                      变更状态 <ChevronDown className="w-3 h-3" /></button>
                    {statusOpen && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setStatusOpen(false)} />
                        <div className="absolute right-0 mt-1 w-28 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                          {STATUS_FLOW.map((st) => (
                            <button key={st} onClick={() => handleStatusChange(st)} disabled={st === selected.status}
                              className={cn('w-full px-3 py-1.5 text-xs text-left', st === selected.status ? 'text-gray-300' : 'text-gray-700 hover:bg-gray-50')}>
                              <span className={cn('inline-block w-1.5 h-1.5 rounded-full mr-1.5', { 'bg-gray-400': st === 'draft', 'bg-blue-500': st === 'testing', 'bg-green-500': st === 'available' })} />
                              {STATUS_LABELS[st]}</button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                  {selected.status !== 'available' ? (
                    deleteConfirm ? (
                      <div className="flex gap-1">
                        <button onClick={handleDelete} className="px-2 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100">确认</button>
                        <button onClick={() => setDeleteConfirm(false)} className="px-2 py-1.5 text-xs text-gray-500 hover:bg-gray-100 rounded-lg">取消</button>
                      </div>
                    ) : (
                      <button onClick={() => setDeleteConfirm(true)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg" title="删除"><Trash2 className="w-4 h-4" /></button>
                    )
                  ) : (
                    <Trash2 className="w-4 h-4 text-gray-200" />
                  )}
                </div>
              </div>
            )}

            {/* 样式变体 + 预览 */}
            <VariantPreview
              variants={selected.variants}
              activeIdx={variantIdx}
              onSwitch={setVariantIdx}
              emoji={selected.previewEmoji}
              componentName={selected.name}
              onAddVariant={() => { openTab('/components/create?variant=' + selected.id, '添加变体 · ' + selected.name); navigate('/components/create?variant=' + selected.id) }}
            />

            {/* 详情 Tab */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="flex border-b border-gray-200">
                {DETAIL_TABS.map((tab) => (
                  <button key={tab.key} onClick={() => setDetailTab(tab.key)}
                    className={cn('flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors',
                      detailTab === tab.key ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700')}>
                    <tab.icon className="w-3.5 h-3.5" />{tab.label}
                  </button>
                ))}
              </div>
              <div className="p-5">
                {detailTab === 'schema' && <SchemaTable schema={selected.parameterSchema} />}
                {detailTab === 'signature' && <SignatureView signature={selected.aiSignature} />}
                {detailTab === 'usage' && <UsageView />}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <Puzzle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-400">选择一个组件查看详情</p>
          </div>
        </div>
      )}
    </div>
  )
}
