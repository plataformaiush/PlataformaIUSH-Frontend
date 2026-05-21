import { createElement } from 'react'
import { RouteObject } from 'react-router-dom'
import { StudentLayout } from '../../presentation/features/student/layout/StudentLayout'
import StudentDashboard from '../../presentation/features/student/pages/StudentDashboard'
import CursoDetallePage from '../../presentation/features/student/pages/CursoDetallePage'
import ModuloDetallePage from '../../presentation/features/student/pages/ModuloDetallePage'
import ContenidoDetallePage from '../../presentation/features/student/pages/ContenidoDetallePage'
import RequireAuth from '../guards/RequireAuth'

export const studentRoutes: RouteObject[] = [
  {
    path: '/student',
    element: createElement(RequireAuth, {}, createElement(StudentLayout)),
    children: [
      {
        path: 'dashboard',
        element: createElement(StudentDashboard),
      },
      {
        path: 'curso/:cursoId',
        element: createElement(CursoDetallePage),
      },
      {
        path: 'curso/:cursoId/modulo/:moduloId',
        element: createElement(ModuloDetallePage),
      },
      {
        path: 'curso/:cursoId/modulo/:moduloId/contenido/:contenidoId',
        element: createElement(ContenidoDetallePage),
      },
    ],
  },
]


