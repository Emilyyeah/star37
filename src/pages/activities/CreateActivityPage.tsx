/* 创建活动页面 — 主页面（布局编排 + 状态协调） */

import { useEffect } from 'react'
import { useTabStore } from '@/lib/tabStore'
import { useChat } from './hooks/useChat'
import { SessionPanel } from './components/SessionPanel'
import { ChatFlow } from './components/ChatFlow'
import { ChatInput } from './components/ChatInput'
import { PreviewPanel } from './components/PreviewPanel'

export default function CreateActivityPage() {
  const openTab = useTabStore((s) => s.openTab)

  useEffect(() => {
    openTab('/activities/create', '创建活动')
  }, [openTab])

  const chat = useChat()

  return (
    <div className="flex h-full overflow-hidden">
      {/* 左栏：会话历史（全高） */}
      <SessionPanel
        sessions={chat.sessions}
        renamingId={chat.renamingId}
        renameValue={chat.renameValue}
        contextMenu={chat.contextMenu}
        onNewSession={chat.handleNewSession}
        onSwitchSession={chat.handleSwitchSession}
        onContextMenu={(e, id) => chat.setContextMenu({ x: e.clientX, y: e.clientY, sessionId: id })}
        onRenameChange={chat.setRenameValue}
        onFinishRename={chat.handleFinishRename}
        onCancelRename={() => chat.setRenameValue('')}
        onCloseContextMenu={() => chat.setContextMenu(null)}
        onStartRename={chat.handleStartRename}
        onDeleteSession={chat.handleDeleteSession}
      />

      {/* 右侧内容区 */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* 上部：对话流 + 预览（同高） */}
        <div className="flex-1 flex min-h-0 overflow-hidden">
          <ChatFlow
            messages={chat.messages}
            messagesEndRef={chat.messagesEndRef}
            onUploadClick={() => chat.fileInputRef.current?.click()}
            onConfirmRegions={chat.handleConfirmRegions}
            onDropFiles={(files) => chat.handleFiles(files)}
          />
          <PreviewPanel
            show={chat.showPreview}
            components={chat.previewComponents}
            onToggle={chat.setShowPreview}
          />
        </div>

        {/* 底部：输入框 */}
        <ChatInput
          input={chat.input}
          inputRef={chat.inputRef}
          fileInputRef={chat.fileInputRef}
          onInputChange={chat.setInput}
          onSend={chat.handleSend}
          onFiles={chat.handleFiles}
        />
      </div>
    </div>
  )
}
