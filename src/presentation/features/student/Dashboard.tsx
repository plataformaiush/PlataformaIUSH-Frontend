import React from 'react'
import { Course, Certificate } from '../../../domain/student'
import { useStudentData } from './hooks/useStudentData'

export function StudentDashboard() {
  const { student, loading, error, refreshData } = useStudentData()

  // Estados de loading y error
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={refreshData}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  if (!student) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No se encontraron datos del estudiante</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between">
            {/* Perfil del estudiante */}
            <div className="flex items-center space-x-4 mb-6 md:mb-0">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
                <span className="text-3xl text-blue-600 font-bold">
                  {student.name.split(' ').map((n: string) => n[0]).join('')}
                </span>
              </div>
              <div>
                <h1 className="text-3xl font-bold">{student.name}</h1>
                <p className="text-blue-100">{student.email}</p>
                <p className="text-blue-200 text-sm">{student.institution}</p>
              </div>
            </div>

            {/* Estadísticas rápidas */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{student.progress.totalCourses}</div>
                <div className="text-blue-200 text-sm">Cursos Totales</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{student.progress.completedCourses}</div>
                <div className="text-blue-200 text-sm">Completados</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{student.progress.averageGrade.toFixed(1)}</div>
                <div className="text-blue-200 text-sm">Promedio</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{student.progress.totalHours}h</div>
                <div className="text-blue-200 text-sm">Horas</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Cursos en Progreso */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Mis Cursos</h2>
              
              <div className="space-y-4">
                {student.enrolledCourses.map((course: Course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>

              <button className="mt-6 w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                Ver Todos los Cursos
              </button>
            </div>
          </div>

          {/* Panel Derecho */}
          <div className="space-y-6">
            
            {/* Progreso General */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Mi Progreso</h3>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Cursos Completados</span>
                    <span>{student.progress.completedCourses}/{student.progress.totalCourses}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${(student.progress.completedCourses / student.progress.totalCourses) * 100}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Promedio General</span>
                    <span>{student.progress.averageGrade.toFixed(1)}/10</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${(student.progress.averageGrade / 10) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Certificados */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Certificados</h3>
              
              <div className="space-y-3">
                {student.progress.certificates.map((cert: Certificate) => (
                  <div key={cert.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">{cert.courseTitle}</div>
                      <div className="text-sm text-gray-500">
                        Emitido: {cert.issuedDate.toLocaleDateString()}
                      </div>
                    </div>
                    <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                      Descargar
                    </button>
                  </div>
                ))}
                
                {student.progress.certificates.length === 0 && (
                  <p className="text-gray-500 text-center py-4">
                    No hay certificados disponibles
                  </p>
                )}
              </div>
            </div>

            {/* Actividad Reciente */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Actividad Reciente</h3>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">Completaste módulo: "Hooks en React"</div>
                    <div className="text-xs text-gray-500">Hace 2 horas</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">Iniciaste curso: "TypeScript Avanzado"</div>
                    <div className="text-xs text-gray-500">Hace 3 días</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">Entregaste tarea: "Componentes"</div>
                    <div className="text-xs text-gray-500">Hace 1 semana</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Componente de Tarjeta de Curso
function CourseCard({ course }: { course: Course }) {
  const statusColors: Record<string, string> = {
    'not-started': 'bg-gray-500',
    'in-progress': 'bg-blue-500',
    'completed': 'bg-green-500'
  }

  const statusText: Record<string, string> = {
    'not-started': 'No iniciado',
    'in-progress': 'En progreso',
    'completed': 'Completado'
  }

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="w-full md:w-32 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
          <span className="text-gray-500 text-sm">Curso</span>
        </div>
        
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="font-semibold text-gray-900">{course.title}</h3>
              <p className="text-sm text-gray-600">{course.instructor}</p>
            </div>
            <span className={`px-2 py-1 text-xs text-white rounded-full ${statusColors[course.status]}`}>
              {statusText[course.status]}
            </span>
          </div>
          
          <p className="text-sm text-gray-700 mb-3">{course.description}</p>
          
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex justify-between text-sm mb-1">
                <span>Progreso</span>
                <span>{course.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full"
                  style={{ width: `${course.progress}%` }}
                />
              </div>
            </div>
            
            <button className="ml-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm">
              Continuar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
