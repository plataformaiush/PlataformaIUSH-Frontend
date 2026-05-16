import { useEffect, useState } from 'react'
import { adminReportsService } from '../../../../domain/admin/adminReportsService'
import type { AdminDashboard } from '../../../../domain/admin/types'

export function useAdminDashboard() {
  const [dashboard, setDashboard] = useState<AdminDashboard | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        setLoading(true)
        const data = await adminReportsService.getDashboard()
        if (!cancelled) setDashboard(data)
      } catch (e) {
        if (!cancelled) {
          const message = e instanceof Error ? e.message : String(e)
          setError(message)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [])

  return { dashboard, loading, error }
}
