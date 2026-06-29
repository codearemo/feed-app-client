import { Link } from 'react-router-dom'
import type { Comment } from '../../lib/api/types'
import { useAuth } from '../../context/AuthContext'
import { useCommentLike } from '../../hooks/useCommentLike'
import { formatDate } from '../../lib/utils/format'
import { getUserDisplayName } from '../../lib/user/display'
import { getUserProfilePath, postAuthorToAvatarUser } from '../../lib/user/avatar'
import { Avatar } from '../ui/Avatar'
import { PostImages } from './PostImages'

type CommentItemProps = {
  postId: string
  comment: Comment
  onUpdated: (comment: Comment) => void
}

export function CommentItem({ postId, comment, onUpdated }: CommentItemProps) {
  const { user: currentUser } = useAuth()
  const { isToggling, toggleLike } = useCommentLike(comment, { postId, onUpdated })
  const authorUser = postAuthorToAvatarUser(comment.author)
  const profilePath = getUserProfilePath(comment.author.id, currentUser?.id)

  return (
    <li className="flex gap-3 py-4">
      <Avatar user={authorUser} size="sm" showPresence />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-1.5 text-sm">
          <Link
            to={profilePath}
            className="font-semibold text-surface-900 hover:underline dark:text-surface-100"
          >
            {getUserDisplayName(authorUser) || comment.author.name}
          </Link>
          <span className="text-surface-400 dark:text-surface-600" aria-hidden="true">
            ·
          </span>
          <span className="text-surface-500 dark:text-surface-400">{formatDate(comment.createdAt)}</span>
        </div>

        <p className="mt-1 whitespace-pre-wrap text-[15px] leading-5 text-surface-700 dark:text-surface-300">
          {comment.content}
        </p>

        {comment.images.length > 0 ? (
          <div className="mt-3">
            <PostImages images={comment.images} title={comment.title} variant="card" />
          </div>
        ) : null}

        <button
          type="button"
          disabled={isToggling}
          onClick={() => void toggleLike()}
          className={`mt-2 inline-flex items-center gap-1.5 text-sm transition-colors hover:text-brand-600 dark:hover:text-brand-300 ${
            comment.likedByMe
              ? 'font-medium text-brand-600 dark:text-brand-300'
              : 'text-surface-500 dark:text-surface-400'
          }`}
        >
          <span aria-hidden="true">{comment.likedByMe ? '♥' : '♡'}</span>
          <span>{comment.likeCount}</span>
          <span className="sr-only">{comment.likedByMe ? 'Unlike comment' : 'Like comment'}</span>
        </button>
      </div>
    </li>
  )
}
