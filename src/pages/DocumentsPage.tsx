import { Download, Eye, FileSpreadsheet, FileText } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { Badge } from '../components/ui/Badge'
import { DataToolbar } from '../components/ui/DataToolbar'
import { Modal } from '../components/ui/Modal'
import { PageHeader } from '../components/ui/PageHeader'
import { EmptyState, ErrorState, LoadingState } from '../components/ui/States'
import { useAsync } from '../hooks/useAsync'
import { adminService } from '../services/mockService'
import type { ClientDocument } from '../types/domain'
import { formatDate } from '../utils/format'

export function DocumentsPage() {
  const { data, loading, error, retry } = useAsync(useCallback(() => adminService.getDocuments(), []))
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('All')
  const [previewingDocument, setPreviewingDocument] = useState<ClientDocument | null>(null)
  const rows = useMemo(() => (data ?? []).filter((item) => (status === 'All' || item.status === status) && `${item.name} ${item.owner} ${item.type} ${item.submissionId}`.toLowerCase().includes(search.toLowerCase())), [data, search, status])

  const placeholder = (action: string) => toast(`${action} will be available after secure storage integration.`)

  if (loading) return <LoadingState label="Loading documents…" />
  if (error) return <ErrorState retry={retry} />

  return <><PageHeader title="Documents" description="Access and review supporting files uploaded by clients." /><section className="card overflow-hidden">
    <DataToolbar search={search} onSearch={setSearch} placeholder="Search document, owner or submission"><select className="field sm:!w-44 sm:shrink-0" value={status} onChange={(event) => setStatus(event.target.value)} aria-label="Filter document status"><option>All</option><option>Pending review</option><option>Approved</option><option>Rejected</option><option>Available</option></select></DataToolbar>
    {rows.length ? <table className="desktop-table w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-[var(--color-muted)]"><tr><th className="px-4 py-3">Document</th><th className="px-4 py-3">Owner</th><th className="px-4 py-3">Submission</th><th className="px-4 py-3">Uploaded</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Actions</th></tr></thead><tbody>{rows.map((item) => <tr className="border-t border-[var(--color-border)] hover:bg-slate-50" key={item.id}>
      <td data-label="Document" className="px-4 py-3"><div className="flex items-center gap-3">{item.type === 'XLSX' ? <FileSpreadsheet className="text-emerald-700" size={20} /> : <FileText className="text-rose-600" size={20} />}<div><div className="font-semibold">{item.name}</div><div className="mt-1 text-xs text-[var(--color-muted)]">{item.type} · {item.size}</div></div></div></td>
      <td data-label="Owner" className="px-4 py-3">{item.owner}</td><td data-label="Submission" className="px-4 py-3">{item.submissionId}</td><td data-label="Uploaded" className="px-4 py-3 text-[var(--color-muted)]">{formatDate(item.uploadedAt)}</td><td data-label="Status" className="px-4 py-3"><Badge>{item.status}</Badge></td>
      <td data-label="Actions" className="px-4 py-3 text-right"><div className="flex min-w-max justify-end gap-1"><button className="rounded-md p-2 text-slate-600 hover:bg-slate-100" onClick={() => setPreviewingDocument(item)} aria-label={`View ${item.name}`} title="View document"><Eye size={18} /></button><button className="rounded-md p-2 text-slate-600 hover:bg-slate-100" onClick={() => placeholder('Document download')} aria-label={`Download ${item.name}`} title="Download document"><Download size={18} /></button></div></td>
    </tr>)}</tbody></table> : <EmptyState title="No documents" message="Uploaded client documents will appear here." />}
  </section>
  <Modal open={Boolean(previewingDocument)} title="Document preview" onClose={() => setPreviewingDocument(null)}>
    {previewingDocument && <div className="mt-5">
      <div className="rounded-lg border border-[var(--color-border)] bg-slate-100 p-4">
        <div className="mx-auto min-h-72 max-w-xs rounded-md border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-3 border-b border-slate-200 pb-4"><div>{previewingDocument.type === 'XLSX' ? <FileSpreadsheet className="text-emerald-700" size={30} /> : <FileText className="text-rose-600" size={30} />}</div><span className="rounded bg-slate-100 px-2 py-1 text-xs font-bold text-slate-600">{previewingDocument.type}</span></div>
          <h3 className="mt-5 break-words text-base font-bold">{previewingDocument.name}</h3>
          <div className="mt-5 space-y-3"><div className="h-2 w-full rounded bg-slate-200" /><div className="h-2 w-5/6 rounded bg-slate-200" /><div className="h-2 w-11/12 rounded bg-slate-200" /><div className="h-2 w-3/4 rounded bg-slate-200" /></div>
          <div className="mt-7 grid grid-cols-2 gap-3"><div className="h-12 rounded border border-slate-200 bg-slate-50" /><div className="h-12 rounded border border-slate-200 bg-slate-50" /></div>
          <p className="mt-6 text-center text-xs text-[var(--color-muted)]">Secure preview overview</p>
        </div>
      </div>
      <dl className="mt-5 grid grid-cols-2 gap-4 text-sm"><div><dt className="text-[var(--color-muted)]">Owner</dt><dd className="mt-1 font-semibold">{previewingDocument.owner}</dd></div><div><dt className="text-[var(--color-muted)]">Status</dt><dd className="mt-1"><Badge>{previewingDocument.status}</Badge></dd></div><div><dt className="text-[var(--color-muted)]">Submission</dt><dd className="mt-1 font-semibold">{previewingDocument.submissionId}</dd></div><div><dt className="text-[var(--color-muted)]">Uploaded</dt><dd className="mt-1 font-semibold">{formatDate(previewingDocument.uploadedAt)}</dd></div><div><dt className="text-[var(--color-muted)]">File size</dt><dd className="mt-1 font-semibold">{previewingDocument.size}</dd></div></dl>
    </div>}
  </Modal>
  </>
}
