import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { tokenManager } from '../../presentation/services/tokenManager'
import { UserRole } from '../../domain/shared/enums/UserRole.enum'

type RequireRoleProps = {
  allowedRoles: string[]
  fallbackPath?: string
  children?: React.ReactNode
}

// Comparación case-insensitive contra los valores PascalCase español del backend
const normalizeRole = (value: string) => value.trim().toLowerCase()

const RequireRole = ({ allowedRoles, fallbackPath = '/login', children }: RequireRoleProps) => {
  const location = useLocation()
  const user = tokenManager.getUser() as { roles?: string[] } | null
  const userRoles = user?.roles ?? []

  const isAllowed = userRoles.some((role) =>
    allowedRoles.some((allowedRole) => normalizeRole(allowedRole) === normalizeRole(role))
  )

  if (!isAllowed) {
    const hasStudentRole = userRoles.some(
      (role) => normalizeRole(role) === normalizeRole(UserRole.ESTUDIANTE)
    )

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