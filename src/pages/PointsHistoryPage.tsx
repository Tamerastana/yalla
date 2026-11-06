import { Trophy } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { PointsHistory } from '../components/points/PointsHistory'

export function PointsHistoryPageRoute() {
  const { user } = useAuth()
  if (!user) return null

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <h1 className="flex items-center gap-2 text-2xl font-extrabold text-ink-900">
        <Trophy className="text-brand-500" /> Points & rewards history
      </h1>
      <p className="mt-1 text-sm text-ink-500">Everything you've earned and spent, across every company.</p>
      <div className="mt-6">
        <PointsHistory userId={user.id} />
      </div>
    </div>
  )
}
