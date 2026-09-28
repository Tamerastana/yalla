import { useContent } from '../content/ContentContext'
import { whatsappLink } from '../lib/links'
import { InstagramIcon, WhatsAppIcon } from './BrandIcons'
import { SECTION_IDS } from './Header'

const YEAR = new Date().getFullYear()

export function Footer() {
  const { t, settings } = useContent()
  return (
    <footer className="border-t-[6px] border-gold-500 bg-navy-900 text-white">
      <div className="container-x py-16">
        <div className="flex flex-col items-center gap-10 lg:flex-row lg:justify-between">
          <a href="#home" className="rounded-xl bg-white px-5 py-3">
            <img src={settings.images.logo} alt="Lumos Global Education" className="h-12 w-auto" />
          </a>
          <nav className="flex flex-wrap justify-center gap-x-9 gap-y-3" aria-label="Footer">
            {SECTION_IDS.map((id) => (
              <a key={id} href={`#${id}`} className="text-[17px] font-medium hover:text-gold-400">
                {t.nav[id]}
              </a>
            ))}
          </nav>
          <div className="flex gap-3">
            <a
              href={settings.instagramUrl}
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              className="grid size-[50px] place-items-center rounded-full border border-gold-500 text-gold-500 hover:bg-gold-500/10"
            >
              <InstagramIcon size={19} />
            </a>
            <a
              href={whatsappLink(settings)}
              target="_blank"
              rel="noreferrer"
              aria-label="WhatsApp"
              className="grid size-[50px] place-items-center rounded-full bg-gold-500 text-navy-900 hover:bg-gold-400"
            >
              <WhatsAppIcon size={19} />
            </a>
          </div>
        </div>
        <div className="mt-12 flex flex-col gap-3 border-t border-navy-600 pt-10 text-center text-[15px] text-white/80 lg:flex-row lg:justify-between lg:text-left">
          <p>
            © {YEAR} {t.footer.rights}
          </p>
          <p>
            {t.contact.addressLine1} · {settings.phoneDisplay}
          </p>
        </div>
      </div>
    </footer>
  )
}
