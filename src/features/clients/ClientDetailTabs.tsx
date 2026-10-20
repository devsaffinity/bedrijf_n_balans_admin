export function ClientDetailTabs({ id, label, tabs, active, onChange }: {
  id: string
  label: string
  tabs: { id: string; label: string; count?: number }[]
  active: string
  onChange: (value: string) => void
}) {
  return <div className="overflow-x-auto border-b border-[var(--color-border)]" role="tablist" aria-label={label}>
    <div className="flex min-w-max gap-1 px-2">
      {tabs.map((tab, index) => <button key={tab.id} type="button" role="tab" id={`${id}-tab-${tab.id}`} aria-controls={`${id}-panel-${tab.id}`} aria-selected={active === tab.id} tabIndex={active === tab.id ? 0 : -1}
        className={`inline-flex min-h-12 items-center gap-2 border-b-2 px-3 py-3 text-sm font-semibold transition-colors ${active === tab.id ? 'border-[var(--color-brand)] text-[var(--color-brand)]' : 'border-transparent text-[var(--color-muted)] hover:bg-slate-50 hover:text-[var(--color-ink)]'}`}
        onClick={() => onChange(tab.id)} onKeyDown={(event) => {
          let next = index
          if (event.key === 'ArrowRight') next = (index + 1) % tabs.length
          else if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length
          else if (event.key === 'Home') next = 0
          else if (event.key === 'End') next = tabs.length - 1
          else return
          event.preventDefault()
          onChange(tabs[next].id)
          const buttons = event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[role="tab"]')
          buttons?.[next]?.focus()
        }}>
        {tab.label}{tab.count !== undefined && <span className={`rounded-md px-1.5 py-0.5 text-xs ${active === tab.id ? 'bg-[var(--color-brand-soft)]' : 'bg-slate-100'}`}>{tab.count}</span>}
      </button>)}
    </div>
  </div>
}
