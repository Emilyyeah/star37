import { useEffect } from 'react'
import { BarChart2, Construction } from 'lucide-react'
import { useTabStore } from '@/lib/tabStore'

export default function ComponentsPage() {
  const openTab = useTabStore((s) => s.openTab)
  useEffect(() => { openTab('/analytics/components', '组件分析') }, [openTab])

  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center">
        <BarChart2 className="w-8 h-8 text-gray-300" />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-700 flex items-center justify-center gap-1.5">
          <Construction className="w-4 h-4 text-orange-400" />
          组件分析建设中
        </p>
        <p className="text-xs text-gray-400 mt-1">数据接入后即可查看</p>
      </div>
    </div>
  )
}
