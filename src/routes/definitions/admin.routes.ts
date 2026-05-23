import { createElement } from 'react'
import { RouteObject } from 'react-router-dom'
import { AdminPage } from '../../presentation/features/admin/AdminPage'
import RequireRole from '../guards/RequireRole'

export const adminRoutes: RouteObject[] = [
  {
    path: '/admin',
    element: createElement(
      RequireRole,
      { allowedRoles: ['Admin', 'SuperAdmin'], fallbackPath: '/login' },
      createElement(AdminPage)
    ),
  },
]

