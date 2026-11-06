import type { Submission } from '../../types/domain'

function date(value?: string | null): Date | undefined {
  if (!value) return undefined
  const parsed = new Date(value)
  return Number.isFinite(parsed.getTime()) ? parsed : undefined
}

export function dashboardOverview(submissions: Submission[], now = new Date()) {
  const active = submissions.filter((item) => item.status !== 'Deleted')
  const payments = active.flatMap((item) => item.relatedPayments ?? [])
  const paid = new Set(payments.filter((item) => item.status === 'Confirmed' || item.status === 'Paid').map((item) => item.id)).size

  // Mobile submitted/inProgress states do not establish an administrator review decision.
  const reviewKnown = active.every((item) => item.status !== undefined || ['pending', 'accepted', 'rejected', 'inProgress'].includes(item.sourceReviewStatus ?? ''))
  const pending = reviewKnown ? active.filter((item) => item.status === 'Pending' || (!item.status && item.sourceReviewStatus === 'pending')).length : undefined

  const chart = Array.from({ length: 5 }, (_, index) => {
    // Calendar months follow the viewer's browser timezone, like the existing dates.
    const month = new Date(now.getFullYear(), now.getMonth() - 4 + index, 1)
    return { name: new Intl.DateTimeFormat('en', { month: 'short' }).format(month), year: month.getFullYear(), month: month.getMonth(), submissions: 0 }
  })
  let chartAvailable = true
  for (const item of active) {
    const created = date(item.createdAt)
    if (!created) { chartAvailable = false; continue }
    const bucket = chart.find((point) => point.year === created.getFullYear() && point.month === created.getMonth())
    if (bucket && created.getTime() <= now.getTime()) ++bucket.submissions
  }
  const recent = [...active].sort((a, b) =>
    (date(b.updatedAt)?.getTime() ?? date(b.createdAt)?.getTime() ?? 0) - (date(a.updatedAt)?.getTime() ?? date(a.createdAt)?.getTime() ?? 0)
    || a.id.localeCompare(b.id)).slice(0, 4)
  return { total: active.length, paid, pending, chart, chartAvailable, recent }
}
