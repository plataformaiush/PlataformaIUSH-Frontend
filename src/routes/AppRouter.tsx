import { useRoutes } from 'react-router-dom'
import { authRoutes } from './definitions/auth.routes'
import { courseRoutes } from './definitions/course.routes'

// Este router combina las rutas de auth y del equipo 1.
export const AppRouter = () => {
  const element = useRoutes([...authRoutes, ...courseRoutes])

  return element
}