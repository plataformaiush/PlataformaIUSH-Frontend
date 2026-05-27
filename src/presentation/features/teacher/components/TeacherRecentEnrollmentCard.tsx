import { ArrowRight } from "lucide-react";
import { RecentEnrolledStudent } from "../../../../domain/teacher/teacherTypes";

interface TeacherRecentEnrollmentCardProps {
  enrollment: RecentEnrolledStudent;
}

function formatDate(value: string) {
  if (!value) return "Fecha no disponible";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Fecha no disponible";
  }

  return new Intl.DateTimeFormat("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function getProgressColor(value: number) {
  if (value < 35) return "from-[var(--teacher-danger)] to-red-300";
  if (value < 70) return "from-[var(--teacher-warning)] to-yellow-200";
  return "from-[var(--teacher-primary)] to-[var(--teacher-accent)]";
}

export function TeacherRecentEnrollmentCard({
  enrollment,
}: TeacherRecentEnrollmentCardProps) {
  const progress = Math.min(
    100,
    Math.max(0, enrollment.progressPercentage ?? 0)
  );

  return (
    <article className="flex min-w-0 max-w-full flex-col gap-4 overflow-hidden rounded-[24px] border border-[var(--teacher-border)] bg-[var(--teacher-card-soft)] p-4 transition hover:bg-[var(--teacher-card)] hover:shadow-[0_14px_30px_rgba(22,55,68,0.07)] md:flex-row md:items-center md:justify-between">
      <div className="flex min-w-0 items-center gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--teacher-primary)] to-[var(--teacher-accent)] text-sm font-black text-white">
          {enrollment.avatar ||
            enrollment.studentName.slice(0, 2).toUpperCase()}
        </div>

        <div className="min-w-0">
          <h3 className="max-w-full truncate text-base font-black text-[var(--teacher-text)]">
            {enrollment.studentName || "Estudiante sin nombre"}
          </h3>

          <p className="mt-1 max-w-full truncate text-xs font-medium text-[var(--teacher-muted)]">
            {enrollment.email || "Correo no disponible"}
          </p>

          <p className="mt-1 max-w-full truncate text-xs font-bold text-[var(--teacher-muted)]">
            {enrollment.courseTitle || "Curso no disponible"} ·{" "}
            {formatDate(enrollment.enrolledAt)}
          </p>
        </div>
      </div>

      <div className="w-full md:w-[220px]">
        <div className="mb-2 flex items-center justify-between text-xs">
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

      {enrollment.detailUrl ? (
        <a
          href={enrollment.detailUrl}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl border border-[var(--teacher-border)] bg-white px-4 py-3 text-sm font-black text-[var(--teacher-muted)] transition hover:bg-[var(--teacher-soft)] hover:text-[var(--teacher-text)]"
        >
          Ver
          <ArrowRight size={16} />
        </a>
      ) : null}
    </article>
  );
}