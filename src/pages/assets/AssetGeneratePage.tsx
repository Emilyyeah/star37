/* AI 生图 — 文生图 + 风格预设
   左栏：生图配置 | 右栏：结果预览网格 */

import { useState, useEffect, useMemo } from 'react'
import { ImagePlus, Sparkles, Image, Download, Loader2, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTabStore } from '@/lib/tabStore'
import { showToast } from '@/lib/utils'
import { useAssetCategoryStore } from '@/lib/assetCategoryStore'
import { useNavigate } from 'react-router-dom'

/* ── Mock 生成结果 ── */
interface GeneratedImage {
  id: string
  prompt: string
  style: string
  scene: string
  color: string
}

const PLACEHOLDER_COLORS = [
  'bg-blue-100', 'bg-purple-100', 'bg-orange-100', 'bg-green-100',
  'bg-pink-100', 'bg-cyan-100', 'bg-indigo-100', 'bg-yellow-100',
]

export default function AssetGeneratePage() {
  const openTab = useTabStore((s) => s.openTab)
  const navigate = useNavigate()
  useEffect(() => { openTab('/assets/generate', 'AI 生图') }, [openTab])

  /* 从 store 读取原始数据，在组件内派生，避免选择器每次返回新数组引用 */
  const gameStyles = useAssetCategoryStore((s) => s.gameStyles)
  const enabledStyles = useMemo(() => gameStyles.filter((g) => g.enabled), [gameStyles])

  const scenes = useAssetCategoryStore((s) => s.scenes)
  const enabledScenes = useMemo(() => scenes.filter((sc) => sc.enabled), [scenes])

  const sceneTemplates = useAssetCategoryStore((s) => s.sceneTemplates)

  /* 选中场景后，列出该场景下的尺寸规格 */
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null)
  const [selectedScene, setSelectedScene] = useState<string | null>(null)   // sceneId
  const [selectedSize, setSelectedSize] = useState<string | null>(null)     // sizeId

  const sizesForScene = useMemo(() => {
    if (!selectedScene) return []
    return sceneTemplates.find((t) => t.sceneId === selectedScene)?.sizes.filter((s) => s.enabled) ?? []
  }, [selectedScene, sceneTemplates])

  // 切换场景时重置尺寸选择
  useEffect(() => { setSelectedSize(null) }, [selectedScene])
  const [prompt, setPrompt] = useState('')
  const [generating, setGenerating] = useState(false)
  const [results, setResults] = useState<GeneratedImage[]>([])
  const [count, setCount] = useState(4)

  const handleGenerate = () => {
    if (!prompt.trim()) { showToast('请输入画面描述'); return }
    if (!selectedStyle) { showToast('请选择游戏风格'); return }
    if (!selectedScene) { showToast('请选择场景模板'); return }

    setGenerating(true)
    setTimeout(() => {
      const sizeName = sizesForScene.find((sz) => sz.id === selectedSize)
      const newResults: GeneratedImage[] = Array.from({ length: count }, (_, i) => ({
        id: `gen-${Date.now()}-${i}`,
        prompt: prompt.trim(),
        style: selectedStyle,
        scene: selectedScene,
        color: PLACEHOLDER_COLORS[(results.length + i) % PLACEHOLDER_COLORS.length],
      }))
      setResults((prev) => [...newResults, ...prev])
      setGenerating(false)
      showToast(`已生成 ${count} 张图片${sizeName ? `（${sizeName.width}×${sizeName.height}）` : ''}`)
    }, 2000)
  }

  return (
    <div className="flex h-full overflow-hidden">
      {/* ═══ 左栏：配置面板 ═══ */}
      <div className="w-[340px] xl:w-[380px] border-r border-gray-200 bg-white flex flex-col shrink-0 overflow-y-auto">
        <div className="px-4 pt-5 pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2 mb-1">
            <ImagePlus className="w-5 h-5 text-gray-400" />
            <h1 className="text-lg font-semibold text-gray-900">AI 生图</h1>
          </div>
          <p className="text-xs text-gray-400">描述画面 + 选择风格 + 选择场景，AI 一键出图</p>
        </div>

        <div className="p-4 space-y-5 flex-1">
          {/* 画面描述 */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">画面描述 <span className="text-red-500">*</span></label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="例如：618大促活动Banner，斗罗大陆角色唐三居中，背景是星空特效，标题'热血618'，氛围热烈"
              rows={4}
              className="field-input resize-none"
            />
          </div>

          {/* 游戏风格 */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-medium text-gray-700">游戏风格预设 <span className="text-red-500">*</span></label>
              <button onClick={() => { navigate('/assets/templates'); openTab('/assets/templates', '模板创建') }}
                className="inline-flex items-center gap-1 text-[10px] text-orange-500 hover:text-orange-600 font-medium">
                <Settings className="w-3 h-3" />管理风格
              </button>
            </div>
            {enabledStyles.length === 0 ? (
              <div className="border border-dashed border-gray-200 rounded-xl p-4 text-center text-xs text-gray-400">
                暂无风格预设，<button onClick={() => navigate('/assets/templates')} className="text-orange-500 underline">去添加</button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {enabledStyles.map((s) => (
                  <button key={s.id} onClick={() => setSelectedStyle(s.id)}
                    className={cn('text-left px-3 py-2.5 rounded-xl border transition-colors',
                      selectedStyle === s.id
                        ? 'border-orange-400 bg-orange-50 text-orange-600'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                    )}
                  >
                    <p className="text-xs font-medium">{s.label}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5 truncate">{s.styleName.split('·')[1]?.trim() ?? s.styleName}</p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 场景模板 */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-medium text-gray-700">场景模板 <span className="text-red-500">*</span></label>
              <button onClick={() => { navigate('/assets/templates'); openTab('/assets/templates', '模板创建') }}
                className="inline-flex items-center gap-1 text-[10px] text-orange-500 hover:text-orange-600 font-medium">
                <Settings className="w-3 h-3" />管理场景
              </button>
            </div>
            {scenes.length === 0 ? (
              <div className="border border-dashed border-gray-200 rounded-xl p-4 text-center text-xs text-gray-400">
                暂无场景，<button onClick={() => navigate('/settings')} className="text-orange-500 underline">去设置添加</button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {enabledScenes.map((sc) => (
                  <button key={sc.id} onClick={() => setSelectedScene(sc.id)}
                    className={cn('text-left px-3 py-2.5 rounded-xl border transition-colors',
                      selectedScene === sc.id
                        ? 'border-orange-400 bg-orange-50 text-orange-600'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                    )}
                  >
                    <p className="text-xs font-medium">{sc.label}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      {sceneTemplates.find((t) => t.sceneId === sc.id)?.sizes.filter((s) => s.enabled).length ?? 0} 个尺寸
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 尺寸规格（选择场景后显示） */}
          {selectedScene && sizesForScene.length > 0 && (
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">尺寸规格</label>
              <div className="grid grid-cols-2 gap-2">
                {sizesForScene.map((sz) => (
                  <button key={sz.id} onClick={() => setSelectedSize(sz.id)}
                    className={cn('text-left px-3 py-2.5 rounded-xl border transition-colors',
                      selectedSize === sz.id
                        ? 'border-orange-400 bg-orange-50 text-orange-600'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                    )}
                  >
                    <p className="text-xs font-medium">{sz.name}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5 font-mono">{sz.width}×{sz.height}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 生成数量 */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">生成数量</label>
            <div className="flex items-center gap-2">
              {[1, 2, 4].map((n) => (
                <button
                  key={n}
                  onClick={() => setCount(n)}
                  className={cn(
                    'flex-1 py-2 text-sm rounded-xl border transition-colors',
                    count === n
                      ? 'border-orange-400 bg-orange-50 text-orange-600 font-medium'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  )}
                >
                  {n} 张
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 底部生成按钮 */}
        <div className="border-t border-gray-100 px-4 py-4 shrink-0">
          <button
            onClick={handleGenerate}
            disabled={generating}
            className={cn(
              'w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-colors',
              generating
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-orange-500 text-white hover:bg-orange-600'
            )}
          >
            {generating ? (
              <><Loader2 className="w-4 h-4 animate-spin" />生成中...</>
            ) : (
              <><Sparkles className="w-4 h-4" />开始生成</>
            )}
          </button>
        </div>
      </div>

      {/* ═══ 右栏：生成结果 ═══ */}
      <div className="flex-1 overflow-auto bg-gray-50 p-5">
        {results.length > 0 ? (
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-gray-700">生成结果 <span className="text-xs text-gray-400 ml-1">共 {results.length} 张</span></p>
            </div>
            <div className="grid grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
              {results.map((img) => (
                <div key={img.id} className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200">
                  <div className={cn('aspect-[4/3] flex items-center justify-center relative', img.color)}>
                    <Image className="w-8 h-8 text-gray-300" />
                    {/* hover 操作 */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                      <button onClick={() => showToast('已下载')} className="w-8 h-8 rounded-lg bg-white/90 flex items-center justify-center text-gray-700 hover:bg-white transition-colors">
                        <Download className="w-4 h-4" />
                      </button>
                      <button onClick={() => showToast('已保存到素材库')} className="w-8 h-8 rounded-lg bg-white/90 flex items-center justify-center text-gray-700 hover:bg-white transition-colors">
                        <ImagePlus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="px-3 py-2">
                    <p className="text-xs text-gray-500 truncate">{img.prompt}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-purple-50 text-purple-500 font-medium">
                        {enabledStyles.find((s) => s.id === img.style)?.label ?? img.style}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-500 font-medium">
                        {enabledScenes.find((sc) => sc.id === img.scene)?.label ?? img.scene}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center">
              <ImagePlus className="w-8 h-8 text-gray-300" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">描述画面，AI 帮你出图</p>
              <p className="text-xs text-gray-400 mt-1">在左侧填写描述、选择风格和场景，点击生成</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
