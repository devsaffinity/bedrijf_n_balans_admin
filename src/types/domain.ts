export type ClientStatus = 'Active' | 'Awaiting submission' | 'Review needed'
export type SubmissionStatus = 'Open' | 'Completed' | 'Locked' | 'Reopened'
export type PaymentStatus = 'Paid' | 'Pending' | 'Failed'
export type DocumentStatus = 'Available' | 'Pending review'

export interface Client {
  id: string
  name: string
  email: string
  phone: string
  status: ClientStatus
  filingType: string
  joinedAt: string
}

export interface Submission {
  id: string
  clientId: string
  clientName: string
  clientEmail: string
  filingType: string
  status: SubmissionStatus
  progress: number
  submittedAt: string | null
  updatedAt: string
  answers: { section: string; items: { question: string; answer: string }[] }[]
}

export interface Payment {
  id: string
  submissionId: string
  clientId: string
  clientName: string
  clientEmail: string
  amount: number
  status: PaymentStatus
  date: string
  reference: string
}

export interface ClientDocument {
  id: string
  clientId: string
  submissionId: string
  owner: string
  name: string
  type: string
  size: string
  uploadedAt: string
  status: DocumentStatus
}
