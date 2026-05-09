import {
  AlertTriangle,
  CheckCircle2,
  GraduationCap,
  Save,
  TrendingUp,
} from "lucide-react";
import { useMemo } from "react";
import {
  gradeAssignments,
  teacherCourses,
} from "../../../../domain/teacher/teacherMock";
import { TeacherShell } from "./TeacherShell";
import { useTeacherStore } from "../services/useTeacherStore";

function getGradeInputClass(value: number | null) {
  if (value === null || value === undefined) {
    return "border-[#d7e8eb] bg-[#f4fbfc] text-[#789098]";
  }

  if (value < 3) {
    return "border-[#ffd4da] bg-[#fff4f5] text-[#ef6b7a]";
  }

  return "border-[#c9eee6] bg-[#f1fbf8] text-[#259c86]";
}

function getAverageBadgeClass(value: number) {
  if (value < 3) {
    return "bg-[#fff4f5] text-[#ef6b7a] border-[#ffd4da]";
  }

  if (value < 3.6) {
    return "bg-[#fff7e8] text-[#d9941d] border-[#ffe4b0]";
  }

  return "bg-[#e8f7f4] text-[#2e9d8d] border-[#c9eee6]";
}

export default function GradesTable() {
  const {
    grades,
    selectedCourseId,
    lastSavedAt,
    setSelectedCourseId,
    updateGrade,
    saveGrades,
    getGradeAverage,
  } = useTeacherStore();

  const visibleGrades = useMemo(
    () => grades.filter((row) => row.courseId === selectedCourseId),
    [grades, selectedCourseId]
  );

  const averages = visibleGrades.map((row) => getGradeAverage(row));

  const courseAverage =
    averages.length > 0
      ? Number(
          (
            averages.reduce((total, average) => total + average, 0) /
            averages.length
          ).toFixed(1)
        )
      : 0;

  const maxGrade = averages.length > 0 ? Math.max(...averages).toFixed(1) : "0.0";

  const riskStudents = averages.filter((average) => average < 3).length;

  const selectedCourse = teacherCourses.find(
    (course) => course.id === selectedCourseId
  );

  return (
    <TeacherShell
      activeView="grades"
      title="Calificaciones"
      subtitle="Registra, edita y guarda notas por curso y actividad."
    >
      <div className="space-y-7">
        <section className="rounded-[32px] bg-gradient-to-r from-[#153744] via-[#226b77] to-[#3dbca3] p-7 text-white shadow-[0_24px_60px_rgba(21,55,68,0.22)]">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-white/65">
                Evaluación académica
              </p>
              <h1 className="mt-2 text-4xl font-black tracking-tight">
                Calificaciones
              </h1>
              <p className="mt-3 max-w-2xl text-sm font-medium leading-6 text-white/75">
                Edita las notas directamente en la tabla y guarda los cambios
                del curso seleccionado.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <select
                value={selectedCourseId}
                onChange={(event) => setSelectedCourseId(event.target.value)}
                className="h-12 rounded-2xl border border-white/20 bg-white/15 px-4 text-sm font-black text-white outline-none backdrop-blur [&>option]:text-[#153744]"
              >
                {teacherCourses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.title}
                  </option>
                ))}
              </select>

              <button
                onClick={saveGrades}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-white px-5 text-sm font-black text-[#153744] shadow-[0_18px_35px_rgba(0,0,0,0.14)]"
              >
                <Save size={18} />
                Guardar
              </button>
            </div>
          </div>
        </section>

        <section className="grid gap-5 md:grid-cols-3">
          <article className="rounded-[28px] border border-[#d7e8eb] bg-white p-5 shadow-[0_18px_38px_rgba(22,55,68,0.08)]">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eef9fb] text-[#1f7380]">
              <TrendingUp size={22} />
            </div>
            <p className="text-sm font-bold text-[#789098]">
              Promedio del curso
            </p>
            <h3 className="mt-2 text-4xl font-black text-[#153744]">
              {courseAverage.toFixed(1)}
            </h3>
            <p className="mt-2 text-sm font-medium text-[#789098]">
              {selectedCourse?.title}
            </p>
          </article>

          <article className="rounded-[28px] border border-[#d7e8eb] bg-white p-5 shadow-[0_18px_38px_rgba(22,55,68,0.08)]">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e8f7f4] text-[#2e9d8d]">
              <CheckCircle2 size={22} />
            </div>
            <p className="text-sm font-bold text-[#789098]">Nota máxima</p>
            <h3 className="mt-2 text-4xl font-black text-[#153744]">
              {maxGrade}
            </h3>
            <p className="mt-2 text-sm font-medium text-[#789098]">
              Mejor desempeño
            </p>
          </article>

          <article className="rounded-[28px] border border-[#d7e8eb] bg-white p-5 shadow-[0_18px_38px_rgba(22,55,68,0.08)]">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff4f5] text-[#ef6b7a]">
              <AlertTriangle size={22} />
            </div>
            <p className="text-sm font-bold text-[#789098]">En riesgo</p>
            <h3 className="mt-2 text-4xl font-black text-[#153744]">
              {riskStudents}
            </h3>
            <p className="mt-2 text-sm font-medium text-[#789098]">
              Promedio inferior a 3.0
            </p>
          </article>
        </section>

        <section className="overflow-hidden rounded-[32px] border border-[#d7e8eb] bg-white shadow-[0_18px_38px_rgba(22,55,68,0.08)]">
          <div className="flex flex-col justify-between gap-4 border-b border-[#d7e8eb] p-6 md:flex-row md:items-center">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#55a99b]">
                Tabla editable
              </p>
              <h2 className="mt-1 text-2xl font-black text-[#153744]">
                Registro de notas
              </h2>
            </div>

            {lastSavedAt ? (
              <span className="rounded-full bg-[#e8f7f4] px-4 py-2 text-xs font-black text-[#2e9d8d]">
                Guardado a las {lastSavedAt}
              </span>
            ) : (
              <span className="rounded-full bg-[#eef9fb] px-4 py-2 text-xs font-black text-[#60767d]">
                Cambios sin guardar
              </span>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-[980px] w-full border-collapse">
              <thead>
                <tr className="bg-[#f4fbfc]">
                  <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-[0.14em] text-[#789098]">
                    Estudiante
                  </th>

                  {gradeAssignments.map((assignment) => (
                    <th
                      key={assignment.key}
                      className="px-4 py-4 text-center text-xs font-black uppercase tracking-[0.14em] text-[#789098]"
                    >
                      <span>{assignment.label}</span>
                      <span className="ml-1 text-[#33a995]">
                        {assignment.percentage}%
                      </span>
                    </th>
                  ))}

                  <th className="px-6 py-4 text-center text-xs font-black uppercase tracking-[0.14em] text-[#789098]">
                    Promedio
                  </th>
                </tr>
              </thead>

              <tbody>
                {visibleGrades.map((row) => {
                  const average = getGradeAverage(row);

                  return (
                    <tr
                      key={row.id}
                      className="border-t border-[#d7e8eb] transition hover:bg-[#fbfeff]"
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#153744] to-[#33a995] text-sm font-black text-white">
                            {row.student
                              .split(" ")
                              .slice(0, 2)
                              .map((word) => word[0])
                              .join("")}
                          </div>

                          <div>
                            <p className="font-black text-[#153744]">
                              {row.student}
                            </p>
                            <p className="mt-1 text-xs font-medium text-[#789098]">
                              {row.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      {gradeAssignments.map((assignment) => {
                        const value = row.assignments[assignment.key];

                        return (
                          <td key={assignment.key} className="px-4 py-5">
                            <input
                              type="number"
                              min="0"
                              max="5"
                              step="0.1"
                              value={value ?? ""}
                              onChange={(event) => {
                                const rawValue = event.target.value;

                                updateGrade(
                                  row.id,
                                  assignment.key,
                                  rawValue === ""
                                    ? null
                                    : Math.min(5, Math.max(0, Number(rawValue)))
                                );
                              }}
                              className={[
                                "mx-auto block h-11 w-20 rounded-2xl border text-center text-sm font-black outline-none transition focus:border-[#33a995] focus:ring-4 focus:ring-[#33a995]/15",
                                getGradeInputClass(value),
                              ].join(" ")}
                              placeholder="-"
                            />
                          </td>
                        );
                      })}

                      <td className="px-6 py-5 text-center">
                        <span
                          className={[
                            "inline-flex min-w-16 justify-center rounded-full border px-4 py-2 text-sm font-black",
                            getAverageBadgeClass(average),
                          ].join(" ")}
                        >
                          {average.toFixed(1)}
                        </span>
                      </td>
                    </tr>
                  );
                })}

                {visibleGrades.length === 0 ? (
                  <tr>
                    <td
                      colSpan={gradeAssignments.length + 2}
                      className="px-6 py-12 text-center"
                    >
                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eef9fb] text-[#1f7380]">
                        <GraduationCap size={25} />
                      </div>
                      <h3 className="mt-4 text-lg font-black text-[#153744]">
                        No hay calificaciones registradas
                      </h3>
                      <p className="mt-2 text-sm font-medium text-[#789098]">
                        Selecciona otro curso o agrega estudiantes al registro.
                      </p>
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </TeacherShell>
  );
}