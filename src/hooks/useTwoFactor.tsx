import { useCallback, useState } from 'react'
import { TwoFactorDisableForm } from '../components/settings/TwoFactorDisableForm'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { useOverlay } from './useOverlay'
import { ApiError } from '../lib/api/errors'
import { getFieldErrors, getErrorMessage } from '../lib/forms/getFieldErrors'
import type { DisableTwoFactorBody, TwoFactorSetup } from '../lib/api/types'

export type TwoFactorError = {
  message: string
  fieldErrors: Record<string, string>
}

function toTwoFactorError(error: unknown, fallback: string): TwoFactorError {
  return {
    message: getErrorMessage(error, fallback),
    fieldErrors: getFieldErrors(error),
  }
}

export function useTwoFactor() {
  const { user, setupTwoFactor, confirmTwoFactor, disableTwoFactor } = useAuth()
  const toast = useToast()
  const { openDrawer, closeOverlay } = useOverlay()
  const [setup, setSetup] = useState<TwoFactorSetup | null>(null)
  const [isBusy, setIsBusy] = useState(false)

  const startSetup = useCallback(async () => {
    setIsBusy(true)

    try {
      const result = await setupTwoFactor()
      setSetup(result)
      toast.info('Scan the QR code with your authenticator app.')
      return result
    } catch (error) {
      toast.error(getErrorMessage(error, 'Unable to start 2FA setup'))
      throw error
    } finally {
      setIsBusy(false)
    }
  }, [setupTwoFactor, toast])

  const confirmSetup = useCallback(
    async (code: string) => {
      setIsBusy(true)

      try {
        const message = await confirmTwoFactor(code)
        setSetup(null)
        toast.success(message)
      } catch (error) {
        const formatted = toTwoFactorError(error, 'Unable to confirm 2FA')
        throw formatted
      } finally {
        setIsBusy(false)
      }
    },
    [confirmTwoFactor, toast],
  )

  const disable = useCallback(
    async (body: DisableTwoFactorBody) => {
      setIsBusy(true)

      try {
        const message = await disableTwoFactor(body)
        setSetup(null)
        closeOverlay()
        toast.success(message)
      } catch (error) {
        const formatted = toTwoFactorError(error, 'Unable to disable 2FA')
        toast.error(formatted.message)
        throw formatted
      } finally {
        setIsBusy(false)
      }
    },
    [closeOverlay, disableTwoFactor, toast],
  )

  const openDisableDrawer = useCallback(
    (onDisabled?: () => void) => {
      openDrawer({
        title: 'Disable two-factor authentication',
        children: <TwoFactorDisableForm onDisabled={onDisabled} />,
      })
    },
    [openDrawer],
  )

  const closeDisableDrawer = useCallback(() => {
    closeOverlay()
  }, [closeOverlay])

  const cancelSetup = useCallback(() => {
    setSetup(null)
  }, [])

  const handleToggle = useCallback(
    async (enabled: boolean, onDisabled?: () => void) => {
      if (enabled) {
        await startSetup()
        return
      }

      if (!user?.twoFactorEnabled) {
        return
      }

      openDisableDrawer(onDisabled)
    },
    [openDisableDrawer, startSetup, user?.twoFactorEnabled],
  )

  return {
    user,
    setup,
    isBusy,
    isEnabled: Boolean(user?.twoFactorEnabled),
    startSetup,
    confirmSetup,
    disableTwoFactor: disable,
    cancelSetup,
    handleToggle,
    openDisableDrawer,
    closeDisableDrawer,
  }
}

export function isTwoFactorSessionExpired(error: unknown) {
  return error instanceof ApiError && error.statusCode === 401
}
