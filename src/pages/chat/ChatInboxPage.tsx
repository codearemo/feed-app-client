import { Link } from 'react-router-dom'
import { FeedHeader } from '../../components/layout/FeedHeader'
import { Avatar } from '../../components/ui/Avatar'
import { useChatInbox } from '../../context/ChatInboxContext'
import { formatMessageTime } from '../../lib/utils/format'
import { getUserDisplayName } from '../../lib/user/display'
import { publicProfileToAvatarUser } from '../../lib/user/avatar'

function previewContent(content: string) {
  const trimmed = content.trim()
  if (!trimmed) {
    return 'Empty message'
  }

  const firstLine = trimmed.split('\n')[0]
  return firstLine.length > 80 ? `${firstLine.slice(0, 77)}...` : firstLine
}

export function ChatInboxPage() {
  const { conversations, isLoading, error } = useChatInbox()

  return (
    <div>
      <FeedHeader title="Messages" />

      {isLoading && conversations.length === 0 ? (
        <p className="px-4 py-8 text-sm text-surface-500 dark:text-surface-400">Loading conversations...</p>
      ) : null}

      {error ? (
        <p className="px-4 py-8 text-sm text-red-600 dark:text-red-300">{error}</p>
      ) : null}

      {!isLoading && !error && conversations.length === 0 ? (
        <p className="px-4 py-8 text-sm text-surface-500 dark:text-surface-400">
          No conversations yet. Visit a profile and send a message to get started.
        </p>
      ) : null}

      <ul className="divide-y divide-surface-200 dark:divide-surface-800">
        {conversations.map((conversation) => {
          const participant = publicProfileToAvatarUser(conversation.participant)
          const hasUnread = conversation.unreadCount > 0

          return (
            <li key={conversation.id}>
              <Link
                to={`/messages/${conversation.id}`}
                className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-surface-50 dark:hover:bg-surface-900/60"
              >
                <Avatar user={participant} size="md" link={false} showPresence />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <p
                      className={`truncate text-sm ${
                        hasUnread
                          ? 'font-semibold text-surface-900 dark:text-surface-50'
                          : 'font-medium text-surface-800 dark:text-surface-100'
                      }`}
                    >
                      {getUserDisplayName(participant)}
                    </p>
                    {conversation.lastMessage ? (
                      <time
                        dateTime={conversation.lastMessage.createdAt}
                        className="shrink-0 text-xs text-surface-500 dark:text-surface-400"
                      >
                        {formatMessageTime(conversation.lastMessage.createdAt)}
                      </time>
                    ) : null}
                  </div>
                  <div className="mt-0.5 flex items-center justify-between gap-2">
                    <p
                      className={`truncate text-sm ${
                        hasUnread
                          ? 'font-medium text-surface-800 dark:text-surface-200'
                          : 'text-surface-500 dark:text-surface-400'
                      }`}
                    >
                      {conversation.lastMessage
                        ? previewContent(conversation.lastMessage.content)
                        : 'No messages yet'}
                    </p>
                    {hasUnread ? (
                      <span className="inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-brand-600 px-1.5 text-[11px] font-semibold text-white">
                        {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
                      </span>
                    ) : null}
                  </div>
                </div>
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
