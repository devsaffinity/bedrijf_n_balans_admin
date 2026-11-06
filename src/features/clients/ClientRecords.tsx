import { Download, Eye } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Badge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import { DocumentFilePreview } from '../documents/DocumentFilePreview'
import { documentService } from '../../services/documentService'
import type { ClientDocument, Submission } from '../../types/domain'
import { formatDate, formatPaymentAmount } from '../../utils/format'

const submissionLink = (id: string) => `/submissions/${encodeURIComponent(id)}`

export function ClientPayments({ filings }: { filings: Submission[] }) {
  const payments = filings.flatMap((filing) => (filing.relatedPayments ?? []).map((payment) => ({ payment, filing })))
  return <>{payments.length ? <ul className="mt-3 divide-y divide-[var(--color-border)] text-sm">{payments.map(({ payment, filing }) => {
    // A missing currency is not evidence that the payment was made in EUR.
    const amount = formatPaymentAmount(payment.amount, payment.currency)
    return <li className="space-y-2 py-3" key={payment.id}><Link className="break-words font-semibold text-[var(--color-brand)]" to={submissionLink(filing.id)}>{filing.reference ?? filing.id}</Link><div className="flex flex-wrap items-center justify-between gap-2"><span className="font-semibold">{amount}</span><Badge>{payment.status}</Badge></div></li>
  })}</ul> : <p className="mt-3 text-sm text-[var(--color-muted)]">No payments found for this client.</p>}</>
}

export function ClientFilings({ filings }: { filings: Submission[] }) {
  return filings.length ? <div className="mt-3 divide-y divide-[var(--color-border)]">{filings.map((filing) => <div className="space-y-2 py-4 text-sm" key={filing.id}>
    <div className="flex flex-wrap items-center justify-between gap-2"><Link className="break-words font-semibold text-[var(--color-brand)]" to={submissionLink(filing.id)}>{filing.reference ?? filing.id}</Link><Badge>{filing.status === 'Deleted' ? 'Deleted' : filing.sourceReviewStatus ?? 'Not provided'}</Badge></div>
    <p>{filing.filingType}</p><p className="text-[var(--color-muted)]">Created {formatDate(filing.createdAt ?? '')}</p>
  </div>)}</div> : <p className="mt-3 text-sm text-[var(--color-muted)]">No filings found for this client.</p>
}

export function ClientDocuments({ filings }: { filings: Submission[] }) {
  const documents = filings.flatMap((filing) => filing.relatedDocuments ?? [])
  const [preview, setPreview] = useState<ClientDocument | null>(null)
  const [downloading, setDownloading] = useState<string | null>(null)
  const busy = useRef(false)
  const active = useRef(true)
  const urls = useRef(new Set<string>())
  useEffect(() => {
    active.current = true
    const currentUrls = urls.current
    return () => { active.current = false; currentUrls.forEach((url) => URL.revokeObjectURL(url)); currentUrls.clear() }
  }, [])
  async function download(file: ClientDocument) {
    if (busy.current) return
    busy.current = true
    setDownloading(file.id)
    try {
      const blob = await documentService.getFile(file)
      if (!active.current) return
      const url = URL.createObjectURL(blob)
      urls.current.add(url)
      const link = document.createElement('a')
      link.href = url
      link.download = file.name
      try { document.body.append(link); link.click() }
      finally {
        link.remove()
        const currentUrls = urls.current
        setTimeout(() => { if (currentUrls.delete(url)) URL.revokeObjectURL(url) }, 1000)
      }
    } catch (error) {
      if (active.current) toast.error(error instanceof Error ? error.message : 'Unable to download the file.')
    } finally { busy.current = false; if (active.current) setDownloading(null) }
  }
  return <>{documents.length ? <ul className="mt-3 divide-y divide-[var(--color-border)]">{documents.map((file) => <li className="flex items-start justify-between gap-3 py-4 text-sm" key={file.id}>
    <div className="min-w-0"><p className="break-words font-semibold">{file.name}</p><p className="mt-1 text-[var(--color-muted)]">{file.type} · {file.size}</p><Link className="mt-1 inline-block break-words text-[var(--color-brand)]" to={submissionLink(file.submissionId)}>{file.submissionReference ?? file.submissionId}</Link></div>
    <div className="flex shrink-0 gap-1"><button className="rounded-md p-2 text-slate-600 hover:bg-slate-100" disabled={!file.storagePath} onClick={() => setPreview(file)} aria-label={`View ${file.name}`}><Eye size={18} /></button><button className="rounded-md p-2 text-slate-600 hover:bg-slate-100" disabled={Boolean(downloading) || !file.storagePath} onClick={() => void download(file)} aria-label={`Download ${file.name}`}><Download size={18} /></button></div>
  </li>)}</ul> : <p className="mt-3 text-sm text-[var(--color-muted)]">No documents found for this client.</p>}
    <Modal open={Boolean(preview)} title="Document preview" onClose={() => setPreview(null)}>{preview && <div className="mt-5"><p className="mb-3 break-words text-sm font-semibold">{preview.name}</p><DocumentFilePreview key={preview.id} document={preview} /></div>}</Modal>
  </>
}
