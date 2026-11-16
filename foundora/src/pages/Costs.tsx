import { useState } from 'react'
import { Info } from 'lucide-react'
import { PageHeader } from '../components/Layout'
import { useStore } from '../lib/store'
import { BUDGETS, EMIRATES, EMIRATE_INFO, fmtAED, type Emirate } from '../lib/uae'

type Setup = 'freelance' | 'freezone' | 'mainland'
const VISA_COST = 4_500 // indicative per-visa cost incl. medical & Emirates ID
const SETUP_LABEL: Record<Setup, string> = { freelance: 'Freelance permit', freezone: 'Free zone licence', mainland: 'Mainland licence' }

export default function Costs() {
  const { profile } = useStore()
  const budgetDefault = profile ? (() => { const b = BUDGETS.find((x) => x.id === profile.budget)!; return Math.round((b.min + b.max) / 2) })() : 30_000

  const [emirate, setEmirate] = useState<Emirate>(profile?.emirate ?? 'Dubai')
  const [setup, setSetup] = useState<Setup>('freezone')
  const [v, setV] = useState({
    budget: budgetDefault,
    visas: 1,
    website: 2_000,
    equipment: 3_000,
    launchMarketing: 2_500,
    workspace: 0,
    software: 300,
    marketing: 1_000,
    salaries: 0,
    other: 500,
    price: 59,
    variable: 14,
  })
  const n = (k: keyof typeof v) => (e: { target: { value: string } }) => setV({ ...v, [k]: Math.max(0, Number(e.target.value) || 0) })

  const info = EMIRATE_INFO[emirate]
  const licence =
    setup === 'freelance' ? 7_500 : setup === 'freezone' ? (info.freeZoneFee[0] + info.freeZoneFee[1]) / 2 : (info.mainlineFee[0] + info.mainlineFee[1]) / 2
  const visas = v.visas * VISA_COST
  const oneOff = licence + visas + v.website + v.equipment + v.launchMarketing
  const renewal = licence / 12
  const monthly = v.workspace + v.software + v.marketing + v.salaries + v.other + renewal
  const remaining = v.budget - oneOff
  const runway = monthly > 0 ? remaining / monthly : Infinity
  const contribution = v.price - v.variable
  const breakEven = contribution > 0 ? Math.ceil(monthly / contribution) : null

  const row = (label: string, value: number, hint?: string) => (
    <div className="flex justify-between py-1.5 text-sm">
      <span className="text-ink/75">{label}{hint && <span className="text-xs text-muted"> · {hint}</span>}</span>
      <span className="font-semibold">{fmtAED(value)}</span>
    </div>
  )
  const input = (k: keyof typeof v, label: string) => (
    <div>
      <label className="label text-xs">{label}</label>
      <input type="number" min={0} className="input" value={v[k]} onChange={n(k)} />
    </div>
  )

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <PageHeader title="Startup cost estimator" sub="Estimate your one-off and monthly costs, runway and break-even point in AED." />
      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="mb-4 font-bold">1. Business setup</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label text-xs">Emirate</label>
                <select className="input" value={emirate} onChange={(e) => setEmirate(e.target.value as Emirate)}>
                  {EMIRATES.map((e) => <option key={e}>{e}</option>)}
                </select>
              </div>
              <div>
                <label className="label text-xs">Setup type</label>
                <select className="input" value={setup} onChange={(e) => setSetup(e.target.value as Setup)}>
                  {(Object.keys(SETUP_LABEL) as Setup[]).map((s) => <option key={s} value={s}>{SETUP_LABEL[s]}</option>)}
                </select>
              </div>
              {input('visas', 'Number of visas needed')}
              {input('budget', 'Your total budget (AED)')}
            </div>
            <p className="mt-3 text-xs text-muted">
              {setup === 'freezone' ? `Free zones in ${emirate}: ${info.freeZones.join(', ')}.` : setup === 'mainland' ? `Mainland licences are issued by the ${info.authority}.` : 'Freelance permits suit solo service providers; availability depends on the emirate and activity.'}
            </p>
          </div>
          <div className="card p-6">
            <h2 className="mb-4 font-bold">2. One-off launch costs</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {input('website', 'Website & branding')}
              {input('equipment', 'Equipment / initial stock')}
              {input('launchMarketing', 'Launch marketing')}
            </div>
          </div>
          <div className="card p-6">
            <h2 className="mb-4 font-bold">3. Monthly running costs</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {input('workspace', 'Workspace / desk')}
              {input('software', 'Software & tools')}
              {input('marketing', 'Marketing')}
              {input('salaries', 'Salaries / freelancers')}
              {input('other', 'Other')}
            </div>
          </div>
          <div className="card p-6">
            <h2 className="mb-4 font-bold">4. Pricing & break-even</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {input('price', 'Price per sale / subscription (AED)')}
              {input('variable', 'Variable cost per sale (AED)')}
            </div>
          </div>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="card p-6">
            <h3 className="font-bold">One-off costs</h3>
            <div className="mt-2 divide-y divide-ink/5">
              {row(SETUP_LABEL[setup], licence, 'estimate')}
              {row('Visas', visas, `${v.visas} × ${fmtAED(VISA_COST)}`)}
              {row('Website & branding', v.website)}
              {row('Equipment / stock', v.equipment)}
              {row('Launch marketing', v.launchMarketing)}
            </div>
            <div className="mt-2 flex justify-between border-t-2 border-ink/10 pt-2 font-extrabold"><span>Total</span><span>{fmtAED(oneOff)}</span></div>
            <div className="mt-4 flex justify-between text-sm"><span className="text-ink/75">Monthly costs <span className="text-xs text-muted">incl. renewal set-aside</span></span><span className="font-bold">{fmtAED(monthly)}</span></div>
          </div>
          <div className={`rounded-2xl p-6 ${remaining < 0 ? 'bg-red-100' : runway < 3 ? 'bg-amber-100' : 'bg-mint'}`}>
            <p className="text-xs font-bold uppercase tracking-wider">Runway</p>
            <p className="mt-1 text-3xl font-extrabold">
              {remaining < 0 ? 'Over budget' : runway === Infinity ? '∞' : `${runway.toFixed(1)} months`}
            </p>
            <p className="mt-1 text-sm">
              {remaining < 0
                ? `Setup exceeds your budget by ${fmtAED(-remaining)}. Consider a cheaper setup type or fewer one-off costs.`
                : `${fmtAED(remaining)} left after setup.${runway < 3 ? ' Aim for at least 3 months of runway.' : ''}`}
            </p>
          </div>
          <div className="rounded-2xl bg-peach/70 p-6">
            <p className="text-xs font-bold uppercase tracking-wider">Break-even</p>
            <p className="mt-1 text-3xl font-extrabold">{breakEven === null ? '—' : `${breakEven.toLocaleString()} sales/mo`}</p>
            <p className="mt-1 text-sm">
              {breakEven === null ? 'Your price must be higher than your variable cost.' : `Each sale contributes ${fmtAED(contribution)} toward ${fmtAED(monthly)} monthly costs.`}
            </p>
          </div>
          <p className="flex gap-2 text-xs text-muted"><Info size={14} className="shrink-0" /> Indicative planning figures only. Licence and visa fees vary by activity and change often — confirm with the authority.</p>
        </aside>
      </div>
    </div>
  )
}
