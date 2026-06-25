import type { ReactNode } from 'react'
import { motion } from 'motion/react'

interface PageHeaderProps {
  title: string
  subtitle?: string
  icon?: ReactNode
  action?: ReactNode
}

export function PageHeader({ title, subtitle, icon, action }: PageHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex items-center gap-3.5">
        {icon && (
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500/15 to-accent-500/15 text-brand-600">
            {icon}
          </span>
        )}
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-800 sm:text-[1.7rem]">
            {title}
          </h1>
          {subtitle && <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </motion.div>
  )
}
