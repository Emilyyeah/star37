import { create } from 'zustand'

export interface Tab {
  id: string
  path: string
  label: string
  icon?: string
  closable: boolean
}

interface TabStore {
  tabs: Tab[]
  activeTabId: string
  openTab: (path: string, label: string) => void
  closeTab: (id: string) => string | null
  setActiveTab: (id: string) => void
}

const HOME_TAB: Tab = {
  id: 'home',
  path: '/',
  label: '工作台',
  closable: false,
}

export const useTabStore = create<TabStore>((set, get) => ({
  tabs: [HOME_TAB],
  activeTabId: 'home',

  openTab: (path: string, label: string) => {
    const { tabs } = get()
    const existing = tabs.find((t) => t.path === path)
    if (existing) {
      set({ activeTabId: existing.id })
      return
    }
    const newTab: Tab = {
      id: String(Date.now()),
      path,
      label,
      closable: true,
    }
    set({ tabs: [...tabs, newTab], activeTabId: newTab.id })
  },

  closeTab: (id: string) => {
    const { tabs, activeTabId } = get()
    const idx = tabs.findIndex((t) => t.id === id)
    if (idx === -1 || !tabs[idx].closable) return null

    const newTabs = tabs.filter((t) => t.id !== id)
    let nextActiveId = activeTabId
    if (activeTabId === id) {
      // 关闭当前激活的标签，激活前一个或后一个
      const nextIdx = Math.min(idx, newTabs.length - 1)
      nextActiveId = newTabs[nextIdx]?.id || 'home'
    }
    set({ tabs: newTabs, activeTabId: nextActiveId })
    return newTabs.find((t) => t.id === nextActiveId)?.path || '/'
  },

  setActiveTab: (id: string) => {
    set({ activeTabId: id })
  },
}))
