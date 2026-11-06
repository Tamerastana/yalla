import { Link } from 'react-router-dom'
import { Award, ShieldCheck } from 'lucide-react'
import { Avatar } from '../ui/Avatar'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { SafeImage } from '../ui/SafeImage'
import type { Reward, User } from '../../types'

export function RewardCard({
  reward,
  company,
  showCompany = true,
  balance,
  loggedIn,
  onRedeem,
}: {
  reward: Reward
  company?: User
  showCompany?: boolean
  balance: number
  loggedIn: boolean
  onRedeem: (reward: Reward) => void
}) {
  const canAfford = balance >= reward.costPoints
  const pct = Math.min(100, Math.round((balance / reward.costPoints) * 100))
  const needed = Math.max(0, reward.costPoints - balance)

  return (
    <Card className="group flex flex-col overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-[var(--shadow-pop)]">
      <div className="aspect-[16/10] w-full overflow-hidden bg-ink-100">
        <SafeImage
          src={reward.imageUrl}
          alt={reward.title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <div className="flex flex-1 flex-col gap-2.5 p-4">
        {showCompany && company && (
          <Link to={`/rewards/company/${company.id}`} className="flex items-center gap-1.5 hover:underline">
            <Avatar name={company.name} src={company.avatarUrl} size={18} />
            <span className="truncate text-xs font-semibold text-ink-500">{company.company?.companyName ?? company.name}</span>
            {company.company?.verified && <ShieldCheck size={12} className="text-brand-500" />}
          </Link>
        )}
        <h3 className="font-bold text-ink-900">{reward.title}</h3>
        <p className="line-clamp-2 text-xs text-ink-500">{reward.description}</p>

        <div className="mt-auto flex items-center justify-between pt-2">
          <Badge tone="brand">
            <Award size={12} /> {reward.costPoints} pts
          </Badge>
          {loggedIn && (
            <span className="text-xs font-medium text-ink-400">
              You have {balance} pt{balance === 1 ? '' : 's'}
            </span>
          )}
        </div>

        {loggedIn && !canAfford && (
          <div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-ink-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-brand-400 to-brand-600 transition-all duration-300"
                style={{ width: `${pct}%` }}
              />
            </div>
            <p className="mt-1 text-[11px] font-medium text-ink-400">
              You need {needed} more point{needed === 1 ? '' : 's'}
            </p>
          </div>
        )}

        <Button className="w-full" disabled={!loggedIn || !canAfford} onClick={() => onRedeem(reward)}>
          {!loggedIn ? 'Log in to redeem' : canAfford ? 'Redeem' : 'Not enough points'}
        </Button>
      </div>
    </Card>
  )
}
