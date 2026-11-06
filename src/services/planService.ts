import { FirebaseError } from 'firebase/app'
import { collection, doc, getDocsFromServer, runTransaction, type DocumentData } from 'firebase/firestore'
import type { FilingPlan } from '../features/subscriptions/plans'
import { seedPlans } from '../features/subscriptions/planSeed'
import { getFirebaseServices } from './firebase'
import { planIdentity, planUniqueKey } from '../features/subscriptions/planIdentity'

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
  if (plans.some((plan) => !plan.deletedAt && plan.id !== excludeId && planIdentity(plan) === planIdentity(input))) throw duplicateError()
}

const duplicateError = () => new Error('A plan with this name, person option and time period already exists.')

// Backfill existing catalog records before mutations, without changing plan data.
// Re-read each plan inside the transaction so concurrent renames/deletes are safe.
async function indexPlans(plans: FilingPlan[]) {
  const db = getFirebaseServices().db
  for (const plan of plans.filter((item) => !item.deletedAt)) {
    await runTransaction(db, async (transaction) => {
      const current = await transaction.get(doc(db, 'plan', plan.id))
      if (!current.exists() || current.data().deletedAt) return
      const key = doc(db, 'planUniqueKeys', await planUniqueKey(current.data() as PlanInput))
      const claim = await transaction.get(key)
      if (claim.exists() && claim.data().planId !== plan.id) throw duplicateError()
      if (!claim.exists()) transaction.set(key, { planId: plan.id })
    })
  }
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
      const key = data.deletedAt ? null : doc(db, 'planUniqueKeys', await planUniqueKey(data as PlanInput))
      const claim = key ? await transaction.get(key) : null
      if (claim?.exists() && claim.data().planId !== id) throw duplicateError()
      // Preserve the complete stored payload, including edits and soft-deletion history.
      transaction.set(target, { ...data, legacyId: id })
      if (key) transaction.set(key, { planId: targetId })
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
      const plans = await getPlans()
      await indexPlans(plans)
      return plans
    } catch (error) { throw planError(error) }
  },
  async createPlan(input: PlanInput): Promise<void> {
    try {
      const data = planData(input)
      const plans = await getPlans(true)
      checkDuplicate(input, plans)
      await indexPlans(plans)
      const db = getFirebaseServices().db
      const ref = doc(collection(db, 'plan'))
      const key = doc(db, 'planUniqueKeys', await planUniqueKey(input))
      await runTransaction(db, async (transaction) => {
        if ((await transaction.get(ref)).exists()) throw new Error('Plan already exists.')
        if ((await transaction.get(key)).exists()) throw duplicateError()
        transaction.set(key, { planId: ref.id })
        transaction.set(ref, data)
      })
    } catch (error) { throw planError(error) }
  },
  async updatePlan(id: string, input: PlanInput): Promise<void> {
    try {
      const data = planData(input)
      const plans = await getPlans(true)
      checkDuplicate(input, plans, id)
      await indexPlans(plans)
      const db = getFirebaseServices().db
      const ref = doc(db, 'plan', id)
      await runTransaction(db, async (transaction) => {
        const record = await transaction.get(ref)
        if (!record.exists() || record.data().deletedAt) throw new Error('Plan not found.')
        const oldKey = await planUniqueKey(record.data() as PlanInput)
        const newKey = await planUniqueKey(input)
        const oldRef = doc(db, 'planUniqueKeys', oldKey)
        const newRef = doc(db, 'planUniqueKeys', newKey)
        const [oldClaim, newClaim] = await Promise.all([transaction.get(oldRef), transaction.get(newRef)])
        if (newClaim.exists() && newClaim.data().planId !== id) throw duplicateError()
        if (oldKey !== newKey && oldClaim.exists() && oldClaim.data().planId === id) transaction.delete(oldRef)
        transaction.set(newRef, { planId: id })
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
        const key = doc(db, 'planUniqueKeys', await planUniqueKey(record.data() as PlanInput))
        const claim = await transaction.get(key)
        if (claim.exists() && claim.data().planId === id) transaction.delete(key)
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
      await indexPlans(all)
      await runTransaction(db, async (transaction) => {
        const refs = plans.map((plan) => doc(db, 'plan', plan.id))
        const records = await Promise.all(refs.map((ref) => transaction.get(ref)))
        if (records.some((record) => !record.exists() || record.data().deletedAt)) throw new Error('A plan no longer exists. Reload and try again.')
        const oldKeys = await Promise.all(records.map((record) => planUniqueKey(record.data() as PlanInput)))
        const newKeys = await Promise.all(plans.map(planUniqueKey))
        const keys = [...new Set([...oldKeys, ...newKeys])]
        // Keep the all-or-nothing write within the Rules 20-document access budget.
        if (plans.length + keys.length + 2 > 20) throw new Error('This batch changes too many plan identities. Save fewer renamed plans at a time.')
        const claims = await Promise.all(keys.map((key) => transaction.get(doc(db, 'planUniqueKeys', key))))
        const finalOwners = new Map(newKeys.map((key, index) => [key, plans[index].id]))
        if (finalOwners.size !== plans.length) throw duplicateError()
        keys.forEach((key, index) => {
          const owner = claims[index].data()?.planId
          const finalOwner = finalOwners.get(key)
          if (finalOwner && owner && owner !== finalOwner && !plans.some((plan) => plan.id === owner)) throw duplicateError()
        })
        keys.forEach((key, index) => {
          const owner = finalOwners.get(key)
          const keyRef = doc(db, 'planUniqueKeys', key)
          if (owner) transaction.set(keyRef, { planId: owner })
          else if (claims[index].exists() && plans.some((plan) => plan.id === claims[index].data()?.planId)) transaction.delete(keyRef)
        })
        plans.forEach((plan, index) => {
          const legacyId = records[index].data()?.legacyId
          transaction.set(refs[index], { ...planData(plan), ...(legacyId ? { legacyId } : {}) })
        })
      })
    } catch (error) { throw planError(error) }
  },
}
