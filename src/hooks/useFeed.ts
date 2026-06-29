import { useCallback, useEffect, useState } from 'react'
import { feedApi } from '../lib/api/feed.api'
import type { FeedPost } from '../lib/api/types'
import { getErrorMessage } from '../lib/forms/getFieldErrors'
import { mergePostFromSocket } from '../lib/posts/engagement'

const DEFAULT_LIMIT = 20

export function useFeed() {
  const [posts, setPosts] = useState<FeedPost[]>([])
  const [page, setPage] = useState(1)
  const [hasNextPage, setHasNextPage] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [error, setError] = useState<string>()

  const loadPage = useCallback(async (nextPage: number, append: boolean) => {
    if (append) {
      setIsLoadingMore(true)
    } else {
      setIsLoading(true)
    }

    setError(undefined)

    try {
      const result = await feedApi.list({ page: nextPage, limit: DEFAULT_LIMIT })

      setPosts((current) => (append ? [...current, ...result.data] : result.data))
      setPage(result.pagination.page)
      setHasNextPage(result.pagination.hasNextPage)
    } catch (loadError) {
      setError(getErrorMessage(loadError, 'Unable to load feed'))
    } finally {
      setIsLoading(false)
      setIsLoadingMore(false)
    }
  }, [])

  useEffect(() => {
    void loadPage(1, false)
  }, [loadPage])

  const loadMore = useCallback(() => {
    if (!hasNextPage || isLoadingMore) {
      return
    }

    void loadPage(page + 1, true)
  }, [hasNextPage, isLoadingMore, loadPage, page])

  const refresh = useCallback(() => {
    void loadPage(1, false)
  }, [loadPage])

  const prependPost = useCallback((post: FeedPost) => {
    setPosts((current) => [post, ...current.filter((item) => item.id !== post.id)])
  }, [])

  const updatePost = useCallback((incoming: FeedPost) => {
    setPosts((current) =>
      current.map((item) => (item.id === incoming.id ? incoming : item)),
    )
  }, [])

  const mergePost = useCallback((incoming: FeedPost) => {
    setPosts((current) =>
      current.map((item) =>
        item.id === incoming.id ? mergePostFromSocket(item, incoming) : item,
      ),
    )
  }, [])

  const removePost = useCallback((postId: string) => {
    setPosts((current) => current.filter((item) => item.id !== postId))
  }, [])

  return {
    posts,
    isLoading,
    isLoadingMore,
    hasNextPage,
    error,
    loadMore,
    refresh,
    prependPost,
    updatePost,
    mergePost,
    removePost,
  }
}
