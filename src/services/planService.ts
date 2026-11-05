import { FirebaseError } from 'firebase/app'
import { collection, doc, getDocsFromServer, runTransaction, type DocumentData } from 'firebase/firestore'
import type { FilingPlan } from '../features/subscriptions/plans'
import { seedPlans } from '../features/subscriptions/planSeed'
import { getFirebaseServices } from './firebase'

type PlanInput = Omit<FilingPlan, 'id' | 'deletedAt'>

function validatePlan(plan: PlanInput) {
  if (plan.legacyId !== undefined && (typeof plan.legacyId !== 'string' || !seedPlans.some((seed) => seed.id === plan.legacyId))) throw new Error('Invalid legacy plan reference.')
  if (!['Month', 'Year'].includes(plan.timePeriod)) throw new Error('Choose Month or Year for the time period.')
  if (!['Filing', 'All docs'].includes(plan.charges)) throw new Error('Choose Filing or All docs charges.')
  if (!['Single', 'With partner', '-'].includes(plan.person)) throw new Error('Choose Single, With partner or -.')
  if (!['Active', 'Inactive'].includes(plan.status)) throw new Error('Choose Active or Inactive status.')
  if (typeof plan.name !== 'string' || !plan.name.trim() || plan.name.length > 100 || typeof plan.description !== 'string' || !plan.description.trim() || plan.description.length > 2000) throw new Error('Enter a plan name and description within the allowed lengths.')
  const prices = [plan.price, ...(plan.partnerPrice === undefined ? [] : [plan.partnerPrice])]
  if (prices.some((price) => !Number.isFinite(price) || price < 0 || price > 1000000 || Math.abs(price * 100 - Math.round(price * 100)) > 0.000001)) throw new Error('Prices must be between 0 and 1,000,000 euros with at most two decimal places.')
}

function planData(input: PlanInput): DocumentData {
  validatePlan(input)
  return {
    name: input.name.trim(), description: input.description.trim(), status: input.status,
    person: input.person, charges: input.charges, timePeriod: input.timePeriod,
    price: input.price,
    ...(input.legacyId === undefined ? {} : { legacyId: input.legacyId }),
    ...(input.partnerPrice === undefined ? {} : { partnerPrice: input.partnerPrice }),
  }
}

function readPlan(id: string, data: DocumentData): FilingPlan {
  validatePlan(data as PlanInput)
  if (data.deletedAt !== undefined && (typeof data.deletedAt !== 'string' || !Number.isFinite(Date.parse(data.deletedAt)))) throw new Error('A saved plan has an invalid deletion date.')
  return { id, ...planData(data as PlanInput), ...(data.deletedAt ? { deletedAt: data.deletedAt } : {}) } as FilingPlan
}

function planError(error: unknown): Error {
  if (error instanceof FirebaseError) {
    if (error.code === 'permission-denied') return new Error('You do not have permission to access plans. Contact the administrator.')
    return new Error('Unable to connect to plans. Check your connection and try again.')
  }
  return error instanceof Error ? error : new Error('Unable to load or save plans.')
}

function checkDuplicate(input: PlanInput, plans: FilingPlan[], excludeId?: string) {
  if (plans.some((plan) => !plan.deletedAt && plan.id !== excludeId && plan.person === input.person && plan.timePeriod === input.timePeriod && plan.name.toLowerCase() === input.name.trim().toLowerCase())) throw new Error('A plan with this name, person option and time period already exists.')
}

async function getPlans(includeDeleted = false): Promise<FilingPlan[]> {
  try {
    const snapshot = await getDocsFromServer(collection(getFirebaseServices().db, 'plan'))
    const plans = snapshot.docs.map((item) => readPlan(item.id, item.data()))
    const order = new Map(seedPlans.map((plan, index) => [plan.id, index]))
    return plans.filter((plan) => includeDeleted || !plan.deletedAt)
      .sort((a, b) => (order.get(a.legacyId ?? a.id) ?? Number.MAX_SAFE_INTEGER) - (order.get(b.legacyId ?? b.id) ?? Number.MAX_SAFE_INTEGER) || a.name.localeCompare(b.name))
  } catch (error) { throw planError(error) }
}

async function migratePlanIds(ids: string[]): Promise<void> {
  const db = getFirebaseServices().db
  for (const id of ids) {
    const source = doc(db, 'plan', id)
    const generated = doc(collection(db, 'plan'))
    // Reserve one auto-ID on the source so concurrent tabs and retries agree.
    const targetId = await runTransaction(db, async (transaction) => {
      const record = await transaction.get(source)
      if (!record.exists()) return null
      const reserved: unknown = record.data().migrationTargetId
      if (reserved !== undefined) {
        if (typeof reserved !== 'string' || !/^[A-Za-z0-9]{20}$/.test(reserved)) throw new Error('Invalid plan migration target. Contact the administrator.')
        return reserved
      }
      transaction.update(source, { migrationTargetId: generated.id })
      return generated.id
    })
    if (!targetId) continue
    const target = doc(db, 'plan', targetId)
    await runTransaction(db, async (transaction) => {
      const record = await transaction.get(source)
      if (!record.exists()) return
      if (record.data().migrationTargetId !== targetId) throw new Error('Plan changed during migration. Please try again.')
      if ((await transaction.get(target)).exists()) throw new Error('Plan migration target already exists. No data was overwritten.')
      const { migrationTargetId: _reserved, ...data } = record.data()
      // Preserve the complete stored payload, including edits and soft-deletion history.
      transaction.set(target, { ...data, legacyId: id })
      transaction.delete(source)
    })
  }
}

export const planService = {
  getPlans,
  async loadPlans(): Promise<FilingPlan[]> {
    try {
      const db = getFirebaseServices().db
      const snapshot = await getDocsFromServer(collection(db, 'plan'))
      // The catalog has already been seeded. Never recreate old slug IDs or deleted data.
      const legacyIds = new Set(seedPlans.map((plan) => plan.id))
      await migratePlanIds(snapshot.docs.filter((item) => legacyIds.has(item.id)).map((item) => item.id))
      // Display only records actually fetched from Firestore after the commit.
      return await getPlans()
    } catch (error) { throw planError(error) }
  },
  async createPlan(input: PlanInput): Promise<void> {
    try {
      const data = planData(input)
      checkDuplicate(input, await getPlans(true))
      const db = getFirebaseServices().db
      const ref = doc(collection(db, 'plan'))
      await runTransaction(db, async (transaction) => {
        if ((await transaction.get(ref)).exists()) throw new Error('Plan already exists.')
        transaction.set(ref, data)
      })
    } catch (error) { throw planError(error) }
  },
  async updatePlan(id: string, input: PlanInput): Promise<void> {
    try {
      const data = planData(input)
      checkDuplicate(input, await getPlans(true), id)
      const db = getFirebaseServices().db
      const ref = doc(db, 'plan', id)
      await runTransaction(db, async (transaction) => {
        const record = await transaction.get(ref)
        if (!record.exists() || record.data().deletedAt) throw new Error('Plan not found.')
        // Replacing the known schema also removes a cleared optional partner price.
        transaction.set(ref, { ...data, ...(record.data().legacyId ? { legacyId: record.data().legacyId } : {}) })
      })
    } catch (error) { throw planError(error) }
  },
  async deletePlan(id: string): Promise<void> {
    try {
      const db = getFirebaseServices().db
      const ref = doc(db, 'plan', id)
      await runTransaction(db, async (transaction) => {
        const record = await transaction.get(ref)
        if (!record.exists() || record.data().deletedAt) throw new Error('Plan not found.')
        transaction.update(ref, { deletedAt: new Date().toISOString() })
      })
    } catch (error) { throw planError(error) }
  },
  async savePlans(plans: FilingPlan[]): Promise<void> {
    try {
      const db = getFirebaseServices().db
      const all = await getPlans(true)
      plans.forEach((plan) => {
        validatePlan(plan)
        checkDuplicate(plan, [...all.filter((item) => !plans.some((candidate) => candidate.id === item.id)), ...plans], plan.id)
      })
      await runTransaction(db, async (transaction) => {
        const refs = plans.map((plan) => doc(db, 'plan', plan.id))
        const records = await Promise.all(refs.map((ref) => transaction.get(ref)))
        if (records.some((record) => !record.exists() || record.data().deletedAt)) throw new Error('A plan no longer exists. Reload and try again.')
        plans.forEach((plan, index) => {
          const legacyId = records[index].data()?.legacyId
          transaction.set(refs[index], { ...planData(plan), ...(legacyId ? { legacyId } : {}) })
        })
      })
    } catch (error) { throw planError(error) }
  },
}
