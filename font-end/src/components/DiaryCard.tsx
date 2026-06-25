import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { ImageIcon, Sparkles } from 'lucide-react'
import type { Diary } from '../lib/types'
import { emotionMetaOrNeutral } from '../lib/emotions'
import { excerpt, relativeDate } from '../lib/utils'
import { EmotionBadge } from './EmotionBadge'

interface DiaryCardProps {
  diary: Diary
  index?: number
}

export function DiaryCard({ diary, index = 0 }: DiaryCardProps) {
  const meta = emotionMetaOrNeutral(diary.emotion)
  const cover = diary.listMedia?.[0]?.imageUrl
  const mediaCount = diary.listMedia?.length ?? 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.4) }}
    >
      <Link
        to={`/diaries/${diary.id}`}
        className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-white/70 bg-white/80 shadow-[var(--shadow-soft)] backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-glow)]"
      >
        {/* accent strip carries the emotion color */}
        <span
          className="absolute inset-x-0 top-0 h-1"
          style={{ backgroundImage: `linear-gradient(90deg, ${meta.gradient[0]}, ${meta.gradient[1]})` }}
        />

        {cover && (
          <div className="relative h-40 overflow-hidden">
            <img
              src={cover}
              alt={diary.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
            {mediaCount > 1 && (
              <span className="absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-full bg-black/45 px-2.5 py-1 text-xs font-medium text-white backdrop-blur">
                <ImageIcon className="h-3.5 w-3.5" /> {mediaCount}
              </span>
            )}
          </div>
        )}

        <div className="flex flex-1 flex-col p-5">
          <div className="mb-3 flex items-center justify-between gap-2">
            <EmotionBadge emotion={diary.emotion} size="sm" />
            <span className="text-xs font-medium text-slate-400">{relativeDate(diary.createAt)}</span>
          </div>

          <h3 className="font-serif text-lg font-semibold leading-snug text-slate-800 group-hover:text-brand-600">
            {diary.title}
          </h3>
          <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-500">
            {excerpt(diary.content, cover ? 110 : 180)}
          </p>

          {diary.advice && (
            <div className="mt-4 flex items-start gap-2 rounded-2xl bg-brand-50/70 px-3 py-2.5">
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" />
              <p className="line-clamp-2 text-xs leading-relaxed text-brand-700/90">{diary.advice}</p>
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  )
}
