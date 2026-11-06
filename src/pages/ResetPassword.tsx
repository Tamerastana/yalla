import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Check, KeyRound } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabaseClient'
import { Button } from '../components/ui/Button'
import { FieldError, Input, Label } from '../components/ui/Input'
import { Card } from '../components/ui/Card'

export function ResetPasswordPage() {
  const { updatePassword } = useAuth()
  const navigate = useNavigate()
  const [ready, setReady] = useState(false)
  const [invalidLink, setInvalidLink] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  const readyRef = useRef(false)

  // The reset link's URL fragment carries a recovery token; supabase-js
  // (detectSessionInUrl, on by default) exchanges it for a temporary
  // session and fires PASSWORD_RECOVERY once that's done. If someone just
  // lands on this page directly, there's no such session — tell them.
  useEffect(() => {
    let cancelled = false
    const markReady = () => {
      readyRef.current = true
      if (!cancelled) setReady(true)
    }
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') markReady()
    })
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) markReady()
    })
    const timer = setTimeout(() => {
      if (!cancelled && !readyRef.current) setInvalidLink(true)
    }, 2500)
    return () => {
      cancelled = true
      clearTimeout(timer)
      sub.subscription.unsubscribe()
    }
  }, [])

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    setSubmitting(true)
    try {
      await updatePassword(password)
      setDone(true)
      setTimeout(() => navigate('/login'), 2500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-4 py-10 sm:px-0">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-extrabold text-ink-900">Set a new password</h1>
      </div>

      <Card className="p-6">
        {done ? (
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <Check size={22} />
            </div>
            <p className="mt-4 text-sm font-semibold text-ink-800">Password updated.</p>
            <p className="mt-1 text-xs text-ink-500">You've been signed out everywhere for security — redirecting you to log in…</p>
          </div>
        ) : invalidLink && !ready ? (
          <div className="text-center">
            <p className="text-sm font-medium text-ink-700">This reset link is invalid or has expired.</p>
            <Link to="/forgot-password" className="mt-4 inline-block">
              <Button variant="outline">Request a new link</Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <div>
              <Label htmlFor="password">New password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                minLength={6}
                required
              />
            </div>
            <div>
              <Label htmlFor="confirmPassword">Confirm new password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                minLength={6}
                required
              />
            </div>
            <FieldError>{error}</FieldError>
            <Button type="submit" className="w-full" size="lg" disabled={submitting || !ready}>
              <KeyRound size={16} /> {submitting ? 'Updating…' : 'Update password'}
            </Button>
          </form>
        )}
      </Card>
    </div>
  )
}
