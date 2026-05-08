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
    <tr 
      className="transition-colors hover:bg-gray-50" 
      style={{ 
        borderBottom: !isLast ? '1px solid var(--color-borders)' : 'none',
        backgroundColor: 'transparent'
      }}
    >
      {/* Title + description */}
      <td className="px-6 py-5" role="cell">
        <p className="text-card-title" style={{ color: 'var(--color-text-primary)' }}>{content.title}</p>
        <p className="mt-1 text-body-sm" style={{ color: 'var(--color-text-secondary)' }}>{content.description}</p>
        {content.durationMinutes && (
          <p className="mt-1 text-body-sm" style={{ color: 'var(--color-text-muted)' }}>{content.durationMinutes} min</p>
        )}
      </td>

      {/* Type */}
      <td className="px-6 py-5" role="cell">
        <span
          className="badge-pill text-label font-medium"
          style={{ backgroundColor: 'var(--color-tertiary)', color: 'var(--color-primary)' }}
        >
          {typeLabels[content.type] ?? 'Desconocido'}
        </span>
      </td>

      {/* Order */}
      <td className="px-6 py-5" role="cell">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--color-tertiary)' }}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" style={{ color: 'var(--color-primary)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l5 5c.585.588.195 1.414.586 1.414h5a2 2 0 012 2v10a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2z" />
            </svg>
          </div>
          <span className="text-body-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
            {content.order}
          </span>
        </div>
      </td>

      {/* Status badge */}
      <td className="px-6 py-5" role="cell">
        <span
          className="inline-flex items-center gap-2 badge-pill text-body-sm font-medium"
          style={{
            backgroundColor: isActive ? 'var(--color-tertiary)' : '#f3f4f6',
            color: isActive ? 'var(--color-primary)' : '#6b7280'
          }}
        >
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: isActive ? 'var(--color-secondary)' : '#9ca3af' }}
          />
          {isActive ? 'Activo' : 'Inactivo'}
        </span>
      </td>

      {/* Actions */}
      <td className="px-6 py-5" role="cell">
        <div className="flex items-center gap-2" role="group" aria-label="Acciones del contenido">
          {/* View */}
          {content.resourceUrl && (
            <a
              href={content.resourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-8 w-8 items-center justify-center badge border-subtle transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2"
              style={{ 
                borderColor: 'var(--color-borders)',
                color: 'var(--color-text-secondary)',
                '--tw-ring-color': 'var(--color-ring)' 
              } as React.CSSProperties}
              title="Ver contenido"
              aria-label={`Ver contenido: ${content.title}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c-2.523 0-4.732 2.943-5.542 7-1.278 0-2.417.673-3.023-2.542-1.278 0-2.417.673-3.023z" />
              </svg>
            </a>
          )}
          {/* Delete */}
          <button
            className="flex h-8 w-8 items-center justify-center badge transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            style={{ 
              borderColor: '#fecaca',
              color: '#ef4444',
              backgroundColor: '#fef2f2'
            }}
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