const SESSION_KEY = 'bib_admin_session'

export interface AdminUser { name: string; email: string }

export const authService = {
  getSession(): AdminUser | null {
    const raw = sessionStorage.getItem(SESSION_KEY)
    return raw ? JSON.parse(raw) as AdminUser : null
  },
  async login(email: string, password: string): Promise<AdminUser> {
    await new Promise((resolve) => setTimeout(resolve, 700))
    if (!email.includes('@') || password.length < 8) throw new Error('The email or password is incorrect.')
    const user = { name: 'Administrator', email }
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(user))
    return user
  },
  logout() { sessionStorage.removeItem(SESSION_KEY) },
}
