import {
  GradeAssignment,
  GradeRow,
  TeacherCourse,
  TeacherProfile,
  TeacherStat,
  TeacherStudent,
} from "./teacherTypes";

export const teacherProfile: TeacherProfile = {
  name: "Laura Martínez",
  role: "Docente",
  email: "laura.martinez@iush.edu.co",
  initials: "LM",
};

export const teacherStats: TeacherStat[] = [
  {
    id: "courses",
    label: "Cursos asignados",
    value: "4",
    helper: "Activos este semestre",
    trend: "+1 nuevo",
  },
  {
    id: "students",
    label: "Estudiantes",
    value: "128",
    helper: "Matriculados",
    trend: "92% activos",
  },
  {
    id: "modules",
    label: "Módulos publicados",
    value: "18",
    helper: "Contenidos disponibles",
    trend: "+6 esta semana",
  },
  {
    id: "risk",
    label: "En riesgo",
    value: "9",
    helper: "Requieren seguimiento",
    trend: "Revisar",
  },
];

export const teacherCourses: TeacherCourse[] = [
  {
    id: "frontend",
    title: "Desarrollo Frontend",
    code: "IUSH-FE-604",
    period: "2026-1",
    students: 34,
    progress: 78,
    publishedModules: 6,
    totalModules: 8,
    colorFrom: "#153744",
    colorTo: "#37b39c",
    description:
      "Componentes, estados, rutas y consumo de servicios usando React, TypeScript y Tailwind CSS.",
    nextClass: "Miércoles 8:00 AM",
    modules: [
      {
        id: "mod-fe-1",
        title: "Fundamentos de React",
        description: "Componentes, props, estado local y eventos.",
        published: true,
        materials: [
          {
            id: "mat-fe-1",
            title: "Guía de componentes reutilizables",
            type: "PDF",
            duration: "18 min",
          },
          {
            id: "mat-fe-2",
            title: "Clase grabada: Hooks esenciales",
            type: "Video",
            duration: "42 min",
          },
        ],
      },
      {
        id: "mod-fe-2",
        title: "Tailwind CSS aplicado",
        description: "Maquetación responsiva y diseño visual de interfaces.",
        published: true,
        materials: [
          {
            id: "mat-fe-3",
            title: "Sistema visual tipo dashboard",
            type: "Enlace",
            duration: "12 min",
          },
          {
            id: "mat-fe-4",
            title: "Cuestionario de estilos",
            type: "Quiz",
            duration: "10 min",
          },
        ],
      },
    ],
  },
  {
    id: "database",
    title: "Bases de Datos",
    code: "IUSH-BD-502",
    period: "2026-1",
    students: 28,
    progress: 64,
    publishedModules: 5,
    totalModules: 9,
    colorFrom: "#1f5d6b",
    colorTo: "#62c8b1",
    description:
      "Modelado relacional, consultas SQL, normalización y diseño de bases de datos académicas.",
    nextClass: "Jueves 10:00 AM",
    modules: [
      {
        id: "mod-db-1",
        title: "Modelo entidad relación",
        description: "Identificación de entidades, atributos y relaciones.",
        published: true,
        materials: [
          {
            id: "mat-db-1",
            title: "Plantilla MER",
            type: "PDF",
            duration: "15 min",
          },
          {
            id: "mat-db-2",
            title: "Ejercicios de cardinalidad",
            type: "Quiz",
            duration: "20 min",
          },
        ],
      },
    ],
  },
  {
    id: "calculus",
    title: "Cálculo Diferencial",
    code: "IUSH-MT-301",
    period: "2026-1",
    students: 42,
    progress: 70,
    publishedModules: 4,
    totalModules: 6,
    colorFrom: "#17313d",
    colorTo: "#2f8290",
    description:
      "Límites, derivadas, continuidad y aplicaciones matemáticas en problemas reales.",
    nextClass: "Lunes 6:00 PM",
    modules: [
      {
        id: "mod-ca-1",
        title: "Límites y continuidad",
        description: "Conceptos iniciales y resolución gráfica.",
        published: true,
        materials: [
          {
            id: "mat-ca-1",
            title: "Resumen de límites",
            type: "PDF",
            duration: "16 min",
          },
        ],
      },
    ],
  },
  {
    id: "ethics",
    title: "Ética Profesional",
    code: "IUSH-HU-210",
    period: "2026-1",
    students: 24,
    progress: 88,
    publishedModules: 3,
    totalModules: 4,
    colorFrom: "#244854",
    colorTo: "#45ad96",
    description:
      "Reflexión ética, responsabilidad social, casos profesionales y toma de decisiones.",
    nextClass: "Viernes 2:00 PM",
    modules: [
      {
        id: "mod-et-1",
        title: "Ética y profesión",
        description: "Principios, dilemas y conducta profesional.",
        published: true,
        materials: [
          {
            id: "mat-et-1",
            title: "Caso de análisis profesional",
            type: "Enlace",
            duration: "14 min",
          },
        ],
      },
    ],
  },
];

export const teacherStudents: TeacherStudent[] = [
  {
    id: "st-1",
    name: "Sofía Ramírez",
    email: "sofia.ramirez@iush.edu.co",
    course: "Desarrollo Frontend",
    status: "Activo",
    average: 4.6,
    avatar: "SR",
  },
  {
    id: "st-2",
    name: "Mateo Gómez",
    email: "mateo.gomez@iush.edu.co",
    course: "Bases de Datos",
    status: "Activo",
    average: 4.2,
    avatar: "MG",
  },
  {
    id: "st-3",
    name: "Valentina Torres",
    email: "valentina.torres@iush.edu.co",
    course: "Cálculo Diferencial",
    status: "En riesgo",
    average: 2.8,
    avatar: "VT",
  },
  {
    id: "st-4",
    name: "Juan Esteban López",
    email: "juan.lopez@iush.edu.co",
    course: "Desarrollo Frontend",
    status: "Activo",
    average: 4.8,
    avatar: "JL",
  },
  {
    id: "st-5",
    name: "Camila Restrepo",
    email: "camila.restrepo@iush.edu.co",
    course: "Ética Profesional",
    status: "Activo",
    average: 4.0,
    avatar: "CR",
  },
  {
    id: "st-6",
    name: "Daniela Marín",
    email: "daniela.marin@iush.edu.co",
    course: "Bases de Datos",
    status: "En riesgo",
    average: 2.9,
    avatar: "DM",
  },
];

export const gradeAssignments: GradeAssignment[] = [
  {
    key: "activity1",
    label: "Actividad 1",
    percentage: 20,
  },
  {
    key: "quiz",
    label: "Quiz",
    percentage: 20,
  },
  {
    key: "project",
    label: "Proyecto",
    percentage: 35,
  },
  {
    key: "final",
    label: "Final",
    percentage: 25,
  },
];

export const gradesMock: GradeRow[] = [
  {
    id: "gr-1",
    student: "Sofía Ramírez",
    email: "sofia.ramirez@iush.edu.co",
    courseId: "frontend",
    assignments: {
      activity1: 4.8,
      quiz: 4.3,
      project: 4.7,
      final: 4.6,
    },
  },
  {
    id: "gr-2",
    student: "Juan Esteban López",
    email: "juan.lopez@iush.edu.co",
    courseId: "frontend",
    assignments: {
      activity1: 5.0,
      quiz: 4.5,
      project: 4.9,
      final: 4.7,
    },
  },
  {
    id: "gr-3",
    student: "Valentina Torres",
    email: "valentina.torres@iush.edu.co",
    courseId: "calculus",
    assignments: {
      activity1: 3.1,
      quiz: 2.6,
      project: 2.8,
      final: null,
    },
  },
  {
    id: "gr-4",
    student: "Mateo Gómez",
    email: "mateo.gomez@iush.edu.co",
    courseId: "database",
    assignments: {
      activity1: 4.0,
      quiz: 4.4,
      project: 4.2,
      final: 4.1,
    },
  },
  {
    id: "gr-5",
    student: "Daniela Marín",
    email: "daniela.marin@iush.edu.co",
    courseId: "database",
    assignments: {
      activity1: 2.9,
      quiz: 3.0,
      project: 2.6,
      final: null,
    },
  },
  {
    id: "gr-6",
    student: "Camila Restrepo",
    email: "camila.restrepo@iush.edu.co",
    courseId: "ethics",
    assignments: {
      activity1: 4.3,
      quiz: 3.9,
      project: 4.1,
      final: 3.8,
    },
  },
];