import { useParams } from 'react-router-dom'

export default function ActivityDetailPage() {
  const { id } = useParams()
  return (
    <div>
      <h1 className="text-xl font-semibold text-gray-900 mb-6">活动详情</h1>
      <div className="bg-white rounded-xl border border-gray-200 p-8">
        <p className="text-sm text-gray-500">活动 ID: {id}</p>
        <p className="text-xs text-gray-400 mt-2">活动详情页将在 Step 3 实现</p>
      </div>
    </div>
  )
}
