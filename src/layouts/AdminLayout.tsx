import { CreditCard, FileText, LayoutDashboard, LogOut, Menu, Send, Tags, Users, X } from 'lucide-react'
import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../features/auth/AuthContext'

const navigation = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/clients', label: 'Clients', icon: Users },
  { to: '/submissions', label: 'Submissions', icon: Send },
  { to: '/subscriptions', label: 'Subscriptions', icon: Tags },
  { to: '/payments', label: 'Payments', icon: CreditCard },
  { to: '/documents', label: 'Documents', icon: FileText },
]

export function AdminLayout() {
  const [open, setOpen] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const doLogout = () => { logout(); navigate('/login') }
  const sidebar = (
    <>
      <div className="flex h-18 items-center justify-between border-b border-white/15 px-5"><img className="h-7 w-auto max-w-44 object-contain object-left" src="/images/applogo.png" alt="Bedrijf in Balans" /><button className="p-1 text-white md:hidden" onClick={() => setOpen(false)} aria-label="Close navigation"><X /></button></div>
      <nav className="flex-1 space-y-1 p-3" aria-label="Main navigation">{navigation.map(({ to, label, icon: Icon, end }) => <NavLink key={to} to={to} end={end} onClick={() => setOpen(false)} className={({ isActive }) => `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition ${isActive ? 'bg-white text-[var(--color-brand-dark)] shadow-sm' : 'text-red-50/85 hover:bg-white/10 hover:text-white'}`}><Icon size={19} />{label}</NavLink>)}</nav>
      <div className="border-t border-white/15 p-3"><div className="mb-2 px-3 py-2"><div className="text-sm font-semibold text-white">{user?.name}</div><div className="truncate text-xs text-red-100/70">{user?.email}</div></div><button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-red-50/85 hover:bg-white/10 hover:text-white" onClick={doLogout}><LogOut size={18} />Sign out</button></div>
    </>
  )
  return (
    <div className="min-h-screen bg-[var(--color-canvas)]">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col bg-[var(--color-brand-dark)] md:flex">{sidebar}</aside>
      {open && <div className="fixed inset-0 z-50 md:hidden"><button className="absolute inset-0 bg-slate-950/45" onClick={() => setOpen(false)} aria-label="Close navigation overlay" /><aside className="relative flex h-full w-72 flex-col bg-[var(--color-brand-dark)]">{sidebar}</aside></div>}
      <div className="md:pl-64">
        <header className="sticky top-0 z-30 flex h-18 items-center justify-between border-b border-[var(--color-border)] bg-white/95 px-4 backdrop-blur sm:px-6 lg:px-8"><button className="rounded-lg border border-[var(--color-border)] p-2 md:hidden" onClick={() => setOpen(true)} aria-label="Open navigation"><Menu size={20} /></button><div className="hidden text-2xl font-bold tracking-tight text-[var(--color-ink)] sm:block sm:text-3xl">Welcome to dashboard!</div></header>
        <main className="mx-auto w-full max-w-[1800px] p-4 sm:p-6 lg:p-8 xl:px-10 2xl:px-12"><Outlet /></main>
      </div>
    </div>
  )
}
