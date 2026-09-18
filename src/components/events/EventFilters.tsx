import { Search, SlidersHorizontal, X } from 'lucide-react'
import { clsx } from 'clsx'
import { CATEGORY_LIST, CATEGORY_META } from '../../lib/categories'
import type { EventCategory } from '../../types'
import { Select } from '../ui/Input'

export interface Filters {
  query: string
  categories: EventCategory[]
  type: 'all' | 'official' | 'community'
  price: 'all' | 'free' | 'paid'
  radiusKm: number | null
  dateRange: 'all' | 'today' | 'week' | 'month'
  sortBy: 'relevance' | 'soonest' | 'distance'
}

export const DEFAULT_FILTERS: Filters = {
  query: '',
  categories: [],
  type: 'all',
  price: 'all',
  radiusKm: null,
  dateRange: 'all',
  sortBy: 'relevance',
}

export function EventFilters({ filters, onChange }: { filters: Filters; onChange: (f: Filters) => void }) {
  const toggleCategory = (c: EventCategory) => {
    const has = filters.categories.includes(c)
    onChange({ ...filters, categories: has ? filters.categories.filter((x) => x !== c) : [...filters.categories, c] })
  }

  const activeCount =
    filters.categories.length +
    (filters.type !== 'all' ? 1 : 0) +
    (filters.price !== 'all' ? 1 : 0) +
    (filters.radiusKm !== null ? 1 : 0) +
    (filters.dateRange !== 'all' ? 1 : 0)

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
        <input
          value={filters.query}
          onChange={(e) => onChange({ ...filters, query: e.target.value })}
          placeholder="Search events, sports, venues..."
          className="w-full rounded-2xl border border-ink-200 bg-white py-3 pl-11 pr-4 text-sm shadow-sm placeholder:text-ink-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
        {CATEGORY_LIST.map((c) => {
          const meta = CATEGORY_META[c]
          const active = filters.categories.includes(c)
          return (
            <button
              key={c}
              onClick={() => toggleCategory(c)}
              className={clsx(
                'flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-semibold transition-colors',
                active ? 'border-brand-500 bg-brand-500 text-white' : 'border-ink-200 bg-white text-ink-600 hover:border-brand-300',
              )}
            >
              <meta.icon size={13} /> {meta.label}
            </button>
          )
        })}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <SegButton
          options={[
            { value: 'all', label: 'All events' },
            { value: 'official', label: 'Official' },
            { value: 'community', label: 'Community' },
          ]}
          value={filters.type}
          onChange={(v) => onChange({ ...filters, type: v as Filters['type'] })}
        />

        <div className="ml-auto flex items-center gap-2">
          <div className="hidden items-center gap-1.5 sm:flex">
            <SlidersHorizontal size={14} className="text-ink-400" />
            <span className="text-xs font-semibold text-ink-400">{activeCount > 0 ? `${activeCount} filters` : 'Filters'}</span>
          </div>
          <Select value={filters.sortBy} onChange={(e) => onChange({ ...filters, sortBy: e.target.value as Filters['sortBy'] })} className="!w-auto py-2 text-xs">
            <option value="relevance">Sort: Relevance</option>
            <option value="soonest">Sort: Soonest</option>
            <option value="distance">Sort: Nearest</option>
          </Select>
          <Select value={filters.price} onChange={(e) => onChange({ ...filters, price: e.target.value as Filters['price'] })} className="!w-auto py-2 text-xs">
            <option value="all">Any price</option>
            <option value="free">Free only</option>
            <option value="paid">Paid only</option>
          </Select>
          <Select
            value={filters.radiusKm === null ? 'any' : String(filters.radiusKm)}
            onChange={(e) => onChange({ ...filters, radiusKm: e.target.value === 'any' ? null : Number(e.target.value) })}
            className="!w-auto py-2 text-xs"
          >
            <option value="any">Any distance</option>
            <option value="5">Within 5 km</option>
            <option value="10">Within 10 km</option>
            <option value="25">Within 25 km</option>
            <option value="50">Within 50 km</option>
          </Select>
          <Select value={filters.dateRange} onChange={(e) => onChange({ ...filters, dateRange: e.target.value as Filters['dateRange'] })} className="!w-auto py-2 text-xs">
            <option value="all">Any date</option>
            <option value="today">Today</option>
            <option value="week">This week</option>
            <option value="month">This month</option>
          </Select>
          {activeCount > 0 && (
            <button
              onClick={() => onChange({ ...DEFAULT_FILTERS, query: filters.query })}
              className="flex items-center gap-1 rounded-full px-2.5 py-2 text-xs font-semibold text-ink-500 hover:text-red-600"
            >
              <X size={13} /> Clear
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function SegButton<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[]
  value: T
  onChange: (v: T) => void
}) {
  return (
    <div className="inline-flex rounded-full border border-ink-200 bg-ink-50 p-1">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={clsx(
            'rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors',
            value === o.value ? 'bg-white text-brand-600 shadow-sm' : 'text-ink-500 hover:text-ink-800',
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}
