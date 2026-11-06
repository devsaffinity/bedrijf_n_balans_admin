import type { FilingPlan } from './plans'

type Identity = Pick<FilingPlan, 'name' | 'person' | 'timePeriod'>

export const planIdentity = (plan: Identity) => `${plan.person}|${plan.timePeriod}|${plan.name.trim().toLowerCase()}`

// Hashing keeps slashes/unicode in names out of Firestore document paths.
// Firestore rules recompute the same key; plan document IDs stay auto-generated.
export async function planUniqueKey(plan: Identity): Promise<string> {
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(planIdentity(plan)))
  return Array.from(new Uint8Array(bytes), (value) => value.toString(16).padStart(2, '0')).join('')
}
