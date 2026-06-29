import type { Comment, FeedPost } from '../api/types'

/** Merge a feed/post-room update without overwriting the viewer's like state. */
export function mergePostFromSocket(current: FeedPost, incoming: FeedPost): FeedPost {
  return {
    ...current,
    ...incoming,
    likedByMe: current.likedByMe,
    likeCount: incoming.likeCount ?? current.likeCount,
  }
}

export function applyLikeEvent(
  post: FeedPost,
  payload: { likeCount: number; likedBy?: { id: string } | null },
  currentUserId?: string | null,
): FeedPost {
  return {
    ...post,
    likeCount: payload.likeCount,
    likedByMe: payload.likedBy?.id === currentUserId ? true : post.likedByMe,
  }
}

export function applyUnlikeEvent(post: FeedPost, payload: { likeCount: number }): FeedPost {
  return {
    ...post,
    likeCount: payload.likeCount,
    likedByMe:
      post.likedByMe && payload.likeCount < post.likeCount ? false : post.likedByMe,
  }
}

export function applyCommentLikeEvent(
  comment: Comment,
  payload: { likeCount: number; likedBy?: { id: string } | null },
  currentUserId?: string | null,
): Comment {
  return {
    ...comment,
    likeCount: payload.likeCount,
    likedByMe: payload.likedBy?.id === currentUserId ? true : comment.likedByMe,
  }
}

export function applyCommentUnlikeEvent(comment: Comment, payload: { likeCount: number }): Comment {
  return {
    ...comment,
    likeCount: payload.likeCount,
    likedByMe:
      comment.likedByMe && payload.likeCount < comment.likeCount ? false : comment.likedByMe,
  }
}
