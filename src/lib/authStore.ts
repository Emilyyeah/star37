/* ══════════════════════════════════════
   authStore — 账号 / 角色 / 权限管理
   ══════════════════════════════════════ */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/* ── 功能权限 key ── */
export type FeatureKey =
  | 'dashboard'          // 工作台
  | 'activity.create'    // 创建活动
  | 'activity.list'      // 活动管理（列表/详情）
  | 'component.list'     // 组件库（查看）
  | 'component.edit'     // 组件库（新建/编辑/复制/变体/变更状态）
  | 'asset.list'         // 素材库
  // | 'template.list'      // 模板库 /* [模板功能暂停] */
  | 'asset.generate'     // AI 生图
  | 'asset.edit'         // AI 改图
  | 'analytics'          // 数据分析
  | 'settings'           // 系统设置

/** 全部可选的功能权限（用于 UI 展示 checkbox） */
export const ALL_FEATURES: { key: FeatureKey; label: string }[] = [
  { key: 'dashboard', label: '工作台' },
  { key: 'activity.create', label: '创建活动' },
  { key: 'activity.list', label: '活动管理' },
  { key: 'component.list', label: '组件库（查看）' },
  { key: 'component.edit', label: '组件库（编辑）' },
  // { key: 'template.list', label: '模板库' }, /* [模板功能暂停] */
  { key: 'asset.list', label: '素材库' },
  { key: 'asset.generate', label: 'AI 生图' },
  { key: 'asset.edit', label: 'AI 改图' },
  { key: 'analytics', label: '数据分析' },
  { key: 'settings', label: '系统设置' },
]

/* ── 角色定义（动态） ── */
export interface RoleInfo {
  id: string
  name: string
  features: FeatureKey[]
}

/* ── 游戏权限粒度 ── */
export interface GamePermission {
  gameKey: string
  view: boolean
  edit: boolean
  data: boolean
}

/* ── 用户信息 ── */
export interface UserInfo {
  id: string
  name: string
  username: string
  password: string
  avatar: string
  roleId: string          // 关联角色 ID
  gamePermissions: GamePermission[]
}

/* ── 全部游戏列表 ── */
export const ALL_GAMES = [
  { key: 'dl3d', label: '斗罗3D' },
  { key: 'dlmmo', label: '斗罗MMO' },
  { key: 'frxxt', label: '凡人修仙传' },
  { key: 'sc33', label: '生存33天' },
  { key: 'zmsl', label: '织梦森林' },
  { key: 'xxyg', label: '小小蚁国' },
]

/* ── 初始角色 ── */
const INIT_ROLES: RoleInfo[] = [
  {
    id: 'role-admin',
    name: '管理员',
    features: [
      'dashboard', 'activity.create', 'activity.list',
      'component.list', 'component.edit',
      'asset.list', 'asset.generate', 'asset.edit',
      'analytics', 'settings',
    ],
  },
  {
    id: 'role-operator',
    name: '运营',
    features: [
      'dashboard', 'activity.create', 'activity.list',
      'component.list',
      'asset.list', 'asset.generate', 'asset.edit',
      'analytics',
    ],
  },
  {
    id: 'role-developer',
    name: '开发',
    features: [
      'dashboard', 'activity.list',
      'component.list', 'component.edit',
      'asset.list', 'analytics',
    ],
  },
]

/* ── 初始账号 ── */
const INIT_USERS: UserInfo[] = [
  {
    id: 'user-001', name: '艾米莉', username: 'emily', password: '123456',
    avatar: '👩‍💼', roleId: 'role-admin',
    gamePermissions: ALL_GAMES.map((g) => ({ gameKey: g.key, view: true, edit: true, data: true })),
  },
  {
    id: 'user-002', name: '小王', username: 'wang', password: '123456',
    avatar: '👨‍💻', roleId: 'role-operator',
    gamePermissions: [
      { gameKey: 'dl3d', view: true, edit: true, data: true },
      { gameKey: 'dlmmo', view: true, edit: true, data: true },
      { gameKey: 'frxxt', view: true, edit: false, data: false },
      { gameKey: 'sc33', view: false, edit: false, data: false },
      { gameKey: 'zmsl', view: false, edit: false, data: false },
      { gameKey: 'xxyg', view: false, edit: false, data: false },
    ],
  },
  {
    id: 'user-003', name: '小李', username: 'li', password: '123456',
    avatar: '🧑‍🔧', roleId: 'role-developer',
    gamePermissions: ALL_GAMES.map((g) => ({ gameKey: g.key, view: true, edit: false, data: true })),
  },
]

/* ── Store ── */
interface AuthStore {
  user: UserInfo | null
  roles: RoleInfo[]
  users: UserInfo[]

  /* 登录/登出 */
  loginByCredentials: (username: string, password: string) => boolean
  logout: () => void

  /* 角色 CRUD */
  addRole: (role: RoleInfo) => void
  updateRole: (id: string, patch: Partial<Omit<RoleInfo, 'id'>>) => void
  removeRole: (id: string) => void

  /* 账号 CRUD */
  addUser: (user: UserInfo) => void
  updateUser: (id: string, patch: Partial<Omit<UserInfo, 'id'>>) => void
  removeUser: (id: string) => void

  /* 便捷权限判断（基于当前登录用户） */
  hasFeature: (key: FeatureKey) => boolean
  canViewGame: (gameKey: string) => boolean
  canEditGame: (gameKey: string) => boolean
  canViewGameData: (gameKey: string) => boolean
  viewableGameKeys: () => string[]
  editableGameKeys: () => string[]

  /** 获取用户所属角色的功能权限列表 */
  getUserFeatures: (user: UserInfo) => FeatureKey[]
  /** 获取角色名称 */
  getRoleName: (roleId: string) => string
}

export const useAuthStore = create<AuthStore>()(persist((set, get) => ({
  user: null,
  roles: [...INIT_ROLES],
  users: [...INIT_USERS],

  loginByCredentials: (username: string, password: string) => {
    const { users } = get()
    const found = users.find((u) => u.username === username && u.password === password)
    if (found) { set({ user: found }); return true }
    return false
  },

  logout: () => set({ user: null }),

  /* ── 角色 CRUD ── */
  addRole: (role) => set((s) => ({ roles: [...s.roles, role] })),
  updateRole: (id, patch) => set((s) => ({
    roles: s.roles.map((r) => r.id === id ? { ...r, ...patch } : r),
  })),
  removeRole: (id) => set((s) => ({ roles: s.roles.filter((r) => r.id !== id) })),

  /* ── 账号 CRUD ── */
  addUser: (user) => set((s) => ({ users: [...s.users, user] })),
  updateUser: (id, patch) => set((s) => ({
    users: s.users.map((u) => u.id === id ? { ...u, ...patch } : u),
    // 如果编辑的是当前登录用户，同步更新 user 状态
    user: s.user?.id === id ? { ...s.user, ...patch } : s.user,
  })),
  removeUser: (id) => set((s) => ({ users: s.users.filter((u) => u.id !== id) })),

  /* ── 权限查询 ── */
  getUserFeatures: (user: UserInfo) => {
    const { roles } = get()
    const role = roles.find((r) => r.id === user.roleId)
    return role?.features ?? []
  },

  getRoleName: (roleId: string) => {
    const { roles } = get()
    return roles.find((r) => r.id === roleId)?.name ?? '未知'
  },

  hasFeature: (key: FeatureKey) => {
    const { user, roles } = get()
    if (!user) return false
    const role = roles.find((r) => r.id === user.roleId)
    return role?.features.includes(key) ?? false
  },

  canViewGame: (gameKey: string) => {
    const { user } = get()
    if (!user) return false
    return user.gamePermissions.find((g) => g.gameKey === gameKey)?.view ?? false
  },

  canEditGame: (gameKey: string) => {
    const { user } = get()
    if (!user) return false
    return user.gamePermissions.find((g) => g.gameKey === gameKey)?.edit ?? false
  },

  canViewGameData: (gameKey: string) => {
    const { user } = get()
    if (!user) return false
    return user.gamePermissions.find((g) => g.gameKey === gameKey)?.data ?? false
  },

  viewableGameKeys: () => {
    const { user } = get()
    if (!user) return []
    return user.gamePermissions.filter((g) => g.view).map((g) => g.gameKey)
  },

  editableGameKeys: () => {
    const { user } = get()
    if (!user) return []
    return user.gamePermissions.filter((g) => g.edit).map((g) => g.gameKey)
  },
}), {
  name: 'auth-store',
}))

/* ── 向后兼容：导出 ROLE_LABELS（从动态 roles 查） ── */
export const ROLE_LABELS = new Proxy({} as Record<string, string>, {
  get: (_, key: string) => {
    const { roles } = useAuthStore.getState()
    return roles.find((r) => r.id === key)?.name ?? key
  },
})
