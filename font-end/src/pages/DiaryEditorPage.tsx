import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { motion } from 'motion/react'
import { ArrowLeft, ImagePlus, PenLine, Sparkles, Trash2, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { PageHeader } from '../components/PageHeader'
import { Button } from '../components/ui/Button'
import { Input, Textarea } from '../components/ui/Input'
import { PageLoader } from '../components/ui/Spinner'
import { diaryService } from '../lib/services'
import { errorMessage } from '../lib/api'
import type { Diary, DiaryMedia } from '../lib/types'

interface NewImage {
  file: File
  url: string
}

export default function DiaryEditorPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = !!id
  const diaryId = id ? Number(id) : null

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [existingMedia, setExistingMedia] = useState<DiaryMedia[]>([])
  const [mediaToDelete, setMediaToDelete] = useState<number[]>([])
  const [newImages, setNewImages] = useState<NewImage[]>([])
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!isEdit || diaryId == null) return
    let active = true
    diaryService
      .all()
      .then((all) => {
        if (!active) return
        const found = all.find((d) => d.id === diaryId)
        if (!found) {
          toast.error('Không tìm thấy trang nhật ký này')
          navigate('/diaries', { replace: true })
          return
        }
        setTitle(found.title ?? '')
        setContent(found.content ?? '')
        setExistingMedia(found.listMedia ?? [])
      })
      .catch((err) => toast.error(errorMessage(err)))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [isEdit, diaryId, navigate])

  // Revoke object URLs on unmount.
  useEffect(() => {
    return () => newImages.forEach((img) => URL.revokeObjectURL(img.url))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const addFiles = (files: FileList | null) => {
    if (!files) return
    const accepted = Array.from(files).filter((f) => f.type.startsWith('image/'))
    if (accepted.length !== files.length) toast.error('Chỉ chấp nhận tệp hình ảnh')
    setNewImages((prev) => [...prev, ...accepted.map((file) => ({ file, url: URL.createObjectURL(file) }))])
  }

  const removeNewImage = (idx: number) => {
    setNewImages((prev) => {
      URL.revokeObjectURL(prev[idx].url)
      return prev.filter((_, i) => i !== idx)
    })
  }

  const toggleDeleteExisting = (mediaId: number) =>
    setMediaToDelete((prev) =>
      prev.includes(mediaId) ? prev.filter((x) => x !== mediaId) : [...prev, mediaId],
    )

  const wordCount = useMemo(() => content.trim().split(/\s+/).filter(Boolean).length, [content])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return toast.error('Vui lòng nhập tiêu đề')
    if (!content.trim()) return toast.error('Vui lòng viết nội dung nhật ký')

    setSaving(true)
    const toastId = toast.loading(isEdit ? 'Đang lưu thay đổi…' : 'AI đang phân tích cảm xúc của bạn…')
    try {
      let result: Diary
      if (isEdit && diaryId != null) {
        result = await diaryService.update(diaryId, {
          title: title.trim(),
          content: content.trim(),
          imageIdsToDelete: mediaToDelete,
          newImages: newImages.map((n) => n.file),
        })
      } else {
        result = await diaryService.create({
          title: title.trim(),
          content: content.trim(),
          images: newImages.map((n) => n.file),
        })
      }
      toast.success(isEdit ? 'Đã cập nhật nhật ký' : 'Đã lưu nhật ký mới ✨', { id: toastId })
      navigate(`/diaries/${result.id}`)
    } catch (err) {
      toast.error(errorMessage(err), { id: toastId })
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <PageLoader label="Đang tải nội dung…" />

  return (
    <div>
      <Link
        to={isEdit ? `/diaries/${diaryId}` : '/diaries'}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-brand-600"
      >
        <ArrowLeft className="h-4 w-4" /> Quay lại
      </Link>

      <PageHeader
        title={isEdit ? 'Chỉnh sửa nhật ký' : 'Viết nhật ký mới'}
        subtitle={
          isEdit
            ? 'Cập nhật suy nghĩ của bạn — nếu đổi nội dung, AI sẽ phân tích lại cảm xúc.'
            : 'Hãy thành thật với cảm xúc của mình. Đây là không gian riêng của bạn.'
        }
        icon={<PenLine className="h-6 w-6" />}
      />

      <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="card space-y-5 p-6 lg:col-span-2"
        >
          <Input
            placeholder="Tiêu đề cho ngày hôm nay…"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="!h-14 !text-lg font-semibold"
            maxLength={150}
          />
          <Textarea
            placeholder="Hôm nay của bạn thế nào? Viết ra mọi điều bạn cảm thấy…"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[320px] font-serif !text-base !leading-relaxed"
          />
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>{wordCount} từ</span>
            <span>{content.length} ký tự</span>
          </div>
        </motion.div>

        {/* Sidebar: images + actions */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="space-y-5"
        >
          <div className="card p-5">
            <p className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-700">
              <ImagePlus className="h-4.5 w-4.5 text-brand-500" /> Hình ảnh
            </p>

            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault()
                addFiles(e.dataTransfer.files)
              }}
              className="flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-brand-200 bg-brand-50/40 px-4 py-7 text-center transition hover:border-brand-400 hover:bg-brand-50"
            >
              <ImagePlus className="h-7 w-7 text-brand-400" />
              <span className="text-sm font-semibold text-brand-600">Thêm hình ảnh</span>
              <span className="text-xs text-slate-400">Kéo thả hoặc bấm để chọn</span>
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                addFiles(e.target.files)
                e.target.value = ''
              }}
            />

            {(existingMedia.length > 0 || newImages.length > 0) && (
              <div className="mt-4 grid grid-cols-3 gap-2">
                {existingMedia.map((m) => {
                  const marked = mediaToDelete.includes(m.id)
                  return (
                    <div key={m.id} className="group relative aspect-square overflow-hidden rounded-xl">
                      <img
                        src={m.imageUrl}
                        alt=""
                        className={`h-full w-full object-cover transition ${marked ? 'opacity-30 grayscale' : ''}`}
                      />
                      <button
                        type="button"
                        onClick={() => toggleDeleteExisting(m.id)}
                        className="absolute right-1 top-1 rounded-lg bg-black/55 p-1 text-white backdrop-blur transition hover:bg-rose-500"
                        aria-label={marked ? 'Hoàn tác xóa' : 'Xóa ảnh'}
                      >
                        {marked ? <X className="h-3.5 w-3.5" /> : <Trash2 className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  )
                })}
                {newImages.map((img, i) => (
                  <div key={img.url} className="group relative aspect-square overflow-hidden rounded-xl ring-2 ring-brand-300">
                    <img src={img.url} alt="" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeNewImage(i)}
                      className="absolute right-1 top-1 rounded-lg bg-black/55 p-1 text-white backdrop-blur transition hover:bg-rose-500"
                      aria-label="Bỏ ảnh"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card flex items-start gap-3 bg-gradient-to-br from-brand-50 to-accent-50 p-5">
            <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-brand-500" />
            <p className="text-xs leading-relaxed text-brand-700/90">
              Sau khi lưu, AI sẽ tự động phân tích cảm xúc và gửi cho bạn một lời khuyên ấm áp.
            </p>
          </div>

          <Button type="submit" size="lg" className="w-full" loading={saving}>
            {isEdit ? 'Lưu thay đổi' : 'Lưu nhật ký'}
          </Button>
        </motion.div>
      </form>
    </div>
  )
}
