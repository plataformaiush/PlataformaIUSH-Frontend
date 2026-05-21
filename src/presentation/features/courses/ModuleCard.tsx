import { Link } from 'react-router-dom'
import { Module } from '../../../domain/modules/types'
import { toggleModuloActivo, deleteModulo, fetchModulos } from '../../services/moduleService'
import { toggleCursoActivo, fetchCursoById } from '../../services/courseService'
import { logger } from '../../utils/logger'

interface ModuleCardProps {
  module: Module
  courseId: string
  isLast?: boolean
  onModuleUpdate?: () => void
}

export const ModuleCard = ({ module, courseId, isLast, onModuleUpdate }: ModuleCardProps) => {
  const isActive = module.status === 'active'

  const handleToggleStatus = async () => {
    // Si se va a desactivar el módulo, verificar si es el último activo
    if (isActive) {
      try {
        const allModules = await fetchModulos(courseId)
        const activeModules = allModules.filter(m => m.status === 'active')
        
        // Si es el último módulo activo, advertir y desactivar el curso
        if (activeModules.length === 1) {
          const confirmed = window.confirm(
            `¿Estás seguro de que quieres desactivar este módulo?\n\n` +
            `Este es el último módulo activo del curso. Al desactivarlo, el curso también se desactivará automáticamente.\n\n` +
            `El curso y sus módulos no serán visibles para los estudiantes.`
          )
          
          if (!confirmed) {
            return
          }

          // Desactivar el curso después de desactivar el módulo
          await toggleCursoActivo(courseId, false)
          logger.info('Curso desactivado por falta de módulos activos', { courseId })
        }
      } catch (error) {
        logger.error('Error al verificar módulos activos o desactivar curso', { error, courseId })
      }
    } else {
      // Si se va a activar el módulo, verificar si el curso está inactivo
      try {
        const course = await fetchCursoById(courseId)
        if (course && course.status === 'inactive') {
          const confirmed = window.confirm(
            `¿Estás seguro de que quieres activar este módulo?\n\n` +
            `El curso está actualmente inactivo. Al activar este módulo, el curso también se activará automáticamente.\n\n` +
            `El curso y sus módulos serán visibles para los estudiantes.`
          )
          
          if (!confirmed) {
            return
          }

          // Activar el curso antes de activar el módulo
          await toggleCursoActivo(courseId, true)
          logger.info('Curso activado al activar módulo', { courseId })
        }
      } catch (error) {
        logger.error('Error al verificar estado del curso o activarlo', { error, courseId })
      }
    }

    try {
      await toggleModuloActivo(module.courseId, module.id, !isActive)
      onModuleUpdate?.()
    } catch (error) {
      logger.error('Error al cambiar estado del módulo', { error, moduleId: module.id, courseId })
    }
  }

  return (
    <tr 
      className="transition-colors hover:bg-gray-50" 
      style={{ 
        borderBottom: !isLast ? '1px solid #E5E7EB' : 'none'
      }}
    >
      {/* Module name */}
      <td className="px-6 py-5">
        <Link
          to={`/courses/${courseId}/modules/${module.id}/contents`}
          className="font-semibold hover:underline focus:outline-none transition-colors"
          style={{ color: '#223740', fontSize: '14px' }}
        >
          {module.title}
        </Link>
        <p className="mt-1 text-xs" style={{ color: '#6B7280' }}>
          Módulo {String(module.order).padStart(2, '0')}
        </p>
      </td>

      {/* Content count */}
      <td className="px-6 py-5">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#AEEBF2' }}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" style={{ color: '#223740' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <span className="text-sm font-medium" style={{ color: '#223740' }}>
            {module.contentIds.length} contenidos
          </span>
        </div>
      </td>

      {/* Status toggle + badge */}
      <td className="px-6 py-5">
        <div className="flex items-center gap-3">
          {/* Toggle switch */}
          <button
            className="relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors focus:outline-none"
            style={{ backgroundColor: isActive ? '#5A878C' : '#9CA3AF' }}
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
        </div>
      </td>

      {/* Actions */}
      <td className="px-6 py-5">
        <div className="flex items-center gap-2">
          {/* View contents */}
          <Link
            to={`/courses/${courseId}/modules/${module.id}/contents`}
            className="flex h-8 w-8 items-center justify-center rounded-lg border transition-all hover:opacity-80"
            style={{ borderColor: '#E5E7EB', backgroundColor: '#FFFFFF', color: '#6B7280' }}
            title="Ver contenidos"
            aria-label={`Ver contenidos de ${module.title}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </Link>

          {/* Delete */}
          <button
            onClick={async () => {
              if (window.confirm('¿Estás seguro de que quieres eliminar este módulo? Esta acción no se puede deshacer.')) {
                try {
                  await deleteModulo(courseId, module.id)
                  onModuleUpdate?.()
                } catch (error) {
                  logger.error('Error al eliminar módulo', { error, moduleId: module.id, courseId })
                }
              }
            }}
            className="flex h-8 w-8 items-center justify-center rounded-lg transition-all hover:opacity-80"
            style={{ borderColor: '#FECACA', color: '#EF4444', backgroundColor: '#FEF2F2' }}
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