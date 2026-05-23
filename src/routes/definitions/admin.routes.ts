import { createElement } from 'react'
import { Navigate, RouteObject } from 'react-router-dom'
import { AdminPage } from '../../presentation/features/admin/AdminPage'
import { AdminLayout } from '../../presentation/features/admin/layout/AdminLayout'
import { SuperAdminPage } from '../../presentation/features/institutions/SuperAdminPage'
import RequireRole from '../guards/RequireRole'

export const adminRoutes: RouteObject[] = [
  {
    path: '/admin',
    element: createElement(
      RequireRole,
      { allowedRoles: ['Admin', 'SuperAdmin'], fallbackPath: '/login' },
      createElement(AdminLayout)
    ),
    children: [
      { index: true, element: createElement(Navigate, { to: 'dashboard', replace: true }) },
      { path: 'dashboard', element: createElement(AdminPage) },
      { path: 'usuarios', element: createElement(SuperAdminPage) },
      { path: 'cursos', element: createElement(SuperAdminPage) },
      { path: 'resumen', element: createElement(SuperAdminPage) },
    ],
  },
]