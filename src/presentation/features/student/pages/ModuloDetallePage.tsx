import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { studentService, ModuloDetalle, ContenidoItem } from '../services/studentService'
import { CheckCircle, Circle } from 'lucide-react'

export default function ModuloDetallePage() {
  const { cursoId, moduloId } = useParams<{ cursoId: string; moduloId: string }>()
  const navigate = useNavigate()
  const [modulo, setModulo] = useState<ModuloDetalle | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!cursoId || !moduloId) return

    const fetchModuloDetalle = async () => {
      try {
        setLoading(true)
        const data = await studentService.getModuloDetalle(cursoId, moduloId)
        setModulo(data)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar módulo')
        console.error('Error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchModuloDetalle()
  }, [cursoId, moduloId])

  const handleContenidoClick = (contenidoId: string) => {
    navigate(`/student/curso/${cursoId}/modulo/${moduloId}/contenido/${contenidoId}`)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-border border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando módulo...</p>
        </div>
      </div>
    )
  }

  if (error || !modulo) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-red-600">
          <p className="font-semibold">Error al cargar módulo</p>
          <p className="text-sm">{error}</p>
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
          onClick={() => navigate(`/student/curso/${cursoId}`)}
          className="text-sm opacity-80 hover:opacity-100 mb-3 flex items-center gap-1"
        >
          ← Volver
        </button>
        <h1 className="text-3xl font-bold mb-2">Módulo {modulo.orden}: {modulo.titulo}</h1>
        <p className="text-sm opacity-90">{modulo.descripcion}</p>
      </div>

      {/* Contenido */}
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--color-foreground)' }}>
          Contenidos
        </h2>

        {modulo.contenidos.length === 0 ? (
          <div className="text-center py-8">
            <p style={{ color: 'var(--color-muted-foreground)' }}>
              Este módulo aún no tiene contenidos
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {modulo.contenidos.map((contenido) => (
              <div
                key={contenido.idContenido}
                onClick={() => handleContenidoClick(contenido.idContenido)}
                className="border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md flex items-start gap-4"
                style={{
                  borderColor: 'var(--color-border)',
                  backgroundColor: 'var(--color-muted)',
                }}
              >
                {/* Icono de tipo */}
                <div className="flex-shrink-0 pt-1">
                  {contenido.tipo === 'video' && '🎥'}
                  {contenido.tipo === 'texto' && '📝'}
                  {contenido.tipo === 'archivo' && '📄'}
                  {contenido.tipo === 'imagen' && '🖼️'}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold" style={{ color: 'var(--color-foreground)' }}>
                    {contenido.orden}. {contenido.titulo}
                  </h3>
                  <p className="text-sm mt-1" style={{ color: 'var(--color-muted-foreground)' }}>
                    {contenido.descripcion}
                  </p>
                  <p className="text-xs mt-2 capitalize" style={{ color: 'var(--color-secondary)' }}>
                    {contenido.tipo}
                  </p>
                </div>

                {/* Indicador de estado (placeholder - aquí irá completado/no completado) */}
                <div className="flex-shrink-0">
                  <Circle size={20} style={{ color: 'var(--color-border)' }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

