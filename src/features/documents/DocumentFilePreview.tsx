import { useCallback, useEffect, useState } from 'react'
import { LoadingState } from '../../components/ui/States'
import { useAsync } from '../../hooks/useAsync'
import { documentService } from '../../services/documentService'
import type { ClientDocument } from '../../types/domain'
import { previewMime } from './mapping'

export function DocumentFilePreview({ document }: { document: ClientDocument }) {
  const mime = previewMime(document)
  const { data, loading, error } = useAsync(useCallback(async () => mime ? documentService.getFile(document) : null, [document, mime]))
  const [url, setUrl] = useState('')
  const [imageError, setImageError] = useState(false)
  useEffect(() => {
    if (!data || !mime) return
    const objectUrl = URL.createObjectURL(new Blob([data], { type: mime }))
    setUrl(objectUrl)
    return () => URL.revokeObjectURL(objectUrl)
  }, [data, mime])

  if (!mime) return <p className="p-5 text-center text-sm text-[var(--color-muted)]">Preview is not available for this file type. Use the Download action to open the file.</p>
  if (error || imageError) return <p role="alert" className="p-5 text-sm text-rose-700">{error || 'This image could not be displayed. Try downloading the file.'}</p>
  if (loading || !url) return <LoadingState label="Loading document…" />
  return mime === 'application/pdf'
    ? <iframe className="h-72 w-full rounded border-0" src={url} title={`Preview ${document.name}`} />
    : <img className="mx-auto max-h-72 max-w-full object-contain" src={url} alt={`Preview ${document.name}`} onError={() => setImageError(true)} />
}
