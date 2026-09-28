import { Compass, FileCheck2, MessageSquareText, Send } from 'lucide-react'
import { useContent } from '../content/ContentContext'

const ICONS = [MessageSquareText, Compass, FileCheck2, Send]

export function Steps() {
  const { t } = useContent()
  return (
    <section className="bg-white pt-24 pb-24 sm:pt-32 lg:pb-32" aria-labelledby="steps-title">
      <div className="container-x">
        <p className="eyebrow">{t.steps.label}</p>
        <h2 id="steps-title" className="display mt-4 max-w-[680px] text-5xl sm:text-6xl lg:text-[4.4rem]">
          {t.steps.title}
        </h2>

        <ol className="mt-16 grid gap-12 sm:grid-cols-2 lg:mt-20 lg:grid-cols-4 lg:gap-8">
          {t.steps.items.map((step, i) => {
            const Icon = ICONS[i % ICONS.length]
            const last = i === t.steps.items.length - 1
            return (
              <li key={i} className="relative">
                <div className="relative flex items-center">
                  <span className="grid size-[122px] shrink-0 place-items-center rounded-full ring-1 ring-gold-500/40 ring-offset-0">
                    <span className={`grid size-[104px] place-items-center rounded-full ${last ? 'bg-gold-500 text-navy-900' : 'bg-navy-800 text-gold-400'}`}>
                      <Icon size={34} strokeWidth={1.7} />
                    </span>
                  </span>
                  <span className="ml-1 hidden h-0 flex-1 border-t-2 border-dotted border-gold-500/70 lg:block" aria-hidden />
                </div>
                <p className="mt-4 font-serif text-2xl font-medium text-gold-600">
                  {t.steps.stepWord} {i + 1}
                </p>
                <h3 className="mt-4 text-[22px] font-semibold text-navy-800">{step.title}</h3>
                <p className="mt-4 max-w-[300px] leading-relaxed text-slate-ink">{step.text}</p>
              </li>
            )
          })}
        </ol>
      </div>
    </section>
  )
}
