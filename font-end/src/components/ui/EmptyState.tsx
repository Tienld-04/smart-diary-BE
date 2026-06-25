import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon?: ReactNode
  emoji?: string
  title: string
  description?: string
  action?: ReactNode
}

export function EmptyState({ icon, emoji, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white/50 px-6 py-16 text-center">
      <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-brand-100 to-accent-100 text-4xl shadow-inner">
        {emoji ?? icon}
      </div>
      <h3 className="text-lg font-bold text-slate-700">{title}</h3>
      {description && <p className="mt-1.5 max-w-sm text-sm text-slate-400">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}
