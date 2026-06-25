import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { CalendarDays, KeyRound, LogOut, Lock, Mail, ShieldCheck, User } from 'lucide-react'
import toast from 'react-hot-toast'
import { PageHeader } from '../components/PageHeader'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Avatar } from '../components/ui/Avatar'
import { ConfirmDialog } from '../components/ui/Modal'
import { useAuth } from '../context/AuthContext'
import { authService } from '../lib/services'
import { errorMessage } from '../lib/api'
import { formatDate } from '../lib/utils'

export default function ProfilePage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [confirmLogout, setConfirmLogout] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  const onChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword.length < 6) return toast.error('Mật khẩu mới phải có ít nhất 6 ký tự')
    if (newPassword !== confirmNewPassword) return toast.error('Mật khẩu xác nhận không khớp')
    setSaving(true)
    try {
      const msg = await authService.changePassword({ oldPassword, newPassword, confirmNewPassword })
      toast.success(msg || 'Đổi mật khẩu thành công')
      setOldPassword('')
      setNewPassword('')
      setConfirmNewPassword('')
    } catch (err) {
      toast.error(errorMessage(err, 'Đổi mật khẩu không thành công'))
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = async () => {
    setLoggingOut(true)
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title="Hồ sơ của tôi" subtitle="Quản lý thông tin và bảo mật tài khoản." icon={<User className="h-6 w-6" />} />

      <div className="grid gap-6 md:grid-cols-5">
        {/* Profile card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="card overflow-hidden md:col-span-2"
        >
          <div className="relative h-24" style={{ backgroundImage: 'linear-gradient(120deg,#6d5efc,#8b5cf6 50%,#f1417f)' }}>
            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2">
              <Avatar name={user?.fullName} src={user?.avatarUrl} size={84} className="!ring-4 !ring-white" />
            </div>
          </div>
          <div className="px-6 pb-6 pt-14 text-center">
            <h2 className="text-xl font-bold text-slate-800">{user?.fullName ?? 'Người dùng'}</h2>
            <p className="text-sm text-slate-400">{user?.email}</p>

            <div className="mt-5 space-y-3 text-left">
              <InfoRow icon={<Mail className="h-4.5 w-4.5" />} label="Email" value={user?.email ?? '—'} />
              <InfoRow
                icon={<CalendarDays className="h-4.5 w-4.5" />}
                label="Tham gia"
                value={user?.createdAt ? formatDate(user.createdAt) : '—'}
              />
              <InfoRow
                icon={<ShieldCheck className="h-4.5 w-4.5" />}
                label="Trạng thái"
                value="Đã xác thực"
                valueClass="text-emerald-600"
              />
            </div>

            <Button
              variant="danger"
              className="mt-6 w-full"
              leftIcon={<LogOut className="h-4.5 w-4.5" />}
              onClick={() => setConfirmLogout(true)}
            >
              Đăng xuất
            </Button>
          </div>
        </motion.div>

        {/* Change password */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="card p-6 md:col-span-3"
        >
          <div className="mb-5 flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
              <KeyRound className="h-5 w-5" />
            </span>
            <div>
              <h3 className="text-lg font-bold text-slate-800">Đổi mật khẩu</h3>
              <p className="text-sm text-slate-400">Giữ tài khoản của bạn luôn an toàn.</p>
            </div>
          </div>

          <form onSubmit={onChangePassword} className="space-y-4">
            <Input
              label="Mật khẩu hiện tại"
              type="password"
              placeholder="Nhập mật khẩu hiện tại"
              autoComplete="current-password"
              icon={<Lock className="h-5 w-5" />}
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
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
              placeholder="Nhập lại mật khẩu mới"
              autoComplete="new-password"
              icon={<Lock className="h-5 w-5" />}
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
            />
            <Button type="submit" size="lg" loading={saving} className="w-full sm:w-auto">
              Cập nhật mật khẩu
            </Button>
          </form>
        </motion.div>
      </div>

      <ConfirmDialog
        open={confirmLogout}
        onClose={() => setConfirmLogout(false)}
        onConfirm={handleLogout}
        title="Đăng xuất?"
        description="Bạn sẽ cần đăng nhập lại để tiếp tục."
        confirmText="Đăng xuất"
        loading={loggingOut}
        danger
      />
    </div>
  )
}

function InfoRow({
  icon,
  label,
  value,
  valueClass,
}: {
  icon: React.ReactNode
  label: string
  value: string
  valueClass?: string
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-slate-50/80 px-4 py-3">
      <span className="text-brand-500">{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-slate-400">{label}</p>
        <p className={`truncate text-sm font-semibold text-slate-700 ${valueClass ?? ''}`}>{value}</p>
      </div>
    </div>
  )
}
