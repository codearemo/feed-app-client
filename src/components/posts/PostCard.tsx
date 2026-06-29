import { Link } from 'react-router-dom'
import type { FeedPost } from '../../lib/api/types'
import { formatDate } from '../../lib/utils/format'
import { useAuth } from '../../context/AuthContext'
import { getUserDisplayName } from '../../lib/user/display'
import { getUserProfilePath, postAuthorToAvatarUser } from '../../lib/user/avatar'
import { AppLink } from '../ui/AppLink'
import { Avatar } from '../ui/Avatar'
import { PostEngagement } from './PostEngagement'
import { PostImages } from './PostImages'

type PostCardProps = {
  post: FeedPost
  onUpdated?: (post: FeedPost) => void
}

export function PostCard({ post, onUpdated }: PostCardProps) {
  const { user: currentUser } = useAuth()
  const authorUser = postAuthorToAvatarUser(post.author)
  const profilePath = getUserProfilePath(post.author.id, currentUser?.id)
  const isAuthor = currentUser?.id === post.author.id

  return (
    <article className="group border-b border-surface-200 px-4 py-3 transition-colors hover:bg-surface-100/50 dark:border-surface-800 dark:hover:bg-surface-900/40">
      <div className="flex gap-3">
        <Avatar user={authorUser} size="sm" showPresence />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-sm leading-5">
            <Link
              to={profilePath}
              className="font-semibold text-surface-900 hover:underline dark:text-surface-100"
            >
              {getUserDisplayName(authorUser) || post.author.name}
            </Link>
            <span className="text-surface-400 dark:text-surface-600" aria-hidden="true">
              ·
            </span>
            <span className="text-surface-500 dark:text-surface-400">{formatDate(post.createdAt)}</span>
          </div>

          <Link to={`/posts/${post.id}`} className="mt-0.5 block space-y-1">
            {post.title ? (
              <p className="text-[15px] font-medium leading-5 text-surface-900 dark:text-surface-100">
                {post.title}
              </p>
            ) : null}
            <p className="text-[15px] leading-5 text-surface-700 dark:text-surface-300">{post.excerpt}</p>
          </Link>

          {post.images.length > 0 ? (
            <div className="mt-3">
              <PostImages images={post.images} title={post.title} variant="card" />
            </div>
          ) : null}

          {post.tags.length > 0 ? (
            <div className="mt-2 flex flex-wrap gap-x-2 gap-y-1">
              {post.tags.map((tag) => (
                <span key={tag} className="text-sm text-brand-600 dark:text-brand-400">
                  #{tag}
                </span>
              ))}
            </div>
          ) : null}

          <PostEngagement post={post} onUpdated={onUpdated} />

          <div className="mt-1 flex gap-4 text-sm">
            <AppLink to={`/posts/${post.id}`} variant="subtle">
              Read
            </AppLink>
            {isAuthor ? (
              <AppLink to={`/posts/${post.id}/edit`} variant="subtle">
                Edit
              </AppLink>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  )
}
