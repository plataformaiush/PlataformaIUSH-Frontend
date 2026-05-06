import { Link } from 'react-router-dom'
import { Module } from '../../../domain/modules/types'

interface ModuleCardProps {
  module: Module
  courseId: string
  isLast?: boolean
}

export const ModuleCard = ({ module, courseId, isLast }: ModuleCardProps) => {
  const isActive = module.status === 'active'

  return (
    <tr className={!isLast ? 'border-b border-gray-100' : ''}>
      {/* Module name */}
      <td className="px-6 py-4">
        <Link
          to={`/courses/${courseId}/modules/${module.id}/contents`}
          className="text-sm font-semibold hover:underline"
          style={{ color: '#223740' }}
        >
          {module.title}
        </Link>
        <p className="mt-0.5 text-xs" style={{ color: '#5A878C' }}>
          Módulo {String(module.order).padStart(2, '0')}
        </p>
      </td>

      {/* Content count */}
      <td className="px-6 py-4 text-sm" style={{ color: '#223740' }}>
        {module.contentIds.length} contenidos
      </td>

      {/* Status toggle + badge */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          {/* Toggle switch */}
          <button
            className="relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors"
            style={{ backgroundColor: isActive ? '#5A878C' : '#d1d5db' }}
            title={isActive ? 'Desactivar' : 'Activar'}
          >
            <span
              className="inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform"
              style={{ transform: isActive ? 'translateX(18px)' : 'translateX(2px)' }}
            />
          </button>

          {/* Status badge */}
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold"
            style={
              isActive
                ? { backgroundColor: '#AEEBF2', color: '#223740' }
                : { backgroundColor: '#f3f4f6', color: '#6b7280' }
            }
          >
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: isActive ? '#5A878C' : '#9ca3af' }}
            />
            {isActive ? 'Activo' : 'Inactivo'}
          </span>
        </div>
      </td>

      {/* Actions */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          {/* View contents */}
          <Link
            to={`/courses/${courseId}/modules/${module.id}/contents`}
            className="flex h-7 w-7 items-center justify-center rounded border border-gray-200 text-gray-400 transition hover:border-gray-300 hover:text-gray-600"
            title="Ver contenidos"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </Link>

          {/* Delete */}
          <button
            className="flex h-7 w-7 items-center justify-center rounded border border-red-100 text-red-400 transition hover:border-red-200 hover:text-red-600"
            title="Eliminar módulo"
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