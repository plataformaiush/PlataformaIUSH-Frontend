// src/routes/definitions/grades.routes.ts

import { createElement } from 'react'
import { RouteObject } from 'react-router-dom'
import GradesDashboard from '@presentation/features/grades/GradesDashboard'

export const gradeRoutes: RouteObject[] = [
  {
    path: '/grades',
    element: createElement(GradesDashboard),
  },
]
