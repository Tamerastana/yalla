import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { BarChart3, CheckCircle2, ChevronRight, Plus, Send, Trash2 } from 'lucide-react'
import { initials } from '../components/Layout'
import { answer, SUGGESTIONS } from '../lib/assistant'
import { uid, useStore, type ChatMessage } from '../lib/store'

// Renders **bold** and line breaks from assistant replies.
function Rich({ text }: { text: string }) {
  return (
    <>
      {text.split('\n').map((line, i) => (
        <p key={i} className={line.trim() === '' ? 'h-2' : ''}>
          {line.split(/(\*\*[^*]+\*\*)/g).map((part, j) =>
            part.startsWith('**') ? <b key={j}>{part.slice(2, -2)}</b> : <span key={j}>{part}</span>,
          )}
        </p>
      ))}
    </>
  )
}

export default function Assistant() {
  const { profile, chat, pushChat, clearChat, addEvidence, evidence } = useStore()
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const [params, setParams] = useSearchParams()
  const endRef = useRef<HTMLDivElement>(null)
  const handledQ = useRef(false)

  const ask = (q: string) => {
    const text = q.trim()
    if (!text || typing) return
    pushChat({ id: uid(), role: 'user', text })
    setInput('')
    setTyping(true)
    const r = answer(text, profile)
    window.setTimeout(() => {
      pushChat({ id: uid(), role: 'assistant', ...r })
      setTyping(false)
    }, 600 + Math.min(r.text.length, 900))
  }

  // Questions passed from roadmap steps (?q=...)
  useEffect(() => {
    const q = params.get('q')
    if (q && !handledQ.current) {
      handledQ.current = true
      setParams({}, { replace: true })
      ask(q)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [chat.length, typing])

  const submit = (e: FormEvent) => {
    e.preventDefault()
    ask(input)
  }

  const lastWithNext = [...chat].reverse().find((m) => m.next)
  const tracked = (m: ChatMessage) => !!m.evidence && evidence.some((e) => e.assumption === m.evidence!.assumption)

  return (
    <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 lg:grid-cols-[1fr_340px]">
      <div className="card flex h-[calc(100vh-9rem)] min-h-[520px] flex-col overflow-hidden">
        <div className="flex items-center justify-between border-b border-ink/5 p-5">
          <div className="flex items-center gap-3">
            <img src="/logo.svg" width={34} height={34} alt="" />
            <div>
              <h1 className="text-xl font-extrabold">Let’s validate your idea</h1>
              <p className="text-sm text-muted">Ask questions, explore insights and get actionable advice.</p>
            </div>
          </div>
          {chat.length > 0 && (
            <button onClick={clearChat} className="rounded-lg p-2 text-ink/50 hover:bg-ink/5" title="Clear conversation">
              <Trash2 size={18} />
            </button>
          )}
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          {chat.length === 0 && (
            <div className="py-6 text-center">
              <p className="text-muted">
                {profile ? <>Ask me anything about <b className="text-ink">{profile.idea}</b>.</> : <>Ask me anything about starting a business in the UAE. <Link to="/start" className="font-semibold text-teal underline">Create your profile</Link> for personalised answers.</>}
              </p>
              <div className="mx-auto mt-6 flex max-w-xl flex-wrap justify-center gap-2">
                {SUGGESTIONS.map((s) => (
                  <button key={s} onClick={() => ask(s)} className="rounded-full border border-teal/30 bg-mint/50 px-3.5 py-1.5 text-sm font-medium text-brand hover:bg-mint">
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
          {chat.map((m) =>
            m.role === 'user' ? (
              <div key={m.id} className="flex justify-end gap-2">
                <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-mint px-4 py-2.5 text-sm">{m.text}</div>
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand text-xs font-bold text-white">
                  {initials(profile?.name ?? '')}
                </span>
              </div>
            ) : (
              <div key={m.id} className="flex gap-2">
                <img src="/logo.svg" width={28} height={28} alt="" className="mt-1 h-7 w-7 shrink-0" />
                <div className="max-w-[85%] space-y-2">
                  <div className="space-y-0.5 rounded-2xl rounded-tl-sm bg-cream px-4 py-3 text-sm leading-relaxed">
                    <Rich text={m.text} />
                  </div>
                  {m.evidence && (
                    <button
                      disabled={tracked(m)}
                      onClick={() => addEvidence({ ...m.evidence!, status: 'untested' })}
                      className="inline-flex items-center gap-1 rounded-full border border-coral/30 px-3 py-1 text-xs font-semibold text-coral hover:bg-peach disabled:border-emerald-300 disabled:text-emerald-700"
                    >
                      {tracked(m) ? <><CheckCircle2 size={14} /> Added to Evidence Tracker</> : <><Plus size={14} /> Track this assumption</>}
                    </button>
                  )}
                </div>
              </div>
            ),
          )}
          {typing && (
            <div className="flex items-center gap-2">
              <img src="/logo.svg" width={28} height={28} alt="" />
              <div className="flex gap-1 rounded-2xl bg-cream px-4 py-3">
                {[0, 1, 2].map((i) => (
                  <span key={i} className="h-2 w-2 animate-bounce rounded-full bg-teal" style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        <form onSubmit={submit} className="flex gap-2 border-t border-ink/5 p-4">
          <input className="input" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask a follow-up question…" maxLength={500} />
          <button className="btn-primary !px-4" disabled={!input.trim() || typing} aria-label="Send">
            <Send size={18} />
          </button>
        </form>
      </div>

      <aside className="space-y-4">
        <div className="card overflow-hidden">
          <div className="flex items-center gap-2 p-4 font-bold"><BarChart3 size={18} className="text-teal" /> Evidence Tracker</div>
          {evidence.length === 0 ? (
            <p className="px-4 pb-4 text-sm text-muted">Track assumptions from the assistant’s answers to build your validation evidence.</p>
          ) : (
            <div className="divide-y divide-ink/5">
              {evidence.slice(0, 4).map((e) => (
                <div key={e.id} className="grid grid-cols-2 text-xs">
                  <div className="bg-peach/50 p-3"><p className="font-bold">Assumption</p><p className="mt-1 text-ink/70">{e.assumption}</p></div>
                  <div className="bg-mint/60 p-3"><p className="font-bold">Evidence</p><p className="mt-1 text-ink/70">{e.evidence || '—'}</p></div>
                </div>
              ))}
            </div>
          )}
          <Link to="/validate" className="block border-t border-ink/5 p-3 text-center text-sm font-semibold text-teal hover:bg-mint/40">
            Open full tracker
          </Link>
        </div>
        {lastWithNext?.next && (
          <Link to={lastWithNext.next.to} className="flex items-center gap-3 rounded-2xl bg-mint p-4 hover:brightness-95">
            <CheckCircle2 className="shrink-0 text-teal" />
            <div className="flex-1">
              <p className="font-bold">Next step recommendation</p>
              <p className="text-sm text-ink/70">{lastWithNext.next.text}</p>
            </div>
            <ChevronRight className="text-teal" />
          </Link>
        )}
        <p className="px-1 text-xs text-muted">
          The assistant gives general guidance based on your profile. For legal, visa or tax decisions, confirm with the relevant UAE authority or book a specialist.
        </p>
      </aside>
    </div>
  )
}
