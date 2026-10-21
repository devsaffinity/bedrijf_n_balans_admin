import type { FilingDetails, Submission } from '../../types/domain'
import type { FilingPlan } from '../subscriptions/plans'
import type { Subscription } from '../subscriptions/subscriptions'
import { ExcelExportButton } from '../../components/ui/ExcelExportButton'

const money = (value?: number) => value !== undefined && Number.isFinite(value)
  ? new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR', currencyDisplay: 'code' }).format(value)
  : 'Not provided'
const peopleLabels = { me: 'Me', partner: 'My partner', both: 'Both (me and my partner)' }

function Field({ label, value }: { label: string; value?: string }) {
  return <div className="grid gap-1 py-3 sm:grid-cols-2 sm:gap-6"><dt className="text-[var(--color-muted)]">{label}</dt><dd className="whitespace-pre-wrap break-words font-medium">{value?.trim() ? value : 'Not provided'}</dd></div>
}

export function ClientFilingSummary({ submission, subscriptions, plans }: { submission: Submission; subscriptions: Subscription[]; plans: FilingPlan[] }) {
  const record = subscriptions.find((item) => item.submissionId === submission.id && item.clientId === submission.clientId)
  const plan = plans.find((item) => item.id === record?.planId)
  return <section className="rounded-lg border border-[var(--color-border)] p-4" aria-label="Filing summary">
    <h3 className="font-bold">Filing summary</h3>
    {!record ? <p className="mt-3 text-sm text-[var(--color-muted)]">No filing plan or fee provided for this submission.</p> : <dl className="mt-2 divide-y divide-[var(--color-border)] text-sm">
      <Field label="Filing year" value={String(record.year)} />
      <Field label="Filing for" value={peopleLabels[record.people]} />
      <Field label="Selected plan" value={plan?.name ?? 'Plan unavailable'} />
      {record.people !== 'partner' && <Field label="Main person form" value={record.mainPersonForm} />}
      {record.people !== 'me' && <Field label="Partner form" value={record.partnerForm} />}
      <Field label="Total filing fee" value={money(record.amount)} />
    </dl>}
  </section>
}

export function ClientAccountsMortgage({ filingYear, details, embedded = false }: { filingYear?: number; details?: FilingDetails['accountsAndMortgage']; embedded?: boolean }) {
  const valuationDate = `1 January ${filingYear ?? 'of filing year'}`
  return <section className={embedded ? 'min-w-0' : 'card overflow-hidden'} aria-labelledby="accounts-mortgage-heading">
    <div className={`flex items-start justify-between gap-3 ${embedded ? 'mb-5' : 'border-b border-[var(--color-border)] p-5'}`}><div><h2 id="accounts-mortgage-heading" className="font-bold">Accounts &amp; Mortgage</h2><p className="mt-1 text-sm text-[var(--color-muted)]">Submitted accounts and foreign mortgage amounts for the selected filing.</p></div><ExcelExportButton filename={`accounts-${filingYear ?? 'filing'}`} sheetName="Accounts" headers={['Account', 'Bank account / registration number', 'Account type', 'Account holder', `Amount on ${valuationDate} (EUR)`]} rows={(details?.accounts ?? []).map((account) => [account.name || 'Not provided', account.accountNumber || 'Not provided', account.category || 'Not provided', account.holder || 'Not provided', account.balanceEur])} /></div>
    {!details ? <p className="p-5 text-sm text-[var(--color-muted)]">No account or mortgage details provided for this submission.</p> : <>
      {details.accounts?.length ? <div className="overflow-x-auto"><table className="desktop-table w-full text-left text-sm" aria-label="Submitted accounts">
        <thead className="bg-slate-50 text-xs text-[var(--color-muted)]"><tr>{['Account', 'Bank account / registration number', 'Account type', 'Account holder', `Amount on ${valuationDate} (EUR)`].map((heading) => <th key={heading} className="px-5 py-3">{heading}</th>)}</tr></thead>
        <tbody>{details.accounts.map((account) => <tr key={account.id} className="border-t border-[var(--color-border)]">
          <td data-label="Account" className="px-5 py-4 font-medium">{account.name || 'Not provided'}</td>
          <td data-label="Bank account / registration number" className="break-all px-5 py-4 font-mono text-xs">{account.accountNumber || 'Not provided'}</td>
          <td data-label="Account type" className="px-5 py-4">{account.category || 'Not provided'}</td>
          <td data-label="Account holder" className="px-5 py-4">{account.holder || 'Not provided'}</td>
          <td data-label={`Amount on ${valuationDate} (EUR)`} className="px-5 py-4 font-medium">{money(account.balanceEur)}</td>
        </tr>)}</tbody>
      </table></div> : <p className="p-5 text-sm text-[var(--color-muted)]">No accounts provided for this submission.</p>}
      <section className="border-t border-[var(--color-border)] p-5" aria-label="Foreign mortgage">
        <h3 className="text-sm font-bold">Foreign mortgage</h3>
        <dl className="mt-2 divide-y divide-[var(--color-border)] text-sm"><Field label="Loans or mortgage outside the Netherlands" value={details.hasForeignMortgage === undefined ? 'Not provided' : details.hasForeignMortgage ? 'Yes' : 'No'} />
          {details.hasForeignMortgage === true && <Field label={`Mortgage amount on ${valuationDate} (EUR)`} value={money(details.foreignMortgageAmountEur)} />}
        </dl>
      </section>
    </>}
  </section>
}
