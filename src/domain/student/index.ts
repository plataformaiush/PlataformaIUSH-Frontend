// Tipos simples para el MVP del estudiante

export interface Student {
  id: string
  name: string
  email: string
  avatar?: string
  institution: string
  enrolledCourses: Course[]
  progress: StudentProgress
}

export interface Course {
  id: string
  title: string
  description: string
  thumbnail: string
  instructor: string
  progress: number
  totalModules: number
  completedModules: number
  lastAccessed: Date
  status: 'not-started' | 'in-progress' | 'completed'
}

export interface StudentProgress {
  totalCourses: number
  completedCourses: number
  inProgressCourses: number
  averageGrade: number
  totalHours: number
  certificates: Certificate[]
}

export interface Certificate {
  id: string
  courseTitle: string
  issuedDate: Date
  downloadUrl: string
}

// Mock data service para el MVP
export class StudentService {
  static getDashboardData(): Student {
    return {
      id: 'student-1',
      name: 'Juan Pérez',
      email: 'juan.perez@universidad.edu',
      avatar: '/avatars/student-1.jpg',
      institution: 'Universidad Nacional',
      enrolledCourses: [
        {
          id: 'course-1',
          title: 'Introducción a React',
          description: 'Aprende React desde cero',
          thumbnail: '/courses/react-thumb.jpg',
          instructor: 'Dr. María González',
          progress: 75,
          totalModules: 8,
          completedModules: 6,
          lastAccessed: new Date('2024-01-15'),
          status: 'in-progress'
        },
        {
          id: 'course-2',
          title: 'TypeScript Avanzado',
          description: 'Dominio de TypeScript',
          thumbnail: '/courses/ts-thumb.jpg',
          instructor: 'Ing. Carlos Rodríguez',
          progress: 30,
          totalModules: 10,
          completedModules: 3,
          lastAccessed: new Date('2024-01-10'),
          status: 'in-progress'
        }
      ],
      progress: {
        totalCourses: 5,
        completedCourses: 2,
        inProgressCourses: 2,
        averageGrade: 8.5,
        totalHours: 120,
        certificates: [
          {
            id: 'cert-1',
            courseTitle: 'HTML y CSS Fundamentals',
            issuedDate: new Date('2023-12-01'),
            downloadUrl: '/certificates/html-css-cert.pdf'
          }
        ]
      }
    }
  }
}
