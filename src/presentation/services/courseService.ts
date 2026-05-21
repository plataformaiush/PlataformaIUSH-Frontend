import api from "../lib/axios";
import type { Course } from "../../domain/courses/types";

export interface CursoBackend {
  idCurso: string;
  idUsuario: string;
  titulo: string;
  descripcion: string;
  activo: boolean;
  modulosCount: number;
  creacion: string;
  actualizacion: string;
}

export interface CursosResponse {
  data: CursoBackend[];
}

function mapCursoToCourse(c: CursoBackend): Course {
  return {
    id: c.idCurso,
    title: c.titulo,
    description: c.descripcion,
    instructor: "",
    level: "beginner",
    status: c.activo ? "active" : "inactive",
    moduleIds: Array.from(
      { length: c.modulosCount },
      (_, i) => `${c.idCurso}-mod-${i}`,
    ),
    studentCount: 0,
  };
}

export async function fetchCursos(params?: {
  activo?: boolean;
  id_usuario?: string;
}): Promise<Course[]> {
  const response = await api.get<CursosResponse>("/cursos", { params });
  return response.data.data.map(mapCursoToCourse);
}

export async function fetchCursoById(cursoId: string): Promise<Course | null> {
  const response = await api.get<{
    data: CursoBackend & { modulos?: unknown[] };
  }>(`/cursos/${cursoId}`);
  return mapCursoToCourse(response.data.data);
}

export async function createCurso(
  course: Omit<Course, "id">,
  idUsuario: string,
): Promise<Course> {
  const response = await api.post<{ data: CursoBackend }>("/cursos", {
    titulo: course.title,
    descripcion: course.description,
    id_usuario: idUsuario,
  });

  const createdCourse = mapCursoToCourse(response.data.data);
  if (course.status === "active" && createdCourse.status !== "active") {
    return toggleCursoActivo(createdCourse.id, true);
  }

  return createdCourse;
}

export async function updateCurso(
  courseId: string,
  updates: Partial<Course>,
): Promise<Course> {
  const response = await api.put<{ data: CursoBackend }>(
    `/cursos/${courseId}`,
    {
      titulo: updates.title,
      descripcion: updates.description,
    },
  );
  return mapCursoToCourse(response.data.data);
}

export async function toggleCursoActivo(
  courseId: string,
  activo: boolean,
): Promise<Course> {
  const response = await api.patch<{ data: CursoBackend }>(
    `/cursos/${courseId}/activo`,
    { activo }
  );
  return mapCursoToCourse(response.data.data);
}

export async function deleteCurso(courseId: string): Promise<void> {
  await api.delete(`/cursos/${courseId}`);
}
