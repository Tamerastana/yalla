import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Building2, Calendar, Pencil, Power, ShieldCheck, Trash2, Users } from 'lucide-react'
import { CATEGORY_META } from '../lib/categories'
import { formatEventDate } from '../lib/format'
import { useAuth } from '../context/AuthContext'
import { useDeleteEvent, useEvents } from '../hooks/useEvents'
import { useCompanies, usePlayers, useSetCompanyActive, useVerifyCompany } from '../hooks/useProfiles'
import { useActiveRewards, useDeleteReward } from '../hooks/useRewards'
import { Avatar } from '../components/ui/Avatar'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { PageLoader } from '../components/ui/Spinner'
import { SafeImage } from '../components/ui/SafeImage'
import { clsx } from 'clsx'

type Tab = 'companies' | 'events' | 'rewards'

export function AdminPanelPage() {
  const { user } = useAuth()
  const [tab, setTab] = useState<Tab>('companies')
  const companiesQuery = useCompanies()
  const eventsQuery = useEvents()
  const playersQuery = usePlayers()
  const rewardsQuery = useActiveRewards()

  if (!user || user.role !== 'super_admin') return null
  if (companiesQuery.isLoading || eventsQuery.isLoading || playersQuery.isLoading) return <PageLoader />

  const companies = companiesQuery.data ?? []
  const allEvents = eventsQuery.data ?? []
  const players = playersQuery.data ?? []
  const rewards = rewardsQuery.data ?? []

  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: 'companies', label: 'Companies', count: companies.length },
    { id: 'events', label: 'Events', count: allEvents.length },
    { id: 'rewards', label: 'Rewards', count: rewards.length },
  ]

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <h1 className="flex items-center gap-2 text-2xl font-extrabold text-ink-900">
        <ShieldCheck className="text-brand-500" /> Yalla Admin
      </h1>
      <p className="mt-1 text-sm text-ink-500">Verify or deactivate companies, and moderate any event or reward on the platform.</p>

      <div className="mt-6 grid grid-cols-3 gap-3">
        <StatCard icon={<Users size={16} />} label="Players" value={players.length} />
        <StatCard icon={<Building2 size={16} />} label="Companies" value={companies.length} />
        <StatCard icon={<Calendar size={16} />} label="Events" value={allEvents.length} />
      </div>

      <div className="mt-6 flex gap-1.5">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={clsx(
              'flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-colors',
              tab === t.id ? 'bg-ink-900 text-white' : 'bg-ink-100 text-ink-500 hover:bg-ink-200',
            )}
          >
            {t.label} <span className="opacity-70">({t.count})</span>
          </button>
        ))}
      </div>

      <div className="mt-5">
        {tab === 'companies' && <CompaniesTab companies={companies} />}
        {tab === 'events' && <EventsTab events={allEvents} />}
        {tab === 'rewards' && <RewardsTab rewards={rewards} />}
      </div>
    </div>
  )
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 text-brand-500">{icon}</div>
      <p className="mt-2 text-xl font-extrabold text-ink-900">{value}</p>
      <p className="text-xs font-medium text-ink-400">{label}</p>
    </Card>
  )
}

function CompaniesTab({ companies }: { companies: ReturnType<typeof useCompanies>['data'] }) {
  const verifyCompany = useVerifyCompany()
  const setCompanyActive = useSetCompanyActive()

  return (
    <div className="space-y-2.5">
      {(companies ?? []).map((c) => (
        <Card key={c.id} className="flex flex-wrap items-center justify-between gap-3 p-3.5">
          <div className="flex items-center gap-3">
            <Avatar name={c.name} src={c.avatarUrl} size={38} />
            <div>
              <p className="flex items-center gap-1.5 text-sm font-bold text-ink-900">
                {c.company?.companyName}
                {c.company?.verified && <ShieldCheck size={14} className="text-brand-500" />}
                {c.company?.active === false && <Badge tone="warning">Deactivated</Badge>}
              </p>
              <p className="text-xs text-ink-500">
                {c.company?.industry} &middot; {c.email ?? c.phone}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {c.company?.verified ? (
              <Badge tone="success">Verified</Badge>
            ) : (
              <Button size="sm" disabled={verifyCompany.isPending} onClick={() => verifyCompany.mutate(c.id)}>
                Verify company
              </Button>
            )}
            <Button
              size="sm"
              variant={c.company?.active === false ? 'outline' : 'danger'}
              disabled={setCompanyActive.isPending}
              onClick={() => setCompanyActive.mutate({ companyId: c.id, active: c.company?.active === false })}
            >
              <Power size={13} /> {c.company?.active === false ? 'Reactivate' : 'Deactivate'}
            </Button>
          </div>
        </Card>
      ))}
    </div>
  )
}

function EventsTab({ events }: { events: ReturnType<typeof useEvents>['data'] }) {
  const deleteEvent = useDeleteEvent()

  const handleDelete = (id: string, title: string) => {
    if (!window.confirm(`Delete "${title}" permanently? This cannot be undone.`)) return
    deleteEvent.mutate(id)
  }

  return (
    <div className="space-y-2.5">
      {(events ?? []).map((e) => {
        const meta = CATEGORY_META[e.category]
        return (
          <Card key={e.id} className="flex items-center gap-3 p-3">
            <Link to={`/events/${e.id}`} className="flex min-w-0 flex-1 items-center gap-3">
              <SafeImage src={e.imageUrl} alt="" className="h-12 w-12 shrink-0 rounded-xl object-cover" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-ink-900">{e.title}</p>
                <p className="flex items-center gap-1 text-xs text-ink-500">
                  <meta.icon size={12} /> {formatEventDate(e.startsAt)}
                </p>
              </div>
            </Link>
            <Badge tone={e.type === 'official' ? 'brand' : 'neutral'}>{e.type === 'official' ? 'Official' : 'Community'}</Badge>
            <div className="flex shrink-0 gap-1">
              <Link
                to={`/events/${e.id}/edit`}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-400 hover:bg-ink-100 hover:text-ink-700"
                aria-label="Edit event"
              >
                <Pencil size={15} />
              </Link>
              <button
                onClick={() => handleDelete(e.id, e.title)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-400 hover:bg-red-50 hover:text-red-600"
                aria-label="Delete event"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </Card>
        )
      })}
    </div>
  )
}

function RewardsTab({ rewards }: { rewards: ReturnType<typeof useActiveRewards>['data'] }) {
  const deleteReward = useDeleteReward('')

  const handleDelete = (id: string, title: string) => {
    if (!window.confirm(`Remove "${title}" permanently? This cannot be undone.`)) return
    deleteReward.mutate(id)
  }

  if ((rewards ?? []).length === 0) {
    return <p className="text-sm text-ink-500">No active rewards on the platform right now.</p>
  }

  return (
    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
      {(rewards ?? []).map((r) => (
        <Card key={r.id} className="flex items-center gap-3 p-3">
          <SafeImage src={r.imageUrl} alt="" className="h-12 w-12 shrink-0 rounded-xl object-cover" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-ink-900">{r.title}</p>
            <p className="text-xs text-ink-500">
              {r.costPoints} pts &middot; {r.stock} left
            </p>
          </div>
          <button
            onClick={() => handleDelete(r.id, r.title)}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-ink-400 hover:bg-red-50 hover:text-red-600"
            aria-label="Remove reward"
          >
            <Trash2 size={15} />
          </button>
        </Card>
      ))}
    </div>
  )
}
