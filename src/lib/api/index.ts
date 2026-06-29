export { apiClient } from './client'
export { apiConfig, getApiOrigin, getHealthUrl, isProxiedDevApi } from './config'
export { ApiError, getNetworkErrorMessage, toApiError } from './errors'
export { tokenStore } from './token-store'
export { unwrapData, unwrapMessage, unwrapSuccess, unwrapPaginated } from './request'

export { authApi } from './auth.api'
export { usersApi } from './users.api'
export { uploadsApi } from './uploads.api'
export { healthApi } from './health.api'
export { feedApi } from './feed.api'
export { postsApi } from './posts.api'
export { conversationsApi } from './conversations.api'

export type {
  ApiErrorBody,
  ApiPagination,
  ApiSuccessBody,
  AuthSuccess,
  AuthTwoFactorRequired,
  ConfirmTwoFactorBody,
  DisableTwoFactorBody,
  ForgotPasswordBody,
  HealthStatus,
  LoginBody,
  LoginResult,
  RegisterBody,
  ResetPasswordBody,
  ResendVerificationBody,
  SocialLoginBody,
  TokenPair,
  TwoFactorSetup,
  UpdateProfileBody,
  UploadFile,
  User,
  UserStatus,
  ValidationDetail,
  VerifyEmailBody,
  VerifyTwoFactorBody,
  PostAuthor,
  PublicUserProfile,
  ContentItem,
  FeedPost,
  Comment,
  CreateContentBody,
  UpdateContentBody,
  PaginatedResult,
  DeletedResource,
  ConversationSummary,
  ChatMessage,
  CreateConversationBody,
  SendMessageBody,
  MessageDeliveredResult,
} from './types'

export type { AxiosError, AxiosResponse } from 'axios'
