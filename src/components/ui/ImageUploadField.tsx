import { useEffect, useId, useRef, useState } from 'react'
import { formatFileSize } from '../../lib/utils/format'
import { Button } from './Button'

type ImageUploadFieldProps = {
  label?: string
  hint?: string
  maxFiles?: number
  onChange: (files: File[]) => void
}

type SelectedImage = {
  id: string
  file: File
  previewUrl: string
}

export function ImageUploadField({
  label = 'Images',
  hint = 'Optional. Up to 10 images (JPEG, PNG, GIF, WebP).',
  maxFiles = 10,
  onChange,
}: ImageUploadFieldProps) {
  const inputId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const [files, setFiles] = useState<SelectedImage[]>([])

  useEffect(() => {
    onChange(files.map((item) => item.file))
  }, [files, onChange])

  useEffect(() => {
    return () => {
      files.forEach((item) => URL.revokeObjectURL(item.previewUrl))
    }
  }, [files])

  function addFiles(incoming: FileList | null) {
    if (!incoming) {
      return
    }

    setFiles((current) => {
      const remaining = maxFiles - current.length
      const next = Array.from(incoming)
        .slice(0, remaining)
        .map((file) => ({
          id: `${file.name}-${file.lastModified}-${crypto.randomUUID()}`,
          file,
          previewUrl: URL.createObjectURL(file),
        }))

      return [...current, ...next]
    })
  }

  function removeFile(id: string) {
    setFiles((current) => {
      const target = current.find((item) => item.id === id)
      if (target) {
        URL.revokeObjectURL(target.previewUrl)
      }

      return current.filter((item) => item.id !== id)
    })
  }

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <label htmlFor={inputId} className="block text-sm font-medium text-surface-700 dark:text-surface-300">
          {label}
        </label>
        {hint ? <p className="text-xs text-surface-500 dark:text-surface-400">{hint}</p> : null}
      </div>

      <div className="rounded-xl border border-dashed border-surface-300 bg-surface-50 p-4 dark:border-surface-600 dark:bg-surface-900/40">
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/gif,image/webp"
          className="sr-only"
          disabled={files.length >= maxFiles}
          onChange={(event) => {
            addFiles(event.target.files)
            event.target.value = ''
          }}
        />

        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-surface-600 dark:text-surface-400">
            {files.length}/{maxFiles} selected
          </p>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={files.length >= maxFiles}
            onClick={() => inputRef.current?.click()}
          >
            Add images
          </Button>
        </div>
      </div>

      {files.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {files.map((item) => (
            <div
              key={item.id}
              className="overflow-hidden rounded-xl border border-surface-200 bg-surface-50 dark:border-surface-700 dark:bg-surface-800/60"
            >
              <div className="relative">
                <img src={item.previewUrl} alt={item.file.name} className="h-36 w-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeFile(item.id)}
                  className="absolute right-2 top-2 rounded-full bg-surface-900/80 px-2 py-1 text-xs font-medium text-white"
                >
                  Remove
                </button>
              </div>
              <div className="border-t border-surface-200 px-3 py-2 text-xs text-surface-500 dark:border-surface-700 dark:text-surface-400">
                {item.file.name} · {formatFileSize(item.file.size)}
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}
