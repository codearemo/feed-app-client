import type { User } from '../api/types'
import type { AvatarUser } from './avatar'

export function getUserDisplayName(user: Pick<User, 'firstName' | 'lastName' | 'username'> | AvatarUser) {
  const fullName = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim()
  return fullName || user.username || 'User'
}

export function getUserInitials(user: Pick<User, 'firstName' | 'lastName' | 'username'>) {
  const first = user.firstName?.charAt(0) ?? ''
  const last = user.lastName?.charAt(0) ?? ''

  if (first || last) {
    return `${first}${last}`.toUpperCase()
  }

  return user.username.slice(0, 2).toUpperCase()
}
