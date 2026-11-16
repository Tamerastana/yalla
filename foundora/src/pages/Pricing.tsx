import { useState, type FormEvent } from 'react'
import { Check, X } from 'lucide-react'
import { PageHeader } from '../components/Layout'
import { useStore } from '../lib/store'

const PLANS = [
  {
    id: 'free' as const,
    name: 'Basic',
    price: 'Free',
    per: '',
    blurb: 'Introductory entrepreneurship guidance.',
    features: ['Personalised startup roadmap', 'AI business assistant', 'Interview tools & Evidence Tracker', 'Cost estimator', 'Starter templates'],
  },
  {
    id: 'premium' as const,
    name: 'Premium',
    price: 'AED 59',
    per: '/month',
    blurb: 'Advanced features and templates.',
    features: ['Everything in Basic', 'Business plan & 12-month forecast templates', 'Priority assistant answers', 'Discounted specialist sessions', 'Early access to new tools'],
  },
]

const SERVICES = [
  { name: 'Specialist consultation', price: 150, desc: '45-minute 1:1 session with a startup specialist on any topic.' },
  { name: 'Business plan review', price: 299, desc: 'Detailed written feedback on your business plan within 5 working days.' },
]

export default function Pricing() {
  const { plan, setPlan, bookings, addBooking } = useStore()
  const [booking, setBooking] = useState<string | null>(null)
  const [form, setForm] = useState({ date: '', topic: '' })
  const [toast, setToast] = useState('')

  const flash = (m: string) => {
    setToast(m)
    setTimeout(() => setToast(''), 2500)
  }

  const book = (e: FormEvent) => {
    e.preventDefault()
    if (!booking) return
    addBooking({ service: booking, ...form })
    setBooking(null)
    setForm({ date: '', topic: '' })
    flash('Request sent! A specialist will confirm by email.')
  }

  const today = new Date().toISOString().slice(0, 10)

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <PageHeader title="Simple, founder-friendly pricing" sub="Start free. Upgrade when you need more depth." />

      <div className="grid gap-6 md:grid-cols-2">
        {PLANS.map((p) => {
          const active = plan === p.id
          return (
            <div key={p.id} className={`card relative flex flex-col p-7 ${p.id === 'premium' ? 'ring-2 ring-coral' : ''}`}>
              {p.id === 'premium' && <span className="chip absolute -top-3 left-7 bg-coral text-white">Most popular</span>}
              <h2 className="text-lg font-bold">{p.name}</h2>
              <p className="mt-2"><span className="text-4xl font-extrabold">{p.price}</span><span className="text-muted">{p.per}</span></p>
              <p className="mt-1 text-sm text-muted">{p.blurb}</p>
              <ul className="mt-6 flex-1 space-y-2.5">
                {p.features.map((f) => (
                  <li key={f} className="flex gap-2 text-sm"><Check size={18} className="shrink-0 text-teal" /> {f}</li>
                ))}
              </ul>
              <button
                disabled={active}
                onClick={() => {
                  setPlan(p.id)
                  flash(p.id === 'premium' ? 'Premium activated (demo — no payment taken).' : 'Switched to the Basic plan.')
                }}
                className={`${p.id === 'premium' ? 'btn-coral' : 'btn-ghost'} mt-6 w-full`}
              >
                {active ? 'Current plan' : p.id === 'premium' ? 'Upgrade to Premium' : 'Switch to Basic'}
              </button>
            </div>
          )
        })}
      </div>

      <h2 className="mb-4 mt-14 text-2xl font-extrabold">Expert services</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {SERVICES.map((s) => (
          <div key={s.name} className="card flex flex-col p-6">
            <div className="flex items-baseline justify-between">
              <h3 className="font-bold">{s.name}</h3>
              <p className="text-xl font-extrabold">AED {s.price}</p>
            </div>
            <p className="mt-1 flex-1 text-sm text-muted">{s.desc}</p>
            {plan === 'premium' && <p className="mt-2 text-xs font-semibold text-coral">Premium: 15% off → AED {Math.round(s.price * 0.85)}</p>}
            <button onClick={() => setBooking(s.name)} className="btn-primary mt-4">Book</button>
          </div>
        ))}
      </div>

      {bookings.length > 0 && (
        <div className="card mt-6 p-5">
          <h3 className="font-bold">Your requests</h3>
          <ul className="mt-2 divide-y divide-ink/5 text-sm">
            {bookings.map((b) => (
              <li key={b.id} className="flex justify-between py-2">
                <span>{b.service} — <span className="text-muted">{b.topic}</span></span>
                <span className="chip bg-amber-100 text-amber-700">{b.date} · pending</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {booking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4" onClick={() => setBooking(null)}>
          <form onSubmit={book} onClick={(e) => e.stopPropagation()} className="card w-full max-w-md space-y-4 p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold">Book: {booking}</h3>
              <button type="button" onClick={() => setBooking(null)} aria-label="Close"><X size={20} /></button>
            </div>
            <div>
              <label className="label">Preferred date</label>
              <input type="date" min={today} className="input" required value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </div>
            <div>
              <label className="label">What would you like help with?</label>
              <textarea className="input min-h-24" required maxLength={400} value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })} />
            </div>
            <button className="btn-primary w-full">Send request</button>
          </form>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl bg-ink px-5 py-3 text-sm font-semibold text-white shadow-lg">{toast}</div>
      )}
    </div>
  )
}
