import { useParams } from 'react-router-dom'

export default function TemplateDetailPage() {
  const { id } = useParams()
  return (
    <div>
      <h1 className="text-xl font-semibold text-gray-900 mb-6">模板详情</h1>
      <div className="bg-white rounded-xl border border-gray-200 p-8">
        <p className="text-sm text-gray-500">模板 ID: {id}</p>
      </div>
    </div>
  )
}
