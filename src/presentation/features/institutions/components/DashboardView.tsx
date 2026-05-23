import { useState, useEffect } from 'react'
import { axiosInstance } from '../../../features/student/auth/services/authService'
import { SessionsChart, ContentPieChart, completarDatosSemana } from './shared/charts'
import { StatCard, AlertCard } from './shared/cards'
import type { SesionDia } from './shared/charts/chartUtils'

// Tipos TypeScript
interface KPIData {
  total: number
  variacion?: number
  inactivos?: number
}

interface Tarjetas {
  estudiantes: KPIData
  docentes: KPIData
  cursos: KPIData
  contenidos: KPIData
}

interface ElementosAtencion {
  docentesInactivos: number
  cursosSinInscripciones: number
  cursosSinContenido: number
}

interface ContenidoTipo {
  tipo: string
  cantidad: number
  porcentaje: number
}

interface TopCurso {
  id: string
  titulo: string
  docente: string
  completitud: number
  estudiantes: number
}

interface TopDocente {
  id: string
  nombre: string
  estudiantes: number
  cursos: number
}

interface Graficos {
  sesionesSemana: SesionDia[]
  contenidoPorTipo: ContenidoTipo[]
  topCursos: TopCurso[]
  topDocentes: TopDocente[]
}

interface DashboardData {
  tarjetas: Tarjetas
  elementosAtencion: ElementosAtencion
  graficos: Graficos
}

interface DashboardResponse {
  success: boolean
  data: DashboardData
}

export function DashboardView() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await axiosInstance.get<DashboardResponse>('/api/superadmin/dashboardControl')
        if (response.data.success && response.data.data) {
          setDashboard(response.data.data)
        } else {
          throw new Error('Respuesta inválida del servidor')
        }
      } catch (err) {
        const message = (err as any)?.response?.data?.message || 
                        (err instanceof Error ? err.message : 'Error desconocido')
        setError(message)
        console.error('Error cargando dashboard:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboard()
  }, [])

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen" style={{ backgroundColor: 'var(--color-background)' }}>
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: 'var(--color-primary)' }}></div>
          <p className="mt-4" style={{ color: 'var(--color-muted-foreground)' }}>Cargando panel de control...</p>
        </div>
      </div>
    )
  }

  if (error || !dashboard) {
    return (
      <div className="p-6" style={{ backgroundColor: 'var(--color-background)' }}>
        <div className="rounded-lg border-2 border-red-500 bg-red-50 p-6" style={{ borderColor: 'var(--color-destructive)', backgroundColor: 'var(--color-muted)' }}>
          <p style={{ color: 'var(--color-destructive)' }}>Error: {error || 'No se pudo cargar el dashboard'}</p>
        </div>
      </div>
    )
  }

  // Construir datos de tarjetas KPI
  const stats = [
    {
      label: 'Estudiantes',
      value: dashboard.tarjetas.estudiantes.total.toLocaleString(),
      delta: `${dashboard.tarjetas.estudiantes.variacion! > 0 ? '+' : ''}${dashboard.tarjetas.estudiantes.variacion} este mes`,
      up: dashboard.tarjetas.estudiantes.variacion! > 0
    },
    {
      label: 'Docentes',
      value: dashboard.tarjetas.docentes.total,
      delta: `${dashboard.tarjetas.docentes.inactivos} inactivos`,
      up: dashboard.tarjetas.docentes.inactivos! < 5
    },
    {
      label: 'Cursos activos',
      value: dashboard.tarjetas.cursos.total,
      delta: `${dashboard.tarjetas.cursos.variacion! > 0 ? '+' : ''}${dashboard.tarjetas.cursos.variacion} este mes`,
      up: dashboard.tarjetas.cursos.variacion! > 0
    },
    {
      label: 'Contenidos',
      value: dashboard.tarjetas.contenidos.total.toLocaleString(),
      delta: `${dashboard.tarjetas.contenidos.variacion! > 0 ? '+' : ''}${dashboard.tarjetas.contenidos.variacion} este mes`,
      up: dashboard.tarjetas.contenidos.variacion! > 0
    }
  ]

  return (
    <div className="p-6 space-y-6" style={{ backgroundColor: 'var(--color-background)' }}>
      <div>
        <h1 className="text-base font-semibold" style={{ color: 'var(--color-foreground)' }}>Panel de control</h1>
        <p className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>Bienvenido, últimas 24 horas</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((s) => (
          <StatCard
            key={s.label}
            label={s.label}
            value={s.value}
            delta={s.delta}
            up={s.up}
          />
        ))}
      </div>

      {/* Alertas de atención */}
      <AlertCard
        title="Elementos que requieren atención"
        description="Hay algunos problemas que podrían afectar la plataforma"
        items={[
          { label: 'Docentes inactivos', value: dashboard.elementosAtencion.docentesInactivos },
          { label: 'Cursos sin inscripciones', value: dashboard.elementosAtencion.cursosSinInscripciones },
          { label: 'Cursos sin contenido', value: dashboard.elementosAtencion.cursosSinContenido }
        ]}
      />

      {/* Charts Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Sessions Chart */}
        <div className="border rounded-xl overflow-hidden shadow-sm transition-all duration-300 hover:shadow-md" 
          style={{ borderColor: 'var(--color-border)' }}>
          <div className="p-4 transition-all duration-300" style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))', color: 'var(--color-text-on-dark)' }}>
            <p className="text-sm font-semibold uppercase tracking-wider">Sesiones semanales</p>
          </div>
          <div className="p-6" style={{ backgroundColor: 'var(--color-muted)' }}>
            <SessionsChart data={completarDatosSemana(dashboard.graficos.sesionesSemana)} />
          </div>
        </div>

        {/* Content Pie Chart */}
        <div className="border rounded-xl overflow-hidden shadow-sm transition-all duration-300 hover:shadow-md"
          style={{ borderColor: 'var(--color-border)' }}>
          <div className="p-4 transition-all duration-300" style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))', color: 'var(--color-text-on-dark)' }}>
            <p className="text-sm font-semibold uppercase tracking-wider">Tipo de contenido</p>
          </div>
          <div className="p-6" style={{ backgroundColor: 'var(--color-muted)' }}>
            <ContentPieChart data={dashboard.graficos.contenidoPorTipo} />
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Top Courses */}
        <div className="border rounded-xl overflow-hidden shadow-sm transition-all duration-300 hover:shadow-md"
          style={{ borderColor: 'var(--color-border)' }}>
          <div className="p-4 transition-all duration-300" style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))', color: 'var(--color-text-on-dark)' }}>
            <p className="text-sm font-semibold uppercase tracking-wider">Cursos con mayor completitud</p>
          </div>
          <div className="p-6" style={{ backgroundColor: 'var(--color-muted)' }}>
            <div className="space-y-4">
              {dashboard.graficos.topCursos.map((c, idx) => (
                <div key={c.id} className="group p-3 rounded-lg transition-all duration-200 hover:bg-muted/40 cursor-pointer">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs font-medium flex-1 truncate" style={{ color: 'var(--color-foreground)' }}>{idx + 1}. {c.titulo}</span>
                    <span className="text-xs font-bold px-2 py-1 rounded-md transition-all duration-200 group-hover:scale-110" style={{ color: 'var(--color-primary)', backgroundColor: 'var(--color-primary)15' }}>{c.completitud}%</span>
                  </div>
                  <p className="text-[10px] mb-2" style={{ color: 'var(--color-muted-foreground)' }}>{c.estudiantes} estudiantes</p>
                  <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-tertiary)' }}>
                    <div className="h-full rounded-full transition-all duration-500" style={{ 
                      background: `linear-gradient(to right, var(--color-primary), var(--color-secondary))`,
                      width: `${c.completitud}%`,
                      boxShadow: `0 0 10px rgba(0, 0, 0, 0.1)`
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Teachers */}
        <div className="border rounded-xl overflow-hidden shadow-sm transition-all duration-300 hover:shadow-md"
          style={{ borderColor: 'var(--color-border)' }}>
          <div className="p-4 transition-all duration-300" style={{ background: 'linear-gradient(135deg, var(--color-secondary), var(--color-primary))', color: 'var(--color-text-on-dark)' }}>
            <p className="text-sm font-semibold uppercase tracking-wider">Top docentes</p>
          </div>
          <div className="p-6" style={{ backgroundColor: 'var(--color-muted)' }}>
            <div className="space-y-4">
              {dashboard.graficos.topDocentes.map((d, idx) => (
                <div key={d.id} className="group p-3 rounded-lg transition-all duration-200 hover:bg-muted/40 cursor-pointer border" style={{ borderColor: 'var(--color-border)' }}>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-xs font-semibold" style={{ color: 'var(--color-foreground)' }}>{idx + 1}. {d.nombre}</p>
                      <p className="text-[10px] mt-1" style={{ color: 'var(--color-muted-foreground)' }}>{d.cursos} {d.cursos === 1 ? 'curso' : 'cursos'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold" style={{ color: 'var(--color-secondary)' }}>{d.estudiantes}</p>
                      <p className="text-[10px]" style={{ color: 'var(--color-muted-foreground)' }}>estudiantes</p>
                    </div>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-tertiary)' }}>
                    <div className="h-full rounded-full transition-all duration-500" style={{ 
                      background: `linear-gradient(to right, var(--color-secondary), var(--color-primary))`,
                      width: `${(d.estudiantes / Math.max(...dashboard.graficos.topDocentes.map(x => x.estudiantes))) * 100}%`,
                      boxShadow: `0 0 10px rgba(0, 0, 0, 0.1)`
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
