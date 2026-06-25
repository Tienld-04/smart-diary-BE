import { Loader2 } from 'lucide-react'
import { cn } from '../../lib/utils'

export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn('h-5 w-5 animate-spin text-brand-500', className)} />
}

export function PageLoader({ label = 'Đang tải…' }: { label?: string }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-slate-400">
      <div className="relative h-14 w-14">
        <div className="absolute inset-0 animate-ping rounded-full bg-brand-300/40" />
        <div className="btn-brand flex h-14 w-14 items-center justify-center rounded-full">
          <Loader2 className="h-6 w-6 animate-spin text-white" />
        </div>
      </div>
      <p className="text-sm font-medium">{label}</p>
    </div>
  )
}

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'animate-shimmer rounded-2xl bg-gradient-to-r from-slate-200/60 via-slate-100 to-slate-200/60',
        className,
      )}
    />
  )
}
