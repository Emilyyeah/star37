/* 底部输入框 — 支持 Ctrl+V 粘贴截图 */

import { useState, useEffect, useCallback, type RefObject } from 'react'
import { Send, ImagePlus, X } from 'lucide-react'
import { cn, showToast } from '@/lib/utils'

const MAX_IMAGES = 5

interface ChatInputProps {
  input: string
  inputRef: RefObject<HTMLTextAreaElement | null>
  fileInputRef: RefObject<HTMLInputElement | null>
  onInputChange: (value: string) => void
  onSend: () => void
  onFiles: (files: FileList | File[]) => void
}

export function ChatInput({ input, inputRef, fileInputRef, onInputChange, onSend, onFiles }: ChatInputProps) {
  // 粘贴预览图列表
  const [pastedImages, setPastedImages] = useState<{ file: File; url: string }[]>([])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleTextarea = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onInputChange(e.target.value)
    const el = e.target
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 150) + 'px'
  }

  // 粘贴处理：提取剪贴板中的图片
  const handlePaste = useCallback((e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = Array.from(e.clipboardData.items)
    const imageItems = items.filter((item) => item.type.startsWith('image/'))
    if (imageItems.length === 0) return

    e.preventDefault()
    const files = imageItems.map((item) => item.getAsFile()).filter(Boolean) as File[]
    setPastedImages((prev) => {
      const remaining = MAX_IMAGES - prev.length
      if (remaining <= 0) {
        showToast(`最多上传 ${MAX_IMAGES} 张截图`)
        return prev
      }
      const toAdd = files.slice(0, remaining)
      if (files.length > remaining) showToast(`已达上限，仅保留前 ${remaining} 张`)
      return [...prev, ...toAdd.map((file) => ({ file, url: URL.createObjectURL(file) }))]
    })
  }, [])

  // 全局 Ctrl+V 监听（当焦点不在 textarea 时也能触发）
  useEffect(() => {
    const handler = (e: ClipboardEvent) => {
      // 如果焦点在 textarea 上，交由 onPaste 处理，避免重复
      if (document.activeElement === inputRef.current) return
      const items = Array.from(e.clipboardData?.items || [])
      const imageItems = items.filter((item) => item.type.startsWith('image/'))
      if (imageItems.length === 0) return
      e.preventDefault()
      const files = imageItems.map((item) => item.getAsFile()).filter(Boolean) as File[]
      setPastedImages((prev) => {
        const remaining = MAX_IMAGES - prev.length
        if (remaining <= 0) { showToast(`最多上传 ${MAX_IMAGES} 张截图`); return prev }
        const toAdd = files.slice(0, remaining)
        if (files.length > remaining) showToast(`已达上限，仅保留前 ${remaining} 张`)
        return [...prev, ...toAdd.map((file) => ({ file, url: URL.createObjectURL(file) }))]
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

  const handleSend = () => {
    // 如果有粘贴图片，先上传图片
    if (pastedImages.length > 0) {
      onFiles(pastedImages.map((p) => p.file))
      setPastedImages([])
    }
    onSend()
  }

  const hasPastedImages = pastedImages.length > 0

  return (
    <div className="shrink-0 border-t border-gray-200 bg-white px-6 py-3">
      <div className={cn(
        'flex flex-col bg-gray-50 rounded-2xl border transition-all',
        hasPastedImages ? 'border-orange-400 ring-2 ring-orange-500/10' : 'border-gray-200 focus-within:border-orange-400 focus-within:ring-2 focus-within:ring-orange-500/10'
      )}>
        {/* 粘贴图片预览区 */}
        {hasPastedImages && (
          <div className="flex items-center gap-2 px-4 pt-3 flex-wrap">
            {pastedImages.map((p, idx) => (
              <div key={idx} className="relative group shrink-0">
                <img
                  src={p.url}
                  alt={`截图 ${idx + 1}`}
                  className="h-16 w-auto rounded-lg border border-gray-200 object-cover"
                />
                <button
                  onClick={() => removeImage(idx)}
                  className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-gray-700 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </div>
            ))}
            <span className="text-xs text-gray-400 ml-1">
              {pastedImages.length} 张截图待发送
            </span>
          </div>
        )}

        {/* 输入行 */}
        <div className="flex items-end gap-3 px-4 py-3">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-gray-400 hover:text-orange-500 hover:bg-orange-50 transition-colors"
            title="上传设计稿（或 Ctrl+V 粘贴截图）"
          >
            <ImagePlus className="w-5 h-5" />
          </button>
          <textarea
            ref={inputRef}
            value={input}
            onChange={handleTextarea}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            placeholder={hasPastedImages ? '添加描述（可选），按 Enter 发送截图...' : '描述你的活动需求，或上传设计稿让 AI 识别...'}
            rows={1}
            className="flex-1 resize-none bg-transparent text-sm leading-relaxed focus:outline-none placeholder:text-gray-400 py-1.5"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() && !hasPastedImages}
            className={cn(
              'shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-colors',
              (input.trim() || hasPastedImages) ? 'bg-orange-500 text-white hover:bg-orange-600' : 'text-gray-300'
            )}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp"
        multiple
        className="hidden"
        onChange={(e) => {
          if (!e.target.files) return
          const files = Array.from(e.target.files)
          const remaining = MAX_IMAGES - pastedImages.length
          if (remaining <= 0) { showToast(`最多上传 ${MAX_IMAGES} 张截图`); e.target.value = ''; return }
          const toSend = files.slice(0, remaining)
          if (files.length > remaining) showToast(`已达上限，仅保留前 ${remaining} 张`)
          onFiles(toSend)
          e.target.value = ''
        }}
      />

      {/* 提示文字 */}
      <p className="text-xs text-gray-400 mt-1.5 text-center">
        最多 {MAX_IMAGES} 张 · 支持拖拽 / 点击上传 / <kbd className="px-1 py-0.5 bg-gray-100 rounded text-gray-500 text-[10px]">Ctrl+V</kbd> 粘贴截图
      </p>
    </div>
  )
}
