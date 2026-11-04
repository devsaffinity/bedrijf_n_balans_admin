import { getApp, getApps, initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

export function getFirebaseServices() {
  const config = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
  }
  if (Object.values(config).some((value) => !value)) {
    throw new Error('Firebase login is not configured. Contact the administrator.')
  }
  const app = getApps().length ? getApp() : initializeApp(config)
  return { auth: getAuth(app), db: getFirestore(app) }
}
