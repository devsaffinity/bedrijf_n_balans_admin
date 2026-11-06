import { FirebaseError } from 'firebase/app'
import { collection, getDocsFromServer } from 'firebase/firestore'
import { getBlob, ref } from 'firebase/storage'
import { mapFilingDocuments } from '../features/documents/mapping'
import type { ClientDocument } from '../types/domain'
import { getFirebaseServices, getFirebaseStorage } from './firebase'

function fileError(error: unknown): Error {
  if (error instanceof FirebaseError) {
    switch (error.code) {
      case 'storage/unauthenticated': return new Error('Your session has expired. Please sign in again.')
      case 'storage/unauthorized': return new Error('You do not have permission to access this file. Contact the administrator.')
      case 'storage/object-not-found': return new Error('This file could not be found in storage.')
      default: return new Error('Unable to load the file. Check your connection and try again.')
    }
  }
  return error instanceof Error ? error : new Error('Unable to load the file. Please try again.')
}

export const documentService = {
  async getDocuments(): Promise<ClientDocument[]> {
    try {
      const snapshot = await getDocsFromServer(collection(getFirebaseServices().db, 'taxFilings'))
      return snapshot.docs.flatMap((item) => mapFilingDocuments(item.id, item.data()))
        .sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt) || a.name.localeCompare(b.name) || a.id.localeCompare(b.id))
    } catch (error) {
      if (error instanceof FirebaseError && error.code === 'permission-denied') throw new Error('You do not have permission to view documents. Contact the administrator.')
      throw new Error('Unable to load documents. Check your connection and try again.')
    }
  },
  async getFile(document: ClientDocument): Promise<Blob> {
    try {
      if (!document.clientId || !document.submissionId || document.clientId.includes('/') || document.submissionId.includes('/')) throw new Error('This document has an invalid file location.')
      const path = document.storagePath
      const prefix = `users/${document.clientId}/taxFilings/${document.submissionId}/documents/`
      if (!path || !path.startsWith(prefix) || path.length <= prefix.length || path.split('/').some((part) => !part || part === '.' || part === '..')) throw new Error('This document has no valid file location.')
      // Authenticated SDK reads enforce Storage rules; no public download URL is generated.
      return await getBlob(ref(getFirebaseStorage(), path))
    } catch (error) { throw fileError(error) }
  },
}
