import React from 'react'
import { Course } from '../../../../domain/student'

interface CourseCardProps {
  course: Course
  onCourseClick: (courseId: string) => void
}

export function CourseCard({ course, onCourseClick }: CourseCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'in-progress': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Completado'
      case 'in-progress': return 'En progreso'
      default: return 'No iniciado'
    }
  }

  return (
    <div 
      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
      onClick={() => onCourseClick(course.id)}
    >
      {/* Thumbnail */}
      <div className="h-48 bg-gradient-to-br from-blue-400 to-blue-600 rounded-t-lg flex items-center justify-center">
        <div className="text-white text-center">
          <div className="text-4xl mb-2">📚</div>
          <div className="text-sm font-medium">{course.totalModules} módulos</div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Title and Status */}
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-900 flex-1">
            {course.title}
          </h3>
          <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(course.status)}`}>
            {getStatusText(course.status)}
          </span>
        </div>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {course.description}
        </p>

        {/* Instructor */}
        <div className="flex items-center text-sm text-gray-500 mb-4">
          <div className="w-6 h-6 bg-gray-300 rounded-full mr-2"></div>
          {course.instructor}
        </div>

        {/* Progress */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">Progreso</span>
            <span className="font-medium">{course.progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${course.progress}%` }}
            ></div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center text-sm text-gray-500">
          <span>{course.completedModules}/{course.totalModules} módulos</span>
          <span className="text-blue-600 hover:text-blue-800 font-medium">
            Continuar →
          </span>
        </div>
      </div>
    </div>
  )
}
