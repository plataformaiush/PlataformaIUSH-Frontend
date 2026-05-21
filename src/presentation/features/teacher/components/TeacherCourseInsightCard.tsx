import { ArrowRight } from "lucide-react";
import { TeacherCourseInsight } from "../../../../domain/teacher/teacherTypes";

interface TeacherCourseInsightCardProps {
  course: TeacherCourseInsight;
  variant?: "creation" | "enrolled" | "low" | "completed";
}

function getProgressColor(value: number) {
  if (value < 35) return "from-[var(--teacher-danger)] to-red-300";
  if (value < 70) return "from-[var(--teacher-warning)] to-yellow-200";
  return "from-[var(--teacher-primary)] to-[var(--teacher-accent)]";
}

export function TeacherCourseInsightCard({
  course,
  variant = "enrolled",
}: TeacherCourseInsightCardProps) {
  const progress = Math.min(100, Math.max(0, course.progressPercentage ?? 0));

  const mainValue =
    variant === "completed"
      ? course.completedStudents
      : variant === "creation"
        ? course.modulesCount
        : course.enrolledStudents;

  const mainLabel =
    variant === "completed"
      ? "Completados"
      : variant === "creation"
        ? "Módulos"
        : "Inscritos";

  return (
    <article className="min-w-0 overflow-hidden rounded-[26px] border border-[var(--teacher-border)] bg-[var(--teacher-card-soft)] p-4 transition hover:-translate-y-0.5 hover:shadow-[0_18px_38px_rgba(22,55,68,0.08)] sm:p-5">
      <div className="mb-4 flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h3 className="max-w-full truncate text-base font-black text-[var(--teacher-text)] sm:text-lg">
            {course.title || "Curso sin nombre"}
          </h3>

          <p className="mt-1 text-xs font-bold text-[var(--teacher-muted)]">
            {course.code || "Sin código"}
          </p>
        </div>

        <span className="w-fit shrink-0 rounded-full bg-[var(--teacher-success-soft)] px-3 py-1 text-xs font-black text-[var(--teacher-success)]">
          {course.status || "Pendiente"}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-2xl bg-[var(--teacher-soft)] p-3">
          <p className="text-xs font-bold text-[var(--teacher-muted)]">
            {mainLabel}
          </p>
          <p className="mt-1 text-xl font-black text-[var(--teacher-text)]">
            {mainValue}
          </p>
        </div>

        <div className="rounded-2xl bg-[var(--teacher-soft)] p-3">
          <p className="text-xs font-bold text-[var(--teacher-muted)]">
            Módulos
          </p>
          <p className="mt-1 text-xl font-black text-[var(--teacher-text)]">
            {course.modulesCount}
          </p>
        </div>

        <div className="rounded-2xl bg-[var(--teacher-soft)] p-3">
          <p className="text-xs font-bold text-[var(--teacher-muted)]">
            Contenidos
          </p>
          <p className="mt-1 text-xl font-black text-[var(--teacher-text)]">
            {course.contentsCount}
          </p>
        </div>
      </div>

      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-bold text-[var(--teacher-muted)]">Avance</span>
          <span className="font-black text-[var(--teacher-text)]">
            {progress}%
          </span>
        </div>

        <div className="h-2.5 overflow-hidden rounded-full bg-[var(--teacher-track)]">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${getProgressColor(
              progress
            )}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {course.detailUrl ? (
        <a
          href={course.detailUrl}
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-[var(--teacher-border)] bg-[var(--teacher-card)] px-4 py-3 text-sm font-black text-[var(--teacher-muted)] transition hover:bg-[var(--teacher-soft)] hover:text-[var(--teacher-text)] sm:w-auto"
        >
          Ver detalle
          <ArrowRight size={16} />
        </a>
      ) : null}
    </article>
  );
}