import {createElement} from 'react'
import {RouteObject} from 'react-router-dom'
import {StudentLayout} from '../../presentation/features/student/layout/StudentLayout'
import {StudentDashboardPage} from '../../presentation/features/student/dashboard/StudentDashboardPage'
import {CourseMapPage} from '../../presentation/features/student/course-map/CourseMapPage'
import {StudentGradesPage} from '../../presentation/features/student/grades/StudentGradesPage'
import {MisCursosPage} from "../../presentation/features/student/pages/MisCursosPage.tsx";

// 👇 NUEVO: Importa la página que acabamos de crear
// (Ajusta la ruta dependiendo de en qué carpeta guardaste MisCursosPage.tsx)

// Agrupamos las rutas de estudiante bajo el layout `StudentLayout`
// para que el sidebar, header y bottom-nav solo afecten las rutas /student/*
export const vistaEstudiantesRutas: RouteObject[] = [
    {
        path: '/student',
        element: createElement(StudentLayout),
        children: [
            {index: true, element: createElement(StudentDashboardPage)},
            {path: 'dashboard', element: createElement(StudentDashboardPage)},

            {path: 'mis-cursos', element: createElement(MisCursosPage)},

            {path: 'courses/:courseId', element: createElement(CourseMapPage)},
            {path: 'grades', element: createElement(StudentGradesPage)},
        ],
    },
]