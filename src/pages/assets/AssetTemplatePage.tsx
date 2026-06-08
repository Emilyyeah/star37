/* 素材模板创建页
   Tab 1：场景模板 — 每个场景下管理多个尺寸规格
   Tab 2：游戏风格预设 — 每款游戏的 AI 生图风格描述 */

import { useState, useEffect } from 'react'
import { Layers, Plus, Pencil, Trash2, X, ChevronDown, ChevronRight } from 'lucide-react'
import { cn, showToast } from '@/lib/utils'
import { useTabStore } from '@/lib/tabStore'
import {
  useAssetCategoryStore,
  type SceneSizeSpec,
  type GameStylePreset,
} from '@/lib/assetCategoryStore'

/* ══════════════════════════════════════
   场景模板 Tab
══════════════════════════════════════ */
function SceneTemplatesTab() {
  const scenes = useAssetCategoryStore((s) => s.scenes)
  const sceneTemplates = useAssetCategoryStore((s) => s.sceneTemplates)
  const addSceneSize = useAssetCategoryStore((s) => s.addSceneSize)
  const updateSceneSize = useAssetCategoryStore((s) => s.updateSceneSize)
  const removeSceneSize = useAssetCategoryStore((s) => s.removeSceneSize)

  const [expanded, setExpanded] = useState<string[]>(scenes.filter((s) => s.enabled).map((s) => s.id))
  const [showForm, setShowForm] = useState<{ sceneId: string; size?: SceneSizeSpec } | null>(null)
  const [formName, setFormName] = useState('')
  const [formWidth, setFormWidth] = useState('')
  const [formHeight, setFormHeight] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<{ sceneId: string; sizeId: string } | null>(null)

  const toggleExpand = (id: string) =>
    setExpanded((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])

  const openCreate = (sceneId: string) => {
    setShowForm({ sceneId })
    setFormName(''); setFormWidth(''); setFormHeight('')
  }
  const openEdit = (sceneId: string, size: SceneSizeSpec) => {
    setShowForm({ sceneId, size })
    setFormName(size.name); setFormWidth(String(size.width)); setFormHeight(String(size.height))
  }

  const handleSave = () => {
    if (!formName.trim() || !formWidth || !formHeight) { showToast('请填写完整'); return }
    const w = parseInt(formWidth), h = parseInt(formHeight)
    if (isNaN(w) || isNaN(h) || w <= 0 || h <= 0) { showToast('尺寸必须为正整数'); return }

    if (showForm!.size) {
      updateSceneSize(showForm!.sceneId, showForm!.size.id, { name: formName.trim(), width: w, height: h })
      showToast('已更新')
    } else {
      addSceneSize(showForm!.sceneId, {
        id: `sz-${Date.now()}`, name: formName.trim(), width: w, height: h, enabled: true,
      })
      showToast('已添加')
    }
    setShowForm(null)
  }

  const handleDelete = (sceneId: string, sizeId: string) => {
    removeSceneSize(sceneId, sizeId)
    setDeleteTarget(null)
    showToast('已删除')
  }

  const enabledScenes = scenes.filter((s) => s.enabled)

  return (
    <div className="space-y-3">
      <p className="text-xs text-gray-400">
        在「设置 → 素材分类 → 场景分类」中新建场景，回到此处配置该场景的尺寸规格，AI 生图时可直接选用
      </p>

      {enabledScenes.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-sm text-gray-400">
          暂无场景，请先在设置里添加场景分类
        </div>
      )}

      {enabledScenes.map((scene) => {
        const tpl = sceneTemplates.find((t) => t.sceneId === scene.id)
        const sizes = tpl?.sizes ?? []
        const isOpen = expanded.includes(scene.id)

        return (
          <div key={scene.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {/* 场景头 */}
            <div
              className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => toggleExpand(scene.id)}
            >
              <div className="flex items-center gap-2.5">
                {isOpen
                  ? <ChevronDown className="w-4 h-4 text-gray-400" />
                  : <ChevronRight className="w-4 h-4 text-gray-400" />}
                <span className="text-sm font-semibold text-gray-800">{scene.label}</span>
                <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">
                  {sizes.length} 个尺寸
                </span>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); openCreate(scene.id) }}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-orange-500 hover:bg-orange-600 text-white text-xs font-medium rounded-lg transition-colors"
              >
                <Plus className="w-3 h-3" />新增尺寸
              </button>
            </div>

            {/* 尺寸列表 */}
            {isOpen && (
              <div className="border-t border-gray-100">
                {sizes.length === 0 ? (
                  <div className="px-6 py-6 text-center text-xs text-gray-400">
                    暂无尺寸规格，点击「新增尺寸」添加
                  </div>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="text-left px-6 py-2.5 text-xs font-medium text-gray-500">规格名称</th>
                        <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500">尺寸（px）</th>
                        <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500">状态</th>
                        <th className="px-4 py-2.5 w-[100px]" />
                      </tr>
                    </thead>
                    <tbody>
                      {sizes.map((size) => (
                        <tr key={size.id} className="border-t border-gray-50 hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-2.5 font-medium text-gray-800 text-sm">{size.name}</td>
                          <td className="px-4 py-2.5">
                            <span className="font-mono text-sm text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                              {size.width} × {size.height}
                            </span>
                          </td>
                          <td className="px-4 py-2.5">
                            <button
                              onClick={() => updateSceneSize(scene.id, size.id, { enabled: !size.enabled })}
                              className={cn('text-xs px-2 py-0.5 rounded-full font-medium transition-colors',
                                size.enabled ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                              )}
                            >
                              {size.enabled ? '启用' : '停用'}
                            </button>
                          </td>
                          <td className="px-4 py-2.5">
                            <div className="flex items-center gap-1 justify-end">
                              <button onClick={() => openEdit(scene.id, size)}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              {deleteTarget?.sizeId === size.id ? (
                                <div className="flex items-center gap-1">
                                  <button onClick={() => handleDelete(scene.id, size.id)}
                                    className="text-xs px-2 py-1 bg-red-500 text-white rounded-lg">确认</button>
                                  <button onClick={() => setDeleteTarget(null)}
                                    className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-lg">取消</button>
                                </div>
                              ) : (
                                <button onClick={() => setDeleteTarget({ sceneId: scene.id, sizeId: size.id })}
                                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>
        )
      })}

      {/* 新增/编辑弹窗 */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(null)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold text-gray-900">
                {showForm.size ? '编辑尺寸规格' : '新增尺寸规格'}
              </h2>
              <button onClick={() => setShowForm(null)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">规格名称 <span className="text-red-500">*</span></label>
                <input autoFocus value={formName} onChange={(e) => setFormName(e.target.value)}
                  placeholder="如：活动大横幅" className="field-input" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">宽度（px） <span className="text-red-500">*</span></label>
                  <input type="number" value={formWidth} onChange={(e) => setFormWidth(e.target.value)}
                    placeholder="如：750" className="field-input font-mono" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">高度（px） <span className="text-red-500">*</span></label>
                  <input type="number" value={formHeight} onChange={(e) => setFormHeight(e.target.value)}
                    placeholder="如：400" className="field-input font-mono"
                    onKeyDown={(e) => e.key === 'Enter' && handleSave()} />
                </div>
              </div>
              {formWidth && formHeight && !isNaN(+formWidth) && !isNaN(+formHeight) && (
                <p className="text-xs text-gray-400">
                  预览尺寸：<span className="font-mono text-gray-600">{formWidth} × {formHeight} px</span>
                </p>
              )}
            </div>
            <div className="flex gap-2.5 mt-6">
              <button onClick={() => setShowForm(null)}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">
                取消
              </button>
              <button onClick={handleSave} disabled={!formName.trim() || !formWidth || !formHeight}
                className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-40 text-white rounded-xl text-sm font-semibold transition-colors">
                {showForm.size ? '保存修改' : '添加规格'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ══════════════════════════════════════
   游戏风格预设 Tab
══════════════════════════════════════ */
function GameStylesTab() {
  const gameStyles = useAssetCategoryStore((s) => s.gameStyles)
  const updateGameStyle = useAssetCategoryStore((s) => s.updateGameStyle)

  const [editing, setEditing] = useState<GameStylePreset | null>(null)
  const [formStyleName, setFormStyleName] = useState('')
  const [formPrompt, setFormPrompt] = useState('')

  const openEdit = (style: GameStylePreset) => {
    setEditing(style)
    setFormStyleName(style.styleName)
    setFormPrompt(style.prompt)
  }

  const handleSave = () => {
    if (!editing) return
    updateGameStyle(editing.id, { styleName: formStyleName.trim(), prompt: formPrompt.trim() })
    showToast('已保存')
    setEditing(null)
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-gray-400">
        每款游戏的 AI 生图风格描述，AI 生图时选择游戏风格后自动带入对应 Prompt
      </p>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">游戏</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">风格名称</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">风格描述（Prompt）</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">状态</th>
              <th className="px-4 py-3 w-[60px]" />
            </tr>
          </thead>
          <tbody>
            {gameStyles.map((style) => (
              <tr key={style.id} className="border-b border-gray-50 last:border-none hover:bg-gray-50/50 transition-colors">
                <td className="px-4 py-3 font-medium text-gray-800 whitespace-nowrap">{style.label}</td>
                <td className="px-4 py-3 text-gray-600 text-xs whitespace-nowrap">{style.styleName}</td>
                <td className="px-4 py-3 text-xs text-gray-400 max-w-[280px]">
                  <span className="truncate block">{style.prompt}</span>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => updateGameStyle(style.id, { enabled: !style.enabled })}
                    className={cn('text-xs px-2 py-0.5 rounded-full font-medium transition-colors',
                      style.enabled ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    )}
                  >
                    {style.enabled ? '启用' : '停用'}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => openEdit(style)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 编辑弹窗 */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setEditing(null)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold text-gray-900">编辑风格预设 · {editing.label}</h2>
              <button onClick={() => setEditing(null)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">风格名称</label>
                <input value={formStyleName} onChange={(e) => setFormStyleName(e.target.value)}
                  className="field-input" placeholder="如：斗罗3D · 热血玄幻" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  风格描述（Prompt）
                  <span className="text-gray-400 font-normal ml-1">— AI 生图时自动带入</span>
                </label>
                <textarea value={formPrompt} onChange={(e) => setFormPrompt(e.target.value)}
                  rows={5} className="field-input resize-none"
                  placeholder="描述这款游戏的美术风格特征，如色调、元素、氛围等" />
              </div>
            </div>
            <div className="flex gap-2.5 mt-6">
              <button onClick={() => setEditing(null)}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">
                取消
              </button>
              <button onClick={handleSave} disabled={!formStyleName.trim() || !formPrompt.trim()}
                className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-40 text-white rounded-xl text-sm font-semibold transition-colors">
                保存修改
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
export default function AssetTemplatePage() {
  const openTab = useTabStore((s) => s.openTab)
  useEffect(() => { openTab('/assets/templates', '模板创建') }, [openTab])

  const [tab, setTab] = useState<'scene' | 'style'>('scene')

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* 顶部 */}
      <div className="shrink-0 px-6 pt-5 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <Layers className="w-5 h-5 text-gray-400" />
          <h1 className="text-lg font-semibold text-gray-900">模板创建</h1>
        </div>
        {/* 子 Tab */}
        <div className="flex gap-1 bg-gray-100 rounded-lg p-0.5 w-fit">
          <button
            onClick={() => setTab('scene')}
            className={cn('px-4 py-1.5 text-xs font-medium rounded-md transition-colors',
              tab === 'scene' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700')}
          >
            场景模板
          </button>
          <button
            onClick={() => setTab('style')}
            className={cn('px-4 py-1.5 text-xs font-medium rounded-md transition-colors',
              tab === 'style' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700')}
          >
            游戏风格预设
          </button>
        </div>
      </div>

      {/* 内容区 */}
      <div className="flex-1 overflow-auto px-6 py-4">
        {tab === 'scene' ? <SceneTemplatesTab /> : <GameStylesTab />}
      </div>
    </div>
  )
}
