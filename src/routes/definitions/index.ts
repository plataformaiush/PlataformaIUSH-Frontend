import { RouteObject } from 'react-router-dom'
import { authRoutes } from './auth.routes'
import {vistaEstudiantesRutas} from "./vista-estudiante.routes";
import { reportsRoutes } from './reports.routes';
import { superAdminRoutes } from './superadmin.routes';
import { adminRoutes } from './admin.routes';

/**
 * Agregador central de rutas
 * Cada equipo debe crear su archivo {modulo}.routes.ts y agregarlo aquí
 *
 * Patrón para agregar rutas:
 * 1. Equipo crea: src/routes/definitions/{modulo}.routes.ts
 * 2. Exporta: export const {modulo}Routes: RouteObject[] = [...]
 * 3. Importa aquí y agrega a allRoutes
 *
 * Ejemplo para Equipo 1 (Cursos):
 * import { plantillaRoutes } from './course.routes'
 * y luego descomenta ...plantillaRoutes en allRoutes
 */

export const allRoutes: RouteObject[] = [
    ...authRoutes,//Equipo 1
    ...vistaEstudiantesRutas, //Equipo 7
    ...reportsRoutes, //Equipo 9 (Analytics y Reportes)
    ...superAdminRoutes, //Equipo 3 (Institución)
    ...adminRoutes, //Equipo 4 (Admin)
    // Equipo 1 (Cursos): ...plantillaRoutes,
    // Equipo 2 (Archivos): ...fileRoutes,
    // Equipo 3 (Institución): ...institutionRoutes,
    // Equipo 5 (Notas): ...gradeRoutes,
    // Equipo 6 (Docente): ...teacherRoutes,
    // Equipo 7 (Socioemocional): ...socioEmotionalRoutes,
    // Equipo 9 (Analytics): ...analyticsRoutes,
    // Equipo 10 (Estudiante): ...studentRoutes,
]