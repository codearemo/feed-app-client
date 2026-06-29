import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { FeedHeader } from '../../components/layout/FeedHeader'
import { DeletePostConfirm } from '../../components/posts/DeletePostConfirm'
import { CommentSection } from '../../components/posts/CommentSection'
import { PostEngagement } from '../../components/posts/PostEngagement'
import { PostImages } from '../../components/posts/PostImages'
import { Avatar } from '../../components/ui/Avatar'
import { AppLink } from '../../components/ui/AppLink'
import { Button } from '../../components/ui/Button'
import { useAuth } from '../../context/AuthContext'
import { useComments } from '../../hooks/useComments'
import { useOverlay } from '../../hooks/useOverlay'
import { usePostRoom } from '../../hooks/usePostRoom'
import { postsApi } from '../../lib/api/posts.api'
import type { FeedPost } from '../../lib/api/types'
import { getErrorMessage } from '../../lib/forms/getFieldErrors'
import {
  applyCommentLikeEvent,
  applyCommentUnlikeEvent,
  applyLikeEvent,
  applyUnlikeEvent,
  mergePostFromSocket,
} from '../../lib/posts/engagement'
import { formatDate } from '../../lib/utils/format'
import { getUserDisplayName } from '../../lib/user/display'
import { getUserProfilePath, postAuthorToAvatarUser } from '../../lib/user/avatar'

export function PostDetailPage() {
  const { postId } = useParams()
  const navigate = useNavigate()
  const { user: currentUser } = useAuth()
  const [post, setPost] = useState<FeedPost | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string>()
  const { openModal } = useOverlay()
  const commentsState = useComments(postId)
  const {
    comments,
    appendComment,
    removeComment,
    updateComment,
    patchComment,
  } = commentsState

  usePostRoom({
    postId,
    enabled: Boolean(postId),
    onCommentCreated: (comment) => {
      appendComment(comment)

      if (comment.author.id !== currentUser?.id) {
        setPost((current) =>
          current
            ? {
                ...current,
                commentCount: (current.commentCount ?? comments.length) + 1,
              }
            : current,
        )
      }
    },
    onCommentUpdated: updateComment,
    onCommentDeleted: ({ id }) => {
      removeComment(id)
      setPost((current) =>
        current
          ? {
              ...current,
              commentCount: Math.max(0, (current.commentCount ?? comments.length) - 1),
            }
          : current,
      )
    },
    onPostUpdated: (updated) => {
      setPost((current) => (current ? mergePostFromSocket(current, updated) : updated))
    },
    onPostDeleted: () => navigate('/posts', { replace: true }),
    onPostLiked: ({ postId: likedPostId, likeCount, likedBy }) => {
      setPost((current) => {
        if (!current || current.id !== likedPostId) {
          return current
        }

        return applyLikeEvent(current, { likeCount, likedBy }, currentUser?.id)
      })
    },
    onPostUnliked: ({ postId: unlikedPostId, likeCount }) => {
      setPost((current) => {
        if (!current || current.id !== unlikedPostId) {
          return current
        }

        return applyUnlikeEvent(current, { likeCount })
      })
    },
    onCommentLiked: ({ commentId, likeCount, likedBy }) => {
      const comment = comments.find((item) => item.id === commentId)
      if (!comment) {
        patchComment(commentId, {
          likeCount,
          likedByMe: likedBy?.id === currentUser?.id ? true : undefined,
        })
        return
      }

      patchComment(
        commentId,
        applyCommentLikeEvent(comment, { likeCount, likedBy }, currentUser?.id),
      )
    },
    onCommentUnliked: ({ commentId, likeCount }) => {
      const comment = comments.find((item) => item.id === commentId)
      if (!comment) {
        patchComment(commentId, { likeCount })
        return
      }

      patchComment(commentId, applyCommentUnlikeEvent(comment, { likeCount }))
    },
  })

  useEffect(() => {
    if (!postId) {
      return
    }

    let cancelled = false

    async function loadPost(id: string) {
      setIsLoading(true)
      setError(undefined)

      try {
        const data = await postsApi.get(id)
        if (!cancelled) {
          setPost(data)
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(getErrorMessage(loadError, 'Unable to load post'))
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    void loadPost(postId)

    return () => {
      cancelled = true
    }
  }, [postId])

  const openDeleteConfirm = useCallback(() => {
    if (!post) {
      return
    }

    openModal({
      title: 'Delete this post?',
      size: 'sm',
      children: (
        <DeletePostConfirm postId={post.id} onDeleted={() => navigate('/posts', { replace: true })} />
      ),
    })
  }, [navigate, openModal, post])

  if (isLoading) {
    return (
      <>
        <FeedHeader title="Post" backTo="/posts" backLabel="Posts" />
        <p className="px-4 py-8 text-sm text-surface-500 dark:text-surface-400">Loading post...</p>
      </>
    )
  }

  if (error && !post) {
    return (
      <>
        <FeedHeader title="Post" backTo="/posts" backLabel="Posts" />
        <p className="px-4 py-8 text-sm text-red-600 dark:text-red-300">{error}</p>
      </>
    )
  }

  if (!post) {
    return null
  }

  const authorUser = postAuthorToAvatarUser(post.author)
  const profilePath = getUserProfilePath(post.author.id, currentUser?.id)
  const isAuthor = currentUser?.id === post.author.id

  return (
    <>
      <FeedHeader
        title={post.title}
        backTo="/posts"
        backLabel="Posts"
        actions={
          isAuthor ? (
            <>
              <Link to={`/posts/${post.id}/edit`}>
                <Button variant="secondary" size="sm">
                  Edit
                </Button>
              </Link>
              <Button variant="danger" size="sm" onClick={openDeleteConfirm}>
                Delete
              </Button>
            </>
          ) : null
        }
      />

      <article className="border-b border-surface-200 px-4 py-4 dark:border-surface-800">
        <div className="flex gap-3">
          <Avatar user={authorUser} size="sm" showPresence />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-1.5 text-sm">
              <Link
                to={profilePath}
                className="font-semibold text-surface-900 hover:underline dark:text-surface-100"
              >
                {getUserDisplayName(authorUser) || post.author.name}
              </Link>
              <span className="text-surface-400 dark:text-surface-600" aria-hidden="true">
                ·
              </span>
              <span className="text-surface-500 dark:text-surface-400">
                {formatDate(post.createdAt)}
                {post.updatedAt !== post.createdAt ? ` · edited ${formatDate(post.updatedAt)}` : null}
              </span>
            </div>

            {post.tags.length > 0 ? (
              <div className="mt-2 flex flex-wrap gap-x-2 gap-y-1">
                {post.tags.map((tag) => (
                  <span key={tag} className="text-sm text-brand-600 dark:text-brand-400">
                    #{tag}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        {post.images.length > 0 ? (
          <div className="mt-4">
            <PostImages images={post.images} title={post.title} variant="detail" />
          </div>
        ) : null}

        <div className="mt-4 space-y-3 text-[15px] leading-6 text-surface-800 dark:text-surface-200">
          {post.content.split('\n\n').map((paragraph) => (
            <p key={paragraph.slice(0, 24)}>{paragraph}</p>
          ))}
        </div>

        <PostEngagement post={post} onUpdated={setPost} />
      </article>

      <CommentSection post={post} onPostUpdated={setPost} comments={commentsState} />

      <div className="px-4 py-4">
        <AppLink to="/posts" variant="primary" className="text-sm">
          ← Back to posts
        </AppLink>
      </div>
    </>
  )
}
