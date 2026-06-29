import { apiClient } from './client'
import { unwrapData } from './request'
import type { PublicUserProfile, UpdateProfileBody, User } from './types'

export const usersApi = {
  getMe() {
    return apiClient.get('/users/me').then((response) => unwrapData<User>(response))
  },

  getPublicProfile(userId: string) {
    return apiClient.get(`/users/${userId}`).then((response) => unwrapData<PublicUserProfile>(response))
  },

  updateMe(body: UpdateProfileBody) {
    return apiClient.patch('/users/me', body).then((response) => unwrapData<User>(response))
  },
}
