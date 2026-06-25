import { useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { PageLoader } from '../components/ui/Spinner'

/**
 * Landing route for the Google OAuth flow. The backend finishes the OAuth
 * handshake and redirects here as: /oauth2/callback?token=<jwt>
 * We store the token, load the profile, then enter the app.
 */
export default function OAuthCallbackPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { loginWithToken } = useAuth()
  const ran = useRef(false)

  useEffect(() => {
    if (ran.current) return // guard against StrictMode double-invoke
    ran.current = true

    const token = params.get('token')
    const error = params.get('error')

    if (error || !token) {
      toast.error('Đăng nhập Google thất bại, vui lòng thử lại.')
      navigate('/login', { replace: true })
      return
    }

    loginWithToken(token)
      .then(() => {
        toast.success('Đăng nhập Google thành công! 🎉')
        navigate('/', { replace: true })
      })
      .catch(() => {
        toast.error('Không lấy được thông tin tài khoản.')
        navigate('/login', { replace: true })
      })
  }, [params, navigate, loginWithToken])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <PageLoader label="Đang hoàn tất đăng nhập Google…" />
    </div>
  )
}
