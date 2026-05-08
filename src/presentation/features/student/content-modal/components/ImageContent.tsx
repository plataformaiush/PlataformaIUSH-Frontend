import { useEffect, useState } from 'react'
import type { ImageContentData } from '../../../../../../../PlataformaIUSH-Frontend/src/domain/shared/interfaces/ICourseContent'

interface ImageContentProps {
  data: ImageContentData
  onComplete: () => void
}

export function ImageContent({ data, onComplete }: ImageContentProps) {
  const [canMark, setCanMark] = useState(false)
  const [marked, setMarked] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setCanMark(true), 2000)
    return () => clearTimeout(t)
  }, [])

  const handleMark = () => {
    setMarked(true)
    onComplete()
  }

  return (
    <div className="space-y-4">
      <figure className="space-y-2">
        <img
          src={data.url}
          alt={data.alt}
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
