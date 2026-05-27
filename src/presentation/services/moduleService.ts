import api from "../lib/axios";
import type { Module } from "../../domain/modules/types";

export interface ModuloBackend {
  idModulo: string;
  idCurso: string;
  titulo: string;
  descripcion: string | null;
  activo: boolean;
  orden: number;
  contenidosCount: number;
  creacion: string;
  actualizacion: string;
}

export interface ModulosResponse {
  data: ModuloBackend[];
}

function mapModuloToModule(m: ModuloBackend): Module {
  return {
    id: m.idModulo,
    courseId: m.idCurso,
    title: m.titulo,
    description: m.descripcion || "",
    order: m.orden,
    status: m.activo ? "active" : "inactive",
    contentIds: Array.from(
      { length: m.contenidosCount },
      (_, i) => `${m.idModulo}-cont-${i}`,
    ),
  };
}

export async function fetchModulos(
  cursoId: string,
  params?: {
    activo?: boolean;
  },
): Promise<Module[]> {
  const response = await api.get<ModulosResponse>(
    `/cursos/${cursoId}/modulos`,
    { params },
  );
  return response.data.data.map(mapModuloToModule);
}

export async function fetchModuloById(
  cursoId: string,
  moduloId: string,
): Promise<Module | null> {
  const response = await api.get<{
    data: ModuloBackend & { contenidos?: any[] };
  }>(`/cursos/${cursoId}/modulos/${moduloId}`);
  return mapModuloToModule(response.data.data);
}

export async function createModulo(
  cursoId: string,
  modulo: Omit<Module, "id" | "contentIds">,
): Promise<Module> {
  const response = await api.post<{ data: ModuloBackend }>(
    `/cursos/${cursoId}/modulos`,
    {
      titulo: modulo.title,
      descripcion: modulo.description,
      orden: modulo.order,
    },
  );
  return mapModuloToModule(response.data.data);
}

export async function updateModulo(
  cursoId: string,
  moduloId: string,
  updates: Partial<Module>,
): Promise<Module> {
  const response = await api.put<{ data: ModuloBackend }>(
    `/cursos/${cursoId}/modulos/${moduloId}`,
    {
      titulo: updates.title,
      descripcion: updates.description,
      orden: updates.order,
    },
  );
  return mapModuloToModule(response.data.data);
}

export async function toggleModuloActivo(
  cursoId: string,
  moduloId: string,
  activo: boolean,
): Promise<Module> {
  await api.patch(`/cursos/${cursoId}/modulos/${moduloId}/activo`, { activo });
  const module = await fetchModuloById(cursoId, moduloId);
  if (!module) {
    throw new Error("Módulo no encontrado después de actualizar estado");
  }
  return module;
}

export async function deleteModulo(
  cursoId: string,
  moduloId: string,
): Promise<void> {
  await api.delete(`/cursos/${cursoId}/modulos/${moduloId}`);
}

export async function reorderModulos(
  cursoId: string,
  orden: { id_modulo: string; orden: number }[],
): Promise<Module[]> {
  await api.patch(`/cursos/${cursoId}/modulos/reorder`, { orden });
  return fetchModulos(cursoId);
}
