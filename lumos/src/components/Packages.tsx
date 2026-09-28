import { Check } from 'lucide-react'
import { useContent } from '../content/ContentContext'
import { Sparkle } from './BrandIcons'

const STYLES = [
  {
    card: 'bg-navy-700 text-white ring-1 ring-navy-600',
    price: 'text-gold-500',
    desc: 'text-white/80',
    rule: 'border-white/10',
    check: 'text-gold-500',
    btn: 'btn-outline-light',
  },
  {
    card: 'bg-white text-navy-800',
    price: 'text-navy-800',
    desc: 'text-slate-ink',
    rule: 'border-navy-800/10',
    check: 'text-gold-600',
    btn: 'btn-navy',
  },
  {
    card: 'bg-gold-500 text-navy-900 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.45)] lg:-mt-6',
    price: 'text-navy-900',
    desc: 'text-navy-900/75',
    rule: 'border-navy-900/15',
    check: 'text-navy-900',
    btn: 'btn bg-navy-900 text-white hover:bg-navy-800',
  },
]

export function Packages({ onChoose }: { onChoose: (planIndex: number) => void }) {
  const { t } = useContent()
  return (
    <section id="packages" className="relative overflow-hidden bg-navy-800 py-24 text-white lg:py-32">
      <Sparkle size={20} className="absolute top-16 left-[8%] text-gold-500" />
      <Sparkle size={40} className="absolute top-16 right-[9%] hidden text-gold-500 sm:block" />
      <Sparkle size={18} className="absolute top-36 right-[6%] hidden text-gold-500 sm:block" />

      <div className="container-x">
        <div className="mx-auto max-w-[760px] text-center">
          <p className="text-[15px] font-medium text-gold-500">{t.packages.label}</p>
          <h2 className="display mt-4 text-5xl sm:text-6xl lg:text-[4.4rem]">{t.packages.title}</h2>
          <p className="mx-auto mt-6 max-w-[580px] text-lg leading-relaxed text-white/85 sm:text-xl">{t.packages.subtitle}</p>
        </div>

        <div className="mt-16 grid items-start gap-8 lg:mt-20 lg:grid-cols-3 lg:gap-[30px]">
          {t.packages.plans.map((plan, i) => {
            const s = STYLES[i % STYLES.length]
            const recommended = i === 2
            return (
              <article key={i} className={`relative flex flex-col rounded-[28px] p-8 sm:p-11 ${s.card}`}>
                {recommended && (
                  <span className="absolute -top-4 left-8 inline-flex items-center gap-2 rounded-full bg-navy-800 px-4 py-1.5 text-sm font-semibold text-gold-400">
                    <Sparkle size={11} />
                    {t.packages.recommended}
                  </span>
                )}
                <h3 className="text-xl font-bold">{plan.name}</h3>
                <p className={`display mt-4 text-[3.6rem] break-words sm:text-[4.1rem] ${s.price}`}>{plan.price}</p>
                <p className={`mt-5 leading-relaxed ${s.desc}`}>{plan.description}</p>
                <hr className={`my-8 ${s.rule}`} />
                <ul className="space-y-5">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex gap-4 text-[16.5px]">
                      <Check size={19} className={`mt-0.5 shrink-0 ${s.check}`} strokeWidth={2.2} />
                      {f}
                    </li>
                  ))}
                </ul>
                <button type="button" onClick={() => onChoose(i)} className={`${s.btn} mt-11 w-full py-4`}>
                  {plan.cta}
                </button>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
