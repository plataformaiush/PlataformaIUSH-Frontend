import { useState, useEffect } from 'react'
import axios from 'axios'
import { CourseListPage } from '../../courses/CourseListPage'
import { StatCard } from './shared/cards'

interface Curso {
  id: string
  titulo: string
  docente: string
  modulos: number
  estudiantes: number
  estado: string
  contenido: string
  inscripciones: string
}

interface CursosEstadisticas {
  cursosActivos: number
  conContenido: number
  sinContenido: number
  sinInscripciones: number
}

interface CursosViewResponse {
  success: boolean
  data: {
    estadisticas: CursosEstadisticas
    cursos: Curso[]
  }
}

const pillStyle: Record<string, string> = {
  Activo: 'bg-green-100 text-green-800',
  Inactivo: 'bg-gray-100 text-gray-700',
  'Con contenido': 'bg-blue-100 text-blue-800',
  'Sin contenido': 'bg-orange-100 text-orange-700',
  'Con inscripciones': 'bg-cyan-100 text-cyan-800',
  'Sin inscripciones': 'bg-yellow-100 text-yellow-800',
}

const PER_PAGE = 5

const statusFilters = [
  { id: 'Todos', label: 'Todos' },
  { id: 'Activo', label: 'Activo' },
  { id: 'Inactivo', label: 'Inactivo' }
]

const contentFilters = [
  { id: 'Todos', label: 'Todos' },
  { id: 'Con contenido', label: 'Con contenido' },
  { id: 'Sin contenido', label: 'Sin contenido' }
]

const enrollmentFilters = [
  { id: 'Todos', label: 'Todos' },
  { id: 'Con inscripciones', label: 'Con inscripciones' },
  { id: 'Sin inscripciones', label: 'Sin inscripciones' }
]

export function CursosView() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('Todos')
  const [contentFilter, setContentFilter] = useState('Todos')
  const [enrollmentFilter, setEnrollmentFilter] = useState('Todos')
  const [page, setPage] = useState(1)

  // Estado para datos del backend
  const [cursos, setCursos] = useState<Curso[]>([])
  const [estadisticas, setEstadisticas] = useState<CursosEstadisticas>({
    cursosActivos: 0,
    conContenido: 0,
    sinContenido: 0,
    sinInscripciones: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isFromCache, setIsFromCache] = useState(false)
  const [viewType, setViewTypeState] = useState<'resumen' | 'gestion'>(() => {
    const stored = localStorage.getItem('cursosViewType')
    return (stored as 'resumen' | 'gestion') || 'resumen'
  })

  const setViewType = (value: 'resumen' | 'gestion') => {
    setViewTypeState(value)
    localStorage.setItem('cursosViewType', value)
  }

  // Fetch de datos del backend
  useEffect(() => {
    const fetchCursos = async () => {
      try {
        setLoading(true)
        setError(null)
        setIsFromCache(false)
        const token = localStorage.getItem('token')
        
        if (!token) {
          setError('Token no encontrado. Por favor, inicia sesión.')
          return
        }

        const params = new URLSearchParams()
        
        // Mapear filtros UI a parámetros del API
        if (statusFilter !== 'Todos') {
          params.append('estado', statusFilter.toLowerCase())
        }
        if (contentFilter !== 'Todos') {
          const contenidoParam = contentFilter === 'Con contenido' ? 'con_contenido' : 'sin_contenido'
          params.append('contenido', contenidoParam)
        }
        if (enrollmentFilter !== 'Todos') {
          const inscripcionesParam = enrollmentFilter === 'Con inscripciones' ? 'con_inscripciones' : 'sin_inscripciones'
          params.append('inscripciones', inscripcionesParam)
        }

        const response = await axios.get<CursosViewResponse>(
          `http://localhost:3000/api/superadmin/cursosView?${params}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        )

        if (response.data.success) {
          setCursos(response.data.data.cursos)
          setEstadisticas(response.data.data.estadisticas)
          localStorage.setItem('cursosViewCache', JSON.stringify(response.data.data))
        }
      } catch (err) {
        const mensaje = axios.isAxiosError(err) 
          ? err.response?.data?.message || err.message 
          : 'Error desconocido'
        
        // Intentar cargar datos del caché
        const cachedData = localStorage.getItem('cursosViewCache')
        if (cachedData) {
          try {
            const parsed = JSON.parse(cachedData)
            setCursos(parsed.cursos)
            setEstadisticas(parsed.estadisticas)
            setIsFromCache(true)
            setError(`Error al cargar cursos: ${mensaje}. Mostrando últimos datos disponibles.`)
          } catch {
            setError(`Error al cargar cursos: ${mensaje}`)
          }
        } else {
          setError(`Error al cargar cursos: ${mensaje}`)
        }
        console.error('Error fetching cursos:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchCursos()
  }, [statusFilter, contentFilter, enrollmentFilter, page])

  const filtered = cursos.filter((c) => {
    const matchSearch = c.titulo.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'Todos' || c.estado === statusFilter
    const matchContent = contentFilter === 'Todos' || c.contenido === contentFilter
    const matchEnrollment = enrollmentFilter === 'Todos' || c.inscripciones === enrollmentFilter
    return matchSearch && matchStatus && matchContent && matchEnrollment
  })

  const pages = Math.max(1, Math.ceil(filtered.length / PER_PAGE))
  const slice = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  if (viewType === 'gestion') {
    return (
      <div>
        <div className="px-6 pt-4">
          <button
            onClick={() => setViewType('resumen')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border-2 text-sm font-semibold transition-all hover:scale-105"
            style={{ backgroundColor: 'var(--color-primary)', color: 'white', borderColor: 'var(--color-primary)' }}
          >
            ← Vista resumen
          </button>
        </div>
        <CourseListPage />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-4" style={{ backgroundColor: 'var(--color-background)' }}>
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-base font-semibold" style={{ color: 'var(--color-foreground)' }}>Cursos</h1>
          <p className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>{cursos.length} cursos en la plataforma</p>
        </div>
        <button
          onClick={() => setViewType('gestion')}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl border-2 transition-all hover:scale-105 shadow-lg"
          style={{ backgroundColor: 'var(--color-primary)', color: 'white', borderColor: 'var(--color-primary)' }}
        >
          Gestión de Cursos
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Cursos Activos" value={estadisticas.cursosActivos.toLocaleString()} />
        <StatCard label="Con contenido" value={estadisticas.conContenido.toLocaleString()} />
        <StatCard label="Sin contenido" value={estadisticas.sinContenido.toLocaleString()} />
        <StatCard label="Sin inscripciones" value={estadisticas.sinInscripciones.toLocaleString()} />
      </div>

      {/* Mostrar errores */}
      {error && (
        <div className="p-4 rounded-lg border border-red-500 bg-red-50"
          style={{ borderColor: 'rgba(255, 0, 0, 0.5)', backgroundColor: 'rgba(255, 0, 0, 0.05)' }}>
          <p className="text-sm" style={{ color: 'rgb(220, 38, 38)' }}>{error}</p>
          {isFromCache && <p className="text-xs mt-2" style={{ color: 'rgb(220, 38, 38)' }}>Usando datos en caché</p>}
        </div>
      )}

      {/* Loading state */}
      {loading && !cursos.length && (
        <div className="flex justify-center items-center py-12">
          <div className="text-sm" style={{ color: 'var(--color-muted-foreground)' }}>Cargando cursos...</div>
        </div>
      )}

      <div className="border rounded-xl overflow-hidden shadow-sm transition-all duration-300 hover:shadow-md"
        style={{
          borderColor: 'var(--color-border)'
        }}>
        <div className="p-4 transition-all duration-300" style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))', color: 'var(--color-text-on-dark)' }}>
          <p className="text-sm font-semibold uppercase tracking-wider">Listado de cursos</p>
        </div>
        <div className="p-8" style={{ backgroundColor: 'var(--color-muted)' }}>
          <input
            type="text"
            placeholder="Buscar curso..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="w-full text-sm px-3 py-2 border rounded-lg outline-none transition-all focus:ring-2"
            style={{
              borderColor: 'var(--color-border)',
              backgroundColor: 'var(--color-input)',
              color: 'var(--color-foreground)',
              '--tw-ring-color': 'var(--color-primary)'
            } as React.CSSProperties}
          />
          
          {/* Grupo 1: Estado (Activo/Inactivo) */}
          <div className="flex gap-2 flex-wrap mt-4 mb-4">
            {statusFilters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => { setStatusFilter(filter.id); setPage(1) }}
                className="text-xs px-4 py-2.5 rounded-lg border transition-all duration-200 font-medium hover:scale-105 active:scale-95"
                style={(statusFilter === filter.id) ? {
                  backgroundColor: 'var(--color-primary)',
                  borderColor: 'var(--color-primary)',
                  color: 'white',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                } : {
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-muted-foreground)',
                  backgroundColor: 'var(--color-input)'
                }}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {/* Grupo 2: Contenido */}
          <div className="flex gap-2 flex-wrap mb-4">
            {contentFilters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => { setContentFilter(filter.id); setPage(1) }}
                className="text-xs px-4 py-2.5 rounded-lg border transition-all duration-200 font-medium hover:scale-105 active:scale-95"
                style={(contentFilter === filter.id) ? {
                  backgroundColor: 'var(--color-primary)',
                  borderColor: 'var(--color-primary)',
                  color: 'white',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                } : {
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-muted-foreground)',
                  backgroundColor: 'var(--color-input)'
                }}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {/* Grupo 3: Inscripciones */}
          <div className="flex gap-2 flex-wrap mb-6">
            {enrollmentFilters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => { setEnrollmentFilter(filter.id); setPage(1) }}
                className="text-xs px-4 py-2.5 rounded-lg border transition-all duration-200 font-medium hover:scale-105 active:scale-95"
                style={(enrollmentFilter === filter.id) ? {
                  backgroundColor: 'var(--color-primary)',
                  borderColor: 'var(--color-primary)',
                  color: 'white',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                } : {
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-muted-foreground)',
                  backgroundColor: 'var(--color-input)'
                }}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Vista de tabla - Desktop/Tablet */}
        <div className="hidden md:block px-8 py-6" style={{ backgroundColor: 'var(--color-muted)' }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottomColor: 'var(--color-border)', borderBottomWidth: '1px' }}>
                {['Curso', 'Docente', 'Módulos', 'Estudiantes', 'Estado', 'Contenido', 'Inscripciones', ''].map((h) => (
                  <th key={h} className="text-left pb-2 text-xs font-medium" style={{ color: 'var(--color-muted-foreground)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="text-center py-6 text-sm" style={{ color: 'var(--color-muted-foreground)' }}>Cargando cursos...</td></tr>
              ) : slice.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-6 text-sm" style={{ color: 'var(--color-muted-foreground)' }}>Sin resultados</td></tr>
              ) : (
                slice.map((c) => (
                  <tr key={c.id} style={{ borderBottomColor: 'var(--color-border)', borderBottomWidth: '1px' }}>
                    <td className="py-2" style={{ color: 'var(--color-foreground)' }}>{c.titulo}</td>
                    <td className="py-2 text-xs" style={{ color: 'var(--color-muted-foreground)' }}>{c.docente}</td>
                    <td className="py-2 text-xs" style={{ color: 'var(--color-muted-foreground)' }}>{c.modulos}</td>
                    <td className="py-2 text-xs" style={{ color: 'var(--color-muted-foreground)' }}>{c.estudiantes}</td>
                    <td className="py-2">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${pillStyle[c.estado]}`}>{c.estado}</span>
                    </td>
                    <td className="py-2">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${pillStyle[c.contenido]}`}>{c.contenido}</span>
                    </td>
                    <td className="py-2">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${pillStyle[c.inscripciones]}`}>{c.inscripciones}</span>
                    </td>
                    <td className="py-2">
                      <button className="text-xs px-2 py-1 border rounded-lg" style={{
                        borderColor: 'var(--color-border)',
                        color: 'var(--color-muted-foreground)'
                      }}>Ver</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Vista de cards - Mobile */}
        <div className="md:hidden space-y-3 px-8 py-6" style={{ backgroundColor: 'var(--color-muted)' }}>
          {loading ? (
            <div className="text-center py-6 text-sm" style={{ color: 'var(--color-muted-foreground)' }}>Cargando cursos...</div>
          ) : slice.length === 0 ? (
            <div className="text-center py-6 text-sm" style={{ color: 'var(--color-muted-foreground)' }}>Sin resultados</div>
          ) : (
            slice.map((c) => (
              <div key={c.id} className="border rounded-lg p-4" style={{
                backgroundColor: 'var(--color-muted)',
                borderColor: 'var(--color-border)'
              }}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-sm" style={{ color: 'var(--color-foreground)' }}>{c.titulo}</p>
                    <p className="text-xs mt-1" style={{ color: 'var(--color-muted-foreground)' }}>Docente: {c.docente}</p>
                  </div>
                </div>
                <div className="flex gap-1 flex-wrap mb-3">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${pillStyle[c.estado]}`}>{c.estado}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${pillStyle[c.contenido]}`}>{c.contenido}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${pillStyle[c.inscripciones]}`}>{c.inscripciones}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <div>
                    <p className="text-[10px]" style={{ color: 'var(--color-muted-foreground)' }}>Módulos</p>
                    <p className="font-semibold text-sm" style={{ color: 'var(--color-foreground)' }}>{c.modulos}</p>
                  </div>
                  <div>
                    <p className="text-[10px]" style={{ color: 'var(--color-muted-foreground)' }}>Estudiantes</p>
                    <p className="font-semibold text-sm" style={{ color: 'var(--color-foreground)' }}>{c.estudiantes}</p>
                  </div>
                  <div className="text-right">
                    <button className="text-xs px-3 py-1.5 border rounded-lg w-full" style={{
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-primary)',
                      backgroundColor: 'transparent'
                    }}>Ver</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="flex justify-between items-center pt-3 px-8 pb-6 border-t border-border mt-2" style={{ backgroundColor: 'var(--color-muted)' }}>
          <span className="text-xs text-muted-foreground">
            {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, filtered.length)} de {filtered.length}
          </span>
          <div className="flex gap-1">
            {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className="text-xs w-7 h-7 rounded-lg border transition-all"
                style={page === p ? {
                  backgroundColor: 'var(--color-primary)',
                  borderColor: 'var(--color-primary)',
                  color: 'white'
                } : {
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-muted-foreground)'
                }}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
