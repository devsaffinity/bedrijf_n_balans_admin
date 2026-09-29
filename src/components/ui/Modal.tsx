import { X } from 'lucide-react'
import { useEffect, type ReactNode } from 'react'

export function Modal({ open, title, children, onClose, size = 'default' }: { open: boolean; title: string; children: ReactNode; onClose: () => void; size?: 'default' | 'wide' | 'review' }) {
  useEffect(() => {
    if (!open) return
    const handler = (event: KeyboardEvent) => event.key === 'Escape' && onClose()
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-slate-950/45 p-4" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className={`card w-full ${size === 'review' ? 'max-w-6xl' : size === 'wide' ? 'max-w-3xl' : 'max-w-md'} p-5`} role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div className="flex items-center justify-between"><h2 id="modal-title" className="text-lg font-bold">{title}</h2><button className="rounded-md p-1 text-slate-500 hover:bg-slate-100" onClick={onClose} aria-label="Close dialog"><X size={20} /></button></div>
        {children}
      </div>
    </div>
  )
}
