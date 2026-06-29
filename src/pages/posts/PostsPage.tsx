import { FeedHeader } from '../../components/layout/FeedHeader'
import { PostCard } from '../../components/posts/PostCard'
import { Button } from '../../components/ui/Button'
import { useCreatePostModal } from '../../hooks/useCreatePostModal'
import { useFeed } from '../../hooks/useFeed'
import { useFeedRoom } from '../../hooks/useFeedRoom'

export function PostsPage() {
  const { posts, isLoading, isLoadingMore, hasNextPage, error, loadMore, prependPost, updatePost, mergePost, removePost } =
    useFeed()
  const openCreatePost = useCreatePostModal(prependPost)

  useFeedRoom({
    onPostCreated: prependPost,
    onPostUpdated: mergePost,
    onPostDeleted: removePost,
  })

  return (
    <>
      <FeedHeader
        title="Posts"
        actions={
          <Button size="sm" onClick={openCreatePost}>
            Post
          </Button>
        }
      />

      {isLoading ? (
        <p className="px-4 py-8 text-sm text-surface-500 dark:text-surface-400">Loading feed...</p>
      ) : null}

      {error ? <p className="px-4 py-8 text-sm text-red-600 dark:text-red-300">{error}</p> : null}

      {!isLoading && !error && posts.length === 0 ? (
        <p className="px-4 py-8 text-sm text-surface-500 dark:text-surface-400">
          No posts yet. Be the first to share something.
        </p>
      ) : null}

      <div>
        {posts.map((post) => (
          <PostCard key={post.id} post={post} onUpdated={updatePost} />
        ))}
      </div>

      {hasNextPage ? (
        <div className="border-b border-surface-200 px-4 py-4 dark:border-surface-800">
          <Button variant="secondary" size="sm" disabled={isLoadingMore} onClick={loadMore}>
            {isLoadingMore ? 'Loading...' : 'Load more'}
          </Button>
        </div>
      ) : null}
    </>
  )
}
