import { Timestamp, type DocumentData } from 'firebase/firestore'
import type { ClientDocument, DocumentStatus } from '../../types/domain'

const text = (value: unknown) => typeof value === 'string' ? value.trim() : ''
const object = (value: unknown): Record<string, unknown> => value !== null && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {}
function date(value: unknown): string {
  if (value instanceof Timestamp) return value.toDate().toISOString()
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(value) && Number.isFinite(Date.parse(value))) return new Date(value).toISOString()
  return ''
}

export function mapFilingDocuments(submissionId: string, data: DocumentData): ClientDocument[] {
  const files = object(data.documents).files
  if (!Array.isArray(files)) return []
  const statuses: DocumentStatus[] = ['Available', 'Pending review', 'Approved', 'Rejected']
  return files.map((value, index) => {
    const file = object(value)
    const bytes = typeof file.sizeBytes === 'number' && Number.isFinite(file.sizeBytes) && file.sizeBytes >= 0 ? file.sizeBytes : undefined
    return {
      id: `${submissionId}:file:${index}`, submissionId, submissionReference: text(data.reference) || undefined,
      clientId: text(data.userId), owner: text(object(data.personalInformation).name) || 'Not provided',
      name: text(file.name) || 'Not provided', type: text(file.extension).toUpperCase() || 'Not provided',
      size: bytes === undefined ? 'Not provided' : `${bytes.toLocaleString('en-US')} bytes`,
      storagePath: text(file.storagePath) || undefined,
      uploadedAt: date(file.uploadedAt), status: statuses.includes(file.status as DocumentStatus) ? file.status as DocumentStatus : 'Not provided',
    }
  })
}

export function previewMime(document: ClientDocument): string | undefined {
  return ({ PNG: 'image/png', JPG: 'image/jpeg', JPEG: 'image/jpeg', PDF: 'application/pdf' } as Record<string, string>)[document.type]
}
