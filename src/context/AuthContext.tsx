import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useNavigate } from 'react-router-dom'
import { useToast } from './ToastContext'
import { AUTH_EVENTS } from '../lib/auth/events'
import {
  authApi,
  tokenStore,
  usersApi,
  type LoginBody,
  type RegisterBody,
  type UpdateProfileBody,
  type User,
  type DisableTwoFactorBody,
  type TwoFactorSetup,
  type LoginResult,
  ApiError,
} from '../lib/api'
import { authSession } from '../lib/storage/session-storage'

type AuthContextValue = {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (body: LoginBody) => Promise<void>
  socialLogin: (provider: 'google' | 'apple', idToken: string) => Promise<void>
  register: (body: RegisterBody) => Promise<void>
  verifyEmail: (email: string, otp: string) => Promise<void>
  resendVerification: (email: string) => Promise<void>
  verifyTwoFactor: (code: string) => Promise<void>
  setupTwoFactor: () => Promise<TwoFactorSetup>
  confirmTwoFactor: (code: string) => Promise<string>
  disableTwoFactor: (body: DisableTwoFactorBody) => Promise<string>
  forgotPassword: (email: string) => Promise<void>
  resetPassword: (email: string, otp: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refreshProfile: () => Promise<User | null>
  updateProfile: (body: UpdateProfileBody) => Promise<User>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const toast = useToast()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const finishAuth = useCallback(
    (nextUser: User, message?: string) => {
      setUser(nextUser)
      authSession.clearAuthFlow()

      if (message) {
        toast.success(message)
      }

      navigate(authSession.consumeReturnTo('/posts'), { replace: true })
    },
    [navigate, toast],
  )

  const refreshProfile = useCallback(async () => {
    if (!tokenStore.getAccessToken()) {
      setUser(null)
      return null
    }

    const profile = await usersApi.getMe()
    setUser(profile)
    return profile
  }, [])

  useEffect(() => {
    async function bootstrap() {
      if (!tokenStore.hasSession()) {
        setIsLoading(false)
        return
      }

      try {
        await refreshProfile()
      } catch {
        tokenStore.clear()
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    bootstrap()
  }, [refreshProfile])

  useEffect(() => {
    function handleSessionExpired() {
      setUser(null)
      toast.warning('Your session expired. Please sign in again.')
      navigate('/login', { replace: true })
    }

    function handleEmailNotVerified(event: Event) {
      const detail = (event as CustomEvent<{ email?: string }>).detail
      toast.warning('Please verify your email to continue.')
      if (detail?.email) {
        authSession.setPendingVerifyEmail(detail.email)
      }
      navigate('/verify-email', { replace: true })
    }

    window.addEventListener(AUTH_EVENTS.sessionExpired, handleSessionExpired)
    window.addEventListener(AUTH_EVENTS.emailNotVerified, handleEmailNotVerified)

    return () => {
      window.removeEventListener(AUTH_EVENTS.sessionExpired, handleSessionExpired)
      window.removeEventListener(AUTH_EVENTS.emailNotVerified, handleEmailNotVerified)
    }
  }, [navigate, toast])

  const completeLoginResult = useCallback(
    async (result: LoginResult, successMessage = 'Welcome back!') => {
      if (result.requiresTwoFactor === true) {
        authSession.setTwoFactorToken(result.twoFactorToken)
        toast.info('Enter the code from your authenticator app.')
        navigate('/two-factor')
        return
      }

      finishAuth(result.user, successMessage)
    },
    [finishAuth, navigate, toast],
  )

  const login = useCallback(
    async (body: LoginBody) => {
      try {
        const result = await authApi.login(body)
        await completeLoginResult(result)
      } catch (error) {
        if (error instanceof ApiError && error.isEmailNotVerified) {
          if (body.identifier.includes('@')) {
            authSession.setPendingVerifyEmail(body.identifier)
          }

          toast.warning('Please verify your email before signing in.')
          navigate('/verify-email')
          return
        }

        throw error
      }
    },
    [completeLoginResult, navigate, toast],
  )

  const socialLogin = useCallback(
    async (provider: 'google' | 'apple', idToken: string) => {
      const result = await authApi.socialLogin({ provider, idToken })
      await completeLoginResult(result)
    },
    [completeLoginResult],
  )

  const register = useCallback(
    async (body: RegisterBody) => {
      await authApi.register(body)
      authSession.setPendingVerifyEmail(body.email)
      toast.success('Account created. Check your email for a verification code.')
      navigate('/verify-email')
    },
    [navigate, toast],
  )

  const verifyEmail = useCallback(
    async (email: string, otp: string) => {
      await authApi.verifyEmail({ email, otp })
      authSession.clearPendingVerifyEmail()
      toast.success('Email verified. You can sign in now.')
      navigate('/login')
    },
    [navigate, toast],
  )

  const resendVerification = useCallback(
    async (email: string) => {
      const message = await authApi.resendVerification({ email })
      toast.info(message)
    },
    [toast],
  )

  const verifyTwoFactor = useCallback(
    async (code: string) => {
      const twoFactorToken = authSession.getTwoFactorToken()

      if (!twoFactorToken) {
        throw new ApiError('Two-factor session expired. Please sign in again.', 401)
      }

      try {
        const result = await authApi.verifyTwoFactor({ twoFactorToken, code })
        finishAuth(result.user, 'Signed in successfully.')
      } catch (error) {
        if (error instanceof ApiError && error.statusCode === 401) {
          authSession.clearTwoFactorToken()
        }

        throw error
      }
    },
    [finishAuth],
  )

  const setupTwoFactor = useCallback(async () => {
    return authApi.setupTwoFactor()
  }, [])

  const confirmTwoFactor = useCallback(
    async (code: string) => {
      const { message } = await authApi.confirmTwoFactor({ code })
      await refreshProfile()
      return message
    },
    [refreshProfile],
  )

  const disableTwoFactor = useCallback(
    async (body: DisableTwoFactorBody) => {
      const { message } = await authApi.disableTwoFactor(body)
      await refreshProfile()
      return message
    },
    [refreshProfile],
  )

  const forgotPassword = useCallback(
    async (email: string) => {
      const message = await authApi.forgotPassword({ email })
      authSession.setResetPasswordEmail(email)
      toast.info(message)
      navigate('/reset-password')
    },
    [navigate, toast],
  )

  const resetPassword = useCallback(
    async (email: string, otp: string, password: string) => {
      const message = await authApi.resetPassword({ email, otp, password })
      authSession.clearResetPasswordEmail()
      toast.success(message)
      navigate('/login')
    },
    [navigate, toast],
  )

  const logout = useCallback(async () => {
    try {
      await authApi.logout()
    } finally {
      setUser(null)
      authSession.clearAuthFlow()
      toast.info('Signed out.')
      navigate('/login', { replace: true })
    }
  }, [navigate, toast])

  const updateProfile = useCallback(async (body: UpdateProfileBody) => {
    const profile = await usersApi.updateMe(body)
    setUser(profile)
    return profile
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      isAuthenticated: Boolean(user),
      login,
      socialLogin,
      register,
      verifyEmail,
      resendVerification,
      verifyTwoFactor,
      setupTwoFactor,
      confirmTwoFactor,
      disableTwoFactor,
      forgotPassword,
      resetPassword,
      logout,
      refreshProfile,
      updateProfile,
    }),
    [
      user,
      isLoading,
      login,
      socialLogin,
      register,
      verifyEmail,
      resendVerification,
      verifyTwoFactor,
      setupTwoFactor,
      confirmTwoFactor,
      disableTwoFactor,
      forgotPassword,
      resetPassword,
      logout,
      refreshProfile,
      updateProfile,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }

  return context
}
