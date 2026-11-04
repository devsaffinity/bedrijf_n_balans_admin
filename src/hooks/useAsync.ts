import { useCallback, useEffect, useRef, useState } from 'react'

export function useAsync<T>(loader: () => Promise<T>) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const request = useRef(0)
  const invalidate = useCallback(() => { ++request.current }, [])
  const load = useCallback(async () => {
    const current = ++request.current
    setLoading(true); setError('')
    try {
      const result = await loader()
      if (current === request.current) setData(result)
    } catch (error) {
      if (current === request.current) setError(error instanceof Error ? error.message : 'We could not load this information. Please try again.')
    } finally { if (current === request.current) setLoading(false) }
  }, [loader])
  useEffect(() => { void load(); return invalidate }, [load, invalidate])
  return { data, setData, loading, error, retry: load }
}
