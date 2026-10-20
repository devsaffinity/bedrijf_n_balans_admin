import { useState } from 'react'
import { Eye, Pencil, Plus, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { Badge } from '../components/ui/Badge'
import { DataToolbar } from '../components/ui/DataToolbar'
import { EmptyState } from '../components/ui/States'
import { Modal } from '../components/ui/Modal'
import { PageHeader } from '../components/ui/PageHeader'
import { filingFee, planService } from '../features/subscriptions/plans'
import type { FilingPlan } from '../features/subscriptions/plans'
import { formatMoney } from '../utils/format'

interface PlanDraft { id?: string; charges: FilingPlan['charges']; person: FilingPlan['person']; status: FilingPlan['status']; timePeriod: FilingPlan['timePeriod']; name: string; description: string; price: string; partnerPrice: string; customPartnerPrice: boolean }
const emptyDraft: PlanDraft = { charges: 'Filing', person: 'Single', status: 'Active', timePeriod: 'Year', name: '', description: '', price: '', partnerPrice: '', customPartnerPrice: false }

export function PlansPage() {
  const [plans, setPlans] = useState(() => planService.getPlans())
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [personFilter, setPersonFilter] = useState('All')
  const [periodFilter, setPeriodFilter] = useState('All')
  const [draft, setDraft] = useState<PlanDraft | null>(null)
  const [viewing, setViewing] = useState<FilingPlan | null>(null)
  const [deleting, setDeleting] = useState<FilingPlan | null>(null)
  const [error, setError] = useState('')
  const hasFilters = Boolean(search || statusFilter !== 'All' || personFilter !== 'All' || periodFilter !== 'All')
  const rows = plans.filter((plan) =>
    (statusFilter === 'All' || plan.status === statusFilter)
    && (personFilter === 'All' || plan.person === personFilter)
    && (periodFilter === 'All' || plan.timePeriod === periodFilter)
    && `${plan.name} ${plan.description} ${plan.person} ${plan.timePeriod}`.toLowerCase().includes(search.toLowerCase()))
  const edit = (plan: FilingPlan) => {
    setError('')
    setDraft({ id: plan.id, charges: plan.charges, person: plan.person, status: plan.status, timePeriod: plan.timePeriod, name: plan.name, description: plan.description, price: String(plan.price), partnerPrice: plan.partnerPrice === undefined ? '' : String(plan.partnerPrice), customPartnerPrice: plan.partnerPrice !== undefined })
  }
  const save = () => {
    if (!draft) return
    try {
      if (!draft.price.trim() || (draft.person !== 'With partner' && draft.customPartnerPrice && !draft.partnerPrice.trim())) throw new Error('Enter all required prices.')
      const input = { charges: draft.charges, person: draft.person, status: draft.status, timePeriod: draft.timePeriod, name: draft.name, description: draft.description, price: Number(draft.price), partnerPrice: draft.person === 'With partner' ? Number(draft.price) : draft.customPartnerPrice ? Number(draft.partnerPrice) : undefined }
      if (draft.id) planService.updatePlan(draft.id, input)
      else planService.createPlan(input)
      setPlans(planService.getPlans())
      setDraft(null)
      toast.success(draft.id ? 'Plan updated.' : 'Plan created.')
    } catch (saveError) { setError(saveError instanceof Error ? saveError.message : 'Unable to save plan.') }
  }
  const remove = () => {
    if (!deleting) return
    try {
      planService.deletePlan(deleting.id)
      setPlans(planService.getPlans())
      setDeleting(null)
      toast.success('Plan deleted. Existing subscriptions were preserved.')
    } catch (deleteError) { toast.error(deleteError instanceof Error ? deleteError.message : 'Unable to delete plan.') }
  }

  return <>
    <PageHeader title="Plan" description="Create and manage filing plans, descriptions, and prices." action={<button className="btn btn-primary" onClick={() => { setError(''); setDraft({ ...emptyDraft }) }}><Plus size={18} />Create plan</button>} />
    <section className="card overflow-hidden" aria-label="Filing plans">
      <DataToolbar search={search} onSearch={setSearch} placeholder="Search plans by name or description">
        <div className="grid gap-3 sm:grid-cols-3">
          <select className="field" aria-label="Filter plans by status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option value="All">All statuses</option><option value="Active">Active</option><option value="Inactive">Inactive</option></select>
          <select className="field" aria-label="Filter plans by person" value={personFilter} onChange={(event) => setPersonFilter(event.target.value)}><option value="All">All people</option><option value="Single">Single</option><option value="With partner">With partner</option><option value="-">Unspecified (-)</option></select>
          <select className="field" aria-label="Filter plans by time period" value={periodFilter} onChange={(event) => setPeriodFilter(event.target.value)}><option value="All">All time periods</option><option value="Month">Month</option><option value="Year">Year</option></select>
        </div>
      </DataToolbar>
      {hasFilters && <div className="flex items-center justify-between gap-3 border-b border-[var(--color-border)] px-4 py-3 text-sm"><p className="text-[var(--color-muted)]" aria-live="polite">{rows.length} plans found</p><button className="font-semibold text-[var(--color-brand)]" onClick={() => { setSearch(''); setStatusFilter('All'); setPersonFilter('All'); setPeriodFilter('All') }}>Clear filters</button></div>}
      {rows.length ? <div className="overflow-x-auto"><table className="desktop-table w-full text-left text-sm md:min-w-[600px]">
        <thead className="bg-slate-50 text-xs uppercase text-[var(--color-muted)]"><tr>{['Plan', 'Price', 'Person', 'Charges', 'Status', 'Actions'].map((title) => <th className="px-5 py-3" key={title}>{title}</th>)}</tr></thead>
        <tbody>{rows.map((plan) => <tr key={plan.id} className="border-t border-[var(--color-border)] hover:bg-slate-50">
          <td data-label="Plan" className="px-5 py-4 font-semibold">{plan.name}</td><td data-label="Price" className="px-5 py-4"><p className="font-semibold">{formatMoney(plan.price)}</p><p className="mt-1 text-xs text-[var(--color-muted)]">{plan.person === 'With partner' ? 'Total for 2 people' : 'Per person'} / {plan.timePeriod.toLowerCase()}</p></td><td data-label="Person" className="px-5 py-4"><Badge>{plan.person}</Badge></td><td data-label="Charges" className="px-5 py-4"><Badge>{plan.charges}</Badge></td><td data-label="Status" className="px-5 py-4"><Badge>{plan.status}</Badge></td>
          <td data-label="Actions" className="px-5 py-4"><div className="flex gap-1"><button className="rounded-md p-2 text-slate-600 hover:bg-slate-100" title="View plan" aria-label={`View ${plan.name}`} onClick={() => setViewing(plan)}><Eye size={18} /></button><button className="rounded-md p-2 text-slate-600 hover:bg-slate-100" title="Edit plan" aria-label={`Edit ${plan.name}`} onClick={() => edit(plan)}><Pencil size={18} /></button><button className="rounded-md p-2 text-red-600 hover:bg-red-50" title="Delete plan" aria-label={`Delete ${plan.name}`} onClick={() => setDeleting(plan)}><Trash2 size={18} /></button></div></td>
        </tr>)}</tbody>
      </table></div> : <EmptyState title="No plans found" message={hasFilters ? 'Try another search or clear the filters.' : 'Create a plan to get started.'} />}
    </section>

    <Modal open={Boolean(draft)} title={draft?.id ? 'Update plan' : 'Create plan'} size="wide" onClose={() => setDraft(null)}>{draft && <form className="mt-5 space-y-6 pr-1" onSubmit={(event) => { event.preventDefault(); save() }}>

      {/* Plan details */}
      <fieldset>
        <legend className="mb-4 flex items-center gap-2 text-sm font-bold text-[var(--color-brand)]"><span className="flex size-6 items-center justify-center rounded-full bg-[var(--color-brand-soft)] text-xs font-bold text-[var(--color-brand)]">1</span>Plan details</legend>
        <div className="space-y-4">
          <label className="block text-sm font-semibold">Plan name<input className="field mt-2" required maxLength={100} placeholder="e.g. Regular filing, C Form online filing" value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} /></label>
          <label className="block text-sm font-semibold">Description<textarea className="field mt-2 min-h-24" required maxLength={2000} placeholder="Describe when this plan applies and what it includes…" value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} /></label>
        </div>
      </fieldset>

      <hr className="border-[var(--color-border)]" />

      {/* Configuration */}
      <fieldset>
        <legend className="mb-4 flex items-center gap-2 text-sm font-bold text-[var(--color-brand)]"><span className="flex size-6 items-center justify-center rounded-full bg-[var(--color-brand-soft)] text-xs font-bold text-[var(--color-brand)]">2</span>Configuration</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-semibold">Person<select className="field mt-2" value={draft.person} onChange={(event) => setDraft({ ...draft, person: event.target.value as FilingPlan['person'] })}><option>Single</option><option>With partner</option><option>-</option></select></label>
          <label className="block text-sm font-semibold">Time period<select className="field mt-2" required value={draft.timePeriod} onChange={(event) => setDraft({ ...draft, timePeriod: event.target.value as FilingPlan['timePeriod'] })}><option value="Month">Month</option><option value="Year">Year</option></select></label>
          <label className="block text-sm font-semibold">Charges<select className="field mt-2" value={draft.charges} onChange={(event) => setDraft({ ...draft, charges: event.target.value as FilingPlan['charges'] })}><option>Filing</option><option>All docs</option></select></label>
          <label className="block text-sm font-semibold">Status<select className="field mt-2" value={draft.status} onChange={(event) => setDraft({ ...draft, status: event.target.value as FilingPlan['status'] })}><option>Active</option><option>Inactive</option></select></label>
        </div>
      </fieldset>

      <hr className="border-[var(--color-border)]" />

      {/* Pricing */}
      <fieldset>
        <legend className="mb-4 flex items-center gap-2 text-sm font-bold text-[var(--color-brand)]"><span className="flex size-6 items-center justify-center rounded-full bg-[var(--color-brand-soft)] text-xs font-bold text-[var(--color-brand)]">3</span>Pricing</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-semibold">
            {draft.person === 'With partner' ? `Total for both people per ${draft.timePeriod.toLowerCase()}` : `Price per person per ${draft.timePeriod.toLowerCase()}`}
            <div className="relative mt-2">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-400">€</span>
              <input className="field !pl-8" type="number" min="0" max="1000000" step="0.01" required placeholder="0.00" value={draft.price} onChange={(event) => setDraft({ ...draft, price: event.target.value })} />
            </div>
          </label>
          {draft.person !== 'With partner' && draft.customPartnerPrice && <label className="block text-sm font-semibold">
            Total for both people per {draft.timePeriod.toLowerCase()}
            <div className="relative mt-2">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-400">€</span>
              <input className="field !pl-8" type="number" min="0" max="1000000" step="0.01" required placeholder="0.00" value={draft.partnerPrice} onChange={(event) => setDraft({ ...draft, partnerPrice: event.target.value })} />
            </div>
          </label>}
        </div>
        {draft.person === 'With partner' ? <p className="mt-4 text-sm text-[var(--color-muted)]">This price covers both people for one {draft.timePeriod.toLowerCase()}.</p> : <div className="mt-4 rounded-lg border border-[var(--color-border)] bg-slate-50 p-3">
          <label className="flex items-center gap-3 text-sm">
            <input className="size-4 rounded accent-[var(--color-brand)]" type="checkbox" checked={draft.customPartnerPrice} onChange={(event) => setDraft({ ...draft, customPartnerPrice: event.target.checked })} />
            <span><span className="font-medium">Use a combined price for user and partner</span>{!draft.customPartnerPrice && <span className="mt-0.5 block text-xs text-[var(--color-muted)]">Filing for both people will cost twice the per-person price.</span>}</span>
          </label>
        </div>}
      </fieldset>

      {error && <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2.5 text-sm text-rose-700">{error}</p>}
      <div className="flex justify-end gap-3 border-t border-[var(--color-border)] pt-4"><button type="button" className="btn btn-secondary" onClick={() => setDraft(null)}>Cancel</button><button type="submit" className="btn btn-primary">{draft.id ? 'Save changes' : 'Create plan'}</button></div>
    </form>}</Modal>
    <Modal open={Boolean(viewing)} title="Plan details" onClose={() => setViewing(null)}>{viewing && <div className="mt-4 max-h-[70vh] overflow-y-auto"><dl className="space-y-4 text-sm">{[['Plan name', viewing.name], ['Status', viewing.status], ['Person', viewing.person], ['Charges', viewing.charges], ['Time period', viewing.timePeriod], ['Description', viewing.description], ...(viewing.person === 'With partner' ? [[`Total for both people per ${viewing.timePeriod.toLowerCase()}`, formatMoney(viewing.price)]] : [[`Per person per ${viewing.timePeriod.toLowerCase()}`, formatMoney(viewing.price)], [`Both people per ${viewing.timePeriod.toLowerCase()}`, formatMoney(filingFee(viewing, 'both'))]])].map(([label, value]) => <div key={label}><dt className="text-[var(--color-muted)]">{label}</dt><dd className="mt-1 whitespace-pre-wrap break-words font-medium">{value}</dd></div>)}</dl><div className="mt-6 flex justify-end"><button className="btn btn-primary" onClick={() => { edit(viewing); setViewing(null) }}><Pencil size={16} />Edit plan</button></div></div>}</Modal>
    <Modal open={Boolean(deleting)} title="Delete plan?" onClose={() => setDeleting(null)}><p className="mt-4 text-sm leading-6 text-[var(--color-muted)]">Delete <strong>{deleting?.name}</strong> from available plans? Existing subscriptions and their purchase amounts will be preserved.</p><div className="mt-6 flex justify-end gap-3"><button className="btn btn-secondary" onClick={() => setDeleting(null)}>Cancel</button><button className="btn bg-red-600 text-white hover:bg-red-700" onClick={remove}>Delete plan</button></div></Modal>
  </>
}
