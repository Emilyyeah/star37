/* 素材分类 Store — 场景分类 + 业务渠道 + 场景模板尺寸 + 游戏风格预设，支持增删改，持久化 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface AssetCategory {
  id: string
  label: string
  enabled: boolean
}

/* ── 场景模板尺寸 ── */
export interface SceneSizeSpec {
  id: string
  name: string    // 如「Banner 标准横版」
  width: number
  height: number
  enabled: boolean
}

/* ── 场景模板（每个场景含多个尺寸规格） ── */
export interface SceneTemplate {
  sceneId: string   // 关联 scenes 里的 id
  sizes: SceneSizeSpec[]
}

/* ── 游戏风格预设 ── */
export interface GameStylePreset {
  id: string
  gameKey: string   // 对应 authStore 里 ALL_GAMES 的 key
  label: string     // 游戏名
  styleName: string // 风格名称，如「斗罗3D · 热血玄幻」
  prompt: string    // 风格 prompt 描述
  enabled: boolean
}

/* ── 初始场景分类 ── */
const INIT_SCENES: AssetCategory[] = [
  { id: 'banner',   label: 'Banner',   enabled: true },
  { id: 'popup',    label: '弹窗',     enabled: true },
  { id: 'splash',   label: '开屏',     enabled: true },
  { id: 'push',     label: '推送图',   enabled: true },
  { id: 'social',   label: '社媒配图', enabled: true },
  { id: 'activity', label: '活动UI',   enabled: true },
]

/* ── 初始业务渠道 ── */
const INIT_CHANNELS: AssetCategory[] = [
  { id: 'mp',          label: '公众号',    enabled: true },
  { id: 'wecom',       label: '企微',      enabled: true },
  { id: 'miniapp',     label: '小程序活动', enabled: true },
  { id: 'forum',       label: '论坛',      enabled: true },
  { id: 'gamecircle',  label: '游戏圈',    enabled: true },
]

/* ── 初始场景模板尺寸 ── */
const INIT_SCENE_TEMPLATES: SceneTemplate[] = [
  {
    sceneId: 'banner',
    sizes: [
      { id: 'banner-750x400', name: '活动大横幅', width: 750, height: 400, enabled: true },
      { id: 'banner-1125x375', name: '活动宽屏', width: 1125, height: 375, enabled: true },
      { id: 'banner-900x383', name: '公众号封面', width: 900, height: 383, enabled: true },
    ],
  },
  {
    sceneId: 'popup',
    sizes: [
      { id: 'popup-600x800', name: '标准弹窗', width: 600, height: 800, enabled: true },
      { id: 'popup-690x920', name: '大弹窗', width: 690, height: 920, enabled: true },
    ],
  },
  {
    sceneId: 'splash',
    sizes: [
      { id: 'splash-1080x1920', name: '全屏开屏', width: 1080, height: 1920, enabled: true },
      { id: 'splash-1242x2208', name: 'Pro 开屏', width: 1242, height: 2208, enabled: true },
    ],
  },
  {
    sceneId: 'push',
    sizes: [
      { id: 'push-400x300', name: '标准推送图', width: 400, height: 300, enabled: true },
      { id: 'push-500x400', name: '大推送图', width: 500, height: 400, enabled: true },
    ],
  },
  {
    sceneId: 'social',
    sizes: [
      { id: 'social-1080x1080', name: '方图（抖音/微博）', width: 1080, height: 1080, enabled: true },
      { id: 'social-1200x630', name: '横图（分享卡片）', width: 1200, height: 630, enabled: true },
      { id: 'social-1080x1920', name: '竖图（故事）', width: 1080, height: 1920, enabled: true },
    ],
  },
  {
    sceneId: 'activity',
    sizes: [
      { id: 'activity-750x1334', name: '活动全页', width: 750, height: 1334, enabled: true },
      { id: 'activity-750x500', name: '活动主区', width: 750, height: 500, enabled: true },
    ],
  },
]

/* ── 初始游戏风格预设 ── */
const INIT_GAME_STYLES: GameStylePreset[] = [
  {
    id: 'style-dl3d', gameKey: 'dl3d', label: '斗罗3D',
    styleName: '斗罗3D · 热血玄幻',
    prompt: '斗罗大陆3D风格，热血战斗，玄幻奇幻，深色背景，高对比度，充满力量感，角色为武魂使者，金属质感武器与特效',
    enabled: true,
  },
  {
    id: 'style-dlmmo', gameKey: 'dlmmo', label: '斗罗MMO',
    styleName: '斗罗MMO · 史诗国风',
    prompt: '斗罗大陆MMO风格，国风史诗，写实风格，宏大场景，古典中国元素，仙侠气息，精致细腻的服饰与建筑',
    enabled: true,
  },
  {
    id: 'style-frxxt', gameKey: 'frxxt', label: '凡人修仙传',
    styleName: '凡人修仙传 · 水墨仙侠',
    prompt: '凡人修仙传风格，水墨淡彩，古风仙侠，飘逸洒脱，灵气缭绕，山水意境，修仙法器与法宝特效',
    enabled: true,
  },
  {
    id: 'style-sc33', gameKey: 'sc33', label: '生存33天',
    styleName: '生存33天 · 末日废土',
    prompt: '生存33天风格，末日废土，写实风格，暗色调，高对比度，工业破败感，废墟场景，求生装备与武器',
    enabled: true,
  },
  {
    id: 'style-zmsl', gameKey: 'zmsl', label: '织梦森林',
    styleName: '织梦森林 · 清新梦幻',
    prompt: '织梦森林风格，清新治愈，梦幻森林，温暖色调，卡通可爱，精灵与自然元素，柔和光影效果',
    enabled: true,
  },
  {
    id: 'style-xxyg', gameKey: 'xxyg', label: '小小蚁国',
    styleName: '小小蚁国 · Q版策略',
    prompt: '小小蚁国风格，Q版卡通，微观世界，策略游戏风，色彩鲜艳，蚂蚁王国元素，俯视建筑与兵种',
    enabled: true,
  },
]

interface AssetCategoryStore {
  scenes: AssetCategory[]
  channels: AssetCategory[]
  sceneTemplates: SceneTemplate[]
  gameStyles: GameStylePreset[]

  /* 场景分类 */
  addScene: (item: AssetCategory) => void
  updateScene: (id: string, patch: Partial<AssetCategory>) => void
  removeScene: (id: string) => void

  /* 业务渠道 */
  addChannel: (item: AssetCategory) => void
  updateChannel: (id: string, patch: Partial<AssetCategory>) => void
  removeChannel: (id: string) => void

  /* 场景模板尺寸 */
  addSceneSize: (sceneId: string, size: SceneSizeSpec) => void
  updateSceneSize: (sceneId: string, sizeId: string, patch: Partial<SceneSizeSpec>) => void
  removeSceneSize: (sceneId: string, sizeId: string) => void

  /* 游戏风格预设 */
  updateGameStyle: (id: string, patch: Partial<GameStylePreset>) => void
  addGameStyle: (style: GameStylePreset) => void

  /* 便捷查询 */
  getSizesForScene: (sceneId: string) => SceneSizeSpec[]
  getEnabledStyles: () => GameStylePreset[]
}

export const useAssetCategoryStore = create<AssetCategoryStore>()(
  persist(
    (set, get) => ({
      scenes: [...INIT_SCENES],
      channels: [...INIT_CHANNELS],
      sceneTemplates: [...INIT_SCENE_TEMPLATES],
      gameStyles: [...INIT_GAME_STYLES],

      /* 场景分类 */
      addScene: (item) => set((s) => ({
        scenes: [...s.scenes, item],
        sceneTemplates: [...s.sceneTemplates, { sceneId: item.id, sizes: [] }],
      })),
      updateScene: (id, patch) => set((s) => ({ scenes: s.scenes.map((c) => c.id === id ? { ...c, ...patch } : c) })),
      removeScene: (id) => set((s) => ({
        scenes: s.scenes.filter((c) => c.id !== id),
        sceneTemplates: s.sceneTemplates.filter((t) => t.sceneId !== id),
      })),

      /* 业务渠道 */
      addChannel: (item) => set((s) => ({ channels: [...s.channels, item] })),
      updateChannel: (id, patch) => set((s) => ({ channels: s.channels.map((c) => c.id === id ? { ...c, ...patch } : c) })),
      removeChannel: (id) => set((s) => ({ channels: s.channels.filter((c) => c.id !== id) })),

      /* 场景模板尺寸 */
      addSceneSize: (sceneId, size) => set((s) => ({
        sceneTemplates: s.sceneTemplates.map((t) =>
          t.sceneId === sceneId ? { ...t, sizes: [...t.sizes, size] } : t
        ),
      })),
      updateSceneSize: (sceneId, sizeId, patch) => set((s) => ({
        sceneTemplates: s.sceneTemplates.map((t) =>
          t.sceneId === sceneId
            ? { ...t, sizes: t.sizes.map((sz) => sz.id === sizeId ? { ...sz, ...patch } : sz) }
            : t
        ),
      })),
      removeSceneSize: (sceneId, sizeId) => set((s) => ({
        sceneTemplates: s.sceneTemplates.map((t) =>
          t.sceneId === sceneId ? { ...t, sizes: t.sizes.filter((sz) => sz.id !== sizeId) } : t
        ),
      })),

      /* 游戏风格预设 */
      updateGameStyle: (id, patch) => set((s) => ({
        gameStyles: s.gameStyles.map((g) => g.id === id ? { ...g, ...patch } : g),
      })),
      addGameStyle: (style) => set((s) => ({ gameStyles: [...s.gameStyles, style] })),

      /* 便捷查询 */
      getSizesForScene: (sceneId) => {
        const tpl = get().sceneTemplates.find((t) => t.sceneId === sceneId)
        return tpl?.sizes.filter((s) => s.enabled) ?? []
      },
      getEnabledStyles: () => get().gameStyles.filter((g) => g.enabled),
    }),
    { name: 'asset-category-store' }
  )
)
