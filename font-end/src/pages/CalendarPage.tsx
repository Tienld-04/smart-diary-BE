import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
} from 'date-fns'
import { vi } from 'date-fns/locale'
import { CalendarHeart, ChevronLeft, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'
import { PageHeader } from '../components/PageHeader'
import { Button } from '../components/ui/Button'
import { Spinner } from '../components/ui/Spinner'
import { EmotionBadge } from '../components/EmotionBadge'
import { EMOTIONS, emotionMeta } from '../lib/emotions'
import { diaryService } from '../lib/services'
import { errorMessage } from '../lib/api'
import { cn, excerpt, relativeDate } from '../lib/utils'
import type { Diary } from '../lib/types'

const WEEKDAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']

export default function CalendarPage() {
  const [cursor, setCursor] = useState(() => new Date())
  const [emotions, setEmotions] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Date | null>(null)
  const [dayDiaries, setDayDiaries] = useState<Diary[]>([])
  const [dayLoading, setDayLoading] = useState(false)

  const year = cursor.getFullYear()
  const month = cursor.getMonth() + 1

  useEffect(() => {
    let active = true
    setLoading(true)
    diaryService
      .emotionsByMonth(year, month)
      .then((data) => active && setEmotions(data))
      .catch((err) => active && toast.error(errorMessage(err)))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [year, month])

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(cursor), { weekStartsOn: 1 })
    const end = endOfWeek(endOfMonth(cursor), { weekStartsOn: 1 })
    return eachDayOfInterval({ start, end })
  }, [cursor])

  const selectDay = async (day: Date) => {
    setSelected(day)
    setDayLoading(true)
    const ds = format(day, 'yyyy-MM-dd')
    try {
      const data = await diaryService.searchByDate(ds, ds)
      setDayDiaries(data)
    } catch (err) {
      toast.error(errorMessage(err))
      setDayDiaries([])
    } finally {
      setDayLoading(false)
    }
  }

  const monthCount = Object.keys(emotions).length

  return (
    <div>
      <PageHeader
        title="Lịch cảm xúc"
        subtitle="Nhìn lại hành trình tâm trạng của bạn qua từng ngày."
        icon={<CalendarHeart className="h-6 w-6" />}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Calendar */}
        <div className="card p-5 lg:col-span-2 sm:p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold capitalize text-slate-800">
                {format(cursor, 'MMMM yyyy', { locale: vi })}
              </h2>
              <p className="text-xs text-slate-400">{monthCount} ngày có nhật ký</p>
            </div>
            <div className="flex items-center gap-1.5">
              <Button variant="outline" size="icon" onClick={() => setCursor((c) => addMonths(c, -1))} aria-label="Tháng trước">
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Button variant="soft" size="sm" onClick={() => setCursor(new Date())}>
                Hôm nay
              </Button>
              <Button variant="outline" size="icon" onClick={() => setCursor((c) => addMonths(c, 1))} aria-label="Tháng sau">
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <div className="relative">
            {loading && (
              <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-white/60 backdrop-blur-sm">
                <Spinner />
              </div>
            )}

            <div className="mb-2 grid grid-cols-7 gap-1.5 sm:gap-2">
              {WEEKDAYS.map((d) => (
                <div key={d} className="py-1 text-center text-xs font-bold text-slate-400">
                  {d}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
              {days.map((day) => {
                const key = format(day, 'yyyy-MM-dd')
                const meta = emotionMeta(emotions[key])
                const inMonth = isSameMonth(day, cursor)
                const today = isToday(day)
                const isSel = selected && isSameDay(day, selected)
                return (
                  <motion.button
                    key={key}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => selectDay(day)}
                    className={cn(
                      'relative flex aspect-square flex-col items-center justify-center rounded-2xl text-sm font-semibold transition',
                      !inMonth && 'opacity-35',
                      isSel ? 'ring-2 ring-brand-400 ring-offset-1' : '',
                      !meta && 'bg-slate-50 text-slate-500 hover:bg-slate-100',
                    )}
                    style={
                      meta
                        ? {
                            backgroundImage: `linear-gradient(135deg, ${meta.gradient[0]}, ${meta.gradient[1]})`,
                            color: 'white',
                          }
                        : undefined
                    }
                    title={meta ? meta.label : undefined}
                  >
                    <span className={cn(today && !meta && 'flex h-6 w-6 items-center justify-center rounded-full bg-brand-500 text-white')}>
                      {format(day, 'd')}
                    </span>
                    {meta && <span className="text-base leading-none">{meta.emoji}</span>}
                    {today && (
                      <span className="absolute bottom-1 h-1 w-1 rounded-full bg-white/90" />
                    )}
                  </motion.button>
                )
              })}
            </div>
          </div>

          {/* Legend */}
          <div className="mt-5 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
            {EMOTIONS.map((e) => (
              <span key={e.key} className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500">
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundImage: `linear-gradient(135deg, ${e.gradient[0]}, ${e.gradient[1]})` }}
                />
                {e.label}
              </span>
            ))}
          </div>
        </div>

        {/* Selected day panel */}
        <div className="card p-6">
          {!selected ? (
            <div className="flex h-full flex-col items-center justify-center py-10 text-center">
              <span className="text-5xl">🗓️</span>
              <p className="mt-3 font-semibold text-slate-600">Chọn một ngày</p>
              <p className="mt-1 text-sm text-slate-400">Bấm vào ô ngày để xem nhật ký hôm đó.</p>
            </div>
          ) : (
            <>
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-500">
                {format(selected, "EEEE", { locale: vi })}
              </p>
              <h3 className="text-lg font-bold capitalize text-slate-800">
                {format(selected, "d 'tháng' M, yyyy", { locale: vi })}
              </h3>

              <div className="mt-4 space-y-3">
                {dayLoading ? (
                  <div className="flex justify-center py-8">
                    <Spinner />
                  </div>
                ) : dayDiaries.length === 0 ? (
                  <p className="rounded-2xl bg-slate-50 py-8 text-center text-sm text-slate-400">
                    Không có nhật ký nào trong ngày này.
                  </p>
                ) : (
                  dayDiaries.map((d) => (
                    <Link
                      key={d.id}
                      to={`/diaries/${d.id}`}
                      className="block rounded-2xl border border-slate-100 bg-white/70 p-4 transition hover:border-brand-200 hover:shadow-sm"
                    >
                      <div className="mb-1.5 flex items-center justify-between gap-2">
                        <EmotionBadge emotion={d.emotion} size="sm" />
                        <span className="text-xs text-slate-400">{relativeDate(d.createAt)}</span>
                      </div>
                      <p className="font-serif font-semibold text-slate-800">{d.title}</p>
                      <p className="mt-1 text-sm text-slate-500">{excerpt(d.content, 90)}</p>
                    </Link>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
