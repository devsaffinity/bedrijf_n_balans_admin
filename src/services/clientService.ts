import { FirebaseError } from 'firebase/app'
import { collection, doc, getDocFromServer, getDocsFromServer, Timestamp, type DocumentData } from 'firebase/firestore'
import type { Client, ClientStatus } from '../types/domain'
import { getFirebaseServices } from './firebase'

export interface UserClient extends Omit<Client, 'status'> {
  status?: ClientStatus
  photoUrl?: string
  lastLoginAt?: string
  updatedAt?: string
  notificationsEnabled?: boolean
}

const text = (value: unknown) => typeof value === 'string' ? value.trim() : ''
function date(value: unknown): string {
  if (value instanceof Timestamp) return value.toDate().toISOString()
  if (typeof value === 'string' && value.trim() && Number.isFinite(Date.parse(value))) return new Date(value).toISOString()
  return ''
}

export function mapUserClient(id: string, data: DocumentData): UserClient {
  const statuses: ClientStatus[] = ['Active', 'Awaiting submission', 'Review needed', 'Deleted']
  return {
    // The document ID is authoritative for reads and links, not a writable uid field.
    id,
    name: text(data.name) || 'Not provided',
    email: text(data.email),
    phone: text(data.phone),
    joinedAt: date(data.createdAt),
    filingType: text(data.filingType),
    status: statuses.includes(data.status) ? data.status : undefined,
    photoUrl: text(data.photoUrl) || undefined,
    lastLoginAt: date(data.lastLoginAt) || undefined,
    updatedAt: date(data.updatedAt) || undefined,
    notificationsEnabled: typeof data.notificationsEnabled === 'boolean' ? data.notificationsEnabled : undefined,
  }
}

function clientError(error: unknown): Error {
  if (error instanceof FirebaseError && error.code === 'permission-denied') {
    return new Error('You do not have permission to view clients. Contact the administrator.')
  }
  return new Error('Unable to load clients. Check your connection and try again.')
}

export const clientService = {
  async getClients(): Promise<UserClient[]> {
    try {
      const snapshot = await getDocsFromServer(collection(getFirebaseServices().db, 'users'))
      return snapshot.docs.map((item) => mapUserClient(item.id, item.data()))
    } catch (error) { throw clientError(error) }
  },
  async getClient(id: string): Promise<UserClient | null> {
    if (!id || id.includes('/')) return null
    try {
      const snapshot = await getDocFromServer(doc(getFirebaseServices().db, 'users', id))
      return snapshot.exists() ? mapUserClient(snapshot.id, snapshot.data()) : null
    } catch (error) { throw clientError(error) }
  },
}
