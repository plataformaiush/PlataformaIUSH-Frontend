import { useParams, Link } from 'react-router-dom'
import { ContentRepository } from '../../../domain/contents/contentRepository'
import { ModuleRepository } from '../../../domain/modules/moduleRepository'
import { CourseRepository } from '../../../domain/courses/courseRepository'
import { ContentCard } from './ContentCard'

export const ContentListPage = () => {
  const { courseId, moduleId } = useParams<{ courseId: string; moduleId: string }>()
  const course = courseId ? CourseRepository.getCourseById(courseId) : null
  const module = moduleId ? ModuleRepository.getModuleById(moduleId) : null
  const contents = moduleId ? ContentRepository.getContentsByModule(moduleId) : []

  if (!course || !module) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-sm" style={{ color: '#5A878C' }}>Curso o módulo no encontrado.</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <div className="border-b border-gray-200 bg-white px-8 py-3">
        <Link
          to={`/courses/${courseId}/modules`}
          className="flex items-center gap-1 text-sm"
          style={{ color: '#5A878C' }}
        >
          <span>‹</span> Volver a módulos
        </Link>
      </div>

      <div className="px-8 py-6">
        {/* Header */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <span
              className="mb-2 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
              style={{ backgroundColor: '#AEEBF2', color: '#223740' }}
            >
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: '#5A878C' }} />
              {course.title}
            </span>
            <h1 className="text-2xl font-bold" style={{ color: '#223740' }}>
              {module.title}
            </h1>
            <p className="mt-1 text-sm" style={{ color: '#5A878C' }}>
              Contenidos de este módulo
            </p>
          </div>
          <Link
            to={`/courses/${courseId}/modules/${moduleId}/contents/new`}
            className="inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
            style={{ backgroundColor: '#223740' }}
          >
            + Agregar contenido
          </Link>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          {contents.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-sm" style={{ color: '#5A878C' }}>No hay contenidos en este módulo.</p>
              <Link
                to={`/courses/${courseId}/modules/${moduleId}/contents/new`}
                className="mt-3 inline-block text-sm font-semibold underline"
                style={{ color: '#5A878C' }}
              >
                Agregar el primero
              </Link>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#5A878C' }}>Contenido</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#5A878C' }}>Tipo</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#5A878C' }}>Orden</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#5A878C' }}>Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#5A878C' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {contents.map((content, idx) => (
                  <ContentCard key={content.id} content={content} isLast={idx === contents.length - 1} />
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </main>
  )
}