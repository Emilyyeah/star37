import { useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface ResizeHandleProps {
  onResize: (delta: number) => void
  className?: string
}

export function ResizeHandle({ onResize, className }: ResizeHandleProps) {
  const handleRef = useRef<HTMLDivElement>(null)
  const onResizeRef = useRef(onResize)
  onResizeRef.current = onResize

  useEffect(() => {
    const el = handleRef.current
    if (!el) return

    let dragging = false
    let lastX = 0

    const onMouseDown = (e: MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      dragging = true
      lastX = e.clientX
      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'
    }

    const onMouseMove = (e: MouseEvent) => {
      if (!dragging) return
      const delta = e.clientX - lastX
      if (delta !== 0) {
        lastX = e.clientX
        onResizeRef.current(delta)
      }
    }

    const onMouseUp = () => {
      if (!dragging) return
      dragging = false
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }

    el.addEventListener('mousedown', onMouseDown)
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)

    return () => {
      el.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }
  }, [])

  return (
    <div className={cn('relative shrink-0 select-none', className)} style={{ width: 5 }}>
      {/* 可见细线 */}
      <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-px bg-gray-200" />
      {/* 拖拽热区 */}
      <div
        ref={handleRef}
        className="absolute inset-y-0 cursor-col-resize z-10 hover:bg-orange-200/40 active:bg-orange-300/50 transition-colors"
        style={{ width: 12, left: -3 }}
      />
    </div>
  )
}
