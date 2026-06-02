import { Loader2 } from 'lucide-react'

export function RecognitionLoadingCard() {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-md p-5 flex items-center gap-3">
      <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
      <div>
        <p className="text-sm font-medium text-gray-700">正在分析设计稿...</p>
        <p className="text-xs text-gray-400">区域切割 → 组件匹配 → 参数推理</p>
      </div>
    </div>
  )
}
