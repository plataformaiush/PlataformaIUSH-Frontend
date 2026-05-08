import { useRoutes } from 'react-router-dom'
import { authRoutes } from './definitions/auth.routes'
import { superAdminRoutes } from './definitions/superadmin.routes'


export const AppRouter = () => {
  const element = useRoutes([...authRoutes, ...superAdminRoutes])

  return element
}