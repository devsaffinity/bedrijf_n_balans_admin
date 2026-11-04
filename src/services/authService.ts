import { FirebaseError } from 'firebase/app'
import { browserSessionPersistence, onIdTokenChanged, setPersistence, signInWithEmailAndPassword, signOut, type User } from 'firebase/auth'
import { doc, getDocFromServer, onSnapshot, type DocumentSnapshot } from 'firebase/firestore'
import { getFirebaseServices } from './firebase'

export interface AdminUser { uid: string; name: string; email: string }
export interface AdminSession { user: AdminUser | null; initializing: boolean; error: string }

function adminUser(user: User, snapshot: DocumentSnapshot): AdminUser {
  const profile = snapshot.data()
  if (!snapshot.exists() || profile?.role !== 'admin') {
    throw new Error('Access denied. This account does not have administrator permission.')
  }
  return {
    uid: user.uid,
    name: typeof profile.name === 'string' && profile.name.trim() ? profile.name : 'Administrator',
    email: user.email ?? '',
  }
}

function authError(error: unknown): Error {
  if (error instanceof FirebaseError) {
    switch (error.code) {
      case 'auth/invalid-credential':
      case 'auth/invalid-login-credentials':
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-email': return new Error('The email or password is incorrect.')
      case 'auth/user-disabled': return new Error('This account has been disabled.')
      case 'auth/too-many-requests': return new Error('Too many attempts. Please try again later.')
      case 'auth/network-request-failed':
      case 'unavailable': return new Error('Unable to connect. Check your connection and try again.')
      case 'permission-denied': return new Error('Unable to verify administrator access. Contact the administrator.')
      default: return new Error('Unable to sign in. Please try again or contact the administrator.')
    }
  }
  return error instanceof Error ? error : new Error('Unable to sign in. Please try again.')
}

export const authService = {
  subscribe(listener: (session: AdminSession) => void): () => void {
    try {
      const { auth, db } = getFirebaseServices()
      let active = true
      let version = 0
      let stopProfile: (() => void) | undefined
      let timeout: ReturnType<typeof setTimeout> | undefined
      const stopAuth = onIdTokenChanged(auth, (user) => {
        if (!active) return
        const current = ++version
        stopProfile?.()
        clearTimeout(timeout)
        if (!user) {
          listener({ user: null, initializing: false, error: '' })
          return
        }
        listener({ user: null, initializing: true, error: '' })
        timeout = setTimeout(() => {
          if (active && current === version) listener({ user: null, initializing: false, error: 'Unable to verify administrator access. Check your connection and try again.' })
        }, 12000)
        stopProfile = onSnapshot(doc(db, 'admin', user.uid), { includeMetadataChanges: true }, (snapshot) => {
          if (!active || current !== version || snapshot.metadata.fromCache || snapshot.metadata.hasPendingWrites) return
          clearTimeout(timeout)
          try { listener({ user: adminUser(user, snapshot), initializing: false, error: '' }) }
          catch (error) { listener({ user: null, initializing: false, error: authError(error).message }) }
        }, (error) => {
          if (!active || current !== version) return
          clearTimeout(timeout)
          listener({ user: null, initializing: false, error: authError(error).message })
        })
      }, (error) => {
        ++version
        stopProfile?.()
        clearTimeout(timeout)
        if (active) listener({ user: null, initializing: false, error: authError(error).message })
      })
      return () => {
        active = false
        ++version
        clearTimeout(timeout)
        stopProfile?.()
        stopAuth()
      }
    } catch (error) {
      listener({ user: null, initializing: false, error: authError(error).message })
      return () => {}
    }
  },
  async login(email: string, password: string): Promise<void> {
    try {
      const { auth, db } = getFirebaseServices()
      await setPersistence(auth, browserSessionPersistence)
      const { user } = await signInWithEmailAndPassword(auth, email.trim(), password)
      try { adminUser(user, await getDocFromServer(doc(db, 'admin', user.uid))) }
      catch (error) { await signOut(auth); throw error }
    } catch (error) { throw authError(error) }
  },
  async logout(): Promise<void> {
    try { await signOut(getFirebaseServices().auth) }
    catch { throw new Error('Unable to sign out. Please try again.') }
  },
}
