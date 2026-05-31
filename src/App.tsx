import { Routes, Route } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { CreateActivityLayout } from '@/components/layout/CreateActivityLayout'
import DashboardPage from '@/pages/dashboard/DashboardPage'
import CreateActivityPage from '@/pages/activities/CreateActivityPage'
import ActivityListPage from '@/pages/activities/ActivityListPage'
import ActivityDetailPage from '@/pages/activities/ActivityDetailPage'
import ComponentListPage from '@/pages/components/ComponentListPage'
import CreateComponentPage from '@/pages/components/CreateComponentPage'
import ComponentDetailPage from '@/pages/components/ComponentDetailPage'
import TemplateListPage from '@/pages/templates/TemplateListPage'
import TemplateDetailPage from '@/pages/templates/TemplateDetailPage'
import SettingsPage from '@/pages/settings/SettingsPage'

export default function App() {
  return (
    <Routes>
      {/* 创建活动 — 全屏对话布局，但共享侧边栏和标签栏 */}
      <Route element={<CreateActivityLayout />}>
        <Route path="/activities/create" element={<CreateActivityPage />} />
      </Route>

      {/* 其他页面 — 标准管理后台布局 */}
      <Route element={<AppLayout />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/activities" element={<ActivityListPage />} />
        <Route path="/activities/:id" element={<ActivityDetailPage />} />
        <Route path="/components" element={<ComponentListPage />} />
        <Route path="/components/create" element={<CreateComponentPage />} />
        <Route path="/components/:id" element={<ComponentDetailPage />} />
        <Route path="/templates" element={<TemplateListPage />} />
        <Route path="/templates/:id" element={<TemplateDetailPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  )
}
