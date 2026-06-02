/* 组件详情页 — 已合并到组件库列表页（左右分栏），此页做重定向兜底 */

import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function ComponentDetailPage() {
  const navigate = useNavigate()
  useEffect(() => { navigate('/components', { replace: true }) }, [navigate])
  return null
}
