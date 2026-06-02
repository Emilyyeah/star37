import { Upload, Sparkles } from 'lucide-react'

export function UploadPromptCard({ onUploadClick, onSelectTemplate }: { onUploadClick: () => void; onSelectTemplate?: () => void }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-md p-5 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <button onClick={onUploadClick}
          className="flex items-center gap-3 p-4 rounded-xl border border-dashed border-gray-300 hover:border-orange-400 hover:bg-orange-50/50 transition-all text-left">
          <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
            <Upload className="w-5 h-5 text-orange-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">上传设计稿</p>
            <p className="text-xs text-gray-500">AI 自动识别组件</p>
          </div>
        </button>
        <button onClick={onSelectTemplate} className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all text-left">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">选择模板</p>
            <p className="text-xs text-gray-500">从成熟方案快速开始</p>
          </div>
        </button>
      </div>
      <p className="text-xs text-gray-400 text-center">或直接输入你想创建的活动类型</p>
    </div>
  )
}
