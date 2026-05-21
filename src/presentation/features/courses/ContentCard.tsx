import { Content, ContentType } from '../../../domain/contents/types'
import { deleteContenido } from '../../services/contentService'
import { logger } from '../../utils/logger'

interface ContentCardProps {
  content: Content
  isLast?: boolean
  onContentUpdate?: () => void
}

const typeLabels: Record<ContentType, string> = {
  [ContentType.VIDEO]: 'Vídeo',
  [ContentType.TEXT]: 'Texto',
  [ContentType.IMAGE]: 'Imagen',
  [ContentType.DOCUMENT]: 'Documento'
}

export const ContentCard = ({ content, isLast, onContentUpdate }: ContentCardProps) => {
  const isActive = content.status === 'active'

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
          {/* View */}
          {content.resourceUrl && (
            <a
              href={content.resourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-8 w-8 items-center justify-center rounded-lg border transition-all hover:opacity-80"
              style={{ borderColor: '#E5E7EB', backgroundColor: '#FFFFFF', color: '#6B7280' }}
              title="Ver contenido"
              aria-label={`Ver contenido: ${content.title}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </a>
          )}
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