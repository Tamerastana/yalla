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

export async function promoteEvent(eventId: string, tier: 1 | 2 | 3, days = 7): Promise<void> {
  const promotedUntil = new Date(Date.now() + days * 86_400_000).toISOString()
  const { error } = await supabase
    .from('events')
    .update({ is_promoted: true, promotion_tier: tier, promoted_until: promotedUntil })
    .eq('id', eventId)
  if (error) throw new Error(error.message)
}
