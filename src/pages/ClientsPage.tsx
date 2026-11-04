import { ArrowDownUp, Eye } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Badge } from '../components/ui/Badge'
import { ExcelExportButton } from '../components/ui/ExcelExportButton'
import { DataToolbar } from '../components/ui/DataToolbar'
import { PageHeader } from '../components/ui/PageHeader'
import { Pagination } from '../components/ui/Pagination'
import { EmptyState, ErrorState, LoadingState } from '../components/ui/States'
import { useAsync } from '../hooks/useAsync'
import { clientService } from '../services/clientService'
import { formatDate } from '../utils/format'

export function ClientsPage() {
  const { data, loading, error, retry } = useAsync(useCallback(() => clientService.getClients(), []))
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('All')
  const [ascending, setAscending] = useState(true)
  const [page, setPage] = useState(1)
  const statuses = [...new Set((data ?? []).map((client) => client.status ?? 'Not provided'))].sort()
  const filtered = useMemo(() => (data ?? [])
    .filter((item) => (status === 'All' || (item.status ?? 'Not provided') === status) && `${item.name} ${item.email}`.toLowerCase().includes(search.toLowerCase()))
    .sort((first, second) => ascending ? first.name.localeCompare(second.name) : second.name.localeCompare(first.name)), [data, status, search, ascending])
  const pages = Math.max(1, Math.ceil(filtered.length / 5))
  const currentPage = Math.min(page, pages)
  const rows = filtered.slice((currentPage - 1) * 5, currentPage * 5)

  if (loading) return <LoadingState label="Loading clients…" />
  if (error) return <ErrorState retry={retry} message={error} />

  return <>
    <PageHeader title="Clients" description="View client profiles registered on the platform." action={<ExcelExportButton filename="clients" sheetName="Clients" headers={['Client', 'Email', 'Filing type', 'Joined', 'Status']} rows={filtered.map((client) => [client.name, client.email, client.filingType || 'Not provided', formatDate(client.joinedAt), client.status ?? 'Not provided'])} />} />
    <section className="card overflow-hidden">
      <DataToolbar search={search} onSearch={(value) => { setSearch(value); setPage(1) }} placeholder="Search clients by name or email">
        <select className="field sm:!w-44 sm:shrink-0" value={status} onChange={(event) => { setStatus(event.target.value); setPage(1) }} aria-label="Filter client status">
          <option value="All">All statuses</option>
          {statuses.map((value) => <option key={value}>{value}</option>)}
        </select>
      </DataToolbar>
      {rows.length ? <div className="overflow-x-auto"><table className="desktop-table w-full border-collapse text-left text-sm md:min-w-[950px]">
        <thead className="bg-slate-50 text-xs uppercase tracking-wide text-[var(--color-muted)]"><tr>
          <th className="px-4 py-3 xl:px-6"><button className="flex items-center gap-1 font-semibold" onClick={() => { setAscending((value) => !value); setPage(1) }}>Client <ArrowDownUp size={13} /></button></th>
          <th className="px-4 py-3 xl:px-6">Email</th><th className="px-4 py-3 xl:px-6">Filing type</th><th className="px-4 py-3 xl:px-6">Joined</th><th className="px-4 py-3 xl:px-6">Status</th><th className="px-4 py-3 xl:px-6">Actions</th>
        </tr></thead>
        <tbody>{rows.map((client) => <tr className="border-t border-[var(--color-border)] hover:bg-slate-50" key={client.id}>
          <td data-label="Client" className="px-4 py-3 font-semibold xl:px-6 xl:py-4">{client.name}</td>
          <td data-label="Email" className="px-4 py-3 text-[var(--color-muted)] xl:px-6 xl:py-4">{client.email || 'Not provided'}</td>
          <td data-label="Filing type" className="px-4 py-3 xl:px-6 xl:py-4">{client.filingType || 'Not provided'}</td>
          <td data-label="Joined" className="px-4 py-3 text-[var(--color-muted)] xl:px-6 xl:py-4">{formatDate(client.joinedAt)}</td>
          <td data-label="Status" className="px-4 py-3 xl:px-6 xl:py-4"><Badge>{client.status ?? 'Not provided'}</Badge></td>
          <td data-label="Actions" className="px-4 py-3 xl:px-6 xl:py-4"><Link className="inline-flex rounded-md p-2 text-slate-600 hover:bg-slate-100" to={`/clients/${encodeURIComponent(client.id)}`} aria-label={`View ${client.name} details`} title="View details"><Eye size={18} /></Link></td>
        </tr>)}</tbody>
      </table></div> : <EmptyState title={data?.length ? 'No matching clients' : 'No clients yet'} message={data?.length ? 'Try another search or status filter.' : 'Registered clients will appear here.'} />}
      <Pagination page={currentPage} totalPages={pages} onChange={setPage} />
    </section>
  </>
}
