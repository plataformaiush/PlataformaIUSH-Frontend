import { CourseCard } from './CourseCard'
import { SortableRow } from './SortableRow'
import { TableRowSkeleton, StatCardSkeleton, PageHeaderSkeleton } from './Skeletons'
import { Link, useNavigate } from 'react-router-dom'
import { useState, useMemo, useEffect, useCallback } from 'react'
import { Search, BookOpen, Users, TrendingUp, Plus, Grid, List, Edit, Trash2, Eye } from 'lucide-react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { fetchCursos, toggleCursoActivo, deleteCurso, updateCurso, reorderCursos, getCourseImageUrl } from '../../services/courseService'
import { fetchModulos, toggleModuloActivo } from '../../services/moduleService'
import type { Course } from '../../../domain/courses/types'
import { logger } from '../../utils/logger'
import { smartActivateCourse } from '../../../services/courseBusinessLogic'

export const CourseListPage = () => {
  const navigate = useNavigate()
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table')
  const [refreshKey] = useState(0)
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [togglingCourse, setTogglingCourse] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editStatus, setEditStatus] = useState<'active' | 'inactive'>('inactive')
  const [editSaving, setEditSaving] = useState(false)
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [hasMore, setHasMore] = useState(true)

  // --- Reorder (drag & drop) ---
  const [reorderMode, setReorderMode] = useState(false)
  const [reorderSaving, setReorderSaving] = useState(false)
  const [reorderWarning, setReorderWarning] = useState<string | null>(null)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = courses.findIndex(c => c.id === active.id)
    const newIndex = courses.findIndex(c => c.id === over.id)
    if (oldIndex < 0 || newIndex < 0) return

    const reordered = arrayMove(courses, oldIndex, newIndex)
    setCourses(reordered)
    setReorderSaving(true)

    try {
      const payload = reordered.map((c, idx) => ({ id_curso: c.id, orden: idx + 1 }))
      const updated = await reorderCursos(payload)
      setCourses(updated)
      setReorderWarning(null)
    } catch (error: any) {
      if (error?.notImplemented) {
        // Backend aún no expone el endpoint: mantenemos el orden visual y avisamos al usuario.
        logger.warn('Reorden de cursos solo local: backend no implementa /cursos/reorder')
        setReorderWarning('Cambios visuales aplicados. El backend aún no persiste el orden de cursos.')
      } else {
        logger.error('Error al reordenar cursos', { error })
        loadCourses(1, false)
      }
    } finally {
      setReorderSaving(false)
    }
  }

  const loadCourses = useCallback(async (pageNum: number = 1, append: boolean = false) => {
    try {
      setError(null)
      if (!append) setLoading(true)
      const data = await fetchCursos({ page: pageNum, limit })
      if (append) {
        setCourses(prev => [...prev, ...data])
      } else {
        setCourses(data)
      }
      setHasMore(data.length === limit)
      setPage(pageNum)
    } catch (error) {
      logger.error('Error al cargar cursos', { error })
      setError('No se pudieron cargar los cursos. Por favor intenta nuevamente.')
    } finally {
      setLoading(false)
    }
  }, [limit])

  useEffect(() => {
    loadCourses()
  }, [loadCourses])

  const handleLoadMore = () => {
    loadCourses(page + 1, true)
  }

  const handleToggleStatus = async (courseId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active'
    setTogglingCourse(courseId)
    
    try {
      if (newStatus === 'active') {
        // Use smart business logic for activation
        const result = await smartActivateCourse(courseId, toggleCursoActivo, toggleModuloActivo)
        
        if (result.success) {
          // Optimistic update
          setCourses(prev => prev.map(c => 
            c.id === courseId 
              ? { ...c, status: 'active' }
              : c
          ))
          setError(null)
          
          // Show success message if modules were auto-activated
          if (result.autoActivatedModules.length > 0) {
            setError(result.message)
            setTimeout(() => setError(null), 5000)
          }
        } else {
          setError(result.message)
          setTogglingCourse(null)
          return
        }
      } else {
        // Deactivation - cascade to modules
        const modules = await fetchModulos(courseId)
        const activeModules = modules.filter(m => m.status === 'active')
        
        await toggleCursoActivo(courseId, false)
        logger.info('Curso desactivado', { courseId, activeModuleCount: activeModules.length })
        
        // Deactivate all active modules in cascade
        if (activeModules.length > 0) {
          await Promise.all(
            activeModules.map(module => toggleModuloActivo(courseId, module.id, false))
          )
          logger.info('Módulos desactivados en cascada', { courseId, moduleCount: activeModules.length })
        }
        
        // Optimistic update
        setCourses(prev => prev.map(c => 
          c.id === courseId 
            ? { ...c, status: 'inactive' }
            : c
        ))
        
        setError(null)
      }
    } catch (error) {
      logger.error('Error al cambiar estado del curso', { error, courseId })
      
      // Mostrar mensaje de error específico
      const errorMessage = error instanceof Error ? error.message : 'No se pudo cambiar el estado del curso. Por favor intenta nuevamente.'
      setError(errorMessage)
      
      // Revert optimistic update
      setCourses(prev => prev.map(c => 
        c.id === courseId 
          ? { ...c, status: currentStatus as 'active' | 'inactive' }
          : c
      ))
    } finally {
      setTogglingCourse(null)
    }
  }
  
  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      const matchesFilter = 
        filter === 'all' || 
        (filter === 'active' && c.status === 'active') || 
        (filter === 'inactive' && c.status === 'inactive')
      
      const matchesSearch = 
        searchTerm === '' || 
        c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.instructor?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
      
      return matchesFilter && matchesSearch
    })
  }, [courses, filter, searchTerm])
  
  const activeCourses = useMemo(() => courses.filter((c) => c.status === 'active'), [courses])
  const totalStudents = useMemo(() => courses.reduce((sum, c) => sum + (c.studentCount ?? 0), 0), [courses])
  
  const handleDeleteCourse = async (courseId: string) => {
    setTogglingCourse(courseId)
    
    try {
      setError(null)
      
      // Optimistic update - remove course immediately from UI
      setCourses(prev => prev.filter(c => c.id !== courseId))
      
      await deleteCurso(courseId)
      logger.info('Curso eliminado reactivamente', { courseId })
    } catch (error) {
      logger.error('Error al eliminar curso', { error, courseId })
      setError('No se pudo eliminar el curso. Por favor intenta nuevamente.')
      // Revert optimistic update by reloading courses
      loadCourses()
    } finally {
      setTogglingCourse(null)
    }
  }
  
  const handleEditCourse = (courseId: string) => {
    const course = courses.find(c => c.id === courseId)
    if (!course) return
    setEditingCourse(course)
    setEditTitle(course.title)
    setEditDescription(course.description)
    setEditStatus(course.status)
  }

  const handleSaveEdit = async () => {
    if (!editingCourse || !editTitle.trim()) return
    setEditSaving(true)
    try {
      await updateCurso(editingCourse.id, { title: editTitle.trim(), description: editDescription.trim() })
      if (editStatus !== editingCourse.status) {
        await toggleCursoActivo(editingCourse.id, editStatus === 'active')
      }
      setEditingCourse(null)
      loadCourses()
    } catch (err) {
      logger.error('Error al actualizar curso', { error: err })
      alert('Error al guardar los cambios.')
    } finally {
      setEditSaving(false)
    }
  }
  
  const handleViewCourse = (courseId: string) => {
    navigate(`/courses/${courseId}`)
  }

  const handleAddModule = (courseId: string) => {
    navigate(`/courses/${courseId}/modules/new`)
  }

  if (loading) {
    return (
      <main style={{ backgroundColor: '#FAFAFA', fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
        <div className="border-b" style={{ borderColor: '#E5E7EB', backgroundColor: '#FFFFFF' }}>
          <div className="px-8 py-6">
            <PageHeaderSkeleton />
          </div>
        </div>
        <div className="px-8 py-8">
          <StatCardSkeleton count={3} />
          <div className="rounded-2xl border overflow-hidden" style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' }}>
            <table className="w-full">
              <tbody>
                <TableRowSkeleton cols={5} rows={6} />
              </tbody>
            </table>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main style={{ backgroundColor: 'var(--color-muted)', fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
      {/* Encabezado */}
      <div className="border-b" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-background)' }}>
        <div className="px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl" style={{ backgroundColor: 'var(--color-tertiary)' }}>
                <BookOpen className="w-6 h-6" style={{ color: 'var(--color-secondary)' }} />
              </div>
              <div>
                <h1 className="text-3xl font-bold" style={{ color: 'var(--color-primary)' }}>Gestión de Cursos</h1>
                <p className="mt-1 text-sm" style={{ color: 'var(--color-muted-foreground)' }}>Administra cursos, módulos y contenidos educativos</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setReorderMode(prev => !prev)}
                disabled={reorderSaving || courses.length < 2}
                className="inline-flex items-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm transition-all hover:opacity-90 disabled:opacity-50"
                style={{
                  backgroundColor: reorderMode ? 'var(--color-secondary)' : 'var(--color-tertiary)',
                  color: reorderMode ? '#FFFFFF' : 'var(--color-primary)',
                }}
                title={courses.length < 2 ? 'Necesitas al menos 2 cursos para reordenar' : ''}
              >
                {reorderMode ? 'Terminar reordenar' : 'Reordenar'}
              </button>
              <Link
                to="/courses/new"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all hover:opacity-90"
                style={{ backgroundColor: 'var(--color-primary)', color: '#FFFFFF' }}
              >
                <Plus className="w-5 h-5" />
                <span>Crear curso</span>
              </Link>
            </div>
          </div>
          
          {/* Búsqueda y Filtros */}
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2" style={{ color: 'var(--color-muted-foreground)', width: '20px', height: '20px' }} />
              <input
                type="text"
                placeholder="Buscar cursos por título, descripción o instructor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border transition-all focus:outline-none focus:ring-2"
                style={{ 
                  borderColor: 'var(--color-border)',
                  backgroundColor: 'var(--color-background)',
                  color: 'var(--color-foreground)',
                  fontSize: '14px'
                }}
              />
            </div>
            <div className="flex items-center gap-2">
              {/* Alternador de vista */}
              <div className="flex items-center rounded-xl p-1" style={{ backgroundColor: 'var(--color-muted)' }}>
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === 'table' 
                      ? 'bg-white shadow-sm' 
                      : ''
                  }`}
                >
                  <List className="w-4 h-4" style={{ color: viewMode === 'table' ? 'var(--color-primary)' : 'var(--color-muted-foreground)' }} />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === 'grid' 
                      ? 'bg-white shadow-sm' 
                      : ''
                  }`}
                >
                  <Grid className="w-4 h-4" style={{ color: viewMode === 'grid' ? 'var(--color-primary)' : 'var(--color-muted-foreground)' }} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-8 py-8">
        {/* Error Banner */}
        {error && (
          <div className="mb-6 p-4 rounded-xl border flex items-center gap-3" style={{ 
            backgroundColor: '#FEF2F2',
            borderColor: '#FECACA'
          }}>
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" style={{ color: '#DC2626' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm font-medium" style={{ color: '#DC2626' }}>{error}</p>
            <button 
              onClick={() => setError(null)}
              className="ml-auto hover:opacity-70 transition-opacity"
              style={{ color: '#DC2626' }}
            >
              ×
            </button>
          </div>
        )}

        {/* Tarjetas de estadísticas */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl border" style={{ backgroundColor: 'var(--color-background)', borderColor: 'var(--color-border)' }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--color-muted-foreground)' }}>Total Cursos</p>
                <p className="text-3xl font-bold mt-1" style={{ color: 'var(--color-primary)' }}>{courses.length}</p>
              </div>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--color-tertiary)' }}>
                <BookOpen className="w-6 h-6" style={{ color: 'var(--color-secondary)' }} />
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--color-secondary)' }} />
              <span style={{ color: 'var(--color-secondary)', fontWeight: 500 }}>Total</span>
            </div>
          </div>
          
          <div className="p-6 rounded-2xl border" style={{ backgroundColor: 'var(--color-background)', borderColor: 'var(--color-border)' }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--color-muted-foreground)' }}>Estudiantes Activos</p>
                <p className="text-3xl font-bold mt-1" style={{ color: 'var(--color-primary)' }}>{totalStudents.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--color-tertiary)' }}>
                <Users className="w-6 h-6" style={{ color: 'var(--color-secondary)' }} />
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--color-secondary)' }} />
              <span style={{ color: 'var(--color-secondary)', fontWeight: 500 }}>Total</span>
            </div>
          </div>
          
          <div className="p-6 rounded-2xl border" style={{ backgroundColor: 'var(--color-background)', borderColor: 'var(--color-border)' }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--color-muted-foreground)' }}>Cursos Activos</p>
                <p className="text-3xl font-bold mt-1" style={{ color: 'var(--color-primary)' }}>{activeCourses.length}</p>
              </div>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--color-tertiary)' }}>
                <TrendingUp className="w-6 h-6" style={{ color: 'var(--color-secondary)' }} />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span style={{ color: 'var(--color-muted-foreground)' }}>Tasa de activación</span>
                <span style={{ fontWeight: 500, color: 'var(--color-primary)' }}>
                  {courses.length ? Math.round((activeCourses.length / courses.length) * 100) : 0}%
                </span>
              </div>
              <div className="w-full rounded-full" style={{ backgroundColor: 'var(--color-border)', height: '8px' }}>
                <div 
                  className="rounded-full transition-all duration-500"
                  style={{ 
                    backgroundColor: 'var(--color-secondary)',
                    height: '8px',
                    width: `${courses.length ? (activeCourses.length / courses.length) * 100 : 0}%` 
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Pestañas de filtro */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center rounded-xl p-1" style={{ backgroundColor: 'var(--color-muted)' }}>
              {[
                { key: 'all', label: 'Todos', count: courses.length },
                { key: 'active', label: 'Activos', count: activeCourses.length },
                { key: 'inactive', label: 'Inactivos', count: courses.length - activeCourses.length }
              ].map(({ key, label, count }) => (
                <button
                  key={key}
                  onClick={() => setFilter(key as 'all' | 'active' | 'inactive')}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                    filter === key
                      ? 'bg-white'
                      : ''
                  }`}
                  style={{
                    color: filter === key ? 'var(--color-primary)' : 'var(--color-muted-foreground)'
                  }}
                >
                  <span>{label}</span>
                  {count > 0 && (
                    <span className="ml-2 px-2 py-0.5 rounded-full text-xs" style={{
                      backgroundColor: filter === key ? 'var(--color-tertiary)' : 'var(--color-border)',
                      color: filter === key ? 'var(--color-secondary)' : 'var(--color-muted-foreground)'
                    }}>
                      {count}
                    </span>
                  )}
                </button>
              ))}
            </div>
            
            {searchTerm && (
              <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--color-muted-foreground)' }}>
                <span>Resultados para:</span>
                <span style={{ fontWeight: 500, color: 'var(--color-primary)' }}>
                  "{searchTerm}"
                </span>
                <button
                  onClick={() => setSearchTerm('')}
                  className="hover:opacity-70 transition-opacity"
                  style={{ color: 'var(--color-muted-foreground)' }}
                >
                  ×
                </button>
              </div>
            )}
          </div>
          
          <div className="text-sm" style={{ color: 'var(--color-muted-foreground)' }}>
            {filteredCourses.length} {filteredCourses.length === 1 ? 'curso' : 'cursos'} encontrado{filteredCourses.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Vista Tabla/Cuadrícula */}
        {viewMode === 'table' ? (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block rounded-2xl border overflow-hidden" style={{ backgroundColor: 'var(--color-background)', borderColor: 'var(--color-border)' }}>
              {reorderMode && (
                <div className="px-4 py-3 text-sm flex items-center gap-3 border-b"
                  style={{ borderColor: 'var(--color-tertiary)', backgroundColor: '#F0FDFA', color: 'var(--color-primary)' }}>
                  <div className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-secondary)' }}>
                      <circle cx="9" cy="12" r="1"></circle>
                      <circle cx="9" cy="5" r="1"></circle>
                      <circle cx="9" cy="19" r="1"></circle>
                      <circle cx="15" cy="12" r="1"></circle>
                      <circle cx="15" cy="5" r="1"></circle>
                      <circle cx="15" cy="19" r="1"></circle>
                    </svg>
                    <span className="font-semibold">Modo reordenar activo</span>
                  </div>
                  <span style={{ color: 'var(--color-muted-foreground)' }}>— arrastra las filas para cambiar el orden</span>
                  {reorderSaving && <span className="ml-auto text-xs font-medium" style={{ color: 'var(--color-secondary)' }}>Guardando…</span>}
                </div>
              )}
              {reorderWarning && (
                <div className="px-4 py-3 text-sm border-b"
                  style={{ borderColor: '#FED7AA', backgroundColor: '#FFF7ED', color: '#9A3412' }}>
                  ⚠ {reorderWarning}
                </div>
              )}
              <div className="overflow-x-auto">
                {reorderMode ? (
                  <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext
                      items={courses.map(c => c.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <table className="w-full">
                        <thead>
                          <tr style={{ borderBottom: `1px solid var(--color-border)`, backgroundColor: 'var(--color-muted)' }}>
                            <th className="px-3 py-4 w-10" scope="col" aria-label="Reordenar" />
                            <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-muted-foreground)' }}>Curso</th>
                            <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-muted-foreground)' }}>Módulos</th>
                            <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-muted-foreground)' }}>Estudiantes</th>
                            <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-muted-foreground)' }}>Estado</th>
                            <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-muted-foreground)' }}>Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {courses.map((course) => (
                            <SortableRow key={`sortable-${course.id}`} id={course.id} disabled={reorderSaving}>
                              <CourseCard
                                course={course}
                                onDelete={handleDeleteCourse}
                                onEdit={handleEditCourse}
                                onView={handleViewCourse}
                                onToggleStatus={handleToggleStatus}
                                onAddModule={handleAddModule}
                                isToggling={togglingCourse === course.id}
                              />
                            </SortableRow>
                          ))}
                        </tbody>
                      </table>
                    </SortableContext>
                  </DndContext>
                ) : (
                  <table className="w-full">
                    <thead>
                      <tr style={{ borderBottom: `1px solid var(--color-border)`, backgroundColor: 'var(--color-muted)' }}>
                        <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-muted-foreground)' }}>Curso</th>
                        <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-muted-foreground)' }}>Módulos</th>
                        <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-muted-foreground)' }}>Estudiantes</th>
                        <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-muted-foreground)' }}>Estado</th>
                        <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-muted-foreground)' }}>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCourses.map((course, idx) => (
                        <tr
                          key={course.id}
                          className="transition-colors hover:bg-gray-50"
                          style={{
                            borderBottom: idx !== filteredCourses.length - 1 ? `1px solid var(--color-border)` : 'none'
                          }}
                        >
                          <CourseCard
                            key={`${course.id}-${refreshKey}`}
                            course={course}
                            isLast={idx === filteredCourses.length - 1}
                            onDelete={handleDeleteCourse}
                            onEdit={handleEditCourse}
                            onView={handleViewCourse}
                            onToggleStatus={handleToggleStatus}
                            onAddModule={handleAddModule}
                            isToggling={togglingCourse === course.id}
                          />
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
              
              {/* Botón Cargar Más */}
              {hasMore && !loading && (
                <div className="flex justify-center mt-6">
                  <button
                    onClick={handleLoadMore}
                    className="px-6 py-3 rounded-xl font-medium text-sm transition-all hover:opacity-80"
                    style={{
                      backgroundColor: 'var(--color-tertiary)',
                      color: 'var(--color-secondary)'
                    }}
                  >
                    Cargar más cursos
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Card View (Table Mode) */}
            <div className="md:hidden space-y-4">
              {filteredCourses.map((course) => (
                <div
                  key={`${course.id}-${refreshKey}`}
                  className="rounded-2xl border overflow-hidden transition-all hover:shadow-sm"
                  style={{ backgroundColor: 'var(--color-background)', borderColor: 'var(--color-border)' }}
                >
                  <div className="p-4">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--color-tertiary)' }}>
                        <BookOpen className="w-5 h-5" style={{ color: 'var(--color-secondary)' }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <button
                          onClick={() => handleViewCourse(course.id)}
                          className="text-left font-semibold hover:opacity-80 focus:outline-none"
                          style={{ color: 'var(--color-primary)', fontSize: '14px' }}
                        >
                          <div className="truncate">{course.title}</div>
                        </button>
                        <p className="text-sm truncate mt-1" style={{ color: 'var(--color-muted-foreground)', maxWidth: '250px' }}>
                          {course.description}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 mb-3 text-sm" style={{ color: 'var(--color-muted-foreground)' }}>
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-4 h-4" />
                        {course.moduleIds?.length || 0} módulos
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {course.studentCount ?? 'N/A'} estudiantes
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={async () => {
                            const newActivo = course.status !== 'active'
                            try {
                              await toggleCursoActivo(course.id, newActivo)
                              loadCourses()
                            } catch (error) {
                              logger.error('Error al cambiar estado', { error, courseId: course.id })
                            }
                          }}
                          className="relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors focus:outline-none"
                          style={{ backgroundColor: course.status === 'active' ? 'var(--color-secondary)' : '#9CA3AF' }}
                        >
                          <span
                            className="inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform"
                            style={{ transform: course.status === 'active' ? 'translateX(18px)' : 'translateX(2px)' }}
                          />
                        </button>
                        <span
                          className="text-xs font-medium px-2 py-1 rounded-full"
                          style={{
                            backgroundColor: course.status === 'active' ? 'var(--color-tertiary)' : 'var(--color-muted)',
                            color: course.status === 'active' ? 'var(--color-secondary)' : 'var(--color-muted-foreground)'
                          }}
                        >
                          {course.status === 'active' ? 'Activo' : 'Inactivo'}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewCourse(course.id)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border transition-all hover:opacity-80"
                          style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-background)', color: 'var(--color-muted-foreground)' }}
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleAddModule(course.id)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border transition-all hover:opacity-80"
                          style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-background)', color: 'var(--color-muted-foreground)' }}
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEditCourse(course.id)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border transition-all hover:opacity-80"
                          style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-background)', color: 'var(--color-muted-foreground)' }}
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCourse(course.id)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg transition-all hover:opacity-80"
                          style={{ backgroundColor: '#FEF2F2', borderColor: '#FEE2E2', color: '#DC2626' }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => {
              const imageUrl = getCourseImageUrl(course);
              return (
                <div
                  key={`${course.id}-${refreshKey}`}
                  className="rounded-2xl border overflow-hidden transition-all hover:shadow-lg hover:scale-[1.02] flex flex-col"
                  style={{ backgroundColor: 'var(--color-background)', borderColor: 'var(--color-border)' }}
                >
                  {/* Banner de imagen — altura fija */}
                  <div className="relative flex-shrink-0" style={{ height: '160px', backgroundColor: 'var(--color-tertiary)' }}>
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={course.title}
                        style={{ width: '100%', height: '160px', objectFit: 'cover', display: 'block' }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen className="w-14 h-14" style={{ color: 'var(--color-secondary)' }} />
                      </div>
                    )}
                    {/* Badge de estado */}
                    <div className="absolute top-3 right-3 z-10">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold shadow-sm" style={{
                        backgroundColor: course.status === 'active' ? '#10B981' : '#9CA3AF',
                        color: '#FFFFFF'
                      }}>
                        {course.status === 'active' ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                  </div>

                  {/* Contenido del producto */}
                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="font-bold text-base mb-1" style={{ color: 'var(--color-primary)' }}>{course.title}</h3>
                    <p className="text-sm mb-4 line-clamp-2" style={{ color: 'var(--color-muted-foreground)' }}>{course.description}</p>

                    {/* Stats */}
                    <div className="flex items-center gap-4 mb-4 text-sm" style={{ color: 'var(--color-muted-foreground)' }}>
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-4 h-4" />
                        {course.moduleIds?.length || 0} módulos
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {course.studentCount ?? 'N/A'} estudiantes
                      </span>
                    </div>

                    {/* Botones de acción */}
                    <div className="flex gap-2 mt-auto">
                      <button
                        onClick={() => handleViewCourse(course.id)}
                        className="flex-1 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all hover:opacity-90"
                        style={{ backgroundColor: 'var(--color-primary)', color: '#FFFFFF' }}
                      >
                        Ver
                      </button>
                      <button
                        onClick={() => handleEditCourse(course.id)}
                        className="px-4 py-2.5 rounded-xl font-semibold text-sm border transition-all hover:opacity-80"
                        style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-background)', color: 'var(--color-muted-foreground)' }}
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeleteCourse(course.id)}
                        className="px-4 py-2.5 rounded-xl font-semibold text-sm transition-all hover:opacity-80"
                        style={{ backgroundColor: '#FEE2E2', color: '#DC2626' }}
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        {/* Estado vacío */}
        {filteredCourses.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: 'var(--color-muted)' }}>
              <BookOpen className="w-12 h-12" style={{ color: 'var(--color-muted-foreground)' }} />
            </div>
            <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--color-primary)' }}>
              {searchTerm ? 'No se encontraron cursos' : 'No hay cursos disponibles'}
            </h3>
            <p className="mb-6" style={{ color: 'var(--color-muted-foreground)' }}>
              {searchTerm 
                ? `No hay resultados para "${searchTerm}". Intenta con otra búsqueda.`
                : 'Comienza creando tu primer curso para empezar a gestionar contenidos.'
              }
            </p>
            {!searchTerm && (
              <Link
                to="/courses/new"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all hover:opacity-90"
                style={{ backgroundColor: 'var(--color-primary)', color: '#FFFFFF' }}
              >
                <Plus className="w-5 h-5" />
                Crear primer curso
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Modal de edición */}
      {editingCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setEditingCourse(null)}>
          <div className="w-full max-w-lg mx-4 rounded-2xl bg-white shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="px-8 py-5 border-b flex items-center justify-between" style={{ borderColor: 'var(--color-border)' }}>
              <h2 className="text-xl font-bold" style={{ color: 'var(--color-primary)' }}>Editar curso</h2>
              <button onClick={() => setEditingCourse(null)} className="text-gray-400 hover:text-gray-600">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Body */}
            <div className="px-8 py-6 space-y-4 max-h-[70vh] overflow-y-auto">
              {/* Nombre */}
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--color-primary)' }}>
                  Nombre del curso <span style={{ color: '#DC2626' }}>*</span>
                </label>
                <input type="text" value={editTitle} onChange={e => setEditTitle(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 focus:outline-none text-sm"
                  style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-muted)', color: 'var(--color-foreground)' }} />
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--color-primary)' }}>Descripción</label>
                <textarea value={editDescription} onChange={e => setEditDescription(e.target.value)} rows={3}
                  className="w-full px-4 py-3 rounded-xl border-2 focus:outline-none text-sm resize-none"
                  style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-muted)', color: 'var(--color-foreground)' }} />
              </div>

              {/* Nivel + Instructor (solo visual, no persisten en backend) */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--color-primary)' }}>
                    Nivel
                    <span className="ml-1 text-xs font-normal" style={{ color: 'var(--color-muted-foreground)' }}>(solo visual)</span>
                  </label>
                  <select disabled className="w-full px-4 py-3 rounded-xl border-2 text-sm opacity-60 cursor-not-allowed"
                    style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-muted)', color: 'var(--color-muted-foreground)' }}
                    defaultValue={editingCourse.level}>
                    <option value="beginner">Principiante</option>
                    <option value="intermediate">Intermedio</option>
                    <option value="advanced">Avanzado</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--color-primary)' }}>
                    Docente
                    <span className="ml-1 text-xs font-normal" style={{ color: 'var(--color-muted-foreground)' }}>(solo visual)</span>
                  </label>
                  <input disabled type="text" defaultValue={editingCourse.instructor}
                    className="w-full px-4 py-3 rounded-xl border-2 text-sm opacity-60 cursor-not-allowed"
                    style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-muted)', color: 'var(--color-muted-foreground)' }} />
                </div>
              </div>

              {/* Estado */}
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--color-primary)' }}>Estado de publicación</label>
                <div className="flex gap-3">
                  {[
                    { value: 'inactive' as const, label: 'Inactivo', desc: 'No visible para estudiantes' },
                    { value: 'active'   as const, label: 'Activo',   desc: 'Visible para estudiantes' },
                  ].map(opt => (
                    <label key={opt.value} className="flex-1 cursor-pointer">
                      <input type="radio" className="sr-only" name="editStatus" value={opt.value}
                        checked={editStatus === opt.value} onChange={() => setEditStatus(opt.value)} />
                      <div className="p-3 rounded-xl border-2 transition-all"
                        style={{
                          borderColor: editStatus === opt.value ? 'var(--color-secondary)' : 'var(--color-border)',
                          backgroundColor: editStatus === opt.value ? 'var(--color-tertiary)' : 'var(--color-background)'
                        }}>
                        <p className="text-sm font-bold" style={{ color: 'var(--color-primary)' }}>{opt.label}</p>
                        <p className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>{opt.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <p className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>
                * Nivel y docente son campos informativos — para modificarlos usa el flujo de creación de un nuevo curso.
              </p>
            </div>

            {/* Footer */}
            <div className="px-8 py-5 border-t flex gap-3" style={{ borderColor: 'var(--color-border)' }}>
              <button onClick={() => setEditingCourse(null)}
                className="flex-1 py-3 rounded-xl border-2 text-sm font-semibold"
                style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-background)', color: 'var(--color-muted-foreground)' }}>
                Cancelar
              </button>
              <button onClick={handleSaveEdit} disabled={editSaving || !editTitle.trim()}
                className="flex-1 py-3 rounded-xl text-sm font-bold text-white disabled:opacity-50"
                style={{ backgroundColor: 'var(--color-primary)' }}>
                {editSaving ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}