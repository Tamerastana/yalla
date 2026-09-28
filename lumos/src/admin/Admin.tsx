import type { Session } from '@supabase/supabase-js'
import { ExternalLink, Inbox, Languages, LoaderCircle, LogOut, Save, Settings as SettingsIcon } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { fetchContent, useContent } from '../content/ContentContext'
import { DEFAULT_CONTENT } from '../content/defaults'
import type { Lang, SiteContent } from '../content/types'
import { CONTENT_ROW_ID, supabase } from '../lib/supabase'
import { Leads } from './Leads'
import { Login } from './Login'
import { SettingsEditor } from './SettingsEditor'
import { TextsEditor } from './TextsEditor'

type Path = (string | number)[]
type Tab = 'requests' | 'texts' | 'settings'

function setIn(obj: unknown, path: Path, value: unknown): unknown {
  if (path.length === 0) return value
  const [k, ...rest] = path
  const copy = (Array.isArray(obj) ? [...obj] : { ...(obj as object) }) as Record<string | number, unknown>
  copy[k] = setIn(copy[k], rest, value)
  return copy
}

function getIn(obj: unknown, path: Path): unknown {
  return path.reduce<unknown>((o, k) => (o as Record<string | number, unknown>)?.[k], obj)
}

function SetupNotice() {
  return (
    <div className="grid min-h-screen place-items-center bg-navy-800 p-5">
      <div className="max-w-lg rounded-3xl bg-white p-8 text-navy-800 shadow-2xl">
        <h1 className="font-serif text-3xl font-medium">Admin panel isn’t connected yet</h1>
        <p className="mt-4 text-slate-ink">
          The admin panel needs a free Supabase project to store your texts and consultation requests. Follow the steps in the project’s <b>README</b>
          (“Admin panel setup”), then add <code className="rounded bg-navy-800/5 px-1">VITE_SUPABASE_URL</code> and{' '}
          <code className="rounded bg-navy-800/5 px-1">VITE_SUPABASE_ANON_KEY</code> to your hosting environment and redeploy.
        </p>
        <a href="/" className="btn-navy mt-6">
          Back to website
        </a>
      </div>
    </div>
  )
}

export default function Admin() {
  const { reload } = useContent()
  const [session, setSession] = useState<Session | null | undefined>(undefined)
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
  const [saved, setSaved] = useState<SiteContent | null>(null)
  const [draft, setDraft] = useState<SiteContent | null>(null)
  const [tab, setTab] = useState<Tab>('requests')
  const [newCount, setNewCount] = useState(0)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null)

  useEffect(() => {
    document.title = 'Admin — Lumos Global Education'
    if (!supabase) return
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => data.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!supabase || !session) return
    setIsAdmin(null)
    supabase.rpc('is_admin').then(({ data }) => setIsAdmin(data === true))
    fetchContent().then((c) => {
      setSaved(c)
      setDraft(c)
    })
  }, [session])

  const dirty = draft !== null && saved !== null && JSON.stringify(draft) !== JSON.stringify(saved)

  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if (dirty) e.preventDefault()
    }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty])

  const setText = useCallback((lang: Lang | 'both', path: Path, value: unknown) => {
    setDraft((d) => {
      if (!d) return d
      if (lang !== 'both') return { ...d, copy: { ...d.copy, [lang]: setIn(d.copy[lang], path, value) } } as SiteContent
      // List edits (add/remove a line) apply to both languages so they stay in step.
      const next = { ...d.copy }
      for (const l of ['en', 'ru'] as const) {
        const list = [...((getIn(next[l], path) as string[]) ?? [])]
        if (value === 'append') list.push('')
        else list.splice(value as number, 1)
        next[l] = setIn(next[l], path, list) as SiteContent['copy'][Lang]
      }
      return { ...d, copy: next }
    })
  }, [])

  async function save() {
    if (!supabase || !draft) return
    setSaving(true)
    setMessage(null)
    const { error } = await supabase.from('site_content').upsert({ id: CONTENT_ROW_ID, data: draft, updated_at: new Date().toISOString() })
    setSaving(false)
    if (error) setMessage({ ok: false, text: error.message })
    else {
      setSaved(draft)
      setMessage({ ok: true, text: 'Saved. The website is updated.' })
      void reload()
      setTimeout(() => setMessage(null), 4000)
    }
  }

  function resetDefaults() {
    if (confirm('Replace ALL texts and settings with the original defaults? (Nothing changes on the website until you press Save.)')) {
      setDraft(DEFAULT_CONTENT)
    }
  }

  if (!supabase) return <SetupNotice />
  if (session === undefined) return <Spinner />
  if (!session) return <Login logo={DEFAULT_CONTENT.settings.images.logo} />
  if (isAdmin === null || !draft) return <Spinner />
  if (!isAdmin)
    return (
      <div className="grid min-h-screen place-items-center bg-navy-800 p-5">
        <div className="max-w-md rounded-3xl bg-white p-8 text-center text-navy-800">
          <h1 className="font-serif text-3xl font-medium">No admin access</h1>
          <p className="mt-3 text-slate-ink">
            {session.user.email} is signed in but isn’t an admin. Ask the site owner to add you (see README → “Add an admin”).
          </p>
          <button type="button" onClick={() => void supabase!.auth.signOut()} className="btn-navy mt-6">
            Sign out
          </button>
        </div>
      </div>
    )

  const tabs: { id: Tab; label: string; icon: typeof Inbox; badge?: number }[] = [
    { id: 'requests', label: 'Requests', icon: Inbox, badge: newCount },
    { id: 'texts', label: 'Texts (EN / RU)', icon: Languages },
    { id: 'settings', label: 'Settings & images', icon: SettingsIcon },
  ]

  return (
    <div className="min-h-screen bg-[#f4f5f9]">
      <header className="sticky top-0 z-30 border-b border-navy-800/10 bg-white">
        <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <img src={draft.settings.images.logo} alt="Lumos" className="h-9 w-auto" />
            <span className="hidden rounded-full bg-navy-800 px-2.5 py-0.5 text-xs font-bold text-gold-400 sm:inline">Admin</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <a href="/" target="_blank" rel="noreferrer" className="flex items-center gap-1.5 rounded-lg px-3 py-2 font-semibold text-navy-800 hover:bg-navy-800/5">
              <ExternalLink size={15} /> <span className="hidden sm:inline">View site</span>
            </a>
            <button
              type="button"
              onClick={() => void supabase!.auth.signOut()}
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 font-semibold text-navy-800 hover:bg-navy-800/5"
            >
              <LogOut size={15} /> <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>
        <nav className="mx-auto flex max-w-[1200px] gap-1 overflow-x-auto px-4 sm:px-6">
          {tabs.map((tb) => (
            <button
              key={tb.id}
              type="button"
              onClick={() => setTab(tb.id)}
              className={`flex shrink-0 items-center gap-2 border-b-2 px-3 py-3 text-sm font-semibold transition ${
                tab === tb.id ? 'border-gold-500 text-navy-800' : 'border-transparent text-navy-800/55 hover:text-navy-800'
              }`}
            >
              <tb.icon size={16} />
              {tb.label}
              {!!tb.badge && <span className="rounded-full bg-gold-500 px-1.5 text-xs text-navy-900">{tb.badge}</span>}
            </button>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-[1200px] px-4 py-6 pb-32 sm:px-6">
        <div hidden={tab !== 'requests'}>
          <Leads onCount={setNewCount} />
        </div>
        {tab === 'texts' && <TextsEditor copy={draft.copy} setAt={setText} />}
        {tab === 'settings' && (
          <>
            <SettingsEditor settings={draft.settings} update={(p) => setDraft((d) => d && { ...d, settings: { ...d.settings, ...p } })} />
            <button type="button" onClick={resetDefaults} className="mt-6 text-sm font-semibold text-red-600 hover:underline">
              Reset everything to the original defaults
            </button>
          </>
        )}
      </main>

      {tab !== 'requests' && (dirty || message) && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-navy-800/10 bg-white/95 backdrop-blur">
          <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
            <p className={`text-sm font-medium ${message ? (message.ok ? 'text-emerald-700' : 'text-red-600') : 'text-navy-800'}`}>
              {message?.text ?? 'You have unsaved changes.'}
            </p>
            {dirty && (
              <div className="flex gap-2">
                <button type="button" onClick={() => setDraft(saved)} className="btn-outline-dark px-5 py-2.5 text-sm">
                  Discard
                </button>
                <button type="button" onClick={() => void save()} disabled={saving} className="btn-gold px-5 py-2.5 text-sm">
                  {saving ? <LoaderCircle size={16} className="animate-spin" /> : <Save size={16} />}
                  Save changes
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function Spinner() {
  return (
    <div className="grid min-h-screen place-items-center bg-[#f4f5f9] text-navy-800/50">
      <LoaderCircle className="animate-spin" />
    </div>
  )
}
