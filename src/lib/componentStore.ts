/* 组件库 — Zustand Store + Mock 数据 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ComponentItem, ComponentStatus } from '@/types/component'

/* ── Mock 数据：首批 10 个核心组件 ─────────────────────── */

const MOCK_COMPONENTS: ComponentItem[] = [
  {
    id: 'comp-banner',
    name: '活动 Banner',
    category: 'display',
    status: 'available',
    description: '活动页面顶部横幅，支持自定义背景图、标题文案和副标题。适用于所有活动场景。',
    previewEmoji: '🖼️',
    usageCount: 42,
    createdAt: '2026-04-15',
    updatedAt: '2026-05-20',
    aiSignature: {
      visualDescription: '页面顶部全宽横幅区域，通常包含背景图片、大标题文字和活动口号',
      keywords: ['banner', '横幅', '顶部', '背景图', '标题'],
    },
    parameterSchema: [
      { name: 'title', label: '标题', type: 'string', defaultValue: '', required: true, aiInferable: true, description: '活动主标题' },
      { name: 'subtitle', label: '副标题', type: 'string', defaultValue: '', required: false, aiInferable: true, description: '活动副标题或口号' },
      { name: 'bgImage', label: '背景图', type: 'string', defaultValue: '', required: true, aiInferable: false, description: '背景图片 URL' },
      { name: 'height', label: '高度', type: 'number', defaultValue: 200, required: false, aiInferable: false, description: '横幅高度（px）' },
      { name: 'textAlign', label: '文字对齐', type: 'select', defaultValue: 'center', required: false, aiInferable: false, description: '标题文字对齐方式', options: [{ label: '居左', value: 'left' }, { label: '居中', value: 'center' }, { label: '居右', value: 'right' }] },
    ],
    variants: [
      { id: 'banner-wide', name: '宽幅横版', description: '16:9 宽屏横幅，适合活动首页', previewType: 'banner-wide', previewColors: ['#f97316', '#ec4899'], previewLayout: 'wide' },
      { id: 'banner-square', name: '方形', description: '1:1 方形 Banner，适合卡片流', previewType: 'banner-square', previewColors: ['#8b5cf6', '#6366f1'], previewLayout: 'square' },
      { id: 'banner-slim', name: '窄条通栏', description: '窄高度通栏，适合二级页面顶部', previewType: 'banner-slim', previewColors: ['#0ea5e9', '#06b6d4'], previewLayout: 'slim' },
    ],
  },
  {
    id: 'comp-popup',
    name: '弹窗',
    category: 'display',
    status: 'available',
    description: '通用弹窗组件，用于展示活动规则、获奖通知、确认操作等场景。支持自定义标题和内容。',
    previewEmoji: '💬',
    usageCount: 38,
    createdAt: '2026-04-16',
    updatedAt: '2026-05-18',
    aiSignature: {
      visualDescription: '居中浮层弹窗，包含标题栏、正文内容区和操作按钮，背景遮罩半透明',
      keywords: ['弹窗', '对话框', '浮层', 'modal', '规则'],
    },
    parameterSchema: [
      { name: 'title', label: '弹窗标题', type: 'string', defaultValue: '', required: true, aiInferable: true, description: '弹窗标题文字' },
      { name: 'content', label: '弹窗内容', type: 'string', defaultValue: '', required: true, aiInferable: true, description: '弹窗正文内容（支持富文本）' },
      { name: 'confirmText', label: '确认按钮', type: 'string', defaultValue: '我知道了', required: false, aiInferable: true, description: '确认按钮文案' },
      { name: 'triggerType', label: '触发方式', type: 'select', defaultValue: 'auto', required: false, aiInferable: false, description: '弹窗触发方式', options: [{ label: '自动弹出', value: 'auto' }, { label: '点击触发', value: 'click' }, { label: '定时弹出', value: 'timer' }] },
    ],
    variants: [
      { id: 'popup-center', name: '居中弹窗', description: '经典居中弹窗，带遮罩', previewType: 'popup-center', previewColors: ['#f8fafc', '#e2e8f0'], previewLayout: 'center' },
      { id: 'popup-bottom', name: '底部弹窗', description: '从底部滑入的半屏弹窗', previewType: 'popup-bottom', previewColors: ['#f8fafc', '#e2e8f0'], previewLayout: 'bottom' },
    ],
  },
  {
    id: 'comp-countdown',
    name: '倒计时',
    category: 'display',
    status: 'available',
    description: '活动倒计时组件，支持天/时/分/秒显示，自动计算剩余时间。',
    previewEmoji: '⏳',
    usageCount: 25,
    createdAt: '2026-04-18',
    updatedAt: '2026-05-15',
    aiSignature: {
      visualDescription: '数字翻牌或数字块样式的倒计时，显示天、时、分、秒',
      keywords: ['倒计时', 'countdown', '天', '时', '分', '秒'],
    },
    parameterSchema: [
      { name: 'startTime', label: '开始时间', type: 'date', defaultValue: '', required: false, aiInferable: true, description: '活动开始时间' },
      { name: 'endTime', label: '结束时间', type: 'date', defaultValue: '', required: true, aiInferable: true, description: '活动结束时间' },
      { name: 'title', label: '提示文案', type: 'string', defaultValue: '距活动结束还剩', required: false, aiInferable: true, description: '倒计时上方提示文字' },
    ],
    variants: [
      { id: 'cd-flip', name: '翻牌式', description: '3D 翻牌倒计时效果', previewType: 'countdown-flip', previewColors: ['#1e293b', '#334155'], previewLayout: 'flip' },
      { id: 'cd-block', name: '色块式', description: '圆角色块数字', previewType: 'countdown-block', previewColors: ['#f97316', '#fb923c'], previewLayout: 'block' },
      { id: 'cd-inline', name: '内联文字', description: '纯文字行内倒计时', previewType: 'countdown-inline', previewColors: ['#ef4444', '#f87171'], previewLayout: 'inline' },
    ],
  },
  {
    id: 'comp-rules',
    name: '活动规则说明',
    category: 'display',
    status: 'testing',
    description: '活动规则展示区域，支持多条规则列表展示，可折叠/展开。',
    previewEmoji: '📋',
    usageCount: 8,
    createdAt: '2026-05-01',
    updatedAt: '2026-05-28',
    aiSignature: {
      visualDescription: '底部或独立区块的规则说明列表，序号+文字排列，可折叠',
      keywords: ['规则', '说明', '活动规则', '注意事项'],
    },
    parameterSchema: [
      { name: 'title', label: '标题', type: 'string', defaultValue: '活动规则', required: false, aiInferable: true, description: '规则区域标题' },
      { name: 'rules', label: '规则列表', type: 'array', defaultValue: ['活动期间每日可参与一次', '奖品以实际发放为准'], required: true, aiInferable: false, description: '规则条目数组', arrayItemSchema: [{ name: 'text', label: '规则内容', type: 'string' }] },
      { name: 'collapsed', label: '默认折叠', type: 'boolean', defaultValue: true, required: false, aiInferable: false, description: '是否默认折叠' },
    ],
    variants: [
      { id: 'rules-list', name: '列表式', description: '序号列表展示，可折叠', previewType: 'rules-list', previewColors: ['#f8fafc', '#f1f5f9'], previewLayout: 'list' },
    ],
  },
  {
    id: 'comp-marquee',
    name: '公告/跑马灯',
    category: 'display',
    status: 'draft',
    description: '滚动公告组件，用于展示中奖信息、系统通知等滚动消息。',
    previewEmoji: '📢',
    usageCount: 0,
    createdAt: '2026-05-25',
    updatedAt: '2026-05-25',
    aiSignature: {
      visualDescription: '横向滚动文字条，通常在页面中上部，显示中奖用户信息',
      keywords: ['公告', '跑马灯', '滚动', '中奖信息', 'marquee'],
    },
    parameterSchema: [
      { name: 'speed', label: '滚动速度', type: 'number', defaultValue: 50, required: false, aiInferable: false, description: '滚动速度（px/s）' },
      { name: 'messages', label: '消息列表', type: 'array', defaultValue: ['恭喜用户***获得一等奖', '恭喜用户***获得二等奖'], required: true, aiInferable: false, description: '滚动消息内容数组', arrayItemSchema: [{ name: 'text', label: '消息内容', type: 'string' }] },
    ],
    variants: [
      { id: 'marquee-bar', name: '横条滚动', description: '单行横向滚动', previewType: 'marquee-bar', previewColors: ['#fef3c7', '#fbbf24'], previewLayout: 'bar' },
      { id: 'marquee-vertical', name: '纵向轮播', description: '上下滚动轮播', previewType: 'marquee-vertical', previewColors: ['#fef3c7', '#f59e0b'], previewLayout: 'vertical' },
    ],
  },
  {
    id: 'comp-wheel',
    name: '转盘抽奖',
    category: 'lottery',
    status: 'available',
    description: '经典大转盘抽奖组件，支持自定义奖品数量、概率、每日次数限制。圆形转盘+中心按钮。',
    previewEmoji: '🎡',
    usageCount: 56,
    createdAt: '2026-04-20',
    updatedAt: '2026-05-22',
    aiSignature: {
      visualDescription: '圆形转盘，扇形分区显示不同奖品，中心有指针按钮，点击旋转',
      keywords: ['转盘', '大转盘', '抽奖', '旋转', '指针'],
    },
    parameterSchema: [
      { name: 'dailyLimit', label: '每日次数', type: 'number', defaultValue: 3, required: true, aiInferable: true, description: '每日可抽奖次数上限' },
      { name: 'costType', label: '消耗类型', type: 'select', defaultValue: 'free', required: false, aiInferable: true, description: '抽奖消耗方式', options: [{ label: '免费', value: 'free' }, { label: '积分', value: 'points' }, { label: '金币', value: 'coins' }] },
      { name: 'costPerPlay', label: '单次消耗', type: 'number', defaultValue: 0, required: false, aiInferable: true, description: '每次抽奖消耗数量' },
      { name: 'prizes', label: '奖品列表', type: 'array', defaultValue: [{ name: '一等奖', probability: 5 }, { name: '二等奖', probability: 15 }, { name: '三等奖', probability: 30 }, { name: '谢谢参与', probability: 50 }], required: true, aiInferable: false, description: '奖品配置（名称+概率）', arrayItemSchema: [{ name: 'name', label: '奖品名称', type: 'string' }, { name: 'probability', label: '概率(%)', type: 'number' }] },
      { name: 'noWinText', label: '未中奖提示', type: 'string', defaultValue: '谢谢参与', required: false, aiInferable: false, description: '未中奖时的提示文案' },
    ],
    variants: [
      { id: 'wheel-classic', name: '经典圆盘', description: '6/8 分区经典大转盘', previewType: 'wheel-classic', previewColors: ['#3b82f6', '#8b5cf6'], previewLayout: 'circle' },
      { id: 'wheel-luxury', name: '奢华金色', description: '金色主题高端感转盘', previewType: 'wheel-luxury', previewColors: ['#d97706', '#b45309'], previewLayout: 'circle' },
      { id: 'wheel-cute', name: '卡通可爱', description: '圆润卡通风格转盘', previewType: 'wheel-cute', previewColors: ['#ec4899', '#f472b6'], previewLayout: 'circle' },
    ],
  },
  {
    id: 'comp-grid-lottery',
    name: '九宫格抽奖',
    category: 'lottery',
    status: 'testing',
    description: '九宫格翻牌抽奖组件，3×3 网格布局，中间为抽奖按钮，周围 8 格为奖品。',
    previewEmoji: '🎰',
    usageCount: 12,
    createdAt: '2026-05-05',
    updatedAt: '2026-05-26',
    aiSignature: {
      visualDescription: '3×3 九宫格网格，8 个格子显示奖品图标和名称，中间格子是抽奖按钮',
      keywords: ['九宫格', '翻牌', '格子', '抽奖', '3x3'],
    },
    parameterSchema: [
      { name: 'dailyLimit', label: '每日次数', type: 'number', defaultValue: 3, required: true, aiInferable: true, description: '每日可抽奖次数' },
      { name: 'prizes', label: '奖品列表', type: 'array', defaultValue: [{ name: '一等奖', probability: 5 }, { name: '二等奖', probability: 10 }, { name: '三等奖', probability: 20 }, { name: '谢谢参与', probability: 65 }], required: true, aiInferable: false, description: '8 个奖品配置', arrayItemSchema: [{ name: 'name', label: '奖品名称', type: 'string' }, { name: 'probability', label: '概率(%)', type: 'number' }] },
      { name: 'animationDuration', label: '动画时长', type: 'number', defaultValue: 3000, required: false, aiInferable: false, description: '抽奖动画时长（ms）' },
    ],
    variants: [
      { id: 'grid-flat', name: '扁平简约', description: '扁平色块风格九宫格', previewType: 'grid-flat', previewColors: ['#6366f1', '#818cf8'], previewLayout: 'grid' },
      { id: 'grid-3d', name: '立体翻转', description: '3D 翻牌效果', previewType: 'grid-3d', previewColors: ['#0ea5e9', '#38bdf8'], previewLayout: 'grid' },
    ],
  },
  {
    id: 'comp-checkin',
    name: '签到日历',
    category: 'task',
    status: 'available',
    description: '每日签到日历组件，支持连续签到奖励、里程碑奖励配置。日历视图展示签到状态。',
    previewEmoji: '📅',
    usageCount: 33,
    createdAt: '2026-04-22',
    updatedAt: '2026-05-19',
    aiSignature: {
      visualDescription: '日历网格视图，已签到日期高亮标记，底部或右侧展示签到奖励',
      keywords: ['签到', '日历', '打卡', '连续签到', '每日'],
    },
    parameterSchema: [
      { name: 'cycleDays', label: '签到周期', type: 'select', defaultValue: '7', required: true, aiInferable: true, description: '一个签到周期的天数', options: [{ label: '7 天', value: '7' }, { label: '14 天', value: '14' }, { label: '21 天', value: '21' }, { label: '30 天', value: '30' }] },
      { name: 'rewards', label: '奖励配置', type: 'array', defaultValue: [{ day: 1, reward: '10积分' }, { day: 3, reward: '30积分' }, { day: 7, reward: '100积分' }], required: true, aiInferable: false, description: '各天签到奖励', arrayItemSchema: [{ name: 'day', label: '第N天', type: 'number' }, { name: 'reward', label: '奖励内容', type: 'string' }] },
      { name: 'milestoneRewards', label: '里程碑奖励', type: 'array', defaultValue: [], required: false, aiInferable: false, description: '连续签到里程碑奖励', arrayItemSchema: [{ name: 'days', label: '连续天数', type: 'number' }, { name: 'reward', label: '奖励内容', type: 'string' }] },
    ],
    variants: [
      { id: 'checkin-calendar', name: '日历网格', description: '7×N 日历视图', previewType: 'checkin-calendar', previewColors: ['#10b981', '#34d399'], previewLayout: 'calendar' },
      { id: 'checkin-timeline', name: '时间轴', description: '横向时间轴进度条', previewType: 'checkin-timeline', previewColors: ['#f97316', '#fb923c'], previewLayout: 'timeline' },
    ],
  },
  {
    id: 'comp-tasks',
    name: '任务列表',
    category: 'task',
    status: 'available',
    description: '任务列表组件，展示多个可完成的任务项，完成后获得积分或抽奖次数。',
    previewEmoji: '✅',
    usageCount: 45,
    createdAt: '2026-04-22',
    updatedAt: '2026-05-21',
    aiSignature: {
      visualDescription: '纵向列表，每行一个任务项，左侧图标+任务描述+右侧操作按钮',
      keywords: ['任务', '做任务', '任务列表', '积分', '完成'],
    },
    parameterSchema: [
      { name: 'taskCount', label: '任务数量', type: 'number', defaultValue: 4, required: true, aiInferable: true, description: '展示的任务条数' },
      { name: 'taskItems', label: '任务内容', type: 'array', defaultValue: [{ name: '每日分享', reward: 1 }, { name: '邀请好友', reward: 3 }, { name: '观看视频', reward: 1 }], required: true, aiInferable: false, description: '任务项配置（名称+奖励）', arrayItemSchema: [{ name: 'name', label: '任务名称', type: 'string' }, { name: 'reward', label: '奖励数量', type: 'number' }] },
      { name: 'rewardUnit', label: '奖励单位', type: 'select', defaultValue: '次', required: false, aiInferable: true, description: '奖励显示单位', options: [{ label: '抽奖次数', value: '次' }, { label: '积分', value: '积分' }, { label: '金币', value: '金币' }] },
    ],
    variants: [
      { id: 'tasks-card', name: '卡片式', description: '每个任务独立卡片', previewType: 'tasks-card', previewColors: ['#10b981', '#6ee7b7'], previewLayout: 'cards' },
      { id: 'tasks-compact', name: '紧凑列表', description: '行高更低的紧凑列表', previewType: 'tasks-compact', previewColors: ['#6366f1', '#a5b4fc'], previewLayout: 'compact' },
    ],
  },
  {
    id: 'comp-leaderboard',
    name: '排行榜',
    category: 'interaction',
    status: 'available',
    description: '排行榜组件，展示用户排名、头像、昵称和分数，支持自定义排名维度。',
    previewEmoji: '🏆',
    usageCount: 18,
    createdAt: '2026-05-08',
    updatedAt: '2026-05-24',
    aiSignature: {
      visualDescription: '纵向列表排行，前三名特殊样式（金银铜），显示排名序号+头像+昵称+分数',
      keywords: ['排行榜', '排名', '榜单', 'leaderboard', '前三名'],
    },
    parameterSchema: [
      { name: 'showCount', label: '展示人数', type: 'number', defaultValue: 10, required: false, aiInferable: true, description: '排行榜展示人数' },
      { name: 'rankField', label: '排名维度', type: 'select', defaultValue: 'score', required: true, aiInferable: false, description: '排名依据', options: [{ label: '积分', value: 'score' }, { label: '邀请人数', value: 'invite_count' }, { label: '消费金额', value: 'spend' }, { label: '签到天数', value: 'checkin_days' }] },
      { name: 'title', label: '标题', type: 'string', defaultValue: '排行榜', required: false, aiInferable: true, description: '排行榜标题' },
    ],
    variants: [
      { id: 'lb-podium', name: '领奖台式', description: '前三名突出领奖台样式', previewType: 'leaderboard-podium', previewColors: ['#f59e0b', '#fbbf24'], previewLayout: 'podium' },
      { id: 'lb-list', name: '纯列表', description: '简洁列表排行', previewType: 'leaderboard-list', previewColors: ['#64748b', '#94a3b8'], previewLayout: 'list' },
    ],
  },
  {
    id: 'comp-gift-draft',
    name: '礼包领取组件',
    category: 'interaction',
    status: 'wip',
    description: '通过 AI 对话创建的组件草稿，待完善参数配置。',
    previewEmoji: '🎁',
    usageCount: 0,
    createdAt: '2026-06-05',
    updatedAt: '2026-06-05',
    aiSignature: { visualDescription: '礼包领取按钮区域，用户点击领取活动礼包', keywords: ['礼包', '领取', '礼物'] },
    parameterSchema: [],
    variants: [{ id: 'gift-default', name: '默认', description: 'AI 生成变体', previewType: 'default', previewColors: ['#f97316', '#fb923c'], previewLayout: 'default' }],
  },
]

/* ── Store ──────────────────────────────────────────── */

interface ComponentStore {
  components: ComponentItem[]
  getById: (id: string) => ComponentItem | undefined
  add: (item: ComponentItem) => void
  updateStatus: (id: string, status: ComponentStatus) => void
  remove: (id: string) => boolean
  duplicate: (id: string) => string | null
  update: (id: string, data: Partial<ComponentItem>) => void
  addVariant: (componentId: string, name: string, description: string) => void
}

export const useComponentStore = create<ComponentStore>()(persist((set, get) => ({
  components: MOCK_COMPONENTS,

  getById: (id) => get().components.find((c) => c.id === id),

  add: (item) => set((s) => ({ components: [item, ...s.components] })),

  updateStatus: (id, status) =>
    set((s) => ({
      components: s.components.map((c) =>
        c.id === id ? { ...c, status, updatedAt: new Date().toISOString().slice(0, 10) } : c
      ),
    })),

  remove: (id) => {
    const comp = get().getById(id)
    if (!comp) return false
    if (comp.status === 'available') return false  // 已上线不允许直接删除
    set((s) => ({ components: s.components.filter((c) => c.id !== id) }))
    return true
  },

  duplicate: (id) => {
    const comp = get().getById(id)
    if (!comp) return null
    const now = new Date().toISOString().slice(0, 10)
    const newId = `comp-${Date.now()}`
    const newComp = { ...comp, id: newId, name: `${comp.name} (副本)`, status: "draft" as const, usageCount: 0, createdAt: now, updatedAt: now }
    set((s) => ({ components: [newComp, ...s.components] }))
    return newId
  },

  update: (id, data) =>
    set((s) => ({
      components: s.components.map((c) =>
        c.id === id ? { ...c, ...data, updatedAt: new Date().toISOString().slice(0, 10) } : c
      ),
    })),

  addVariant: (componentId, name, description) =>
    set((s) => ({
      components: s.components.map((c) =>
        c.id === componentId
          ? {
              ...c,
              updatedAt: new Date().toISOString().slice(0, 10),
              variants: [...c.variants, { id: `var-${Date.now()}`, name, description, previewType: "default", previewColors: ["#6366f1", "#818cf8"] as [string, string], previewLayout: "default" }],
            }
          : c
      ),
    })),
}), { name: 'component-store' }))