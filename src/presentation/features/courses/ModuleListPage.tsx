import { useParams, Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { ModuleRepository } from '../../../domain/modules/moduleRepository'
import { CourseRepository } from '../../../domain/courses/courseRepository'
import { ModuleCard } from './ModuleCard'

export const ModuleListPage = () => {
  const { courseId } = useParams<{ courseId: string }>()
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [refreshKey, setRefreshKey] = useState(0)
  const course = courseId ? CourseRepository.getCourseById(courseId) : null
  const allModules = courseId ? ModuleRepository.getModulesByCourse(courseId) : []

  const handleModuleUpdate = () => {
    setRefreshKey(prev => prev + 1)
  }
  
  const filteredModules = allModules.filter((m) => {
    if (filter === 'active') return m.status === 'active'
    if (filter === 'inactive') return m.status === 'inactive'
    return true
  })

  if (!course) {
    return (
      <main className="min-h-screen" style={{ backgroundColor: 'var(--color-background-page)' }}>
        <div className="flex items-center justify-center h-full">
          <p className="text-body" style={{ color: 'var(--color-text-secondary)' }}>Curso no encontrado.</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen" style={{ backgroundColor: 'var(--color-background-page)' }}>
      {/* Top bar with breadcrumb + course badge */}
      <div className="border-b" style={{ borderColor: 'var(--color-borders)', backgroundColor: 'var(--color-background-card)' }}>
        <div className="px-8 py-4">
          <Link to="/courses" className="flex items-center gap-2 btn btn-secondary text-body-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Volver a cursos
          </Link>
        </div>
      </div>

      <div className="px-8 py-6">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            {/* Course badge */}
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
              Gestión de Módulos
            </h1>
            <p className="mt-2 text-body" style={{ color: 'var(--color-text-secondary)' }}>
              Al crear un módulo, el sistema redirige automáticamente al formulario de contenidos
            </p>
          </div>
          <Link
            to={`/courses/${courseId}/modules/new`}
            className="btn btn-primary"
          >
            + Crear módulo
          </Link>
        </div>

        {/* Filter tabs + count */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex gap-1 card-inner p-1" style={{ border: '1px solid var(--color-borders)' }}>
            {[
              { key: 'all', label: 'Todos' },
              { key: 'active', label: 'Activos' },
              { key: 'inactive', label: 'Inactivos' }
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilter(key as 'all' | 'active' | 'inactive')}
                className="badge transition text-body-sm font-medium"
                style={
                  filter === key
                    ? { backgroundColor: 'var(--color-primary)', color: 'white' }
                    : { color: 'var(--color-text-secondary)' }
                }
              >
                {label}
              </button>
            ))}
          </div>
          <span className="text-body-sm" style={{ color: 'var(--color-text-secondary)' }}>
            {filteredModules.length} módulos
          </span>
        </div>

        {/* Table */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-borders)' }}>
                  <th
                    className="px-6 py-4 text-left text-label uppercase tracking-wider"
                    style={{ color: 'var(--color-text-secondary)' }}
                    scope="col"
                  >
                    Módulo
                  </th>
                  <th
                    className="px-6 py-4 text-left text-label uppercase tracking-wider"
                    style={{ color: 'var(--color-text-secondary)' }}
                    scope="col"
                  >
                    Contenidos
                  </th>
                  <th
                    className="px-6 py-4 text-left text-label uppercase tracking-wider"
                    style={{ color: 'var(--color-text-secondary)' }}
                    scope="col"
                  >
                    Estado
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
                {filteredModules.map((module, idx) => (
                  <ModuleCard
                    key={`${module.id}-${refreshKey}`}
                    module={module}
                    courseId={courseId!}
                    isLast={idx === filteredModules.length - 1}
                    onModuleUpdate={handleModuleUpdate}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  )
}