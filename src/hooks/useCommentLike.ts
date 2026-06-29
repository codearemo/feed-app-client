import { useCallback, useState } from 'react'
import type { Comment } from '../lib/api/types'
import { optimisticCommentLikeToggle, toggleCommentLike } from '../lib/posts/likes'

type UseCommentLikeOptions = {
  postId: string
  onUpdated?: (comment: Comment) => void
}

export function useCommentLike(comment: Comment, { postId, onUpdated }: UseCommentLikeOptions) {
  const [isToggling, setIsToggling] = useState(false)

  const toggleLike = useCallback(async () => {
    if (isToggling) {
      return
    }

    const optimistic = optimisticCommentLikeToggle(comment)
    onUpdated?.(optimistic)

    setIsToggling(true)

    try {
      const updated = await toggleCommentLike(postId, comment)
      onUpdated?.(updated)
    } catch {
      onUpdated?.(comment)
    } finally {
      setIsToggling(false)
    }
  }, [comment, isToggling, onUpdated, postId])

  return {
    isToggling,
    toggleLike,
  }
}
