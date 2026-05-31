/* 消息气泡 */

import { Sparkles, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ChatMessage, RecognitionRegion } from '../types'
import { CardRenderer } from '../cards/CardRenderer'

interface MessageBubbleProps {
  message: ChatMessage
  onUploadClick: () => void
  onConfirmRegions: (regions: RecognitionRegion[]) => void
}

export function MessageBubble({ message, onUploadClick, onConfirmRegions }: MessageBubbleProps) {
  const isAI = message.role === 'ai'
  return (
    <div className={cn('flex gap-3', !isAI && 'flex-row-reverse')}>
      <div className={cn(
        'w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1',
        isAI ? 'bg-blue-100' : 'bg-orange-100'
      )}>
        {isAI ? <Sparkles className="w-4 h-4 text-blue-600" /> : <User className="w-4 h-4 text-orange-600" />}
      </div>
      <div className={cn('min-w-0 max-w-[80%]', !isAI && 'text-right')}>
        {message.content && (
          <div className={cn(
            'inline-block rounded-2xl px-4 py-3 text-sm leading-relaxed break-all',
            isAI ? 'bg-white border border-gray-200 text-gray-800 rounded-tl-md' : 'bg-orange-500 text-white rounded-tr-md'
          )}>
            {message.content.split('\n').map((line, i) => (
              <span key={i}>{line}{i < message.content!.split('\n').length - 1 && <br />}</span>
            ))}
          </div>
        )}
        {message.card && (
          <div className="mt-2 w-full">
            <CardRenderer card={message.card} onUploadClick={onUploadClick} onConfirmRegions={onConfirmRegions} />
          </div>
        )}
      </div>
    </div>
  )
}
