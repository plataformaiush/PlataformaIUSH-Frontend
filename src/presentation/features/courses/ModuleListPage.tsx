import { useParams, Link } from 'react-router-dom'
import { useState, useEffect, useCallback } from 'react'
import { ModuleCard } from './ModuleCard'
import { fetchModulos, updateModulo } from '../../services/moduleService'
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
  const [editingModule, setEditingModule] = useState<Module | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editOrder, setEditOrder] = useState(1)
  const [editSaving, setEditSaving] = useState(false)

  const loadData = useCallback(async () => {
    if (!courseId) return
    try {
      const courseData = await fetchCursoById(courseId)
      setCourse(courseData)
      try {
        const modulesData = await fetchModulos(courseId)
        setAllModules(modulesData)
      } catch (modErr) {
        logger.error('Error al cargar módulos', { error: modErr, courseId })
      }
    } catch (error: any) {
      logger.error('Error al cargar curso', { error: error?.message || error, courseId })
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

  const handleEditModule = (module: Module) => {
    setEditingModule(module)
    setEditTitle(module.title)
    setEditDescription(module.description)
    setEditOrder(module.order)
  }

  const handleSaveEdit = async () => {
    if (!editingModule || !courseId || !editTitle.trim()) return
    setEditSaving(true)
    try {
      await updateModulo(courseId, editingModule.id, {
        title: editTitle.trim(),
        description: editDescription.trim(),
        order: editOrder,
      })
      setEditingModule(null)
      loadData()
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Error al guardar los cambios.'
      alert(msg)
    } finally {
      setEditSaving(false)
    }
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
        <div className="text-center space-y-3">
          <p className="text-sm font-semibold" style={{ color: '#223740' }}>No se pudo cargar el curso.</p>
          <p className="text-xs" style={{ color: '#6B7280' }}>ID: {courseId}</p>
          <button onClick={() => window.location.reload()}
            className="text-xs px-4 py-2 rounded-lg"
            style={{ backgroundColor: '#AEEBF2', color: '#223740' }}>
            Reintentar
          </button>
        </div>
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
                    onEdit={handleEditModule}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal de edición de módulo */}
      {editingModule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setEditingModule(null)}>
          <div className="w-full max-w-lg mx-4 rounded-2xl bg-white shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="px-8 py-5 border-b flex items-center justify-between" style={{ borderColor: '#E5E7EB' }}>
              <h2 className="text-xl font-bold" style={{ color: '#223740' }}>Editar módulo</h2>
              <button onClick={() => setEditingModule(null)} className="text-gray-400 hover:text-gray-600">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="px-8 py-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#223740' }}>
                  Título <span style={{ color: '#DC2626' }}>*</span>
                </label>
                <input type="text" value={editTitle} onChange={e => setEditTitle(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 focus:outline-none text-sm"
                  style={{ borderColor: '#E5E7EB', backgroundColor: '#FAFAFA', color: '#223740' }} />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#223740' }}>Descripción</label>
                <textarea value={editDescription} onChange={e => setEditDescription(e.target.value)} rows={3}
                  className="w-full px-4 py-3 rounded-xl border-2 focus:outline-none text-sm resize-none"
                  style={{ borderColor: '#E5E7EB', backgroundColor: '#FAFAFA', color: '#223740' }} />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#223740' }}>Orden</label>
                <input type="number" min={1} value={editOrder} onChange={e => setEditOrder(Number(e.target.value))}
                  className="w-32 px-4 py-3 rounded-xl border-2 focus:outline-none text-sm"
                  style={{ borderColor: '#E5E7EB', backgroundColor: '#FAFAFA', color: '#223740' }} />
              </div>
            </div>

            <div className="px-8 py-5 border-t flex gap-3" style={{ borderColor: '#E5E7EB' }}>
              <button onClick={() => setEditingModule(null)}
                className="flex-1 py-3 rounded-xl border-2 text-sm font-semibold"
                style={{ borderColor: '#E5E7EB', backgroundColor: '#FFFFFF', color: '#6B7280' }}>
                Cancelar
              </button>
              <button onClick={handleSaveEdit} disabled={editSaving || !editTitle.trim()}
                className="flex-1 py-3 rounded-xl text-sm font-bold text-white disabled:opacity-50"
                style={{ backgroundColor: '#223740' }}>
                {editSaving ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}