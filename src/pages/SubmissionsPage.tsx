import { Eye, Pencil, RotateCcw, Trash2 } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'
import { Badge } from '../components/ui/Badge'
import { ExcelExportButton } from '../components/ui/ExcelExportButton'
import { DataToolbar } from '../components/ui/DataToolbar'
import { Modal } from '../components/ui/Modal'
import { PageHeader } from '../components/ui/PageHeader'
import { EmptyState, ErrorState, LoadingState } from '../components/ui/States'
import { useAsync } from '../hooks/useAsync'
import { submissionService } from '../services/submissionService'
import { FilingProgress } from '../components/ui/FilingProgress'
import { canReopenSubmission, submissionEditingAccess } from '../features/submissions/editingAccess'
import { filingProgress, filingStages } from '../features/submissions/progress'
import { SubmissionReviewDetails } from '../features/submissions/SubmissionReviewDetails'
import type { FilingStage, Submission } from '../types/domain'
import { formatDate } from '../utils/format'

const submissionStatuses = ['Draft', 'Submission Received', 'Payment Confirmed', 'Filing in Progress', 'Submitted to Tax Authority', 'Deleted']

export function SubmissionsPage() {
  const { data, loading, error, retry } = useAsync(useCallback(() => submissionService.getSubmissions(), []))
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('All')
  const [editingSubmission, setEditingSubmission] = useState<Submission | null>(null)
  const [selectedStatus, setSelectedStatus] = useState<FilingStage | ''>('')
  const [saving, setSaving] = useState(false)
  const [deletingSubmission, setDeletingSubmission] = useState<Submission | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [reopeningSubmission, setReopeningSubmission] = useState<Submission | null>(null)
  const [reopening, setReopening] = useState(false)
  const rows = useMemo(() => (data ?? []).filter((item) => (status === 'All' ? item.status !== 'Deleted' : filingProgress(item, item.relatedPayments ?? []).current === status) && `${item.id} ${item.reference ?? ""} ${item.clientName} ${item.clientEmail}`.toLowerCase().includes(search.toLowerCase())), [data, search, status])

  const openStatusEditor = (submission: Submission) => {
    setEditingSubmission(submission)
    setSelectedStatus(submission.filingStage ?? '')
  }

  const saveStatus = async () => {
    if (!editingSubmission || !selectedStatus || saving) return
    setSaving(true)
    try {
      await submissionService.updateFilingStage(editingSubmission.id, selectedStatus)
      setEditingSubmission(null)
      if (await retry()) toast.success('Filing progress updated.')
      else toast.error('Filing progress was saved, but the list could not refresh. Please reload before making another change.')
    } catch (saveError) {
      toast.error(saveError instanceof Error ? saveError.message : 'Unable to update submission status.')
    } finally {
      setSaving(false)
    }
  }

  const confirmReopen = async () => {
    if (!reopeningSubmission || reopening) return
    setReopening(true)
    try {
      await submissionService.reopenSubmission(reopeningSubmission.id)
      setReopeningSubmission(null)
      if (await retry()) toast.success('Submission reopened for editing.')
      else toast.error('Submission was reopened, but the list could not refresh. Please reload before making another change.')
    } catch (reopenError) {
      toast.error(reopenError instanceof Error ? reopenError.message : 'Unable to reopen submission.')
    } finally {
      setReopening(false)
    }
  }

  const deleteSubmission = async () => {
    if (!deletingSubmission || deleting) return
    setDeleting(true)
    try {
      await submissionService.softDeleteSubmission(deletingSubmission.id)
      setDeletingSubmission(null)
      if (await retry()) toast.success('Submission deleted. Related records were preserved for audit history.')
      else toast.error('Submission was deleted, but the list could not refresh. Please reload before making another change.')
    } catch (deleteError) {
      toast.error(deleteError instanceof Error ? deleteError.message : 'Unable to delete submission.')
    } finally {
      setDeleting(false)
    }
  }


  if (loading) return <LoadingState label="Loading submissions…" />
  if (error) return <ErrorState retry={retry} message={error} />

  return <>
    <PageHeader title="Submissions" description="Track filing milestones and update submission progress." action={<ExcelExportButton filename="submissions" sheetName="Submissions" headers={['Submission', 'Filing type', 'Client', 'Email', 'Updated', 'Current stage', 'Editing access', 'Filing progress']} rows={rows.map((item) => [item.reference ?? item.id, item.filingType, item.clientName, item.clientEmail, formatDate(item.updatedAt), filingProgress(item, item.relatedPayments ?? []).current, submissionEditingAccess(item), filingProgress(item, item.relatedPayments ?? []).milestones.filter((milestone) => milestone.completed).map((milestone) => milestone.label).join('; ')])} />} />
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
          <th className="px-4 py-3">Editing access</th>
          <th className="px-4 py-3">Filing progress</th>
          <th className="px-4 py-3 text-right">Actions</th>
        </tr></thead>
        <tbody>{rows.map((item) => <tr className="border-t border-(--color-border) hover:bg-slate-50" key={item.id}>
          <td data-label="Submission" className="px-4 py-3 font-semibold">{item.reference ?? item.id}<div className="mt-1 text-xs font-normal text-(--color-muted)">{item.filingType}</div></td>
          <td data-label="Client" className="px-4 py-3">{item.clientName}</td>
          <td data-label="Email" className="px-4 py-3 text-(--color-muted)">{item.clientEmail}</td>
          <td data-label="Updated" className="px-4 py-3 text-(--color-muted)">{formatDate(item.updatedAt)}</td>
          <td data-label="Current stage" className="px-4 py-3"><Badge>{filingProgress(item, item.relatedPayments ?? []).current}</Badge></td>
          <td data-label="Editing access" className="px-4 py-3"><Badge>{submissionEditingAccess(item)}</Badge></td>
          <td data-label="Filing progress" className="px-4 py-4"><FilingProgress submission={item} payments={item.relatedPayments ?? []} compact /></td>
          <td data-label="Actions" className="px-4 py-3 text-right"><div className="flex min-w-max justify-end gap-1">
            <Link className="rounded-md p-2 text-slate-600 hover:bg-slate-100" to={`/submissions/${item.id}`} aria-label={`View ${item.id} details`} title="View details"><Eye size={18} /></Link>
            {item.status !== 'Deleted' && <button className="rounded-md p-2 text-slate-600 hover:bg-slate-100" onClick={() => openStatusEditor(item)} aria-label={`Edit filing progress for ${item.id}`} title="Edit filing progress"><Pencil size={18} /></button>}
            {canReopenSubmission(item) && <button className="rounded-md p-2 text-violet-700 hover:bg-violet-50" onClick={() => setReopeningSubmission(item)} aria-label={`Reopen submission ${item.id}`} title="Reopen submission"><RotateCcw size={18} /></button>}
            {item.status !== 'Deleted' && <button className="rounded-md p-2 text-red-600 hover:bg-red-50" onClick={() => setDeletingSubmission(item)} aria-label={`Delete ${item.id}`} title="Delete submission"><Trash2 size={18} /></button>}
          </div></td>
        </tr>)}</tbody>
      </table></div> : <EmptyState />}
    </section>
    <Modal open={Boolean(editingSubmission)} title="Review submission & edit filing progress" size="review" onClose={() => !saving && setEditingSubmission(null)}>
      {editingSubmission && <>
        <div className="mt-4 grid max-h-[65vh] gap-6 overflow-y-auto pr-2 lg:grid-cols-[minmax(0,1fr)_340px]">
          <SubmissionReviewDetails submission={editingSubmission} payments={editingSubmission.relatedPayments ?? []} documents={editingSubmission.relatedDocuments ?? []} />
          <aside className="h-fit min-w-0 space-y-5 rounded-lg border border-[var(--color-border)] bg-slate-50 p-4 lg:sticky lg:top-0">
            <h3 className="font-bold">Filing progress</h3>
            <FilingProgress submission={{ ...editingSubmission, filingStage: selectedStatus || undefined }} payments={editingSubmission.relatedPayments ?? []} />
            <p className="text-xs leading-5 text-[var(--color-muted)]">Submission Received and Payment Confirmed reflect the stored questionnaire and payment records.</p>
            <label className="block text-sm font-semibold" htmlFor="filing-stage">Filing stage</label>
            <select id="filing-stage" className="field" value={selectedStatus} onChange={(event) => setSelectedStatus(event.target.value as FilingStage)} disabled={saving}>
              <option value="">Not provided</option>
              {filingStages.map((stage) => <option key={stage} disabled={stage !== 'Not started' && !filingProgress(editingSubmission, editingSubmission.relatedPayments ?? []).canStart}>{stage}</option>)}
            </select>
            {!filingProgress(editingSubmission, editingSubmission.relatedPayments ?? []).canStart && <p className="text-sm text-amber-700">The questionnaire must be submitted and payment confirmed before filing starts.</p>}
          </aside>
        </div>
        <div className="mt-5 flex justify-end gap-3 border-t border-[var(--color-border)] pt-4"><button className="btn btn-secondary" disabled={saving} onClick={() => setEditingSubmission(null)}>Cancel</button><button className="btn btn-primary" disabled={saving || !selectedStatus} onClick={saveStatus}>{saving ? 'Saving...' : 'Save progress'}</button></div>
      </>}
    </Modal>
    <Modal open={Boolean(reopeningSubmission)} title="Reopen submission?" onClose={() => !reopening && setReopeningSubmission(null)}>
      <p className="mt-4 text-sm leading-6 text-[var(--color-muted)]">Reopen <strong>{reopeningSubmission?.id}</strong> for <strong>{reopeningSubmission?.clientName}</strong>? This allows the client to edit their questionnaire again. Existing answers, documents, payments, and filing progress will be preserved.</p>
      <div className="mt-6 flex justify-end gap-3"><button className="btn btn-secondary" disabled={reopening} onClick={() => setReopeningSubmission(null)}>Cancel</button><button className="btn btn-primary" disabled={reopening} onClick={confirmReopen}>{reopening ? 'Reopening...' : 'Reopen submission'}</button></div>
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
