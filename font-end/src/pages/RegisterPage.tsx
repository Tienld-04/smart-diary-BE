import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Lock, Mail, User } from 'lucide-react'
import { AuthLayout } from '../components/AuthLayout'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { useAuth } from '../context/AuthContext'
import { errorMessage } from '../lib/api'
import { authService } from '../lib/services'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [form, setForm] = useState({ fullname: '', email: '', password: '', confirm: '' })
  const [loading, setLoading] = useState(false)

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.fullname || !form.email || !form.password) {
      toast.error('Vui lòng điền đầy đủ thông tin')
      return
    }
    if (form.password.length < 6) {
      toast.error('Mật khẩu phải có ít nhất 6 ký tự')
      return
    }
    if (form.password !== form.confirm) {
      toast.error('Mật khẩu xác nhận không khớp')
      return
    }
    setLoading(true)
    try {
      await authService.register({
        fullname: form.fullname,
        email: form.email,
        password: form.password,
      })
      toast.success('Tạo tài khoản thành công! Đang đăng nhập…')
      // Auto-login for a smooth first experience.
      try {
        await login({ email: form.email, password: form.password })
        navigate('/', { replace: true })
      } catch {
        navigate('/login', { replace: true })
      }
    } catch (err) {
      toast.error(errorMessage(err, 'Đăng ký không thành công'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout title="Tạo tài khoản" subtitle="Bắt đầu hành trình viết nhật ký cảm xúc của riêng bạn.">
      <form onSubmit={onSubmit} className="space-y-4">
        <Input
          label="Họ và tên"
          placeholder="Nguyễn Văn A"
          autoComplete="name"
          icon={<User className="h-5 w-5" />}
          value={form.fullname}
          onChange={set('fullname')}
        />
        <Input
          label="Email"
          type="email"
          placeholder="ban@email.com"
          autoComplete="email"
          icon={<Mail className="h-5 w-5" />}
          value={form.email}
          onChange={set('email')}
        />
        <Input
          label="Mật khẩu"
          type="password"
          placeholder="Tối thiểu 6 ký tự"
          autoComplete="new-password"
          icon={<Lock className="h-5 w-5" />}
          value={form.password}
          onChange={set('password')}
        />
        <Input
          label="Xác nhận mật khẩu"
          type="password"
          placeholder="Nhập lại mật khẩu"
          autoComplete="new-password"
          icon={<Lock className="h-5 w-5" />}
          value={form.confirm}
          onChange={set('confirm')}
        />

        <Button type="submit" size="lg" className="mt-2 w-full" loading={loading}>
          Đăng ký
        </Button>

        <p className="text-center text-sm text-slate-500">
          Đã có tài khoản?{' '}
          <Link to="/login" className="font-bold text-brand-600 hover:text-brand-700">
            Đăng nhập
          </Link>
        </p>
      </form>
    </AuthLayout>
  )
}
