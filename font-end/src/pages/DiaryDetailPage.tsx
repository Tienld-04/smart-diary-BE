import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { motion } from 'motion/react'
import { ArrowLeft, Clock, Pencil, Sparkles, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { Button } from '../components/ui/Button'
import { PageLoader } from '../components/ui/Spinner'
import { ConfirmDialog } from '../components/ui/Modal'
import { EmotionPill } from '../components/EmotionBadge'
import { diaryService } from '../lib/services'
import { errorMessage } from '../lib/api'
import { emotionMetaOrNeutral } from '../lib/emotions'
import { formatDateTime, readingTime } from '../lib/utils'
import type { Diary } from '../lib/types'

export default function DiaryDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const diaryId = id ? Number(id) : null

  const [diary, setDiary] = useState<Diary | null>(null)
  const [loading, setLoading] = useState(true)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [lightbox, setLightbox] = useState<string | null>(null)

  useEffect(() => {
    if (diaryId == null) return
    let active = true
    setLoading(true)
    diaryService
      .all()
      .then((all) => {
        if (!active) return
        const found = all.find((d) => d.id === diaryId) ?? null
        setDiary(found)
      })
      .catch((err) => toast.error(errorMessage(err)))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [diaryId])

  const handleDelete = async () => {
    if (diaryId == null) return
    setDeleting(true)
    try {
      await diaryService.remove([diaryId])
      toast.success('Đã xóa trang nhật ký')
      navigate('/diaries', { replace: true })
    } catch (err) {
      toast.error(errorMessage(err))
    } finally {
      setDeleting(false)
      setConfirmDelete(false)
    }
  }

  if (loading) return <PageLoader label="Đang mở trang nhật ký…" />

  if (!diary) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <span className="text-6xl">🔎</span>
        <h2 className="mt-4 text-xl font-bold text-slate-700">Không tìm thấy trang nhật ký</h2>
        <Link to="/diaries" className="mt-5">
          <Button variant="soft" leftIcon={<ArrowLeft className="h-4 w-4" />}>
            Về danh sách nhật ký
          </Button>
        </Link>
      </div>
    )
  }

  const meta = emotionMetaOrNeutral(diary.emotion)
  const media = diary.listMedia ?? []

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-4 flex items-center justify-between">
        <Link
          to="/diaries"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-brand-600"
        >
          <ArrowLeft className="h-4 w-4" /> Tất cả nhật ký
        </Link>
        <div className="flex gap-2">
          <Link to={`/diaries/${diary.id}/edit`}>
            <Button variant="outline" size="sm" leftIcon={<Pencil className="h-4 w-4" />}>
              Sửa
            </Button>
          </Link>
          <Button
            variant="danger"
            size="sm"
            leftIcon={<Trash2 className="h-4 w-4" />}
            onClick={() => setConfirmDelete(true)}
          >
            Xóa
          </Button>
        </div>
      </div>

      <motion.article
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="card overflow-hidden"
      >
        {/* Emotion-tinted header */}
        <div
          className="relative px-7 pb-6 pt-7"
          style={{ background: `linear-gradient(135deg, ${meta.soft}, transparent)` }}
        >
          <span
            className="absolute inset-x-0 top-0 h-1.5"
            style={{ backgroundImage: `linear-gradient(90deg, ${meta.gradient[0]}, ${meta.gradient[1]})` }}
          />
          <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
            <Clock className="h-4 w-4" />
            {formatDateTime(diary.createAt)}
            <span className="text-slate-300">·</span>
            {readingTime(diary.content)}
          </div>
          <h1 className="mt-3 font-serif text-3xl font-bold leading-tight text-slate-800">
            {diary.title}
          </h1>
          <div className="mt-4">
            <EmotionPill emotion={diary.emotion} />
          </div>
        </div>

        {/* Content */}
        <div className="px-7 py-6">
          <div className="whitespace-pre-wrap font-serif text-[1.05rem] leading-[1.9] text-slate-700">
            {diary.content}
          </div>

          {media.length > 0 && (
            <div className="mt-7">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {media.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setLightbox(m.imageUrl)}
                    className="group aspect-square overflow-hidden rounded-2xl"
                  >
                    <img
                      src={m.imageUrl}
                      alt=""
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      loading="lazy"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* AI advice */}
          {diary.advice && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-8 rounded-3xl border border-brand-100 bg-gradient-to-br from-brand-50 to-accent-50/60 p-6"
            >
              <div className="mb-2 flex items-center gap-2">
                <span className="btn-brand flex h-9 w-9 items-center justify-center rounded-xl text-white">
                  <Sparkles className="h-4.5 w-4.5" />
                </span>
                <div>
                  <p className="text-sm font-bold text-slate-800">Lời khuyên từ AI</p>
                  <p className="text-xs text-slate-400">Dựa trên cảm xúc trong trang nhật ký này</p>
                </div>
              </div>
              <p className="mt-2 whitespace-pre-wrap leading-relaxed text-slate-700">{diary.advice}</p>
            </motion.div>
          )}
        </div>
      </motion.article>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6 backdrop-blur"
          onClick={() => setLightbox(null)}
        >
          <motion.img
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            src={lightbox}
            alt=""
            className="max-h-[88vh] max-w-full rounded-2xl object-contain shadow-2xl"
          />
        </div>
      )}

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
        title="Xóa trang nhật ký?"
        description="Hành động này không thể hoàn tác. Trang nhật ký sẽ bị xóa vĩnh viễn."
        confirmText="Xóa vĩnh viễn"
        loading={deleting}
        danger
      />
    </div>
  )
}
