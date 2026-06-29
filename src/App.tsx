import { Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from './components/guards/ProtectedRoute'
import { GuestRoute } from './components/guards/GuestRoute'
import { AppLayout } from './components/layout/AppLayout'
import { AuthLayout } from './components/layout/AuthLayout'
import { FeedLayout } from './components/layout/FeedLayout'
import { SettingsLayout } from './components/layout/SettingsLayout'
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage'
import { LoginPage } from './pages/auth/LoginPage'
import { RegisterPage } from './pages/auth/RegisterPage'
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage'
import { TwoFactorPage } from './pages/auth/TwoFactorPage'
import { VerifyEmailPage } from './pages/auth/VerifyEmailPage'
import { ChatConversationPage } from './pages/chat/ChatConversationPage'
import { ChatInboxPage } from './pages/chat/ChatInboxPage'
import { ProfilePage } from './pages/profile/ProfilePage'
import { UserProfilePage } from './pages/profile/UserProfilePage'
import { EditPostPage } from './pages/posts/EditPostPage'
import { PostDetailPage } from './pages/posts/PostDetailPage'
import { PostsPage } from './pages/posts/PostsPage'
import { SettingsPage } from './pages/settings/SettingsPage'
import { SettingsSecurityPage } from './pages/settings/SettingsSecurityPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/posts" replace />} />

      <Route element={<GuestRoute />}>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/two-factor" element={<TwoFactorPage />} />
        </Route>
      </Route>

      <Route element={<AppLayout />}>
        <Route element={<ProtectedRoute />}>
          <Route element={<FeedLayout />}>
            <Route path="/posts" element={<PostsPage />} />
            <Route path="/posts/:postId" element={<PostDetailPage />} />
            <Route path="/posts/:postId/edit" element={<EditPostPage />} />
            <Route path="/messages" element={<ChatInboxPage />} />
            <Route path="/messages/:conversationId" element={<ChatConversationPage />} />
          </Route>

          <Route path="/users/:userId" element={<UserProfilePage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route path="/profile" element={<ProfilePage />} />

          <Route path="/settings" element={<SettingsLayout />}>
            <Route index element={<SettingsPage />} />
            <Route path="security" element={<SettingsSecurityPage />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  )
}
