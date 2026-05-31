import { cn } from '@/lib/utils'
import type { MatchedComponent } from '../types'

export function ConfigFormCard({ components }: { components: MatchedComponent[] }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-md p-5 space-y-4">
      {components.map((comp) => (
        <div key={comp.id} className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-400 uppercase">{comp.category}</span>
            <span className="text-sm font-semibold text-gray-900">{comp.name}</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {comp.params.map((param) => (
              <div key={param.name} className={cn('p-3 rounded-xl border',
                param.aiInferred ? 'border-green-200 bg-green-50/30' : 'border-orange-200 bg-orange-50/30')}>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <span className="text-xs font-medium text-gray-700">{param.label}</span>
                  {param.required && <span className="text-red-400 text-xs">*</span>}
                  {param.aiInferred && (
                    <span className="text-xs bg-green-100 text-green-600 px-1.5 py-0.5 rounded font-medium">AI</span>
                  )}
                </div>
                {param.aiInferred ? (
                  <div>
                    <p className="text-sm font-medium text-gray-900">{String(param.value)}</p>
                    {param.aiSource && <p className="text-xs text-green-600 mt-0.5">{param.aiSource}</p>}
                  </div>
                ) : (
                  <input type="text" placeholder={`请输入${param.label}`} defaultValue={String(param.value || '')}
                    className="w-full text-sm border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-orange-400" />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
      <div className="flex justify-end pt-2">
        <button className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors">
          预览活动
        </button>
      </div>
    </div>
  )
}
