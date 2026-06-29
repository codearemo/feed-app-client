export type ValidationDetail = {
  field: string
  message: string
}

export type ApiSuccessBody<T> = {
  data: T
  message: string
  pagination?: ApiPagination
}

export type ApiErrorBody = {
  data: null
  message: string
  details?: ValidationDetail[]
}

export type ApiPagination = {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

export type UserStatus = 'active' | 'inactive'

export type UploadFile = {
  id: string
  url: string
  name: string
  originalName: string
  mimeType: string
  size: number
  encoding: string
  provider: 'local' | 's3' | 'cloudinary' | string
}

export type User = {
  id: string
  firstName: string
  lastName: string
  email: string
  username: string
  emailVerified: boolean
  bio?: string
  profilePicture?: UploadFile | null
  twoFactorEnabled: boolean
  status: UserStatus
  createdAt: string
  updatedAt: string
}

export type TokenPair = {
  token: string
  refreshToken: string
}

export type AuthSuccess = TokenPair & {
  requiresTwoFactor: false
  user: User
}

export type AuthTwoFactorRequired = {
  requiresTwoFactor: true
  twoFactorToken: string
}

export type LoginResult = AuthSuccess | AuthTwoFactorRequired

export type TwoFactorSetup = {
  secret: string
  otpauthUrl: string
}

export type HealthStatus = {
  status: string
  database: string
}

export type RegisterBody = {
  firstName: string
  lastName: string
  username: string
  email: string
  password: string
}

export type LoginBody = {
  identifier: string
  password: string
}

export type SocialLoginBody = {
  provider: 'google' | 'apple'
  idToken: string
}

export type VerifyEmailBody = {
  email: string
  otp: string
}

export type ResendVerificationBody = {
  email: string
}

export type RefreshTokenBody = {
  refreshToken: string
}

export type ForgotPasswordBody = {
  email: string
}

export type ResetPasswordBody = {
  email: string
  otp: string
  password: string
}

export type VerifyTwoFactorBody = {
  twoFactorToken: string
  code: string
}

export type ConfirmTwoFactorBody = {
  code: string
}

export type DisableTwoFactorBody = {
  code: string
  password?: string
}

export type UpdateProfileBody = {
  firstName?: string
  lastName?: string
  username?: string
  bio?: string
  profilePicture?: string | null
}

export type PostAuthor = {
  id: string
  name: string
  avatar: string
  profilePicture: UploadFile | null
}

export type PublicUserProfile = {
  id: string
  firstName: string
  lastName: string
  username: string
  bio: string
  avatar: string
  profilePicture: UploadFile | null
  createdAt: string
}

export type ContentItem = {
  id: string
  title: string
  excerpt: string
  content: string
  author: PostAuthor
  createdAt: string
  updatedAt: string
  tags: string[]
  images: UploadFile[]
  likeCount: number
  likedByMe: boolean
}

export type FeedPost = ContentItem & {
  commentCount?: number
}

export type Comment = ContentItem

export type CreateContentBody = {
  title: string
  excerpt?: string
  content: string
  tags?: string[]
  images?: UploadFile[]
}

export type UpdateContentBody = {
  title?: string
  excerpt?: string
  content?: string
  tags?: string[]
  images?: UploadFile[]
}

export type PaginatedResult<T> = {
  data: T[]
  pagination: ApiPagination
}

export type DeletedResource = {
  id: string
}

export type ConversationSummary = {
  id: string
  participant: PublicUserProfile
  participantLastReadAt: string | null
  lastMessage: ChatMessage | null
  unreadCount: number
  updatedAt: string
}

export type ChatMessage = {
  id: string
  conversationId: string
  sender: PostAuthor
  content: string
  createdAt: string
  updatedAt: string
  /** Present only on messages you sent */
  deliveredToRecipient?: boolean
  /** Present only on messages you sent */
  readByRecipient?: boolean
}

export type CreateConversationBody = {
  participantId: string
}

export type SendMessageBody = {
  content: string
}

export type MessageDeliveredResult = {
  conversationId: string
  messageId: string
  deliveredAt: string
  message: ChatMessage
}
