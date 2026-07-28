import { ArrowDownUp, ChevronRight } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Badge } from '../components/ui/Badge'
import { DataToolbar } from '../components/ui/DataToolbar'
import { PageHeader } from '../components/ui/PageHeader'
import { Pagination } from '../components/ui/Pagination'
import { EmptyState, ErrorState, LoadingState } from '../components/ui/States'
import { useAsync } from '../hooks/useAsync'
import { adminService } from '../services/mockService'
import { formatDate } from '../utils/format'

export function ClientsPage() {
  const { data, loading, error, retry } = useAsync(useCallback(() => adminService.getClients(), []))
  const [search, setSearch] = useState(''); const [status, setStatus] = useState('All'); const [ascending, setAscending] = useState(true); const [page, setPage] = useState(1)
  const filtered = useMemo(() => (data ?? []).filter((item) => (status === 'All' || item.status === status) && `${item.name} ${item.email}`.toLowerCase().includes(search.toLowerCase())).sort((a, b) => ascending ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)), [data, status, search, ascending])
  const perPage = 5; const pages = Math.ceil(filtered.length / perPage); const rows = filtered.slice((page - 1) * perPage, page * perPage)
  if (loading) return <LoadingState label="Loading clients…" />; if (error) return <ErrorState retry={retry} />
  return <><PageHeader title="Clients" description="View and manage every client connected to the platform." /><section className="card overflow-hidden"><DataToolbar search={search} onSearch={(value) => { setSearch(value); setPage(1) }} placeholder="Search clients by name or email"><select className="field sm:w-52" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1) }} aria-label="Filter client status"><option>All</option><option>Active</option><option>Review needed</option><option>Awaiting submission</option></select></DataToolbar>{rows.length ? <table className="desktop-table w-full border-collapse text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-[var(--color-muted)]"><tr><th className="px-4 py-3"><button className="flex items-center gap-1 font-semibold" onClick={() => setAscending((value) => !value)}>Client <ArrowDownUp size={13} /></button></th><th className="px-4 py-3">Filing type</th><th className="px-4 py-3">Joined</th><th className="px-4 py-3">Status</th><th className="px-4 py-3"><span className="sr-only">Open</span></th></tr></thead><tbody>{rows.map((client) => <tr className="border-t border-[var(--color-border)] hover:bg-slate-50" key={client.id}><td data-label="Client" className="px-4 py-3"><div className="font-semibold">{client.name}</div><div className="text-xs text-[var(--color-muted)]">{client.email}</div></td><td data-label="Filing type" className="px-4 py-3">{client.filingType}</td><td data-label="Joined" className="px-4 py-3 text-[var(--color-muted)]">{formatDate(client.joinedAt)}</td><td data-label="Status" className="px-4 py-3"><Badge>{client.status}</Badge></td><td className="px-4 py-3 text-right"><Link className="inline-flex rounded p-2 text-[var(--color-brand)] hover:bg-[var(--color-brand-soft)]" to={`/clients/${client.id}`} aria-label={`View ${client.name}`}><ChevronRight size={18} /></Link></td></tr>)}</tbody></table> : <EmptyState />}<Pagination page={Math.min(page, Math.max(pages, 1))} totalPages={pages} onChange={setPage} /></section></>
}
