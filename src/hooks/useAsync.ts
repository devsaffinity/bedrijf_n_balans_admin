import { useCallback, useEffect, useState } from 'react'

export function useAsync<T>(loader: () => Promise<T>) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const load = useCallback(async () => {
    setLoading(true); setError('')
    try { setData(await loader()) } catch { setError('We could not load this information. Please try again.') } finally { setLoading(false) }
  }, [loader])
  useEffect(() => { void load() }, [load])
  return { data, setData, loading, error, retry: load }
}
