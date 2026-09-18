import { addDays, addHours, subDays } from 'date-fns'
import { mockHash, uid } from '../lib/id'
import { bulkSeed } from '../lib/storage'
import type {
  Friendship,
  PointsEntry,
  Redemption,
  Registration,
  Reward,
  SportEvent,
  User,
} from '../types'

const iso = (d: Date) => d.toISOString()
const now = () => new Date()

function user(partial: Partial<User> & Pick<User, 'name'>): User {
  return {
    id: uid('usr'),
    passwordHash: mockHash('password123'),
    role: 'user',
    createdAt: iso(subDays(now(), 90)),
    ...partial,
  }
}

export function buildSeed() {
  // ---- People running the platform -----------------------------------
  const admin = user({
    name: 'Yalla HQ',
    email: 'admin@yalla.ae',
    role: 'super_admin',
    avatarUrl: 'https://api.dicebear.com/9.x/initials/svg?seed=Yalla%20HQ&backgroundColor=ea580c',
  })

  // ---- Companies --------------------------------------------------------
  const dsc = user({
    name: 'Dubai Sports Council',
    email: 'events@dubaisc.ae',
    role: 'company',
    city: 'Dubai',
    avatarUrl: 'https://api.dicebear.com/9.x/initials/svg?seed=DSC&backgroundColor=ea580c',
    company: { companyName: 'Dubai Sports Council', industry: 'Government Sports Authority', verified: true, verifiedAt: iso(subDays(now(), 60)), verifiedBy: admin.id, about: 'Official home of Dubai Fitness Challenge and city-wide sports initiatives.' },
  })
  const fitnessFirst = user({
    name: 'Fitness First UAE',
    email: 'community@fitnessfirst.ae',
    role: 'company',
    city: 'Dubai',
    avatarUrl: 'https://api.dicebear.com/9.x/initials/svg?seed=FF&backgroundColor=ea580c',
    company: { companyName: 'Fitness First UAE', industry: 'Gym & Fitness Chain', verified: true, verifiedAt: iso(subDays(now(), 40)), verifiedBy: admin.id, about: 'Group workouts, running clubs and member challenges across the UAE.' },
  })
  const padelPro = user({
    name: 'Padel Pro Club',
    email: 'hello@padelpro.ae',
    role: 'company',
    city: 'Abu Dhabi',
    avatarUrl: 'https://api.dicebear.com/9.x/initials/svg?seed=PP&backgroundColor=ea580c',
    company: { companyName: 'Padel Pro Club', industry: 'Racquet Sports Club', verified: true, verifiedAt: iso(subDays(now(), 20)), verifiedBy: admin.id, about: 'Abu Dhabi’s fastest growing padel community.' },
  })
  const weekendBallers = user({
    name: 'Weekend Ballers FC',
    email: 'weekendballers@gmail.com',
    role: 'company',
    city: 'Sharjah',
    avatarUrl: 'https://api.dicebear.com/9.x/initials/svg?seed=WB&backgroundColor=64748b',
    company: { companyName: 'Weekend Ballers FC', industry: 'Community Football Group', verified: false, about: 'Just a group of friends organizing 5-a-side games.' },
  })

  // ---- Regular users ------------------------------------------------------
  const ahmed = user({ name: 'Ahmed Al Mansoori', email: 'ahmed@example.com', city: 'Dubai', home: { lat: 25.0805, lng: 55.1403 }, avatarUrl: 'https://api.dicebear.com/9.x/initials/svg?seed=Ahmed&backgroundColor=fb923c' })
  const sara = user({ name: 'Sara Khan', email: 'sara@example.com', city: 'Dubai', home: { lat: 25.2048, lng: 55.2708 }, avatarUrl: 'https://api.dicebear.com/9.x/initials/svg?seed=Sara&backgroundColor=fb923c' })
  const omar = user({ name: 'Omar Haddad', email: 'omar@example.com', city: 'Sharjah', home: { lat: 25.3305, lng: 55.3841 }, avatarUrl: 'https://api.dicebear.com/9.x/initials/svg?seed=Omar&backgroundColor=fb923c' })
  const lina = user({ name: 'Lina Petrova', email: 'lina@example.com', city: 'Abu Dhabi', home: { lat: 24.4764, lng: 54.3705 }, avatarUrl: 'https://api.dicebear.com/9.x/initials/svg?seed=Lina&backgroundColor=fb923c' })
  const youssef = user({ name: 'Youssef Idris', email: 'youssef@example.com', city: 'Dubai', home: { lat: 25.1124, lng: 55.1390 }, avatarUrl: 'https://api.dicebear.com/9.x/initials/svg?seed=Youssef&backgroundColor=fb923c' })
  const maya = user({ name: 'Maya Fernandes', phone: '+971501234567', city: 'Dubai', home: { lat: 25.2285, lng: 55.3273 }, avatarUrl: 'https://api.dicebear.com/9.x/initials/svg?seed=Maya&backgroundColor=fb923c' })
  const demo = user({ name: 'Demo Player', email: 'demo@yalla.ae', city: 'Dubai', home: { lat: 25.1972, lng: 55.2744 }, bio: 'Just here to try out Yalla — padel on weekends, runs on weekdays.', avatarUrl: 'https://api.dicebear.com/9.x/initials/svg?seed=Demo&backgroundColor=fb923c' })

  const users = [admin, dsc, fitnessFirst, padelPro, weekendBallers, ahmed, sara, omar, lina, youssef, maya, demo]

  // ---- Events -------------------------------------------------------------
  const events: SportEvent[] = []
  const addEvent = (e: Omit<SportEvent, 'id' | 'createdAt' | 'isPromoted' | 'status'> & Partial<Pick<SportEvent, 'isPromoted' | 'status'>>) => {
    const ev: SportEvent = { id: uid('evt'), createdAt: iso(subDays(now(), 10)), isPromoted: false, status: 'upcoming', ...e }
    events.push(ev)
    return ev
  }

  const e30x30 = addEvent({
    title: '30x30 Community 5K Run — JLT',
    description: 'Free, timed 5K as part of Dubai Fitness Challenge. Pacers for every level, medal for finishers, hydration points every kilometre.',
    category: 'running', type: 'official', hostId: dsc.id,
    startsAt: iso(addDays(now(), 2)), endsAt: iso(addHours(addDays(now(), 2), 2)),
    location: { name: 'JLT Park', address: 'Cluster K, Jumeirah Lakes Towers', emirate: 'Dubai', point: { lat: 25.0693, lng: 55.1445 } },
    capacity: 300, priceAED: 0, pointsPerAttendee: 40,
    imageUrl: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?q=80&w=1200&auto=format&fit=crop',
    isPromoted: true, promotionTier: 3, promotedUntil: iso(addDays(now(), 10)),
  })
  const eBeachFootball = addEvent({
    title: 'Beach Football Tournament — Kite Beach',
    description: '5-a-side knockout tournament on the sand. Teams of 6, referees provided, trophies for the top 3 teams.',
    category: 'football', type: 'official', hostId: dsc.id,
    startsAt: iso(addDays(now(), 6)), endsAt: iso(addHours(addDays(now(), 6), 4)),
    location: { name: 'Kite Beach', address: 'Jumeirah 3', emirate: 'Dubai', point: { lat: 25.1547, lng: 55.2178 } },
    capacity: 120, priceAED: 50, pointsPerAttendee: 60,
    imageUrl: 'https://images.unsplash.com/photo-1517927033932-b3d18e61fb3a?q=80&w=1200&auto=format&fit=crop',
  })
  const eFitnessFirstBootcamp = addEvent({
    title: 'Sunrise Bootcamp — Members & Guests',
    description: 'High-energy outdoor HIIT bootcamp led by Fitness First trainers. Bring a mat and water.',
    category: 'fitness', type: 'official', hostId: fitnessFirst.id,
    startsAt: iso(addDays(now(), 1)), endsAt: iso(addHours(addDays(now(), 1), 1)),
    location: { name: 'Safa Park', address: 'Al Wasl', emirate: 'Dubai', point: { lat: 25.1972, lng: 55.2437 } },
    capacity: 60, priceAED: 0, pointsPerAttendee: 25,
    imageUrl: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=1200&auto=format&fit=crop',
    isPromoted: true, promotionTier: 2, promotedUntil: iso(addDays(now(), 5)),
  })
  const eSwim = addEvent({
    title: 'Open Water Swim Clinic',
    description: 'Coached open-water technique session followed by a 1.5K group swim. Wetsuits optional.',
    category: 'swimming', type: 'official', hostId: fitnessFirst.id,
    startsAt: iso(addDays(now(), 9)), endsAt: iso(addHours(addDays(now(), 9), 2)),
    location: { name: 'Jumeirah Beach', address: 'Umm Suqeim 2', emirate: 'Dubai', point: { lat: 25.1531, lng: 55.2280 } },
    capacity: 40, priceAED: 75, pointsPerAttendee: 35,
    imageUrl: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?q=80&w=1200&auto=format&fit=crop',
  })
  const ePadelLeague = addEvent({
    title: 'Padel Pro Weekly League — Night 4',
    description: 'Round-robin padel league, mixed levels. Rackets available to rent on site.',
    category: 'padel', type: 'official', hostId: padelPro.id,
    startsAt: iso(addDays(now(), 3)), endsAt: iso(addHours(addDays(now(), 3), 3)),
    location: { name: 'Padel Pro Club Al Reem', address: 'Al Reem Island', emirate: 'Abu Dhabi', point: { lat: 24.4989, lng: 54.4067 } },
    capacity: 32, priceAED: 90, pointsPerAttendee: 45,
    imageUrl: 'https://images.unsplash.com/photo-1615117972428-25c6f3f4b0ea?q=80&w=1200&auto=format&fit=crop',
    isPromoted: true, promotionTier: 1, promotedUntil: iso(addDays(now(), 6)),
  })
  const ePadelIntro = addEvent({
    title: 'Padel for Beginners — Free Taster',
    description: 'Never played padel? This 90-minute session covers the basics with pro coaches.',
    category: 'padel', type: 'official', hostId: padelPro.id,
    startsAt: iso(addDays(now(), 12)), endsAt: iso(addHours(addDays(now(), 12), 1.5)),
    location: { name: 'Padel Pro Club Al Reem', address: 'Al Reem Island', emirate: 'Abu Dhabi', point: { lat: 24.4989, lng: 54.4067 } },
    capacity: 24, priceAED: 0, pointsPerAttendee: 20,
    imageUrl: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=1200&auto=format&fit=crop',
  })

  // Community events (people / unverified companies) — never award points
  const eFridayBallers = addEvent({
    title: 'Friday 5-a-side — Casual Kickabout',
    description: 'Regulars welcome, drop-ins welcome too. We split teams on arrival. Bring your own bibs if you have them!',
    category: 'football', type: 'community', hostId: weekendBallers.id,
    startsAt: iso(addDays(now(), 2)), endsAt: iso(addHours(addDays(now(), 2), 1.5)),
    location: { name: 'Al Majaz Waterfront Courts', address: 'Al Majaz 2', emirate: 'Sharjah', point: { lat: 25.3277, lng: 55.3839 } },
    capacity: 20, priceAED: 20, pointsPerAttendee: 0,
    imageUrl: 'https://images.unsplash.com/photo-1543351611-58f69d7c1781?q=80&w=1200&auto=format&fit=crop',
  })
  const eMorningRun = addEvent({
    title: 'Marina Sunrise Run Club',
    description: 'Easy-pace 6K along the Marina walk. All levels, we regroup every 2K. Coffee after!',
    category: 'running', type: 'community', hostId: ahmed.id,
    startsAt: iso(addDays(now(), 1)), endsAt: iso(addHours(addDays(now(), 1), 1)),
    location: { name: 'Dubai Marina Walk', address: 'Marina Promenade', emirate: 'Dubai', point: { lat: 25.0805, lng: 55.1403 } },
    capacity: 15, priceAED: 0, pointsPerAttendee: 0,
    imageUrl: 'https://images.unsplash.com/photo-1571008887538-b36bb32f4571?q=80&w=1200&auto=format&fit=crop',
  })
  const eYoga = addEvent({
    title: 'Sunset Beach Yoga',
    description: 'Gentle vinyasa flow on the sand as the sun goes down. Bring your own mat.',
    category: 'yoga', type: 'community', hostId: sara.id,
    startsAt: iso(addDays(now(), 4)), endsAt: iso(addHours(addDays(now(), 4), 1)),
    location: { name: 'La Mer Beach', address: 'Jumeirah 1', emirate: 'Dubai', point: { lat: 25.2306, lng: 55.2635 } },
    capacity: 25, priceAED: 30, pointsPerAttendee: 0,
    imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=1200&auto=format&fit=crop',
  })
  const eHike = addEvent({
    title: 'Hatta Mountain Trail Hike',
    description: 'Moderate 10K trail with a swim stop at Hatta Dam. Carpool meetup posted after registration.',
    category: 'hiking', type: 'community', hostId: omar.id,
    startsAt: iso(addDays(now(), 8)), endsAt: iso(addHours(addDays(now(), 8), 5)),
    location: { name: 'Hatta Dam Trailhead', address: 'Hatta', emirate: 'Dubai', point: { lat: 24.8022, lng: 56.1201 } },
    capacity: 18, priceAED: 40, pointsPerAttendee: 0,
    imageUrl: 'https://images.unsplash.com/photo-1551632811-561732d1e306?q=80&w=1200&auto=format&fit=crop',
  })
  const eCricket = addEvent({
    title: 'Sunday Tape-Ball Cricket',
    description: 'Casual tape-ball cricket, teams picked on the day. All skill levels welcome.',
    category: 'cricket', type: 'community', hostId: youssef.id,
    startsAt: iso(addDays(now(), 5)), endsAt: iso(addHours(addDays(now(), 5), 3)),
    location: { name: 'Al Warqa Sports Ground', address: 'Al Warqa 4', emirate: 'Dubai', point: { lat: 25.1500, lng: 55.4144 } },
    capacity: 22, priceAED: 25, pointsPerAttendee: 0,
    imageUrl: 'https://images.unsplash.com/photo-1595435742656-5272d0b3fa82?q=80&w=1200&auto=format&fit=crop',
  })
  const eCycling = addEvent({
    title: 'Al Qudra Cycling Group Ride',
    description: '40K social ride on the cycle track, regroup points every 10K. Road bikes preferred.',
    category: 'cycling', type: 'community', hostId: maya.id,
    startsAt: iso(addDays(now(), 7)), endsAt: iso(addHours(addDays(now(), 7), 2)),
    location: { name: 'Al Qudra Cycle Track', address: 'Al Qudra Road', emirate: 'Dubai', point: { lat: 24.8797, lng: 55.4055 } },
    capacity: 30, priceAED: 0, pointsPerAttendee: 0,
    imageUrl: 'https://images.unsplash.com/photo-1541625602330-2277a4c46182?q=80&w=1200&auto=format&fit=crop',
  })
  const eKayak = addEvent({
    title: 'Mangrove Kayaking Morning',
    description: 'Guided kayak paddle through the Khor Kalba mangroves. Kayaks and life jackets provided.',
    category: 'watersports', type: 'community', hostId: lina.id,
    startsAt: iso(addDays(now(), 11)), endsAt: iso(addHours(addDays(now(), 11), 2)),
    location: { name: 'Khor Kalba Mangroves', address: 'Kalba', emirate: 'Sharjah', point: { lat: 25.0410, lng: 56.3550 } },
    capacity: 12, priceAED: 60, pointsPerAttendee: 0,
    imageUrl: 'https://images.unsplash.com/photo-1526401485004-46910ecc8e51?q=80&w=1200&auto=format&fit=crop',
  })

  // Past / completed events — used to seed profile history + earned points
  const ePastRun = addEvent({
    title: '30x30 Community 5K Run — Kite Beach',
    description: 'Free, timed 5K as part of Dubai Fitness Challenge.',
    category: 'running', type: 'official', hostId: dsc.id,
    startsAt: iso(subDays(now(), 6)), endsAt: iso(addHours(subDays(now(), 6), 2)),
    location: { name: 'Kite Beach', address: 'Jumeirah 3', emirate: 'Dubai', point: { lat: 25.1547, lng: 55.2178 } },
    capacity: 300, priceAED: 0, pointsPerAttendee: 40, status: 'completed',
    imageUrl: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?q=80&w=1200&auto=format&fit=crop',
  })
  const ePastPadel = addEvent({
    title: 'Padel Pro Weekly League — Night 2',
    description: 'Round-robin padel league, mixed levels.',
    category: 'padel', type: 'official', hostId: padelPro.id,
    startsAt: iso(subDays(now(), 13)), endsAt: iso(addHours(subDays(now(), 13), 3)),
    location: { name: 'Padel Pro Club Al Reem', address: 'Al Reem Island', emirate: 'Abu Dhabi', point: { lat: 24.4989, lng: 54.4067 } },
    capacity: 32, priceAED: 90, pointsPerAttendee: 45, status: 'completed',
    imageUrl: 'https://images.unsplash.com/photo-1615117972428-25c6f3f4b0ea?q=80&w=1200&auto=format&fit=crop',
  })
  const ePastBootcamp = addEvent({
    title: 'Sunrise Bootcamp — Members & Guests',
    description: 'High-energy outdoor HIIT bootcamp.',
    category: 'fitness', type: 'official', hostId: fitnessFirst.id,
    startsAt: iso(subDays(now(), 3)), endsAt: iso(addHours(subDays(now(), 3), 1)),
    location: { name: 'Safa Park', address: 'Al Wasl', emirate: 'Dubai', point: { lat: 25.1972, lng: 55.2437 } },
    capacity: 60, priceAED: 0, pointsPerAttendee: 25, status: 'completed',
    imageUrl: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=1200&auto=format&fit=crop',
  })
  void eBeachFootball
  void eSwim
  void ePadelIntro
  void eFitnessFirstBootcamp
  void eMorningRun
  void eKayak

  // ---- Registrations + attendance ------------------------------------------
  const registrations: Registration[] = []
  const points: PointsEntry[] = []
  const reg = (userId: string, event: SportEvent, status: Registration['status'] = 'registered') => {
    const r: Registration = { id: uid('reg'), eventId: event.id, userId, registeredAt: iso(subDays(now(), 1)), status }
    if (status === 'attended') {
      r.pointsAwarded = event.pointsPerAttendee
      if (event.type === 'official' && event.pointsPerAttendee > 0) {
        points.push({ id: uid('pts'), userId, companyId: event.hostId, eventId: event.id, points: event.pointsPerAttendee, kind: 'earned', note: `Attended ${event.title}`, createdAt: r.registeredAt })
      }
    }
    registrations.push(r)
    return r
  }

  // demo (current logged-in-friendly account) has a rich history
  reg(demo.id, ePastRun, 'attended')
  reg(demo.id, ePastPadel, 'attended')
  reg(demo.id, e30x30)
  reg(demo.id, ePadelLeague)
  reg(demo.id, eYoga)

  reg(ahmed.id, e30x30)
  reg(ahmed.id, ePastRun, 'attended')
  reg(sara.id, e30x30)
  reg(sara.id, eYoga)
  reg(sara.id, ePastBootcamp, 'attended')
  reg(omar.id, eFridayBallers)
  reg(omar.id, eHike)
  reg(lina.id, ePadelLeague)
  reg(lina.id, ePastPadel, 'attended')
  reg(youssef.id, eCricket)
  reg(youssef.id, eFridayBallers)
  reg(maya.id, eCycling)
  reg(maya.id, e30x30)
  reg(maya.id, ePastBootcamp, 'attended')

  // ---- Friendships -----------------------------------------------------
  const friendships: Friendship[] = [
    { id: uid('frq'), requesterId: demo.id, addresseeId: ahmed.id, status: 'accepted', createdAt: iso(subDays(now(), 30)) },
    { id: uid('frq'), requesterId: demo.id, addresseeId: sara.id, status: 'accepted', createdAt: iso(subDays(now(), 25)) },
    { id: uid('frq'), requesterId: lina.id, addresseeId: demo.id, status: 'accepted', createdAt: iso(subDays(now(), 15)) },
    { id: uid('frq'), requesterId: maya.id, addresseeId: demo.id, status: 'pending', createdAt: iso(subDays(now(), 2)) },
    { id: uid('frq'), requesterId: omar.id, addresseeId: ahmed.id, status: 'accepted', createdAt: iso(subDays(now(), 40)) },
  ]

  // ---- Rewards & redemptions --------------------------------------------
  const rewards: Reward[] = [
    { id: uid('rwd'), companyId: dsc.id, title: 'Dubai Fitness Challenge T-Shirt', description: 'Official 2025 DFC finisher tee, any size.', costPoints: 80, imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800&auto=format&fit=crop', stock: 50, active: true },
    { id: uid('rwd'), companyId: dsc.id, title: 'Free Entry — Any 30x30 Event', description: 'Skip the entry fee on any future Dubai Sports Council event.', costPoints: 40, imageUrl: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=800&auto=format&fit=crop', stock: 100, active: true },
    { id: uid('rwd'), companyId: fitnessFirst.id, title: '1 Week Free Gym Pass', description: 'Full access to any Fitness First club in the UAE for 7 days.', costPoints: 60, imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800&auto=format&fit=crop', stock: 30, active: true },
    { id: uid('rwd'), companyId: fitnessFirst.id, title: 'Personal Training Session', description: 'One 45-minute 1:1 session with a Fitness First coach.', costPoints: 120, imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=800&auto=format&fit=crop', stock: 15, active: true },
    { id: uid('rwd'), companyId: padelPro.id, title: 'Free Padel Court Hour', description: 'One free hour of court time, any off-peak slot.', costPoints: 70, imageUrl: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=800&auto=format&fit=crop', stock: 25, active: true },
    { id: uid('rwd'), companyId: padelPro.id, title: 'Padel Racket Rental Bundle', description: 'Racket + balls rental for your next 3 sessions.', costPoints: 45, imageUrl: 'https://images.unsplash.com/photo-1592656094267-764a45160876?q=80&w=800&auto=format&fit=crop', stock: 40, active: true },
  ]

  const redemptions: Redemption[] = [
    { id: uid('rdm'), userId: demo.id, rewardId: rewards[1].id, companyId: dsc.id, pointsSpent: 40, redeemedAt: iso(subDays(now(), 4)), code: 'YALLA-4F82K1', status: 'used' },
  ]
  points.push({ id: uid('pts'), userId: demo.id, companyId: dsc.id, points: 40, kind: 'redeemed', note: `Redeemed ${rewards[1].title}`, createdAt: redemptions[0].redeemedAt })

  bulkSeed({
    users: Object.fromEntries(users.map((u) => [u.id, u])),
    events: Object.fromEntries(events.map((e) => [e.id, e])),
    registrations: Object.fromEntries(registrations.map((r) => [r.id, r])),
    friendships: Object.fromEntries(friendships.map((f) => [f.id, f])),
    points: Object.fromEntries(points.map((p) => [p.id, p])),
    rewards: Object.fromEntries(rewards.map((r) => [r.id, r])),
    redemptions: Object.fromEntries(redemptions.map((r) => [r.id, r])),
  })

  return { demoUserId: demo.id }
}
