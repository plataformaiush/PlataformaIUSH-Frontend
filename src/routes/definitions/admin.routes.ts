import { createElement } from 'react'
import { Navigate, RouteObject } from 'react-router-dom'
import { AdminPage } from '../../presentation/features/admin/AdminPage'
import { AdminLayout } from '../../presentation/features/admin/layout/AdminLayout'
import RequireRole from '../guards/RequireRole'

export const adminRoutes: RouteObject[] = [
  {
    path: '/admin',
    element: createElement(
      RequireRole,
      { allowedRoles: ['Admin'], fallbackPath: '/login' },
      createElement(AdminLayout)
    ),
    children: [
      { index: true, element: createElement(Navigate, { to: 'dashboard', replace: true }) },
      { path: 'dashboard', element: createElement(AdminPage) },
      { path: 'usuarios', element: createElement(AdminPage) },
      { path: 'cursos', element: createElement(AdminPage) },
      { path: 'resumen', element: createElement(AdminPage) },
    ],
  },
]