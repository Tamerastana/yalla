import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AlertTriangle, Award, Check, Gift, Pencil, Plus, ShieldCheck, Ticket, Trash2, Users } from 'lucide-react'
import { CATEGORY_META } from '../lib/categories'
import { formatEventDate } from '../lib/format'
import { useAuth } from '../context/AuthContext'
import { useDeleteEvent, useEventsByHost } from '../hooks/useEvents'
import { useAllRegistrations } from '../hooks/useRegistrations'
import { useCompanyRewards, useCreateReward, useDeleteReward, useUpdateReward } from '../hooks/useRewards'
import { useFulfillRedemptionCode } from '../hooks/usePoints'
import { useUsersByIds } from '../hooks/useProfiles'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { EmptyState } from '../components/ui/EmptyState'
import { FieldError, Input, Label, Textarea } from '../components/ui/Input'
import { Modal } from '../components/ui/Modal'
import { PageLoader } from '../components/ui/Spinner'
import { SafeImage } from '../components/ui/SafeImage'
import type { Reward } from '../types'

export function CompanyDashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [rewardModal, setRewardModal] = useState<'new' | Reward | null>(null)

  const eventsQuery = useEventsByHost(user?.id)
  const registrationsQuery = useAllRegistrations()
  const rewardsQuery = useCompanyRewards(user?.id)
  const deleteEvent = useDeleteEvent()
  const deleteReward = useDeleteReward(user?.id ?? '')

  if (!user || user.role !== 'company') return null
  if (eventsQuery.isLoading || registrationsQuery.isLoading) return <PageLoader />

  const events = [...(eventsQuery.data ?? [])].sort((a, b) => +new Date(b.startsAt) - +new Date(a.startsAt))
  const eventIds = new Set(events.map((e) => e.id))
  const registrations = (registrationsQuery.data ?? []).filter((r) => eventIds.has(r.eventId))
  const rewards = rewardsQuery.data ?? []

  const totalPointsIssued = registrations.filter((r) => r.status === 'attended').reduce((s, r) => s + (r.pointsAwarded ?? 0), 0)
  const totalAttendees = registrations.length

  const handleDeleteEvent = (id: string, title: string) => {
    if (!window.confirm(`Delete "${title}" permanently? This cannot be undone.`)) return
    deleteEvent.mutate(id)
  }

  const handleDeleteReward = (id: string, title: string) => {
    if (!window.confirm(`Delete "${title}" permanently? This cannot be undone.`)) return
    deleteReward.mutate(id)
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-ink-900">Company hub</h1>
          <p className="mt-1 text-sm text-ink-500">{user.company?.companyName}</p>
        </div>
        <Link to="/create">
          <Button>
            <Plus size={16} /> New event
          </Button>
        </Link>
      </div>

      {!user.company?.verified && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <AlertTriangle size={18} className="mt-0.5 shrink-0 text-amber-600" />
          <div>
            <p className="text-sm font-bold text-amber-800">Verification pending</p>
            <p className="text-xs text-amber-700">
              Your account can host community events now. Once a Yalla admin verifies your business, you'll be able to
              run official events that award points and appear with a verified badge.
            </p>
          </div>
        </div>
      )}

      {user.company?.active === false && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4">
          <AlertTriangle size={18} className="mt-0.5 shrink-0 text-red-600" />
          <div>
            <p className="text-sm font-bold text-red-800">Account deactivated</p>
            <p className="text-xs text-red-700">
              A Yalla admin has deactivated this company. You can't create new official events or rewards until it's
              reactivated. Your past events and history stay visible.
            </p>
          </div>
        </div>
      )}

      <div className="mb-6 grid grid-cols-3 gap-3">
        <StatCard icon={<Users size={16} />} label="Total registrations" value={totalAttendees} />
        <StatCard icon={<Award size={16} />} label="Points issued" value={totalPointsIssued} />
        <StatCard icon={<ShieldCheck size={16} />} label="Events hosted" value={events.length} />
      </div>

      <div className="mb-8">
        <h2 className="mb-3 font-bold text-ink-900">Your events</h2>
        {events.length === 0 ? (
          <EmptyState icon={<ShieldCheck size={20} />} title="No events yet" description="Create your first event to start engaging your community." />
        ) : (
          <div className="space-y-2.5">
            {events.map((e) => {
              const meta = CATEGORY_META[e.category]
              const regs = registrations.filter((r) => r.eventId === e.id)
              return (
                <Card key={e.id} className="flex items-center gap-3 p-3">
                  <Link to={`/events/${e.id}`} className="flex min-w-0 flex-1 items-center gap-3">
                    <SafeImage src={e.imageUrl} alt="" className="h-14 w-14 shrink-0 rounded-xl object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-ink-900">{e.title}</p>
                      <p className="flex items-center gap-1 text-xs text-ink-500">
                        <meta.icon size={12} /> {formatEventDate(e.startsAt)} &middot; {regs.length} registered
                      </p>
                    </div>
                  </Link>
                  <Badge tone={e.type === 'official' ? 'brand' : 'neutral'}>{e.type === 'official' ? 'Official' : 'Community'}</Badge>
                  <div className="flex shrink-0 gap-1">
                    <button
                      onClick={() => navigate(`/events/${e.id}/edit`)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-400 hover:bg-ink-100 hover:text-ink-700"
                      aria-label="Edit event"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => handleDeleteEvent(e.id, e.title)}
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
        )}
      </div>

      <div className="mb-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-bold text-ink-900">Rewards catalogue</h2>
          <Button size="sm" variant="outline" onClick={() => setRewardModal('new')} disabled={!user.company?.verified || user.company?.active === false}>
            <Gift size={14} /> Add reward
          </Button>
        </div>
        {!user.company?.verified ? (
          <p className="text-sm text-ink-500">Available once your company is verified.</p>
        ) : rewards.length === 0 ? (
          <EmptyState icon={<Gift size={20} />} title="No rewards yet" description="Add a reward for players to redeem their points against." />
        ) : (
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {rewards.map((r) => (
              <Card key={r.id} className="flex items-center gap-3 p-3">
                <SafeImage src={r.imageUrl} alt="" className="h-12 w-12 shrink-0 rounded-xl object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-ink-900">{r.title}</p>
                  <p className="text-xs text-ink-500">
                    {r.costPoints} pts &middot; {r.stock} left
                  </p>
                </div>
                <Badge tone={r.active ? 'success' : 'neutral'}>{r.active ? 'Active' : 'Paused'}</Badge>
                <div className="flex shrink-0 gap-1">
                  <button
                    onClick={() => setRewardModal(r)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-400 hover:bg-ink-100 hover:text-ink-700"
                    aria-label="Edit reward"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    onClick={() => handleDeleteReward(r.id, r.title)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-400 hover:bg-red-50 hover:text-red-600"
                    aria-label="Delete reward"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <RedeemCodePanel />

      <RewardFormModal open={rewardModal !== null} onClose={() => setRewardModal(null)} companyId={user.id} reward={rewardModal === 'new' ? null : rewardModal} />
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

function RewardFormModal({
  open,
  onClose,
  companyId,
  reward,
}: {
  open: boolean
  onClose: () => void
  companyId: string
  reward: Reward | null
}) {
  const isEditing = !!reward
  const [title, setTitle] = useState(reward?.title ?? '')
  const [description, setDescription] = useState(reward?.description ?? '')
  const [costPoints, setCostPoints] = useState(reward?.costPoints ?? 50)
  const [stock, setStock] = useState(reward?.stock ?? 20)
  const [active, setActive] = useState(reward?.active ?? true)
  const [imageUrl, setImageUrl] = useState(reward?.imageUrl ?? 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800&auto=format&fit=crop')
  const [error, setError] = useState('')
  const createReward = useCreateReward()
  const updateReward = useUpdateReward(reward?.id ?? '', companyId)

  // Reset local state whenever a different reward (or "new") opens in the modal.
  const [openedFor, setOpenedFor] = useState(reward?.id ?? 'new')
  if (open && (reward?.id ?? 'new') !== openedFor) {
    setOpenedFor(reward?.id ?? 'new')
    setTitle(reward?.title ?? '')
    setDescription(reward?.description ?? '')
    setCostPoints(reward?.costPoints ?? 50)
    setStock(reward?.stock ?? 20)
    setActive(reward?.active ?? true)
    setImageUrl(reward?.imageUrl ?? 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800&auto=format&fit=crop')
  }

  const submit = (e: FormEvent) => {
    e.preventDefault()
    setError('')
    if (isEditing) {
      updateReward.mutate(
        { title, description, costPoints, stock, active, imageUrl },
        { onSuccess: onClose, onError: (err) => setError(err instanceof Error ? err.message : 'Something went wrong.') },
      )
    } else {
      createReward.mutate(
        { companyId, title, description, costPoints, stock, imageUrl, active: true },
        { onSuccess: onClose, onError: (err) => setError(err instanceof Error ? err.message : 'Something went wrong.') },
      )
    }
  }

  const isPending = createReward.isPending || updateReward.isPending

  return (
    <Modal open={open} onClose={onClose} title={isEditing ? 'Edit reward' : 'Add a reward'}>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <Label htmlFor="r-title">Title</Label>
          <Input id="r-title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>
        <div>
          <Label htmlFor="r-desc">Description</Label>
          <Textarea id="r-desc" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} required />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="r-cost">Cost (points)</Label>
            <Input id="r-cost" type="number" min={1} value={costPoints} onChange={(e) => setCostPoints(Number(e.target.value))} required />
          </div>
          <div>
            <Label htmlFor="r-stock">Stock</Label>
            <Input id="r-stock" type="number" min={0} value={stock} onChange={(e) => setStock(Number(e.target.value))} required />
          </div>
        </div>
        <div>
          <Label htmlFor="r-image">Image URL</Label>
          <Input id="r-image" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
        </div>
        {isEditing && (
          <label className="flex items-center gap-2 text-sm text-ink-600">
            <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} className="h-4 w-4 rounded accent-brand-500" />
            Active (visible and redeemable on the Rewards page)
          </label>
        )}
        <FieldError>{error}</FieldError>
        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? 'Saving…' : isEditing ? 'Save changes' : 'Publish reward'}
        </Button>
      </form>
    </Modal>
  )
}

function RedeemCodePanel() {
  const [code, setCode] = useState('')
  const [result, setResult] = useState<{ userId: string; pointsSpent: number } | null>(null)
  const [error, setError] = useState('')
  const fulfill = useFulfillRedemptionCode()
  const userQuery = useUsersByIds(result ? [result.userId] : [])
  const redeemer = userQuery.data?.[0]

  const submit = (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setResult(null)
    fulfill.mutate(code.trim(), {
      onSuccess: (r) => {
        setResult({ userId: r.userId, pointsSpent: r.pointsSpent })
        setCode('')
      },
      onError: (err) => setError(err instanceof Error ? err.message : 'Something went wrong.'),
    })
  }

  return (
    <div>
      <h2 className="mb-3 flex items-center gap-2 font-bold text-ink-900">
        <Ticket size={18} className="text-brand-500" /> Redeem a code
      </h2>
      <Card className="p-5">
        <p className="mb-4 text-sm text-ink-500">
          When a customer shows you their reward code in person, enter it here to hand over the reward and mark it
          used. Each code only works once, and only for your company's own rewards.
        </p>
        <form onSubmit={submit} className="flex flex-col gap-3 sm:flex-row">
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="YALLA-XXXXXXXX"
            className="flex-1 font-mono uppercase"
            required
          />
          <Button type="submit" disabled={fulfill.isPending}>
            {fulfill.isPending ? 'Checking…' : 'Redeem'}
          </Button>
        </form>
        <FieldError>{error}</FieldError>
        {result && (
          <div className="mt-4 flex items-center gap-2.5 rounded-xl bg-emerald-50 px-4 py-3">
            <Check size={18} className="shrink-0 text-emerald-600" />
            <p className="text-sm font-semibold text-emerald-700">
              Redeemed for {redeemer?.name ?? 'this player'} &middot; {result.pointsSpent} pts
            </p>
          </div>
        )}
      </Card>
    </div>
  )
}
