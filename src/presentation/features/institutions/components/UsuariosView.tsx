import { useState, useEffect } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import axios from 'axios'
import { useUsersViewPreference } from '../../../../context/UsersViewPreferenceContext'
import { StatCard } from './shared/cards'

interface Usuario {
  id: string
  nombre: string
  correo: string
  rol: string
  estado: string
  ultimoAcceso: string | null
}

interface UsuariosResponse {
  success: boolean
  data: {
    estadisticas: {
      usuariosActivos: number
      estudiantes: number
      docentes: number
    }
    usuarios: Usuario[]
  }
}

const pillStyle: Record<string, string> = {
  Activo: 'bg-green-100 text-green-800',
  Inactivo: 'bg-muted text-muted-foreground',
  Pendiente: 'bg-amber-100 text-amber-700',
  Estudiante: 'bg-secondary/20 text-secondary',
  Docente: 'bg-primary/10 text-primary',
}

const roleColors: Record<string, { bg: string; text: string }> = {
  Estudiante: { bg: 'var(--color-secondary)', text: 'var(--color-text-on-dark)' },
  Docente: { bg: 'var(--color-primary)', text: 'var(--color-text-on-dark)' },
  Admin: { bg: 'var(--color-tertiary)', text: 'var(--color-foreground)' },
  SuperAdmin: { bg: 'var(--color-foreground)', text: 'var(--color-text-on-dark)' },
}

const getRoleColor = (rol: string) => {
  return roleColors[rol] || { bg: 'var(--color-muted)', text: 'var(--color-muted-foreground)' }
}

const PER_PAGE = 10

// Función para formatear el último acceso
const formatLastAccess = (ultimoAcceso: string | null): string => {
  if (!ultimoAcceso) return 'Nunca'
  try {
    return formatDistanceToNow(new Date(ultimoAcceso), {
      addSuffix: true,
      locale: es
    })
  } catch {
    return 'Desconocido'
  }
}

export function UsuariosView() {
  const [search, setSearch] = useState('')
  const [rolFilter, setRolFilter] = useState('Todos')
  const [page, setPage] = useState(1)
  const { viewType, setViewType } = useUsersViewPreference()

  // Estado para datos del backend
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [estadisticas, setEstadisticas] = useState({
    usuariosActivos: 0,
    estudiantes: 0,
    docentes: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filtroEstado, setFiltroEstado] = useState<string>('')
  const [selectedUser, setSelectedUser] = useState<Usuario | null>(null)
  const [isFromCache, setIsFromCache] = useState(false)

  // Configuración de filtros de rol disponibles
  const roleFilters = [
    { id: 'Todos', label: 'Todos' },
    { id: 'Estudiante', label: 'Estudiantes' },
    { id: 'Docente', label: 'Docentes' },
    { id: 'Admin', label: 'Administradores' }
  ]

  const statusFilters = [
    { id: 'Todos', label: 'Todos' },
    { id: 'Activo', label: 'Activo' },
    { id: 'Inactivo', label: 'Inactivo' }
  ]

  // Fetch de datos del backend
  useEffect(() => {
    const fetchUsuarios = async () => {
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
        if (filtroEstado) params.append('estado', filtroEstado.toLowerCase())
        if (rolFilter !== 'Todos') params.append('rol', rolFilter.toLowerCase())
        params.append('page', page.toString())
        params.append('limit', PER_PAGE.toString())

        const response = await axios.get<UsuariosResponse>(
          `http://localhost:3000/api/superadmin/usuariosView?${params}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        )

        if (response.data.success) {
          setUsuarios(response.data.data.usuarios)
          setEstadisticas(response.data.data.estadisticas)
          localStorage.setItem('usuariosViewCache', JSON.stringify(response.data.data))
        }
      } catch (err) {
        const mensaje = axios.isAxiosError(err) 
          ? err.response?.data?.message || err.message 
          : 'Error desconocido'
        
        // Intentar cargar datos del caché
        const cachedData = localStorage.getItem('usuariosViewCache')
        if (cachedData) {
          try {
            const parsed = JSON.parse(cachedData)
            setUsuarios(parsed.usuarios)
            setEstadisticas(parsed.estadisticas)
            setIsFromCache(true)
            setError(`Error al cargar usuarios: ${mensaje}. Mostrando últimos datos disponibles.`)
          } catch {
            setError(`Error al cargar usuarios: ${mensaje}`)
          }
        } else {
          setError(`Error al cargar usuarios: ${mensaje}`)
        }
        console.error('Error fetching usuarios:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchUsuarios()
  }, [rolFilter, filtroEstado, page])

  const filtered = usuarios.filter((u) => {
    const matchSearch = u.nombre.toLowerCase().includes(search.toLowerCase()) ||
                        u.correo.toLowerCase().includes(search.toLowerCase())
    const matchRol = rolFilter === 'Todos' || u.rol.includes(rolFilter)
    return matchSearch && matchRol
  })

  const pages = Math.max(1, Math.ceil(filtered.length / PER_PAGE))
  const slice = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  return (
    <div className="p-6 space-y-4" style={{ backgroundColor: 'var(--color-background)' }}>
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-base font-semibold" style={{ color: 'var(--color-foreground)' }}>Usuarios</h1>
          <p className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>{estadisticas.usuariosActivos.toLocaleString()} usuarios activos</p>
        </div>
        <button
          onClick={() => setViewType(viewType === 'original' ? 'management' : 'original')}
          className="group relative inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl border-2 transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
          style={{
            backgroundColor: 'var(--color-primary)',
            color: 'white',
            borderColor: 'var(--color-primary)'
          }}
          title={`Cambiar a vista ${viewType === 'original' ? 'de gestión' : 'original'}`}
        >
          Cambiar Vista
        </button>
      </div>

      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <StatCard label="Usuarios Activos" value={estadisticas.usuariosActivos.toLocaleString()} />
        <StatCard label="Estudiantes" value={estadisticas.estudiantes.toLocaleString()} />
        <StatCard label="Docentes" value={estadisticas.docentes.toLocaleString()} />
      </div>

      {/* Mostrar errores */}
      {error && (
        <div className="p-4 rounded-lg border border-red-500 bg-red-50"
          style={{ borderColor: 'rgba(255, 0, 0, 0.5)', backgroundColor: 'rgba(255, 0, 0, 0.05)' }}>
          <p className="text-sm" style={{ color: 'rgb(220, 38, 38)' }}>{error}</p>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="text-sm" style={{ color: 'var(--color-muted-foreground)' }}>Cargando usuarios...</div>
        </div>
      )}

      <div className="border rounded-xl overflow-hidden shadow-sm transition-all duration-300 hover:shadow-md"
        style={{
          borderColor: 'var(--color-border)'
        }}>
        <div className="p-4 transition-all duration-300" style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))', color: 'var(--color-text-on-dark)' }}>
          <p className="text-sm font-semibold uppercase tracking-wider">Listado de usuarios</p>
        </div>
        <div className="p-8" style={{ backgroundColor: 'var(--color-muted)' }}>
          <input
            type="text"
            placeholder="Buscar usuario por nombre o correo..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="w-full text-sm px-3 py-2 border rounded-lg outline-none transition-all focus:ring-2"
            style={{
              borderColor: 'var(--color-border)',
              backgroundColor: 'var(--color-input)',
              color: 'var(--color-muted-foreground)',
              '--tw-ring-color': 'var(--color-primary)'
            } as React.CSSProperties}
          />
          <div className="flex gap-2 flex-wrap mt-4 mb-4">
            {roleFilters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => { setRolFilter(filter.id); setPage(1) }}
                className="text-xs px-4 py-2.5 rounded-lg border-2 transition-all duration-200 font-semibold hover:scale-105 active:scale-95"
                style={(rolFilter === filter.id) ? {
                  backgroundColor: 'var(--color-primary)',
                  borderColor: 'var(--color-primary)',
                  color: 'white',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)'
                } : {
                  borderColor: 'var(--color-primary)',
                  color: 'var(--color-primary)',
                  backgroundColor: 'transparent',
                  borderWidth: '2px'
                }}
              >
                {filter.label}
              </button>
            ))}
          </div>

          <div className="flex gap-2 flex-wrap mb-6">
            {statusFilters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => { setFiltroEstado(filter.id === 'Todos' ? '' : filter.id); setPage(1) }}
                className="text-xs px-4 py-2.5 rounded-lg border-2 transition-all duration-200 font-semibold hover:scale-105 active:scale-95"
                style={((filtroEstado === '' && filter.id === 'Todos') || (filtroEstado === filter.id)) ? {
                  backgroundColor: 'var(--color-primary)',
                  borderColor: 'var(--color-primary)',
                  color: 'white',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)'
                } : {
                  borderColor: 'var(--color-primary)',
                  color: 'var(--color-primary)',
                  backgroundColor: 'transparent',
                  borderWidth: '2px'
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
                {['Nombre', 'Correo', 'Rol', 'Estado', 'Último acceso', ''].map((h) => (
                  <th key={h} className="text-left px-2 pb-2 text-xs font-medium" style={{ color: 'var(--color-muted-foreground)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center py-6 text-sm" style={{ color: 'var(--color-muted-foreground)' }}>Cargando usuarios...</td></tr>
              ) : slice.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-6 text-sm" style={{ color: 'var(--color-muted-foreground)' }}>Sin resultados</td></tr>
              ) : (
                slice.map((u) => (
                  <tr key={u.id} style={{ borderBottomColor: 'var(--color-border)', borderBottomWidth: '1px' }}>
                    <td className="px-2 py-2" style={{ color: 'var(--color-foreground)' }}>{u.nombre}</td>
                    <td className="px-2 py-2 text-xs" style={{ color: 'var(--color-muted-foreground)' }}>{u.correo}</td>
                    <td className="px-2 py-2">
                      <span className="text-[11px] px-3 py-1 rounded-full font-semibold" style={{
                        backgroundColor: getRoleColor(u.rol).bg,
                        color: getRoleColor(u.rol).text,
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
                      }}>{u.rol}</span>
                    </td>
                    <td className="px-2 py-2">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${pillStyle[u.estado] || 'bg-gray-100 text-gray-800'}`}>{u.estado}</span>
                    </td>
                    <td className="px-2 py-2 text-xs" style={{ color: 'var(--color-muted-foreground)' }}>{formatLastAccess(u.ultimoAcceso)}</td>
                    <td className="px-2 py-2">
                      <button 
                        onClick={() => setSelectedUser(u)}
                        className="text-xs px-2 py-1 border rounded-lg transition-all hover:bg-primary hover:text-white"
                        style={{
                          borderColor: 'var(--color-border)',
                          color: 'var(--color-muted-foreground)'
                        }}
                      >
                        Ver
                      </button>
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
            <div className="text-center py-6 text-sm" style={{ color: 'var(--color-muted-foreground)' }}>Cargando usuarios...</div>
          ) : slice.length === 0 ? (
            <div className="text-center py-6 text-sm" style={{ color: 'var(--color-muted-foreground)' }}>Sin resultados</div>
          ) : (
            slice.map((u) => (
              <div key={u.id} className="border rounded-lg p-4" style={{
                backgroundColor: 'var(--color-muted)',
                borderColor: 'var(--color-border)'
              }}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-sm" style={{ color: 'var(--color-foreground)' }}>{u.nombre}</p>
                    <p className="text-[10px]" style={{ color: 'var(--color-muted-foreground)' }}>{u.correo}</p>
                    <div className="flex gap-2 mt-1">
                      <span className="text-[11px] px-3 py-1 rounded-full font-semibold" style={{
                        backgroundColor: getRoleColor(u.rol).bg,
                        color: getRoleColor(u.rol).text,
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
                      }}>{u.rol}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${pillStyle[u.estado] || 'bg-gray-100 text-gray-800'}`}>{u.estado}</span>
                    </div>
                  </div>
                </div>
                <div className="mb-3">
                  <p className="text-[10px]" style={{ color: 'var(--color-muted-foreground)' }}>Último acceso</p>
                  <p className="text-xs mt-1" style={{ color: 'var(--color-foreground)' }}>{formatLastAccess(u.ultimoAcceso)}</p>
                </div>
                <button 
                  onClick={() => setSelectedUser(u)}
                  className="w-full text-xs px-3 py-1.5 border rounded-lg transition-all hover:bg-primary hover:text-white"
                  style={{
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-primary)',
                    backgroundColor: 'transparent'
                  }}
                >
                  Ver
                </button>
              </div>
            ))
          )}
        </div>

        <div className="flex justify-between items-center pt-3 px-8 pb-6 border-t border-border mt-2" style={{ backgroundColor: 'var(--color-muted)' }}>
          <span className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>
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
                  color: 'white',
                  borderColor: 'var(--color-primary)'
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

      {/* Modal - Detalles del usuario */}
      {selectedUser && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedUser(null)}
        >
          <div 
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full p-6 border"
            style={{
              backgroundColor: 'var(--color-background)',
              borderColor: 'var(--color-border)',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header del Modal */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold" style={{ color: 'var(--color-foreground)' }}>
                Detalles del Usuario
              </h2>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-2xl font-bold transition-all hover:scale-110"
                style={{ color: 'var(--color-muted-foreground)' }}
              >
                ×
              </button>
            </div>

            {/* Contenido del Modal */}
            <div className="space-y-5">
              {/* Nombre */}
              <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--color-muted)' }}>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--color-muted-foreground)' }}>
                  NOMBRE
                </p>
                <p className="text-sm font-semibold" style={{ color: 'var(--color-foreground)' }}>
                  {selectedUser.nombre}
                </p>
              </div>

              {/* Correo */}
              <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--color-muted)' }}>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--color-muted-foreground)' }}>
                  CORREO
                </p>
                <p className="text-sm font-semibold break-all" style={{ color: 'var(--color-foreground)' }}>
                  {selectedUser.correo}
                </p>
              </div>

              {/* ID */}
              <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--color-muted)' }}>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--color-muted-foreground)' }}>
                  ID
                </p>
                <p className="text-xs font-mono break-all" style={{ color: 'var(--color-foreground)' }}>
                  {selectedUser.id}
                </p>
              </div>

              {/* Rol */}
              <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--color-muted)' }}>
                <p className="text-xs font-medium mb-2" style={{ color: 'var(--color-muted-foreground)' }}>
                  ROL
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedUser.rol.split(',').map((r, i) => (
                    <span 
                      key={i}
                      className="text-xs px-3 py-1.5 rounded-full font-medium"
                      style={{
                        backgroundColor: r.includes('Estudiante') ? 'var(--color-secondary)' : 'var(--color-primary)',
                        color: 'white',
                        opacity: 0.8
                      }}
                    >
                      {r.trim()}
                    </span>
                  ))}
                </div>
              </div>

              {/* Estado */}
              <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--color-muted)' }}>
                <p className="text-xs font-medium mb-2" style={{ color: 'var(--color-muted-foreground)' }}>
                  ESTADO
                </p>
                <span 
                  className={`text-xs px-3 py-1.5 rounded-full font-medium inline-block ${pillStyle[selectedUser.estado] || 'bg-gray-100 text-gray-800'}`}
                >
                  {selectedUser.estado}
                </span>
              </div>

              {/* Último acceso */}
              <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--color-muted)' }}>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--color-muted-foreground)' }}>
                  ÚLTIMO ACCESO
                </p>
                <p className="text-sm font-semibold" style={{ color: 'var(--color-foreground)' }}>
                  {formatLastAccess(selectedUser.ultimoAcceso)}
                </p>
                {selectedUser.ultimoAcceso && (
                  <p className="text-xs mt-1" style={{ color: 'var(--color-muted-foreground)' }}>
                    {new Date(selectedUser.ultimoAcceso).toLocaleString('es-ES')}
                  </p>
                )}
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex gap-3 mt-6 pt-6 border-t" style={{ borderColor: 'var(--color-border)' }}>
              <button
                onClick={() => setSelectedUser(null)}
                className="w-full px-4 py-2 rounded-lg text-sm font-medium transition-all"
                style={{
                  backgroundColor: 'var(--color-primary)',
                  color: 'white'
                }}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}