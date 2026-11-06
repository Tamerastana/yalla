import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Check, Gift, Search, ShieldCheck, Store } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useActiveRewards } from '../hooks/useRewards'
import { useCompanies, useUsersByIds } from '../hooks/useProfiles'
import { usePointsHistory, useRedeemReward } from '../hooks/usePoints'
import { Avatar } from '../components/ui/Avatar'
import { Button } from '../components/ui/Button'
import { EmptyState } from '../components/ui/EmptyState'
import { Input, Select } from '../components/ui/Input'
import { Modal } from '../components/ui/Modal'
import { PageLoader } from '../components/ui/Spinner'
import { SafeImage } from '../components/ui/SafeImage'
import { RewardCard } from '../components/rewards/RewardCard'
import type { Reward } from '../types'

const COST_FILTERS = [
  { label: 'Any cost', value: 'any' },
  { label: 'Under 50 pts', value: '50' },
  { label: 'Under 100 pts', value: '100' },
  { label: 'Under 200 pts', value: '200' },
] as const

export function RewardsPage() {
  const { user } = useAuth()
  const rewardsQuery = useActiveRewards()
  const rewards = rewardsQuery.data ?? []
  const companiesQuery = useCompanies()
  const companies = (companiesQuery.data ?? []).filter((c) => c.company?.verified)

  const rewardCompanyIds = useMemo(() => Array.from(new Set(rewards.map((r) => r.companyId))), [rewards])
  const rewardCompaniesQuery = useUsersByIds(rewardCompanyIds)
  const companyById = new Map((rewardCompaniesQuery.data ?? []).map((c) => [c.id, c]))

  const pointsQuery = usePointsHistory(user?.id)
  const balanceByCompany = useMemo(() => {
    const map = new Map<string, number>()
    for (const p of pointsQuery.data ?? []) {
      map.set(p.companyId, (map.get(p.companyId) ?? 0) + (p.kind === 'earned' ? p.points : -p.points))
    }
    return map
  }, [pointsQuery.data])

  const [query, setQuery] = useState('')
  const [companyFilter, setCompanyFilter] = useState<string | 'all'>('all')
  const [costFilter, setCostFilter] = useState<(typeof COST_FILTERS)[number]['value']>('any')
  const [selected, setSelected] = useState<Reward | null>(null)
  const [toast, setToast] = useState('')

  const rewardCountByCompany = useMemo(() => {
    const map = new Map<string, number>()
    for (const r of rewards) map.set(r.companyId, (map.get(r.companyId) ?? 0) + 1)
    return map
  }, [rewards])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const maxCost = costFilter === 'any' ? Infinity : Number(costFilter)
    return rewards.filter((r) => {
      if (companyFilter !== 'all' && r.companyId !== companyFilter) return false
      if (r.costPoints > maxCost) return false
      if (!q) return true
      const company = companyById.get(r.companyId)
      const haystack = `${r.title} ${r.description} ${company?.company?.companyName ?? ''}`.toLowerCase()
      return haystack.includes(q)
    })
  }, [rewards, companyFilter, costFilter, query, companyById])

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-extrabold text-ink-900">
          <Gift className="text-brand-500" /> Rewards
        </h1>
        <p className="mt-1 text-sm text-ink-500">
          Redeem points earned at official, verified-company events. Points and rewards are scoped per company, like an
          airline miles program.
        </p>
      </div>

      {toast && <div className="mb-4 rounded-xl bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-700">{toast}</div>}

      {companies.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-3 flex items-center gap-1.5 font-bold text-ink-900">
            <Store size={16} className="text-brand-500" /> Browse by company
          </h2>
          <div className="flex gap-3 overflow-x-auto scrollbar-none pb-1">
            {companies.map((c) => (
              <Link
                key={c.id}
                to={`/rewards/company/${c.id}`}
                className="flex w-44 shrink-0 flex-col items-center gap-2 rounded-2xl border border-ink-200 p-4 text-center transition-all hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-[var(--shadow-soft)]"
              >
                <Avatar name={c.name} src={c.avatarUrl} size={48} />
                <div className="min-w-0">
                  <p className="flex items-center justify-center gap-1 truncate text-sm font-bold text-ink-900">
                    {c.company?.companyName}
                    <ShieldCheck size={12} className="shrink-0 text-brand-500" />
                  </p>
                  <p className="text-xs text-ink-400">{rewardCountByCompany.get(c.id) ?? 0} rewards</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search rewards or companies…" className="pl-10" />
        </div>
        <Select value={costFilter} onChange={(e) => setCostFilter(e.target.value as typeof costFilter)} className="sm:w-44">
          {COST_FILTERS.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </Select>
      </div>

      <div className="mb-5 flex gap-2 overflow-x-auto scrollbar-none pb-1">
        <FilterChip active={companyFilter === 'all'} onClick={() => setCompanyFilter('all')} label="All companies" />
        {companies.map((c) => (
          <FilterChip key={c.id} active={companyFilter === c.id} onClick={() => setCompanyFilter(c.id)} label={c.company?.companyName ?? c.name} />
        ))}
      </div>

      {rewardsQuery.isLoading ? (
        <PageLoader />
      ) : filtered.length === 0 ? (
        <EmptyState icon={<Gift size={20} />} title="No rewards found" description="Try a different search or filter, or check back soon." />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((r) => (
            <RewardCard
              key={r.id}
              reward={r}
              company={companyById.get(r.companyId)}
              balance={balanceByCompany.get(r.companyId) ?? 0}
              loggedIn={!!user}
              onRedeem={setSelected}
            />
          ))}
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

function FilterChip({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 rounded-full border px-3.5 py-2 text-xs font-semibold transition-colors ${
        active ? 'border-brand-500 bg-brand-500 text-white' : 'border-ink-200 bg-white text-ink-600 hover:border-brand-300'
      }`}
    >
      {label}
    </button>
  )
}

export function RedeemModal({ reward, onClose, onRedeemed }: { reward: Reward | null; onClose: () => void; onRedeemed: (msg: string) => void }) {
  const { user } = useAuth()
  const [error, setError] = useState('')
  const redeem = useRedeemReward(user?.id)
  if (!reward) return null

  const confirm = () => {
    setError('')
    redeem.mutate(reward.id, {
      onSuccess: (result) => onRedeemed(`Redeemed! Your code is ${result.code}.`),
      onError: (err) => setError(err instanceof Error ? err.message : 'Something went wrong.'),
    })
  }

  return (
    <Modal open={!!reward} onClose={onClose} title="Confirm redemption">
      <div className="space-y-4">
        <div className="flex items-center gap-3 rounded-2xl border border-ink-100 p-3">
          <SafeImage src={reward.imageUrl} alt="" className="h-14 w-14 rounded-xl object-cover" />
          <div>
            <p className="font-bold text-ink-900">{reward.title}</p>
            <p className="text-xs text-ink-500">{reward.costPoints} points</p>
          </div>
        </div>
        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-600">{error}</p>}
        <p className="text-xs text-ink-400">Points will be deducted immediately. This demo issues a redemption code instantly.</p>
        <Button className="w-full" disabled={redeem.isPending} onClick={confirm}>
          <Check size={16} /> {redeem.isPending ? 'Redeeming…' : 'Confirm redemption'}
        </Button>
      </div>
    </Modal>
  )
}
