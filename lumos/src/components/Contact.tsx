import { MapPin } from 'lucide-react'
import { useContent } from '../content/ContentContext'
import { directionsLink, mapEmbedLink, phoneLink, whatsappLink } from '../lib/links'
import { InstagramIcon, WhatsAppIcon } from './BrandIcons'

export function Contact() {
  const { t, settings, lang } = useContent()
  return (
    <section id="contact" className="bg-white py-24 lg:py-32">
      <div className="container-x grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
        <div>
          <p className="eyebrow">{t.contact.label}</p>
          <h2 className="display mt-5 text-5xl sm:text-6xl lg:text-[4.4rem]">{t.contact.title}</h2>
          <a
            href={phoneLink(settings)}
            className="mt-10 inline-block border-b-2 border-gold-500 pb-1 font-serif text-4xl font-semibold text-navy-800 hover:text-gold-600 sm:text-5xl"
          >
            {settings.phoneDisplay}
          </a>
          <div className="mt-9 flex flex-wrap gap-4">
            <a href={whatsappLink(settings)} target="_blank" rel="noreferrer" className="btn-gold">
              <WhatsAppIcon size={18} />
              {t.contact.whatsappCta}
            </a>
            <a href={settings.instagramUrl} target="_blank" rel="noreferrer" className="btn-outline-dark">
              <InstagramIcon size={18} />
              {t.contact.instagramCta}
            </a>
          </div>
          <hr className="my-9 border-navy-800/10" />
          <div className="flex gap-4">
            <MapPin size={24} className="mt-0.5 shrink-0 text-gold-600" />
            <p className="text-lg">
              <span className="block font-semibold text-navy-800">{t.contact.addressLine1}</span>
              <span className="mt-1 block text-slate-ink">{t.contact.addressLine2}</span>
            </p>
          </div>
        </div>

        <div className="relative h-[460px] overflow-hidden rounded-[32px] bg-navy-800 ring-8 ring-navy-800 sm:h-[560px] lg:h-[625px]">
          <iframe
            title={t.contact.mapTitle}
            src={mapEmbedLink(settings, lang)}
            className="absolute inset-0 h-full w-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
          <div className="absolute inset-x-4 bottom-4 flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-xl sm:inset-x-8 sm:bottom-8 sm:flex-row sm:items-center sm:justify-between sm:px-7 sm:py-6">
            <div>
              <p className="text-lg font-semibold text-navy-800">{t.contact.mapTitle}</p>
              <p className="text-slate-ink">{t.contact.addressLine1}</p>
            </div>
            <a href={directionsLink(settings)} target="_blank" rel="noreferrer" className="btn-navy shrink-0 px-6 py-3">
              {t.contact.directions}
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
