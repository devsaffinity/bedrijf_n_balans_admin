import { getApp, getApps, initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

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
  const app = getApps().length ? getApp() : initializeApp({ ...config, storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || undefined })
  return { auth: getAuth(app), db: getFirestore(app) }
}

export function getFirebaseStorage() {
  const { auth } = getFirebaseServices()
  if (!auth.app.options.storageBucket) throw new Error('File storage is not configured. Contact the administrator.')
  const storage = getStorage(auth.app)
  storage.maxOperationRetryTime = 15_000
  return storage
}
