import { useEffect, useCallback, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { FeedHeader } from '../../components/layout/FeedHeader'
import { PostImages } from '../../components/posts/PostImages'
import { Button } from '../../components/ui/Button'
import { ImageUploadField } from '../../components/ui/ImageUploadField'
import { Input } from '../../components/ui/Input'
import { Textarea } from '../../components/ui/Textarea'
import { useAuth } from '../../context/AuthContext'
import { postsApi, uploadsApi } from '../../lib/api'
import type { FeedPost, UploadFile } from '../../lib/api/types'
import { getFieldErrors, getErrorMessage } from '../../lib/forms/getFieldErrors'
import { formatTagsInput, parseTagsInput } from '../../lib/posts/tags'

export function EditPostPage() {
  const { postId } = useParams()
  const navigate = useNavigate()
  const { user: currentUser } = useAuth()
  const [post, setPost] = useState<FeedPost | null>(null)
  const [title, setTitle] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [content, setContent] = useState('')
  const [tagsInput, setTagsInput] = useState('')
  const [existingImages, setExistingImages] = useState<UploadFile[]>([])
  const [newImageFiles, setNewImageFiles] = useState<File[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [error, setError] = useState<string>()

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

        if (cancelled) {
          return
        }

        if (currentUser && data.author.id !== currentUser.id) {
          navigate(`/posts/${data.id}`, { replace: true })
          return
        }

        setPost(data)
        setTitle(data.title)
        setExcerpt(data.excerpt)
        setContent(data.content)
        setTagsInput(formatTagsInput(data.tags))
        setExistingImages(data.images)
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
  }, [currentUser, navigate, postId])

  const handleNewImagesChange = useCallback((files: File[]) => {
    setNewImageFiles(files)
  }, [])

  function removeExistingImage(imageId: string) {
    setExistingImages((current) => current.filter((image) => image.id !== imageId))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!post) {
      return
    }

    setFieldErrors({})
    setError(undefined)
    setIsSubmitting(true)

    try {
      const uploadedImages = newImageFiles.length > 0 ? await uploadsApi.upload(newImageFiles) : []
      const images = [...existingImages, ...uploadedImages]

      const updated = await postsApi.update(post.id, {
        title: title.trim(),
        excerpt: excerpt.trim(),
        content: content.trim(),
        tags: parseTagsInput(tagsInput),
        images,
      })

      navigate(`/posts/${updated.id}`, { replace: true })
    } catch (submitError) {
      setFieldErrors(getFieldErrors(submitError))
      setError(getErrorMessage(submitError, 'Unable to save post'))
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDelete() {
    if (!post || !window.confirm('Delete this post? This cannot be undone.')) {
      return
    }

    setIsDeleting(true)
    setError(undefined)

    try {
      await postsApi.delete(post.id)
      navigate('/posts', { replace: true })
    } catch (deleteError) {
      setError(getErrorMessage(deleteError, 'Unable to delete post'))
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <>
        <FeedHeader title="Edit post" backTo="/posts" backLabel="Posts" />
        <p className="px-4 py-8 text-sm text-surface-500 dark:text-surface-400">Loading post...</p>
      </>
    )
  }

  if (error && !post) {
    return (
      <>
        <FeedHeader title="Edit post" backTo="/posts" backLabel="Posts" />
        <p className="px-4 py-8 text-sm text-red-600 dark:text-red-300">{error}</p>
      </>
    )
  }

  if (!post) {
    return null
  }

  return (
    <>
      <FeedHeader
        title="Edit post"
        backTo={`/posts/${post.id}`}
        backLabel="Post"
        actions={
          <Link to={`/posts/${post.id}`}>
            <Button variant="secondary" size="sm">
              View
            </Button>
          </Link>
        }
      />

      <form
        className="space-y-4 border-b border-surface-200 px-4 py-4 dark:border-surface-800"
        onSubmit={(event) => void handleSubmit(event)}
      >
        <Input
          label="Title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          error={fieldErrors.title}
          required
        />
        <Textarea
          label="Content"
          value={content}
          onChange={(event) => setContent(event.target.value)}
          error={fieldErrors.content}
          required
        />
        <Input
          label="Excerpt"
          value={excerpt}
          onChange={(event) => setExcerpt(event.target.value)}
          error={fieldErrors.excerpt}
        />
        <Input
          label="Tags"
          value={tagsInput}
          onChange={(event) => setTagsInput(event.target.value)}
          error={fieldErrors.tags}
          hint="Separate tags with commas."
        />

        {existingImages.length > 0 ? (
          <div className="space-y-2">
            <p className="text-sm font-medium text-surface-700 dark:text-surface-300">Current images</p>
            <PostImages images={existingImages} title={post.title} variant="detail" />
            <div className="flex flex-wrap gap-2">
              {existingImages.map((image) => (
                <Button
                  key={image.id}
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => removeExistingImage(image.id)}
                >
                  Remove {image.originalName || image.name}
                </Button>
              ))}
            </div>
          </div>
        ) : null}

        <ImageUploadField label="Add images" onChange={handleNewImagesChange} />

        {error ? <p className="text-sm text-red-600 dark:text-red-300">{error}</p> : null}

        <div className="flex flex-wrap gap-2 border-t border-surface-200 pt-4 dark:border-surface-800">
          <Button type="submit" size="sm" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save'}
          </Button>
          <Link to={`/posts/${post.id}`}>
            <Button variant="secondary" type="button" size="sm">
              Cancel
            </Button>
          </Link>
          <Button
            variant="danger"
            type="button"
            size="sm"
            className="sm:ml-auto"
            disabled={isDeleting}
            onClick={() => void handleDelete()}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </form>
    </>
  )
}
