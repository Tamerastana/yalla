import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { LogIn } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { Button } from '../components/ui/Button'
import { FieldError, Input, Label } from '../components/ui/Input'
import { Card } from '../components/ui/Card'

export function LoginPage() {
  const { logIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation() as { state?: { from?: string } }
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await logIn({ email, password })
      navigate(location.state?.from ?? '/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-4 py-10 sm:px-0">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-extrabold text-ink-900">Welcome back</h1>
        <p className="mt-1 text-sm text-ink-500">Log in to register for events and track your points.</p>
      </div>

      <Card className="p-6">
        <form onSubmit={submit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
          </div>
          <FieldError>{error}</FieldError>
          <Button type="submit" className="w-full" size="lg" disabled={submitting}>
            <LogIn size={16} /> {submitting ? 'Logging in…' : 'Log in'}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-ink-500">
          New to Yalla?{' '}
          <Link to="/signup" className="font-semibold text-brand-600 hover:underline">
            Create an account
          </Link>
        </p>
      </Card>
    </div>
  )
}
