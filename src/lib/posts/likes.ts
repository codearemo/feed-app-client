import type { Comment, FeedPost } from '../../lib/api/types'
import { postsApi } from '../../lib/api/posts.api'

export async function togglePostLike(post: FeedPost) {
  if (post.likedByMe) {
    return postsApi.unlike(post.id)
  }

  return postsApi.like(post.id)
}

export async function toggleCommentLike(postId: string, comment: Comment) {
  if (comment.likedByMe) {
    return postsApi.unlikeComment(postId, comment.id)
  }

  return postsApi.likeComment(postId, comment.id)
}

export function optimisticPostLikeToggle(post: FeedPost): FeedPost {
  const likedByMe = !post.likedByMe

  return {
    ...post,
    likedByMe,
    likeCount: Math.max(0, post.likeCount + (likedByMe ? 1 : -1)),
  }
}

export function optimisticCommentLikeToggle(comment: Comment): Comment {
  const likedByMe = !comment.likedByMe

  return {
    ...comment,
    likedByMe,
    likeCount: Math.max(0, comment.likeCount + (likedByMe ? 1 : -1)),
  }
}
