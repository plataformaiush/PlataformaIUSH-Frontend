import { useState, useEffect } from 'react'
import axios from 'axios'
import { CourseListPage } from '../../courses/CourseListPage'
import { BookOpen, Users, TrendingUp, AlertCircle, Search, Eye } from 'lucide-react'

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

const pillStyle: Record<string, React.CSSProperties> = {
  Activo: { backgroundColor: '#AEEBF2', color: '#5A878C' },
  Inactivo: { backgroundColor: '#F3F4F6', color: '#6B7280' },
  'Con contenido': { backgroundColor: '#DBEAFE', color: '#1D4ED8' },
  'Sin contenido': { backgroundColor: '#FEF3C7', color: '#B45309' },
  'Con inscripciones': { backgroundColor: '#CFFAFE', color: '#0E7490' },
  'Sin inscripciones': { backgroundColor: '#FEF9C3', color: '#A16207' },
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
  const [selectedCurso, setSelectedCurso] = useState<Curso | null>(null)
  const [showModal, setShowModal] = useState(false)

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
    return <CourseListPage onBack={() => setViewType('resumen')} />
  }

  return (
    <main style={{ backgroundColor: '#FAFAFA', fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
      {/* Encabezado */}
      <div className="border-b" style={{ borderColor: '#E5E7EB', backgroundColor: '#FFFFFF' }}>
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl" style={{ backgroundColor: '#AEEBF2' }}>
                <BookOpen className="w-6 h-6" style={{ color: '#5A878C' }} />
              </div>
              <div>
                <h1 className="text-3xl font-bold" style={{ color: '#223740' }}>Cursos</h1>
                <p className="mt-1 text-sm" style={{ color: '#6B7280' }}>{cursos.length} cursos en la plataforma</p>
              </div>
            </div>
            <button
              onClick={() => setViewType('gestion')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all hover:opacity-90"
              style={{ backgroundColor: '#223740', color: '#FFFFFF' }}
            >
              Gestión de Cursos
            </button>
          </div>
        </div>
      </div>

      <div className="px-8 py-8">
        {/* Error Banner */}
        {error && (
          <div className="mb-6 p-4 rounded-xl border flex items-start gap-3" style={{ backgroundColor: '#FEF2F2', borderColor: '#FECACA' }}>
            <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" style={{ color: '#DC2626' }} />
            <div className="flex-1">
              <p className="text-sm font-medium" style={{ color: '#DC2626' }}>{error}</p>
              {isFromCache && <p className="text-xs mt-1" style={{ color: '#DC2626' }}>Usando datos en caché</p>}
            </div>
            <button onClick={() => setError(null)} className="ml-auto hover:opacity-70 transition-opacity text-lg leading-none" style={{ color: '#DC2626' }}>×</button>
          </div>
        )}

        {/* Tarjetas de estadísticas */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {([
            { label: 'Cursos Activos', value: estadisticas.cursosActivos, Icon: BookOpen },
            { label: 'Con contenido', value: estadisticas.conContenido, Icon: Users },
            { label: 'Sin contenido', value: estadisticas.sinContenido, Icon: TrendingUp },
            { label: 'Sin inscripciones', value: estadisticas.sinInscripciones, Icon: AlertCircle },
          ] as const).map(({ label, value, Icon }) => (
            <div key={label} className="p-6 rounded-2xl border" style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' }}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-medium" style={{ color: '#6B7280' }}>{label}</p>
                  <p className="text-3xl font-bold mt-1" style={{ color: '#223740' }}>{value.toLocaleString()}</p>
                </div>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#AEEBF2' }}>
                  <Icon className="w-6 h-6" style={{ color: '#5A878C' }} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Loading state */}
        {loading && !cursos.length && (
          <div className="flex justify-center items-center py-12">
            <div className="text-sm" style={{ color: '#6B7280' }}>Cargando cursos...</div>
          </div>
        )}

        {/* Tabla principal */}
        <div className="rounded-2xl border overflow-hidden" style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' }}>
          {/* Búsqueda y filtros */}
          <div className="px-6 py-4 border-b" style={{ borderColor: '#E5E7EB', backgroundColor: '#FAFAFA' }}>
            <div className="flex gap-4 items-center mb-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: '#9CA3AF', width: '20px', height: '20px' }} />
                <input
                  type="text"
                  placeholder="Buscar curso por título o docente..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border transition-all focus:outline-none focus:ring-2"
                  style={{ borderColor: '#E5E7EB', backgroundColor: '#FFFFFF', color: '#223740', fontSize: '14px' }}
                />
              </div>
              <div className="text-sm shrink-0" style={{ color: '#6B7280' }}>
                {filtered.length} {filtered.length === 1 ? 'curso' : 'cursos'}
              </div>
            </div>

            <div className="flex gap-3 flex-wrap">
              {/* Estado */}
              <div className="flex items-center rounded-xl p-1" style={{ backgroundColor: '#F3F4F6' }}>
                {statusFilters.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => { setStatusFilter(f.id); setPage(1) }}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${statusFilter === f.id ? 'bg-white shadow-sm' : ''}`}
                    style={{ color: statusFilter === f.id ? '#223740' : '#6B7280' }}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {/* Contenido */}
              <div className="flex items-center rounded-xl p-1" style={{ backgroundColor: '#F3F4F6' }}>
                {contentFilters.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => { setContentFilter(f.id); setPage(1) }}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${contentFilter === f.id ? 'bg-white shadow-sm' : ''}`}
                    style={{ color: contentFilter === f.id ? '#223740' : '#6B7280' }}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {/* Inscripciones */}
              <div className="flex items-center rounded-xl p-1" style={{ backgroundColor: '#F3F4F6' }}>
                {enrollmentFilters.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => { setEnrollmentFilter(f.id); setPage(1) }}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${enrollmentFilter === f.id ? 'bg-white shadow-sm' : ''}`}
                    style={{ color: enrollmentFilter === f.id ? '#223740' : '#6B7280' }}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Vista tabla - Desktop */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid #E5E7EB', backgroundColor: '#FAFAFA' }}>
                  {['Curso', 'Docente', 'Módulos', 'Estudiantes', 'Estado', 'Contenido', 'Inscripciones', ''].map((h) => (
                    <th key={h} className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider" style={{ color: '#6B7280' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={8} className="text-center py-12 text-sm" style={{ color: '#6B7280' }}>Cargando cursos...</td></tr>
                ) : slice.length === 0 ? (
                  <tr><td colSpan={8} className="text-center py-12 text-sm" style={{ color: '#6B7280' }}>Sin resultados</td></tr>
                ) : (
                  slice.map((c, idx) => (
                    <tr
                      key={c.id}
                      className="transition-colors hover:bg-gray-50"
                      style={{ borderBottom: idx !== slice.length - 1 ? '1px solid #E5E7EB' : 'none' }}
                    >
                      <td className="px-6 py-4 font-medium text-sm" style={{ color: '#223740' }}>{c.titulo}</td>
                      <td className="px-6 py-4 text-sm text-center" style={{ color: '#6B7280' }}>{c.docente}</td>
                      <td className="px-6 py-4 text-sm text-center" style={{ color: '#6B7280' }}>{c.modulos}</td>
                      <td className="px-6 py-4 text-sm text-center" style={{ color: '#6B7280' }}>{c.estudiantes}</td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-xs px-2 py-1 rounded-full font-medium" style={pillStyle[c.estado]}>{c.estado}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-xs px-2 py-1 rounded-full font-medium" style={pillStyle[c.contenido]}>{c.contenido}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-xs px-2 py-1 rounded-full font-medium" style={pillStyle[c.inscripciones]}>{c.inscripciones}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => { setSelectedCurso(c); setShowModal(true) }}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border transition-all hover:opacity-80 mx-auto"
                          style={{ borderColor: '#E5E7EB', backgroundColor: '#FFFFFF', color: '#6B7280' }}
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Vista cards - Mobile */}
          <div className="md:hidden space-y-4 px-6 py-4">
            {loading ? (
              <div className="text-center py-6 text-sm" style={{ color: '#6B7280' }}>Cargando cursos...</div>
            ) : slice.length === 0 ? (
              <div className="text-center py-6 text-sm" style={{ color: '#6B7280' }}>Sin resultados</div>
            ) : (
              slice.map((c) => (
                <div key={c.id} className="rounded-2xl border overflow-hidden transition-all hover:shadow-sm" style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' }}>
                  <div className="p-4">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#AEEBF2' }}>
                        <BookOpen className="w-5 h-5" style={{ color: '#5A878C' }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate" style={{ color: '#223740', fontSize: '14px' }}>{c.titulo}</p>
                        <p className="text-sm mt-1 truncate" style={{ color: '#6B7280' }}>Docente: {c.docente}</p>
                      </div>
                    </div>
                    <div className="flex gap-1 flex-wrap mb-3">
                      <span className="text-xs px-2 py-1 rounded-full font-medium" style={pillStyle[c.estado]}>{c.estado}</span>
                      <span className="text-xs px-2 py-1 rounded-full font-medium" style={pillStyle[c.contenido]}>{c.contenido}</span>
                      <span className="text-xs px-2 py-1 rounded-full font-medium" style={pillStyle[c.inscripciones]}>{c.inscripciones}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm" style={{ color: '#6B7280' }}>
                        <span>{c.modulos} módulos</span>
                        <span>{c.estudiantes} estudiantes</span>
                      </div>
                      <button
                        onClick={() => { setSelectedCurso(c); setShowModal(true) }}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border transition-all hover:opacity-80"
                        style={{ borderColor: '#E5E7EB', backgroundColor: '#FFFFFF', color: '#6B7280' }}
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Paginación */}
          <div className="flex justify-between items-center px-6 py-4 border-t" style={{ borderColor: '#E5E7EB', backgroundColor: '#FAFAFA' }}>
            <span className="text-sm" style={{ color: '#6B7280' }}>
              {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, filtered.length)} de {filtered.length}
            </span>
            <div className="flex gap-1 items-center">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="text-xs w-8 h-8 rounded-lg border transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ borderColor: page === 1 ? '#E5E7EB' : '#223740', color: page === 1 ? '#9CA3AF' : '#223740' }}
              >
                ←
              </button>

              {(() => {
                const maxVisible = 5
                let startPage = Math.max(1, page - Math.floor(maxVisible / 2))
                let endPage = Math.min(pages, startPage + maxVisible - 1)
                if (endPage - startPage + 1 < maxVisible) {
                  startPage = Math.max(1, endPage - maxVisible + 1)
                }
                const pageButtons = []
                if (startPage > 1) {
                  pageButtons.push(
                    <button key={1} onClick={() => setPage(1)} className="text-xs w-8 h-8 rounded-lg border transition-all" style={{ borderColor: '#E5E7EB', color: '#6B7280' }}>1</button>
                  )
                  if (startPage > 2) {
                    pageButtons.push(<span key="dots1" className="text-xs px-1" style={{ color: '#6B7280' }}>...</span>)
                  }
                }
                for (let p = startPage; p <= endPage; p++) {
                  pageButtons.push(
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className="text-xs w-8 h-8 rounded-lg border transition-all"
                      style={page === p ? { backgroundColor: '#223740', borderColor: '#223740', color: 'white' } : { borderColor: '#E5E7EB', color: '#6B7280' }}
                    >
                      {p}
                    </button>
                  )
                }
                if (endPage < pages) {
                  if (endPage < pages - 1) {
                    pageButtons.push(<span key="dots2" className="text-xs px-1" style={{ color: '#6B7280' }}>...</span>)
                  }
                  pageButtons.push(
                    <button key={pages} onClick={() => setPage(pages)} className="text-xs w-8 h-8 rounded-lg border transition-all" style={{ borderColor: '#E5E7EB', color: '#6B7280' }}>{pages}</button>
                  )
                }
                return pageButtons
              })()}

              <button
                onClick={() => setPage(Math.min(pages, page + 1))}
                disabled={page === pages}
                className="text-xs w-8 h-8 rounded-lg border transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ borderColor: page === pages ? '#E5E7EB' : '#223740', color: page === pages ? '#9CA3AF' : '#223740' }}
              >
                →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de detalles */}
      {showModal && selectedCurso && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => { setShowModal(false); setSelectedCurso(null) }}
        >
          <div
            className="rounded-2xl shadow-2xl max-w-md w-full p-6 border"
            style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB', maxHeight: '90vh', overflowY: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold" style={{ color: '#223740' }}>Detalles del Curso</h2>
              <button
                onClick={() => { setShowModal(false); setSelectedCurso(null) }}
                className="text-2xl font-bold transition-all hover:opacity-60 leading-none"
                style={{ color: '#6B7280' }}
              >
                ×
              </button>
            </div>

            <div className="space-y-3">
              {[
                { label: 'TÍTULO', value: selectedCurso.titulo, mono: false },
                { label: 'DOCENTE', value: selectedCurso.docente, mono: false },
                { label: 'ID', value: selectedCurso.id, mono: true },
              ].map(({ label, value, mono }) => (
                <div key={label} className="p-4 rounded-xl" style={{ backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB' }}>
                  <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: '#6B7280' }}>{label}</p>
                  <p className={`text-sm font-medium break-all ${mono ? 'font-mono' : ''}`} style={{ color: '#223740' }}>{value}</p>
                </div>
              ))}

              {[
                { label: 'ESTADO', value: selectedCurso.estado },
                { label: 'CONTENIDO', value: selectedCurso.contenido },
                { label: 'INSCRIPCIONES', value: selectedCurso.inscripciones },
              ].map(({ label, value }) => (
                <div key={label} className="p-4 rounded-xl" style={{ backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB' }}>
                  <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#6B7280' }}>{label}</p>
                  <span className="text-xs px-3 py-1 rounded-full font-medium inline-block" style={pillStyle[value]}>{value}</span>
                </div>
              ))}

              {[
                { label: 'MÓDULOS', value: selectedCurso.modulos },
                { label: 'ESTUDIANTES INSCRITOS', value: selectedCurso.estudiantes },
              ].map(({ label, value }) => (
                <div key={label} className="p-4 rounded-xl" style={{ backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB' }}>
                  <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: '#6B7280' }}>{label}</p>
                  <p className="text-2xl font-bold" style={{ color: '#223740' }}>{value}</p>
                </div>
              ))}
            </div>

            <div className="mt-6">
              <button
                onClick={() => { setShowModal(false); setSelectedCurso(null) }}
                className="w-full px-4 py-3 text-sm font-semibold rounded-xl transition-all hover:opacity-90"
                style={{ backgroundColor: '#223740', color: 'white' }}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
