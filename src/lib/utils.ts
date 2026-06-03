import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** 轻量 Toast — 底部居中，2.5s 自动消失 */
export function showToast(msg: string) {
  const el = document.createElement('div')
  el.textContent = msg
  el.style.cssText = [
    'position:fixed', 'bottom:32px', 'left:50%', 'transform:translateX(-50%)',
    'background:#1a1a1a', 'color:#fff', 'padding:10px 20px',
    'border-radius:10px', 'font-size:13px', 'z-index:9999',
    'pointer-events:none', 'white-space:nowrap',
    'box-shadow:0 4px 16px rgba(0,0,0,0.25)',
  ].join(';')
  document.body.appendChild(el)
  setTimeout(() => el.remove(), 2500)
}
