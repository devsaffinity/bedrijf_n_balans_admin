import { ArrowLeft, Download, Eye, Mail, Phone } from 'lucide-react'
import { useCallback } from 'react'
import toast from 'react-hot-toast'
import { Link, useParams } from 'react-router-dom'
import { Badge } from '../components/ui/Badge'
import { ErrorState, LoadingState } from '../components/ui/States'
import { useAsync } from '../hooks/useAsync'
import { adminService } from '../services/mockService'
import { formatDate, formatMoney } from '../utils/format'

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
  const displayDate = (value?: string) => value
    ? value.split('-').reverse().join('/')
    : 'Not provided'
  const personalDetails = [
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
      ['Emigration date', displayDate(client.emigrationDate)],
      ['Destination country', client.destinationCountry || 'Not provided'],
    ] : []),
  ]
  return <><Link className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-brand)]" to="/clients"><ArrowLeft size={17} />Back to clients</Link><div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div><h1 className="text-2xl font-bold sm:text-3xl">{client.name}</h1><p className="mt-1 text-sm text-[var(--color-muted)]">Client since {formatDate(client.joinedAt)}</p></div><Badge>{client.status}</Badge></div><div className="grid gap-6 lg:grid-cols-[.8fr_1.2fr]"><aside className="card h-fit p-5"><h2 className="font-bold">Client information</h2><dl className="mt-5 space-y-4 text-sm"><div><dt className="text-[var(--color-muted)]">Email address</dt><dd className="mt-1 flex items-center gap-2 font-medium"><Mail size={16} />{client.email}</dd></div><div><dt className="text-[var(--color-muted)]">Phone</dt><dd className="mt-1 flex items-center gap-2 font-medium"><Phone size={16} />{client.phone}</dd></div><div><dt className="text-[var(--color-muted)]">Filing type</dt><dd className="mt-1 font-medium">{client.filingType}</dd></div></dl>
        <section className="mt-6 border-t border-[var(--color-border)] pt-5" aria-labelledby="personal-information-heading">
          <h2 id="personal-information-heading" className="font-bold">Personal information</h2>
          <dl className="mt-5 space-y-4 text-sm">{personalDetails.map(([label, value]) => <div key={label}><dt className="text-[var(--color-muted)]">{label}</dt><dd className="mt-1 break-words font-medium">{value}</dd></div>)}</dl>
        </section>
        <section className="mt-6 border-t border-[var(--color-border)] pt-5" aria-labelledby="migration-information-heading">
          <h2 id="migration-information-heading" className="font-bold">Registration and migration</h2>
          <dl className="mt-5 space-y-4 text-sm">{migrationDetails.map(([label, value]) => <div key={label}><dt className="text-[var(--color-muted)]">{label}</dt><dd className="mt-1 break-words font-medium">{value}</dd></div>)}</dl>
        </section>
      </aside><div className="space-y-6"><section className="card overflow-hidden"><h2 className="border-b border-[var(--color-border)] p-5 font-bold">Submissions</h2>{relations.submissions.length ? <div className="divide-y divide-[var(--color-border)]">{relations.submissions.map((item) => <Link className="flex items-center justify-between gap-4 p-4 hover:bg-slate-50" to={`/submissions/${item.id}`} key={item.id}><div><div className="font-semibold">{item.id}</div><div className="mt-1 text-xs text-[var(--color-muted)]">{item.filingType} · Updated {formatDate(item.updatedAt)}</div></div><Badge>{item.status}</Badge></Link>)}</div> : <p className="p-5 text-sm text-[var(--color-muted)]">No submissions yet.</p>}</section><section className="card overflow-hidden"><h2 className="border-b border-[var(--color-border)] p-5 font-bold">Payments</h2>{relations.payments.length ? <div className="divide-y divide-[var(--color-border)]">{relations.payments.map((item) => <div className="flex items-center justify-between gap-4 p-4" key={item.id}><div><div className="font-semibold">{formatMoney(item.amount)}</div><div className="mt-1 text-xs text-[var(--color-muted)]">{item.reference} · {formatDate(item.date)}</div></div><Badge>{item.status}</Badge></div>)}</div> : <p className="p-5 text-sm text-[var(--color-muted)]">No payment records.</p>}</section><section className="card overflow-hidden"><h2 className="border-b border-[var(--color-border)] p-5 font-bold">Uploaded documents</h2>{relations.documents.length ? <div className="divide-y divide-[var(--color-border)]">{relations.documents.map((item) => <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between" key={item.id}><div><div className="font-semibold">{item.name}</div><div className="mt-1 text-xs text-[var(--color-muted)]">{item.type} · {item.size}</div></div><div className="flex gap-2"><button className="btn btn-secondary !min-h-9" onClick={() => toast('Document preview will be available after storage integration.')}><Eye size={16} />View</button><button className="btn btn-secondary !min-h-9" onClick={() => toast('Download will be available after storage integration.')}><Download size={16} /><span className="sr-only sm:not-sr-only">Download</span></button></div></div>)}</div> : <p className="p-5 text-sm text-[var(--color-muted)]">No documents uploaded.</p>}</section></div></div></>
}
