import { useState, useEffect } from 'react'
import { Student, StudentService } from '../../../../domain/student'

// Hook personalizado para manejar datos del estudiante
export function useStudentData() {
  const [student, setStudent] = useState<Student | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // useEffect para cargar datos cuando el componente se monta
  useEffect(() => {
    loadStudentData()
  }, [])

  const loadStudentData = async () => {
    try {
      setLoading(true)
      // Simular llamada a API (en MVP usa mock)
      const data = StudentService.getDashboardData()
      
      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setStudent(data)
      setError(null)
    } catch (err) {
      setError('Error al cargar datos del estudiante')
      console.error('Error loading student data:', err)
    } finally {
      setLoading(false)
    }
  }

  const refreshData = () => {
    loadStudentData()
  }

  return {
    student,      // Datos del estudiante
    loading,      // Estado de carga
    error,        // Error si hay
    refreshData   // Función para refrescar
  }
}
