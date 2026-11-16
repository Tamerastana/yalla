import { useState, type FormEvent, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Clock, GraduationCap, Lightbulb, MapPin, User, Users, Wallet } from 'lucide-react'
import { useStore } from '../lib/store'
import { BUDGETS, EMIRATES, STAGES, TIMEFRAMES, type BudgetId, type Emirate, type TimeframeId } from '../lib/uae'

function Field({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <div className="flex gap-3">
      <span className="mt-8 text-ink/60">{icon}</span>
      <div className="flex-1">
        <label className="label">{label}</label>
        {children}
      </div>
    </div>
  )
}

export default function Onboarding() {
  const { profile, setProfile, reset } = useStore()
  const nav = useNavigate()
  const [f, setF] = useState({
    name: profile?.name ?? '',
    idea: profile?.idea ?? '',
    customer: profile?.customer ?? '',
    emirate: profile?.emirate ?? ('Dubai' as Emirate),
    budget: profile?.budget ?? ('10-50' as BudgetId),
    timeframe: profile?.timeframe ?? ('lt3' as TimeframeId),
    stage: profile?.stage ?? 'student',
  })
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value })

  const submit = (e: FormEvent) => {
    e.preventDefault()
    setProfile({ ...f, name: f.name.trim(), idea: f.idea.trim(), customer: f.customer.trim(), createdAt: profile?.createdAt ?? new Date().toISOString() })
    nav('/dashboard')
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 lg:grid-cols-[1fr_1.1fr]">
      <div className="lg:pt-8">
        <h1 className="text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
          Turn your idea into a <span className="text-coral">clear next step</span>
        </h1>
        <p className="mt-4 text-lg text-muted">Answer a few quick questions to get your personalised startup roadmap.</p>
        <ul className="mt-8 space-y-3 text-ink/80">
          <li>✓ Tailored to your emirate’s licensing options</li>
          <li>✓ Paced to your available time</li>
          <li>✓ Realistic for your budget</li>
          <li>✓ Saved in your browser — no account needed</li>
        </ul>
        {profile && (
          <button
            className="mt-8 text-sm font-semibold text-red-600 hover:underline"
            onClick={() => {
              if (confirm('Delete your profile, roadmap progress, evidence and chat history?')) {
                reset()
                nav('/')
              }
            }}
          >
            Reset all my data
          </button>
        )}
      </div>

      <form onSubmit={submit} className="card space-y-5 p-6 sm:p-8">
        <Field icon={<User size={20} />} label="Your first name">
          <input className="input" value={f.name} onChange={set('name')} placeholder="e.g. Aisha" required maxLength={40} />
        </Field>
        <Field icon={<Lightbulb size={20} />} label="Your business idea">
          <textarea
            className="input min-h-20"
            value={f.idea}
            onChange={set('idea')}
            placeholder="e.g. A sustainable fashion brand"
            required
            maxLength={200}
          />
        </Field>
        <Field icon={<Users size={20} />} label="Target customer">
          <input className="input" value={f.customer} onChange={set('customer')} placeholder="e.g. University students" required maxLength={100} />
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field icon={<MapPin size={20} />} label="UAE Emirate">
            <select className="input" value={f.emirate} onChange={set('emirate')}>
              {EMIRATES.map((e) => <option key={e}>{e}</option>)}
            </select>
          </Field>
          <Field icon={<GraduationCap size={20} />} label="You are a…">
            <select className="input" value={f.stage} onChange={set('stage')}>
              {STAGES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          </Field>
          <Field icon={<Wallet size={20} />} label="Budget range (AED)">
            <select className="input" value={f.budget} onChange={set('budget')}>
              {BUDGETS.map((b) => <option key={b.id} value={b.id}>{b.label}</option>)}
            </select>
          </Field>
          <Field icon={<Clock size={20} />} label="Available time">
            <select className="input" value={f.timeframe} onChange={set('timeframe')}>
              {TIMEFRAMES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
            </select>
          </Field>
        </div>
        <button className="btn-primary w-full py-3 text-base">
          {profile ? 'Update my roadmap' : 'Get started'} <ArrowRight size={18} />
        </button>
        {profile && <p className="text-center text-xs text-muted">Your completed tasks are kept when you update your answers.</p>}
      </form>
    </div>
  )
}
