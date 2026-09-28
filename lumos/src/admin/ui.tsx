import type { ReactNode } from 'react'

export const input =
  'w-full rounded-lg border border-navy-800/15 bg-white px-3 py-2 text-sm text-navy-800 outline-none transition focus:border-gold-500 focus:ring-2 focus:ring-gold-500/25'

export function Card({ title, subtitle, children, actions }: { title?: string; subtitle?: string; children: ReactNode; actions?: ReactNode }) {
  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-navy-800/10 sm:p-6">
      {(title || actions) && (
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div>
            {title && <h2 className="text-lg font-bold text-navy-800">{title}</h2>}
            {subtitle && <p className="mt-0.5 text-sm text-slate-ink">{subtitle}</p>}
          </div>
          {actions}
        </div>
      )}
      {children}
    </section>
  )
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="text-[13px] font-semibold text-navy-800">{label}</span>
      {hint && <span className="ml-2 text-xs text-slate-ink">{hint}</span>}
      <div className="mt-1.5">{children}</div>
    </label>
  )
}

export function TextInput({ value, onChange, multiline, className = '' }: { value: string; onChange: (v: string) => void; multiline?: boolean; className?: string }) {
  return multiline ? (
    <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={3} className={`${input} resize-y ${className}`} />
  ) : (
    <input value={value} onChange={(e) => onChange(e.target.value)} className={`${input} ${className}`} />
  )
}

export function Toggle({ checked, onChange, label, hint }: { checked: boolean; onChange: (v: boolean) => void; label: string; hint?: string }) {
  return (
    <label className="flex cursor-pointer items-start gap-3">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition ${checked ? 'bg-gold-500' : 'bg-navy-800/20'}`}
      >
        <span className={`absolute top-0.5 size-5 rounded-full bg-white shadow transition-all ${checked ? 'left-[22px]' : 'left-0.5'}`} />
      </button>
      <span>
        <span className="block text-sm font-semibold text-navy-800">{label}</span>
        {hint && <span className="block text-xs text-slate-ink">{hint}</span>}
      </span>
    </label>
  )
}
