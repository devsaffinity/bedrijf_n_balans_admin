import { ChevronLeft, ChevronRight } from 'lucide-react'

export function Pagination({ page, totalPages, onChange }: { page: number; totalPages: number; onChange: (page: number) => void }) {
  return <div className="flex items-center justify-between border-t border-[var(--color-border)] px-4 py-3 text-sm"><span className="text-[var(--color-muted)]">Page {page} of {Math.max(totalPages, 1)}</span><div className="flex gap-2"><button className="btn btn-secondary !min-h-9 !px-2.5" disabled={page <= 1} onClick={() => onChange(page - 1)} aria-label="Previous page"><ChevronLeft size={17} /></button><button className="btn btn-secondary !min-h-9 !px-2.5" disabled={page >= totalPages} onClick={() => onChange(page + 1)} aria-label="Next page"><ChevronRight size={17} /></button></div></div>
}
