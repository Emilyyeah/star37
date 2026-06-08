/* 活动主题 Store — 简约白卡风格
   只需两个变量：头图 URL + 主色调（从头图提取或用户指定）
   其余全部白色卡片，不做复杂主题 */

import { create } from 'zustand'

export interface ActivityTheme {
  /** 从头图提取的主色，用于按钮/强调/底部背景 */
  primaryColor: string
  /** 主色的浅版，用于页面底色 */
  primaryBg: string
  /** 主色文字版（深色，用于白卡片上的强调字） */
  primaryText: string
  /** 按钮文字色 */
  btnTextColor: string
}

export const DEFAULT_THEME: ActivityTheme = {
  primaryColor: '#1677FF',
  primaryBg: '#EEF4FF',
  primaryText: '#1255CC',
  btnTextColor: '#FFFFFF',
}

/* ─── Canvas 提取主色 ─── */
function extractPrimaryColor(img: HTMLImageElement): string {
  try {
    const canvas = document.createElement('canvas')
    canvas.width = 60; canvas.height = 60
    const ctx = canvas.getContext('2d')!
    ctx.drawImage(img, 0, 0, 60, 60)
    const data = ctx.getImageData(0, 0, 60, 60).data

    // 量化颜色，取饱和度最高且亮度适中的颜色
    const buckets: Record<string, { r: number; g: number; b: number; count: number }> = {}
    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] < 200) continue
      const r = Math.round(data[i] / 24) * 24
      const g = Math.round(data[i + 1] / 24) * 24
      const b = Math.round(data[i + 2] / 24) * 24
      const key = `${r},${g},${b}`
      if (!buckets[key]) buckets[key] = { r, g, b, count: 0 }
      buckets[key].count++
    }

    const sorted = Object.values(buckets).sort((a, b) => {
      // 按「饱和度高 + 亮度适中 + 出现频率」综合排序
      const satA = saturation(a.r, a.g, a.b), lumA = luminance(a.r, a.g, a.b)
      const satB = saturation(b.r, b.g, b.b), lumB = luminance(b.r, b.g, b.b)
      const scoreA = satA * 2 + (lumA > 40 && lumA < 200 ? 1 : 0) + a.count / 1000
      const scoreB = satB * 2 + (lumB > 40 && lumB < 200 ? 1 : 0) + b.count / 1000
      return scoreB - scoreA
    })

    const best = sorted[0] ?? { r: 22, g: 119, b: 255 }
    return toHex(best.r, best.g, best.b)
  } catch {
    return DEFAULT_THEME.primaryColor
  }
}

function saturation(r: number, g: number, b: number) {
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  return max === 0 ? 0 : (max - min) / max
}
function luminance(r: number, g: number, b: number) {
  return 0.299 * r + 0.587 * g + 0.114 * b
}
function toHex(r: number, g: number, b: number) {
  return '#' + [r, g, b].map((v) => Math.max(0, Math.min(255, v)).toString(16).padStart(2, '0')).join('')
}

/** 主色 → 派生浅底色和深色文字 */
function deriveTheme(hex: string): ActivityTheme {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  const lum = luminance(r, g, b)

  // 浅底色：主色 10% 不透明叠白
  const bgR = Math.round(r * 0.1 + 255 * 0.9)
  const bgG = Math.round(g * 0.1 + 255 * 0.9)
  const bgB = Math.round(b * 0.1 + 255 * 0.9)

  // 深色文字：主色加深 30%
  const textR = Math.round(r * 0.7)
  const textG = Math.round(g * 0.7)
  const textB = Math.round(b * 0.7)

  // 按钮文字：亮色主色用深文字，暗色用白
  const btnTextColor = lum > 160 ? '#1A1A1A' : '#FFFFFF'

  return {
    primaryColor: hex,
    primaryBg: toHex(bgR, bgG, bgB),
    primaryText: toHex(textR, textG, textB),
    btnTextColor,
  }
}

/* ─── Store ─── */
interface ThemeStore {
  theme: ActivityTheme
  heroImageUrl: string | null
  setHeroImage: (url: string | null) => void
  extractFromImage: (img: HTMLImageElement) => void
  setPrimaryColor: (hex: string) => void
  resetTheme: () => void
}

export const useThemeStore = create<ThemeStore>((set) => ({
  theme: { ...DEFAULT_THEME },
  heroImageUrl: null,

  setHeroImage: (url) => set({ heroImageUrl: url }),

  extractFromImage: (img) => {
    const color = extractPrimaryColor(img)
    set({ theme: deriveTheme(color) })
  },

  setPrimaryColor: (hex) => set({ theme: deriveTheme(hex) }),

  resetTheme: () => set({ theme: { ...DEFAULT_THEME }, heroImageUrl: null }),
}))
