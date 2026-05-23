import { createElement } from 'react'
import { RouteObject } from 'react-router-dom'
import { AdminPage } from '../../presentation/features/admin/AdminPage.tsx'
import { AdminLayout } from '../../presentation/features/admin/layout/AdminLayout.tsx'

export const adminRoutes: RouteObject[] = [
  {
    path: '/admin',
    element: createElement(AdminLayout),
    children: [{ index: true, element: createElement(AdminPage) }],
  },
]

