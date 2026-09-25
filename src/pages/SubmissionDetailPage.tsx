import { ArrowLeft, CalendarDays, FileCheck2 } from 'lucide-react'
import { useCallback } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Badge } from '../components/ui/Badge'
import { ErrorState, LoadingState } from '../components/ui/States'
import { useAsync } from '../hooks/useAsync'
import { adminService } from '../services/mockService'
import { FilingProgress } from '../components/ui/FilingProgress'
import { submissionEditingAccess } from '../features/submissions/editingAccess'
import { filingProgress } from '../features/submissions/progress'
import { payments } from '../mock/data'
import { formatDate } from '../utils/format'

export function SubmissionDetailPage() {
  const { submissionId = '' } = useParams()
  const { data, loading, error, retry } = useAsync(useCallback(() => adminService.getSubmission(submissionId), [submissionId]))
  if (loading) return <LoadingState />
  if (error) return <ErrorState retry={retry} />
  if (!data) return <div className="card p-8 text-center">Submission not found.</div>

  return <>
    <Link className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-brand)]" to="/submissions"><ArrowLeft size={17} />Back to submissions</Link>
    <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div><div className="mb-2 flex items-center gap-3"><h1 className="text-2xl font-bold sm:text-3xl">{data.id}</h1><Badge>{filingProgress(data, payments).current}</Badge></div><p className="text-sm text-[var(--color-muted)]">{data.clientName} · {data.clientEmail}</p></div></header>
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div className="space-y-5">{data.answers.map((section) => <section className="card overflow-hidden" key={section.section}><h2 className="border-b border-[var(--color-border)] bg-slate-50 px-5 py-4 font-bold">{section.section}</h2><dl className="divide-y divide-[var(--color-border)]">{section.items.map((item) => <div className="grid gap-1 px-5 py-4 sm:grid-cols-[1fr_1.1fr] sm:gap-6" key={item.question}><dt className="text-sm text-[var(--color-muted)]">{item.question}</dt><dd className="text-sm font-semibold sm:text-right">{item.answer}</dd></div>)}</dl></section>)}</div>
      <aside className="card h-fit p-5"><h2 className="font-bold">Submission details</h2><dl className="mt-5 space-y-4 text-sm"><div><dt className="text-[var(--color-muted)]">Editing access</dt><dd className="mt-1"><Badge>{submissionEditingAccess(data)}</Badge></dd></div>{data.reopenedAt && <div><dt className="text-[var(--color-muted)]">Last reopened</dt><dd className="mt-1 font-semibold">{formatDate(data.reopenedAt)}</dd></div>}<div><dt className="flex items-center gap-2 text-[var(--color-muted)]"><CalendarDays size={15} />Submitted</dt><dd className="mt-1 font-semibold">{formatDate(data.submittedAt)}</dd></div><div><dt className="flex items-center gap-2 text-[var(--color-muted)]"><FileCheck2 size={15} />Current stage</dt><dd className="mt-1 font-semibold">{filingProgress(data, payments).current}</dd></div><div><dt className="text-[var(--color-muted)]">Filing type</dt><dd className="mt-1 font-semibold">{data.filingType}</dd></div><div><dt className="text-[var(--color-muted)]">Questionnaire completion</dt><dd className="mt-1 font-semibold">{data.progress}%</dd></div></dl><section className="mt-6 border-t border-[var(--color-border)] pt-5"><h2 className="mb-4 font-bold">Filing progress</h2><FilingProgress submission={data} payments={payments} showDates /></section></aside>
    </div>
  </>
}
