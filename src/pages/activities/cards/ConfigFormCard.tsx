import { cn } from '@/lib/utils'
import { Sparkles } from 'lucide-react'
import type { MatchedComponent } from '../types'

export function ConfigFormCard({ components, embedded }: { components: MatchedComponent[]; embedded?: boolean }) {
  return (
    <div className={embedded ? "space-y-4" : "bg-white border border-gray-200 rounded-2xl rounded-tl-md p-5 space-y-4"}>
      {components.map((comp) => (
        <div key={comp.id} className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-400 uppercase">{comp.category}</span>
            <span className="text-sm font-semibold text-gray-900">{comp.name}</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {comp.params.map((param) => (
              <div key={param.name} className={cn('p-3 rounded-xl border',
                param.aiInferred ? 'border-green-200 bg-green-50/30' : param.required ? 'border-orange-200 bg-orange-50/30' : 'border-gray-200 bg-gray-50/30')}>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <span className="text-xs font-medium text-gray-700">{param.label}</span>
                  {param.required && <span className="text-orange-500 text-xs font-bold">*</span>}
                  {param.aiInferred && (
                    <span className="inline-flex items-center gap-0.5 text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-medium">
                      <Sparkles className="w-3 h-3" />AI
                    </span>
                  )}
                </div>
                {param.aiInferred ? (
                  <div>
                    <p className="text-sm font-medium text-gray-900">{formatValue(param.value)}</p>
                    {param.aiSource && <p className="text-xs text-green-600 mt-0.5">{param.aiSource}</p>}
                  </div>
                ) : (
                  <ConfigFieldInput param={param} />
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

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return ''
  if (Array.isArray(value)) return `${value.length} 项已配置`
  return String(value)
}

function ConfigFieldInput({ param }: { param: { type: string; label: string; value: unknown } }) {
  const placeholder = `请输入${param.label}`

  switch (param.type) {
    case 'date':
      return (
        <input
          type="datetime-local"
          defaultValue={String(param.value || '')}
          className="w-full text-sm border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-orange-400 bg-white"
        />
      )
    case 'select':
      return (
        <input
          type="text"
          defaultValue={String(param.value || '')}
          placeholder={placeholder}
          className="w-full text-sm border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-orange-400 bg-white"
        />
      )
    case 'number':
      return (
        <input
          type="number"
          defaultValue={String(param.value || '')}
          placeholder={placeholder}
          className="w-full text-sm border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-orange-400 bg-white"
        />
      )
    case 'boolean':
      return (
        <label className="flex items-center gap-2 cursor-pointer py-0.5">
          <input type="checkbox" defaultChecked={Boolean(param.value)} className="w-4 h-4 accent-orange-500" />
          <span className="text-xs text-gray-600">{param.value ? '是' : '否'}</span>
        </label>
      )
    case 'array':
      return (
        <div className="text-sm text-gray-500 bg-gray-50 rounded-lg px-2.5 py-1.5 border border-gray-100">
          {Array.isArray(param.value) && param.value.length > 0
            ? `${param.value.length} 项已配置`
            : '待配置'}
        </div>
      )
    default:
      return (
        <input
          type="text"
          placeholder={placeholder}
          defaultValue={String(param.value || '')}
          className="w-full text-sm border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-orange-400 bg-white"
        />
      )
  }
}
