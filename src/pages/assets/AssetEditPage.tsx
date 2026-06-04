/* AI 改图 — 上传原图 + 选择改图操作 + 预览结果
   布局：左栏（上传+操作选择+参数） | 右栏（原图 vs 结果对比） */

import { useState, useEffect } from 'react'
import { Wand2, Upload, Image, Download, Check, Loader2, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTabStore } from '@/lib/tabStore'
import { showToast } from '@/lib/utils'

/* ── 改图操作列表 ── */
const EDIT_OPERATIONS = [
  { key: 'resize', label: '智能改尺寸', desc: '内容感知重构，自动补全背景', color: 'bg-orange-50 text-orange-600' },
  { key: 'bg-remove', label: '去/换背景', desc: '一键抠图 + 背景替换', color: 'bg-blue-50 text-blue-600' },
  { key: 'text', label: '改文案', desc: '图上文字一键替换', color: 'bg-green-50 text-green-600' },
  { key: 'style', label: '改风格', desc: '同一内容切换美术风格', color: 'bg-purple-50 text-purple-600' },
  { key: 'element', label: '换元素', desc: '替换角色、背景、道具', color: 'bg-pink-50 text-pink-600' },
  { key: 'batch', label: '批量适配', desc: '一图生成所有尺寸版本', color: 'bg-cyan-50 text-cyan-600' },
]

/* ── 改尺寸的预设 ── */
const SIZE_PRESETS = [
  { key: 'banner', label: 'Banner', size: '750×400' },
  { key: 'popup', label: '弹窗', size: '600×800' },
  { key: 'splash', label: '开屏', size: '1080×1920' },
  { key: 'push', label: '推送图', size: '400×300' },
  { key: 'social-sq', label: '社媒方图', size: '1080×1080' },
  { key: 'social-h', label: '社媒横图', size: '1200×630' },
]

export default function AssetEditPage() {
  const openTab = useTabStore((s) => s.openTab)
  useEffect(() => { openTab('/assets/edit', 'AI 改图') }, [openTab])

  const [uploadedFile, setUploadedFile] = useState<{ name: string; color: string } | null>(null)
  const [selectedOp, setSelectedOp] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)
  const [resultReady, setResultReady] = useState(false)

  /* 改尺寸参数 */
  const [targetSize, setTargetSize] = useState<string | null>(null)

  /* 改文案参数 */
  const [originalText, setOriginalText] = useState('')
  const [newText, setNewText] = useState('')

  /* 换背景参数 */
  const [bgDesc, setBgDesc] = useState('')

  const PLACEHOLDER_COLORS = ['bg-blue-100', 'bg-purple-100', 'bg-orange-100', 'bg-green-100', 'bg-pink-100', 'bg-cyan-100']

  const handleUpload = () => {
    // Mock 上传
    setUploadedFile({
      name: '原始素材.png',
      color: PLACEHOLDER_COLORS[Math.floor(Math.random() * PLACEHOLDER_COLORS.length)],
    })
    setResultReady(false)
    setSelectedOp(null)
    showToast('图片已上传')
  }

  const handleProcess = () => {
    if (!uploadedFile) { showToast('请先上传图片'); return }
    if (!selectedOp) { showToast('请选择改图操作'); return }

    setProcessing(true)
    setResultReady(false)
    setTimeout(() => {
      setProcessing(false)
      setResultReady(true)
      showToast('处理完成')
    }, 2000)
  }

  /* ── 操作参数面板 ── */
  const renderParams = () => {
    if (!selectedOp) return null

    switch (selectedOp) {
      case 'resize':
        return (
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">目标尺寸</label>
            <div className="grid grid-cols-2 gap-2">
              {SIZE_PRESETS.map((s) => (
                <button key={s.key} onClick={() => setTargetSize(s.key)}
                  className={cn('text-left px-3 py-2.5 rounded-xl border transition-colors',
                    targetSize === s.key ? 'border-orange-400 bg-orange-50 text-orange-600' : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50')}>
                  <p className="text-xs font-medium">{s.label}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{s.size}</p>
                </button>
              ))}
            </div>
          </div>
        )
      case 'text':
        return (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">原文案</label>
              <input value={originalText} onChange={(e) => setOriginalText(e.target.value)} placeholder="图上原有的文字" className="field-input" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">替换为</label>
              <input value={newText} onChange={(e) => setNewText(e.target.value)} placeholder="要替换成的文字" className="field-input" />
            </div>
          </div>
        )
      case 'bg-remove':
        return (
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">新背景描述（留空则透明）</label>
            <textarea value={bgDesc} onChange={(e) => setBgDesc(e.target.value)} placeholder="例如：星空渐变背景、森林场景" rows={3} className="field-input resize-none" />
          </div>
        )
      case 'style':
        return (
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">目标风格</label>
            <div className="grid grid-cols-2 gap-2">
              {['写实', '二次元', 'Q版', '水墨国风'].map((s) => (
                <button key={s} className="px-3 py-2.5 rounded-xl border border-gray-200 text-xs font-medium text-gray-600 hover:border-orange-400 hover:bg-orange-50 hover:text-orange-600 transition-colors">
                  {s}
                </button>
              ))}
            </div>
          </div>
        )
      case 'element':
        return (
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">替换描述</label>
            <textarea placeholder="例如：把左边的角色替换为凡人修仙传的韩立" rows={3} className="field-input resize-none" />
          </div>
        )
      case 'batch':
        return (
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">需要生成的尺寸（全选）</label>
            <div className="space-y-1.5">
              {SIZE_PRESETS.map((s) => (
                <label key={s.key} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded border-gray-300 text-orange-500 focus:ring-orange-400" />
                  <span className="text-xs font-medium text-gray-700">{s.label}</span>
                  <span className="text-[10px] text-gray-400 ml-auto">{s.size}</span>
                </label>
              ))}
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="flex h-full overflow-hidden">
      {/* ═══ 左栏：操作配置 ═══ */}
      <div className="w-[340px] xl:w-[380px] border-r border-gray-200 bg-white flex flex-col shrink-0">
        <div className="px-4 pt-5 pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2 mb-1">
            <Wand2 className="w-5 h-5 text-gray-400" />
            <h1 className="text-lg font-semibold text-gray-900">AI 改图</h1>
          </div>
          <p className="text-xs text-gray-400">上传原图，选择改图操作，AI 自动处理</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {/* 上传区域 */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">上传原图 <span className="text-red-500">*</span></label>
            {uploadedFile ? (
              <div className={cn('rounded-xl border border-gray-200 overflow-hidden')}>
                <div className={cn('aspect-[16/9] flex items-center justify-center relative', uploadedFile.color)}>
                  <Image className="w-8 h-8 text-gray-300" />
                  <button onClick={() => { setUploadedFile(null); setResultReady(false) }}
                    className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-colors">
                    <X className="w-3 h-3" />
                  </button>
                </div>
                <div className="px-3 py-2 flex items-center justify-between">
                  <span className="text-xs text-gray-500">{uploadedFile.name}</span>
                  <button onClick={handleUpload} className="text-xs text-orange-500 hover:text-orange-600 font-medium">重新上传</button>
                </div>
              </div>
            ) : (
              <button
                onClick={handleUpload}
                className="w-full aspect-[16/9] rounded-xl border-2 border-dashed border-gray-200 hover:border-orange-400 flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-orange-500 transition-colors"
              >
                <Upload className="w-6 h-6" />
                <span className="text-xs font-medium">点击或拖拽上传</span>
                <span className="text-[10px] text-gray-300">支持 PNG / JPG / PSD</span>
              </button>
            )}
          </div>

          {/* 操作选择 */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">选择操作 <span className="text-red-500">*</span></label>
            <div className="grid grid-cols-2 gap-2">
              {EDIT_OPERATIONS.map((op) => (
                <button
                  key={op.key}
                  onClick={() => { setSelectedOp(op.key); setResultReady(false) }}
                  className={cn(
                    'text-left px-3 py-2.5 rounded-xl border transition-colors relative',
                    selectedOp === op.key
                      ? 'border-orange-400 bg-orange-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  )}
                >
                  <p className={cn('text-xs font-medium', selectedOp === op.key ? 'text-orange-600' : 'text-gray-700')}>{op.label}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{op.desc}</p>
                  {selectedOp === op.key && (
                    <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-orange-500 flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* 操作参数 */}
          {renderParams()}
        </div>

        {/* 底部操作 */}
        <div className="border-t border-gray-100 px-4 py-4 shrink-0">
          <button
            onClick={handleProcess}
            disabled={processing || !uploadedFile || !selectedOp}
            className={cn(
              'w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-colors',
              processing || !uploadedFile || !selectedOp
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-orange-500 text-white hover:bg-orange-600'
            )}
          >
            {processing ? (
              <><Loader2 className="w-4 h-4 animate-spin" />处理中...</>
            ) : (
              <><Wand2 className="w-4 h-4" />开始处理</>
            )}
          </button>
        </div>
      </div>

      {/* ═══ 右栏：对比预览 ═══ */}
      <div className="flex-1 overflow-auto bg-gray-50 p-5">
        {uploadedFile && resultReady ? (
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-gray-700">处理结果</p>
              <button onClick={() => showToast('已下载')} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-500 text-white text-xs font-medium rounded-lg hover:bg-orange-600 transition-colors">
                <Download className="w-3.5 h-3.5" />下载结果
              </button>
            </div>

            {/* 对比视图 */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-xs font-medium text-gray-500 mb-2">原图</p>
                <div className={cn('rounded-xl border border-gray-200 overflow-hidden')}>
                  <div className={cn('aspect-[4/3] flex items-center justify-center', uploadedFile.color)}>
                    <Image className="w-12 h-12 text-gray-300" />
                  </div>
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 mb-2 flex items-center gap-1">
                  结果
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-green-100 text-green-600 font-medium">
                    {EDIT_OPERATIONS.find((o) => o.key === selectedOp)?.label}
                  </span>
                </p>
                <div className="rounded-xl border border-gray-200 overflow-hidden">
                  <div className="aspect-[4/3] flex items-center justify-center bg-gradient-to-br from-orange-50 to-purple-50">
                    <Image className="w-12 h-12 text-gray-300" />
                  </div>
                </div>
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="mt-6 flex items-center gap-3">
              <button onClick={() => showToast('已保存到素材库')} className="inline-flex items-center gap-1.5 px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-xl hover:bg-orange-600 transition-colors">
                保存到素材库
              </button>
              <button onClick={() => { setResultReady(false); setSelectedOp(null) }} className="inline-flex items-center gap-1.5 px-4 py-2 border border-gray-200 text-gray-600 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors">
                继续改图
              </button>
            </div>
          </div>
        ) : uploadedFile && processing ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
            <Loader2 className="w-10 h-10 text-orange-400 animate-spin" />
            <div>
              <p className="text-sm font-medium text-gray-600">AI 正在处理中</p>
              <p className="text-xs text-gray-400 mt-1">
                {EDIT_OPERATIONS.find((o) => o.key === selectedOp)?.label}...
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center">
              <Wand2 className="w-8 h-8 text-gray-300" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">上传图片，选择改图操作</p>
              <p className="text-xs text-gray-400 mt-1">支持改尺寸、换背景、改文案、换风格等 6 种操作</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
