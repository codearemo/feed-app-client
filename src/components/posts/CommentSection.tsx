import { useState, type FormEvent } from 'react'
import type { FeedPost } from '../../lib/api/types'
import type { useComments } from '../../hooks/useComments'
import { Button } from '../ui/Button'
import { Textarea } from '../ui/Textarea'
import { CommentItem } from './CommentItem'

type CommentsState = ReturnType<typeof useComments>

type CommentSectionProps = {
  post: FeedPost
  onPostUpdated?: (post: FeedPost) => void
  comments: CommentsState
}

function commentTitleFromContent(content: string) {
  const trimmed = content.trim()
  if (!trimmed) {
    return 'Comment'
  }

  const firstLine = trimmed.split('\n')[0]
  return firstLine.length > 200 ? `${firstLine.slice(0, 197)}...` : firstLine
}

export function CommentSection({ post, onPostUpdated, comments }: CommentSectionProps) {
  const {
    comments: commentList,
    isLoading,
    isLoadingMore,
    isSubmitting,
    hasNextPage,
    error,
    loadMore,
    addComment,
    updateComment,
  } = comments
  const [content, setContent] = useState('')
  const [contentError, setContentError] = useState<string>()

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setContentError(undefined)

    const trimmed = content.trim()
    if (!trimmed) {
      setContentError('Comment cannot be empty')
      return
    }

    const comment = await addComment({
      title: commentTitleFromContent(trimmed),
      content: trimmed,
    })

    if (comment) {
      setContent('')
      onPostUpdated?.({
        ...post,
        commentCount: (post.commentCount ?? commentList.length) + 1,
      })
    }
  }

  return (
    <section className="border-b border-surface-200 px-4 py-4 dark:border-surface-800">
      <h2 className="text-sm font-semibold text-surface-900 dark:text-surface-100">
        Comments ({Math.max(post.commentCount ?? 0, commentList.length)})
      </h2>

      <form className="mt-4 space-y-3" onSubmit={(event) => void handleSubmit(event)}>
        <Textarea
          label="Add a comment"
          placeholder="Share your thoughts..."
          value={content}
          onChange={(event) => setContent(event.target.value)}
          error={contentError}
        />
        {error ? <p className="text-sm text-red-600 dark:text-red-300">{error}</p> : null}
        <Button type="submit" size="sm" disabled={isSubmitting}>
          {isSubmitting ? 'Posting...' : 'Post comment'}
        </Button>
      </form>

      {isLoading ? (
        <p className="mt-4 text-sm text-surface-500 dark:text-surface-400">Loading comments...</p>
      ) : (
        <ul className="mt-4 divide-y divide-surface-200 dark:divide-surface-800">
          {commentList.map((comment) => (
            <CommentItem
              key={comment.id}
              postId={post.id}
              comment={comment}
              onUpdated={updateComment}
            />
          ))}
        </ul>
      )}

      {!isLoading && commentList.length === 0 ? (
        <p className="mt-4 text-sm text-surface-500 dark:text-surface-400">No comments yet.</p>
      ) : null}

      {hasNextPage ? (
        <div className="mt-4">
          <Button variant="secondary" size="sm" disabled={isLoadingMore} onClick={loadMore}>
            {isLoadingMore ? 'Loading...' : 'Load more comments'}
          </Button>
        </div>
      ) : null}
    </section>
  )
}
