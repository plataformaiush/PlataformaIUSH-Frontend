import api from "../lib/axios";
import type { Course } from "../../domain/courses/types";
import { filesApi } from "../../domain/files/Filesapi";

export interface CursoBackend {
  idCurso: string;
  idUsuario: string;
  titulo: string;
  descripcion: string;
  activo: boolean;
  modulosCount: number;
  creacion: string;
  actualizacion: string;
  imagen_id?: string;
  idImagen?: string;
}

export interface CursosResponse {
  data: CursoBackend[];
  meta?: { total: number; page: number; limit: number; totalPages: number };
}

function mapCursoToCourse(c: CursoBackend): Course {
  const course: Course = {
    id: c.idCurso,
    title: c.titulo,
    description: c.descripcion,
    instructor: undefined,  // Backend no lo devuelve actualmente
    level: undefined,  // Backend no lo devuelve actualmente
    status: c.activo ? "active" : "inactive",
    moduleIds: Array.from(
      { length: c.modulosCount },
      (_, i) => `${c.idCurso}-mod-${i}`,
    ),
    studentCount: undefined,  // Backend no lo devuelve actualmente
    imageId: c.idImagen || c.imagen_id,
  };
  console.log('[CourseService] Mapped course:', { id: course.id, imageId: course.imageId, backendImageId: c.idImagen || c.imagen_id });
  return course;
}

export async function fetchCursos(params?: {
  activo?: boolean;
  id_usuario?: string;
  page?: number;
  limit?: number;
}): Promise<Course[]> {
  const response = await api.get<CursosResponse>("/cursos", {
    params: { limit: 100, ...params },
  });
  console.log('[CourseService] Raw backend response:', response.data.data);
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
  const payload = {
    titulo: course.title,
    descripcion: course.description,
    id_usuario: idUsuario,
    id_imagen: course.imageId,
  };
  console.log('[CourseService] Creating course with payload:', payload);
  
  const response = await api.post<{ data: CursoBackend }>("/cursos", payload);
  console.log('[CourseService] Backend response (all fields):', JSON.stringify(response.data.data, null, 2));

  const createdCourse = mapCursoToCourse(response.data.data);
  if (course.status === "active" && createdCourse.status !== "active") {
    return toggleCursoActivo(createdCourse.id, true);
  }

  return createdCourse;
}

/**
 * Obtiene la URL de la imagen de un curso usando el ID del documento
 * del equipo 2 (Gestión de Archivos)
 */
export function getCourseImageUrl(course: Course): string | undefined {
  if (!course.imageId) {
    console.log('[CourseService] No imageId for course:', course.id);
    return undefined;
  }
  const url = filesApi.descargarUrl(course.imageId);
  console.log('[CourseService] Image URL for course:', { courseId: course.id, imageId: course.imageId, url });
  return url;
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
      id_imagen: updates.imageId,
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

/**
 * Reordena cursos en el backend.
 * Endpoint esperado: PATCH /api/cursos/reorder con body { orden: [{ id_curso, orden }] }
 *
 * Si el backend aún no implementa este endpoint (404), la función lanza un error
 * con flag `notImplemented` para que la UI pueda hacer fallback a un reorden
 * "solo local" (visual) sin romper la experiencia.
 */
export async function reorderCursos(
  orden: { id_curso: string; orden: number }[],
): Promise<Course[]> {
  try {
    await api.patch(`/cursos/reorder`, { orden });
    return fetchCursos({ limit: 100 });
  } catch (error: any) {
    if (error?.response?.status === 404) {
      const e = new Error("Endpoint /cursos/reorder no implementado en backend");
      (e as any).notImplemented = true;
      throw e;
    }
    throw error;
  }
}
