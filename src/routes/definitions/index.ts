import { createElement } from 'react'
import { type RouteObject } from 'react-router-dom'

import ProfunSoft from '../../ProfunSoft'
import RequireAuth from '../guards/RequireAuth'
import { adminRoutes } from './admin.routes'
import { authRoutes } from './auth.routes'
import { coursesRoutes } from './courses.routes'
import { gradeRoutes } from './grades.routes'
import { reportsRoutes } from './reports.routes'
import { superAdminRoutes } from './superadmin.routes'
import { teacherRoutes } from './teacher.routes.tsx'
import { vistaEstudiantesRutas } from './vista-estudiante.routes'
import { studentRoutes } from './student.routes' // Tus rutas (Equipo 7)
import { archivosRoutes } from './archivos' // Equipo 2 (Archivos)

/**
 * Agregador central de rutas
 * Define la estructura base de la aplicación
 * Equipo 2: Centralización de rutas
 */

export const allRoutes: RouteObject[] = [
    ...authRoutes, // Equipo 1
    ...archivosRoutes,
    {
        element: createElement(RequireAuth),
        children: [
            ...vistaEstudiantesRutas, // Equipo 7
            ...adminRoutes, // Equipo 4
            {
                path: '/',
                element: createElement(ProfunSoft),
                children: [
                    ...coursesRoutes, // Equipo 1
                    ...teacherRoutes, // Equipo 6
                    ...reportsRoutes, // Equipo 9
                    ...superAdminRoutes, // Equipo 3
                    ...gradeRoutes, // Equipo 5
                ],
            },
        ],
    },
]