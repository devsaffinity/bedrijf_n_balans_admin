import { Search } from 'lucide-react'
import type { ReactNode } from 'react'

export function DataToolbar({ search, onSearch, placeholder = 'Search…', children }: { search: string; onSearch: (value: string) => void; placeholder?: string; children?: ReactNode }) {
  return <div className="flex flex-col gap-3 border-b border-[var(--color-border)] p-4 sm:flex-row"><label className="relative flex-1"><span className="sr-only">{placeholder}</span><Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} /><input className="field !pl-10" value={search} onChange={(e) => onSearch(e.target.value)} placeholder={placeholder} /></label>{children}</div>
}
