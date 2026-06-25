import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { BookHeart, PenLine, Search, SlidersHorizontal, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { PageHeader } from '../components/PageHeader'
import { DiaryCard } from '../components/DiaryCard'
import { EmptyState } from '../components/ui/EmptyState'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Skeleton } from '../components/ui/Spinner'
import { EMOTIONS } from '../lib/emotions'
import { diaryService } from '../lib/services'
import { errorMessage } from '../lib/api'
import { cn } from '../lib/utils'
import type { Diary } from '../lib/types'

export default function DiariesPage() {
  const [diaries, setDiaries] = useState<Diary[]>([])
  const [loading, setLoading] = useState(true)
  const [keyword, setKeyword] = useState('')
  const [debounced, setDebounced] = useState('')
  const [emotion, setEmotion] = useState<string>('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  // Debounce the keyword input.
  useEffect(() => {
    const t = setTimeout(() => setDebounced(keyword.trim()), 350)
    return () => clearTimeout(t)
  }, [keyword])

  const hasFilters = !!(debounced || emotion || fromDate || toDate)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = hasFilters
        ? await diaryService.search({
            keyword: debounced || undefined,
            emotion: emotion || undefined,
            fromDate: fromDate || undefined,
            toDate: toDate || undefined,
          })
        : await diaryService.all()
      data.sort((a, b) => new Date(b.createAt ?? 0).getTime() - new Date(a.createAt ?? 0).getTime())
      setDiaries(data)
    } catch (err) {
      toast.error(errorMessage(err))
      setDiaries([])
    } finally {
      setLoading(false)
    }
  }, [hasFilters, debounced, emotion, fromDate, toDate])

  useEffect(() => {
    void load()
  }, [load])

  const clearFilters = () => {
    setKeyword('')
    setDebounced('')
    setEmotion('')
    setFromDate('')
    setToDate('')
  }

  const activeFilterCount = useMemo(
    () => [emotion, fromDate, toDate].filter(Boolean).length,
    [emotion, fromDate, toDate],
  )

  return (
    <div>
      <PageHeader
        title="Nhật ký của tôi"
        subtitle="Tất cả những khoảnh khắc bạn đã ghi lại."
        icon={<BookHeart className="h-6 w-6" />}
        action={
          <Link to="/diaries/new">
            <Button leftIcon={<PenLine className="h-4.5 w-4.5" />}>Viết mới</Button>
          </Link>
        }
      />

      {/* Search + filter toggle */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row">
        <div className="flex-1">
          <Input
            placeholder="Tìm theo từ khóa, tiêu đề hoặc nội dung…"
            icon={<Search className="h-5 w-5" />}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
        </div>
        <Button
          variant={showFilters || activeFilterCount ? 'soft' : 'outline'}
          onClick={() => setShowFilters((s) => !s)}
          leftIcon={<SlidersHorizontal className="h-4.5 w-4.5" />}
          className="h-12 sm:w-auto"
        >
          Bộ lọc
          {activeFilterCount > 0 && (
            <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand-500 text-xs text-white">
              {activeFilterCount}
            </span>
          )}
        </Button>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="card mb-6 overflow-hidden p-5"
        >
          <div className="mb-4">
            <p className="mb-2 text-sm font-semibold text-slate-600">Cảm xúc</p>
            <div className="flex flex-wrap gap-2">
              {EMOTIONS.map((e) => {
                const active = emotion === e.value
                return (
                  <button
                    key={e.key}
                    onClick={() => setEmotion(active ? '' : e.value)}
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-semibold transition',
                      active ? 'text-white shadow-md' : 'text-slate-600 hover:bg-slate-100',
                    )}
                    style={
                      active
                        ? { backgroundImage: `linear-gradient(135deg, ${e.gradient[0]}, ${e.gradient[1]})` }
                        : { backgroundColor: e.soft }
                    }
                  >
                    <span>{e.emoji}</span> {e.label}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Từ ngày"
              type="date"
              value={fromDate}
              max={toDate || undefined}
              onChange={(e) => setFromDate(e.target.value)}
            />
            <Input
              label="Đến ngày"
              type="date"
              value={toDate}
              min={fromDate || undefined}
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>

          {hasFilters && (
            <button
              onClick={clearFilters}
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-rose-500 hover:text-rose-600"
            >
              <X className="h-4 w-4" /> Xóa bộ lọc
            </button>
          )}
        </motion.div>
      )}

      {/* Results */}
      {loading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-72" />
          ))}
        </div>
      ) : diaries.length === 0 ? (
        <EmptyState
          emoji={hasFilters ? '🔍' : '📖'}
          title={hasFilters ? 'Không tìm thấy kết quả' : 'Nhật ký của bạn còn trống'}
          description={
            hasFilters
              ? 'Thử thay đổi từ khóa hoặc bộ lọc để tìm trang nhật ký khác.'
              : 'Mỗi câu chuyện đều bắt đầu từ trang đầu tiên. Viết ngay nhé!'
          }
          action={
            hasFilters ? (
              <Button variant="soft" onClick={clearFilters}>
                Xóa bộ lọc
              </Button>
            ) : (
              <Link to="/diaries/new">
                <Button leftIcon={<PenLine className="h-4.5 w-4.5" />}>Viết nhật ký</Button>
              </Link>
            )
          }
        />
      ) : (
        <>
          <p className="mb-4 text-sm text-slate-400">{diaries.length} trang nhật ký</p>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {diaries.map((d, i) => (
              <DiaryCard key={d.id} diary={d} index={i} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
