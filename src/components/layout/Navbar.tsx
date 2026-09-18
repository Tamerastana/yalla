import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Building2, Gift, LogOut, Plus, ShieldCheck, User as UserIcon } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { Avatar } from '../ui/Avatar'
import { Button } from '../ui/Button'

const navLink = ({ isActive }: { isActive: boolean }) =>
  `rounded-full px-3.5 py-2 text-sm font-semibold transition-colors ${
    isActive ? 'bg-brand-50 text-brand-600' : 'text-ink-500 hover:text-ink-900 hover:bg-ink-100'
  }`

export function Navbar() {
  const { user, logOut } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()

  return (
    <header className="sticky top-0 z-40 border-b border-ink-100 bg-white/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 text-lg font-extrabold text-white shadow-[var(--shadow-card)]">
            Y
          </span>
          <span className="text-lg font-extrabold tracking-tight text-ink-900">
            Yalla<span className="text-brand-500">.</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <NavLink to="/" end className={navLink}>
            Discover
          </NavLink>
          <NavLink to="/rewards" className={navLink}>
            Rewards
          </NavLink>
          {user?.role === 'company' && (
            <NavLink to="/company" className={navLink}>
              Company hub
            </NavLink>
          )}
          {user?.role === 'super_admin' && (
            <NavLink to="/admin" className={navLink}>
              Admin
            </NavLink>
          )}
        </nav>

        <div className="flex items-center gap-2">
          <Button size="sm" className="hidden sm:inline-flex" onClick={() => navigate('/create')}>
            <Plus size={16} /> Host event
          </Button>
          {user ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center gap-2 rounded-full border border-ink-200 p-1 pr-2 hover:border-brand-300"
              >
                <Avatar name={user.name} src={user.avatarUrl} size={32} />
                <span className="hidden max-w-[110px] truncate text-sm font-semibold text-ink-700 sm:inline">
                  {user.name.split(' ')[0]}
                </span>
              </button>
              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 z-20 mt-2 w-56 animate-scale-in rounded-2xl border border-ink-100 bg-white p-1.5 shadow-[var(--shadow-pop)]">
                    <Link
                      to="/profile"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-ink-700 hover:bg-ink-50"
                    >
                      <UserIcon size={16} /> My profile
                    </Link>
                    <Link
                      to="/rewards"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-ink-700 hover:bg-ink-50"
                    >
                      <Gift size={16} /> Rewards
                    </Link>
                    {user.role === 'company' && (
                      <Link
                        to="/company"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-ink-700 hover:bg-ink-50"
                      >
                        <Building2 size={16} /> Company hub
                      </Link>
                    )}
                    {user.role === 'super_admin' && (
                      <Link
                        to="/admin"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-ink-700 hover:bg-ink-50"
                      >
                        <ShieldCheck size={16} /> Admin
                      </Link>
                    )}
                    <div className="my-1 h-px bg-ink-100" />
                    <button
                      onClick={() => {
                        setMenuOpen(false)
                        logOut()
                        navigate('/')
                      }}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50"
                    >
                      <LogOut size={16} /> Log out
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
                Log in
              </Button>
              <Button size="sm" onClick={() => navigate('/signup')}>
                Sign up
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
