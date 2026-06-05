/* 创建活动页面 — 主页面（AI 创建 / 手动创建 双模式）
   布局：左栏（会话/组件面板） | 中栏（对话流/画布） | 右栏（3 Tab：活动预览 / 组件配置 / 活动配置） */

import { useState, useEffect } from 'react'
import { Sparkles, MousePointerClick, Settings, Puzzle, Eye, Save } from 'lucide-react'
import { cn, showToast } from '@/lib/utils'
import { useTabStore } from '@/lib/tabStore'
import { useUIStore } from '@/lib/uiStore'
import { useNavigate } from 'react-router-dom'
import { useChat } from './hooks/useChat'
import { regionsToComponents } from './hooks/mockData'
import { SessionPanel } from './components/SessionPanel'
import { ChatFlow } from './components/ChatFlow'
import { ChatInput } from './components/ChatInput'
import { PreviewPanel } from './components/PreviewPanel'
import { ComponentPalette } from './components/ComponentPalette'
import { CanvasArea } from './components/CanvasArea'
import { PropertyPanel } from './components/PropertyPanel'
import { GlobalConfigPanel } from './components/GlobalConfigPanel'
// import { TemplateSelectorDialog } from './components/TemplateSelectorDialog' /* [模板功能暂停] */
import { useManualBuilder } from './hooks/useManualBuilder'
import { PublishDialog, PublishSuccessDialog, validateCanvas, validateGlobalConfig } from './components/PublishDialog'
import type { ValidationError } from './components/PublishDialog'
import type { ComponentItem } from '@/types/component'

type CreateMode = 'ai' | 'manual'
type RightTab = 'preview' | 'component' | 'activity'

export default function CreateActivityPage() {
  const openTab = useTabStore((s) => s.openTab)
  const navigate = useNavigate()
  const { sessionPanelWidth, sessionPanelCollapsed } = useUIStore()
  const [mode, setMode] = useState<CreateMode>('ai')
  const [rightTab, setRightTab] = useState<RightTab>('activity')

  useEffect(() => { openTab('/activities/create', '创建活动') }, [openTab])

  const chat = useChat()

  // 识别完成后不再自动跳预览，保持在对话流让用户继续交互
  // useEffect(() => {
  //   if (chat.recognitionRegions.length > 0) setRightTab('preview')
  // }, [chat.recognitionRegions])

  const builder = useManualBuilder()

  /* 点击画布组件 → 自动切到组件配置 Tab；null 表示取消选中 */
  const handleCanvasSelect = (idx: number | null) => {
    builder.setSelectedIdx(idx)
    if (idx !== null) setRightTab('component')
  }

  /* 添加组件到画布 → 自动切到组件配置 Tab */
  const handleAddToCanvas = (comp: ComponentItem) => {
    builder.addToCanvas(comp)
    setRightTab('component')
  }

  const [savingDraft, setSavingDraft] = useState(false)

  /* ── 保存草稿 ── */
  const handleSaveDraft = () => {
    const activityName = builder.globalConfig.activityName?.trim()
    if (!activityName) {
      showToast('请先在「活动配置」中填写活动名称')
      setRightTab('activity')
      return
    }
    setSavingDraft(true)
    setTimeout(() => {
      setSavingDraft(false)
      showToast(`「${activityName}」已保存为草稿`)
      // 跳转到活动管理
      openTab('/activities', '活动管理')
      navigate('/activities')
    }, 600)
  }

  /* ── 发布流程 ── */
  const [showPublishDialog, setShowPublishDialog] = useState(false)
  // const [showTemplateSelector, setShowTemplateSelector] = useState(false) /* [模板功能暂停] */
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const [publishErrors, setPublishErrors] = useState<ValidationError[]>([])
  const [publishedActivity, setPublishedActivity] = useState({ name: '', url: '' })

  const handlePublishClick = () => {
    const canvasErrors = validateCanvas(builder.canvas)
    const globalErrors = validateGlobalConfig(builder.globalConfig)
    setPublishErrors([...globalErrors, ...canvasErrors])
    setShowPublishDialog(true)
  }

  const handlePublishConfirm = (data: { name: string; startTime: string; endTime: string }) => {
    const activityId = `act-${Date.now().toString(36)}`
    const url = `https://activity.example.com/${activityId}`
    setPublishedActivity({ name: data.name, url })
    setShowPublishDialog(false)
    setShowSuccessDialog(true)
  }

  /* ── 右栏 Tab 定义（手动模式不显示预览 Tab） ── */
  const ALL_RIGHT_TABS: { key: RightTab; label: string; icon: React.ReactNode }[] = [
    { key: 'preview', label: '预览', icon: <Eye className="w-3.5 h-3.5" /> },
    { key: 'component', label: '组件配置', icon: <Puzzle className="w-3.5 h-3.5" /> },
    { key: 'activity', label: '活动配置', icon: <Settings className="w-3.5 h-3.5" /> },
  ]
  const rightTabs = mode === 'manual' ? ALL_RIGHT_TABS.filter((t) => t.key !== 'preview') : ALL_RIGHT_TABS

  // 手动模式切换时，如果当前停在 preview Tab 则自动跳到 component
  useEffect(() => {
    if (mode === 'manual' && rightTab === 'preview') setRightTab('component')
  }, [mode])

  return (
    <div className="flex h-full overflow-hidden">
      {/* ═══ 左栏 ═══ */}
      <div
        style={{ width: sessionPanelCollapsed ? 40 : sessionPanelWidth }}
        className="bg-white border-r border-gray-200 flex flex-col shrink-0 transition-[width] duration-200"
      >
        {!sessionPanelCollapsed && (
          <div className="shrink-0 border-b border-gray-100 px-2 py-1.5 flex items-center gap-1">
            <button onClick={() => setMode('ai')}
              className={cn('flex-1 inline-flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-medium transition-colors',
                mode === 'ai' ? 'bg-orange-500 text-white' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50')}>
              <Sparkles className="w-3.5 h-3.5" />AI 创建
            </button>
            <button onClick={() => setMode('manual')}
              className={cn('flex-1 inline-flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-medium transition-colors',
                mode === 'manual' ? 'bg-orange-500 text-white' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50')}>
              <MousePointerClick className="w-3.5 h-3.5" />手动创建
            </button>
          </div>
        )}

        {mode === 'ai' ? (
          <SessionPanel
            sessions={chat.sessions} renamingId={chat.renamingId} renameValue={chat.renameValue}
            contextMenu={chat.contextMenu} onNewSession={chat.handleNewSession}
            onSwitchSession={chat.handleSwitchSession}
            onContextMenu={(e, id) => chat.setContextMenu({ x: e.clientX, y: e.clientY, sessionId: id })}
            onRenameChange={chat.setRenameValue} onFinishRename={chat.handleFinishRename}
            onCancelRename={() => chat.setRenameValue('')}
            onCloseContextMenu={() => chat.setContextMenu(null)}
            onStartRename={chat.handleStartRename} onDeleteSession={chat.handleDeleteSession}
            embedded
          />
        ) : (
          <ComponentPalette onAdd={handleAddToCanvas} />
        )}
      </div>

      {/* ═══ 中 + 右 ═══ */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="flex-1 flex min-h-0 overflow-hidden">
          {/* 中栏 */}
          <div className="flex-1 min-w-0 overflow-hidden flex flex-col">
            {mode === 'ai' ? (
              <ChatFlow
                messages={chat.messages} messagesEndRef={chat.messagesEndRef}
                onUploadClick={() => chat.fileInputRef.current?.click()}
                onConfirmRegions={chat.handleConfirmRegions}
                onDropFiles={(files) => chat.handleFiles(files)}
                latestRegions={chat.recognitionRegions}
                onItemsChange={(regions) => chat.setPreviewComponents(regionsToComponents(regions.filter((r) => r.confirmed)))}
                // onSelectTemplate={() => setShowTemplateSelector(true)} /* [模板功能暂停] */
              />
            ) : (
              <CanvasArea
                canvas={builder.canvas} selectedIdx={builder.selectedIdx}
                onSelect={handleCanvasSelect}
                onMoveUp={builder.moveUp} onMoveDown={builder.moveDown}
                onRemove={builder.removeFromCanvas}
              />
            )}
          </div>

          {/* ═══ 右栏：3 Tab ═══ */}
          <div className="w-[320px] border-l border-gray-200 bg-white flex flex-col shrink-0 overflow-hidden">
            {/* Tab 栏 */}
            <div className="h-10 flex items-center border-b border-gray-100 shrink-0 px-1 gap-0.5">
              {rightTabs.map((tab) => (
                <button key={tab.key} onClick={() => setRightTab(tab.key)}
                  className={cn('flex-1 inline-flex items-center justify-center gap-1 h-8 rounded-lg text-xs font-medium transition-colors',
                    rightTab === tab.key ? 'bg-gray-100 text-gray-900' : 'text-gray-400 hover:text-gray-600')}>
                  {tab.icon}{tab.label}
                </button>
              ))}
            </div>

            {/* Tab 内容 */}
            <div className="flex-1 overflow-auto min-h-0">
              {rightTab === 'preview' && (
                <PreviewPanel
                  show={true}
                  components={chat.previewComponents}
                  onToggle={() => {}}
                  embedded
                  selectedIdx={chat.selectedCompIdx}
                  onSelectIdx={(idx) => {
                    chat.setSelectedCompIdx(chat.selectedCompIdx === idx ? null : idx)
                    setRightTab('component')
                  }}
                />
              )}
              {rightTab === 'component' && (
                mode === 'ai'
                  ? <PropertyPanel
                      selectedItem={null}
                      canvasCount={chat.canvasItems.length}
                      onUpdateParam={() => {}}
                      onUpdateVariant={() => {}}
                      canvas={chat.canvasItems}
                      selectedIdx={chat.selectedCompIdx}
                      onSelect={(idx) => chat.setSelectedCompIdx(idx)}
                      onUpdateParamAt={(idx, name, value) => chat.updateCanvasParam(idx, name, value)}
                      onUpdateVariantAt={(idx, variantId) => chat.updateCanvasVariant(idx, variantId)}
                      embedded
                    />
                  : <PropertyPanel
                      selectedItem={builder.selectedItem} canvasCount={builder.canvas.length}
                      onUpdateParam={(name, value) => { if (builder.selectedIdx !== null) builder.updateParam(builder.selectedIdx, name, value) }}
                      onUpdateVariant={(variantId) => { if (builder.selectedIdx !== null) builder.updateVariant(builder.selectedIdx, variantId) }}
                      canvas={builder.canvas}
                      selectedIdx={builder.selectedIdx}
                      onSelect={(idx) => handleCanvasSelect(idx)}
                      onUpdateParamAt={(idx, name, value) => builder.updateParam(idx, name, value)}
                      onUpdateVariantAt={(idx, variantId) => builder.updateVariant(idx, variantId)}
                      embedded
                    />
              )}
              {rightTab === 'activity' && (
                <GlobalConfigPanel config={builder.globalConfig} onUpdate={builder.updateGlobalConfig} />
              )}
            </div>

            {/* 底部按钮 */}
            {(builder.canvas.length > 0 || mode === 'ai') && (
              <div className="border-t border-gray-100 px-4 py-3 flex items-center justify-end gap-2 shrink-0">
                <button
                  onClick={handleSaveDraft}
                  disabled={savingDraft}
                  className={cn(
                    'inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors',
                    savingDraft
                      ? 'border-gray-200 text-gray-400 cursor-not-allowed bg-gray-50'
                      : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                  )}
                >
                  <Save className="w-3.5 h-3.5" />
                  {savingDraft ? '保存中...' : '保存草稿'}
                </button>
                <button
                  onClick={handlePublishClick}
                  className="px-3 py-1.5 text-xs font-medium bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                  发布
                </button>
              </div>
            )}
          </div>
        </div>

        {mode === 'ai' && (
          <ChatInput
            input={chat.input} inputRef={chat.inputRef} fileInputRef={chat.fileInputRef}
            onInputChange={chat.setInput} onSend={chat.handleSend} onFiles={chat.handleFiles}
          />
        )}
      </div>

      {/* [模板功能暂停]
      {showTemplateSelector && (
        <TemplateSelectorDialog
          onClose={() => setShowTemplateSelector(false)}
          onSelect={(tpl) => {
            chat.handleSelectTemplate(tpl)
            setShowTemplateSelector(false)
            setRightTab('preview')
          }}
        />
      )}
      */}

      {/* ═══ 弹窗 ═══ */}
      <PublishDialog
        open={showPublishDialog} errors={publishErrors}
        onClose={() => setShowPublishDialog(false)}
        onConfirm={handlePublishConfirm} globalConfig={builder.globalConfig}
      />
      <PublishSuccessDialog
        open={showSuccessDialog} activityName={publishedActivity.name}
        activityUrl={publishedActivity.url} onClose={() => setShowSuccessDialog(false)}
      />
    </div>
  )
}
