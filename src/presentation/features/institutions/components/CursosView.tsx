import { useState } from 'react'

const allCursos = [
  { nombre: 'Matemáticas I', docente: 'Carlos Ruiz', modulos: 8, estudiantes: 320, estado: 'Activo' },
  { nombre: 'Programación', docente: 'Pedro Suárez', modulos: 12, estudiantes: 280, estado: 'Activo' },
  { nombre: 'Inglés básico', docente: 'María Torres', modulos: 6, estudiantes: 210, estado: 'Activo' },
  { nombre: 'Física general', docente: '—', modulos: 0, estudiantes: 0, estado: 'Sin contenido' },
  { nombre: 'Historia', docente: 'Luis Gómez', modulos: 5, estudiantes: 180, estado: 'Activo' },
  { nombre: 'Química', docente: '—', modulos: 0, estudiantes: 0, estado: 'Sin contenido' },
  { nombre: 'Biología', docente: 'Camila Reyes', modulos: 4, estudiantes: 140, estado: 'Activo' },
]

const pillStyle: Record<string, string> = {
  Activo: 'bg-green-100 text-green-800',
  'Sin contenido': 'bg-muted text-muted-foreground',
  Borrador: 'bg-amber-100 text-amber-700',
}

const PER_PAGE = 5

export function CursosView() {
  const [search, setSearch] = useState('')
  const [estadoFilter, setEstadoFilter] = useState('Todos')
  const [page, setPage] = useState(1)

  const filtered = allCursos.filter((c) => {
    const matchSearch = c.nombre.toLowerCase().includes(search.toLowerCase())
    const matchEstado = estadoFilter === 'Todos' || c.estado === estadoFilter
    return matchSearch && matchEstado
  })

  const pages = Math.max(1, Math.ceil(filtered.length / PER_PAGE))
  const slice = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  return (
    <div className="p-6 space-y-4" style={{ backgroundColor: 'var(--color-background)' }}>
      <div>
        <h1 className="text-base font-semibold" style={{ color: 'var(--color-foreground)' }}>Cursos</h1>
        <p className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>32 cursos en la plataforma</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {[['Total', '32'], ['Con contenido', '26'], ['Sin contenido', '6']].map(([l, v]) => (
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
          <p className="text-sm font-semibold uppercase tracking-wider">Listado de cursos</p>
        </div>
        <div className="p-8" style={{ backgroundColor: 'white' }}>
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
          <div className="flex gap-1 flex-wrap mt-4 mb-6">
            {['Todos', 'Activo', 'Sin contenido'].map((f) => (
              <button
                key={f}
                onClick={() => { setEstadoFilter(f); setPage(1) }}
                className="text-xs px-3 py-2 rounded-lg border transition-all flex-1 md:flex-none"
                style={estadoFilter === f ? {
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
                {['Curso', 'Docente', 'Módulos', 'Estudiantes', 'Estado', ''].map((h) => (
                  <th key={h} className="text-left pb-2 text-xs font-medium" style={{ color: 'var(--color-muted-foreground)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {slice.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-6 text-sm" style={{ color: 'var(--color-muted-foreground)' }}>Sin resultados</td></tr>
              ) : (
                slice.map((c) => (
                  <tr key={c.nombre} style={{ borderBottomColor: 'var(--color-border)', borderBottomWidth: '1px' }}>
                    <td className="py-2" style={{ color: 'var(--color-foreground)' }}>{c.nombre}</td>
                    <td className="py-2 text-xs" style={{ color: 'var(--color-muted-foreground)' }}>{c.docente}</td>
                    <td className="py-2 text-xs" style={{ color: 'var(--color-muted-foreground)' }}>{c.modulos}</td>
                    <td className="py-2 text-xs" style={{ color: 'var(--color-muted-foreground)' }}>{c.estudiantes}</td>
                    <td className="py-2">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${pillStyle[c.estado]}`}>{c.estado}</span>
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
        <div className="md:hidden space-y-3 px-8 py-6">
          {slice.length === 0 ? (
            <div className="text-center py-6 text-sm" style={{ color: 'var(--color-muted-foreground)' }}>Sin resultados</div>
          ) : (
            slice.map((c) => (
              <div key={c.nombre} className="border rounded-lg p-4" style={{
                backgroundColor: 'var(--color-background)',
                borderColor: 'var(--color-border)'
              }}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-sm" style={{ color: 'var(--color-foreground)' }}>{c.nombre}</p>
                    <p className="text-xs mt-1" style={{ color: 'var(--color-muted-foreground)' }}>Docente: {c.docente}</p>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${pillStyle[c.estado]}`}>{c.estado}</span>
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

        <div className="flex justify-between items-center pt-3 px-8 pb-6 border-t border-border mt-2">
          <span className="text-xs text-muted-foreground">
            {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, filtered.length)} de {filtered.length}
          </span>
          <div className="flex gap-1">
            {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`text-xs w-7 h-7 rounded-lg border transition-all ${
                  page === p
                    ? 'bg-primary text-white border-primary'
                    : 'border-border text-muted-foreground hover:bg-muted'
                }`}
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
