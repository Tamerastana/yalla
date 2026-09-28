import { LoaderCircle, Upload } from 'lucide-react'
import { useState } from 'react'
import type { Settings } from '../content/types'
import { IMAGE_BUCKET, supabase } from '../lib/supabase'
import { Card, Field, TextInput, Toggle, input } from './ui'

type Update = (patch: Partial<Settings>) => void

const IMAGE_LABELS: Record<keyof Settings['images'], string> = {
  logo: 'Logo',
  hero: 'Hero background (graduation photo)',
  founder: 'Founder photo',
  application: 'Application section background (campus)',
}

function ImageField({ name, url, onChange }: { name: keyof Settings['images']; url: string; onChange: (u: string) => void }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function upload(file: File) {
    if (!supabase) return
    setBusy(true)
    setError(null)
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const path = `${name}-${Date.now()}.${ext}`
    const { error } = await supabase.storage.from(IMAGE_BUCKET).upload(path, file, { cacheControl: '31536000', upsert: false })
    if (error) setError(error.message)
    else onChange(supabase.storage.from(IMAGE_BUCKET).getPublicUrl(path).data.publicUrl)
    setBusy(false)
  }

  return (
    <div className="grid gap-4 sm:grid-cols-[160px_1fr]">
      <div className="grid aspect-[4/3] place-items-center overflow-hidden rounded-xl bg-navy-800/5 ring-1 ring-navy-800/10">
        {url && <img src={url} alt="" className={`h-full w-full ${name === 'logo' ? 'object-contain p-2' : 'object-cover'}`} />}
      </div>
      <div className="space-y-2">
        <p className="text-[13px] font-semibold text-navy-800">{IMAGE_LABELS[name]}</p>
        <input value={url} onChange={(e) => onChange(e.target.value)} className={input} placeholder="https://…" />
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-semibold text-navy-800 ring-1 ring-navy-800/15 hover:bg-navy-800/5">
          {busy ? <LoaderCircle size={14} className="animate-spin" /> : <Upload size={14} />}
          Upload new image
          <input type="file" accept="image/*" className="hidden" disabled={busy} onChange={(e) => e.target.files?.[0] && void upload(e.target.files[0])} />
        </label>
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>
    </div>
  )
}

export function SettingsEditor({ settings, update }: { settings: Settings; update: Update }) {
  const text = (key: keyof Settings, label: string, hint?: string) => (
    <Field label={label} hint={hint}>
      <TextInput value={String(settings[key])} onChange={(v) => update({ [key]: v } as Partial<Settings>)} />
    </Field>
  )

  return (
    <div className="space-y-5">
      <Card title="Contacts & links">
        <div className="grid gap-4 sm:grid-cols-2">
          {text('phoneDisplay', 'Phone (as shown)', 'e.g. +971 54 410 5105')}
          {text('phoneLink', 'Phone (for calling)', 'digits only, e.g. +971544105105')}
          {text('whatsappNumber', 'WhatsApp number', 'digits only, e.g. 971544105105')}
          {text('instagramUrl', 'Instagram link')}
          {text('applicationUrl', 'Application form link', '“Start your application” buttons')}
          {text('mapQuery', 'Map location', 'what Google Maps searches for')}
        </div>
      </Card>

      <Card title="Hero display">
        <div className="space-y-4">
          <Toggle
            checked={settings.heroUppercase}
            onChange={(v) => update({ heroUppercase: v })}
            label="Headline in ALL CAPS"
            hint="Shows “CREATED BY STUDENTS / FROM ADMISSION TO GRADUATION” in capitals."
          />
          <Toggle
            checked={settings.showHeroDescription}
            onChange={(v) => update({ showHeroDescription: v })}
            label="Show small description under the headline"
            hint="“Study in Dubai with guidance from people who have been through it themselves…”"
          />
        </div>
      </Card>

      <Card title="Images" subtitle="Upload a new photo or paste an image link. JPG or WebP around 2000px wide works best.">
        <div className="space-y-6">
          {(Object.keys(IMAGE_LABELS) as (keyof Settings['images'])[]).map((k) => (
            <ImageField key={k} name={k} url={settings.images[k]} onChange={(u) => update({ images: { ...settings.images, [k]: u } })} />
          ))}
        </div>
      </Card>
    </div>
  )
}
