import { Link } from 'react-router-dom'
import { ArrowRight, BookOpen, Check, Cpu, Compass, LineChart, Rocket, Sparkles } from 'lucide-react'
import { useStore } from '../lib/store'

const FEATURES = [
  { icon: Cpu, title: 'AI-Powered Guidance', text: 'Ask any startup question and get advice tailored to your idea, budget and emirate.' },
  { icon: Compass, title: 'Personalised Roadmap', text: 'A step-by-step plan from idea to launch, built from your goals and timeline.' },
  { icon: BookOpen, title: 'Expert Resources & Learning', text: 'Templates, guides and UAE ecosystem links — all in one place.' },
  { icon: LineChart, title: 'Validation Tools & Insights', text: 'Interview scripts, an evidence tracker and offer tests to prove demand.' },
  { icon: Rocket, title: 'Launch with Confidence', text: 'Cost estimates, licence guidance and a launch plan before you spend.' },
]

function Skyline() {
  return (
    <svg viewBox="0 0 400 140" className="pointer-events-none absolute bottom-0 right-0 hidden w-[480px] text-teal/15 lg:block" aria-hidden>
      <g fill="currentColor">
        <rect x="10" y="80" width="22" height="60" /><rect x="36" y="60" width="18" height="80" />
        <rect x="58" y="90" width="26" height="50" /><rect x="90" y="40" width="16" height="100" />
        <rect x="112" y="70" width="24" height="70" /><rect x="142" y="50" width="20" height="90" />
        <path d="M196 140V20l6-20 6 20v120z" /><rect x="214" y="65" width="22" height="75" />
        <rect x="242" y="85" width="30" height="55" /><rect x="278" y="55" width="18" height="85" />
        <path d="M302 140V70q12-20 24 0v70z" /><rect x="332" y="90" width="26" height="50" /><rect x="364" y="75" width="20" height="65" />
      </g>
    </svg>
  )
}

export default function Home() {
  const { profile } = useStore()
  const cta = profile ? '/dashboard' : '/start'

  return (
    <>
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-peach/70 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 top-40 h-80 w-80 rounded-full bg-mint blur-3xl" />
        <Skyline />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 pb-20 pt-14 lg:grid-cols-2 lg:pt-20">
          <div>
            <span className="chip mb-5 bg-white text-teal shadow-sm">
              <Sparkles size={14} /> Built for first-time founders in the UAE
            </span>
            <h1 className="text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-6xl">
              Plan. Validate. <span className="text-coral">Launch.</span>
            </h1>
            <p className="mt-5 max-w-lg text-lg text-muted">
              Your AI-powered companion for turning ideas into successful startups in the UAE. Answer a few quick questions and get a
              personalised roadmap — from your first customer interview to launch day.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to={cta} className="btn-primary px-6 py-3 text-base">
                {profile ? 'Continue my roadmap' : 'Get started — it’s free'} <ArrowRight size={18} />
              </Link>
              <Link to="/assistant" className="btn-ghost px-6 py-3 text-base">
                Ask the assistant
              </Link>
            </div>
            <p className="mt-4 text-sm text-muted">For students, graduates and young professionals aged 18–35.</p>
          </div>

          {/* Product preview */}
          <div className="relative">
            <div className="card p-6">
              <div className="mb-4 flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-full bg-red-400" /><span className="h-3 w-3 rounded-full bg-amber-400" />
                <span className="h-3 w-3 rounded-full bg-emerald-400" />
                <span className="ml-3 rounded-md bg-ink/5 px-3 py-0.5 text-xs text-muted">foundora.ae/dashboard</span>
              </div>
              <h3 className="text-xl font-bold">Your startup roadmap</h3>
              <div className="my-5 flex items-center">
                {['Plan', 'Validate', 'Prepare', 'Launch', 'Grow'].map((s, i) => (
                  <div key={s} className="flex flex-1 items-center last:flex-none">
                    <div className="flex flex-col items-center gap-1">
                      <span className={`flex h-7 w-7 items-center justify-center rounded-full ${i < 3 ? 'bg-teal text-white' : 'border-2 border-ink/15 bg-white'}`}>
                        {i < 3 && <Check size={14} strokeWidth={3} />}
                      </span>
                      <span className="text-[11px] font-semibold text-muted">{s}</span>
                    </div>
                    {i < 4 && <span className={`mx-1 mb-5 h-1 flex-1 rounded ${i < 2 ? 'bg-teal' : 'bg-ink/10'}`} />}
                  </div>
                ))}
              </div>
              {[
                ['Define your customer', 'Complete', 'bg-emerald-100 text-emerald-700'],
                ['Interview 5 potential customers', 'In progress', 'bg-brand text-white'],
                ['Test your offer', 'Pending', 'bg-ink/5 text-ink/60'],
              ].map(([t, s, c]) => (
                <div key={t} className="mb-2 flex items-center justify-between rounded-xl border border-ink/5 px-4 py-3">
                  <span className="text-sm font-semibold">{t}</span>
                  <span className={`chip ${c}`}>{s}</span>
                </div>
              ))}
            </div>
            <div className="card absolute -bottom-8 -left-6 hidden max-w-xs p-4 sm:block">
              <p className="text-xs font-semibold text-teal">✦ Foundora Assistant</p>
              <p className="mt-1 text-sm">Sustainable fashion is growing in the UAE, especially among Gen Z. Want an interview script to test it?</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {FEATURES.map(({ icon: Icon, title, text }) => (
            <div key={title} className="card p-5">
              <Icon className="text-brand" size={28} />
              <h3 className="mt-3 font-bold">{title}</h3>
              <p className="mt-1 text-sm text-muted">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-2">
        <div className="rounded-3xl bg-peach/60 p-8">
          <p className="text-sm font-bold uppercase tracking-widest text-coral">The problem</p>
          <h2 className="mt-2 text-2xl font-extrabold">“I have a business idea — but where do I start?”</h2>
          <ul className="mt-5 space-y-3 text-ink/80">
            <li>• Turning an idea into an actionable plan is hard the first time.</li>
            <li>• Limited knowledge of customers, budgeting and market research.</li>
            <li>• Professional business advice is expensive and hard to access.</li>
          </ul>
        </div>
        <div className="rounded-3xl bg-mint p-8">
          <p className="text-sm font-bold uppercase tracking-widest text-teal">The solution</p>
          <h2 className="mt-2 text-2xl font-extrabold">Your idea. Your roadmap. Your startup.</h2>
          <ul className="mt-5 space-y-3 text-ink/80">
            <li>• <b>AI assistant</b> answers entrepreneurship questions instantly.</li>
            <li>• <b>Individual roadmap</b> of step-by-step activities for your idea.</li>
            <li>• <b>Customer validation</b> tools: interviews, offer tests and evidence.</li>
            <li>• <b>Learning resources</b>: templates, articles and UAE programmes.</li>
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="text-center text-3xl font-extrabold">How it works</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {[
            ['1', 'Tell us about your idea', 'Your idea, target customer, emirate, budget and available time — two minutes.'],
            ['2', 'Follow your roadmap', 'Nine practical steps across Plan, Validate, Prepare, Launch and Grow.'],
            ['3', 'Validate before you spend', 'Collect real customer evidence, estimate costs and launch with confidence.'],
          ].map(([n, t, d]) => (
            <div key={n} className="card p-6">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-coral font-extrabold text-white">{n}</span>
              <h3 className="mt-4 text-lg font-bold">{t}</h3>
              <p className="mt-1 text-muted">{d}</p>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col items-center gap-3 rounded-3xl bg-brand px-6 py-12 text-center text-white">
          <h2 className="text-3xl font-extrabold">Ready to turn your idea into a clear next step?</h2>
          <p className="text-white/80">Free to start. Premium from AED 59/month when you need more.</p>
          <Link to={cta} className="btn-coral mt-3 px-6 py-3 text-base">
            {profile ? 'Open my roadmap' : 'Build my roadmap'} <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </>
  )
}
