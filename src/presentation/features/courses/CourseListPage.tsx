import { CourseCard } from './CourseCard'
import { Link, useNavigate } from 'react-router-dom'
import { useState, useMemo, useEffect, useCallback } from 'react'
import { Search, BookOpen, Users, TrendingUp, Plus, Filter, Grid, List, MoreVertical, Edit, Trash2, Eye } from 'lucide-react'
import { fetchCursos, toggleCursoActivo, deleteCurso, updateCurso } from '../../services/courseService'
import { fetchModulos, toggleModuloActivo } from '../../services/moduleService'
import type { Course } from '../../../domain/courses/types'
import { logger } from '../../utils/logger'
import { useInstitution } from '../../../context/InstitutionContext'

export const CourseListPage = () => {
  const { colors } = useInstitution()
  const navigate = useNavigate()
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table')
  const [refreshKey, setRefreshKey] = useState(0)
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

  const handleCourseUpdate = () => {
    setRefreshKey(prev => prev + 1)
    setPage(1)
    loadCourses(1, false)
  }

  const handleLoadMore = () => {
    loadCourses(page + 1, true)
  }

  const handleToggleStatus = async (courseId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active'
    
    // Si se va a desactivar el curso, mostrar advertencia y desactivar módulos en cascada
    if (newStatus === 'inactive') {
      try {
        const modules = await fetchModulos(courseId)
        const activeModules = modules.filter(m => m.status === 'active')
        
        const confirmed = window.confirm(
          `¿Estás seguro de que quieres desactivar este curso?\n\n` +
          `Esta acción también desactivará ${activeModules.length} módulo(s) activo(s) asociado(s) al curso.\n\n` +
          `El curso y sus módulos no serán visibles para los estudiantes.`
        )
        
        if (!confirmed) {
          return
        }

        setTogglingCourse(courseId)
        
        // Optimistic update
        setCourses(prev => prev.map(c => 
          c.id === courseId 
            ? { ...c, status: newStatus }
            : c
        ))

        // Primero desactivar el curso
        await toggleCursoActivo(courseId, false)
        logger.info('Curso desactivado', { courseId })

        // Luego desactivar todos los módulos activos en cascada
        if (activeModules.length > 0) {
          await Promise.all(
            activeModules.map(module => toggleModuloActivo(courseId, module.id, false))
          )
          logger.info('Módulos desactivados en cascada', { courseId, moduleCount: activeModules.length })
        }

        setError(null)
        return
      } catch (error) {
        logger.error('Error al desactivar curso o módulos', { error, courseId })
        setError('No se pudo desactivar el curso. Por favor intenta nuevamente.')
        // Revert optimistic update
        setCourses(prev => prev.map(c => 
          c.id === courseId 
            ? { ...c, status: currentStatus as 'active' | 'inactive' }
            : c
        ))
        setTogglingCourse(null)
        return
      }
    }

    setTogglingCourse(courseId)
    
    // Optimistic update
    setCourses(prev => prev.map(c => 
      c.id === courseId 
        ? { ...c, status: newStatus }
        : c
    ))

    try {
      await toggleCursoActivo(courseId, newStatus === 'active')
      setError(null)
    } catch (error) {
      logger.error('Error al cambiar estado del curso', { error, courseId })
      setError('No se pudo cambiar el estado del curso. Por favor intenta nuevamente.')
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
  const newThisMonth = useMemo(() => Math.floor(Math.random() * 5) + 1, []) // Simulated data
  
  const handleDeleteCourse = async (courseId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este curso? Esta acción no se puede deshacer.')) {
      try {
        setError(null)
        await deleteCurso(courseId)
        loadCourses()
      } catch (error) {
        logger.error('Error al eliminar curso', { error, courseId })
        setError('No se pudo eliminar el curso. Por favor intenta nuevamente.')
      }
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
      <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FAFAFA' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" style={{ borderColor: '#5A878C', borderTopColor: '#223740' }} />
          <p className="text-sm" style={{ color: '#6B7280' }}>Cargando cursos...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen" style={{ backgroundColor: '#FAFAFA', fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
      {/* Encabezado */}
      <div className="border-b" style={{ borderColor: '#E5E7EB', backgroundColor: '#FFFFFF' }}>
        <div className="px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <nav className="mb-3 flex items-center gap-2 text-sm" style={{ color: '#6B7280' }}>
                <Link
                  to="/super-admin/cursos"
                  className="hover:opacity-80 transition-opacity"
                  style={{ color: colors.primary }}
                >
                  Cursos
                </Link>
                <span style={{ color: '#D1D5DB' }}>/</span>
                <span style={{ fontWeight: 500, color: '#223740' }}>Gestión</span>
              </nav>
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl" style={{ backgroundColor: '#AEEBF2' }}>
                  <BookOpen className="w-6 h-6" style={{ color: '#5A878C' }} />
                </div>
                <div>
                  <h1 className="text-3xl font-bold" style={{ color: '#223740' }}>Gestión de Cursos</h1>
                  <p className="mt-1 text-sm" style={{ color: '#6B7280' }}>Administra cursos, módulos y contenidos educativos</p>
                </div>
              </div>
            </div>
            <div>
              <Link
                to="/courses/new"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all hover:opacity-90"
                style={{ backgroundColor: '#223740', color: '#FFFFFF' }}
              >
                <Plus className="w-5 h-5" />
                <span>Crear curso</span>
              </Link>
            </div>
          </div>
          
          {/* Búsqueda y Filtros */}
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2" style={{ color: '#9CA3AF', width: '20px', height: '20px' }} />
              <input
                type="text"
                placeholder="Buscar cursos por título, descripción o instructor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border transition-all focus:outline-none focus:ring-2"
                style={{ 
                  borderColor: '#E5E7EB',
                  backgroundColor: '#FFFFFF',
                  color: '#223740',
                  fontSize: '14px'
                }}
              />
            </div>
            <div className="flex items-center gap-2">
              {/* Alternador de vista */}
              <div className="flex items-center rounded-xl p-1" style={{ backgroundColor: '#F3F4F6' }}>
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === 'table' 
                      ? 'bg-white shadow-sm' 
                      : ''
                  }`}
                >
                  <List className="w-4 h-4" style={{ color: viewMode === 'table' ? '#223740' : '#6B7280' }} />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === 'grid' 
                      ? 'bg-white shadow-sm' 
                      : ''
                  }`}
                >
                  <Grid className="w-4 h-4" style={{ color: viewMode === 'grid' ? '#223740' : '#6B7280' }} />
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
          <div className="p-6 rounded-2xl border" style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium" style={{ color: '#6B7280' }}>Total Cursos</p>
                <p className="text-3xl font-bold mt-1" style={{ color: '#223740' }}>{courses.length}</p>
              </div>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#AEEBF2' }}>
                <BookOpen className="w-6 h-6" style={{ color: '#5A878C' }} />
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#5A878C' }} />
              <span style={{ color: '#5A878C', fontWeight: 500 }}>+{newThisMonth} este mes</span>
            </div>
          </div>
          
          <div className="p-6 rounded-2xl border" style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium" style={{ color: '#6B7280' }}>Estudiantes Activos</p>
                <p className="text-3xl font-bold mt-1" style={{ color: '#223740' }}>{totalStudents.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#AEEBF2' }}>
                <Users className="w-6 h-6" style={{ color: '#5A878C' }} />
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#5A878C' }} />
              <span style={{ color: '#5A878C', fontWeight: 500 }}>+{Math.floor(totalStudents * 0.1)} nuevos</span>
            </div>
          </div>
          
          <div className="p-6 rounded-2xl border" style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium" style={{ color: '#6B7280' }}>Cursos Activos</p>
                <p className="text-3xl font-bold mt-1" style={{ color: '#223740' }}>{activeCourses.length}</p>
              </div>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#AEEBF2' }}>
                <TrendingUp className="w-6 h-6" style={{ color: '#5A878C' }} />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span style={{ color: '#6B7280' }}>Tasa de activación</span>
                <span style={{ fontWeight: 500, color: '#223740' }}>
                  {courses.length ? Math.round((activeCourses.length / courses.length) * 100) : 0}%
                </span>
              </div>
              <div className="w-full rounded-full" style={{ backgroundColor: '#E5E7EB', height: '8px' }}>
                <div 
                  className="rounded-full transition-all duration-500"
                  style={{ 
                    backgroundColor: '#5A878C',
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
            <div className="flex items-center rounded-xl p-1" style={{ backgroundColor: '#F3F4F6' }}>
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
                    color: filter === key ? '#223740' : '#6B7280'
                  }}
                >
                  <span>{label}</span>
                  {count > 0 && (
                    <span className="ml-2 px-2 py-0.5 rounded-full text-xs" style={{
                      backgroundColor: filter === key ? '#AEEBF2' : '#E5E7EB',
                      color: filter === key ? '#5A878C' : '#6B7280'
                    }}>
                      {count}
                    </span>
                  )}
                </button>
              ))}
            </div>
            
            {searchTerm && (
              <div className="flex items-center gap-2 text-sm" style={{ color: '#6B7280' }}>
                <span>Resultados para:</span>
                <span style={{ fontWeight: 500, color: '#223740' }}>
                  "{searchTerm}"
                </span>
                <button
                  onClick={() => setSearchTerm('')}
                  className="hover:opacity-70 transition-opacity"
                  style={{ color: '#9CA3AF' }}
                >
                  ×
                </button>
              </div>
            )}
          </div>
          
          <div className="text-sm" style={{ color: '#6B7280' }}>
            {filteredCourses.length} {filteredCourses.length === 1 ? 'curso' : 'cursos'} encontrado{filteredCourses.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Vista Tabla/Cuadrícula */}
        {viewMode === 'table' ? (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block rounded-2xl border overflow-hidden" style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' }}>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr style={{ borderBottom: `1px solid #E5E7EB`, backgroundColor: '#FAFAFA' }}>
                      <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider" style={{ color: '#6B7280' }}>
                        Curso
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider" style={{ color: '#6B7280' }}>
                        Módulos
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider" style={{ color: '#6B7280' }}>
                        Estudiantes
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider" style={{ color: '#6B7280' }}>
                        Estado
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider" style={{ color: '#6B7280' }}>
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCourses.map((course, idx) => (
                      <tr
                        key={course.id}
                        className="transition-colors hover:bg-gray-50"
                        style={{ 
                          borderBottom: idx !== filteredCourses.length - 1 ? `1px solid #E5E7EB` : 'none'
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
              </div>
              
              {/* Botón Cargar Más */}
              {hasMore && !loading && (
                <div className="flex justify-center mt-6">
                  <button
                    onClick={handleLoadMore}
                    className="px-6 py-3 rounded-xl font-medium text-sm transition-all hover:opacity-80"
                    style={{
                      backgroundColor: '#AEEBF2',
                      color: '#5A878C'
                    }}
                  >
                    Cargar más cursos
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Card View (Table Mode) */}
            <div className="md:hidden space-y-4">
              {filteredCourses.map((course, idx) => (
                <div
                  key={`${course.id}-${refreshKey}`}
                  className="rounded-2xl border overflow-hidden transition-all hover:shadow-sm"
                  style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' }}
                >
                  <div className="p-4">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#AEEBF2' }}>
                        <BookOpen className="w-5 h-5" style={{ color: '#5A878C' }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <button
                          onClick={() => handleViewCourse(course.id)}
                          className="text-left font-semibold hover:opacity-80 focus:outline-none"
                          style={{ color: '#223740', fontSize: '14px' }}
                        >
                          <div className="truncate">{course.title}</div>
                        </button>
                        <p className="text-sm truncate mt-1" style={{ color: '#6B7280', maxWidth: '250px' }}>
                          {course.description}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 mb-3 text-sm" style={{ color: '#6B7280' }}>
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-4 h-4" />
                        {course.moduleIds?.length || 0} módulos
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {course.studentCount} estudiantes
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
                          style={{ backgroundColor: course.status === 'active' ? '#5A878C' : '#9CA3AF' }}
                        >
                          <span
                            className="inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform"
                            style={{ transform: course.status === 'active' ? 'translateX(18px)' : 'translateX(2px)' }}
                          />
                        </button>
                        <span
                          className="text-xs font-medium px-2 py-1 rounded-full"
                          style={{
                            backgroundColor: course.status === 'active' ? '#AEEBF2' : '#F3F4F6',
                            color: course.status === 'active' ? '#5A878C' : '#6B7280'
                          }}
                        >
                          {course.status === 'active' ? 'Activo' : 'Inactivo'}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewCourse(course.id)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border transition-all hover:opacity-80"
                          style={{ borderColor: '#E5E7EB', backgroundColor: '#FFFFFF', color: '#6B7280' }}
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleAddModule(course.id)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border transition-all hover:opacity-80"
                          style={{ borderColor: '#E5E7EB', backgroundColor: '#FFFFFF', color: '#6B7280' }}
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEditCourse(course.id)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border transition-all hover:opacity-80"
                          style={{ borderColor: '#E5E7EB', backgroundColor: '#FFFFFF', color: '#6B7280' }}
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
            {filteredCourses.map((course, idx) => (
              <div
                key={`${course.id}-${refreshKey}`}
                className="rounded-2xl border overflow-hidden transition-all hover:shadow-sm"
                style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' }}
              >
                {/* Tarjeta de curso en vista de cuadrícula */}
                <div className="h-32 p-6" style={{ backgroundColor: '#AEEBF2' }}>
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#FFFFFF' }}>
                      <BookOpen className="w-6 h-6" style={{ color: '#5A878C' }} />
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-medium" style={{
                      backgroundColor: course.status === 'active' ? '#FFFFFF' : '#F3F4F6',
                      color: course.status === 'active' ? '#5A878C' : '#6B7280'
                    }}>
                      {course.status === 'active' ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-semibold mb-2" style={{ color: '#223740' }}>{course.title}</h3>
                  <p className="text-sm mb-4" style={{ color: '#6B7280' }}>{course.description}</p>
                  
                  <div className="flex items-center justify-between text-sm mb-4" style={{ color: '#6B7280' }}>
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-4 h-4" />
                        {course.moduleIds?.length || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {course.studentCount}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleViewCourse(course.id)}
                      className="flex-1 px-3 py-2 rounded-lg font-medium text-sm transition-all hover:opacity-80"
                      style={{ backgroundColor: '#AEEBF2', color: '#5A878C' }}
                    >
                      Ver
                    </button>
                    <button
                      onClick={() => handleEditCourse(course.id)}
                      className="flex-1 px-3 py-2 rounded-lg font-medium text-sm border transition-all hover:opacity-80"
                      style={{ borderColor: '#E5E7EB', backgroundColor: '#FFFFFF', color: '#6B7280' }}
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDeleteCourse(course.id)}
                      className="px-3 py-2 rounded-lg font-medium text-sm transition-all hover:opacity-80"
                      style={{ backgroundColor: '#FEE2E2', color: '#DC2626' }}
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Estado vacío */}
        {filteredCourses.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: '#F3F4F6' }}>
              <BookOpen className="w-12 h-12" style={{ color: '#9CA3AF' }} />
            </div>
            <h3 className="text-lg font-semibold mb-2" style={{ color: '#223740' }}>
              {searchTerm ? 'No se encontraron cursos' : 'No hay cursos disponibles'}
            </h3>
            <p className="mb-6" style={{ color: '#6B7280' }}>
              {searchTerm 
                ? `No hay resultados para "${searchTerm}". Intenta con otra búsqueda.`
                : 'Comienza creando tu primer curso para empezar a gestionar contenidos.'
              }
            </p>
            {!searchTerm && (
              <Link
                to="/courses/new"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all hover:opacity-90"
                style={{ backgroundColor: '#223740', color: '#FFFFFF' }}
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
            <div className="px-8 py-5 border-b flex items-center justify-between" style={{ borderColor: '#E5E7EB' }}>
              <h2 className="text-xl font-bold" style={{ color: '#223740' }}>Editar curso</h2>
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
                <label className="block text-sm font-semibold mb-2" style={{ color: '#223740' }}>
                  Nombre del curso <span style={{ color: '#DC2626' }}>*</span>
                </label>
                <input type="text" value={editTitle} onChange={e => setEditTitle(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 focus:outline-none text-sm"
                  style={{ borderColor: '#E5E7EB', backgroundColor: '#FAFAFA', color: '#223740' }} />
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#223740' }}>Descripción</label>
                <textarea value={editDescription} onChange={e => setEditDescription(e.target.value)} rows={3}
                  className="w-full px-4 py-3 rounded-xl border-2 focus:outline-none text-sm resize-none"
                  style={{ borderColor: '#E5E7EB', backgroundColor: '#FAFAFA', color: '#223740' }} />
              </div>

              {/* Nivel + Instructor (solo visual, no persisten en backend) */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#223740' }}>
                    Nivel
                    <span className="ml-1 text-xs font-normal" style={{ color: '#9CA3AF' }}>(solo visual)</span>
                  </label>
                  <select disabled className="w-full px-4 py-3 rounded-xl border-2 text-sm opacity-60 cursor-not-allowed"
                    style={{ borderColor: '#E5E7EB', backgroundColor: '#F3F4F6', color: '#6B7280' }}
                    defaultValue={editingCourse.level}>
                    <option value="beginner">Principiante</option>
                    <option value="intermediate">Intermedio</option>
                    <option value="advanced">Avanzado</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#223740' }}>
                    Docente
                    <span className="ml-1 text-xs font-normal" style={{ color: '#9CA3AF' }}>(solo visual)</span>
                  </label>
                  <input disabled type="text" defaultValue={editingCourse.instructor}
                    className="w-full px-4 py-3 rounded-xl border-2 text-sm opacity-60 cursor-not-allowed"
                    style={{ borderColor: '#E5E7EB', backgroundColor: '#F3F4F6', color: '#6B7280' }} />
                </div>
              </div>

              {/* Estado */}
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#223740' }}>Estado de publicación</label>
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
                          borderColor: editStatus === opt.value ? '#5A878C' : '#E5E7EB',
                          backgroundColor: editStatus === opt.value ? '#AEEBF2' : '#FFFFFF'
                        }}>
                        <p className="text-sm font-bold" style={{ color: '#223740' }}>{opt.label}</p>
                        <p className="text-xs" style={{ color: '#6B7280' }}>{opt.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <p className="text-xs" style={{ color: '#9CA3AF' }}>
                * Nivel y docente son campos informativos — para modificarlos usa el flujo de creación de un nuevo curso.
              </p>
            </div>

            {/* Footer */}
            <div className="px-8 py-5 border-t flex gap-3" style={{ borderColor: '#E5E7EB' }}>
              <button onClick={() => setEditingCourse(null)}
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