/* 美术素材库 — 素材列表页
   第一级：游戏 Tab（按用户权限）
   第二级：场景分类（Banner/弹窗/开屏/…）
   第三级：业务场景（公众号/企微/小程序活动/论坛/游戏圈） */

import { useState, useMemo, useEffect } from 'react'
import { Search, Upload, Image, Download, Eye, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { cn, showToast } from '@/lib/utils'
import { useTabStore } from '@/lib/tabStore'
import { useAuthStore, ALL_GAMES } from '@/lib/authStore'
import { useAssetCategoryStore } from '@/lib/assetCategoryStore'

/* ── 游戏项目（全量，渲染时按权限过滤） ── */
const GAME_TABS = [
  { key: 'all', label: '全部游戏' },
  ...ALL_GAMES.map((g) => ({ key: g.key, label: g.label })),
]

/* ── 类型 ── */
interface AssetItem {
  id: string
  name: string
  scene: string        // 场景分类 id
  sceneName: string
  channel: string      // 业务场景 id
  channelName: string
  gameProject: string
  gameName: string
  width: number
  height: number
  fileSize: string
  creator: string
  createdAt: string
  tags: string[]
  color: string
}

/* ── Mock 数据（补充 channel 字段） ── */
const MOCK_ASSETS: AssetItem[] = [
  { id: 'ast-001', name: '618大促主KV', scene: 'banner', sceneName: 'Banner', channel: 'miniapp', channelName: '小程序活动', gameProject: 'dl3d', gameName: '斗罗3D', width: 750, height: 400, fileSize: '328KB', creator: '设计师A', createdAt: '2026-06-01', tags: ['618', '大促', '夏日'], color: 'bg-blue-100' },
  { id: 'ast-002', name: '签到活动弹窗', scene: 'popup', sceneName: '弹窗', channel: 'miniapp', channelName: '小程序活动', gameProject: 'dl3d', gameName: '斗罗3D', width: 600, height: 800, fileSize: '156KB', creator: '设计师B', createdAt: '2026-05-28', tags: ['签到', '弹窗'], color: 'bg-orange-100' },
  { id: 'ast-003', name: '新版本开屏图', scene: 'splash', sceneName: '开屏', channel: 'miniapp', channelName: '小程序活动', gameProject: 'dlmmo', gameName: '斗罗MMO', width: 1080, height: 1920, fileSize: '512KB', creator: '设计师A', createdAt: '2026-05-25', tags: ['开屏', '新版本'], color: 'bg-purple-100' },
  { id: 'ast-004', name: '周年庆推送图', scene: 'push', sceneName: '推送图', channel: 'wecom', channelName: '企微', gameProject: 'xxyg', gameName: '小小蚁国', width: 400, height: 300, fileSize: '89KB', creator: '设计师C', createdAt: '2026-05-20', tags: ['推送', '周年庆'], color: 'bg-green-100' },
  { id: 'ast-005', name: '抖音短视频封面', scene: 'social', sceneName: '社媒配图', channel: 'gamecircle', channelName: '游戏圈', gameProject: 'frxxt', gameName: '凡人修仙传', width: 1080, height: 1080, fileSize: '245KB', creator: '设计师B', createdAt: '2026-05-18', tags: ['抖音', '社媒'], color: 'bg-pink-100' },
  { id: 'ast-006', name: '端午活动Banner', scene: 'banner', sceneName: 'Banner', channel: 'mp', channelName: '公众号', gameProject: 'dlmmo', gameName: '斗罗MMO', width: 750, height: 400, fileSize: '298KB', creator: '设计师A', createdAt: '2026-05-15', tags: ['端午', 'Banner'], color: 'bg-cyan-100' },
  { id: 'ast-007', name: '暑期活动UI主图', scene: 'activity', sceneName: '活动UI', channel: 'miniapp', channelName: '小程序活动', gameProject: 'sc33', gameName: '生存33天', width: 750, height: 1334, fileSize: '478KB', creator: '设计师C', createdAt: '2026-06-02', tags: ['暑期', '活动'], color: 'bg-yellow-100' },
  { id: 'ast-008', name: '邀请好友分享图', scene: 'social', sceneName: '社媒配图', channel: 'forum', channelName: '论坛', gameProject: 'zmsl', gameName: '织梦森林', width: 800, height: 600, fileSize: '167KB', creator: '设计师B', createdAt: '2026-05-10', tags: ['分享', '邀请'], color: 'bg-red-100' },
  { id: 'ast-009', name: '抽奖活动弹窗', scene: 'popup', sceneName: '弹窗', channel: 'miniapp', channelName: '小程序活动', gameProject: 'dl3d', gameName: '斗罗3D', width: 600, height: 800, fileSize: '201KB', creator: '设计师A', createdAt: '2026-06-03', tags: ['抽奖', '弹窗'], color: 'bg-indigo-100' },
  { id: 'ast-010', name: '公众号活动头图', scene: 'banner', sceneName: 'Banner', channel: 'mp', channelName: '公众号', gameProject: 'dl3d', gameName: '斗罗3D', width: 900, height: 383, fileSize: '210KB', creator: '设计师A', createdAt: '2026-06-04', tags: ['公众号', '头图'], color: 'bg-emerald-100' },
  { id: 'ast-011', name: '企微消息配图', scene: 'push', sceneName: '推送图', channel: 'wecom', channelName: '企微', gameProject: 'dlmmo', gameName: '斗罗MMO', width: 500, height: 300, fileSize: '98KB', creator: '设计师B', createdAt: '2026-06-04', tags: ['企微', '推送'], color: 'bg-violet-100' },
  { id: 'ast-012', name: '游戏圈宣传图', scene: 'social', sceneName: '社媒配图', channel: 'gamecircle', channelName: '游戏圈', gameProject: 'frxxt', gameName: '凡人修仙传', width: 1080, height: 720, fileSize: '312KB', creator: '设计师C', createdAt: '2026-06-05', tags: ['游戏圈', '宣传'], color: 'bg-rose-100' },
]

const PAGE_SIZE = 12

/* ── 素材卡片 ── */
function AssetCard({ asset, onPreview }: { asset: AssetItem; onPreview: (a: AssetItem) => void }) {
  return (
    <div className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
      <div className={cn('aspect-[4/3] flex items-center justify-center relative', asset.color)}>
        <Image className="w-8 h-8 text-gray-300" />
        <div className="absolute bottom-2 right-2 bg-black/50 text-white text-[10px] px-1.5 py-0.5 rounded font-mono">
          {asset.width}×{asset.height}
        </div>
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
          <button onClick={() => onPreview(asset)} className="w-8 h-8 rounded-lg bg-white/90 flex items-center justify-center text-gray-700 hover:bg-white transition-colors">
            <Eye className="w-4 h-4" />
          </button>
          <button onClick={() => showToast('已下载')} className="w-8 h-8 rounded-lg bg-white/90 flex items-center justify-center text-gray-700 hover:bg-white transition-colors">
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="px-3 py-2.5">
        <p className="text-sm font-medium text-gray-800 truncate">{asset.name}</p>
        <div className="flex items-center justify-between mt-1.5">
          <span className="text-xs text-gray-400">{asset.gameName}</span>
          <div className="flex items-center gap-1">
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 font-medium">{asset.sceneName}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-500 font-medium">{asset.channelName}</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 mt-2 flex-wrap">
          {asset.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded-full bg-orange-50 text-orange-500 font-medium">{tag}</span>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ── 筛选行组件（可横向滚动） ── */
function FilterBar<T extends { id?: string; key?: string; label: string }>({
  items, value, onChange, allLabel = '全部',
}: {
  items: T[]
  value: string
  onChange: (v: string) => void
  allLabel?: string
}) {
  const getId = (item: T) => (item.id ?? item.key ?? '')
  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => onChange('all')}
        className={cn('px-2.5 py-1 rounded text-xs font-medium whitespace-nowrap transition-colors',
          value === 'all' ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-100')}
      >
        {allLabel}
      </button>
      {items.filter((i) => (i as any).enabled !== false).map((item) => (
        <button
          key={getId(item)}
          onClick={() => onChange(getId(item))}
          className={cn('px-2.5 py-1 rounded text-xs font-medium whitespace-nowrap transition-colors',
            value === getId(item) ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-100')}
        >
          {item.label}
        </button>
      ))}
    </div>
  )
}

/* ── 页面 ── */
export default function AssetLibraryPage() {
  const openTab = useTabStore((s) => s.openTab)
  const viewableGameKeys = useAuthStore((s) => s.viewableGameKeys)
  const scenes = useAssetCategoryStore((s) => s.scenes)
  const channels = useAssetCategoryStore((s) => s.channels)

  useEffect(() => { openTab('/assets', '素材库') }, [openTab])

  const viewable = viewableGameKeys()
  const [gameTab, setGameTab] = useState('all')
  const [sceneFilter, setSceneFilter] = useState('all')
  const [channelFilter, setChannelFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [previewAsset, setPreviewAsset] = useState<AssetItem | null>(null)

  const filtered = useMemo(() => {
    let list = MOCK_ASSETS.filter((a) => viewable.includes(a.gameProject))
    if (gameTab !== 'all') list = list.filter((a) => a.gameProject === gameTab)
    if (sceneFilter !== 'all') list = list.filter((a) => a.scene === sceneFilter)
    if (channelFilter !== 'all') list = list.filter((a) => a.channel === channelFilter)
    if (search.trim()) {
      const kw = search.trim().toLowerCase()
      list = list.filter((a) => a.name.toLowerCase().includes(kw) || a.tags.some((t) => t.toLowerCase().includes(kw)))
    }
    return list
  }, [gameTab, sceneFilter, channelFilter, search, viewable])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paged = useMemo(() => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [filtered, page])

  useEffect(() => { setPage(1) }, [gameTab, sceneFilter, channelFilter, search])

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* ── 顶部栏 ── */}
      <div className="shrink-0 px-6 pt-5 pb-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Image className="w-5 h-5 text-gray-400" />
            <h1 className="text-lg font-semibold text-gray-900">素材库</h1>
            <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium">{filtered.length} 个素材</span>
          </div>
          <button
            onClick={() => showToast('上传功能即将上线')}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors"
          >
            <Upload className="w-4 h-4" />上传素材
          </button>
        </div>

        {/* 第一级：游戏 Tab */}
        <div className="flex items-center gap-1 border-b border-gray-200 -mx-6 px-6">
          {GAME_TABS.filter((t) => t.key === 'all' || viewable.includes(t.key)).map((tab) => (
            <button key={tab.key} onClick={() => { setGameTab(tab.key); setSceneFilter('all'); setChannelFilter('all') }}
              className={cn('px-3 py-2 text-xs font-medium border-b-2 transition-colors -mb-px whitespace-nowrap',
                gameTab === tab.key ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700')}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── 筛选栏（第二+第三级 + 搜索） ── */}
      <div className="shrink-0 px-6 py-2.5 space-y-2 border-b border-gray-100">
        {/* 第二级：场景分类 */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[10px] text-gray-400 font-medium mr-1">场景</span>
            <FilterBar items={scenes} value={sceneFilter} onChange={setSceneFilter} />
          </div>
          {/* 搜索框 */}
          <div className="relative w-48 shrink-0">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="搜索名称或标签..."
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-orange-400" />
          </div>
        </div>

        {/* 第三级：业务场景 */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-gray-400 font-medium mr-1">渠道</span>
          <FilterBar items={channels} value={channelFilter} onChange={setChannelFilter} allLabel="全渠道" />
        </div>
      </div>

      {/* ── 素材网格 ── */}
      <div className="flex-1 overflow-auto px-6 py-4">
        {paged.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
            {paged.map((asset) => (
              <AssetCard key={asset.id} asset={asset} onPreview={setPreviewAsset} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <Image className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">无匹配素材</p>
          </div>
        )}
      </div>

      {/* ── 底部分页 ── */}
      <div className="shrink-0 px-6 py-3 flex items-center justify-between border-t border-gray-100">
        <span className="text-xs text-gray-500">共 {filtered.length} 个素材</span>
        <div className="flex items-center gap-1">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}
            className={cn('p-1.5 rounded-md transition-colors', page <= 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-100')}>
            <ChevronLeft className="w-4 h-4" />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button key={p} onClick={() => setPage(p)}
              className={cn('w-7 h-7 rounded-md text-xs font-medium transition-colors',
                page === p ? 'bg-orange-500 text-white' : 'text-gray-600 hover:bg-gray-100')}>
              {p}
            </button>
          ))}
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
            className={cn('p-1.5 rounded-md transition-colors', page >= totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-100')}>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── 预览弹窗 ── */}
      {previewAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setPreviewAsset(null)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-[520px] overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900">{previewAsset.name}</h3>
              <button onClick={() => setPreviewAsset(null)} className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"><X className="w-4 h-4" /></button>
            </div>
            <div className={cn('aspect-[4/3] flex items-center justify-center', previewAsset.color)}>
              <Image className="w-16 h-16 text-gray-300" />
            </div>
            <div className="px-5 py-4 space-y-2">
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span>尺寸：{previewAsset.width}×{previewAsset.height}</span>
                <span>大小：{previewAsset.fileSize}</span>
                <span>创建人：{previewAsset.creator}</span>
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span>所属游戏：{previewAsset.gameName}</span>
                <span>场景：{previewAsset.sceneName}</span>
                <span>渠道：{previewAsset.channelName}</span>
                <span>上传时间：{previewAsset.createdAt}</span>
              </div>
              <div className="flex items-center gap-1.5 pt-1">
                {previewAsset.tags.map((tag) => (
                  <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded-full bg-orange-50 text-orange-500 font-medium">{tag}</span>
                ))}
              </div>
            </div>
            <div className="border-t border-gray-100 px-5 py-3.5 flex justify-end gap-2.5">
              <button onClick={() => setPreviewAsset(null)} className="px-4 py-1.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">关闭</button>
              <button onClick={() => { showToast('已下载'); setPreviewAsset(null) }} className="px-4 py-1.5 text-sm font-medium bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">下载原图</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
