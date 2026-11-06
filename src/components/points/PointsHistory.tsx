import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { clsx } from 'clsx'
import { Award, Gift, Ticket } from 'lucide-react'
import { formatEventDate } from '../../lib/format'
import { useEventsByIds } from '../../hooks/useEvents'
import { useUsersByIds } from '../../hooks/useProfiles'
import { useRewardsByIds } from '../../hooks/useRewards'
import { usePointsHistory, useRedemptions } from '../../hooks/usePoints'
import { Avatar } from '../ui/Avatar'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { EmptyState } from '../ui/EmptyState'
import { PageLoader } from '../ui/Spinner'

export function PointsHistory({ userId }: { userId: string }) {
  const pointsQuery = usePointsHistory(userId)
  const points = pointsQuery.data ?? []
  const redemptionsQuery = useRedemptions(userId)
  const redemptions = redemptionsQuery.data ?? []

  const companyIds = useMemo(() => Array.from(new Set(points.map((p) => p.companyId))), [points])
  const companiesQuery = useUsersByIds(companyIds)
  const companyById = new Map((companiesQuery.data ?? []).map((c) => [c.id, c]))

  const eventIds = useMemo(() => Array.from(new Set(points.map((p) => p.eventId).filter((id): id is string => !!id))), [points])
  const eventsQuery = useEventsByIds(eventIds)
  const eventById = new Map((eventsQuery.data ?? []).map((e) => [e.id, e]))

  const rewardIds = useMemo(() => {
    const fromPoints = points.map((p) => p.rewardId).filter((id): id is string => !!id)
    const fromRedemptions = redemptions.map((r) => r.rewardId)
    return Array.from(new Set([...fromPoints, ...fromRedemptions]))
  }, [points, redemptions])
  const rewardsQuery = useRewardsByIds(rewardIds)
  const rewardById = new Map((rewardsQuery.data ?? []).map((r) => [r.id, r]))

  const balances = companyIds.map((companyId) => ({
    companyId,
    company: companyById.get(companyId),
    balance: points.filter((p) => p.companyId === companyId).reduce((s, p) => s + (p.kind === 'earned' ? p.points : -p.points), 0),
  }))

  if (pointsQuery.isLoading) return <PageLoader />

  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-2 text-sm font-bold text-ink-900">Points by company</h3>
        {balances.length === 0 ? (
          <EmptyState
            icon={<Award size={20} />}
            title="No points yet"
            description="Attend official events from verified companies to start earning points."
          />
        ) : (
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {balances.map((b) => (
              <Card key={b.companyId} className="flex items-center justify-between p-3.5">
                <div className="flex items-center gap-2.5">
                  <Avatar name={b.company?.name ?? 'Company'} src={b.company?.avatarUrl} size={32} />
                  <span className="text-sm font-semibold text-ink-800">{b.company?.company?.companyName ?? b.company?.name}</span>
                </div>
                <span className="font-extrabold text-brand-600">{b.balance} pts</span>
              </Card>
            ))}
          </div>
        )}
        <Link to="/rewards" className="mt-3 inline-flex">
          <Button variant="outline" size="sm">
            <Gift size={14} /> Browse rewards
          </Button>
        </Link>
      </div>

      {redemptions.length > 0 && (
        <div>
          <h3 className="mb-2 text-sm font-bold text-ink-900">Redemptions</h3>
          <div className="space-y-2">
            {redemptions.map((r) => {
              const reward = rewardById.get(r.rewardId)
              return (
                <Card key={r.id} className="flex items-center justify-between p-3.5">
                  <div className="flex items-center gap-2.5">
                    <Ticket size={16} className="text-brand-500" />
                    <div>
                      <p className="text-sm font-semibold text-ink-800">{reward?.title ?? 'Reward'}</p>
                      <p className="text-xs text-ink-400">
                        {r.code} &middot; {formatEventDate(r.redeemedAt)}
                      </p>
                    </div>
                  </div>
                  <Badge tone={r.status === 'used' ? 'neutral' : 'success'}>{r.status === 'used' ? 'Used' : 'Ready to use'}</Badge>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      <div>
        <h3 className="mb-2 text-sm font-bold text-ink-900">Activity</h3>
        <div className="divide-y divide-ink-100 rounded-2xl border border-ink-100">
          {points.length === 0 && <p className="p-3.5 text-sm text-ink-500">No activity yet.</p>}
          {points.map((h) => {
            const event = h.eventId ? eventById.get(h.eventId) : undefined
            const reward = h.rewardId ? rewardById.get(h.rewardId) : undefined
            const label = h.kind === 'earned' ? (event ? `Attended ${event.title}` : h.note) : reward ? `Redeemed ${reward.title}` : h.note
            return (
              <div key={h.id} className="flex items-center justify-between p-3.5">
                <div>
                  <p className="text-sm font-medium text-ink-700">{label}</p>
                  <p className="text-xs text-ink-400">{formatEventDate(h.createdAt)}</p>
                </div>
                <span className={clsx('font-bold', h.kind === 'earned' ? 'text-emerald-600' : 'text-ink-500')}>
                  {h.kind === 'earned' ? '+' : '-'}
                  {h.points}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
