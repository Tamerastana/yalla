import { distanceKm } from './geo'
import type { GeoPoint, Registration, SportEvent } from '../types'

export interface RelevanceInput {
  event: SportEvent
  userPoint: GeoPoint
  registrationCount: number
  now?: Date
}

/**
 * Scores an event for the default "Relevance" feed sort. Higher is better.
 * Promotion buys real (but bounded) priority — it cannot bury an official
 * event's inherent trust boost, and both still lose to an event that's
 * about to start or already full.
 */
export function relevanceScore({ event, userPoint, registrationCount, now = new Date() }: RelevanceInput): number {
  let score = 0

  if (event.isPromoted && event.promotedUntil && new Date(event.promotedUntil) > now) {
    score += { 1: 18, 2: 32, 3: 48 }[event.promotionTier ?? 1]
  }

  if (event.type === 'official') score += 22

  const km = distanceKm(userPoint, event.location.point)
  score += Math.max(0, 30 - km) // within ~30km contributes proximity points

  const hoursUntil = (new Date(event.startsAt).getTime() - now.getTime()) / 3_600_000
  if (hoursUntil > 0) {
    // events in the next few days rank higher than ones months out
    score += Math.max(0, 26 - hoursUntil / 6)
  } else {
    score -= 999 // already started/passed — effectively hidden from "upcoming"
  }

  const fillRate = event.capacity > 0 ? registrationCount / event.capacity : 0
  score += fillRate * 10 // social proof, but capped so it can't dominate

  return score
}

export function rankEvents(
  events: SportEvent[],
  userPoint: GeoPoint,
  registrationCounts: Record<string, number>,
  now = new Date(),
): SportEvent[] {
  return [...events].sort(
    (a, b) =>
      relevanceScore({ event: b, userPoint, registrationCount: registrationCounts[b.id] ?? 0, now }) -
      relevanceScore({ event: a, userPoint, registrationCount: registrationCounts[a.id] ?? 0, now }),
  )
}

export function countByEvent(registrations: Registration[]): Record<string, number> {
  const out: Record<string, number> = {}
  for (const r of registrations) {
    if (r.status === 'cancelled') continue
    out[r.eventId] = (out[r.eventId] ?? 0) + 1
  }
  return out
}
