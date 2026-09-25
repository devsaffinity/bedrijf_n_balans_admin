import { Eye, Pencil, Trash2 } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'
import { Badge } from '../components/ui/Badge'
import { DataToolbar } from '../components/ui/DataToolbar'
import { Modal } from '../components/ui/Modal'
import { PageHeader } from '../components/ui/PageHeader'
import { EmptyState, ErrorState, LoadingState } from '../components/ui/States'
import { useAsync } from '../hooks/useAsync'
import { adminService } from '../services/mockService'
import { FilingProgress } from '../components/ui/FilingProgress'
import { filingProgress, filingStages } from '../features/submissions/progress'
import { payments } from '../mock/data'
import type { FilingStage, Submission } from '../types/domain'
import { formatDate } from '../utils/format'

const submissionStatuses = ['Draft', 'Submission Received', 'Payment Confirmed', 'Filing in Progress', 'Submitted to Tax Authority', 'Deleted']

export function SubmissionsPage() {
  const { data, loading, error, retry } = useAsync(useCallback(() => adminService.getSubmissions(), []))
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('All')
  const [editingSubmission, setEditingSubmission] = useState<Submission | null>(null)
  const [selectedStatus, setSelectedStatus] = useState<FilingStage>('Not started')
  const [saving, setSaving] = useState(false)
  const [deletingSubmission, setDeletingSubmission] = useState<Submission | null>(null)
  const [deleting, setDeleting] = useState(false)
  const rows = useMemo(() => (data ?? []).filter((item) => (status === 'All' || filingProgress(item, payments).current === status) && `${item.id} ${item.clientName} ${item.clientEmail}`.toLowerCase().includes(search.toLowerCase())), [data, search, status])

  const openStatusEditor = (submission: Submission) => {
    setEditingSubmission(submission)
    setSelectedStatus(submission.filingStage ?? 'Not started')
  }

  const saveStatus = async () => {
    if (!editingSubmission) return
    setSaving(true)
    try {
      await adminService.updateFilingStage(editingSubmission.id, selectedStatus)
      setEditingSubmission(null)
      await retry()
      toast.success('Filing progress updated.')
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
      await adminService.updateSubmissionStatus(deletingSubmission.id, 'Deleted')
      setDeletingSubmission(null)
      await retry()
      toast.success('Submission deleted. Related records were preserved for audit history.')
    } catch (deleteError) {
      toast.error(deleteError instanceof Error ? deleteError.message : 'Unable to delete submission.')
    } finally {
      setDeleting(false)
    }
  }


  if (loading) return <LoadingState label="Loading submissions…" />
  if (error) return <ErrorState retry={retry} />

  return <>
    <PageHeader title="Submissions" description="Track filing milestones and update submission progress." />
    <section className="card overflow-hidden">
      <DataToolbar search={search} onSearch={setSearch} placeholder="Search by client or submission ID">
        <select className="field sm:w-44! sm:shrink-0" value={status} onChange={(event) => setStatus(event.target.value)} aria-label="Filter submission status">
          <option>All</option>{submissionStatuses.map((submissionStatus) => <option key={submissionStatus}>{submissionStatus}</option>)}
        </select>
      </DataToolbar>
      {rows.length ? <div className="overflow-x-auto"><table className="desktop-table w-full text-left text-sm md:min-w-[1250px]">
        <thead className="bg-slate-50 text-xs uppercase tracking-wide text-(--color-muted)"><tr>
          <th className="px-4 py-3">Submission</th>
          <th className="px-4 py-3">Client</th>
          <th className="px-4 py-3">Email</th>
          <th className="px-4 py-3">Updated</th>
          <th className="px-4 py-3">Current stage</th>
          <th className="px-4 py-3">Filing progress</th>
          <th className="px-4 py-3 text-right">Actions</th>
        </tr></thead>
        <tbody>{rows.map((item) => <tr className="border-t border-(--color-border) hover:bg-slate-50" key={item.id}>
          <td data-label="Submission" className="px-4 py-3 font-semibold">{item.id}<div className="mt-1 text-xs font-normal text-(--color-muted)">{item.filingType}</div></td>
          <td data-label="Client" className="px-4 py-3">{item.clientName}</td>
          <td data-label="Email" className="px-4 py-3 text-(--color-muted)">{item.clientEmail}</td>
          <td data-label="Updated" className="px-4 py-3 text-(--color-muted)">{formatDate(item.updatedAt)}</td>
          <td data-label="Current stage" className="px-4 py-3"><Badge>{filingProgress(item, payments).current}</Badge></td>
          <td data-label="Filing progress" className="px-4 py-4"><FilingProgress submission={item} payments={payments} compact /></td>
          <td data-label="Actions" className="px-4 py-3 text-right"><div className="flex min-w-max justify-end gap-1">
            <Link className="rounded-md p-2 text-slate-600 hover:bg-slate-100" to={`/submissions/${item.id}`} aria-label={`View ${item.id} details`} title="View details"><Eye size={18} /></Link>
            {item.status !== 'Deleted' && <button className="rounded-md p-2 text-slate-600 hover:bg-slate-100" onClick={() => openStatusEditor(item)} aria-label={`Edit filing progress for ${item.id}`} title="Edit filing progress"><Pencil size={18} /></button>}
            {item.status !== 'Deleted' && <button className="rounded-md p-2 text-red-600 hover:bg-red-50" onClick={() => setDeletingSubmission(item)} aria-label={`Delete ${item.id}`} title="Delete submission"><Trash2 size={18} /></button>}
          </div></td>
        </tr>)}</tbody>
      </table></div> : <EmptyState />}
    </section>
    <Modal open={Boolean(editingSubmission)} title="Edit filing progress" onClose={() => !saving && setEditingSubmission(null)}>
      {editingSubmission && <div className="mt-4 max-h-[70vh] space-y-5 overflow-y-auto pr-1">
        <p className="text-sm text-[var(--color-muted)]">{editingSubmission.id} ? {editingSubmission.clientName}</p>
        <FilingProgress submission={{ ...editingSubmission, filingStage: selectedStatus }} payments={payments} />
        <p className="text-xs leading-5 text-[var(--color-muted)]">Submission Received and Payment Confirmed reflect the questionnaire and payment records. Update the filing stage below.</p>
        <label className="block text-sm font-semibold" htmlFor="filing-stage">Filing stage</label>
        <select id="filing-stage" className="field" value={selectedStatus} onChange={(event) => setSelectedStatus(event.target.value as FilingStage)} disabled={saving}>
          {filingStages.map((stage) => <option key={stage} disabled={stage !== 'Not started' && !filingProgress(editingSubmission, payments).canStart}>{stage}</option>)}
        </select>
        {!filingProgress(editingSubmission, payments).canStart && <p className="text-sm text-amber-700">Filing can begin once the questionnaire is submitted and payment is confirmed.</p>}
        <div className="flex justify-end gap-3"><button className="btn btn-secondary" disabled={saving} onClick={() => setEditingSubmission(null)}>Cancel</button><button className="btn btn-primary" disabled={saving || selectedStatus === (editingSubmission.filingStage ?? 'Not started')} onClick={saveStatus}>{saving ? 'Saving...' : 'Save progress'}</button></div>
      </div>}
    </Modal>
    <Modal open={Boolean(deletingSubmission)} title="Delete submission?" onClose={() => !deleting && setDeletingSubmission(null)}>
      <p className="mt-3 text-sm leading-6 text-(--color-muted)">This removes {deletingSubmission?.id} from active work while preserving its payments and documents for audit history.</p>
      <div className="mt-6 flex justify-end gap-3">
        <button className="btn btn-secondary" disabled={deleting} onClick={() => setDeletingSubmission(null)}>Cancel</button>
        <button className="btn bg-red-600 text-white hover:bg-red-700" disabled={deleting} onClick={deleteSubmission}>{deleting ? 'Deleting…' : 'Delete submission'}</button>
      </div>
    </Modal>
  </>
}
