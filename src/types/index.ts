export type Role = 'super_admin' | 'company' | 'user'

export type EventCategory =
  | 'football'
  | 'running'
  | 'padel'
  | 'yoga'
  | 'cycling'
  | 'swimming'
  | 'basketball'
  | 'hiking'
  | 'cricket'
  | 'watersports'
  | 'fitness'
  | 'multi-sport'

export type Emirate =
  | 'Dubai'
  | 'Abu Dhabi'
  | 'Sharjah'
  | 'Ajman'
  | 'Ras Al Khaimah'
  | 'Fujairah'
  | 'Umm Al Quwain'

export interface GeoPoint {
  lat: number
  lng: number
}

export interface CompanyProfile {
  companyName: string
  verified: boolean
  industry: string
  website?: string
  logoUrl?: string
  about?: string
  /** verification is granted only by a super_admin */
  verifiedAt?: string
  verifiedBy?: string
}

export interface User {
  id: string
  name: string
  email?: string
  phone?: string
  passwordHash: string
  avatarUrl?: string
  role: Role
  bio?: string
  city?: Emirate
  home?: GeoPoint
  createdAt: string
  company?: CompanyProfile
}

export type EventType = 'official' | 'community'

export interface EventLocation {
  name: string
  address: string
  emirate: Emirate
  point: GeoPoint
}

export interface SportEvent {
  id: string
  title: string
  description: string
  category: EventCategory
  type: EventType
  hostId: string
  startsAt: string
  endsAt: string
  location: EventLocation
  capacity: number
  priceAED: number
  pointsPerAttendee: number
  imageUrl: string
  isPromoted: boolean
  promotedUntil?: string
  promotionTier?: 1 | 2 | 3
  status: 'upcoming' | 'completed' | 'cancelled'
  createdAt: string
}

export type RegistrationStatus = 'registered' | 'cancelled' | 'attended'

export interface Registration {
  id: string
  eventId: string
  userId: string
  registeredAt: string
  status: RegistrationStatus
  pointsAwarded?: number
}

export type FriendshipStatus = 'pending' | 'accepted' | 'declined'

export interface Friendship {
  id: string
  requesterId: string
  addresseeId: string
  status: FriendshipStatus
  createdAt: string
}

export interface PointsEntry {
  id: string
  userId: string
  companyId: string
  eventId?: string
  points: number
  kind: 'earned' | 'redeemed'
  note: string
  createdAt: string
}

export interface Reward {
  id: string
  companyId: string
  title: string
  description: string
  costPoints: number
  imageUrl: string
  stock: number
  active: boolean
}

export interface Redemption {
  id: string
  userId: string
  rewardId: string
  companyId: string
  pointsSpent: number
  redeemedAt: string
  code: string
  status: 'issued' | 'used'
}

export interface Session {
  userId: string
  token: string
  createdAt: string
}
