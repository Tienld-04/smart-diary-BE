import type { ReactNode } from 'react'
import { motion } from 'motion/react'
import { BookHeart, CalendarHeart, Sparkles } from 'lucide-react'
import { Logo } from './Logo'

const FEATURES = [
  { icon: Sparkles, title: 'Phân tích cảm xúc AI', desc: 'Mỗi trang nhật ký được AI thấu hiểu và đưa lời khuyên.' },
  { icon: CalendarHeart, title: 'Bản đồ cảm xúc', desc: 'Nhìn lại tâm trạng của bạn qua từng ngày trong tháng.' },
  { icon: BookHeart, title: 'Không gian riêng tư', desc: 'Nơi an toàn để bạn viết ra mọi suy nghĩ thầm kín.' },
]

export function AuthLayout({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle: string
  children: ReactNode
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden overflow-hidden lg:block">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-600 via-brand-500 to-accent-500" />
        <div className="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-white/15 blur-3xl" />
        <div className="absolute -bottom-32 right-0 h-[28rem] w-[28rem] rounded-full bg-accent-300/30 blur-3xl" />
        <div className="animate-float absolute right-16 top-24 h-24 w-24 rounded-3xl bg-white/10 backdrop-blur" />

        <div className="relative flex h-full flex-col justify-between p-12 text-white">
          <Logo className="[&_p]:text-white [&_.gradient-text]:text-white/90" />

          <div className="max-w-md">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl font-extrabold leading-tight text-balance"
            >
              Viết ra cảm xúc. <br /> Để AI lắng nghe bạn.
            </motion.h2>
            <p className="mt-4 text-lg text-white/80">
              Nhật ký thông minh đồng hành cùng bạn mỗi ngày — ghi lại khoảnh khắc, thấu hiểu tâm trạng.
            </p>

            <div className="mt-10 space-y-4">
              {FEATURES.map((f, i) => (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 + i * 0.12 }}
                  className="flex items-start gap-4 rounded-2xl bg-white/10 p-4 backdrop-blur-sm"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/20">
                    <f.icon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="font-bold">{f.title}</p>
                    <p className="text-sm text-white/75">{f.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <p className="text-sm text-white/60">© {new Date().getFullYear()} Smart Diary · Người bạn của tâm hồn</p>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center px-5 py-10 sm:px-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="mb-8 lg:hidden">
            <Logo />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-800">{title}</h1>
          <p className="mt-2 text-slate-500">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </motion.div>
      </div>
    </div>
  )
}
