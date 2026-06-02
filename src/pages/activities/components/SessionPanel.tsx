/* 会话历史面板
   embedded 模式：不渲染外层容器（由父组件管理宽度/折叠），只渲染标题栏+列表+右键菜单
   独立模式：自带容器，支持折叠/调宽 */

import { Plus, MessageSquare, PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUIStore } from '@/lib/uiStore'
import { ResizeHandle } from '@/components/layout/ResizeHandle'
import type { ConversationSession } from '../types'

interface SessionPanelProps {
  sessions: ConversationSession[]
  renamingId: string | null
  renameValue: string
  contextMenu: { x: number; y: number; sessionId: string } | null
  onNewSession: () => void
  onSwitchSession: (id: string) => void
  onContextMenu: (e: React.MouseEvent, sessionId: string) => void
  onRenameChange: (value: string) => void
  onFinishRename: () => void
  onCancelRename: () => void
  onCloseContextMenu: () => void
  onStartRename: (id: string) => void
  onDeleteSession: (id: string) => void
  embedded?: boolean
}

export function SessionPanel({
  sessions, renamingId, renameValue, contextMenu,
  onNewSession, onSwitchSession, onContextMenu,
  onRenameChange, onFinishRename, onCancelRename,
  onCloseContextMenu, onStartRename, onDeleteSession,
  embedded,
}: SessionPanelProps) {
  const { sessionPanelCollapsed, sessionPanelWidth, toggleSessionPanel, resizeSessionPanel } = useUIStore()

  /* ── 嵌入模式 ── */
  if (embedded) {
    return (
      <>
        <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100">
          <span className="text-xs font-medium text-gray-400">会话记录</span>
          <button onClick={onNewSession} className="flex items-center gap-1 px-2 py-1 bg-orange-500 text-white rounded-md text-xs font-medium hover:bg-orange-600 transition-colors">
            <Plus className="w-3 h-3" />新建
          </button>
        </div>
        <SessionList
          sessions={sessions} renamingId={renamingId} renameValue={renameValue}
          onSwitchSession={onSwitchSession} onContextMenu={onContextMenu}
          onRenameChange={onRenameChange} onFinishRename={onFinishRename} onCancelRename={onCancelRename}
        />
        {contextMenu && (
          <ContextMenu contextMenu={contextMenu} onClose={onCloseContextMenu} onStartRename={onStartRename} onDelete={onDeleteSession} />
        )}
      </>
    )
  }

  /* ── 独立模式：折叠态 ── */
  if (sessionPanelCollapsed) {
    return (
      <div className="w-10 bg-white border-r border-gray-200 flex flex-col items-center py-2 shrink-0">
        <button onClick={toggleSessionPanel} className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors" title="展开会话记录">
          <PanelLeftOpen className="w-4 h-4" />
        </button>
      </div>
    )
  }

  /* ── 独立模式：展开态 ── */
  return (
    <>
      <div style={{ width: sessionPanelWidth }} className="bg-white border-r border-gray-200 flex flex-col shrink-0">
        <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100">
          <span className="text-xs font-medium text-gray-400">会话记录</span>
          <div className="flex items-center gap-1">
            <button onClick={onNewSession} className="flex items-center gap-1 px-2 py-1 bg-orange-500 text-white rounded-md text-xs font-medium hover:bg-orange-600 transition-colors">
              <Plus className="w-3 h-3" />新建
            </button>
            <button onClick={toggleSessionPanel} className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors" title="收起会话记录">
              <PanelLeftClose className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
        <SessionList
          sessions={sessions} renamingId={renamingId} renameValue={renameValue}
          onSwitchSession={onSwitchSession} onContextMenu={onContextMenu}
          onRenameChange={onRenameChange} onFinishRename={onFinishRename} onCancelRename={onCancelRename}
        />
      </div>
      <ResizeHandle onResize={resizeSessionPanel} />
      {contextMenu && (
        <ContextMenu contextMenu={contextMenu} onClose={onCloseContextMenu} onStartRename={onStartRename} onDelete={onDeleteSession} />
      )}
    </>
  )
}

/* ── 会话列表（纯列表，不含标题栏） ── */
function SessionList({
  sessions, renamingId, renameValue,
  onSwitchSession, onContextMenu,
  onRenameChange, onFinishRename, onCancelRename,
}: {
  sessions: ConversationSession[]
  renamingId: string | null
  renameValue: string
  onSwitchSession: (id: string) => void
  onContextMenu: (e: React.MouseEvent, sessionId: string) => void
  onRenameChange: (value: string) => void
  onFinishRename: () => void
  onCancelRename: () => void
}) {
  return (
    <div className="flex-1 overflow-auto py-1 px-2 space-y-0.5">
      {sessions.map((session) => (
        <div
          key={session.id}
          onClick={() => onSwitchSession(session.id)}
          onContextMenu={(e) => { e.preventDefault(); onContextMenu(e, session.id) }}
          className={cn(
            'w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left transition-colors cursor-pointer',
            session.active ? 'bg-orange-50 text-orange-700' : 'text-gray-600 hover:bg-gray-50'
          )}
        >
          <MessageSquare className="w-3.5 h-3.5 shrink-0" />
          <div className="flex-1 min-w-0">
            {renamingId === session.id ? (
              <input
                autoFocus value={renameValue}
                onChange={(e) => onRenameChange(e.target.value)}
                onBlur={onFinishRename}
                onKeyDown={(e) => { if (e.key === 'Enter') onFinishRename(); if (e.key === 'Escape') onCancelRename() }}
                onClick={(e) => e.stopPropagation()}
                className="text-xs font-medium w-full bg-white border border-orange-300 rounded px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-orange-400"
              />
            ) : (
              <p className="text-xs font-medium truncate">{session.title}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

/* ── 右键菜单 ── */
function ContextMenu({ contextMenu, onClose, onStartRename, onDelete }: {
  contextMenu: { x: number; y: number; sessionId: string }
  onClose: () => void
  onStartRename: (id: string) => void
  onDelete: (id: string) => void
}) {
  return (
    <div className="fixed inset-0 z-50" onClick={onClose}>
      <div
        className="absolute bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[120px]"
        style={{ left: contextMenu.x, top: contextMenu.y }}
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={() => onStartRename(contextMenu.sessionId)} className="w-full px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50 text-left">重命名</button>
        <button onClick={() => onDelete(contextMenu.sessionId)} className="w-full px-3 py-1.5 text-xs text-red-500 hover:bg-red-50 text-left">删除</button>
      </div>
    </div>
  )
}
