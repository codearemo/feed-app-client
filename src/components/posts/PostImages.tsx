import { useState, type MouseEvent, type ReactNode } from 'react'
import type { UploadFile } from '../../lib/api/types'
import { getImageUrls } from '../../lib/posts/images'
import { ImageLightbox } from './ImageLightbox'

type PostImagesProps = {
  images?: UploadFile[]
  imageUrls?: string[]
  title: string
  variant?: 'card' | 'detail'
}

const MAX_VISIBLE = 4

function getVisibleImages(imageUrls: string[]) {
  if (imageUrls.length <= 1) {
    return imageUrls
  }

  return imageUrls.slice(0, MAX_VISIBLE)
}

type ImageTileProps = {
  url: string
  alt: string
  className: string
  onOpen: (event: MouseEvent<HTMLButtonElement>) => void
  overlay?: ReactNode
}

function ImageTile({ url, alt, className, onOpen, overlay }: ImageTileProps) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className={`group/tile relative block w-full overflow-hidden text-left transition-opacity hover:opacity-95 ${className}`}
    >
      <img src={url} alt={alt} loading="lazy" className="h-full w-full object-cover" />
      <span className="pointer-events-none absolute inset-0 bg-surface-950/0 transition-colors group-hover/tile:bg-surface-950/10" />
      {overlay}
    </button>
  )
}

export function PostImages({ images, imageUrls, title, variant = 'card' }: PostImagesProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const resolvedUrls = imageUrls ?? getImageUrls(images ?? [])

  if (resolvedUrls.length === 0) {
    return null
  }

  const visibleImages = getVisibleImages(resolvedUrls)
  const hiddenCount = resolvedUrls.length - visibleImages.length

  const openLightbox = (index: number, event?: MouseEvent<HTMLButtonElement>) => {
    event?.preventDefault()
    event?.stopPropagation()
    setLightboxIndex(index)
  }

  const getOpenIndex = (index: number) => {
    if (hiddenCount > 0 && index === visibleImages.length - 1) {
      return Math.min(index + 1, resolvedUrls.length - 1)
    }

    return index
  }

  const lightbox =
    lightboxIndex !== null ? (
      <ImageLightbox
        images={resolvedUrls}
        title={title}
        index={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onIndexChange={setLightboxIndex}
      />
    ) : null

  if (variant === 'card') {
    if (visibleImages.length === 1) {
      return (
        <>
          <ImageTile
            url={visibleImages[0]}
            alt=""
            className="aspect-[16/9] max-h-72 overflow-hidden rounded-2xl border border-surface-200 dark:border-surface-700"
            onOpen={(event) => openLightbox(0, event)}
          />
          {lightbox}
        </>
      )
    }

    return (
      <>
        <div className="grid grid-cols-2 gap-0.5 overflow-hidden rounded-2xl border border-surface-200 dark:border-surface-700">
          {visibleImages.map((url, index) => (
            <ImageTile
              key={`${url}-${index}`}
              url={url}
              alt=""
              className="aspect-[4/3] h-28 sm:h-32"
              onOpen={(event) => openLightbox(getOpenIndex(index), event)}
              overlay={
                hiddenCount > 0 && index === visibleImages.length - 1 ? (
                  <span className="absolute inset-0 flex items-center justify-center bg-surface-900/60 text-sm font-semibold text-white">
                    +{hiddenCount} more
                  </span>
                ) : null
              }
            />
          ))}
        </div>
        {lightbox}
      </>
    )
  }

  return (
    <>
      <div className="space-y-2">
        {hiddenCount > 0 ? (
          <p className="text-xs text-surface-500 dark:text-surface-400">
            Showing {visibleImages.length} of {resolvedUrls.length} images
          </p>
        ) : null}
        <div
          className={
            visibleImages.length === 1
              ? 'grid grid-cols-1'
              : 'grid grid-cols-2 gap-0.5 overflow-hidden rounded-2xl border border-surface-200 dark:border-surface-700'
          }
        >
          {visibleImages.map((url, index) => (
            <ImageTile
              key={`${url}-${index}`}
              url={url}
              alt={`${title} image ${index + 1}`}
              className={
                visibleImages.length === 1
                  ? 'aspect-[16/10] max-h-72 overflow-hidden rounded-2xl border border-surface-200 dark:border-surface-700'
                  : 'aspect-[4/3] h-28 sm:h-32'
              }
              onOpen={(event) => openLightbox(getOpenIndex(index), event)}
              overlay={
                hiddenCount > 0 && index === visibleImages.length - 1 ? (
                  <span className="absolute inset-0 flex items-center justify-center bg-surface-900/60 text-sm font-semibold text-white">
                    +{hiddenCount} more
                  </span>
                ) : null
              }
            />
          ))}
        </div>
      </div>
      {lightbox}
    </>
  )
}
