import { createElement } from 'react'
import { RouteObject } from 'react-router-dom'
import { AdminPage } from '../../presentation/features/admin/AdminPage'

export const adminRoutes: RouteObject[] = [
  {
    path: '/admin',
    element: createElement(AdminPage),
  },
]

