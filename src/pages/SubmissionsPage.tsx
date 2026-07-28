import { Eye, Pencil, Trash2 } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'
import { DataToolbar } from '../components/ui/DataToolbar'
import { Modal } from '../components/ui/Modal'
import { PageHeader } from '../components/ui/PageHeader'
import { EmptyState, ErrorState, LoadingState } from '../components/ui/States'
import { useAsync } from '../hooks/useAsync'
import { adminService } from '../services/mockService'
import type { Submission, SubmissionStatus } from '../types/domain'
import { formatDate } from '../utils/format'

const submissionStatuses: SubmissionStatus[] = ['Open', 'Completed', 'Locked', 'Reopened']

export function SubmissionsPage() {
  const { data, loading, error, retry } = useAsync(useCallback(() => adminService.getSubmissions(), []))
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('All')
  const [editingSubmission, setEditingSubmission] = useState<Submission | null>(null)
  const [selectedStatus, setSelectedStatus] = useState<SubmissionStatus>('Open')
  const [saving, setSaving] = useState(false)
  const [deletingSubmission, setDeletingSubmission] = useState<Submission | null>(null)
  const [deleting, setDeleting] = useState(false)
  const rows = useMemo(() => (data ?? []).filter((item) => (status === 'All' || item.status === status) && `${item.id} ${item.clientName} ${item.clientEmail}`.toLowerCase().includes(search.toLowerCase())), [data, search, status])

  const openStatusEditor = (submission: Submission) => {
    setEditingSubmission(submission)
    setSelectedStatus(submission.status)
  }

  const saveStatus = async () => {
    if (!editingSubmission) return
    setSaving(true)
    try {
      await adminService.updateSubmissionStatus(editingSubmission.id, selectedStatus)
      setEditingSubmission(null)
      await retry()
      toast.success('Submission status updated.')
    } catch (saveError) {
      toast.error(saveError instanceof Error ? saveError.message : 'Unable to update submission status.')
    } finally {
      setSaving(false)
    }
  }

  const deleteSubmission = async () => {
    if (!deletingSubmission) return
    setDeleting(true)
    try {
      await adminService.deleteSubmission(deletingSubmission.id)
      setDeletingSubmission(null)
      await retry()
      toast.success('Submission deleted.')
    } catch (deleteError) {
      toast.error(deleteError instanceof Error ? deleteError.message : 'Unable to delete submission.')
    } finally {
      setDeleting(false)
    }
  }

  if (loading) return <LoadingState label="Loading submissions…" />
  if (error) return <ErrorState retry={retry} />

  return <>
    <PageHeader title="Submissions" description="Review questionnaire progress and completed client submissions." />
    <section className="card overflow-hidden">
      <DataToolbar search={search} onSearch={setSearch} placeholder="Search by client or submission ID">
        <select className="field sm:!w-44 sm:shrink-0" value={status} onChange={(event) => setStatus(event.target.value)} aria-label="Filter submission status">
          <option>All</option>{submissionStatuses.map((submissionStatus) => <option key={submissionStatus}>{submissionStatus}</option>)}
        </select>
      </DataToolbar>
      {rows.length ? <table className="desktop-table w-full text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase tracking-wide text-[var(--color-muted)]"><tr>
          <th className="px-4 py-3">Submission</th>
          <th className="px-4 py-3">Client</th>
          <th className="px-4 py-3">Email</th>
          <th className="px-4 py-3">Updated</th>
          <th className="px-4 py-3 text-right">Actions</th>
        </tr></thead>
        <tbody>{rows.map((item) => <tr className="border-t border-[var(--color-border)] hover:bg-slate-50" key={item.id}>
          <td data-label="Submission" className="px-4 py-3 font-semibold">{item.id}<div className="mt-1 text-xs font-normal text-[var(--color-muted)]">{item.filingType}</div></td>
          <td data-label="Client" className="px-4 py-3">{item.clientName}</td>
          <td data-label="Email" className="px-4 py-3 text-[var(--color-muted)]">{item.clientEmail}</td>
          <td data-label="Updated" className="px-4 py-3 text-[var(--color-muted)]">{formatDate(item.updatedAt)}</td>
          <td data-label="Actions" className="px-4 py-3 text-right"><div className="flex min-w-max justify-end gap-1">
            <Link className="rounded-md p-2 text-slate-600 hover:bg-slate-100" to={`/submissions/${item.id}`} aria-label={`View ${item.id} details`} title="View details"><Eye size={18} /></Link>
            <button className="rounded-md p-2 text-slate-600 hover:bg-slate-100" onClick={() => openStatusEditor(item)} aria-label={`Edit ${item.id} status`} title="Edit status"><Pencil size={18} /></button>
            <button className="rounded-md p-2 text-red-600 hover:bg-red-50" onClick={() => setDeletingSubmission(item)} aria-label={`Delete ${item.id}`} title="Delete submission"><Trash2 size={18} /></button>
          </div></td>
        </tr>)}</tbody>
      </table> : <EmptyState />}
    </section>
    <Modal open={Boolean(editingSubmission)} title="Edit submission status" onClose={() => !saving && setEditingSubmission(null)}>
      <p className="mt-3 text-sm text-[var(--color-muted)]">Update the status for {editingSubmission?.id}.</p>
      <label className="mt-5 block text-sm font-semibold" htmlFor="submission-status">Status</label>
      <select id="submission-status" className="field mt-2 w-full" value={selectedStatus} onChange={(event) => setSelectedStatus(event.target.value as SubmissionStatus)} disabled={saving}>
        {submissionStatuses.map((submissionStatus) => <option key={submissionStatus}>{submissionStatus}</option>)}
      </select>
      <div className="mt-6 flex justify-end gap-3">
        <button className="btn btn-secondary" disabled={saving} onClick={() => setEditingSubmission(null)}>Cancel</button>
        <button className="btn btn-primary" disabled={saving || selectedStatus === editingSubmission?.status} onClick={saveStatus}>{saving ? 'Saving…' : 'Save status'}</button>
      </div>
    </Modal>
    <Modal open={Boolean(deletingSubmission)} title="Delete submission?" onClose={() => !deleting && setDeletingSubmission(null)}>
      <p className="mt-3 text-sm leading-6 text-[var(--color-muted)]">This will permanently delete {deletingSubmission?.id} and its related payments and documents.</p>
      <div className="mt-6 flex justify-end gap-3">
        <button className="btn btn-secondary" disabled={deleting} onClick={() => setDeletingSubmission(null)}>Cancel</button>
        <button className="btn bg-red-600 text-white hover:bg-red-700" disabled={deleting} onClick={deleteSubmission}>{deleting ? 'Deleting…' : 'Delete submission'}</button>
      </div>
    </Modal>
  </>
}
