import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ClipboardList,
  FilePlus2,
  GraduationCap,
  Layers3,
  Sparkles,
  UsersRound,
} from "lucide-react";
import { teacherCourses, teacherStats } from "../../../domain/teacher/teacherMock";
import { TeacherShell } from "./components/TeacherShell";

const statIcons = [BookOpen, UsersRound, Layers3, AlertTriangle];

export default function TeacherDashboard() {
  return (
    <TeacherShell
      activeView="dashboard"
      title="Dashboard docente"
      subtitle="Resumen académico, cursos asignados y seguimiento general."
    >
      <div className="space-y-7">
        <section className="overflow-hidden rounded-[32px] bg-gradient-to-br from-[#153744] via-[#1e6571] to-[#3fc0a5] p-7 text-white shadow-[0_24px_60px_rgba(21,55,68,0.24)] md:p-9">
          <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
            <div className="max-w-2xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-white/85 backdrop-blur">
                <Sparkles size={16} />
                Gestión académica
              </div>

              <h1 className="text-4xl font-black tracking-tight md:text-5xl">
                Bienvenida, docente
              </h1>

              <p className="mt-4 max-w-xl text-base font-medium leading-7 text-white/78">
                Administra tus cursos, publica módulos, registra calificaciones
                y acompaña el progreso de tus estudiantes desde una vista
                centralizada.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <a
                href="/teacher/courses"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3.5 text-sm font-black text-[#153744] shadow-[0_18px_35px_rgba(0,0,0,0.14)] transition hover:-translate-y-0.5"
              >
                <FilePlus2 size={18} />
                Crear contenido
              </a>

              <a
                href="/teacher/courses"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-5 py-3.5 text-sm font-black text-white backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/15"
              >
                Ver mis cursos
                <ArrowRight size={18} />
              </a>
            </div>
          </div>
        </section>

        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {teacherStats.map((stat, index) => {
            const Icon = statIcons[index];

            return (
              <article
                key={stat.id}
                className="rounded-[28px] border border-[#d7e8eb] bg-white p-5 shadow-[0_18px_38px_rgba(22,55,68,0.08)]"
              >
                <div className="mb-5 flex items-start justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eef9fb] text-[#1f7380]">
                    <Icon size={22} strokeWidth={2.3} />
                  </div>

                  <span className="rounded-full bg-[#e8f7f4] px-3 py-1 text-xs font-black text-[#2e9d8d]">
                    {stat.trend}
                  </span>
                </div>

                <p className="text-sm font-bold text-[#789098]">
                  {stat.label}
                </p>

                <h3 className="mt-2 text-4xl font-black tracking-tight text-[#153744]">
                  {stat.value}
                </h3>

                <p className="mt-2 text-sm font-medium text-[#789098]">
                  {stat.helper}
                </p>
              </article>
            );
          })}
        </section>

        <section className="grid gap-7 xl:grid-cols-[1.5fr_0.9fr]">
          <div className="rounded-[32px] border border-[#d7e8eb] bg-white p-6 shadow-[0_18px_38px_rgba(22,55,68,0.08)]">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-[#55a99b]">
                  Cursos
                </p>
                <h3 className="mt-1 text-2xl font-black text-[#153744]">
                  Mis cursos activos
                </h3>
              </div>

              <a
                href="/teacher/courses"
                className="inline-flex items-center gap-2 rounded-2xl bg-[#153744] px-4 py-3 text-sm font-black text-white shadow-[0_14px_28px_rgba(21,55,68,0.18)]"
              >
                Ver todos
                <ArrowRight size={17} />
              </a>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {teacherCourses.slice(0, 4).map((course) => (
                <article
                  key={course.id}
                  className="overflow-hidden rounded-[26px] border border-[#d7e8eb] bg-[#fbfeff]"
                >
                  <div
                    className="h-3"
                    style={{
                      background: `linear-gradient(90deg, ${course.colorFrom}, ${course.colorTo})`,
                    }}
                  />

                  <div className="p-5">
                    <div className="mb-4 flex items-start justify-between gap-3">
                      <div>
                        <h4 className="text-lg font-black text-[#153744]">
                          {course.title}
                        </h4>
                        <p className="mt-1 text-xs font-bold text-[#7d9198]">
                          {course.code} · {course.period}
                        </p>
                      </div>

                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#eef9fb] text-[#1f7380]">
                        <GraduationCap size={20} />
                      </div>
                    </div>

                    <div className="mb-4 flex items-center justify-between text-sm">
                      <span className="font-bold text-[#789098]">
                        Progreso
                      </span>
                      <span className="font-black text-[#153744]">
                        {course.progress}%
                      </span>
                    </div>

                    <div className="h-2.5 overflow-hidden rounded-full bg-[#e4f0f2]">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#153744] to-[#33a995]"
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-3">
                      <div className="rounded-2xl bg-[#eef9fb] p-3">
                        <p className="text-xs font-bold text-[#789098]">
                          Estudiantes
                        </p>
                        <p className="mt-1 text-lg font-black text-[#153744]">
                          {course.students}
                        </p>
                      </div>

                      <div className="rounded-2xl bg-[#eef9fb] p-3">
                        <p className="text-xs font-bold text-[#789098]">
                          Módulos
                        </p>
                        <p className="mt-1 text-lg font-black text-[#153744]">
                          {course.publishedModules}/{course.totalModules}
                        </p>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <aside className="space-y-5">
            <div className="rounded-[32px] border border-[#d7e8eb] bg-white p-6 shadow-[0_18px_38px_rgba(22,55,68,0.08)]">
              <div className="mb-5 flex h-13 w-13 items-center justify-center rounded-2xl bg-[#fff5df] text-[#e6a120]">
                <ClipboardList size={24} />
              </div>

              <h3 className="text-2xl font-black text-[#153744]">
                Pendientes de hoy
              </h3>

              <div className="mt-5 space-y-3">
                {[
                  "Revisar 8 entregas del proyecto frontend.",
                  "Publicar material del módulo Tailwind CSS.",
                  "Actualizar notas pendientes de Bases de Datos.",
                ].map((task) => (
                  <div
                    key={task}
                    className="flex items-start gap-3 rounded-2xl bg-[#f4fbfc] p-4"
                  >
                    <CheckCircle2
                      size={18}
                      className="mt-0.5 shrink-0 text-[#33a995]"
                    />
                    <p className="text-sm font-bold leading-6 text-[#5f747b]">
                      {task}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[32px] bg-gradient-to-br from-[#153744] to-[#2f8792] p-6 text-white shadow-[0_18px_38px_rgba(22,55,68,0.18)]">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-white/65">
                Tip docente
              </p>

              <h3 className="mt-3 text-2xl font-black">
                Prioriza estudiantes en riesgo
              </h3>

              <p className="mt-3 text-sm font-medium leading-6 text-white/75">
                Revisa el módulo de calificaciones para detectar promedios bajos
                y enviar acompañamiento oportuno.
              </p>

              <a
                href="/teacher/grades"
                className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-black text-[#153744]"
              >
                Ir a calificaciones
                <ArrowRight size={17} />
              </a>
            </div>
          </aside>
        </section>
      </div>
    </TeacherShell>
  );
}