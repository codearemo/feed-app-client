import { useEffect, useId, useRef, useState } from 'react'
import { formatFileSize, getFileExtension } from '../../lib/utils/format'
import { Button } from './Button'

type FileKind = 'image' | 'video' | 'audio' | 'pdf' | 'other'

type SelectedFile = {
  id: string
  file: File
  previewUrl: string | null
  kind: FileKind
}

type FileUploadFieldProps = {
  label?: string
  hint?: string
}

function detectFileKind(file: File): FileKind {
  if (file.type.startsWith('image/')) return 'image'
  if (file.type.startsWith('video/')) return 'video'
  if (file.type.startsWith('audio/')) return 'audio'
  if (file.type === 'application/pdf') return 'pdf'
  return 'other'
}

function createPreview(file: File, kind: FileKind) {
  if (kind === 'image' || kind === 'video' || kind === 'audio') {
    return URL.createObjectURL(file)
  }

  return null
}

function FilePreviewCard({
  item,
  onRemove,
}: {
  item: SelectedFile
  onRemove: (id: string) => void
}) {
  const extension = getFileExtension(item.file.name)

  return (
    <div className="overflow-hidden rounded-xl border border-surface-200 bg-surface-50 dark:border-surface-700 dark:bg-surface-800/60">
      <div className="relative flex min-h-36 items-center justify-center bg-surface-100 dark:bg-surface-800">
        {item.kind === 'image' && item.previewUrl ? (
          <img
            src={item.previewUrl}
            alt={item.file.name}
            className="h-36 w-full object-cover"
          />
        ) : null}

        {item.kind === 'video' && item.previewUrl ? (
          <video src={item.previewUrl} className="h-36 w-full object-cover" muted />
        ) : null}

        {item.kind === 'audio' && item.previewUrl ? (
          <div className="flex w-full flex-col items-center gap-3 px-4 py-6">
            <FileTypeIcon kind="audio" />
            <audio src={item.previewUrl} controls className="w-full max-w-xs" />
          </div>
        ) : null}

        {(item.kind === 'pdf' || item.kind === 'other') && (
          <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
            <FileTypeIcon kind={item.kind} />
            <span className="rounded-md bg-white px-2 py-0.5 text-xs font-semibold text-surface-700 dark:bg-surface-900 dark:text-surface-200">
              {extension}
            </span>
          </div>
        )}

        <button
          type="button"
          onClick={() => onRemove(item.id)}
          className="absolute right-2 top-2 rounded-full bg-surface-900/80 px-2 py-1 text-xs font-medium text-white transition-colors hover:bg-surface-900"
          aria-label={`Remove ${item.file.name}`}
        >
          Remove
        </button>
      </div>

      <div className="space-y-0.5 border-t border-surface-200 px-3 py-2.5 dark:border-surface-700">
        <p className="truncate text-sm font-medium text-surface-900 dark:text-surface-100">
          {item.file.name}
        </p>
        <p className="text-xs text-surface-500 dark:text-surface-400">
          {item.file.type || 'Unknown type'} · {formatFileSize(item.file.size)}
        </p>
      </div>
    </div>
  )
}

function FileTypeIcon({ kind }: { kind: FileKind }) {
  const iconClass = 'h-10 w-10 text-surface-500 dark:text-surface-400'

  if (kind === 'pdf') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={iconClass}>
        <path d="M7 3h7l5 5v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" />
        <path d="M14 3v5h5M8 13h8M8 17h8M8 9h3" />
      </svg>
    )
  }

  if (kind === 'audio') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={iconClass}>
        <path d="M9 18V5l12-2v13" />
        <circle cx="6" cy="18" r="3" />
        <circle cx="18" cy="16" r="3" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={iconClass}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6M8 13h8M8 17h5" />
    </svg>
  )
}

export function FileUploadField({
  label = 'Attachments',
  hint = 'Images, videos, audio, PDFs, and other files are supported. Preview only — uploads are not wired up yet.',
}: FileUploadFieldProps) {
  const inputId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const filesRef = useRef<SelectedFile[]>([])
  const [files, setFiles] = useState<SelectedFile[]>([])

  filesRef.current = files

  useEffect(() => {
    return () => {
      filesRef.current.forEach((item) => {
        if (item.previewUrl) {
          URL.revokeObjectURL(item.previewUrl)
        }
      })
    }
  }, [])

  const addFiles = (incoming: FileList | null) => {
    if (!incoming) return

    const nextFiles = Array.from(incoming).map((file) => {
      const kind = detectFileKind(file)

      return {
        id: `${file.name}-${file.lastModified}-${crypto.randomUUID()}`,
        file,
        kind,
        previewUrl: createPreview(file, kind),
      }
    })

    setFiles((current) => [...current, ...nextFiles])
  }

  const removeFile = (id: string) => {
    setFiles((current) => {
      const target = current.find((item) => item.id === id)
      if (target?.previewUrl) {
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

      <div className="rounded-xl border border-dashed border-surface-300 bg-surface-50 p-5 dark:border-surface-600 dark:bg-surface-900/40">
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          multiple
          accept="*/*"
          className="sr-only"
          onChange={(event) => {
            addFiles(event.target.files)
            event.target.value = ''
          }}
        />

        <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:text-left">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-700 dark:bg-brand-500/15 dark:text-brand-200">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-6 w-6">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </div>

          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium text-surface-900 dark:text-surface-100">
              Choose files to attach
            </p>
            <p className="text-xs text-surface-500 dark:text-surface-400">
              Drag and drop is coming later — use the button to browse any file type.
            </p>
          </div>

          <Button type="button" variant="secondary" onClick={() => inputRef.current?.click()}>
            Browse files
          </Button>
        </div>
      </div>

      {files.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {files.map((item) => (
            <FilePreviewCard key={item.id} item={item} onRemove={removeFile} />
          ))}
        </div>
      ) : null}
    </div>
  )
}
