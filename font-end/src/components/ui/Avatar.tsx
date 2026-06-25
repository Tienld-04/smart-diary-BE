import { useState } from 'react'
import { cn } from '../../lib/utils'
import { initials } from '../../lib/utils'

interface AvatarProps {
  name?: string | null
  src?: string | null
  size?: number
  className?: string
}

export function Avatar({ name, src, size = 40, className }: AvatarProps) {
  const [broken, setBroken] = useState(false)
  const showImg = src && !broken
  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center overflow-hidden rounded-full font-bold text-white shadow-sm ring-2 ring-white',
        !showImg && 'btn-brand',
        className,
      )}
      style={{ width: size, height: size, fontSize: size * 0.38 }}
    >
      {showImg ? (
        <img
          src={src}
          alt={name ?? 'avatar'}
          className="h-full w-full object-cover"
          onError={() => setBroken(true)}
          referrerPolicy="no-referrer"
        />
      ) : (
        <span>{initials(name)}</span>
      )}
    </div>
  )
}
