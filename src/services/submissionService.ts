import { FirebaseError } from 'firebase/app'
import { collection, deleteField, doc, getDocFromServer, getDocsFromServer, query, runTransaction, serverTimestamp, where, Timestamp, type DocumentData } from 'firebase/firestore'
import type { FilingStage, Payment, Submission } from '../types/domain'
import { applyFilingStage } from '../features/submissions/progress'
import { canReopenSubmission } from '../features/submissions/editingAccess'
import { mapFilingDocuments } from '../features/documents/mapping'
import { getFirebaseServices } from './firebase'

type Data = Record<string, unknown>
const object = (value: unknown): Data => value !== null && typeof value === 'object' && !Array.isArray(value) ? value as Data : {}
const text = (value: unknown) => typeof value === 'string' ? value.trim() : ''
function timestamp(value: unknown): string {
  if (value instanceof Timestamp) return value.toDate().toISOString()
  // Do not interpret DD/MM/YYYY questionnaire answers as server timestamps.
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(value) && Number.isFinite(Date.parse(value))) return new Date(value).toISOString()
  return ''
}
function number(value: unknown): number | undefined {
  if (typeof value === 'number') return Number.isFinite(value) ? value : undefined
  if (typeof value === 'string' && /^-?\d+(\.\d+)?$/.test(value.trim())) return Number.isFinite(Number(value)) ? Number(value) : undefined
  return undefined
}

const labels: Record<string, string> = {
  name: 'Name', email: 'Email', gender: 'Gender', bsn: 'BSN', fiveDigitCode: '5-digit code',
  dateOfBirth: 'Date of birth', nationality: 'Nationality', maritalStatus: 'Marital status', marriageDate: 'Date of marriage',
  countryOfOrigin: 'Country of origin', registeredInNetherlandsDate: 'Netherlands registration date',
  didEmigrate: 'Emigrated out of the Netherlands', deregisteredDate: 'Netherlands deregistration date', emigratedCountry: 'Destination country',
  has30PercentRuling: 'Has 30% ruling', rulingStartDate: 'Ruling start date', rulingEndDate: 'Ruling end date',
  hasChildren: 'Has children', youngestChildDateOfBirth: "Youngest child's date of birth", partner: 'Partner',
  hasIncome: 'Has income', hasHighestIncome: 'Has highest income',
  selections: 'Selected filing years', year: 'Year', filingParty: 'Filing for', plansByYear: 'Plans by year', plan: 'Selected plan', price: 'Price',
  housingType: 'Housing type', purchaseDate: 'House purchase date', renewedOrAdditionalMortgage: 'Mortgage renewed or additional mortgage',
  soldFormerHouse: 'Sold former house', ownsTwoOrMoreHousesInNetherlands: 'Multiple houses in the Netherlands (2 or more)',
  rentedOutSecondHouse: 'Second house rented out', annualRentalIncome: 'Annual rental income',
  rentedHouseMortgageNumbers: 'Mortgage number(s) for rented-out house', situationComments: 'Situation / comments',
  hasOwnCompany: 'Own business', companyName: 'Company name', kvkNumber: 'KVK number', vatNumber: 'VAT number',
  runner: 'Business run by', activities: 'Description of activities', startDate: 'Company start date',
  doesQuarterlyVatFiling: 'Quarterly VAT filing', hoursWorked: 'Hours worked', sales: 'Sales',
  expenses: 'Expenses', totalExpenses: 'Total expenses', totalProfit: 'Total profit', balanceSheet: 'Balance sheet',
  businessBankBalance: 'Business bank balance', businessToPrivateTransfers: 'Business to private transfers',
  privateToBusinessTransfers: 'Private to business transfers', q4VatReturn: 'Q4 VAT return',
  medicalExpenses: 'Medical expenses', hasExpenses: 'Has expenses', amountNotReimbursed: 'Amount not reimbursed',
  partnerAlimony: 'Partner alimony', paid: 'Paid', annualAmount: 'Annual amount', exPartnerName: 'Ex-partner name',
  exPartnerDateOfBirth: 'Ex-partner date of birth', exPartnerBsn: 'Ex-partner BSN',
  giftsAndDonations: 'Gifts and donations', entries: 'Entries', amount: 'Amount',
  travelExpenses: 'Travel expenses', partnerTravelExpenses: 'Partner travel expenses',
  traveledByPublicTransport: 'Travelled by public transport', employerReimbursed: 'Employer reimbursed expenses',
  officeOrWorkLocation: 'Office / work location', fromDate: 'From date', toDate: 'To date', oneWayDistanceKm: 'One-way distance (km)', daysPerWeek: 'Days per week',
  accounts: 'Accounts', type: 'Account type', owner: 'Account holder', amountOnJanuaryFirst: 'Amount on 1 January',
  bankAccountOrRegistrationNumber: 'Bank account / registration number', has30PercentRulingBefore2024: '30% ruling before 2024',
  hasLoansOrMortgageOutsideNetherlands: 'Loans or mortgage outside the Netherlands', loanOrMortgageAmountOnJanuaryFirst: 'Loan or mortgage amount on 1 January',
  currency: 'Currency', method: 'Method', status: 'Status', comments: 'Comments',
  files: 'Files', extension: 'File type', sizeBytes: 'File size (bytes)',
}

function answerItems(value: unknown, path: string[] = []): Submission['answers'][number]['items'] {
  if (Array.isArray(value)) return value.flatMap((item, index) => answerItems(item, [...path, String(index + 1)]))
  if (value !== null && typeof value === 'object') return Object.entries(object(value))
    // Storage paths are internal file addresses, not questionnaire answers.
    .filter(([key]) => key !== 'storagePath')
    .flatMap(([key, item]) => answerItems(item, [...path, key]))
  const key = path.at(-1) ?? ''
  let answer = typeof value === 'boolean' ? value ? 'Yes' : 'No' : typeof value === 'number' || typeof value === 'string' ? String(value) : ''
  if (/bsn$/i.test(key) && answer.trim()) answer = '•'.repeat(Math.max(0, answer.length - 4)) + answer.slice(-4)
  return [{ question: path.map((part) => labels[part] ?? part).join(' / '), answer: answer.trim() || 'Not provided' }]
}

export function mapTaxFiling(id: string, data: DocumentData): Submission {
  const person = object(data.personalInformation)
  const review = object(data.review)
  const plans = object(object(data.filingPlan).plansByYear)
  const filingType = Object.entries(plans).sort(([a], [b]) => b.localeCompare(a)).map(([year, plan]) => {
    const name = text(object(plan).plan)
    return name ? `${year}: ${name}` : ''
  }).filter(Boolean).join('; ')
  const answers: Submission['answers'] = []
  const sections: [string, string][] = [
    ['personalInformation', 'Personal information'], ['filingAuthorization', 'Filing authorization'],
    ['filingYears', 'Filing years'], ['filingPlan', 'Filing plans'], ['house', 'House / property'],
    ['ownCompany', 'Business details'], ['boxThree', 'Accounts & mortgage'],
    ['deductibleExpenses', 'Deductible expenses'], ['payment', 'Payment'], ['documents', 'Documents'], ['review', 'Review'],
  ]
  for (const [key, section] of sections) {
    if (data[key] === undefined) continue
    const items = answerItems(data[key])
    if (key === 'filingYears' && data.taxYear !== undefined) items.unshift({ question: 'Tax year', answer: String(data.taxYear) })
    if (key === 'review' && data.currentStep !== undefined) items.push({ question: 'Current step', answer: text(data.currentStep) || 'Not provided' })
    if (items.length) answers.push({ section, items })
  }

  const submission: Submission = {
    id, source: 'taxFilings', reference: text(data.reference) || undefined,
    sourceReviewStatus: text(review.status) || undefined, currentStep: text(data.currentStep) || undefined,
    createdAt: timestamp(data.createdAt) || undefined,
    clientId: text(data.userId), clientName: text(person.name) || 'Not provided', clientEmail: text(person.email) || 'Not provided',
    filingType: filingType || 'Not provided', submittedAt: timestamp(data.submittedAt) || null, updatedAt: timestamp(data.updatedAt), answers,
    status: data.status === 'Deleted' || timestamp(data.deletedAt) ? 'Deleted' : undefined,
    deletedAt: timestamp(data.deletedAt) || undefined,
    editingUnlocked: typeof data.editingUnlocked === 'boolean' ? data.editingUnlocked : undefined,
    reopenedAt: timestamp(data.reopenedAt) || undefined,
    filingStage: ['Not started', 'Filing in Progress', 'Submitted to Tax Authority'].includes(data.filingStage) ? data.filingStage : undefined,
    filingStartedAt: timestamp(data.filingStartedAt) || undefined,
    taxAuthoritySubmittedAt: timestamp(data.taxAuthoritySubmittedAt) || undefined,
    progress: typeof data.progress === 'number' && Number.isFinite(data.progress) && data.progress >= 0 && data.progress <= 100 ? data.progress : undefined,
  }
  const payment = object(data.payment)
  const amount = number(payment.amount)
  const paymentStatuses: Record<string, Payment['status']> = { confirmed: 'Confirmed', paid: 'Paid', pending: 'Pending', failed: 'Failed', refunded: 'Refunded' }
  submission.relatedPayments = amount === undefined ? [] : [{
    id: `${id}:payment`, submissionId: id, clientId: submission.clientId, clientName: submission.clientName, clientEmail: submission.clientEmail,
    amount, currency: text(payment.currency) || undefined, status: paymentStatuses[text(payment.status)] ?? 'Not provided', date: '', reference: '',
  }]
  submission.relatedDocuments = mapFilingDocuments(id, data)
  return submission
}

function readError(error: unknown): Error {
  if (error instanceof FirebaseError && error.code === 'permission-denied') return new Error('You do not have permission to view submissions. Contact the administrator.')
  return new Error('Unable to load submissions. Check your connection and try again.')
}

async function updateSubmission(id: string, action: 'stage' | 'reopen' | 'delete', stage?: FilingStage): Promise<void> {
  if (!id || id.includes('/')) throw new Error('Invalid submission ID.')
  try {
    const db = getFirebaseServices().db
    const reference = doc(db, 'taxFilings', id)
    await runTransaction(db, async (transaction) => {
      const snapshot = await transaction.get(reference)
      if (!snapshot.exists()) throw new Error('Submission not found.')
      const raw = snapshot.data()
      const submission = mapTaxFiling(id, raw)
      if (submission.status === 'Deleted') throw new Error('Deleted submissions cannot be edited.')
      const now = serverTimestamp()
      if (action === 'delete') {
        transaction.update(reference, { status: 'Deleted', deletedAt: now, updatedAt: now })
      } else if (action === 'reopen') {
        if (!canReopenSubmission(submission)) throw new Error('Only locked, submitted questionnaires can be reopened.')
        transaction.update(reference, { editingUnlocked: true, reopenedAt: now, updatedAt: now })
      } else {
        if (!stage) throw new Error('Choose a valid filing stage.')
        applyFilingStage(submission, stage, submission.relatedPayments ?? [], new Date().toISOString())
        transaction.update(reference, {
          filingStage: stage,
          filingStartedAt: stage === 'Not started' ? deleteField() : raw.filingStartedAt instanceof Timestamp ? raw.filingStartedAt : now,
          taxAuthoritySubmittedAt: stage === 'Submitted to Tax Authority' ? raw.taxAuthoritySubmittedAt instanceof Timestamp ? raw.taxAuthoritySubmittedAt : now : deleteField(),
          updatedAt: now,
        })
      }
    })
  } catch (error) {
    if (error instanceof FirebaseError) {
      if (error.code === 'permission-denied') throw new Error('You do not have permission to update submissions. Contact the administrator.')
      throw new Error('Unable to update the submission. Check your connection and try again.')
    }
    throw error
  }
}

export const submissionService = {
  updateFilingStage: (id: string, stage: FilingStage) => updateSubmission(id, 'stage', stage),
  reopenSubmission: (id: string) => updateSubmission(id, 'reopen'),
  softDeleteSubmission: (id: string) => updateSubmission(id, 'delete'),
  async getClientSubmissions(clientId: string): Promise<Submission[]> {
    if (!clientId || clientId.includes('/')) return []
    try {
      const snapshot = await getDocsFromServer(query(collection(getFirebaseServices().db, 'taxFilings'), where('userId', '==', clientId)))
      return snapshot.docs.map((item) => mapTaxFiling(item.id, item.data()))
        .filter((item) => item.clientId === clientId)
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt) || a.id.localeCompare(b.id))
    } catch (error) { throw readError(error) }
  },
  async getSubmissions(): Promise<Submission[]> {
    try {
      const snapshot = await getDocsFromServer(collection(getFirebaseServices().db, 'taxFilings'))
      return snapshot.docs.map((item) => mapTaxFiling(item.id, item.data()))
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt) || a.id.localeCompare(b.id))
    } catch (error) { throw readError(error) }
  },
  async getSubmission(id: string): Promise<Submission | null> {
    if (!id || id.includes('/')) return null
    try {
      const snapshot = await getDocFromServer(doc(getFirebaseServices().db, 'taxFilings', id))
      return snapshot.exists() ? mapTaxFiling(snapshot.id, snapshot.data()) : null
    } catch (error) { throw readError(error) }
  },
}
