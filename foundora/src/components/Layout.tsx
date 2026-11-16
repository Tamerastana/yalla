import { useState, type ReactNode } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import {
  BarChart3, Calculator, FlaskConical, Map, Megaphone, Menu, MessageSquare, Rocket, Target, Users, X, Landmark,
  type LucideIcon,
} from 'lucide-react'
import { useStore } from '../lib/store'
import type { StepIcon } from '../lib/roadmap'

export function Logo({ size = 28, text = true }: { size?: number; text?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2">
      <img src="/logo.svg" width={size} height={size} alt="" />
      {text && <span className="text-xl font-extrabold tracking-tight text-ink">Foundora</span>}
    </span>
  )
}

const NAV = [
  { to: '/dashboard', label: 'Roadmap' },
  { to: '/assistant', label: 'Assistant' },
  { to: '/validate', label: 'Validate' },
  { to: '/costs', label: 'Costs' },
  { to: '/resources', label: 'Resources' },
  { to: '/pricing', label: 'Pricing' },
]

export function Layout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const { profile, plan } = useStore()
  const loc = useLocation()

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 border-b border-ink/5 bg-cream/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link to="/" onClick={() => setOpen(false)}>
            <Logo />
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {NAV.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2 text-sm font-semibold transition ${isActive ? 'bg-mint text-brand' : 'text-ink/70 hover:text-ink'}`
                }
              >
                {n.label}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            {profile ? (
              <Link
                to="/start"
                title="Edit your profile"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-brand text-sm font-bold text-white"
              >
                {initials(profile.name)}
              </Link>
            ) : (
              loc.pathname !== '/start' && (
                <Link to="/start" className="btn-primary hidden !py-2 text-sm sm:inline-flex">
                  Get started
                </Link>
              )
            )}
            {plan === 'premium' && <span className="chip hidden bg-coral/15 text-coral sm:inline-flex">Premium</span>}
            <button className="rounded-lg p-2 md:hidden" onClick={() => setOpen((o) => !o)} aria-label="Menu">
              {open ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
        {open && (
          <nav className="border-t border-ink/5 bg-cream px-4 py-2 md:hidden">
            {NAV.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className={({ isActive }) => `block rounded-lg px-3 py-2.5 font-semibold ${isActive ? 'bg-mint text-brand' : ''}`}
              >
                {n.label}
              </NavLink>
            ))}
            {!profile && (
              <Link to="/start" onClick={() => setOpen(false)} className="btn-primary my-2 w-full">
                Get started
              </Link>
            )}
          </nav>
        )}
      </header>
      <main className="flex-1">{children}</main>
      <footer className="mt-16 border-t border-ink/5 bg-white/60">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-muted sm:flex-row">
          <Logo size={22} />
          <p className="text-center text-xs uppercase tracking-[0.3em]">Foundora — from idea to impact</p>
          <p className="text-xs">Guidance only · not legal or financial advice</p>
        </div>
      </footer>
    </div>
  )
}

export const initials = (name: string) =>
  (name || 'You')
    .split(/\s+/)
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

const ICONS: Record<StepIcon, LucideIcon> = {
  users: Users,
  message: MessageSquare,
  flask: FlaskConical,
  calculator: Calculator,
  rocket: Rocket,
  target: Target,
  landmark: Landmark,
  megaphone: Megaphone,
  chart: BarChart3,
}
const TONES = {
  coral: 'bg-peach text-coral',
  teal: 'bg-mint text-teal',
  violet: 'bg-violet-100 text-violet-600',
  green: 'bg-emerald-100 text-emerald-600',
  amber: 'bg-amber-100 text-amber-600',
}

export function StepBadge({ icon, tone, size = 48 }: { icon: StepIcon; tone: keyof typeof TONES; size?: number }) {
  const Icon = ICONS[icon] ?? Map
  return (
    <span className={`flex shrink-0 items-center justify-center rounded-full ${TONES[tone]}`} style={{ width: size, height: size }}>
      <Icon size={size * 0.46} />
    </span>
  )
}

export function StatusChip({ status }: { status: 'complete' | 'in-progress' | 'pending' }) {
  if (status === 'complete') return <span className="chip bg-emerald-100 text-emerald-700">✓ Complete</span>
  if (status === 'in-progress') return <span className="chip bg-brand text-white">In progress</span>
  return <span className="chip bg-ink/5 text-ink/60">Pending</span>
}

export function PageHeader({ title, sub, children }: { title: string; sub?: string; children?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{title}</h1>
        {sub && <p className="mt-2 text-muted">{sub}</p>}
      </div>
      {children}
    </div>
  )
}
