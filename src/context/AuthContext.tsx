import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import * as authApi from '../api/auth'
import { supabase } from '../lib/supabaseClient'
import type { User } from '../types'

interface AuthContextValue {
  user: User | undefined
  loading: boolean
  signUp: (input: authApi.SignUpInput) => Promise<authApi.SignUpResult>
  logIn: (input: { email: string; password: string }) => Promise<User>
  logOut: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | undefined>(undefined)
  const [loading, setLoading] = useState(true)
  const queryClient = useQueryClient()

  useEffect(() => {
    let cancelled = false

    authApi.getCurrentUser().then((u) => {
      if (!cancelled) {
        setUser(u ?? undefined)
        setLoading(false)
      }
    })

    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!session) {
        setUser(undefined)
        return
      }
      const profile = await authApi.fetchProfile(session.user.id)
      setUser(profile ?? undefined)
    })

    return () => {
      cancelled = true
      sub.subscription.unsubscribe()
    }
  }, [])

  const value: AuthContextValue = {
    user,
    loading,
    signUp: async (input) => {
      const result = await authApi.signUp(input)
      if (result.user) setUser(result.user)
      return result
    },
    logIn: async (input) => {
      const loggedIn = await authApi.logIn(input)
      setUser(loggedIn)
      return loggedIn
    },
    logOut: async () => {
      await authApi.logOut()
      setUser(undefined)
      queryClient.clear()
    },
    refreshUser: async () => {
      if (!user) return
      const fresh = await authApi.fetchProfile(user.id)
      setUser(fresh ?? undefined)
    },
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
