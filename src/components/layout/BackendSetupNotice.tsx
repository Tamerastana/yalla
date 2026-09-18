import { Database } from 'lucide-react'

export function BackendSetupNotice() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-50 px-4">
      <div className="max-w-lg rounded-3xl border border-ink-200 bg-white p-8 text-center shadow-[var(--shadow-card)]">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-500">
          <Database size={22} />
        </div>
        <h1 className="mt-4 text-xl font-extrabold text-ink-900">Backend not connected yet</h1>
        <p className="mt-2 text-sm text-ink-500">
          Yalla needs a Supabase project to store users, events, and points. Copy <code className="rounded bg-ink-100 px-1.5 py-0.5 text-xs">.env.example</code> to{' '}
          <code className="rounded bg-ink-100 px-1.5 py-0.5 text-xs">.env.local</code>, fill in your project's URL and anon key, and restart the dev server.
        </p>
        <p className="mt-3 text-xs text-ink-400">Run <code className="rounded bg-ink-100 px-1.5 py-0.5">supabase/schema.sql</code> in your Supabase SQL Editor first.</p>
      </div>
    </div>
  )
}
