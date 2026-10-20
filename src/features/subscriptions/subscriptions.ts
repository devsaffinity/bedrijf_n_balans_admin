import { filingProgress } from '../submissions/progress'
import type { Payment, Submission } from '../../types/domain'
import type { FilingPeople, FilingPlan, FilingType } from './plans'

export type SubscriptionStatus = 'Active' | 'Pending' | 'Completed' | 'Cancelled'
export interface Subscription {
  id: string
  clientId: string
  submissionId?: string
  planId: FilingType
  year: number
  people: FilingPeople
  amount: number
  mainPersonForm?: string
  partnerForm?: string
  purchasedAt: string | null
  status: SubscriptionStatus
}

// Demo purchases: one record per filing year. Amounts preserve the purchase price.
let subscriptions: Subscription[] = [
  { id: 'SUBS-1001', submissionId: 'SUB-2026-1042', clientId: 'c-101', planId: 'regular', year: 2025, people: 'me', amount: 40, mainPersonForm: 'Regular filing', purchasedAt: '2026-07-21', status: 'Active' },
  { id: 'SUBS-1002', submissionId: 'SUB-2026-1041', clientId: 'c-102', planId: 'company', year: 2025, people: 'me', amount: 100, mainPersonForm: 'Business filing', purchasedAt: '2026-07-20', status: 'Completed' },
  { id: 'SUBS-1003', submissionId: 'SUB-2026-1040', clientId: 'c-103', planId: 'c-form', year: 2025, people: 'me', amount: 45, mainPersonForm: 'C-Form', purchasedAt: null, status: 'Pending' },
  { id: 'SUBS-1004', submissionId: 'SUB-2026-1039', clientId: 'c-104', planId: 'm-form-partner', year: 2025, people: 'both', amount: 90, mainPersonForm: 'M-Form', partnerForm: 'M-Form', purchasedAt: '2026-07-18', status: 'Active' },
  { id: 'SUBS-1005', submissionId: 'SUB-2026-1038', clientId: 'c-105', planId: 'regular-partner', year: 2025, people: 'both', amount: 50, mainPersonForm: 'Regular filing', partnerForm: 'Regular filing', purchasedAt: '2026-07-16', status: 'Active' },
  { id: 'SUBS-1006', submissionId: 'SUB-2026-1037', clientId: 'c-106', planId: 'regular-partner', year: 2024, people: 'both', amount: 50, mainPersonForm: 'Regular filing', partnerForm: 'Regular filing', purchasedAt: '2026-07-14', status: 'Completed' },
  { id: 'SUBS-1007', clientId: 'c-101', planId: 'c-form', year: 2024, people: 'me', amount: 45, mainPersonForm: 'C-Form', purchasedAt: '2026-07-21', status: 'Active' },
  { id: 'SUBS-1008', clientId: 'c-107', planId: 'company', year: 2025, people: 'me', amount: 100, mainPersonForm: 'Business filing', purchasedAt: null, status: 'Cancelled' },
  { id: 'SUBS-1009', submissionId: 'SUB-2026-1036', clientId: 'c-102', planId: 'mixed-regular-m-form', year: 2024, people: 'both', amount: 90, mainPersonForm: 'Regular filing', partnerForm: 'M-Form', purchasedAt: '2026-07-10', status: 'Active' },
]

export const statusTransitions: Record<SubscriptionStatus, SubscriptionStatus[]> = {
  Pending: ['Active', 'Cancelled'],
  Active: ['Completed', 'Cancelled'],
  Completed: [],
  Cancelled: [],
}

// Show the linked plan price; retain the recorded amount as a fallback for missing plans.
export function subscriptionAmount(record: Subscription, plans: FilingPlan[]): number {
  return plans.find((plan) => plan.id === record.planId)?.price ?? record.amount
}

export function subscriptionProgress(record: Subscription, submissions: Submission[], payments: Payment[]) {
  const submission = submissions.find((item) => item.id === record.submissionId && item.clientId === record.clientId)
  const payment = submission ? payments.filter((item) => item.submissionId === submission.id && item.clientId === record.clientId).sort((a, b) => b.date.localeCompare(a.date))[0] : undefined
  return {
    submission,
    submissionStatus: submission ? filingProgress(submission, payments).current : 'Not submitted',
    paymentStatus: payment ? (payment.status === 'Pending' ? 'Payment pending' : payment.status) : 'No payment',
  }
}

export function subscriptionStats(records: Subscription[]) {
  const purchases = records.filter((record) => record.purchasedAt !== null)
  const counts = new Map<FilingType, number>()
  purchases.forEach((record) => counts.set(record.planId, (counts.get(record.planId) ?? 0) + 1))
  const highest = Math.max(0, ...counts.values())
  return {
    total: records.length,
    users: new Set(purchases.map((record) => record.clientId)).size,
    active: records.filter((record) => record.status === 'Active').length,
    topPlans: [...counts].filter(([, count]) => count === highest).map(([planId]) => planId),
    topCount: highest,
  }
}

export const subscriptionService = {
  getAll: () => structuredClone(subscriptions),
  updateStatus(id: string, status: SubscriptionStatus) {
    const record = subscriptions.find((item) => item.id === id)
    if (!record) throw new Error('Subscription not found.')
    if (!statusTransitions[record.status].includes(status)) throw new Error('This status change is not available.')
    subscriptions = subscriptions.map((item) => item.id === id ? {
      ...item, status,
      purchasedAt: status === 'Active' && !item.purchasedAt ? new Date().toISOString() : item.purchasedAt,
    } : item)
  },
}
