import { useRef, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { KeyRound, Mail } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { Button } from '../components/ui/Button'
import { FieldError, Input, Label } from '../components/ui/Input'
import { Card } from '../components/ui/Card'

const GENERIC_MESSAGE = 'If an account exists for that email, a password reset link was sent.'
const RESEND_COOLDOWN_SECONDS = 60

export function ForgotPasswordPage() {
  const { requestPasswordReset } = useAuth()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const cooldownTimer = useRef<ReturnType<typeof setInterval> | null>(null)

  const startCooldown = () => {
    setCooldown(RESEND_COOLDOWN_SECONDS)
    if (cooldownTimer.current) clearInterval(cooldownTimer.current)
    cooldownTimer.current = setInterval(() => {
      setCooldown((s) => {
        if (s <= 1 && cooldownTimer.current) clearInterval(cooldownTimer.current)
        return Math.max(0, s - 1)
      })
    }, 1000)
  }

  const doRequest = async () => {
    if (cooldown > 0) return
    setError('')
    setSubmitting(true)
    try {
      await requestPasswordReset(email)
    } catch {
      // Intentionally ignored: we never reveal whether the request
      // succeeded or the email exists — same message either way below.
    } finally {
      setSubmitting(false)
      setSent(true)
      startCooldown()
    }
  }

  const submit = (e: FormEvent) => {
    e.preventDefault()
    doRequest()
  }

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-4 py-10 sm:px-0">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-extrabold text-ink-900">Reset your password</h1>
        <p className="mt-1 text-sm text-ink-500">Enter your email and we'll send you a link to set a new password.</p>
      </div>

      <Card className="p-6">
        {sent ? (
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-500">
              <Mail size={22} />
            </div>
            <p className="mt-4 text-sm font-medium text-ink-700">{GENERIC_MESSAGE}</p>
            <p className="mt-2 text-xs text-ink-400">Check your inbox (and spam folder). The link expires soon, so use it quickly.</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-5"
              disabled={cooldown > 0 || submitting}
              onClick={doRequest}
            >
              {cooldown > 0 ? `Resend in ${cooldown}s` : submitting ? 'Sending…' : 'Resend email'}
            </Button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
            </div>
            <FieldError>{error}</FieldError>
            <Button type="submit" className="w-full" size="lg" disabled={submitting}>
              <KeyRound size={16} /> {submitting ? 'Sending…' : 'Send reset link'}
            </Button>
          </form>
        )}

        <p className="mt-4 text-center text-sm text-ink-500">
          Remembered it?{' '}
          <Link to="/login" className="font-semibold text-brand-600 hover:underline">
            Back to login
          </Link>
        </p>
      </Card>
    </div>
  )
}
