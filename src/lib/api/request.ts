import type { AxiosResponse } from 'axios'
import type { ApiPagination, ApiSuccessBody } from './types'

export function unwrapData<T>(response: AxiosResponse<ApiSuccessBody<T>>): T {
  return response.data.data
}

export function unwrapMessage(response: AxiosResponse<ApiSuccessBody<null>>): string {
  return response.data.message
}

export function unwrapSuccess<T>(
  response: AxiosResponse<ApiSuccessBody<T>>,
): { data: T; message: string } {
  return {
    data: response.data.data,
    message: response.data.message,
  }
}

export function unwrapPaginated<T>(
  response: AxiosResponse<ApiSuccessBody<T[]>>,
): { data: T[]; pagination: ApiPagination } {
  if (!response.data.pagination) {
    throw new Error('Expected paginated response')
  }

  return {
    data: response.data.data,
    pagination: response.data.pagination,
  }
}
