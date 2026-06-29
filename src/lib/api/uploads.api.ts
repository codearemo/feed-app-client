import { apiClient } from './client'
import { unwrapData } from './request'
import type { UploadFile } from './types'

export const uploadsApi = {
  upload(files: File | File[]) {
    const formData = new FormData()
    const fileList = Array.isArray(files) ? files : [files]

    fileList.forEach((file) => {
      formData.append('files', file)
    })

    return apiClient
      .post('/uploads', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      .then((response) => unwrapData<UploadFile[]>(response))
  },

  delete(fileId: string) {
    return apiClient.delete(`/uploads/${fileId}`).then((response) => unwrapData(response))
  },

  getDownloadUrl(fileId: string) {
    const baseUrl = apiClient.defaults.baseURL?.replace(/\/$/, '') ?? '/api/v1'
    return `${baseUrl}/uploads/${fileId}/download`
  },
}
