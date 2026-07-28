import { Download, Eye, FileSpreadsheet, FileText } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { Badge } from '../components/ui/Badge'
import { DataToolbar } from '../components/ui/DataToolbar'
import { PageHeader } from '../components/ui/PageHeader'
import { EmptyState, ErrorState, LoadingState } from '../components/ui/States'
import { useAsync } from '../hooks/useAsync'
import { adminService } from '../services/mockService'
import { formatDate } from '../utils/format'

export function DocumentsPage() {
  const { data, loading, error, retry } = useAsync(useCallback(() => adminService.getDocuments(), []))
  const [search, setSearch] = useState(''); const [status, setStatus] = useState('All')
  const rows = useMemo(() => (data ?? []).filter((item) => (status === 'All' || item.status === status) && `${item.name} ${item.owner} ${item.type} ${item.submissionId}`.toLowerCase().includes(search.toLowerCase())), [data, search, status])
  if (loading) return <LoadingState label="Loading documents…" />; if (error) return <ErrorState retry={retry} />
  const placeholder = (action: string) => toast(`${action} will be available after secure storage integration.`)
  return <><PageHeader title="Documents" description="Access supporting files uploaded by clients for their submissions." /><section className="card overflow-hidden"><DataToolbar search={search} onSearch={setSearch} placeholder="Search document, owner or submission"><select className="field sm:w-48" value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter document status"><option>All</option><option>Available</option><option>Pending review</option></select></DataToolbar>{rows.length ? <table className="desktop-table w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-[var(--color-muted)]"><tr><th className="px-4 py-3">Document</th><th className="px-4 py-3">Owner</th><th className="px-4 py-3">Submission</th><th className="px-4 py-3">Uploaded</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Actions</th></tr></thead><tbody>{rows.map((item) => <tr className="border-t border-[var(--color-border)]" key={item.id}><td data-label="Document" className="px-4 py-3"><div className="flex items-center gap-3">{item.type === 'XLSX' ? <FileSpreadsheet className="text-emerald-700" size={20} /> : <FileText className="text-rose-600" size={20} />}<div><div className="font-semibold">{item.name}</div><div className="mt-1 text-xs text-[var(--color-muted)]">{item.type} · {item.size}</div></div></div></td><td data-label="Owner" className="px-4 py-3">{item.owner}</td><td data-label="Submission" className="px-4 py-3">{item.submissionId}</td><td data-label="Uploaded" className="px-4 py-3 text-[var(--color-muted)]">{formatDate(item.uploadedAt)}</td><td data-label="Status" className="px-4 py-3"><Badge>{item.status}</Badge></td><td data-label="Actions" className="px-4 py-3"><div className="flex gap-1"><button className="rounded-md p-2 text-slate-600 hover:bg-slate-100" onClick={() => placeholder('Document preview')} aria-label={`View ${item.name}`}><Eye size={18} /></button><button className="rounded-md p-2 text-slate-600 hover:bg-slate-100" onClick={() => placeholder('Document download')} aria-label={`Download ${item.name}`}><Download size={18} /></button></div></td></tr>)}</tbody></table> : <EmptyState title="No documents" message="Uploaded client documents will appear here." />}</section></>
}
