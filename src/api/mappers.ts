import type {
  Emirate,
  EventCategory,
  EventType,
  Friendship,
  FriendshipStatus,
  PointsEntry,
  Redemption,
  Registration,
  RegistrationStatus,
  Reward,
  Role,
  SportEvent,
  User,
} from '../types'

/** Rows are typed loosely here (raw Supabase results) and narrowed on the way out. */

export function mapProfile(row: Record<string, unknown>): User {
  const role = row.role as Role
  return {
    id: row.id as string,
    name: row.name as string,
    email: (row.email as string) ?? undefined,
    phone: (row.phone as string) ?? undefined,
    avatarUrl: (row.avatar_url as string) ?? undefined,
    role,
    bio: (row.bio as string) ?? undefined,
    city: (row.city as Emirate) ?? undefined,
    home:
      row.home_lat != null && row.home_lng != null
        ? { lat: row.home_lat as number, lng: row.home_lng as number }
        : undefined,
    createdAt: row.created_at as string,
    company:
      role === 'company'
        ? {
            companyName: (row.company_name as string) ?? '',
            industry: (row.company_industry as string) ?? '',
            website: (row.company_website as string) ?? undefined,
            about: (row.company_about as string) ?? undefined,
            verified: Boolean(row.company_verified),
            verifiedAt: (row.company_verified_at as string) ?? undefined,
            verifiedBy: (row.company_verified_by as string) ?? undefined,
            active: row.is_active === undefined ? true : Boolean(row.is_active),
          }
        : undefined,
  }
}

export function mapEvent(row: Record<string, unknown>): SportEvent {
  return {
    id: row.id as string,
    title: row.title as string,
    description: row.description as string,
    category: row.category as EventCategory,
    type: row.type as EventType,
    hostId: row.host_id as string,
    startsAt: row.starts_at as string,
    endsAt: row.ends_at as string,
    location: {
      name: row.location_name as string,
      address: row.address as string,
      emirate: row.emirate as Emirate,
      point: { lat: row.lat as number, lng: row.lng as number },
    },
    capacity: row.capacity as number,
    priceAED: Number(row.price_aed),
    pointsPerAttendee: row.points_per_attendee as number,
    imageUrl: row.image_url as string,
    isPromoted: Boolean(row.is_promoted),
    promotedUntil: (row.promoted_until as string) ?? undefined,
    promotionTier: (row.promotion_tier as 1 | 2 | 3) ?? undefined,
    status: row.status as SportEvent['status'],
    createdAt: row.created_at as string,
  }
}

export function mapRegistration(row: Record<string, unknown>): Registration {
  return {
    id: row.id as string,
    eventId: row.event_id as string,
    userId: row.user_id as string,
    registeredAt: row.registered_at as string,
    status: row.status as RegistrationStatus,
    pointsAwarded: (row.points_awarded as number) ?? undefined,
  }
}

export function mapFriendship(row: Record<string, unknown>): Friendship {
  return {
    id: row.id as string,
    requesterId: row.requester_id as string,
    addresseeId: row.addressee_id as string,
    status: row.status as FriendshipStatus,
    createdAt: row.created_at as string,
  }
}

export function mapPointsEntry(row: Record<string, unknown>): PointsEntry {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    companyId: row.company_id as string,
    eventId: (row.event_id as string) ?? undefined,
    points: row.points as number,
    kind: row.kind as PointsEntry['kind'],
    note: row.note as string,
    createdAt: row.created_at as string,
  }
}

export function mapReward(row: Record<string, unknown>): Reward {
  return {
    id: row.id as string,
    companyId: row.company_id as string,
    title: row.title as string,
    description: row.description as string,
    costPoints: row.cost_points as number,
    imageUrl: row.image_url as string,
    stock: row.stock as number,
    active: Boolean(row.active),
  }
}

export function mapRedemption(row: Record<string, unknown>): Redemption {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    rewardId: row.reward_id as string,
    companyId: row.company_id as string,
    pointsSpent: row.points_spent as number,
    redeemedAt: row.redeemed_at as string,
    code: row.code as string,
    status: row.status as Redemption['status'],
  }
}
