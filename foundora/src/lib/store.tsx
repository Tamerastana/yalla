/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { buildRoadmap, type Profile, type Step } from './roadmap'

export interface Evidence {
  id: string
  assumption: string
  evidence: string
  status: 'untested' | 'supported' | 'refuted'
  createdAt: string
}

export interface Interview {
  id: string
  person: string
  date: string
  quote: string
  signal: 'strong' | 'weak' | 'none'
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  text: string
  evidence?: { assumption: string; evidence: string }
  next?: { text: string; to: string }
}

export interface Booking {
  id: string
  service: string
  date: string
  topic: string
}

interface State {
  profile: Profile | null
  done: Record<string, string[]>
  evidence: Evidence[]
  interviews: Interview[]
  chat: ChatMessage[]
  plan: 'free' | 'premium'
  bookings: Booking[]
}

const EMPTY: State = { profile: null, done: {}, evidence: [], interviews: [], chat: [], plan: 'free', bookings: [] }
const KEY = 'foundora:v1'

function load(): State {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? { ...EMPTY, ...JSON.parse(raw) } : EMPTY
  } catch {
    return EMPTY
  }
}

export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36)

export type StepStatus = 'complete' | 'in-progress' | 'pending'

function useStoreValue() {
  const [state, setState] = useState<State>(load)

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state))
    } catch {
      /* storage unavailable — keep working in memory */
    }
  }, [state])

  const roadmap: Step[] = useMemo(() => (state.profile ? buildRoadmap(state.profile) : []), [state.profile])

  const statusOf = (step: Step): StepStatus => {
    const n = state.done[step.id]?.length ?? 0
    if (n >= step.tasks.length) return 'complete'
    const firstOpen = roadmap.find((s) => (state.done[s.id]?.length ?? 0) < s.tasks.length)
    if (n > 0 || firstOpen?.id === step.id) return 'in-progress'
    return 'pending'
  }

  const completedTasks = roadmap.reduce((a, s) => a + Math.min(state.done[s.id]?.length ?? 0, s.tasks.length), 0)
  const totalTasks = roadmap.reduce((a, s) => a + s.tasks.length, 0)

  return {
    ...state,
    roadmap,
    statusOf,
    progress: totalTasks ? completedTasks / totalTasks : 0,
    setProfile: (profile: Profile) =>
      setState((s) => ({ ...s, profile, done: s.profile ? s.done : {} })),
    toggleTask: (stepId: string, taskId: string) =>
      setState((s) => {
        const cur = s.done[stepId] ?? []
        const next = cur.includes(taskId) ? cur.filter((t) => t !== taskId) : [...cur, taskId]
        return { ...s, done: { ...s.done, [stepId]: next } }
      }),
    addEvidence: (e: Omit<Evidence, 'id' | 'createdAt'>) =>
      setState((s) => ({ ...s, evidence: [{ ...e, id: uid(), createdAt: new Date().toISOString() }, ...s.evidence] })),
    updateEvidence: (id: string, patch: Partial<Evidence>) =>
      setState((s) => ({ ...s, evidence: s.evidence.map((e) => (e.id === id ? { ...e, ...patch } : e)) })),
    removeEvidence: (id: string) => setState((s) => ({ ...s, evidence: s.evidence.filter((e) => e.id !== id) })),
    addInterview: (i: Omit<Interview, 'id'>) =>
      setState((s) => ({ ...s, interviews: [{ ...i, id: uid() }, ...s.interviews] })),
    removeInterview: (id: string) => setState((s) => ({ ...s, interviews: s.interviews.filter((i) => i.id !== id) })),
    pushChat: (...m: ChatMessage[]) => setState((s) => ({ ...s, chat: [...s.chat, ...m] })),
    clearChat: () => setState((s) => ({ ...s, chat: [] })),
    setPlan: (plan: State['plan']) => setState((s) => ({ ...s, plan })),
    addBooking: (b: Omit<Booking, 'id'>) => setState((s) => ({ ...s, bookings: [{ ...b, id: uid() }, ...s.bookings] })),
    reset: () => setState(EMPTY),
  }
}

type Store = ReturnType<typeof useStoreValue>
const Ctx = createContext<Store | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const value = useStoreValue()
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useStore() {
  const v = useContext(Ctx)
  if (!v) throw new Error('useStore outside provider')
  return v
}
