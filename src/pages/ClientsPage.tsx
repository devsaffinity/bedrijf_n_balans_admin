import { ArrowDownUp, Eye, Pencil, Trash2 } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'
import { Badge } from '../components/ui/Badge'
import { DataToolbar } from '../components/ui/DataToolbar'
import { Modal } from '../components/ui/Modal'
import { PageHeader } from '../components/ui/PageHeader'
import { Pagination } from '../components/ui/Pagination'
import { EmptyState, ErrorState, LoadingState } from '../components/ui/States'
import { useAsync } from '../hooks/useAsync'
import { adminService } from '../services/mockService'
import type { Client, ClientStatus } from '../types/domain'
import { formatDate } from '../utils/format'

const clientStatuses: ClientStatus[] = ['Active', 'Review needed', 'Awaiting submission']

export function ClientsPage() {
  const { data, loading, error, retry } = useAsync(useCallback(() => adminService.getClients(), []))
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('All')
  const [ascending, setAscending] = useState(true)
  const [page, setPage] = useState(1)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [selectedStatus, setSelectedStatus] = useState<ClientStatus>('Active')
  const [saving, setSaving] = useState(false)
  const [deletingClient, setDeletingClient] = useState<Client | null>(null)
  const [deleting, setDeleting] = useState(false)

  const filtered = useMemo(() => (data ?? [])
    .filter((item) => (status === 'All' || item.status === status) && `${item.name} ${item.email}`.toLowerCase().includes(search.toLowerCase()))
    .sort((first, second) => ascending ? first.name.localeCompare(second.name) : second.name.localeCompare(first.name)), [data, status, search, ascending])
  const perPage = 5
  const pages = Math.ceil(filtered.length / perPage)
  const rows = filtered.slice((page - 1) * perPage, page * perPage)

  const openStatusEditor = (client: Client) => {
    setEditingClient(client)
    setSelectedStatus(client.status)
  }

  const saveStatus = async () => {
    if (!editingClient) return
    setSaving(true)
    try {
      await adminService.updateClientStatus(editingClient.id, selectedStatus)
      setEditingClient(null)
      await retry()
      toast.success('Client status updated.')
    } catch (saveError) {
      toast.error(saveError instanceof Error ? saveError.message : 'Unable to update client status.')
    } finally {
      setSaving(false)
    }
  }

  const deleteClient = async () => {
    if (!deletingClient) return
    setDeleting(true)
    try {
      await adminService.deleteClient(deletingClient.id)
      setDeletingClient(null)
      await retry()
      toast.success('Client deleted.')
    } catch (deleteError) {
      toast.error(deleteError instanceof Error ? deleteError.message : 'Unable to delete client.')
    } finally {
      setDeleting(false)
    }
  }

  if (loading) return <LoadingState label="Loading clients…" />
  if (error) return <ErrorState retry={retry} />

  return <>
    <PageHeader title="Clients" description="View and manage every client connected to the platform." />
    <section className="card overflow-hidden">
      <DataToolbar search={search} onSearch={(value) => { setSearch(value); setPage(1) }} placeholder="Search clients by name or email">
        <select className="field sm:!w-44 sm:shrink-0" value={status} onChange={(event) => { setStatus(event.target.value); setPage(1) }} aria-label="Filter client status">
          <option>All</option>
          {clientStatuses.map((clientStatus) => <option key={clientStatus}>{clientStatus}</option>)}
        </select>
      </DataToolbar>
      {rows.length ? <div className="overflow-x-auto"><table className="desktop-table w-full border-collapse text-left text-sm md:min-w-[950px]">
        <thead className="bg-slate-50 text-xs uppercase tracking-wide text-[var(--color-muted)]"><tr>
          <th className="px-4 py-3 xl:w-[18%] xl:px-6"><button className="flex items-center gap-1 font-semibold" onClick={() => setAscending((value) => !value)}>Client <ArrowDownUp size={13} /></button></th>
          <th className="px-4 py-3 xl:w-[24%] xl:px-6">Email</th>
          <th className="px-4 py-3 xl:w-[18%] xl:px-6">Filing type</th>
          <th className="px-4 py-3 xl:w-[14%] xl:px-6">Joined</th>
          <th className="px-4 py-3 xl:w-[16%] xl:px-6">Status</th>
          <th className="px-4 py-3 xl:w-[10%] xl:px-6">Actions</th>
        </tr></thead>
        <tbody>{rows.map((client) => <tr className="border-t border-[var(--color-border)] hover:bg-slate-50" key={client.id}>
          <td data-label="Client" className="px-4 py-3 font-semibold xl:px-6 xl:py-4">{client.name}</td>
          <td data-label="Email" className="px-4 py-3 text-[var(--color-muted)] xl:px-6 xl:py-4">{client.email}</td>
          <td data-label="Filing type" className="px-4 py-3 xl:px-6 xl:py-4">{client.filingType}</td>
          <td data-label="Joined" className="px-4 py-3 text-[var(--color-muted)] xl:px-6 xl:py-4">{formatDate(client.joinedAt)}</td>
          <td data-label="Status" className="px-4 py-3 xl:px-6 xl:py-4"><Badge>{client.status}</Badge></td>
          <td data-label="Actions" className="px-4 py-3 xl:px-6 xl:py-4"><div className="flex min-w-max gap-1">
            <Link className="rounded-md p-2 text-slate-600 hover:bg-slate-100" to={`/clients/${client.id}`} aria-label={`View ${client.name} details`} title="View details"><Eye size={18} /></Link>
            <button className="rounded-md p-2 text-slate-600 hover:bg-slate-100" onClick={() => openStatusEditor(client)} aria-label={`Edit ${client.name} status`} title="Edit status"><Pencil size={18} /></button>
            <button className="rounded-md p-2 text-red-600 hover:bg-red-50" onClick={() => setDeletingClient(client)} aria-label={`Delete ${client.name}`} title="Delete client"><Trash2 size={18} /></button>
          </div></td>
        </tr>)}</tbody>
      </table></div> : <EmptyState />}
      <Pagination page={Math.min(page, Math.max(pages, 1))} totalPages={pages} onChange={setPage} />
    </section>
    <Modal open={Boolean(editingClient)} title="Edit client status" onClose={() => !saving && setEditingClient(null)}>
      <p className="mt-3 text-sm text-[var(--color-muted)]">Update the status for {editingClient?.name}.</p>
      <label className="mt-5 block text-sm font-semibold" htmlFor="client-status">Status</label>
      <select id="client-status" className="field mt-2 w-full" value={selectedStatus} onChange={(event) => setSelectedStatus(event.target.value as ClientStatus)} disabled={saving}>
        {clientStatuses.map((clientStatus) => <option key={clientStatus}>{clientStatus}</option>)}
      </select>
      <div className="mt-6 flex justify-end gap-3">
        <button className="btn btn-secondary" disabled={saving} onClick={() => setEditingClient(null)}>Cancel</button>
        <button className="btn btn-primary" disabled={saving || selectedStatus === editingClient?.status} onClick={saveStatus}>{saving ? 'Saving…' : 'Save status'}</button>
      </div>
    </Modal>
    <Modal open={Boolean(deletingClient)} title="Delete client?" onClose={() => !deleting && setDeletingClient(null)}>
      <p className="mt-3 text-sm leading-6 text-[var(--color-muted)]">This will permanently delete {deletingClient?.name} and all related submissions, payments, and documents.</p>
      <div className="mt-6 flex justify-end gap-3">
        <button className="btn btn-secondary" disabled={deleting} onClick={() => setDeletingClient(null)}>Cancel</button>
        <button className="btn bg-red-600 text-white hover:bg-red-700" disabled={deleting} onClick={deleteClient}>{deleting ? 'Deleting…' : 'Delete client'}</button>
      </div>
    </Modal>
  </>
}
