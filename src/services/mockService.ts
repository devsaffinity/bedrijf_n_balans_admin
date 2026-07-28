import { clients, documents, payments, submissions } from '../mock/data'
import type { Submission } from '../types/domain'

const wait = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms))
const copy = <T,>(value: T): T => structuredClone(value)

export const adminService = {
  async getClients() { await wait(); return copy(clients) },
  async getClient(id: string) { await wait(); return copy(clients.find((item) => item.id === id) ?? null) },
  async getSubmissions() { await wait(); return copy(submissions) },
  async getSubmission(id: string) { await wait(); return copy(submissions.find((item) => item.id === id) ?? null) },
  async getPayments() { await wait(); return copy(payments) },
  async getDocuments() { await wait(); return copy(documents) },
  async getClientRelations(clientId: string) {
    await wait()
    return copy({
      submissions: submissions.filter((item) => item.clientId === clientId),
      payments: payments.filter((item) => item.clientId === clientId),
      documents: documents.filter((item) => item.clientId === clientId),
    })
  },
  async reopenSubmission(id: string): Promise<Submission> {
    await wait(650)
    const item = submissions.find((submission) => submission.id === id)
    if (!item || item.status !== 'Locked') throw new Error('This submission cannot be reopened.')
    item.status = 'Reopened'
    item.updatedAt = new Date().toISOString()
    return copy(item)
  },
}
