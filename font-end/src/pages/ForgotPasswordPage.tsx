import { useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { ArrowLeft, Mail, MailCheck } from 'lucide-react'
import { AuthLayout } from '../components/AuthLayout'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { errorMessage } from '../lib/api'
import { authService } from '../lib/services'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) {
      toast.error('Vui lòng nhập email')
      return
    }
    setLoading(true)
    try {
      await authService.requestReset(email)
      setSent(true)
      toast.success('Đã gửi liên kết đặt lại mật khẩu')
    } catch (err) {
      toast.error(errorMessage(err, 'Không gửi được email, vui lòng thử lại'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout title="Quên mật khẩu" subtitle="Nhập email và chúng tôi sẽ gửi liên kết đặt lại mật khẩu.">
      {sent ? (
        <div className="rounded-3xl border border-emerald-100 bg-emerald-50/60 p-6 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
            <MailCheck className="h-7 w-7" />
          </div>
          <h3 className="font-bold text-slate-800">Kiểm tra hộp thư của bạn</h3>
          <p className="mt-1.5 text-sm text-slate-500">
            Chúng tôi đã gửi liên kết đặt lại mật khẩu tới <span className="font-semibold">{email}</span>.
          </p>
          <Link to="/reset-password" className="mt-5 inline-block">
            <Button variant="soft">Tôi đã có mã đặt lại</Button>
          </Link>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-5">
          <Input
            label="Email"
            type="email"
            placeholder="ban@email.com"
            autoComplete="email"
            icon={<Mail className="h-5 w-5" />}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Button type="submit" size="lg" className="w-full" loading={loading}>
            Gửi liên kết đặt lại
          </Button>
        </form>
      )}

      <Link
        to="/login"
        className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-brand-600"
      >
        <ArrowLeft className="h-4 w-4" /> Quay lại đăng nhập
      </Link>
    </AuthLayout>
  )
}
