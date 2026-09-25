import type { ReactNode } from 'react'

const tones: Record<string, string> = {
  'Submission Received': 'bg-blue-50 text-blue-700 ring-blue-600/20',
  'Payment Confirmed': 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  'Filing in Progress': 'bg-amber-50 text-amber-700 ring-amber-600/20',
  'Submitted to Tax Authority': 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  Submitted: 'bg-blue-50 text-blue-700 ring-blue-600/20',
  Draft: 'bg-slate-100 text-slate-700 ring-slate-500/20',
  'Payment pending': 'bg-amber-50 text-amber-700 ring-amber-600/20',
  Paid: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  Active: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  Available: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  Approved: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  Accepted: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  Completed: 'bg-blue-50 text-blue-700 ring-blue-600/20',
  Locked: 'bg-slate-100 text-slate-700 ring-slate-500/20',
  Pending: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  'Pending review': 'bg-amber-50 text-amber-700 ring-amber-600/20',
  'Review needed': 'bg-amber-50 text-amber-700 ring-amber-600/20',
  'Awaiting submission': 'bg-violet-50 text-violet-700 ring-violet-600/20',
  Reopened: 'bg-violet-50 text-violet-700 ring-violet-600/20',
  Open: 'bg-sky-50 text-sky-700 ring-sky-600/20',
  Failed: 'bg-rose-50 text-rose-700 ring-rose-600/20',
  Rejected: 'bg-rose-50 text-rose-700 ring-rose-600/20',
  Refunded: 'bg-violet-50 text-violet-700 ring-violet-600/20',
  Deleted: 'bg-slate-100 text-slate-600 ring-slate-500/20',
}

export function Badge({ children }: { children: ReactNode }) {
  const text = String(children)
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${tones[text] ?? 'bg-slate-100 text-slate-700 ring-slate-500/20'}`}>{children}</span>
}
