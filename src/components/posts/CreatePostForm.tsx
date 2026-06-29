import { useCallback, useState, type FormEvent } from 'react'
import type { FeedPost } from '../../lib/api/types'
import { postsApi, uploadsApi } from '../../lib/api'
import { getFieldErrors, getErrorMessage } from '../../lib/forms/getFieldErrors'
import { parseTagsInput } from '../../lib/posts/tags'
import { useOverlay } from '../../hooks/useOverlay'
import { Button } from '../ui/Button'
import { ImageUploadField } from '../ui/ImageUploadField'
import { Input } from '../ui/Input'
import { Textarea } from '../ui/Textarea'

type CreatePostFormProps = {
  onCreated?: (post: FeedPost) => void
}

export function CreatePostForm({ onCreated }: CreatePostFormProps) {
  const { closeOverlay } = useOverlay()
  const [title, setTitle] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [content, setContent] = useState('')
  const [tagsInput, setTagsInput] = useState('')
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [submitError, setSubmitError] = useState<string>()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleImageFilesChange = useCallback((files: File[]) => {
    setImageFiles(files)
  }, [])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFieldErrors({})
    setSubmitError(undefined)
    setIsSubmitting(true)

    try {
      const images = imageFiles.length > 0 ? await uploadsApi.upload(imageFiles) : []

      const post = await postsApi.create({
        title: title.trim(),
        excerpt: excerpt.trim() || undefined,
        content: content.trim(),
        tags: parseTagsInput(tagsInput),
        images,
      })

      onCreated?.(post)
      closeOverlay()
    } catch (error) {
      setFieldErrors(getFieldErrors(error))
      setSubmitError(getErrorMessage(error, 'Unable to create post'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className="space-y-4" onSubmit={(event) => void handleSubmit(event)}>
      <Input
        label="Title"
        placeholder="Give your post a clear headline"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        error={fieldErrors.title}
        required
      />
      <Textarea
        label="Content"
        placeholder="What's happening?"
        value={content}
        onChange={(event) => setContent(event.target.value)}
        error={fieldErrors.content}
        required
      />
      <Input
        label="Excerpt"
        placeholder="Optional summary for the feed card"
        value={excerpt}
        onChange={(event) => setExcerpt(event.target.value)}
        error={fieldErrors.excerpt}
        hint="Shown on the feed when set."
      />
      <Input
        label="Tags"
        placeholder="design, product, writing"
        hint="Separate tags with commas."
        value={tagsInput}
        onChange={(event) => setTagsInput(event.target.value)}
        error={fieldErrors.tags}
      />
      <ImageUploadField onChange={handleImageFilesChange} />

      {submitError ? <p className="text-sm text-red-600 dark:text-red-300">{submitError}</p> : null}

      <div className="flex flex-wrap gap-2 border-t border-surface-200 pt-4 dark:border-surface-800">
        <Button type="submit" size="sm" disabled={isSubmitting}>
          {isSubmitting ? 'Posting...' : 'Post'}
        </Button>
        <Button variant="secondary" type="button" size="sm" disabled={isSubmitting} onClick={() => closeOverlay()}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
