export type FilingType = string
export type FilingPeople = 'me' | 'partner' | 'both'
export interface FilingPlan {
  id: FilingType
  name: string
  status: 'Active' | 'Inactive'
  person: 'Single' | 'With partner' | '-'
  charges: 'Filing' | 'All docs'
  timePeriod: 'Month' | 'Year'
  description: string
  price: number
  partnerPrice?: number
  deletedAt?: string
}
export interface FilingSelection { year: number; people: FilingPeople; planId?: FilingType }

export const filingYears = [2026, 2025, 2024, 2023, 2022]
export const initialPlans: FilingPlan[] = [
  { id: 'regular', name: 'Regular filing', status: 'Active', timePeriod: 'Year', charges: 'Filing', person: 'Single', description: 'If you are registered at a Dutch address for a full year, from 1 January to 31 December.', price: 40, partnerPrice: 50 },
  { id: 'regular-partner', name: 'Regular filing', status: 'Active', timePeriod: 'Year', charges: 'Filing', person: 'With partner', description: 'If you are registered at a Dutch address for a full year, from 1 January to 31 December.', price: 50, partnerPrice: 50 },
  { id: 'c-form', name: 'C-Form Online Filing for a single person', status: 'Active', timePeriod: 'Year', charges: 'Filing', person: 'Single', description: 'For a single person who was not registered at a Dutch address during the filing year (in other words a foreign tax applicant with no registered Dutch address).', price: 45 },
  { id: 'c-form-partner', name: 'C-Form Online Filing for myself and partner', status: 'Active', timePeriod: 'Year', charges: 'Filing', person: 'With partner', description: 'For me and my partner who were both NOT registered at a Dutch address during the filing year (in other words foreign tax applicants with no registered Dutch address).', price: 90, partnerPrice: 90 },
  { id: 'm-form', name: 'M-Form Online Filing for a single person', status: 'Active', timePeriod: 'Year', charges: 'Filing', person: 'Single', description: 'For a single person who was registered at a Dutch address for only a part of the filing year (not full year!).', price: 45 },
  { id: 'm-form-partner', name: 'M-Form Online Filing for myself and partner', status: 'Active', timePeriod: 'Year', charges: 'Filing', person: 'With partner', description: 'For me and my partner who were both registered at a Dutch address for only a part of the filing year (not full year!).', price: 90, partnerPrice: 90 },
  { id: 'mixed-regular-m-form', name: 'Mixed Regular + M-Form Online Filing', status: 'Active', timePeriod: 'Year', charges: 'Filing', person: 'With partner', description: 'Joint filing for one person who was registered at a Dutch address for the full filing year (1 January to 31 December) and a partner who was registered at a Dutch address for only part of that year. One person has Regular filing and the other has M-Form filing.', price: 90, partnerPrice: 90 },
  { id: 'company', name: 'Own Company', status: 'Active', timePeriod: 'Year', charges: 'Filing', person: '-', description: 'Sole company or ZZP freelancer.', price: 100 },
]

export function filingFee(plan: FilingPlan, people: FilingPeople): number {
  if (people !== 'both' || plan.person === 'With partner') return Math.round(plan.price * 100) / 100
  return Math.round((plan.partnerPrice ?? plan.price * 2) * 100) / 100
}

// Mock configuration, matching the other admin services until backend integration.
let savedPlans = structuredClone(initialPlans)
type PlanInput = Omit<FilingPlan, 'id' | 'deletedAt'>
function validatePlan(plan: PlanInput, excludeId?: string) {
  if (plan.timePeriod !== 'Month' && plan.timePeriod !== 'Year') throw new Error('Choose Month or Year for the time period.')
  if (plan.charges !== 'Filing' && plan.charges !== 'All docs') throw new Error('Choose Filing or All docs charges.')
  if (plan.person !== 'Single' && plan.person !== 'With partner' && plan.person !== '-') throw new Error('Choose Single, With partner or -.')
  if (plan.status !== 'Active' && plan.status !== 'Inactive') throw new Error('Choose Active or Inactive status.')
  if (!plan.name.trim() || !plan.description.trim()) throw new Error('Enter a plan name and description.')
  if (savedPlans.some((item) => !item.deletedAt && item.id !== excludeId && item.person === plan.person && item.timePeriod === plan.timePeriod && item.name.toLowerCase() === plan.name.trim().toLowerCase())) throw new Error('A plan with this name, person option and time period already exists.')
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
