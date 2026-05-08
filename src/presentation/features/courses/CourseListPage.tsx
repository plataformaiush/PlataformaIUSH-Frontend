import { CourseRepository } from '../../../domain/courses/courseRepository'
import { CourseCard } from './CourseCard'
import { Link, useNavigate } from 'react-router-dom'
import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, BookOpen, Users, TrendingUp, Plus, Filter, Grid, List, MoreVertical, Edit, Trash2, Eye } from 'lucide-react'

export const CourseListPage = () => {
  const navigate = useNavigate()
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table')
  const [refreshKey, setRefreshKey] = useState(0)
  const [courses, setCourses] = useState(CourseRepository.getAllCourses())

  const handleCourseUpdate = () => {
    setRefreshKey(prev => prev + 1)
    setCourses(CourseRepository.getAllCourses())
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
        c.instructor.toLowerCase().includes(searchTerm.toLowerCase())
      
      return matchesFilter && matchesSearch
    })
  }, [courses, filter, searchTerm])
  
  const activeCourses = useMemo(() => courses.filter((c) => c.status === 'active'), [courses])
  const totalStudents = useMemo(() => courses.reduce((sum, c) => sum + c.studentCount, 0), [courses])
  const newThisMonth = useMemo(() => Math.floor(Math.random() * 5) + 1, []) // Simulated data
  
  const handleDeleteCourse = (courseId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este curso? Esta acción no se puede deshacer.')) {
      CourseRepository.deleteCourse(courseId)
      setCourses(CourseRepository.getAllCourses())
    }
  }
  
  const handleEditCourse = (courseId: string) => {
    navigate(`/courses/${courseId}/edit`)
  }
  
  const handleViewCourse = (courseId: string) => {
    navigate(`/courses/${courseId}/modules`)
  }

  return (
    <main className="min-h-screen" style={{ backgroundColor: '#FAFAFA', fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
      {/* Encabezado */}
      <div className="border-b" style={{ borderColor: '#E5E7EB', backgroundColor: '#FFFFFF' }}>
        <div className="px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <nav className="mb-3 flex items-center gap-2 text-sm" style={{ color: '#6B7280' }}>
                <span className="hover:opacity-80 transition-opacity cursor-pointer">The Fluid Academy</span>
                <span style={{ color: '#D1D5DB' }}>/</span>
                <span className="hover:opacity-80 transition-opacity cursor-pointer">Cursos</span>
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
          <div className="rounded-2xl border overflow-hidden" style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' }}>
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
                        onCourseUpdate={handleCourseUpdate}
                      />
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
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
    </main>
  )
}