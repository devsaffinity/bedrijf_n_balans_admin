import { Eye, EyeOff } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../features/auth/AuthContext'
import { LoadingState } from '../components/ui/States'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { user, login, initializing, error: sessionError } = useAuth()
  const location = useLocation()
  const from = (location.state as { from?: { pathname?: string; search?: string; hash?: string } } | null)?.from
  const pathname = from?.pathname
  const destination = pathname?.startsWith('/') && !pathname.startsWith('//') && pathname !== '/login'
    ? `${pathname}${from?.search ?? ''}${from?.hash ?? ''}` : '/'
  if (initializing) return <LoadingState label="Checking administrator access…" />
  if (user) return <Navigate to={destination} replace />
  const submit = async (event: FormEvent) => {
    event.preventDefault(); setError('')
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) return setError('Enter a valid email address.')
    if (!password) return setError('Enter your password.')
    setLoading(true)
    try {
      await login(email, password)
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Unable to sign in.') } finally { setLoading(false) }
  }
  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--color-canvas)] p-5 sm:p-8">
      <section className="w-full max-w-md">
        <div className="w-full max-w-md">
          <div className="card p-6 sm:p-8">
            <img className="mx-auto mb-7 h-14 w-auto object-contain brightness-0" src="/images/applogo.png" alt="Bedrijf in Balans" />
            <h1 className="text-2xl font-bold">Welcome back</h1><p className="mt-2 text-sm text-[var(--color-muted)]">Sign in to access the administration portal.</p>
            <form className="mt-7 space-y-5" onSubmit={submit} noValidate>
              <label className="block"><span className="mb-2 block text-sm font-semibold">Email address</span><input className="field" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} aria-invalid={Boolean(error)} /></label>
              <label className="block"><span className="mb-2 block text-sm font-semibold">Password</span><span className="relative block"><input className="field !pr-12" type={showPassword ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} aria-invalid={Boolean(error)} /><button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-2 text-slate-500" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff size={19} /> : <Eye size={19} />}</button></span></label>
              {(error || sessionError) && <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2.5 text-sm text-rose-700">{error || sessionError}</p>}
              <button className="btn btn-primary w-full" disabled={loading}>{loading ? 'Signing in…' : 'Sign in'}</button>
            </form>
          </div>
        </div>
      </section>
    </main>
  )
}
