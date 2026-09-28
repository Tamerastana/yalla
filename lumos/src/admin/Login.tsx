import { LoaderCircle } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { supabase } from '../lib/supabase'
import { input } from './ui'

export function Login({ logo }: { logo: string }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (!supabase) return
    setBusy(true)
    setError(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError(error.message)
    setBusy(false)
  }

  return (
    <div className="grid min-h-screen place-items-center bg-navy-800 p-5">
      <form onSubmit={submit} className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-2xl">
        <img src={logo} alt="Lumos Global Education" className="mx-auto h-14 w-auto" />
        <h1 className="mt-6 text-center font-serif text-3xl font-medium">Admin sign in</h1>
        <div className="mt-6 space-y-3">
          <input type="email" required placeholder="Email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={`${input} py-3`} />
          <input
            type="password"
            required
            placeholder="Password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`${input} py-3`}
          />
        </div>
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        <button type="submit" disabled={busy} className="btn-navy mt-6 w-full">
          {busy && <LoaderCircle size={16} className="animate-spin" />}
          Sign in
        </button>
        <a href="/" className="mt-4 block text-center text-sm text-slate-ink hover:text-navy-800">
          ← Back to website
        </a>
      </form>
    </div>
  )
}
