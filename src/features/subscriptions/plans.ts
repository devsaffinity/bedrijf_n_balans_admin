export type FilingType = string
export type FilingPeople = 'me' | 'partner' | 'both'
export interface FilingPlan {
  id: FilingType
  name: string
  status: 'Active' | 'Inactive'
  person: 'Single' | 'With partner' | '-'
  charges: 'Filing' | 'All docs'
  description: string
  price: number
  partnerPrice?: number
  deletedAt?: string
}
export interface FilingSelection { year: number; people: FilingPeople; planId?: FilingType }

export const filingYears = [2026, 2025, 2024, 2023, 2022]
export const initialPlans: FilingPlan[] = [
  { id: 'regular', name: 'Regular filing', status: 'Active', charges: 'Filing', person: 'Single', description: 'If you are registered at a Dutch address for a full year, from 1 January to 31 December.', price: 40, partnerPrice: 50 },
  { id: 'regular-partner', name: 'Regular filing', status: 'Active', charges: 'Filing', person: 'With partner', description: 'If you are registered at a Dutch address for a full year, from 1 January to 31 December.', price: 50, partnerPrice: 50 },
  { id: 'c-form', name: 'C Form online filing', status: 'Active', charges: 'Filing', person: '-', description: 'C-FORM is for people who are not registered at a Dutch address during the filing year.', price: 45 },
  { id: 'm-form', name: 'M Form online filing', status: 'Active', charges: 'Filing', person: '-', description: 'M-FORM is for people who are registered at a Dutch address part of the year in the Netherlands.', price: 45 },
  { id: 'company', name: 'Own Company', status: 'Active', charges: 'Filing', person: '-', description: 'Sole company or ZZP freelancer.', price: 100 },
]

export function filingFee(plan: FilingPlan, people: FilingPeople): number {
  if (people !== 'both') return Math.round(plan.price * 100) / 100
  return Math.round((plan.partnerPrice ?? plan.price * 2) * 100) / 100
}

// Mock configuration, matching the other admin services until backend integration.
let savedPlans = structuredClone(initialPlans)
type PlanInput = Omit<FilingPlan, 'id' | 'deletedAt'>
function validatePlan(plan: PlanInput, excludeId?: string) {
  if (plan.charges !== 'Filing' && plan.charges !== 'All docs') throw new Error('Choose Filing or All docs charges.')
  if (plan.person !== 'Single' && plan.person !== 'With partner' && plan.person !== '-') throw new Error('Choose Single, With partner or -.')
  if (plan.status !== 'Active' && plan.status !== 'Inactive') throw new Error('Choose Active or Inactive status.')
  if (!plan.name.trim() || !plan.description.trim()) throw new Error('Enter a plan name and description.')
  if (savedPlans.some((item) => !item.deletedAt && item.id !== excludeId && item.person === plan.person && item.name.toLowerCase() === plan.name.trim().toLowerCase())) throw new Error('A plan with this name and person option already exists.')
  const prices = [plan.price, ...(plan.partnerPrice === undefined ? [] : [plan.partnerPrice])]
  if (prices.some((price) => !Number.isFinite(price) || price < 0 || price > 1000000 || Math.abs(price * 100 - Math.round(price * 100)) > 0.000001)) throw new Error('Prices must be between 0 and 1,000,000 euros with at most two decimal places.')
}
export const planService = {
  getPlans: (includeDeleted = false) => structuredClone(savedPlans.filter((plan) => includeDeleted || !plan.deletedAt)),
  createPlan(input: PlanInput) {
    validatePlan(input)
    const plan: FilingPlan = { ...input, id: crypto.randomUUID(), name: input.name.trim(), description: input.description.trim() }
    savedPlans.push(plan)
    return structuredClone(plan)
  },
  updatePlan(id: string, input: PlanInput) {
    if (!savedPlans.some((plan) => plan.id === id && !plan.deletedAt)) throw new Error('Plan not found.')
    validatePlan(input, id)
    savedPlans = savedPlans.map((plan) => plan.id === id ? { ...input, id, name: input.name.trim(), description: input.description.trim() } : plan)
  },
  deletePlan(id: string) {
    if (!savedPlans.some((plan) => plan.id === id && !plan.deletedAt)) throw new Error('Plan not found.')
    savedPlans = savedPlans.map((plan) => plan.id === id ? { ...plan, deletedAt: new Date().toISOString() } : plan)
  },
  savePlans(plans: FilingPlan[]) {
    if (plans.some((plan) => !plan.description.trim() || !Number.isFinite(plan.price) || plan.price < 0 || (plan.partnerPrice !== undefined && (!Number.isFinite(plan.partnerPrice) || plan.partnerPrice < 0)))) {
      throw new Error('Enter a description and valid non-negative prices for every plan.')
    }
    savedPlans = structuredClone(plans)
  },
}
