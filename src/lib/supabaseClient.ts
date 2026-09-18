import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const isBackendConfigured = Boolean(url && anonKey)

// A placeholder client when unconfigured keeps every import site simple —
// callers check isBackendConfigured before doing anything that would use it.
export const supabase = createClient(url || 'https://placeholder.supabase.co', anonKey || 'placeholder-anon-key')
