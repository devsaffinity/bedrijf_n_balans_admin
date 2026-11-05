import { useCallback, useState } from 'react'
import { Check, Pencil, Save, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { PageHeader } from '../components/ui/PageHeader'
import { filingFee, filingYears, planService } from '../features/subscriptions/plans'
import type { FilingPeople, FilingPlan, FilingSelection } from '../features/subscriptions/plans'
import { formatMoney } from '../utils/format'
import { useAsync } from '../hooks/useAsync'
import { ErrorState, LoadingState } from '../components/ui/States'

const peopleLabels: Record<FilingPeople, string> = { me: 'Me', partner: 'My partner', both: 'Both (me and my partner)' }

export function SubscriptionPlans() {
  const { data, setData: setPlans, loading, error, retry } = useAsync(useCallback(() => planService.getPlans(), []))
  const plans = data ?? []
  const [saving, setSaving] = useState(false)
  const [draft, setDraft] = useState<FilingPlan[] | null>(null)
  const [selections, setSelections] = useState<FilingSelection[]>([])
  const selectedYears = [...selections].sort((a, b) => b.year - a.year)
  const complete = selectedYears.length > 0 && selectedYears.every((item) => item.planId)
  const total = selectedYears.reduce((sum, item) => {
    const plan = plans.find((candidate) => candidate.id === item.planId)
    return sum + (plan ? Math.round(filingFee(plan, item.people) * 100) : 0)
  }, 0) / 100

  const toggleYear = (year: number) => setSelections((current) => current.some((item) => item.year === year)
    ? current.filter((item) => item.year !== year)
    : [...current, { year, people: 'me' }])
  const updateYear = (year: number, patch: Partial<FilingSelection>) => setSelections((current) => current.map((item) => item.year === year ? { ...item, ...patch } : item))
  const savePlans = async () => {
    if (!draft || saving) return
    setSaving(true)
    try {
      await planService.savePlans(draft)
      setPlans(await planService.getPlans())
      setDraft(null)
      toast.success('Filing plans updated.')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to save plans.')
    } finally { setSaving(false) }
  }

  if (loading) return <LoadingState label="Loading plans…" />
  if (error) return <ErrorState retry={retry} message={error} />

  return <>
    <PageHeader title="Filing plans" description="Manage filing plans and preview fees for each tax year." action={
      !draft ? <button className="btn btn-secondary" onClick={() => setDraft(structuredClone(plans))}><Pencil size={16} />Edit filing plans</button> : undefined
    } />

    {draft && <form className="card mb-6 p-5 sm:p-6" onSubmit={(event) => { event.preventDefault(); savePlans() }}>
      <h2 className="text-lg font-bold">Manage filing plans</h2>
      <p className="mt-1 text-sm text-[var(--color-muted)]">Prices are in euros, per filing year.</p>
      <div className="mt-5 grid gap-5 md:grid-cols-2">
        {draft.map((plan, index) => <fieldset key={plan.id} className="rounded-lg border border-[var(--color-border)] p-4">
          <legend className="px-1 font-semibold">{plan.name}</legend>
          <label className="block text-sm">Description<textarea required className="field mt-2 min-h-28" value={plan.description} onChange={(event) => setDraft(draft.map((item, i) => i === index ? { ...item, description: event.target.value } : item))} /></label>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="block text-sm">Price per person (€)<input type="number" required min="0" step="0.01" className="field mt-2" value={Number.isNaN(plan.price) ? '' : plan.price} onChange={(event) => setDraft(draft.map((item, i) => i === index ? { ...item, price: event.target.valueAsNumber } : item))} /></label>
            {plan.partnerPrice !== undefined && <label className="block text-sm">Both people, total (€)<input type="number" required min="0" step="0.01" className="field mt-2" value={Number.isNaN(plan.partnerPrice) ? '' : plan.partnerPrice} onChange={(event) => setDraft(draft.map((item, i) => i === index ? { ...item, partnerPrice: event.target.valueAsNumber } : item))} /></label>}
          </div>
        </fieldset>)}
      </div>
      <div className="mt-5 flex justify-end gap-3"><button type="button" className="btn btn-secondary" disabled={saving} onClick={() => setDraft(null)}><X size={16} />Cancel</button><button className="btn btn-primary" type="submit" disabled={saving}><Save size={16} />Save plans</button></div>
    </form>}

    <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="min-w-0 space-y-6">
        <section className="card p-5 sm:p-6" aria-labelledby="filing-years-heading">
          <div className="flex items-start gap-3"><span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-brand-soft)] font-bold text-[var(--color-brand)]">1</span><div><h2 id="filing-years-heading" className="text-lg font-bold">Which tax years do you want to file?</h2><p className="mt-1 text-sm text-[var(--color-muted)]">Select one or more years, then choose who is filing for each year.</p></div></div>
          <div className="mt-5 divide-y divide-[var(--color-border)]">
            {filingYears.map((year) => {
              const selected = selections.find((item) => item.year === year)
              return <div key={year} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                <label className="flex cursor-pointer items-center gap-3 font-semibold"><input className="size-5 accent-[var(--color-brand)]" type="checkbox" checked={Boolean(selected)} onChange={() => toggleYear(year)} />{year}</label>
                <label className="w-full text-sm sm:max-w-72"><span className="sr-only">Who is filing for {year}?</span><select className="field disabled:bg-slate-50 disabled:text-slate-400" disabled={!selected} value={selected?.people ?? 'me'} onChange={(event) => updateYear(year, { people: event.target.value as FilingPeople })}>{Object.entries(peopleLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
              </div>
            })}
          </div>
        </section>

        <section className="card p-5 sm:p-6" aria-labelledby="filing-plans-heading">
          <div className="flex items-start gap-3"><span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-brand-soft)] font-bold text-[var(--color-brand)]">2</span><div><h2 id="filing-plans-heading" className="text-lg font-bold">Select a filing plan for each year</h2><p className="mt-1 text-sm text-[var(--color-muted)]">Your filing type can be different each year. C Form and M Form are charged per person, per filing year.</p></div></div>
          {!selectedYears.length ? <p className="mt-5 rounded-lg bg-slate-50 p-6 text-center text-sm text-[var(--color-muted)]">Select a tax year above to see the available filing plans.</p> : <div className="mt-6 space-y-7">{selectedYears.map((selection) => <fieldset key={selection.year}>
            <legend className="mb-3 font-bold">{selection.year}<span className="ml-2 text-sm font-normal text-[var(--color-muted)]">{peopleLabels[selection.people]}</span></legend>
            <div className="grid gap-3 md:grid-cols-2">{plans.map((plan) => {
              const active = selection.planId === plan.id
              return <label key={plan.id} className={`relative flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors ${active ? 'border-[var(--color-brand)] bg-[var(--color-brand-soft)]' : 'border-[var(--color-border)] hover:bg-slate-50'}`}>
                <input type="radio" className="mt-1 size-4 shrink-0 accent-[var(--color-brand)]" name={`plan-${selection.year}`} checked={active} onChange={() => updateYear(selection.year, { planId: plan.id })} />
                <div className="min-w-0 flex-1"><div className="flex flex-wrap justify-between gap-2"><span className="text-sm font-semibold">{plan.name}</span><strong>{formatMoney(filingFee(plan, selection.people))}</strong></div><p className="mt-1 text-xs font-medium text-[var(--color-muted)]">{selection.people === 'both' ? 'Total for 2 people' : 'For 1 person'} · {selection.year}</p><p className="mt-3 text-sm leading-6 text-[var(--color-muted)]">{plan.description}</p>{plan.partnerPrice === undefined && <p className="mt-2 text-xs font-semibold">{formatMoney(plan.price)} per person per filing year</p>}</div>
              </label>
            })}</div>
          </fieldset>)}</div>}
        </section>
      </div>

      <aside className="card p-5 sm:p-6" aria-labelledby="fee-summary-heading">
        <h2 id="fee-summary-heading" className="text-lg font-bold">Filing fee summary</h2>
        <p className="mt-1 text-sm text-[var(--color-muted)]">Preview of the selected filing fees.</p>
        <div className="my-5 divide-y divide-[var(--color-border)]">{selectedYears.length ? selectedYears.map((selection) => {
          const plan = plans.find((item) => item.id === selection.planId)
          return <div key={selection.year} className="py-4"><div className="flex justify-between gap-3 text-sm font-bold"><span>{selection.year}</span><span>{plan ? formatMoney(filingFee(plan, selection.people)) : '—'}</span></div><p className="mt-1 text-sm">{peopleLabels[selection.people]}</p><p className="mt-1 text-xs text-[var(--color-muted)]">{plan?.name ?? 'Select a filing plan'}</p></div>
        }) : <p className="py-4 text-sm text-[var(--color-muted)]">No filing years selected.</p>}</div>
        <div className="flex items-center justify-between border-t border-[var(--color-border)] pt-5" aria-live="polite"><span className="font-semibold">{complete ? 'Total filing fees' : 'Subtotal'}</span><strong className="text-2xl text-[var(--color-brand)]">{formatMoney(total)}</strong></div>
        {complete && <p className="mt-4 flex items-center gap-2 text-sm text-emerald-700"><Check size={16} />All selected years have a filing plan.</p>}
        {!complete && selectedYears.length > 0 && <p className="mt-4 text-sm text-amber-700">Choose a filing plan for every selected year to complete the total.</p>}
        <button className="btn btn-secondary mt-5 w-full" disabled={!selections.length} onClick={() => setSelections([])}>Clear selection</button>
      </aside>
    </div>
  </>
}

