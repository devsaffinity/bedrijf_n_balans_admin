import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { FilingDetailField, FilingPersonDetails, FilingTravelDetails, Submission } from '../../types/domain'
import { ClientPropertyDetails } from './ClientPropertyDetails'
import { Badge } from '../../components/ui/Badge'
import { ClientDetailTabs } from './ClientDetailTabs'
import { ClientAccountsMortgage, ClientFilingSummary } from './ClientFinancialDetails'
import { ClientDeductions } from './ClientDeductions'
import type { FilingPlan } from '../subscriptions/plans'
import type { Subscription } from '../subscriptions/subscriptions'
import { ClientDetailField as Field } from './ClientDetailField'
import { displayDate as date, displayYesNo as yesNo } from './detailFormat'

function Fields({ items }: { items?: FilingDetailField[] }) {
  return items?.length ? <dl className="divide-y divide-[var(--color-border)] text-sm">{items.map((item, index) => <Field key={`${item.label}-${index}`} {...item} />)}</dl> : <p className="py-3 text-sm text-[var(--color-muted)]">No further details provided.</p>
}

function Travel({ travel }: { travel?: FilingTravelDetails }) {
  return <section className="mt-5 border-t border-[var(--color-border)] pt-4" aria-label="Travel expenses">
    <h4 className="text-sm font-bold">Travel expenses</h4>
    <dl className="text-sm"><Field label="Public transport to work" value={yesNo(travel?.usedPublicTransport)} />
      {travel?.usedPublicTransport === true && <Field label="Employer reimbursed public transport expenses" value={yesNo(travel.employerReimbursed)} />}
    </dl>
    {travel?.usedPublicTransport === true && travel.employerReimbursed === false && <>
      <dl className="divide-y divide-[var(--color-border)] text-sm">
        <Field label="Office / work location" value={travel.workLocation} />
        <Field label="Travel period from" value={date(travel.fromDate)} />
        <Field label="Travel period to" value={date(travel.toDate)} />
        <Field label="One-way distance (km)" value={travel.oneWayDistanceKm === undefined ? undefined : String(travel.oneWayDistanceKm)} />
        <Field label="Days per week by public transport" value={travel.daysPerWeek === undefined ? undefined : String(travel.daysPerWeek)} />
      </dl>
      {travel.details?.length ? <Fields items={travel.details} /> : null}
    </>}
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
      <section className="mt-5 border-t border-[var(--color-border)] pt-4" aria-label="30% ruling for selected filing year">
        <h4 className="text-sm font-bold">30% ruling</h4>
        <dl className="divide-y divide-[var(--color-border)] text-sm">
          <Field label="30% ruling in selected filing year" value={yesNo(person.thirtyPercentRuling?.hasRuling)} />
          {person.thirtyPercentRuling?.hasRuling === true && <>
            <Field label="Ruling start date" value={date(person.thirtyPercentRuling.startDate)} />
            <Field label="Ruling end date" value={date(person.thirtyPercentRuling.endDate)} />
          </>}
        </dl>
      </section>
      <Travel travel={person.travel} />
    </>}
  </section>
}

const filingTabs = [
  { id: 'summary', label: 'Summary' },
  { id: 'people', label: 'People & family' },
  { id: 'business', label: 'Business' },
  { id: 'deductions', label: 'Deductions' },
  { id: 'property', label: 'Property' },
  { id: 'accounts', label: 'Accounts & mortgage' },
]

export function ClientFilingDetails({ submissions, subscriptions = [], plans = [] }: { submissions: Submission[]; subscriptions?: Subscription[]; plans?: FilingPlan[] }) {
  const [selectedId, setSelectedId] = useState('')
  const [active, setActive] = useState('summary')
  const selected = submissions.find((item) => item.id === selectedId) ?? submissions[0]
  const filing = selected?.filingDetails

  return <section className="card min-w-0 overflow-hidden" aria-labelledby="filing-details-heading">
      <div className="p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div><h2 id="filing-details-heading" className="text-lg font-bold">Filing details</h2><p className="mt-1 text-sm text-[var(--color-muted)]">Select a filing, then choose the information you need.</p></div>
          {selected && <Badge>{selected.submittedAt ? selected.status : 'Draft'}</Badge>}
        </div>
        {selected && <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-end"><label className="min-w-0 flex-1 text-sm font-semibold">Filing year / submission
          <select className="field mt-2" value={selected.id} onChange={(event) => setSelectedId(event.target.value)}>{submissions.map((item) => <option key={item.id} value={item.id}>{item.filingDetails?.filingYear ?? item.propertyDetails?.filingYear ?? 'Year not provided'} · {item.id}{item.submittedAt ? '' : ' (Draft)'}</option>)}</select>
        </label><Link className="btn btn-secondary shrink-0 text-sm" to={`/submissions/${selected.id}`}>View submission</Link></div>}
      </div>
      {!selected ? <p className="border-t border-[var(--color-border)] p-6 text-sm text-[var(--color-muted)]">No submissions yet.</p> : <>
        <ClientDetailTabs id="filing" label="Filing sections" tabs={filingTabs} active={active} onChange={setActive} />
        {filingTabs.map((tab) => <div key={tab.id} id={`filing-panel-${tab.id}`} role="tabpanel" aria-labelledby={`filing-tab-${tab.id}`} hidden={active !== tab.id} tabIndex={0}>
          {active === tab.id && <div className="p-5 sm:p-6">
        {tab.id === 'summary' && <ClientFilingSummary submission={selected} subscriptions={subscriptions} plans={plans} />}
        {tab.id === 'people' && (!filing ? <p className="text-sm text-[var(--color-muted)]">No personal, family or travel details provided for this submission.</p> : <div className="space-y-5">
          <div className="grid items-start gap-5 2xl:grid-cols-2"><Person title="Main person — filing details" person={filing.mainPerson} />
          {filing.hasPartner === true && <Person title="Partner — filing details" person={filing.partner} />}</div>
          <dl className="text-sm"><Field label="Partner included in this filing" value={yesNo(filing.hasPartner)} /></dl>
          <section className="rounded-lg border border-[var(--color-border)] p-4" aria-label="Children">
            <h3 className="font-bold">Children</h3>
            <dl className="text-sm"><Field label="Has children" value={yesNo(filing.children?.hasChildren)} /></dl>
            {filing.children?.hasChildren === true && <>
              <dl className="text-sm"><Field label="Youngest child's date of birth" value={date(filing.children.youngestDateOfBirth)} /></dl>
              {filing.children.details?.length ? <Fields items={filing.children.details} /> : null}
            </>}
          </section>
        </div>)}
          {tab.id === 'business' && <section aria-label="Business details">
            <h3 className="font-bold">Business details</h3>
            <dl className="divide-y divide-[var(--color-border)] text-sm">
              <Field label="Own business" value={yesNo(filing?.business?.hasOwnBusiness)} />
              {filing?.business?.hasOwnBusiness === true && <>
                <Field label="Ownership" value={filing.business.ownership} />
                <Field label="Description of activities" value={filing.business.activities} />
                <Field label="Company start date" value={date(filing.business.startDate)} />
              </>}
            </dl>
            {filing?.business?.hasOwnBusiness === true && <Fields items={filing.business.details} />}
          </section>}
          {tab.id === 'deductions' && <ClientDeductions deductions={filing?.deductions} filingYear={filing?.filingYear ?? selected.propertyDetails?.filingYear} />}
          {tab.id === 'property' && <ClientPropertyDetails submissions={submissions} selectedSubmission={selected} embedded />}
          {tab.id === 'accounts' && <ClientAccountsMortgage filingYear={filing?.filingYear ?? selected.propertyDetails?.filingYear} details={filing?.accountsAndMortgage} embedded />}
        </div>}
      </div>)}
    </>}
  </section>
}
