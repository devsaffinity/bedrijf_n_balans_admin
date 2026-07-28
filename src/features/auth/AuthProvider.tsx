import { useMemo, useState, type ReactNode } from 'react'
import { authService } from '../../services/authService'
import { AuthContext } from './AuthContext'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState(() => authService.getSession())
  const value = useMemo(() => ({
    user,
    login: async (email: string, password: string) => setUser(await authService.login(email, password)),
    logout: () => { authService.logout(); setUser(null) },
  }), [user])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
