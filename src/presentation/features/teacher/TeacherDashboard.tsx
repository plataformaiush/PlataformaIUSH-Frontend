import {
  AlertCircle,
  ArrowRight,
  BarChart3,
  BookOpen,
  CheckCircle2,
  ClipboardList,
  FileText,
  GraduationCap,
  Layers3,
  PlusCircle,
  RefreshCcw,
  Sparkles,
  TrendingDown,
  TrendingUp,
  UsersRound,
} from "lucide-react";
import { useEffect, type CSSProperties, type ReactNode } from "react";
import { TeacherCourseInsight } from "../../../domain/teacher/teacherTypes";
import { TeacherCourseInsightCard } from "./components/TeacherCourseInsightCard";
import { TeacherEmptyState } from "./components/TeacherEmptyState";
import { TeacherMetricCard } from "./components/TeacherMetricCard";
import { TeacherRecentEnrollmentCard } from "./components/TeacherRecentEnrollmentCard";
import { useTeacherStore } from "./services/useTeacherStore";

function CourseSection({
  title,
  subtitle,
  icon,
  courses,
  emptyTitle,
  emptyDescription,
  variant,
}: {
  title: string;
  subtitle: string;
  icon: ReactNode;
  courses: TeacherCourseInsight[];
  emptyTitle: string;
  emptyDescription: string;
  variant?: "creation" | "enrolled" | "low" | "completed";
}) {
  return (
    <section className="rounded-[32px] border border-[var(--teacher-border)] bg-[var(--teacher-card)] p-6 shadow-[0_18px_38px_rgba(22,55,68,0.08)]">
      <div className="mb-6 flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--teacher-soft)] text-[var(--teacher-accent)]">
          {icon}
        </div>

        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[var(--teacher-accent)]">
            Dashboard docente
          </p>
          <h2 className="mt-1 text-2xl font-black text-[var(--teacher-text)]">
            {title}
          </h2>
          <p className="mt-1 text-sm font-medium text-[var(--teacher-muted)]">
            {subtitle}
          </p>
        </div>
      </div>

      {courses.length > 0 ? (
        <div className="grid gap-4 xl:grid-cols-2">
          {courses.map((course) => (
            <TeacherCourseInsightCard
              key={course.id}
              course={course}
              variant={variant}
            />
          ))}
        </div>
      ) : (
        <TeacherEmptyState
          icon={<BookOpen size={26} />}
          title={emptyTitle}
          description={emptyDescription}
        />
      )}
    </section>
  );
}
const teacherThemeVars = {
  "--teacher-bg": "var(--color-background, #FFFAFA)",
  "--teacher-card": "var(--color-input, #ffffff)",
  "--teacher-card-soft": "var(--color-input, #ffffff)",

  "--teacher-soft":
    "color-mix(in srgb, var(--color-tertiary, #AEEBF2) 24%, var(--color-input, #ffffff))",

  "--teacher-track":
    "color-mix(in srgb, var(--color-secondary, #5A878C) 22%, var(--color-input, #ffffff))",

  "--teacher-border": "var(--color-border, #E2E8F0)",

  "--teacher-primary": "var(--color-primary, #223740)",
  "--teacher-secondary": "var(--color-secondary, #5A878C)",
  "--teacher-accent": "var(--color-tertiary, #AEEBF2)",

  "--teacher-text": "var(--color-foreground, #0F172A)",
  "--teacher-muted": "var(--color-muted-foreground, #475569)",
  "--teacher-text-on-dark": "var(--color-text-on-dark, #F5F5F5)",

  "--teacher-success": "var(--color-secondary, #5A878C)",
  "--teacher-success-soft":
    "color-mix(in srgb, var(--color-tertiary, #AEEBF2) 35%, var(--color-input, #ffffff))",

  "--teacher-danger": "#ef6b7a",
  "--teacher-warning": "#f5b84b",
} as CSSProperties;

export default function TeacherDashboard() {
  const {
    dashboard,
    loading,
    error,
    notification,
    loadDashboard,
    refreshDashboard,
    clearNotification,
    goToExternalModule,
  } = useTeacherStore();

  useEffect(() => {
  if (!dashboard && !loading && !error) {
    void loadDashboard();
  }
}, [dashboard, loading, error, loadDashboard]);

  const teacher = dashboard?.teacher;
  const totals = dashboard?.totals;

  return (
    <main
      style={teacherThemeVars}
      className="min-h-screen bg-[var(--teacher-bg)] px-5 py-7 text-[var(--teacher-text)] lg:px-8"
    >
      <div className="mx-auto max-w-[1240px] space-y-7">
        <section className="overflow-hidden rounded-[32px] bg-gradient-to-br from-[var(--teacher-primary)] via-[var(--teacher-secondary)] to-[var(--teacher-accent)] p-7 text-[var(--teacher-text-on-dark)] shadow-[0_24px_60px_rgba(21,55,68,0.24)] md:p-9">
          <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
            <div className="max-w-2xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[color:color-mix(in_srgb,var(--teacher-text-on-dark)_18%,transparent)] bg-[color:color-mix(in_srgb,var(--teacher-text-on-dark)_12%,transparent)] px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-[var(--teacher-text-on-dark)] backdrop-blur">
                <Sparkles size={16} />
                Vista docente
              </div>

              <h1 className="text-4xl font-black tracking-tight md:text-5xl">
                {teacher?.name
                  ? `Bienvenid@, ${teacher.name}`
                  : "Bienvenid@, docente"}
              </h1>

              <p className="mt-4 max-w-xl text-base font-medium leading-7 text-[var(--teacher-text-on-dark)] opacity-80">
                Consulta el estado de tus cursos, estudiantes inscritos,
                contenidos, módulos y avances académicos desde un único tablero.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() =>
                  goToExternalModule(
                    dashboard?.quickActions.createCourseUrl,
                    "La URL para crear curso aún no ha sido suministrada por el módulo de Cursos."
                  )
                }
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[var(--teacher-card)] px-5 py-3.5 text-sm font-black text-[var(--teacher-primary)] shadow-[0_18px_35px_rgba(0,0,0,0.14)] transition hover:-translate-y-0.5"
              >
                <PlusCircle size={18} />
                <span>Crear curso</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  goToExternalModule(
                    dashboard?.quickActions.coursesUrl,
                    "La URL para ver mis cursos aún no ha sido suministrada por el módulo de Cursos."
                  )
                }
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[color:color-mix(in_srgb,var(--teacher-text-on-dark)_22%,transparent)] bg-[color:color-mix(in_srgb,var(--teacher-text-on-dark)_12%,transparent)] px-5 py-3.5 text-sm font-black text-[var(--teacher-text-on-dark)] backdrop-blur transition hover:-translate-y-0.5"
              >
                <span>Ver mis cursos</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </section>

        {loading ? (
          <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="rounded-[28px] border border-[var(--teacher-border)] bg-[var(--teacher-card)] p-5 shadow-[0_18px_38px_rgba(22,55,68,0.08)]"
              >
                <div className="h-12 w-12 animate-pulse rounded-2xl bg-[var(--teacher-soft)]" />
                <div className="mt-5 h-4 w-32 animate-pulse rounded-full bg-[var(--teacher-soft)]" />
                <div className="mt-4 h-9 w-20 animate-pulse rounded-full bg-[var(--teacher-track)]" />
                <div className="mt-3 h-4 w-40 animate-pulse rounded-full bg-[var(--teacher-soft)]" />
              </div>
            ))}
          </section>
        ) : null}

        {error ? (
          <section className="rounded-[32px] border border-red-200 bg-red-50 p-7 shadow-[0_18px_38px_rgba(22,55,68,0.08)]">
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div className="flex gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-100 text-[var(--teacher-danger)]">
                  <AlertCircle size={24} />
                </div>

                <div>
                  <h2 className="text-xl font-black text-[var(--teacher-text)]">
                    No fue posible cargar el resumen docente
                  </h2>

                  <p className="mt-2 text-sm font-medium leading-6 text-[var(--teacher-muted)]">
                    {error}
                  </p>

                  <p className="mt-2 text-xs font-bold text-[var(--teacher-muted)]">
                    Verifica que el endpoint{" "}
                    <span className="font-black">
                      /api/teacher/dashboard/summary
                    </span>{" "}
                    esté disponible y que el token del docente sea válido.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => void refreshDashboard()}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[var(--teacher-primary)] px-5 py-3 text-sm font-black text-white"
              >
                <RefreshCcw size={17} />
                Reintentar
              </button>
            </div>
          </section>
        ) : null}

        {!loading && !error && dashboard ? (
          <>
            <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              <TeacherMetricCard
                label="Estudiantes"
                value={totals?.students ?? 0}
                helper="Matriculados en tus cursos"
                icon={UsersRound}
              />

              <TeacherMetricCard
                label="Cursos"
                value={totals?.courses ?? 0}
                helper="Creados o asignados al docente"
                icon={BookOpen}
              />

              <TeacherMetricCard
                label="Módulos"
                value={totals?.modules ?? 0}
                helper="Módulos asociados a tus cursos"
                icon={Layers3}
              />

              <TeacherMetricCard
                label="Contenidos"
                value={totals?.contents ?? 0}
                helper="Recursos y materiales publicados"
                icon={FileText}
              />
            </section>

            <CourseSection
              title="Cursos en proceso de creación"
              subtitle="Cursos con módulos o contenidos pendientes."
              icon={<ClipboardList size={24} />}
              courses={dashboard.coursesInCreation}
              variant="creation"
              emptyTitle="No hay cursos en proceso de creación"
              emptyDescription="Cuando existan cursos sin módulos o sin contenidos, aparecerán en esta sección."
            />

            <section className="grid gap-7 xl:grid-cols-2">
              <CourseSection
                title="Cursos con más inscritos"
                subtitle="Cursos del docente con mayor cantidad de estudiantes."
                icon={<TrendingUp size={24} />}
                courses={dashboard.topEnrolledCourses}
                variant="enrolled"
                emptyTitle="No hay información de inscritos"
                emptyDescription="Esta sección depende del módulo de inscripciones o Vista Estudiante."
              />

              <CourseSection
                title="Cursos con menos inscritos"
                subtitle="Cursos que requieren seguimiento por baja matrícula."
                icon={<TrendingDown size={24} />}
                courses={dashboard.lowEnrolledCourses}
                variant="low"
                emptyTitle="No hay información de baja matrícula"
                emptyDescription="Cuando el módulo de inscripciones entregue datos, se mostrarán aquí."
              />
            </section>

            <CourseSection
              title="Cursos con más completados"
              subtitle="Cursos con mayor número de estudiantes que finalizaron."
              icon={<CheckCircle2 size={24} />}
              courses={dashboard.topCompletedCourses}
              variant="completed"
              emptyTitle="No hay información de cursos completados"
              emptyDescription="Esta sección depende del módulo de certificaciones y progreso."
            />

            <section className="rounded-[32px] border border-[var(--teacher-border)] bg-[var(--teacher-card)] p-6 shadow-[0_18px_38px_rgba(22,55,68,0.08)]">
              <div className="mb-6 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--teacher-soft)] text-[var(--teacher-accent)]">
                  <GraduationCap size={24} />
                </div>

                <div>
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-[var(--teacher-accent)]">
                    Últimos registros
                  </p>
                  <h2 className="mt-1 text-2xl font-black text-[var(--teacher-text)]">
                    Últimos estudiantes inscritos
                  </h2>
                  <p className="mt-1 text-sm font-medium text-[var(--teacher-muted)]">
                    Listado de los últimos 10 estudiantes inscritos y su avance.
                  </p>
                </div>
              </div>

              {dashboard.recentEnrollments.length > 0 ? (
                <div className="space-y-3">
                  {dashboard.recentEnrollments.map((enrollment) => (
                    <TeacherRecentEnrollmentCard
                      key={enrollment.id}
                      enrollment={enrollment}
                    />
                  ))}
                </div>
              ) : (
                <TeacherEmptyState
                  icon={<UsersRound size={26} />}
                  title="No hay estudiantes inscritos recientemente"
                  description="Cuando existan inscripciones en los cursos del docente, aparecerán en esta sección."
                />
              )}
            </section>

            <section className="rounded-[32px] bg-gradient-to-br from-[var(--teacher-primary)] to-[var(--teacher-secondary)] p-6 text-[var(--teacher-text-on-dark)] shadow-[0_18px_38px_rgba(22,55,68,0.18)]">
              <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--teacher-text-on-dark)] opacity-70">
                    Integración
                  </p>

                  <h3 className="mt-2 text-2xl font-black">
                    Dashboard conectado al resumen docente
                  </h3>

                  <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-[var(--teacher-text-on-dark)] opacity-80">
                    Esta vista consume el endpoint{" "}
                    <span className="font-black">
                      /api/teacher/dashboard/summary
                    </span>{" "}
                    y redirige a los módulos responsables cuando las URLs sean
                    suministradas por otros equipos.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => void refreshDashboard()}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[var(--teacher-card)] px-5 py-3 text-sm font-black text-[var(--teacher-primary)]"
                >
                  <RefreshCcw size={17} />
                  Actualizar datos
                </button>
              </div>
            </section>
          </>
        ) : null}

        {!loading && !error && !dashboard ? (
          <TeacherEmptyState
            icon={<BarChart3 size={26} />}
            title="Dashboard docente sin información"
            description="No se recibió información desde el endpoint /api/teacher/dashboard/summary."
          />
        ) : null}
      </div>

      {notification ? (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm rounded-2xl border border-[var(--teacher-border)] bg-[var(--teacher-card)] px-5 py-4 shadow-[0_18px_38px_rgba(22,55,68,0.16)]">
          <div className="flex items-start gap-4">
            <div className="mt-1.5 h-2.5 w-2.5 rounded-full bg-[var(--teacher-accent)]" />

            <p className="flex-1 text-sm font-bold leading-6 text-[var(--teacher-text)]">
              {notification}
            </p>

            <button
              type="button"
              onClick={clearNotification}
              className="rounded-full p-1 text-[var(--teacher-muted)] transition hover:bg-[var(--teacher-soft)] hover:text-[var(--teacher-text)]"
            >
              ×
            </button>
          </div>
        </div>
      ) : null}
    </main>
  );
}