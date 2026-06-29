import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Avatar } from '../../components/ui/Avatar'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { PageHeader } from '../../components/ui/PageHeader'
import { useChatInbox } from '../../context/ChatInboxContext'
import { conversationsApi } from '../../lib/api/conversations.api'
import { usersApi } from '../../lib/api/users.api'
import type { PublicUserProfile } from '../../lib/api/types'
import { getErrorMessage } from '../../lib/forms/getFieldErrors'
import { formatDate } from '../../lib/utils/format'
import { getUserDisplayName } from '../../lib/user/display'
import { publicProfileToAvatarUser } from '../../lib/user/avatar'

export function UserProfilePage() {
  const { userId } = useParams()
  const navigate = useNavigate()
  const { user: currentUser } = useAuth()
  const { upsertConversation } = useChatInbox()
  const [profile, setProfile] = useState<PublicUserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string>()
  const [isStartingChat, setIsStartingChat] = useState(false)
  const [chatError, setChatError] = useState<string>()

  useEffect(() => {
    if (!userId || currentUser?.id === userId) {
      return
    }

    let cancelled = false

    async function loadProfile(id: string) {
      setIsLoading(true)
      setError(undefined)

      try {
        const data = await usersApi.getPublicProfile(id)
        if (!cancelled) {
          setProfile(data)
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(getErrorMessage(loadError, 'Unable to load profile'))
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    void loadProfile(userId)

    return () => {
      cancelled = true
    }
  }, [currentUser?.id, userId])

  if (!userId) {
    return null
  }

  if (currentUser?.id === userId) {
    return (
      <div className="space-y-4">
        <PageHeader title="Profile" description="You are viewing your own profile." />
        <Card padding="md">
          <Link to="/profile" className="text-sm font-medium text-brand-600 dark:text-brand-400">
            Go to profile settings →
          </Link>
        </Card>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <PageHeader title="Profile" description="Loading profile..." />
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="space-y-4">
        <PageHeader title="User not found" description={error ?? 'This profile is not available.'} />
      </div>
    )
  }

  const avatarUser = publicProfileToAvatarUser(profile)

  async function handleStartChat() {
    if (!userId) {
      return
    }

    setChatError(undefined)
    setIsStartingChat(true)

    try {
      const conversation = await conversationsApi.create({ participantId: userId })
      upsertConversation(conversation)
      navigate(`/messages/${conversation.id}`)
    } catch (startError) {
      setChatError(getErrorMessage(startError, 'Unable to start conversation'))
    } finally {
      setIsStartingChat(false)
    }
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title={getUserDisplayName(avatarUser)}
        actions={
          <Button size="sm" onClick={() => void handleStartChat()} disabled={isStartingChat}>
            {isStartingChat ? 'Opening...' : 'Message'}
          </Button>
        }
      />

      <Card padding="lg" className="flex items-center gap-4">
        <Avatar user={avatarUser} size="lg" link={false} />
        <div>
          <p className="font-medium text-surface-900 dark:text-surface-100">
            {getUserDisplayName(avatarUser)}
          </p>
          <p className="text-sm text-surface-500 dark:text-surface-400">@{profile.username}</p>
          {profile.bio ? (
            <p className="mt-2 text-sm text-surface-700 dark:text-surface-300">{profile.bio}</p>
          ) : null}
          <p className="mt-2 text-xs text-surface-500 dark:text-surface-400">
            Joined {formatDate(profile.createdAt)}
          </p>
        </div>
      </Card>
      {chatError ? <p className="text-sm text-red-600 dark:text-red-300">{chatError}</p> : null}
    </div>
  )
}
