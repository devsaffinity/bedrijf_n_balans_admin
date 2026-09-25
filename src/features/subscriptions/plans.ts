export type FilingType = 'regular' | 'c-form' | 'm-form' | 'company'
export type FilingPeople = 'me' | 'partner' | 'both'
export interface FilingPlan {
  id: FilingType
  name: string
  description: string
  price: number
  partnerPrice?: number
}
export interface FilingSelection { year: number; people: FilingPeople; planId?: FilingType }

export const filingYears = [2026, 2025, 2024, 2023, 2022]
export const initialPlans: FilingPlan[] = [
  { id: 'regular', name: 'Regular filing', description: 'If you are registered at a Dutch address for a full year, from 1 January to 31 December.', price: 40, partnerPrice: 50 },
  { id: 'c-form', name: 'C Form online filing', description: 'C-FORM is for people who are not registered at a Dutch address during the filing year.', price: 45 },
  { id: 'm-form', name: 'M Form online filing', description: 'M-FORM is for people who are registered at a Dutch address part of the year in the Netherlands.', price: 45 },
  { id: 'company', name: 'Own Company', description: 'Sole company or ZZP freelancer.', price: 100 },
]

export function filingFee(plan: FilingPlan, people: FilingPeople): number {
  if (people !== 'both') return Math.round(plan.price * 100) / 100
  return Math.round((plan.partnerPrice ?? plan.price * 2) * 100) / 100
}

// Mock configuration, matching the other admin services until backend integration.
let savedPlans = structuredClone(initialPlans)
export const planService = {
  getPlans: () => structuredClone(savedPlans),
  savePlans(plans: FilingPlan[]) {
    if (plans.some((plan) => !plan.description.trim() || !Number.isFinite(plan.price) || plan.price < 0 || (plan.partnerPrice !== undefined && (!Number.isFinite(plan.partnerPrice) || plan.partnerPrice < 0)))) {
      throw new Error('Enter a description and valid non-negative prices for every plan.')
    }
    savedPlans = structuredClone(plans)
  },
}
