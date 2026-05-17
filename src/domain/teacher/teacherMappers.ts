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

  return {
    id: asString(item.id) || asString(item.courseId),
    title:
      asString(item.title) ||
      asString(item.name) ||
      asString(item.courseTitle) ||
      asString(item.nombre),
    code: asOptionalString(item.code) || asOptionalString(item.codigo),
    modulesCount: asNumber(item.modulesCount ?? item.modulosCount ?? item.modules),
    contentsCount: asNumber(
      item.contentsCount ?? item.contenidosCount ?? item.contents
    ),
    enrolledStudents: asNumber(
      item.enrolledStudents ?? item.studentsCount ?? item.inscritos
    ),
    completedStudents: asNumber(
      item.completedStudents ?? item.completedCount ?? item.completados
    ),
    progressPercentage:
      item.progressPercentage !== undefined
        ? asNumber(item.progressPercentage)
        : item.percentage !== undefined
          ? asNumber(item.percentage)
          : null,
    status: isTeacherCourseStatus(status) ? status : null,
    detailUrl: asOptionalString(item.detailUrl) || asOptionalString(item.url),
  };
}

function mapRecentEnrollment(value: unknown): RecentEnrolledStudent {
  const item = isRecord(value) ? value : {};

  const studentName =
    asString(item.studentName) ||
    asString(item.name) ||
    asString(item.nombre) ||
    "Estudiante";

  return {
    id: asString(item.id) || asString(item.enrollmentId),
    studentId: asOptionalString(item.studentId),
    studentName,
    email: asOptionalString(item.email) || asOptionalString(item.correo),
    avatar: asOptionalString(item.avatar) || buildInitials(studentName),
    courseId: asString(item.courseId),
    courseTitle:
      asString(item.courseTitle) ||
      asString(item.courseName) ||
      asString(item.curso),
    progressPercentage: asNumber(
      item.progressPercentage ?? item.percentage ?? item.avance
    ),
    enrolledAt:
      asString(item.enrolledAt) ||
      asString(item.createdAt) ||
      asString(item.fechaInscripcion),
    detailUrl: asOptionalString(item.detailUrl) || asOptionalString(item.url),
  };
}

export function mapTeacherHealthResponse(
  payload: unknown
): TeacherHealthResponse {
  const data = unwrapPayload(payload);

  return {
    status: asString(data.status) || "unknown",
    module: asOptionalString(data.module) ?? undefined,
    team: asOptionalString(data.team) ?? undefined,
    timestamp: asOptionalString(data.timestamp) ?? undefined,
  };
}

export function mapTeacherDashboardSummaryResponse(
  payload: unknown
): TeacherDashboardData {
  const data = unwrapPayload(payload);

  const teacherPayload = data.teacher ?? data.user ?? data.docente;
  const quickActions = isRecord(data.quickActions) ? data.quickActions : {};
  const totals = isRecord(data.totals) ? data.totals : data;

  return {
    teacher: mapTeacher(teacherPayload),
    quickActions: {
      createCourseUrl:
        asOptionalString(quickActions.createCourseUrl) ||
        asOptionalString(data.createCourseUrl),
      createContentUrl:
        asOptionalString(quickActions.createContentUrl) ||
        asOptionalString(data.createContentUrl),
      coursesUrl:
        asOptionalString(quickActions.coursesUrl) ||
        asOptionalString(data.coursesUrl),
    },
    totals: {
      students: asNumber(totals.students ?? totals.totalStudents),
      courses: asNumber(totals.courses ?? totals.totalCourses),
      modules: asNumber(totals.modules ?? totals.totalModules),
      contents: asNumber(totals.contents ?? totals.totalContents),
    },
    coursesInCreation: asArray(
      data.coursesInCreation ?? data.cursosEnCreacion
    ).map(mapCourseInsight),
    topCompletedCourses: asArray(
      data.topCompletedCourses ?? data.cursosMasCompletados
    ).map(mapCourseInsight),
    topEnrolledCourses: asArray(
      data.topEnrolledCourses ?? data.cursosMasInscritos
    ).map(mapCourseInsight),
    lowEnrolledCourses: asArray(
      data.lowEnrolledCourses ?? data.cursosMenosInscritos
    ).map(mapCourseInsight),
    recentEnrollments: asArray(
      data.recentEnrollments ?? data.ultimosInscritos
    ).map(mapRecentEnrollment),
  };
}