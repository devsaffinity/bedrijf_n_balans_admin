import { Eye, RotateCcw } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { Badge } from '../components/ui/Badge'
import { DataToolbar } from '../components/ui/DataToolbar'
import { Modal } from '../components/ui/Modal'
import { PageHeader } from '../components/ui/PageHeader'
import { EmptyState, ErrorState, LoadingState } from '../components/ui/States'
import { useAsync } from '../hooks/useAsync'
import { adminService } from '../services/mockService'
import type { Payment } from '../types/domain'
import { formatDate, formatMoney } from '../utils/format'

export function PaymentsPage() {
  const { data, loading, error, retry } = useAsync(useCallback(() => adminService.getPayments(), []))
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('All')
  const [viewingPayment, setViewingPayment] = useState<Payment | null>(null)
  const [refundingPayment, setRefundingPayment] = useState<Payment | null>(null)
  const [refunding, setRefunding] = useState(false)
  const rows = useMemo(() => (data ?? []).filter((item) => (status === 'All' || item.status === status) && `${item.clientName} ${item.clientEmail} ${item.reference} ${item.submissionId}`.toLowerCase().includes(search.toLowerCase())), [data, search, status])

  const refundPayment = async () => {
    if (!refundingPayment) return
    setRefunding(true)
    try {
      await adminService.refundPayment(refundingPayment.id)
      setRefundingPayment(null)
      await retry()
      toast.success('Payment refunded. The original record was preserved.')
    } catch (refundError) {
      toast.error(refundError instanceof Error ? refundError.message : 'Unable to refund payment.')
    } finally {
      setRefunding(false)
    }
  }

  if (loading) return <LoadingState label="Loading payment records…" />
  if (error) return <ErrorState retry={retry} />
  const collected = (data ?? []).filter((item) => item.status === 'Paid').reduce((sum, item) => sum + item.amount, 0)

  return <>
    <PageHeader title="Plan" description="Track client payment records linked to questionnaire submissions." action={<div className="card px-4 py-2 text-sm"><span className="text-[var(--color-muted)]">Collected </span><strong>{formatMoney(collected)}</strong></div>} />
    <section className="card overflow-hidden">
      <DataToolbar search={search} onSearch={setSearch} placeholder="Search client, reference or submission">
        <select className="field sm:!w-44 sm:shrink-0" value={status} onChange={(event) => setStatus(event.target.value)} aria-label="Filter payment status"><option>All</option><option>Paid</option><option>Pending</option><option>Failed</option><option>Refunded</option></select>
      </DataToolbar>
      {rows.length ? <table className="desktop-table w-full text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase tracking-wide text-[var(--color-muted)]"><tr>
          <th className="px-4 py-3">Client</th><th className="px-4 py-3">Submission</th><th className="px-4 py-3">Reference</th><th className="px-4 py-3">Date</th><th className="px-4 py-3">Amount</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Actions</th>
        </tr></thead>
        <tbody>{rows.map((item) => <tr className="border-t border-[var(--color-border)] hover:bg-slate-50" key={item.id}>
          <td data-label="Client" className="px-4 py-3 font-semibold">{item.clientName}<div className="mt-1 text-xs font-normal text-[var(--color-muted)]">{item.clientEmail}</div></td>
          <td data-label="Submission" className="px-4 py-3">{item.submissionId}</td>
          <td data-label="Reference" className="px-4 py-3 font-mono text-xs">{item.reference}</td>
          <td data-label="Date" className="px-4 py-3 text-[var(--color-muted)]">{formatDate(item.date)}</td>
          <td data-label="Amount" className="px-4 py-3 font-semibold">{formatMoney(item.amount)}</td>
          <td data-label="Status" className="px-4 py-3"><Badge>{item.status}</Badge></td>
          <td data-label="Actions" className="px-4 py-3 text-right"><div className="flex min-w-max justify-end gap-1">
            <button className="rounded-md p-2 text-slate-600 hover:bg-slate-100" onClick={() => setViewingPayment(item)} aria-label={`View payment ${item.reference}`} title="View details"><Eye size={18} /></button>
            {item.status === 'Paid' && <button className="rounded-md p-2 text-slate-600 hover:bg-slate-100" onClick={() => setRefundingPayment(item)} aria-label={`Refund payment ${item.reference}`} title="Refund payment"><RotateCcw size={18} /></button>}
          </div></td>
        </tr>)}</tbody>
      </table> : <EmptyState />}
    </section>
    <Modal open={Boolean(viewingPayment)} title="Payment details" onClose={() => setViewingPayment(null)}>
      {viewingPayment && <dl className="mt-5 space-y-4 text-sm">
        <div><dt className="text-[var(--color-muted)]">Client</dt><dd className="mt-1 font-semibold">{viewingPayment.clientName}</dd></div>
        <div><dt className="text-[var(--color-muted)]">Email</dt><dd className="mt-1 font-semibold">{viewingPayment.clientEmail}</dd></div>
        <div><dt className="text-[var(--color-muted)]">Submission</dt><dd className="mt-1 font-semibold">{viewingPayment.submissionId}</dd></div>
        <div><dt className="text-[var(--color-muted)]">Reference</dt><dd className="mt-1 font-mono font-semibold">{viewingPayment.reference}</dd></div>
        <div className="flex items-end justify-between gap-4"><div><dt className="text-[var(--color-muted)]">Amount</dt><dd className="mt-1 text-lg font-bold">{formatMoney(viewingPayment.amount)}</dd></div><Badge>{viewingPayment.status}</Badge></div>
        <div><dt className="text-[var(--color-muted)]">Date</dt><dd className="mt-1 font-semibold">{formatDate(viewingPayment.date)}</dd></div>
      </dl>}
    </Modal>
    <Modal open={Boolean(refundingPayment)} title="Refund payment?" onClose={() => !refunding && setRefundingPayment(null)}>
      <p className="mt-3 text-sm leading-6 text-[var(--color-muted)]">Refund {formatMoney(refundingPayment?.amount ?? 0)} for {refundingPayment?.clientName}? The payment record will remain available for audit history.</p>
      <div className="mt-6 flex justify-end gap-3">
        <button className="btn btn-secondary" disabled={refunding} onClick={() => setRefundingPayment(null)}>Cancel</button>
        <button className="btn btn-primary" disabled={refunding} onClick={refundPayment}>{refunding ? 'Refunding…' : 'Confirm refund'}</button>
      </div>
    </Modal>
  </>
}
