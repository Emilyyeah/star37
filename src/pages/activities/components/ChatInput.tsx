/* 底部输入框 */

import type { RefObject } from 'react'
import { Send, ImagePlus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ChatInputProps {
  input: string
  inputRef: RefObject<HTMLTextAreaElement | null>
  fileInputRef: RefObject<HTMLInputElement | null>
  onInputChange: (value: string) => void
  onSend: () => void
  onFiles: (files: FileList | File[]) => void
}

export function ChatInput({ input, inputRef, fileInputRef, onInputChange, onSend, onFiles }: ChatInputProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSend()
    }
  }

  const handleTextarea = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onInputChange(e.target.value)
    const el = e.target
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 150) + 'px'
  }

  return (
    <div className="shrink-0 border-t border-gray-200 bg-white px-6 py-3">
      <div className="flex items-end gap-3 bg-gray-50 rounded-2xl border border-gray-200 px-4 py-3 focus-within:border-orange-400 focus-within:ring-2 focus-within:ring-orange-500/10 transition-all">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-gray-400 hover:text-orange-500 hover:bg-orange-50 transition-colors"
          title="上传设计稿"
        >
          <ImagePlus className="w-5 h-5" />
        </button>
        <textarea
          ref={inputRef}
          value={input}
          onChange={handleTextarea}
          onKeyDown={handleKeyDown}
          placeholder="描述你的活动需求，或上传设计稿让 AI 识别..."
          rows={1}
          className="flex-1 resize-none bg-transparent text-sm leading-relaxed focus:outline-none placeholder:text-gray-400 py-1.5"
        />
        <button
          onClick={onSend}
          disabled={!input.trim()}
          className={cn(
            'shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-colors',
            input.trim() ? 'bg-orange-500 text-white hover:bg-orange-600' : 'text-gray-300'
          )}
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp"
        multiple
        className="hidden"
        onChange={(e) => { if (e.target.files) onFiles(e.target.files); e.target.value = '' }}
      />
    </div>
  )
}
