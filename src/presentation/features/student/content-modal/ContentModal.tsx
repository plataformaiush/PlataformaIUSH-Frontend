import { useEffect, lazy, Suspense } from 'react'
import { createPortal } from 'react-dom'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import { ContentLoader } from './components/ContentLoader'
import { NoContentAvailable } from './components/NoContentAvailable'
import type { AnyContentData } from '../../../../../../PlataformaIUSH-Frontend/src/domain/shared/interfaces/ICourseContent'

const VideoContent = lazy(() =>
  import('./components/VideoContent').then(m => ({ default: m.VideoContent }))
)
const ImageContent = lazy(() =>
  import('./components/ImageContent').then(m => ({ default: m.ImageContent }))
)
const TextContent = lazy(() =>
  import('./components/TextContent').then(m => ({ default: m.TextContent }))
)
const QuizContent = lazy(() =>
  import('./components/QuizContent').then(m => ({ default: m.QuizContent }))
)
const PdfContent = lazy(() =>
  import('./components/PdfContent').then(m => ({ default: m.PdfContent }))
)
const XlsxContent = lazy(() =>
  import('./components/XlsxContent').then(m => ({ default: m.XlsxContent }))
)

interface ContentModalProps {
  content: AnyContentData
  moduleName: string
  currentStep: number
  totalSteps: number
  onClose: () => void
  onPrev?: () => void
  onNext?: () => void
  hasPrev?: boolean
  hasNext?: boolean
  isMarkingComplete?: boolean
}

export function ContentModal({
  content,
  onClose,
  onPrev,
  onNext,
  hasPrev = false,
  hasNext = false,
  isMarkingComplete = false,
}: ContentModalProps) {
  /* Bloquear scroll del body al abrir */
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [])

  /* Cerrar con Escape */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const renderContent = () => {
    switch (content.type) {
      case 'video':
        return <VideoContent data={content} onComplete={onClose} />
      case 'image':
        return <ImageContent data={content} onComplete={onClose} />
      case 'text':
        return <TextContent data={content} onComplete={onClose} />
      case 'quiz':
        return <QuizContent data={content} onComplete={onClose} />
      case 'pdf':
        return <PdfContent data={content} onComplete={onClose} />
      case 'xlsx':
        return <XlsxContent data={content} onComplete={onClose} />
      default:
        return <NoContentAvailable onClose={onClose} />
    }
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[100] bg-neutral/70 backdrop-blur-sm
                 flex items-end md:items-center md:justify-center"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className="flex flex-col bg-surface w-full h-[92dvh]
                   rounded-t-2xl md:rounded-2xl
                   md:h-auto md:max-h-[85vh] md:w-[90vw] md:max-w-2xl
                   shadow-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between gap-3 px-4 py-3 md:px-6 md:py-4
                        bg-primary shrink-0">
          <h2
            id="modal-title"
            className="text-sm md:text-base font-semibold text-tertiary line-clamp-1 flex-1"
          >
            {content.title}
          </h2>
          <button
            onClick={onClose}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center
                       rounded-full hover:bg-white/10 transition-colors text-mid
                       hover:text-tertiary"
            aria-label="Cerrar"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <Suspense fallback={<ContentLoader />}>
            {renderContent()}
          </Suspense>
        </div>

        <div className="flex justify-between items-center px-4 py-3 md:px-6
                        border-t border-mid/20 shrink-0">
          <button
            onClick={onPrev}
            disabled={!hasPrev}
            className="flex items-center gap-1.5 min-h-[44px] px-4 rounded-xl text-sm font-medium
                       text-primary hover:bg-primary/10 disabled:opacity-30
                       disabled:cursor-not-allowed active:scale-95 transition-all"
          >
            <ChevronLeft size={16} />
            Anterior
          </button>

          <button
            onClick={onNext}
            disabled={!hasNext || isMarkingComplete}
            className="flex items-center gap-1.5 min-h-[44px] px-5 rounded-xl text-sm font-semibold
                        bg-primary text-tertiary hover:bg-secondary
                        disabled:opacity-30 disabled:cursor-not-allowed
                        active:scale-95 transition-all"
          >
            {isMarkingComplete ? 'Completando...' : 'Siguiente'}
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
