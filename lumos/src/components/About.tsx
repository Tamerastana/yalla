import { Globe, GraduationCap, UserRound } from 'lucide-react'
import { useContent } from '../content/ContentContext'

const ICONS = [UserRound, GraduationCap, Globe]

/** Faint globe line-art drawn behind the founder text, as in the design. */
function GlobeLines() {
  return (
    <svg viewBox="0 0 600 600" className="pointer-events-none absolute -right-40 -bottom-40 h-[640px] w-[640px] text-white/15" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <circle cx="300" cy="300" r="280" />
      <ellipse cx="300" cy="300" rx="140" ry="280" />
      <ellipse cx="300" cy="300" rx="280" ry="110" />
      <path d="M20 300h560M300 20v560" />
    </svg>
  )
}

export function About() {
  const { t, settings } = useContent()
  return (
    <section id="about" className="bg-white py-24 lg:py-32">
      <div className="container-x">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="eyebrow">{t.about.label}</p>
            <h2 className="display mt-4 text-5xl sm:text-6xl lg:text-[4.4rem]">{t.about.title}</h2>
          </div>
          <div className="lg:pt-10">
            <p className="text-lg leading-[1.75] text-slate-ink sm:text-xl">{t.about.text}</p>
            <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
              {t.about.highlights.map((h, i) => {
                const Icon = ICONS[i % ICONS.length]
                return (
                  <div key={i} className="rounded-2xl bg-cream p-6">
                    <Icon size={26} strokeWidth={1.6} className="text-navy-800" />
                    <p className="mt-4 text-[17px] leading-snug font-semibold text-navy-800">{h}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div className="mt-24 grid overflow-hidden rounded-[32px] bg-navy-800 lg:mt-32 lg:grid-cols-[minmax(0,540px)_1fr]">
          <div className="relative aspect-[4/5] lg:aspect-auto lg:min-h-[790px]">
            <img
              src={settings.images.founder}
              alt={t.founder.name}
              className="absolute inset-0 h-full w-full object-cover object-[50%_30%]"
            />
          </div>
          <div className="relative overflow-hidden px-7 py-14 text-white sm:px-14 lg:px-16 lg:py-24 xl:px-24">
            <GlobeLines />
            <div className="relative lg:pt-8">
              <p className="text-[15px] font-medium text-gold-400">{t.founder.label}</p>
              <h3 className="mt-6 font-serif text-5xl font-medium italic sm:text-[4.1rem]">{t.founder.name}</h3>
              <p className="mt-5 text-lg font-medium text-gold-400">{t.founder.role}</p>
              <p className="mt-6 text-lg leading-[1.7] text-white/90">{t.founder.bio}</p>
              <blockquote className="mt-10 flex gap-5">
                <span className="font-serif text-7xl leading-[0.8] text-gold-500" aria-hidden>
                  &ldquo;
                </span>
                <p className="font-serif text-2xl leading-snug italic sm:text-[1.9rem]">{t.founder.quote}</p>
              </blockquote>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
