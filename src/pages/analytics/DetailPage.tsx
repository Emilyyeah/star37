import { useEffect } from 'react'
import { Table2, Construction } from 'lucide-react'
import { useTabStore } from '@/lib/tabStore'

export default function DetailPage() {
  const openTab = useTabStore((s) => s.openTab)
  useEffect(() => { openTab('/analytics/detail', '活动数据明细') }, [openTab])

  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center">
        <Table2 className="w-8 h-8 text-gray-300" />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-700 flex items-center justify-center gap-1.5">
          <Construction className="w-4 h-4 text-orange-400" />
          活动数据明细建设中
        </p>
        <p className="text-xs text-gray-400 mt-1">数据接入后即可查看</p>
      </div>
    </div>
  )
}
