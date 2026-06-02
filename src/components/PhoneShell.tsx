/* 统一手机框组件 — 全项目所有预览场景复用
   参考 iPhone 15 Pro 外观：深色实体外壳、大圆角、细刘海、底部 Home 条
   用法：
     <PhoneShell width={260}>
       <div>活动内容</div>
     </PhoneShell>
   - width: 外壳总宽度（px），内屏高度按 9:19.5 比例自动计算
   - contentHeight: 不传则内容区填满内屏剩余空间（overflow:hidden）；
                    传入则内容区固定该高度并可滚动（用于需要滚动的预览）
*/

interface PhoneShellProps {
  width?: number
  contentHeight?: number
  children: React.ReactNode
  className?: string
}

export function PhoneShell({ width = 260, contentHeight, children, className }: PhoneShellProps) {
  const pad       = Math.round(width * 0.036)   // 外壳内边距
  const outerR    = Math.round(width * 0.168)   // 外壳圆角
  const innerR    = Math.round(width * 0.132)   // 内屏圆角
  const notchW    = Math.round(width * 0.22)    // 刘海宽
  const notchH    = Math.round(width * 0.038)   // 刘海高
  const notchBarH = Math.round(width * 0.068)   // 刘海行高

  // 内屏总高 = 按 9:19.5 比例，减去两侧 padding
  const innerW    = width - pad * 2
  const innerH    = Math.round(innerW / 9 * 19.5)
  // 内容区高 = 内屏总高 - 刘海行 - Home 条行
  const autoContentH = innerH - notchBarH

  return (
    <div
      className={className}
      style={{
        width,
        flexShrink: 0,
        background: '#1c2030',
        borderRadius: outerR,
        padding: pad,
        boxShadow: [
          '0 24px 64px rgba(0,0,0,0.40)',
          '0 8px 24px rgba(0,0,0,0.25)',
          'inset 0 0 0 1px rgba(255,255,255,0.06)',
        ].join(', '),
      }}
    >
      {/* 内屏 — 固定总高，超出裁切 */}
      <div
        className="phone-shell-inner"
        style={{
          width: innerW,
          height: innerH,
          borderRadius: innerR,
          overflow: 'clip',
          background: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          maxWidth: innerW,
        }}
      >
        {/* 刘海行 */}
        <div
          style={{
            height: notchBarH,
            flexShrink: 0,
            background: '#1c2030',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              width: notchW,
              height: notchH,
              background: '#0d1018',
              borderRadius: notchH / 2,
            }}
          />
        </div>

        {/* 内容区 */}
        <div
          style={
            contentHeight
              ? { height: contentHeight, flexShrink: 0, overflowY: 'auto' }
              : { height: autoContentH, flexShrink: 0, overflow: 'clip' }
          }
        >
          {children}
        </div>

      </div>
    </div>
  )
}
