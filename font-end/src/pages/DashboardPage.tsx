import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { BookHeart, CalendarHeart, Flame, PenLine, Sparkles, TrendingUp } from 'lucide-react'
import toast from 'react-hot-toast'
import { DiaryCard } from '../components/DiaryCard'
import { EmptyState } from '../components/ui/EmptyState'
import { Button } from '../components/ui/Button'
import { Skeleton } from '../components/ui/Spinner'
import { useAuth } from '../context/AuthContext'
import { diaryService } from '../lib/services'
import { errorMessage } from '../lib/api'
import { EMOTIONS, emotionMetaOrNeutral } from '../lib/emotions'
import { greeting } from '../lib/utils'
import type { Diary } from '../lib/types'

export default function DashboardPage() {
  const { user } = useAuth()
  const [diaries, setDiaries] = useState<Diary[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    diaryService
      .all()
      .then((data) => active && setDiaries(data))
      .catch((err) => active && toast.error(errorMessage(err)))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [])

  const stats = useMemo(() => {
    const now = new Date()
    const thisMonth = diaries.filter((d) => {
      if (!d.createAt) return false
      const dt = new Date(d.createAt)
      return dt.getMonth() === now.getMonth() && dt.getFullYear() === now.getFullYear()
    }).length

    const days = new Set(
      diaries.map((d) => (d.createAt ? new Date(d.createAt).toDateString() : '')).filter(Boolean),
    ).size

    const dist = EMOTIONS.map((meta) => ({
      meta,
      count: diaries.filter((d) => emotionMetaOrNeutral(d.emotion).key === meta.key).length,
    }))
    const dominant = [...dist].sort((a, b) => b.count - a.count)[0]

    return { total: diaries.length, thisMonth, days, dist, dominant }
  }, [diaries])

  const recent = useMemo(
    () =>
      [...diaries]
        .sort((a, b) => new Date(b.createAt ?? 0).getTime() - new Date(a.createAt ?? 0).getTime())
        .slice(0, 3),
    [diaries],
  )

  const firstName = user?.fullName?.split(' ').slice(-1)[0]
  const maxCount = Math.max(1, ...stats.dist.map((d) => d.count))

  return (
    <div>
      {/* Hero */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative mb-7 overflow-hidden rounded-[2rem] p-7 text-white shadow-[var(--shadow-glow)] sm:p-9"
        style={{ backgroundImage: 'linear-gradient(120deg,#6d5efc,#8b5cf6 45%,#f1417f)' }}
      >
        <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/15 blur-2xl" />
        <div className="absolute -bottom-20 left-1/3 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
        <div className="relative max-w-xl">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur">
            <Sparkles className="h-3.5 w-3.5" /> Nhật ký cảm xúc thông minh
          </span>
          <h1 className="mt-4 text-3xl font-extrabold leading-tight text-balance sm:text-4xl">
            {greeting(firstName)} 🌿
          </h1>
          <p className="mt-2 text-white/85">
            Dành một phút để ghi lại cảm xúc hôm nay. AI sẽ lắng nghe và đồng hành cùng bạn.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/diaries/new">
              <Button variant="soft" size="lg" leftIcon={<PenLine className="h-5 w-5" />} className="!bg-white !text-brand-700 hover:!bg-white/90">
                Viết nhật ký mới
              </Button>
            </Link>
            <Link to="/chat">
              <Button
                size="lg"
                className="!bg-white/15 !text-white backdrop-blur hover:!bg-white/25"
                leftIcon={<Sparkles className="h-5 w-5" />}
              >
                Trò chuyện với AI
              </Button>
            </Link>
          </div>
        </div>
      </motion.section>

      {/* Stats */}
      <div className="mb-7 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={<BookHeart className="h-5 w-5" />} label="Tổng nhật ký" value={stats.total} loading={loading} tint="#6d5efc" />
        <StatCard icon={<TrendingUp className="h-5 w-5" />} label="Tháng này" value={stats.thisMonth} loading={loading} tint="#f1417f" />
        <StatCard icon={<Flame className="h-5 w-5" />} label="Số ngày viết" value={stats.days} loading={loading} tint="#f59e0b" />
        <StatCard
          icon={<span className="text-xl leading-none">{stats.dominant?.meta.emoji ?? '🙂'}</span>}
          label="Tâm trạng chủ đạo"
          value={stats.total ? stats.dominant?.meta.label ?? '—' : '—'}
          loading={loading}
          tint={stats.dominant?.meta.color ?? '#64748b'}
          isText
        />
      </div>

      <div className="grid gap-7 lg:grid-cols-3">
        {/* Recent diaries */}
        <div className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800">Nhật ký gần đây</h2>
            <Link to="/diaries" className="text-sm font-semibold text-brand-600 hover:text-brand-700">
              Xem tất cả →
            </Link>
          </div>

          {loading ? (
            <div className="grid gap-5 sm:grid-cols-2">
              {Array.from({ length: 2 }).map((_, i) => (
                <Skeleton key={i} className="h-64" />
              ))}
            </div>
          ) : recent.length === 0 ? (
            <EmptyState
              emoji="🌱"
              title="Chưa có trang nhật ký nào"
              description="Hãy bắt đầu bằng cách ghi lại cảm xúc đầu tiên của bạn hôm nay."
              action={
                <Link to="/diaries/new">
                  <Button leftIcon={<PenLine className="h-4.5 w-4.5" />}>Viết trang đầu tiên</Button>
                </Link>
              }
            />
          ) : (
            <div className="grid gap-5 sm:grid-cols-2">
              {recent.map((d, i) => (
                <DiaryCard key={d.id} diary={d} index={i} />
              ))}
            </div>
          )}
        </div>

        {/* Mood snapshot */}
        <div className="card p-6">
          <div className="mb-5 flex items-center gap-2">
            <CalendarHeart className="h-5 w-5 text-brand-500" />
            <h2 className="text-lg font-bold text-slate-800">Bức tranh cảm xúc</h2>
          </div>

          {stats.total === 0 ? (
            <p className="py-8 text-center text-sm text-slate-400">
              Cảm xúc của bạn sẽ hiện ở đây khi bạn bắt đầu viết.
            </p>
          ) : (
            <div className="space-y-4">
              {stats.dist.map(({ meta, count }) => (
                <div key={meta.key}>
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 font-medium text-slate-600">
                      <span>{meta.emoji}</span> {meta.label}
                    </span>
                    <span className="font-semibold text-slate-400">{count}</span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundImage: `linear-gradient(90deg, ${meta.gradient[0]}, ${meta.gradient[1]})` }}
                      initial={{ width: 0 }}
                      animate={{ width: `${(count / maxCount) * 100}%` }}
                      transition={{ duration: 0.7, ease: 'easeOut' }}
                    />
                  </div>
                </div>
              ))}
              <Link
                to="/calendar"
                className="mt-2 block rounded-2xl bg-brand-50 px-4 py-3 text-center text-sm font-semibold text-brand-700 transition hover:bg-brand-100"
              >
                Xem lịch cảm xúc →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
  loading,
  tint,
  isText,
}: {
  icon: React.ReactNode
  label: string
  value: number | string
  loading?: boolean
  tint: string
  isText?: boolean
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="card flex items-center gap-4 p-5"
    >
      <span
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white"
        style={{ backgroundImage: `linear-gradient(135deg, ${tint}, ${tint}cc)` }}
      >
        {icon}
      </span>
      <div className="min-w-0">
        <p className="truncate text-xs font-medium text-slate-400">{label}</p>
        {loading ? (
          <Skeleton className="mt-1 h-6 w-12" />
        ) : (
          <p className={isText ? 'truncate text-lg font-bold text-slate-800' : 'text-2xl font-extrabold text-slate-800'}>
            {value}
          </p>
        )}
      </div>
    </motion.div>
  )
}
