import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Loader, ImageOff, ZoomIn, X } from 'lucide-react'
import { tokenManager } from '../../../../services/tokenManager'
import type { ImageContentData } from '../../../../../../../PlataformaIUSH-Frontend/src/domain/shared/interfaces/ICourseContent'

interface ImageContentProps {
  data: ImageContentData
  onComplete: () => void
}

function isInternalUrl(url: string): boolean {
  return url.includes('localhost') || url.includes('127.0.0.1')
}

export function ImageContent({ data, onComplete }: ImageContentProps) {
  const [canMark, setCanMark] = useState(false)
  const [marked, setMarked] = useState(false)
  const [blobUrl, setBlobUrl] = useState<string | null>(null)
  const [loadError, setLoadError] = useState(false)
  const [lightbox, setLightbox] = useState(false)

  const isInternal = isInternalUrl(data.url)

  useEffect(() => {
    if (!isInternal) {
      const t = setTimeout(() => setCanMark(true), 2000)
      return () => clearTimeout(t)
    }

    let objectUrl: string | null = null

    const fetchImage = async () => {
      try {
        const headers: Record<string, string> = tokenManager.getAuthHeaders()
        const res = await fetch(data.url, { headers })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const blob = await res.blob()
        objectUrl = URL.createObjectURL(blob)
        setBlobUrl(objectUrl)
      } catch {
        setLoadError(true)
      }
    }

    fetchImage()
    return () => { if (objectUrl) URL.revokeObjectURL(objectUrl) }
  }, [data.url, isInternal])

  useEffect(() => {
    if (!blobUrl) return
    const t = setTimeout(() => setCanMark(true), 2000)
    return () => clearTimeout(t)
  }, [blobUrl])

  /* Bloquear scroll del body cuando el lightbox está abierto */
  useEffect(() => {
    if (!lightbox) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [lightbox])

  /* Cerrar lightbox con Escape */
  useEffect(() => {
    if (!lightbox) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setLightbox(false) }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [lightbox])

  const handleMark = () => {
    setMarked(true)
    onComplete()
  }

  if (isInternal && !blobUrl && !loadError) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader size={28} className="animate-spin text-secondary" />
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-14 text-center">
        <ImageOff size={36} className="text-mid opacity-50" />
        <p className="text-sm text-secondary">No se pudo cargar la imagen.</p>
        <p className="text-xs text-mid">Verifica que el archivo haya sido subido correctamente.</p>
      </div>
    )
  }

  const imgSrc = isInternal ? blobUrl! : data.url

  return (
    <div className="space-y-6">
      <figure className="space-y-3">
        {/* Contenedor con padding y fondo suave */}
        <div className="p-3 bg-mid/5 rounded-2xl border border-mid/10">
          <div
            className="relative group cursor-zoom-in rounded-xl overflow-hidden max-h-[38vh] lg:max-h-[56vh] flex items-center justify-center bg-black/5"
            onClick={() => setLightbox(true)}
          >
            <img
              src={imgSrc}
              alt={data.alt ?? data.title}
              onError={() => setLoadError(true)}
              className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-[1.01]"
            />
            {/* Hint de zoom */}
            <div className="absolute inset-0 flex items-center justify-center
                            bg-black/0 group-hover:bg-black/15 transition-colors duration-300">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300
                              bg-black/60 rounded-full p-2.5">
                <ZoomIn size={20} className="text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Caption y separador */}
        {data.caption && (
          <figcaption className="px-1 flex items-start gap-2 text-xs text-secondary italic leading-relaxed">
            <span className="mt-0.5 shrink-0 w-0.5 h-3 rounded-full bg-mid/40" />
            {data.caption}
          </figcaption>
        )}
      </figure>

      {/* Separador visual */}
      <div className="border-t border-mid/15" />

      {!marked ? (
        <button
          onClick={handleMark}
          disabled={!canMark}
          className="w-full min-h-[48px] rounded-xl font-medium text-sm
                     bg-primary text-tertiary
                     disabled:opacity-40 disabled:cursor-not-allowed
                     hover:bg-secondary active:scale-95 transition-all"
        >
          {canMark ? 'Marcar como visto' : 'Observa la imagen...'}
        </button>
      ) : (
        <p className="text-center text-sm text-secondary font-medium">✓ Contenido completado</p>
      )}

      {/* Lightbox */}
      {lightbox && createPortal(
        <div
          className="fixed inset-0 z-[300] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
          onClick={() => setLightbox(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Vista completa de imagen"
        >
          {/* Botón cerrar */}
          <button
            onClick={() => setLightbox(false)}
            className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center
                       rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            aria-label="Cerrar"
          >
            <X size={20} />
          </button>

          {/* Imagen a tamaño completo */}
          <img
            src={imgSrc}
            alt={data.alt ?? data.title}
            onClick={e => e.stopPropagation()}
            className="max-w-full max-h-[90vh] rounded-2xl object-contain shadow-2xl
                       animate-in fade-in zoom-in-95 duration-200"
          />

          {/* Caption en lightbox */}
          {data.caption && (
            <p className="absolute bottom-5 left-1/2 -translate-x-1/2 text-xs text-white/70
                          italic text-center max-w-sm px-4">
              {data.caption}
            </p>
          )}
        </div>,
        document.body
      )}
    </div>
  )
}
