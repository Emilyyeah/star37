/* 对话流区域 */

import { RefObject } from 'react'
import type { ChatMessage, RecognitionRegion } from '../types'
import { MessageBubble } from './MessageBubble'

interface ChatFlowProps {
  messages: ChatMessage[]
  messagesEndRef: RefObject<HTMLDivElement | null>
  onUploadClick: () => void
  onConfirmRegions: (regions: RecognitionRegion[]) => void
  onDropFiles: (files: FileList) => void
}

export function ChatFlow({ messages, messagesEndRef, onUploadClick, onConfirmRegions, onDropFiles }: ChatFlowProps) {
  return (
    <div
      className="flex-1 overflow-y-auto overflow-x-hidden px-6 py-6 space-y-5 min-w-0"
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => { e.preventDefault(); onDropFiles(e.dataTransfer.files) }}
    >
      {messages.map((msg) => (
        <MessageBubble
          key={msg.id}
          message={msg}
          onUploadClick={onUploadClick}
          onConfirmRegions={onConfirmRegions}
        />
      ))}
      <div ref={messagesEndRef} />
    </div>
  )
}
