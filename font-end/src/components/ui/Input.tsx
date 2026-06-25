import { forwardRef, useId, useState } from 'react'
import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { cn } from '../../lib/utils'

interface FieldProps {
  label?: string
  hint?: string
  error?: string
  icon?: ReactNode
}

const fieldBase =
  'ring-focus w-full rounded-2xl border border-slate-200 bg-white/80 text-slate-800 placeholder:text-slate-400 transition-all duration-200'

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & FieldProps>(
  function Input({ label, hint, error, icon, className, type = 'text', id, ...props }, ref) {
    const autoId = useId()
    const inputId = id ?? autoId
    const [show, setShow] = useState(false)
    const isPassword = type === 'password'
    const realType = isPassword ? (show ? 'text' : 'password') : type

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="mb-1.5 block text-sm font-semibold text-slate-600">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            type={realType}
            className={cn(
              fieldBase,
              'h-12 px-4 text-[0.95rem]',
              !!icon && 'pl-11',
              isPassword && 'pr-11',
              error && 'border-rose-300 bg-rose-50/40',
              className,
            )}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 transition hover:text-brand-500"
              tabIndex={-1}
              aria-label={show ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
            >
              {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          )}
        </div>
        {error ? (
          <p className="mt-1.5 text-xs font-medium text-rose-500">{error}</p>
        ) : hint ? (
          <p className="mt-1.5 text-xs text-slate-400">{hint}</p>
        ) : null}
      </div>
    )
  },
)

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement> & FieldProps
>(function Textarea({ label, hint, error, className, id, ...props }, ref) {
  const autoId = useId()
  const textId = id ?? autoId
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={textId} className="mb-1.5 block text-sm font-semibold text-slate-600">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={textId}
        className={cn(
          fieldBase,
          'scrollbar-slim min-h-[120px] resize-y p-4 text-[0.95rem] leading-relaxed',
          error && 'border-rose-300 bg-rose-50/40',
          className,
        )}
        {...props}
      />
      {error ? (
        <p className="mt-1.5 text-xs font-medium text-rose-500">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-slate-400">{hint}</p>
      ) : null}
    </div>
  )
})
