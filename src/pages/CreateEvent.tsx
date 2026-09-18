import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { addDays, format } from 'date-fns'
import { Award, Info, ShieldCheck } from 'lucide-react'
import { CATEGORY_LIST, CATEGORY_META, EMIRATES } from '../lib/categories'
import { CATEGORY_STOCK_IMAGES, PRESET_VENUES } from '../lib/venues'
import * as repo from '../lib/repo'
import { useAuth } from '../context/AuthContext'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { FieldError, Input, Label, Select, Textarea } from '../components/ui/Input'
import type { Emirate, EventCategory } from '../types'

function toLocalInputValue(d: Date) {
  return format(d, "yyyy-MM-dd'T'HH:mm")
}

export function CreateEventPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const canHostOfficial = user?.role === 'company' && !!user.company?.verified

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<EventCategory>('football')
  const [startsAt, setStartsAt] = useState(toLocalInputValue(addDays(new Date(), 2)))
  const [durationHours, setDurationHours] = useState(2)
  const [venueIdx, setVenueIdx] = useState(0)
  const [customName, setCustomName] = useState('')
  const [customAddress, setCustomAddress] = useState('')
  const [customEmirate, setCustomEmirate] = useState<Emirate>('Dubai')
  const [capacity, setCapacity] = useState(20)
  const [priceAED, setPriceAED] = useState(0)
  const [requestOfficial, setRequestOfficial] = useState(canHostOfficial)
  const [pointsPerAttendee, setPointsPerAttendee] = useState(30)
  const [error, setError] = useState('')

  // RequireAuth (see App.tsx routing) guarantees a user here.
  if (!user) return null

  const venue = PRESET_VENUES[venueIdx]
  const isCustomVenue = venue.name === 'Other / custom location'

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const start = new Date(startsAt)
    const end = new Date(start.getTime() + durationHours * 3_600_000)

    const location = isCustomVenue
      ? { name: customName || 'Custom venue', address: customAddress, emirate: customEmirate, point: venue.point }
      : { name: venue.name, address: venue.address, emirate: venue.emirate, point: venue.point }

    const result = repo.createEvent({
      hostId: user.id,
      title,
      description,
      category,
      startsAt: start.toISOString(),
      endsAt: end.toISOString(),
      location,
      capacity,
      priceAED,
      pointsPerAttendee,
      imageUrl: CATEGORY_STOCK_IMAGES[category],
      requestOfficial,
    })
    if ('error' in result) return setError(result.error)
    navigate(`/events/${result.event.id}`)
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-extrabold text-ink-900">Host an event</h1>
      <p className="mt-1 text-sm text-ink-500">Fill in the details below &mdash; it takes less than a minute.</p>

      <form onSubmit={submit} className="mt-6 space-y-5">
        <Card className="space-y-4 p-5">
          <div>
            <Label htmlFor="title">Event title</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Sunset Beach Volleyball" required />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What should people expect? Skill level, what to bring, meeting point details..." required />
          </div>
          <div>
            <Label>Category</Label>
            <div className="flex flex-wrap gap-2">
              {CATEGORY_LIST.map((c) => {
                const meta = CATEGORY_META[c]
                return (
                  <button
                    type="button"
                    key={c}
                    onClick={() => setCategory(c)}
                    className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${
                      category === c ? 'border-brand-500 bg-brand-500 text-white' : 'border-ink-200 text-ink-600 hover:border-brand-300'
                    }`}
                  >
                    <meta.icon size={13} /> {meta.label}
                  </button>
                )
              })}
            </div>
          </div>
        </Card>

        <Card className="space-y-4 p-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startsAt">Starts</Label>
              <Input id="startsAt" type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="duration">Duration (hours)</Label>
              <Input id="duration" type="number" min={0.5} step={0.5} value={durationHours} onChange={(e) => setDurationHours(Number(e.target.value))} required />
            </div>
          </div>

          <div>
            <Label htmlFor="venue">Venue</Label>
            <Select id="venue" value={venueIdx} onChange={(e) => setVenueIdx(Number(e.target.value))}>
              {PRESET_VENUES.map((v, i) => (
                <option key={v.name} value={i}>
                  {v.name} {v.address ? `— ${v.emirate}` : ''}
                </option>
              ))}
            </Select>
          </div>

          {isCustomVenue && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="customName">Venue name</Label>
                <Input id="customName" value={customName} onChange={(e) => setCustomName(e.target.value)} placeholder="e.g. Community Park Courts" required />
              </div>
              <div>
                <Label htmlFor="customEmirate">Emirate</Label>
                <Select id="customEmirate" value={customEmirate} onChange={(e) => setCustomEmirate(e.target.value as Emirate)}>
                  {EMIRATES.map((em) => (
                    <option key={em} value={em}>
                      {em}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="customAddress">Address</Label>
                <Input id="customAddress" value={customAddress} onChange={(e) => setCustomAddress(e.target.value)} placeholder="Street, area" required />
              </div>
            </div>
          )}
        </Card>

        <Card className="space-y-4 p-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="capacity">Capacity</Label>
              <Input id="capacity" type="number" min={1} value={capacity} onChange={(e) => setCapacity(Number(e.target.value))} required />
            </div>
            <div>
              <Label htmlFor="price">Price (AED, 0 = free)</Label>
              <Input id="price" type="number" min={0} value={priceAED} onChange={(e) => setPriceAED(Number(e.target.value))} required />
            </div>
          </div>
        </Card>

        <Card className="space-y-3 p-5">
          <div className="flex items-start gap-3">
            <ShieldCheck size={18} className="mt-0.5 shrink-0 text-brand-500" />
            <div className="flex-1">
              <p className="text-sm font-bold text-ink-900">Official, points-earning event</p>
              {canHostOfficial ? (
                <label className="mt-1 flex items-center gap-2 text-sm text-ink-600">
                  <input type="checkbox" checked={requestOfficial} onChange={(e) => setRequestOfficial(e.target.checked)} className="h-4 w-4 rounded accent-brand-500" />
                  Award loyalty points to attendees
                </label>
              ) : (
                <p className="mt-1 flex items-start gap-1.5 text-xs text-ink-500">
                  <Info size={13} className="mt-0.5 shrink-0" />
                  Only verified company accounts can run official events that award points &mdash; this keeps the points
                  system safe from abuse. Your event will be posted as a <strong>community event</strong>.{' '}
                  {user.role === 'company' && !user.company?.verified && 'Your company is awaiting verification.'}
                </p>
              )}
            </div>
          </div>

          {canHostOfficial && requestOfficial && (
            <div className="ml-8">
              <Label htmlFor="points" className="flex items-center gap-1">
                <Award size={13} /> Points per attendee
              </Label>
              <Input id="points" type="number" min={0} max={200} value={pointsPerAttendee} onChange={(e) => setPointsPerAttendee(Number(e.target.value))} className="max-w-[140px]" />
              <p className="mt-1 text-xs text-ink-400">Points are awarded from your company's own catalogue once you mark an attendee as attended.</p>
            </div>
          )}
        </Card>

        <FieldError>{error}</FieldError>
        <Button type="submit" size="lg" className="w-full">
          Publish event
        </Button>
      </form>
    </div>
  )
}
