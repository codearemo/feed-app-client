type MessageStatusProps = {
  deliveredToRecipient?: boolean
  readByRecipient?: boolean
}

export function MessageStatus({ deliveredToRecipient, readByRecipient }: MessageStatusProps) {
  const label = readByRecipient
    ? 'Read'
    : deliveredToRecipient
      ? 'Delivered'
      : 'Sent'

  const colorClass = readByRecipient
    ? 'text-sky-300'
    : deliveredToRecipient
      ? 'text-white/75'
      : 'text-white/60'

  return (
    <span className={`inline-flex items-center ${colorClass}`} aria-label={label} title={label}>
      {deliveredToRecipient || readByRecipient ? (
        <svg viewBox="0 0 20 12" className="h-3.5 w-5" fill="none" aria-hidden="true">
          <path
            d="M1 6.5 3.5 9 8 3.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M7 6.5 9.5 9 18 1.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : (
        <svg viewBox="0 0 12 12" className="h-3.5 w-3.5" fill="none" aria-hidden="true">
          <path
            d="M1 6.5 3.5 9 10 2.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </span>
  )
}
