import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

/**
 * Null when the site is deployed without Supabase keys. The public site still
 * works in that case (it falls back to the built-in content and sends
 * consultation requests through WhatsApp); only the admin panel needs it.
 */
export const supabase: SupabaseClient | null =
  url && key && !url.includes('your-project-ref') ? createClient(url, key) : null

export const CONTENT_ROW_ID = 'main'
export const IMAGE_BUCKET = 'site-images'
