import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { FilingDetailField, FilingPersonDetails, FilingTravelDetails, Submission } from '../../types/domain'
import { ClientPropertyDetails } from './ClientPropertyDetails'
import { ClientAccountsMortgage, ClientFilingSummary } from './ClientFinancialDetails'
import type { FilingPlan } from '../subscriptions/plans'
import type { Subscription } from '../subscriptions/subscriptions'

const yesNo = (value?: boolean) => value === undefined ? 'Not provided' : value ? 'Yes' : 'No'
const date = (value?: string) => value ? value.split('T')[0].split('-').reverse().join('/') : 'Not provided'

function Field({ label, value }: { label: string; value?: string }) {
  return <div className="grid gap-1 py-3 sm:grid-cols-2 sm:gap-6"><dt className="text-[var(--color-muted)]">{label}</dt><dd className="whitespace-pre-wrap break-words font-medium">{value?.trim() ? value : 'Not provided'}</dd></div>
}

function Fields({ items }: { items?: FilingDetailField[] }) {
  return items?.length ? <dl className="divide-y divide-[var(--color-border)] text-sm">{items.map((item, index) => <Field key={`${item.label}-${index}`} {...item} />)}</dl> : <p className="py-3 text-sm text-[var(--color-muted)]">No further details provided.</p>
}

function Travel({ travel }: { travel?: FilingTravelDetails }) {
  return <section className="mt-5 border-t border-[var(--color-border)] pt-4" aria-label="Travel expenses">
    <h4 className="text-sm font-bold">Travel expenses</h4>
    <dl className="text-sm"><Field label="Public transport to work" value={yesNo(travel?.usedPublicTransport)} />
      {travel?.usedPublicTransport === true && <Field label={travel.followUp?.label || 'Travel follow-up response'} value={yesNo(travel.followUp?.answer)} />}
    </dl>
    {travel?.usedPublicTransport === true && travel.followUp?.answer === false && <Fields items={travel.details} />}
  </section>
}

function Person({ title, person }: { title: string; person?: FilingPersonDetails }) {
  return <section className="rounded-lg border border-[var(--color-border)] p-4" aria-label={title}>
    <h3 className="font-bold">{title}</h3>
    {!person ? <p className="mt-3 text-sm text-[var(--color-muted)]">No person details provided for this filing.</p> : <>
      <dl className="mt-2 divide-y divide-[var(--color-border)] text-sm">
        <Field label="Name" value={person.name} />
        <Field label="Email" value={person.email} />
        <Field label="Date of birth" value={date(person.dateOfBirth)} />
        <Field label="Nationality" value={person.nationality} />
        <Field label="City" value={person.city} />
      </dl>
      <section className="mt-5 border-t border-[var(--color-border)] pt-4" aria-label="Registration and emigration">
        <h4 className="text-sm font-bold">Registration and emigration</h4>
        <dl className="divide-y divide-[var(--color-border)] text-sm">
          <Field label="Netherlands registration date" value={date(person.registrationDate)} />
          <Field label="Country before moving to the Netherlands" value={person.originCountry} />
          <Field label="Emigrated out of the Netherlands" value={yesNo(person.emigratedFromNetherlands)} />
          {person.emigratedFromNetherlands === true && <>
            <Field label="Netherlands deregistration date" value={date(person.emigrationDate)} />
            <Field label="Destination country" value={person.destinationCountry} />
          </>}
        </dl>
      </section>
      <Travel travel={person.travel} />
    </>}
  </section>
}

export function ClientFilingDetails({ submissions, subscriptions = [], plans = [] }: { submissions: Submission[]; subscriptions?: Subscription[]; plans?: FilingPlan[] }) {
  const [selectedId, setSelectedId] = useState('')
  const selected = submissions.find((item) => item.id === selectedId) ?? submissions[0]
  const filing = selected?.filingDetails

  return <div className="space-y-6">
    <section className="card overflow-hidden" aria-labelledby="filing-details-heading">
      <div className="border-b border-[var(--color-border)] p-5">
        <h2 id="filing-details-heading" className="font-bold">Submission details</h2>
        <p className="mt-1 text-sm text-[var(--color-muted)]">Main person, partner and family information for the selected filing.</p>
        {selected && <label className="mt-4 block text-sm font-semibold">Filing year / submission
          <select className="field mt-2" value={selected.id} onChange={(event) => setSelectedId(event.target.value)}>{submissions.map((item) => <option key={item.id} value={item.id}>{item.filingDetails?.filingYear ?? item.propertyDetails?.filingYear ?? 'Year not provided'} · {item.id}{item.submittedAt ? '' : ' (Draft)'}</option>)}</select>
        </label>}
      </div>
      {!selected ? <p className="p-5 text-sm text-[var(--color-muted)]">No submissions yet.</p> : <div className="space-y-5 p-5">
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm"><span className="font-semibold">Filing year: {filing?.filingYear ?? selected.propertyDetails?.filingYear ?? 'Not provided'}</span><Link className="font-semibold text-[var(--color-brand)] hover:underline" to={`/submissions/${selected.id}`}>View submission</Link></div>
        <ClientFilingSummary submission={selected} subscriptions={subscriptions} plans={plans} />
        {!filing ? <p className="text-sm text-[var(--color-muted)]">No personal, family or travel details provided for this submission.</p> : <>
          <Person title="Main person — filing details" person={filing.mainPerson} />
          <dl className="text-sm"><Field label="Partner included in this filing" value={yesNo(filing.hasPartner)} /></dl>
          {filing.hasPartner === true && <Person title="Partner — filing details" person={filing.partner} />}
          <section className="rounded-lg border border-[var(--color-border)] p-4" aria-label="Children">
            <h3 className="font-bold">Children</h3>
            <dl className="text-sm"><Field label="Has children" value={yesNo(filing.children?.hasChildren)} /></dl>
            {filing.children?.hasChildren === true && <Fields items={filing.children.details} />}
          </section>
          <section className="rounded-lg border border-[var(--color-border)] p-4" aria-label="Business details">
            <h3 className="font-bold">Business details</h3>
            <dl className="divide-y divide-[var(--color-border)] text-sm">
              <Field label="Own business" value={yesNo(filing.business?.hasOwnBusiness)} />
              {filing.business?.hasOwnBusiness === true && <Field label="Ownership" value={filing.business.ownership} />}
            </dl>
            {filing.business?.hasOwnBusiness === true && <Fields items={filing.business.details} />}
          </section>
        </>}
      </div>}
    </section>
    <ClientPropertyDetails submissions={submissions} selectedSubmission={selected} />
    {selected && <ClientAccountsMortgage filingYear={filing?.filingYear ?? selected.propertyDetails?.filingYear} details={filing?.accountsAndMortgage} />}
  </div>
}
