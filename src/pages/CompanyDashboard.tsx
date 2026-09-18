import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, Award, Gift, Plus, ShieldCheck, Users } from 'lucide-react'
import { CATEGORY_META } from '../lib/categories'
import { formatEventDate } from '../lib/format'
import * as repo from '../lib/repo'
import { useDbVersion } from '../lib/useDb'
import { useAuth } from '../context/AuthContext'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { EmptyState } from '../components/ui/EmptyState'
import { Input, Label, Textarea } from '../components/ui/Input'
import { Modal } from '../components/ui/Modal'
import { SafeImage } from '../components/ui/SafeImage'

export function CompanyDashboardPage() {
  useDbVersion()
  const { user } = useAuth()
  const [rewardModal, setRewardModal] = useState(false)
  if (!user || user.role !== 'company') return null

  const events = repo.eventsByHost(user.id).sort((a, b) => +new Date(b.startsAt) - +new Date(a.startsAt))
  const rewards = repo.rewardsByCompany(user.id)
  const totalPointsIssued = events.reduce((sum, e) => sum + repo.registrationsForEvent(e.id).filter((r) => r.status === 'attended').reduce((s, r) => s + (r.pointsAwarded ?? 0), 0), 0)
  const totalAttendees = events.reduce((sum, e) => sum + repo.registrationsForEvent(e.id).length, 0)

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
              const regs = repo.registrationsForEvent(e.id)
              return (
                <Link key={e.id} to={`/events/${e.id}`} className="flex items-center gap-3 rounded-2xl border border-ink-200 p-3 hover:border-brand-300">
                  <SafeImage src={e.imageUrl} alt="" className="h-14 w-14 shrink-0 rounded-xl object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-ink-900">{e.title}</p>
                    <p className="flex items-center gap-1 text-xs text-ink-500">
                      <meta.icon size={12} /> {formatEventDate(e.startsAt)} &middot; {regs.length} registered
                    </p>
                  </div>
                  <Badge tone={e.type === 'official' ? 'brand' : 'neutral'}>{e.type === 'official' ? 'Official' : 'Community'}</Badge>
                </Link>
              )
            })}
          </div>
        )}
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-bold text-ink-900">Rewards catalogue</h2>
          <Button size="sm" variant="outline" onClick={() => setRewardModal(true)} disabled={!user.company?.verified}>
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
                <SafeImage src={r.imageUrl} alt="" className="h-12 w-12 rounded-xl object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-ink-900">{r.title}</p>
                  <p className="text-xs text-ink-500">
                    {r.costPoints} pts &middot; {r.stock} left
                  </p>
                </div>
                <Badge tone={r.active ? 'success' : 'neutral'}>{r.active ? 'Active' : 'Paused'}</Badge>
              </Card>
            ))}
          </div>
        )}
      </div>

      <AddRewardModal open={rewardModal} onClose={() => setRewardModal(false)} companyId={user.id} />
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

function AddRewardModal({ open, onClose, companyId }: { open: boolean; onClose: () => void; companyId: string }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [costPoints, setCostPoints] = useState(50)
  const [stock, setStock] = useState(20)
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800&auto=format&fit=crop')

  const submit = (e: FormEvent) => {
    e.preventDefault()
    repo.createReward({ companyId, title, description, costPoints, stock, imageUrl, active: true })
    setTitle('')
    setDescription('')
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="Add a reward">
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
            <Input id="r-stock" type="number" min={1} value={stock} onChange={(e) => setStock(Number(e.target.value))} required />
          </div>
        </div>
        <div>
          <Label htmlFor="r-image">Image URL</Label>
          <Input id="r-image" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
        </div>
        <Button type="submit" className="w-full">
          Publish reward
        </Button>
      </form>
    </Modal>
  )
}
