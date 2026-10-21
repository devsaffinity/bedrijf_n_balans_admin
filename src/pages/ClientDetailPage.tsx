import { ArrowLeft, ChevronDown, Download, Eye, FileText, Mail, Phone, Shield, Users } from 'lucide-react'
import { useCallback, useState } from 'react'
import toast from 'react-hot-toast'
import { Link, useParams } from 'react-router-dom'
import { Badge } from '../components/ui/Badge'
import { ErrorState, LoadingState } from '../components/ui/States'
import { useAsync } from '../hooks/useAsync'
import { ClientDetailTabs } from '../features/clients/ClientDetailTabs'
import { ClientFilingDetails } from '../features/clients/ClientFilingDetails'
import { planService } from '../features/subscriptions/plans'
import { subscriptionService } from '../features/subscriptions/subscriptions'
import { adminService } from '../services/mockService'
import type { PartnerInfo } from '../types/domain'
import { formatDate, formatMoney } from '../utils/format'

const maskBsn = (bsn?: string) => bsn ? '\u2022'.repeat(5) + bsn.slice(-4) : undefined
const displayDate = (value?: string) => value ? value.split('T')[0].split('-').reverse().join('/') : 'Not provided'
const yesNo = (value?: boolean) => value === undefined ? 'Not provided' : value ? 'Yes' : 'No'

function InfoRow({ label, value, masked }: { label: string; value?: string | null; masked?: boolean }) {
  return <div className="min-w-0"><dt className="text-[var(--color-muted)]">{label}</dt><dd className={'mt-1 whitespace-pre-wrap break-words font-medium ' + (masked ? 'font-mono tracking-wider' : '')}>{value || 'Not provided'}</dd></div>
}

function Migration({ person }: { person: PartnerInfo }) {
  return <dl className="grid gap-x-6 gap-y-4 text-sm sm:grid-cols-2">
    <InfoRow label="Netherlands registration date" value={displayDate(person.registrationDate)} />
    <InfoRow label="Country before moving to the Netherlands" value={person.originCountry} />
    <InfoRow label="Emigrated out of the Netherlands" value={yesNo(person.emigratedFromNetherlands)} />
    {person.emigratedFromNetherlands === true && <><InfoRow label="Netherlands deregistration date" value={displayDate(person.emigrationDate)} /><InfoRow label="Destination country" value={person.destinationCountry} /></>}
  </dl>
}

function PartnerSection({ partner }: { partner: PartnerInfo }) {
  return <details className="group card overflow-hidden">
    <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-5 [&::-webkit-details-marker]:hidden">
      <div className="flex items-center gap-3"><span className="rounded-lg bg-[var(--color-brand-soft)] p-2 text-[var(--color-brand)]"><Users size={18} /></span><div><h2 className="font-bold">Partner profile</h2><p className="mt-1 text-sm text-[var(--color-muted)]">{partner.name || 'Partner information'}</p></div></div>
      <ChevronDown size={18} className="shrink-0 text-[var(--color-muted)] transition-transform group-open:rotate-180" />
    </summary>
    <div className="space-y-6 border-t border-[var(--color-border)] p-5">
      <dl className="grid gap-x-6 gap-y-4 text-sm sm:grid-cols-2">
        <InfoRow label="Name" value={partner.name} /><InfoRow label="Email" value={partner.email} />
        <InfoRow label="Phone" value={partner.phone} /><InfoRow label="Date of birth" value={displayDate(partner.dateOfBirth)} />
        <InfoRow label="Nationality" value={partner.nationality} /><InfoRow label="City" value={partner.city} />
      </dl>
      <section className="rounded-lg bg-slate-50 p-4"><h3 className="mb-4 text-sm font-bold">Partner identification</h3><dl className="grid gap-4 text-sm sm:grid-cols-2"><InfoRow label="BSN (Burgerservicenummer)" value={maskBsn(partner.bsn)} masked /><InfoRow label="5-digit code" value={partner.fiveDigitCode} masked /></dl></section>
      <section><h3 className="mb-4 text-sm font-bold">Partner registration and migration</h3><Migration person={partner} /></section>
    </div>
  </details>
}

export function ClientDetailPage() {
  const { clientId = '' } = useParams()
  const [selection, setSelection] = useState({ clientId, tab: 'profile' })
  const active = selection.clientId === clientId ? selection.tab : 'profile'
  const loader = useCallback(async () => {
    const [client, relations] = await Promise.all([adminService.getClient(clientId), adminService.getClientRelations(clientId)])
    return { client, relations, subscriptions: subscriptionService.getAll().filter((item) => item.clientId === clientId), plans: planService.getPlans(true) }
  }, [clientId])
  const { data, loading, error, retry } = useAsync(loader)
  if (loading) return <LoadingState />
  if (error || !data) return <ErrorState retry={retry} />
  if (!data.client) return <div className="card p-8 text-center">Client not found.</div>
  const { client, relations } = data
  const showPartner = client.partner && (client.maritalStatus === 'Married' || client.maritalStatus === 'Living together')
  const tabs = [{ id: 'profile', label: 'Profile' }, { id: 'filings', label: 'Filings', count: relations.submissions.length }, { id: 'documents', label: 'Documents', count: relations.documents.length }]

  return <>
    <Link className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-brand)]" to="/clients"><ArrowLeft size={17} />Back to clients</Link>
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
      <div className="flex min-w-0 items-center gap-4"><span aria-hidden="true" className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[var(--color-brand-soft)] text-lg font-bold text-[var(--color-brand)]">{client.name.split(' ').map((part) => part[0]).slice(0, 2).join('')}</span><div className="min-w-0"><h1 className="break-words text-2xl font-bold sm:text-3xl">{client.name}</h1><p className="mt-1 text-sm text-[var(--color-muted)]">Client since {formatDate(client.joinedAt)}</p></div></div>
      <Badge>{client.status}</Badge>
    </div>
    <div className="grid items-start gap-6 lg:grid-cols-[260px_minmax(0,1fr)] xl:grid-cols-[280px_minmax(0,1fr)]">
      <aside className="min-w-0 space-y-5" aria-label="Client contact and payments">
        <section className="card overflow-hidden">
          <div className="p-5"><h2 className="font-bold">Client information</h2><dl className="mt-5 space-y-4 text-sm">
            <div><dt className="text-[var(--color-muted)]">Email address</dt><dd className="mt-1 flex items-start gap-2 break-all font-medium"><Mail size={15} className="mt-1 shrink-0 text-[var(--color-muted)]" />{client.email}</dd></div>
            <div><dt className="text-[var(--color-muted)]">Phone</dt><dd className="mt-1 flex items-center gap-2 font-medium"><Phone size={15} className="shrink-0 text-[var(--color-muted)]" />{client.phone}</dd></div>
            <InfoRow label="Filing type" value={client.filingType} />
          </dl></div>
          <details className="group border-t border-[var(--color-border)]"><summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-5 py-4 text-sm font-semibold [&::-webkit-details-marker]:hidden"><span className="flex items-center gap-2"><Shield size={16} className="text-[var(--color-brand)]" />Identification</span><ChevronDown size={16} className="transition-transform group-open:rotate-180" /></summary><dl className="space-y-4 px-5 pb-5 text-sm"><InfoRow label="BSN (Burgerservicenummer)" value={maskBsn(client.bsn)} masked /><InfoRow label="5-digit code" value={client.fiveDigitCode} masked /></dl></details>
        </section>
        <section className="card overflow-hidden" aria-labelledby="client-payments-heading">
          <div className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-4"><h2 id="client-payments-heading" className="font-bold">Payments</h2><span className="text-xs text-[var(--color-muted)]">{relations.payments.length} records</span></div>
          {relations.payments.length ? <div className="max-h-80 divide-y divide-[var(--color-border)] overflow-y-auto">{relations.payments.map((item) => <div className="space-y-2 p-4" key={item.id}><div className="flex flex-wrap items-center justify-between gap-2"><span className="font-bold">{formatMoney(item.amount)}</span><Badge>{item.status}</Badge></div><p className="text-xs text-[var(--color-muted)]">{formatDate(item.date)}</p></div>)}</div> : <p className="p-5 text-sm text-[var(--color-muted)]">No payment records.</p>}
        </section>
      </aside>
      <div className="min-w-0 space-y-5">
        <div className="card overflow-hidden"><ClientDetailTabs id="client" label="Client sections" tabs={tabs} active={active} onChange={(tab) => setSelection({ clientId, tab })} /></div>
        <div id="client-panel-profile" role="tabpanel" aria-labelledby="client-tab-profile" hidden={active !== 'profile'} tabIndex={0} className="space-y-5">
          <div className="grid items-start gap-5 xl:grid-cols-2">
            <section className="card p-5"><h2 className="font-bold">Personal information</h2><dl className="mt-5 grid gap-x-5 gap-y-4 text-sm sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2"><InfoRow label="Date of birth" value={displayDate(client.dateOfBirth)} /><InfoRow label="Nationality" value={client.nationality} /><InfoRow label="City" value={client.city} /><InfoRow label="Marital status" value={client.maritalStatus} /><InfoRow label="Date of marriage" value={client.dateOfMarriage ? displayDate(client.dateOfMarriage) : client.maritalStatus === 'Single' || client.maritalStatus === 'Living together' ? 'Not applicable' : 'Not provided'} /></dl></section>
            <section className="card p-5"><h2 className="mb-5 font-bold">Registration and migration</h2><Migration person={client} /></section>
          </div>
          <section className="card p-5"><h2 className="font-bold">30% ruling</h2><dl className="mt-4 grid gap-5 text-sm sm:grid-cols-3"><InfoRow label="Has 30% ruling" value={yesNo(client.hasThirtyPercentRuling)} />{client.hasThirtyPercentRuling === true && <><InfoRow label="Start date" value={displayDate(client.thirtyPercentRulingStart)} /><InfoRow label="End date" value={displayDate(client.thirtyPercentRulingEnd)} /></>}</dl></section>
          {showPartner && <PartnerSection partner={client.partner!} />}
        </div>
        <div id="client-panel-filings" role="tabpanel" aria-labelledby="client-tab-filings" hidden={active !== 'filings'} tabIndex={0} className="space-y-5">
          <ClientFilingDetails key={client.id} submissions={relations.submissions} subscriptions={data.subscriptions} plans={data.plans} />
          {relations.submissions.length > 0 && <details className="group card overflow-hidden"><summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-5 font-semibold [&::-webkit-details-marker]:hidden"><span>Submission history ({relations.submissions.length})</span><ChevronDown size={18} className="transition-transform group-open:rotate-180" /></summary>{relations.submissions.length ? <div className="divide-y divide-[var(--color-border)] border-t border-[var(--color-border)]">{relations.submissions.map((item) => <Link className="flex items-center justify-between gap-4 p-4 hover:bg-slate-50" to={'/submissions/' + item.id} key={item.id}><div className="min-w-0"><p className="break-words text-sm font-semibold">{item.id}</p><p className="mt-1 text-xs text-[var(--color-muted)]">{item.filingType} &middot; Updated {formatDate(item.updatedAt)}</p></div><Badge>{item.submittedAt ? item.status : 'Draft'}</Badge></Link>)}</div> : <p className="p-5 text-sm text-[var(--color-muted)]">No submissions yet.</p>}</details>}
        </div>
        <div id="client-panel-documents" role="tabpanel" aria-labelledby="client-tab-documents" hidden={active !== 'documents'} tabIndex={0}>
          <section className="card overflow-hidden"><div className="border-b border-[var(--color-border)] p-5"><h2 className="font-bold">Uploaded documents</h2><p className="mt-1 text-sm text-[var(--color-muted)]">All documents linked to this client's submissions.</p></div>
            {relations.documents.length ? <div className="divide-y divide-[var(--color-border)]">{relations.documents.map((item) => <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between" key={item.id}><div className="flex min-w-0 items-start gap-3"><span className="rounded-lg bg-slate-50 p-2 text-[var(--color-muted)]"><FileText size={20} /></span><div className="min-w-0"><p className="break-words text-sm font-semibold">{item.name}</p><p className="mt-1 text-xs text-[var(--color-muted)]">{item.type} &middot; {item.size} &middot; {formatDate(item.uploadedAt)}</p></div></div><div className="flex shrink-0 gap-2"><button className="btn btn-secondary !min-h-9 text-sm" onClick={() => toast('Document preview will be available after storage integration.')}><Eye size={15} />View</button><button className="btn btn-secondary !min-h-9 text-sm" onClick={() => toast('Download will be available after storage integration.')}><Download size={15} />Download</button></div></div>)}</div> : <p className="p-5 text-sm text-[var(--color-muted)]">No documents uploaded.</p>}
          </section>
        </div>
      </div>
    </div>
  </>
}
