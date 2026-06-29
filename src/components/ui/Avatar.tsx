import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { usePresence } from '../../context/PresenceContext'
import {
  getUserProfilePath,
  resolveAvatarImageUrl,
  resolveAvatarInitials,
  type AvatarUser,
} from '../../lib/user/avatar'

type AvatarProps = {
  user: AvatarUser
  size?: 'sm' | 'md' | 'lg'
  /** When false, renders a static avatar without profile navigation. */
  link?: boolean
  /** Show a green dot when the user is online via socket presence. */
  showPresence?: boolean
}

const sizeStyles = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
}

const presenceDotSizes = {
  sm: 'h-2 w-2 border',
  md: 'h-2.5 w-2.5 border-2',
  lg: 'h-3 w-3 border-2',
}

export function Avatar({ user, size = 'md', link = true, showPresence = false }: AvatarProps) {
  const { user: currentUser } = useAuth()
  const { isUserOnline } = usePresence()
  const initials = resolveAvatarInitials(user)
  const imageUrl = resolveAvatarImageUrl(user)
  const profilePath = link && user.id ? getUserProfilePath(user.id, currentUser?.id) : null
  const online = showPresence && isUserOnline(user.id)

  const avatar = (
    <span
      className={`relative inline-block shrink-0 overflow-visible rounded-full ${sizeStyles[size]}`}
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt=""
          className="block h-full w-full rounded-full object-cover ring-2 ring-white dark:ring-surface-800"
        />
      ) : (
        <span className="flex h-full w-full items-center justify-center rounded-full bg-brand-100 font-semibold text-brand-800 ring-2 ring-white dark:bg-brand-500/20 dark:text-brand-100 dark:ring-surface-800">
          {initials}
        </span>
      )}

      {online ? (
        <span
          className={`absolute bottom-0 right-0 z-10 rounded-full border-white bg-green-500 dark:border-surface-800 ${presenceDotSizes[size]}`}
          aria-hidden="true"
        />
      ) : null}
    </span>
  )

  if (profilePath) {
    return (
      <Link
        to={profilePath}
        className="inline-block shrink-0 transition-opacity hover:opacity-90"
        aria-label={online ? 'View profile (online)' : 'View profile'}
      >
        {avatar}
      </Link>
    )
  }

  return avatar
}
