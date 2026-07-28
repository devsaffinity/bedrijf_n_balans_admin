import { useCallback, useMemo, useState } from 'react'
import { Badge } from '../components/ui/Badge'
import { DataToolbar } from '../components/ui/DataToolbar'
import { PageHeader } from '../components/ui/PageHeader'
import { EmptyState, ErrorState, LoadingState } from '../components/ui/States'
import { useAsync } from '../hooks/useAsync'
import { adminService } from '../services/mockService'
import { formatDate, formatMoney } from '../utils/format'

export function PaymentsPage() {
  const { data, loading, error, retry } = useAsync(useCallback(() => adminService.getPayments(), []))
  const [search, setSearch] = useState(''); const [status, setStatus] = useState('All')
  const rows = useMemo(() => (data ?? []).filter((item) => (status === 'All' || item.status === status) && `${item.clientName} ${item.clientEmail} ${item.reference} ${item.submissionId}`.toLowerCase().includes(search.toLowerCase())), [data, search, status])
  if (loading) return <LoadingState label="Loading payment records…" />; if (error) return <ErrorState retry={retry} />
  const collected = (data ?? []).filter((item) => item.status === 'Paid').reduce((sum, item) => sum + item.amount, 0)
  return <><PageHeader title="Payments" description="Track client payment records linked to questionnaire submissions." action={<div className="card px-4 py-2 text-sm"><span className="text-[var(--color-muted)]">Collected </span><strong>{formatMoney(collected)}</strong></div>} /><section className="card overflow-hidden"><DataToolbar search={search} onSearch={setSearch} placeholder="Search client, reference or submission"><select className="field sm:w-44" value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter payment status"><option>All</option><option>Paid</option><option>Pending</option><option>Failed</option></select></DataToolbar>{rows.length ? <table className="desktop-table w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-[var(--color-muted)]"><tr><th className="px-4 py-3">Client</th><th className="px-4 py-3">Submission</th><th className="px-4 py-3">Reference</th><th className="px-4 py-3">Date</th><th className="px-4 py-3">Amount</th><th className="px-4 py-3">Status</th></tr></thead><tbody>{rows.map((item) => <tr className="border-t border-[var(--color-border)]" key={item.id}><td data-label="Client" className="px-4 py-3 font-semibold">{item.clientName}<div className="mt-1 text-xs font-normal text-[var(--color-muted)]">{item.clientEmail}</div></td><td data-label="Submission" className="px-4 py-3">{item.submissionId}</td><td data-label="Reference" className="px-4 py-3 font-mono text-xs">{item.reference}</td><td data-label="Date" className="px-4 py-3 text-[var(--color-muted)]">{formatDate(item.date)}</td><td data-label="Amount" className="px-4 py-3 font-semibold">{formatMoney(item.amount)}</td><td data-label="Status" className="px-4 py-3"><Badge>{item.status}</Badge></td></tr>)}</tbody></table> : <EmptyState />}</section></>
}
