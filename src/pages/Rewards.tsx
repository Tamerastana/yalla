import { useMemo, useState } from 'react'
import { Award, Check, Gift, ShieldCheck } from 'lucide-react'
import * as repo from '../lib/repo'
import { useDbVersion } from '../lib/useDb'
import { useAuth } from '../context/AuthContext'
import { Avatar } from '../components/ui/Avatar'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { EmptyState } from '../components/ui/EmptyState'
import { Modal } from '../components/ui/Modal'
import { SafeImage } from '../components/ui/SafeImage'
import type { Reward } from '../types'

export function RewardsPage() {
  useDbVersion()
  const { user } = useAuth()
  const rewards = repo.activeRewards()
  const companies = repo.allCompanies().filter((c) => c.company?.verified)
  const [companyFilter, setCompanyFilter] = useState<string | 'all'>('all')
  const [selected, setSelected] = useState<Reward | null>(null)
  const [toast, setToast] = useState('')

  const filtered = useMemo(
    () => (companyFilter === 'all' ? rewards : rewards.filter((r) => r.companyId === companyFilter)),
    [rewards, companyFilter],
  )

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

      <div className="mb-5 flex gap-2 overflow-x-auto scrollbar-none pb-1">
        <FilterChip active={companyFilter === 'all'} onClick={() => setCompanyFilter('all')} label="All companies" />
        {companies.map((c) => (
          <FilterChip key={c.id} active={companyFilter === c.id} onClick={() => setCompanyFilter(c.id)} label={c.company?.companyName ?? c.name} />
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={<Gift size={20} />} title="No rewards available" description="Check back soon &mdash; companies add new rewards regularly." />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((r) => {
            const company = repo.getUser(r.companyId)
            const balance = user ? repo.pointsBalance(user.id, r.companyId) : 0
            const canAfford = balance >= r.costPoints
            return (
              <Card key={r.id} className="flex flex-col overflow-hidden">
                <div className="aspect-[16/10] w-full overflow-hidden bg-ink-100">
                  <SafeImage src={r.imageUrl} alt={r.title} className="h-full w-full object-cover" />
                </div>
                <div className="flex flex-1 flex-col gap-2.5 p-4">
                  <div className="flex items-center gap-1.5">
                    <Avatar name={company?.name ?? 'Company'} src={company?.avatarUrl} size={18} />
                    <span className="truncate text-xs font-semibold text-ink-500">{company?.company?.companyName}</span>
                    <ShieldCheck size={12} className="text-brand-500" />
                  </div>
                  <h3 className="font-bold text-ink-900">{r.title}</h3>
                  <p className="line-clamp-2 text-xs text-ink-500">{r.description}</p>
                  <div className="mt-auto flex items-center justify-between pt-2">
                    <Badge tone="brand">
                      <Award size={12} /> {r.costPoints} pts
                    </Badge>
                    {user && (
                      <span className="text-xs font-medium text-ink-400">
                        You have {balance} pt{balance === 1 ? '' : 's'}
                      </span>
                    )}
                  </div>
                  <Button className="w-full" disabled={!user || !canAfford} onClick={() => setSelected(r)}>
                    {!user ? 'Log in to redeem' : canAfford ? 'Redeem' : 'Not enough points'}
                  </Button>
                </div>
              </Card>
            )
          })}
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

function RedeemModal({ reward, onClose, onRedeemed }: { reward: Reward | null; onClose: () => void; onRedeemed: (msg: string) => void }) {
  const { user } = useAuth()
  const [error, setError] = useState('')
  if (!reward) return null

  const confirm = () => {
    if (!user) return
    const result = repo.redeemReward(user.id, reward.id)
    if ('error' in result) return setError(result.error)
    onRedeemed(`Redeemed! Your code is ${result.redemption.code}.`)
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
        <Button className="w-full" onClick={confirm}>
          <Check size={16} /> Confirm redemption
        </Button>
      </div>
    </Modal>
  )
}
