import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { buildSeed } from '../data/seed'
import * as repo from '../lib/repo'
import { useDbVersion } from '../lib/useDb'
import { seedIfEmpty } from '../lib/repo'
import type { User } from '../types'

interface AuthContextValue {
  user: User | undefined
  demoUserId: string
  signUp: (input: repo.SignUpInput) => ReturnType<typeof repo.signUp>
  logIn: (input: repo.LoginInput) => ReturnType<typeof repo.logIn>
  logOut: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

let seededDemoId = ''

export function AuthProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    seedIfEmpty(() => {
      seededDemoId = buildSeed().demoUserId
    })
  }, [])

  useDbVersion()
  const [, force] = useState(0)
  const user = repo.getSessionUser()

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      demoUserId: seededDemoId,
      signUp: (input) => {
        const result = repo.signUp(input)
        force((n) => n + 1)
        return result
      },
      logIn: (input) => {
        const result = repo.logIn(input)
        force((n) => n + 1)
        return result
      },
      logOut: () => {
        repo.logOut()
        force((n) => n + 1)
      },
    }),
    [user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
