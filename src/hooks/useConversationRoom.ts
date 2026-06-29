import { useEffect, useRef } from 'react'
import type { ChatMessage } from '../lib/api/types'
import { bindSocketActivation } from '../lib/socket/bind-room'
import type {
  ConversationReadPayload,
  MessageDeliveredPayload,
  MessageStopTypingPayload,
  MessageTypingPayload,
} from '../lib/socket/types'
import { useSocket } from './useSocket'

type UseConversationRoomOptions = {
  conversationId: string | undefined
  enabled?: boolean
  onMessageCreated?: (message: ChatMessage) => void
  onMessageDelivered?: (payload: MessageDeliveredPayload) => void
  onConversationRead?: (payload: ConversationReadPayload) => void
  onTyping?: (payload: MessageTypingPayload) => void
  onStopTyping?: (payload: MessageStopTypingPayload) => void
}

export function useConversationRoom({
  conversationId,
  enabled = true,
  onMessageCreated,
  onMessageDelivered,
  onConversationRead,
  onTyping,
  onStopTyping,
}: UseConversationRoomOptions) {
  const { socket } = useSocket()
  const conversationIdRef = useRef(conversationId)
  const handlersRef = useRef({
    onMessageCreated,
    onMessageDelivered,
    onConversationRead,
    onTyping,
    onStopTyping,
  })

  conversationIdRef.current = conversationId
  handlersRef.current = {
    onMessageCreated,
    onMessageDelivered,
    onConversationRead,
    onTyping,
    onStopTyping,
  }

  useEffect(() => {
    if (!socket || !conversationId || !enabled) {
      return
    }

    const joinConversation = () => {
      const id = conversationIdRef.current
      if (id) {
        socket.emit('conversation:join', { conversationId: id })
      }
    }

    const leaveConversation = () => {
      socket.emit('conversation:leave', { conversationId })
    }

    const handleMessageCreated = (message: ChatMessage) => {
      handlersRef.current.onMessageCreated?.(message)
    }

    const handleMessageDelivered = (payload: MessageDeliveredPayload) => {
      handlersRef.current.onMessageDelivered?.(payload)
    }

    const handleConversationRead = (payload: ConversationReadPayload) => {
      handlersRef.current.onConversationRead?.(payload)
    }

    const handleTyping = (payload: MessageTypingPayload) => {
      handlersRef.current.onTyping?.(payload)
    }

    const handleStopTyping = (payload: MessageStopTypingPayload) => {
      handlersRef.current.onStopTyping?.(payload)
    }

    socket.on('message:created', handleMessageCreated)
    socket.on('message:delivered', handleMessageDelivered)
    socket.on('conversation:read', handleConversationRead)
    socket.on('message:typing', handleTyping)
    socket.on('message:stop_typing', handleStopTyping)

    const unbind = bindSocketActivation(socket, joinConversation)

    return () => {
      unbind()
      socket.off('message:created', handleMessageCreated)
      socket.off('message:delivered', handleMessageDelivered)
      socket.off('conversation:read', handleConversationRead)
      socket.off('message:typing', handleTyping)
      socket.off('message:stop_typing', handleStopTyping)
      leaveConversation()
    }
  }, [socket, conversationId, enabled])
}

export function useTypingEmitter(conversationId: string | undefined) {
  const { socket } = useSocket()
  const stopTimeoutRef = useRef<number | null>(null)
  const isTypingRef = useRef(false)

  useEffect(() => {
    return () => {
      if (stopTimeoutRef.current) {
        window.clearTimeout(stopTimeoutRef.current)
      }
    }
  }, [])

  function emitStopTyping() {
    if (!socket || !conversationId || !isTypingRef.current) {
      return
    }

    isTypingRef.current = false
    socket.emit('message:stop_typing', { conversationId })
  }

  function notifyTyping() {
    if (!socket || !conversationId) {
      return
    }

    if (!isTypingRef.current) {
      isTypingRef.current = true
      socket.emit('message:typing', { conversationId })
    }

    if (stopTimeoutRef.current) {
      window.clearTimeout(stopTimeoutRef.current)
    }

    stopTimeoutRef.current = window.setTimeout(() => {
      emitStopTyping()
    }, 2_000)
  }

  return {
    notifyTyping,
    emitStopTyping,
  }
}
