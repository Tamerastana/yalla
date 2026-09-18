import { Loader2 } from 'lucide-react'
import { cn } from '../../lib/cn'

export function Spinner({ className, size = 20 }: { className?: string; size?: number }) {
  return <Loader2 size={size} className={cn('animate-spin text-brand-500', className)} />
}

export function PageLoader() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <Spinner size={28} />
    </div>
  )
}
