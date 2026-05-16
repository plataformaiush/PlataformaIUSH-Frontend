import { RouteObject } from 'react-router-dom';
import { createElement } from 'react';
import { authRoutes } from './auth.routes';
import { vistaEstudiantesRutas } from './vista-estudiante.routes';
import { reportsRoutes } from './reports.routes';
import { superAdminRoutes } from './superadmin.routes';
import { adminRoutes } from './admin.routes';
import { gradeRoutes } from './grades.routes';
import ProfunSoft from '../../ProfunSoft';

/**
 * Agregador central de rutas
 * Define la estructura base de la aplicación
 * Equipo 2: Centralización de rutas
 * 
 * @example
 * export const allRoutes: RouteObject[] = [
 *     ...authRoutes,
 *     ...dashboardRoutes
 * ];
 */

export const allRoutes: RouteObject[] = [
    ...authRoutes,           // Equipo 1
    ...vistaEstudiantesRutas, // Equipo 7
    {
        path: '/',
        element: createElement(ProfunSoft),
        children: [
            ...reportsRoutes,     // Equipo 9 (Analytics y Reportes)
            ...superAdminRoutes,  // Equipo 3 (Institución)
            ...gradeRoutes,       // Equipo 5 (Notas)
            ...adminRoutes,       // Equipo 4 (Admin)
        ],
    },
    // Equipo 1 (Cursos): ...plantillaRoutes,
    // Equipo 2 (Archivos): ...fileRoutes,
    // Equipo 3 (Institución): ...institutionRoutes,
    // Equipo 6 (Docente): ...teacherRoutes,
    // Equipo 7 (Socioemocional): ...socioEmotionalRoutes,
    // Equipo 9 (Analytics): ...analyticsRoutes,
];
