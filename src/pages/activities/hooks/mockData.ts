/* Mock 数据 — 后续替换为真实 API */

import type { RecognitionRegion, MatchedComponent } from '../types'

export const mockRecognitionResults: RecognitionRegion[] = [
  { id: '1', label: '顶部 Banner', matchedComponent: '活动 Banner', confidence: 96, confirmed: false, bbox: [0.0, 0.0, 1.0, 0.22] },
  { id: '2', label: '中部抽奖区', matchedComponent: '转盘抽奖',   confidence: 93, confirmed: false, bbox: [0.1, 0.24, 0.8, 0.38] },
  { id: '3', label: '底部任务区', matchedComponent: '任务列表',   confidence: 88, confirmed: false, bbox: [0.0, 0.64, 1.0, 0.24] },
  { id: '4', label: '悬浮入口',   matchedComponent: '奖品记录',   confidence: 91, confirmed: false, bbox: [0.7, 0.46, 0.26, 0.14] },
]

/** 组件名 → MatchedComponent 完整映射（覆盖全部 10 个组件） */
const COMPONENT_MAPPING: Record<string, Omit<MatchedComponent, 'id'>> = {
  '活动 Banner': { name: '活动 Banner', category: '展示', params: [
    { name: 'title',    label: '标题',   type: 'string', value: '夏日大促', aiInferred: true,  aiSource: 'UI 文案识别', required: true },
    { name: 'subtitle', label: '副标题', type: 'string', value: '',        aiInferred: false, required: false },
    { name: 'bgImage',  label: '背景图', type: 'string', value: '',        aiInferred: false, required: true },
  ]},
  '弹窗': { name: '弹窗', category: '展示', params: [
    { name: 'title',       label: '弹窗标题',  type: 'string', value: '',        aiInferred: false, required: true },
    { name: 'content',     label: '弹窗内容',  type: 'string', value: '',        aiInferred: false, required: true },
    { name: 'confirmText', label: '确认按钮',  type: 'string', value: '我知道了', aiInferred: true,  aiSource: '默认值', required: false },
    { name: 'triggerType', label: '触发方式',  type: 'select', value: 'auto',    aiInferred: false, required: false },
  ]},
  '倒计时': { name: '倒计时', category: '展示', params: [
    { name: 'title',   label: '提示文案',   type: 'string', value: '距活动结束还剩', aiInferred: true,  aiSource: '默认值', required: false },
    { name: 'endTime', label: '结束时间',   type: 'date',   value: '',              aiInferred: false, required: true },
  ]},
  '活动规则说明': { name: '活动规则说明', category: '展示', params: [
    { name: 'title', label: '标题',    type: 'string', value: '活动规则', aiInferred: true,  aiSource: '默认值', required: false },
    { name: 'rules', label: '规则内容', type: 'array',  value: [],        aiInferred: false, required: true },
  ]},
  '公告/跑马灯': { name: '公告/跑马灯', category: '展示', params: [
    { name: 'content', label: '公告内容', type: 'string', value: '', aiInferred: false, required: true },
    { name: 'speed',   label: '滚动速度', type: 'number', value: 3,  aiInferred: true,  aiSource: '默认值', required: false },
  ]},
  '转盘抽奖': { name: '转盘抽奖', category: '抽奖', params: [
    { name: 'dailyLimit',  label: '每日抽奖次数', type: 'number', value: 3,  aiInferred: true,  aiSource: 'UI 文案「每日3次机会」', required: true },
    { name: 'costPerPlay', label: '单次消耗积分', type: 'number', value: 10, aiInferred: true,  aiSource: 'UI 文案「消耗10积分」',   required: true },
    { name: 'prizes',      label: '奖品列表',     type: 'array',  value: [], aiInferred: false, required: true },
    { name: 'noWinText',   label: '未中奖提示',   type: 'string', value: '', aiInferred: false, required: false },
  ]},
  '九宫格抽奖': { name: '九宫格抽奖', category: '抽奖', params: [
    { name: 'dailyLimit', label: '每日抽奖次数', type: 'number', value: 3,  aiInferred: false, required: true },
    { name: 'prizes',     label: '奖品列表',     type: 'array',  value: [], aiInferred: false, required: true },
  ]},
  '签到日历': { name: '签到日历', category: '任务', params: [
    { name: 'days',    label: '签到天数',  type: 'number', value: 7,  aiInferred: true,  aiSource: '默认值', required: true },
    { name: 'rewards', label: '每日奖励',  type: 'array',  value: [], aiInferred: false, required: true },
  ]},
  '任务列表': { name: '任务列表', category: '任务', params: [
    { name: 'taskCount', label: '任务数量', type: 'number', value: 4,  aiInferred: true,  aiSource: 'UI 布局识别', required: true },
    { name: 'taskItems', label: '任务内容', type: 'array',  value: [], aiInferred: false, required: true },
  ]},
  '排行榜': { name: '排行榜', category: '互动', params: [
    { name: 'title',     label: '榜单标题', type: 'string', value: '排行榜', aiInferred: true,  aiSource: '默认值', required: false },
    { name: 'showCount', label: '展示条数', type: 'number', value: 10,       aiInferred: true,  aiSource: '默认值', required: false },
  ]},
  '奖品记录': { name: '奖品记录', category: '展示', params: [
    { name: 'showCount', label: '展示条数', type: 'number', value: 10, aiInferred: true, aiSource: '默认值', required: false },
  ]},
}

export function regionsToComponents(regions: RecognitionRegion[]): MatchedComponent[] {
  return regions.map((r, i) => {
    const def = COMPONENT_MAPPING[r.matchedComponent]
    if (def) {
      return { id: `mc-${r.id}`, ...def }
    }
    // 兜底：未在映射表里的组件，生成基础结构，不丢弃
    return {
      id: `mc-${r.id}-${i}`,
      name: r.matchedComponent,
      category: '展示',
      params: [],
    }
  })
}

export function mockAIReply(input: string): string {
  const lower = input.toLowerCase()
  if (lower.includes('转盘') || lower.includes('抽奖'))
    return '转盘抽奖是很热门的活动类型！上传设计稿我来识别，或者试试「转盘抽奖活动」模板？'
  if (lower.includes('改') || lower.includes('修改') || lower.includes('调'))
    return '好的，请具体告诉我修改什么，比如：\n\n· 「把每日抽奖次数改成 5 次」\n· 「主色调换成红色」\n· 「底部加一个排行榜」'
  if (lower.includes('发布'))
    return '在发布前请确认所有参数。发布后活动会立即上线，支持热更新。\n\n确认要发布吗？'
  return '收到！上传活动设计稿让我识别，或者直接描述你想要的活动。\n\n比如：「做一个转盘抽奖活动，每天3次机会」'
}
