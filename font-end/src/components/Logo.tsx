import { cn } from '../lib/utils'

export function Logo({ size = 40, withText = true, className }: { size?: number; withText?: boolean; className?: string }) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <div
        className="btn-brand flex items-center justify-center rounded-2xl text-white shadow-lg"
        style={{ width: size, height: size }}
      >
        <svg viewBox="0 0 24 24" width={size * 0.56} height={size * 0.56} fill="none">
          <path
            d="M7 4h8a3 3 0 0 1 3 3v13l-3.5-2.2L11 20l-3.5-2.2L4 20V7a3 3 0 0 1 3-3Z"
            fill="white"
            fillOpacity="0.95"
          />
          <path d="M8.5 9h6M8.5 12.4h4.2" stroke="#6d5efc" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
      {withText && (
        <div className="leading-tight">
          <p className="text-lg font-extrabold tracking-tight text-slate-800">
            Smart<span className="gradient-text">Diary</span>
          </p>
          <p className="-mt-0.5 text-[0.65rem] font-medium uppercase tracking-[0.18em] text-slate-400">
            Nhật ký cảm xúc
          </p>
        </div>
      )}
    </div>
  )
}
