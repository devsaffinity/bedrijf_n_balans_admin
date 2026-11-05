import { CheckCircle2, Circle } from 'lucide-react'
import { filingProgress } from '../../features/submissions/progress'
import type { Payment, Submission } from '../../types/domain'
import { formatDate } from '../../utils/format'

export function FilingProgress({ submission, payments, showDates = false, compact = false }: { submission: Submission; payments: Payment[]; showDates?: boolean; compact?: boolean }) {
  const { milestones, completed } = filingProgress(submission, payments)
  const percentage = (completed / milestones.length) * 100
  const unknown = milestones.some((milestone) => milestone.completed === undefined)
  return <div className="min-w-64">
    <div className="mb-2 flex items-center justify-between gap-3 text-xs font-semibold"><span className="text-[var(--color-muted)]">{unknown ? 'Not provided' : `${completed} of ${milestones.length} completed`}</span>{!unknown && <span className="text-emerald-700">{percentage}%</span>}</div>
    {!unknown && <div className={`${compact ? '' : 'mb-4'} h-2 overflow-hidden rounded-full bg-slate-200`} role="progressbar" aria-label="Filing progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percentage} aria-valuetext={`${completed} of ${milestones.length} milestones completed`}>
      <div className="h-full rounded-full bg-emerald-500 transition-[width] duration-300 motion-reduce:transition-none" style={{ width: `${percentage}%` }} />
    </div>}
    {!compact && <ol className="space-y-3">{milestones.map((milestone) => <li key={milestone.label} className="flex items-start gap-2">
    {milestone.completed ? <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-600" aria-hidden="true" /> : <Circle size={16} className="mt-0.5 shrink-0 text-slate-400" aria-hidden="true" />}
    <div className="min-w-0 flex-1"><p className="text-xs font-medium">{milestone.label}</p>{showDates && milestone.completed && milestone.date && <p className="mt-1 text-xs text-[var(--color-muted)]">{formatDate(milestone.date)}</p>}</div>
    <span className={`text-xs ${milestone.completed ? 'text-emerald-700' : 'text-[var(--color-muted)]'}`}>{milestone.completed === undefined ? 'Not provided' : milestone.completed ? 'Complete' : 'Pending'}</span>
  </li>)}</ol>}</div>
}
