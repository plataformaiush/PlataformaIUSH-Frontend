import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { studentService, ContenidoDetalle } from '../services/studentService'
import { CheckCircle2 } from 'lucide-react'

export default function ContenidoDetallePage() {
  const { cursoId, moduloId, contenidoId } = useParams<{
    cursoId: string
    moduloId: string
    contenidoId: string
  }>()
  const navigate = useNavigate()
  const [contenido, setContenido] = useState<ContenidoDetalle | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [completado, setCompletado] = useState(false)
  const [marcandoCompletado, setMarcandoCompletado] = useState(false)

  useEffect(() => {
    if (!moduloId || !contenidoId) return

    const fetchContenido = async () => {
      try {
        setLoading(true)
        const data = await studentService.getContenidoDetalle(moduloId, contenidoId)
        setContenido(data)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar contenido')
        console.error('Error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchContenido()
  }, [moduloId, contenidoId])

  const handleMarcarCompletado = async () => {
    if (!contenidoId) return

    try {
      setMarcandoCompletado(true)
      await studentService.marcarContenidoCompletado(contenidoId)
      setCompletado(true)
    } catch (err) {
      console.error('Error al marcar como completado:', err)
      alert('Error al marcar como completado')
    } finally {
      setMarcandoCompletado(false)
    }
  }

  const isYoutubeUrl = (url: string) => url.includes('youtube.com') || url.includes('youtu.be')

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-border border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando contenido...</p>
        </div>
      </div>
    )
  }

  if (error || !contenido) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-red-600">
          <p className="font-semibold">Error al cargar contenido</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-6" style={{ backgroundColor: 'var(--color-background)' }}>
      {/* Botón volver */}
      <div className="p-6 pb-0">
        <button
          onClick={() => navigate(`/student/curso/${cursoId}/modulo/${moduloId}`)}
          className="text-sm opacity-80 hover:opacity-100 flex items-center gap-1"
          style={{ color: 'var(--color-primary)' }}
        >
          ← Volver al módulo
        </button>
      </div>

      {/* Contenido principal */}
      <div className="p-6 space-y-4">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--color-foreground)' }}>
            {contenido.titulo}
          </h1>
          <p className="text-sm mt-2" style={{ color: 'var(--color-muted-foreground)' }}>
            Tipo: <span className="capitalize">{contenido.tipo}</span>
          </p>
          <p className="text-sm mt-1" style={{ color: 'var(--color-muted-foreground)' }}>
            {contenido.descripcion}
          </p>
        </div>

        {/* Visor de contenido */}
        <div
          className="rounded-lg overflow-hidden border"
          style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-muted)' }}
        >
          {/* Video */}
          {contenido.tipo === 'video' && isYoutubeUrl(contenido.urlOTexto) && (
            <div className="aspect-video">
              <iframe
                width="100%"
                height="100%"
                src={contenido.urlOTexto.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                title={contenido.titulo}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}

          {/* Video de otro origen */}
          {contenido.tipo === 'video' && !isYoutubeUrl(contenido.urlOTexto) && (
            <div className="aspect-video">
              <video controls className="w-full h-full">
                <source src={contenido.urlOTexto} />
                Tu navegador no soporta video
              </video>
            </div>
          )}

          {/* Texto */}
          {contenido.tipo === 'texto' && (
            <div className="p-6 prose prose-sm max-w-none">
              <div
                dangerouslySetInnerHTML={{ __html: contenido.urlOTexto }}
                style={{ color: 'var(--color-foreground)' }}
              />
            </div>
          )}

          {/* Imagen */}
          {contenido.tipo === 'imagen' && (
            <div className="p-6 flex items-center justify-center">
              <img
                src={contenido.urlOTexto}
                alt={contenido.titulo}
                className="max-w-full max-h-96 rounded"
              />
            </div>
          )}

          {/* Archivo */}
          {contenido.tipo === 'archivo' && (
            <div className="p-6 text-center">
              <p className="mb-4" style={{ color: 'var(--color-muted-foreground)' }}>
                Archivo disponible para descargar
              </p>
              <a
                href={contenido.urlOTexto}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-6 py-2 rounded-lg text-white font-semibold"
                style={{ backgroundColor: 'var(--color-primary)' }}
              >
                Descargar archivo
              </a>
            </div>
          )}
        </div>

        {/* Botón marcar completado */}
        <div className="pt-4">
          <button
            onClick={handleMarcarCompletado}
            disabled={completado || marcandoCompletado}
            className="w-full py-3 rounded-lg font-semibold text-white transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            style={{ backgroundColor: completado ? 'var(--color-secondary)' : 'var(--color-primary)' }}
          >
            {completado ? (
              <>
                <CheckCircle2 size={20} />
                Completado
              </>
            ) : marcandoCompletado ? (
              'Marcando como completado...'
            ) : (
              'Marcar como completado'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

