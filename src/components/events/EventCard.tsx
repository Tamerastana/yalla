import { Link } from 'react-router-dom'
import { Award, Calendar, MapPin, ShieldCheck, Sparkles, Users } from 'lucide-react'
import { CATEGORY_META } from '../../lib/categories'
import { formatAED } from '../../lib/format'
import { formatDistance } from '../../lib/geo'
import { formatEventTime, formatRelativeDay } from '../../lib/format'
import { Badge } from '../ui/Badge'
import { Avatar } from '../ui/Avatar'
import { SafeImage } from '../ui/SafeImage'
import * as repo from '../../lib/repo'
import type { SportEvent } from '../../types'

export function EventCard({
  event,
  distanceKm,
  registeredCount,
}: {
  event: SportEvent
  distanceKm?: number
  registeredCount: number
}) {
  const meta = CATEGORY_META[event.category]
  const host = repo.getUser(event.hostId)
  const spotsLeft = event.capacity > 0 ? event.capacity - registeredCount : undefined
  const isFull = spotsLeft !== undefined && spotsLeft <= 0

  return (
    <Link
      to={`/events/${event.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-ink-200 bg-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-card)]"
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-ink-100">
        <SafeImage
          src={event.imageUrl}
          alt={event.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute left-2.5 top-2.5 flex flex-wrap gap-1.5">
          {event.isPromoted && (
            <Badge tone="warning" className="bg-white/95">
              <Sparkles size={12} /> Promoted
            </Badge>
          )}
          {event.type === 'official' && (
            <Badge tone="brand" className="bg-white/95">
              <ShieldCheck size={12} /> Official
            </Badge>
          )}
        </div>
        {isFull && (
          <div className="absolute right-2.5 top-2.5">
            <Badge tone="neutral" className="bg-white/95">
              Full
            </Badge>
          </div>
        )}
        <div className="absolute bottom-2.5 left-2.5">
          <span className={`inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold ${meta.color}`}>
            <meta.icon size={12} /> {meta.label}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2.5 p-4">
        <h3 className="line-clamp-2 font-bold leading-snug text-ink-900 group-hover:text-brand-600">{event.title}</h3>

        <div className="flex items-center gap-1.5 text-xs font-medium text-ink-500">
          <Calendar size={13} className="shrink-0 text-brand-500" />
          {formatRelativeDay(event.startsAt)} &middot; {formatEventTime(event.startsAt)}
        </div>

        <div className="flex items-center gap-1.5 text-xs font-medium text-ink-500">
          <MapPin size={13} className="shrink-0 text-brand-500" />
          <span className="truncate">{event.location.name}</span>
          {distanceKm !== undefined && <span className="shrink-0 text-ink-400">&middot; {formatDistance(distanceKm)}</span>}
        </div>

        <div className="mt-auto flex items-center justify-between pt-2">
          <div className="flex items-center gap-1.5">
            <Avatar name={host?.name ?? 'Host'} src={host?.avatarUrl} size={20} />
            <span className="max-w-[90px] truncate text-xs font-medium text-ink-500">{host?.company?.companyName ?? host?.name}</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-ink-600">
            <span className="flex items-center gap-0.5">
              <Users size={12} /> {registeredCount}
              {event.capacity > 0 ? `/${event.capacity}` : ''}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-dashed border-ink-100 pt-2.5">
          <span className="text-sm font-bold text-ink-900">{formatAED(event.priceAED)}</span>
          {event.type === 'official' && event.pointsPerAttendee > 0 && (
            <span className="flex items-center gap-1 text-xs font-bold text-brand-600">
              <Award size={13} /> +{event.pointsPerAttendee} pts
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
