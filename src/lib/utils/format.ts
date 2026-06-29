export function formatDate(isoDate: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(isoDate))
}

export function formatMessageTime(isoDate: string) {
  const date = new Date(isoDate)
  const now = new Date()
  const isToday = date.toDateString() === now.toDateString()

  if (isToday) {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    }).format(date)
  }

  const isSameYear = date.getFullYear() === now.getFullYear()

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    ...(isSameYear ? {} : { year: 'numeric' }),
  }).format(date)
}

export function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function getFileExtension(filename: string) {
  const parts = filename.split('.')
  return parts.length > 1 ? parts.at(-1)?.toUpperCase() ?? 'FILE' : 'FILE'
}
