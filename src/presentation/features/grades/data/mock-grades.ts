// src/presentation/features/grades/data/mock-grades.ts

import type { Student, Module, Certificate } from '../../../../domain/grades';

export const mockStudents: Student[] = [
  { id: '1', name: 'Ana García',       progress: 100, moduleN: 92, moduleNPlus1: 88, finalAverage: 90,   status: 'approved'     },
  { id: '2', name: 'Carlos Rodríguez', progress: 75,  moduleN: 85, moduleNPlus1: 0,  finalAverage: 85,   status: 'in-progress'  },
  { id: '3', name: 'María López',      progress: 100, moduleN: 95, moduleNPlus1: 93, finalAverage: 94,   status: 'approved'     },
  { id: '4', name: 'Juan Martínez',    progress: 50,  moduleN: 78, moduleNPlus1: 0,  finalAverage: 78,   status: 'in-progress'  },
  { id: '5', name: 'Laura Sánchez',    progress: 100, moduleN: 88, moduleNPlus1: 91, finalAverage: 89.5, status: 'approved'     },
  { id: '6', name: 'Diego Torres',     progress: 100, moduleN: 82, moduleNPlus1: 86, finalAverage: 84,   status: 'approved'     },
  { id: '7', name: 'Sofia Ramírez',    progress: 25,  moduleN: 90, moduleNPlus1: 0,  finalAverage: 90,   status: 'in-progress'  },
];

export const mockModules: Module[] = [
  {
    id: '1',
    name: 'Introducción al LMS',
    score: 95,
    maxScore: 100,
    completedDate: '2026-04-15',
    status: 'completed',
    assignments: [
      { id: '1-1', name: 'Quiz 1: Conceptos Básicos',        score: 18, maxScore: 20, weight: 20, submittedDate: '2026-04-10' },
      { id: '1-2', name: 'Tarea 1: Navegación del Sistema',  score: 28, maxScore: 30, weight: 30, submittedDate: '2026-04-12' },
      { id: '1-3', name: 'Proyecto: Primer Dashboard',       score: 47, maxScore: 50, weight: 50, submittedDate: '2026-04-15' },
    ],
  },
  {
    id: '2',
    name: 'Características Avanzadas',
    score: 88,
    maxScore: 100,
    completedDate: '2026-04-22',
    status: 'completed',
    assignments: [
      { id: '2-1', name: 'Quiz 2: Funciones Avanzadas',          score: 22, maxScore: 25, weight: 25, submittedDate: '2026-04-18' },
      { id: '2-2', name: 'Tarea 2: Configuración Personalizada', score: 33, maxScore: 35, weight: 35, submittedDate: '2026-04-20' },
      { id: '2-3', name: 'Examen Práctico',                      score: 33, maxScore: 40, weight: 40, submittedDate: '2026-04-22' },
    ],
  },
  {
    id: '3',
    name: 'Mejores Prácticas',
    score: 92,
    maxScore: 100,
    completedDate: '2026-04-28',
    status: 'completed',
    assignments: [
      { id: '3-1', name: 'Quiz 3: Metodologías',         score: 19, maxScore: 20, weight: 20, submittedDate: '2026-04-24' },
      { id: '3-2', name: 'Ensayo: Análisis de Casos',    score: 27, maxScore: 30, weight: 30, submittedDate: '2026-04-26' },
      { id: '3-3', name: 'Proyecto Final del Módulo',    score: 46, maxScore: 50, weight: 50, submittedDate: '2026-04-28' },
    ],
  },
  {
    id: '4',
    name: 'Estrategias de Integración',
    score: 65,
    maxScore: 100,
    completedDate: '',
    status: 'in-progress',
    assignments: [
      { id: '4-1', name: 'Quiz 4: APIs y Webhooks',      score: 15, maxScore: 20, weight: 20, submittedDate: '2026-05-02' },
      { id: '4-2', name: 'Tarea 3: Integración Básica',  score: 25, maxScore: 30, weight: 30, submittedDate: '2026-05-05' },
      { id: '4-3', name: 'Proyecto de Integración',      score: 0,  maxScore: 50, weight: 50, submittedDate: ''           },
    ],
  },
];

export const mockCertificates: Certificate[] = [
  { id: '1', courseName: 'Introduction to LMS',      issueDate: '2026-04-15', certificateId: 'CERT-2026-001', status: 'unlocked'              },
  { id: '2', courseName: 'Advanced Features',        issueDate: '2026-04-28', certificateId: 'CERT-2026-002', status: 'unlocked'              },
  { id: '3', courseName: 'Integration Strategies',   issueDate: '',           certificateId: '',              status: 'locked', progress: 65   },
  { id: '4', courseName: 'Enterprise Solutions',     issueDate: '',           certificateId: '',              status: 'locked', progress: 25   },
];
