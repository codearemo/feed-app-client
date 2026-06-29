type FormAlertProps = {
  message?: string
}

export function FormAlert({ message }: FormAlertProps) {
  if (!message) {
    return null
  }

  return (
    <div className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-200">
      {message}
    </div>
  )
}
