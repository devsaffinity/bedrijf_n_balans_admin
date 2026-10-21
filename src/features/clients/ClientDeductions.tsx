import type { FilingDeductions } from '../../types/domain'
import { ExcelExportButton } from '../../components/ui/ExcelExportButton'
import { ClientDetailField as Field } from './ClientDetailField'
import { displayDate, displayEuro, displayYesNo } from './detailFormat'

export function ClientDeductions({ deductions, filingYear }: { deductions?: FilingDeductions; filingYear?: number }) {
  const year = filingYear ? ` in ${filingYear}` : ' in the filing year'
  return <div className="space-y-5">
    <div><h3 className="font-bold">Deductible expenses</h3><p className="mt-1 text-sm text-[var(--color-muted)]">Submitted medical expenses, alimony and donations for this filing.</p></div>
    <section className="rounded-lg border border-[var(--color-border)] p-4" aria-label="Medical expenses">
      <h4 className="text-sm font-bold">Medical expenses</h4>
      <dl className="mt-2 divide-y divide-[var(--color-border)] text-sm">
        <Field label="Medical expenses incurred" value={displayYesNo(deductions?.medical?.hasExpenses)} />
        {deductions?.medical?.hasExpenses === true && <Field label="Medical expenses not reimbursed by health insurance (EUR)" value={displayEuro(deductions.medical.unreimbursedAmountEur)} />}
      </dl>
    </section>
    <section className="rounded-lg border border-[var(--color-border)] p-4" aria-label="Partner alimony">
      <h4 className="text-sm font-bold">Partner alimony</h4>
      <dl className="mt-2 divide-y divide-[var(--color-border)] text-sm">
        <Field label="Partner alimony paid" value={displayYesNo(deductions?.alimony?.paid)} />
        {deductions?.alimony?.paid === true && <>
          <Field label="Ex-partner name" value={deductions.alimony.exPartnerName} />
          <Field label="Ex-partner date of birth" value={displayDate(deductions.alimony.exPartnerDateOfBirth)} />
          <Field label="Ex-partner BSN" value={deductions.alimony.exPartnerBsn ? '\u2022'.repeat(5) + deductions.alimony.exPartnerBsn.slice(-4) : undefined} />
          <Field label={`Total alimony paid${year} (EUR)`} value={displayEuro(deductions.alimony.annualAmountEur)} />
        </>}
      </dl>
    </section>
    <section className="overflow-hidden rounded-lg border border-[var(--color-border)]" aria-label="Gifts and donations">
      <div className="p-4"><div className="flex items-center justify-between gap-3"><h4 className="text-sm font-bold">Gifts and donations</h4><ExcelExportButton filename={`donations-${filingYear ?? 'filing'}`} sheetName="Gifts and donations" headers={['Foundation / charity', 'Amount paid (EUR)']} rows={deductions?.donations?.paid ? (deductions.donations.items ?? []).map((donation) => [donation.charity || 'Not provided', donation.amountEur]) : []} /></div><dl className="mt-2 text-sm"><Field label="Gifts or donations paid" value={displayYesNo(deductions?.donations?.paid)} /></dl></div>
      {deductions?.donations?.paid === true && (deductions.donations.items?.length ? <div className="overflow-x-auto"><table className="desktop-table w-full text-left text-sm" aria-label="Submitted gifts and donations">
        <thead className="bg-slate-50 text-xs text-[var(--color-muted)]"><tr><th className="px-4 py-3">Foundation / charity</th><th className="px-4 py-3">Amount paid (EUR)</th></tr></thead>
        <tbody>{deductions.donations.items.map((donation) => <tr key={donation.id} className="border-t border-[var(--color-border)]"><td data-label="Foundation / charity" className="break-words px-4 py-3 font-medium">{donation.charity || 'Not provided'}</td><td data-label="Amount paid (EUR)" className="px-4 py-3">{displayEuro(donation.amountEur)}</td></tr>)}</tbody>
      </table></div> : <p className="px-4 pb-4 text-sm text-[var(--color-muted)]">No donation details provided.</p>)}
    </section>
  </div>
}
