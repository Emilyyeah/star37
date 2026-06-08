import { Routes, Route, Navigate } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { CreateActivityLayout } from '@/components/layout/CreateActivityLayout'
import { useAuthStore } from '@/lib/authStore'
import LoginPage from '@/pages/login/LoginPage'
import DashboardPage from '@/pages/dashboard/DashboardPage'
import CreateActivityPage from '@/pages/activities/CreateActivityPage'
import ActivityListPage from '@/pages/activities/ActivityListPage'
import ActivityDetailPage from '@/pages/activities/ActivityDetailPage'
import ComponentListPage from '@/pages/components/ComponentListPage'
import CreateComponentPage from '@/pages/components/CreateComponentPage'
import ComponentDetailPage from '@/pages/components/ComponentDetailPage'
// import TemplateListPage from '@/pages/templates/TemplateListPage'    /* [模板功能暂停] */
// import TemplateDetailPage from '@/pages/templates/TemplateDetailPage' /* [模板功能暂停] */
import SettingsPage from '@/pages/settings/SettingsPage'
import DataBoardPage from '@/pages/data/DataBoardPage'
import OverviewPage    from '@/pages/analytics/OverviewPage'
import ComponentsPage  from '@/pages/analytics/ComponentsPage'
import EffectsPage     from '@/pages/analytics/EffectsPage'
import DetailPage      from '@/pages/analytics/DetailPage'
import AssetLibraryPage from '@/pages/assets/AssetLibraryPage'
import AssetGeneratePage from '@/pages/assets/AssetGeneratePage'
import AssetEditPage from '@/pages/assets/AssetEditPage'
import AssetTemplatePage from '@/pages/assets/AssetTemplatePage'
import CreditsPage from '@/pages/credits/CreditsPage'

/* ── 登录守卫 ── */
function RequireAuth({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user)
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <Routes>
      {/* 登录页 — 不需要认证 */}
      <Route path="/login" element={<LoginPage />} />

      {/* 全屏对话布局（共享侧边栏和标签栏，无内容区 padding） */}
      <Route element={<RequireAuth><CreateActivityLayout /></RequireAuth>}>
        <Route path="/activities/create" element={<CreateActivityPage />} />
        <Route path="/components/create" element={<CreateComponentPage />} />
        <Route path="/assets/generate" element={<AssetGeneratePage />} />
        <Route path="/assets/edit" element={<AssetEditPage />} />
      </Route>

      {/* 标准管理后台布局 */}
      <Route element={<RequireAuth><AppLayout /></RequireAuth>}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/activities" element={<ActivityListPage />} />
        <Route path="/activities/:id" element={<ActivityDetailPage />} />
        <Route path="/components" element={<ComponentListPage />} />
        <Route path="/components/:id" element={<ComponentDetailPage />} />
        {/* <Route path="/templates" element={<TemplateListPage />} /> */}
        {/* <Route path="/templates/:id" element={<TemplateDetailPage />} /> */}
        {/* [模板功能暂停] */}
        <Route path="/assets" element={<AssetLibraryPage />} />
        <Route path="/assets/templates" element={<AssetTemplatePage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/credits" element={<CreditsPage />} />
        <Route path="/data" element={<DataBoardPage />} />
        <Route path="/analytics/overview"   element={<OverviewPage />} />
        <Route path="/analytics/components" element={<ComponentsPage />} />
        <Route path="/analytics/effects"    element={<EffectsPage />} />
        <Route path="/analytics/detail"     element={<DetailPage />} />
      </Route>
    </Routes>
  )
}
