export type ClientStatus = 'Active' | 'Awaiting submission' | 'Review needed' | 'Deleted'
export type SubmissionStatus = 'Pending' | 'Accepted' | 'Rejected' | 'Deleted'
export type PaymentStatus = 'Paid' | 'Pending' | 'Failed' | 'Refunded' | 'Confirmed' | 'Not provided'
export type DocumentStatus = 'Available' | 'Pending review' | 'Approved' | 'Rejected' | 'Not provided'
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
  purchaseDate?: string
  mortgageChanged?: boolean
  mortgageDetails?: { question: string; answer: string }[]
  ownsMultipleHousesInNetherlands?: boolean
  additionalHouseDetails?: { question: string; answer: string }[]
  rentedOut?: boolean
  annualRentalIncomeEur?: number
  rentedHouseMortgageNumbers?: string[]
  rentalDetails?: { question: string; answer: string }[]
  situation?: string
}

export interface FilingDetailField {
  label: string
  value: string
}

export interface FilingTravelDetails {
  usedPublicTransport?: boolean
  employerReimbursed?: boolean
  workLocation?: string
  fromDate?: string
  toDate?: string
  oneWayDistanceKm?: number
  daysPerWeek?: number
  details?: FilingDetailField[]
}

export interface FilingPersonDetails extends Pick<PartnerInfo, 'name' | 'email' | 'dateOfBirth' | 'nationality' | 'city' | 'registrationDate' | 'originCountry' | 'emigratedFromNetherlands' | 'emigrationDate' | 'destinationCountry'> {
  travel?: FilingTravelDetails
  thirtyPercentRuling?: { hasRuling?: boolean; startDate?: string; endDate?: string }
}

export interface FilingDeductions {
  medical?: { hasExpenses?: boolean; unreimbursedAmountEur?: number }
  alimony?: { paid?: boolean; exPartnerName?: string; exPartnerDateOfBirth?: string; exPartnerBsn?: string; annualAmountEur?: number }
  donations?: { paid?: boolean; items?: { id: string; charity: string; amountEur?: number }[] }
}

export interface FilingDetails {
  filingYear: number
  mainPerson?: FilingPersonDetails
  hasPartner?: boolean
  partner?: FilingPersonDetails
  children?: { hasChildren?: boolean; youngestDateOfBirth?: string; details?: FilingDetailField[] }
  business?: {
    hasOwnBusiness?: boolean
    ownership?: 'Me' | 'My partner' | 'Both their own business' | 'Jointly (VOF)'
    activities?: string
    startDate?: string
    details?: FilingDetailField[]
  }
  deductions?: FilingDeductions
  accountsAndMortgage?: {
    accounts?: {
      id: string
      name: string
      accountNumber?: string
      category: string
      holder?: string
      balanceEur?: number
    }[]
    hasForeignMortgage?: boolean
    foreignMortgageAmountEur?: number
  }
}

export interface Submission {
  id: string
  source?: 'taxFilings'
  reference?: string
  sourceReviewStatus?: string
  currentStep?: string
  createdAt?: string
  relatedPayments?: Payment[]
  relatedDocuments?: ClientDocument[]
  clientId: string
  clientName: string
  clientEmail: string
  filingType: string
  status?: SubmissionStatus
  progress?: number
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
  storagePath?: string
  submissionReference?: string
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
