import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.tsx'
import { ChatInboxProvider } from './context/ChatInboxContext.tsx'
import { OverlayProvider } from './context/OverlayProvider.tsx'
import { PresenceProvider } from './context/PresenceContext.tsx'
import { SocketProvider } from './context/SocketContext.tsx'
import { SocialAuthProvider } from './context/SocialAuthProvider.tsx'
import { ThemeProvider } from './context/ThemeContext.tsx'
import { ToastProvider } from './context/ToastContext.tsx'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <SocialAuthProvider>
        <BrowserRouter>
          <ToastProvider>
            <AuthProvider>
              <OverlayProvider>
                <SocketProvider>
                  <ChatInboxProvider>
                    <PresenceProvider>
                      <App />
                    </PresenceProvider>
                  </ChatInboxProvider>
                </SocketProvider>
              </OverlayProvider>
            </AuthProvider>
          </ToastProvider>
        </BrowserRouter>
      </SocialAuthProvider>
    </ThemeProvider>
  </StrictMode>,
)
