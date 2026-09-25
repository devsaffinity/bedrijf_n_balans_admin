import { useState } from 'react'
import { Eye, Pencil, Tags, Trophy, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { PageHeader } from '../components/ui/PageHeader'
import { Badge } from '../components/ui/Badge'
import { DataToolbar } from '../components/ui/DataToolbar'
import { Modal } from '../components/ui/Modal'
import { Pagination } from '../components/ui/Pagination'
import { EmptyState } from '../components/ui/States'
import { clients } from '../mock/data'
import { filingYears, planService } from '../features/subscriptions/plans'
import { statusTransitions, subscriptionService, subscriptionStats } from '../features/subscriptions/subscriptions'
import type { Subscription, SubscriptionStatus } from '../features/subscriptions/subscriptions'
import { formatDate, formatMoney } from '../utils/format'

const peopleLabels = { me: 'User only', partner: 'Partner only', both: 'User + partner' }

export function SubscriptionsPage() {
  const [records, setRecords] = useState(subscriptionService.getAll)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('All')
  const [planFilter, setPlanFilter] = useState('All')
  const [year, setYear] = useState('All')
  const [page, setPage] = useState(1)
  const [viewing, setViewing] = useState<Subscription | null>(null)
  const [editing, setEditing] = useState<Subscription | null>(null)
  const [nextStatus, setNextStatus] = useState<SubscriptionStatus>('Active')
  const plans = planService.getPlans(true)
  const stats = subscriptionStats(records)
  const planName = (id: string) => plans.find((plan) => plan.id === id)?.name ?? id
  const clientFor = (record: Subscription) => clients.find((client) => client.id === record.clientId)
  const filtered = records.filter((record) => {
    const client = clientFor(record)
    return (status === 'All' || record.status === status) && (planFilter === 'All' || record.planId === planFilter) && (year === 'All' || String(record.year) === year)
      && `${record.id} ${client?.name ?? ''} ${client?.email ?? ''} ${planName(record.planId)}`.toLowerCase().includes(search.toLowerCase())
  })
  const totalPages = Math.max(1, Math.ceil(filtered.length / 5))
  const currentPage = Math.min(page, totalPages)
  const rows = filtered.slice((currentPage - 1) * 5, currentPage * 5)
  const saveStatus = () => {
    if (!editing) return
    try {
      subscriptionService.updateStatus(editing.id, nextStatus)
      setRecords(subscriptionService.getAll())
      setEditing(null)
      toast.success('Subscription status updated.')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to update subscription.')
    }
  }

  return <>
      <PageHeader title="Subscriptions" description="Track purchased filing plans, subscribed users, and subscription status." />
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <article className="card p-5"><div className="flex items-start justify-between gap-3"><div><p className="text-sm text-[var(--color-muted)]">Total subscriptions</p><p className="mt-2 text-3xl font-bold">{stats.total}</p></div><span className="rounded-xl bg-[var(--color-brand-soft)] p-3 text-[var(--color-brand)]"><Tags size={22} /></span></div><p className="mt-3 text-xs text-[var(--color-muted)]">{stats.active} active · All statuses included</p></article>
        <article className="card p-5"><div className="flex items-start justify-between gap-3"><div><p className="text-sm text-[var(--color-muted)]">Subscribed users</p><p className="mt-2 text-3xl font-bold">{stats.users}</p></div><span className="rounded-xl bg-blue-50 p-3 text-blue-700"><Users size={22} /></span></div><p className="mt-3 text-xs text-[var(--color-muted)]">Unique users with a purchased plan</p></article>
        <article className="card p-5"><div className="flex items-start justify-between gap-3"><div><p className="text-sm text-[var(--color-muted)]">Most purchased plan</p><p className="mt-2 text-xl font-bold">{stats.topPlans.length ? stats.topPlans.map(planName).join(' / ') : 'No purchases yet'}</p></div><span className="rounded-xl bg-amber-50 p-3 text-amber-700"><Trophy size={22} /></span></div><p className="mt-3 text-xs text-[var(--color-muted)]">{stats.topCount} purchases{stats.topPlans.length > 1 ? ' each · Tied' : ''} · Across all filing years</p></article>
      </div>

      <section className="card overflow-hidden" aria-labelledby="subscriptions-heading">
        <div className="border-b border-[var(--color-border)] p-5"><h2 id="subscriptions-heading" className="font-bold">User subscriptions</h2><p className="mt-1 text-sm text-[var(--color-muted)]">One record per user and filing year. View details or manage its status.</p></div>
        <DataToolbar search={search} onSearch={(value) => { setSearch(value); setPage(1) }} placeholder="Search user, email, plan or subscription">
          <select className="field" aria-label="Filter by status" value={status} onChange={(event) => { setStatus(event.target.value); setPage(1) }}><option value="All">All statuses</option>{Object.keys(statusTransitions).map((item) => <option key={item}>{item}</option>)}</select>
          <select className="field" aria-label="Filter by plan" value={planFilter} onChange={(event) => { setPlanFilter(event.target.value); setPage(1) }}><option value="All">All plans</option>{plans.map((plan) => <option key={plan.id} value={plan.id}>{plan.name}</option>)}</select>
        </DataToolbar>
        <div className="flex items-center justify-between gap-3 border-b border-[var(--color-border)] px-4 py-3"><p className="text-sm text-[var(--color-muted)]">{filtered.length} subscriptions</p><select className="field !w-40" aria-label="Filter by filing year" value={year} onChange={(event) => { setYear(event.target.value); setPage(1) }}><option value="All">All filing years</option>{filingYears.map((item) => <option key={item}>{item}</option>)}</select></div>
        {rows.length ? <div className="overflow-x-auto"><table className="desktop-table w-full text-left text-sm md:min-w-[1000px]">
          <thead className="bg-slate-50 text-xs uppercase text-[var(--color-muted)]"><tr>{['Subscription', 'User', 'Plan', 'Filing year', 'Filing for', 'Amount', 'Status', 'Actions'].map((heading) => <th key={heading} className="px-4 py-3">{heading}</th>)}</tr></thead>
          <tbody>{rows.map((record) => {
            const client = clientFor(record)
            return <tr key={record.id} className="border-t border-[var(--color-border)] hover:bg-slate-50">
              <td data-label="Subscription" className="px-4 py-4 font-semibold">{record.id}<p className="mt-1 text-xs font-normal text-[var(--color-muted)]">{record.purchasedAt ? formatDate(record.purchasedAt) : 'Not purchased'}</p></td>
              <td data-label="User" className="px-4 py-4"><Link className="font-semibold text-[var(--color-brand)] hover:underline" to={`/clients/${record.clientId}`}>{client?.name ?? 'Unknown user'}</Link><p className="mt-1 text-xs text-[var(--color-muted)]">{client?.email}</p></td>
              <td data-label="Plan" className="px-4 py-4 font-medium">{planName(record.planId)}</td><td data-label="Filing year" className="px-4 py-4">{record.year}</td><td data-label="Filing for" className="px-4 py-4">{peopleLabels[record.people]}</td><td data-label="Amount" className="px-4 py-4 font-semibold">{formatMoney(record.amount)}</td><td data-label="Status" className="px-4 py-4"><Badge>{record.status}</Badge></td>
              <td data-label="Actions" className="px-4 py-4"><div className="flex gap-1"><button className="rounded-md p-2 text-slate-600 hover:bg-slate-100" title="View subscription" aria-label={`View ${record.id}`} onClick={() => setViewing(record)}><Eye size={18} /></button>{statusTransitions[record.status].length > 0 && <button className="rounded-md p-2 text-slate-600 hover:bg-slate-100" title="Manage subscription" aria-label={`Manage ${record.id}`} onClick={() => { setEditing(record); setNextStatus(statusTransitions[record.status][0]!) }}><Pencil size={18} /></button>}</div></td>
            </tr>
          })}</tbody>
        </table></div> : <EmptyState title="No subscriptions found" message="Try another search, status, plan or filing year." />}
        <Pagination page={currentPage} totalPages={totalPages} onChange={setPage} />
      </section>
    <Modal open={Boolean(viewing)} title="Subscription details" onClose={() => setViewing(null)}>{viewing && <dl className="mt-5 max-h-[65vh] space-y-4 overflow-y-auto text-sm">{[
      ['Subscription', viewing.id], ['User', clientFor(viewing)?.name ?? 'Unknown user'], ['Email', clientFor(viewing)?.email ?? 'Not provided'], ['Plan', planName(viewing.planId)], ['Filing year', viewing.year], ['Filing for', peopleLabels[viewing.people]], ['Amount', formatMoney(viewing.amount)], ['Purchased', viewing.purchasedAt ? formatDate(viewing.purchasedAt) : 'Not purchased'],
    ].map(([label, value]) => <div key={label}><dt className="text-[var(--color-muted)]">{label}</dt><dd className="mt-1 break-words font-semibold">{value}</dd></div>)}<div><dt className="mb-1 text-[var(--color-muted)]">Status</dt><dd><Badge>{viewing.status}</Badge></dd></div></dl>}</Modal>
    <Modal open={Boolean(editing)} title="Manage subscription" onClose={() => setEditing(null)}>{editing && <form onSubmit={(event) => { event.preventDefault(); saveStatus() }}>
      <p className="mt-3 text-sm text-[var(--color-muted)]">{editing.id} · {clientFor(editing)?.name} · {editing.year}</p>
      <label className="mt-5 block text-sm font-semibold">Subscription status<select className="field mt-2" value={nextStatus} onChange={(event) => setNextStatus(event.target.value as SubscriptionStatus)}>{statusTransitions[editing.status].map((item) => <option key={item}>{item}</option>)}</select></label>
      <p className="mt-3 text-sm text-[var(--color-muted)]">{nextStatus === 'Cancelled' ? 'Cancellation preserves the purchase record and does not issue a refund.' : nextStatus === 'Active' ? 'Activate only after confirming purchase. This records today as the purchase date.' : 'Mark this filing subscription as completed.'}</p>
      <div className="mt-6 flex justify-end gap-3"><button className="btn btn-secondary" type="button" onClick={() => setEditing(null)}>Cancel</button><button className="btn btn-primary" type="submit">Save status</button></div>
    </form>}</Modal>
  </>
}
