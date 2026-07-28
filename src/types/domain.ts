export type ClientStatus = 'Active' | 'Awaiting submission' | 'Review needed' | 'Deleted'
export type SubmissionStatus = 'Pending' | 'Accepted' | 'Rejected' | 'Deleted'
export type PaymentStatus = 'Paid' | 'Pending' | 'Failed' | 'Refunded'
export type DocumentStatus = 'Available' | 'Pending review' | 'Approved' | 'Rejected'

export interface Client {
  id: string
  name: string
  email: string
  phone: string
  status: ClientStatus
  filingType: string
  joinedAt: string
  deletedAt?: string
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
  deletedAt?: string
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
  refundedAt?: string
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
  reviewedAt?: string
}
