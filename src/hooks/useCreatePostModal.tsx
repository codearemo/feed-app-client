import { useCallback } from 'react'
import { CreatePostForm } from '../components/posts/CreatePostForm'
import type { FeedPost } from '../lib/api/types'
import { useOverlay } from './useOverlay'

export function useCreatePostModal(onCreated?: (post: FeedPost) => void) {
  const { openModal } = useOverlay()

  return useCallback(() => {
    openModal({
      title: 'New post',
      size: 'lg',
      children: <CreatePostForm onCreated={onCreated} />,
    })
  }, [onCreated, openModal])
}
