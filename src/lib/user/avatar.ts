import type { UploadFile } from '../api/types'

/** Minimal user shape for avatars — works with full User objects or mock post authors. */
export type AvatarUser = {
  id: string
  firstName?: string
  lastName?: string
  username?: string
  profilePicture?: UploadFile | null
  /** Fallback initials when name fields are unavailable (e.g. mock feed data). */
  initials?: string
}

export function resolveAvatarInitials(user: AvatarUser) {
  if (user.initials) {
    return user.initials
  }

  const first = user.firstName?.charAt(0) ?? ''
  const last = user.lastName?.charAt(0) ?? ''

  if (first || last) {
    return `${first}${last}`.toUpperCase()
  }

  if (user.username) {
    return user.username.slice(0, 2).toUpperCase()
  }

  return '?'
}

export function resolveAvatarImageUrl(user: AvatarUser) {
  return user.profilePicture?.url ?? null
}

export function getUserProfilePath(userId: string, currentUserId?: string | null) {
  if (currentUserId && userId === currentUserId) {
    return '/profile'
  }

  return `/users/${userId}`
}

/** Map post author objects from the API to AvatarUser. */
export function postAuthorToAvatarUser(author: {
  id: string
  name: string
  avatar: string
  profilePicture?: UploadFile | null
}): AvatarUser {
  const [firstName, ...rest] = author.name.split(' ')

  return {
    id: author.id,
    firstName,
    lastName: rest.join(' '),
    username: author.name.toLowerCase().replace(/\s+/g, ''),
    initials: author.avatar,
    profilePicture: author.profilePicture ?? null,
  }
}

export function publicProfileToAvatarUser(profile: {
  id: string
  firstName: string
  lastName: string
  username: string
  avatar: string
  profilePicture: UploadFile | null
}): AvatarUser {
  return {
    id: profile.id,
    firstName: profile.firstName,
    lastName: profile.lastName,
    username: profile.username,
    initials: profile.avatar,
    profilePicture: profile.profilePicture,
  }
}
