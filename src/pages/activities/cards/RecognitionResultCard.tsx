import { useState } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { RecognitionRegion } from '../types'

interface RecognitionResultCardProps {
  regions: RecognitionRegion[]
  onConfirm: (regions: RecognitionRegion[]) => void
}

export function RecognitionResultCard({ regions, onConfirm }: RecognitionResultCardProps) {
  const [items, setItems] = useState(regions)
  const toggleConfirm = (id: string) => setItems((p) => p.map((r) => (r.id === id ? { ...r, confirmed: !r.confirmed } : r)))
  const removeItem = (id: string) => setItems((p) => p.filter((r) => r.id !== id))
  const allConfirmed = items.length > 0 && items.every((r) => r.confirmed)

  return (
    <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-md p-5 space-y-3">
      <div className="space-y-2">
        {items.map((region) => (
          <div key={region.id} className={cn(
            'flex items-center gap-3 p-3 rounded-xl border transition-colors',
            region.confirmed ? 'border-green-200 bg-green-50/50' : 'border-gray-200'
          )}>
            <button onClick={() => toggleConfirm(region.id)} className={cn(
              'w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors',
              region.confirmed ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300'
            )}>
              {region.confirmed && <span className="text-xs">✓</span>}
            </button>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-900">{region.label}</span>
                <span className="text-xs text-gray-400">→</span>
                <span className="text-sm text-blue-600">{region.matchedComponent}</span>
              </div>
            </div>
            <ConfidenceBadge confidence={region.confidence} />
            <button onClick={() => removeItem(region.id)}
              className="shrink-0 w-6 h-6 rounded-md flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between pt-2">
        <button className="text-xs text-blue-500 hover:text-blue-600 font-medium">+ 补充遗漏组件</button>
        <button onClick={() => onConfirm(items.filter((r) => r.confirmed))} disabled={!allConfirmed}
          className={cn('px-4 py-2 rounded-lg text-sm font-medium transition-colors',
            allConfirmed ? 'bg-orange-500 text-white hover:bg-orange-600' : 'bg-gray-100 text-gray-400')}>
          全部确认，下一步
        </button>
      </div>
    </div>
  )
}

function ConfidenceBadge({ confidence }: { confidence: number }) {
  const color = confidence >= 95 ? 'bg-green-100 text-green-700' : confidence >= 90 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
  return <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full', color)}>{confidence}%</span>
}
