import { useState } from 'react'
import { Button } from '../ui/Button'
import { useOverlay } from '../../hooks/useOverlay'
import { postsApi } from '../../lib/api/posts.api'
import { getErrorMessage } from '../../lib/forms/getFieldErrors'

type DeletePostConfirmProps = {
  postId: string
  onDeleted: () => void
}

export function DeletePostConfirm({ postId, onDeleted }: DeletePostConfirmProps) {
  const { closeOverlay } = useOverlay()
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string>()

  async function handleConfirm() {
    setIsDeleting(true)
    setError(undefined)

    try {
      await postsApi.delete(postId)
      closeOverlay()
      onDeleted()
    } catch (deleteError) {
      setError(getErrorMessage(deleteError, 'Unable to delete post'))
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-surface-600 dark:text-surface-400">
        This action cannot be undone. The post will be removed from the feed.
      </p>

      {error ? <p className="text-sm text-red-600 dark:text-red-300">{error}</p> : null}

      <div className="flex justify-end gap-2">
        <Button variant="secondary" size="sm" disabled={isDeleting} onClick={() => closeOverlay()}>
          Cancel
        </Button>
        <Button variant="danger" size="sm" disabled={isDeleting} onClick={() => void handleConfirm()}>
          {isDeleting ? 'Deleting...' : 'Delete post'}
        </Button>
      </div>
    </div>
  )
}
