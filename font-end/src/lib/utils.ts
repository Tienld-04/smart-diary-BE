import { format, formatDistanceToNow, isToday, isYesterday, parseISO } from 'date-fns'
import { vi } from 'date-fns/locale'

export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ')
}

function toDate(value: string | Date | null | undefined): Date | null {
  if (!value) return null
  if (value instanceof Date) return value
  try {
    const d = parseISO(value)
    return Number.isNaN(d.getTime()) ? null : d
  } catch {
    return null
  }
}

export function formatDate(value: string | Date | null | undefined): string {
  const d = toDate(value)
  if (!d) return '—'
  return format(d, "d 'tháng' M, yyyy", { locale: vi })
}

export function formatDateTime(value: string | Date | null | undefined): string {
  const d = toDate(value)
  if (!d) return '—'
  return format(d, "HH:mm · d 'tháng' M, yyyy", { locale: vi })
}

export function formatTime(value: string | Date | null | undefined): string {
  const d = toDate(value)
  if (!d) return ''
  return format(d, 'HH:mm', { locale: vi })
}

export function relativeDate(value: string | Date | null | undefined): string {
  const d = toDate(value)
  if (!d) return '—'
  if (isToday(d)) return 'Hôm nay'
  if (isYesterday(d)) return 'Hôm qua'
  return formatDistanceToNow(d, { addSuffix: true, locale: vi })
}

export function greeting(name?: string): string {
  const h = new Date().getHours()
  const part =
    h < 11 ? 'Chào buổi sáng' : h < 14 ? 'Chào buổi trưa' : h < 18 ? 'Chào buổi chiều' : 'Chào buổi tối'
  return name ? `${part}, ${name}` : part
}

export function initials(name?: string | null): string {
  if (!name) return '🙂'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}


export function excerpt(text: string | null | undefined, max = 160): string {
  if (!text) return ''
  const clean = text.replace(/\s+/g, ' ').trim()
  return clean.length > max ? clean.slice(0, max).trimEnd() + '…' : clean
}

export function readingTime(text: string | null | undefined): string {
  const words = (text ?? '').trim().split(/\s+/).filter(Boolean).length
  const minutes = Math.max(1, Math.round(words / 180))
  return `${minutes} phút đọc`
}
