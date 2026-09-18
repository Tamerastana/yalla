import { supabase } from '../lib/supabaseClient'
import { mapRegistration } from './mappers'
import type { Registration } from '../types'

export async function listAllRegistrations(): Promise<Registration[]> {
  const { data, error } = await supabase.from('registrations').select('*').neq('status', 'cancelled')
  if (error) throw new Error(error.message)
  return (data ?? []).map(mapRegistration)
}

export async function listRegistrationsForEvent(eventId: string): Promise<Registration[]> {
  const { data, error } = await supabase.from('registrations').select('*').eq('event_id', eventId).neq('status', 'cancelled')
  if (error) throw new Error(error.message)
  return (data ?? []).map(mapRegistration)
}

export async function listRegistrationsForUser(userId: string): Promise<Registration[]> {
  const { data, error } = await supabase.from('registrations').select('*').eq('user_id', userId)
  if (error) throw new Error(error.message)
  return (data ?? []).map(mapRegistration)
}

export async function getMyRegistration(userId: string, eventId: string): Promise<Registration | null> {
  const { data, error } = await supabase
    .from('registrations')
    .select('*')
    .eq('user_id', userId)
    .eq('event_id', eventId)
    .neq('status', 'cancelled')
    .maybeSingle()
  if (error) throw new Error(error.message)
  return data ? mapRegistration(data) : null
}

export async function registerForEvent(userId: string, eventId: string): Promise<Registration> {
  const { data, error } = await supabase
    .from('registrations')
    .insert({ user_id: userId, event_id: eventId })
    .select('*')
    .single()
  if (error) {
    if (error.code === '23505') throw new Error('Already registered for this event.')
    throw new Error(error.message)
  }
  return mapRegistration(data)
}

export async function cancelRegistration(registrationId: string): Promise<void> {
  const { error } = await supabase.from('registrations').update({ status: 'cancelled' }).eq('id', registrationId)
  if (error) throw new Error(error.message)
}

/** Only the event's host can succeed here — enforced by the mark_attended() RPC in Postgres. */
export async function markAttended(registrationId: string): Promise<void> {
  const { error } = await supabase.rpc('mark_attended', { p_registration_id: registrationId })
  if (error) throw new Error(error.message)
}
