import { ArrowUpRight } from 'lucide-react'
import { useContent } from '../content/ContentContext'
import { Sparkle } from './BrandIcons'

export function Application() {
  const { t, settings } = useContent()
  return (
    <section id="application" className="relative isolate overflow-hidden bg-navy-950 text-white">
      <div
        className="absolute inset-x-0 bottom-0 -z-10 h-[78%] bg-cover bg-bottom"
        style={{ backgroundImage: `url(${settings.images.application})` }}
        aria-hidden
      />
      <div
        className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,var(--color-navy-950)_18%,rgba(9,14,34,0.72)_50%,rgba(9,14,34,0.35)_100%)]"
        aria-hidden
      />
      <Sparkle size={34} className="absolute top-[17%] left-[22%] hidden text-gold-500 sm:block" />
      <Sparkle size={14} className="absolute top-[14%] left-[25.5%] hidden text-gold-500 sm:block" />
      <Sparkle size={24} className="absolute bottom-[22%] right-[23%] hidden text-gold-500 sm:block" />

      <div className="container-x py-28 text-center sm:py-36 lg:py-[150px]">
        <p className="text-[15px] font-medium text-gold-500">{t.application.label}</p>
        <h2 className="display mx-auto mt-5 max-w-[1040px] text-5xl sm:text-6xl lg:text-[4.9rem]">{t.application.title}</h2>
        <p className="mx-auto mt-8 max-w-[640px] text-lg leading-relaxed text-white/90 sm:text-xl">{t.application.text}</p>
        <a href={settings.applicationUrl} target="_blank" rel="noreferrer" className="btn-gold mt-10 px-11 py-5 text-lg">
          {t.application.cta}
          <ArrowUpRight size={19} />
        </a>
        <p className="mt-6 text-sm text-white/75">{t.application.note}</p>
      </div>
    </section>
  )
}
