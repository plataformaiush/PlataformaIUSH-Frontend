import { useQuery, useQueries, useQueryClient, QueryClient } from '@tanstack/react-query'
import { useCallback, useMemo, useRef, useEffect } from 'react'

// Dashboard view types based on the logs
export interface DashboardMetrics {
  v_dashboard_metricas_mensuales: any
  v_cursos_estadisticas: any
  v_usuarios_consolidado: any
  v_sesiones_ultimos_7dias: any
  v_top_cursos_completitud: any
  v_top_docentes_ranking: any
  v_contenido_por_tipo: any
}

// Query keys for dashboard views
export const dashboardKeys = {
  all: ['dashboard'] as const,
  metrics: () => [...dashboardKeys.all, 'metrics'] as const,
  metric: (name: string) => [...dashboardKeys.metrics(), name] as const,
}

// Individual view fetchers - these would connect to your actual API endpoints
const fetchDashboardMetric = async (viewName: string): Promise<any> => {
  const startTime = performance.now()
  
  try {
    // Simulate API call - replace with actual API calls
    const response = await fetch(`/api/dashboard/${viewName}`)
    if (!response.ok) {
      throw new Error(`Failed to fetch ${viewName}`)
    }
    
    const data = await response.json()
    const endTime = performance.now()
    
    console.log(`[ViewRefresh] Vista ${viewName} refrescada exitosamente en ${((endTime - startTime) / 1000).toFixed(2)}s`)
    
    return data
  } catch (error) {
    const endTime = performance.now()
    console.error(`[ViewRefresh] Error en vista ${viewName} después de ${((endTime - startTime) / 1000).toFixed(2)}s:`, error)
    throw error
  }
}

// Optimized parallel dashboard data fetching
export const useParallelDashboard = () => {
  const queryClient = useQueryClient()
  const refreshCountRef = useRef(0)
  
  // All dashboard views to fetch in parallel
  const dashboardViews = [
    'v_dashboard_metricas_mensuales',
    'v_cursos_estadisticas', 
    'v_usuarios_consolidado',
    'v_sesiones_ultimos_7dias',
    'v_top_cursos_completitud',
    'v_top_docentes_ranking',
    'v_contenido_por_tipo'
  ]

  // Fetch all views in parallel using useQueries
  const results = useQueries({
    queries: dashboardViews.map(viewName => ({
      queryKey: dashboardKeys.metric(viewName),
      queryFn: () => fetchDashboardMetric(viewName),
      staleTime: 30 * 1000, // 30 seconds
      gcTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
      retry: 2,
      enabled: true
    }))
  })

  // Combined loading state
  const isLoading = results.some(result => result.isLoading)
  const isError = results.some(result => result.isError)
  const isSuccess = results.every(result => result.isSuccess)

  // Combined data object
  const data = useMemo(() => {
    const result: Partial<DashboardMetrics> = {}
    results.forEach((result, index) => {
      const viewName = dashboardViews[index]
      if (result.data) {
        result[viewName as keyof DashboardMetrics] = result.data
      }
    })
    return result
  }, [results])

  // Refresh all metrics in parallel
  const refreshAll = useCallback(async () => {
    refreshCountRef.current++
    const currentRefresh = refreshCountRef.current
    
    console.log(`[ViewRefresh] Iniciando refresh paralelo de todas las vistas (#${currentRefresh})`)
    const startTime = performance.now()
    
    try {
      // Invalidate and refetch all queries in parallel
      await Promise.all(
        dashboardViews.map(viewName => 
          queryClient.invalidateQueries({ queryKey: dashboardKeys.metric(viewName) })
        )
      )
      
      // Wait for all queries to complete
      await queryClient.refetchQueries({ queryKey: dashboardKeys.metrics() })
      
      const endTime = performance.now()
      console.log(`[ViewRefresh] Todas las vistas refrescadas en paralelo en ${((endTime - startTime) / 1000).toFixed(2)}s`)
      
    } catch (error) {
      const endTime = performance.now()
      console.error(`[ViewRefresh] Error en refresh paralelo después de ${((endTime - startTime) / 1000).toFixed(2)}s:`, error)
    }
  }, [queryClient])

  // Refresh specific metrics
  const refreshMetric = useCallback(async (viewName: string) => {
    console.log(`[ViewRefresh] Iniciando refresh de vista: ${viewName}`)
    
    try {
      await queryClient.invalidateQueries({ queryKey: dashboardKeys.metric(viewName) })
      await queryClient.refetchQueries({ queryKey: dashboardKeys.metric(viewName) })
    } catch (error) {
      console.error(`[ViewRefresh] Error en vista ${viewName}:`, error)
    }
  }, [queryClient])

  // Preload metrics for better UX
  const preloadMetrics = useCallback(() => {
    dashboardViews.forEach(viewName => {
      queryClient.prefetchQuery({
        queryKey: dashboardKeys.metric(viewName),
        queryFn: () => fetchDashboardMetric(viewName),
        staleTime: 30 * 1000
      })
    })
  }, [queryClient])

  return {
    data,
    isLoading,
    isError,
    isSuccess,
    refreshAll,
    refreshMetric,
    preloadMetrics,
    individualResults: results
  }
}

// Smart refresh with background updates
export const useSmartDashboard = () => {
  const parallelDashboard = useParallelDashboard()
  const lastRefreshTime = useRef<Date>(new Date())
  const refreshInterval = useRef<NodeJS.Timeout | null>(null)

  // Auto-refresh strategy: refresh in background, update UI when done
  const startBackgroundRefresh = useCallback((intervalMs: number = 60000) => {
    // Clear existing interval
    if (refreshInterval.current) {
      clearInterval(refreshInterval.current)
    }

    refreshInterval.current = setInterval(() => {
      console.log('[BackgroundRefresh] Iniciando refresh en segundo plano...')
      parallelDashboard.refreshAll()
      lastRefreshTime.current = new Date()
    }, intervalMs)

    return () => {
      if (refreshInterval.current) {
        clearInterval(refreshInterval.current)
        refreshInterval.current = null
      }
    }
  }, [parallelDashboard])

  // Stop background refresh
  const stopBackgroundRefresh = useCallback(() => {
    if (refreshInterval.current) {
      clearInterval(refreshInterval.current)
      refreshInterval.current = null
    }
  }, [])

  // Get time since last refresh
  const getTimeSinceLastRefresh = useCallback(() => {
    return Date.now() - lastRefreshTime.current.getTime()
  }, [])

  // Check if data is stale
  const isDataStale = useCallback((staleThresholdMs: number = 30000) => {
    return getTimeSinceLastRefresh() > staleThresholdMs
  }, [getTimeSinceLastRefresh])

  return {
    ...parallelDashboard,
    startBackgroundRefresh,
    stopBackgroundRefresh,
    getTimeSinceLastRefresh,
    isDataStale,
    lastRefreshTime: lastRefreshTime.current
  }
}

// Performance monitoring hook
export const useDashboardPerformance = () => {
  const performanceMetrics = useRef<{
    refreshTimes: number[]
    averageRefreshTime: number
    slowestRefresh: number
    fastestRefresh: number
    totalRefreshes: number
  }>({
    refreshTimes: [],
    averageRefreshTime: 0,
    slowestRefresh: 0,
    fastestRefresh: Infinity,
    totalRefreshes: 0
  })

  const recordRefreshTime = useCallback((refreshTime: number) => {
    const metrics = performanceMetrics.current
    
    metrics.refreshTimes.push(refreshTime)
    metrics.totalRefreshes++
    
    // Update statistics
    metrics.averageRefreshTime = metrics.refreshTimes.reduce((sum, time) => sum + time, 0) / metrics.refreshTimes.length
    metrics.slowestRefresh = Math.max(metrics.slowestRefresh, refreshTime)
    metrics.fastestRefresh = Math.min(metrics.fastestRefresh, refreshTime)
    
    // Keep only last 50 refresh times
    if (metrics.refreshTimes.length > 50) {
      metrics.refreshTimes = metrics.refreshTimes.slice(-50)
    }
    
    console.log(`[Performance] Refresh #${metrics.totalRefreshes}: ${refreshTime.toFixed(2)}s (Avg: ${metrics.averageRefreshTime.toFixed(2)}s)`)
  }, [])

  const getPerformanceReport = useCallback(() => {
    const metrics = performanceMetrics.current
    return {
      totalRefreshes: metrics.totalRefreshes,
      averageRefreshTime: metrics.averageRefreshTime.toFixed(2),
      slowestRefresh: metrics.slowestRefresh.toFixed(2),
      fastestRefresh: metrics.fastestRefresh === Infinity ? 'N/A' : metrics.fastestRefresh.toFixed(2),
      recentTrend: metrics.refreshTimes.slice(-10).reduce((sum, time) => sum + time, 0) / Math.min(metrics.refreshTimes.slice(-10).length, 10)
    }
  }, [])

  return {
    recordRefreshTime,
    getPerformanceReport,
    metrics: performanceMetrics.current
  }
}

// Optimized dashboard component hook
export const useOptimizedDashboard = () => {
  const smartDashboard = useSmartDashboard()
  const performance = useDashboardPerformance()

  // Enhanced refresh with performance tracking
  const refreshWithTracking = useCallback(async () => {
    const startTime = performance.now()
    
    try {
      await smartDashboard.refreshAll()
      const endTime = performance.now()
      const refreshTime = (endTime - startTime) / 1000
      
      performance.recordRefreshTime(refreshTime)
      
      return { success: true, refreshTime }
    } catch (error) {
      const endTime = performance.now()
      const refreshTime = (endTime - startTime) / 1000
      
      performance.recordRefreshTime(refreshTime)
      
      return { success: false, refreshTime, error }
    }
  }, [smartDashboard, performance])

  // Initialize background refresh and preloading
  useEffect(() => {
    // Preload data immediately
    smartDashboard.preloadMetrics()
    
    // Start background refresh every 30 seconds
    const cleanup = smartDashboard.startBackgroundRefresh(30000)
    
    return cleanup
  }, [smartDashboard])

  return {
    ...smartDashboard,
    refreshWithTracking,
    performanceReport: performance.getPerformanceReport()
  }
}
