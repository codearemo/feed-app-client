import { useEffect, useRef } from 'react'
import type { Comment, FeedPost } from '../lib/api/types'
import { bindSocketActivation } from '../lib/socket/bind-room'
import type {
  CommentDeletedPayload,
  CommentLikePayload,
  CommentUnlikePayload,
  PostDeletedPayload,
  PostLikePayload,
  PostUnlikePayload,
} from '../lib/socket/types'
import { useSocket } from './useSocket'

type UsePostRoomOptions = {
  postId: string | undefined
  enabled?: boolean
  onCommentCreated?: (comment: Comment) => void
  onCommentUpdated?: (comment: Comment) => void
  onCommentDeleted?: (payload: CommentDeletedPayload) => void
  onPostUpdated?: (post: FeedPost) => void
  onPostDeleted?: (payload: PostDeletedPayload) => void
  onPostLiked?: (payload: PostLikePayload) => void
  onPostUnliked?: (payload: PostUnlikePayload) => void
  onCommentLiked?: (payload: CommentLikePayload) => void
  onCommentUnliked?: (payload: CommentUnlikePayload) => void
}

export function usePostRoom({
  postId,
  enabled = true,
  onCommentCreated,
  onCommentUpdated,
  onCommentDeleted,
  onPostUpdated,
  onPostDeleted,
  onPostLiked,
  onPostUnliked,
  onCommentLiked,
  onCommentUnliked,
}: UsePostRoomOptions) {
  const { socket } = useSocket()
  const postIdRef = useRef(postId)
  const handlersRef = useRef({
    onCommentCreated,
    onCommentUpdated,
    onCommentDeleted,
    onPostUpdated,
    onPostDeleted,
    onPostLiked,
    onPostUnliked,
    onCommentLiked,
    onCommentUnliked,
  })

  postIdRef.current = postId
  handlersRef.current = {
    onCommentCreated,
    onCommentUpdated,
    onCommentDeleted,
    onPostUpdated,
    onPostDeleted,
    onPostLiked,
    onPostUnliked,
    onCommentLiked,
    onCommentUnliked,
  }

  useEffect(() => {
    if (!socket || !postId || !enabled) {
      return
    }

    const joinPost = () => {
      const activePostId = postIdRef.current
      if (activePostId) {
        socket.emit('post:join', { postId: activePostId })
      }
    }

    const leavePost = () => {
      socket.emit('post:leave', { postId })
    }

    const handleCommentCreated = (comment: Comment) => {
      handlersRef.current.onCommentCreated?.(comment)
    }

    const handleCommentUpdated = (comment: Comment) => {
      handlersRef.current.onCommentUpdated?.(comment)
    }

    const handleCommentDeleted = (payload: CommentDeletedPayload) => {
      handlersRef.current.onCommentDeleted?.(payload)
    }

    const handlePostUpdated = (post: FeedPost) => {
      handlersRef.current.onPostUpdated?.(post)
    }

    const handlePostDeleted = (payload: PostDeletedPayload) => {
      handlersRef.current.onPostDeleted?.(payload)
    }

    const handlePostLiked = (payload: PostLikePayload) => {
      handlersRef.current.onPostLiked?.(payload)
    }

    const handlePostUnliked = (payload: PostUnlikePayload) => {
      handlersRef.current.onPostUnliked?.(payload)
    }

    const handleCommentLiked = (payload: CommentLikePayload) => {
      handlersRef.current.onCommentLiked?.(payload)
    }

    const handleCommentUnliked = (payload: CommentUnlikePayload) => {
      handlersRef.current.onCommentUnliked?.(payload)
    }

    socket.on('comment:created', handleCommentCreated)
    socket.on('comment:updated', handleCommentUpdated)
    socket.on('comment:deleted', handleCommentDeleted)
    socket.on('post:updated', handlePostUpdated)
    socket.on('post:deleted', handlePostDeleted)
    socket.on('post:liked', handlePostLiked)
    socket.on('post:unliked', handlePostUnliked)
    socket.on('comment:liked', handleCommentLiked)
    socket.on('comment:unliked', handleCommentUnliked)

    const unbind = bindSocketActivation(socket, joinPost)

    return () => {
      unbind()
      socket.off('comment:created', handleCommentCreated)
      socket.off('comment:updated', handleCommentUpdated)
      socket.off('comment:deleted', handleCommentDeleted)
      socket.off('post:updated', handlePostUpdated)
      socket.off('post:deleted', handlePostDeleted)
      socket.off('post:liked', handlePostLiked)
      socket.off('post:unliked', handlePostUnliked)
      socket.off('comment:liked', handleCommentLiked)
      socket.off('comment:unliked', handleCommentUnliked)
      leavePost()
    }
  }, [socket, postId, enabled])
}
