import { useEffect, useState } from 'react'
import { Loader, ImageOff } from 'lucide-react'
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

  const isInternal = isInternalUrl(data.url)

  useEffect(() => {
    if (!isInternal) {
      // URL externa: no necesita auth, el <img src> la carga directo
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
    <div className="space-y-4">
      <figure className="space-y-2">
        <img
          src={imgSrc}
          alt={data.alt ?? data.title}
          onError={() => setLoadError(true)}
          className="w-full rounded-xl object-contain max-h-[60vh]"
        />
        {data.caption && (
          <figcaption className="text-xs text-secondary text-center italic">
            {data.caption}
          </figcaption>
        )}
      </figure>

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
    </div>
  )
}
