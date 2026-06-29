import type { FeedPost } from '../../lib/api/types'
import { usePostLike } from '../../hooks/usePostLike'

type PostEngagementProps = {
  post: FeedPost
  onUpdated?: (post: FeedPost) => void
}

export function PostEngagement({ post, onUpdated }: PostEngagementProps) {
  const { isToggling, toggleLike } = usePostLike(post, { onUpdated })

  return (
    <div className="mt-2 flex items-center gap-4 text-sm text-surface-500 dark:text-surface-400">
      <button
        type="button"
        disabled={isToggling}
        onClick={() => void toggleLike()}
        className={`inline-flex items-center gap-1.5 transition-colors hover:text-brand-600 dark:hover:text-brand-300 ${
          post.likedByMe ? 'font-medium text-brand-600 dark:text-brand-300' : ''
        }`}
      >
        <span aria-hidden="true">{post.likedByMe ? '♥' : '♡'}</span>
        <span>{post.likeCount}</span>
        <span className="sr-only">{post.likedByMe ? 'Unlike' : 'Like'}</span>
      </button>

      <span className="inline-flex items-center gap-1.5">
        <span aria-hidden="true">💬</span>
        <span>{post.commentCount ?? 0}</span>
        <span className="sr-only">Comments</span>
      </span>
    </div>
  )
}
