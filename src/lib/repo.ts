import type {
  CompanyProfile,
  Emirate,
  EventCategory,
  Friendship,
  PointsEntry,
  Redemption,
  Registration,
  Reward,
  Role,
  SportEvent,
  User,
} from '../types'
import { mockHash, uid } from './id'
import { all, bulkSeed, getById, isEmpty, put, remove } from './storage'

const SESSION_KEY = 'yalla:session:v1'

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export interface SignUpInput {
  name: string
  email?: string
  phone?: string
  password: string
  role: Extract<Role, 'user' | 'company'>
  companyName?: string
  industry?: string
}

export interface LoginInput {
  identifier: string
  password: string
}

function findUserByIdentifier(identifier: string): User | undefined {
  const needle = identifier.trim().toLowerCase()
  return all('users').find(
    (u) => u.email?.toLowerCase() === needle || u.phone?.replace(/\s+/g, '') === needle.replace(/\s+/g, ''),
  )
}

export function signUp(input: SignUpInput): { user: User } | { error: string } {
  if (!input.email && !input.phone) return { error: 'Enter an email or phone number.' }
  if (input.password.length < 6) return { error: 'Password must be at least 6 characters.' }
  if (input.email && findUserByIdentifier(input.email)) return { error: 'An account with this email already exists.' }
  if (input.phone && findUserByIdentifier(input.phone)) return { error: 'An account with this phone already exists.' }
  if (input.role === 'company' && !input.companyName) return { error: 'Company name is required.' }

  const user: User = {
    id: uid('usr'),
    name: input.name,
    email: input.email,
    phone: input.phone,
    passwordHash: mockHash(input.password),
    role: input.role,
    createdAt: new Date().toISOString(),
    avatarUrl: undefined,
    company:
      input.role === 'company'
        ? {
            companyName: input.companyName!,
            industry: input.industry || 'Sports & Recreation',
            verified: false,
          }
        : undefined,
  }
  put('users', user.id, user)
  createSession(user.id)
  return { user }
}

export function logIn(input: LoginInput): { user: User } | { error: string } {
  const user = findUserByIdentifier(input.identifier)
  if (!user || user.passwordHash !== mockHash(input.password)) {
    return { error: 'Incorrect email/phone or password.' }
  }
  createSession(user.id)
  return { user }
}

function createSession(userId: string) {
  localStorage.setItem(SESSION_KEY, JSON.stringify({ userId, token: uid('tok'), createdAt: new Date().toISOString() }))
}

export function logOut() {
  localStorage.removeItem(SESSION_KEY)
}

export function getSessionUser(): User | undefined {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) return undefined
    const { userId } = JSON.parse(raw) as { userId: string }
    return getById('users', userId)
  } catch {
    return undefined
  }
}

export function updateProfile(userId: string, patch: Partial<Pick<User, 'name' | 'bio' | 'city' | 'home' | 'avatarUrl'>>) {
  const user = getById('users', userId)
  if (!user) return
  put('users', userId, { ...user, ...patch })
}

export function verifyCompany(adminId: string, companyUserId: string): { ok: true } | { error: string } {
  const admin = getById('users', adminId)
  if (!admin || admin.role !== 'super_admin') return { error: 'Only Yalla admins can verify companies.' }
  const target = getById('users', companyUserId)
  if (!target?.company) return { error: 'That account is not a company.' }
  const company: CompanyProfile = { ...target.company, verified: true, verifiedAt: new Date().toISOString(), verifiedBy: adminId }
  put('users', companyUserId, { ...target, company })
  return { ok: true }
}

// ---------------------------------------------------------------------------
// Events
// ---------------------------------------------------------------------------

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

/**
 * Only a *verified* company account can create an "official" event that
 * awards points — this is the single anti-abuse gate that keeps regular
 * users from farming points by spinning up fake events for friends.
 */
export function createEvent(input: CreateEventInput): { event: SportEvent } | { error: string } {
  const host = getById('users', input.hostId)
  if (!host) return { error: 'Sign in to create an event.' }
  if (input.title.trim().length < 4) return { error: 'Give the event a proper title.' }
  if (new Date(input.endsAt) <= new Date(input.startsAt)) return { error: 'End time must be after the start time.' }

  const canBeOfficial = host.role === 'company' && host.company?.verified
  const type = input.requestOfficial && canBeOfficial ? 'official' : 'community'

  const event: SportEvent = {
    id: uid('evt'),
    title: input.title.trim(),
    description: input.description.trim(),
    category: input.category,
    type,
    hostId: host.id,
    startsAt: input.startsAt,
    endsAt: input.endsAt,
    location: input.location,
    capacity: input.capacity,
    priceAED: input.priceAED,
    pointsPerAttendee: type === 'official' ? Math.max(0, input.pointsPerAttendee) : 0,
    imageUrl: input.imageUrl,
    isPromoted: false,
    status: 'upcoming',
    createdAt: new Date().toISOString(),
  }
  put('events', event.id, event)
  return { event }
}

export function updateEventStatus(eventId: string, status: SportEvent['status']) {
  const event = getById('events', eventId)
  if (!event) return
  put('events', eventId, { ...event, status })
}

/** Mock payment: real integration would confirm payment before flipping this. */
export function promoteEvent(eventId: string, tier: 1 | 2 | 3, days = 7) {
  const event = getById('events', eventId)
  if (!event) return
  const promotedUntil = new Date(Date.now() + days * 86_400_000).toISOString()
  put('events', eventId, { ...event, isPromoted: true, promotionTier: tier, promotedUntil })
}

export function listEvents(): SportEvent[] {
  return all('events')
}

export function getEvent(id: string): SportEvent | undefined {
  return getById('events', id)
}

export function eventsByHost(hostId: string): SportEvent[] {
  return all('events').filter((e) => e.hostId === hostId)
}

// ---------------------------------------------------------------------------
// Registrations
// ---------------------------------------------------------------------------

export function registerForEvent(userId: string, eventId: string): { registration: Registration } | { error: string } {
  const event = getById('events', eventId)
  if (!event) return { error: 'Event not found.' }
  const existing = all('registrations').find((r) => r.eventId === eventId && r.userId === userId && r.status !== 'cancelled')
  if (existing) return { error: 'Already registered for this event.' }

  const activeCount = all('registrations').filter((r) => r.eventId === eventId && r.status !== 'cancelled').length
  if (event.capacity > 0 && activeCount >= event.capacity) return { error: 'This event is full.' }

  const registration: Registration = {
    id: uid('reg'),
    eventId,
    userId,
    registeredAt: new Date().toISOString(),
    status: 'registered',
  }
  put('registrations', registration.id, registration)
  return { registration }
}

export function cancelRegistration(registrationId: string) {
  const reg = getById('registrations', registrationId)
  if (!reg) return
  put('registrations', registrationId, { ...reg, status: 'cancelled' })
}

export function registrationsForEvent(eventId: string): Registration[] {
  return all('registrations').filter((r) => r.eventId === eventId && r.status !== 'cancelled')
}

export function registrationsForUser(userId: string): Registration[] {
  return all('registrations').filter((r) => r.userId === userId)
}

export function allRegistrations(): Registration[] {
  return all('registrations')
}

export function isRegistered(userId: string, eventId: string): Registration | undefined {
  return all('registrations').find((r) => r.userId === userId && r.eventId === eventId && r.status !== 'cancelled')
}

/**
 * Marks a registrant as attended and — only for official events — awards
 * points from the hosting company. Community events never reach this path
 * with a nonzero award, since createEvent() zeroes pointsPerAttendee for
 * them.
 */
export function markAttended(registrationId: string): { ok: true } | { error: string } {
  const reg = getById('registrations', registrationId)
  if (!reg) return { error: 'Registration not found.' }
  const event = getById('events', reg.eventId)
  if (!event) return { error: 'Event not found.' }

  const alreadyAwarded = reg.status === 'attended'
  put('registrations', registrationId, { ...reg, status: 'attended', pointsAwarded: event.pointsPerAttendee })

  if (!alreadyAwarded && event.type === 'official' && event.pointsPerAttendee > 0) {
    const entry: PointsEntry = {
      id: uid('pts'),
      userId: reg.userId,
      companyId: event.hostId,
      eventId: event.id,
      points: event.pointsPerAttendee,
      kind: 'earned',
      note: `Attended ${event.title}`,
      createdAt: new Date().toISOString(),
    }
    put('points', entry.id, entry)
  }
  return { ok: true }
}

// ---------------------------------------------------------------------------
// Friends
// ---------------------------------------------------------------------------

export function sendFriendRequest(requesterId: string, addresseeId: string): { ok: true } | { error: string } {
  if (requesterId === addresseeId) return { error: "You can't friend yourself." }
  const existing = all('friendships').find(
    (f) =>
      (f.requesterId === requesterId && f.addresseeId === addresseeId) ||
      (f.requesterId === addresseeId && f.addresseeId === requesterId),
  )
  if (existing) return { error: 'A friend request already exists.' }
  const friendship: Friendship = {
    id: uid('frq'),
    requesterId,
    addresseeId,
    status: 'pending',
    createdAt: new Date().toISOString(),
  }
  put('friendships', friendship.id, friendship)
  return { ok: true }
}

export function respondToFriendRequest(friendshipId: string, accept: boolean) {
  const f = getById('friendships', friendshipId)
  if (!f) return
  put('friendships', friendshipId, { ...f, status: accept ? 'accepted' : 'declined' })
}

export function removeFriendship(friendshipId: string) {
  remove('friendships', friendshipId)
}

export function friendshipsForUser(userId: string): Friendship[] {
  return all('friendships').filter((f) => f.requesterId === userId || f.addresseeId === userId)
}

export function friendIdsOf(userId: string): string[] {
  return friendshipsForUser(userId)
    .filter((f) => f.status === 'accepted')
    .map((f) => (f.requesterId === userId ? f.addresseeId : f.requesterId))
}

export function pendingRequestsFor(userId: string): Friendship[] {
  return all('friendships').filter((f) => f.addresseeId === userId && f.status === 'pending')
}

export function friendsGoingToEvent(userId: string, eventId: string): User[] {
  const friendIds = new Set(friendIdsOf(userId))
  const registered = new Set(registrationsForEvent(eventId).map((r) => r.userId))
  return all('users').filter((u) => friendIds.has(u.id) && registered.has(u.id))
}

// ---------------------------------------------------------------------------
// Points & rewards — one ledger per (user, company), like airline miles.
// Scoping points to the issuing company (rather than a shared global
// currency) is what lets each company agree its own rewards without a
// clearinghouse, and stops points earned at one company being spent
// against another's catalogue.
// ---------------------------------------------------------------------------

export function pointsBalance(userId: string, companyId: string): number {
  return all('points')
    .filter((p) => p.userId === userId && p.companyId === companyId)
    .reduce((sum, p) => sum + (p.kind === 'earned' ? p.points : -p.points), 0)
}

export function pointsBalancesByCompany(userId: string): { companyId: string; company: User | undefined; balance: number }[] {
  const companyIds = new Set(all('points').filter((p) => p.userId === userId).map((p) => p.companyId))
  return Array.from(companyIds).map((companyId) => ({
    companyId,
    company: getById('users', companyId),
    balance: pointsBalance(userId, companyId),
  }))
}

export function pointsHistoryForUser(userId: string): PointsEntry[] {
  return all('points')
    .filter((p) => p.userId === userId)
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
}

export function createReward(input: Omit<Reward, 'id'>): Reward {
  const reward: Reward = { ...input, id: uid('rwd') }
  put('rewards', reward.id, reward)
  return reward
}

export function rewardsByCompany(companyId: string): Reward[] {
  return all('rewards').filter((r) => r.companyId === companyId)
}

export function activeRewards(): Reward[] {
  return all('rewards').filter((r) => r.active && r.stock > 0)
}

export function redeemReward(userId: string, rewardId: string): { redemption: Redemption } | { error: string } {
  const reward = getById('rewards', rewardId)
  if (!reward) return { error: 'Reward not found.' }
  if (!reward.active || reward.stock <= 0) return { error: 'This reward is out of stock.' }
  const balance = pointsBalance(userId, reward.companyId)
  if (balance < reward.costPoints) return { error: 'Not enough points for this reward.' }

  const entry: PointsEntry = {
    id: uid('pts'),
    userId,
    companyId: reward.companyId,
    points: reward.costPoints,
    kind: 'redeemed',
    note: `Redeemed ${reward.title}`,
    createdAt: new Date().toISOString(),
  }
  put('points', entry.id, entry)
  put('rewards', reward.id, { ...reward, stock: reward.stock - 1 })

  const redemption: Redemption = {
    id: uid('rdm'),
    userId,
    rewardId,
    companyId: reward.companyId,
    pointsSpent: reward.costPoints,
    redeemedAt: new Date().toISOString(),
    code: uid('YALLA').toUpperCase(),
    status: 'issued',
  }
  put('redemptions', redemption.id, redemption)
  return { redemption }
}

export function redemptionsForUser(userId: string): Redemption[] {
  return all('redemptions').filter((r) => r.userId === userId)
}

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------

export function getUser(id: string): User | undefined {
  return getById('users', id)
}

export function searchUsers(query: string, excludeId?: string): User[] {
  const needle = query.trim().toLowerCase()
  if (!needle) return []
  return all('users')
    .filter((u) => u.id !== excludeId && u.role !== 'super_admin')
    .filter((u) => u.name.toLowerCase().includes(needle) || u.email?.toLowerCase().includes(needle))
    .slice(0, 20)
}

export function allCompanies(): User[] {
  return all('users').filter((u) => u.role === 'company')
}

export function allUsers(): User[] {
  return all('users').filter((u) => u.role === 'user')
}

export function seedIfEmpty(seed: () => void) {
  if (isEmpty()) seed()
}

export { bulkSeed }
