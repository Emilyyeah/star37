/* 组件库 — 详情 Tab 子组件（Schema 表格 / AI 签名 / 使用记录） */

import { Tag, Activity } from 'lucide-react'
import type { ParameterSchema } from '@/types/component'

export function SchemaTable({ schema }: { schema: ParameterSchema[] }) {
  if (schema.length === 0) return <p className="text-sm text-gray-400 text-center py-6">暂无参数定义</p>
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs text-gray-500 border-b border-gray-100">
            <th className="pb-2.5 pr-4 font-medium">字段名</th>
            <th className="pb-2.5 pr-4 font-medium">显示名</th>
            <th className="pb-2.5 pr-4 font-medium">类型</th>
            <th className="pb-2.5 pr-4 font-medium">默认值</th>
            <th className="pb-2.5 pr-4 font-medium text-center">必填</th>
            <th className="pb-2.5 pr-4 font-medium text-center">AI 可推断</th>
            <th className="pb-2.5 font-medium">描述</th>
          </tr>
        </thead>
        <tbody>
          {schema.map((p) => (
            <tr key={p.name} className="border-b border-gray-50 last:border-0">
              <td className="py-2.5 pr-4 font-mono text-xs text-gray-800">{p.name}</td>
              <td className="py-2.5 pr-4 text-gray-700">{p.label}</td>
              <td className="py-2.5 pr-4"><span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-mono">{p.type}</span></td>
              <td className="py-2.5 pr-4 text-xs text-gray-500 font-mono">{p.defaultValue === '' || p.defaultValue === undefined ? <span className="text-gray-300">&mdash;</span> : String(Array.isArray(p.defaultValue) ? '[]' : p.defaultValue)}</td>
              <td className="py-2.5 pr-4 text-center">{p.required ? <span className="text-green-500 font-bold">✓</span> : <span className="text-gray-300">&mdash;</span>}</td>
              <td className="py-2.5 pr-4 text-center">{p.aiInferable ? <span className="text-xs bg-green-100 text-green-600 px-1.5 py-0.5 rounded font-medium">AI</span> : <span className="text-gray-300">&mdash;</span>}</td>
              <td className="py-2.5 text-xs text-gray-500">{p.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function SignatureView({ signature }: { signature: { visualDescription: string; keywords: string[] } }) {
  return (
    <div className="space-y-4">
      <div><h3 className="text-xs font-medium text-gray-500 mb-1.5">视觉描述</h3><p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">{signature.visualDescription}</p></div>
      <div>
        <h3 className="text-xs font-medium text-gray-500 mb-1.5">关键词</h3>
        <div className="flex flex-wrap gap-2">{signature.keywords.map((kw) => (<span key={kw} className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full"><Tag className="w-3 h-3" />{kw}</span>))}</div>
      </div>
    </div>
  )
}

export function UsageView() {
  return (
    <div className="text-center py-8">
      <Activity className="w-8 h-8 text-gray-300 mx-auto mb-2" />
      <p className="text-sm text-gray-500">暂无关联活动</p>
      <p className="text-xs text-gray-400 mt-1">组件被活动引用后，使用记录将在此展示</p>
    </div>
  )
}
