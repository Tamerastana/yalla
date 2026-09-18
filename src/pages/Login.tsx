import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { LogIn } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { Button } from '../components/ui/Button'
import { FieldError, Input, Label } from '../components/ui/Input'
import { Card } from '../components/ui/Card'

const DEMO_ACCOUNTS = [
  { label: 'Player', identifier: 'demo@yalla.ae', tag: 'user' },
  { label: 'Verified company', identifier: 'events@dubaisc.ae', tag: 'company' },
  { label: 'Yalla admin', identifier: 'admin@yalla.ae', tag: 'admin' },
]

export function LoginPage() {
  const { logIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation() as { state?: { from?: string } }
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const result = logIn({ identifier, password })
    if ('error' in result) return setError(result.error)
    navigate(location.state?.from ?? '/')
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
            <Label htmlFor="identifier">Email or phone number</Label>
            <Input id="identifier" value={identifier} onChange={(e) => setIdentifier(e.target.value)} placeholder="you@example.com" required />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
          </div>
          <FieldError>{error}</FieldError>
          <Button type="submit" className="w-full" size="lg">
            <LogIn size={16} /> Log in
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-ink-500">
          New to Yalla?{' '}
          <Link to="/signup" className="font-semibold text-brand-600 hover:underline">
            Create an account
          </Link>
        </p>
      </Card>

      <div className="mt-6 rounded-2xl border border-dashed border-ink-200 p-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-400">Try a demo account</p>
        <div className="space-y-1.5">
          {DEMO_ACCOUNTS.map((a) => (
            <button
              key={a.identifier}
              type="button"
              onClick={() => {
                setIdentifier(a.identifier)
                setPassword('password123')
              }}
              className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm hover:bg-ink-50"
            >
              <span className="font-medium text-ink-700">{a.label}</span>
              <span className="text-xs text-ink-400">{a.identifier}</span>
            </button>
          ))}
        </div>
        <p className="mt-2 text-[11px] text-ink-400">Password for every demo account: password123</p>
      </div>
    </div>
  )
}
