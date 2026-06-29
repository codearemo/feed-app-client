import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { Avatar } from '../../components/ui/Avatar'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { FormAlert } from '../../components/ui/FormAlert'
import { Input } from '../../components/ui/Input'
import { PageHeader } from '../../components/ui/PageHeader'
import { Textarea } from '../../components/ui/Textarea'
import { uploadsApi } from '../../lib/api'
import { getFieldErrors, getErrorMessage } from '../../lib/forms/getFieldErrors'
import { getUserDisplayName } from '../../lib/user/display'

export function ProfilePage() {
  const { user, updateProfile, refreshProfile } = useAuth()
  const toast = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [username, setUsername] = useState('')
  const [bio, setBio] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string>()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false)

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName)
      setLastName(user.lastName)
      setUsername(user.username)
      setBio(user.bio ?? '')
    }
  }, [user])

  if (!user) {
    return null
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError(undefined)
    setFieldErrors({})
    setIsSubmitting(true)

    try {
      await updateProfile({ firstName, lastName, username, bio })
      toast.success('Profile updated successfully.')
    } catch (error) {
      const message = getErrorMessage(error, 'Unable to update profile')
      setFieldErrors(getFieldErrors(error))
      setFormError(message)
      toast.error(message, 'Update failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handlePhotoChange(file: File | undefined) {
    if (!file) return

    setIsUploadingPhoto(true)

    try {
      const [uploaded] = await uploadsApi.upload(file)
      await updateProfile({ profilePicture: uploaded.id })
      await refreshProfile()
      toast.success('Profile picture updated.')
    } catch (error) {
      toast.error(getErrorMessage(error, 'Unable to upload profile picture'))
    } finally {
      setIsUploadingPhoto(false)
    }
  }

  async function handleRemovePhoto() {
    setIsUploadingPhoto(true)

    try {
      await updateProfile({ profilePicture: null })
      await refreshProfile()
      toast.success('Profile picture removed.')
    } catch (error) {
      toast.error(getErrorMessage(error, 'Unable to remove profile picture'))
    } finally {
      setIsUploadingPhoto(false)
    }
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Account"
        title="Profile"
        description="Update your public profile information and photo."
      />

      <Card padding="lg" className="space-y-6">
        <div className="flex flex-wrap items-center gap-4">
          <Avatar user={user} size="lg" link={false} />
          <div className="space-y-2">
            <p className="font-medium text-surface-900 dark:text-surface-100">
              {getUserDisplayName(user)}
            </p>
            <p className="text-sm text-surface-500 dark:text-surface-400">{user.email}</p>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={isUploadingPhoto}
                onClick={() => fileInputRef.current?.click()}
              >
                {isUploadingPhoto ? 'Uploading...' : 'Change photo'}
              </Button>
              {user.profilePicture ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={isUploadingPhoto}
                  onClick={handleRemovePhoto}
                >
                  Remove
                </Button>
              ) : null}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              className="hidden"
              onChange={(event) => {
                handlePhotoChange(event.target.files?.[0])
                event.target.value = ''
              }}
            />
          </div>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <FormAlert message={formError} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="First name"
              value={firstName}
              onChange={(event) => setFirstName(event.target.value)}
              error={fieldErrors.firstName}
            />
            <Input
              label="Last name"
              value={lastName}
              onChange={(event) => setLastName(event.target.value)}
              error={fieldErrors.lastName}
            />
          </div>
          <Input
            label="Username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            error={fieldErrors.username}
          />
          <Textarea
            label="Bio"
            value={bio}
            onChange={(event) => setBio(event.target.value)}
            error={fieldErrors.bio}
            hint="Up to 500 characters."
          />
          <div className="flex gap-2 border-t border-surface-100 pt-5 dark:border-surface-800">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save changes'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
