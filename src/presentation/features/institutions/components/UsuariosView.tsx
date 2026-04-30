import { useState } from 'react'

const allUsers = [
  { nombre: 'Ana García', rol: 'Estudiante', estado: 'Activo', acceso: 'Hoy, 10:32' },
  { nombre: 'Carlos Ruiz', rol: 'Docente', estado: 'Activo', acceso: 'Hoy, 09:15' },
  { nombre: 'Laura Mora', rol: 'Estudiante', estado: 'Inactivo', acceso: 'Hace 5 días' },
  { nombre: 'Pedro Suárez', rol: 'Docente', estado: 'Activo', acceso: 'Ayer, 16:40' },
  { nombre: 'Sofía Vargas', rol: 'Estudiante', estado: 'Activo', acceso: 'Hoy, 08:50' },
  { nombre: 'Luis Gómez', rol: 'Docente', estado: 'Pendiente', acceso: 'Hace 2 días' },
  { nombre: 'María Torres', rol: 'Estudiante', estado: 'Activo', acceso: 'Hoy, 07:20' },
  { nombre: 'Roberto Díaz', rol: 'Estudiante', estado: 'Inactivo', acceso: 'Hace 10 días' },
]

const pillStyle: Record<string, string> = {
  Activo: 'bg-green-100 text-green-800',
  Inactivo: 'bg-muted text-muted-foreground',
  Pendiente: 'bg-amber-100 text-amber-700',
  Estudiante: 'bg-secondary/20 text-secondary',
  Docente: 'bg-primary/10 text-primary',
}

const PER_PAGE = 5

export function UsuariosView() {
  const [search, setSearch] = useState('')
  const [rolFilter, setRolFilter] = useState('Todos')
  const [page, setPage] = useState(1)

  const filtered = allUsers.filter((u) => {
    const matchSearch = u.nombre.toLowerCase().includes(search.toLowerCase())
    const matchRol = rolFilter === 'Todos' || u.rol === rolFilter
    return matchSearch && matchRol
  })

  const pages = Math.max(1, Math.ceil(filtered.length / PER_PAGE))
  const slice = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  return (
    <div className="p-6 space-y-4" style={{ backgroundColor: 'var(--color-background)' }}>
      <div>
        <h1 className="text-base font-semibold" style={{ color: 'var(--color-foreground)' }}>Usuarios</h1>
        <p className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>1,332 usuarios registrados</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {[['Total', '1,332'], ['Estudiantes', '1,284'], ['Docentes', '48']].map(([l, v]) => (
          <div key={l} className="group relative overflow-hidden rounded-xl border transition-all duration-300 cursor-pointer hover:scale-105 hover:shadow-xl"
            style={{
              background: 'white',
              borderColor: 'var(--color-border)',
              overflow: 'hidden'
            }}>
            {/* Header con color primario */}
            <div className="w-full p-3 transition-all duration-300"
              style={{ 
                background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
                color: 'white'
              }}>
              <p className="text-sm font-semibold uppercase tracking-wider">{l}</p>
            </div>
            
            {/* Body blanco */}
            <div className="p-5">
              <p className="text-4xl font-bold transition-all duration-300 group-hover:scale-105 origin-left" style={{ color: 'var(--color-primary)' }}>{v}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="border rounded-xl overflow-hidden shadow-sm transition-all duration-300 hover:shadow-md"
        style={{
          borderColor: 'var(--color-border)'
        }}>
        <div className="p-4 transition-all duration-300" style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))', color: 'white' }}>
          <p className="text-sm font-semibold uppercase tracking-wider">Listado de usuarios</p>
        </div>
        <div className="p-8" style={{ backgroundColor: 'white' }}>
          <input
            type="text"
            placeholder="Buscar usuario..."
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
          <div className="flex gap-1 flex-wrap mt-4 mb-6">
            {['Todos', 'Estudiante', 'Docente'].map((f) => (
              <button
                key={f}
                onClick={() => { setRolFilter(f); setPage(1) }}
                className="text-xs px-3 py-2 rounded-lg border transition-all flex-1 md:flex-none"
                style={rolFilter === f ? {
                  backgroundColor: 'var(--color-primary)',
                  borderColor: 'var(--color-primary)',
                  color: 'white'
                } : {
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-muted-foreground)'
                }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Vista de tabla - Desktop/Tablet */}
        <div className="hidden md:block px-8 py-6">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottomColor: 'var(--color-border)', borderBottomWidth: '1px' }}>
                {['Nombre', 'Rol', 'Estado', 'Último acceso', ''].map((h) => (
                  <th key={h} className="text-left px-2 pb-2 text-xs font-medium" style={{ color: 'var(--color-muted-foreground)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {slice.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-6 text-sm" style={{ color: 'var(--color-muted-foreground)' }}>Sin resultados</td></tr>
              ) : (
                slice.map((u) => (
                  <tr key={u.nombre} style={{ borderBottomColor: 'var(--color-border)', borderBottomWidth: '1px' }}>
                    <td className="px-2 py-2" style={{ color: 'var(--color-foreground)' }}>{u.nombre}</td>
                    <td className="px-2 py-2">
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{
                        backgroundColor: u.rol === 'Estudiante' ? 'var(--color-secondary)' : 'var(--color-primary)',
                        color: 'white',
                        opacity: 0.2
                      }}>{u.rol}</span>
                    </td>
                    <td className="px-2 py-2">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${pillStyle[u.estado]}`}>{u.estado}</span>
                    </td>
                    <td className="px-2 py-2 text-xs" style={{ color: 'var(--color-muted-foreground)' }}>{u.acceso}</td>
                    <td className="px-2 py-2">
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
        <div className="md:hidden space-y-3 px-8 py-6">
          {slice.length === 0 ? (
            <div className="text-center py-6 text-sm" style={{ color: 'var(--color-muted-foreground)' }}>Sin resultados</div>
          ) : (
            slice.map((u) => (
              <div key={u.nombre} className="border rounded-lg p-4" style={{
                backgroundColor: 'var(--color-background)',
                borderColor: 'var(--color-border)'
              }}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-sm" style={{ color: 'var(--color-foreground)' }}>{u.nombre}</p>
                    <div className="flex gap-2 mt-1">
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{
                        backgroundColor: u.rol === 'Estudiante' ? 'var(--color-secondary)' : 'var(--color-primary)',
                        color: 'white',
                        opacity: 0.2
                      }}>{u.rol}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${pillStyle[u.estado]}`}>{u.estado}</span>
                    </div>
                  </div>
                </div>
                <div className="mb-3">
                  <p className="text-[10px]" style={{ color: 'var(--color-muted-foreground)' }}>Último acceso</p>
                  <p className="text-xs mt-1" style={{ color: 'var(--color-foreground)' }}>{u.acceso}</p>
                </div>
                <button className="w-full text-xs px-3 py-1.5 border rounded-lg" style={{
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-primary)',
                  backgroundColor: 'transparent'
                }}>Ver</button>
              </div>
            ))
          )}
        </div>

        <div className="flex justify-between items-center pt-3 px-8 pb-6 border-t border-border mt-2">
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
    </div>
  )
}
