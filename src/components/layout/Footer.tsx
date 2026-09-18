import { Link } from 'react-router-dom'

export function Footer() {
  return (
    <footer className="hidden border-t border-ink-100 bg-ink-50/60 md:block">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-400 to-brand-600 text-sm font-extrabold text-white">
            Y
          </span>
          <span className="font-extrabold text-ink-900">
            Yalla<span className="text-brand-500">.</span>
          </span>
          <span className="ml-2 text-sm text-ink-400">Sports events across the UAE</span>
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-500">
          <Link to="/" className="hover:text-brand-600">
            Discover
          </Link>
          <Link to="/rewards" className="hover:text-brand-600">
            Rewards
          </Link>
          <Link to="/create" className="hover:text-brand-600">
            Host an event
          </Link>
          <span>&copy; {new Date().getFullYear()} Yalla</span>
        </div>
      </div>
    </footer>
  )
}
