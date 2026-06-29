import { apiClient } from './client'
import { unwrapData, unwrapPaginated } from './request'
import type {
  Comment,
  CreateContentBody,
  DeletedResource,
  FeedPost,
  UpdateContentBody,
} from './types'

type PaginationQuery = {
  page?: number
  limit?: number
}

export const postsApi = {
  create(body: CreateContentBody) {
    return apiClient.post('/posts', body).then((response) => unwrapData<FeedPost>(response))
  },

  get(postId: string) {
    return apiClient.get(`/posts/${postId}`).then((response) => unwrapData<FeedPost>(response))
  },

  update(postId: string, body: UpdateContentBody) {
    return apiClient
      .patch(`/posts/${postId}`, body)
      .then((response) => unwrapData<FeedPost>(response))
  },

  delete(postId: string) {
    return apiClient
      .delete(`/posts/${postId}`)
      .then((response) => unwrapData<DeletedResource>(response))
  },

  like(postId: string) {
    return apiClient.post(`/posts/${postId}/likes`).then((response) => unwrapData<FeedPost>(response))
  },

  unlike(postId: string) {
    return apiClient.delete(`/posts/${postId}/likes`).then((response) => unwrapData<FeedPost>(response))
  },

  listComments(postId: string, { page = 1, limit = 20 }: PaginationQuery = {}) {
    return apiClient
      .get(`/posts/${postId}/comments`, { params: { page, limit } })
      .then((response) => unwrapPaginated<Comment>(response))
  },

  createComment(postId: string, body: CreateContentBody) {
    return apiClient
      .post(`/posts/${postId}/comments`, body)
      .then((response) => unwrapData<Comment>(response))
  },

  likeComment(postId: string, commentId: string) {
    return apiClient
      .post(`/posts/${postId}/comments/${commentId}/likes`)
      .then((response) => unwrapData<Comment>(response))
  },

  unlikeComment(postId: string, commentId: string) {
    return apiClient
      .delete(`/posts/${postId}/comments/${commentId}/likes`)
      .then((response) => unwrapData<Comment>(response))
  },
}
