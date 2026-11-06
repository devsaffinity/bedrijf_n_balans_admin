import { CreditCard, FileCheck2, Send, Users } from 'lucide-react'
import { useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Badge } from '../components/ui/Badge'
import { ErrorState, LoadingState } from '../components/ui/States'
import { useAsync } from '../hooks/useAsync'
import { clientService } from '../services/clientService'
import { submissionService } from '../services/submissionService'
import { dashboardOverview } from '../features/dashboard/overview'
import { filingProgress } from '../features/submissions/progress'
import { formatDate } from '../utils/format'

export function DashboardPage() {
  const loader = useCallback(async () => {
    const [clients, submissions] = await Promise.all([clientService.getClients(), submissionService.getSubmissions()])
    return { clients, submissions }
  }, [])
  const { data, loading, error, retry } = useAsync(loader)
  if (loading) return <LoadingState label="Preparing your overview…" />
  if (error || !data) return <ErrorState retry={retry} message={error || undefined} />
  const { total, paid, pending, chart, chartAvailable, recent } = dashboardOverview(data.submissions)
  const cards = [
    { label: 'Total clients', value: data.clients.length, icon: Users, tone: 'bg-[var(--color-brand-soft)] text-[var(--color-brand)]' },
    { label: 'Submissions', value: total, icon: Send, tone: 'bg-blue-50 text-blue-700' },
    { label: 'Payments received', value: paid, icon: CreditCard, tone: 'bg-violet-50 text-violet-700' },
    { label: 'Pending reviews', value: pending ?? 0, icon: FileCheck2, tone: 'bg-amber-50 text-amber-700' },
  ]
  return (
    <>
      <header className="mb-6"><h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Good morning</h1><p className="mt-1 text-sm text-[var(--color-muted)]">Here is what is happening across your client administration.</p></header>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map(({ label, value, icon: Icon, tone }) => <article className="card p-5" key={label}><div className="flex items-start justify-between"><div><p className="text-sm font-medium text-[var(--color-muted)]">{label}</p><p className="mt-2 text-3xl font-bold">{value}</p></div><span className={`rounded-xl p-2.5 ${tone}`}><Icon size={21} /></span></div></article>)}</section>
      <section className="mt-6 grid gap-6 xl:grid-cols-[1.05fr_.95fr]">
        <article className="card p-5"><div className="mb-5"><h2 className="font-bold">Submission activity</h2><p className="text-sm text-[var(--color-muted)]">Filing records created over the last five months</p></div><div className="h-64">{chartAvailable ? <ResponsiveContainer width="100%" height="100%"><BarChart data={chart} margin={{ left: -24, right: 4 }}><CartesianGrid vertical={false} stroke="#e8e8e8" /><XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6f6f6f', fontSize: 12 }} /><YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: '#6f6f6f', fontSize: 12 }} /><Tooltip cursor={{ fill: '#f5f5f5' }} /><Bar dataKey="submissions" fill="#b2180f" radius={[5, 5, 0, 0]} /></BarChart></ResponsiveContainer> : <p className="flex h-full items-center justify-center text-sm text-[var(--color-muted)]">Not provided</p>}</div></article>
        <article className="card overflow-hidden"><div className="flex items-center justify-between border-b border-[var(--color-border)] p-5"><div><h2 className="font-bold">Recent submissions</h2><p className="text-sm text-[var(--color-muted)]">Latest client activity</p></div><Link className="text-sm font-semibold text-[var(--color-brand)]" to="/submissions">View all</Link></div><div className="divide-y divide-[var(--color-border)]">{recent.map((item) => <Link to={`/submissions/${encodeURIComponent(item.id)}`} className="flex items-center justify-between gap-3 p-4 hover:bg-slate-50" key={item.id}><div className="min-w-0"><p className="truncate text-sm font-semibold">{item.clientName}</p><p className="mt-1 text-xs text-[var(--color-muted)]">{item.reference ?? item.id} · {formatDate(item.updatedAt)}</p></div><Badge>{filingProgress(item, item.relatedPayments ?? []).current}</Badge></Link>)}{!recent.length && <p className="p-4 text-sm text-[var(--color-muted)]">No submissions yet.</p>}</div></article>
      </section>
    </>
  )
}
