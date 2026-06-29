import { apiClient } from './client'
import { unwrapPaginated } from './request'
import type { FeedPost } from './types'

type FeedQuery = {
  page?: number
  limit?: number
}

export const feedApi = {
  list({ page = 1, limit = 20 }: FeedQuery = {}) {
    return apiClient
      .get('/feed', { params: { page, limit } })
      .then((response) => unwrapPaginated<FeedPost>(response))
  },
}
