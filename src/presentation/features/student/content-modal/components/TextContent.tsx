import { useEffect, useRef, useState } from 'react'
import type { TextContentData } from '../../../../../../../PlataformaIUSH-Frontend/src/domain/shared/interfaces/ICourseContent'

interface TextContentProps {
  data: TextContentData
  onComplete: () => void
}

export function TextContent({ data, onComplete }: TextContentProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [reachedEnd, setReachedEnd] = useState(false)
  const [marked, setMarked] = useState(false)

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return

    const check = () => {
      if (el.scrollHeight <= el.clientHeight) {
        setReachedEnd(true)
        return
      }
      const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 32
      if (atBottom) setReachedEnd(true)
    }

    check()
    el.addEventListener('scroll', check, { passive: true })
    return () => el.removeEventListener('scroll', check)
  }, [])

  const handleMark = () => {
    setMarked(true)
    onComplete()
  }

  return (
    <div className="flex flex-col gap-4">
      <div
        ref={scrollRef}
        className="prose prose-sm max-w-none text-neutral leading-relaxed
                   max-h-[50vh] overflow-y-auto pr-1"
        dangerouslySetInnerHTML={{ __html: data.body }}
      />

      {!marked ? (
        <button
          onClick={handleMark}
          disabled={!reachedEnd}
          className="w-full min-h-[48px] rounded-xl font-medium text-sm
                     bg-primary text-tertiary
                     disabled:opacity-40 disabled:cursor-not-allowed
                     hover:bg-secondary active:scale-95 transition-all"
        >
          {reachedEnd ? 'He leído este contenido' : 'Desplázate hasta el final ↓'}
        </button>
      ) : (
        <p className="text-center text-sm text-secondary font-medium">✓ Contenido completado</p>
      )}
    </div>
  )
}
