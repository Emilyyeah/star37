/* Mock 模板数据 — 含手机预览配置 */

export type TemplateCategory = 'all' | 'lottery' | 'checkin' | 'task' | 'welfare'

export const CATEGORY_LABELS: Record<TemplateCategory, string> = {
  all: '全部',
  lottery: '抽奖类',
  checkin: '签到类',
  task: '任务类',
  welfare: '福利类',
}

export interface TemplateComponent {
  name: string
  category: string
  emoji: string
  variant: string
}

/** 手机预览配置 — 纯 CSS 绘制活动视觉 */
export interface PreviewConfig {
  /** 页面整体背景色 */
  pageBg: string
  /** Banner 区域渐变（from → to） */
  bannerFrom: string
  bannerTo: string
  /** Banner 标题文字 */
  bannerTitle: string
  bannerSubtitle?: string
  /** Banner 装饰色（圆形气泡等） */
  accentColor: string
  /** 主玩法组件类型 */
  mainWidget: 'wheel' | 'grid9' | 'checkin' | 'tasks' | 'scratch' | 'gift'
  /** 主玩法区域背景 */
  widgetBg: string
  /** 按钮文字 */
  btnText: string
  /** 按钮颜色 */
  btnColor: string
}

export interface MockTemplate {
  id: string
  name: string
  description: string
  category: Exclude<TemplateCategory, 'all'>
  tags: string[]
  usageCount: number
  createdFrom?: string
  createdAt: string
  preview: PreviewConfig
  components: TemplateComponent[]
}

export const MOCK_TEMPLATES: MockTemplate[] = [
  {
    id: 'tpl-001',
    name: '大转盘抽奖',
    description: '经典转盘+任务列表组合，适合节日促活，支持每日次数限制与积分消耗两种模式。',
    category: 'lottery',
    tags: ['转盘', '节假日'],
    usageCount: 18,
    createdFrom: '618 大转盘抽奖',
    createdAt: '2026-05-28',
    preview: {
      pageBg: '#1a0a2e',
      bannerFrom: '#f97316', bannerTo: '#ef4444',
      bannerTitle: '618 大转盘', bannerSubtitle: '转盘抽奖赢好礼',
      accentColor: '#fbbf24',
      mainWidget: 'wheel',
      widgetBg: '#2d1b5e',
      btnText: '立即抽奖', btnColor: '#f97316',
    },
    components: [
      { name: '活动 Banner', category: '展示', emoji: '🖼️', variant: '宽幅横版' },
      { name: '转盘抽奖', category: '抽奖', emoji: '🎡', variant: '经典圆盘' },
      { name: '任务列表', category: '任务', emoji: '✅', variant: '卡片式' },
      { name: '排行榜', category: '互动', emoji: '🏆', variant: '领奖台式' },
      { name: '活动规则说明', category: '展示', emoji: '📋', variant: '列表式' },
    ],
  },
  {
    id: 'tpl-002',
    name: '新服签到福利',
    description: '7 天签到日历，阶梯奖励逐日递增，适合新服开服期拉留存。',
    category: 'checkin',
    tags: ['签到', '新服', '留存'],
    usageCount: 12,
    createdFrom: '新服签到福利',
    createdAt: '2026-05-18',
    preview: {
      pageBg: '#0c1f3d',
      bannerFrom: '#1d4ed8', bannerTo: '#0ea5e9',
      bannerTitle: '新服签到', bannerSubtitle: '连续签到赢大奖',
      accentColor: '#38bdf8',
      mainWidget: 'checkin',
      widgetBg: '#0f2d5e',
      btnText: '立即签到', btnColor: '#0ea5e9',
    },
    components: [
      { name: '活动 Banner', category: '展示', emoji: '🖼️', variant: '宽幅横版' },
      { name: '签到日历', category: '任务', emoji: '📅', variant: '日历网格' },
      { name: '活动规则说明', category: '展示', emoji: '📋', variant: '列表式' },
    ],
  },
  {
    id: 'tpl-003',
    name: '九宫格抽奖',
    description: '九宫格跑马灯抽奖，高视觉冲击力，配合倒计时提升紧迫感，适合爆量节点。',
    category: 'lottery',
    tags: ['九宫格', '爆量', '限时'],
    usageCount: 9,
    createdAt: '2026-04-10',
    preview: {
      pageBg: '#1e0533',
      bannerFrom: '#7c3aed', bannerTo: '#db2777',
      bannerTitle: '九宫格大奖', bannerSubtitle: '限时挑战',
      accentColor: '#e879f9',
      mainWidget: 'grid9',
      widgetBg: '#2d0b4e',
      btnText: '开始抽奖', btnColor: '#a855f7',
    },
    components: [
      { name: '活动 Banner', category: '展示', emoji: '🖼️', variant: '竖版沉浸' },
      { name: '倒计时', category: '展示', emoji: '⏱️', variant: '翻牌式' },
      { name: '九宫格抽奖', category: '抽奖', emoji: '🎰', variant: '霓虹跑马灯' },
      { name: '活动规则说明', category: '展示', emoji: '📋', variant: '列表式' },
    ],
  },
  {
    id: 'tpl-004',
    name: '任务积分兑换',
    description: '完成日常任务积累积分，积分可在兑换中心换取奖励，形成完整闭环。',
    category: 'task',
    tags: ['积分', '兑换', '日常'],
    usageCount: 7,
    createdAt: '2026-03-15',
    preview: {
      pageBg: '#0a2318',
      bannerFrom: '#16a34a', bannerTo: '#0d9488',
      bannerTitle: '积分任务', bannerSubtitle: '完成任务赢好礼',
      accentColor: '#4ade80',
      mainWidget: 'tasks',
      widgetBg: '#0f3320',
      btnText: '去完成', btnColor: '#16a34a',
    },
    components: [
      { name: '活动 Banner', category: '展示', emoji: '🖼️', variant: '宽幅横版' },
      { name: '任务列表', category: '任务', emoji: '✅', variant: '进度条式' },
      { name: '排行榜', category: '互动', emoji: '🏆', variant: '滚动列表' },
      { name: '活动规则说明', category: '展示', emoji: '📋', variant: '列表式' },
    ],
  },
  {
    id: 'tpl-005',
    name: '邀请好友裂变',
    description: '邀请好友双方各得奖励，配合跑马灯播报邀请动态，提升裂变效率。',
    category: 'task',
    tags: ['邀请', '裂变', '社交'],
    usageCount: 5,
    createdAt: '2026-02-25',
    preview: {
      pageBg: '#1c1000',
      bannerFrom: '#d97706', bannerTo: '#f97316',
      bannerTitle: '邀请好友', bannerSubtitle: '双方各得大礼',
      accentColor: '#fcd34d',
      mainWidget: 'gift',
      widgetBg: '#2c1800',
      btnText: '立即邀请', btnColor: '#d97706',
    },
    components: [
      { name: '活动 Banner', category: '展示', emoji: '🖼️', variant: '宽幅横版' },
      { name: '公告/跑马灯', category: '展示', emoji: '📢', variant: '滚动跑马灯' },
      { name: '任务列表', category: '任务', emoji: '✅', variant: '卡片式' },
      { name: '排行榜', category: '互动', emoji: '🏆', variant: '领奖台式' },
      { name: '活动规则说明', category: '展示', emoji: '📋', variant: '列表式' },
    ],
  },
  {
    id: 'tpl-006',
    name: '周年庆福利',
    description: '一键领取多档周年庆福利，带弹窗公告提升仪式感，适合重大节点活动。',
    category: 'welfare',
    tags: ['周年庆', '福利'],
    usageCount: 14,
    createdAt: '2026-04-10',
    preview: {
      pageBg: '#1a0404',
      bannerFrom: '#dc2626', bannerTo: '#b45309',
      bannerTitle: '周年庆典', bannerSubtitle: '好礼大派送',
      accentColor: '#fca5a5',
      mainWidget: 'scratch',
      widgetBg: '#2a0808',
      btnText: '领取福利', btnColor: '#dc2626',
    },
    components: [
      { name: '活动 Banner', category: '展示', emoji: '🖼️', variant: '竖版沉浸' },
      { name: '弹窗', category: '展示', emoji: '🪟', variant: '全屏公告' },
      { name: '任务列表', category: '任务', emoji: '✅', variant: '卡片式' },
      { name: '活动规则说明', category: '展示', emoji: '📋', variant: '列表式' },
    ],
  },
  {
    id: 'tpl-007',
    name: '端午节签到',
    description: '端午节主题签到，节日氛围浓厚，配合限时任务提升活跃度。',
    category: 'checkin',
    tags: ['端午', '签到', '节日'],
    usageCount: 8,
    createdAt: '2026-05-01',
    preview: {
      pageBg: '#0c2a12',
      bannerFrom: '#15803d', bannerTo: '#065f46',
      bannerTitle: '端午签到', bannerSubtitle: '有粽有你',
      accentColor: '#86efac',
      mainWidget: 'checkin',
      widgetBg: '#143520',
      btnText: '今日签到', btnColor: '#16a34a',
    },
    components: [
      { name: '活动 Banner', category: '展示', emoji: '🖼️', variant: '宽幅横版' },
      { name: '签到日历', category: '任务', emoji: '📅', variant: '日历网格' },
      { name: '任务列表', category: '任务', emoji: '✅', variant: '卡片式' },
      { name: '活动规则说明', category: '展示', emoji: '📋', variant: '列表式' },
    ],
  },
  {
    id: 'tpl-008',
    name: '新年大转盘',
    description: '新年主题转盘抽奖，喜庆红金配色，适合春节促活拉新场景。',
    category: 'lottery',
    tags: ['新年', '转盘', '春节'],
    usageCount: 22,
    createdAt: '2026-01-10',
    preview: {
      pageBg: '#1a0505',
      bannerFrom: '#dc2626', bannerTo: '#991b1b',
      bannerTitle: '新年大转盘', bannerSubtitle: '转出好彩头',
      accentColor: '#fbbf24',
      mainWidget: 'wheel',
      widgetBg: '#2d0808',
      btnText: '转动转盘', btnColor: '#dc2626',
    },
    components: [
      { name: '活动 Banner', category: '展示', emoji: '🖼️', variant: '宽幅横版' },
      { name: '转盘抽奖', category: '抽奖', emoji: '🎡', variant: '红金经典盘' },
      { name: '活动规则说明', category: '展示', emoji: '📋', variant: '列表式' },
    ],
  },
]
