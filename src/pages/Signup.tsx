import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Building2, Mail, UserPlus } from 'lucide-react'
import { clsx } from 'clsx'
import { useAuth } from '../context/AuthContext'
import { Button } from '../components/ui/Button'
import { FieldError, Input, Label } from '../components/ui/Input'
import { Card } from '../components/ui/Card'

export function SignupPage() {
  const { signUp } = useAuth()
  const navigate = useNavigate()

  const [role, setRole] = useState<'user' | 'company'>('user')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [needsConfirmation, setNeedsConfirmation] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const result = await signUp({
        name,
        email,
        phone: phone || undefined,
        password,
        role,
        companyName: role === 'company' ? companyName : undefined,
      })
      if (result.needsEmailConfirmation) {
        setNeedsConfirmation(true)
      } else {
        navigate('/')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setSubmitting(false)
    }
  }

  if (needsConfirmation) {
    return (
      <div className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-4 py-10 text-center sm:px-0">
        <Card className="p-8">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-500">
            <Mail size={22} />
          </div>
          <h1 className="mt-4 text-xl font-extrabold text-ink-900">Check your email</h1>
          <p className="mt-2 text-sm text-ink-500">
            We sent a confirmation link to <strong>{email}</strong>. Click it, then come back and log in.
          </p>
          <Link to="/login" className="mt-5 inline-block">
            <Button variant="outline">Go to login</Button>
          </Link>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-4 py-10 sm:px-0">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-extrabold text-ink-900">Create your account</h1>
        <p className="mt-1 text-sm text-ink-500">Join thousands playing sport across the UAE.</p>
      </div>

      <Card className="p-6">
        <div className="mb-5 grid grid-cols-2 gap-2">
          <RoleTile active={role === 'user'} icon={<UserPlus size={16} />} label="I'm a player" onClick={() => setRole('user')} />
          <RoleTile active={role === 'company'} icon={<Building2 size={16} />} label="I'm a company" onClick={() => setRole('company')} />
        </div>

        {role === 'company' && (
          <p className="mb-4 rounded-xl bg-brand-50 px-3 py-2.5 text-xs font-medium text-brand-700">
            Company accounts start unverified and can host community events immediately. A Yalla admin verifies your
            business before you can run official, points-earning events.
          </p>
        )}

        <form onSubmit={submit} className="space-y-4">
          <div>
            <Label htmlFor="name">{role === 'company' ? 'Contact name' : 'Full name'}</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ahmed Al Mansoori" required />
          </div>

          {role === 'company' && (
            <div>
              <Label htmlFor="companyName">Company name</Label>
              <Input id="companyName" value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Padel Pro Club" required />
            </div>
          )}

          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
          </div>

          <div>
            <Label htmlFor="phone">Phone number (optional)</Label>
            <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+971 5X XXX XXXX" />
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" minLength={6} required />
          </div>

          <FieldError>{error}</FieldError>
          <Button type="submit" className="w-full" size="lg" disabled={submitting}>
            {submitting ? 'Creating account…' : 'Create account'}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-ink-500">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-brand-600 hover:underline">
            Log in
          </Link>
        </p>
      </Card>
    </div>
  )
}

function RoleTile({ active, icon, label, onClick }: { active: boolean; icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        'flex flex-col items-center gap-1.5 rounded-2xl border px-3 py-3 text-sm font-semibold transition-colors',
        active ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-ink-200 text-ink-500 hover:border-brand-200',
      )}
    >
      {icon}
      {label}
    </button>
  )
}
