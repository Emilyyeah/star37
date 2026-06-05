/* 对话逻辑 Hook */

import { useState, useRef, useCallback, useEffect } from 'react'
import type { ChatMessage, ConversationSession, RecognitionRegion, MatchedComponent } from '../types'
import { useComponentStore } from '@/lib/componentStore'
import type { CanvasItem } from '../hooks/useManualBuilder'
import { mockRecognitionResults, regionsToComponents, mockAIReply } from './mockData'
import type { MockTemplate } from '@/pages/templates/data/mockTemplates'

export function useChat() {
  const [sessions, setSessions] = useState<ConversationSession[]>([
    { id: '1', title: '新活动', updatedAt: Date.now(), active: true },
  ])

  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 'welcome-1', role: 'ai', content: '你好！我是 AI 活动助手 👋\n\n你可以通过以下方式创建活动：', timestamp: Date.now() },
    { id: 'welcome-2', role: 'ai', timestamp: Date.now(), card: { type: 'upload-prompt' } },
  ])

  const [input, setInput] = useState('')
  const [showPreview, setShowPreview] = useState(true)
  const [previewComponents, setPreviewComponents] = useState<MatchedComponent[]>([])
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; sessionId: string } | null>(null)
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const [recognitionRegions, setRecognitionRegions] = useState<RecognitionRegion[]>([])
  const [selectedCompIdx, setSelectedCompIdx] = useState<number | null>(null)

  const getById = useComponentStore((s) => s.getById)

  const NAME_TO_ID: Record<string, string> = {
    '活动 Banner': 'comp-banner', '弹窗': 'comp-popup', '倒计时': 'comp-countdown',
    '活动规则说明': 'comp-rules', '公告/跑马灯': 'comp-marquee', '转盘抽奖': 'comp-wheel',
    '九宫格抽奖': 'comp-grid-lottery', '签到日历': 'comp-checkin',
    '任务列表': 'comp-tasks', '排行榜': 'comp-leaderboard',
  }

  const toCanvasItems = (mcs: MatchedComponent[]): CanvasItem[] =>
    mcs.map((mc, i) => {
      const compId = NAME_TO_ID[mc.name] || 'comp-banner'
      const def = getById(compId)
      const params: Record<string, unknown> = {}
      mc.params.forEach((p) => { params[p.name] = p.value })
      return {
        instanceId: mc.id + '-' + i,
        componentId: compId,
        name: mc.name,
        emoji: def?.previewEmoji || '📦',
        category: def?.category || 'display',
        params,
        schema: def?.parameterSchema || [],
        variantId: def?.variants[0]?.id || '',
      } satisfies CanvasItem
    })

  const [canvasItems, setCanvasItems] = useState<CanvasItem[]>([])

  // previewComponents 变化时重新生成 canvasItems（保留已有的 variantId 和 params 修改）
  useEffect(() => {
    setCanvasItems((prev) =>
      toCanvasItems(previewComponents).map((item) => {
        const existing = prev.find((p) => p.name === item.name)
        return existing
          ? { ...item, variantId: existing.variantId, params: { ...item.params, ...existing.params } }
          : item
      })
    )
  }, [previewComponents])

  const updateCanvasParam = (idx: number, name: string, value: unknown) => {
    setCanvasItems((prev) => prev.map((item, i) =>
      i === idx ? { ...item, params: { ...item.params, [name]: value } } : item
    ))
  }

  const updateCanvasVariant = (idx: number, variantId: string) => {
    setCanvasItems((prev) => prev.map((item, i) =>
      i === idx ? { ...item, variantId } : item
    ))
  }

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const addMessage = useCallback((msg: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    setMessages((prev) => [
      ...prev,
      { ...msg, id: String(Date.now() + Math.random()), timestamp: Date.now() },
    ])
  }, [])

  const handleSend = () => {
    const trimmed = input.trim()
    if (!trimmed) return
    addMessage({ role: 'user', content: trimmed })
    setInput('')

    setSessions((prev) =>
      prev.map((s) =>
        s.active && s.title === '新活动'
          ? { ...s, title: trimmed.length > 20 ? trimmed.slice(0, 20) + '...' : trimmed, updatedAt: Date.now() }
          : s
      )
    )
    if (inputRef.current) inputRef.current.style.height = 'auto'
    setTimeout(() => addMessage({ role: 'ai', content: mockAIReply(trimmed) }), 600)
  }

  const handleFiles = useCallback(
    (files: FileList | File[]) => {
      const valid = Array.from(files).filter((f) =>
        ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'].includes(f.type)
      )
      if (!valid.length) return
      const urls = valid.map((f) => URL.createObjectURL(f))

      addMessage({ role: 'user', card: { type: 'uploaded-images', images: urls } })

      setTimeout(() => {
        addMessage({ role: 'ai', content: `收到 ${valid.length} 张设计稿，正在识别中...` })
        addMessage({ role: 'ai', card: { type: 'recognition-loading' } })
      }, 300)

      setTimeout(() => {
        setMessages((prev) => prev.filter((m) => m.card?.type !== 'recognition-loading'))
        setRecognitionRegions(mockRecognitionResults)
        // 识别完成后立刻推入预览，后续增删实时更新
        setPreviewComponents(regionsToComponents(mockRecognitionResults.filter((r) => r.confirmed)))
        addMessage({ role: 'ai', content: '识别完成！检测到以下组件区域，请确认：' })
        addMessage({ role: 'ai', card: { type: 'recognition-result', regions: mockRecognitionResults } })
      }, 2500)

      setSessions((prev) =>
        prev.map((s) => (s.active ? { ...s, title: '转盘抽奖活动', updatedAt: Date.now() } : s))
      )
    },
    [addMessage]
  )

  const handleSelectTemplate = useCallback((tpl: MockTemplate) => {
    // 把模板组件名列表转成 RecognitionRegion 再转 MatchedComponent
    const regions = tpl.components.map((c, i) => ({
      id: `tpl-${i}`,
      label: c.name,
      matchedComponent: c.name,
      confidence: 100,
      confirmed: true,
    }))
    const components = regionsToComponents(regions)
    setPreviewComponents(components)
    setRecognitionRegions(regions)
    setSessions((prev) =>
      prev.map((s) => (s.active ? { ...s, title: tpl.name, updatedAt: Date.now() } : s))
    )
    addMessage({ role: 'user', content: `使用模板：${tpl.name}` })
    setTimeout(() => {
      addMessage({
        role: 'ai',
        content: `已加载「${tpl.name}」模板，包含 ${tpl.components.length} 个组件。

组件已出现在右侧预览和组件配置中，你可以直接修改参数或继续对话调整。`,
      })
    }, 400)
  }, [addMessage])

  const handleConfirmRegions = useCallback(
    (regions: RecognitionRegion[]) => {
      const components = regionsToComponents(regions)
      setPreviewComponents(components)
      setShowPreview(true)

      // 收集所有必填但 AI 未推断的字段，列举出来引导用户填写
      const pendingFields: { compName: string; fieldLabel: string }[] = []
      components.forEach((comp) => {
        comp.params.forEach((p) => {
          if (p.required && !p.aiInferred && (!p.value || p.value === '')) {
            pendingFields.push({ compName: comp.name, fieldLabel: p.label })
          }
        })
      })

      addMessage({ role: 'user', content: '已确认组件清单 ✓' })

      setTimeout(() => {
        addMessage({ role: 'ai', card: { type: 'config-form', components } })

        // AI 引导消息：列出待填字段
        const guideLines = pendingFields.length > 0
          ? `\n\n📋 **还有 ${pendingFields.length} 个必填项需要你提供：**\n` +
            pendingFields.map((f) => `• ${f.compName} → ${f.fieldLabel}`).join('\n') +
            '\n\n你可以直接告诉我，比如「奖品列表设置为：一等奖手机一台，二等奖平板一台」，我会帮你填进去。'
          : '\n\n✅ 所有参数 AI 已自动识别！你可以直接对话微调，或点击右下角「保存草稿」保存活动。'

        addMessage({
          role: 'ai',
          content: '🟢 绿色字段是我从设计稿推断出来的，🟠 橙色是需要你补充的内容。' + guideLines,
        })
      }, 500)
    },
    [addMessage]
  )

  const handleNewSession = () => {
    const newId = String(Date.now())
    setSessions((prev) => [
      ...prev.map((s) => ({ ...s, active: false })),
      { id: newId, title: '新活动', updatedAt: Date.now(), active: true },
    ])
    setMessages([
      { id: 'w1-' + newId, role: 'ai', content: '你好！开始创建新活动吧 👋', timestamp: Date.now() },
      { id: 'w2-' + newId, role: 'ai', timestamp: Date.now(), card: { type: 'upload-prompt' } },
    ])
    setShowPreview(true)
    setPreviewComponents([])
    setRecognitionRegions([])
  }

  const handleDeleteSession = (id: string) => {
    setSessions((prev) => {
      const remaining = prev.filter((s) => s.id !== id)
      if (remaining.length === 0) {
        return [{ id: String(Date.now()), title: '新活动', updatedAt: Date.now(), active: true }]
      }
      if (prev.find((s) => s.id === id)?.active) {
        remaining[0].active = true
      }
      return remaining
    })
    setContextMenu(null)
  }

  const handleStartRename = (id: string) => {
    const session = sessions.find((s) => s.id === id)
    if (session) {
      setRenamingId(id)
      setRenameValue(session.title)
    }
    setContextMenu(null)
  }

  const handleFinishRename = () => {
    if (renamingId && renameValue.trim()) {
      setSessions((prev) =>
        prev.map((s) => (s.id === renamingId ? { ...s, title: renameValue.trim() } : s))
      )
    }
    setRenamingId(null)
  }

  const handleSwitchSession = (id: string) => {
    setSessions((prev) => prev.map((s) => ({ ...s, active: s.id === id })))
  }

  return {
    // 状态
    sessions, messages, input, showPreview, previewComponents, recognitionRegions, setPreviewComponents,
    selectedCompIdx, setSelectedCompIdx, canvasItems, updateCanvasParam, updateCanvasVariant,
    contextMenu, renamingId, renameValue,
    // refs
    messagesEndRef, inputRef, fileInputRef,
    // actions
    setInput, setShowPreview, setContextMenu, setRenameValue,
    handleSend, handleFiles, handleConfirmRegions, handleSelectTemplate,
    handleNewSession, handleDeleteSession, handleStartRename, handleFinishRename,
    handleSwitchSession,
  }
}
