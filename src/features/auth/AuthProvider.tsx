import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { authService, type AdminSession } from '../../services/authService'
import { AuthContext } from './AuthContext'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AdminSession>({ user: null, initializing: true, error: '' })
  useEffect(() => authService.subscribe(setSession), [])
  const value = useMemo(() => ({
    ...session,
    login: authService.login,
    logout: authService.logout,
  }), [session])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
