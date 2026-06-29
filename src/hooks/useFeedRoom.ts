import { useEffect, useRef } from 'react'
import type { FeedPost } from '../lib/api/types'
import type { PostDeletedPayload } from '../lib/socket/types'
import { useSocket } from './useSocket'

type UseFeedRoomOptions = {
  enabled?: boolean
  onPostCreated?: (post: FeedPost) => void
  onPostUpdated?: (post: FeedPost) => void
  onPostDeleted?: (postId: string) => void
}

export function useFeedRoom({
  enabled = true,
  onPostCreated,
  onPostUpdated,
  onPostDeleted,
}: UseFeedRoomOptions) {
  const { socket } = useSocket()
  const handlersRef = useRef({ onPostCreated, onPostUpdated, onPostDeleted })

  handlersRef.current = { onPostCreated, onPostUpdated, onPostDeleted }

  useEffect(() => {
    if (!socket || !enabled) {
      return
    }

    const handleCreated = (post: FeedPost) => {
      handlersRef.current.onPostCreated?.(post)
    }

    const handleUpdated = (post: FeedPost) => {
      handlersRef.current.onPostUpdated?.(post)
    }

    const handleDeleted = ({ id }: PostDeletedPayload) => {
      handlersRef.current.onPostDeleted?.(id)
    }

    socket.on('feed:post_created', handleCreated)
    socket.on('feed:post_updated', handleUpdated)
    socket.on('feed:post_deleted', handleDeleted)

    return () => {
      socket.off('feed:post_created', handleCreated)
      socket.off('feed:post_updated', handleUpdated)
      socket.off('feed:post_deleted', handleDeleted)
    }
  }, [socket, enabled])
}
