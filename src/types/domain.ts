export type ClientStatus = 'Active' | 'Awaiting submission' | 'Review needed' | 'Deleted'
export type SubmissionStatus = 'Pending' | 'Accepted' | 'Rejected' | 'Deleted'
export type PaymentStatus = 'Paid' | 'Pending' | 'Failed' | 'Refunded'
export type DocumentStatus = 'Available' | 'Pending review' | 'Approved' | 'Rejected'
export type FilingStage = 'Not started' | 'Filing in Progress' | 'Submitted to Tax Authority'

export interface PartnerInfo {
  name?: string
  email?: string
  phone?: string
  dateOfBirth?: string
  nationality?: string
  city?: string
  bsn?: string
  fiveDigitCode?: string
  registrationDate?: string
  originCountry?: string
  emigratedFromNetherlands?: boolean
  emigrationDate?: string
  destinationCountry?: string
}

export interface Client {
  id: string
  name: string
  email: string
  phone: string
  dateOfBirth?: string
  nationality?: string
  city?: string
  bsn?: string
  fiveDigitCode?: string
  maritalStatus?: 'Single' | 'Married' | 'Living together' | 'Divorced' | 'Widowed'
  dateOfMarriage?: string
  hasThirtyPercentRuling?: boolean
  thirtyPercentRulingStart?: string
  thirtyPercentRulingEnd?: string
  registrationDate?: string
  originCountry?: string
  emigratedFromNetherlands?: boolean
  emigrationDate?: string
  destinationCountry?: string
  partner?: PartnerInfo
  status: ClientStatus
  filingType: string
  joinedAt: string
  deletedAt?: string
}

export interface PropertyDetails {
  filingYear: number
  housing?: 'Rental' | 'Purchased with mortgage'
  mortgageDetails?: { question: string; answer: string }[]
  ownsMultipleHousesInNetherlands?: boolean
  additionalHouseDetails?: { question: string; answer: string }[]
  rentedOut?: boolean
  rentalDetails?: { question: string; answer: string }[]
  situation?: string
}

export interface FilingDetailField {
  label: string
  value: string
}

export interface FilingTravelDetails {
  usedPublicTransport?: boolean
  followUp?: { label: string; answer?: boolean }
  details?: FilingDetailField[]
}

export interface FilingPersonDetails extends Pick<PartnerInfo, 'name' | 'email' | 'dateOfBirth' | 'nationality' | 'city' | 'registrationDate' | 'originCountry' | 'emigratedFromNetherlands' | 'emigrationDate' | 'destinationCountry'> {
  travel?: FilingTravelDetails
}

export interface FilingDetails {
  filingYear: number
  mainPerson?: FilingPersonDetails
  hasPartner?: boolean
  partner?: FilingPersonDetails
  children?: { hasChildren?: boolean; details?: FilingDetailField[] }
  business?: {
    hasOwnBusiness?: boolean
    ownership?: 'Me' | 'My partner' | 'Both their own business' | 'Jointly (VOF)'
    details?: FilingDetailField[]
  }
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
  editingUnlocked?: boolean
  reopenedAt?: string
  filingStage?: FilingStage
  filingStartedAt?: string
  taxAuthoritySubmittedAt?: string
  updatedAt: string
  deletedAt?: string
  propertyDetails?: PropertyDetails
  filingDetails?: FilingDetails
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
