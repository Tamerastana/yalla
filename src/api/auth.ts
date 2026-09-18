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
