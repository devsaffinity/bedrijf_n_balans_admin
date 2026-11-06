import { filingProgress } from '../submissions/progress'
import type { Payment, Submission } from '../../types/domain'
import type { FilingPeople, FilingPlan, FilingType } from './plans'
import { findPlan } from './plans'

export type SubscriptionStatus = 'Active' | 'Pending' | 'Completed' | 'Cancelled'
export interface Subscription {
  id: string
  reference?: string
  clientName?: string
  clientEmail?: string
  planName?: string
  submissionStatus?: string
  paymentStatus?: string
  submissionProgress?: number
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



export const statusTransitions: Record<SubscriptionStatus, SubscriptionStatus[]> = {
  Pending: ['Active', 'Cancelled'],
  Active: ['Completed', 'Cancelled'],
  Completed: [],
  Cancelled: [],
}

// Persisted seed purchases retain the displayed amount captured when seeded.
export function subscriptionAmount(record: Subscription, plans: FilingPlan[]): number {
  if (record.reference) return record.amount
  return findPlan(plans, record.planId)?.price ?? record.amount
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

export { subscriptionService } from '../../services/subscriptionService'
