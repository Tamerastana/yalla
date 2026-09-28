import { MapPin, Menu, Phone, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useContent } from '../content/ContentContext'
import { phoneLink, whatsappLink } from '../lib/links'
import { InstagramIcon, WhatsAppIcon } from './BrandIcons'
import { LangSwitch } from './LangSwitch'

export const SECTION_IDS = ['home', 'packages', 'about', 'application', 'contact'] as const

function useActiveSection() {
  const [active, setActive] = useState<string>('home')
  useEffect(() => {
    const els = SECTION_IDS.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[]
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)
        if (visible[0]) setActive(visible[0].target.id)
      },
      { rootMargin: '-35% 0px -55% 0px', threshold: [0, 0.25, 0.5, 1] },
    )
    els.forEach((el) => obs.observe(el))
    return () => obs.disconnect()
  }, [])
  return active
}

export function TopBar() {
  const { t, settings } = useContent()
  return (
    <div className="bg-navy-900 text-white">
      <div className="container-x flex h-12 items-center justify-between gap-4 text-[13px] sm:h-14 sm:text-sm">
        <p className="hidden items-center gap-2 text-white/90 md:flex">
          <MapPin size={16} className="shrink-0 text-gold-500" />
          <span className="truncate">
            {t.contact.addressLine1}, {t.contact.addressLine2}
          </span>
        </p>
        <div className="flex w-full items-center justify-between gap-3 md:w-auto md:justify-end md:gap-4">
          <a href={phoneLink(settings)} className="flex items-center gap-2 whitespace-nowrap text-white/90 hover:text-white">
            <Phone size={15} className="text-gold-500" />
            {settings.phoneDisplay}
          </a>
          <div className="flex items-center gap-2">
            <a
              href={settings.instagramUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 rounded-full border border-white/50 px-2.5 py-1.5 font-semibold hover:bg-white/10 sm:px-4"
              aria-label={t.nav.instagram}
            >
              <InstagramIcon size={15} />
              <span className="hidden sm:inline">{t.nav.instagram}</span>
            </a>
            <a
              href={whatsappLink(settings)}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 rounded-full bg-gold-500 px-2.5 py-1.5 font-semibold text-navy-900 hover:bg-gold-400 sm:px-4"
              aria-label={t.nav.whatsapp}
            >
              <WhatsAppIcon size={15} />
              <span className="hidden sm:inline">{t.nav.whatsapp}</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export function Header() {
  const { t, settings } = useContent()
  const active = useActiveSection()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
  }, [open])

  const links = SECTION_IDS.map((id) => ({ id, label: t.nav[id] }))

  return (
    <header className={`sticky top-0 z-40 bg-white transition-shadow ${scrolled ? 'shadow-[0_6px_24px_-12px_rgba(12,21,53,0.25)]' : ''}`}>
      <div className="container-x flex h-20 items-center justify-between gap-6 lg:h-[100px]">
        <a href="#home" className="shrink-0" onClick={() => setOpen(false)}>
          <img src={settings.images.logo} alt="Lumos Global Education" className="h-11 w-auto lg:h-[58px]" />
        </a>

        <nav className="hidden items-center gap-10 lg:flex" aria-label="Main">
          {links.map((l) => (
            <a
              key={l.id}
              href={`#${l.id}`}
              className={`relative py-2 text-[17px] font-medium transition-colors hover:text-navy-800 ${
                active === l.id ? 'text-navy-800' : 'text-navy-800/80'
              }`}
            >
              {l.label}
              <span
                className={`absolute inset-x-0 -bottom-0.5 h-[3px] rounded-full bg-gold-500 transition-opacity ${
                  active === l.id ? 'opacity-100' : 'opacity-0'
                }`}
              />
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-5 lg:flex">
          <LangSwitch />
          <a href={settings.applicationUrl} target="_blank" rel="noreferrer" className="btn-navy">
            {t.nav.startApplication}
          </a>
        </div>

        <div className="flex items-center gap-3 lg:hidden">
          <LangSwitch />
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="grid size-11 place-items-center rounded-full bg-navy-800 text-white"
            aria-expanded={open}
            aria-label={t.nav.menu}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="fixed inset-x-0 top-20 bottom-0 z-40 overflow-y-auto bg-white lg:hidden">
          <nav className="container-x flex flex-col py-6" aria-label="Mobile">
            {links.map((l) => (
              <a
                key={l.id}
                href={`#${l.id}`}
                onClick={() => setOpen(false)}
                className={`border-b border-navy-800/10 py-4 font-serif text-3xl font-medium ${active === l.id ? 'text-gold-600' : ''}`}
              >
                {l.label}
              </a>
            ))}
            <a href={settings.applicationUrl} target="_blank" rel="noreferrer" className="btn-navy mt-8">
              {t.nav.startApplication}
            </a>
          </nav>
        </div>
      )}
    </header>
  )
}
