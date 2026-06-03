/* 创建组件页 — 会话历史 + AI 对话 + 组件预览 三栏模式
   布局结构与 CreateActivityPage 完全一致
   支持 URL 参数：?variant=comp-xxx（为已有组件添加变体） */

import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  Send, Sparkles, User, Eye, PanelRightClose, PanelRightOpen, Smartphone, ImagePlus, X,
} from 'lucide-react'
import { cn, showToast } from '@/lib/utils'
import { useTabStore } from '@/lib/tabStore'
import { useComponentStore } from '@/lib/componentStore'
import { SessionPanel } from '@/pages/activities/components/SessionPanel'
import type { ConversationSession } from '@/pages/activities/types'

const MAX_IMAGES = 5

interface ChatMsg {
  id: string
  role: 'user' | 'ai'
  content: string
  timestamp: number
}

/* Mock AI 回复 */
function mockReply(input: string): string {
  const lower = input.toLowerCase()
  if (lower.includes('转盘') || lower.includes('抽奖'))
    return '好的，我来生成一个转盘抽奖组件。\n\n组件规格：\n- 6 分区经典圆盘\n- 支持自定义奖品数量和概率\n- 每日次数限制\n- 中心抽奖按钮\n\n右侧预览已更新，请查看效果。你可以继续描述修改需求，比如「改成 8 个分区」「加一个奢华金色皮肤」。'
  if (lower.includes('签到') || lower.includes('打卡'))
    return '签到日历组件生成中...\n\n组件规格：\n- 7 天一个签到周期\n- 日历网格视图\n- 支持连续签到奖励\n- 支持里程碑奖励\n\n预览已更新。需要调整周期天数或添加其他变体吗？'
  if (lower.includes('banner') || lower.includes('横幅'))
    return 'Banner 组件已生成：\n\n组件规格：\n- 全宽横幅区域\n- 支持背景图 + 标题 + 副标题\n- 提供宽幅/方形/窄条三种变体\n\n预览已更新。可以说「加一个圆角版」来添加新变体。'
  if (lower.includes('修改') || lower.includes('改'))
    return '请具体描述要修改什么，比如：\n\n· 「背景色改成蓝色渐变」\n· 「增加一个暗色主题变体」\n· 「按钮文字改成开始抽奖」\n· 「动画时长改成 2 秒」'
  if (lower.includes('入库') || lower.includes('保存') || lower.includes('完成'))
    return '组件已准备就绪，确认以下信息后即可入库：\n\n- 状态：待上线（入库后可在组件库中管理）\n- 变体数量：已生成的所有样式变体\n- 参数 Schema：已自动生成\n\n确认入库吗？'
  return '收到！请描述你需要的组件类型和功能，比如：\n\n· 「做一个转盘抽奖组件，6 个奖品格子」\n· 「签到日历，7 天一个周期」\n· 「底部弹窗，展示活动规则」\n\n我会生成组件代码、参数 Schema 和 AI 视觉签名。'
}

export default function CreateComponentPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const openTab = useTabStore((s) => s.openTab)
  const getById = useComponentStore((s) => s.getById)

  /* 读取 URL 参数：?variant=comp-xxx */
  const variantForId = searchParams.get('variant')
  const variantForComp = useMemo(() => variantForId ? getById(variantForId) : null, [variantForId, getById])
  const isVariantMode = !!variantForComp

  /* 根据模式生成初始欢迎语和会话标题 */
  const initialTitle = isVariantMode ? `${variantForComp.name} · 添加变体` : '新组件'
  const initialWelcome = isVariantMode
    ? `你好！我是组件生成助手 ✦\n\n当前正在为「${variantForComp.name}」添加新的样式变体。\n\n该组件已有 ${variantForComp.variants.length} 个变体：${variantForComp.variants.map((v) => v.name).join('、')}。\n\n请描述你想要的新变体风格，比如：\n· 「暗色主题，深色背景」\n· 「简约扁平风」\n· 「节日喜庆版，红色主调」`
    : '你好！我是组件生成助手 ✦\n\n描述你需要的组件类型、功能和样式，我来帮你生成。\n\n你也可以上传参考截图，我会识别并生成对应组件。'

  const tabTitle = isVariantMode ? `添加变体 · ${variantForComp.name}` : '创建组件'
  const tabPath = isVariantMode ? `/components/create?variant=${variantForId}` : '/components/create'

  useEffect(() => { openTab(tabPath, tabTitle) }, [openTab, tabPath, tabTitle])

  /* ── 会话管理 ── */
  const [sessions, setSessions] = useState<ConversationSession[]>([
    { id: '1', title: initialTitle, updatedAt: Date.now(), active: true },
  ])
  const [messages, setMessages] = useState<ChatMsg[]>([
    { id: 'w1', role: 'ai', content: initialWelcome, timestamp: Date.now() },
  ])
  const [input, setInput] = useState('')
  const [showPreview, setShowPreview] = useState(true)
  const [pastedImages, setPastedImages] = useState<{ file: File; url: string }[]>([])
  const [hasGenerated, setHasGenerated] = useState(false)
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; sessionId: string } | null>(null)
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const addMessage = useCallback((msg: Omit<ChatMsg, 'id' | 'timestamp'>) => {
    setMessages((prev) => [...prev, { ...msg, id: String(Date.now() + Math.random()), timestamp: Date.now() }])
  }, [])

  const handleSendWithImages = () => {
    if (pastedImages.length > 0) {
      // 把粘贴图片作为用户消息展示
      setMessages((prev) => [...prev, {
        id: String(Date.now()),
        role: 'user',
        content: `[上传了 ${pastedImages.length} 张参考截图]${input.trim() ? '\n' + input.trim() : ''}`,
        timestamp: Date.now(),
      }])
      setPastedImages([])
      setInput('')
      if (inputRef.current) inputRef.current.style.height = 'auto'
      setTimeout(() => setMessages((prev) => [...prev, { id: String(Date.now() + 1), role: 'ai', content: '收到截图！正在识别组件样式，请稍候...', timestamp: Date.now() }]), 400)
      return
    }
    handleSend()
  }

  const handleSend = () => {
    const trimmed = input.trim()
    if (!trimmed) return
    addMessage({ role: 'user', content: trimmed })
    setInput('')
    if (inputRef.current) inputRef.current.style.height = 'auto'

    setSessions((prev) =>
      prev.map((s) =>
        s.active && (s.title === '新组件' || s.title === initialTitle)
          ? { ...s, title: trimmed.length > 20 ? trimmed.slice(0, 20) + '...' : trimmed, updatedAt: Date.now() }
          : s
      )
    )

    setTimeout(() => {
      addMessage({ role: 'ai', content: mockReply(trimmed) })
      if (!hasGenerated && (trimmed.includes('转盘') || trimmed.includes('签到') || trimmed.includes('banner') || trimmed.includes('横幅') || trimmed.includes('抽奖') || trimmed.includes('弹窗') || trimmed.includes('暗色') || trimmed.includes('风格') || trimmed.includes('主题'))) {
        setHasGenerated(true)
      }
    }, 800)
  }

  /* ── 会话操作 ── */
  const handleNewSession = () => {
    const newId = String(Date.now())
    setSessions((prev) => [
      ...prev.map((s) => ({ ...s, active: false })),
      { id: newId, title: isVariantMode ? initialTitle : '新组件', updatedAt: Date.now(), active: true },
    ])
    setMessages([
      { id: 'w1-' + newId, role: 'ai', content: isVariantMode ? initialWelcome : '你好！开始创建新组件吧 ✦\n\n描述你需要的组件类型和功能，我来生成。', timestamp: Date.now() },
    ])
    setHasGenerated(false)
  }

  const handleSwitchSession = (id: string) => {
    setSessions((prev) => prev.map((s) => ({ ...s, active: s.id === id })))
  }

  const handleDeleteSession = (id: string) => {
    setSessions((prev) => {
      const remaining = prev.filter((s) => s.id !== id)
      if (remaining.length === 0) return [{ id: String(Date.now()), title: initialTitle, updatedAt: Date.now(), active: true }]
      if (prev.find((s) => s.id === id)?.active) remaining[0].active = true
      return remaining
    })
    setContextMenu(null)
  }

  const handleStartRename = (id: string) => {
    const session = sessions.find((s) => s.id === id)
    if (session) { setRenamingId(id); setRenameValue(session.title) }
    setContextMenu(null)
  }

  const handleFinishRename = () => {
    if (renamingId && renameValue.trim()) {
      setSessions((prev) => prev.map((s) => (s.id === renamingId ? { ...s, title: renameValue.trim() } : s)))
    }
    setRenamingId(null)
  }

  const handlePaste = useCallback((e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = Array.from(e.clipboardData.items).filter((i) => i.type.startsWith('image/'))
    if (!items.length) return
    e.preventDefault()
    const files = items.map((i) => i.getAsFile()).filter(Boolean) as File[]
    setPastedImages((prev) => {
      const remaining = MAX_IMAGES - prev.length
      if (remaining <= 0) { showToast(`最多上传 ${MAX_IMAGES} 张截图`); return prev }
      const toAdd = files.slice(0, remaining)
      if (files.length > remaining) showToast(`已达上限，仅保留前 ${remaining} 张`)
      return [...prev, ...toAdd.map((f) => ({ file: f, url: URL.createObjectURL(f) }))]
    })
  }, [])

  useEffect(() => {
    const handler = (e: ClipboardEvent) => {
      if (document.activeElement === inputRef.current) return
      const items = Array.from(e.clipboardData?.items || []).filter((i) => i.type.startsWith('image/'))
      if (!items.length) return
      e.preventDefault()
      const files = items.map((i) => i.getAsFile()).filter(Boolean) as File[]
      setPastedImages((prev) => {
        const remaining = MAX_IMAGES - prev.length
        if (remaining <= 0) { showToast(`最多上传 ${MAX_IMAGES} 张截图`); return prev }
        const toAdd = files.slice(0, remaining)
        if (files.length > remaining) showToast(`已达上限，仅保留前 ${remaining} 张`)
        return [...prev, ...toAdd.map((f) => ({ file: f, url: URL.createObjectURL(f) }))]
      })
    }
    window.addEventListener('paste', handler)
    return () => window.removeEventListener('paste', handler)
  }, [inputRef])

  const removeImage = (idx: number) => {
    setPastedImages((prev) => {
      URL.revokeObjectURL(prev[idx].url)
      return prev.filter((_, i) => i !== idx)
    })
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  const handleTextarea = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    const el = e.target
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 150) + 'px'
  }

  return (
    <div className="flex h-full overflow-hidden">
      {/* ═══ 左栏：会话历史 ═══ */}
      <SessionPanel
        sessions={sessions}
        renamingId={renamingId}
        renameValue={renameValue}
        contextMenu={contextMenu}
        onNewSession={handleNewSession}
        onSwitchSession={handleSwitchSession}
        onContextMenu={(e, id) => setContextMenu({ x: e.clientX, y: e.clientY, sessionId: id })}
        onRenameChange={setRenameValue}
        onFinishRename={handleFinishRename}
        onCancelRename={() => setRenameValue('')}
        onCloseContextMenu={() => setContextMenu(null)}
        onStartRename={handleStartRename}
        onDeleteSession={handleDeleteSession}
      />

      {/* ═══ 中+右区域 ═══ */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="flex-1 flex min-h-0 overflow-hidden">
          {/* 对话流 */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden px-6 py-6 space-y-5 min-w-0">
            {messages.map((msg) => {
              const isAI = msg.role === 'ai'
              return (
                <div key={msg.id} className={cn('flex gap-3', !isAI && 'flex-row-reverse')}>
                  <div className={cn('w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1', isAI ? 'bg-blue-100' : 'bg-orange-100')}>
                    {isAI ? <Sparkles className="w-4 h-4 text-blue-600" /> : <User className="w-4 h-4 text-orange-600" />}
                  </div>
                  <div className={cn('min-w-0 max-w-[80%]', !isAI && 'text-right')}>
                    <div className={cn('inline-block rounded-2xl px-4 py-3 text-sm leading-relaxed break-all', isAI ? 'bg-white border border-gray-200 text-gray-800 rounded-tl-md' : 'bg-orange-500 text-white rounded-tr-md')}>
                      {msg.content.split('\n').map((line, i) => (
                        <span key={i}>{line}{i < msg.content.split('\n').length - 1 && <br />}</span>
                      ))}
                    </div>
                  </div>
                </div>
              )
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* 预览面板 */}
          {showPreview ? (
            <div className="w-[380px] border-l border-gray-200 bg-white flex flex-col shrink-0">
              <div className="h-10 flex items-center justify-between px-4 border-b border-gray-100 shrink-0">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">
                    {isVariantMode ? `${variantForComp.name} · 变体预览` : '组件预览'}
                  </span>
                </div>
                <button onClick={() => setShowPreview(false)} className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100" title="收起预览">
                  <PanelRightClose className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 overflow-auto p-4 flex justify-center items-start">
                <div className="w-[280px] bg-gray-900 rounded-[2rem] p-2.5 shadow-xl">
                  <div className="bg-white rounded-[1.5rem] overflow-hidden" style={{ height: 500 }}>
                    <div className="h-7 bg-gray-50 flex items-center justify-center">
                      <div className="w-16 h-3 bg-gray-900 rounded-full" />
                    </div>
                    <div className="overflow-auto" style={{ height: 473 }}>
                      {hasGenerated ? (
                        <div>
                          <div className="h-32 bg-gradient-to-r from-blue-400 to-purple-500 flex items-end p-4">
                            <p className="text-white font-bold text-sm">组件预览</p>
                          </div>
                          <div className="py-6 flex flex-col items-center bg-gradient-to-b from-blue-50 to-white">
                            <div className="w-40 h-40 rounded-full border-4 border-blue-200 bg-white flex items-center justify-center relative">
                              {[0, 1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="absolute w-0.5 h-16 bg-blue-100 origin-bottom" style={{ transform: `rotate(${i * 60}deg)`, bottom: '50%' }} />
                              ))}
                              <div className="w-12 h-12 rounded-full bg-orange-500 text-white font-bold text-xs flex items-center justify-center z-10 shadow-lg">抽奖</div>
                            </div>
                            <p className="text-xs text-gray-500 mt-3">每日 3 次机会</p>
                          </div>
                        </div>
                      ) : (
                        <div className="h-full flex items-center justify-center text-center p-6">
                          <div>
                            <Smartphone className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                            <p className="text-xs text-gray-400">{isVariantMode ? '描述新变体风格后' : '描述组件需求后'}</p>
                            <p className="text-xs text-gray-400">预览将实时生成</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              {hasGenerated && (
                <div className="border-t border-gray-100 px-4 py-3 flex items-center justify-end gap-2">
                  <button onClick={() => navigate('/components')} className="px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">取消</button>
                  <button onClick={() => navigate('/components')} className="px-3 py-1.5 text-xs font-medium bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
                    {isVariantMode ? '保存变体' : '入库为待上线'}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="w-10 border-l border-gray-200 bg-white flex flex-col items-center py-2 shrink-0">
              <button onClick={() => setShowPreview(true)} className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors" title="展开预览">
                <PanelRightOpen className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* 底部输入框 */}
        <div className="shrink-0 border-t border-gray-200 bg-white px-6 py-3">
          <div className={cn("flex flex-col bg-gray-50 rounded-2xl border transition-all", pastedImages.length > 0 ? "border-orange-400 ring-2 ring-orange-500/10" : "border-gray-200 focus-within:border-orange-400 focus-within:ring-2 focus-within:ring-orange-500/10")}>
            {/* 粘贴图片预览 */}
            {pastedImages.length > 0 && (
              <div className="flex items-center gap-2 px-4 pt-3 flex-wrap">
                {pastedImages.map((p, idx) => (
                  <div key={idx} className="relative group shrink-0">
                    <img src={p.url} alt={`截图 ${idx + 1}`} className="h-16 w-auto rounded-lg border border-gray-200 object-cover" />
                    <button onClick={() => removeImage(idx)} className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-gray-700 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </div>
                ))}
                <span className="text-xs text-gray-400 ml-1">{pastedImages.length} 张截图待发送</span>
              </div>
            )}
            <div className="flex items-end gap-3 px-4 py-3">
              <button onClick={() => fileInputRef.current?.click()} className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-gray-400 hover:text-orange-500 hover:bg-orange-50 transition-colors" title="上传参考截图（或 Ctrl+V 粘贴）">
                <ImagePlus className="w-5 h-5" />
              </button>
              <textarea ref={inputRef} value={input} onChange={handleTextarea} onKeyDown={handleKeyDown} onPaste={handlePaste}
                placeholder={pastedImages.length > 0 ? '添加描述（可选），按 Enter 发送截图...' : isVariantMode ? `描述「${variantForComp!.name}」的新变体风格...` : '描述你需要的组件，如「转盘抽奖，6个奖品，支持每日限制」'}
                rows={1} className="flex-1 resize-none bg-transparent text-sm leading-relaxed focus:outline-none placeholder:text-gray-400 py-1.5" />
              <button onClick={handleSendWithImages} disabled={!input.trim() && pastedImages.length === 0}
                className={cn('shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-colors', (input.trim() || pastedImages.length > 0) ? 'bg-orange-500 text-white hover:bg-orange-600' : 'text-gray-300')}>
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-1.5 text-center">
            最多 {MAX_IMAGES} 张 · 支持拖拽 / 点击上传 / <kbd className="px-1 py-0.5 bg-gray-100 rounded text-gray-500 text-[10px]">Ctrl+V</kbd> 粘贴截图
          </p>
          <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/jpg,image/webp" multiple className="hidden"
            onChange={(e) => {
              if (!e.target.files) return
              const files = Array.from(e.target.files)
              const remaining = MAX_IMAGES - pastedImages.length
              if (remaining <= 0) { showToast(`最多上传 ${MAX_IMAGES} 张截图`); e.target.value = ''; return }
              const toSend = files.slice(0, remaining)
              if (files.length > remaining) showToast(`已达上限，仅保留前 ${remaining} 张`)
              setPastedImages((prev) => [...prev, ...toSend.map((f) => ({ file: f, url: URL.createObjectURL(f) }))])
              e.target.value = ''
            }} />
        </div>
      </div>
    </div>
  )
}
