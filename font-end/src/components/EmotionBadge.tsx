import { emotionMeta } from '../lib/emotions'
import { cn } from '../lib/utils'

interface EmotionBadgeProps {
  emotion: string | null | undefined
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  className?: string
}

const sizeMap = {
  sm: 'h-6 gap-1 px-2 text-xs',
  md: 'h-8 gap-1.5 px-3 text-sm',
  lg: 'h-10 gap-2 px-4 text-base',
}

export function EmotionBadge({ emotion, size = 'md', showLabel = true, className }: EmotionBadgeProps) {
  const meta = emotionMeta(emotion)
  if (!meta) {
    return (
      <span
        className={cn(
          'inline-flex items-center rounded-full font-semibold text-slate-400',
          sizeMap[size],
          'bg-slate-100',
          className,
        )}
      >
        <span>🫥</span>
        {showLabel && <span>Chưa rõ</span>}
      </span>
    )
  }
  return (
    <span
      className={cn('inline-flex items-center rounded-full font-semibold', sizeMap[size], className)}
      style={{ backgroundColor: meta.soft, color: meta.color }}
    >
      <span className="leading-none">{meta.emoji}</span>
      {showLabel && <span>{meta.label}</span>}
    </span>
  )
}

/** Larger emotion chip with a gradient dot, used in detail headers. */
export function EmotionPill({ emotion }: { emotion: string | null | undefined }) {
  const meta = emotionMeta(emotion)
  if (!meta) return null
  return (
    <div
      className="inline-flex items-center gap-2.5 rounded-2xl px-4 py-2.5"
      style={{ backgroundColor: meta.soft }}
    >
      <span
        className="flex h-9 w-9 items-center justify-center rounded-xl text-lg shadow-sm"
        style={{ backgroundImage: `linear-gradient(135deg, ${meta.gradient[0]}, ${meta.gradient[1]})` }}
      >
        {meta.emoji}
      </span>
      <div className="leading-tight">
        <p className="text-[0.7rem] font-medium uppercase tracking-wide text-slate-400">
          Cảm xúc AI
        </p>
        <p className="text-sm font-bold" style={{ color: meta.color }}>
          {meta.label}
        </p>
      </div>
    </div>
  )
}
