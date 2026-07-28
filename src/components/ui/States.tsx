import { AlertCircle, Inbox, LoaderCircle } from 'lucide-react'

export function LoadingState({ label = 'Loading information…' }: { label?: string }) {
  return <div className="card flex min-h-52 flex-col items-center justify-center gap-3 p-8 text-sm text-[var(--color-muted)]"><LoaderCircle className="animate-spin text-[var(--color-brand)]" /><span>{label}</span></div>
}
export function EmptyState({ title = 'Nothing found', message = 'Try changing your search or filters.' }: { title?: string; message?: string }) {
  return <div className="flex min-h-48 flex-col items-center justify-center p-8 text-center"><Inbox className="mb-3 text-slate-400" /><strong>{title}</strong><p className="mt-1 text-sm text-[var(--color-muted)]">{message}</p></div>
}
export function ErrorState({ retry }: { retry: () => void }) {
  return <div className="card flex min-h-52 flex-col items-center justify-center gap-3 p-8 text-center"><AlertCircle className="text-rose-600" /><strong>Something went wrong</strong><p className="text-sm text-[var(--color-muted)]">We could not load this information.</p><button className="btn btn-secondary" onClick={retry}>Try again</button></div>
}
