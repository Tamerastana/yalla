import { Link } from 'react-router-dom'
import { Check, ChevronRight, MessageSquare, Pencil } from 'lucide-react'
import { PageHeader, StatusChip, StepBadge } from '../components/Layout'
import { useStore } from '../lib/store'
import { STAGE_LABELS, STAGE_ORDER } from '../lib/roadmap'
import { EMIRATE_INFO, TIMEFRAMES } from '../lib/uae'

export default function Dashboard() {
  const { profile, roadmap, statusOf, progress, done, evidence, interviews } = useStore()
  if (!profile) return null

  const stageDone = (st: string) => roadmap.filter((s) => s.stage === st).every((s) => statusOf(s) === 'complete')
  const stageStarted = (st: string) => roadmap.some((s) => s.stage === st && (done[s.id]?.length ?? 0) > 0)
  const current = roadmap.find((s) => statusOf(s) !== 'complete')
  const time = TIMEFRAMES.find((t) => t.id === profile.timeframe)!
  const totalWeeks = roadmap.reduce((a, s) => a + s.weeks, 0)

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <PageHeader title={`Your startup roadmap${profile.name ? `, ${profile.name}` : ''}`} sub={`A personalised plan to validate and grow “${profile.idea}”.`}>
        <Link to="/start" className="btn-ghost text-sm"><Pencil size={16} /> Edit answers</Link>
      </PageHeader>

      {/* Stage tracker */}
      <div className="card mb-8 p-6">
        <div className="flex items-center">
          {STAGE_ORDER.map((st, i) => {
            const isDone = stageDone(st)
            const started = stageStarted(st)
            return (
              <div key={st} className="flex flex-1 items-center last:flex-none">
                <div className="flex flex-col items-center gap-2">
                  <span
                    className={`flex h-9 w-9 items-center justify-center rounded-full transition ${
                      isDone ? 'bg-teal text-white' : started ? 'border-4 border-teal bg-white' : 'border-2 border-ink/15 bg-white'
                    }`}
                  >
                    {isDone && <Check size={18} strokeWidth={3} />}
                  </span>
                  <span className="text-xs font-semibold text-muted sm:text-sm">{STAGE_LABELS[st]}</span>
                </div>
                {i < STAGE_ORDER.length - 1 && <span className={`mx-1 mb-7 h-1 flex-1 rounded ${isDone ? 'bg-teal' : 'bg-ink/10'}`} />}
              </div>
            )
          })}
        </div>
        <div className="mt-6">
          <div className="mb-1 flex justify-between text-sm">
            <span className="font-semibold">Overall progress</span>
            <span className="text-muted">{Math.round(progress * 100)}%</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-ink/10">
            <div className="h-full rounded-full bg-gradient-to-r from-teal to-brand transition-all" style={{ width: `${progress * 100}%` }} />
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="space-y-3">
          {roadmap.map((s) => (
            <Link key={s.id} to={`/roadmap/${s.id}`} className="card flex items-center gap-4 p-4 transition hover:-translate-y-0.5 hover:shadow-lg">
              <StepBadge icon={s.icon} tone={s.tone} />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold uppercase tracking-wider text-muted">{STAGE_LABELS[s.stage]} · ~{s.weeks} wk</p>
                <h3 className="font-bold">{s.title}</h3>
                <p className="truncate text-sm text-muted">{s.summary}</p>
              </div>
              <div className="hidden flex-col items-end gap-1 sm:flex">
                <StatusChip status={statusOf(s)} />
                <span className="text-xs text-muted">{Math.min(done[s.id]?.length ?? 0, s.tasks.length)}/{s.tasks.length} tasks</span>
              </div>
              <ChevronRight className="text-ink/40" />
            </Link>
          ))}
        </div>

        <aside className="space-y-4">
          {current && (
            <div className="rounded-2xl bg-mint p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-teal">Next step</p>
              <h3 className="mt-1 text-lg font-bold">{current.title}</h3>
              <p className="mt-1 text-sm text-ink/70">{current.summary}</p>
              <Link to={`/roadmap/${current.id}`} className="btn-primary mt-4 w-full text-sm">Continue</Link>
            </div>
          )}
          {!current && (
            <div className="rounded-2xl bg-emerald-100 p-5">
              <h3 className="text-lg font-bold">🎉 Roadmap complete!</h3>
              <p className="mt-1 text-sm">Amazing work. Consider a specialist business-plan review to prepare for accelerators.</p>
              <Link to="/pricing" className="btn-primary mt-4 w-full text-sm">Book a review</Link>
            </div>
          )}
          <div className="card p-5">
            <h3 className="font-bold">Your profile</h3>
            <dl className="mt-3 space-y-2 text-sm">
              <div><dt className="text-muted">Customer</dt><dd className="font-semibold">{profile.customer}</dd></div>
              <div><dt className="text-muted">Emirate</dt><dd className="font-semibold">{profile.emirate}</dd></div>
              <div><dt className="text-muted">Timeline</dt><dd className="font-semibold">{time.label} · plan spans ~{totalWeeks} weeks</dd></div>
              <div><dt className="text-muted">Licensing authority</dt><dd className="font-semibold">{EMIRATE_INFO[profile.emirate].authority}</dd></div>
            </dl>
          </div>
          <div className="card grid grid-cols-2 gap-3 p-5 text-center">
            <Link to="/validate" className="rounded-xl bg-peach/60 p-3 hover:bg-peach">
              <p className="text-2xl font-extrabold">{interviews.length}<span className="text-base text-muted">/5</span></p>
              <p className="text-xs font-semibold text-muted">Interviews</p>
            </Link>
            <Link to="/validate" className="rounded-xl bg-mint p-3 hover:brightness-95">
              <p className="text-2xl font-extrabold">{evidence.length}</p>
              <p className="text-xs font-semibold text-muted">Assumptions tracked</p>
            </Link>
          </div>
          <Link to="/assistant" className="card flex items-center gap-3 p-5 hover:bg-mint/40">
            <MessageSquare className="text-teal" />
            <div>
              <p className="font-bold">Stuck? Ask the assistant</p>
              <p className="text-sm text-muted">Advice tailored to your idea</p>
            </div>
          </Link>
        </aside>
      </div>
    </div>
  )
}
