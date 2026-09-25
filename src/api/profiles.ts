import { supabase } from '../lib/supabaseClient'
import { mapProfile } from './mappers'
import type { Emirate, GeoPoint, User } from '../types'

export async function updateProfile(
  userId: string,
  patch: Partial<{ name: string; bio: string; city: Emirate; home: GeoPoint; avatarUrl: string }>,
): Promise<void> {
  const row: Record<string, unknown> = {}
  if (patch.name !== undefined) row.name = patch.name
  if (patch.bio !== undefined) row.bio = patch.bio
  if (patch.city !== undefined) row.city = patch.city
  if (patch.avatarUrl !== undefined) row.avatar_url = patch.avatarUrl
  if (patch.home !== undefined) {
    row.home_lat = patch.home.lat
    row.home_lng = patch.home.lng
  }
  const { error } = await supabase.from('profiles').update(row).eq('id', userId)
  if (error) throw new Error(error.message)
}

export async function searchProfiles(query: string, excludeId?: string): Promise<User[]> {
  const q = query.trim()
  if (!q) return []
  let request = supabase.from('profiles').select('*').neq('role', 'super_admin').ilike('name', `%${q}%`).limit(20)
  if (excludeId) request = request.neq('id', excludeId)
  const { data, error } = await request
  if (error) throw new Error(error.message)
  return (data ?? []).map(mapProfile)
}

export async function listCompanies(): Promise<User[]> {
  const { data, error } = await supabase.from('profiles').select('*').eq('role', 'company')
  if (error) throw new Error(error.message)
  return (data ?? []).map(mapProfile)
}

export async function listPlayers(): Promise<User[]> {
  const { data, error } = await supabase.from('profiles').select('*').eq('role', 'user')
  if (error) throw new Error(error.message)
  return (data ?? []).map(mapProfile)
}

export async function getUser(id: string): Promise<User | null> {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', id).maybeSingle()
  if (error) throw new Error(error.message)
  return data ? mapProfile(data) : null
}

export async function listUsersByIds(ids: string[]): Promise<User[]> {
  if (ids.length === 0) return []
  const { data, error } = await supabase.from('profiles').select('*').in('id', ids)
  if (error) throw new Error(error.message)
  return (data ?? []).map(mapProfile)
}

export async function verifyCompany(companyId: string): Promise<void> {
  const { error } = await supabase.rpc('verify_company', { p_company_id: companyId })
  if (error) throw new Error(error.message)
}

/**
 * Soft "removes" a company: they can no longer create new official events or
 * rewards, but nothing about them or their history is deleted — past events,
 * points already earned from them, and issued redemption codes stay intact.
 */
export async function setCompanyActive(companyId: string, active: boolean): Promise<void> {
  const { error } = await supabase.rpc('set_company_active', { p_company_id: companyId, p_active: active })
  if (error) throw new Error(error.message)
}
