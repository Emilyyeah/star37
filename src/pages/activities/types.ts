/* 创建活动页面 — 类型定义 */

export interface ChatMessage {
  id: string
  role: 'user' | 'ai'
  content?: string
  timestamp: number
  card?: MessageCard
}

export type MessageCard =
  | { type: 'upload-prompt' }
  | { type: 'uploaded-images'; images: string[] }
  | { type: 'recognition-loading' }
  | { type: 'recognition-result'; regions: RecognitionRegion[] }
  | { type: 'config-form'; components: MatchedComponent[] }
  | { type: 'preview-ready' }
  | { type: 'publish-success'; url: string }

export interface RecognitionRegion {
  id: string
  label: string
  matchedComponent: string
  confidence: number
  confirmed: boolean
  /** 归一化坐标 [x, y, w, h]，值域 0~1，相对于图片宽高 */
  bbox?: [number, number, number, number]
}

export interface MatchedComponent {
  id: string
  name: string
  category: string
  params: ComponentParam[]
}

export interface ComponentParam {
  name: string
  label: string
  type: string
  value: unknown
  aiInferred: boolean
  aiSource?: string
  required: boolean
}

export interface ConversationSession {
  id: string
  title: string
  updatedAt: number
  active: boolean
}
