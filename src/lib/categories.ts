import {
  Bike,
  Dumbbell,
  Footprints,
  Goal,
  Mountain,
  PersonStanding,
  Sparkles,
  Swords,
  Volleyball,
  Waves,
  type LucideIcon,
} from 'lucide-react'
import type { EventCategory } from '../types'

export const CATEGORY_META: Record<EventCategory, { label: string; icon: LucideIcon; color: string }> = {
  football: { label: 'Football', icon: Goal, color: 'bg-emerald-50 text-emerald-600' },
  running: { label: 'Running', icon: Footprints, color: 'bg-orange-50 text-orange-600' },
  padel: { label: 'Padel', icon: Swords, color: 'bg-lime-50 text-lime-600' },
  yoga: { label: 'Yoga', icon: PersonStanding, color: 'bg-purple-50 text-purple-600' },
  cycling: { label: 'Cycling', icon: Bike, color: 'bg-blue-50 text-blue-600' },
  swimming: { label: 'Swimming', icon: Waves, color: 'bg-cyan-50 text-cyan-600' },
  basketball: { label: 'Basketball', icon: Volleyball, color: 'bg-red-50 text-red-600' },
  hiking: { label: 'Hiking', icon: Mountain, color: 'bg-stone-100 text-stone-600' },
  cricket: { label: 'Cricket', icon: Swords, color: 'bg-teal-50 text-teal-600' },
  watersports: { label: 'Watersports', icon: Waves, color: 'bg-sky-50 text-sky-600' },
  fitness: { label: 'Fitness', icon: Dumbbell, color: 'bg-rose-50 text-rose-600' },
  'multi-sport': { label: 'Multi-sport', icon: Sparkles, color: 'bg-amber-50 text-amber-600' },
}

export const CATEGORY_LIST = Object.keys(CATEGORY_META) as EventCategory[]

export const EMIRATES = ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Ras Al Khaimah', 'Fujairah', 'Umm Al Quwain'] as const
