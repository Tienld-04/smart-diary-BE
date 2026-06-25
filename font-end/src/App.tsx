import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { AppLayout } from './components/AppLayout'
import { ProtectedRoute } from './components/ProtectedRoute'
import { PageLoader } from './components/ui/Spinner'

import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import OAuthCallbackPage from './pages/OAuthCallbackPage'
import DashboardPage from './pages/DashboardPage'
import DiariesPage from './pages/DiariesPage'
import DiaryEditorPage from './pages/DiaryEditorPage'
import DiaryDetailPage from './pages/DiaryDetailPage'
import CalendarPage from './pages/CalendarPage'
import ChatPage from './pages/ChatPage'
import ProfilePage from './pages/ProfilePage'
import NotFoundPage from './pages/NotFoundPage'

/** Routes available only when logged out (login, register, …). */
function PublicOnly({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth()
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <PageLoader />
      </div>
    )
  }
  return isAuthenticated ? <Navigate to="/" replace /> : <>{children}</>
}

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<PublicOnly><LoginPage /></PublicOnly>} />
      <Route path="/register" element={<PublicOnly><RegisterPage /></PublicOnly>} />
      <Route path="/forgot-password" element={<PublicOnly><ForgotPasswordPage /></PublicOnly>} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/oauth2/callback" element={<OAuthCallbackPage />} />

      {/* Protected app shell */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<DashboardPage />} />
        <Route path="/diaries" element={<DiariesPage />} />
        <Route path="/diaries/new" element={<DiaryEditorPage />} />
        <Route path="/diaries/:id" element={<DiaryDetailPage />} />
        <Route path="/diaries/:id/edit" element={<DiaryEditorPage />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
