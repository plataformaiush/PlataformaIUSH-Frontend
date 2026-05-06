import { Link } from 'react-router-dom'
import { Course } from '../../../domain/courses/types'

interface CourseCardProps {
  course: Course
  isLast?: boolean
}

export const CourseCard = ({ course, isLast }: CourseCardProps) => {
  return (
    <tr className={!isLast ? 'border-b border-gray-100' : ''}>
      {/* Course name + description */}
      <td className="px-6 py-4">
        <Link
          to={`/courses/${course.id}/modules`}
          className="text-sm font-semibold hover:underline"
          style={{ color: '#223740' }}
        >
          {course.title}
        </Link>
        <p className="mt-0.5 text-xs" style={{ color: '#5A878C' }}>
          {course.description}
        </p>
      </td>

      {/* Modules */}
      <td className="px-6 py-4 text-sm" style={{ color: '#223740' }}>
        {course.moduleIds.length} módulos
      </td>

      {/* Students */}
      <td className="px-6 py-4 text-sm" style={{ color: '#223740' }}>
        {course.studentCount} est.
      </td>

      {/* Status badge */}
      <td className="px-6 py-4">
        <span
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
          style={
            course.status === 'active'
              ? { backgroundColor: '#AEEBF2', color: '#223740' }
              : { backgroundColor: '#f3f4f6', color: '#6b7280' }
          }
        >
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{
              backgroundColor: course.status === 'active' ? '#5A878C' : '#9ca3af'
            }}
          />
          {course.status === 'active' ? 'Activo' : 'Inactivo'}
        </span>
      </td>

      {/* Actions */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          {/* Add module */}
          <Link
            to={`/courses/${course.id}/modules/new`}
            className="flex h-7 w-7 items-center justify-center rounded border border-gray-200 text-gray-400 transition hover:border-gray-300 hover:text-gray-600"
            title="Agregar módulo"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </Link>

          {/* Edit */}
          <button
            className="flex h-7 w-7 items-center justify-center rounded border border-gray-200 text-gray-400 transition hover:border-gray-300 hover:text-gray-600"
            title="Editar curso"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 11l6.586-6.586a2 2 0 012.828 2.828L11.828 13.828A2 2 0 019 14H8v-1a2 2 0 01.586-1.414z" />
            </svg>
          </button>

          {/* Delete */}
          <button
            className="flex h-7 w-7 items-center justify-center rounded border border-red-100 text-red-400 transition hover:border-red-200 hover:text-red-600"
            title="Eliminar curso"
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