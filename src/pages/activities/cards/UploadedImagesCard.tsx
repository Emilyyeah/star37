/* 已上传设计稿卡片 — 支持识别结果区域框标注（F-004） */

import { useEffect, useRef, useState } from 'react'
import type { RecognitionRegion } from '../types'

/* 每个区域框对应的标签颜色（循环取色） */
const BOX_COLORS = ['#f97316', '#3b82f6', '#10b981', '#a855f7', '#ef4444', '#eab308']

interface UploadedImagesCardProps {
  images: string[]
  /** 识别结果，有则绘制区域框；无则纯展示图片 */
  regions?: RecognitionRegion[]
  /** 当前高亮的区域 id（鼠标悬停 RecognitionResultCard 时传入） */
  highlightId?: string | null
}

export function UploadedImagesCard({ images, regions, highlightId }: UploadedImagesCardProps) {
  return (
    <div className="flex gap-2 flex-wrap">
      {images.map((url, i) => (
        <AnnotatedImage
          key={i}
          url={url}
          index={i}
          regions={regions}
          highlightId={highlightId}
        />
      ))}
    </div>
  )
}

/* ── 单张图片 + Canvas 叠加层 ── */
function AnnotatedImage({
  url, index, regions, highlightId,
}: {
  url: string
  index: number
  regions?: RecognitionRegion[]
  highlightId?: string | null
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef    = useRef<HTMLCanvasElement>(null)
  const imgRef       = useRef<HTMLImageElement>(null)
  const [imgSize, setImgSize] = useState<{ w: number; h: number } | null>(null)

  /* 图片加载完成 → 记录尺寸 → 触发绘制 */
  const onLoad = () => {
    const img = imgRef.current
    if (!img) return
    setImgSize({ w: img.offsetWidth, h: img.offsetHeight })
  }

  /* 每次 imgSize / regions / highlightId 变化都重新画 */
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !imgSize || !regions?.length) return

    const { w, h } = imgSize
    canvas.width  = w
    canvas.height = h

    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, w, h)

    regions.forEach((r, i) => {
      if (!r.bbox) return
      const [rx, ry, rw, rh] = r.bbox
      const x = rx * w, y = ry * h
      const bw = rw * w, bh = rh * h
      const color = BOX_COLORS[i % BOX_COLORS.length]
      const isHL  = highlightId === r.id

      /* 半透明填充 */
      ctx.fillStyle = color + (isHL ? '33' : '18')
      ctx.fillRect(x, y, bw, bh)

      /* 边框 */
      ctx.strokeStyle = color
      ctx.lineWidth   = isHL ? 2.5 : 1.5
      ctx.setLineDash(isHL ? [] : [4, 3])
      ctx.strokeRect(x, y, bw, bh)
      ctx.setLineDash([])

      /* 标签背景 */
      const fontSize = Math.max(10, Math.round(w * 0.055))
      ctx.font = `bold ${fontSize}px system-ui, sans-serif`
      const text   = `${i + 1} ${r.matchedComponent}`
      const textW  = ctx.measureText(text).width
      const padX   = 6, padY = 4
      const labelH = fontSize + padY * 2
      const labelY = y < labelH + 2 ? y + 2 : y - labelH - 2

      ctx.fillStyle = color
      roundRect(ctx, x, labelY, textW + padX * 2, labelH, 4)
      ctx.fill()

      /* 标签文字 */
      ctx.fillStyle = '#ffffff'
      ctx.fillText(text, x + padX, labelY + padY + fontSize - 2)
    })
  }, [imgSize, regions, highlightId])

  /* ResizeObserver：容器尺寸变化时重算 */
  useEffect(() => {
    const img = imgRef.current
    if (!img) return
    const ro = new ResizeObserver(() => {
      setImgSize({ w: img.offsetWidth, h: img.offsetHeight })
    })
    ro.observe(img)
    return () => ro.disconnect()
  }, [])

  return (
    <div
      ref={containerRef}
      className="relative rounded-xl overflow-hidden border border-gray-200 shrink-0"
      style={{ width: 112, height: 176 }}
    >
      <img
        ref={imgRef}
        src={url}
        alt={`设计稿 ${index + 1}`}
        className="w-full h-full object-cover"
        onLoad={onLoad}
      />
      {/* Canvas 叠加层 */}
      {regions?.length ? (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 pointer-events-none"
          style={{ width: '100%', height: '100%' }}
        />
      ) : null}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-2">
        <span className="text-xs text-white font-medium">第 {index + 1} 页</span>
      </div>
    </div>
  )
}

/* 工具：圆角矩形路径 */
function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}
