import type { FilingPeople, FilingType } from './plans'

export type SubscriptionStatus = 'Active' | 'Pending' | 'Completed' | 'Cancelled'
export interface Subscription {
  id: string
  clientId: string
  planId: FilingType
  year: number
  people: FilingPeople
  amount: number
  purchasedAt: string | null
  status: SubscriptionStatus
}

// Demo purchases: one record per filing year. Amounts preserve the purchase price.
let subscriptions: Subscription[] = [
  { id: 'SUBS-1001', clientId: 'c-101', planId: 'regular', year: 2025, people: 'me', amount: 40, purchasedAt: '2026-07-21', status: 'Active' },
  { id: 'SUBS-1002', clientId: 'c-102', planId: 'company', year: 2025, people: 'me', amount: 100, purchasedAt: '2026-07-20', status: 'Completed' },
  { id: 'SUBS-1003', clientId: 'c-103', planId: 'c-form', year: 2025, people: 'me', amount: 45, purchasedAt: null, status: 'Pending' },
  { id: 'SUBS-1004', clientId: 'c-104', planId: 'm-form', year: 2025, people: 'both', amount: 90, purchasedAt: '2026-07-18', status: 'Active' },
  { id: 'SUBS-1005', clientId: 'c-105', planId: 'regular', year: 2025, people: 'both', amount: 50, purchasedAt: '2026-07-16', status: 'Active' },
  { id: 'SUBS-1006', clientId: 'c-106', planId: 'regular', year: 2024, people: 'both', amount: 50, purchasedAt: '2026-07-14', status: 'Completed' },
  { id: 'SUBS-1007', clientId: 'c-101', planId: 'c-form', year: 2024, people: 'me', amount: 45, purchasedAt: '2026-07-21', status: 'Active' },
  { id: 'SUBS-1008', clientId: 'c-107', planId: 'company', year: 2025, people: 'me', amount: 100, purchasedAt: null, status: 'Cancelled' },
]

export const statusTransitions: Record<SubscriptionStatus, SubscriptionStatus[]> = {
  Pending: ['Active', 'Cancelled'],
  Active: ['Completed', 'Cancelled'],
  Completed: [],
  Cancelled: [],
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
