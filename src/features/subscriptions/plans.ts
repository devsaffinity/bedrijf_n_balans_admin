export type FilingType = string
export type FilingPeople = 'me' | 'partner' | 'both'
export interface FilingPlan {
  id: FilingType
  legacyId?: string
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

export function findPlan(plans: FilingPlan[], id?: string): FilingPlan | undefined {
  return id ? plans.find((plan) => plan.id === id || plan.legacyId === id) : undefined
}

export function filingFee(plan: FilingPlan, people: FilingPeople): number {
  if (people !== 'both' || plan.person === 'With partner') return Math.round(plan.price * 100) / 100
  return Math.round((plan.partnerPrice ?? plan.price * 2) * 100) / 100
}

export { planService } from '../../services/planService'
