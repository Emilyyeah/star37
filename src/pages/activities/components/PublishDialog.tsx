/* 发布确认弹窗 + 发布成功弹窗 — 手动/AI 模式共用 */

import { useState, useEffect, useMemo } from 'react'
import { X, AlertCircle, CheckCircle2, Copy, Check, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { CanvasItem, ActivityGlobalConfig } from '../hooks/useManualBuilder'

/* ═══════════════════════════════════════════
   一、校验相关
   ═══════════════════════════════════════════ */

export interface ValidationError {
  componentName: string
  paramLabel: string
  message: string
}

/** 校验画布中所有必填参数 */
export function validateCanvas(canvas: CanvasItem[]): ValidationError[] {
  const errors: ValidationError[] = []
  for (const item of canvas) {
    for (const param of item.schema) {
      if (!param.required) continue
      const val = item.params[param.name]
      const empty =
        val === undefined ||
        val === null ||
        val === '' ||
        (Array.isArray(val) && val.length === 0)
      if (empty) {
        errors.push({
          componentName: item.name,
          paramLabel: param.label,
          message: `「${item.name}」的「${param.label}」为必填项`,
        })
      }
    }
  }
  return errors
}

/** 校验全局配置必填项 */
export function validateGlobalConfig(config: ActivityGlobalConfig): ValidationError[] {
  const errors: ValidationError[] = []
  if (!config.gameProject) {
    errors.push({ componentName: '活动配置', paramLabel: '所属游戏', message: '请选择所属游戏项目' })
  }
  if (!config.activityName.trim()) {
    errors.push({ componentName: '活动配置', paramLabel: '活动名称', message: '请输入活动名称' })
  }
  if (!config.startTime) {
    errors.push({ componentName: '活动配置', paramLabel: '开始时间', message: '请设置活动开始时间' })
  }
  if (!config.endTime) {
    errors.push({ componentName: '活动配置', paramLabel: '结束时间', message: '请设置活动结束时间' })
  }
  if (config.startTime && config.endTime && config.startTime >= config.endTime) {
    errors.push({ componentName: '活动配置', paramLabel: '活动时间', message: '结束时间必须晚于开始时间' })
  }
  return errors
}

/* ═══════════════════════════════════════════
   二、发布确认弹窗
   ═══════════════════════════════════════════ */

interface PublishDialogProps {
  open: boolean
  errors: ValidationError[]
  onClose: () => void
  onConfirm: (data: { name: string; startTime: string; endTime: string }) => void
  globalConfig?: ActivityGlobalConfig
}

export function PublishDialog({ open, errors, onClose, onConfirm, globalConfig }: PublishDialogProps) {
  const [name, setName] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [localErrors, setLocalErrors] = useState<string[]>([])

  // 从全局配置预填
  useEffect(() => {
    if (open && globalConfig) {
      if (globalConfig.activityName) setName(globalConfig.activityName)
      if (globalConfig.startTime) setStartTime(globalConfig.startTime)
      if (globalConfig.endTime) setEndTime(globalConfig.endTime)
    }
  }, [open, globalConfig])

  // 按来源分组错误
  const globalErrors = errors.filter((e) => e.componentName === '活动配置')
  const componentErrors = errors.filter((e) => e.componentName !== '活动配置')
  const hasErrors = errors.length > 0

  const handleConfirm = () => {
    // 弹窗内不再重复校验活动名称/时间（已在全局配置校验过）
    // 只做最终确认
    const errs: string[] = []
    if (!name.trim()) errs.push('请输入活动名称')
    if (!startTime) errs.push('请选择开始时间')
    if (!endTime) errs.push('请选择结束时间')
    if (startTime && endTime && startTime >= endTime) errs.push('结束时间必须晚于开始时间')
    setLocalErrors(errs)
    if (errs.length > 0 || hasErrors) return
    onConfirm({ name: name.trim(), startTime, endTime })
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-[460px] max-h-[80vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-base font-semibold text-gray-900">发布活动</h3>
          <button onClick={onClose} className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-auto px-6 py-4 space-y-4">
          {/* 全局配置错误 */}
          {globalErrors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-red-600">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span className="text-sm font-medium">活动基础配置未完成：</span>
              </div>
              <ul className="space-y-1 pl-6">
                {globalErrors.map((err, i) => (
                  <li key={i} className="text-xs text-red-500 list-disc">{err.message}</li>
                ))}
              </ul>
              <p className="text-xs text-red-400 pt-1">请返回右侧「活动配置」面板补充（点击画布空白区域可切换）</p>
            </div>
          )}

          {/* 组件参数错误 */}
          {componentErrors.length > 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-orange-600">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span className="text-sm font-medium">以下组件参数未配置：</span>
              </div>
              <ul className="space-y-1 pl-6">
                {componentErrors.map((err, i) => (
                  <li key={i} className="text-xs text-orange-600 list-disc">{err.message}</li>
                ))}
              </ul>
            </div>
          )}

          {/* 发布确认信息（无错误时显示） */}
          {!hasErrors && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  活动名称
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-orange-400"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">开始时间</label>
                  <input
                    type="datetime-local"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-orange-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">结束时间</label>
                  <input
                    type="datetime-local"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-orange-400"
                  />
                </div>
              </div>
              {/* 配置摘要 */}
              {globalConfig && (
                <div className="bg-gray-50 rounded-xl p-3 space-y-1.5">
                  <p className="text-xs font-medium text-gray-500">配置摘要</p>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                    <SummaryItem label="所属游戏" value={globalConfig.gameProject || '—'} />
                    <SummaryItem label="游戏 ID" value={globalConfig.gameId || '—'} />
                    <SummaryItem label="登录组件" value={globalConfig.loginMethods.join(', ') || '未选择'} />
                  </div>
                </div>
              )}
            </>
          )}

          {localErrors.length > 0 && (
            <div className="space-y-1">
              {localErrors.map((err, i) => (
                <p key={i} className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />{err}
                </p>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-gray-100 px-6 py-4 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            {hasErrors ? '返回修改' : '取消'}
          </button>
          <button
            onClick={handleConfirm}
            disabled={hasErrors}
            className={cn(
              'px-5 py-2 text-sm font-medium rounded-lg transition-colors',
              hasErrors
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-orange-500 text-white hover:bg-orange-600'
            )}
          >
            确认发布
          </button>
        </div>
      </div>
    </div>
  )
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-1">
      <span className="text-xs text-gray-400">{label}：</span>
      <span className="text-xs text-gray-700">{value}</span>
    </div>
  )
}

/* ═══════════════════════════════════════════
   三、发布成功弹窗
   ═══════════════════════════════════════════ */

interface PublishSuccessDialogProps {
  open: boolean
  activityName: string
  activityUrl: string
  onClose: () => void
}

export function PublishSuccessDialog({ open, activityName, activityUrl, onClose }: PublishSuccessDialogProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(activityUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = activityUrl
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const qrSize = 160

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-[420px] overflow-hidden">
        <div className="bg-green-50 px-6 pt-6 pb-4 text-center">
          <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">发布成功！</h3>
          <p className="text-sm text-gray-500 mt-1">{activityName}</p>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">活动链接</label>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 truncate">
                {activityUrl}
              </div>
              <button
                onClick={handleCopy}
                className={cn(
                  'px-3 py-2 rounded-lg text-sm font-medium transition-colors shrink-0 flex items-center gap-1',
                  copied ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                )}
              >
                {copied ? <><Check className="w-3.5 h-3.5" />已复制</> : <><Copy className="w-3.5 h-3.5" />复制</>}
              </button>
            </div>
          </div>

          <div className="text-center">
            <label className="block text-xs font-medium text-gray-500 mb-2">扫码预览</label>
            <div className="inline-block p-3 bg-white border border-gray-200 rounded-xl">
              <MockQrCode size={qrSize} />
            </div>
            <p className="text-xs text-gray-400 mt-2">使用微信扫码预览活动页面</p>
          </div>
        </div>

        <div className="border-t border-gray-100 px-6 py-4 flex justify-between">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-1">
            <ExternalLink className="w-3.5 h-3.5" />查看活动详情
          </button>
          <button onClick={onClose} className="px-5 py-2 text-sm font-medium bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
            完成
          </button>
        </div>
      </div>
    </div>
  )
}

/* Mock 二维码 SVG */
function MockQrCode({ size }: { size: number }) {
  const cells = 21
  const cellSize = size / cells
  const pattern = useMemo(() => {
    const grid: boolean[][] = []
    for (let r = 0; r < cells; r++) {
      grid[r] = []
      for (let c = 0; c < cells; c++) {
        const isCorner =
          (r < 7 && c < 7) || (r < 7 && c >= cells - 7) || (r >= cells - 7 && c < 7)
        if (isCorner) {
          const cr = r < 7 ? r : r - (cells - 7)
          const cc = c < 7 ? c : c - (cells - 7)
          grid[r][c] =
            cr === 0 || cr === 6 || cc === 0 || cc === 6 || (cr >= 2 && cr <= 4 && cc >= 2 && cc <= 4)
        } else {
          grid[r][c] = Math.random() > 0.5
        }
      }
    }
    return grid
  }, [])

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {pattern.map((row, r) =>
        row.map((filled, c) =>
          filled ? (
            <rect key={`${r}-${c}`} x={c * cellSize} y={r * cellSize} width={cellSize} height={cellSize} fill="#1e293b" />
          ) : null
        )
      )}
    </svg>
  )
}
