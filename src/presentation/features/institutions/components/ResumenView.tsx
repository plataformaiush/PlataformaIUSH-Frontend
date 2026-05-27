import { useState, useEffect } from 'react'
import axios from 'axios'
import { SessionLineChart, completarDatosSemana, completarSesionesPorDia } from './shared/charts'
import { StatCard } from './shared/cards'

interface ResumenViewResponse {
  success: boolean
  data: {
    metricasActuales: {
      sesionesTotales: number
      tiempoPromedioTerminacion: number
      certificadosEmitidos: number
      cursosCompletados: number
      nuevosUsuarios: number
      cursosSinInscripcion: number
    }
    tendenciaSesionesDias: Array<{ dia: string; sesiones: number }>
    sesionesxDia: Array<{ diaSemana: string; total: number }>
    comparativasMensual: {
      sesionesTotales: { estesMes: number; mesAnterior: number; variacion: number }
      tiempoPromedioTerminacion: { estesMes: number; mesAnterior: number; variacion: number }
      cursosCompletados: { estesMes: number; mesAnterior: number; variacion: number }
      certificadosEmitidos: { estesMes: number; mesAnterior: number; variacion: number }
      nuevosUsuarios: { estesMes: number; mesAnterior: number; variacion: number }
      cursosSinInscripcion: { estesMes: number; mesAnterior: number; variacion: number }
    }
  }
}

export function ResumenView() {
  const [data, setData] = useState<ResumenViewResponse['data'] | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingCharts, setLoadingCharts] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isFromCache, setIsFromCache] = useState(false)

  useEffect(() => {
    const fetchResumenView = async () => {
      try {
        setLoading(true)
        setError(null)
        setIsFromCache(false)
        const token = localStorage.getItem('token')
        
        if (!token) {
          setError('Token no encontrado. Por favor, inicia sesión.')
          return
        }

        const response = await axios.get<ResumenViewResponse>(
          'http://localhost:3000/api/superadmin/resumenView',
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        )

        if (response.data.success) {
          setData(response.data.data)
          localStorage.setItem('resumenViewCache', JSON.stringify(response.data.data))
          setLoading(false)
          setLoadingCharts(false)
        }
      } catch (err) {
        const mensaje = axios.isAxiosError(err) 
          ? err.response?.data?.message || err.message 
          : 'Error desconocido'
        
        const cachedData = localStorage.getItem('resumenViewCache')
        if (cachedData) {
          try {
            setData(JSON.parse(cachedData))
            setIsFromCache(true)
            setError(`Error al cargar resumen: ${mensaje}. Mostrando últimos datos disponibles.`)
          } catch {
            setError(`Error al cargar resumen: ${mensaje}`)
          }
        } else {
          setError(`Error al cargar resumen: ${mensaje}`)
        }
        console.error('Error fetching resumen view:', err)
        setLoading(false)
        setLoadingCharts(false)
      }
    }

    fetchResumenView()
  }, [])

  const metricas = data?.metricasActuales
  const tendencia = data?.tendenciaSesionesDias ? completarDatosSemana(data.tendenciaSesionesDias) : []
  const sesiones = data?.sesionesxDia ? completarSesionesPorDia(data.sesionesxDia) : []
  const comparativaData = data?.comparativasMensual
  
  const kpiCards = [
    { 
      l: 'Sesiones este mes', 
      v: metricas ? metricas.sesionesTotales.toLocaleString() : '-', 
      delta: comparativaData ? (comparativaData.sesionesTotales.variacion >= 0 ? '+' : '') + comparativaData.sesionesTotales.variacion.toFixed(2) + '%' : '-',
      up: comparativaData ? comparativaData.sesionesTotales.variacion >= 0 : false
    },
    { 
      l: 'Tiempo promedio de terminación de cursos', 
      v: metricas ? metricas.tiempoPromedioTerminacion : '-',
      delta: comparativaData ? (comparativaData.tiempoPromedioTerminacion.variacion >= 0 ? '+' : '') + comparativaData.tiempoPromedioTerminacion.variacion.toFixed(2) + '%' : '-',
      up: comparativaData ? comparativaData.tiempoPromedioTerminacion.variacion >= 0 : false
    },
    { 
      l: 'Certificados emitidos', 
      v: metricas ? metricas.certificadosEmitidos.toLocaleString() : '-',
      delta: comparativaData ? (comparativaData.certificadosEmitidos.variacion >= 0 ? '+' : '') + comparativaData.certificadosEmitidos.variacion.toFixed(2) + '%' : '-',
      up: comparativaData ? comparativaData.certificadosEmitidos.variacion >= 0 : false
    },
  ]

  const comparativo = comparativaData ? [
    { 
      metrica: 'Sesiones totales', 
      actual: comparativaData.sesionesTotales.estesMes.toLocaleString(),
      anterior: comparativaData.sesionesTotales.mesAnterior.toLocaleString(),
      delta: Math.abs(comparativaData.sesionesTotales.variacion).toFixed(2) + '%',
      up: comparativaData.sesionesTotales.variacion >= 0
    },
    { 
      metrica: 'Tiempo promedio de terminación de cursos', 
      actual: comparativaData.tiempoPromedioTerminacion.estesMes,
      anterior: comparativaData.tiempoPromedioTerminacion.mesAnterior,
      delta: Math.abs(comparativaData.tiempoPromedioTerminacion.variacion).toFixed(2) + '%',
      up: comparativaData.tiempoPromedioTerminacion.variacion >= 0
    },
    { 
      metrica: 'Cursos completados', 
      actual: comparativaData.cursosCompletados.estesMes.toLocaleString(),
      anterior: comparativaData.cursosCompletados.mesAnterior.toLocaleString(),
      delta: Math.abs(comparativaData.cursosCompletados.variacion).toFixed(2) + '%',
      up: comparativaData.cursosCompletados.variacion >= 0
    },
    { 
      metrica: 'Certificados Emitidos', 
      actual: comparativaData.certificadosEmitidos.estesMes.toLocaleString(),
      anterior: comparativaData.certificadosEmitidos.mesAnterior.toLocaleString(),
      delta: Math.abs(comparativaData.certificadosEmitidos.variacion).toFixed(2) + '%',
      up: comparativaData.certificadosEmitidos.variacion >= 0
    },
    { 
      metrica: 'Nuevos usuarios', 
      actual: comparativaData.nuevosUsuarios.estesMes.toLocaleString(),
      anterior: comparativaData.nuevosUsuarios.mesAnterior.toLocaleString(),
      delta: Math.abs(comparativaData.nuevosUsuarios.variacion).toFixed(2) + '%',
      up: comparativaData.nuevosUsuarios.variacion >= 0
    },
    { 
      metrica: 'Cursos con contenido pero sin inscripciones', 
      actual: comparativaData.cursosSinInscripcion.estesMes.toLocaleString(),
      anterior: comparativaData.cursosSinInscripcion.mesAnterior.toLocaleString(),
      delta: Math.abs(comparativaData.cursosSinInscripcion.variacion).toFixed(2) + '%',
      up: comparativaData.cursosSinInscripcion.variacion >= 0
    },
  ] : []

  return (
    <div className="p-6 space-y-6" style={{ backgroundColor: 'var(--color-background)' }}>
      <div>
        <h1 className="text-base font-semibold" style={{ color: 'var(--color-foreground)' }}>Resumen</h1>
        <p className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>Métricas de uso institucional</p>
      </div>

      {error && (
        <div className="p-4 rounded-lg border border-red-500 bg-red-50"
          style={{ borderColor: 'rgba(255, 0, 0, 0.5)', backgroundColor: 'rgba(255, 0, 0, 0.05)' }}>
          <p className="text-sm" style={{ color: 'rgb(220, 38, 38)' }}>{error}</p>
          {isFromCache && <p className="text-xs mt-2" style={{ color: 'rgb(220, 38, 38)' }}>Usando datos en caché</p>}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {kpiCards.map((s) => (
          <StatCard key={s.l} label={s.l} value={s.v} delta={s.delta} up={s.up} />
        ))}
      </div>

      <div className="border rounded-xl overflow-hidden shadow-sm transition-all duration-300 hover:shadow-md"
        style={{ borderColor: 'var(--color-border)' }}>
        <div className="p-4 transition-all duration-300" style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))', color: 'var(--color-text-on-dark)' }}>
          <p className="text-sm font-semibold uppercase tracking-wider">Tendencia de sesiones — últimos 7 días</p>
        </div>
        <div className="p-6" style={{ backgroundColor: 'var(--color-muted)' }}>
          {loadingCharts ? (
            <div className="h-48 bg-gray-200 rounded animate-pulse" style={{ backgroundColor: 'var(--color-border)' }} />
          ) : (
            <SessionLineChart data={tendencia.length > 0 ? tendencia : []} />
          )}
        </div>
      </div>

      <div className="border rounded-xl overflow-hidden shadow-sm transition-all duration-300 hover:shadow-md"
        style={{ borderColor: 'var(--color-border)' }}>
        <div className="p-4 transition-all duration-300" style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))', color: 'var(--color-text-on-dark)' }}>
          <p className="text-sm font-semibold uppercase tracking-wider">Sesiones por día</p>
        </div>
        <div className="p-6" style={{ backgroundColor: 'var(--color-muted)' }}>
          {loadingCharts ? (
            <div className="h-48 bg-gray-200 rounded animate-pulse" style={{ backgroundColor: 'var(--color-border)' }} />
          ) : (
            <div className="flex items-end justify-between gap-3 h-48 mt-4">
              {sesiones.map((s) => {
                const maxValue = Math.max(...sesiones.map(x => x.val), 1)
                return (
                  <div key={s.dia} className="flex-1 flex flex-col items-center gap-3 group">
                    <div
                      className="w-full rounded-sm group-hover:shadow-lg transition-all"
                      style={{ 
                        height: `${Math.max(15, (s.val / maxValue) * 160)}px`,
                        background: `linear-gradient(to top, var(--color-primary), var(--color-secondary))`,
                        minWidth: '24px'
                      }}
                    />
                    <span className="text-[11px] font-semibold" style={{ color: 'var(--color-foreground)' }}>{s.dia}</span>
                    <span className="text-xs font-bold" style={{ color: 'var(--color-primary)' }}>{s.val}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      <div className="border rounded-xl overflow-hidden shadow-sm transition-all duration-300 hover:shadow-md"
        style={{ borderColor: 'var(--color-border)' }}>
        <div className="p-4 transition-all duration-300" style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))', color: 'var(--color-text-on-dark)' }}>
          <p className="text-sm font-semibold uppercase tracking-wider">Comparativo mensual</p>
        </div>
        <div className="p-6" style={{ backgroundColor: 'var(--color-muted)' }}>
          <div className="overflow-x-auto">
            {loadingCharts ? (
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-12 bg-gray-200 rounded animate-pulse" style={{ backgroundColor: 'var(--color-border)' }} />
                ))}
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottomColor: 'var(--color-border)', borderBottomWidth: '1px' }}>
                    {['Métrica', 'Este mes', 'Anterior', 'Variación'].map((h) => (
                      <th key={h} className="text-left py-3 px-4 text-xs font-semibold" style={{ color: 'var(--color-muted-foreground)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {comparativo.map((r, i) => (
                    <tr key={r.metrica} style={{ borderBottomColor: 'var(--color-border)', borderBottomWidth: i === comparativo.length - 1 ? '0' : '1px' }}>
                      <td className="py-3 px-4 font-medium" style={{ color: 'var(--color-foreground)' }}>{r.metrica}</td>
                      <td className="py-3 px-4" style={{ color: 'var(--color-foreground)' }}>{r.actual}</td>
                      <td className="py-3 px-4" style={{ color: 'var(--color-muted-foreground)' }}>{r.anterior}</td>
                      <td className="py-3 px-4">
                        <span className={`text-sm font-bold ${r.up ? 'text-green-600' : 'text-red-600'}`}>
                          {r.up ? '↑' : '↓'} {r.delta}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
