import { supabase } from '../lib/supabaseClient'
import { mapProfile } from './mappers'
import type { Role, User } from '../types'

export interface SignUpInput {
  name: string
  email: string
  phone?: string
  password: string
  role: Extract<Role, 'user' | 'company'>
  companyName?: string
  companyIndustry?: string
}

export interface SignUpResult {
  user: User | null
  /** true when Supabase requires the user to click a confirmation link before they can log in */
  needsEmailConfirmation: boolean
}

export async function signUp(input: SignUpInput): Promise<SignUpResult> {
  const { data, error } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      data: {
        name: input.name,
        phone: input.phone,
        role: input.role,
        company_name: input.companyName,
        company_industry: input.companyIndustry,
      },
    },
  })
  if (error) throw new Error(error.message)

  if (!data.session) {
    return { user: null, needsEmailConfirmation: true }
  }
  const profile = await fetchProfile(data.user!.id)
  return { user: profile, needsEmailConfirmation: false }
}

export async function logIn(input: { email: string; password: string }): Promise<User> {
  const { data, error } = await supabase.auth.signInWithPassword({ email: input.email, password: input.password })
  if (error) throw new Error(error.message)
  const profile = await fetchProfile(data.user.id)
  if (!profile) throw new Error('Signed in, but no profile was found for this account.')
  return profile
}

export async function logOut(): Promise<void> {
  await supabase.auth.signOut()
}

export async function fetchProfile(userId: string): Promise<User | null> {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle()
  if (error) throw new Error(error.message)
  return data ? mapProfile(data) : null
}

export async function getCurrentUser(): Promise<User | null> {
  const { data } = await supabase.auth.getSession()
  const userId = data.session?.user.id
  if (!userId) return null
  return fetchProfile(userId)
}

/**
 * Supabase Auth owns the reset token end-to-end: random, single-use, hashed
 * server-side, expiring (configurable under Authentication -> Email in the
 * Supabase dashboard; default 1 hour — set it to 15-30 min there), and it
 * never reveals whether the email is registered. Rate limiting is also
 * enforced server-side by Supabase (Authentication -> Rate Limits). This
 * call itself always resolves without telling the caller whether the email
 * existed — ForgotPassword.tsx shows the same message either way.
 */
export async function requestPasswordReset(email: string): Promise<void> {
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  })
}

/**
 * Called from the reset-password link, where clicking it already gave the
 * browser a temporary "recovery" session. Signs out of every session for
 * this account (including this recovery one) afterwards, so a reset
 * invalidates whatever session — this device's or a stolen one — prompted
 * it, and the user re-authenticates fresh with their new password.
 */
export async function updatePassword(newPassword: string): Promise<void> {
  const { error } = await supabase.auth.updateUser({ password: newPassword })
  if (error) throw new Error(error.message)
  await supabase.auth.signOut({ scope: 'global' })
}
