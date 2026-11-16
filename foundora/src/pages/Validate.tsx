import { useState, type FormEvent } from 'react'
import { Copy, Check, Plus, Trash2 } from 'lucide-react'
import { PageHeader } from '../components/Layout'
import { useStore, type Evidence, type Interview } from '../lib/store'

const TABS = ['Interviews', 'Evidence Tracker', 'Offer Test'] as const

export default function Validate() {
  const [tab, setTab] = useState<(typeof TABS)[number]>('Interviews')
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <PageHeader title="Validation tools" sub="Collect evidence from real customers before you spend money." />
      <div className="mb-6 inline-flex rounded-xl bg-white p-1 shadow-sm">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${tab === t ? 'bg-brand text-white' : 'text-ink/70 hover:text-ink'}`}
          >
            {t}
          </button>
        ))}
      </div>
      {tab === 'Interviews' && <Interviews />}
      {tab === 'Evidence Tracker' && <Tracker />}
      {tab === 'Offer Test' && <OfferTest />}
    </div>
  )
}

function Interviews() {
  const { profile, interviews, addInterview, removeInterview } = useStore()
  const [copied, setCopied] = useState(false)
  const [f, setF] = useState({ person: '', date: new Date().toISOString().slice(0, 10), quote: '', signal: 'strong' as Interview['signal'] })

  const cust = profile?.customer || 'your target customer'
  const idea = profile?.idea || 'your idea'
  const script = [
    `Intro: "Thanks for your time! I'm researching how ${cust} deal with a problem — I'm not selling anything."`,
    `1. Tell me a little about yourself and your typical week.`,
    `2. When was the last time you needed something like ${idea}? What happened?`,
    `3. How do you solve this today? What do you use or buy?`,
    `4. What's the most frustrating part of the current options?`,
    `5. How much do you spend on this (money or time) per month?`,
    `6. Have you looked for a better solution? What did you find?`,
    `7. If you could wave a magic wand, what would the ideal solution do?`,
    `8. Who else do you know who has this problem? Could you introduce me?`,
    `Close: "Can I show you an early version when it's ready?"`,
  ].join('\n')

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(script)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      /* clipboard blocked */
    }
  }

  const submit = (e: FormEvent) => {
    e.preventDefault()
    addInterview(f)
    setF({ ...f, person: '', quote: '' })
  }

  const strong = interviews.filter((i) => i.signal === 'strong').length

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="card p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Your interview script</h2>
          <button onClick={copy} className="btn-ghost !px-3 !py-1.5 text-sm">
            {copied ? <><Check size={15} /> Copied</> : <><Copy size={15} /> Copy</>}
          </button>
        </div>
        <ol className="mt-4 space-y-2.5 text-sm text-ink/80">
          {script.split('\n').map((l) => <li key={l}>{l}</li>)}
        </ol>
        <p className="mt-4 rounded-xl bg-peach/60 p-3 text-xs">
          <b>Golden rule:</b> ask about past behaviour, not future intentions. Listen 80%, talk 20%.
        </p>
      </div>

      <div className="space-y-4">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">Interview log</h2>
            <span className="chip bg-mint text-brand">{interviews.length}/5 done · {strong} strong signal{strong === 1 ? '' : 's'}</span>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-ink/10">
            <div className="h-full bg-teal transition-all" style={{ width: `${Math.min(interviews.length / 5, 1) * 100}%` }} />
          </div>
          <form onSubmit={submit} className="mt-5 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <input className="input" placeholder="Name or initials" value={f.person} onChange={(e) => setF({ ...f, person: e.target.value })} required maxLength={60} />
              <input className="input" type="date" value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} required />
            </div>
            <textarea className="input min-h-16" placeholder="Key quote or insight" value={f.quote} onChange={(e) => setF({ ...f, quote: e.target.value })} required maxLength={400} />
            <div className="flex gap-3">
              <select className="input" value={f.signal} onChange={(e) => setF({ ...f, signal: e.target.value as Interview['signal'] })}>
                <option value="strong">Strong signal — real pain</option>
                <option value="weak">Weak signal — mild interest</option>
                <option value="none">No signal — not a problem</option>
              </select>
              <button className="btn-primary shrink-0"><Plus size={16} /> Log</button>
            </div>
          </form>
        </div>
        {interviews.map((i) => (
          <div key={i.id} className="card flex gap-3 p-4">
            <span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${i.signal === 'strong' ? 'bg-emerald-500' : i.signal === 'weak' ? 'bg-amber-400' : 'bg-ink/30'}`} />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold">{i.person} <span className="font-normal text-muted">· {i.date}</span></p>
              <p className="mt-1 text-sm italic text-ink/75">“{i.quote}”</p>
            </div>
            <button onClick={() => removeInterview(i.id)} className="text-ink/40 hover:text-red-600" aria-label="Delete"><Trash2 size={16} /></button>
          </div>
        ))}
      </div>
    </div>
  )
}

const STATUS_STYLE: Record<Evidence['status'], string> = {
  untested: 'bg-ink/5 text-ink/70',
  supported: 'bg-emerald-100 text-emerald-700',
  refuted: 'bg-red-100 text-red-700',
}

function Tracker() {
  const { evidence, addEvidence, updateEvidence, removeEvidence } = useStore()
  const [f, setF] = useState({ assumption: '', evidence: '' })

  return (
    <div className="space-y-4">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          addEvidence({ ...f, status: 'untested' })
          setF({ assumption: '', evidence: '' })
        }}
        className="card grid gap-3 p-5 md:grid-cols-[1fr_1fr_auto]"
      >
        <input className="input" placeholder="Assumption, e.g. Students will pay AED 100/month" value={f.assumption} onChange={(e) => setF({ ...f, assumption: e.target.value })} required maxLength={200} />
        <input className="input" placeholder="Customer evidence (optional)" value={f.evidence} onChange={(e) => setF({ ...f, evidence: e.target.value })} maxLength={300} />
        <button className="btn-primary"><Plus size={16} /> Add</button>
      </form>

      {evidence.length === 0 && (
        <p className="card p-8 text-center text-muted">No assumptions yet. Add your riskiest assumption above, or track one from the assistant.</p>
      )}

      {evidence.map((e) => (
        <div key={e.id} className="card overflow-hidden">
          <div className="grid md:grid-cols-2">
            <div className="bg-peach/40 p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-coral">Assumption</p>
              <p className="mt-1 font-semibold">{e.assumption}</p>
            </div>
            <div className="bg-mint/50 p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-teal">Customer evidence</p>
              <textarea
                className="mt-1 w-full resize-none bg-transparent text-sm outline-none"
                rows={2}
                value={e.evidence}
                placeholder="What did customers say or do?"
                onChange={(ev) => updateEvidence(e.id, { evidence: ev.target.value })}
              />
            </div>
          </div>
          <div className="flex items-center justify-between gap-2 border-t border-ink/5 px-4 py-2.5">
            <div className="flex gap-1.5">
              {(['untested', 'supported', 'refuted'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => updateEvidence(e.id, { status: s })}
                  className={`chip capitalize transition ${e.status === s ? STATUS_STYLE[s] + ' ring-1 ring-current' : 'text-ink/40 hover:text-ink'}`}
                >
                  {s}
                </button>
              ))}
            </div>
            <button onClick={() => removeEvidence(e.id)} className="text-ink/40 hover:text-red-600" aria-label="Delete"><Trash2 size={16} /></button>
          </div>
        </div>
      ))}
    </div>
  )
}

function OfferTest() {
  const [v, setV] = useState({ reached: 100, signups: 8, paid: 2, target: 10 })
  const num = (k: keyof typeof v) => (e: { target: { value: string } }) => setV({ ...v, [k]: Math.max(0, Number(e.target.value) || 0) })
  const conv = v.reached ? (v.signups / v.reached) * 100 : 0
  const payConv = v.signups ? (v.paid / v.signups) * 100 : 0
  const verdict = conv >= v.target ? 'persevere' : conv >= v.target / 2 ? 'iterate' : 'pivot'

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="card space-y-4 p-6">
        <h2 className="text-lg font-bold">Smoke-test results</h2>
        <p className="text-sm text-muted">Share a landing page, Instagram post or WhatsApp catalogue describing your offer, then enter the results.</p>
        {[
          ['reached', 'People who saw the offer'],
          ['signups', 'Sign-ups / DMs / waitlist'],
          ['paid', 'Pre-orders or deposits'],
          ['target', 'Success target (% sign-up)'],
        ].map(([k, l]) => (
          <div key={k}>
            <label className="label">{l}</label>
            <input type="number" min={0} className="input" value={v[k as keyof typeof v]} onChange={num(k as keyof typeof v)} />
          </div>
        ))}
      </div>
      <div className="space-y-4">
        <div className="card grid grid-cols-2 gap-4 p-6 text-center">
          <div><p className="text-4xl font-extrabold text-brand">{conv.toFixed(1)}%</p><p className="text-sm text-muted">Sign-up rate</p></div>
          <div><p className="text-4xl font-extrabold text-coral">{payConv.toFixed(1)}%</p><p className="text-sm text-muted">Sign-up → paid</p></div>
        </div>
        <div className={`rounded-2xl p-6 ${verdict === 'persevere' ? 'bg-emerald-100' : verdict === 'iterate' ? 'bg-amber-100' : 'bg-red-100'}`}>
          <p className="text-xs font-bold uppercase tracking-wider">Recommendation</p>
          <p className="mt-1 text-2xl font-extrabold capitalize">{verdict}</p>
          <p className="mt-2 text-sm">
            {verdict === 'persevere' && 'You hit your target — strong evidence of demand. Move on to estimating costs and preparing to launch.'}
            {verdict === 'iterate' && 'Some interest, but below target. Try a sharper headline, a different price, or a narrower customer group and test again.'}
            {verdict === 'pivot' && 'Low response. Revisit your interviews — is the problem painful enough? Consider changing the customer, problem or offer.'}
          </p>
        </div>
      </div>
    </div>
  )
}
