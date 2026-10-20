import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { Submission } from '../../types/domain'
import { ClientDetailField as FieldValue } from './ClientDetailField'
import { displayDate, displayEuro, displayYesNo as yesNo } from './detailFormat'

function Details({ items }: { items?: { question: string; answer: string }[] }) {
  return items?.length ? <dl className="divide-y divide-[var(--color-border)] text-sm">{items.map((item, index) => <FieldValue key={`${item.question}-${index}`} label={item.question} value={item.answer} />)}</dl> : <p className="mt-3 text-sm text-[var(--color-muted)]">No further details provided.</p>
}

export function ClientPropertyDetails({ submissions, selectedSubmission, embedded = false }: { submissions: Submission[]; selectedSubmission?: Submission; embedded?: boolean }) {
  const [selectedId, setSelectedId] = useState('')
  const selected = selectedSubmission ?? submissions.find((submission) => submission.id === selectedId) ?? submissions[0]
  const property = selected?.propertyDetails

  return <section className={embedded ? 'min-w-0' : 'card overflow-hidden'} aria-labelledby="property-heading">
    <div className={embedded ? 'mb-5' : 'border-b border-[var(--color-border)] p-5'}>
      <h2 id="property-heading" className="font-bold">House / Property Details</h2>
      <p className="mt-1 text-sm text-[var(--color-muted)]">Housing information and the client's situation for each filing.</p>
      {!selectedSubmission && submissions.length > 0 && <label className="mt-4 block text-sm font-semibold">Filing year / submission
        <select className="field mt-2" value={selected?.id ?? ''} onChange={(event) => setSelectedId(event.target.value)}>
          {submissions.map((submission) => <option key={submission.id} value={submission.id}>{submission.propertyDetails?.filingYear ? `${submission.propertyDetails.filingYear} · ` : ''}{submission.id}{submission.submittedAt ? '' : ' (Draft)'}</option>)}
        </select>
      </label>}
    </div>
    {!selected ? <p className="p-5 text-sm text-[var(--color-muted)]">No submissions yet. Property details will appear with the client's filing answers.</p> : !property ? <p className="py-5 text-sm text-[var(--color-muted)]">No house or property answers provided for this submission.</p> : <div className={embedded ? 'space-y-6' : 'space-y-6 p-5'}>
      {!embedded && <div className="flex flex-wrap items-center justify-between gap-2 text-sm"><span className="font-semibold">Filing year: {property.filingYear}</span><Link className="font-semibold text-[var(--color-brand)] hover:underline" to={`/submissions/${selected.id}`}>View submission</Link></div>}
      <section aria-labelledby="housing-heading">
        <h3 id="housing-heading" className="mb-3 text-sm font-bold">Housing</h3>
        <dl className="text-sm"><FieldValue label="Housing type" value={property.housing} /></dl>
        {property.housing === 'Purchased with mortgage' && <>
          <dl className="divide-y divide-[var(--color-border)] text-sm">
            <FieldValue label="House purchase date" value={displayDate(property.purchaseDate)} />
            <FieldValue label="Mortgage renewed, changed or additional mortgage received" value={yesNo(property.mortgageChanged)} />
          </dl>
          {property.mortgageDetails?.length ? <Details items={property.mortgageDetails} /> : null}
        </>}
      </section>
      {property.housing === 'Purchased with mortgage' && <section className="border-t border-[var(--color-border)] pt-5" aria-labelledby="netherlands-property-heading">
        <h3 id="netherlands-property-heading" className="mb-3 text-sm font-bold">Property in the Netherlands</h3>
        <dl className="text-sm"><FieldValue label="Multiple houses in the Netherlands (2 or more)" value={yesNo(property.ownsMultipleHousesInNetherlands)} /></dl>
        <p className="mt-2 text-xs text-[var(--color-muted)]">Houses you own outside the Netherlands are not included here.</p>
        {property.ownsMultipleHousesInNetherlands === true && <>
          {property.additionalHouseDetails?.length ? <Details items={property.additionalHouseDetails} /> : null}
          <dl className="text-sm"><FieldValue label="Second house rented out (not your residence)" value={yesNo(property.rentedOut)} /></dl>
          {property.rentedOut === true && <>
            <dl className="divide-y divide-[var(--color-border)] text-sm">
              <FieldValue label={`Total rental income for ${property.filingYear} (EUR)`} value={displayEuro(property.annualRentalIncomeEur)} />
              <FieldValue label="Mortgage number(s) for rented-out house" value={property.rentedHouseMortgageNumbers?.filter((number) => number.trim()).join(', ')} />
            </dl>
            {property.rentalDetails?.length ? <Details items={property.rentalDetails} /> : null}
          </>}
        </>}
      </section>}
      <section className="border-t border-[var(--color-border)] pt-5" aria-labelledby="property-situation-heading">
        <h3 id="property-situation-heading" className="text-sm font-bold">Client's situation / comments</h3>
        <p className="mt-2 text-xs text-[var(--color-muted)]">Additional information provided by the client to help with filing.</p>
        <p className="mt-3 whitespace-pre-wrap break-words rounded-lg border border-[var(--color-border)] bg-slate-50 p-4 text-sm">{property.situation?.trim() ? property.situation : 'No situation or comments provided.'}</p>
      </section>
    </div>}
  </section>
}
