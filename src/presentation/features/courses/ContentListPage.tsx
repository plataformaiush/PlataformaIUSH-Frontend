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
      <main className="min-h-screen" style={{ backgroundColor: 'var(--color-background-page)' }}>
        <div className="flex items-center justify-center h-full">
          <p className="text-body" style={{ color: 'var(--color-text-secondary)' }}>Curso o módulo no encontrado.</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen" style={{ backgroundColor: 'var(--color-background-page)' }}>
      {/* Top bar */}
      <div className="border-b" style={{ borderColor: 'var(--color-borders)', backgroundColor: 'var(--color-background-card)' }}>
        <div className="px-8 py-4">
          <Link
            to={`/courses/${courseId}/modules`}
            className="flex items-center gap-2 btn btn-secondary text-body-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Volver a módulos
          </Link>
        </div>
      </div>

      <div className="px-8 py-6">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <span
              className="mb-3 inline-flex items-center gap-2 badge-pill text-label font-medium"
              style={{ backgroundColor: 'var(--color-tertiary)', color: 'var(--color-primary)' }}
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: 'var(--color-secondary)' }}
              />
              {course.title}
            </span>
            <h1 className="text-section-title" style={{ color: 'var(--color-text-primary)' }}>
              {module.title}
            </h1>
            <p className="mt-2 text-body" style={{ color: 'var(--color-text-secondary)' }}>
              Contenidos de este módulo
            </p>
          </div>
          <Link
            to={`/courses/${courseId}/modules/${moduleId}/contents/new`}
            className="btn btn-primary"
          >
            + Agregar contenido
          </Link>
        </div>

        {/* Table */}
        <div className="card overflow-hidden">
          {contents.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-body" style={{ color: 'var(--color-text-secondary)' }}>No hay contenidos en este módulo.</p>
              <Link
                to={`/courses/${courseId}/modules/${moduleId}/contents/new`}
                className="mt-3 inline-block text-body-sm font-medium hover:underline"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                Agregar el primero
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--color-borders)' }}>
                    <th 
                      className="px-6 py-4 text-left text-label uppercase tracking-wider"
                      style={{ color: 'var(--color-text-secondary)' }}
                      scope="col"
                    >
                      Contenido
                    </th>
                    <th 
                      className="px-6 py-4 text-left text-label uppercase tracking-wider"
                      style={{ color: 'var(--color-text-secondary)' }}
                      scope="col"
                    >
                      Tipo
                    </th>
                    <th 
                      className="px-6 py-4 text-left text-label uppercase tracking-wider"
                      style={{ color: 'var(--color-text-secondary)' }}
                      scope="col"
                    >
                      Orden
                    </th>
                    <th 
                      className="px-6 py-4 text-left text-label uppercase tracking-wider"
                      style={{ color: 'var(--color-text-secondary)' }}
                      scope="col"
                    >
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {contents.map((content, idx) => (
                    <ContentCard key={content.id} content={content} isLast={idx === contents.length - 1} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}