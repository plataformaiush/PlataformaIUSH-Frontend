import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  Edit3,
  ExternalLink,
  Eye,
  FilePlus2,
  Link2,
  MoreVertical,
  Plus,
  PlusCircle,
  Trash2,
  UsersRound,
  Video,
} from "lucide-react";
import { useMemo, useState } from "react";
import { teacherCourses } from "../../../domain/teacher/teacherMock";
import { CourseMaterial } from "../../../domain/teacher/teacherTypes";
import { TeacherShell } from "./components/TeacherShell";

function getMaterialIcon(type: CourseMaterial["type"]) {
  if (type === "Video") return Video;
  if (type === "Enlace") return Link2;
  if (type === "Quiz") return PlusCircle;
  return BookOpen;
}

export default function CoursesView() {
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

  const selectedCourse = useMemo(
    () => teacherCourses.find((course) => course.id === selectedCourseId),
    [selectedCourseId]
  );

  return (
    <TeacherShell
      activeView="courses"
      title={selectedCourse ? "Detalle del curso" : "Mis cursos"}
      subtitle={
        selectedCourse
          ? "Gestiona módulos, materiales y recursos publicados."
          : "Administra los cursos asignados para el semestre actual."
      }
    >
      {!selectedCourse ? (
        <div className="space-y-7">
          <section className="flex flex-col justify-between gap-4 rounded-[32px] bg-gradient-to-r from-[#153744] via-[#226b77] to-[#3dbca3] p-7 text-white shadow-[0_24px_60px_rgba(21,55,68,0.22)] md:flex-row md:items-end">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-white/70">
                Gestión de contenidos
              </p>
              <h1 className="mt-2 text-4xl font-black tracking-tight">
                Mis cursos
              </h1>
              <p className="mt-3 max-w-2xl text-sm font-medium leading-6 text-white/75">
                Crea módulos, adjunta materiales, publica actividades y mantén
                actualizado el contenido para tus estudiantes.
              </p>
            </div>

            <button className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3.5 text-sm font-black text-[#153744] shadow-[0_18px_35px_rgba(0,0,0,0.14)]">
              <Plus size={18} />
              Nuevo curso
            </button>
          </section>

          <section className="grid gap-6 xl:grid-cols-2">
            {teacherCourses.map((course) => (
              <article
                key={course.id}
                className="overflow-hidden rounded-[32px] border border-[#d7e8eb] bg-white shadow-[0_18px_38px_rgba(22,55,68,0.08)]"
              >
                <div
                  className="p-6 text-white"
                  style={{
                    background: `linear-gradient(125deg, ${course.colorFrom}, ${course.colorTo})`,
                  }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.18em] text-white/65">
                        {course.code}
                      </p>
                      <h2 className="mt-2 text-2xl font-black">
                        {course.title}
                      </h2>
                      <p className="mt-2 max-w-xl text-sm font-medium leading-6 text-white/75">
                        {course.description}
                      </p>
                    </div>

                    <button className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/12 text-white backdrop-blur transition hover:bg-white/20">
                      <MoreVertical size={20} />
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  <div className="mb-5 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl bg-[#eef9fb] p-4">
                      <UsersRound size={18} className="mb-2 text-[#2d8791]" />
                      <p className="text-xs font-bold text-[#789098]">
                        Estudiantes
                      </p>
                      <p className="mt-1 text-xl font-black text-[#153744]">
                        {course.students}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-[#eef9fb] p-4">
                      <BookOpen size={18} className="mb-2 text-[#2d8791]" />
                      <p className="text-xs font-bold text-[#789098]">
                        Módulos
                      </p>
                      <p className="mt-1 text-xl font-black text-[#153744]">
                        {course.publishedModules}/{course.totalModules}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-[#eef9fb] p-4">
                      <CalendarDays size={18} className="mb-2 text-[#2d8791]" />
                      <p className="text-xs font-bold text-[#789098]">
                        Próxima clase
                      </p>
                      <p className="mt-1 text-sm font-black text-[#153744]">
                        {course.nextClass}
                      </p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="font-bold text-[#789098]">
                        Avance del curso
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
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      onClick={() => setSelectedCourseId(course.id)}
                      className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#153744] to-[#33a995] px-5 py-3 text-sm font-black text-white shadow-[0_14px_28px_rgba(21,55,68,0.18)]"
                    >
                      Abrir
                      <ExternalLink size={17} />
                    </button>

                    <button className="inline-flex items-center gap-2 rounded-2xl border border-[#d7e8eb] bg-white px-4 py-3 text-sm font-black text-[#60767d] transition hover:bg-[#eef9fb] hover:text-[#153744]">
                      <Edit3 size={17} />
                      Editar
                    </button>

                    <button className="inline-flex items-center gap-2 rounded-2xl border border-[#ffd4da] bg-[#fff7f8] px-4 py-3 text-sm font-black text-[#ef6b7a] transition hover:bg-[#ffeef1]">
                      <Trash2 size={17} />
                      Eliminar
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </section>
        </div>
      ) : (
        <div className="space-y-7">
          <button
            onClick={() => setSelectedCourseId(null)}
            className="inline-flex items-center gap-2 rounded-2xl border border-[#d7e8eb] bg-white px-4 py-3 text-sm font-black text-[#60767d] shadow-[0_12px_28px_rgba(22,55,68,0.06)] transition hover:bg-[#eef9fb] hover:text-[#153744]"
          >
            <ArrowLeft size={18} />
            Volver a cursos
          </button>

          <section
            className="overflow-hidden rounded-[32px] p-7 text-white shadow-[0_24px_60px_rgba(21,55,68,0.22)] md:p-9"
            style={{
              background: `linear-gradient(125deg, ${selectedCourse.colorFrom}, ${selectedCourse.colorTo})`,
            }}
          >
            <p className="text-xs font-black uppercase tracking-[0.18em] text-white/65">
              {selectedCourse.code} · {selectedCourse.period}
            </p>

            <div className="mt-3 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
              <div>
                <h1 className="text-4xl font-black tracking-tight">
                  {selectedCourse.title}
                </h1>
                <p className="mt-3 max-w-3xl text-sm font-medium leading-6 text-white/75">
                  {selectedCourse.description}
                </p>
              </div>

              <button className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3.5 text-sm font-black text-[#153744] shadow-[0_18px_35px_rgba(0,0,0,0.14)]">
                <Plus size={18} />
                Nuevo módulo
              </button>
            </div>
          </section>

          <section className="grid gap-6">
            {selectedCourse.modules.map((module, index) => (
              <article
                key={module.id}
                className="rounded-[32px] border border-[#d7e8eb] bg-white p-6 shadow-[0_18px_38px_rgba(22,55,68,0.08)]"
              >
                <div className="mb-5 flex flex-col justify-between gap-4 md:flex-row md:items-start">
                  <div className="flex gap-4">
                    <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl bg-[#eef9fb] text-[#1f7380]">
                      <BookOpen size={24} />
                    </div>

                    <div>
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-[#e8f7f4] px-3 py-1 text-xs font-black text-[#2e9d8d]">
                          Módulo {index + 1}
                        </span>

                        <span className="rounded-full bg-[#eef9fb] px-3 py-1 text-xs font-black text-[#60767d]">
                          {module.published ? "Publicado" : "Borrador"}
                        </span>
                      </div>

                      <h2 className="text-2xl font-black text-[#153744]">
                        {module.title}
                      </h2>

                      <p className="mt-2 max-w-3xl text-sm font-medium leading-6 text-[#789098]">
                        {module.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button className="rounded-2xl border border-[#d7e8eb] bg-white p-3 text-[#60767d] transition hover:bg-[#eef9fb] hover:text-[#153744]">
                      <Eye size={18} />
                    </button>
                    <button className="rounded-2xl border border-[#d7e8eb] bg-white p-3 text-[#60767d] transition hover:bg-[#eef9fb] hover:text-[#153744]">
                      <Edit3 size={18} />
                    </button>
                    <button className="rounded-2xl border border-[#ffd4da] bg-[#fff7f8] p-3 text-[#ef6b7a] transition hover:bg-[#ffeef1]">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  {module.materials.map((material) => {
                    const MaterialIcon = getMaterialIcon(material.type);

                    return (
                      <div
                        key={material.id}
                        className="flex flex-col justify-between gap-4 rounded-[22px] border border-[#d7e8eb] bg-[#fbfeff] p-4 md:flex-row md:items-center"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#eef9fb] text-[#1f7380]">
                            <MaterialIcon size={20} />
                          </div>

                          <div>
                            <h3 className="font-black text-[#153744]">
                              {material.title}
                            </h3>
                            <p className="mt-1 text-xs font-bold text-[#789098]">
                              {material.type} · {material.duration}
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button className="rounded-xl bg-[#eef9fb] px-3 py-2 text-xs font-black text-[#60767d] hover:text-[#153744]">
                            Ver
                          </button>
                          <button className="rounded-xl bg-[#eef9fb] px-3 py-2 text-xs font-black text-[#60767d] hover:text-[#153744]">
                            Editar
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  <button className="inline-flex items-center gap-2 rounded-2xl bg-[#153744] px-4 py-3 text-sm font-black text-white">
                    <FilePlus2 size={17} />
                    Añadir material
                  </button>

                  <button className="inline-flex items-center gap-2 rounded-2xl border border-[#d7e8eb] bg-white px-4 py-3 text-sm font-black text-[#60767d]">
                    <Link2 size={17} />
                    Añadir enlace
                  </button>

                  <button className="inline-flex items-center gap-2 rounded-2xl border border-[#d7e8eb] bg-white px-4 py-3 text-sm font-black text-[#60767d]">
                    <PlusCircle size={17} />
                    Crear cuestionario
                  </button>
                </div>
              </article>
            ))}
          </section>
        </div>
      )}
    </TeacherShell>
  );
}