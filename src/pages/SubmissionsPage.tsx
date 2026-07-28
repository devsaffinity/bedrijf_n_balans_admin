import { ChevronRight } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Badge } from '../components/ui/Badge'
import { DataToolbar } from '../components/ui/DataToolbar'
import { PageHeader } from '../components/ui/PageHeader'
import { EmptyState, ErrorState, LoadingState } from '../components/ui/States'
import { useAsync } from '../hooks/useAsync'
import { adminService } from '../services/mockService'
import { formatDate } from '../utils/format'

export function SubmissionsPage() {
  const { data, loading, error, retry } = useAsync(useCallback(() => adminService.getSubmissions(), []))
  const [search, setSearch] = useState(''); const [status, setStatus] = useState('All')
  const rows = useMemo(() => (data ?? []).filter((item) => (status === 'All' || item.status === status) && `${item.id} ${item.clientName} ${item.clientEmail}`.toLowerCase().includes(search.toLowerCase())), [data, search, status])
  if (loading) return <LoadingState label="Loading submissions…" />; if (error) return <ErrorState retry={retry} />
  return <><PageHeader title="Submissions" description="Review questionnaire progress and completed client submissions." /><section className="card overflow-hidden"><DataToolbar search={search} onSearch={setSearch} placeholder="Search by client or submission ID"><select className="field sm:w-48" value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter submission status"><option>All</option><option>Open</option><option>Completed</option><option>Locked</option><option>Reopened</option></select></DataToolbar>{rows.length ? <table className="desktop-table w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-[var(--color-muted)]"><tr><th className="px-4 py-3">Submission</th><th className="px-4 py-3">Client</th><th className="px-4 py-3">Progress</th><th className="px-4 py-3">Updated</th><th className="px-4 py-3">Status</th><th /></tr></thead><tbody>{rows.map((item) => <tr className="border-t border-[var(--color-border)] hover:bg-slate-50" key={item.id}><td data-label="Submission" className="px-4 py-3 font-semibold">{item.id}<div className="mt-1 text-xs font-normal text-[var(--color-muted)]">{item.filingType}</div></td><td data-label="Client" className="px-4 py-3">{item.clientName}<div className="mt-1 text-xs text-[var(--color-muted)]">{item.clientEmail}</div></td><td data-label="Progress" className="px-4 py-3"><div className="flex items-center gap-2"><div className="h-1.5 w-20 rounded bg-slate-200"><div className="h-full rounded bg-[var(--color-brand)]" style={{ width: `${item.progress}%` }} /></div><span>{item.progress}%</span></div></td><td data-label="Updated" className="px-4 py-3 text-[var(--color-muted)]">{formatDate(item.updatedAt)}</td><td data-label="Status" className="px-4 py-3"><Badge>{item.status}</Badge></td><td className="px-4 py-3 text-right"><Link className="inline-flex rounded p-2 text-[var(--color-brand)] hover:bg-[var(--color-brand-soft)]" to={`/submissions/${item.id}`} aria-label={`Review ${item.id}`}><ChevronRight size={18} /></Link></td></tr>)}</tbody></table> : <EmptyState />}</section></>
}
