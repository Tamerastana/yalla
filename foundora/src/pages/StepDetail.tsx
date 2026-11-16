import { Link, Navigate, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Check, Lightbulb } from 'lucide-react'
import { StatusChip, StepBadge } from '../components/Layout'
import { useStore } from '../lib/store'
import { STAGE_LABELS } from '../lib/roadmap'

export default function StepDetail() {
  const { id } = useParams()
  const { roadmap, done, toggleTask, statusOf } = useStore()
  const idx = roadmap.findIndex((s) => s.id === id)
  if (idx < 0) return <Navigate to="/dashboard" replace />
  const step = roadmap[idx]
  const checked = done[step.id] ?? []
  const prev = roadmap[idx - 1]
  const next = roadmap[idx + 1]
  const status = statusOf(step)

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Link to="/dashboard" className="mb-6 inline-flex items-center gap-1 text-sm font-semibold text-muted hover:text-ink">
        <ArrowLeft size={16} /> Back to roadmap
      </Link>
      <div className="flex items-start gap-4">
        <StepBadge icon={step.icon} tone={step.tone} size={60} />
        <div className="flex-1">
          <p className="text-xs font-bold uppercase tracking-wider text-muted">
            Step {idx + 1} of {roadmap.length} · {STAGE_LABELS[step.stage]} · ~{step.weeks} week{step.weeks > 1 ? 's' : ''}
          </p>
          <h1 className="text-3xl font-extrabold tracking-tight">{step.title}</h1>
          <div className="mt-2"><StatusChip status={status} /></div>
        </div>
      </div>

      <div className="card mt-8 p-6">
        <h2 className="font-bold">Why this matters</h2>
        <p className="mt-2 text-ink/80">{step.why}</p>
      </div>

      <div className="card mt-4 p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-bold">Your tasks</h2>
          <span className="text-sm text-muted">{Math.min(checked.length, step.tasks.length)} / {step.tasks.length} done</span>
        </div>
        <ul className="mt-4 space-y-2">
          {step.tasks.map((t) => {
            const on = checked.includes(t.id)
            return (
              <li key={t.id}>
                <button
                  onClick={() => toggleTask(step.id, t.id)}
                  className={`flex w-full items-start gap-3 rounded-xl border p-3.5 text-left transition ${
                    on ? 'border-teal/30 bg-mint/60' : 'border-ink/10 hover:bg-cream'
                  }`}
                >
                  <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 ${on ? 'border-teal bg-teal text-white' : 'border-ink/25'}`}>
                    {on && <Check size={13} strokeWidth={3} />}
                  </span>
                  <span className={on ? 'text-ink/60 line-through' : ''}>{t.text}</span>
                </button>
              </li>
            )
          })}
        </ul>
      </div>

      <div className="mt-4 flex gap-3 rounded-2xl bg-peach/60 p-5">
        <Lightbulb className="shrink-0 text-coral" />
        <p className="text-sm text-ink/80"><b>Tip:</b> {step.tip}</p>
      </div>

      {step.tool && (
        <Link to={step.tool.to} className="btn-primary mt-6">
          {step.tool.label} <ArrowRight size={16} />
        </Link>
      )}

      <div className="mt-10 flex justify-between border-t border-ink/10 pt-6">
        {prev ? <Link to={`/roadmap/${prev.id}`} className="btn-ghost text-sm"><ArrowLeft size={16} /> {prev.title}</Link> : <span />}
        {next && <Link to={`/roadmap/${next.id}`} className="btn-ghost text-sm">{next.title} <ArrowRight size={16} /></Link>}
      </div>
    </div>
  )
}
