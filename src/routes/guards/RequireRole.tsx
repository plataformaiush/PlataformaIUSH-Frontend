import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { tokenManager } from '../../presentation/services/tokenManager'

type RequireRoleProps = {
  allowedRoles: string[]
  fallbackPath?: string
  children?: React.ReactNode
}

const normalizeRole = (value: string) =>
  value.trim().toLowerCase().replace(/[_\s]/g, '')

const RequireRole = ({ allowedRoles, fallbackPath = '/login', children }: RequireRoleProps) => {
  const location = useLocation()
  const user = tokenManager.getUser() as { roles?: string[] } | null
  const userRoles = user?.roles ?? []

  const isAllowed = userRoles.some((role) =>
    allowedRoles.some((allowedRole) => normalizeRole(allowedRole) === normalizeRole(role))
  )

  if (!isAllowed) {
    const hasStudentRole = userRoles.some((role) => normalizeRole(role) === 'estudiante')

    return (
      <Navigate
        to={hasStudentRole ? '/student' : fallbackPath}
        replace
        state={{ from: location.pathname }}
      />
    )
  }

  return children ?? <Outlet />
}

export default RequireRole