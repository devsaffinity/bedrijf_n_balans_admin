import { clients, documents, payments, submissions } from '../mock/data'
import type { Client, ClientStatus, Submission, SubmissionStatus } from '../types/domain'

const wait = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms))
const copy = <T,>(value: T): T => structuredClone(value)

export const adminService = {
  async getClients() { await wait(); return copy(clients) },
  async getClient(id: string) { await wait(); return copy(clients.find((item) => item.id === id) ?? null) },
  async updateClientStatus(id: string, status: ClientStatus): Promise<Client> {
    await wait(450)
    const client = clients.find((item) => item.id === id)
    if (!client) throw new Error('Client not found.')
    client.status = status
    return copy(client)
  },
  async deleteClient(id: string): Promise<void> {
    await wait(450)
    const clientIndex = clients.findIndex((item) => item.id === id)
    if (clientIndex === -1) throw new Error('Client not found.')
    clients.splice(clientIndex, 1)
    for (const records of [submissions, payments, documents]) {
      for (let index = records.length - 1; index >= 0; index -= 1) {
        if (records[index].clientId === id) records.splice(index, 1)
      }
    }
  },
  async getSubmissions() { await wait(); return copy(submissions) },
  async getSubmission(id: string) { await wait(); return copy(submissions.find((item) => item.id === id) ?? null) },
  async updateSubmissionStatus(id: string, status: SubmissionStatus): Promise<Submission> {
    await wait(450)
    const submission = submissions.find((item) => item.id === id)
    if (!submission) throw new Error('Submission not found.')
    submission.status = status
    submission.updatedAt = new Date().toISOString()
    return copy(submission)
  },
  async deleteSubmission(id: string): Promise<void> {
    await wait(450)
    const submissionIndex = submissions.findIndex((item) => item.id === id)
    if (submissionIndex === -1) throw new Error('Submission not found.')
    submissions.splice(submissionIndex, 1)
    for (const records of [payments, documents]) {
      for (let index = records.length - 1; index >= 0; index -= 1) {
        if (records[index].submissionId === id) records.splice(index, 1)
      }
    }
  },
  async getPayments() { await wait(); return copy(payments) },
  async deletePayment(id: string): Promise<void> {
    await wait(450)
    const paymentIndex = payments.findIndex((item) => item.id === id)
    if (paymentIndex === -1) throw new Error('Payment not found.')
    payments.splice(paymentIndex, 1)
  },
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
