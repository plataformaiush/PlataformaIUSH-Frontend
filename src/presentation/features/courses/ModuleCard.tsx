import { Link } from 'react-router-dom'
import { Module } from '../../../domain/modules/types'
import { ModuleRepository } from '../../../domain/modules/moduleRepository'

interface ModuleCardProps {
  module: Module
  courseId: string
  isLast?: boolean
  onModuleUpdate?: () => void
}

export const ModuleCard = ({ module, courseId, isLast, onModuleUpdate }: ModuleCardProps) => {
  const isActive = module.status === 'active'

  const handleToggleStatus = () => {
    const newStatus = isActive ? 'inactive' : 'active'
    ModuleRepository.updateModule(module.id, { status: newStatus })
    onModuleUpdate?.()
  }

  return (
    <tr 
      className="transition-colors hover:bg-gray-50" 
      style={{ 
        borderBottom: !isLast ? '1px solid var(--color-borders)' : 'none',
        backgroundColor: 'transparent'
      }}
    >
      {/* Module name */}
      <td className="px-6 py-5" role="cell">
        <Link
          to={`/courses/${courseId}/modules/${module.id}/contents`}
          className="text-card-title hover:underline focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors"
          style={{ 
            color: 'var(--color-text-primary)', 
            '--tw-ring-color': 'var(--color-ring)' 
          } as React.CSSProperties}
        >
          {module.title}
        </Link>
        <p className="mt-1 text-body-sm" style={{ color: 'var(--color-text-secondary)' }}>
          Módulo {String(module.order).padStart(2, '0')}
        </p>
      </td>

      {/* Content count */}
      <td className="px-6 py-5" role="cell">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--color-tertiary)' }}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" style={{ color: 'var(--color-primary)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <span className="text-body-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
            {module.contentIds.length} contenidos
          </span>
        </div>
      </td>

      {/* Status toggle + badge */}
      <td className="px-6 py-5" role="cell">
        <div className="flex items-center gap-3">
          {/* Toggle switch */}
          <button
            className="relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2"
            style={{ 
              backgroundColor: isActive ? 'var(--color-secondary)' : 'var(--color-text-muted)',
              '--tw-ring-color': 'var(--color-ring)' 
            } as React.CSSProperties}
            title={isActive ? 'Desactivar' : 'Activar'}
            onClick={handleToggleStatus}
          >
            <span
              className="inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform"
              style={{ transform: isActive ? 'translateX(18px)' : 'translateX(2px)' }}
            />
          </button>

          {/* Status badge */}
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
        </div>
      </td>

      {/* Actions */}
      <td className="px-6 py-5" role="cell">
        <div className="flex items-center gap-2" role="group" aria-label="Acciones del módulo">
          {/* View contents */}
          <Link
            to={`/courses/${courseId}/modules/${module.id}/contents`}
            className="flex h-8 w-8 items-center justify-center badge border-subtle transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2"
            style={{ 
              borderColor: 'var(--color-borders)',
              color: 'var(--color-text-secondary)',
              '--tw-ring-color': 'var(--color-ring)' 
            } as React.CSSProperties}
            title="Ver contenidos"
            aria-label={`Ver contenidos de ${module.title}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </Link>

          {/* Delete */}
          <button
            className="flex h-8 w-8 items-center justify-center badge transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            style={{ 
              borderColor: '#fecaca',
              color: '#ef4444',
              backgroundColor: '#fef2f2'
            }}
            title="Eliminar módulo"
            aria-label={`Eliminar módulo: ${module.title}`}
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