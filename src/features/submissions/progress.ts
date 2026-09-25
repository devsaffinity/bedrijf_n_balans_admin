import type { FilingStage, Payment, Submission } from '../../types/domain'

export const filingStages: FilingStage[] = ['Not started', 'Filing in Progress', 'Submitted to Tax Authority']
export function filingProgress(submission: Submission, payments: Payment[]) {
  const payment = payments.filter((item) => item.submissionId === submission.id && item.clientId === submission.clientId).sort((a, b) => b.date.localeCompare(a.date))[0]
  const stage = submission.filingStage ?? 'Not started'
  const milestones = [
    { label: 'Submission Received', completed: Boolean(submission.submittedAt), date: submission.submittedAt },
    { label: 'Payment Confirmed', completed: payment?.status === 'Paid', date: payment?.status === 'Paid' ? payment.date : null },
    { label: 'Filing in Progress', completed: stage !== 'Not started', date: submission.filingStartedAt ?? null },
    { label: 'Submitted to Tax Authority', completed: stage === 'Submitted to Tax Authority', date: submission.taxAuthoritySubmittedAt ?? null },
  ]
  const completed = milestones.filter((item) => item.completed).length
  const current = submission.status === 'Deleted' ? 'Deleted' : stage !== 'Not started' ? stage : !submission.submittedAt ? 'Draft' : payment?.status === 'Paid' ? 'Payment Confirmed' : 'Submission Received'
  return { milestones, completed, current, canStart: Boolean(submission.submittedAt) && payment?.status === 'Paid' && submission.status !== 'Deleted' }
}

export function applyFilingStage(submission: Submission, stage: FilingStage, payments: Payment[], now: string) {
  if (!filingStages.includes(stage)) throw new Error('Choose a valid filing stage.')
  if (submission.status === 'Deleted') throw new Error('Deleted submissions cannot be edited.')
  if (stage !== 'Not started' && !filingProgress(submission, payments).canStart) throw new Error('The questionnaire must be submitted and payment confirmed before filing starts.')
  return {
    ...submission,
    filingStage: stage,
    filingStartedAt: stage === 'Not started' ? undefined : submission.filingStartedAt ?? now,
    taxAuthoritySubmittedAt: stage === 'Submitted to Tax Authority' ? submission.taxAuthoritySubmittedAt ?? now : undefined,
    updatedAt: now,
  }
}
