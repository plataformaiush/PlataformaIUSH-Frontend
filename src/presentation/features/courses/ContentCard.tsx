import { useState } from 'react'
import { Content, ContentType, parseQuizData } from '../../../domain/contents/types'
import { deleteContenido } from '../../services/contentService'
import { logger } from '../../utils/logger'

interface ContentCardProps {
  content: Content
  isLast?: boolean
  onContentUpdate?: () => void
  onEdit?: (content: Content) => void
}

const typeLabels: Record<ContentType, string> = {
  [ContentType.VIDEO]:    'Vídeo',
  [ContentType.TEXT]:     'Texto',
  [ContentType.IMAGE]:    'Imagen',
  [ContentType.DOCUMENT]: 'Documento',
  [ContentType.QUIZ_TF]:  'Verdadero/Falso',
  [ContentType.QUIZ_MC]:  'Opción múltiple',
}

export const ContentCard = ({ content, isLast, onContentUpdate, onEdit }: ContentCardProps) => {
  const isActive = content.status === 'active'
  const [showTextModal, setShowTextModal] = useState(false)

  const handleDelete = async () => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este contenido? Esta acción no se puede deshacer.')) {
      try {
        await deleteContenido(content.moduleId, content.id)
        onContentUpdate?.()
      } catch (error) {
        logger.error('Error al eliminar contenido', { error, contentId: content.id, moduleId: content.moduleId })
      }
    }
  }

  const renderViewButton = () => {
    if (!content.resourceUrl) return null

    if (content.type === ContentType.TEXT) {
      return (
        <>
          <button onClick={() => setShowTextModal(true)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border transition-all hover:opacity-80"
            style={{ borderColor: '#E5E7EB', backgroundColor: '#FFFFFF', color: '#6B7280' }} title="Ver texto">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
          {showTextModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowTextModal(false)}>
              <div className="max-w-lg w-full mx-4 rounded-2xl bg-white p-6 shadow-xl" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-base" style={{ color: '#223740' }}>{content.title}</h3>
                  <button onClick={() => setShowTextModal(false)} className="text-gray-400 hover:text-gray-600">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
                <p className="text-sm whitespace-pre-wrap" style={{ color: '#374151' }}>{content.resourceUrl}</p>
              </div>
            </div>
          )}
        </>
      )
    }

    if (content.type === ContentType.QUIZ_TF || content.type === ContentType.QUIZ_MC) {
      const quiz = content.resourceUrl ? parseQuizData(content.resourceUrl) : null
      return (
        <>
          <button onClick={() => setShowTextModal(true)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border transition-all hover:opacity-80"
            style={{ borderColor: '#E5E7EB', backgroundColor: '#FFFFFF', color: '#6B7280' }} title="Ver pregunta">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
          {showTextModal && quiz && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowTextModal(false)}>
              <div className="max-w-lg w-full mx-4 rounded-2xl bg-white p-6 shadow-xl" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-semibold px-2 py-1 rounded-full" style={{ backgroundColor: '#AEEBF2', color: '#223740' }}>
                    {content.type === ContentType.QUIZ_TF ? 'Verdadero / Falso' : 'Opción múltiple'}
                  </span>
                  <button onClick={() => setShowTextModal(false)} className="text-gray-400 hover:text-gray-600">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
                <p className="text-base font-semibold mb-4" style={{ color: '#223740' }}>{quiz.question}</p>
                {quiz.questionType === 'quiz_tf' && (
                  <div className="flex gap-3">
                    {(['Verdadero', 'Falso'] as const).map((label, i) => {
                      const isCorrect = quiz.correctAnswer === (i === 0)
                      return (
                        <div key={label} className="flex-1 rounded-xl border-2 py-3 text-center text-sm font-semibold"
                          style={{ borderColor: isCorrect ? '#5A878C' : '#E5E7EB', backgroundColor: isCorrect ? '#AEEBF2' : '#F9FAFB', color: isCorrect ? '#223740' : '#9CA3AF' }}>
                          {isCorrect ? '✓ ' : ''}{label}
                        </div>
                      )
                    })}
                  </div>
                )}
                {quiz.questionType === 'quiz_mc' && (
                  <div className="space-y-2">
                    {quiz.options.map(opt => {
                      const isCorrect = opt.id === quiz.correctAnswerId
                      return (
                        <div key={opt.id} className="rounded-xl border-2 px-4 py-2 text-sm font-medium"
                          style={{ borderColor: isCorrect ? '#5A878C' : '#E5E7EB', backgroundColor: isCorrect ? '#AEEBF2' : '#F9FAFB', color: isCorrect ? '#223740' : '#6B7280' }}>
                          {isCorrect ? '✓ ' : ''}{opt.text}
                        </div>
                      )
                    })}
                  </div>
                )}
                {quiz.explanation && (
                  <p className="mt-4 text-xs rounded-xl p-3" style={{ backgroundColor: '#F3F4F6', color: '#6B7280' }}>
                    💡 {quiz.explanation}
                  </p>
                )}
              </div>
            </div>
          )}
        </>
      )
    }

    return (
      <a
        href={content.resourceUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex h-8 w-8 items-center justify-center rounded-lg border transition-all hover:opacity-80"
        style={{ borderColor: '#E5E7EB', backgroundColor: '#FFFFFF', color: '#6B7280' }}
        title={content.type === ContentType.DOCUMENT ? 'Descargar' : 'Ver contenido'}
      >
        {content.type === ContentType.DOCUMENT ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        )}
      </a>
    )
  }

  return (
    <tr 
      className="transition-colors hover:bg-gray-50" 
      style={{ 
        borderBottom: !isLast ? '1px solid #E5E7EB' : 'none'
      }}
    >
      {/* Title + description */}
      <td className="px-6 py-5">
        <p className="font-semibold" style={{ color: '#223740', fontSize: '14px' }}>{content.title}</p>
        <p className="mt-1 text-xs" style={{ color: '#6B7280' }}>{content.description}</p>
        {content.durationMinutes && (
          <p className="mt-1 text-xs" style={{ color: '#9CA3AF' }}>{content.durationMinutes} min</p>
        )}
      </td>

      {/* Type */}
      <td className="px-6 py-5">
        <span
          className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
          style={{ backgroundColor: '#AEEBF2', color: '#223740' }}
        >
          {typeLabels[content.type] ?? 'Desconocido'}
        </span>
      </td>

      {/* Order */}
      <td className="px-6 py-5">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#AEEBF2' }}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" style={{ color: '#223740' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l5 5c.585.588.195 1.414.586 1.414h5a2 2 0 012 2v10a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2z" />
            </svg>
          </div>
          <span className="text-sm font-medium" style={{ color: '#223740' }}>
            {content.order}
          </span>
        </div>
      </td>

      {/* Status badge */}
      <td className="px-6 py-5">
        <span
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium"
          style={{
            backgroundColor: isActive ? '#AEEBF2' : '#F3F4F6',
            color: isActive ? '#5A878C' : '#6B7280'
          }}
        >
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: isActive ? '#5A878C' : '#9CA3AF' }}
          />
          {isActive ? 'Activo' : 'Inactivo'}
        </span>
      </td>

      {/* Actions */}
      <td className="px-6 py-5">
        <div className="flex items-center gap-2">
          {renderViewButton()}
          {/* Edit */}
          <button
            onClick={() => onEdit?.(content)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border transition-all hover:opacity-80"
            style={{ borderColor: '#E5E7EB', backgroundColor: '#FFFFFF', color: '#6B7280' }}
            title="Editar contenido"
            aria-label={`Editar contenido: ${content.title}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          {/* Delete */}
          <button
            onClick={handleDelete}
            className="flex h-8 w-8 items-center justify-center rounded-lg transition-all hover:opacity-80"
            style={{ borderColor: '#FECACA', color: '#EF4444', backgroundColor: '#FEF2F2' }}
            title="Eliminar contenido"
            aria-label={`Eliminar contenido: ${content.title}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </td>
    </tr>
  )
}