import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import {
  BookHeart,
  CalendarHeart,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageCircleHeart,
  PenLine,
  Settings,
  Sparkles,
  X,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { cn, greeting } from '../lib/utils'
import { Logo } from './Logo'
import { Avatar } from './ui/Avatar'
import { Button } from './ui/Button'
import { ConfirmDialog } from './ui/Modal'

const NAV = [
  { to: '/', label: 'Tổng quan', icon: LayoutDashboard, end: true },
  { to: '/diaries', label: 'Nhật ký', icon: BookHeart, end: false },
  { to: '/calendar', label: 'Lịch cảm xúc', icon: CalendarHeart, end: false },
  { to: '/chat', label: 'Trợ lý AI', icon: MessageCircleHeart, end: false },
  { to: '/profile', label: 'Hồ sơ', icon: Settings, end: false },
]

function NavItems({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col gap-1.5">
      {NAV.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              'group relative flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-all duration-200',
              isActive
                ? 'btn-brand text-white shadow-[0_10px_24px_-12px_rgba(109,94,252,0.9)]'
                : 'text-slate-500 hover:bg-white hover:text-brand-600',
            )
          }
        >
          {({ isActive }) => (
            <>
              <Icon className={cn('h-5 w-5 transition', !isActive && 'group-hover:scale-110')} />
              {label}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col">
      <div className="px-3 pb-6 pt-2">
        <Link to="/" onClick={onNavigate}>
          <Logo />
        </Link>
      </div>

      <Link to="/diaries/new" onClick={onNavigate} className="mb-6 block">
        <Button className="w-full" leftIcon={<PenLine className="h-4.5 w-4.5" />} size="lg">
          Viết nhật ký
        </Button>
      </Link>

      <NavItems onNavigate={onNavigate} />

      <div className="mt-auto">
        <div className="rounded-3xl bg-gradient-to-br from-brand-500/95 to-accent-500/90 p-5 text-white shadow-lg">
          <Sparkles className="h-6 w-6" />
          <p className="mt-2 text-sm font-bold">Người bạn AI</p>
          <p className="mt-1 text-xs leading-relaxed text-white/80">
            Trò chuyện và nhận lời khuyên dựa trên nhật ký gần đây của bạn.
          </p>
          <Link to="/chat" onClick={onNavigate}>
            <button className="mt-3 w-full rounded-xl bg-white/20 px-3 py-2 text-xs font-semibold backdrop-blur transition hover:bg-white/30">
              Bắt đầu trò chuyện
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}

export function AppLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [confirmLogout, setConfirmLogout] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  // Close the mobile drawer whenever the route changes.
  useEffect(() => setMobileOpen(false), [location.pathname])

  const handleLogout = async () => {
    setLoggingOut(true)
    await logout()
    setLoggingOut(false)
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 flex-col p-4 lg:flex">
        <div className="glass flex h-full flex-col rounded-[2rem] p-4 shadow-[var(--shadow-soft)]">
          <SidebarContent />
        </div>
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div
              className="absolute inset-0 bg-brand-950/30 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              className="glass-strong absolute inset-y-0 left-0 flex w-72 flex-col p-5 shadow-2xl"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            >
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute right-4 top-4 rounded-xl p-1.5 text-slate-400 hover:bg-slate-900/5"
                aria-label="Đóng menu"
              >
                <X className="h-5 w-5" />
              </button>
              <SidebarContent onNavigate={() => setMobileOpen(false)} />
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* Main column */}
      <div className="lg:pl-72">
        {/* Topbar */}
        <header className="sticky top-0 z-20 px-4 pt-4">
          <div className="glass flex items-center justify-between gap-3 rounded-2xl px-4 py-3 shadow-[var(--shadow-soft)]">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileOpen(true)}
                className="rounded-xl p-2 text-slate-500 hover:bg-slate-900/5 lg:hidden"
                aria-label="Mở menu"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div className="hidden sm:block">
                <p className="text-sm font-bold text-slate-700">
                  {greeting(user?.fullName?.split(' ').slice(-1)[0])} 👋
                </p>
                <p className="text-xs text-slate-400">Hôm nay bạn cảm thấy thế nào?</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link to="/diaries/new" className="sm:hidden">
                <Button size="icon" aria-label="Viết nhật ký">
                  <PenLine className="h-5 w-5" />
                </Button>
              </Link>
              <Link
                to="/profile"
                className="flex items-center gap-2.5 rounded-2xl py-1 pl-1 pr-2 transition hover:bg-white"
              >
                <Avatar name={user?.fullName} src={user?.avatarUrl} size={36} />
                <span className="hidden max-w-[140px] truncate text-sm font-semibold text-slate-700 md:block">
                  {user?.fullName ?? 'Bạn'}
                </span>
              </Link>
              <button
                onClick={() => setConfirmLogout(true)}
                className="rounded-xl p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-500"
                aria-label="Đăng xuất"
                title="Đăng xuất"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-4 pb-16 pt-6">
          <Outlet />
        </main>
      </div>

      <ConfirmDialog
        open={confirmLogout}
        onClose={() => setConfirmLogout(false)}
        onConfirm={handleLogout}
        title="Đăng xuất?"
        description="Bạn sẽ cần đăng nhập lại để tiếp tục viết nhật ký."
        confirmText="Đăng xuất"
        loading={loggingOut}
        danger
      />
    </div>
  )
}
