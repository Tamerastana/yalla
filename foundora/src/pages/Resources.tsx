import { useState } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, Building2, Download, FileText, Lock, PlayCircle } from 'lucide-react'
import { PageHeader } from '../components/Layout'
import { useStore } from '../lib/store'
import { EMIRATES, EMIRATE_INFO } from '../lib/uae'

interface Template { title: string; desc: string; premium: boolean; body: (idea: string) => string }

const TEMPLATES: Template[] = [
  {
    title: 'Lean Canvas',
    desc: 'Map your whole business model on one page.',
    premium: false,
    body: (idea) =>
      `LEAN CANVAS — ${idea}\n\n1. Problem (top 3):\n-\n-\n-\n\n2. Customer segments:\n\n3. Unique value proposition:\n\n4. Solution (top 3 features):\n\n5. Channels:\n\n6. Revenue streams:\n\n7. Cost structure:\n\n8. Key metrics:\n\n9. Unfair advantage:\n`,
  },
  {
    title: 'Customer Interview Notes',
    desc: 'A structured sheet for every conversation.',
    premium: false,
    body: (idea) =>
      `CUSTOMER INTERVIEW — ${idea}\n\nDate:\nPerson / profile:\n\nLast time they faced the problem:\n\nCurrent solution & cost:\n\nBiggest frustration:\n\nKey quote:\n\nSignal (strong / weak / none):\n\nReferrals:\n`,
  },
  {
    title: 'One-page Business Plan',
    desc: 'Summarise your plan for partners and programmes.',
    premium: true,
    body: (idea) =>
      `ONE-PAGE BUSINESS PLAN — ${idea}\n\nVision:\nProblem:\nSolution:\nTarget market (UAE):\nCompetitors & advantage:\nBusiness model & pricing:\nGo-to-market:\nTeam:\nFinancials (setup cost, monthly cost, break-even):\nMilestones (3 / 6 / 12 months):\nAsk (funding / support needed):\n`,
  },
  {
    title: '12-month Financial Forecast',
    desc: 'Revenue, costs and cash flow, month by month.',
    premium: true,
    body: (idea) =>
      `12-MONTH FORECAST — ${idea}\nMonth,Customers,Price (AED),Revenue,Variable costs,Fixed costs,Profit,Cash balance\n` +
      Array.from({ length: 12 }, (_, i) => `${i + 1},,,,,,,`).join('\n') + '\n',
  },
]

const ARTICLES = [
  { title: 'Mainland vs free zone: which licence is right for you?', time: '6 min read', topic: 'Licensing' },
  { title: 'How to run a customer interview that tells the truth', time: '5 min read', topic: 'Validation' },
  { title: 'Pricing your first product: cost, competition and value', time: '7 min read', topic: 'Pricing' },
  { title: 'VAT basics for small UAE businesses', time: '4 min read', topic: 'Finance' },
  { title: 'Marketing on a shoestring: Instagram, TikTok and communities', time: '6 min read', topic: 'Marketing' },
  { title: 'Break-even analysis explained with a real example', time: '4 min read', topic: 'Finance' },
]

const VIDEOS = [
  { title: 'From idea to first customer in 30 days', length: '12:40' },
  { title: 'Building a landing page in an afternoon (no code)', length: '18:05' },
  { title: 'Understanding UAE business licences', length: '9:30' },
]

function download(name: string, text: string) {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = name
  a.click()
  URL.revokeObjectURL(a.href)
}

export default function Resources() {
  const { profile, plan } = useStore()
  const [filter, setFilter] = useState(profile?.emirate ?? 'Dubai')
  const idea = profile?.idea || 'My startup'

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <PageHeader title="Resources & learning" sub="Templates, guides and the UAE startup ecosystem in one place." />

      <h2 className="mb-4 flex items-center gap-2 text-xl font-bold"><FileText size={20} className="text-teal" /> Templates</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {TEMPLATES.map((t) => {
          const locked = t.premium && plan !== 'premium'
          return (
            <div key={t.title} className="card flex flex-col p-5">
              <div className="flex items-start justify-between">
                <h3 className="font-bold">{t.title}</h3>
                {t.premium && <span className="chip bg-coral/15 text-coral">Premium</span>}
              </div>
              <p className="mt-1 flex-1 text-sm text-muted">{t.desc}</p>
              {locked ? (
                <Link to="/pricing" className="btn-ghost mt-4 text-sm"><Lock size={15} /> Unlock</Link>
              ) : (
                <button
                  onClick={() => download(`${t.title.toLowerCase().replace(/\s+/g, '-')}.${t.title.includes('Forecast') ? 'csv' : 'txt'}`, t.body(idea))}
                  className="btn-primary mt-4 text-sm"
                >
                  <Download size={15} /> Download
                </button>
              )}
            </div>
          )
        })}
      </div>

      <div className="mt-12 grid gap-8 lg:grid-cols-2">
        <div>
          <h2 className="mb-4 flex items-center gap-2 text-xl font-bold"><BookOpen size={20} className="text-teal" /> Guides</h2>
          <div className="card divide-y divide-ink/5">
            {ARTICLES.map((a) => (
              <Link key={a.title} to={`/assistant?q=${encodeURIComponent(a.title)}`} className="flex items-center justify-between gap-3 p-4 hover:bg-cream">
                <div>
                  <p className="font-semibold">{a.title}</p>
                  <p className="text-xs text-muted">{a.topic} · {a.time}</p>
                </div>
              </Link>
            ))}
          </div>
          <h2 className="mb-4 mt-8 flex items-center gap-2 text-xl font-bold"><PlayCircle size={20} className="text-teal" /> Video lessons</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {VIDEOS.map((v) => (
              <div key={v.title} className="card overflow-hidden">
                <div className="flex aspect-video items-center justify-center bg-gradient-to-br from-brand to-teal text-white">
                  <PlayCircle size={36} />
                </div>
                <div className="p-3">
                  <p className="text-sm font-semibold">{v.title}</p>
                  <p className="text-xs text-muted">{v.length} · coming soon</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="mb-4 flex items-center gap-2 text-xl font-bold"><Building2 size={20} className="text-teal" /> UAE ecosystem</h2>
          <div className="mb-4 flex flex-wrap gap-2">
            {EMIRATES.map((e) => (
              <button key={e} onClick={() => setFilter(e)} className={`chip px-3 py-1 ${filter === e ? 'bg-brand text-white' : 'bg-white text-ink/70 shadow-sm'}`}>
                {e}
              </button>
            ))}
          </div>
          <div className="card p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-muted">Licensing authority</p>
            <p className="font-semibold">{EMIRATE_INFO[filter].authority}</p>
            <p className="mt-4 text-xs font-bold uppercase tracking-wider text-muted">Free zones</p>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {EMIRATE_INFO[filter].freeZones.map((z) => <span key={z} className="chip bg-mint text-brand">{z}</span>)}
            </div>
            <p className="mt-4 text-xs font-bold uppercase tracking-wider text-muted">Support programmes</p>
            <ul className="mt-2 space-y-3">
              {EMIRATE_INFO[filter].ecosystem.map((e) => (
                <li key={e.name}>
                  <p className="font-semibold">{e.name}</p>
                  <p className="text-sm text-muted">{e.note}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
