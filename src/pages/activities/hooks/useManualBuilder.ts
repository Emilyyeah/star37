/* 手动创建 — 状态管理 Hook */

import { useState, useMemo } from 'react'
import { useComponentStore } from '@/lib/componentStore'
import type { ComponentItem, ComponentCategory, ParameterSchema } from '@/types/component'

export interface CanvasItem {
  instanceId: string
  componentId: string
  name: string
  emoji: string
  category: ComponentCategory
  params: Record<string, unknown>
  schema: ParameterSchema[]
  variantId: string
}

/* ── 订阅消息模板 ── */

export interface SubscribeTemplate {
  id: string
  templateId: string
  name: string
  description: string
}

/* ── 全局订阅入口配置 ── */

export interface GlobalSubscribeEntry {
  enabled: boolean
  style: 'float' | 'banner'
  trigger: 'first_visit' | 'every_visit' | 'manual'
  templateRefs: string[]
}

/* ── 活动全局配置 ── */

export interface ActivityGlobalConfig {
  // 基础信息
  gameProject: string
  gameId: string
  activityName: string
  startTime: string
  endTime: string
  // 登录组件
  loginMethods: string[]
  // 入口引导
  guideWecom: boolean
  guideHome: boolean
  guideOpenGame: boolean
  // 小程序分享卡片
  shareTitle: string
  shareDesc: string
  shareImage: string
  // 订阅消息 — 模板池
  subscribeTemplates: SubscribeTemplate[]
  // 订阅消息 — 全局入口
  globalSubscribeEntry: GlobalSubscribeEntry
}

const DEFAULT_GLOBAL_CONFIG: ActivityGlobalConfig = {
  gameProject: '',
  gameId: '',
  activityName: '',
  startTime: '',
  endTime: '',
  loginMethods: ['37sy'],
  guideWecom: false,
  guideHome: true,
  guideOpenGame: true,
  shareTitle: '',
  shareDesc: '',
  shareImage: '',
  subscribeTemplates: [],
  globalSubscribeEntry: {
    enabled: false,
    style: 'float',
    trigger: 'first_visit',
    templateRefs: [],
  },
}

export function useManualBuilder() {
  const components = useComponentStore((s) => s.components)
  const availableComponents = useMemo(() => components.filter((c) => c.status === 'available'), [components])

  const [canvas, setCanvas] = useState<CanvasItem[]>([])
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null)
  const [globalConfig, setGlobalConfig] = useState<ActivityGlobalConfig>({ ...DEFAULT_GLOBAL_CONFIG })

  const selectedItem = selectedIdx !== null ? canvas[selectedIdx] : null

  const updateGlobalConfig = <K extends keyof ActivityGlobalConfig>(key: K, value: ActivityGlobalConfig[K]) => {
    setGlobalConfig((prev) => ({ ...prev, [key]: value }))
  }

  const addToCanvas = (comp: ComponentItem) => {
    const defaults: Record<string, unknown> = {}
    for (const p of comp.parameterSchema) defaults[p.name] = p.defaultValue
    const item: CanvasItem = {
      instanceId: `inst-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      componentId: comp.id,
      name: comp.name,
      emoji: comp.previewEmoji,
      category: comp.category,
      params: defaults,
      schema: comp.parameterSchema,
      variantId: comp.variants[0]?.id || 'default',
    }
    setCanvas((prev) => [...prev, item])
    setSelectedIdx(canvas.length)
  }

  const removeFromCanvas = (idx: number) => {
    setCanvas((prev) => prev.filter((_, i) => i !== idx))
    if (selectedIdx === idx) setSelectedIdx(null)
    else if (selectedIdx !== null && selectedIdx > idx) setSelectedIdx(selectedIdx - 1)
  }

  const moveUp = (idx: number) => {
    if (idx === 0) return
    setCanvas((prev) => { const n = [...prev]; [n[idx - 1], n[idx]] = [n[idx], n[idx - 1]]; return n })
    if (selectedIdx === idx) setSelectedIdx(idx - 1)
    else if (selectedIdx === idx - 1) setSelectedIdx(idx)
  }

  const moveDown = (idx: number) => {
    if (idx >= canvas.length - 1) return
    setCanvas((prev) => { const n = [...prev]; [n[idx], n[idx + 1]] = [n[idx + 1], n[idx]]; return n })
    if (selectedIdx === idx) setSelectedIdx(idx + 1)
    else if (selectedIdx === idx + 1) setSelectedIdx(idx)
  }

  const updateParam = (idx: number, paramName: string, value: unknown) => {
    setCanvas((prev) => prev.map((item, i) => i === idx ? { ...item, params: { ...item.params, [paramName]: value } } : item))
  }

  const updateVariant = (idx: number, variantId: string) => {
    setCanvas((prev) => prev.map((item, i) => i === idx ? { ...item, variantId } : item))
  }

  return {
    availableComponents, canvas, selectedIdx, selectedItem, setSelectedIdx,
    addToCanvas, removeFromCanvas, moveUp, moveDown, updateParam, updateVariant,
    globalConfig, updateGlobalConfig,
  }
}
