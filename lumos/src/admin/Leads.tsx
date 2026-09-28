import { Inbox, LoaderCircle, Mail, Phone, RefreshCw, Trash2 } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { WhatsAppIcon } from '../components/BrandIcons'
import { supabase } from '../lib/supabase'
import { Card, input } from './ui'

export interface Lead {
  id: string
  created_at: string
  name: string
  phone: string
  email: string | null
  interest: string | null
  package: string | null
  message: string | null
  lang: string | null
  status: LeadStatus
  notes: string | null
}

export const STATUSES = ['new', 'contacted', 'applied', 'enrolled', 'closed'] as const
export type LeadStatus = (typeof STATUSES)[number]

const STATUS_STYLE: Record<LeadStatus, string> = {
  new: 'bg-gold-500/15 text-gold-600',
  contacted: 'bg-sky-100 text-sky-700',
  applied: 'bg-violet-100 text-violet-700',
  enrolled: 'bg-emerald-100 text-emerald-700',
  closed: 'bg-navy-800/10 text-navy-800/60',
}

const fmt = new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Dubai' })

export function Leads({ onCount }: { onCount: (n: number) => void }) {
  const [leads, setLeads] = useState<Lead[] | null>(null)
  const [filter, setFilter] = useState<LeadStatus | 'all'>('all')
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!supabase) return
    const { data, error } = await supabase.from('leads').select('*').order('created_at', { ascending: false })
    if (error) setError(error.message)
    else {
      setError(null)
      setLeads(data as Lead[])
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    onCount(leads?.filter((l) => l.status === 'new').length ?? 0)
  }, [leads, onCount])

  async function update(id: string, patch: Partial<Lead>) {
    setLeads((ls) => ls?.map((l) => (l.id === id ? { ...l, ...patch } : l)) ?? null)
    const { error } = await supabase!.from('leads').update(patch).eq('id', id)
    if (error) {
      setError(error.message)
      void load()
    }
  }

  async function remove(id: string) {
    if (!confirm('Delete this request permanently?')) return
    setLeads((ls) => ls?.filter((l) => l.id !== id) ?? null)
    const { error } = await supabase!.from('leads').delete().eq('id', id)
    if (error) {
      setError(error.message)
      void load()
    }
  }

  const shown = leads?.filter((l) => filter === 'all' || l.status === filter) ?? []

  return (
    <Card
      title="Consultation requests"
      subtitle="Submitted through “Book a free consultation” and the package buttons on the website."
      actions={
        <div className="flex items-center gap-2">
          <select value={filter} onChange={(e) => setFilter(e.target.value as LeadStatus | 'all')} className={`${input} w-auto`}>
            <option value="all">All ({leads?.length ?? 0})</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s[0].toUpperCase() + s.slice(1)} ({leads?.filter((l) => l.status === s).length ?? 0})
              </option>
            ))}
          </select>
          <button type="button" onClick={() => void load()} className="grid size-9 place-items-center rounded-lg ring-1 ring-navy-800/15 hover:bg-navy-800/5" aria-label="Refresh">
            <RefreshCw size={16} />
          </button>
        </div>
      }
    >
      {error && <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      {!leads ? (
        <div className="grid place-items-center py-16 text-navy-800/50">
          <LoaderCircle className="animate-spin" />
        </div>
      ) : shown.length === 0 ? (
        <div className="grid place-items-center gap-2 py-16 text-center text-slate-ink">
          <Inbox size={32} className="text-navy-800/30" />
          No requests here yet.
        </div>
      ) : (
        <ul className="divide-y divide-navy-800/10">
          {shown.map((l) => (
            <li key={l.id} className="grid gap-4 py-5 lg:grid-cols-[1fr_auto]">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-navy-800">{l.name}</p>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${STATUS_STYLE[l.status]}`}>{l.status}</span>
                  {l.lang && <span className="rounded-full bg-navy-800/5 px-2 py-0.5 text-xs font-semibold uppercase text-navy-800/60">{l.lang}</span>}
                  <span className="text-xs text-slate-ink">{fmt.format(new Date(l.created_at))}</span>
                </div>
                <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm">
                  <a href={`tel:${l.phone.replace(/[^\d+]/g, '')}`} className="flex items-center gap-1.5 text-navy-800 hover:text-gold-600">
                    <Phone size={14} /> {l.phone}
                  </a>
                  <a
                    href={`https://wa.me/${l.phone.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 text-navy-800 hover:text-gold-600"
                  >
                    <WhatsAppIcon size={14} /> WhatsApp
                  </a>
                  {l.email && (
                    <a href={`mailto:${l.email}`} className="flex items-center gap-1.5 text-navy-800 hover:text-gold-600">
                      <Mail size={14} /> {l.email}
                    </a>
                  )}
                </div>
                <dl className="mt-3 grid gap-1 text-sm text-slate-ink sm:grid-cols-2">
                  {l.package && (
                    <div>
                      <dt className="inline font-semibold text-navy-800">Package: </dt>
                      <dd className="inline">{l.package}</dd>
                    </div>
                  )}
                  {l.interest && (
                    <div>
                      <dt className="inline font-semibold text-navy-800">Wants to study: </dt>
                      <dd className="inline">{l.interest}</dd>
                    </div>
                  )}
                </dl>
                {l.message && <p className="mt-2 rounded-lg bg-cream px-3 py-2 text-sm whitespace-pre-wrap text-navy-800">{l.message}</p>}
                <textarea
                  defaultValue={l.notes ?? ''}
                  onBlur={(e) => e.target.value !== (l.notes ?? '') && void update(l.id, { notes: e.target.value })}
                  placeholder="Internal notes (saved when you click away)"
                  rows={1}
                  className={`${input} mt-3 resize-y`}
                />
              </div>
              <div className="flex items-start gap-2">
                <select value={l.status} onChange={(e) => void update(l.id, { status: e.target.value as LeadStatus })} className={`${input} w-auto capitalize`}>
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => void remove(l.id)}
                  className="grid size-9 shrink-0 place-items-center rounded-lg text-red-600 ring-1 ring-red-200 hover:bg-red-50"
                  aria-label="Delete request"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}
