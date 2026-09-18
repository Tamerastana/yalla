import { useState } from 'react'
import { cn } from '../../lib/cn'
import { initials } from '../../lib/format'

export function Avatar({
  name,
  src,
  size = 40,
  className,
}: {
  name: string
  src?: string
  size?: number
  className?: string
}) {
  const [failed, setFailed] = useState(false)

  if (src && !failed) {
    return (
      <img
        src={src}
        alt={name}
        width={size}
        height={size}
        onError={() => setFailed(true)}
        className={cn('rounded-full object-cover ring-2 ring-white', className)}
        style={{ width: size, height: size }}
      />
    )
  }
  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-full bg-brand-100 font-semibold text-brand-700 ring-2 ring-white',
        className,
      )}
      style={{ width: size, height: size, fontSize: size * 0.38 }}
    >
      {initials(name)}
    </div>
  )
}
