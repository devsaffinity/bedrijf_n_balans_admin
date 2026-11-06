import { FirebaseError } from 'firebase/app'
import { collection, doc, getDocsFromServer, runTransaction, Timestamp, type DocumentData } from 'firebase/firestore'
import type { Subscription } from '../features/subscriptions/subscriptions'
import type { FilingPlan } from '../features/subscriptions/plans'
import { findPlan } from '../features/subscriptions/plans'
import { seedSubscriptions } from '../features/subscriptions/subscriptionSeed'
import { getFirebaseServices } from './firebase'

const text = (value: unknown) => typeof value === 'string' ? value : ''
function mapSubscription(id: string, data: DocumentData): Subscription {
  const purchasedAt = data.purchasedAt instanceof Timestamp ? data.purchasedAt.toDate().toISOString() : data.purchasedAt
  if (!text(data.clientId) || !text(data.planId) || !Number.isInteger(data.year)
    || typeof data.amount !== 'number' || !Number.isFinite(data.amount) || data.amount < 0
    || !['me', 'partner', 'both'].includes(data.people)
    || !['Active', 'Pending', 'Completed', 'Cancelled'].includes(data.status)
    || !(purchasedAt === null || typeof purchasedAt === 'string' && Number.isFinite(Date.parse(purchasedAt)))) {
    throw new Error('A saved subscription has invalid data. Contact the administrator.')
  }
  return {
    id, clientId: data.clientId, planId: data.planId, year: data.year, people: data.people,
    amount: data.amount, purchasedAt, status: data.status,
    reference: text(data.reference) || undefined,
    submissionId: text(data.submissionId) || undefined,
    clientName: text(data.clientName) || undefined, clientEmail: text(data.clientEmail) || undefined,
    planName: text(data.planName) || undefined,
    mainPersonForm: text(data.mainPersonForm) || undefined, partnerForm: text(data.partnerForm) || undefined,
    submissionStatus: text(data.submissionStatus) || undefined, paymentStatus: text(data.paymentStatus) || undefined,
    submissionProgress: typeof data.submissionProgress === 'number' && Number.isFinite(data.submissionProgress) && data.submissionProgress >= 0 && data.submissionProgress <= 100 ? data.submissionProgress : undefined,
  }
}

function recordsFrom(snapshot: { docs: { id: string; data(): DocumentData }[] }): Subscription[] {
  return snapshot.docs.map((item) => mapSubscription(item.id, item.data()))
    .sort((a, b) => (a.reference ?? a.id).localeCompare(b.reference ?? b.id))
}

function subscriptionError(error: unknown): Error {
  if (error instanceof FirebaseError) {
    if (error.code === 'permission-denied') return new Error('You do not have permission to access subscriptions. Contact the administrator.')
    return new Error('Unable to load subscriptions. Check your connection and try again.')
  }
  return error instanceof Error ? error : new Error('Unable to load subscriptions.')
}

async function getAll(): Promise<Subscription[]> {
  try { return recordsFrom(await getDocsFromServer(collection(getFirebaseServices().db, 'subscriptions'))) }
  catch (error) { throw subscriptionError(error) }
}

export const subscriptionService = {
  getAll,
  async loadSubscriptions(plans: FilingPlan[]): Promise<Subscription[]> {
    try {
      const db = getFirebaseServices().db
      const snapshot = await getDocsFromServer(collection(db, 'subscriptions'))
      if (!snapshot.empty) return recordsFrom(snapshot)
      // These nine IDs were generated once by Firebase SDK, not derived from labels.
      // Reusing them makes initial seeding safe across reloads and concurrent tabs.
      const refs = seedSubscriptions.map((record) => doc(db, 'subscriptions', record.id))
      await runTransaction(db, async (transaction) => {
        const existing = await Promise.all(refs.map((ref) => transaction.get(ref)))
        existing.forEach((record, index) => {
          if (record.exists()) return
          const { id: _id, ...seed } = seedSubscriptions[index]
          const plan = findPlan(plans, seed.planId)
          transaction.set(refs[index], {
            ...seed,
            planId: plan?.id ?? seed.planId,
            planName: plan?.name ?? seed.planName ?? seed.planId,
            amount: plan?.price ?? seed.amount,
          })
        })
      })
      // Only return documents read back from the server, never a display fallback.
      return await getAll()
    } catch (error) { throw subscriptionError(error) }
  },
}
