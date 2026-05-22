import { useParams, Link } from 'react-router-dom'
import { useState, useEffect, useCallback } from 'react'
import { ContentCard } from './ContentCard'
import { fetchContenidos } from '../../services/contentService'
import { fetchModuloById } from '../../services/moduleService'
import { fetchCursoById } from '../../services/courseService'
import type { Content } from '../../../domain/contents/types'
import type { Module } from '../../../domain/modules/types'
import type { Course } from '../../../domain/courses/types'
import { logger } from '../../utils/logger'

export const ContentListPage = () => {
  const { courseId, moduleId } = useParams<{ courseId: string; moduleId: string }>()
  const [course, setCourse] = useState<Course | null>(null)
  const [module, setModule] = useState<Module | null>(null)
  const [contents, setContents] = useState<Content[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)

  const loadData = useCallback(async () => {
    if (!courseId || !moduleId) return
    try {
      const [courseData, moduleData, contentsData] = await Promise.all([
        fetchCursoById(courseId),
        fetchModuloById(courseId, moduleId),
        fetchContenidos(moduleId)
      ])
      setCourse(courseData)
      setModule(moduleData)
      setContents(contentsData)
    } catch (error) {
      logger.error('Error al cargar datos', { error, courseId, moduleId })
    } finally {
      setLoading(false)
    }
  }, [courseId, moduleId])

  const handleContentUpdate = () => {
    setRefreshKey(prev => prev + 1)
    loadData()
  }

  useEffect(() => {
    loadData()
  }, [loadData])

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FAFAFA' }}>
        <p className="text-sm" style={{ color: '#6B7280' }}>Cargando...</p>
      </main>
    )
  }

  if (!course || !module) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FAFAFA' }}>
        <p className="text-sm" style={{ color: '#6B7280' }}>Curso o módulo no encontrado.</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen" style={{ backgroundColor: '#FAFAFA', fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
      {/* Top bar */}
      <div className="border-b" style={{ borderColor: '#E5E7EB', backgroundColor: '#FFFFFF' }}>
        <div className="px-8 py-4">
          <Link
            to={`/courses/${courseId}`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-80"
            style={{ backgroundColor: '#F3F4F6', color: '#6B7280' }}
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
              {module.title}
            </h1>
            <p className="mt-2 text-sm" style={{ color: '#6B7280' }}>
              Contenidos de este módulo
            </p>
          </div>
          <Link
            to={`/courses/${courseId}/modules/${moduleId}/contents/new`}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all hover:opacity-90"
            style={{ backgroundColor: '#223740', color: '#FFFFFF' }}
          >
            + Agregar contenido
          </Link>
        </div>

        {/* Table */}
        <div className="rounded-2xl border overflow-hidden" style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' }}>
          {contents.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-sm" style={{ color: '#6B7280' }}>No hay contenidos en este módulo.</p>
              <Link
                to={`/courses/${courseId}/modules/${moduleId}/contents/new`}
                className="mt-3 inline-block text-sm font-medium hover:underline"
                style={{ color: '#5A878C' }}
              >
                Agregar el primero
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: '1px solid #E5E7EB', backgroundColor: '#FAFAFA' }}>
                    <th 
                      className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider"
                      style={{ color: '#6B7280' }}
                      scope="col"
                    >
                      Contenido
                    </th>
                    <th 
                      className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider"
                      style={{ color: '#6B7280' }}
                      scope="col"
                    >
                      Tipo
                    </th>
                    <th 
                      className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider"
                      style={{ color: '#6B7280' }}
                      scope="col"
                    >
                      Orden
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
                  {contents.map((content, idx) => (
                    <ContentCard 
                      key={`${content.id}-${refreshKey}`} 
                      content={content} 
                      isLast={idx === contents.length - 1}
                      onContentUpdate={handleContentUpdate}
                    />
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