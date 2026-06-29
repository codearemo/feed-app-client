import { apiClient } from './client'
import { unwrapData, unwrapPaginated } from './request'
import type {
  ChatMessage,
  ConversationSummary,
  CreateConversationBody,
  MessageDeliveredResult,
  SendMessageBody,
} from './types'

type PaginationQuery = {
  page?: number
  limit?: number
}

export const conversationsApi = {
  list({ page = 1, limit = 20 }: PaginationQuery = {}) {
    return apiClient
      .get('/conversations', { params: { page, limit } })
      .then((response) => unwrapPaginated<ConversationSummary>(response))
  },

  create(body: CreateConversationBody) {
    return apiClient
      .post('/conversations', body)
      .then((response) => unwrapData<ConversationSummary>(response))
  },

  get(conversationId: string) {
    return apiClient
      .get(`/conversations/${conversationId}`)
      .then((response) => unwrapData<ConversationSummary>(response))
  },

  markRead(conversationId: string) {
    return apiClient
      .post(`/conversations/${conversationId}/read`)
      .then((response) => unwrapData<ConversationSummary>(response))
  },

  listMessages(conversationId: string, { page = 1, limit = 50 }: PaginationQuery = {}) {
    return apiClient
      .get(`/conversations/${conversationId}/messages`, { params: { page, limit } })
      .then((response) => unwrapPaginated<ChatMessage>(response))
  },

  sendMessage(conversationId: string, body: SendMessageBody) {
    return apiClient
      .post(`/conversations/${conversationId}/messages`, body)
      .then((response) => unwrapData<ChatMessage>(response))
  },

  markMessageDelivered(conversationId: string, messageId: string) {
    return apiClient
      .post(`/conversations/${conversationId}/messages/${messageId}/delivered`)
      .then((response) => unwrapData<MessageDeliveredResult>(response))
  },
}
