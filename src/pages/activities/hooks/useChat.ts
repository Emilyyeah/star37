/* 对话逻辑 Hook */

import { useState, useRef, useCallback, useEffect } from 'react'
import type { ChatMessage, ConversationSession, RecognitionRegion, MatchedComponent } from '../types'
import { mockRecognitionResults, regionsToComponents, mockAIReply } from './mockData'

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
        addMessage({ role: 'ai', content: '识别完成！检测到以下组件区域，请确认：' })
        addMessage({ role: 'ai', card: { type: 'recognition-result', regions: mockRecognitionResults } })
      }, 2500)

      setSessions((prev) =>
        prev.map((s) => (s.active ? { ...s, title: '转盘抽奖活动', updatedAt: Date.now() } : s))
      )
    },
    [addMessage]
  )

  const handleConfirmRegions = useCallback(
    (regions: RecognitionRegion[]) => {
      const components = regionsToComponents(regions)
      setPreviewComponents(components)
      setShowPreview(true)

      addMessage({ role: 'user', content: '已确认组件清单 ✓' })
      setTimeout(() => {
        addMessage({
          role: 'ai',
          content: '配置活动参数。🟢 绿色是我从设计稿推断的，🟠 橙色需要你填写。\n\n你也可以直接对话修改，如「把每日次数改成 5 次」',
        })
        addMessage({ role: 'ai', card: { type: 'config-form', components } })
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
    sessions, messages, input, showPreview, previewComponents,
    contextMenu, renamingId, renameValue,
    // refs
    messagesEndRef, inputRef, fileInputRef,
    // actions
    setInput, setShowPreview, setContextMenu, setRenameValue,
    handleSend, handleFiles, handleConfirmRegions,
    handleNewSession, handleDeleteSession, handleStartRename, handleFinishRename,
    handleSwitchSession,
  }
}
