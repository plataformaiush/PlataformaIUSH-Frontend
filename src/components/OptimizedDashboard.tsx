import React, { useEffect, useState } from 'react'
import { useOptimizedDashboard } from '../hooks/useDashboardOptimization'
import { useOptimizedIncrementalDashboard } from '../hooks/useIncrementalDashboard'
import { useDashboardCacheOptimizer } from '../hooks/useIncrementalDashboard'

// Individual metric card component
const MetricCard = ({ 
  title, 
  value, 
  trend, 
  isLoading, 
  lastRefresh 
}: {
  title: string
  value: string | number
  trend?: 'up' | 'down' | 'stable'
  isLoading?: boolean
  lastRefresh?: Date
}) => {
  if (isLoading) {
    return (
      <div className="p-6 rounded-xl border bg-gray-50 animate-pulse">
        <div className="h-4 bg-gray-200 rounded mb-2"></div>
        <div className="h-8 bg-gray-200 rounded"></div>
      </div>
    )
  }

  return (
    <div className="p-6 rounded-xl border bg-white shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        {trend && (
          <span className={`text-xs px-2 py-1 rounded ${
            trend === 'up' ? 'bg-green-100 text-green-800' :
            trend === 'down' ? 'bg-red-100 text-red-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'}
          </span>
        )}
      </div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      {lastRefresh && (
        <div className="text-xs text-gray-500 mt-1">
          Actualizado: {lastRefresh.toLocaleTimeString()}
        </div>
      )}
    </div>
  )
}

// Main optimized dashboard component
export const OptimizedDashboard: React.FC = () => {
  const [isManualRefresh, setIsManualRefresh] = useState(false)
  const [showPerformance, setShowPerformance] = useState(false)
  
  // Use all optimization hooks
  const dashboard = useOptimizedDashboard()
  const incrementalDashboard = useOptimizedIncrementalDashboard()
  const cacheOptimizer = useDashboardCacheOptimizer()

  // Start background sync on mount
  useEffect(() => {
    const cleanup = incrementalDashboard.startBackgroundSync()
    return cleanup
  }, [incrementalDashboard])

  // Manual refresh with performance tracking
  const handleManualRefresh = async () => {
    setIsManualRefresh(true)
    const result = await dashboard.refreshWithTracking()
    
    if (result.success) {
      console.log(`[ManualRefresh] Completado en ${result.refreshTime.toFixed(2)}s`)
    } else {
      console.error(`[ManualRefresh] Error después de ${result.refreshTime.toFixed(2)}s`)
    }
    
    setIsManualRefresh(false)
  }

  // Extract data from dashboard
  const metrics = dashboard.data
  const isLoading = dashboard.isLoading
  const performanceReport = dashboard.performanceReport

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header with controls */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard Optimizado</h1>
            <p className="text-gray-600 mt-1">
              Tiempo de refresh optimizado con programación reactiva
            </p>
          </div>
          
          <div className="flex gap-4 items-center">
            {/* Connection status */}
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
              incrementalDashboard.isConnected 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                incrementalDashboard.isConnected ? 'bg-green-500' : 'bg-gray-400'
              }`} />
              {incrementalDashboard.isConnected ? 'Conectado' : 'Desconectado'}
            </div>

            {/* Performance toggle */}
            <button
              onClick={() => setShowPerformance(!showPerformance)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              {showPerformance ? 'Ocultar' : 'Mostrar'} Performance
            </button>

            {/* Manual refresh */}
            <button
              onClick={handleManualRefresh}
              disabled={isManualRefresh || isLoading}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 transition-colors"
            >
              {isManualRefresh ? 'Refrescando...' : 'Refrescar Todo'}
            </button>

            {/* Cache optimization */}
            <button
              onClick={() => {
                cacheOptimizer.optimizeCache()
                cacheOptimizer.warmupCache()
              }}
              className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
            >
              Optimizar Cache
            </button>
          </div>
        </div>
      </div>

      {/* Performance metrics panel */}
      {showPerformance && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-3">Métricas de Performance</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-blue-700">Refreshes totales:</span>
              <span className="ml-2 font-medium">{performanceReport.totalRefreshes}</span>
            </div>
            <div>
              <span className="text-blue-700">Tiempo promedio:</span>
              <span className="ml-2 font-medium">{performanceReport.averageRefreshTime}s</span>
            </div>
            <div>
              <span className="text-blue-700">Más lento:</span>
              <span className="ml-2 font-medium">{performanceReport.slowestRefresh}s</span>
            </div>
            <div>
              <span className="text-blue-700">Más rápido:</span>
              <span className="ml-2 font-medium">{performanceReport.fastestRefresh}s</span>
            </div>
          </div>
          
          {/* Cache stats */}
          <div className="mt-4 pt-4 border-t border-blue-200">
            <h4 className="font-medium text-blue-900 mb-2">Estadísticas de Cache</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              {(() => {
                const cacheStats = cacheOptimizer.getCacheStats()
                return (
                  <>
                    <div>
                      <span className="text-blue-700">Queries totales:</span>
                      <span className="ml-2 font-medium">{cacheStats.totalQueries}</span>
                    </div>
                    <div>
                      <span className="text-blue-700">Queries activas:</span>
                      <span className="ml-2 font-medium">{cacheStats.activeQueries}</span>
                    </div>
                    <div>
                      <span className="text-blue-700">Hit rate:</span>
                      <span className="ml-2 font-medium">{(cacheStats.hitRate * 100).toFixed(1)}%</span>
                    </div>
                    <div>
                      <span className="text-blue-700">Última limpieza:</span>
                      <span className="ml-2 font-medium">{cacheStats.lastCleanup.toLocaleTimeString()}</span>
                    </div>
                  </>
                )
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            <span className="text-blue-800">Cargando métricas del dashboard...</span>
          </div>
        </div>
      )}

      {/* Main metrics grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Métricas Mensuales"
          value={metrics?.v_dashboard_metricas_mensuales?.total || 'N/A'}
          trend="up"
          isLoading={!metrics?.v_dashboard_metricas_mensuales}
        />
        <MetricCard
          title="Estadísticas de Cursos"
          value={metrics?.v_cursos_estadisticas?.count || 'N/A'}
          trend="stable"
          isLoading={!metrics?.v_cursos_estadisticas}
        />
        <MetricCard
          title="Usuarios Consolidados"
          value={metrics?.v_usuarios_consolidado?.total || 'N/A'}
          trend="up"
          isLoading={!metrics?.v_usuarios_consolidado}
        />
        <MetricCard
          title="Sesiones Últimos 7 Días"
          value={metrics?.v_sesiones_ultimos_7dias?.sessions || 'N/A'}
          trend="down"
          isLoading={!metrics?.v_sesiones_ultimos_7dias}
        />
      </div>

      {/* Secondary metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Cursos por Completitud</h3>
            {metrics?.v_top_cursos_completitud ? (
              <div className="space-y-3">
                {metrics.v_top_cursos_completitud.slice(0, 5).map((course: any, index: number) => (
                  <div key={course.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                      <span className="font-medium text-gray-900">{course.title}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full" 
                          style={{ width: `${course.completion_rate}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {course.completion_rate}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="animate-pulse space-y-3">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Docentes</h3>
            {metrics?.v_top_docentes_ranking ? (
              <div className="space-y-3">
                {metrics.v_top_docentes_ranking.slice(0, 5).map((teacher: any, index: number) => (
                  <div key={teacher.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                      <span className="font-medium text-gray-900">{teacher.name}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {teacher.rating}⭐
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="animate-pulse space-y-3">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                    <div className="h-4 bg-gray-200 rounded w-12"></div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content by type */}
      <div className="bg-white p-6 rounded-xl border shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Contenido por Tipo</h3>
        {metrics?.v_contenido_por_tipo ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(metrics.v_contenido_por_tipo).map(([type, count]: [string, any]) => (
              <div key={type} className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">{count}</div>
                <div className="text-sm text-gray-600 mt-1 capitalize">{type}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="text-center p-4 bg-gray-50 rounded-lg animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-16 mx-auto mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-20 mx-auto"></div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Status bar */}
      <div className="mt-8 p-4 bg-gray-100 rounded-lg">
        <div className="flex justify-between items-center text-sm text-gray-600">
          <div>
            Último refresh completo: {incrementalDashboard.lastFullRefresh?.toLocaleString()}
          </div>
          <div>
            Total de refreshs: {incrementalDashboard.refreshCount}
          </div>
          <div>
            Estado: {isLoading ? 'Cargando...' : 'Listo'}
          </div>
        </div>
      </div>
    </div>
  )
}

export default OptimizedDashboard
