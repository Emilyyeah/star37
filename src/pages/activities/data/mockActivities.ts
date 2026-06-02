/* Mock 活动数据 — 详情页和创建页共用 */

import type { ActivityGlobalConfig } from '../hooks/useManualBuilder'

export type ActivityStatus = 'draft' | 'running' | 'ended'

export interface CompParam { label: string; value: string; aiInferred?: boolean }
export interface CompDetail { name: string; category: string; emoji: string; variant: string; variantId: string; componentId: string; params: Record<string, unknown>; paramDisplay: CompParam[] }

export interface MockActivityData {
  id: string
  globalConfig: ActivityGlobalConfig
  status: ActivityStatus
  components: CompDetail[]
  activityUrl: string
}

export const STATUS_MAP: Record<ActivityStatus, { label: string; cls: string }> = {
  draft: { label: '草稿', cls: 'bg-gray-100 text-gray-600' },
  running: { label: '进行中', cls: 'bg-green-100 text-green-700' },
  ended: { label: '已结束', cls: 'bg-orange-100 text-orange-700' },
}

export const MOCK_ACTIVITY_DATA: Record<string, MockActivityData> = {
  'act-001': {
    id: 'act-001',
    status: 'running',
    activityUrl: 'https://activity.37.com/act-001',
    globalConfig: {
      gameProject: 'dl3d', gameId: 'G20001', activityName: '618 大转盘抽奖',
      startTime: '2026-06-01T00:00', endTime: '2026-06-18T23:59',
      loginMethods: ['37sy', 'wechat'],
      guideWecom: false, guideHome: true, guideOpenGame: true,
      shareTitle: '618超级大转盘', shareDesc: '来斗罗3D抽大奖！', shareImage: '',
      subscribeTemplates: [], globalSubscribeEntry: { enabled: false, style: 'float', trigger: 'first_visit', templateRefs: [] },
    },
    components: [
      { name: '活动 Banner', category: '展示', emoji: '🖼️', variant: '宽幅横版', variantId: 'banner-wide', componentId: 'comp-banner',
        params: { title: '618 狂欢盛典', subtitle: '转盘抽奖赢好礼', bgImage: 'banner_618.png', height: 200, textAlign: 'center' },
        paramDisplay: [{ label: '标题', value: '618 狂欢盛典', aiInferred: true }, { label: '副标题', value: '转盘抽奖赢好礼', aiInferred: true }, { label: '背景图', value: 'banner_618.png' }, { label: '高度', value: '200px' }, { label: '文字对齐', value: '居中' }] },
      { name: '转盘抽奖', category: '抽奖', emoji: '🎡', variant: '经典圆盘', variantId: 'wheel-classic', componentId: 'comp-wheel',
        params: { dailyLimit: 3, costType: 'free', costPerPlay: 0, noWinText: '谢谢参与', prizes: [{ name: '一等奖', probability: 5 }, { name: '二等奖', probability: 15 }, { name: '三等奖', probability: 30 }, { name: '谢谢参与', probability: 50 }] },
        paramDisplay: [{ label: '每日次数', value: '3', aiInferred: true }, { label: '消耗类型', value: '免费', aiInferred: true }, { label: '单次消耗', value: '0' }, { label: '未中奖提示', value: '谢谢参与' }, { label: '奖品-一等奖', value: '概率 5%' }, { label: '奖品-二等奖', value: '概率 15%' }, { label: '奖品-三等奖', value: '概率 30%' }, { label: '奖品-谢谢参与', value: '概率 50%' }] },
      { name: '任务列表', category: '任务', emoji: '✅', variant: '卡片式', variantId: 'tasks-card', componentId: 'comp-tasks',
        params: { taskCount: 4, rewardUnit: '次', taskItems: [{ name: '每日分享', reward: 1 }, { name: '邀请好友', reward: 3 }, { name: '观看视频', reward: 1 }] },
        paramDisplay: [{ label: '任务数量', value: '4', aiInferred: true }, { label: '奖励单位', value: '次', aiInferred: true }, { label: '任务1', value: '每日分享 → +1次' }, { label: '任务2', value: '邀请好友 → +3次' }, { label: '任务3', value: '观看视频 → +1次' }] },
      { name: '排行榜', category: '互动', emoji: '🏆', variant: '领奖台式', variantId: 'lb-podium', componentId: 'comp-leaderboard',
        params: { showCount: 10, rankField: 'score', title: '排行榜' },
        paramDisplay: [{ label: '展示人数', value: '10', aiInferred: true }, { label: '排名维度', value: '积分' }, { label: '标题', value: '排行榜', aiInferred: true }] },
      { name: '活动规则说明', category: '展示', emoji: '📋', variant: '列表式', variantId: 'rules-list', componentId: 'comp-rules',
        params: { title: '活动规则', collapsed: true, rules: ['活动期间每日可参与一次', '奖品以实际发放为准'] },
        paramDisplay: [{ label: '标题', value: '活动规则', aiInferred: true }, { label: '默认折叠', value: '是' }, { label: '规则1', value: '活动期间每日可参与一次' }, { label: '规则2', value: '奖品以实际发放为准' }] },
    ],
  },
  'act-002': {
    id: 'act-002',
    status: 'running',
    activityUrl: 'https://activity.37.com/act-002',
    globalConfig: {
      gameProject: 'dlmmo', gameId: 'G20002', activityName: '新服签到福利',
      startTime: '2026-05-20T00:00', endTime: '2026-06-20T23:59',
      loginMethods: ['37sy'],
      guideWecom: false, guideHome: true, guideOpenGame: false,
      shareTitle: '新服签到领好礼', shareDesc: '连续签到赢大奖', shareImage: '',
      subscribeTemplates: [], globalSubscribeEntry: { enabled: false, style: 'float', trigger: 'first_visit', templateRefs: [] },
    },
    components: [
      { name: '活动 Banner', category: '展示', emoji: '🖼️', variant: '宽幅横版', variantId: 'banner-wide', componentId: 'comp-banner',
        params: { title: '新服签到福利', subtitle: '', bgImage: 'banner_checkin.png', height: 200, textAlign: 'center' },
        paramDisplay: [{ label: '标题', value: '新服签到福利', aiInferred: true }, { label: '背景图', value: 'banner_checkin.png' }, { label: '高度', value: '200px' }] },
      { name: '签到日历', category: '任务', emoji: '📅', variant: '日历网格', variantId: 'checkin-calendar', componentId: 'comp-checkin',
        params: { cycleDays: '7', rewards: [{ day: 1, reward: '10积分' }, { day: 3, reward: '30积分' }, { day: 7, reward: '100积分' }], milestoneRewards: [] },
        paramDisplay: [{ label: '签到周期', value: '7 天' }, { label: '第1天奖励', value: '10积分' }, { label: '第3天奖励', value: '30积分' }, { label: '第7天奖励', value: '100积分' }] },
      { name: '活动规则说明', category: '展示', emoji: '📋', variant: '列表式', variantId: 'rules-list', componentId: 'comp-rules',
        params: { title: '活动规则', collapsed: true, rules: ['每日签到一次，不可补签', '奖励将在签到后自动发放'] },
        paramDisplay: [{ label: '标题', value: '活动规则', aiInferred: true }, { label: '默认折叠', value: '是' }, { label: '规则1', value: '每日签到一次，不可补签' }, { label: '规则2', value: '奖励将在签到后自动发放' }] },
    ],
  },
}
