import type { ChatMessage } from '../api/types'

export function mergeMessageReceipt(
  existing: ChatMessage,
  incoming: Pick<ChatMessage, 'deliveredToRecipient' | 'readByRecipient'> & Partial<ChatMessage>,
) {
  return {
    ...existing,
    ...incoming,
    deliveredToRecipient: incoming.deliveredToRecipient ?? existing.deliveredToRecipient,
    readByRecipient: incoming.readByRecipient ?? existing.readByRecipient,
  }
}

export function patchMessageById(
  messages: ChatMessage[],
  messageId: string,
  patch: Partial<ChatMessage>,
) {
  return messages.map((message) =>
    message.id === messageId ? mergeMessageReceipt(message, patch) : message,
  )
}

export function markOwnMessagesReadBy(
  messages: ChatMessage[],
  senderId: string,
  readAt: string,
) {
  const readTime = new Date(readAt).getTime()

  return messages.map((message) => {
    if (message.sender.id !== senderId) {
      return message
    }

    if (new Date(message.createdAt).getTime() > readTime) {
      return message
    }

    return mergeMessageReceipt(message, {
      deliveredToRecipient: true,
      readByRecipient: true,
    })
  })
}

export function patchLastMessageReceipt(
  lastMessage: ChatMessage | null,
  messageId: string,
  patch: Partial<ChatMessage>,
) {
  if (!lastMessage || lastMessage.id !== messageId) {
    return lastMessage
  }

  return mergeMessageReceipt(lastMessage, patch)
}

export function patchLastMessageReadBy(
  lastMessage: ChatMessage | null,
  senderId: string,
  readAt: string,
) {
  if (!lastMessage || lastMessage.sender.id !== senderId) {
    return lastMessage
  }

  if (new Date(lastMessage.createdAt).getTime() > new Date(readAt).getTime()) {
    return lastMessage
  }

  return mergeMessageReceipt(lastMessage, {
    deliveredToRecipient: true,
    readByRecipient: true,
  })
}
