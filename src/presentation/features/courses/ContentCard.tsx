import { Content, ContentType } from '../../../domain/contents/types'

interface ContentCardProps {
  content: Content
  isLast?: boolean
}

const typeLabels: Record<ContentType, string> = {
  [ContentType.VIDEO]: 'Vídeo',
  [ContentType.TEXT]: 'Texto',
  [ContentType.IMAGE]: 'Imagen',
  [ContentType.DOCUMENT]: 'Documento'
}

export const ContentCard = ({ content, isLast }: ContentCardProps) => {
  const isActive = content.status === 'active'

  return (
    <tr className={!isLast ? 'border-b border-gray-100' : ''}>
      {/* Title + description */}
      <td className="px-6 py-4">
        <p className="text-sm font-semibold" style={{ color: '#223740' }}>{content.title}</p>
        <p className="mt-0.5 text-xs" style={{ color: '#5A878C' }}>{content.description}</p>
        {content.durationMinutes && (
          <p className="mt-0.5 text-xs text-gray-400">{content.durationMinutes} min</p>
        )}
      </td>

      {/* Type */}
      <td className="px-6 py-4">
        <span
          className="inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold"
          style={{ backgroundColor: '#f0fafa', color: '#5A878C' }}
        >
          {typeLabels[content.type] ?? 'Desconocido'}
        </span>
      </td>

      {/* Order */}
      <td className="px-6 py-4 text-sm" style={{ color: '#223740' }}>
        {content.order}
      </td>

      {/* Status badge */}
      <td className="px-6 py-4">
        <span
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
          style={
            isActive
              ? { backgroundColor: '#AEEBF2', color: '#223740' }
              : { backgroundColor: '#fef3c7', color: '#92400e' }
          }
        >
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: isActive ? '#5A878C' : '#d97706' }}
          />
          {isActive ? 'Activo' : 'Borrador'}
        </span>
      </td>

      {/* Actions */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          {/* View */}
          {content.resourceUrl && (
            <a
              href={content.resourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-7 w-7 items-center justify-center rounded border border-gray-200 text-gray-400 transition hover:border-gray-300 hover:text-gray-600"
              title="Ver contenido"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          )}

          {/* Toggle status */}
          <button
            className="flex h-7 w-7 items-center justify-center rounded border border-gray-200 text-gray-400 transition hover:border-gray-300 hover:text-gray-600"
            title={isActive ? 'Mover a borrador' : 'Publicar'}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 11l6.586-6.586a2 2 0 012.828 2.828L11.828 13.828A2 2 0 019 14H8v-1a2 2 0 01.586-1.414z" />
            </svg>
          </button>

          {/* Delete */}
          <button
            className="flex h-7 w-7 items-center justify-center rounded border border-red-100 text-red-400 transition hover:border-red-200 hover:text-red-600"
            title="Eliminar contenido"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </td>
    </tr>
  )
}