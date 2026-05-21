import { AdminDashboard } from './types'

const DEMO_DASHBOARD: AdminDashboard = {
  reports: [
    {
      id: 'courses-attention',
      kind: 'metrics',
      order: 1,
      title: 'Cursos que requieren atención',
      metrics: [
        { id: 'no-content', label: 'Cursos sin contenido', value: 3 },
        { id: 'empty-modules', label: 'Cursos con módulos vacíos', value: 5 },
        { id: 'no-students', label: 'Cursos sin estudiantes inscritos', value: 2 },
        { id: 'no-teacher', label: 'Cursos sin docente asignado', value: 1 },
        { id: 'inactive', label: 'Cursos inactivos hace mucho tiempo', value: 4 },
      ],
    },
    {
      id: 'students-low-progress',
      kind: 'metrics',
      order: 2,
      title: 'Estudiantes con bajo progreso',
      metrics: [
        { id: 'behind', label: 'Estudiantes atrasados', value: 18 },
        { id: 'no-login-x-days', label: 'Estudiantes que no ingresan hace X días', value: 9 },
        { id: 'abandoned', label: 'Cursos abandonados', value: 6 },
        { id: 'low-average', label: 'Promedio de avance bajo', value: '23%' },
      ],
    },
    {
      id: 'students-most-active',
      kind: 'metrics',
      order: 3,
      title: 'Estudiantes más activos',
      metrics: [
        { id: 'time', label: 'Más tiempo en plataforma', value: 'Ana P. · 12h' },
        { id: 'modules', label: 'Más módulos completados', value: 'Juan R. · 28' },
        { id: 'participation', label: 'Mayor participación', value: 'Laura M. · 64' },
        { id: 'views', label: 'Más contenidos vistos', value: 'Santiago G. · 142' },
      ],
    },
    {
      id: 'teachers-pending-activity',
      kind: 'metrics',
      order: 4,
      title: 'Docentes pendientes de actividad',
      metrics: [
        { id: 'no-content', label: 'Docentes que no suben contenido', value: 4 },
        { id: 'inactive', label: 'Docentes inactivos', value: 3 },
        { id: 'no-updates', label: 'Cursos sin actualizaciones recientes', value: 7 },
        { id: 'incomplete-modules', label: 'Docentes con módulos incompletos', value: 5 },
      ],
    },
    {
      id: 'course-quality',
      kind: 'metrics',
      order: 5,
      title: 'Calidad de cursos',
      metrics: [
        { id: 'few-contents', label: 'Cursos con pocos contenidos', value: 8 },
        { id: 'no-videos', label: 'Cursos sin videos', value: 6 },
        { id: 'no-pdfs', label: 'Cursos sin PDFs/material', value: 10 },
        { id: 'incomplete-modules', label: 'Cursos con módulos incompletos', value: 5 },
        { id: 'no-evals', label: 'Cursos sin evaluaciones/notas', value: 9 },
      ],
    },
    {
      id: 'content-issues',
      kind: 'metrics',
      order: 6,
      title: 'Contenidos pendientes o problemáticos',
      metrics: [
        { id: 'broken-files', label: 'Archivos dañados', value: 1 },
        { id: 'video-not-loading', label: 'Videos que no cargan', value: 2 },
        { id: 'missing-pdfs', label: 'PDFs faltantes', value: 4 },
        { id: 'hidden', label: 'Contenido oculto', value: 3 },
        { id: 'pending-approval', label: 'Contenido pendiente de aprobación', value: 6 },
      ],
    },
    {
      id: 'security-access',
      kind: 'metrics',
      order: 7,
      title: 'Actividad sospechosa o problemas de acceso',
      metrics: [
        { id: 'failed-logins', label: 'Intentos fallidos de login', value: 27 },
        { id: 'blocked', label: 'Usuarios bloqueados', value: 2 },
        { id: 'expired', label: 'Sesiones expiradas frecuentes', value: 11 },
        { id: 'multi-device', label: 'Accesos desde múltiples dispositivos', value: 7 },
        { id: 'no-recent-activity', label: 'Usuarios sin actividad reciente', value: 34 },
      ],
    },
    {
      id: 'courses-high-dropout',
      kind: 'metrics',
      order: 8,
      title: 'Cursos con mayor abandono',
      metrics: [
        { id: 'top-dropout', label: 'Cursos donde más estudiantes desertan', value: 'Matemáticas I · 22%' },
        { id: 'module', label: 'Módulo donde abandonan más', value: 'Módulo 2' },
        { id: 'avg-time', label: 'Tiempo promedio antes de abandonar', value: '9 días' },
      ],
    },
    {
      id: 'platform-recent-activity',
      kind: 'feed',
      order: 9,
      title: 'Actividad reciente de la plataforma',
      sections: [
        {
          id: 'courses',
          title: 'Últimos cursos creados',
          entries: ['Introducción a React (hace 2h)', 'Fundamentos de SQL (hace 1d)'],
        },
        {
          id: 'contents',
          title: 'Últimos contenidos subidos',
          entries: ['Video: Hooks en React (hace 3h)', 'PDF: Guía de consultas (hace 2d)'],
        },
        {
          id: 'students',
          title: 'Últimos estudiantes registrados',
          entries: ['María G. (hace 5h)', 'Andrés P. (hace 1d)'],
        },
        {
          id: 'modules',
          title: 'Últimos módulos editados',
          entries: ['Módulo 1 · React (hace 6h)', 'Módulo 3 · SQL (hace 3d)'],
        },
        {
          id: 'certificates',
          title: 'Últimos certificados emitidos',
          entries: ['Certificado · UX Básico (hace 2d)', 'Certificado · Python (hace 4d)'],
        },
      ],
    },
    {
      id: 'course-academic-performance',
      kind: 'metrics',
      order: 10,
      title: 'Rendimiento académico por curso',
      metrics: [
        { id: 'avg-grades', label: 'Promedio de notas', value: '3.6 / 5.0' },
        { id: 'low-performance', label: 'Cursos con bajo rendimiento', value: 3 },
        { id: 'hard-modules', label: 'Módulos más difíciles', value: 'M2 · Evaluaciones' },
        { id: 'failed', label: 'Estudiantes reprobados', value: 12 },
        { id: 'pending', label: 'Actividades pendientes', value: 41 },
      ],
    },
  ],
}

export const adminReportsService = {
  async getDashboard(): Promise<AdminDashboard> {
    return DEMO_DASHBOARD
  },
}
