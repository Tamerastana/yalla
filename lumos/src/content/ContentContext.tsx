import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { CONTENT_ROW_ID, supabase } from '../lib/supabase'
import { mergeContent } from '../lib/merge'
import { DEFAULT_CONTENT } from './defaults'
import { LANGS, type Copy, type Lang, type Settings, type SiteContent } from './types'

interface ContentState {
  content: SiteContent
  settings: Settings
  t: Copy
  lang: Lang
  setLang: (l: Lang) => void
  reload: () => Promise<void>
}

const Ctx = createContext<ContentState | null>(null)
const LANG_KEY = 'lumos-lang'

function initialLang(): Lang {
  const fromUrl = new URLSearchParams(window.location.search).get('lang')
  if (fromUrl && LANGS.includes(fromUrl as Lang)) return fromUrl as Lang
  try {
    const saved = localStorage.getItem(LANG_KEY)
    if (saved && LANGS.includes(saved as Lang)) return saved as Lang
  } catch {
    /* storage unavailable */
  }
  return 'en'
}

export async function fetchContent(): Promise<SiteContent> {
  if (!supabase) return DEFAULT_CONTENT
  const { data, error } = await supabase.from('site_content').select('data').eq('id', CONTENT_ROW_ID).maybeSingle()
  if (error || !data) return DEFAULT_CONTENT
  return mergeContent(DEFAULT_CONTENT, data.data)
}

export function ContentProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<SiteContent>(DEFAULT_CONTENT)
  const [lang, setLangState] = useState<Lang>(initialLang)

  const reload = useCallback(async () => setContent(await fetchContent()), [])

  useEffect(() => {
    void reload()
  }, [reload])

  const setLang = useCallback((l: Lang) => {
    setLangState(l)
    try {
      localStorage.setItem(LANG_KEY, l)
    } catch {
      /* storage unavailable */
    }
  }, [])

  const t = content.copy[lang]

  useEffect(() => {
    document.documentElement.lang = lang
    document.title = t.meta.title
    document.querySelector('meta[name="description"]')?.setAttribute('content', t.meta.description)
  }, [lang, t])

  const value = useMemo(
    () => ({ content, settings: content.settings, t, lang, setLang, reload }),
    [content, t, lang, setLang, reload],
  )
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useContent() {
  const v = useContext(Ctx)
  if (!v) throw new Error('useContent must be used inside ContentProvider')
  return v
}
