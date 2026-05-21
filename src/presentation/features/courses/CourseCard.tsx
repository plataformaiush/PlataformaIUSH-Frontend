import { Link } from 'react-router-dom'
import { Course } from '../../../domain/courses/types'
import { Eye, Edit, Trash2, Plus, BookOpen, Users, Loader2 } from 'lucide-react'

interface CourseCardProps {
  course: Course
  isLast?: boolean
  onDelete?: (courseId: string) => void
  onEdit?: (courseId: string) => void
  onView?: (courseId: string) => void
  onToggleStatus?: (courseId: string, currentStatus: string) => void
  onAddModule?: (courseId: string) => void
  isToggling?: boolean
}

export const CourseCard = ({ course, isLast, onDelete, onEdit, onView, onToggleStatus, onAddModule, isToggling }: CourseCardProps) => {
  const isActive = course.status === 'active'

  const handleToggleStatus = () => {
    onToggleStatus?.(course.id, course.status)
  }
  return (
    <>
      {/* Nombre del curso + descripción */}
      <td className="px-6 py-4" role="cell">
        <div className="flex items-center gap-3 h-full" style={{ minHeight: '80px' }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#AEEBF2' }}>
            <BookOpen className="w-5 h-5" style={{ color: '#5A878C' }} />
          </div>
          <div className="flex-1 min-w-0 flex flex-col justify-center">
            <button
              onClick={() => onView?.(course.id)}
              className="text-left font-semibold hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 rounded transition-opacity"
              style={{ 
                color: '#223740',
                fontSize: '14px'
              }}
              aria-label={`Ver detalles del curso: ${course.title}`}
            >
              <div className="truncate" style={{ maxWidth: '300px' }}>
                {course.title}
              </div>
            </button>
            <p className="text-sm truncate mt-2" style={{ 
              color: '#6B7280', 
              lineHeight: '1.5',
              maxWidth: '300px',
              maxHeight: '40px',
              overflow: 'hidden'
            }}>
              {course.description}
            </p>
            <div className="flex items-center gap-4 mt-3" style={{ fontSize: '12px', color: '#6B7280' }}>
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {course.studentCount} estudiantes
              </span>
              <span className="flex items-center gap-1">
                <BookOpen className="w-3 h-3" />
                {course.moduleIds?.length || 0} módulos
              </span>
            </div>
          </div>
        </div>
      </td>

      {/* Módulos */}
      <td className="px-6 py-4" role="cell">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#AEEBF2' }}>
            <BookOpen className="w-4 h-4" style={{ color: '#5A878C' }} />
          </div>
          <div className="flex flex-col justify-center">
            <span className="text-sm font-semibold" style={{ color: '#223740' }}>
              {course.moduleIds?.length || 0}
            </span>
            <span className="text-xs" style={{ color: '#6B7280' }}>módulos</span>
          </div>
        </div>
      </td>

      {/* Estudiantes */}
      <td className="px-6 py-4" role="cell">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#AEEBF2' }}>
            <Users className="w-4 h-4" style={{ color: '#5A878C' }} />
          </div>
          <div className="flex flex-col justify-center">
            <span className="text-sm font-semibold" style={{ color: '#223740' }}>
              {course.studentCount.toLocaleString()}
            </span>
            <span className="text-xs" style={{ color: '#6B7280' }}>estudiantes</span>
          </div>
        </div>
      </td>

      {/* Interruptor de estado + insignia */}
      <td className="px-6 py-4" role="cell">
        <div className="flex items-center gap-3">
          {/* Interruptor */}
          <button
            className="relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: isActive ? '#5A878C' : '#9CA3AF' }}
            title={isActive ? 'Desactivar' : 'Activar'}
            onClick={handleToggleStatus}
            disabled={isToggling}
          >
            {isToggling ? (
              <Loader2 className="absolute inset-0 m-auto h-3 w-3 animate-spin text-white" />
            ) : (
              <span
                className="inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform"
                style={{ transform: isActive ? 'translateX(18px)' : 'translateX(2px)' }}
              />
            )}
          </button>

          {/* Insignia de estado */}
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

      {/* Acciones */}
      <td className="px-6 py-4" role="cell">
        <div className="flex items-center gap-2" role="group" aria-label="Acciones del curso">
          {/* Ver */}
          <button
            onClick={() => onView?.(course.id)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border transition-all hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2"
            style={{ 
              borderColor: '#E5E7EB',
              backgroundColor: '#FFFFFF',
              color: '#6B7280'
            }}
            title="Ver curso"
            aria-label={`Ver curso: ${course.title}`}
          >
            <Eye className="h-4 w-4" />
          </button>

          {/* Agregar módulo */}
          <button
            onClick={() => onAddModule?.(course.id)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border transition-all hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2"
            style={{
              borderColor: '#E5E7EB',
              backgroundColor: '#FFFFFF',
              color: '#6B7280'
            }}
            title="Agregar módulo"
            aria-label={`Agregar módulo a ${course.title}`}
          >
            <Plus className="h-4 w-4" />
          </button>

          {/* Editar */}
          <button
            onClick={() => onEdit?.(course.id)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border transition-all hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2"
            style={{ 
              borderColor: '#E5E7EB',
              backgroundColor: '#FFFFFF',
              color: '#6B7280'
            }}
            title="Editar curso"
            aria-label={`Editar curso: ${course.title}`}
          >
            <Edit className="h-4 w-4" />
          </button>

          {/* Eliminar */}
          <button
            onClick={() => onDelete?.(course.id)}
            className="flex h-8 w-8 items-center justify-center rounded-lg transition-all hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2"
            style={{ 
              borderColor: '#FEE2E2',
              backgroundColor: '#FEF2F2',
              color: '#DC2626'
            }}
            title="Eliminar curso"
            aria-label={`Eliminar curso: ${course.title}`}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </td>
    </>
  )
}