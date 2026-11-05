import { documents, payments, submissions } from '../mock/data'
import type { ClientDocument, DocumentStatus, FilingStage, Payment, Submission, SubmissionStatus } from '../types/domain'
import { applyFilingStage } from '../features/submissions/progress'
import { reopenSubmission } from '../features/submissions/editingAccess'

const wait = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms))
const copy = <T,>(value: T): T => structuredClone(value)

export const submissionTransitions: Record<SubmissionStatus, SubmissionStatus[]> = {
  Pending: ['Accepted', 'Rejected', 'Deleted'],
  Accepted: ['Deleted'],
  Rejected: ['Pending', 'Deleted'],
  Deleted: [],
}

export const adminService = {
  getAllowedSubmissionStatuses(status: SubmissionStatus) { return copy(submissionTransitions[status]) },
  async getSubmissions() { await wait(); return copy(submissions) },
  async reopenSubmission(id: string): Promise<Submission> {
    await wait(450)
    const submission = submissions.find((item) => item.id === id)
    if (!submission) throw new Error('Submission not found.')
    Object.assign(submission, reopenSubmission(submission, new Date().toISOString()))
    return copy(submission)
  },
  async updateFilingStage(id: string, stage: FilingStage): Promise<Submission> {
    await wait(450)
    const submission = submissions.find((item) => item.id === id)
    if (!submission) throw new Error('Submission not found.')
    Object.assign(submission, applyFilingStage(submission, stage, payments, new Date().toISOString()))
    return copy(submission)
  },
  async getSubmission(id: string) { await wait(); return copy(submissions.find((item) => item.id === id) ?? null) },
  async updateSubmissionStatus(id: string, status: SubmissionStatus): Promise<Submission> {
    await wait(450)
    const submission = submissions.find((item) => item.id === id)
    if (!submission) throw new Error('Submission not found.')
    if (!submission.status || !submissionTransitions[submission.status].includes(status)) throw new Error(`Cannot move a submission from ${submission.status} to ${status}.`)
    submission.status = status
    submission.updatedAt = new Date().toISOString()
    if (status === 'Deleted') submission.deletedAt = submission.updatedAt
    return copy(submission)
  },
  async reviewSubmission(id: string, decision: 'Accepted' | 'Rejected'): Promise<Submission> {
    return this.updateSubmissionStatus(id, decision)
  },
  async getPayments() { await wait(); return copy(payments) },
  async refundPayment(id: string): Promise<Payment> {
    await wait(450)
    const payment = payments.find((item) => item.id === id)
    if (!payment) throw new Error('Payment not found.')
    if (payment.status !== 'Paid') throw new Error('Only paid payments can be refunded.')
    payment.status = 'Refunded'
    payment.refundedAt = new Date().toISOString()
    return copy(payment)
  },
  async getDocuments() { await wait(); return copy(documents) },
  async reviewDocument(id: string, decision: Extract<DocumentStatus, 'Approved' | 'Rejected'>): Promise<ClientDocument> {
    await wait(450)
    const document = documents.find((item) => item.id === id)
    if (!document) throw new Error('Document not found.')
    if (document.status !== 'Pending review') throw new Error('Only pending documents can be reviewed.')
    document.status = decision
    document.reviewedAt = new Date().toISOString()
    return copy(document)
  },
}
