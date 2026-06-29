import type { ChatMessage, Comment, FeedPost, PostAuthor, UploadFile } from '../api/types'

export type SocketAck = {
  ok: boolean
  message?: string
}

export type PostDeletedPayload = {
  id: string
}

export type CommentDeletedPayload = {
  id: string
  postId: string
}

export type PostLikePayload = {
  postId: string
  likeCount: number
  likedBy?: PostAuthor
}

export type PostUnlikePayload = {
  postId: string
  likeCount: number
}

export type CommentLikePayload = {
  postId: string
  commentId: string
  likeCount: number
  likedBy?: PostAuthor
}

export type CommentUnlikePayload = {
  postId: string
  commentId: string
  likeCount: number
}

export type PostCommentedPayload = {
  postId: string
  comment: Comment
}

export type MessageReceivedPayload = {
  conversationId: string
  message: ChatMessage
}

export type MessageDeliveredPayload = {
  conversationId: string
  messageId: string
  deliveredAt: string
  message: ChatMessage
}

export type ConversationReadPayload = {
  conversationId: string
  userId: string
  readAt: string
}

export type MessageTypingPayload = {
  conversationId: string
  user: PostAuthor
}

export type MessageStopTypingPayload = {
  conversationId: string
  userId: string
}

/** Events the server emits to the client. */
export type ServerToClientEvents = {
  connected: (payload: { userId: string }) => void
  'feed:post_created': (post: FeedPost) => void
  'feed:post_updated': (post: FeedPost) => void
  'feed:post_deleted': (payload: PostDeletedPayload) => void
  'comment:created': (comment: Comment) => void
  'comment:updated': (comment: Comment) => void
  'comment:deleted': (payload: CommentDeletedPayload) => void
  'post:updated': (post: FeedPost) => void
  'post:deleted': (payload: PostDeletedPayload) => void
  'post:liked': (payload: PostLikePayload) => void
  'post:unliked': (payload: PostUnlikePayload) => void
  'comment:liked': (payload: CommentLikePayload) => void
  'comment:unliked': (payload: CommentUnlikePayload) => void
  'post:commented': (payload: PostCommentedPayload) => void
  'presence:online': (payload: { userId: string }) => void
  'presence:offline': (payload: { userId: string }) => void
  'message:created': (message: ChatMessage) => void
  'message:sent': (message: ChatMessage) => void
  'message:received': (payload: MessageReceivedPayload) => void
  'message:delivered': (payload: MessageDeliveredPayload) => void
  'conversation:read': (payload: ConversationReadPayload) => void
  'message:typing': (payload: MessageTypingPayload) => void
  'message:stop_typing': (payload: MessageStopTypingPayload) => void
}

/** Events the client emits to the server. */
export type ClientToServerEvents = {
  'feed:join': (ack?: (response: SocketAck) => void) => void
  'feed:leave': (ack?: (response: SocketAck) => void) => void
  'post:join': (payload: { postId: string }, ack?: (response: SocketAck) => void) => void
  'post:leave': (payload: { postId: string }, ack?: (response: SocketAck) => void) => void
  'presence:heartbeat': (ack?: (response: SocketAck & { userId?: string }) => void) => void
  'conversation:join': (payload: { conversationId: string }, ack?: (response: SocketAck) => void) => void
  'conversation:leave': (payload: { conversationId: string }, ack?: (response: SocketAck) => void) => void
  'message:typing': (payload: { conversationId: string }, ack?: (response: SocketAck) => void) => void
  'message:stop_typing': (payload: { conversationId: string }, ack?: (response: SocketAck) => void) => void
  'message:delivered': (
    payload: { conversationId: string; messageId: string },
    ack?: (response: SocketAck) => void,
  ) => void
}

export type AppSocket = import('socket.io-client').Socket<ServerToClientEvents, ClientToServerEvents>

export type SocketConnectionStatus =
  | 'idle'
  | 'connecting'
  | 'connected'
  | 'disconnected'
  | 'error'

export type SocketState = {
  socket: AppSocket | null
  status: SocketConnectionStatus
  userId: string | null
  error: string | null
}

export type { ChatMessage, Comment, FeedPost, PostAuthor, UploadFile }
