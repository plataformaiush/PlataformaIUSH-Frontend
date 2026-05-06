import { useRoutes } from 'react-router-dom'
import { authRoutes } from './definitions/auth.routes'
import { courseRoutes } from './definitions/course.routes'

// Este router combina las rutas de auth y del equipo 1.
export const AppRouter = () => {
  const element = useRoutes([...authRoutes, ...courseRoutes])

  if (element) {
    return element
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Iush Platform
        </h1>
        <p className="text-gray-600 mb-4">
          Plataforma Educativa LMS
        </p>
        <p className="text-sm text-gray-500">
          Los equipos están trabajando en sus módulos específicos...
        </p>
        <div className="mt-8 p-4 bg-gray-100 rounded-lg">
          <h2 className="font-semibold mb-2">Equipos asignados:</h2>
          <div className="text-left text-sm space-y-1">
            <p>Equipo 1: Cursos, Módulos, Contenidos</p>
            <p>Equipo 2: Gestión de Archivos</p>
            <p>Equipo 3: Vista Institución</p>
            <p>Equipo 4: Vista Administrador</p>
            <p>Equipo 5: Notas y Certificaciones</p>
            <p>Equipo 6: Vista Docente</p>
            <p>Equipo 7: Competencias Socioemocionales</p>
            <p>Equipo 8: Auth, Usuarios, Roles</p>
            <p>Equipo 9: Analytics y Reportes</p>
            <p>Equipo 10: Vista Estudiante</p>
          </div>
        </div>
      </div>
    </div>
  )
}
