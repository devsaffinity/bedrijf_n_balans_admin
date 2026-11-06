import type { Submission } from '../../types/domain'

export function submissionEditingAccess(submission: Submission) {
  if (submission.status === 'Deleted') return 'Locked'
  if (submission.source === 'taxFilings') {
    if (submission.editingUnlocked === true) return 'Open for editing'
    if (submission.submittedAt || submission.sourceReviewStatus === 'submitted') return 'Locked'
    if (submission.sourceReviewStatus === 'inProgress') return 'Open for editing'
    return 'Not provided'
  }
  return !submission.submittedAt || submission.editingUnlocked ? 'Open for editing' : 'Locked'
}

export function canReopenSubmission(submission: Submission) {
  return submission.status !== 'Deleted' && Boolean(submission.submittedAt || submission.source === 'taxFilings' && submission.sourceReviewStatus === 'submitted') && !submission.editingUnlocked
}

export function reopenSubmission(submission: Submission, now: string): Submission {
  if (!canReopenSubmission(submission)) throw new Error('Only locked, submitted questionnaires can be reopened.')
  return { ...submission, editingUnlocked: true, reopenedAt: now, updatedAt: now }
}
