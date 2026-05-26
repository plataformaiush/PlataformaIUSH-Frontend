import { CourseCard } from './CourseCard'
import { SortableRow } from './SortableRow'
import { TableRowSkeleton, StatCardSkeleton, PageHeaderSkeleton } from './Skeletons'
import { Link, useNavigate } from 'react-router-dom'
import { useState, useMemo, useCallback, useEffect } from 'react'
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

// Reactive hooks and stores
import { useCourseListStore } from '../../stores/courseListStore'
import { 
  useCoursesQuery, 
  useInfiniteCoursesQuery, 
  useToggleCourseMutation,
  useUpdateCourseMutation,
  useDeleteCourseMutation,
  useReorderCoursesMutation,
  usePrefetchNextPage
} from '../../hooks/useCoursesQuery'
import { useReactiveSearch } from '../../hooks/useDebounceSearch'
import { useReactivePagination } from '../../hooks/useReactivePagination'
import { useReactiveFeedback } from '../../hooks/useReactiveErrorHandling'
import { useRealTimeCourseUpdates, useMockRealTimeUpdates } from '../../hooks/useRealTimeUpdates'
import { useReactiveStatistics, useStatisticsVisualization } from '../../hooks/useReactiveStatistics'

export const CourseListPageReactive = () => {
  const navigate = useNavigate()
  
  // Reactive store state
  const {
    filter,
    setFilter,
    viewMode,
    setViewMode,
    editingCourse,
    setEditingCourse,
    editTitle,
    setEditTitle,
    editDescription,
    setEditDescription,
    editStatus,
    setEditStatus,
    editSaving,
    setEditSaving,
    reorderMode,
    setReorderMode,
    reorderSaving,
    reorderWarning,
    setReorderWarning,
    togglingCourse,
    setTogglingCourse,
    error,
    setError
  } = useCourseListStore()

  // Reactive data fetching - choose between regular query and infinite query
  const useInfiniteScroll = true // Toggle this to switch between pagination modes
  
  const {
    data: courses = [],
    isLoading,
    error: queryError,
    refetch
  } = useInfiniteScroll 
    ? useInfiniteCoursesQuery(10)
    : useCoursesQuery(1, 10)

  // Flatten infinite query data
  const flatCourses = useMemo(() => {
    if (useInfiniteScroll && Array.isArray(courses)) {
      return courses.flat()
    }
    return courses
  }, [courses, useInfiniteScroll])

  // Reactive mutations
  const toggleCourseMutation = useToggleCourseMutation()
  const updateCourseMutation = useUpdateCourseMutation()
  const deleteCourseMutation = useDeleteCourseMutation()
  const reorderCoursesMutation = useReorderCoursesMutation()

  // Reactive search with debouncing
  const { searchTerm, setSearchTerm, isDebouncing } = useReactiveSearch(300)

  // Reactive pagination
  const pagination = useReactivePagination(flatCourses.length, 10)
  const prefetchNextPage = usePrefetchNextPage(pagination.currentPage, 10)

  // Reactive feedback system
  const { 
    showSuccess, 
    showInfo, 
    showError, 
    errors, 
    dismissError,
    hasErrors 
  } = useReactiveFeedback()

  // Reactive statistics
  const statistics = useReactiveStatistics(flatCourses)
  const visualization = useStatisticsVisualization(statistics.statistics)

  // Real-time updates (mock for demo)
  const { startSimulation, stopSimulation, isSimulating } = useMockRealTimeUpdates()

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  // Reactive computed values
  const filteredCourses = useMemo(() => {
    return flatCourses.filter((c) => {
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
  }, [flatCourses, filter, searchTerm])

  // Paginated courses for display
  const displayedCourses = useMemo(() => {
    if (useInfiniteScroll) {
      return filteredCourses
    }
    const startIndex = (pagination.currentPage - 1) * 10
    const endIndex = startIndex + 10
    return filteredCourses.slice(startIndex, endIndex)
  }, [filteredCourses, pagination.currentPage, useInfiniteScroll])

  // Reactive event handlers
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = flatCourses.findIndex(c => c.id === active.id)
    const newIndex = flatCourses.findIndex(c => c.id === over.id)
    if (oldIndex < 0 || newIndex < 0) return

    const reordered = arrayMove(flatCourses, oldIndex, newIndex)
    
    try {
      await reorderCoursesMutation.mutateAsync(reordered)
      showSuccess('Cursos reordenados exitosamente')
    } catch (error: any) {
      if (error.message.includes('backend no persiste')) {
        setReorderWarning(error.message)
        showInfo('Orden actualizado localmente')
      } else {
        showError('Error al reordenar cursos')
      }
    }
  }

  const handleToggleStatus = async (courseId: string, currentStatus: string) => {
    setTogglingCourse(courseId)
    
    try {
      await toggleCourseMutation.mutateAsync({
        courseId,
        newStatus: currentStatus !== 'active'
      })
      showSuccess(`Curso ${currentStatus === 'active' ? 'desactivado' : 'activado'} exitosamente`)
    } catch (error: any) {
      if (error.message !== 'User cancelled deactivation') {
        showError('Error al cambiar estado del curso')
      }
    } finally {
      setTogglingCourse(null)
    }
  }

  const handleDeleteCourse = async (courseId: string) => {
    try {
      await deleteCourseMutation.mutateAsync(courseId)
      showSuccess('Curso eliminado exitosamente')
    } catch (error: any) {
      if (error.message !== 'User cancelled deletion') {
        showError('Error al eliminar curso')
      }
    }
  }

  const handleEditCourse = (courseId: string) => {
    const course = flatCourses.find(c => c.id === courseId)
    if (!course) return
    setEditingCourse(course)
  }

  const handleSaveEdit = async () => {
    if (!editingCourse || !editTitle.trim()) return
    
    setEditSaving(true)
    try {
      await updateCourseMutation.mutateAsync({
        courseId: editingCourse.id,
        updates: { title: editTitle.trim(), description: editDescription.trim() },
        statusChange: editStatus !== editingCourse.status ? { from: editingCourse.status, to: editStatus } : undefined
      })
      
      setEditingCourse(null)
      showSuccess('Curso actualizado exitosamente')
    } catch (error) {
      showError('Error al actualizar curso')
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

  // Prefetch next page on hover or scroll
  useEffect(() => {
    if (pagination.hasNextPage && !useInfiniteScroll) {
      prefetchNextPage()
    }
  }, [pagination.currentPage, pagination.hasNextPage, useInfiniteScroll, prefetchNextPage])

  // Handle query errors
  useEffect(() => {
    if (queryError) {
      showError('No se pudieron cargar los cursos. Por favor intenta nuevamente.')
    }
  }, [queryError, showError])

  // Loading state
  if (isLoading) {
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
                <h1 className="text-3xl font-bold" style={{ color: 'var(--color-primary)' }}>
                  Gestión de Cursos (Reactiva)
                </h1>
                <p className="mt-1 text-sm" style={{ color: 'var(--color-muted-foreground)' }}>
                  Administración con programación reactiva y actualizaciones en tiempo real
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Real-time simulation toggle */}
              <button
                onClick={() => isSimulating ? stopSimulation() : startSimulation()}
                className={`px-4 py-3 rounded-xl font-semibold text-sm transition-all ${
                  isSimulating ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
                }`}
              >
                {isSimulating ? 'Detener Simulación' : 'Iniciar Simulación'}
              </button>
              
              <button
                type="button"
                onClick={() => setReorderMode(!reorderMode)}
                disabled={reorderSaving || flatCourses.length < 2}
                className="inline-flex items-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm transition-all hover:opacity-90 disabled:opacity-50"
                style={{
                  backgroundColor: reorderMode ? 'var(--color-secondary)' : 'var(--color-tertiary)',
                  color: reorderMode ? '#FFFFFF' : 'var(--color-primary)',
                }}
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
                  fontSize: '14px',
                  opacity: isDebouncing ? 0.7 : 1
                }}
              />
              {isDebouncing && (
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-xs" style={{ color: 'var(--color-muted-foreground)' }}>
                  Buscando...
                </div>
              )}
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
        {/* Reactive Error Banner */}
        {hasErrors && (
          <div className="mb-6 space-y-2">
            {errors.map((error) => (
              <div 
                key={error.id}
                className="p-4 rounded-xl border flex items-center gap-3" 
                style={{ 
                  backgroundColor: error.severity === 'critical' ? '#FEF2F2' : '#FEF3C7',
                  borderColor: error.severity === 'critical' ? '#FECACA' : '#FDE68A'
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" style={{ color: error.severity === 'critical' ? '#DC2626' : '#D97706' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm font-medium" style={{ color: error.severity === 'critical' ? '#DC2626' : '#D97706' }}>
                  {error.message}
                </p>
                <button 
                  onClick={() => dismissError(error.id)}
                  className="ml-auto hover:opacity-70 transition-opacity"
                  style={{ color: error.severity === 'critical' ? '#DC2626' : '#D97706' }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Reactive Statistics Dashboard */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-6">
          {visualization.kpiCards.map((kpi, index) => (
            <div key={index} className="p-6 rounded-2xl border" style={{ backgroundColor: 'var(--color-background)', borderColor: 'var(--color-border)' }}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--color-muted-foreground)' }}>{kpi.title}</p>
                  <p className="text-3xl font-bold mt-1" style={{ color: 'var(--color-primary)' }}>{kpi.value}</p>
                </div>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--color-tertiary)' }}>
                  <span className="text-2xl">{kpi.icon}</span>
                </div>
              </div>
              {kpi.change !== null && (
                <div className="flex items-center gap-2 text-sm">
                  <div className={`w-2 h-2 rounded-full`} style={{ 
                    backgroundColor: kpi.changeType === 'increase' ? '#34d399' : 
                                   kpi.changeType === 'decrease' ? '#f87171' : '#94a3b8'
                  }} />
                  <span style={{ 
                    color: kpi.changeType === 'increase' ? '#34d399' : 
                           kpi.changeType === 'decrease' ? '#f87171' : '#94a3b8',
                    fontWeight: 500 
                  }}>
                    {kpi.changeType === 'increase' ? '+' : kpi.changeType === 'decrease' ? '-' : ''}{kpi.change}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Pestañas de filtro */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center rounded-xl p-1" style={{ backgroundColor: 'var(--color-muted)' }}>
              {[
                { key: 'all', label: 'Todos', count: flatCourses.length },
                { key: 'active', label: 'Activos', count: statistics.statistics.activeCourses },
                { key: 'inactive', label: 'Inactivos', count: statistics.statistics.inactiveCourses }
              ].map(({ key, label, count }) => (
                <button
                  key={key}
                  onClick={() => setFilter(key as 'all' | 'active' | 'inactive')}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                    filter === key ? 'bg-white' : ''
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
                    items={flatCourses.map(c => c.id)}
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
                        {flatCourses.map((course) => (
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
                    {displayedCourses.map((course, idx) => (
                      <tr
                        key={course.id}
                        className="transition-colors hover:bg-gray-50"
                        style={{
                          borderBottom: idx !== displayedCourses.length - 1 ? `1px solid var(--color-border)` : 'none'
                        }}
                      >
                        <CourseCard
                          key={`${course.id}-${idx}`}
                          course={course}
                          isLast={idx === displayedCourses.length - 1}
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
            
            {/* Reactive Pagination */}
            {!useInfiniteScroll && pagination.totalPages > 1 && (
              <div className="flex justify-center mt-6 items-center gap-2">
                <button
                  onClick={pagination.firstPage}
                  disabled={!pagination.hasPreviousPage}
                  className="px-3 py-2 rounded-lg text-sm disabled:opacity-50"
                  style={{ backgroundColor: 'var(--color-tertiary)', color: 'var(--color-secondary)' }}
                >
                  Primera
                </button>
                <button
                  onClick={pagination.previousPage}
                  disabled={!pagination.hasPreviousPage}
                  className="px-3 py-2 rounded-lg text-sm disabled:opacity-50"
                  style={{ backgroundColor: 'var(--color-tertiary)', color: 'var(--color-secondary)' }}
                >
                  Anterior
                </button>
                
                {pagination.getPageNumbers().pages.map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => pagination.goToPage(pageNum)}
                    className={`px-3 py-2 rounded-lg text-sm ${
                      pageNum === pagination.currentPage 
                        ? 'bg-white shadow-sm' 
                        : ''
                    }`}
                    style={{
                      backgroundColor: pageNum === pagination.currentPage ? 'var(--color-primary)' : 'var(--color-tertiary)',
                      color: pageNum === pagination.currentPage ? '#FFFFFF' : 'var(--color-secondary)'
                    }}
                  >
                    {pageNum}
                  </button>
                ))}
                
                <button
                  onClick={pagination.nextPage}
                  disabled={!pagination.hasNextPage}
                  className="px-3 py-2 rounded-lg text-sm disabled:opacity-50"
                  style={{ backgroundColor: 'var(--color-tertiary)', color: 'var(--color-secondary)' }}
                >
                  Siguiente
                </button>
                <button
                  onClick={pagination.lastPage}
                  disabled={!pagination.hasNextPage}
                  className="px-3 py-2 rounded-lg text-sm disabled:opacity-50"
                  style={{ backgroundColor: 'var(--color-tertiary)', color: 'var(--color-secondary)' }}
                >
                  Última
                </button>
              </div>
            )}

            {/* Load More Button for Infinite Scroll */}
            {useInfiniteScroll && pagination.hasMore && (
              <div className="flex justify-center mt-6">
                <button
                  onClick={() => refetch()}
                  disabled={isLoading}
                  className="px-6 py-3 rounded-xl font-medium text-sm transition-all hover:opacity-80 disabled:opacity-50"
                  style={{
                    backgroundColor: 'var(--color-tertiary)',
                    color: 'var(--color-secondary)'
                  }}
                >
                  {isLoading ? 'Cargando...' : 'Cargar más cursos'}
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Grid View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedCourses.map((course) => (
              <div
                key={course.id}
                className="rounded-2xl border overflow-hidden transition-all hover:shadow-sm"
                style={{ backgroundColor: 'var(--color-background)', borderColor: 'var(--color-border)' }}
              >
                {/* Tarjeta de curso en vista de cuadrícula */}
                <div className="h-32 p-6" style={{ backgroundColor: 'var(--color-tertiary)' }}>
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--color-background)' }}>
                      <BookOpen className="w-6 h-6" style={{ color: 'var(--color-secondary)' }} />
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-medium" style={{
                      backgroundColor: course.status === 'active' ? 'var(--color-background)' : 'var(--color-muted)',
                      color: course.status === 'active' ? 'var(--color-secondary)' : 'var(--color-muted-foreground)'
                    }}>
                      {course.status === 'active' ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-semibold mb-2" style={{ color: 'var(--color-primary)' }}>{course.title}</h3>
                  <p className="text-sm mb-4" style={{ color: 'var(--color-muted-foreground)' }}>{course.description}</p>
                  
                  <div className="flex items-center justify-between text-sm mb-4" style={{ color: 'var(--color-muted-foreground)' }}>
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-4 h-4" />
                        {course.moduleIds?.length || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {course.studentCount ?? 'N/A'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleViewCourse(course.id)}
                      className="flex-1 px-3 py-2 rounded-lg font-medium text-sm transition-all hover:opacity-80"
                      style={{ backgroundColor: 'var(--color-tertiary)', color: 'var(--color-secondary)' }}
                    >
                      Ver
                    </button>
                    <button
                      onClick={() => handleEditCourse(course.id)}
                      className="flex-1 px-3 py-2 rounded-lg font-medium text-sm border transition-all hover:opacity-80"
                      style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-background)', color: 'var(--color-muted-foreground)' }}
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
                <input 
                  type="text" 
                  value={editTitle} 
                  onChange={e => setEditTitle(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 focus:outline-none text-sm"
                  style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-muted)', color: 'var(--color-foreground)' }} 
                />
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--color-primary)' }}>Descripción</label>
                <textarea 
                  value={editDescription} 
                  onChange={e => setEditDescription(e.target.value)} 
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border-2 focus:outline-none text-sm resize-none"
                  style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-muted)', color: 'var(--color-foreground)' }} 
                />
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
            </div>

            {/* Footer */}
            <div className="px-8 py-5 border-t flex gap-3" style={{ borderColor: 'var(--color-border)' }}>
              <button onClick={() => setEditingCourse(null)}
                className="flex-1 py-3 rounded-xl border-2 text-sm font-semibold"
                style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-background)', color: 'var(--color-muted-foreground)' }}>
                Cancelar
              </button>
              <button 
                onClick={handleSaveEdit} 
                disabled={editSaving || !editTitle.trim()}
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
