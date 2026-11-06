import { useCallback, useState } from 'react'
import { Eye, Tags, Trophy, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PageHeader } from '../components/ui/PageHeader'
import { Badge } from '../components/ui/Badge'
import { ExcelExportButton } from '../components/ui/ExcelExportButton'
import { DataToolbar } from '../components/ui/DataToolbar'
import { Modal } from '../components/ui/Modal'
import { Pagination } from '../components/ui/Pagination'
import { EmptyState, ErrorState, LoadingState } from '../components/ui/States'
import { useAsync } from '../hooks/useAsync'
import { filingYears, findPlan, planService } from '../features/subscriptions/plans'
import { subscriptionService, subscriptionStats, subscriptionAmount } from '../features/subscriptions/subscriptions'
import type { Subscription } from '../features/subscriptions/subscriptions'
import { formatDate, formatMoney } from '../utils/format'

const peopleLabels = { me: 'Single', partner: 'Partner only', both: 'With partner' }

export function SubscriptionsPage() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('All')
  const [planFilter, setPlanFilter] = useState('All')
  const [year, setYear] = useState('All')
  const [page, setPage] = useState(1)
  const [viewing, setViewing] = useState<Subscription | null>(null)
  const { data, loading, error, retry } = useAsync(useCallback(async () => {
    const plans = await planService.getPlans(true)
    return { plans, records: await subscriptionService.loadSubscriptions(plans) }
  }, []))
  const plans = data?.plans ?? []
  const records = data?.records ?? []
  const stats = subscriptionStats(records)
  const planName = (id: string) => records.find((record) => record.planId === id)?.planName ?? findPlan(plans, id)?.name ?? id
  const clientFor = (record: Subscription) => ({ name: record.clientName, email: record.clientEmail })
  const progressFor = (record: Subscription) => ({
    submission: record.submissionId ? { id: record.submissionId, progress: record.submissionProgress } : undefined,
    submissionStatus: record.submissionStatus ?? 'Not submitted',
    paymentStatus: record.paymentStatus ?? 'No payment',
  })
  const viewingProgress = viewing ? progressFor(viewing) : null
  const filtered = records.filter((record) => {
    const client = clientFor(record)
    return (status === 'All' || progressFor(record).submissionStatus === status) && (planFilter === 'All' || findPlan(plans, record.planId)?.id === planFilter) && (year === 'All' || String(record.year) === year)
      && `${record.id} ${record.reference ?? ''} ${client?.name ?? ''} ${client?.email ?? ''} ${planName(record.planId)}`.toLowerCase().includes(search.toLowerCase())
  })
  const totalPages = Math.max(1, Math.ceil(filtered.length / 5))
  const currentPage = Math.min(page, totalPages)
  const rows = filtered.slice((currentPage - 1) * 5, currentPage * 5)

  if (loading) return <LoadingState label="Loading subscriptions…" />
  if (error) return <ErrorState retry={retry} message={error} />

  return <>
      <PageHeader title="Subscriptions" description="Track filing plans, submission progress, and payment status." action={<ExcelExportButton filename="subscriptions" sheetName="Subscriptions" headers={['User', 'Email', 'Plan', 'Filing year', 'Filing for', 'Amount (EUR)', 'Submission status', 'Payment status']} rows={filtered.map((record) => [clientFor(record)?.name ?? 'Unknown user', clientFor(record)?.email, planName(record.planId), record.year, peopleLabels[record.people], subscriptionAmount(record, plans), progressFor(record).submissionStatus, progressFor(record).paymentStatus])} />} />
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <article className="card p-5"><div className="flex items-start justify-between gap-3"><div><p className="text-sm text-[var(--color-muted)]">Total subscriptions</p><p className="mt-2 text-3xl font-bold">{stats.total}</p></div><span className="rounded-xl bg-[var(--color-brand-soft)] p-3 text-[var(--color-brand)]"><Tags size={22} /></span></div><p className="mt-3 text-xs text-[var(--color-muted)]">Across all filing years</p></article>
        <article className="card p-5"><div className="flex items-start justify-between gap-3"><div><p className="text-sm text-[var(--color-muted)]">Subscribed users</p><p className="mt-2 text-3xl font-bold">{stats.users}</p></div><span className="rounded-xl bg-blue-50 p-3 text-blue-700"><Users size={22} /></span></div><p className="mt-3 text-xs text-[var(--color-muted)]">Unique users with a purchased plan</p></article>
        <article className="card p-5"><div className="flex items-start justify-between gap-3"><div><p className="text-sm text-[var(--color-muted)]">Most purchased plan</p><p className="mt-2 text-xl font-bold">{stats.topPlans.length ? stats.topPlans.map(planName).join(' / ') : 'No purchases yet'}</p></div><span className="rounded-xl bg-amber-50 p-3 text-amber-700"><Trophy size={22} /></span></div><p className="mt-3 text-xs text-[var(--color-muted)]">{stats.topCount} purchases{stats.topPlans.length > 1 ? ' each · Tied' : ''} · Across all filing years</p></article>
      </div>

      <section className="card overflow-hidden" aria-labelledby="subscriptions-heading">
        <div className="border-b border-[var(--color-border)] p-5"><h2 id="subscriptions-heading" className="font-bold">User subscriptions</h2><p className="mt-1 text-sm text-[var(--color-muted)]">One record per user and filing year. View submission progress and payment status.</p></div>
        <DataToolbar search={search} onSearch={(value) => { setSearch(value); setPage(1) }} placeholder="Search user, email, plan or subscription">
          <select className="field" aria-label="Filter by submission status" value={status} onChange={(event) => { setStatus(event.target.value); setPage(1) }}><option value="All">All submission statuses</option>{['Not submitted', 'Draft', 'Submission Received', 'Payment Confirmed', 'Filing in Progress', 'Submitted to Tax Authority', 'Deleted'].map((item) => <option key={item}>{item}</option>)}</select>
          <select className="field" aria-label="Filter by plan" value={planFilter} onChange={(event) => { setPlanFilter(event.target.value); setPage(1) }}><option value="All">All plans</option>{plans.map((plan) => <option key={plan.id} value={plan.id}>{plan.name}</option>)}</select>
        </DataToolbar>
        <div className="flex items-center justify-between gap-3 border-b border-[var(--color-border)] px-4 py-3"><p className="text-sm text-[var(--color-muted)]">{filtered.length} subscriptions</p><select className="field !w-40" aria-label="Filter by filing year" value={year} onChange={(event) => { setYear(event.target.value); setPage(1) }}><option value="All">All filing years</option>{filingYears.map((item) => <option key={item}>{item}</option>)}</select></div>
        {rows.length ? <div className="overflow-x-auto"><table className="desktop-table w-full text-left text-sm md:min-w-[1100px]">
          <thead className="bg-slate-50 text-xs uppercase text-[var(--color-muted)]"><tr>{['User', 'Plan', 'Filing year', 'Filing for', 'Amount', 'Submission status', 'Payment status', 'Actions'].map((heading) => <th key={heading} className="px-4 py-3">{heading}</th>)}</tr></thead>
          <tbody>{rows.map((record) => {
            const client = clientFor(record)
            const progress = progressFor(record)
            return <tr key={record.id} className="border-t border-[var(--color-border)] hover:bg-slate-50">
              <td data-label="User" className="px-4 py-4"><Link className="font-semibold text-[var(--color-brand)] hover:underline" to={`/clients/${record.clientId}`}>{client?.name ?? 'Unknown user'}</Link><p className="mt-1 text-xs text-[var(--color-muted)]">{client?.email}</p></td>
              <td data-label="Plan" className="px-4 py-4 font-medium">{planName(record.planId)}</td><td data-label="Filing year" className="px-4 py-4">{record.year}</td><td data-label="Filing for" className="px-4 py-4">{peopleLabels[record.people]}</td><td data-label="Amount" className="px-4 py-4 font-semibold">{formatMoney(subscriptionAmount(record, plans))}</td>
              <td data-label="Submission status" className="px-4 py-4"><Badge>{progress.submissionStatus}</Badge></td>
              <td data-label="Payment status" className="px-4 py-4"><Badge>{progress.paymentStatus}</Badge></td>
              <td data-label="Actions" className="px-4 py-4"><div className="flex gap-1"><button className="rounded-md p-2 text-slate-600 hover:bg-slate-100" title="View subscription" aria-label={`View ${record.reference ?? record.id}`} onClick={() => setViewing(record)}><Eye size={18} /></button></div></td>
            </tr>
          })}</tbody>
        </table></div> : <EmptyState title="No subscriptions found" message="Try another search, status, plan or filing year." />}
        <Pagination page={currentPage} totalPages={totalPages} onChange={setPage} />
      </section>
    <Modal open={Boolean(viewing)} title="Subscription details" size="wide" onClose={() => setViewing(null)}>{viewing && <dl className="mt-5 grid max-h-[65vh] grid-cols-1 gap-x-8 gap-y-5 overflow-y-auto pr-2 text-sm sm:grid-cols-2 [&>div]:min-w-0">{[
      ['Subscription', viewing.reference ?? viewing.id], ['User', clientFor(viewing)?.name ?? 'Unknown user'], ['Email', clientFor(viewing)?.email ?? 'Not provided'], ['Plan', planName(viewing.planId)], ['Filing year', viewing.year], ['Filing for', peopleLabels[viewing.people]], ['Amount', formatMoney(subscriptionAmount(viewing, plans))], ['Purchased', viewing.purchasedAt ? formatDate(viewing.purchasedAt) : 'Not purchased'],
    ].map(([label, value]) => <div key={label}><dt className="text-[var(--color-muted)]">{label}</dt><dd className="mt-1 break-words font-semibold">{value}</dd></div>)}<div><dt className="mb-1 text-[var(--color-muted)]">Submission status</dt><dd><Badge>{viewingProgress?.submissionStatus}</Badge>{viewingProgress?.submission && <Link className="mt-2 block text-[var(--color-brand)] hover:underline" to={`/submissions/${viewingProgress.submission.id}`}>{viewingProgress.submission.id} - {viewingProgress.submission.progress === undefined ? 'Not provided' : `${viewingProgress.submission.progress}% complete`}</Link>}</dd></div><div><dt className="mb-1 text-[var(--color-muted)]">Payment status</dt><dd><Badge>{viewingProgress?.paymentStatus}</Badge></dd></div></dl>}</Modal>
  </>
}
