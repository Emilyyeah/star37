/* 素材分类 Store — 场景分类 + 业务场景，支持增删改，持久化 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface AssetCategory {
  id: string
  label: string
  enabled: boolean
}

/* ── 初始场景分类（原 SCENE_TABS） ── */
const INIT_SCENES: AssetCategory[] = [
  { id: 'banner',   label: 'Banner',  enabled: true },
  { id: 'popup',    label: '弹窗',    enabled: true },
  { id: 'splash',   label: '开屏',    enabled: true },
  { id: 'push',     label: '推送图',  enabled: true },
  { id: 'social',   label: '社媒配图', enabled: true },
  { id: 'activity', label: '活动UI',  enabled: true },
]

/* ── 初始业务场景 ── */
const INIT_CHANNELS: AssetCategory[] = [
  { id: 'mp',      label: '公众号',     enabled: true },
  { id: 'wecom',   label: '企微',        enabled: true },
  { id: 'miniapp', label: '小程序活动',  enabled: true },
  { id: 'forum',   label: '论坛',        enabled: true },
  { id: 'gamecircle', label: '游戏圈',   enabled: true },
]

interface AssetCategoryStore {
  scenes: AssetCategory[]
  channels: AssetCategory[]

  addScene: (item: AssetCategory) => void
  updateScene: (id: string, patch: Partial<AssetCategory>) => void
  removeScene: (id: string) => void

  addChannel: (item: AssetCategory) => void
  updateChannel: (id: string, patch: Partial<AssetCategory>) => void
  removeChannel: (id: string) => void
}

export const useAssetCategoryStore = create<AssetCategoryStore>()(
  persist(
    (set) => ({
      scenes: [...INIT_SCENES],
      channels: [...INIT_CHANNELS],

      addScene: (item) => set((s) => ({ scenes: [...s.scenes, item] })),
      updateScene: (id, patch) => set((s) => ({ scenes: s.scenes.map((c) => c.id === id ? { ...c, ...patch } : c) })),
      removeScene: (id) => set((s) => ({ scenes: s.scenes.filter((c) => c.id !== id) })),

      addChannel: (item) => set((s) => ({ channels: [...s.channels, item] })),
      updateChannel: (id, patch) => set((s) => ({ channels: s.channels.map((c) => c.id === id ? { ...c, ...patch } : c) })),
      removeChannel: (id) => set((s) => ({ channels: s.channels.filter((c) => c.id !== id) })),
    }),
    { name: 'asset-category-store' }
  )
)
