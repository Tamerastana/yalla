import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

type Tone = 'brand' | 'neutral' | 'success' | 'info' | 'warning'

const tones: Record<Tone, string> = {
  brand: 'bg-brand-50 text-brand-700 ring-1 ring-inset ring-brand-200',
  neutral: 'bg-ink-100 text-ink-600 ring-1 ring-inset ring-ink-200',
  success: 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200',
  info: 'bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-200',
  warning: 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200',
}

export function Badge({ tone = 'neutral', className, children }: { tone?: Tone; className?: string; children: ReactNode }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}
