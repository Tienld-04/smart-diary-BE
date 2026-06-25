import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { ArrowLeft, KeyRound, Lock } from 'lucide-react'
import { AuthLayout } from '../components/AuthLayout'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { errorMessage } from '../lib/api'
import { authService } from '../lib/services'

export default function ResetPasswordPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const [token, setToken] = useState(params.get('token') ?? '')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) return toast.error('Vui lòng nhập mã đặt lại')
    if (newPassword.length < 6) return toast.error('Mật khẩu phải có ít nhất 6 ký tự')
    if (newPassword !== confirmPassword) return toast.error('Mật khẩu xác nhận không khớp')
    setLoading(true)
    try {
      const msg = await authService.resetPassword({ token, newPassword, confirmPassword })
      toast.success(msg || 'Đặt lại mật khẩu thành công')
      navigate('/login', { replace: true })
    } catch (err) {
      toast.error(errorMessage(err, 'Mã không hợp lệ hoặc đã hết hạn'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout title="Đặt lại mật khẩu" subtitle="Nhập mã từ email và mật khẩu mới của bạn.">
      <form onSubmit={onSubmit} className="space-y-4">
        <Input
          label="Mã đặt lại (token)"
          placeholder="Dán mã từ email"
          icon={<KeyRound className="h-5 w-5" />}
          value={token}
          onChange={(e) => setToken(e.target.value)}
        />
        <Input
          label="Mật khẩu mới"
          type="password"
          placeholder="Tối thiểu 6 ký tự"
          autoComplete="new-password"
          icon={<Lock className="h-5 w-5" />}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <Input
          label="Xác nhận mật khẩu mới"
          type="password"
          placeholder="Nhập lại mật khẩu"
          autoComplete="new-password"
          icon={<Lock className="h-5 w-5" />}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        <Button type="submit" size="lg" className="mt-2 w-full" loading={loading}>
          Đặt lại mật khẩu
        </Button>
      </form>

      <Link
        to="/login"
        className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-brand-600"
      >
        <ArrowLeft className="h-4 w-4" /> Quay lại đăng nhập
      </Link>
    </AuthLayout>
  )
}
