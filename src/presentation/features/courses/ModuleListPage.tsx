import { useParams, Link } from 'react-router-dom'
import { useState, useEffect, useCallback } from 'react'
import { ModuleCard } from './ModuleCard'
import { fetchModulos } from '../../services/moduleService'
import { fetchCursoById } from '../../services/courseService'
import type { Module } from '../../../domain/modules/types'
import type { Course } from '../../../domain/courses/types'
import { logger } from '../../utils/logger'

export const ModuleListPage = () => {
  const { courseId } = useParams<{ courseId: string }>()
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [refreshKey, setRefreshKey] = useState(0)
  const [course, setCourse] = useState<Course | null>(null)
  const [allModules, setAllModules] = useState<Module[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    if (!courseId) return
    try {
      const [courseData, modulesData] = await Promise.all([
        fetchCursoById(courseId),
        fetchModulos(courseId)
      ])
      setCourse(courseData)
      setAllModules(modulesData)
    } catch (error) {
      logger.error('Error al cargar datos', { error, courseId })
    } finally {
      setLoading(false)
    }
  }, [courseId])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleModuleUpdate = () => {
    setRefreshKey(prev => prev + 1)
    loadData()
  }
  
  const filteredModules = allModules.filter((m) => {
    if (filter === 'active') return m.status === 'active'
    if (filter === 'inactive') return m.status === 'inactive'
    return true
  })

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FAFAFA' }}>
        <p className="text-sm" style={{ color: '#6B7280' }}>Cargando...</p>
      </main>
    )
  }

  if (!course) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FAFAFA' }}>
        <p className="text-sm" style={{ color: '#6B7280' }}>Curso no encontrado.</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen" style={{ backgroundColor: '#FAFAFA', fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
      {/* Top bar with back link */}
      <div className="border-b" style={{ borderColor: '#E5E7EB', backgroundColor: '#FFFFFF' }}>
        <div className="px-8 py-4">
          <Link
            to="/courses"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-80"
            style={{ backgroundColor: '#F3F4F6', color: '#6B7280' }}
          >
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
              className="mb-3 inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium"
              style={{ backgroundColor: '#AEEBF2', color: '#223740' }}
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: '#5A878C' }}
              />
              {course.title}
            </span>
            <h1 className="text-3xl font-bold" style={{ color: '#223740' }}>
              Gestión de Módulos
            </h1>
            <p className="mt-2 text-sm" style={{ color: '#6B7280' }}>
              Al crear un módulo, el sistema redirige automáticamente al formulario de contenidos
            </p>
          </div>
          <Link
            to={`/courses/${courseId}/modules/new`}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all hover:opacity-90"
            style={{ backgroundColor: '#223740', color: '#FFFFFF' }}
          >
            + Crear módulo
          </Link>
        </div>

        {/* Filter tabs + count */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center rounded-xl p-1" style={{ backgroundColor: '#F3F4F6' }}>
            {[
              { key: 'all', label: 'Todos' },
              { key: 'active', label: 'Activos' },
              { key: 'inactive', label: 'Inactivos' }
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilter(key as 'all' | 'active' | 'inactive')}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                  filter === key ? 'bg-white shadow-sm' : ''
                }`}
                style={{ color: filter === key ? '#223740' : '#6B7280' }}
              >
                {label}
              </button>
            ))}
          </div>
          <span className="text-sm" style={{ color: '#6B7280' }}>
            {filteredModules.length} módulos
          </span>
        </div>

        {/* Table */}
        <div className="rounded-2xl border overflow-hidden" style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' }}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid #E5E7EB', backgroundColor: '#FAFAFA' }}>
                  <th
                    className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider"
                    style={{ color: '#6B7280' }}
                    scope="col"
                  >
                    Módulo
                  </th>
                  <th
                    className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider"
                    style={{ color: '#6B7280' }}
                    scope="col"
                  >
                    Contenidos
                  </th>
                  <th
                    className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider"
                    style={{ color: '#6B7280' }}
                    scope="col"
                  >
                    Estado
                  </th>
                  <th
                    className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider"
                    style={{ color: '#6B7280' }}
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