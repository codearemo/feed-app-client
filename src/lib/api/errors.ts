import type { AxiosError } from 'axios'
import type { ApiErrorBody, ValidationDetail } from './types'

export class ApiError extends Error {
  statusCode: number
  details?: ValidationDetail[]

  constructor(message: string, statusCode: number, details?: ValidationDetail[]) {
    super(message)
    this.name = 'ApiError'
    this.statusCode = statusCode
    this.details = details
  }

  get isUnauthorized() {
    return this.statusCode === 401
  }

  get isForbidden() {
    return this.statusCode === 403
  }

  get isConflict() {
    return this.statusCode === 409
  }

  get isRateLimited() {
    return this.statusCode === 429
  }

  get isEmailNotVerified() {
    return this.statusCode === 403 && this.message === 'Email not verified'
  }

  get isValidationError() {
    return this.statusCode === 400 && Boolean(this.details?.length)
  }

  get isNetworkError() {
    return this.statusCode === 0
  }
}

function isBrowserOffline() {
  return typeof navigator !== 'undefined' && navigator.onLine === false
}

export function getNetworkErrorMessage() {
  if (isBrowserOffline()) {
    return 'You appear to be offline. Check your internet connection and try again.'
  }

  return "Can't reach the server right now. Make sure it's running and try again."
}

function getStatusFallback(status: number) {
  switch (status) {
    case 400:
      return 'Invalid request. Please check your input and try again.'
    case 401:
      return 'Authentication required. Please sign in again.'
    case 403:
      return "You don't have permission to do that."
    case 404:
      return 'The requested resource was not found.'
    case 408:
      return 'The request took too long. Please try again.'
    case 409:
      return 'That conflicts with existing data. Please try something else.'
    case 429:
      return 'Too many requests. Please wait a moment and try again.'
    case 500:
      return 'Something went wrong on the server. Please try again later.'
    case 502:
    case 503:
    case 504:
      return "The server isn't available right now. Please try again later."
    default:
      return null
  }
}

function isNetworkFailure(error: AxiosError<ApiErrorBody>) {
  return (
    !error.response &&
    (error.message === 'Network Error' ||
      error.code === 'ERR_NETWORK' ||
      error.code === 'ECONNREFUSED' ||
      error.code === 'ENOTFOUND')
  )
}

export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error
  }

  const axiosError = error as AxiosError<ApiErrorBody>
  const serverMessage = axiosError.response?.data?.message?.trim()

  if (serverMessage) {
    return new ApiError(
      serverMessage,
      axiosError.response?.status ?? 500,
      axiosError.response?.data?.details,
    )
  }

  if (axiosError.code === 'ECONNABORTED') {
    return new ApiError(getStatusFallback(408)!, 408)
  }

  if (isNetworkFailure(axiosError)) {
    return new ApiError(getNetworkErrorMessage(), 0)
  }

  const status = axiosError.response?.status
  if (status) {
    return new ApiError(getStatusFallback(status) ?? 'Something went wrong', status)
  }

  if (axiosError.message?.trim()) {
    return new ApiError(axiosError.message, 0)
  }

  return new ApiError(
    isBrowserOffline() ? getNetworkErrorMessage() : 'Something went wrong. Please try again.',
    0,
  )
}
