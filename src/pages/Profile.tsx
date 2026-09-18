import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Award,
  Calendar,
  Check,
  Gift,
  History,
  MapPin,
  Pencil,
  Ticket,
  Trophy,
  UserPlus,
  Users,
  X,
} from 'lucide-react'
import { clsx } from 'clsx'
import { CATEGORY_META, EMIRATES } from '../lib/categories'
import { formatEventDate } from '../lib/format'
import * as repo from '../lib/repo'
import { useDbVersion } from '../lib/useDb'
import { useAuth } from '../context/AuthContext'
import { Avatar } from '../components/ui/Avatar'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { EmptyState } from '../components/ui/EmptyState'
import { Input, Label, Select, Textarea } from '../components/ui/Input'
import { Modal } from '../components/ui/Modal'
import { SafeImage } from '../components/ui/SafeImage'
import type { Emirate, User } from '../types'

type Tab = 'upcoming' | 'history' | 'friends' | 'points'

export function ProfilePage() {
  useDbVersion()
  const { user } = useAuth()
  const [tab, setTab] = useState<Tab>('upcoming')
  const [editOpen, setEditOpen] = useState(false)

  if (!user) return null

  const myRegs = repo.registrationsForUser(user.id)
  const now = Date.now()
  const upcoming = myRegs
    .filter((r) => r.status !== 'cancelled' && repo.getEvent(r.eventId) && +new Date(repo.getEvent(r.eventId)!.startsAt) >= now)
    .map((r) => repo.getEvent(r.eventId)!)
    .sort((a, b) => +new Date(a.startsAt) - +new Date(b.startsAt))

  const attended = myRegs.filter((r) => r.status === 'attended').map((r) => repo.getEvent(r.eventId)).filter((e): e is NonNullable<typeof e> => !!e)
  const created = repo.eventsByHost(user.id)
  const friendIds = repo.friendIdsOf(user.id)
  const totalPoints = repo.pointsBalancesByCompany(user.id).reduce((s, b) => s + b.balance, 0)

  const tabs: { id: Tab; label: string; icon: React.ReactNode; count?: number }[] = [
    { id: 'upcoming', label: 'Upcoming', icon: <Calendar size={14} />, count: upcoming.length },
    { id: 'history', label: 'History', icon: <History size={14} />, count: attended.length + created.length },
    { id: 'friends', label: 'Friends', icon: <Users size={14} />, count: friendIds.length },
    { id: 'points', label: 'Points & rewards', icon: <Trophy size={14} /> },
  ]

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <Card className="overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-brand-400 to-brand-600 sm:h-28" />
        <div className="px-5 pb-5 sm:px-6">
          <div className="-mt-10 flex items-end justify-between">
            <Avatar name={user.name} src={user.avatarUrl} size={80} className="ring-4 ring-white" />
            <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
              <Pencil size={14} /> Edit profile
            </Button>
          </div>
          <div className="mt-3">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-ink-900">{user.name}</h1>
              {user.role === 'company' && (
                <Badge tone={user.company?.verified ? 'brand' : 'neutral'}>
                  {user.company?.verified ? 'Verified company' : 'Unverified company'}
                </Badge>
              )}
              {user.role === 'super_admin' && <Badge tone="warning">Yalla admin</Badge>}
            </div>
            {user.bio && <p className="mt-1 max-w-xl text-sm text-ink-600">{user.bio}</p>}
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs font-medium text-ink-400">
              {user.city && (
                <span className="flex items-center gap-1">
                  <MapPin size={12} /> {user.city}
                </span>
              )}
              <span>{user.email ?? user.phone}</span>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-4 gap-2 border-t border-ink-100 pt-4 text-center">
            <Stat label="Attended" value={attended.length} />
            <Stat label="Hosted" value={created.length} />
            <Stat label="Friends" value={friendIds.length} />
            <Stat label="Points" value={totalPoints} />
          </div>
        </div>
      </Card>

      <div className="mt-6 flex gap-1.5 overflow-x-auto scrollbar-none">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={clsx(
              'flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-colors',
              tab === t.id ? 'bg-ink-900 text-white' : 'bg-ink-100 text-ink-500 hover:bg-ink-200',
            )}
          >
            {t.icon} {t.label} {t.count !== undefined && <span className="opacity-70">({t.count})</span>}
          </button>
        ))}
      </div>

      <div className="mt-5">
        {tab === 'upcoming' && <UpcomingTab events={upcoming} />}
        {tab === 'history' && <HistoryTab attended={attended} created={created} />}
        {tab === 'friends' && <FriendsTab userId={user.id} />}
        {tab === 'points' && <PointsTab userId={user.id} />}
      </div>

      <EditProfileModal open={editOpen} onClose={() => setEditOpen(false)} user={user} />
    </div>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="text-lg font-extrabold text-ink-900">{value}</p>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-400">{label}</p>
    </div>
  )
}

function UpcomingTab({ events }: { events: ReturnType<typeof repo.listEvents> }) {
  if (events.length === 0) {
    return (
      <EmptyState
        icon={<Calendar size={20} />}
        title="No upcoming events"
        description="Browse Discover to find your next game."
        action={
          <Link to="/">
            <Button>Discover events</Button>
          </Link>
        }
      />
    )
  }
  return (
    <div className="space-y-2.5">
      {events.map((e) => (
        <EventRow key={e.id} event={e} />
      ))}
    </div>
  )
}

function HistoryTab({ attended, created }: { attended: ReturnType<typeof repo.listEvents>; created: ReturnType<typeof repo.listEvents> }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-2 text-sm font-bold text-ink-900">Events you attended</h3>
        {attended.length === 0 ? (
          <p className="text-sm text-ink-500">No attended events yet.</p>
        ) : (
          <div className="space-y-2.5">
            {attended.map((e) => (
              <EventRow key={e.id} event={e} trailing={<Badge tone="success"><Check size={12} /> Attended</Badge>} />
            ))}
          </div>
        )}
      </div>
      <div>
        <h3 className="mb-2 text-sm font-bold text-ink-900">Events you created</h3>
        {created.length === 0 ? (
          <p className="text-sm text-ink-500">You haven't hosted an event yet.</p>
        ) : (
          <div className="space-y-2.5">
            {created.map((e) => (
              <EventRow key={e.id} event={e} trailing={<Badge tone={e.type === 'official' ? 'brand' : 'neutral'}>{e.type === 'official' ? 'Official' : 'Community'}</Badge>} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function EventRow({ event, trailing }: { event: NonNullable<ReturnType<typeof repo.getEvent>>; trailing?: React.ReactNode }) {
  const meta = CATEGORY_META[event.category]
  return (
    <Link to={`/events/${event.id}`} className="flex items-center gap-3 rounded-2xl border border-ink-200 p-3 hover:border-brand-300">
      <SafeImage src={event.imageUrl} alt="" className="h-14 w-14 shrink-0 rounded-xl object-cover" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-ink-900">{event.title}</p>
        <p className="flex items-center gap-1 text-xs text-ink-500">
          <meta.icon size={12} /> {formatEventDate(event.startsAt)} &middot; {event.location.name}
        </p>
      </div>
      {trailing}
    </Link>
  )
}

function FriendsTab({ userId }: { userId: string }) {
  const [query, setQuery] = useState('')
  const friendIds = repo.friendIdsOf(userId)
  const friends = friendIds.map((id) => repo.getUser(id)).filter((u): u is User => !!u)
  const pending = repo.pendingRequestsFor(userId)
  const results = query.trim() ? repo.searchUsers(query, userId) : []

  return (
    <div className="space-y-6">
      <div>
        <Label>Find friends</Label>
        <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name or email..." />
        {results.length > 0 && (
          <div className="mt-2 space-y-1.5">
            {results.map((r) => {
              const already = friendIds.includes(r.id)
              const pendingOut = repo.friendshipsForUser(userId).find((f) => (f.requesterId === userId && f.addresseeId === r.id) || (f.addresseeId === userId && f.requesterId === r.id))
              return (
                <div key={r.id} className="flex items-center justify-between rounded-xl border border-ink-100 p-2.5">
                  <div className="flex items-center gap-2.5">
                    <Avatar name={r.name} src={r.avatarUrl} size={32} />
                    <span className="text-sm font-semibold text-ink-800">{r.name}</span>
                  </div>
                  {already ? (
                    <Badge tone="success">Friends</Badge>
                  ) : pendingOut ? (
                    <Badge tone="neutral">Pending</Badge>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => repo.sendFriendRequest(userId, r.id)}>
                      <UserPlus size={13} /> Add
                    </Button>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {pending.length > 0 && (
        <div>
          <h3 className="mb-2 text-sm font-bold text-ink-900">Friend requests</h3>
          <div className="space-y-2">
            {pending.map((f) => {
              const requester = repo.getUser(f.requesterId)
              if (!requester) return null
              return (
                <div key={f.id} className="flex items-center justify-between rounded-xl border border-ink-100 p-2.5">
                  <div className="flex items-center gap-2.5">
                    <Avatar name={requester.name} src={requester.avatarUrl} size={32} />
                    <span className="text-sm font-semibold text-ink-800">{requester.name}</span>
                  </div>
                  <div className="flex gap-1.5">
                    <Button size="sm" onClick={() => repo.respondToFriendRequest(f.id, true)}>
                      <Check size={13} />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => repo.respondToFriendRequest(f.id, false)}>
                      <X size={13} />
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div>
        <h3 className="mb-2 text-sm font-bold text-ink-900">Your friends ({friends.length})</h3>
        {friends.length === 0 ? (
          <p className="text-sm text-ink-500">No friends yet &mdash; search above to add some.</p>
        ) : (
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            {friends.map((f) => (
              <div key={f.id} className="flex items-center gap-2.5 rounded-xl border border-ink-100 p-2.5">
                <Avatar name={f.name} src={f.avatarUrl} size={32} />
                <span className="truncate text-sm font-semibold text-ink-800">{f.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function PointsTab({ userId }: { userId: string }) {
  const balances = repo.pointsBalancesByCompany(userId)
  const history = repo.pointsHistoryForUser(userId)
  const redemptions = repo.redemptionsForUser(userId)

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
            {redemptions.map((r) => (
              <Card key={r.id} className="flex items-center justify-between p-3.5">
                <div className="flex items-center gap-2.5">
                  <Ticket size={16} className="text-brand-500" />
                  <div>
                    <p className="text-sm font-semibold text-ink-800">{r.code}</p>
                    <p className="text-xs text-ink-400">{formatEventDate(r.redeemedAt)}</p>
                  </div>
                </div>
                <Badge tone={r.status === 'used' ? 'neutral' : 'success'}>{r.status === 'used' ? 'Used' : 'Ready to use'}</Badge>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="mb-2 text-sm font-bold text-ink-900">Activity</h3>
        <div className="divide-y divide-ink-100 rounded-2xl border border-ink-100">
          {history.length === 0 && <p className="p-3.5 text-sm text-ink-500">No activity yet.</p>}
          {history.map((h) => (
            <div key={h.id} className="flex items-center justify-between p-3.5">
              <div>
                <p className="text-sm font-medium text-ink-700">{h.note}</p>
                <p className="text-xs text-ink-400">{formatEventDate(h.createdAt)}</p>
              </div>
              <span className={clsx('font-bold', h.kind === 'earned' ? 'text-emerald-600' : 'text-ink-500')}>
                {h.kind === 'earned' ? '+' : '-'}
                {h.points}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function EditProfileModal({ open, onClose, user }: { open: boolean; onClose: () => void; user: User }) {
  const [name, setName] = useState(user.name)
  const [bio, setBio] = useState(user.bio ?? '')
  const [city, setCity] = useState<Emirate | ''>(user.city ?? '')
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl ?? '')

  const save = () => {
    repo.updateProfile(user.id, { name, bio, city: city || undefined, avatarUrl: avatarUrl || undefined })
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="Edit profile">
      <div className="space-y-4">
        <div>
          <Label htmlFor="edit-name">Name</Label>
          <Input id="edit-name" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="edit-bio">Bio</Label>
          <Textarea id="edit-bio" rows={3} value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell people what you play..." />
        </div>
        <div>
          <Label htmlFor="edit-city">City</Label>
          <Select id="edit-city" value={city} onChange={(e) => setCity(e.target.value as Emirate)}>
            <option value="">Select emirate</option>
            {EMIRATES.map((em) => (
              <option key={em} value={em}>
                {em}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="edit-avatar">Avatar URL</Label>
          <Input id="edit-avatar" value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} placeholder="https://..." />
        </div>
        <Button className="w-full" onClick={save}>
          Save changes
        </Button>
      </div>
    </Modal>
  )
}
