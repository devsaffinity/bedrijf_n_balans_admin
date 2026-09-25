import type { Submission } from '../../types/domain'

export function submissionEditingAccess(submission: Submission) {
  return submission.status !== 'Deleted' && (!submission.submittedAt || submission.editingUnlocked) ? 'Open for editing' : 'Locked'
}

export function canReopenSubmission(submission: Submission) {
  return submission.status !== 'Deleted' && Boolean(submission.submittedAt) && !submission.editingUnlocked
}

export function reopenSubmission(submission: Submission, now: string): Submission {
  if (!canReopenSubmission(submission)) throw new Error('Only locked, submitted questionnaires can be reopened.')
  return { ...submission, editingUnlocked: true, reopenedAt: now, updatedAt: now }
}
