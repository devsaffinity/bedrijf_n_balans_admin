// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it } from 'vitest'
import type { PropertyDetails, Submission } from '../../types/domain'
import { ClientPropertyDetails } from './ClientPropertyDetails'

afterEach(cleanup)

function submission(id: string, propertyDetails?: PropertyDetails): Submission {
  return { id, clientId: 'client', clientName: 'Example', clientEmail: 'example@example.nl', filingType: 'Income tax', status: 'Pending', progress: 100, submittedAt: '2026-07-21', updatedAt: '2026-07-21', answers: [], propertyDetails }
}

function show(submissions: Submission[]) {
  return render(<MemoryRouter><ClientPropertyDetails submissions={submissions} /></MemoryRouter>)
}

const details: PropertyDetails = {
  filingYear: 2025,
  housing: 'Purchased with mortgage',
  purchaseDate: '2025-03-21',
  mortgageChanged: true,
  mortgageDetails: [{ question: 'Mortgage information', answer: 'Mortgage answer' }],
  ownsMultipleHousesInNetherlands: true,
  additionalHouseDetails: [{ question: 'Additional property', answer: 'Property answer' }],
  rentedOut: true,
  annualRentalIncomeEur: 14400,
  rentedHouseMortgageNumbers: ['0012345', '0098765'],
  rentalDetails: [{ question: 'Rental information', answer: 'Rental answer' }],
  situation: 'First line\nSecond line',
}

describe('Client property review', () => {
  it('hides mortgage details for rental, and property follow-ups for No even with stale values', () => {
    show([submission('rental', { ...details, housing: 'Rental', ownsMultipleHousesInNetherlands: true })])
    expect(screen.queryByText('Mortgage answer')).toBeNull()
    expect(screen.queryByText('Property answer')).toBeNull()
    expect(screen.queryByText('Second house rented out (not your residence)')).toBeNull()
    expect(screen.queryByText('Rental answer')).toBeNull()
    expect(screen.queryByText('House purchase date')).toBeNull()
    expect(screen.queryByText('Mortgage renewed, changed or additional mortgage received')).toBeNull()
    expect(screen.queryByText('Multiple houses in the Netherlands (2 or more)')).toBeNull()
    expect(screen.queryByText('0012345, 0098765')).toBeNull()
    expect(screen.getByText(/First line/).textContent).toBe('First line\nSecond line')
  })

  it('shows mortgage and additional property details, but hides rental details for No', () => {
    show([submission('owner', { ...details, rentedOut: false })])
    expect(screen.getByText('Mortgage answer')).toBeTruthy()
    expect(screen.getByText('Property answer')).toBeTruthy()
    expect(screen.getByText('21/03/2025')).toBeTruthy()
    expect(screen.getByText('Mortgage renewed, changed or additional mortgage received')).toBeTruthy()
    expect(screen.queryByText('Rental answer')).toBeNull()
    expect(screen.queryByText('Mortgage number(s) for rented-out house')).toBeNull()
  })

  it('shows rental follow-ups only for a confirmed Yes', () => {
    const view = show([submission('owner', details)])
    expect(screen.getByText('Rental answer')).toBeTruthy()
    expect(screen.getByText('0012345, 0098765')).toBeTruthy()
    expect(screen.getByText(/EUR.*14\.400,00/)).toBeTruthy()
    view.rerender(<MemoryRouter><ClientPropertyDetails submissions={[submission('owner', { ...details, rentedOut: undefined })]} /></MemoryRouter>)
    expect(screen.queryByText('Rental answer')).toBeNull()
    expect(screen.getByText('Second house rented out (not your residence)').nextElementSibling?.textContent).toBe('Not provided')
  })

  it('hides stale rented-house details when multiple houses is No even when rentedOut is Yes', () => {
    show([submission('single-house', { ...details, ownsMultipleHousesInNetherlands: false })])
    expect(screen.queryByText('Second house rented out (not your residence)')).toBeNull()
    expect(screen.queryByText('Mortgage number(s) for rented-out house')).toBeNull()
    expect(screen.queryByText('0012345, 0098765')).toBeNull()
    expect(screen.queryByText('Total rental income for 2025 (EUR)')).toBeNull()
  })

  it('switches filing year, answers and submission link together without leaking the previous answers', () => {
    show([submission('filing-2025', details), submission('filing-2024', { filingYear: 2024, housing: 'Rental', situation: 'Previous year situation' })])
    fireEvent.change(screen.getByLabelText('Filing year / submission'), { target: { value: 'filing-2024' } })
    expect(screen.getByText('Filing year: 2024')).toBeTruthy()
    expect(screen.getByText('Previous year situation')).toBeTruthy()
    expect(screen.queryByText('Mortgage answer')).toBeNull()
    expect(screen.getByRole('link', { name: 'View submission' }).getAttribute('href')).toBe('/submissions/filing-2024')
  })

  it('distinguishes no submissions from a submission without property answers', () => {
    const view = show([])
    expect(screen.getByText(/No submissions yet/)).toBeTruthy()
    view.rerender(<MemoryRouter><ClientPropertyDetails submissions={[submission('missing')]} /></MemoryRouter>)
    expect(screen.getByText('No house or property answers provided for this submission.')).toBeTruthy()
  })
})
