import { useEffect, useState } from 'react'
import { EnrolledCourse } from '@domain/student/types'
import { studentService, type MisCursos } from '../services/studentService'

export function useEnrolledCourses() {
  const [courses, setCourses] = useState<EnrolledCourse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await studentService.getMisCursos()

        // Transformar MisCursos a EnrolledCourse
        const enrolledCourses: EnrolledCourse[] = data.map((curso: MisCursos) => ({
          id: curso.idCurso,
          title: curso.titulo,
          description: curso.descripcion,
          thumbnail: curso.thumbnail || 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=400&q=80',
          progress: curso.porcentajeProgreso,
          lastAccessedAt: new Date().toISOString(),
        }))

        setCourses(enrolledCourses)
      } catch (err) {
        console.error('Error fetching enrolled courses:', err)
        setError(err instanceof Error ? err.message : 'Error al obtener cursos')
        setCourses([])
      } finally {
        setLoading(false)
      }
    }

    fetchCourses()
  }, [])

  return { courses, loading, error }
}

