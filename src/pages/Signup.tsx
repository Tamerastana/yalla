import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Building2, Mail, Phone, UserPlus } from 'lucide-react'
import { clsx } from 'clsx'
import { useAuth } from '../context/AuthContext'
import { Button } from '../components/ui/Button'
import { FieldError, Input, Label } from '../components/ui/Input'
import { Card } from '../components/ui/Card'

export function SignupPage() {
  const { signUp } = useAuth()
  const navigate = useNavigate()

  const [role, setRole] = useState<'user' | 'company'>('user')
  const [method, setMethod] = useState<'email' | 'phone'>('email')
  const [name, setName] = useState('')
  const [contact, setContact] = useState('')
  const [password, setPassword] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [error, setError] = useState('')

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const result = signUp({
      name,
      password,
      role,
      email: method === 'email' ? contact : undefined,
      phone: method === 'phone' ? contact : undefined,
      companyName: role === 'company' ? companyName : undefined,
    })
    if ('error' in result) return setError(result.error)
    navigate('/')
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
            <div className="mb-1.5 flex items-center justify-between">
              <Label className="mb-0">Contact method</Label>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => setMethod('email')}
                  className={clsx('flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold', method === 'email' ? 'bg-brand-500 text-white' : 'bg-ink-100 text-ink-500')}
                >
                  <Mail size={12} /> Email
                </button>
                <button
                  type="button"
                  onClick={() => setMethod('phone')}
                  className={clsx('flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold', method === 'phone' ? 'bg-brand-500 text-white' : 'bg-ink-100 text-ink-500')}
                >
                  <Phone size={12} /> Phone
                </button>
              </div>
            </div>
            <Input
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder={method === 'email' ? 'you@example.com' : '+971 5X XXX XXXX'}
              type={method === 'email' ? 'email' : 'tel'}
              required
            />
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" required />
          </div>

          <FieldError>{error}</FieldError>
          <Button type="submit" className="w-full" size="lg">
            Create account
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
