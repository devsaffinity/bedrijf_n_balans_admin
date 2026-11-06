import type { FilingStage, Payment, Submission } from '../../types/domain'

export const filingStages: FilingStage[] = ['Not started', 'Filing in Progress', 'Submitted to Tax Authority']
export function filingProgress(submission: Submission, payments: Payment[]) {
  const payment = payments.filter((item) => item.submissionId === submission.id && item.clientId === submission.clientId).sort((a, b) => b.date.localeCompare(a.date))[0]
  const fromFirestore = submission.source === 'taxFilings'
  const stage = submission.filingStage ?? (fromFirestore ? undefined : 'Not started')
  const received = submission.submittedAt ? true : fromFirestore
    ? submission.sourceReviewStatus === 'submitted' ? true : submission.sourceReviewStatus === 'inProgress' ? false : undefined
    : false
  const paymentConfirmed = payment ? payment.status === 'Not provided' ? undefined : payment.status === 'Paid' || payment.status === 'Confirmed' : fromFirestore ? undefined : false
  const milestones = [
    { label: 'Submission Received', completed: received, date: submission.submittedAt },
    { label: 'Payment Confirmed', completed: paymentConfirmed, date: paymentConfirmed ? payment?.date ?? null : null },
    { label: 'Filing in Progress', completed: stage === undefined ? undefined : stage !== 'Not started', date: submission.filingStartedAt ?? null },
    { label: 'Submitted to Tax Authority', completed: stage === undefined ? undefined : stage === 'Submitted to Tax Authority', date: submission.taxAuthoritySubmittedAt ?? null },
  ]
  const completed = milestones.filter((item) => item.completed).length
  const current = submission.status === 'Deleted' ? 'Deleted' : stage && stage !== 'Not started' ? stage : received === false ? 'Draft' : received === true ? paymentConfirmed ? 'Payment Confirmed' : 'Submission Received' : 'Not provided'
  return { milestones, completed, current, canStart: received === true && paymentConfirmed === true && submission.status !== 'Deleted' }
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
