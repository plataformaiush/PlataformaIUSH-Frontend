import api from "../lib/axios";
import type { Content } from "../../domain/contents/types";
import { ContentType, parseQuizData } from "../../domain/contents/types";

export interface ContenidoBackend {
  idContenido: string;
  idModulo: string;
  titulo: string;
  descripcion: string | null;
  tipo: "video" | "texto" | "archivo" | "imagen";
  urlOTexto: string;
  orden: number;
  activo: boolean;
  creacion: string;
  actualizacion: string;
}

export interface ContenidosResponse {
  data: ContenidoBackend[];
}

function mapTipoToContentType(tipo: ContenidoBackend["tipo"], urlOTexto?: string): ContentType {
  if (tipo === "texto" && urlOTexto) {
    const quiz = parseQuizData(urlOTexto)
    if (quiz?.questionType === 'quiz_tf') return ContentType.QUIZ_TF
    if (quiz?.questionType === 'quiz_mc') return ContentType.QUIZ_MC
  }
  const tipoMap: Record<ContenidoBackend["tipo"], ContentType> = {
    video: ContentType.VIDEO,
    texto: ContentType.TEXT,
    archivo: ContentType.DOCUMENT,
    imagen: ContentType.IMAGE,
  };
  return tipoMap[tipo] || ContentType.TEXT;
}

function mapContentTypeToTipo(
  contentType: ContentType,
): ContenidoBackend["tipo"] {
  const contentTypeMap: Record<ContentType, ContenidoBackend["tipo"]> = {
    [ContentType.VIDEO]:    "video",
    [ContentType.TEXT]:     "texto",
    [ContentType.DOCUMENT]: "archivo",
    [ContentType.IMAGE]:    "imagen",
    [ContentType.QUIZ_TF]:  "texto",
    [ContentType.QUIZ_MC]:  "texto",
  };
  return contentTypeMap[contentType] || "texto";
}

function mapContenidoToContent(c: ContenidoBackend): Content {
  return {
    id: c.idContenido,
    moduleId: c.idModulo,
    title: c.titulo,
    description: c.descripcion || "",
    type: mapTipoToContentType(c.tipo, c.urlOTexto),
    status: c.activo ? "active" : "draft",
    resourceUrl: c.urlOTexto,
    durationMinutes: undefined,
    order: c.orden,
  };
}

export async function fetchContenidos(
  moduloId: string,
  params?: {
    activo?: boolean;
    tipo?: "video" | "texto" | "archivo" | "imagen";
  },
): Promise<Content[]> {
  const response = await api.get<ContenidosResponse>(
    `/modulos/${moduloId}/contenidos`,
    { params },
  );
  return response.data.data.map(mapContenidoToContent);
}

export async function fetchContenidoById(
  moduloId: string,
  contenidoId: string,
): Promise<Content | null> {
  const response = await api.get<{ data: ContenidoBackend }>(
    `/modulos/${moduloId}/contenidos/${contenidoId}`,
  );
  return mapContenidoToContent(response.data.data);
}

export async function createContenido(
  moduloId: string,
  contenido: Omit<Content, "id" | "durationMinutes">,
): Promise<Content> {
  const response = await api.post<{ data: ContenidoBackend }>(
    `/modulos/${moduloId}/contenidos`,
    {
      titulo: contenido.title,
      descripcion: contenido.description,
      tipo: mapContentTypeToTipo(contenido.type),
      url_o_texto: contenido.resourceUrl,
      orden: contenido.order,
    },
  );
  return mapContenidoToContent(response.data.data);
}

export async function updateContenido(
  moduloId: string,
  contenidoId: string,
  updates: Partial<Content>,
): Promise<Content> {
  const response = await api.put<{ data: ContenidoBackend }>(
    `/modulos/${moduloId}/contenidos/${contenidoId}`,
    {
      titulo: updates.title,
      descripcion: updates.description,
      tipo: updates.type ? mapContentTypeToTipo(updates.type) : undefined,
      url_o_texto: updates.resourceUrl,
      orden: updates.order,
      activo:
        updates.status === "active"
          ? true
          : updates.status === "draft"
            ? false
            : undefined,
    },
  );
  return mapContenidoToContent(response.data.data);
}

export async function deleteContenido(
  moduloId: string,
  contenidoId: string,
): Promise<void> {
  await api.delete(`/modulos/${moduloId}/contenidos/${contenidoId}`);
}

export async function reorderContenidos(
  moduloId: string,
  orden: { id_contenido: string; orden: number }[],
): Promise<Content[]> {
  await api.patch(`/modulos/${moduloId}/contenidos/reorder`, { orden });
  return fetchContenidos(moduloId);
}
