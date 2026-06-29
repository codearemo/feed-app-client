import { useCallback, useEffect, useState } from 'react'
import { postsApi } from '../lib/api/posts.api'
import type { Comment, CreateContentBody } from '../lib/api/types'
import { getErrorMessage } from '../lib/forms/getFieldErrors'

const DEFAULT_LIMIT = 20

export function useComments(postId: string | undefined) {
  const [comments, setComments] = useState<Comment[]>([])
  const [page, setPage] = useState(1)
  const [hasNextPage, setHasNextPage] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string>()

  const loadPage = useCallback(
    async (nextPage: number, append: boolean) => {
      if (!postId) {
        return
      }

      if (append) {
        setIsLoadingMore(true)
      } else {
        setIsLoading(true)
      }

      setError(undefined)

      try {
        const result = await postsApi.listComments(postId, { page: nextPage, limit: DEFAULT_LIMIT })

        setComments((current) => (append ? [...current, ...result.data] : result.data))
        setPage(result.pagination.page)
        setHasNextPage(result.pagination.hasNextPage)
      } catch (loadError) {
        setError(getErrorMessage(loadError, 'Unable to load comments'))
      } finally {
        setIsLoading(false)
        setIsLoadingMore(false)
      }
    },
    [postId],
  )

  useEffect(() => {
    void loadPage(1, false)
  }, [loadPage])

  const loadMore = useCallback(() => {
    if (!hasNextPage || isLoadingMore) {
      return
    }

    void loadPage(page + 1, true)
  }, [hasNextPage, isLoadingMore, loadPage, page])

  const addComment = useCallback(
    async (body: CreateContentBody) => {
      if (!postId) {
        return null
      }

      setIsSubmitting(true)
      setError(undefined)

      try {
        const comment = await postsApi.createComment(postId, body)
        setComments((current) => [...current, comment])
        return comment
      } catch (submitError) {
        setError(getErrorMessage(submitError, 'Unable to post comment'))
        return null
      } finally {
        setIsSubmitting(false)
      }
    },
    [postId],
  )

  const updateComment = useCallback((comment: Comment) => {
    setComments((current) => current.map((item) => (item.id === comment.id ? comment : item)))
  }, [])

  const appendComment = useCallback((comment: Comment) => {
    setComments((current) => {
      if (current.some((item) => item.id === comment.id)) {
        return current
      }

      return [...current, comment]
    })
  }, [])

  const removeComment = useCallback((commentId: string) => {
    setComments((current) => current.filter((item) => item.id !== commentId))
  }, [])

  const patchComment = useCallback((commentId: string, patch: Partial<Comment>) => {
    setComments((current) =>
      current.map((item) => (item.id === commentId ? { ...item, ...patch } : item)),
    )
  }, [])

  return {
    comments,
    isLoading,
    isLoadingMore,
    isSubmitting,
    hasNextPage,
    error,
    loadMore,
    addComment,
    updateComment,
    appendComment,
    removeComment,
    patchComment,
  }
}
