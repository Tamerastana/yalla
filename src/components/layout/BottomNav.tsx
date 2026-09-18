import { NavLink } from 'react-router-dom'
import { Gift, Home, Plus, User } from 'lucide-react'
import { clsx } from 'clsx'
import { useAuth } from '../../context/AuthContext'

const items = [
  { to: '/', label: 'Discover', icon: Home, end: true },
  { to: '/rewards', label: 'Rewards', icon: Gift, end: false },
  { to: '/create', label: 'Host', icon: Plus, end: false, primary: true },
  { to: '/profile', label: 'Profile', icon: User, end: false },
]

export function BottomNav() {
  const { user } = useAuth()
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-ink-100 bg-white/95 backdrop-blur-md pb-[env(safe-area-inset-bottom)] md:hidden">
      <div className="mx-auto flex max-w-6xl items-stretch justify-around px-2">
        {items.map((item) => {
          const to = item.to === '/profile' && !user ? '/login' : item.to
          return (
            <NavLink
              key={item.to}
              to={to}
              end={item.end}
              className={({ isActive }) =>
                clsx('flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-semibold', {
                  'text-brand-600': isActive && !item.primary,
                  'text-ink-400': !isActive && !item.primary,
                })
              }
            >
              {({ isActive }) =>
                item.primary ? (
                  <>
                    <span className="-mt-5 flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-white shadow-[var(--shadow-card)]">
                      <item.icon size={20} />
                    </span>
                    <span className="text-ink-400">{item.label}</span>
                  </>
                ) : (
                  <>
                    <item.icon size={20} className={isActive ? 'text-brand-600' : 'text-ink-400'} />
                    {item.label}
                  </>
                )
              }
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}
