import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { studentService, MisCursos } from '../services/studentService'

export default function StudentDashboard() {
  const navigate = useNavigate()
  const [cursos, setCursos] = useState<MisCursos[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCursos = async () => {
      try {
        setLoading(true)
        const data = await studentService.getMisCursos()
        setCursos(data)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar cursos')
        console.error('Error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchCursos()
  }, [])

  const handleCursoClick = (cursoId: string) => {
    navigate(`/student/curso/${cursoId}`)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-border border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando cursos...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-red-600">
          <p className="font-semibold">Error al cargar cursos</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6" style={{ backgroundColor: 'var(--color-background)' }}>
      {/* Encabezado */}
      <div>
        <h1 className="text-3xl font-bold" style={{ color: 'var(--color-foreground)' }}>
          Mis Cursos
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--color-muted-foreground)' }}>
          {cursos.length} {cursos.length === 1 ? 'curso inscrito' : 'cursos inscritos'}
        </p>
      </div>

      {/* Grid de cursos */}
      {cursos.length === 0 ? (
        <div className="text-center py-12">
          <p style={{ color: 'var(--color-muted-foreground)' }}>
            No tienes cursos inscritos aún
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cursos.map((curso) => (
            <div
              key={curso.idCurso}
              onClick={() => handleCursoClick(curso.idCurso)}
              className="rounded-lg border overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-lg"
              style={{
                borderColor: 'var(--color-border)',
                backgroundColor: 'var(--color-muted)',
              }}
            >
              {/* Header con gradiente */}
              <div
                className="p-4 h-24 flex items-end justify-between"
                style={{
                  background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
                  color: 'var(--color-text-on-dark)',
                }}
              >
                <div className="flex-1">
                  <h3 className="font-semibold truncate">{curso.titulo}</h3>
                  <p className="text-xs mt-1 opacity-80">
                    {curso.modulosCompletados} / {curso.modulosTotal} módulos
                  </p>
                </div>
              </div>

              {/* Barra de progreso */}
              <div className="p-4 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span style={{ color: 'var(--color-muted-foreground)' }}>Progreso</span>
                  <span className="font-semibold" style={{ color: 'var(--color-primary)' }}>
                    {curso.porcentajeProgreso}%
                  </span>
                </div>
                <div
                  className="w-full h-2 rounded-full overflow-hidden"
                  style={{ backgroundColor: 'var(--color-border)' }}
                >
                  <div
                    className="h-full transition-all duration-300"
                    style={{
                      width: `${curso.porcentajeProgreso}%`,
                      backgroundColor: 'var(--color-primary)',
                    }}
                  />
                </div>
              </div>

              {/* Footer */}
              <div
                className="px-4 py-3 text-xs"
                style={{
                  backgroundColor: 'var(--color-background)',
                  color: 'var(--color-muted-foreground)',
                  borderTopColor: 'var(--color-border)',
                  borderTopWidth: '1px',
                }}
              >
                {curso.porcentajeProgreso === 100 ? (
                  <span className="text-green-600">✓ Completado</span>
                ) : (
                  <span>En progreso</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

