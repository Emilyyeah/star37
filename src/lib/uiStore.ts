import { create } from 'zustand'

interface UIStore {
  sidebarCollapsed: boolean
  toggleSidebar: () => void

  sessionPanelCollapsed: boolean
  sessionPanelWidth: number
  toggleSessionPanel: () => void
  setSessionPanelWidth: (w: number) => void
  resizeSessionPanel: (delta: number) => void

  /** 侧边栏二级菜单展开状态 */
  expandedGroups: Set<string>
  toggleGroup: (path: string) => void
  expandGroup: (path: string) => void
}

export const useUIStore = create<UIStore>((set) => ({
  sidebarCollapsed: false,
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),

  sessionPanelCollapsed: false,
  sessionPanelWidth: 320,
  toggleSessionPanel: () => set((s) => ({ sessionPanelCollapsed: !s.sessionPanelCollapsed })),
  setSessionPanelWidth: (w: number) => set({ sessionPanelWidth: Math.max(200, Math.min(480, w)) }),
  resizeSessionPanel: (delta: number) =>
    set((s) => ({ sessionPanelWidth: Math.max(200, Math.min(480, s.sessionPanelWidth + delta)) })),

  expandedGroups: new Set<string>(),
  toggleGroup: (path: string) =>
    set((s) => {
      const next = new Set(s.expandedGroups)
      if (next.has(path)) next.delete(path)
      else next.add(path)
      return { expandedGroups: next }
    }),
  expandGroup: (path: string) =>
    set((s) => {
      if (s.expandedGroups.has(path)) return s
      const next = new Set(s.expandedGroups)
      next.add(path)
      return { expandedGroups: next }
    }),
}))
