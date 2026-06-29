import { useCallback, useState } from 'react'
import type { FeedPost } from '../lib/api/types'
import { optimisticPostLikeToggle, togglePostLike } from '../lib/posts/likes'

type UsePostLikeOptions = {
  onUpdated?: (post: FeedPost) => void
}

export function usePostLike(post: FeedPost, { onUpdated }: UsePostLikeOptions = {}) {
  const [isToggling, setIsToggling] = useState(false)

  const toggleLike = useCallback(async () => {
    if (isToggling) {
      return
    }

    const optimistic = optimisticPostLikeToggle(post)
    onUpdated?.(optimistic)

    setIsToggling(true)

    try {
      const updated = await togglePostLike(post)
      onUpdated?.(updated)
    } catch {
      onUpdated?.(post)
    } finally {
      setIsToggling(false)
    }
  }, [isToggling, onUpdated, post])

  return {
    isToggling,
    toggleLike,
  }
}
