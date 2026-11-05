import { submissionEditingAccess } from './editingAccess'
import { Link } from 'react-router-dom'
import { Badge } from '../../components/ui/Badge'
import type { ClientDocument, Payment, Submission } from '../../types/domain'
import { formatDate, formatMoney } from '../../utils/format'

export function SubmissionReviewDetails({ submission, payments, documents }: { submission: Submission; payments: Payment[]; documents: ClientDocument[] }) {
  const relatedPayments = payments.filter((item) => item.submissionId === submission.id && item.clientId === submission.clientId)
  const relatedDocuments = documents.filter((item) => item.submissionId === submission.id && item.clientId === submission.clientId)
  return <div className="min-w-0 space-y-5">
    <section className="rounded-lg border border-[var(--color-border)] p-4">
      <h3 className="font-bold">Submission details</h3>
      <dl className="mt-4 grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
        <div className="min-w-0"><dt className="text-[var(--color-muted)]">Client</dt><dd className="mt-1 font-semibold"><Link className="text-[var(--color-brand)] hover:underline" to={`/clients/${submission.clientId}`}>{submission.clientName}</Link></dd></div>
        {[
          ['Email', submission.clientEmail], ['Editing access', submissionEditingAccess(submission)], ['Submission ID', submission.reference ?? submission.id], ['Filing type', submission.filingType],
          ['Submitted', submission.submittedAt ? formatDate(submission.submittedAt) : submission.source === 'taxFilings' ? 'Not provided' : 'Not submitted'], ['Last updated', formatDate(submission.updatedAt)],
          ['Questionnaire completion', submission.progress === undefined ? 'Not provided' : `${submission.progress}%`],
        ].map(([label, value]) => <div key={label} className="min-w-0"><dt className="text-[var(--color-muted)]">{label}</dt><dd className="mt-1 break-words font-semibold">{value}</dd></div>)}
      </dl>
    </section>
    <section aria-label="Questionnaire answers"><h3 className="mb-3 font-bold">Questionnaire answers</h3>
      {submission.answers.length ? <div className="space-y-4">{submission.answers.map((section, index) => <section key={`${section.section}-${index}`} className="overflow-hidden rounded-lg border border-[var(--color-border)]">
        <h4 className="bg-slate-50 px-4 py-3 text-sm font-semibold">{section.section}</h4>
        <dl className="divide-y divide-[var(--color-border)]">{section.items.map((item, itemIndex) => <div className="grid gap-2 px-4 py-3 text-sm sm:grid-cols-2" key={`${item.question}-${itemIndex}`}><dt className="break-words text-[var(--color-muted)]">{item.question}</dt><dd className="whitespace-pre-wrap break-words font-medium">{item.answer || 'Not provided'}</dd></div>)}</dl>
      </section>)}</div> : <p className="text-sm text-[var(--color-muted)]">No questionnaire answers available.</p>}
    </section>
    <section className="rounded-lg border border-[var(--color-border)] p-4"><h3 className="font-bold">Related payments</h3>
      {relatedPayments.length ? <ul className="mt-3 divide-y divide-[var(--color-border)]">{relatedPayments.map((payment) => <li className="flex flex-wrap items-start justify-between gap-3 py-3 text-sm" key={payment.id}><div><p className="font-semibold">{formatMoney(payment.amount)}</p><p className="mt-1 break-all text-xs text-[var(--color-muted)]">{payment.reference}</p><p className="mt-1 text-xs text-[var(--color-muted)]">{formatDate(payment.date)}</p></div><Badge>{payment.status}</Badge></li>)}</ul> : <p className="mt-3 text-sm text-[var(--color-muted)]">No payment recorded for this submission.</p>}
    </section>
    <section className="rounded-lg border border-[var(--color-border)] p-4"><h3 className="font-bold">Supporting documents</h3>
      {relatedDocuments.length ? <ul className="mt-3 divide-y divide-[var(--color-border)]">{relatedDocuments.map((document) => <li className="flex flex-wrap items-start justify-between gap-3 py-3 text-sm" key={document.id}><div className="min-w-0"><p className="break-words font-semibold">{document.name}</p><p className="mt-1 text-xs text-[var(--color-muted)]">{document.type} · {document.size} · {formatDate(document.uploadedAt)}</p></div><Badge>{document.status}</Badge></li>)}</ul> : <p className="mt-3 text-sm text-[var(--color-muted)]">No documents linked to this submission.</p>}
    </section>
  </div>
}
