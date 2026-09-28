import type { Settings } from '../content/types'

export const whatsappLink = (s: Settings, text?: string) =>
  `https://wa.me/${s.whatsappNumber.replace(/\D/g, '')}${text ? `?text=${encodeURIComponent(text)}` : ''}`

export const phoneLink = (s: Settings) => `tel:${s.phoneLink.replace(/[^\d+]/g, '')}`

export const mapEmbedLink = (s: Settings, lang: string) =>
  `https://www.google.com/maps?q=${encodeURIComponent(s.mapQuery)}&hl=${lang}&z=15&output=embed`

export const directionsLink = (s: Settings) =>
  `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(s.mapQuery)}`
