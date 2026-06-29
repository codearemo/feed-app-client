import { ApiError } from '../api/errors'

export function getFieldErrors(error: unknown): Record<string, string> {
  if (!(error instanceof ApiError) || !error.details?.length) {
    return {}
  }

  return Object.fromEntries(error.details.map((detail) => [detail.field, detail.message]))
}

export function getErrorMessage(error: unknown, fallback = 'Something went wrong') {
  if (error instanceof ApiError) {
    return error.message
  }

  if (error instanceof Error) {
    return error.message
  }

  return fallback
}
