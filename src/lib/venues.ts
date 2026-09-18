import type { Emirate, GeoPoint } from '../types'

export const EMIRATE_CENTER: Record<Emirate, GeoPoint> = {
  Dubai: { lat: 25.2048, lng: 55.2708 },
  'Abu Dhabi': { lat: 24.4539, lng: 54.3773 },
  Sharjah: { lat: 25.3463, lng: 55.4209 },
  Ajman: { lat: 25.4052, lng: 55.5136 },
  'Ras Al Khaimah': { lat: 25.7895, lng: 55.9432 },
  Fujairah: { lat: 25.1288, lng: 56.3265 },
  'Umm Al Quwain': { lat: 25.5647, lng: 55.5534 },
}

export interface PresetVenue {
  name: string
  address: string
  emirate: Emirate
  point: GeoPoint
}

export const PRESET_VENUES: PresetVenue[] = [
  { name: 'Kite Beach', address: 'Jumeirah 3', emirate: 'Dubai', point: { lat: 25.1547, lng: 55.2178 } },
  { name: 'Safa Park', address: 'Al Wasl', emirate: 'Dubai', point: { lat: 25.1972, lng: 55.2437 } },
  { name: 'Dubai Marina Walk', address: 'Marina Promenade', emirate: 'Dubai', point: { lat: 25.0805, lng: 55.1403 } },
  { name: 'JLT Park', address: 'Cluster K, Jumeirah Lakes Towers', emirate: 'Dubai', point: { lat: 25.0693, lng: 55.1445 } },
  { name: 'Al Qudra Cycle Track', address: 'Al Qudra Road', emirate: 'Dubai', point: { lat: 24.8797, lng: 55.4055 } },
  { name: 'Zabeel Park', address: 'Al Kifaf', emirate: 'Dubai', point: { lat: 25.2285, lng: 55.3067 } },
  { name: 'Corniche Beach', address: 'Corniche Road', emirate: 'Abu Dhabi', point: { lat: 24.4764, lng: 54.3238 } },
  { name: 'Al Reem Island Courts', address: 'Al Reem Island', emirate: 'Abu Dhabi', point: { lat: 24.4989, lng: 54.4067 } },
  { name: 'Al Majaz Waterfront', address: 'Al Majaz 2', emirate: 'Sharjah', point: { lat: 25.3277, lng: 55.3839 } },
  { name: 'Al Jazeera Park', address: 'Al Taawun', emirate: 'Sharjah', point: { lat: 25.3373, lng: 55.4104 } },
  { name: 'Ajman Corniche', address: 'Ajman Corniche Road', emirate: 'Ajman', point: { lat: 25.4111, lng: 55.4451 } },
  { name: 'Al Marjan Island', address: 'Al Marjan Island', emirate: 'Ras Al Khaimah', point: { lat: 25.6919, lng: 55.7539 } },
  { name: 'Other / custom location', address: '', emirate: 'Dubai', point: { lat: 25.2048, lng: 55.2708 } },
]

export const CATEGORY_STOCK_IMAGES: Record<string, string> = {
  football: 'https://images.unsplash.com/photo-1517927033932-b3d18e61fb3a?q=80&w=1200&auto=format&fit=crop',
  running: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?q=80&w=1200&auto=format&fit=crop',
  padel: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=1200&auto=format&fit=crop',
  yoga: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=1200&auto=format&fit=crop',
  cycling: 'https://images.unsplash.com/photo-1541625602330-2277a4c46182?q=80&w=1200&auto=format&fit=crop',
  swimming: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?q=80&w=1200&auto=format&fit=crop',
  basketball: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=1200&auto=format&fit=crop',
  hiking: 'https://images.unsplash.com/photo-1551632811-561732d1e306?q=80&w=1200&auto=format&fit=crop',
  cricket: 'https://images.unsplash.com/photo-1595435742656-5272d0b3fa82?q=80&w=1200&auto=format&fit=crop',
  watersports: 'https://images.unsplash.com/photo-1526401485004-46910ecc8e51?q=80&w=1200&auto=format&fit=crop',
  fitness: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=1200&auto=format&fit=crop',
  'multi-sport': 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=1200&auto=format&fit=crop',
}
