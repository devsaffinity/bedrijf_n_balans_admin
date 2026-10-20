import { ArrowLeft, Download, Eye, Mail, Phone, Shield, ShieldCheck, User, Users } from 'lucide-react'
import { useCallback } from 'react'
import toast from 'react-hot-toast'
import { Link, useParams } from 'react-router-dom'
import { Badge } from '../components/ui/Badge'
import { ErrorState, LoadingState } from '../components/ui/States'
import { useAsync } from '../hooks/useAsync'
import { ClientFilingDetails } from '../features/clients/ClientFilingDetails'
import { adminService } from '../services/mockService'
import type { PartnerInfo } from '../types/domain'
import { formatDate, formatMoney } from '../utils/format'

const maskBsn = (bsn?: string) => bsn ? `•••••${bsn.slice(-4)}` : undefined
const displayDate = (value?: string) => value ? value.split('T')[0].split('-').reverse().join('/') : 'Not provided'

function InfoRow({ label, value, masked }: { label: string; value?: string | null; masked?: boolean }) {
  return (
    <div>
      <dt className="text-[var(--color-muted)]">{label}</dt>
      <dd className={`mt-1 break-words font-medium ${masked ? 'font-mono tracking-wider' : ''}`}>{value || 'Not provided'}</dd>
    </div>
  )
}

function PartnerSection({ partner }: { partner: PartnerInfo }) {
  const partnerMigration = [
    ['Registration date in the Netherlands', displayDate(partner.registrationDate)],
    ['Origin country', partner.originCountry || 'Not provided'],
    ['Emigrated from the Netherlands', partner.emigratedFromNetherlands === undefined ? 'Not provided' : partner.emigratedFromNetherlands ? 'Yes' : 'No'],
    ...(partner.emigratedFromNetherlands ? [
      ['Netherlands deregistration date', displayDate(partner.emigrationDate)],
      ['Destination country', partner.destinationCountry || 'Not provided'],
    ] : []),
  ]
  return (
    <section aria-labelledby="partner-heading">
      <div className="mb-5 flex items-center gap-2">
        <Users size={18} className="text-[var(--color-brand)]" />
        <h2 id="partner-heading" className="font-bold">Partner information</h2>
      </div>
      <dl className="space-y-4 text-sm">
        <InfoRow label="Name" value={partner.name} />
        <InfoRow label="Email" value={partner.email} />
        <InfoRow label="Phone" value={partner.phone} />
        <InfoRow label="Date of birth" value={displayDate(partner.dateOfBirth)} />
        <InfoRow label="Nationality" value={partner.nationality} />
        <InfoRow label="City" value={partner.city} />
      </dl>
      <div className="mt-5 rounded-lg border border-[var(--color-border)] bg-slate-50 p-4">
        <h3 className="mb-3 text-sm font-bold">Partner identification</h3>
        <dl className="space-y-3 text-sm">
          <InfoRow label="BSN (Burgerservicenummer)" value={maskBsn(partner.bsn)} masked />
          <InfoRow label="5-digit code" value={partner.fiveDigitCode} masked />
        </dl>
      </div>
      {(partner.registrationDate || partner.originCountry) && (
        <div className="mt-5 rounded-lg border border-[var(--color-border)] bg-slate-50 p-4">
          <h3 className="mb-3 text-sm font-bold">Partner registration and migration</h3>
          <dl className="space-y-3 text-sm">
            {partnerMigration.map(([label, value]) => <InfoRow key={label} label={label} value={value} />)}
          </dl>
        </div>
      )}
    </section>
  )
}

export function ClientDetailPage() {
  const { clientId = '' } = useParams()
  const loader = useCallback(async () => {
    const [client, relations] = await Promise.all([adminService.getClient(clientId), adminService.getClientRelations(clientId)])
    return { client, relations }
  }, [clientId])
  const { data, loading, error, retry } = useAsync(loader)
  if (loading) return <LoadingState />; if (error || !data) return <ErrorState retry={retry} />
  if (!data.client) return <div className="card p-8 text-center">Client not found.</div>
  const { client, relations } = data

  const personalDetails = [
    ['Date of birth', displayDate(client.dateOfBirth)],
    ['Nationality', client.nationality || 'Not provided'],
    ['City', client.city || 'Not provided'],
    ['Marital status', client.maritalStatus || 'Not provided'],
    ['Date of marriage', client.dateOfMarriage ? displayDate(client.dateOfMarriage) : client.maritalStatus === 'Single' || client.maritalStatus === 'Living together' ? 'Not applicable' : 'Not provided'],
  ]
  const migrationDetails = [
    ['Registration date in the Netherlands', displayDate(client.registrationDate)],
    ['Origin country before moving to the Netherlands', client.originCountry || 'Not provided'],
    ['Emigrated from the Netherlands', client.emigratedFromNetherlands === undefined ? 'Not provided' : client.emigratedFromNetherlands ? 'Yes' : 'No'],
    ...(client.emigratedFromNetherlands ? [
      ['Netherlands deregistration date', displayDate(client.emigrationDate)],
      ['Destination country', client.destinationCountry || 'Not provided'],
    ] : []),
  ]
  const showPartner = client.partner && (client.maritalStatus === 'Married' || client.maritalStatus === 'Living together')

  return <>
    <Link className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-brand)]" to="/clients"><ArrowLeft size={17} />Back to clients</Link>

    {/* Header */}
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">{client.name}</h1>
        <p className="mt-1 text-sm text-[var(--color-muted)]">Client since {formatDate(client.joinedAt)}</p>
      </div>
      <Badge>{client.status}</Badge>
    </div>

    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,.8fr)_minmax(0,1.2fr)]">
      {/* Left column */}
      <aside className="min-w-0 space-y-6">

        {/* Client contact */}
        <div className="card p-5">
          <div className="flex items-center gap-2">
            <User size={18} className="text-[var(--color-brand)]" />
            <h2 className="font-bold">Client information</h2>
          </div>
          <dl className="mt-5 space-y-4 text-sm">
            <div>
              <dt className="text-[var(--color-muted)]">Email address</dt>
              <dd className="mt-1 flex items-center gap-2 font-medium"><Mail size={16} />{client.email}</dd>
            </div>
            <div>
              <dt className="text-[var(--color-muted)]">Phone</dt>
              <dd className="mt-1 flex items-center gap-2 font-medium"><Phone size={16} />{client.phone}</dd>
            </div>
            <InfoRow label="Filing type" value={client.filingType} />
          </dl>
        </div>

        {/* Identification (BSN + 5-digit code) */}
        <div className="card p-5">
          <div className="flex items-center gap-2">
            <Shield size={18} className="text-[var(--color-brand)]" />
            <h2 className="font-bold">Identification</h2>
          </div>
          <dl className="mt-5 space-y-4 text-sm">
            <InfoRow label="BSN (Burgerservicenummer)" value={maskBsn(client.bsn)} masked />
            <InfoRow label="5-digit code" value={client.fiveDigitCode} masked />
          </dl>
        </div>

        {/* Personal information */}
        <div className="card p-5">
          <h2 className="font-bold">Personal information</h2>
          <dl className="mt-5 space-y-4 text-sm">
            {personalDetails.map(([label, value]) => <InfoRow key={label} label={label} value={value} />)}
          </dl>
        </div>

        {/* 30% Ruling */}
        <div className="card p-5">
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-[var(--color-brand)]" />
            <h2 className="font-bold">30% ruling</h2>
          </div>
          <dl className="mt-5 space-y-4 text-sm">
            <InfoRow label="Has 30% ruling" value={client.hasThirtyPercentRuling === undefined ? 'Not provided' : client.hasThirtyPercentRuling ? 'Yes' : 'No'} />
            {client.hasThirtyPercentRuling && <>
              <InfoRow label="Start date" value={displayDate(client.thirtyPercentRulingStart)} />
              <InfoRow label="End date" value={displayDate(client.thirtyPercentRulingEnd)} />
            </>}
          </dl>
        </div>

        {/* Registration and migration */}
        <div className="card p-5">
          <h2 className="font-bold">Registration and migration</h2>
          <dl className="mt-5 space-y-4 text-sm">
            {migrationDetails.map(([label, value]) => <InfoRow key={label} label={label} value={value} />)}
          </dl>
        </div>

        {/* Payments */}
        <section className="card overflow-hidden">
          <h2 className="border-b border-[var(--color-border)] p-5 font-bold">Payments</h2>
          {relations.payments.length ? <div className="divide-y divide-[var(--color-border)]">{relations.payments.map((item) =>
            <div className="flex items-center justify-between gap-4 p-4" key={item.id}>
              <div><div className="font-semibold">{formatMoney(item.amount)}</div><div className="mt-1 text-xs text-[var(--color-muted)]">{item.reference} · {formatDate(item.date)}</div></div>
              <Badge>{item.status}</Badge>
            </div>
          )}</div> : <p className="p-5 text-sm text-[var(--color-muted)]">No payment records.</p>}
        </section>
      </aside>

      {/* Right column */}
      <div className="min-w-0 space-y-6">

        {/* Partner information (conditional) */}
        {showPartner && <div className="card p-5"><PartnerSection partner={client.partner!} /></div>}

        <ClientFilingDetails key={client.id} submissions={relations.submissions} />

        {/* Submissions */}
        <section className="card overflow-hidden">
          <h2 className="border-b border-[var(--color-border)] p-5 font-bold">Submissions</h2>
          {relations.submissions.length ? <div className="divide-y divide-[var(--color-border)]">{relations.submissions.map((item) =>
            <Link className="flex items-center justify-between gap-4 p-4 hover:bg-slate-50" to={`/submissions/${item.id}`} key={item.id}>
              <div><div className="font-semibold">{item.id}</div><div className="mt-1 text-xs text-[var(--color-muted)]">{item.filingType} · Updated {formatDate(item.updatedAt)}</div></div>
              <Badge>{item.status}</Badge>
            </Link>
          )}</div> : <p className="p-5 text-sm text-[var(--color-muted)]">No submissions yet.</p>}
        </section>

        {/* Documents */}
        <section className="card overflow-hidden">
          <h2 className="border-b border-[var(--color-border)] p-5 font-bold">Uploaded documents</h2>
          {relations.documents.length ? <div className="divide-y divide-[var(--color-border)]">{relations.documents.map((item) =>
            <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between" key={item.id}>
              <div><div className="font-semibold">{item.name}</div><div className="mt-1 text-xs text-[var(--color-muted)]">{item.type} · {item.size}</div></div>
              <div className="flex gap-2">
                <button className="btn btn-secondary !min-h-9" onClick={() => toast('Document preview will be available after storage integration.')}><Eye size={16} />View</button>
                <button className="btn btn-secondary !min-h-9" onClick={() => toast('Download will be available after storage integration.')}><Download size={16} /><span className="sr-only sm:not-sr-only">Download</span></button>
              </div>
            </div>
          )}</div> : <p className="p-5 text-sm text-[var(--color-muted)]">No documents uploaded.</p>}
        </section>
      </div>
    </div>
  </>
}
