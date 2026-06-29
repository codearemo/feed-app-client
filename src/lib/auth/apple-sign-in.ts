type AppleAuthorization = {
  id_token: string
  code?: string
  state?: string
}

type AppleSignInResponse = {
  authorization: AppleAuthorization
  user?: {
    email?: string
    name?: {
      firstName?: string
      lastName?: string
    }
  }
}

type AppleAuthConfig = {
  clientId: string
  scope?: string
  redirectURI: string
  usePopup?: boolean
}

type AppleAuth = {
  init: (config: AppleAuthConfig) => void
  signIn: () => Promise<AppleSignInResponse>
}

declare global {
  interface Window {
    AppleID?: {
      auth: AppleAuth
    }
  }
}

const APPLE_SDK_URL =
  'https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js'

let appleSdkPromise: Promise<void> | null = null

function loadAppleSdk() {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Apple Sign In is only available in the browser'))
  }

  if (window.AppleID) {
    return Promise.resolve()
  }

  appleSdkPromise ??= new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${APPLE_SDK_URL}"]`)

    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true })
      existing.addEventListener('error', () => reject(new Error('Unable to load Apple Sign In')), {
        once: true,
      })
      return
    }

    const script = document.createElement('script')
    script.src = APPLE_SDK_URL
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Unable to load Apple Sign In'))
    document.head.appendChild(script)
  })

  return appleSdkPromise
}

export async function signInWithApple(clientId: string) {
  await loadAppleSdk()

  if (!window.AppleID) {
    throw new Error('Apple Sign In is unavailable')
  }

  window.AppleID.auth.init({
    clientId,
    scope: 'name email',
    redirectURI: window.location.origin,
    usePopup: true,
  })

  const response = await window.AppleID.auth.signIn()
  const idToken = response.authorization.id_token

  if (!idToken) {
    throw new Error('Apple did not return a sign-in token')
  }

  return idToken
}
