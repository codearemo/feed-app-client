import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useAuth } from './AuthContext'
import { conversationsApi } from '../lib/api/conversations.api'
import type { ChatMessage, ConversationSummary } from '../lib/api/types'
import {
  patchLastMessageReadBy,
  patchLastMessageReceipt,
} from '../lib/chat/receipts'
import { getErrorMessage } from '../lib/forms/getFieldErrors'
import type {
  ConversationReadPayload,
  MessageDeliveredPayload,
} from '../lib/socket/types'
import { useSocket } from '../hooks/useSocket'

type ChatInboxContextValue = {
  conversations: ConversationSummary[]
  totalUnread: number
  isLoading: boolean
  error?: string
  activeConversationId: string | null
  refresh: () => Promise<void>
  upsertConversation: (conversation: ConversationSummary) => void
  applyIncomingMessage: (conversationId: string, message: ChatMessage) => void
  clearUnread: (conversationId: string) => void
  setActiveConversationId: (conversationId: string | null) => void
}

const ChatInboxContext = createContext<ChatInboxContextValue | null>(null)

function sortConversations(items: ConversationSummary[]) {
  return [...items].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  )
}

export function ChatInboxProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, user } = useAuth()
  const { socket } = useSocket()
  const [conversations, setConversations] = useState<ConversationSummary[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>()
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null)
  const activeConversationIdRef = useRef<string | null>(null)

  activeConversationIdRef.current = activeConversationId

  const refresh = useCallback(async () => {
    if (!isAuthenticated) {
      return
    }

    setIsLoading(true)
    setError(undefined)

    try {
      const result = await conversationsApi.list({ page: 1, limit: 50 })
      setConversations(sortConversations(result.data))
    } catch (loadError) {
      setError(getErrorMessage(loadError, 'Unable to load messages'))
    } finally {
      setIsLoading(false)
    }
  }, [isAuthenticated])

  useEffect(() => {
    if (!isAuthenticated) {
      setConversations([])
      return
    }

    void refresh()
  }, [isAuthenticated, refresh])

  useEffect(() => {
    if (!socket || !isAuthenticated) {
      return
    }

    const activeSocket = socket

    function handleMessageReceived({
      conversationId,
      message,
    }: {
      conversationId: string
      message: ChatMessage
    }) {
      if (message.sender.id === user?.id) {
        return
      }

      activeSocket.emit('message:delivered', {
        conversationId,
        messageId: message.id,
      })

      setConversations((current) => {
        const existing = current.find((item) => item.id === conversationId)
        const isActive = activeConversationIdRef.current === conversationId

        if (existing) {
          return sortConversations(
            current.map((item) =>
              item.id === conversationId
                ? {
                    ...item,
                    lastMessage: message,
                    unreadCount: isActive ? 0 : item.unreadCount + 1,
                    updatedAt: message.createdAt,
                  }
                : item,
            ),
          )
        }

        void refresh()
        return current
      })
    }

    function handleMessageSent(message: ChatMessage) {
      setConversations((current) =>
        sortConversations(
          current.map((item) =>
            item.id === message.conversationId
              ? {
                  ...item,
                  lastMessage: message,
                  updatedAt: message.createdAt,
                }
              : item,
          ),
        ),
      )
    }

    function handleMessageDelivered({ conversationId, messageId, message }: MessageDeliveredPayload) {
      setConversations((current) =>
        sortConversations(
          current.map((item) =>
            item.id === conversationId
              ? {
                  ...item,
                  lastMessage: patchLastMessageReceipt(item.lastMessage, messageId, message),
                }
              : item,
          ),
        ),
      )
    }

    function handleConversationRead({ conversationId, userId, readAt }: ConversationReadPayload) {
      if (userId === user?.id) {
        return
      }

      setConversations((current) =>
        sortConversations(
          current.map((item) =>
            item.id === conversationId
              ? {
                  ...item,
                  participantLastReadAt: readAt,
                  lastMessage: patchLastMessageReadBy(item.lastMessage, user?.id ?? '', readAt),
                }
              : item,
          ),
        ),
      )
    }

    activeSocket.on('message:received', handleMessageReceived)
    activeSocket.on('message:sent', handleMessageSent)
    activeSocket.on('message:delivered', handleMessageDelivered)
    activeSocket.on('conversation:read', handleConversationRead)

    return () => {
      activeSocket.off('message:received', handleMessageReceived)
      activeSocket.off('message:sent', handleMessageSent)
      activeSocket.off('message:delivered', handleMessageDelivered)
      activeSocket.off('conversation:read', handleConversationRead)
    }
  }, [socket, isAuthenticated, user?.id, refresh])

  const upsertConversation = useCallback((conversation: ConversationSummary) => {
    setConversations((current) => {
      const without = current.filter((item) => item.id !== conversation.id)
      return sortConversations([conversation, ...without])
    })
  }, [])

  const applyIncomingMessage = useCallback((conversationId: string, message: ChatMessage) => {
    setConversations((current) =>
      sortConversations(
        current.map((item) =>
          item.id === conversationId
            ? {
                ...item,
                lastMessage: message,
                updatedAt: message.createdAt,
              }
            : item,
        ),
      ),
    )
  }, [])

  const clearUnread = useCallback((conversationId: string) => {
    setConversations((current) =>
      current.map((item) =>
        item.id === conversationId
          ? {
              ...item,
              unreadCount: 0,
            }
          : item,
      ),
    )
  }, [])

  const totalUnread = useMemo(
    () => conversations.reduce((sum, item) => sum + item.unreadCount, 0),
    [conversations],
  )

  const value = useMemo(
    () => ({
      conversations,
      totalUnread,
      isLoading,
      error,
      activeConversationId,
      refresh,
      upsertConversation,
      applyIncomingMessage,
      clearUnread,
      setActiveConversationId,
    }),
    [
      conversations,
      totalUnread,
      isLoading,
      error,
      activeConversationId,
      refresh,
      upsertConversation,
      applyIncomingMessage,
      clearUnread,
    ],
  )

  return <ChatInboxContext.Provider value={value}>{children}</ChatInboxContext.Provider>
}

export function useChatInbox() {
  const context = useContext(ChatInboxContext)

  if (!context) {
    throw new Error('useChatInbox must be used within ChatInboxProvider')
  }

  return context
}
