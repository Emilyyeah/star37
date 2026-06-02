/* 组件库 — 类型定义 */

export type ComponentCategory = 'lottery' | 'task' | 'display' | 'exchange' | 'interaction'
export type ComponentStatus = 'draft' | 'testing' | 'available'

export const CATEGORY_LABELS: Record<ComponentCategory, string> = {
  lottery: '抽奖',
  task: '任务',
  display: '展示',
  exchange: '兑换',
  interaction: '互动',
}

export const STATUS_LABELS: Record<ComponentStatus, string> = {
  draft: '停用',
  testing: '待上线',
  available: '已上线',
}

export const STATUS_COLORS: Record<ComponentStatus, string> = {
  draft: 'bg-gray-100 text-gray-600',
  testing: 'bg-blue-100 text-blue-600',
  available: 'bg-green-100 text-green-600',
}

export const CATEGORY_COLORS: Record<ComponentCategory, string> = {
  lottery: 'bg-purple-100 text-purple-600',
  task: 'bg-teal-100 text-teal-600',
  display: 'bg-orange-100 text-orange-600',
  exchange: 'bg-amber-100 text-amber-700',
  interaction: 'bg-pink-100 text-pink-600',
}

/** select 类型的选项定义 */
export interface SelectOption {
  label: string
  value: string
}

export interface ParameterSchema {
  name: string
  label: string
  type: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'date' | 'select'
  defaultValue: unknown
  required: boolean
  aiInferable: boolean
  description: string
  /** select 类型的可选项列表 */
  options?: SelectOption[]
  /** array 类型的子项 Schema（简化：每项的字段定义） */
  arrayItemSchema?: { name: string; label: string; type: 'string' | 'number' }[]
}

export interface AISignature {
  visualDescription: string
  keywords: string[]
}

/** 组件样式变体 */
export interface ComponentVariant {
  id: string
  name: string
  description: string
  /** 预览区渲染标识（后续替换为真实组件渲染，当前用于 Mock 预览） */
  previewType: string
  /** 预览区主色/渐变色 */
  previewColors: [string, string]
  /** 预览区示意内容 */
  previewLayout: string
}

export interface ComponentItem {
  id: string
  name: string
  category: ComponentCategory
  status: ComponentStatus
  description: string
  aiSignature: AISignature
  parameterSchema: ParameterSchema[]
  previewEmoji: string
  usageCount: number
  createdAt: string
  updatedAt: string
  /** 样式变体列表，至少 1 个 */
  variants: ComponentVariant[]
}
