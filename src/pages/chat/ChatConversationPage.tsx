import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { FeedHeader } from '../../components/layout/FeedHeader'
import { MessageStatus } from '../../components/chat/MessageStatus'
import { Avatar } from '../../components/ui/Avatar'
import { Button } from '../../components/ui/Button'
import { useAuth } from '../../context/AuthContext'
import { useChatInbox } from '../../context/ChatInboxContext'
import { useConversationRoom, useTypingEmitter } from '../../hooks/useConversationRoom'
import { conversationsApi } from '../../lib/api/conversations.api'
import type { ChatMessage, ConversationSummary } from '../../lib/api/types'
import { markOwnMessagesReadBy, patchMessageById } from '../../lib/chat/receipts'
import { getErrorMessage } from '../../lib/forms/getFieldErrors'
import { formatMessageTime } from '../../lib/utils/format'
import { getUserDisplayName } from '../../lib/user/display'
import { postAuthorToAvatarUser, publicProfileToAvatarUser } from '../../lib/user/avatar'

function appendUniqueMessage(messages: ChatMessage[], message: ChatMessage) {
  if (messages.some((item) => item.id === message.id)) {
    return messages
  }

  return [...messages, message]
}

export function ChatConversationPage() {
  const { conversationId } = useParams()
  const navigate = useNavigate()
  const { user: currentUser } = useAuth()
  const {
    applyIncomingMessage,
    clearUnread,
    setActiveConversationId,
    upsertConversation,
  } = useChatInbox()
  const [conversation, setConversation] = useState<ConversationSummary | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string>()
  const [content, setContent] = useState('')
  const [contentError, setContentError] = useState<string>()
  const [typingUserIds, setTypingUserIds] = useState<string[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { notifyTyping, emitStopTyping } = useTypingEmitter(conversationId)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    if (!conversationId) {
      return
    }

    setActiveConversationId(conversationId)

    return () => {
      setActiveConversationId(null)
    }
  }, [conversationId, setActiveConversationId])

  useEffect(() => {
    if (!conversationId) {
      return
    }

    let cancelled = false

    async function loadConversation(id: string) {
      setIsLoading(true)
      setError(undefined)

      try {
        const [summary, messagePage] = await Promise.all([
          conversationsApi.get(id),
          conversationsApi.listMessages(id, { page: 1, limit: 100 }),
        ])

        if (cancelled) {
          return
        }

        setConversation(summary)
        setMessages(messagePage.data)
        upsertConversation(summary)

        const readSummary = await conversationsApi.markRead(id)
        if (!cancelled) {
          setConversation(readSummary)
          upsertConversation(readSummary)
          clearUnread(id)
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(getErrorMessage(loadError, 'Unable to load conversation'))
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    void loadConversation(conversationId)

    return () => {
      cancelled = true
    }
  }, [clearUnread, conversationId, upsertConversation])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  useConversationRoom({
    conversationId,
    enabled: Boolean(conversationId),
    onMessageCreated: (message) => {
      setMessages((current) => appendUniqueMessage(current, message))
      applyIncomingMessage(message.conversationId, message)
    },
    onMessageDelivered: ({ messageId, message }) => {
      setMessages((current) => patchMessageById(current, messageId, message))
      if (conversationId) {
        applyIncomingMessage(conversationId, message)
      }
    },
    onConversationRead: ({ userId, readAt }) => {
      if (!currentUser?.id || userId === currentUser.id) {
        return
      }

      setMessages((current) => markOwnMessagesReadBy(current, currentUser.id, readAt))
      setConversation((current) =>
        current
          ? {
              ...current,
              participantLastReadAt: readAt,
              lastMessage: current.lastMessage
                ? markOwnMessagesReadBy([current.lastMessage], currentUser.id, readAt)[0]
                : null,
            }
          : current,
      )
    },
    onTyping: ({ user }) => {
      if (user.id === currentUser?.id) {
        return
      }

      setTypingUserIds((current) =>
        current.includes(user.id) ? current : [...current, user.id],
      )
    },
    onStopTyping: ({ userId }) => {
      setTypingUserIds((current) => current.filter((id) => id !== userId))
    },
  })

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setContentError(undefined)

    if (!conversationId) {
      return
    }

    const trimmed = content.trim()
    if (!trimmed) {
      setContentError('Message cannot be empty')
      return
    }

    if (trimmed.length > 2000) {
      setContentError('Message must be 2000 characters or fewer')
      return
    }

    emitStopTyping()
    setIsSending(true)

    try {
      const message = await conversationsApi.sendMessage(conversationId, { content: trimmed })
      setMessages((current) => appendUniqueMessage(current, message))
      applyIncomingMessage(conversationId, message)
      setContent('')
    } catch (sendError) {
      setContentError(getErrorMessage(sendError, 'Unable to send message'))
    } finally {
      setIsSending(false)
    }
  }

  if (!conversationId) {
    return null
  }

  if (isLoading) {
    return (
      <div>
        <FeedHeader title="Messages" backTo="/messages" backLabel="Inbox" />
        <p className="px-4 py-8 text-sm text-surface-500 dark:text-surface-400">Loading conversation...</p>
      </div>
    )
  }

  if (error || !conversation) {
    return (
      <div>
        <FeedHeader title="Messages" backTo="/messages" backLabel="Inbox" />
        <p className="px-4 py-8 text-sm text-red-600 dark:text-red-300">
          {error ?? 'Conversation not found'}
        </p>
      </div>
    )
  }

  const participant = publicProfileToAvatarUser(conversation.participant)
  const typingLabel =
    typingUserIds.length > 0 ? `${getUserDisplayName(participant)} is typing...` : null

  return (
    <div className="flex min-h-[calc(100svh-var(--app-header-height))] flex-col">
      <FeedHeader
        title={getUserDisplayName(participant)}
        backTo="/messages"
        backLabel="Inbox"
        actions={
          <button
            type="button"
            onClick={() => navigate(`/users/${conversation.participant.id}`)}
            className="rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            aria-label={`View ${getUserDisplayName(participant)} profile`}
          >
            <Avatar user={participant} size="sm" link={false} showPresence />
          </button>
        }
      />

      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {messages.map((message) => {
          const isOwn = message.sender.id === currentUser?.id
          const sender = postAuthorToAvatarUser(message.sender)

          return (
            <div
              key={message.id}
              className={`flex gap-2 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {!isOwn ? <Avatar user={sender} size="sm" link={false} showPresence /> : null}
              <div className={`max-w-[75%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
                <div
                  className={`rounded-2xl px-3.5 py-2 text-sm ${
                    isOwn
                      ? 'rounded-br-md bg-brand-600 text-white'
                      : 'rounded-bl-md bg-surface-100 text-surface-900 dark:bg-surface-800 dark:text-surface-100'
                  }`}
                >
                  <p className="whitespace-pre-wrap wrap-break-word">{message.content}</p>
                </div>
                <div className="mt-1 flex items-center gap-1 px-1">
                  <time
                    dateTime={message.createdAt}
                    className="text-[11px] text-surface-500 dark:text-surface-400"
                  >
                    {formatMessageTime(message.createdAt)}
                  </time>
                  {isOwn ? (
                    <MessageStatus
                      deliveredToRecipient={message.deliveredToRecipient}
                      readByRecipient={message.readByRecipient}
                    />
                  ) : null}
                </div>
              </div>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      {typingLabel ? (
        <p className="px-4 pb-1 text-xs text-surface-500 dark:text-surface-400">{typingLabel}</p>
      ) : null}

      <form
        className="border-t border-surface-200 px-4 py-3 dark:border-surface-800"
        onSubmit={(event) => void handleSubmit(event)}
      >
        <div className="flex items-end gap-2">
          <textarea
            value={content}
            onChange={(event) => {
              setContent(event.target.value)
              notifyTyping()
            }}
            onBlur={emitStopTyping}
            placeholder="Write a message..."
            rows={2}
            maxLength={2000}
            className="block min-h-11 flex-1 resize-none rounded-xl border border-surface-200 bg-white px-3.5 py-2.5 text-sm text-surface-900 shadow-sm placeholder:text-surface-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-surface-700 dark:bg-surface-900 dark:text-surface-100 dark:placeholder:text-surface-500 dark:focus:border-brand-400 dark:focus:ring-brand-400/20"
          />
          <Button type="submit" size="sm" disabled={isSending || !content.trim()}>
            Send
          </Button>
        </div>
        {contentError ? (
          <p className="mt-1.5 text-xs text-red-600 dark:text-red-300">{contentError}</p>
        ) : null}
      </form>
    </div>
  )
}
