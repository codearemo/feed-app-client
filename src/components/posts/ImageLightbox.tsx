import { useEffect } from 'react'
import { createPortal } from 'react-dom'

type ImageLightboxProps = {
  images: string[]
  title: string
  index: number
  onClose: () => void
  onIndexChange: (index: number) => void
}

export function ImageLightbox({
  images,
  title,
  index,
  onClose,
  onIndexChange,
}: ImageLightboxProps) {
  const hasPrevious = index > 0
  const hasNext = index < images.length - 1

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }

      if (event.key === 'ArrowLeft' && hasPrevious) {
        onIndexChange(index - 1)
      }

      if (event.key === 'ArrowRight' && hasNext) {
        onIndexChange(index + 1)
      }
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [hasNext, hasPrevious, index, onClose, onIndexChange])

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8"
      role="dialog"
      aria-modal="true"
      aria-label={`${title} image viewer`}
    >
      <button
        type="button"
        className="absolute inset-0 bg-surface-950/92 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close image viewer"
      />

      <div className="relative z-10 flex max-h-full max-w-full flex-col items-center gap-4">
        <div className="flex w-full max-w-5xl items-center justify-between gap-3 px-1">
          <p className="truncate text-sm font-medium text-white">
            {title} · {index + 1} / {images.length}
          </p>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-white/10 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-white/20"
          >
            Close
          </button>
        </div>

        <div className="relative flex items-center justify-center">
          {hasPrevious ? (
            <button
              type="button"
              onClick={() => onIndexChange(index - 1)}
              className="absolute -left-3 z-20 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20 sm:-left-12"
              aria-label="Previous image"
            >
              <ChevronIcon direction="left" />
            </button>
          ) : null}

          <img
            src={images[index]}
            alt={`${title} image ${index + 1}`}
            className="max-h-[78vh] max-w-[min(92vw,1100px)] rounded-xl object-contain shadow-2xl"
          />

          {hasNext ? (
            <button
              type="button"
              onClick={() => onIndexChange(index + 1)}
              className="absolute -right-3 z-20 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20 sm:-right-12"
              aria-label="Next image"
            >
              <ChevronIcon direction="right" />
            </button>
          ) : null}
        </div>
      </div>
    </div>,
    document.body,
  )
}

function ChevronIcon({ direction }: { direction: 'left' | 'right' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="h-5 w-5"
      aria-hidden="true"
    >
      {direction === 'left' ? <path d="M15 18l-6-6 6-6" /> : <path d="M9 18l6-6-6-6" />}
    </svg>
  )
}
