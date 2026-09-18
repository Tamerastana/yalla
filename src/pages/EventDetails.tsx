import { useMemo, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import {
  Award,
  Calendar,
  Check,
  Clock,
  MapPin,
  Share2,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react'
import { CATEGORY_META } from '../lib/categories'
import { formatAED, formatEventDate, formatEventTime } from '../lib/format'
import { useAuth } from '../context/AuthContext'
import { useEvent, usePromoteEvent } from '../hooks/useEvents'
import { useEventRegistrations, useMarkAttended, useMyRegistration, useRegisterForEvent, useCancelRegistration } from '../hooks/useRegistrations'
import { useFriendships } from '../hooks/useFriendships'
import { useUsersByIds } from '../hooks/useProfiles'
import { Avatar } from '../components/ui/Avatar'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Modal } from '../components/ui/Modal'
import { PageLoader } from '../components/ui/Spinner'
import { SafeImage } from '../components/ui/SafeImage'
import type { Registration } from '../types'

export function EventDetails() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [promoteOpen, setPromoteOpen] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const eventQuery = useEvent(id)
  const event = eventQuery.data

  const registrationsQuery = useEventRegistrations(event?.id)
  const registrations = registrationsQuery.data ?? []
  const attendeeIds = useMemo(() => registrations.map((r) => r.userId), [registrations])
  const attendeesQuery = useUsersByIds(attendeeIds)
  const attendees = attendeesQuery.data ?? []

  const friendshipsQuery = useFriendships(user?.id)
  const friendIds = useMemo(() => {
    if (!user) return new Set<string>()
    return new Set(
      (friendshipsQuery.data ?? [])
        .filter((f) => f.status === 'accepted')
        .map((f) => (f.requesterId === user.id ? f.addresseeId : f.requesterId)),
    )
  }, [friendshipsQuery.data, user])
  const friendsGoing = attendees.filter((a) => friendIds.has(a.id))

  const myRegistrationQuery = useMyRegistration(user?.id, event?.id)
  const myRegistration = myRegistrationQuery.data

  const hostQuery = useUsersByIds(event ? [event.hostId] : [])
  const host = hostQuery.data?.[0]

  const registerMutation = useRegisterForEvent()
  const cancelMutation = useCancelRegistration()

  const isHost = !!user && !!event && user.id === event.hostId

  if (!id) return <Navigate to="/" replace />
  if (eventQuery.isLoading) return <PageLoader />
  if (!event) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-20 text-center">
        <p className="text-lg font-bold text-ink-900">Event not found</p>
        <p className="mt-1 text-sm text-ink-500">It may have been removed by its host.</p>
        <Link to="/" className="mt-4 inline-block">
          <Button variant="outline">Back to Discover</Button>
        </Link>
      </div>
    )
  }

  const meta = CATEGORY_META[event.category]
  const spotsLeft = event.capacity > 0 ? Math.max(0, event.capacity - registrations.length) : undefined
  const isPast = new Date(event.startsAt) < new Date()
  const mapsUrl = `https://www.google.com/maps?q=${event.location.point.lat},${event.location.point.lng}`

  const handleRegister = () => {
    if (!user) return navigate('/login', { state: { from: `/events/${event.id}` } })
    setError('')
    registerMutation.mutate(
      { userId: user.id, eventId: event.id },
      { onError: (err) => setError(err instanceof Error ? err.message : 'Something went wrong.') },
    )
  }

  const handleCancel = () => {
    if (myRegistration) cancelMutation.mutate(myRegistration.id)
  }

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      // clipboard unavailable — no-op
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 pb-16 pt-6 sm:px-6">
      <div className="relative mb-6 aspect-[16/8] w-full overflow-hidden rounded-3xl bg-ink-100 sm:aspect-[16/6]">
        <SafeImage src={event.imageUrl} alt={event.title} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-900/60 via-transparent to-transparent" />
        <div className="absolute left-4 top-4 flex flex-wrap gap-1.5 sm:left-6 sm:top-6">
          {event.isPromoted && (
            <Badge tone="warning" className="bg-white/95">
              <Sparkles size={12} /> Promoted
            </Badge>
          )}
          {event.type === 'official' ? (
            <Badge tone="brand" className="bg-white/95">
              <ShieldCheck size={12} /> Official company event
            </Badge>
          ) : (
            <Badge tone="neutral" className="bg-white/95">
              Community event
            </Badge>
          )}
        </div>
        <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6">
          <span className={`mb-2 inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold ${meta.color}`}>
            <meta.icon size={12} /> {meta.label}
          </span>
          <h1 className="text-2xl font-extrabold text-white drop-shadow sm:text-3xl">{event.title}</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card className="flex flex-wrap gap-5 p-5">
            <InfoItem icon={<Calendar size={16} />} label="Date" value={formatEventDate(event.startsAt)} />
            <InfoItem icon={<Clock size={16} />} label="Time" value={`${formatEventTime(event.startsAt)} – ${formatEventTime(event.endsAt)}`} />
            <InfoItem icon={<MapPin size={16} />} label="Location" value={event.location.name} />
            <InfoItem icon={<Users size={16} />} label="Spots" value={spotsLeft !== undefined ? `${spotsLeft} left of ${event.capacity}` : 'Open'} />
          </Card>

          <div>
            <h2 className="mb-2 font-bold text-ink-900">About this event</h2>
            <p className="whitespace-pre-line text-sm leading-relaxed text-ink-600">{event.description}</p>
          </div>

          <div>
            <h2 className="mb-2 font-bold text-ink-900">Location</h2>
            <a
              href={mapsUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between rounded-2xl border border-ink-200 p-4 hover:border-brand-300"
            >
              <div>
                <p className="text-sm font-semibold text-ink-800">{event.location.name}</p>
                <p className="text-xs text-ink-500">
                  {event.location.address}, {event.location.emirate}
                </p>
              </div>
              <span className="flex items-center gap-1 text-xs font-semibold text-brand-600">
                <MapPin size={14} /> View on map
              </span>
            </a>
          </div>

          {friendsGoing.length > 0 && (
            <div>
              <h2 className="mb-2 font-bold text-ink-900">Friends going</h2>
              <div className="flex flex-wrap gap-3">
                {friendsGoing.map((f) => (
                  <Link key={f.id} to="/profile" className="flex items-center gap-2 rounded-full border border-ink-200 py-1 pl-1 pr-3 hover:border-brand-300">
                    <Avatar name={f.name} src={f.avatarUrl} size={26} />
                    <span className="text-xs font-semibold text-ink-700">{f.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div>
            <h2 className="mb-2 font-bold text-ink-900">
              Who's going <span className="text-ink-400">({attendees.length})</span>
            </h2>
            {attendees.length === 0 ? (
              <p className="text-sm text-ink-500">Be the first to register!</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {attendees.slice(0, 18).map((a) => (
                  <div key={a.id} title={a.name}>
                    <Avatar name={a.name} src={a.avatarUrl} size={34} />
                  </div>
                ))}
                {attendees.length > 18 && (
                  <div className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-ink-100 text-xs font-semibold text-ink-500">
                    +{attendees.length - 18}
                  </div>
                )}
              </div>
            )}
          </div>

          {isHost && <HostAttendancePanel registrations={registrations} attendees={attendees} />}
        </div>

        <div className="space-y-4">
          <Card className="sticky top-20 space-y-4 p-5">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-extrabold text-ink-900">{formatAED(event.priceAED)}</span>
              {event.type === 'official' && event.pointsPerAttendee > 0 && (
                <Badge tone="brand">
                  <Award size={12} /> +{event.pointsPerAttendee} pts
                </Badge>
              )}
            </div>

            {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-600">{error}</p>}

            {isPast ? (
              <Button disabled className="w-full">
                Event has ended
              </Button>
            ) : myRegistration ? (
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-1.5 rounded-xl bg-emerald-50 py-2.5 text-sm font-semibold text-emerald-700">
                  <Check size={16} /> You're registered
                </div>
                <Button variant="outline" className="w-full" disabled={cancelMutation.isPending} onClick={handleCancel}>
                  Cancel registration
                </Button>
              </div>
            ) : (
              <Button className="w-full" size="lg" disabled={spotsLeft === 0 || registerMutation.isPending} onClick={handleRegister}>
                {spotsLeft === 0 ? 'Event full' : registerMutation.isPending ? 'Registering…' : 'Register now'}
              </Button>
            )}

            <Button variant="ghost" className="w-full" onClick={handleShare}>
              <Share2 size={15} /> {copied ? 'Link copied!' : 'Share event'}
            </Button>

            <div className="flex items-center gap-3 border-t border-ink-100 pt-4">
              <Avatar name={host?.company?.companyName ?? host?.name ?? 'Host'} src={host?.avatarUrl} size={40} />
              <div className="min-w-0">
                <p className="flex items-center gap-1 truncate text-sm font-bold text-ink-900">
                  {host?.company?.companyName ?? host?.name}
                  {host?.company?.verified && <ShieldCheck size={14} className="shrink-0 text-brand-500" />}
                </p>
                <p className="text-xs text-ink-500">{host?.company ? host.company.industry : 'Community organizer'}</p>
              </div>
            </div>

            {isHost && !isPast && (
              <Button variant="secondary" className="w-full" onClick={() => setPromoteOpen(true)}>
                <Sparkles size={15} /> {event.isPromoted ? 'Boost promotion' : 'Promote this event'}
              </Button>
            )}
          </Card>
        </div>
      </div>

      <PromoteModal open={promoteOpen} onClose={() => setPromoteOpen(false)} eventId={event.id} />
    </div>
  )
}

function InfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-500">{icon}</span>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-400">{label}</p>
        <p className="text-sm font-semibold text-ink-800">{value}</p>
      </div>
    </div>
  )
}

function HostAttendancePanel({
  registrations,
  attendees,
}: {
  registrations: Registration[]
  attendees: { id: string; name: string; avatarUrl?: string }[]
}) {
  const markAttended = useMarkAttended()
  const attendeeById = new Map(attendees.map((a) => [a.id, a]))

  return (
    <div>
      <h2 className="mb-2 font-bold text-ink-900">Manage attendance</h2>
      <Card className="divide-y divide-ink-100">
        {registrations.length === 0 && <p className="p-4 text-sm text-ink-500">No registrations yet.</p>}
        {registrations.map((r) => {
          const attendee = attendeeById.get(r.userId)
          if (!attendee) return null
          return (
            <div key={r.id} className="flex items-center justify-between gap-3 p-3.5">
              <div className="flex items-center gap-2.5">
                <Avatar name={attendee.name} src={attendee.avatarUrl} size={32} />
                <span className="text-sm font-semibold text-ink-800">{attendee.name}</span>
              </div>
              {r.status === 'attended' ? (
                <Badge tone="success">
                  <Check size={12} /> Attended{r.pointsAwarded ? ` · +${r.pointsAwarded} pts` : ''}
                </Badge>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  disabled={markAttended.isPending}
                  onClick={() => markAttended.mutate({ registrationId: r.id, userId: r.userId })}
                >
                  Mark attended
                </Button>
              )}
            </div>
          )
        })}
      </Card>
    </div>
  )
}

function PromoteModal({ open, onClose, eventId }: { open: boolean; onClose: () => void; eventId: string }) {
  const promote = usePromoteEvent(eventId)
  const tiers: { tier: 1 | 2 | 3; label: string; price: number; blurb: string }[] = [
    { tier: 1, label: 'Boost', price: 49, blurb: '7 days · modest priority lift' },
    { tier: 2, label: 'Spotlight', price: 99, blurb: '7 days · strong priority + featured rail' },
    { tier: 3, label: 'Citywide', price: 199, blurb: '7 days · maximum priority + featured rail' },
  ]
  return (
    <Modal open={open} onClose={onClose} title="Promote this event">
      <p className="mb-4 text-sm text-ink-500">
        Promoted events rank higher in Discover and appear in the Trending rail. This is a demo &mdash; no real payment is
        taken.
      </p>
      <div className="space-y-2.5">
        {tiers.map((t) => (
          <button
            key={t.tier}
            disabled={promote.isPending}
            onClick={() => promote.mutate({ tier: t.tier }, { onSuccess: onClose })}
            className="flex w-full items-center justify-between rounded-2xl border border-ink-200 p-4 text-left hover:border-brand-400"
          >
            <div>
              <p className="font-bold text-ink-900">{t.label}</p>
              <p className="text-xs text-ink-500">{t.blurb}</p>
            </div>
            <span className="font-extrabold text-brand-600">{formatAED(t.price)}</span>
          </button>
        ))}
      </div>
    </Modal>
  )
}
