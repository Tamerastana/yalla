import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Compass, LocateFixed, MapPinOff, Sparkles, TrendingUp } from 'lucide-react'
import { DEFAULT_FILTERS, EventFilters, type Filters } from '../components/events/EventFilters'
import { EventCard } from '../components/events/EventCard'
import { EmptyState } from '../components/ui/EmptyState'
import { Button } from '../components/ui/Button'
import { PageLoader } from '../components/ui/Spinner'
import { CATEGORY_META } from '../lib/categories'
import { distanceKm } from '../lib/geo'
import { countByEvent, rankEvents } from '../lib/relevance'
import { useEvents } from '../hooks/useEvents'
import { useAllRegistrations } from '../hooks/useRegistrations'
import { useUsersByIds } from '../hooks/useProfiles'
import { useGeo } from '../lib/useGeo'
import { useAuth } from '../context/AuthContext'
import type { User } from '../types'

export function Home() {
  const { user } = useAuth()
  const { point, status, request } = useGeo()
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS)

  const eventsQuery = useEvents()
  const registrationsQuery = useAllRegistrations()
  const events = eventsQuery.data ?? []
  const registrations = registrationsQuery.data ?? []

  const hostIds = useMemo(() => Array.from(new Set(events.map((e) => e.hostId))), [events])
  const hostsQuery = useUsersByIds(hostIds)
  const hostsById = useMemo(() => {
    const map = new Map<string, User>()
    for (const h of hostsQuery.data ?? []) map.set(h.id, h)
    return map
  }, [hostsQuery.data])

  const upcoming = useMemo(() => events.filter((e) => e.status === 'upcoming'), [events])
  const regCounts = useMemo(() => countByEvent(registrations), [registrations])
  const ranked = useMemo(() => rankEvents(upcoming, point, regCounts), [upcoming, point, regCounts])

  const featured = useMemo(() => ranked.filter((e) => e.isPromoted).slice(0, 6), [ranked])

  const filtered = useMemo(() => {
    const now = Date.now()
    let list = ranked.filter((e) => {
      if (filters.type !== 'all' && e.type !== filters.type) return false
      if (filters.categories.length && !filters.categories.includes(e.category)) return false
      if (filters.price === 'free' && e.priceAED > 0) return false
      if (filters.price === 'paid' && e.priceAED === 0) return false
      if (filters.radiusKm !== null && distanceKm(point, e.location.point) > filters.radiusKm) return false
      if (filters.dateRange !== 'all') {
        const days = (new Date(e.startsAt).getTime() - now) / 86_400_000
        if (filters.dateRange === 'today' && days > 1) return false
        if (filters.dateRange === 'week' && days > 7) return false
        if (filters.dateRange === 'month' && days > 31) return false
      }
      if (filters.query.trim()) {
        const q = filters.query.trim().toLowerCase()
        const haystack = `${e.title} ${e.description} ${e.location.name} ${e.location.emirate} ${CATEGORY_META[e.category].label}`.toLowerCase()
        if (!haystack.includes(q)) return false
      }
      return true
    })

    if (filters.sortBy === 'soonest') {
      list = [...list].sort((a, b) => +new Date(a.startsAt) - +new Date(b.startsAt))
    } else if (filters.sortBy === 'distance') {
      list = [...list].sort((a, b) => distanceKm(point, a.location.point) - distanceKm(point, b.location.point))
    }
    return list
  }, [ranked, filters, point])

  return (
    <div>
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-500 via-brand-500 to-brand-600">
        <div className="absolute inset-0 opacity-15" style={{ backgroundImage: 'radial-gradient(circle at 20% 20%, white 1px, transparent 1px)', backgroundSize: '22px 22px' }} />
        <div className="relative mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
          <div className="max-w-2xl animate-fade-up">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white ring-1 ring-inset ring-white/25">
              <Sparkles size={12} /> Sports events across the UAE
            </span>
            <h1 className="mt-4 text-4xl font-extrabold leading-[1.1] text-white sm:text-5xl">
              Find your next game. <br className="hidden sm:block" /> Play, connect, earn.
            </h1>
            <p className="mt-4 max-w-lg text-base text-brand-50/90">
              Join official events from trusted companies and grassroots meetups from your community &mdash; then
              redeem points for real rewards.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button size="lg" variant="secondary" className="bg-white text-brand-600 hover:bg-brand-50" onClick={() => document.getElementById('feed')?.scrollIntoView({ behavior: 'smooth' })}>
                <Compass size={18} /> Browse events
              </Button>
              <Link to="/create">
                <Button size="lg" className="bg-ink-900 hover:bg-ink-800">
                  Host your own
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {eventsQuery.isLoading ? (
        <PageLoader />
      ) : (
        <>
          {featured.length > 0 && (
            <section className="mx-auto max-w-6xl px-4 pt-8 sm:px-6">
              <div className="mb-3 flex items-center gap-2">
                <TrendingUp size={18} className="text-brand-500" />
                <h2 className="text-lg font-extrabold text-ink-900">Trending &amp; promoted</h2>
              </div>
              <div className="flex gap-4 overflow-x-auto scrollbar-none pb-3">
                {featured.map((e) => (
                  <div key={e.id} className="w-[280px] shrink-0 sm:w-[300px]">
                    <EventCard event={e} host={hostsById.get(e.hostId)} distanceKm={distanceKm(point, e.location.point)} registeredCount={regCounts[e.id] ?? 0} />
                  </div>
                ))}
              </div>
            </section>
          )}

          <section id="feed" className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
            {status !== 'granted' && (
              <button
                onClick={request}
                className="mb-4 flex w-full items-center gap-2 rounded-2xl border border-dashed border-brand-200 bg-brand-50/60 px-4 py-2.5 text-left text-xs font-semibold text-brand-700 hover:bg-brand-50"
              >
                {status === 'denied' ? <MapPinOff size={15} /> : <LocateFixed size={15} />}
                {status === 'denied'
                  ? 'Location blocked — showing events near Downtown Dubai. Enable location for accurate distances.'
                  : 'Share your location to see events sorted by distance.'}
              </button>
            )}

            <EventFilters filters={filters} onChange={setFilters} />

            <div className="mt-6 flex items-center justify-between">
              <p className="text-sm font-semibold text-ink-500">
                {filtered.length} event{filtered.length === 1 ? '' : 's'} {user?.city ? `near ${user.city}` : ''}
              </p>
            </div>

            {filtered.length === 0 ? (
              <div className="mt-6">
                <EmptyState
                  icon={<Compass size={22} />}
                  title="No events match your filters"
                  description="Try widening your distance range, clearing categories, or checking back soon &mdash; new events are added daily."
                  action={
                    <Button variant="outline" onClick={() => setFilters(DEFAULT_FILTERS)}>
                      Reset filters
                    </Button>
                  }
                />
              </div>
            ) : (
              <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((e) => (
                  <EventCard key={e.id} event={e} host={hostsById.get(e.hostId)} distanceKm={distanceKm(point, e.location.point)} registeredCount={regCounts[e.id] ?? 0} />
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  )
}
