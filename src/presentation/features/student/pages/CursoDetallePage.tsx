import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { studentService, CursoDetalle, ModuloItem } from '../services/studentService'
import { ChevronRight } from 'lucide-react'

export default function CursoDetallePage() {
  const { cursoId } = useParams<{ cursoId: string }>()
  const navigate = useNavigate()
  const [curso, setCurso] = useState<CursoDetalle | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!cursoId) return

    const fetchCursoDetalle = async () => {
      try {
        setLoading(true)
        const data = await studentService.getCursoDetalle(cursoId)
        setCurso(data)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar curso')
        console.error('Error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchCursoDetalle()
  }, [cursoId])

  const handleModuloClick = (moduloId: string) => {
    navigate(`/student/curso/${cursoId}/modulo/${moduloId}`)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-border border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando curso...</p>
        </div>
      </div>
    )
  }

  if (error || !curso) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-red-600">
          <p className="font-semibold">Error al cargar curso</p>
          <p className="text-sm">{error}</p>
          <button
            onClick={() => navigate('/student/dashboard')}
            className="mt-4 px-4 py-2 rounded text-white"
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            Volver a mis cursos
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6" style={{ backgroundColor: 'var(--color-background)' }}>
      {/* Header */}
      <div
        className="p-6"
        style={{
          background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
          color: 'var(--color-text-on-dark)',
        }}
      >
        <button
          onClick={() => navigate('/student/dashboard')}
          className="text-sm opacity-80 hover:opacity-100 mb-3 flex items-center gap-1"
        >
          ← Volver
        </button>
        <h1 className="text-3xl font-bold mb-2">{curso.titulo}</h1>
        <p className="text-sm opacity-90">{curso.descripcion}</p>
        <p className="text-xs mt-2 opacity-75">
          {curso.modulos.length} módulos • {!curso.activo && '(Inactivo)'}
        </p>
      </div>

      {/* Contenido */}
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--color-foreground)' }}>
          Módulos
        </h2>

        {curso.modulos.length === 0 ? (
          <div className="text-center py-8">
            <p style={{ color: 'var(--color-muted-foreground)' }}>
              Este curso aún no tiene módulos
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {curso.modulos.map((modulo) => (
              <div
                key={modulo.idModulo}
                onClick={() => handleModuloClick(modulo.idModulo)}
                className="border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md"
                style={{
                  borderColor: 'var(--color-border)',
                  backgroundColor: 'var(--color-muted)',
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold" style={{ color: 'var(--color-foreground)' }}>
                      {modulo.orden}. {modulo.titulo}
                    </h3>
                    <p className="text-sm mt-1" style={{ color: 'var(--color-muted-foreground)' }}>
                      {modulo.contenidosCount} contenidos • {!modulo.activo && '(Inactivo)'}
                    </p>
                  </div>
                  <ChevronRight size={20} style={{ color: 'var(--color-secondary)' }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

