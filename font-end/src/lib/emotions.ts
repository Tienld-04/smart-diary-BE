import type { EmotionValue } from './types'

export interface EmotionMeta {
  key: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL' | 'ANXIOUS' | 'ANGRY'
  value: EmotionValue
  emoji: string
  label: string
  color: string
  soft: string
  gradient: [string, string]
}

export const EMOTIONS: EmotionMeta[] = [
  {
    key: 'POSITIVE',
    value: 'Tích cực 😊',
    emoji: '😊',
    label: 'Tích cực',
    color: '#f59e0b',
    soft: 'rgba(245, 158, 11, 0.12)',
    gradient: ['#fbbf24', '#f97316'],
  },
  {
    key: 'NEUTRAL',
    value: 'Bình thường 😐',
    emoji: '😐',
    label: 'Bình thường',
    color: '#64748b',
    soft: 'rgba(100, 116, 139, 0.12)',
    gradient: ['#94a3b8', '#64748b'],
  },
  {
    key: 'ANXIOUS',
    value: 'Lo lắng 😟',
    emoji: '😟',
    label: 'Lo lắng',
    color: '#8b5cf6',
    soft: 'rgba(139, 92, 246, 0.12)',
    gradient: ['#a78bfa', '#7c3aed'],
  },
  {
    key: 'NEGATIVE',
    value: 'Tiêu cực 😢',
    emoji: '😢',
    label: 'Tiêu cực',
    color: '#3b82f6',
    soft: 'rgba(59, 130, 246, 0.12)',
    gradient: ['#60a5fa', '#2563eb'],
  },
  {
    key: 'ANGRY',
    value: 'Tức giận 😡',
    emoji: '😡',
    label: 'Tức giận',
    color: '#ef4444',
    soft: 'rgba(239, 68, 68, 0.12)',
    gradient: ['#fb7185', '#dc2626'],
  },
]

const NEUTRAL_FALLBACK: EmotionMeta = EMOTIONS[1]

export function emotionMeta(raw: string | null | undefined): EmotionMeta | null {
  if (!raw) return null
  const input = raw.trim()
  const found = EMOTIONS.find(
    (e) =>
      e.value === input ||
      e.label.toLowerCase() === input.toLowerCase() ||
      e.key.toLowerCase() === input.toLowerCase() ||
      e.emoji === input ||
      input.includes(e.emoji),
  )
  return found ?? null
}

export function emotionMetaOrNeutral(raw: string | null | undefined): EmotionMeta {
  return emotionMeta(raw) ?? NEUTRAL_FALLBACK
}
