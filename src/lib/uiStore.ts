import { create } from 'zustand'

interface UIStore {
  sidebarCollapsed: boolean
  toggleSidebar: () => void

  sessionPanelCollapsed: boolean
  sessionPanelWidth: number
  toggleSessionPanel: () => void
  setSessionPanelWidth: (w: number) => void
  resizeSessionPanel: (delta: number) => void
}

export const useUIStore = create<UIStore>((set) => ({
  sidebarCollapsed: false,
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),

  sessionPanelCollapsed: false,
  sessionPanelWidth: 220,
  toggleSessionPanel: () => set((s) => ({ sessionPanelCollapsed: !s.sessionPanelCollapsed })),
  setSessionPanelWidth: (w: number) => set({ sessionPanelWidth: Math.max(160, Math.min(400, w)) }),
  resizeSessionPanel: (delta: number) =>
    set((s) => ({ sessionPanelWidth: Math.max(160, Math.min(400, s.sessionPanelWidth + delta)) })),
}))
