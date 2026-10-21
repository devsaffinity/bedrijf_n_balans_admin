import type { ReactNode } from 'react'

export function PageHeader({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return (
    <header className="mb-6 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 pr-4 sm:pr-5">
      <div className="min-w-0"><h1 className="text-2xl font-bold tracking-tight text-[var(--color-ink)] sm:text-3xl">{title}</h1><p className="mt-1 text-sm text-[var(--color-muted)]">{description}</p></div>
      {action}
    </header>
  )
}
