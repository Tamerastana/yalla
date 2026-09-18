import { Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'

export function NotFoundPage() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center px-6 text-center">
      <span className="text-6xl font-extrabold text-brand-500">404</span>
      <p className="mt-2 text-lg font-bold text-ink-900">Page not found</p>
      <p className="mt-1 text-sm text-ink-500">The page you're looking for doesn't exist or has moved.</p>
      <Link to="/" className="mt-5">
        <Button>Back to Discover</Button>
      </Link>
    </div>
  )
}
