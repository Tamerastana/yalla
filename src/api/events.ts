import { supabase } from '../lib/supabaseClient'
import { mapEvent } from './mappers'
import type { Emirate, EventCategory, SportEvent } from '../types'

export interface CreateEventInput {
  hostId: string
  title: string
  description: string
  category: EventCategory
  startsAt: string
  endsAt: string
  location: { name: string; address: string; emirate: Emirate; point: { lat: number; lng: number } }
  capacity: number
  priceAED: number
  pointsPerAttendee: number
  imageUrl: string
  requestOfficial: boolean
}

export async function listEvents(): Promise<SportEvent[]> {
  const { data, error } = await supabase.from('events').select('*').order('starts_at', { ascending: true })
  if (error) throw new Error(error.message)
  return (data ?? []).map(mapEvent)
}

export async function getEvent(id: string): Promise<SportEvent | null> {
  const { data, error } = await supabase.from('events').select('*').eq('id', id).maybeSingle()
  if (error) throw new Error(error.message)
  return data ? mapEvent(data) : null
}

export async function listEventsByIds(ids: string[]): Promise<SportEvent[]> {
  if (ids.length === 0) return []
  const { data, error } = await supabase.from('events').select('*').in('id', ids)
  if (error) throw new Error(error.message)
  return (data ?? []).map(mapEvent)
}

export async function listEventsByHost(hostId: string): Promise<SportEvent[]> {
  const { data, error } = await supabase.from('events').select('*').eq('host_id', hostId).order('starts_at', { ascending: false })
  if (error) throw new Error(error.message)
  return (data ?? []).map(mapEvent)
}

/**
 * The `type`/`points_per_attendee` a client requests here is advisory only —
 * the `enforce_official_event_rules` trigger in Postgres is what actually
 * decides whether this becomes an official, points-earning event, based on
 * the host's verified-company status at write time. A user editing requests
 * in devtools can't grant themselves points.
 */
export async function createEvent(input: CreateEventInput): Promise<SportEvent> {
  const { data, error } = await supabase
    .from('events')
    .insert({
      host_id: input.hostId,
      title: input.title.trim(),
      description: input.description.trim(),
      category: input.category,
      type: input.requestOfficial ? 'official' : 'community',
      starts_at: input.startsAt,
      ends_at: input.endsAt,
      location_name: input.location.name,
      address: input.location.address,
      emirate: input.location.emirate,
      lat: input.location.point.lat,
      lng: input.location.point.lng,
      capacity: input.capacity,
      price_aed: input.priceAED,
      points_per_attendee: Math.max(0, input.pointsPerAttendee),
      image_url: input.imageUrl,
    })
    .select('*')
    .single()
  if (error) throw new Error(error.message)
  return mapEvent(data)
}

export type UpdateEventInput = Partial<Omit<CreateEventInput, 'hostId'>>

/**
 * RLS allows this for the event's own host or a super_admin (see
 * events_update_own / events_update_admin in schema.sql) — anyone else's
 * request affects 0 rows rather than erroring, so callers should treat "no
 * rows returned" as a permission failure.
 */
export async function updateEvent(eventId: string, input: UpdateEventInput): Promise<SportEvent> {
  const row: Record<string, unknown> = {}
  if (input.title !== undefined) row.title = input.title.trim()
  if (input.description !== undefined) row.description = input.description.trim()
  if (input.category !== undefined) row.category = input.category
  if (input.startsAt !== undefined) row.starts_at = input.startsAt
  if (input.endsAt !== undefined) row.ends_at = input.endsAt
  if (input.capacity !== undefined) row.capacity = input.capacity
  if (input.priceAED !== undefined) row.price_aed = input.priceAED
  if (input.pointsPerAttendee !== undefined) row.points_per_attendee = Math.max(0, input.pointsPerAttendee)
  if (input.imageUrl !== undefined) row.image_url = input.imageUrl
  if (input.requestOfficial !== undefined) row.type = input.requestOfficial ? 'official' : 'community'
  if (input.location !== undefined) {
    row.location_name = input.location.name
    row.address = input.location.address
    row.emirate = input.location.emirate
    row.lat = input.location.point.lat
    row.lng = input.location.point.lng
  }

  const { data, error } = await supabase.from('events').update(row).eq('id', eventId).select('*').maybeSingle()
  if (error) throw new Error(error.message)
  if (!data) throw new Error("You don't have permission to edit this event.")
  return mapEvent(data)
}

export async function deleteEvent(eventId: string): Promise<void> {
  const { data, error } = await supabase.from('events').delete().eq('id', eventId).select('id').maybeSingle()
  if (error) throw new Error(error.message)
  if (!data) throw new Error("You don't have permission to delete this event.")
}

export async function promoteEvent(eventId: string, tier: 1 | 2 | 3, days = 7): Promise<void> {
  const promotedUntil = new Date(Date.now() + days * 86_400_000).toISOString()
  const { error } = await supabase
    .from('events')
    .update({ is_promoted: true, promotion_tier: tier, promoted_until: promotedUntil })
    .eq('id', eventId)
  if (error) throw new Error(error.message)
}
