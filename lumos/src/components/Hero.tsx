import { ArrowRight, Compass, GraduationCap, Send } from 'lucide-react'
import { useContent } from '../content/ContentContext'
import { Sparkle } from './BrandIcons'

export function Hero({ onBook }: { onBook: () => void }) {
  const { t, settings } = useContent()
  const upper = settings.heroUppercase

  return (
    <section id="home" className="relative isolate overflow-hidden bg-navy-800 text-white">
      <div
        className="absolute inset-y-0 right-0 -z-10 w-full bg-cover bg-center lg:w-[72%]"
        style={{ backgroundImage: `url(${settings.images.hero})` }}
        aria-hidden
      />
      <div
        className="absolute inset-0 -z-10 bg-navy-800/80 lg:bg-transparent lg:bg-[linear-gradient(90deg,var(--color-navy-800)_28%,rgba(19,32,79,0.82)_48%,rgba(19,32,79,0.25)_100%)]"
        aria-hidden
      />
      <div className="container-x pt-20 pb-40 sm:pt-28 lg:pt-[140px] lg:pb-[200px]">
        <p className="flex items-center gap-3 text-[15px] font-medium text-gold-400 sm:text-base">
          <Sparkle size={17} className="text-gold-500" />
          {t.hero.eyebrow}
        </p>

        <h1
          className={`display mt-7 max-w-[820px] text-balance ${
            upper ? 'text-[2.35rem] tracking-[0.02em] sm:text-6xl lg:text-[4.4rem]' : 'text-[2.9rem] sm:text-7xl lg:text-[5.4rem]'
          }`}
        >
          <span className={`block ${upper ? 'uppercase' : ''}`}>{t.hero.line1}</span>
          <span className={`mt-1 block ${upper ? 'uppercase' : ''}`}>{t.hero.line2}</span>
        </h1>

        <div className="mt-9 h-[3px] w-[124px] bg-gold-500" />

        {settings.showHeroDescription && t.hero.description && (
          <p className="mt-8 max-w-[560px] text-[17px] leading-relaxed text-white/85 sm:text-lg">{t.hero.description}</p>
        )}

        <button type="button" onClick={onBook} className="btn-gold mt-10 px-9 py-4 text-base sm:text-[17px]">
          {t.hero.cta}
          <ArrowRight size={18} />
        </button>
      </div>
    </section>
  )
}

const WHY_ICONS = [GraduationCap, Compass, Send]

export function WhyLumos() {
  const { t } = useContent()
  return (
    <div className="container-x relative z-10 -mt-24 lg:-mt-[100px]">
      <div className="relative rounded-2xl border-t-[3px] border-gold-500 bg-white shadow-[0_30px_60px_-25px_rgba(12,21,53,0.35)]">
        <span className="absolute -top-4 left-6 inline-flex items-center gap-2 rounded-full bg-navy-800 px-4 py-1.5 text-sm font-semibold text-gold-400 sm:left-10">
          <Sparkle size={11} />
          {t.why.label}
        </span>
        <div className="grid divide-y divide-navy-800/10 md:grid-cols-3 md:divide-x md:divide-y-0">
          {t.why.items.map((item, i) => {
            const Icon = WHY_ICONS[i % WHY_ICONS.length]
            const gold = i === WHY_ICONS.length - 1
            return (
              <div key={i} className="flex gap-5 px-6 py-8 sm:px-10 sm:py-11">
                <span
                  className={`grid size-[62px] shrink-0 place-items-center rounded-full ${gold ? 'bg-gold-500 text-navy-900' : 'bg-navy-800 text-gold-400'}`}
                >
                  <Icon size={24} strokeWidth={1.8} />
                </span>
                <div>
                  <h3 className="text-xl leading-snug font-bold text-navy-800">{item.title}</h3>
                  <p className="mt-2 leading-relaxed text-slate-ink">{item.text}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
