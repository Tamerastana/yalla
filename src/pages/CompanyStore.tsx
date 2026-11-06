import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Gift, ShieldCheck } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useProfile } from '../hooks/useProfiles'
import { useActiveRewards, useRewardCategories } from '../hooks/useRewards'
import { usePointsHistory } from '../hooks/usePoints'
import { Avatar } from '../components/ui/Avatar'
import { Badge } from '../components/ui/Badge'
import { EmptyState } from '../components/ui/EmptyState'
import { PageLoader } from '../components/ui/Spinner'
import { RewardCard } from '../components/rewards/RewardCard'
import { RedeemModal } from './Rewards'
import type { Reward } from '../types'

export function CompanyStorePage() {
  const { companyId } = useParams<{ companyId: string }>()
  const { user } = useAuth()
  const companyQuery = useProfile(companyId)
  const rewardsQuery = useActiveRewards()
  const categoriesQuery = useRewardCategories(companyId)
  const pointsQuery = usePointsHistory(user?.id)

  const [selected, setSelected] = useState<Reward | null>(null)
  const [toast, setToast] = useState('')

  const rewards = useMemo(() => (rewardsQuery.data ?? []).filter((r) => r.companyId === companyId), [rewardsQuery.data, companyId])
  const categories = categoriesQuery.data ?? []

  const balance = useMemo(
    () => (pointsQuery.data ?? []).filter((p) => p.companyId === companyId).reduce((s, p) => s + (p.kind === 'earned' ? p.points : -p.points), 0),
    [pointsQuery.data, companyId],
  )

  const rewardsByCategory = useMemo(() => {
    const map = new Map<string, Reward[]>()
    for (const r of rewards) {
      const key = r.categoryId ?? 'uncategorized'
      map.set(key, [...(map.get(key) ?? []), r])
    }
    return map
  }, [rewards])

  if (companyQuery.isLoading || rewardsQuery.isLoading) return <PageLoader />

  const company = companyQuery.data
  if (!company || company.role !== 'company') {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <EmptyState icon={<Gift size={20} />} title="Company not found" />
      </div>
    )
  }

  const uncategorized = rewardsByCategory.get('uncategorized') ?? []

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <Link to="/rewards" className="mb-5 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-500 hover:text-brand-600">
        <ArrowLeft size={15} /> All rewards
      </Link>

      {toast && <div className="mb-4 rounded-xl bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-700">{toast}</div>}

      <div className="mb-8 flex flex-wrap items-center gap-4 rounded-2xl border border-ink-200 bg-white p-5">
        <Avatar name={company.name} src={company.avatarUrl} size={64} />
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 text-xl font-extrabold text-ink-900">
            {company.company?.companyName}
            {company.company?.verified && <ShieldCheck size={16} className="text-brand-500" />}
          </p>
          {company.company?.industry && <p className="text-sm text-ink-500">{company.company.industry}</p>}
          {company.company?.about && <p className="mt-1 max-w-xl text-sm text-ink-600">{company.company.about}</p>}
        </div>
        {user && (
          <Badge tone="brand" className="text-sm">
            {balance} pts with {company.company?.companyName ?? company.name}
          </Badge>
        )}
      </div>

      {rewards.length === 0 ? (
        <EmptyState icon={<Gift size={20} />} title="No rewards yet" description="This company hasn't published any rewards here yet." />
      ) : (
        <div className="space-y-10">
          {categories.map((cat) => {
            const catRewards = rewardsByCategory.get(cat.id) ?? []
            if (catRewards.length === 0) return null
            return (
              <section key={cat.id}>
                <h2 className="mb-3 font-bold text-ink-900">{cat.name}</h2>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {catRewards.map((r) => (
                    <RewardCard key={r.id} reward={r} showCompany={false} balance={balance} loggedIn={!!user} onRedeem={setSelected} />
                  ))}
                </div>
              </section>
            )
          })}
          {uncategorized.length > 0 && (
            <section>
              {categories.length > 0 && <h2 className="mb-3 font-bold text-ink-900">More rewards</h2>}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {uncategorized.map((r) => (
                  <RewardCard key={r.id} reward={r} showCompany={false} balance={balance} loggedIn={!!user} onRedeem={setSelected} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      <RedeemModal
        reward={selected}
        onClose={() => setSelected(null)}
        onRedeemed={(msg) => {
          setSelected(null)
          setToast(msg)
          setTimeout(() => setToast(''), 3500)
        }}
      />
    </div>
  )
}
