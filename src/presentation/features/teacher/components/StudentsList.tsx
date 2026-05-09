import {
  Eye,
  Mail,
  Plus,
  Search,
  ShieldAlert,
  Trash2,
  UserCheck,
  UsersRound,
} from "lucide-react";
import { useMemo } from "react";
import { TeacherShell } from "./TeacherShell";
import { useTeacherStore } from "../services/useTeacherStore";

function getStatusClass(status: string) {
  if (status === "En riesgo") {
    return "border-[#ffd4da] bg-[#fff4f5] text-[#ef6b7a]";
  }

  if (status === "Inactivo") {
    return "border-[#d7e8eb] bg-[#f4fbfc] text-[#789098]";
  }

  return "border-[#c9eee6] bg-[#e8f7f4] text-[#2e9d8d]";
}

function getAverageClass(average: number) {
  if (average < 3) {
    return "text-[#ef6b7a]";
  }

  if (average < 3.6) {
    return "text-[#d9941d]";
  }

  return "text-[#2e9d8d]";
}

export default function StudentsList() {
  const { students, studentSearch, setStudentSearch } = useTeacherStore();

  const filteredStudents = useMemo(() => {
    const normalizedSearch = studentSearch.trim().toLowerCase();

    if (!normalizedSearch) {
      return students;
    }

    return students.filter((student) => {
      return (
        student.name.toLowerCase().includes(normalizedSearch) ||
        student.email.toLowerCase().includes(normalizedSearch) ||
        student.course.toLowerCase().includes(normalizedSearch)
      );
    });
  }, [students, studentSearch]);

  const activeStudents = students.filter(
    (student) => student.status === "Activo"
  ).length;

  const riskStudents = students.filter(
    (student) => student.status === "En riesgo"
  ).length;

  return (
    <TeacherShell
      activeView="students"
      title="Estudiantes"
      subtitle="Consulta el listado de estudiantes, estado académico y curso asignado."
    >
      <div className="space-y-7">
        <section className="rounded-[32px] bg-gradient-to-r from-[#153744] via-[#226b77] to-[#3dbca3] p-7 text-white shadow-[0_24px_60px_rgba(21,55,68,0.22)]">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-white/65">
                Seguimiento académico
              </p>

              <h1 className="mt-2 text-4xl font-black tracking-tight">
                Estudiantes
              </h1>

              <p className="mt-3 max-w-2xl text-sm font-medium leading-6 text-white/75">
                Visualiza estudiantes activos, identifica casos en riesgo y
                accede rápidamente a la información de contacto.
              </p>
            </div>

            <button className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-white px-5 text-sm font-black text-[#153744] shadow-[0_18px_35px_rgba(0,0,0,0.14)]">
              <Plus size={18} />
              Nuevo estudiante
            </button>
          </div>
        </section>

        <section className="grid gap-5 md:grid-cols-3">
          <article className="rounded-[28px] border border-[#d7e8eb] bg-white p-5 shadow-[0_18px_38px_rgba(22,55,68,0.08)]">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eef9fb] text-[#1f7380]">
              <UsersRound size={22} />
            </div>
            <p className="text-sm font-bold text-[#789098]">Total</p>
            <h3 className="mt-2 text-4xl font-black text-[#153744]">
              {students.length}
            </h3>
            <p className="mt-2 text-sm font-medium text-[#789098]">
              Estudiantes registrados
            </p>
          </article>

          <article className="rounded-[28px] border border-[#d7e8eb] bg-white p-5 shadow-[0_18px_38px_rgba(22,55,68,0.08)]">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e8f7f4] text-[#2e9d8d]">
              <UserCheck size={22} />
            </div>
            <p className="text-sm font-bold text-[#789098]">Activos</p>
            <h3 className="mt-2 text-4xl font-black text-[#153744]">
              {activeStudents}
            </h3>
            <p className="mt-2 text-sm font-medium text-[#789098]">
              Con actividad reciente
            </p>
          </article>

          <article className="rounded-[28px] border border-[#d7e8eb] bg-white p-5 shadow-[0_18px_38px_rgba(22,55,68,0.08)]">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff4f5] text-[#ef6b7a]">
              <ShieldAlert size={22} />
            </div>
            <p className="text-sm font-bold text-[#789098]">En riesgo</p>
            <h3 className="mt-2 text-4xl font-black text-[#153744]">
              {riskStudents}
            </h3>
            <p className="mt-2 text-sm font-medium text-[#789098]">
              Requieren acompañamiento
            </p>
          </article>
        </section>

        <section className="rounded-[32px] border border-[#d7e8eb] bg-white shadow-[0_18px_38px_rgba(22,55,68,0.08)]">
          <div className="flex flex-col justify-between gap-4 border-b border-[#d7e8eb] p-6 lg:flex-row lg:items-center">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#55a99b]">
                Directorio
              </p>
              <h2 className="mt-1 text-2xl font-black text-[#153744]">
                Listado de estudiantes
              </h2>
            </div>

            <div className="flex h-12 w-full items-center gap-3 rounded-2xl border border-[#d7e8eb] bg-[#fbfeff] px-4 lg:w-[360px]">
              <Search size={18} className="text-[#7d9198]" />
              <input
                value={studentSearch}
                onChange={(event) => setStudentSearch(event.target.value)}
                placeholder="Buscar por nombre, email o curso..."
                className="w-full bg-transparent text-sm font-bold text-[#153744] outline-none placeholder:text-[#9aacb2]"
              />
            </div>
          </div>

          <div className="divide-y divide-[#d7e8eb]">
            {filteredStudents.map((student) => (
              <article
                key={student.id}
                className="flex flex-col gap-5 p-5 transition hover:bg-[#fbfeff] xl:flex-row xl:items-center xl:justify-between"
              >
                <div className="flex min-w-0 items-center gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#153744] to-[#33a995] text-sm font-black text-white shadow-[0_12px_22px_rgba(21,55,68,0.16)]">
                    {student.avatar}
                  </div>

                  <div className="min-w-0">
                    <h3 className="truncate text-lg font-black text-[#153744]">
                      {student.name}
                    </h3>

                    <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm font-medium text-[#789098]">
                      <span className="inline-flex items-center gap-1.5">
                        <Mail size={15} />
                        {student.email}
                      </span>

                      <span>{student.course}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <span
                    className={[
                      "rounded-full border px-4 py-2 text-xs font-black",
                      getStatusClass(student.status),
                    ].join(" ")}
                  >
                    {student.status}
                  </span>

                  <div className="rounded-2xl bg-[#eef9fb] px-4 py-2">
                    <span className="text-xs font-bold text-[#789098]">
                      Promedio
                    </span>
                    <span
                      className={[
                        "ml-2 text-sm font-black",
                        getAverageClass(student.average),
                      ].join(" ")}
                    >
                      {student.average.toFixed(1)}
                    </span>
                  </div>

                  <button className="inline-flex items-center gap-2 rounded-2xl border border-[#d7e8eb] bg-white px-4 py-3 text-sm font-black text-[#60767d] transition hover:bg-[#eef9fb] hover:text-[#153744]">
                    <Eye size={17} />
                    Ver
                  </button>

                  <button className="rounded-2xl border border-[#ffd4da] bg-[#fff7f8] p-3 text-[#ef6b7a] transition hover:bg-[#ffeef1]">
                    <Trash2 size={18} />
                  </button>
                </div>
              </article>
            ))}

            {filteredStudents.length === 0 ? (
              <div className="px-6 py-14 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eef9fb] text-[#1f7380]">
                  <UsersRound size={25} />
                </div>

                <h3 className="mt-4 text-lg font-black text-[#153744]">
                  No hay estudiantes encontrados
                </h3>

                <p className="mt-2 text-sm font-medium text-[#789098]">
                  Intenta con otro nombre, correo o curso.
                </p>
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </TeacherShell>
  );
}