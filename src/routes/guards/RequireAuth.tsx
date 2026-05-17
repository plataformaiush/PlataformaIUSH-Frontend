import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { tokenManager } from '../../presentation/services/tokenManager'

const RequireAuth = () => {
  const location = useLocation()
  const token = tokenManager.getToken()
  const expired = tokenManager.isTokenExpired()

  if (!token || expired) {
    tokenManager.clearToken()

    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}

export default RequireAuth