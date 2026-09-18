import { useState } from 'react'
import { ImageOff } from 'lucide-react'
import { cn } from '../../lib/cn'

export function SafeImage({
  src,
  alt,
  className,
  loading,
}: {
  src: string
  alt: string
  className?: string
  loading?: 'lazy' | 'eager'
}) {
  const [failed, setFailed] = useState(false)

  if (failed) {
    return (
      <div className={cn('flex items-center justify-center bg-gradient-to-br from-brand-100 to-brand-200 text-brand-400', className)}>
        <ImageOff size={28} />
      </div>
    )
  }

  return <img src={src} alt={alt} loading={loading} onError={() => setFailed(true)} className={className} />
}
