import { useCallback, useRef, useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { dashboardKeys } from './useDashboardOptimization'

// Interface for incremental updates
interface IncrementalUpdate {
  viewName: string
  data: any
  timestamp: Date
  type: 'full' | 'incremental' | 'delta'
  changes?: {
    added?: any[]
    removed?: any[]
    modified?: any[]
  }
}

// WebSocket or SSE connection for real-time updates
export const useIncrementalUpdates = () => {
  const queryClient = useQueryClient()
  const [isConnected, setIsConnected] = useState(false)
  const wsRef = useRef<WebSocket | null>(null)
  const updateBuffer = useRef<IncrementalUpdate[]>([])
  const processingTimeout = useRef<NodeJS.Timeout | null>(null)

  // Process buffered updates in batches
  const processUpdates = useCallback(() => {
    if (updateBuffer.current.length === 0) return

    const updates = updateBuffer.current.splice(0) // Clear buffer
    console.log(`[Incremental] Procesando ${updates.length} actualizaciones en lote`)

    updates.forEach(update => {
      // Update React Query cache with new data
      queryClient.setQueryData(
        dashboardKeys.metric(update.viewName),
        update.data
      )

      // Mark query as fresh to prevent unnecessary refetches
      queryClient.invalidateQueries({
        queryKey: dashboardKeys.metric(update.viewName),
        refetchType: 'none'
      })
    })
  }, [queryClient])

  // Handle incoming incremental update
  const handleIncrementalUpdate = useCallback((update: IncrementalUpdate) => {
    updateBuffer.current.push(update)

    // Process updates in batches to avoid excessive re-renders
    if (processingTimeout.current) {
      clearTimeout(processingTimeout.current)
    }

    processingTimeout.current = setTimeout(() => {
      processUpdates()
    }, 100) // 100ms batch window
  }, [processUpdates])

  // Connect to real-time updates
  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return

    try {
      const ws = new WebSocket('ws://localhost:8080/dashboard-updates')
      wsRef.current = ws

      ws.onopen = () => {
        setIsConnected(true)
        console.log('[Incremental] Conectado para actualizaciones en tiempo real')
      }

      ws.onmessage = (event) => {
        try {
          const update: IncrementalUpdate = JSON.parse(event.data)
          handleIncrementalUpdate(update)
        } catch (error) {
          console.error('[Incremental] Error procesando update:', error)
        }
      }

      ws.onclose = () => {
        setIsConnected(false)
        console.log('[Incremental] Desconectado, intentando reconectar...')
        // Auto-reconnect after 5 seconds
        setTimeout(connect, 5000)
      }

      ws.onerror = (error) => {
        console.error('[Incremental] WebSocket error:', error)
        setIsConnected(false)
      }
    } catch (error) {
      console.error('[Incremental] Error conectando:', error)
    }
  }, [handleIncrementalUpdate])

  // Disconnect
  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }
    setIsConnected(false)
  }, [])

  // Auto-connect on mount
  useEffect(() => {
    connect()
    return disconnect
  }, [connect, disconnect])

  return {
    isConnected,
    connect,
    disconnect,
    handleIncrementalUpdate
  }
}

// Smart data differ for detecting changes
export const useDataDiffer = () => {
  const compareData = useCallback((oldData: any, newData: any): IncrementalUpdate['changes'] => {
    if (!oldData) return undefined

    const changes: IncrementalUpdate['changes'] = {
      added: [],
      removed: [],
      modified: []
    }

    // Simple comparison for array data
    if (Array.isArray(oldData) && Array.isArray(newData)) {
      const oldMap = new Map(oldData.map(item => [item.id, item]))
      const newMap = new Map(newData.map(item => [item.id, item]))

      // Find added items
      for (const [id, item] of newMap) {
        if (!oldMap.has(id)) {
          changes.added?.push(item)
        }
      }

      // Find removed items
      for (const [id, item] of oldMap) {
        if (!newMap.has(id)) {
          changes.removed?.push(item)
        }
      }

      // Find modified items
      for (const [id, newItem] of newMap) {
        const oldItem = oldMap.get(id)
        if (oldItem && JSON.stringify(oldItem) !== JSON.stringify(newItem)) {
          changes.modified?.push(newItem)
        }
      }
    }

    // Return changes only if there are any
    const hasChanges = changes.added?.length || changes.removed?.length || changes.modified?.length
    return hasChanges ? changes : undefined
  }, [])

  return { compareData }
}

// Optimized dashboard with incremental updates
export const useOptimizedIncrementalDashboard = () => {
  const queryClient = useQueryClient()
  const incrementalUpdates = useIncrementalUpdates()
  const dataDiffer = useDataDiffer()
  const lastFullRefresh = useRef<Date>(new Date())
  const refreshCount = useRef(0)

  // Smart refresh strategy: only fetch what changed
  const smartRefresh = useCallback(async (viewName?: string) => {
    refreshCount.current++
    const currentRefresh = refreshCount.current
    
    const startTime = performance.now()
    
    try {
      if (viewName) {
        // Refresh specific view
        console.log(`[SmartRefresh] Refresh específico de ${viewName} (#${currentRefresh})`)
        
        // Get old data for comparison
        const oldData = queryClient.getQueryData(dashboardKeys.metric(viewName))
        
        // Fetch new data
        await queryClient.invalidateQueries({ queryKey: dashboardKeys.metric(viewName) })
        const newData = await queryClient.refetchQueries({ queryKey: dashboardKeys.metric(viewName) })
        
        // Compare and send incremental update if connected
        if (incrementalUpdates.isConnected && oldData && newData[0]?.data) {
          const changes = dataDiffer.compareData(oldData, newData[0].data)
          
          if (changes) {
            incrementalUpdates.handleIncrementalUpdate({
              viewName,
              data: newData[0].data,
              timestamp: new Date(),
              type: 'incremental',
              changes
            })
          }
        }
      } else {
        // Full refresh of all views
        console.log(`[SmartRefresh] Refresh completo de todas las vistas (#${currentRefresh})`)
        
        const views = [
          'v_dashboard_metricas_mensuales',
          'v_cursos_estadisticas',
          'v_usuarios_consolidado',
          'v_sesiones_ultimos_7dias',
          'v_top_cursos_completitud',
          'v_top_docentes_ranking',
          'v_contenido_por_tipo'
        ]

        // Invalidate all queries in parallel
        await Promise.all(
          views.map(view => queryClient.invalidateQueries({ queryKey: dashboardKeys.metric(view) }))
        )

        // Refetch all in parallel
        await queryClient.refetchQueries({ queryKey: dashboardKeys.all })
      }
      
      lastFullRefresh.current = new Date()
      const endTime = performance.now()
      
      console.log(`[SmartRefresh] Completado en ${((endTime - startTime) / 1000).toFixed(2)}s`)
      
    } catch (error) {
      const endTime = performance.now()
      console.error(`[SmartRefresh] Error después de ${((endTime - startTime) / 1000).toFixed(2)}s:`, error)
    }
  }, [queryClient, incrementalUpdates, dataDiffer])

  // Background sync with exponential backoff
  const startBackgroundSync = useCallback(() => {
    let syncInterval = 30000 // Start with 30 seconds
    const maxInterval = 300000 // Max 5 minutes
    let consecutiveErrors = 0

    const sync = async () => {
      try {
        await smartRefresh()
        consecutiveErrors = 0
        syncInterval = 30000 // Reset interval on success
      } catch (error) {
        consecutiveErrors++
        // Exponential backoff
        syncInterval = Math.min(syncInterval * 2, maxInterval)
        console.error(`[BackgroundSync] Error ${consecutiveErrors} consecutivos, siguiente intento en ${syncInterval/1000}s`)
      }
    }

    // Initial sync
    sync()

    // Set up interval
    const intervalId = setInterval(sync, syncInterval)

    // Adaptive interval adjustment
    const adaptiveInterval = setInterval(() => {
      if (consecutiveErrors === 0 && syncInterval > 30000) {
        syncInterval = Math.max(syncInterval * 0.8, 30000) // Gradually reduce interval
      }
    }, 60000) // Check every minute

    return () => {
      clearInterval(intervalId)
      clearInterval(adaptiveInterval)
    }
  }, [smartRefresh])

  return {
    smartRefresh,
    startBackgroundSync,
    isConnected: incrementalUpdates.isConnected,
    lastFullRefresh: lastFullRefresh.current,
    refreshCount: refreshCount.current
  }
}

// Performance optimization utilities
export const useDashboardCacheOptimizer = () => {
  const queryClient = useQueryClient()
  const cacheStats = useRef({
    hits: 0,
    misses: 0,
    size: 0,
    lastCleanup: new Date()
  })

  // Optimize cache size
  const optimizeCache = useCallback(() => {
    const cache = queryClient.getQueryCache()
    const queries = cache.getAll()
    
    // Remove old, unused queries
    const now = Date.now()
    const staleThreshold = 10 * 60 * 1000 // 10 minutes
    
    queries.forEach(query => {
      const state = query.state
      const age = now - state.dataUpdatedAt
      
      if (age > staleThreshold && state.fetchStatus === 'idle') {
        cache.remove(query)
        console.log(`[Cache] Removiendo query obsoleta: ${query.queryKey[0]}`)
      }
    })

    // Update stats
    cacheStats.current.size = cache.getAll().length
    cacheStats.current.lastCleanup = new Date()
    
    console.log(`[Cache] Optimización completada. Size: ${cacheStats.current.size}`)
  }, [queryClient])

  // Warm up cache with predicted data
  const warmupCache = useCallback(() => {
    const predictedViews = [
      'v_dashboard_metricas_mensuales',
      'v_cursos_estadisticas',
      'v_usuarios_consolidado'
    ]

    predictedViews.forEach(viewName => {
      queryClient.prefetchQuery({
        queryKey: dashboardKeys.metric(viewName),
        queryFn: async () => {
          // Simulate API call
          const response = await fetch(`/api/dashboard/${viewName}`)
          return response.json()
        },
        staleTime: 60 * 1000 // 1 minute
      })
    })

    console.log('[Cache] Cache warmup completado')
  }, [queryClient])

  // Get cache statistics
  const getCacheStats = useCallback(() => {
    const cache = queryClient.getQueryCache()
    const queries = cache.getAll()
    
    const activeQueries = queries.filter(q => q.state.fetchStatus !== 'idle')
    const staleQueries = queries.filter(q => q.isStale())
    
    return {
      totalQueries: queries.length,
      activeQueries: activeQueries.length,
      staleQueries: staleQueries.length,
      cacheHits: cacheStats.current.hits,
      cacheMisses: cacheStats.current.misses,
      hitRate: cacheStats.current.hits / (cacheStats.current.hits + cacheStats.current.misses) || 0,
      lastCleanup: cacheStats.current.lastCleanup
    }
  }, [queryClient])

  // Auto-optimize cache periodically
  useEffect(() => {
    const interval = setInterval(optimizeCache, 5 * 60 * 1000) // Every 5 minutes
    
    return () => clearInterval(interval)
  }, [optimizeCache])

  return {
    optimizeCache,
    warmupCache,
    getCacheStats
  }
}
