import { Building2, Calendar, ShieldCheck, Users } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useEvents } from '../hooks/useEvents'
import { useCompanies, usePlayers, useVerifyCompany } from '../hooks/useProfiles'
import { Avatar } from '../components/ui/Avatar'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { PageLoader } from '../components/ui/Spinner'

export function AdminPanelPage() {
  const { user } = useAuth()
  const companiesQuery = useCompanies()
  const eventsQuery = useEvents()
  const playersQuery = usePlayers()
  const verifyCompany = useVerifyCompany()

  if (!user || user.role !== 'super_admin') return null
  if (companiesQuery.isLoading || eventsQuery.isLoading || playersQuery.isLoading) return <PageLoader />

  const companies = companiesQuery.data ?? []
  const allEvents = eventsQuery.data ?? []
  const players = playersQuery.data ?? []

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <h1 className="flex items-center gap-2 text-2xl font-extrabold text-ink-900">
        <ShieldCheck className="text-brand-500" /> Yalla Admin
      </h1>
      <p className="mt-1 text-sm text-ink-500">Verify companies so they can run official, points-earning events.</p>

      <div className="mt-6 grid grid-cols-3 gap-3">
        <StatCard icon={<Users size={16} />} label="Players" value={players.length} />
        <StatCard icon={<Building2 size={16} />} label="Companies" value={companies.length} />
        <StatCard icon={<Calendar size={16} />} label="Events" value={allEvents.length} />
      </div>

      <div className="mt-8">
        <h2 className="mb-3 font-bold text-ink-900">Companies</h2>
        <div className="space-y-2.5">
          {companies.map((c) => (
            <Card key={c.id} className="flex items-center justify-between gap-3 p-3.5">
              <div className="flex items-center gap-3">
                <Avatar name={c.name} src={c.avatarUrl} size={38} />
                <div>
                  <p className="flex items-center gap-1.5 text-sm font-bold text-ink-900">
                    {c.company?.companyName}
                    {c.company?.verified && <ShieldCheck size={14} className="text-brand-500" />}
                  </p>
                  <p className="text-xs text-ink-500">
                    {c.company?.industry} &middot; {c.email ?? c.phone}
                  </p>
                </div>
              </div>
              {c.company?.verified ? (
                <Badge tone="success">Verified</Badge>
              ) : (
                <Button size="sm" disabled={verifyCompany.isPending} onClick={() => verifyCompany.mutate(c.id)}>
                  Verify company
                </Button>
              )}
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 text-brand-500">{icon}</div>
      <p className="mt-2 text-xl font-extrabold text-ink-900">{value}</p>
      <p className="text-xs font-medium text-ink-400">{label}</p>
    </Card>
  )
}
