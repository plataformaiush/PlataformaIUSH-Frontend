import {
  RecentEnrolledStudent,
  TeacherCourseInsight,
  TeacherCourseStatus,
  TeacherDashboardData,
  TeacherHealthResponse,
  TeacherProfile,
} from "./teacherTypes";

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function asOptionalString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null;
}

function asNumber(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;

  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function unwrapPayload(payload: unknown): UnknownRecord {
  if (!isRecord(payload)) return {};

  if (isRecord(payload.data)) return payload.data;
  if (isRecord(payload.dashboard)) return payload.dashboard;
  if (isRecord(payload.summary)) return payload.summary;

  return payload;
}

function isTeacherCourseStatus(value: unknown): value is TeacherCourseStatus {
  return (
    value === "En creación" ||
    value === "Publicado" ||
    value === "Sin módulos" ||
    value === "Sin contenidos" ||
    value === "Pendiente"
  );
}

function buildInitials(name: string): string {
  return name
    .trim()
    .split(" ")
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

function mapTeacher(value: unknown): TeacherProfile {
  const item = isRecord(value) ? value : {};

  const name =
    asString(item.name) ||
    asString(item.nombre) ||
    asString(item.fullName) ||
    "Docente";

  return {
    id: asString(item.id) || asString(item.userId),
    name,
    email: asString(item.email) || asString(item.correo),
    role: asString(item.role) || asString(item.rol) || "Docente",
    initials: asString(item.initials) || buildInitials(name) || "D",
  };
}

function mapCourseInsight(value: unknown): TeacherCourseInsight {
  const item = isRecord(value) ? value : {};

  const status = item.status ?? item.estado;

  const modulesCount = asNumber(
    item.modulesCount ??
      item.modulosCount ??
      item.total_modulos ??
      item.cantidad_modulos ??
      item.modulos ??
      item.modules
  );

  const contentsCount = asNumber(
    item.contentsCount ??
      item.contenidosCount ??
      item.total_contenidos ??
      item.cantidad_contenidos ??
      item.contenidos ??
      item.contents
  );

  const enrolledStudents = asNumber(
    item.enrolledStudents ??
      item.studentsCount ??
      item.inscritos ??
      item.total_inscritos ??
      item.total_estudiantes ??
      item.estudiantes_inscritos
  );

  const completedStudents = asNumber(
    item.completedStudents ??
      item.completedCount ??
      item.completados ??
      item.total_completados ??
      item.estudiantes_completados
  );

  const progressPercentage =
    item.progressPercentage !== undefined
      ? asNumber(item.progressPercentage)
      : item.percentage !== undefined
        ? asNumber(item.percentage)
        : item.porcentaje !== undefined
          ? asNumber(item.porcentaje)
          : item.avance !== undefined
            ? asNumber(item.avance)
            : null;

  return {
    id:
      asString(item.id) ||
      asString(item.courseId) ||
      asString(item.id_curso),

    title:
      asString(item.title) ||
      asString(item.name) ||
      asString(item.courseTitle) ||
      asString(item.nombre) ||
      asString(item.titulo),

    code:
      asOptionalString(item.code) ||
      asOptionalString(item.codigo) ||
      asOptionalString(item.codigo_curso),

    modulesCount,
    contentsCount,
    enrolledStudents,
    completedStudents,
    progressPercentage,

    status: isTeacherCourseStatus(status)
      ? status
      : modulesCount === 0
        ? "Sin módulos"
        : contentsCount === 0
          ? "Sin contenidos"
          : "Publicado",

    detailUrl:
      asOptionalString(item.detailUrl) ||
      asOptionalString(item.url) ||
      asOptionalString(item.ruta),
  };
}

function mapRecentEnrollment(value: unknown): RecentEnrolledStudent {
  const item = isRecord(value) ? value : {};

  const studentName =
    asString(item.studentName) ||
    asString(item.nombre_estudiante) ||
    asString(item.name) ||
    asString(item.nombre) ||
    "Estudiante";

  return {
    id:
      asString(item.id) ||
      asString(item.enrollmentId) ||
      asString(item.id_inscripcion),

    studentId:
      asOptionalString(item.studentId) ||
      asOptionalString(item.id_estudiante),

    studentName,

    email:
      asOptionalString(item.email) ||
      asOptionalString(item.correo) ||
      null,

    avatar: asOptionalString(item.avatar) || buildInitials(studentName),

    courseId:
      asString(item.courseId) ||
      asString(item.id_curso),

    courseTitle:
      asString(item.courseTitle) ||
      asString(item.courseName) ||
      asString(item.titulo_curso) ||
      asString(item.curso),

    progressPercentage: asNumber(
      item.progressPercentage ??
        item.percentage ??
        item.porcentaje ??
        item.avance
    ),

    enrolledAt:
      asString(item.enrolledAt) ||
      asString(item.createdAt) ||
      asString(item.fecha_inicio) ||
      asString(item.fechaInscripcion),

    detailUrl:
      asOptionalString(item.detailUrl) ||
      asOptionalString(item.url),
  };
}

function mergeCourseData(
  baseCourses: TeacherCourseInsight[],
  detailCourses: TeacherCourseInsight[]
): TeacherCourseInsight[] {
  return baseCourses.map((course) => {
    const detail = detailCourses.find((item) => item.id === course.id);

    if (!detail) return course;

    return {
      ...course,
      modulesCount:
        course.modulesCount > 0 ? course.modulesCount : detail.modulesCount,
      contentsCount:
        course.contentsCount > 0 ? course.contentsCount : detail.contentsCount,
      enrolledStudents:
        course.enrolledStudents > 0
          ? course.enrolledStudents
          : detail.enrolledStudents,
      completedStudents:
        course.completedStudents > 0
          ? course.completedStudents
          : detail.completedStudents,
      progressPercentage:
        course.progressPercentage !== null && course.progressPercentage !== undefined
          ? course.progressPercentage
          : detail.progressPercentage,
      status:
        course.status && course.status !== "Pendiente"
          ? course.status
          : detail.status,
      detailUrl: course.detailUrl || detail.detailUrl,
    };
  });
}

export function mapTeacherHealthResponse(
  payload: unknown
): TeacherHealthResponse {
  const data = unwrapPayload(payload);

  return {
    status: asString(data.status) || "unknown",
    module:
      asOptionalString(data.module) ||
      asOptionalString(data.modulo) ||
      undefined,
    team: asOptionalString(data.team) ?? undefined,
    timestamp: asOptionalString(data.timestamp) ?? undefined,
  };
}

export function mapTeacherDashboardSummaryResponse(
  payload: unknown
): TeacherDashboardData {
  const data = unwrapPayload(payload);

  const teacherPayload = data.teacher ?? data.user ?? data.docente;

  const quickActions = isRecord(data.quickActions)
    ? data.quickActions
    : isRecord(data.accionesRapidas)
      ? data.accionesRapidas
      : {};

  const totals = isRecord(data.totals)
    ? data.totals
    : isRecord(data.totales)
      ? data.totales
      : data;

  const rawCourses = asArray(
    data.courses ??
      data.cursos ??
      data.assignedCourses ??
      data.cursos_asignados
  );

  const mappedCourses = rawCourses.map(mapCourseInsight);

  return {
    teacher: mapTeacher(teacherPayload),

    quickActions: {
      createCourseUrl:
        asOptionalString(quickActions.createCourseUrl) ||
        asOptionalString(quickActions.crearCursoUrl) ||
        asOptionalString(data.createCourseUrl) ||
        asOptionalString(data.crear_curso_url),

      createContentUrl:
        asOptionalString(quickActions.createContentUrl) ||
        asOptionalString(quickActions.crearContenidoUrl) ||
        asOptionalString(data.createContentUrl) ||
        asOptionalString(data.crear_contenido_url),

      coursesUrl:
        asOptionalString(quickActions.coursesUrl) ||
        asOptionalString(quickActions.misCursosUrl) ||
        asOptionalString(data.coursesUrl) ||
        asOptionalString(data.cursos_url),
    },

    totals: {
      students: asNumber(
        totals.students ??
          totals.totalStudents ??
          totals.total_estudiantes ??
          totals.total_estudiantes_matriculados ??
          totals.estudiantes ??
          totals.estudiantes_matriculados
      ),

      courses: asNumber(
        totals.courses ??
          totals.totalCourses ??
          totals.total_cursos ??
          totals.cursos
      ),

      modules: asNumber(
        totals.modules ??
          totals.totalModules ??
          totals.total_modulos ??
          totals.modulos
      ),

      contents: asNumber(
        totals.contents ??
          totals.totalContents ??
          totals.total_contenidos ??
          totals.contenidos
      ),
    },

    coursesInCreation: mappedCourses.filter(
      (course) => course.modulesCount === 0 || course.contentsCount === 0
    ),

    topCompletedCourses: asArray(
      data.topCompletedCourses ??
        data.cursosMasCompletados ??
        data.cursos_mas_completados
    ).map(mapCourseInsight),

    topEnrolledCourses: asArray(
      data.topEnrolledCourses ??
        data.cursosMasInscritos ??
        data.cursos_mas_inscritos
    ).map(mapCourseInsight),

    lowEnrolledCourses: asArray(
      data.lowEnrolledCourses ??
        data.cursosMenosInscritos ??
        data.cursos_menos_inscritos
    ).map(mapCourseInsight),

    recentEnrollments: asArray(
      data.recentEnrollments ??
        data.ultimosInscritos ??
        data.ultimos_inscritos ??
        data.estudiantes_recientes
    ).map(mapRecentEnrollment),
  };
}

export function mapTeacherCoursesInProgressResponse(
  payload: unknown
): TeacherCourseInsight[] {
  const data = unwrapPayload(payload);

  return asArray(data.cursos ?? data.courses).map(mapCourseInsight);
}

export function mapTeacherStudentsTotalResponse(payload: unknown): number {
  const data = unwrapPayload(payload);

  return asNumber(
    data.total_estudiantes_matriculados ??
      data.totalStudents ??
      data.students ??
      data.total_estudiantes
  );
}

export function mapTeacherTopEnrolledCoursesResponse(
  payload: unknown
): TeacherCourseInsight[] {
  const data = unwrapPayload(payload);

  return asArray(data.cursos ?? data.courses).map(mapCourseInsight);
}

export function mapTeacherLowestEnrolledCoursesResponse(
  payload: unknown
): TeacherCourseInsight[] {
  const data = unwrapPayload(payload);

  return asArray(data.cursos ?? data.courses).map(mapCourseInsight);
}

export function mapTeacherTopCompletedCoursesResponse(
  payload: unknown
): TeacherCourseInsight[] {
  const data = unwrapPayload(payload);

  return asArray(
    data.cursos ??
      data.courses ??
      data.topCompletedCourses ??
      data.cursosMasCompletados ??
      data.cursos_mas_completados
  ).map(mapCourseInsight);
}

export function mapTeacherRecentStudentsResponse(
  payload: unknown
): RecentEnrolledStudent[] {
  const data = unwrapPayload(payload);

  return asArray(data.estudiantes ?? data.students).map(mapRecentEnrollment);
}

export function composeTeacherDashboardData(params: {
  summary: unknown;
  coursesInProgress?: unknown | null;
  studentsTotal?: unknown | null;
  topEnrolled?: unknown | null;
  lowestEnrolled?: unknown | null;
  topCompleted?: unknown | null;
  recentStudents?: unknown | null;
}): TeacherDashboardData {
  const baseDashboard = mapTeacherDashboardSummaryResponse(params.summary);

  const coursesInProgress = params.coursesInProgress
    ? mapTeacherCoursesInProgressResponse(params.coursesInProgress)
    : baseDashboard.coursesInCreation;

  const studentsTotal = params.studentsTotal
    ? mapTeacherStudentsTotalResponse(params.studentsTotal)
    : baseDashboard.totals.students;

  const topEnrolledCourses = params.topEnrolled
    ? mapTeacherTopEnrolledCoursesResponse(params.topEnrolled)
    : baseDashboard.topEnrolledCourses;

  const lowEnrolledCourses = params.lowestEnrolled
    ? mapTeacherLowestEnrolledCoursesResponse(params.lowestEnrolled)
    : baseDashboard.lowEnrolledCourses;

  const topCompletedCourses = params.topCompleted
    ? mapTeacherTopCompletedCoursesResponse(params.topCompleted)
    : baseDashboard.topCompletedCourses;

  const recentEnrollments = params.recentStudents
    ? mapTeacherRecentStudentsResponse(params.recentStudents)
    : baseDashboard.recentEnrollments;

  const enrollmentDetails = [...topEnrolledCourses, ...lowEnrolledCourses];

  const enrichedCoursesInProgress = mergeCourseData(
    coursesInProgress,
    enrollmentDetails
  );

  const enrichedTopEnrolledCourses = mergeCourseData(
    topEnrolledCourses,
    coursesInProgress
  );

  const enrichedLowEnrolledCourses = mergeCourseData(
    lowEnrolledCourses,
    coursesInProgress
  );

  return {
    ...baseDashboard,

    totals: {
      ...baseDashboard.totals,
      students: studentsTotal,
    },

    coursesInCreation: enrichedCoursesInProgress,

    topEnrolledCourses: enrichedTopEnrolledCourses,

    lowEnrolledCourses: enrichedLowEnrolledCourses,

    topCompletedCourses,

    recentEnrollments,
  };
}