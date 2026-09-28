import { useContent } from '../content/ContentContext'
import { LANGS } from '../content/types'

export function LangSwitch({ dark = false }: { dark?: boolean }) {
  const { lang, setLang } = useContent()
  return (
    <div
      role="group"
      aria-label="Language"
      className={`inline-flex rounded-full p-0.5 text-xs font-semibold ${dark ? 'bg-white/10' : 'bg-navy-800/5 ring-1 ring-navy-800/10'}`}
    >
      {LANGS.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => setLang(l)}
          aria-pressed={lang === l}
          className={`rounded-full px-2.5 py-1 uppercase transition ${
            lang === l
              ? dark
                ? 'bg-gold-500 text-navy-900'
                : 'bg-navy-800 text-white'
              : dark
                ? 'text-white/70 hover:text-white'
                : 'text-navy-800/60 hover:text-navy-800'
          }`}
        >
          {l}
        </button>
      ))}
    </div>
  )
}
