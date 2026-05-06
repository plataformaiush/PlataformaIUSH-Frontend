import { useParams, Link } from 'react-router-dom'
import { ModuleRepository } from '../../../domain/modules/moduleRepository'
import { CourseRepository } from '../../../domain/courses/courseRepository'
import { ModuleCard } from './ModuleCard'

export const ModuleListPage = () => {
  const { courseId } = useParams<{ courseId: string }>()
  const course = courseId ? CourseRepository.getCourseById(courseId) : null
  const modules = courseId ? ModuleRepository.getModulesByCourse(courseId) : []

  if (!course) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-sm" style={{ color: '#5A878C' }}>Curso no encontrado.</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Top bar with breadcrumb + course badge */}
      <div className="border-b border-gray-200 bg-white px-8 py-3">
        <Link to="/courses" className="flex items-center gap-1 text-sm" style={{ color: '#5A878C' }}>
          <span>‹</span> Volver a cursos
        </Link>
      </div>

      <div className="px-8 py-6">
        {/* Header */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            {/* Course badge */}
            <span
              className="mb-2 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
              style={{ backgroundColor: '#AEEBF2', color: '#223740' }}
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: '#5A878C' }}
              />
              {course.title}
            </span>
            <h1 className="text-2xl font-bold" style={{ color: '#223740' }}>
              Gestión de Módulos
            </h1>
            <p className="mt-1 text-sm" style={{ color: '#5A878C' }}>
              Al crear un módulo, el sistema redirige automáticamente al formulario de contenidos
            </p>
          </div>
          <Link
            to={`/courses/${courseId}/modules/new`}
            className="inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
            style={{ backgroundColor: '#223740' }}
          >
            + Crear módulo ↗
          </Link>
        </div>

        {/* Filter tabs + count */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex gap-1 rounded-lg border border-gray-200 bg-white p-1">
            {['Todos', 'Activos', 'Inactivos'].map((tab) => (
              <button
                key={tab}
                className="rounded-md px-4 py-1.5 text-sm font-medium transition"
                style={
                  tab === 'Todos'
                    ? { backgroundColor: '#223740', color: 'white' }
                    : { color: '#5A878C' }
                }
              >
                {tab}
              </button>
            ))}
          </div>
          <span className="text-sm" style={{ color: '#5A878C' }}>
            {modules.length} módulos
          </span>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th
                  className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                  style={{ color: '#5A878C' }}
                >
                  Nombre del Módulo
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                  style={{ color: '#5A878C' }}
                >
                  Contenidos
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                  style={{ color: '#5A878C' }}
                >
                  Estado
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                  style={{ color: '#5A878C' }}
                >
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {modules.map((module, idx) => (
                <ModuleCard
                  key={module.id}
                  module={module}
                  courseId={courseId!}
                  isLast={idx === modules.length - 1}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  )
}